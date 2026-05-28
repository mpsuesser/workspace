import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import * as fs from "node:fs/promises";
import { homedir } from "node:os";
import { isAbsolute, join, resolve } from "node:path";

const CONFIG_FILE = "pi.json";
const REMOTE_TIMEOUT_MS = 5_000;

type InstructionSource = {
	kind: "file" | "url";
	source: string;
	content: string;
};

type InstructionState = {
	cwd: string;
	configPath: string;
	sources: InstructionSource[];
	error?: string;
};

function expandHome(input: string): string {
	if (input === "~") return homedir();
	if (input.startsWith("~/")) return join(homedir(), input.slice(2));
	return input;
}

function isRemoteInstruction(input: string): boolean {
	return input.startsWith("https://") || input.startsWith("http://");
}

function parseInstructions(raw: string): string[] {
	const parsed = JSON.parse(raw) as { instructions?: unknown };
	const instructions = parsed.instructions;

	if (instructions === undefined) return [];
	if (typeof instructions === "string") return [instructions];
	if (!Array.isArray(instructions)) {
		throw new Error("pi.json `instructions` must be an array of strings");
	}

	const invalid = instructions.find((item) => typeof item !== "string");
	if (invalid !== undefined) {
		throw new Error("pi.json `instructions` must contain only strings");
	}

	return (instructions as string[])
		.map((item) => item.trim())
		.filter((item) => item.length > 0);
}

async function expandInstructionPattern(pattern: string, cwd: string): Promise<string[]> {
	const expanded = expandHome(pattern);
	const packageGlob = await loadGlobPackage();
	const matches = packageGlob
		? await packageGlob(expanded, {
			cwd: isAbsolute(expanded) ? undefined : cwd,
			absolute: true,
			dot: true,
			follow: false,
			nodir: true,
		})
		: await scanWithNodeGlob(expanded, cwd);

	return matches.map((match) => resolve(match)).sort((a, b) => a.localeCompare(b));
}

let globPackage: ((pattern: string, options: {
	cwd?: string;
	absolute: true;
	dot: true;
	follow: false;
	nodir: true;
}) => Promise<string[]>) | undefined;
let globPackageLoaded = false;

async function loadGlobPackage(): Promise<typeof globPackage> {
	if (globPackageLoaded) return globPackage;
	globPackageLoaded = true;
	try {
		const mod = await import("glob");
		globPackage = mod.glob;
	} catch {
		globPackage = undefined;
	}
	return globPackage;
}

async function scanWithNodeGlob(pattern: string, cwd: string): Promise<string[]> {
	const nodeGlob = (fs as typeof fs & {
		glob?: (pattern: string, options?: { cwd?: string }) => AsyncIterable<string>;
	}).glob;

	if (!nodeGlob) return [];

	const matches: string[] = [];
	const absolutePattern = isAbsolute(pattern);
	for await (const match of nodeGlob(pattern, { cwd: absolutePattern ? undefined : cwd })) {
		const filePath = isAbsolute(match) ? match : resolve(cwd, match);
		const stat = await fs.lstat(filePath).catch(() => undefined);
		if (stat?.isFile()) matches.push(filePath);
	}
	return matches;
}

async function fetchRemoteInstruction(url: string): Promise<string> {
	const response = await fetch(url, { signal: AbortSignal.timeout(REMOTE_TIMEOUT_MS) });
	if (!response.ok) return "";
	return response.text();
}

async function loadPiInstructions(cwd: string): Promise<InstructionState> {
	const configPath = join(cwd, CONFIG_FILE);
	let rawConfig: string;

	try {
		rawConfig = await fs.readFile(configPath, "utf8");
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === "ENOENT") {
			return { cwd, configPath, sources: [] };
		}
		const message = error instanceof Error ? error.message : String(error);
		return { cwd, configPath, sources: [], error: `Failed to read ${CONFIG_FILE}: ${message}` };
	}

	let instructions: string[];
	try {
		instructions = parseInstructions(rawConfig);
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		return { cwd, configPath, sources: [], error: `Failed to parse ${CONFIG_FILE}: ${message}` };
	}

	const sources: InstructionSource[] = [];
	const seenFiles = new Set<string>();
	const seenUrls = new Set<string>();

	for (const instruction of instructions) {
		if (isRemoteInstruction(instruction)) {
			if (seenUrls.has(instruction)) continue;
			seenUrls.add(instruction);

			try {
				const content = await fetchRemoteInstruction(instruction);
				if (content) sources.push({ kind: "url", source: instruction, content });
			} catch {
				// Match OpenCode's behavior: unreachable remote instructions are skipped.
			}
			continue;
		}

		let matches: string[];
		try {
			matches = await expandInstructionPattern(instruction, cwd);
		} catch {
			// Invalid glob patterns are ignored, matching OpenCode's skip behavior.
			continue;
		}

		for (const filePath of matches) {
			if (seenFiles.has(filePath)) continue;
			seenFiles.add(filePath);

			try {
				const content = await fs.readFile(filePath, "utf8");
				if (content) sources.push({ kind: "file", source: filePath, content });
			} catch {
				// Skip files that disappear or cannot be read.
			}
		}
	}

	return { cwd, configPath, sources };
}

function renderInstructions(sources: InstructionSource[]): string {
	return sources
		.map((source) => `Instructions from: ${source.source}\n${source.content}`)
		.join("\n\n");
}

export default function piInstructionsExtension(pi: ExtensionAPI): void {
	let state: InstructionState = {
		cwd: process.cwd(),
		configPath: join(process.cwd(), CONFIG_FILE),
		sources: [],
	};

	pi.on("session_start", async (_event, ctx) => {
		state = await loadPiInstructions(ctx.cwd);

		if (!ctx.hasUI) return;
		if (state.error) {
			ctx.ui.notify(state.error, "warning");
		} else if (state.sources.length > 0) {
			ctx.ui.notify(
				`Loaded ${state.sources.length} instruction source(s) from ${CONFIG_FILE}`,
				"info",
			);
		}
	});

	pi.on("before_agent_start", async (event) => {
		if (state.sources.length === 0) return;

		return {
			systemPrompt:
				event.systemPrompt
				+ `\n\n## pi.json Instructions\n\n${renderInstructions(state.sources)}\n`,
		};
	});
}

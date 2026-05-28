/**
 * Forces skill root reads to be complete reads.
 *
 * Config:
 * - PI_FULL_SKILL_READ_MAX_BYTES: maximum skill file size to return in full.
 *   Defaults to 999999 bytes.
 */
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { isReadToolResult, isToolCallEventType } from "@mariozechner/pi-coding-agent";
import { realpath, readFile, stat } from "node:fs/promises";
import { basename, isAbsolute, normalize, resolve } from "node:path";
import { homedir } from "node:os";

const EXTENSION_ID = "full-skill-read";
const DEFAULT_MAX_SKILL_READ_BYTES = 999_999;
const MAX_BYTES_ENV = "PI_FULL_SKILL_READ_MAX_BYTES";

type MaybeSkill = {
	filePath?: unknown;
};

type MaybeBeforeAgentStartEvent = {
	systemPrompt?: unknown;
	systemPromptOptions?: {
		skills?: MaybeSkill[];
	};
};

type ReadArgs = {
	path?: unknown;
	offset?: unknown;
	limit?: unknown;
};

type RequestedRange = {
	offset?: number;
	limit?: number;
	label: string;
};

type SkillRead = {
	absolutePath: string;
	canonicalPath: string;
};

type SkillReadPlan = {
	skillRead: SkillRead;
	requestedRange?: RequestedRange;
};

function parseMaxBytes(): number {
	const raw = process.env[MAX_BYTES_ENV];
	if (!raw) return DEFAULT_MAX_SKILL_READ_BYTES;

	const parsed = Number(raw.replaceAll("_", ""));
	if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_MAX_SKILL_READ_BYTES;
	return Math.floor(parsed);
}

function expandHome(input: string): string {
	if (input === "~") return homedir();
	if (input.startsWith("~/")) return resolve(homedir(), input.slice(2));
	return input;
}

function stripModelFileReferencePrefix(input: string): string {
	return input.startsWith("@") ? input.slice(1) : input;
}

function resolveToolPath(input: string, cwd: string): string {
	const stripped = stripModelFileReferencePrefix(input.trim());
	const expanded = expandHome(stripped);
	return isAbsolute(expanded) ? resolve(expanded) : resolve(cwd, expanded);
}

function pathKey(filePath: string): string {
	const key = normalize(resolve(filePath));
	return process.platform === "win32" ? key.toLowerCase() : key;
}

async function canonicalize(filePath: string): Promise<string> {
	try {
		return await realpath(filePath);
	} catch {
		return resolve(filePath);
	}
}

function isSkillRootFile(filePath: string): boolean {
	return basename(filePath).toLowerCase() === "skill.md";
}

function decodeXmlText(input: string): string {
	return input
		.replaceAll("&lt;", "<")
		.replaceAll("&gt;", ">")
		.replaceAll("&quot;", '"')
		.replaceAll("&apos;", "'")
		.replaceAll("&amp;", "&");
}

function extractSkillLocationsFromPrompt(prompt: string): string[] {
	const locations: string[] = [];
	const regex = /<location>([\s\S]*?)<\/location>/g;

	for (const match of prompt.matchAll(regex)) {
		const location = match[1]?.trim();
		if (location) locations.push(decodeXmlText(location));
	}

	return locations;
}

function getReadPath(input: { path?: unknown }): string | undefined {
	const path = input.path;
	return typeof path === "string" && path.trim() ? path : undefined;
}

function toLineNumber(value: unknown): number | undefined {
	return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function getRequestedRange(input: ReadArgs): RequestedRange | undefined {
	const offset = toLineNumber(input.offset);
	const limit = toLineNumber(input.limit);
	if (offset === undefined && limit === undefined) return undefined;

	const startLine = offset ?? 1;
	const endLine = limit !== undefined ? startLine + limit - 1 : undefined;
	return {
		offset,
		limit,
		label: `${startLine}${endLine !== undefined ? `-${endLine}` : ""}`,
	};
}

function formatSkillName(filePath: string): string {
	return basename(resolve(filePath, "..")).trim() || basename(filePath);
}

function mergeDetails(details: unknown, fullSkillRead: Record<string, unknown>): Record<string, unknown> {
	return {
		...(details && typeof details === "object" && !Array.isArray(details) ? details : {}),
		fullSkillRead,
	};
}

export default function fullSkillReadExtension(pi: ExtensionAPI): void {
	const skillPathKeys = new Set<string>();
	const canonicalSkillPathKeys = new Set<string>();
	const readCalls = new Map<string, SkillReadPlan>();
	const notifiedToolCalls = new Set<string>();
	let knownSkillPathsLoaded = false;

	async function rememberSkillPath(filePath: string, cwd: string): Promise<void> {
		const absolutePath = resolveToolPath(filePath, cwd);
		skillPathKeys.add(pathKey(absolutePath));
		canonicalSkillPathKeys.add(pathKey(await canonicalize(absolutePath)));
	}

	async function rememberSkillPaths(filePaths: Iterable<string>, cwd: string): Promise<void> {
		for (const filePath of filePaths) {
			await rememberSkillPath(filePath, cwd);
		}
	}

	async function refreshKnownSkillPaths(ctx: { cwd: string; getSystemPrompt?: () => string }): Promise<void> {
		const commandSkillPaths = pi
			.getCommands()
			.filter((command) => command.source === "skill")
			.map((command) => command.sourceInfo.path);

		await rememberSkillPaths(commandSkillPaths, ctx.cwd);

		const systemPrompt = ctx.getSystemPrompt?.();
		if (systemPrompt) {
			await rememberSkillPaths(extractSkillLocationsFromPrompt(systemPrompt), ctx.cwd);
		}

		knownSkillPathsLoaded = true;
	}

	async function matchSkillRead(rawPath: string, cwd: string): Promise<SkillRead | undefined> {
		const absolutePath = resolveToolPath(rawPath, cwd);
		const canonicalPath = await canonicalize(absolutePath);

		if (
			skillPathKeys.has(pathKey(absolutePath)) ||
			canonicalSkillPathKeys.has(pathKey(canonicalPath)) ||
			isSkillRootFile(absolutePath)
		) {
			return { absolutePath, canonicalPath };
		}

		return undefined;
	}

	async function expandSkillReadArgs(toolCallId: string, input: ReadArgs, cwd: string): Promise<SkillReadPlan | undefined> {
		const rawPath = getReadPath(input);
		if (!rawPath) return undefined;

		const skillRead = await matchSkillRead(rawPath, cwd);
		if (!skillRead) return undefined;

		const existing = readCalls.get(toolCallId);
		const requestedRange = existing?.requestedRange ?? getRequestedRange(input);
		const plan = { skillRead, requestedRange };
		readCalls.set(toolCallId, plan);

		// A skill root file is self-contained by contract. If the model asks for a
		// slice, silently turn it into a normal whole-file read before the tool runs
		// and before the TUI renders the read call.
		delete input.offset;
		delete input.limit;

		return plan;
	}

	pi.on("before_agent_start", async (event, ctx) => {
		const maybeEvent = event as MaybeBeforeAgentStartEvent;
		const optionSkillPaths = maybeEvent.systemPromptOptions?.skills
			?.map((skill) => skill.filePath)
			.filter((filePath): filePath is string => typeof filePath === "string") ?? [];

		await rememberSkillPaths(optionSkillPaths, ctx.cwd);

		if (typeof maybeEvent.systemPrompt === "string") {
			await rememberSkillPaths(extractSkillLocationsFromPrompt(maybeEvent.systemPrompt), ctx.cwd);
		}

		await refreshKnownSkillPaths(ctx);
	});

	pi.on("message_update", async (event, ctx) => {
		if (event.message.role !== "assistant") return undefined;
		if (!knownSkillPathsLoaded) {
			await refreshKnownSkillPaths(ctx);
		}

		for (const part of event.message.content) {
			if (part.type !== "toolCall" || part.name !== "read") continue;
			if (!part.arguments || typeof part.arguments !== "object") continue;
			await expandSkillReadArgs(part.id, part.arguments as ReadArgs, ctx.cwd);
		}

		return undefined;
	});

	pi.on("tool_execution_start", async (event, ctx) => {
		if (event.toolName !== "read") return undefined;
		if (!event.args || typeof event.args !== "object") return undefined;
		if (!knownSkillPathsLoaded) {
			await refreshKnownSkillPaths(ctx);
		}

		await expandSkillReadArgs(event.toolCallId, event.args as ReadArgs, ctx.cwd);
		return undefined;
	});

	pi.on("tool_call", async (event, ctx) => {
		if (!isToolCallEventType("read", event)) return undefined;

		if (!knownSkillPathsLoaded) {
			await refreshKnownSkillPaths(ctx);
		}

		const plan = await expandSkillReadArgs(event.toolCallId, event.input, ctx.cwd);
		if (!plan) return undefined;

		if (plan.requestedRange && ctx.hasUI && !notifiedToolCalls.has(event.toolCallId)) {
			notifiedToolCalls.add(event.toolCallId);
			ctx.ui.notify(
				`${EXTENSION_ID}: expanded partial skill read ${formatSkillName(plan.skillRead.absolutePath)}:${plan.requestedRange.label} to the full skill file`,
				"info",
			);
		}

		return undefined;
	});

	pi.on("tool_result", async (event, ctx) => {
		if (!isReadToolResult(event)) return undefined;

		let plan = readCalls.get(event.toolCallId);
		readCalls.delete(event.toolCallId);
		notifiedToolCalls.delete(event.toolCallId);

		if (!plan) {
			const rawPath = getReadPath(event.input);
			if (!rawPath) return undefined;
			const skillRead = await matchSkillRead(rawPath, ctx.cwd);
			if (!skillRead) return undefined;
			plan = { skillRead, requestedRange: getRequestedRange(event.input) };
		}

		const { skillRead, requestedRange } = plan;
		const maxBytes = parseMaxBytes();

		try {
			const fileStat = await stat(skillRead.canonicalPath);
			if (fileStat.size > maxBytes) {
				return {
					content: [
						{
							type: "text" as const,
							text: [
								`Full skill read blocked: ${skillRead.absolutePath} is ${fileStat.size} bytes, which exceeds ${MAX_BYTES_ENV}=${maxBytes}.`,
								`Increase ${MAX_BYTES_ENV} if this skill should be read in full.`,
							].join("\n"),
						},
					],
					details: mergeDetails(event.details, {
						extension: EXTENSION_ID,
						path: skillRead.absolutePath,
						bytes: fileStat.size,
						maxBytes,
						requestedRange,
						blocked: true,
					}),
					isError: true,
				};
			}

			const content = await readFile(skillRead.canonicalPath, "utf8");
			return {
				content: [{ type: "text" as const, text: content }],
				details: mergeDetails(event.details, {
					extension: EXTENSION_ID,
					path: skillRead.absolutePath,
					bytes: Buffer.byteLength(content, "utf8"),
					maxBytes,
					requestedRange,
					expanded: true,
				}),
				isError: false,
			};
		} catch {
			// Preserve Pi's original read result if our replacement read cannot be
			// produced for some unexpected reason.
			return undefined;
		}
	});
}

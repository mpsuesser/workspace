import type { ExtensionAPI, ExtensionCommandContext } from "@mariozechner/pi-coding-agent";
import { CombinedAutocompleteProvider, type AutocompleteItem } from "@mariozechner/pi-tui";
import { existsSync, mkdirSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { basename, extname, isAbsolute, join, resolve } from "node:path";

let activeCwd = process.cwd();

function expandHomePath(input: string): string {
	if (input === "~") return homedir();
	if (input.startsWith("~/")) return join(homedir(), input.slice(2));
	return input;
}

function stripWrappingQuotes(input: string): string {
	if (
		(input.startsWith('"') && input.endsWith('"')) ||
		(input.startsWith("'") && input.endsWith("'"))
	) {
		return input.slice(1, -1);
	}
	return input;
}

function resolveTargetDirectory(input: string, cwd: string): string {
	const normalized = stripWrappingQuotes(input.trim());
	const expanded = expandHomePath(normalized);
	return isAbsolute(expanded) ? resolve(expanded) : resolve(cwd, expanded);
}

function getAgentDir(): string {
	const override = process.env.PI_CODING_AGENT_DIR?.trim();
	if (!override) {
		return join(homedir(), ".pi", "agent");
	}
	const expanded = expandHomePath(override);
	return isAbsolute(expanded) ? resolve(expanded) : resolve(process.cwd(), expanded);
}

function getDefaultSessionDir(cwd: string): string {
	const safePath = `--${cwd.replace(/^[/\\]/, "").replace(/[/\\:]/g, "-")}--`;
	const sessionDir = join(getAgentDir(), "sessions", safePath);
	mkdirSync(sessionDir, { recursive: true });
	return sessionDir;
}

function getMovedSessionFilePath(currentSessionFile: string, targetCwd: string): string {
	const targetSessionDir = getDefaultSessionDir(targetCwd);
	const base = basename(currentSessionFile);
	let candidate = join(targetSessionDir, base);

	if (!existsSync(candidate) && candidate !== currentSessionFile) {
		return candidate;
	}

	const extension = extname(base);
	const stem = extension ? base.slice(0, -extension.length) : base;
	let index = 2;
	while (existsSync(candidate)) {
		candidate = join(targetSessionDir, `${stem}_cd${index}${extension}`);
		index += 1;
	}
	return candidate;
}

type SessionSnapshotSource = Pick<ExtensionCommandContext["sessionManager"], "getEntries" | "getHeader">;

function rewriteSessionWithNewCwd(sourceSession: SessionSnapshotSource, targetSessionFile: string, targetCwd: string): void {
	const sourceHeader = sourceSession.getHeader();
	if (!sourceHeader) {
		throw new Error("Session has no header");
	}

	const header = { ...sourceHeader, cwd: targetCwd };
	const entries = sourceSession.getEntries();
	const nextContent = `${[JSON.stringify(header), ...entries.map((entry) => JSON.stringify(entry))].join("\n")}\n`;
	writeFileSync(targetSessionFile, nextContent, "utf8");
}

function stripAttachmentPrefix(item: AutocompleteItem): AutocompleteItem {
	return {
		...item,
		value: item.value.startsWith("@") ? item.value.slice(1) : item.value,
	};
}

async function getDirectoryCompletions(prefix: string, cwd: string): Promise<AutocompleteItem[] | null> {
	const provider = new CombinedAutocompleteProvider([], cwd, "fd");
	const signal = new AbortController().signal;

	const fuzzySuggestions = await provider.getSuggestions([`@${prefix}`], 0, prefix.length + 1, { signal });
	const fuzzyDirectories =
		fuzzySuggestions?.items.filter((item) => item.label.endsWith("/"))
			.map(stripAttachmentPrefix) ?? [];
	if (fuzzyDirectories.length > 0) {
		return fuzzyDirectories;
	}

	const pathSuggestions = await provider.getSuggestions([prefix], 0, prefix.length, { signal, force: true });
	const pathDirectories =
		pathSuggestions?.items.filter((item) => item.label.endsWith("/")) ?? [];
	return pathDirectories.length > 0 ? pathDirectories : null;
}

export default function cdExtension(pi: ExtensionAPI) {
	pi.on("session_start", async (_event, ctx) => {
		activeCwd = ctx.sessionManager.getCwd();
	});

	pi.registerCommand("cd", {
		description: "Change the current working directory",
		getArgumentCompletions: async (prefix) => {
			return getDirectoryCompletions(prefix, activeCwd);
		},
		handler: async (args, ctx) => {
			const rawTarget = args.trim();
			if (!rawTarget) {
				ctx.ui.notify("Usage: /cd <directory>", "info");
				return;
			}

			const currentCwd = ctx.sessionManager.getCwd();
			const targetCwd = resolveTargetDirectory(rawTarget, currentCwd);

			let stats;
			try {
				stats = statSync(targetCwd);
			} catch {
				ctx.ui.notify(`Directory not found: ${targetCwd}`, "error");
				return;
			}

			if (!stats.isDirectory()) {
				ctx.ui.notify(`Not a directory: ${targetCwd}`, "error");
				return;
			}

			if (targetCwd === currentCwd) {
				ctx.ui.notify(`Already in ${targetCwd}`, "info");
				return;
			}

			const currentSessionFile = ctx.sessionManager.getSessionFile();
			if (!currentSessionFile) {
				ctx.ui.notify("/cd requires a persisted session. Ephemeral sessions are not supported.", "error");
				return;
			}

			const targetSessionFile = getMovedSessionFilePath(currentSessionFile, targetCwd);

			try {
				rewriteSessionWithNewCwd(ctx.sessionManager, targetSessionFile, targetCwd);

				const result = await ctx.switchSession(targetSessionFile);
				if (result.cancelled) {
					try {
						unlinkSync(targetSessionFile);
					} catch {}
					return;
				}

				activeCwd = targetCwd;
				if (targetSessionFile !== currentSessionFile) {
					try {
						unlinkSync(currentSessionFile);
					} catch {}
				}
			} catch (error) {
				try {
					if (targetSessionFile !== currentSessionFile && existsSync(targetSessionFile)) {
						unlinkSync(targetSessionFile);
					}
				} catch {}

				const message = error instanceof Error ? error.message : String(error);
				ctx.ui.notify(`Failed to change directory: ${message}`, "error");
			}
		},
	});
}

/**
 * Run a subagent as a child `pi -p --mode json` process.
 *
 * Why a subprocess: OpenCode runs subagents in-process as child `Session`
 * objects sharing the parent's SDK. pi has no equivalent in-process API for
 * spawning isolated agent contexts, so we shell out -- the same approach the
 * pi-distributed `examples/extensions/subagent/` reference implementation
 * takes. This gives us a guaranteed-isolated context window, with the
 * downside that we can't reuse the parent's model registry / extensions
 * cheaply.
 */

import { spawn } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import type { AgentInfo } from "./agent-info.js";
import { collapseToToolsAllowlist } from "./permission-map.js";

/** Subset of pi's AgentMessage we use; we treat unknown shapes as opaque. */
export interface RunnerMessage {
	role: "user" | "assistant" | "toolResult";
	content: Array<{ type: string; text?: string; name?: string; arguments?: Record<string, unknown> }>;
	model?: string;
	stopReason?: string;
	errorMessage?: string;
	usage?: {
		input?: number;
		output?: number;
		cacheRead?: number;
		cacheWrite?: number;
		totalTokens?: number;
		cost?: { total?: number };
	};
}

export interface RunnerUsage {
	input: number;
	output: number;
	cacheRead: number;
	cacheWrite: number;
	cost: number;
	contextTokens: number;
	turns: number;
}

export interface RunnerResult {
	exitCode: number;
	messages: RunnerMessage[];
	stderr: string;
	usage: RunnerUsage;
	model?: string;
	stopReason?: string;
	errorMessage?: string;
	wasAborted: boolean;
}

export interface RunOptions {
	agent: AgentInfo;
	/** The user-task text to send as the prompt for this invocation. */
	prompt: string;
	/** Working directory for the subagent process. */
	cwd: string;
	/** Absolute path to the .jsonl session file; first run creates it. */
	sessionFile: string;
	/** Whether this is a resumption (informational only -- pi opens the file either way). */
	resumed: boolean;
	/** Abort signal -- on abort we SIGTERM the child, then SIGKILL after 5s. */
	signal?: AbortSignal;
	/** Called whenever a `message_end` event arrives. Useful for live UI. */
	onUpdate?: (snapshot: RunnerResult) => void;
}

/**
 * Locate the right invocation for spawning pi. Same approach as the
 * reference subagent extension: prefer `process.argv[1]` (the script the
 * parent process is running), fall back to a `pi` binary on PATH.
 */
function piInvocation(args: string[]): { command: string; args: string[] } {
	const currentScript = process.argv[1];
	const isBunVirtualScript = currentScript?.startsWith("/$bunfs/root/");
	if (currentScript && !isBunVirtualScript && fs.existsSync(currentScript)) {
		return { command: process.execPath, args: [currentScript, ...args] };
	}
	const execName = path.basename(process.execPath).toLowerCase();
	const isGenericRuntime = /^(node|bun)(\.exe)?$/.test(execName);
	if (!isGenericRuntime) return { command: process.execPath, args };
	return { command: "pi", args };
}

async function writePromptFile(agentName: string, content: string): Promise<{ dir: string; file: string }> {
	const dir = await fs.promises.mkdtemp(path.join(os.tmpdir(), "pi-subagent-"));
	const safe = agentName.replace(/[^\w.-]+/g, "_");
	const file = path.join(dir, `prompt-${safe}.md`);
	await fs.promises.writeFile(file, content, { encoding: "utf-8", mode: 0o600 });
	return { dir, file };
}

export async function runSubagent(opts: RunOptions): Promise<RunnerResult> {
	const args: string[] = ["--mode", "json", "-p"];

	// Resume / continue this exact session file across invocations of the same task_id.
	args.push("--session", opts.sessionFile);

	if (opts.agent.model) args.push("--model", opts.agent.model);

	// Translate the agent's permission ruleset into a tool allowlist.
	const allowlist = collapseToToolsAllowlist(opts.agent.permission);
	if (!allowlist.unrestricted && allowlist.allowedTools.length > 0) {
		args.push("--tools", allowlist.allowedTools.join(","));
	} else if (!allowlist.unrestricted && allowlist.allowedTools.length === 0) {
		// Explicit deny-all rule with no allow rule -- run without tools.
		args.push("--no-tools");
	}

	// Append the agent's system prompt. pi's --append-system-prompt accepts
	// either text or a file path; we use a temp file to avoid argv length
	// limits with long prompts.
	let promptFile: { dir: string; file: string } | null = null;
	if (opts.agent.prompt && opts.agent.prompt.trim()) {
		promptFile = await writePromptFile(opts.agent.name, opts.agent.prompt);
		args.push("--append-system-prompt", promptFile.file);
	}

	args.push(`Task: ${opts.prompt}`);

	const result: RunnerResult = {
		exitCode: 0,
		messages: [],
		stderr: "",
		usage: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, cost: 0, contextTokens: 0, turns: 0 },
		wasAborted: false,
	};

	const emit = () => opts.onUpdate?.(result);

	const exitCode = await new Promise<number>((resolve) => {
		const { command, args: invocationArgs } = piInvocation(args);
		const proc = spawn(command, invocationArgs, {
			cwd: opts.cwd,
			shell: false,
			stdio: ["ignore", "pipe", "pipe"],
		});

		let buffer = "";
		const processLine = (line: string) => {
			if (!line.trim()) return;
			let event: { type?: string; message?: RunnerMessage } | undefined;
			try {
				event = JSON.parse(line) as typeof event;
			} catch {
				return;
			}
			if (!event || typeof event !== "object") return;

			if (event.type === "message_end" && event.message) {
				const msg = event.message;
				result.messages.push(msg);
				if (msg.role === "assistant") {
					result.usage.turns++;
					const u = msg.usage;
					if (u) {
						result.usage.input += u.input ?? 0;
						result.usage.output += u.output ?? 0;
						result.usage.cacheRead += u.cacheRead ?? 0;
						result.usage.cacheWrite += u.cacheWrite ?? 0;
						result.usage.cost += u.cost?.total ?? 0;
						result.usage.contextTokens = u.totalTokens ?? result.usage.contextTokens;
					}
					if (!result.model && msg.model) result.model = msg.model;
					if (msg.stopReason) result.stopReason = msg.stopReason;
					if (msg.errorMessage) result.errorMessage = msg.errorMessage;
				}
				emit();
			}
		};

		proc.stdout.on("data", (data) => {
			buffer += data.toString();
			const lines = buffer.split("\n");
			buffer = lines.pop() || "";
			for (const line of lines) processLine(line);
		});
		proc.stderr.on("data", (data) => {
			result.stderr += data.toString();
		});
		proc.on("close", (code) => {
			if (buffer.trim()) processLine(buffer);
			resolve(code ?? 0);
		});
		proc.on("error", () => resolve(1));

		if (opts.signal) {
			const kill = () => {
				result.wasAborted = true;
				try {
					proc.kill("SIGTERM");
				} catch {
					/* ignore */
				}
				setTimeout(() => {
					if (!proc.killed) {
						try {
							proc.kill("SIGKILL");
						} catch {
							/* ignore */
						}
					}
				}, 5000);
			};
			if (opts.signal.aborted) kill();
			else opts.signal.addEventListener("abort", kill, { once: true });
		}
	});

	result.exitCode = exitCode;

	if (promptFile) {
		try {
			fs.unlinkSync(promptFile.file);
		} catch {
			/* ignore */
		}
		try {
			fs.rmdirSync(promptFile.dir);
		} catch {
			/* ignore */
		}
	}

	return result;
}

/** Extract the last assistant text from a transcript. */
export function getFinalText(messages: RunnerMessage[]): string {
	for (let i = messages.length - 1; i >= 0; i--) {
		const msg = messages[i];
		if (msg.role !== "assistant") continue;
		for (const part of msg.content) {
			if (part.type === "text" && typeof part.text === "string") return part.text;
		}
	}
	return "";
}

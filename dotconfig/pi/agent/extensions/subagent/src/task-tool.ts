/**
 * The `task` tool.
 *
 * Parameter shape, description text, and output formatting are ported verbatim
 * from OpenCode (`packages/opencode/src/tool/task.ts` and `task.txt`).
 *
 * Differences from OpenCode (flagged in README):
 *   - `background: true` always returns a "not yet implemented" error;
 *     no env-gate, no actual detached process.
 *   - Subagent runs in a separate `pi -p --mode json` subprocess instead of
 *     in-process Session.create(), so we lose OpenCode's plugin-trigger hooks
 *     but get fully isolated context for free.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import type { ExtensionAPI, ExtensionContext } from "@mariozechner/pi-coding-agent";
import { Type } from "@sinclair/typebox";
import type { Static } from "@sinclair/typebox";
import type { AgentInfo } from "./agent-info.js";
import type { DiscoveryResult } from "./loader.js";
import { resolveTaskTarget } from "./session-store.js";
import { runSubagent, getFinalText } from "./runner.js";
import type { RunnerResult } from "./runner.js";
import { renderTaskCall, renderTaskResult, type TaskRenderDetails, type RenderTheme } from "./render.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TASK_DESCRIPTION = fs.readFileSync(path.join(__dirname, "prompts", "task.txt"), "utf-8");

// Parameter schema -- field names, types, and descriptions match OpenCode's
// `Parameters` in src/tool/task.ts. We omit `background` from the schema
// surface entirely because we don't implement it; if the LLM passes it
// anyway we'll reject in execute().
const TaskParameters = Type.Object({
	description: Type.String({ description: "A short (3-5 words) description of the task" }),
	prompt: Type.String({ description: "The task for the agent to perform" }),
	subagent_type: Type.String({ description: "The type of specialized agent to use for this task" }),
	task_id: Type.Optional(
		Type.String({
			description:
				"This should only be set if you mean to resume a previous task (you can pass a prior task_id and the task will continue the same subagent session as before instead of creating a fresh one)",
		}),
	),
	command: Type.Optional(Type.String({ description: "The command that triggered this task" })),
	background: Type.Optional(
		Type.Boolean({
			description: "Not yet implemented; passing true returns an error.",
		}),
	),
});

export type TaskInput = Static<typeof TaskParameters>;

/** Format the LLM-facing output. Mirrors OpenCode's `output()` / `backgroundOutput()`. */
function formatSuccess(taskId: string, text: string): string {
	return [
		`task_id: ${taskId} (for resuming to continue this task if needed)`,
		"",
		"<task_result>",
		text,
		"</task_result>",
	].join("\n");
}

function formatError(taskId: string, message: string): string {
	return [
		`task_id: ${taskId}`,
		"state: error",
		"",
		"<task_error>",
		message,
		"</task_error>",
	].join("\n");
}

function errorText(r: RunnerResult): string {
	if (r.wasAborted) return "Subagent was aborted";
	if (r.errorMessage) return r.errorMessage;
	const final = getFinalText(r.messages);
	if (final) return final;
	if (r.stderr) return r.stderr;
	return "(no output)";
}

export interface RegisterTaskToolOptions {
	pi: ExtensionAPI;
	/** Callable that returns the current agent registry (fresh, every call). */
	getDiscovery: (ctx: ExtensionContext) => DiscoveryResult;
}

export function registerTaskTool({ pi, getDiscovery }: RegisterTaskToolOptions): void {
	pi.registerTool({
		name: "task",
		label: "Task",
		description: TASK_DESCRIPTION,
		promptSnippet:
			"Delegate a multi-step task to a specialized subagent (general/explore or one defined in .pi/agents/*.md). Returns a final task_id for resumption.",
		parameters: TaskParameters,
		async execute(_toolCallId, params, signal, onUpdate, ctx) {
			if (params.background === true) {
				throw new Error(
					"task(background=true) is not yet implemented in pi-subagent. Run synchronously instead.",
				);
			}

			const discovery = getDiscovery(ctx);
			const agent: AgentInfo | undefined = discovery.agents.find(
				(a) => a.name === params.subagent_type,
			);
			if (!agent) {
				const available = discovery.agents
					.filter((a) => !a.hidden)
					.map((a) => `"${a.name}"`)
					.join(", ") || "none";
				throw new Error(
					`Unknown agent type: "${params.subagent_type}". Available agents: ${available}.`,
				);
			}
			if (agent.mode !== "subagent") {
				throw new Error(
					`Agent "${agent.name}" has mode="${agent.mode}" which is not supported by pi-subagent (only "subagent" mode is honored).`,
				);
			}

			const target = resolveTaskTarget(params.task_id);
			const details: TaskRenderDetails = {
				taskId: target.taskId,
				agent: agent.name,
				agentSource: agent.source,
				description: params.description,
				task: params.prompt,
				color: agent.color,
				background: false,
				result: undefined,
			};

			// Live update during streaming -- replicates OpenCode's behavior of
			// surfacing intermediate state on the parent session.
			const update = (snapshot: RunnerResult) => {
				details.result = snapshot;
				onUpdate?.({
					content: [{ type: "text", text: getFinalText(snapshot.messages) || "(running...)" }],
					details,
				});
			};

			const result = await runSubagent({
				agent,
				prompt: params.prompt,
				cwd: ctx.cwd,
				sessionFile: target.sessionFile,
				resumed: target.resumed,
				signal,
				onUpdate: update,
			});
			details.result = result;

			const isError =
				result.exitCode !== 0 ||
				result.wasAborted ||
				result.stopReason === "error" ||
				result.stopReason === "aborted";

			if (isError) {
				return {
					content: [{ type: "text", text: formatError(target.taskId, errorText(result)) }],
					details,
					isError: true,
				};
			}

			const finalText = getFinalText(result.messages) || "(no output)";
			return {
				content: [{ type: "text", text: formatSuccess(target.taskId, finalText) }],
				details,
			};
		},
		renderCall(args, theme) {
			return renderTaskCall(args as Record<string, unknown>, theme as unknown as RenderTheme);
		},
		renderResult(result, opts, theme) {
			const details = result.details as TaskRenderDetails | undefined;
			return renderTaskResult(details, !!opts.expanded, theme as unknown as RenderTheme);
		},
	});
}

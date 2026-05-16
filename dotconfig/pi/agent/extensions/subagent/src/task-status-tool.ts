/**
 * The `task_status` tool.
 *
 * Stub-only: the tool is registered with OpenCode's verbatim description and
 * parameter shape so the LLM finds it and the contract is documented, but
 * any actual invocation returns a "not yet implemented" error.
 *
 * Rationale: `task_status` is only useful in combination with
 * `task(background=true)`, which we don't implement. When/if background
 * subagents land, this stub becomes a real polling tool.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { Type } from "@sinclair/typebox";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DESCRIPTION = fs.readFileSync(path.join(__dirname, "prompts", "task_status.txt"), "utf-8");

const TaskStatusParameters = Type.Object({
	task_id: Type.String({ description: "The task_id returned by the task tool" }),
	wait: Type.Optional(
		Type.Boolean({
			description: "When true, wait until the task reaches a terminal state or timeout",
		}),
	),
	timeout_ms: Type.Optional(
		Type.Number({
			description: "Maximum milliseconds to wait when wait=true (default: 60000)",
		}),
	),
});

export function registerTaskStatusTool(pi: ExtensionAPI): void {
	pi.registerTool({
		name: "task_status",
		label: "Task status",
		description: DESCRIPTION,
		parameters: TaskStatusParameters,
		async execute() {
			throw new Error(
				"task_status is not yet implemented in pi-subagent; only synchronous `task` invocations are supported.",
			);
		},
	});
}

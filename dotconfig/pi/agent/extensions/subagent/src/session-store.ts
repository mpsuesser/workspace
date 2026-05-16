/**
 * task_id <-> on-disk session file mapping.
 *
 * OpenCode keeps subagent sessions in its sqlite-backed session store, indexed
 * by SessionID, and resumes the same session when `task_id` is passed to the
 * `task` tool.
 *
 * pi's session storage is a directory of `.jsonl` files. We allocate one
 * directory specifically for subagent sessions and identify them by their
 * filename:
 *
 *   ~/.pi/agent/state/subagent/<task_id>.jsonl
 *
 * Passing `pi --session <full path>` calls SessionManager.open(path), which
 * happily appends to an existing file or creates a new one on first run.
 */

import { mkdirSync } from "node:fs";
import { randomBytes } from "node:crypto";
import * as path from "node:path";
import { getAgentDir } from "@mariozechner/pi-coding-agent";

/** Root directory all subagent session files live under. */
export function subagentSessionDir(): string {
	const dir = path.join(getAgentDir(), "state", "subagent");
	mkdirSync(dir, { recursive: true });
	return dir;
}

/** Resolve a task_id (or new one) to an absolute session file path. */
export function pathForTaskId(taskId: string): string {
	return path.join(subagentSessionDir(), `${taskId}.jsonl`);
}

/**
 * Mint a fresh task_id. We use a short, URL-safe random token rather than a
 * full UUID; pi's `--session <id>` accepts partial UUIDs but matches against
 * the session header's id (which we don't control), so we identify by
 * filename instead. Any opaque string the model can round-trip works.
 */
export function newTaskId(): string {
	return `task_${randomBytes(8).toString("hex")}`;
}

/**
 * Decide which file path to use for a given invocation. If task_id is
 * provided, reuse the existing path; otherwise mint a new one.
 */
export function resolveTaskTarget(taskId: string | undefined): { taskId: string; sessionFile: string; resumed: boolean } {
	if (taskId && taskId.trim()) {
		const id = taskId.trim();
		return { taskId: id, sessionFile: pathForTaskId(id), resumed: true };
	}
	const id = newTaskId();
	return { taskId: id, sessionFile: pathForTaskId(id), resumed: false };
}

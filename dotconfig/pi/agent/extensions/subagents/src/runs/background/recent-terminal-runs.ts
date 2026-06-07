/**
 * Tracks recently-finished subagent runs so the extension can answer status
 * queries for runs whose on-disk artifacts have already been cleaned up, and
 * suppress stale control notices for runs that have terminated.
 *
 * This is intentionally an in-memory, per-session structure: it is a UX aid for
 * the orchestrator, not a source of truth. The authoritative record of a run is
 * its async dir / result file while those exist.
 */

import type { RecentTerminalRun, SubagentState } from "../../shared/types.ts";

/** Cap on retained records; oldest are evicted first (insertion-ordered Map). */
export const RECENT_TERMINAL_RUNS_MAX = 64;
/** Records older than this are treated as expired and ignored. */
export const RECENT_TERMINAL_RUNS_TTL_MS = 60 * 60 * 1000;

export function isTerminalRunState(state: string | undefined): state is "complete" | "failed" | "paused" {
	return state === "complete" || state === "completed" || state === "failed" || state === "paused";
}

function normalizeTerminalState(state: string | undefined): RecentTerminalRun["state"] {
	if (state === "failed") return "failed";
	if (state === "paused") return "paused";
	return "complete";
}

export function recordTerminalRun(
	state: SubagentState,
	record: Omit<RecentTerminalRun, "state"> & { state: string | undefined },
): void {
	if (!record.runId) return;
	const map = state.recentTerminalRuns ?? new Map<string, RecentTerminalRun>();
	state.recentTerminalRuns = map;
	const normalized: RecentTerminalRun = { ...record, state: normalizeTerminalState(record.state) };
	// Re-insert so the most recently finished run sorts last (LRU eviction order).
	map.delete(normalized.runId);
	map.set(normalized.runId, normalized);
	while (map.size > RECENT_TERMINAL_RUNS_MAX) {
		const oldest = map.keys().next().value;
		if (oldest === undefined) break;
		map.delete(oldest);
	}
}

export function lookupTerminalRun(
	state: Pick<SubagentState, "recentTerminalRuns"> | undefined,
	id: string,
	now: number = Date.now(),
): RecentTerminalRun | undefined {
	const map = state?.recentTerminalRuns;
	if (!map || !id) return undefined;
	const fresh = (record: RecentTerminalRun | undefined): RecentTerminalRun | undefined => {
		if (!record) return undefined;
		if (now - record.endedAt > RECENT_TERMINAL_RUNS_TTL_MS) {
			map.delete(record.runId);
			return undefined;
		}
		return record;
	};
	const exact = fresh(map.get(id));
	if (exact) return exact;
	// Orchestrators routinely poll with a short id prefix; match those too, but
	// only when the prefix is unambiguous so we never report the wrong run.
	let prefixMatch: RecentTerminalRun | undefined;
	for (const [runId, record] of map) {
		if (!runId.startsWith(id)) continue;
		if (prefixMatch) return undefined;
		prefixMatch = record;
	}
	return fresh(prefixMatch);
}

export function hasTerminalRun(
	state: Pick<SubagentState, "recentTerminalRuns"> | undefined,
	id: string,
	now: number = Date.now(),
): boolean {
	return lookupTerminalRun(state, id, now) !== undefined;
}

export function describeTerminalRun(record: RecentTerminalRun): string {
	const outcome = record.state === "complete" ? "completed" : record.state;
	const agents = record.agents?.length ? ` (${record.agents.join(", ")})` : "";
	const lines = [
		`Run: ${record.runId}`,
		`State: ${outcome}${agents}`,
		`Mode: ${record.mode}`,
		`Finished: ${new Date(record.endedAt).toISOString()}`,
		record.source === "foreground"
			? "This run already finished; its result was returned inline when it completed."
			: "This run already finished; its result was delivered via the completion notice/intercom.",
		record.outputFile ? `Output: ${record.outputFile}` : undefined,
		record.sessionFile ? `Session: ${record.sessionFile}` : undefined,
		"No further status action is needed.",
	].filter((line): line is string => Boolean(line));
	return lines.join("\n");
}

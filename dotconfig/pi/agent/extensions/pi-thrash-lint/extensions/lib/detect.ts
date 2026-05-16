/**
 * Thrash detector.
 *
 * Walks the event stream and emits SignalHits as it observes patterns,
 * then groups overlapping hits into Incidents. Heuristics are simple and
 * deterministic so they can be unit-tested against fixture JSONL files.
 *
 * v0 signal kinds:
 *   - failed_edit_retry: edit/write returns isError, followed by another
 *     edit/write to the SAME file within K calls.
 *   - edit_oscillation:  >= N edits to the SAME file within a time window.
 *   - bash_error_retry:  bash exits non-zero, followed by another bash
 *     within K events whose command shares a common prefix.
 *   - read_edit_loop:    read(X) → edit(X) → read(X) again. Indicates the
 *     agent re-read after misunderstanding the file.
 *   - tool_error_cascade: 3+ failing tool calls within a short window
 *     (independent of file/tool — catches general breakdowns).
 */
import type {
	Event,
	Incident,
	ParsedSession,
	SignalHit,
	SignalKind,
	ToolCallEvent,
	ToolResultEvent,
} from "./types.ts";
import { SIGNAL_KINDS } from "./types.ts";

interface DetectOptions {
	/** Max events between a failed edit and a retry to count as same incident. */
	retryWindow?: number;
	/** Min edits on one file to trigger oscillation. */
	oscillationThreshold?: number;
	/** Window in ms for edit_oscillation. */
	oscillationWindowMs?: number;
	/** Min failing tool calls in a window for tool_error_cascade. */
	cascadeThreshold?: number;
	/** Time window in ms for tool_error_cascade. */
	cascadeWindowMs?: number;
	/** Max gap in seconds before splitting two hits into separate incidents. */
	incidentGapSeconds?: number;
}

const EDIT_TOOLS = new Set(["edit", "write"]);

export function detectIncidents(
	parsed: ParsedSession,
	opts: DetectOptions = {},
): Incident[] {
	const retryWindow = opts.retryWindow ?? 5;
	const oscillationThreshold = opts.oscillationThreshold ?? 4;
	const oscillationWindowMs = opts.oscillationWindowMs ?? 10 * 60 * 1000;
	const cascadeThreshold = opts.cascadeThreshold ?? 3;
	const cascadeWindowMs = opts.cascadeWindowMs ?? 2 * 60 * 1000;
	const incidentGapMs = (opts.incidentGapSeconds ?? 120) * 1000;

	const { events, session } = parsed;
	const hits: SignalHit[] = [];

	// Index tool_results by tool_call_id for quick lookup.
	const resultByCallId = new Map<string, ToolResultEvent>();
	for (const e of events) {
		if (e.kind === "tool_result") resultByCallId.set(e.tool_call_id, e);
	}

	// Build a parallel list of tool_call events with their results.
	const calls: Array<{ call: ToolCallEvent; result?: ToolResultEvent; idx: number }> = [];
	events.forEach((e, idx) => {
		if (e.kind === "tool_call") {
			calls.push({ call: e, result: resultByCallId.get(e.tool_call_id), idx });
		}
	});

	// --- failed_edit_retry ----------------------------------------------
	for (let i = 0; i < calls.length; i++) {
		const { call, result } = calls[i]!;
		if (!EDIT_TOOLS.has(call.tool_name)) continue;
		if (!result?.is_error) continue;
		if (!call.file_path) continue;
		// Look ahead within retryWindow for another edit on same file.
		for (let j = i + 1; j < Math.min(calls.length, i + 1 + retryWindow); j++) {
			const next = calls[j]!;
			if (!EDIT_TOOLS.has(next.call.tool_name)) continue;
			if (next.call.file_path !== call.file_path) continue;
			hits.push({
				kind: "failed_edit_retry",
				at_entry_id: call.entry_id,
				ts: call.ts,
				weight: 0.5,
				detail: `failed ${call.tool_name} on ${call.file_path} retried`,
				file_path: call.file_path,
				tool_name: call.tool_name,
			});
			break;
		}
	}

	// --- edit_oscillation -----------------------------------------------
	// Group edits by file; slide a time window; if >= threshold edits in
	// any window, emit one hit anchored at the first edit of that window.
	const editsByFile = new Map<string, ToolCallEvent[]>();
	for (const { call } of calls) {
		if (!EDIT_TOOLS.has(call.tool_name)) continue;
		if (!call.file_path) continue;
		let arr = editsByFile.get(call.file_path);
		if (!arr) {
			arr = [];
			editsByFile.set(call.file_path, arr);
		}
		arr.push(call);
	}
	for (const [file, fileCalls] of editsByFile) {
		let windowStart = 0;
		let emitted = false;
		for (let i = 0; i < fileCalls.length; i++) {
			while (
				fileCalls[i]!.ts - fileCalls[windowStart]!.ts > oscillationWindowMs
			) {
				windowStart++;
			}
			const count = i - windowStart + 1;
			if (!emitted && count >= oscillationThreshold) {
				hits.push({
					kind: "edit_oscillation",
					at_entry_id: fileCalls[windowStart]!.entry_id,
					ts: fileCalls[windowStart]!.ts,
					until_ts: fileCalls[i]!.ts,
					until_entry_id: fileCalls[i]!.entry_id,
					weight: 0.6,
					detail: `${count} edits to ${file} within window`,
					file_path: file,
					tool_name: "edit",
				});
				emitted = true;
			}
		}
	}

	// --- bash_error_retry ------------------------------------------------
	for (let i = 0; i < calls.length; i++) {
		const { call, result } = calls[i]!;
		if (call.tool_name !== "bash") continue;
		const exit = result?.exit_code;
		const failed = result?.is_error || (typeof exit === "number" && exit !== 0);
		if (!failed) continue;
		const cmd = call.bash_command ?? "";
		const firstWord = cmd.trim().split(/\s+/)[0] ?? "";
		for (let j = i + 1; j < Math.min(calls.length, i + 1 + retryWindow); j++) {
			const next = calls[j]!;
			if (next.call.tool_name !== "bash") continue;
			const nextCmd = next.call.bash_command ?? "";
			const nextFirst = nextCmd.trim().split(/\s+/)[0] ?? "";
			if (firstWord && nextFirst && firstWord === nextFirst) {
				hits.push({
					kind: "bash_error_retry",
					at_entry_id: call.entry_id,
					ts: call.ts,
					until_ts: next.result?.ts ?? next.call.ts,
					until_entry_id: next.result?.entry_id ?? next.call.entry_id,
					weight: 0.4,
					detail: `bash failed and retried with same leading word: ${firstWord}`,
					tool_name: "bash",
				});
				break;
			}
		}
	}

	// --- read_edit_loop --------------------------------------------------
	// pattern across calls: read(X) … edit(X) … read(X)
	for (let i = 0; i < calls.length; i++) {
		const a = calls[i]!.call;
		if (a.tool_name !== "read" || !a.file_path) continue;
		let sawEdit = false;
		for (let j = i + 1; j < calls.length; j++) {
			const b = calls[j]!.call;
			if (b.file_path !== a.file_path) continue;
			if (!sawEdit && EDIT_TOOLS.has(b.tool_name)) sawEdit = true;
			else if (sawEdit && b.tool_name === "read") {
				hits.push({
					kind: "read_edit_loop",
					at_entry_id: a.entry_id,
					ts: a.ts,
					until_ts: b.ts,
					until_entry_id: b.entry_id,
					weight: 0.4,
					detail: `re-read ${a.file_path} after editing`,
					file_path: a.file_path,
				});
				break;
			}
		}
	}

	// --- tool_error_cascade ---------------------------------------------
	// >= cascadeThreshold failing tool_results within cascadeWindowMs.
	const failingResults = events.filter(
		(e): e is ToolResultEvent => e.kind === "tool_result" && e.is_error,
	);
	for (let i = 0; i < failingResults.length; i++) {
		let count = 1;
		for (
			let j = i + 1;
			j < failingResults.length && failingResults[j]!.ts - failingResults[i]!.ts <= cascadeWindowMs;
			j++
		) {
			count++;
		}
		if (count >= cascadeThreshold) {
			const lastIdx = i + count - 1;
			hits.push({
				kind: "tool_error_cascade",
				at_entry_id: failingResults[i]!.entry_id,
				ts: failingResults[i]!.ts,
				until_ts: failingResults[lastIdx]!.ts,
				until_entry_id: failingResults[lastIdx]!.entry_id,
				weight: 0.3,
				detail: `${count} failing tool calls within window`,
				tool_name: failingResults[i]!.tool_name,
			});
			// only one cascade hit per cluster
			i = i + count - 1;
		}
	}

	if (hits.length === 0) return [];

	// Group temporally-adjacent hits into incidents.
	hits.sort((a, b) => a.ts - b.ts);
	const groups: SignalHit[][] = [];
	for (const hit of hits) {
		const last = groups[groups.length - 1];
		const lastTs = last ? (last[last.length - 1]!.until_ts ?? last[last.length - 1]!.ts) : 0;
		if (last && hit.ts - lastTs <= incidentGapMs) {
			last.push(hit);
		} else {
			groups.push([hit]);
		}
	}

	const project = deriveProject(session.cwd);
	const incidents: Incident[] = [];
	for (const group of groups) {
		const first = group[0]!;
		const last = group[group.length - 1]!;
		const spanStart = first.ts;
		const spanEnd = Math.max(...group.map((h) => h.until_ts ?? h.ts));
		const lastEntryId = last.until_entry_id ?? last.at_entry_id;
		const signals: Record<SignalKind, number> = Object.fromEntries(
			SIGNAL_KINDS.map((k) => [k, 0]),
		) as Record<SignalKind, number>;
		let scoreRaw = 0;
		const fileSet = new Set<string>();
		for (const h of group) {
			signals[h.kind]++;
			scoreRaw += h.weight;
			if (h.file_path) fileSet.add(h.file_path);
		}
		const primary = (Object.entries(signals) as Array<[SignalKind, number]>)
			.sort((a, b) => b[1] - a[1])[0]![0];

		// Compute tool call / failure counts within the incident window.
		let toolCalls = 0;
		let failedToolCalls = 0;
		for (const e of events) {
			if (e.ts < spanStart || e.ts > spanEnd) continue;
			if (e.kind === "tool_call") toolCalls++;
			if (e.kind === "tool_result" && e.is_error) failedToolCalls++;
		}

		const fileList = [...fileSet];
		const score = clamp01(scoreRaw / 2); // soft-normalise: 2.0 → 1.0
		const summary = buildSummary(primary, signals, fileList, failedToolCalls);

		incidents.push({
			incident_id: `${session.id}:${first.at_entry_id}:${lastEntryId}`,
			session_path: session.path,
			session_id: session.id,
			project,
			first_entry_id: first.at_entry_id,
			last_entry_id: lastEntryId,
			started_at: new Date(spanStart).toISOString(),
			duration_seconds: Math.round((spanEnd - spanStart) / 1000),
			score,
			primary_signal: primary,
			signals,
			hits: group,
			file_paths: fileList,
			tool_calls: toolCalls,
			failed_tool_calls: failedToolCalls,
			summary,
		});
	}

	return incidents;
}

function clamp01(n: number): number {
	if (!Number.isFinite(n)) return 0;
	return Math.max(0, Math.min(1, n));
}

function deriveProject(cwd: string): string {
	if (!cwd) return "unknown";
	const parts = cwd.split("/").filter(Boolean);
	if (parts.length <= 2) return cwd;
	return parts.slice(-2).join("/");
}

function buildSummary(
	primary: SignalKind,
	signals: Record<SignalKind, number>,
	files: string[],
	failedCalls: number,
): string {
	const file = files[0] ? ` on ${shortPath(files[0])}` : "";
	switch (primary) {
		case "failed_edit_retry":
			return `${signals.failed_edit_retry}× failed edit retried${file}`;
		case "edit_oscillation":
			return `repeated edits${file}`;
		case "bash_error_retry":
			return `bash command failed and retried (${failedCalls} failures)`;
		case "read_edit_loop":
			return `re-read after edit${file}`;
		case "tool_error_cascade":
			return `cascade of ${failedCalls} failing tool calls`;
	}
}

function shortPath(p: string): string {
	const parts = p.split("/").filter(Boolean);
	return parts.slice(-2).join("/");
}

// Re-export for callers
export type { Incident } from "./types.ts";
export function _eventsForTesting(parsed: ParsedSession): Event[] {
	return parsed.events;
}

/**
 * thrash_stats — corpus-wide calibration numbers.
 *
 * DX:
 *   - Optional filters: project, since.
 *   - Returns totals, overall failure_rate, by_tool breakdown,
 *     top thrash files, and a sorted list of signal counts.
 *   - Useful before drilling in via thrash_find to gauge "is N a lot?".
 */
import type { Corpus } from "../lib/corpus.ts";
import type { SignalKind } from "../lib/types.ts";
import { SIGNAL_KINDS } from "../lib/types.ts";

export interface StatsInput {
	project?: string;
	since?: string;
}

export interface ToolStat {
	calls: number;
	failures: number;
	failure_rate: number;
}

export interface StatsOutput {
	total_sessions: number;
	total_turns: number;
	total_tool_calls: number;
	total_failed_tool_calls: number;
	failure_rate: number;
	by_tool: Record<string, ToolStat>;
	top_thrash_files: Array<{ path: string; incidents: number; score: number }>;
	top_thrash_signals: Array<{ signal: SignalKind; count: number }>;
	date_range: { from: string | null; to: string | null };
}

export async function runThrashStats(
	input: StatsInput,
	corpus: Corpus,
): Promise<StatsOutput> {
	const sinceMs = parseSince(input.since);
	const projectFilter = input.project;

	let totalSessions = 0;
	let totalTurns = 0;
	let totalCalls = 0;
	let totalFailed = 0;
	const byTool = new Map<string, { calls: number; failures: number }>();
	let minTs = Infinity;
	let maxTs = -Infinity;

	for (const parsed of corpus.sessions) {
		const headerTs = Date.parse(parsed.session.timestamp);
		if (sinceMs !== undefined && Number.isFinite(headerTs) && headerTs < sinceMs)
			continue;
		const project = projectFromCwd(parsed.session.cwd);
		if (projectFilter && !project.includes(projectFilter)) continue;
		totalSessions++;

		for (const e of parsed.events) {
			if (e.kind === "user") totalTurns++;
			if (e.kind === "tool_call") {
				totalCalls++;
				const tool = e.tool_name || "(unknown)";
				let s = byTool.get(tool);
				if (!s) {
					s = { calls: 0, failures: 0 };
					byTool.set(tool, s);
				}
				s.calls++;
			}
			if (e.kind === "tool_result") {
				if (e.is_error) {
					totalFailed++;
					const tool = e.tool_name || "(unknown)";
					let s = byTool.get(tool);
					if (!s) {
						s = { calls: 0, failures: 0 };
						byTool.set(tool, s);
					}
					s.failures++;
				}
			}
			if (Number.isFinite(e.ts)) {
				if (e.ts < minTs) minTs = e.ts;
				if (e.ts > maxTs) maxTs = e.ts;
			}
		}
	}

	const signalCounts = new Map<SignalKind, number>();
	for (const k of SIGNAL_KINDS) signalCounts.set(k, 0);
	const fileCounts = new Map<string, { incidents: number; score: number }>();

	for (const inc of corpus.incidents) {
		if (projectFilter && !inc.project.includes(projectFilter)) continue;
		const t = Date.parse(inc.started_at);
		if (sinceMs !== undefined && Number.isFinite(t) && t < sinceMs) continue;
		for (const [sig, count] of Object.entries(inc.signals) as Array<[SignalKind, number]>) {
			signalCounts.set(sig, (signalCounts.get(sig) ?? 0) + count);
		}
		for (const f of inc.file_paths) {
			let s = fileCounts.get(f);
			if (!s) {
				s = { incidents: 0, score: 0 };
				fileCounts.set(f, s);
			}
			s.incidents++;
			s.score += inc.score;
		}
	}

	const byToolOut: Record<string, ToolStat> = {};
	for (const [tool, stat] of byTool) {
		const rate = stat.calls > 0 ? stat.failures / stat.calls : 0;
		byToolOut[tool] = {
			calls: stat.calls,
			failures: stat.failures,
			failure_rate: rate,
		};
	}

	const topFiles = [...fileCounts.entries()]
		.map(([path, s]) => ({ path, incidents: s.incidents, score: s.score }))
		.sort((a, b) => b.score - a.score)
		.slice(0, 10);

	const topSignals = [...signalCounts.entries()]
		.map(([signal, count]) => ({ signal, count }))
		.sort((a, b) => b.count - a.count);

	return {
		total_sessions: totalSessions,
		total_turns: totalTurns,
		total_tool_calls: totalCalls,
		total_failed_tool_calls: totalFailed,
		failure_rate: totalCalls > 0 ? totalFailed / totalCalls : 0,
		by_tool: byToolOut,
		top_thrash_files: topFiles,
		top_thrash_signals: topSignals,
		date_range: {
			from: Number.isFinite(minTs) ? new Date(minTs).toISOString() : null,
			to: Number.isFinite(maxTs) ? new Date(maxTs).toISOString() : null,
		},
	};
}

function projectFromCwd(cwd: string): string {
	if (!cwd) return "unknown";
	const parts = cwd.split("/").filter(Boolean);
	if (parts.length <= 2) return cwd;
	return parts.slice(-2).join("/");
}

function parseSince(input: string | undefined): number | undefined {
	if (!input) return undefined;
	const m = /^(\d+)([dhm])$/.exec(input.trim());
	if (m) {
		const n = Number(m[1]);
		const unit = m[2];
		const ms =
			unit === "d" ? n * 86400_000 : unit === "h" ? n * 3600_000 : n * 60_000;
		return Date.now() - ms;
	}
	const t = Date.parse(input);
	return Number.isFinite(t) ? t : undefined;
}

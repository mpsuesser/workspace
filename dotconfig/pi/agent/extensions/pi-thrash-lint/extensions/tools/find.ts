/**
 * thrash_find — list ranked thrash incidents across the session corpus.
 *
 * DX:
 *   - All filters optional; default = "top 20 across whole corpus by score".
 *   - Returns *summarised* incidents only — for full event traces use
 *     thrash_inspect with the returned incident_id.
 *   - Filters: signals, project (substring match against project label),
 *     since (ISO date or "Nd" shorthand), min_score, limit.
 */
import type { Corpus } from "../lib/corpus.ts";
import type { Incident, SignalKind } from "../lib/types.ts";
import { SIGNAL_KINDS } from "../lib/types.ts";

export interface FindInput {
	signals?: SignalKind[];
	project?: string;
	since?: string;
	min_score?: number;
	limit?: number;
}

export interface FindIncidentSummary {
	incident_id: string;
	project: string;
	session_id: string;
	started_at: string;
	duration_seconds: number;
	score: number;
	primary_signal: SignalKind;
	signals: Record<SignalKind, number>;
	file_paths: string[];
	tool_calls: number;
	failed_tool_calls: number;
	summary: string;
}

export interface FindOutput {
	incidents: FindIncidentSummary[];
	total_estimated: number;
}

export async function runThrashFind(
	input: FindInput,
	corpus: Corpus,
): Promise<FindOutput> {
	if (input.signals) {
		for (const s of input.signals) {
			if (!SIGNAL_KINDS.includes(s as SignalKind)) {
				throw new Error(`unknown signal: ${s}`);
			}
		}
	}
	const sinceMs = parseSince(input.since);
	const minScore = input.min_score ?? 0;
	const limit = input.limit ?? 20;

	const matching: Incident[] = [];
	for (const inc of corpus.incidents) {
		if (input.signals && !input.signals.some((s) => inc.signals[s] > 0)) continue;
		if (input.project && !inc.project.includes(input.project)) continue;
		if (sinceMs !== undefined) {
			const t = Date.parse(inc.started_at);
			if (!Number.isFinite(t) || t < sinceMs) continue;
		}
		if (inc.score < minScore) continue;
		matching.push(inc);
	}
	matching.sort((a, b) => b.score - a.score);
	const limited = matching.slice(0, limit);

	return {
		total_estimated: matching.length,
		incidents: limited.map((inc) => ({
			incident_id: inc.incident_id,
			project: inc.project,
			session_id: inc.session_id,
			started_at: inc.started_at,
			duration_seconds: inc.duration_seconds,
			score: inc.score,
			primary_signal: inc.primary_signal,
			signals: inc.signals,
			file_paths: inc.file_paths,
			tool_calls: inc.tool_calls,
			failed_tool_calls: inc.failed_tool_calls,
			summary: inc.summary,
		})),
	};
}

function parseSince(input: string | undefined): number | undefined {
	if (!input) return undefined;
	// "7d" / "24h" / "90m" shorthand
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

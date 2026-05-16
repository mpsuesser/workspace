/**
 * pi-thrash-lint extension entry point.
 *
 * Registers four tools the LLM can call to mine past pi sessions for
 * agent-thrash patterns and surface lint-rule candidates:
 *
 *   1. thrash_find    — list ranked incidents (filter by signal/project/time)
 *   2. thrash_inspect — structured event trace for one incident
 *   3. thrash_cluster — group incidents by signal/tool/extension/glob/project
 *   4. thrash_stats   — corpus calibration numbers (failure rates, totals)
 *
 * The detection layer is pure and unit-tested. This file is the thin
 * adapter that loads the corpus once per command/tool invocation.
 *
 * See README.md for the design rationale and lint-rule extraction
 * workflow.
 */
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Type, type Static } from "typebox";
import { buildCorpus, discoverSessionFiles, type Corpus } from "./lib/corpus.ts";
import { SIGNAL_KINDS } from "./lib/types.ts";
import { runThrashFind } from "./tools/find.ts";
import { runThrashInspect } from "./tools/inspect.ts";
import { runThrashCluster } from "./tools/cluster.ts";
import { runThrashStats } from "./tools/stats.ts";

const SIGNAL_ENUM = Type.Union(
	SIGNAL_KINDS.map((k) => Type.Literal(k)),
	{ description: `Closed enum of thrash signal kinds: ${SIGNAL_KINDS.join(", ")}` },
);

const FindParams = Type.Object({
	signals: Type.Optional(
		Type.Array(SIGNAL_ENUM, {
			description: "Filter to incidents that contain ≥1 hit of any of these signals.",
		}),
	),
	project: Type.Optional(
		Type.String({
			description:
				"Substring match against the per-incident project label (last two path segments of cwd).",
		}),
	),
	since: Type.Optional(
		Type.String({
			description:
				'ISO date or relative ("7d", "24h", "30m"). Drop incidents older than this.',
		}),
	),
	min_score: Type.Optional(
		Type.Number({ minimum: 0, maximum: 1, description: "Default 0." }),
	),
	limit: Type.Optional(
		Type.Number({ minimum: 1, maximum: 200, description: "Default 20." }),
	),
});

const InspectParams = Type.Object({
	incident_id: Type.String({
		description: "Opaque incident id returned by thrash_find.",
	}),
	max_events: Type.Optional(
		Type.Number({ minimum: 1, maximum: 500, description: "Default 50." }),
	),
});

const ClusterParams = Type.Object({
	group_by: Type.Union(
		["signal", "tool", "file_extension", "file_glob", "project"].map((k) =>
			Type.Literal(k),
		),
		{ description: "Closed enum of grouping keys." },
	),
	signals: Type.Optional(Type.Array(SIGNAL_ENUM)),
	project: Type.Optional(Type.String()),
	limit: Type.Optional(Type.Number({ minimum: 1, maximum: 100 })),
});

const StatsParams = Type.Object({
	project: Type.Optional(Type.String()),
	since: Type.Optional(Type.String()),
});

export type FindInput = Static<typeof FindParams>;
export type InspectInput = Static<typeof InspectParams>;
export type ClusterInput = Static<typeof ClusterParams>;
export type StatsInput = Static<typeof StatsParams>;

/**
 * Defensive coercion: some LLM tool-call serializers wrap array values
 * in JSON strings (e.g. `"[\"bash_error_retry\"]"`). prepareArguments
 * runs before TypeBox validation so we accept both.
 */
function coerceArrayFields(args: any, fields: string[]): any {
	if (!args || typeof args !== "object") return args;
	const out = { ...args };
	for (const f of fields) {
		const v = out[f];
		if (typeof v === "string") {
			const trimmed = v.trim();
			if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
				try {
					const parsed = JSON.parse(trimmed);
					if (Array.isArray(parsed)) out[f] = parsed;
				} catch {
					// fall through; let TypeBox report the validation error
				}
			}
		}
	}
	return out;
}

function coerceNumberFields(args: any, fields: string[]): any {
	if (!args || typeof args !== "object") return args;
	const out = { ...args };
	for (const f of fields) {
		const v = out[f];
		if (typeof v === "string" && v.trim() !== "") {
			const n = Number(v);
			if (Number.isFinite(n)) out[f] = n;
		}
	}
	return out;
}

export default function thrashLintExtension(pi: ExtensionAPI) {
	let cachedCorpus: Corpus | undefined;
	let cachedAt = 0;
	const CACHE_TTL_MS = 60_000;

	async function getCorpus(): Promise<Corpus> {
		const now = Date.now();
		if (cachedCorpus && now - cachedAt < CACHE_TTL_MS) return cachedCorpus;
		const files = await discoverSessionFiles();
		cachedCorpus = await buildCorpus({ sessionFiles: files });
		cachedAt = now;
		return cachedCorpus;
	}

	pi.registerTool({
		name: "thrash_find",
		label: "Find thrash incidents",
		prepareArguments(args) {
			let a = coerceArrayFields(args, ["signals"]);
			a = coerceNumberFields(a, ["min_score", "limit"]);
			return a;
		},
		description:
			"List ranked agent-thrash incidents across past pi sessions. " +
			"Each incident is a contiguous range of tool calls where the agent " +
			"showed inefficient or repeated behaviour (failed-edit retries, edit " +
			"oscillation, bash error retries, read-edit loops, cascading failures). " +
			"Returns summarised incidents; use thrash_inspect for full event traces.",
		promptSnippet:
			"Find ranked agent-thrash incidents across past sessions; filter by signal, project, or time.",
		parameters: FindParams,
		async execute(_id, params) {
			const corpus = await getCorpus();
			const result = await runThrashFind(params, corpus);
			return {
				content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
				details: result,
			};
		},
	});

	pi.registerTool({
		name: "thrash_inspect",
		label: "Inspect thrash incident",
		prepareArguments(args) {
			return coerceNumberFields(args, ["max_events"]);
		},
		description:
			"Return the structured event trace for one thrash incident, including " +
			"signal annotations. Input: incident_id from thrash_find.",
		promptSnippet: "Drill into a single thrash incident for its annotated event trace.",
		parameters: InspectParams,
		async execute(_id, params) {
			const corpus = await getCorpus();
			const result = await runThrashInspect(params, corpus);
			return {
				content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
				details: result,
			};
		},
	});

	pi.registerTool({
		name: "thrash_cluster",
		label: "Cluster thrash incidents",
		prepareArguments(args) {
			let a = coerceArrayFields(args, ["signals"]);
			a = coerceNumberFields(a, ["limit"]);
			return a;
		},
		description:
			"Group thrash incidents by one of: signal, tool, file_extension, " +
			"file_glob, project. Returns counts and ≤3 representative incident_ids " +
			"per group. Useful for finding patterns worth turning into lint rules.",
		promptSnippet:
			"Group thrash incidents by signal/tool/file/project to find lint-rule candidates.",
		parameters: ClusterParams,
		async execute(_id, params) {
			const corpus = await getCorpus();
			const result = await runThrashCluster(params, corpus);
			return {
				content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
				details: result,
			};
		},
	});

	pi.registerTool({
		name: "thrash_stats",
		label: "Thrash corpus stats",
		description:
			"Report corpus-wide calibration numbers (total sessions, tool calls, " +
			"failure rate, per-tool breakdown, top thrash files and signals).",
		promptSnippet: "Get corpus-wide tool-call failure rates and thrash signal totals.",
		parameters: StatsParams,
		async execute(_id, params) {
			const corpus = await getCorpus();
			const result = await runThrashStats(params, corpus);
			return {
				content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
				details: result,
			};
		},
	});

	pi.registerCommand("thrash-stats", {
		description: "Print thrash corpus stats to the notification area",
		handler: async (_args, ctx) => {
			const corpus = await getCorpus();
			const stats = await runThrashStats({}, corpus);
			ctx.ui.notify(
				`thrash-lint: ${stats.total_sessions} sessions, ${stats.total_tool_calls} tool calls, ${(stats.failure_rate * 100).toFixed(1)}% failure rate`,
				"info",
			);
		},
	});
}

/**
 * One-shot smoke test: run all four tools against the real session corpus
 * on this machine and print compact results. Not a test — exists to verify
 * the extension works end-to-end before wiring it into pi.
 */
import { buildCorpus, discoverSessionFiles } from "../extensions/lib/corpus.ts";
import { runThrashFind } from "../extensions/tools/find.ts";
import { runThrashCluster } from "../extensions/tools/cluster.ts";
import { runThrashStats } from "../extensions/tools/stats.ts";
import { runThrashInspect } from "../extensions/tools/inspect.ts";

async function main() {
	const t0 = Date.now();
	const files = await discoverSessionFiles();
	console.log(`# corpus: ${files.length} session files`);
	const corpus = await buildCorpus({ sessionFiles: files });
	console.log(
		`# parsed: ${corpus.sessions.length} sessions, ${corpus.incidents.length} incidents (${Date.now() - t0}ms)`,
	);

	console.log("\n## thrash_stats");
	const stats = await runThrashStats({}, corpus);
	console.log({
		total_sessions: stats.total_sessions,
		total_tool_calls: stats.total_tool_calls,
		total_failed_tool_calls: stats.total_failed_tool_calls,
		failure_rate: stats.failure_rate.toFixed(3),
		top_thrash_signals: stats.top_thrash_signals,
		top_5_thrash_files: stats.top_thrash_files.slice(0, 5),
		by_tool: Object.fromEntries(
			Object.entries(stats.by_tool)
				.sort((a, b) => b[1].calls - a[1].calls)
				.slice(0, 8),
		),
	});

	console.log("\n## thrash_cluster group_by=signal");
	console.log(await runThrashCluster({ group_by: "signal" }, corpus));

	console.log("\n## thrash_cluster group_by=file_extension");
	console.log(await runThrashCluster({ group_by: "file_extension" }, corpus));

	console.log("\n## thrash_find (top 5)");
	const find = await runThrashFind({ limit: 5 }, corpus);
	console.log({ total_estimated: find.total_estimated });
	for (const inc of find.incidents) {
		console.log(`- [${inc.score.toFixed(2)}] ${inc.primary_signal} ${inc.summary} (${inc.project}) ${inc.incident_id}`);
	}

	if (find.incidents[0]) {
		console.log("\n## thrash_inspect (top incident)");
		const inspect = await runThrashInspect(
			{ incident_id: find.incidents[0].incident_id, max_events: 8 },
			corpus,
		);
		console.log({
			summary: inspect.summary,
			annotations: inspect.annotations,
			events: inspect.events.map((e) => ({
				kind: e.kind,
				tool: e.tool_name,
				err: e.is_error,
				file: e.file_path,
				summary: e.summary,
			})),
		});
	}
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});

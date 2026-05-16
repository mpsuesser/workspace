/**
 * Tool-surface tests.
 *
 * These exist to pin down the LLM-facing DX of the four tools registered
 * by this extension. Each tool is implemented as a pure async function
 * `run(input, deps)` so we can test it with a hand-rolled fixture corpus
 * instead of standing up a real ExtensionAPI.
 *
 * Caller-DX invariants under test:
 *   - thrash_find returns *summarised* incidents (no raw blobs) and an
 *     incident_id suitable for follow-up calls.
 *   - thrash_find supports filtering by signal kind, project, and time.
 *   - thrash_inspect returns a structured event trace for one incident
 *     and refuses unknown ids with a helpful error.
 *   - thrash_cluster groups by one of a fixed set of keys and returns
 *     counts + sample incident_ids per group.
 *   - thrash_stats returns calibration numbers (totals, failure_rate).
 *   - The corpus loader is dep-injectable: we pass a list of session
 *     file paths instead of scanning ~/.pi.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { runThrashFind } from "../tools/find.ts";
import { runThrashInspect } from "../tools/inspect.ts";
import { runThrashCluster } from "../tools/cluster.ts";
import { runThrashStats } from "../tools/stats.ts";
import { buildCorpus } from "../lib/corpus.ts";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const FIX = path.join(HERE, "fixtures");
const ALL_FIXTURES = [
	"failed-edit-retry.jsonl",
	"edit-oscillation.jsonl",
	"bash-error-retry.jsonl",
	"clean-session.jsonl",
].map((f) => path.join(FIX, f));

async function corpus() {
	return buildCorpus({ sessionFiles: ALL_FIXTURES });
}

describe("thrash_find DX", () => {
	it("returns ranked incidents with one-line summaries (no raw content)", async () => {
		const c = await corpus();
		const res = await runThrashFind({}, c);
		assert.ok(res.incidents.length >= 3, `expected ≥3 incidents, got ${res.incidents.length}`);
		for (const inc of res.incidents) {
			assert.equal(typeof inc.incident_id, "string");
			assert.equal(typeof inc.summary, "string");
			assert.ok(inc.summary.length > 0 && inc.summary.length < 200);
			assert.equal(typeof inc.score, "number");
			assert.ok(inc.signals);
			// No raw content fields leaked:
			assert.equal((inc as any).hits, undefined);
			assert.equal((inc as any).raw, undefined);
		}
	});

	it("sorts by score descending by default", async () => {
		const c = await corpus();
		const res = await runThrashFind({}, c);
		const scores = res.incidents.map((i) => i.score);
		const sorted = [...scores].sort((a, b) => b - a);
		assert.deepEqual(scores, sorted);
	});

	it("filters by signal kind", async () => {
		const c = await corpus();
		const res = await runThrashFind({ signals: ["edit_oscillation"] }, c);
		assert.ok(res.incidents.length >= 1);
		for (const inc of res.incidents) {
			assert.ok(
				inc.signals.edit_oscillation > 0,
				`incident ${inc.incident_id} has no edit_oscillation signal`,
			);
		}
	});

	it("filters by project substring match", async () => {
		const c = await corpus();
		const res = await runThrashFind({ project: "proj-a" }, c);
		assert.ok(res.incidents.length >= 1);
		for (const inc of res.incidents) {
			assert.match(inc.project, /proj-a/);
		}
	});

	it("respects min_score and limit", async () => {
		const c = await corpus();
		const a = await runThrashFind({ min_score: 0.99 }, c);
		assert.equal(a.incidents.length, 0);
		const b = await runThrashFind({ limit: 1 }, c);
		assert.equal(b.incidents.length, 1);
	});

	it("returns total_estimated >= incidents.length", async () => {
		const c = await corpus();
		const res = await runThrashFind({ limit: 1 }, c);
		assert.ok(res.total_estimated >= res.incidents.length);
	});

	it("rejects invalid signal names with a clear error", async () => {
		const c = await corpus();
		await assert.rejects(
			() => runThrashFind({ signals: ["bogus_signal" as any] }, c),
			/unknown signal|invalid signal/i,
		);
	});
});

describe("thrash_inspect DX", () => {
	it("returns events with file_path, tool_name, is_error annotations", async () => {
		const c = await corpus();
		const find = await runThrashFind({ signals: ["failed_edit_retry"] }, c);
		const id = find.incidents[0]!.incident_id;
		const res = await runThrashInspect({ incident_id: id }, c);
		assert.equal(res.incident_id, id);
		assert.ok(res.events.length > 0);
		for (const e of res.events) {
			assert.ok(["tool_call", "tool_result", "user", "assistant_text"].includes(e.kind));
			assert.equal(typeof e.entry_id, "string");
			assert.equal(typeof e.summary, "string");
		}
		// At least one event should reference the failing file.
		assert.ok(res.events.some((e) => e.file_path?.includes("auth.ts")));
	});

	it("includes signal annotations on the trace", async () => {
		const c = await corpus();
		const find = await runThrashFind({}, c);
		const id = find.incidents[0]!.incident_id;
		const res = await runThrashInspect({ incident_id: id }, c);
		assert.ok(res.annotations.length > 0);
		for (const a of res.annotations) {
			assert.equal(typeof a.signal, "string");
			assert.equal(typeof a.detail, "string");
		}
	});

	it("errors clearly on unknown incident_id", async () => {
		const c = await corpus();
		await assert.rejects(
			() => runThrashInspect({ incident_id: "nope:nope:nope" }, c),
			/not found|unknown incident/i,
		);
	});

	it("respects max_events truncation with a flag", async () => {
		const c = await corpus();
		const find = await runThrashFind({}, c);
		const id = find.incidents[0]!.incident_id;
		const res = await runThrashInspect({ incident_id: id, max_events: 2 }, c);
		assert.ok(res.events.length <= 2);
		assert.equal(res.truncated, true);
	});
});

describe("thrash_cluster DX", () => {
	it("groups by signal kind and returns counts + samples", async () => {
		const c = await corpus();
		const res = await runThrashCluster({ group_by: "signal" }, c);
		assert.ok(res.groups.length > 0);
		const kinds = res.groups.map((g) => g.key);
		assert.ok(kinds.includes("failed_edit_retry"));
		for (const g of res.groups) {
			assert.ok(g.count > 0);
			assert.ok(g.sample_incident_ids.length > 0);
			assert.ok(g.sample_incident_ids.length <= 3);
		}
	});

	it("groups by file_extension and surfaces .ts", async () => {
		const c = await corpus();
		const res = await runThrashCluster({ group_by: "file_extension" }, c);
		const keys = res.groups.map((g) => g.key);
		assert.ok(keys.includes(".ts"));
	});

	it("groups by tool and surfaces edit and bash", async () => {
		const c = await corpus();
		const res = await runThrashCluster({ group_by: "tool" }, c);
		const keys = res.groups.map((g) => g.key);
		assert.ok(keys.includes("edit"));
		assert.ok(keys.includes("bash"));
	});

	it("rejects unknown group_by values", async () => {
		const c = await corpus();
		await assert.rejects(
			() => runThrashCluster({ group_by: "phase_of_moon" as any }, c),
			/invalid group_by|unknown/i,
		);
	});
});

describe("thrash_stats DX", () => {
	it("returns global totals and a failure rate", async () => {
		const c = await corpus();
		const res = await runThrashStats({}, c);
		assert.ok(res.total_sessions >= 4);
		assert.ok(res.total_tool_calls > 0);
		assert.ok(res.total_failed_tool_calls > 0);
		assert.ok(res.failure_rate >= 0 && res.failure_rate <= 1);
		assert.ok(typeof res.by_tool === "object");
	});

	it("by_tool breakdown reports per-tool failure rates", async () => {
		const c = await corpus();
		const res = await runThrashStats({}, c);
		const edit = res.by_tool.edit;
		assert.ok(edit, "expected an entry for edit");
		assert.ok(edit.failures >= 2);
		assert.ok(edit.failure_rate > 0);
	});

	it("top_thrash_signals is sorted by count desc", async () => {
		const c = await corpus();
		const res = await runThrashStats({}, c);
		const counts = res.top_thrash_signals.map((s) => s.count);
		const sorted = [...counts].sort((a, b) => b - a);
		assert.deepEqual(counts, sorted);
	});
});

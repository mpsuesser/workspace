import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
	RECENT_TERMINAL_RUNS_MAX,
	RECENT_TERMINAL_RUNS_TTL_MS,
	describeTerminalRun,
	hasTerminalRun,
	isTerminalRunState,
	lookupTerminalRun,
	recordTerminalRun,
} from "../../src/runs/background/recent-terminal-runs.ts";
import type { SubagentState } from "../../src/shared/types.ts";

function makeState(): Pick<SubagentState, "recentTerminalRuns"> {
	return {};
}

describe("recent terminal run tracking", () => {
	it("classifies terminal run states", () => {
		assert.equal(isTerminalRunState("complete"), true);
		assert.equal(isTerminalRunState("completed"), true);
		assert.equal(isTerminalRunState("failed"), true);
		assert.equal(isTerminalRunState("paused"), true);
		assert.equal(isTerminalRunState("running"), false);
		assert.equal(isTerminalRunState("queued"), false);
		assert.equal(isTerminalRunState(undefined), false);
	});

	it("records and looks up a finished run by exact id", () => {
		const state = makeState();
		recordTerminalRun(state as SubagentState, {
			runId: "run-abc",
			state: "complete",
			source: "async",
			mode: "single",
			endedAt: 1_000,
			agents: ["worker"],
		});
		const found = lookupTerminalRun(state, "run-abc", 2_000);
		assert.equal(found?.runId, "run-abc");
		assert.equal(found?.state, "complete");
		assert.equal(hasTerminalRun(state, "run-abc", 2_000), true);
	});

	it("normalizes unknown completion states to complete", () => {
		const state = makeState();
		recordTerminalRun(state as SubagentState, {
			runId: "run-x",
			state: "completed",
			source: "foreground",
			mode: "single",
			endedAt: 0,
		});
		assert.equal(lookupTerminalRun(state, "run-x", 1)?.state, "complete");
	});

	it("resolves an unambiguous id prefix but refuses ambiguous ones", () => {
		const state = makeState();
		recordTerminalRun(state as SubagentState, { runId: "abcd1234", state: "failed", source: "async", mode: "parallel", endedAt: 1 });
		assert.equal(lookupTerminalRun(state, "abcd", 2)?.runId, "abcd1234");

		recordTerminalRun(state as SubagentState, { runId: "abcd9999", state: "complete", source: "async", mode: "single", endedAt: 3 });
		assert.equal(lookupTerminalRun(state, "abcd", 4), undefined, "ambiguous prefix must not resolve");
		assert.equal(lookupTerminalRun(state, "abcd1234", 4)?.state, "failed", "exact id still resolves");
	});

	it("expires records past the TTL", () => {
		const state = makeState();
		recordTerminalRun(state as SubagentState, { runId: "old", state: "complete", source: "async", mode: "single", endedAt: 0 });
		assert.equal(lookupTerminalRun(state, "old", RECENT_TERMINAL_RUNS_TTL_MS + 1), undefined);
		assert.equal(state.recentTerminalRuns?.has("old"), false, "expired record is pruned on lookup");
	});

	it("evicts the oldest records beyond the cap", () => {
		const state = makeState();
		for (let i = 0; i < RECENT_TERMINAL_RUNS_MAX + 5; i++) {
			recordTerminalRun(state as SubagentState, { runId: `run-${i}`, state: "complete", source: "async", mode: "single", endedAt: i });
		}
		assert.equal(state.recentTerminalRuns?.size, RECENT_TERMINAL_RUNS_MAX);
		assert.equal(lookupTerminalRun(state, "run-0", RECENT_TERMINAL_RUNS_MAX + 10), undefined, "oldest evicted");
		assert.ok(lookupTerminalRun(state, `run-${RECENT_TERMINAL_RUNS_MAX + 4}`, RECENT_TERMINAL_RUNS_MAX + 10), "newest retained");
	});

	it("refreshes recency when a run id is recorded again", () => {
		const state = makeState();
		recordTerminalRun(state as SubagentState, { runId: "a", state: "running" as never, source: "async", mode: "single", endedAt: 1 });
		recordTerminalRun(state as SubagentState, { runId: "b", state: "complete", source: "async", mode: "single", endedAt: 2 });
		recordTerminalRun(state as SubagentState, { runId: "a", state: "failed", source: "async", mode: "single", endedAt: 3 });
		const keys = [...(state.recentTerminalRuns?.keys() ?? [])];
		assert.deepEqual(keys, ["b", "a"], "re-recorded run moves to most-recent position");
	});

	it("describes a finished run with actionable guidance", () => {
		const text = describeTerminalRun({
			runId: "run-abc",
			state: "complete",
			source: "foreground",
			mode: "single",
			endedAt: 0,
			agents: ["worker"],
		});
		assert.match(text, /Run: run-abc/);
		assert.match(text, /State: completed \(worker\)/);
		assert.match(text, /already finished/);
		assert.match(text, /No further status action is needed\./);
	});
});

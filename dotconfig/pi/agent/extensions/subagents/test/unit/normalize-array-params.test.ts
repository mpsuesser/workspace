import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { normalizeStringifiedArrayParams } from "../../src/shared/normalize-array-params.ts";

describe("normalizeStringifiedArrayParams", () => {
	it("returns params unchanged when tasks/chain are already arrays", () => {
		const input = {
			tasks: [{ agent: "reviewer", task: "review" }],
			other: "keep",
		};
		const result = normalizeStringifiedArrayParams(input);
		assert.equal(result.ok, true);
		if (result.ok) {
			// Should be referentially the same object (no copy) when nothing changes.
			assert.equal(result.params, input);
		}
	});

	it("returns params unchanged when no recognized fields are present", () => {
		const input = { agent: "reviewer", task: "do thing" };
		const result = normalizeStringifiedArrayParams(input);
		assert.equal(result.ok, true);
		if (result.ok) {
			assert.equal(result.params, input);
		}
	});

	it("parses string-form tasks into an array (codex stringify case)", () => {
		const input = {
			tasks: JSON.stringify([
				{ agent: "reviewer", task: "cluster 1" },
				{ agent: "reviewer", task: "cluster 2" },
			]),
			cwd: "/tmp",
		};
		const result = normalizeStringifiedArrayParams(input);
		assert.equal(result.ok, true);
		if (result.ok) {
			assert.notEqual(result.params, input, "should return a new object when normalizing");
			assert.ok(Array.isArray(result.params.tasks));
			assert.equal((result.params.tasks as unknown[]).length, 2);
			assert.deepEqual((result.params.tasks as unknown[])[0], { agent: "reviewer", task: "cluster 1" });
			assert.equal(result.params.cwd, "/tmp");
		}
	});

	it("parses string-form chain into an array", () => {
		const input = {
			chain: JSON.stringify([
				{ agent: "planner", task: "plan {task}" },
				{ agent: "implementer", task: "do {previous}" },
			]),
		};
		const result = normalizeStringifiedArrayParams(input);
		assert.equal(result.ok, true);
		if (result.ok) {
			assert.ok(Array.isArray(result.params.chain));
			assert.equal((result.params.chain as unknown[]).length, 2);
		}
	});

	it("normalizes both tasks and chain in the same call", () => {
		const input = {
			tasks: JSON.stringify([{ agent: "a", task: "t" }]),
			chain: JSON.stringify([{ agent: "b", task: "u" }]),
		};
		const result = normalizeStringifiedArrayParams(input);
		assert.equal(result.ok, true);
		if (result.ok) {
			assert.ok(Array.isArray(result.params.tasks));
			assert.ok(Array.isArray(result.params.chain));
		}
	});

	it("drops empty-string tasks/chain so downstream sees no array", () => {
		const input = { tasks: "", chain: "   " };
		const result = normalizeStringifiedArrayParams(input);
		assert.equal(result.ok, true);
		if (result.ok) {
			assert.equal((result.params as Record<string, unknown>).tasks, undefined);
			assert.equal((result.params as Record<string, unknown>).chain, undefined);
		}
	});

	it("returns a friendly error for invalid JSON", () => {
		const input = { tasks: "[{agent:reviewer" };
		const result = normalizeStringifiedArrayParams(input);
		assert.equal(result.ok, false);
		if (!result.ok) {
			assert.match(result.error, /Parameter 'tasks' arrived as a string/);
			assert.match(result.error, /was not valid JSON/);
		}
	});

	it("returns a friendly error when string parses to non-array", () => {
		const input = { tasks: JSON.stringify({ agent: "reviewer", task: "x" }) };
		const result = normalizeStringifiedArrayParams(input);
		assert.equal(result.ok, false);
		if (!result.ok) {
			assert.match(result.error, /parsed to a object, not an array/);
		}
	});

	it("does not mutate the input object", () => {
		const tasksJson = JSON.stringify([{ agent: "a", task: "t" }]);
		const input = { tasks: tasksJson };
		normalizeStringifiedArrayParams(input);
		assert.equal(input.tasks, tasksJson);
	});
});

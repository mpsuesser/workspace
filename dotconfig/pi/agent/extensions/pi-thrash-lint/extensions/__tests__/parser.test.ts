/**
 * Parser unit tests.
 *
 * The parser's job: take a session JSONL file path and produce a flat,
 * ordered Event[] with stable IDs and just the fields the detector needs.
 * It must explode assistant tool calls out of the assistant message and
 * preserve original ordering by entry timestamp.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import type { Event } from "../lib/types.ts";
import { parseSessionFile } from "../lib/parser.ts";
void ({} as Event); // keep import for type-only usage

const HERE = path.dirname(fileURLToPath(import.meta.url));
const FIX = path.join(HERE, "fixtures");

describe("parseSessionFile", () => {
	it("returns header metadata from the first line", async () => {
		const result = await parseSessionFile(path.join(FIX, "clean-session.jsonl"));
		assert.equal(result.session.id, "fx-clean");
		assert.equal(result.session.cwd, "/tmp/proj-d");
		assert.equal(result.session.version, 3);
		assert.equal(result.session.path, path.join(FIX, "clean-session.jsonl"));
	});

	it("emits one event per assistant tool call (not per assistant message)", async () => {
		const result = await parseSessionFile(path.join(FIX, "failed-edit-retry.jsonl"));
		const toolCalls = result.events.filter((e) => e.kind === "tool_call");
		assert.equal(toolCalls.length, 3, "three edit attempts should produce three tool_call events");
		assert.deepEqual(
			toolCalls.map((c) => c.tool_call_id),
			["tc_1", "tc_2", "tc_3"],
		);
	});

	it("pairs each tool_call with its tool_result and copies is_error", async () => {
		const result = await parseSessionFile(path.join(FIX, "failed-edit-retry.jsonl"));
		const results = result.events.filter((e) => e.kind === "tool_result");
		assert.equal(results.length, 3);
		assert.deepEqual(
			results.map((r) => ({ id: r.tool_call_id, err: r.is_error })),
			[
				{ id: "tc_1", err: true },
				{ id: "tc_2", err: true },
				{ id: "tc_3", err: false },
			],
		);
	});

	it("extracts file_path from edit/read/write tool calls and results", async () => {
		const result = await parseSessionFile(path.join(FIX, "failed-edit-retry.jsonl"));
		const editCalls = result.events.filter(
			(e): e is Extract<typeof e, { kind: "tool_call" }> =>
				e.kind === "tool_call" && e.tool_name === "edit",
		);
		assert.ok(editCalls.length > 0);
		for (const call of editCalls) {
			assert.equal(call.file_path, "/tmp/proj-a/auth.ts");
		}
	});

	it("preserves chronological order by timestamp", async () => {
		const result = await parseSessionFile(path.join(FIX, "edit-oscillation.jsonl"));
		const ts = result.events.map((e) => e.ts);
		const sorted = [...ts].sort((a, b) => a - b);
		assert.deepEqual(ts, sorted, "events must be in monotonic timestamp order");
	});

	it("exposes bash exit codes from tool_result details", async () => {
		const result = await parseSessionFile(path.join(FIX, "bash-error-retry.jsonl"));
		const bashResults = result.events.filter(
			(e): e is Extract<typeof e, { kind: "tool_result" }> =>
				e.kind === "tool_result" && e.tool_name === "bash",
		);
		assert.deepEqual(
			bashResults.map((r) => r.exit_code),
			[1, 1, 0],
		);
	});

	it("does not invent events for a clean session beyond what exists", async () => {
		const result = await parseSessionFile(path.join(FIX, "clean-session.jsonl"));
		// 1 user + 1 assistant_text + 1 tool_call + 1 tool_result = 4
		assert.equal(result.events.length, 4);
		assert.deepEqual(
			result.events.map((e) => e.kind),
			["user", "tool_call", "tool_result", "assistant_text"],
		);
	});

	it("tolerates non-existent files gracefully", async () => {
		await assert.rejects(
			() => parseSessionFile("/nonexistent/session.jsonl"),
			/ENOENT|no such file/i,
		);
	});
});

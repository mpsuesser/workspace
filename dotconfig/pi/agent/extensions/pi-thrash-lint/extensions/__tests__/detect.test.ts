/**
 * Detector unit tests.
 *
 * The detector takes a ParsedSession and produces Incident[].
 * Each fixture isolates one signal so the detector can be tested
 * without interference, and a clean session must produce zero incidents.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { parseSessionFile } from "../lib/parser.ts";
import { detectIncidents } from "../lib/detect.ts";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const FIX = path.join(HERE, "fixtures");

async function incidentsFor(fixture: string) {
	const parsed = await parseSessionFile(path.join(FIX, fixture));
	return detectIncidents(parsed);
}

describe("detectIncidents — failed_edit_retry", () => {
	it("detects failed edit followed by retry on same file", async () => {
		const incidents = await incidentsFor("failed-edit-retry.jsonl");
		assert.equal(incidents.length, 1);
		const inc = incidents[0]!;
		assert.equal(inc.primary_signal, "failed_edit_retry");
		assert.ok(
			inc.signals.failed_edit_retry >= 2,
			`expected ≥2 failed_edit_retry hits, got ${inc.signals.failed_edit_retry}`,
		);
		assert.ok(inc.file_paths.includes("/tmp/proj-a/auth.ts"));
	});

	it("incident_id encodes session and entry range", async () => {
		const incidents = await incidentsFor("failed-edit-retry.jsonl");
		const inc = incidents[0]!;
		assert.match(inc.incident_id, /^fx-failed-edit-retry:[a-z0-9_]+:[a-z0-9_]+$/i);
	});

	it("incident summary names the file and the signal", async () => {
		const incidents = await incidentsFor("failed-edit-retry.jsonl");
		const inc = incidents[0]!;
		assert.match(inc.summary, /auth\.ts/);
		assert.match(inc.summary, /retry|retries|failed/i);
	});
});

describe("detectIncidents — edit_oscillation", () => {
	it("flags 4+ edits to the same file within a short window", async () => {
		const incidents = await incidentsFor("edit-oscillation.jsonl");
		assert.equal(incidents.length, 1);
		const inc = incidents[0]!;
		assert.equal(inc.primary_signal, "edit_oscillation");
		assert.ok(inc.signals.edit_oscillation >= 1);
		assert.ok(inc.file_paths.includes("/tmp/proj-b/config.ts"));
		assert.ok(inc.tool_calls >= 4);
	});
});

describe("detectIncidents — bash_error_retry", () => {
	it("detects bash with non-zero exit followed by similar bash retry", async () => {
		const incidents = await incidentsFor("bash-error-retry.jsonl");
		assert.equal(incidents.length, 1);
		const inc = incidents[0]!;
		assert.equal(inc.primary_signal, "bash_error_retry");
		assert.ok(inc.signals.bash_error_retry >= 1);
		assert.ok(inc.failed_tool_calls >= 2);
	});
});

describe("detectIncidents — clean session", () => {
	it("returns zero incidents when there is no thrash", async () => {
		const incidents = await incidentsFor("clean-session.jsonl");
		assert.deepEqual(incidents, []);
	});
});

describe("detectIncidents — scoring", () => {
	it("score grows with more hits", async () => {
		const a = (await incidentsFor("failed-edit-retry.jsonl"))[0]!;
		const b = (await incidentsFor("clean-session.jsonl"))[0];
		assert.ok(a.score > 0);
		assert.equal(b, undefined);
	});

	it("score is bounded in [0, 1]", async () => {
		const all = [
			...(await incidentsFor("failed-edit-retry.jsonl")),
			...(await incidentsFor("edit-oscillation.jsonl")),
			...(await incidentsFor("bash-error-retry.jsonl")),
		];
		for (const inc of all) {
			assert.ok(inc.score >= 0 && inc.score <= 1, `score out of range: ${inc.score}`);
		}
	});
});

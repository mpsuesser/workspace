import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, it } from "node:test";
import { discoverAgents, discoverAgentsAll } from "../../src/agents/agents.ts";
import { handleList } from "../../src/agents/agent-management.ts";

let tempHome = "";
let tempProject = "";
const originalHome = process.env.HOME;
const originalUserProfile = process.env.USERPROFILE;

function writeAgent(filePath: string, name: string, description: string): void {
	fs.mkdirSync(path.dirname(filePath), { recursive: true });
	fs.writeFileSync(filePath, `---\nname: ${name}\ndescription: ${description}\n---\n\n${description} prompt.\n`, "utf-8");
}

function readText(result: { content: Array<{ type: string; text?: string }> }): string {
	const first = result.content[0];
	assert.ok(first);
	assert.equal(first.type, "text");
	assert.equal(typeof first.text, "string");
	return first.text;
}

describe("agent discovery", () => {
	beforeEach(() => {
		tempHome = fs.mkdtempSync(path.join(os.tmpdir(), "pi-subagents-discovery-home-"));
		tempProject = fs.mkdtempSync(path.join(os.tmpdir(), "pi-subagents-discovery-project-"));
		process.env.HOME = tempHome;
		process.env.USERPROFILE = tempHome;
	});

	afterEach(() => {
		if (originalHome === undefined) delete process.env.HOME;
		else process.env.HOME = originalHome;
		if (originalUserProfile === undefined) delete process.env.USERPROFILE;
		else process.env.USERPROFILE = originalUserProfile;
		fs.rmSync(tempHome, { recursive: true, force: true });
		fs.rmSync(tempProject, { recursive: true, force: true });
	});

	it("does not expose any packaged built-in agents", () => {
		const discovered = discoverAgentsAll(tempProject);
		assert.deepEqual(discovered.builtin, []);
		assert.deepEqual(discoverAgents(tempProject, "both").agents, []);
	});

	it("lists only agents discovered from user and project Markdown files", () => {
		writeAgent(path.join(tempHome, ".pi", "agent", "agents", "user-helper.md"), "helper", "User helper");
		writeAgent(path.join(tempProject, ".pi", "agents", "project-helper.md"), "helper", "Project helper");
		writeAgent(path.join(tempProject, ".pi", "agents", "project-only.md"), "project-only", "Project only");

		const runtime = discoverAgents(tempProject, "both").agents;
		assert.deepEqual(runtime.map((agent) => `${agent.name}:${agent.source}`).sort(), ["helper:project", "project-only:project"]);

		const text = readText(handleList({}, { cwd: tempProject, modelRegistry: { getAvailable: () => [] } }));
		assert.match(text, /- helper \(project\): Project helper/);
		assert.match(text, /- project-only \(project\): Project only/);
		assert.doesNotMatch(text, /\(builtin/);
	});
});

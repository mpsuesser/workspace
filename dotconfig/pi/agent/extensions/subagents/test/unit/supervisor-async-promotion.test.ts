import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { dispatchedAgentsCanContactSupervisor } from "../../src/runs/foreground/subagent-executor.ts";
import { shouldPromoteForegroundRunForSupervisor } from "../../src/runs/background/top-level-async.ts";
import type { AgentConfig } from "../../src/agents/agents.ts";

const base = {
	enabled: true,
	depth: 0,
	intercomBridgeActive: true,
	asyncAvailable: true,
	wouldRunForeground: true,
	isClarify: false,
	dispatchedAgentsCanContactSupervisor: true,
};

describe("shouldPromoteForegroundRunForSupervisor", () => {
	it("promotes a top-level foreground run whose agents can contact the supervisor", () => {
		assert.equal(shouldPromoteForegroundRunForSupervisor(base), true);
	});

	it("does not promote when any gate is unmet", () => {
		assert.equal(shouldPromoteForegroundRunForSupervisor({ ...base, enabled: false }), false, "config opt-out");
		assert.equal(shouldPromoteForegroundRunForSupervisor({ ...base, depth: 1 }), false, "nested run");
		assert.equal(shouldPromoteForegroundRunForSupervisor({ ...base, intercomBridgeActive: false }), false, "no bridge");
		assert.equal(shouldPromoteForegroundRunForSupervisor({ ...base, asyncAvailable: false }), false, "async unavailable");
		assert.equal(shouldPromoteForegroundRunForSupervisor({ ...base, wouldRunForeground: false }), false, "already async");
		assert.equal(shouldPromoteForegroundRunForSupervisor({ ...base, isClarify: true }), false, "interactive clarify");
		assert.equal(shouldPromoteForegroundRunForSupervisor({ ...base, dispatchedAgentsCanContactSupervisor: false }), false, "no supervisor-capable agent");
	});
});

function agent(name: string, tools?: string[]): AgentConfig {
	return { name, description: name, tools } as AgentConfig;
}

describe("dispatchedAgentsCanContactSupervisor", () => {
	const agents = [
		agent("worker", ["read", "bash", "edit", "contact_supervisor"]),
		agent("scout", ["read", "grep"]),
	];

	it("detects a single supervisor-capable agent", () => {
		assert.equal(dispatchedAgentsCanContactSupervisor({ agent: "worker" }, agents), true);
		assert.equal(dispatchedAgentsCanContactSupervisor({ agent: "scout" }, agents), false);
	});

	it("detects any supervisor-capable agent across parallel tasks", () => {
		assert.equal(dispatchedAgentsCanContactSupervisor({ tasks: [{ agent: "scout", task: "x" }, { agent: "worker", task: "y" }] }, agents), true);
		assert.equal(dispatchedAgentsCanContactSupervisor({ tasks: [{ agent: "scout", task: "x" }] }, agents), false);
	});

	it("detects supervisor-capable agents inside chain steps", () => {
		assert.equal(dispatchedAgentsCanContactSupervisor({ chain: [{ agent: "scout", task: "a" }, { agent: "worker", task: "b" }] }, agents), true);
	});

	it("returns false for an unknown agent name", () => {
		assert.equal(dispatchedAgentsCanContactSupervisor({ agent: "ghost" }, agents), false);
	});
});

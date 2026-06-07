import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { emitControlNotification } from "../../src/runs/foreground/subagent-executor.ts";
import { DEFAULT_CONTROL_CONFIG } from "../../src/runs/shared/subagent-control.ts";
import { SUBAGENT_CONTROL_EVENT, SUBAGENT_CONTROL_INTERCOM_EVENT } from "../../src/shared/types.ts";
import type { ControlEvent } from "../../src/shared/types.ts";

function makeEmitter() {
	const events: Array<{ name: string; payload: unknown }> = [];
	return {
		events,
		pi: { events: { emit: (name: string, payload: unknown) => { events.push({ name, payload }); } } },
	};
}

const intercomBridge = {
	active: true,
	mode: "auto" as never,
	orchestratorTarget: "orchestrator",
	extensionDir: "/tmp/ext",
	instruction: "",
};

function event(reason: ControlEvent["reason"], type: ControlEvent["type"] = "needs_attention"): ControlEvent {
	return { type, to: "needs_attention", ts: 1, runId: "4de2f969", agent: "delegate", index: 7, message: "delegate needs attention (no observed activity for 60s)", reason };
}

describe("emitControlNotification (foreground)", () => {
	it("emits NOTHING to the orchestrator for an idle 'needs attention' foreground event", () => {
		const rec = makeEmitter();
		emitControlNotification({ pi: rec.pi as never, controlConfig: DEFAULT_CONTROL_CONFIG, intercomBridge, event: event("idle") });
		assert.deepEqual(rec.events, [], "a blocking foreground run must not surface stale idle pings");
	});

	it("emits nothing for long-running / threshold foreground events", () => {
		const rec = makeEmitter();
		for (const reason of ["active_long_running", "tool_failures", "time_threshold", "turn_threshold", "token_threshold"] as const) {
			emitControlNotification({ pi: rec.pi as never, controlConfig: DEFAULT_CONTROL_CONFIG, intercomBridge, event: event(reason, reason === "active_long_running" ? "active_long_running" : "needs_attention") });
		}
		assert.deepEqual(rec.events, []);
	});

	it("still surfaces a genuine completion_guard failure on both channels", () => {
		const rec = makeEmitter();
		emitControlNotification({ pi: rec.pi as never, controlConfig: DEFAULT_CONTROL_CONFIG, intercomBridge, event: event("completion_guard") });
		const names = rec.events.map((e) => e.name).sort();
		assert.deepEqual(names, [SUBAGENT_CONTROL_EVENT, SUBAGENT_CONTROL_INTERCOM_EVENT].sort());
	});

	it("respects notifyChannels: no event/intercom channel => no emission even for completion_guard", () => {
		const rec = makeEmitter();
		emitControlNotification({
			pi: rec.pi as never,
			controlConfig: { ...DEFAULT_CONTROL_CONFIG, notifyChannels: ["async"] },
			intercomBridge,
			event: event("completion_guard"),
		});
		assert.deepEqual(rec.events, []);
	});
});

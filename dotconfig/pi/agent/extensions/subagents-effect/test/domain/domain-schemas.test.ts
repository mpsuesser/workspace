import { assert, describe, expect, it } from "vitest";
import * as Arr from "effect/Array";
import * as Option from "effect/Option";
import * as Schema from "effect/Schema";
import { AcceptancePolicy } from "../../src/domain/acceptance.ts";
import { ExtensionConfig } from "../../src/domain/config.ts";
import { DecodeInvocationError } from "../../src/domain/errors.ts";
import { JsonPointer, OutputName, RunId, RuntimeAgentName } from "../../src/domain/ids.ts";
import { ChainLaunch, ParallelLaunch, SingleLaunch, SubagentInvocation } from "../../src/domain/invocation.ts";
import { ChildEvent } from "../../src/domain/child-protocol.ts";
import { RunEvent } from "../../src/domain/run-events.ts";
import { WorkflowGraphNode } from "../../src/domain/results.ts";
import { AssistantContextMessage, ContextMessage } from "../../src/domain/session-context.ts";

const decode = Schema.decodeUnknownSync;

describe("domain ids", () => {
	it("decodes non-empty branded ids", () => {
		const runId = decode(RunId)("run-123");
		expect(runId).toBe("run-123");
	});

	it("rejects empty branded ids", () => {
		expect(() => decode(RuntimeAgentName)("")).toThrow();
	});

	it("validates output names", () => {
		expect(decode(OutputName)("review_findings-1")).toBe("review_findings-1");
		expect(() => decode(OutputName)("1-not-valid")).toThrow();
	});

	it("validates RFC 6901 JSON pointers", () => {
		Arr.forEach(["", "/items", "/items/0", "/a~1b", "/a~0b"], (pointer) => {
			expect(decode(JsonPointer)(pointer)).toBe(pointer);
		});

		Arr.forEach(["foo", "/a~", "/a~2"], (pointer) => {
			expect(() => decode(JsonPointer)(pointer)).toThrow();
		});
	});
});

describe("invocation schemas", () => {
	it("decodes single launch defaults and absent values as Option", () => {
		const launch = decode(SingleLaunch)({ kind: "single", agent: "worker" });
		expect(launch.kind).toBe("single");
		expect(launch.agent).toBe("worker");
		expect(launch.async).toBe(false);
		expect(launch.agentScope).toBe("both");
		expect(Option.isNone(launch.task)).toBe(true);
	});

	it("decodes chain launch with a dynamic fanout-shaped step", () => {
		const launch = decode(ChainLaunch)({
			kind: "chain",
			chain: [
				{ agent: "planner", task: "plan" },
				{
					expand: { from: { output: "items", path: "/items" }, maxItems: 4 },
					parallel: { agent: "worker", task: "handle {item}" },
					collect: { as: "results" }
				}
			]
		});
		expect(launch.kind).toBe("chain");
		expect(launch.chain.length).toBe(2);
	});

	it("rejects empty parallel task arrays", () => {
		expect(() => decode(ParallelLaunch)({ kind: "parallel", tasks: [] })).toThrow();
	});

	it("decodes management actions through the unified invocation union", () => {
		const invocation = decode(SubagentInvocation)({ kind: "doctor" });
		expect(invocation.kind).toBe("doctor");
	});
});

describe("config and acceptance schemas", () => {
	it("applies extension config decoding defaults", () => {
		const config = decode(ExtensionConfig)({});
		expect(config.asyncByDefault).toBe(false);
		expect(config.forceTopLevelAsync).toBe(false);
		expect(config.maxSubagentDepth).toBe(1);
		expect(config.parallel.concurrency).toBe(4);
		expect(config.artifacts.maxOutputLines).toBe(2000);
		expect(config.control.failedToolAttemptsBeforeAttention).toBe(3);
	});

	it("decodes acceptance policy defaults", () => {
		const policy = decode(AcceptancePolicy)({});
		expect(policy.level).toBe("auto");
		expect(policy.criteria).toEqual([]);
		expect(policy.verify).toEqual([]);
	});
});

describe("session context and event schemas", () => {
	it("decodes assistant messages with signed thinking and tool calls", () => {
		const message = decode(ContextMessage)({
			role: "assistant",
			provider: "anthropic",
			api: "anthropic-messages",
			model: "claude-opus-4-7",
			content: [
				{ type: "thinking", thinking: "reasoning", thinkingSignature: "opaque" },
				{ type: "toolCall", id: "toolu_1", name: "subagent", arguments: { agent: "worker" } }
			]
		});
		assert(message instanceof AssistantContextMessage, "expected assistant message");
		expect(message.content).toHaveLength(2);
	});

	it("rejects unknown context message roles", () => {
		expect(() => decode(ContextMessage)({ role: "alien", content: "hello" })).toThrow();
	});

	it("decodes child protocol events", () => {
		const event = decode(ChildEvent)({ kind: "stdoutLine", line: "hello" });
		expect(event.kind).toBe("stdoutLine");
	});

	it("decodes run-created events with DateTime timestamps", () => {
		const event = decode(RunEvent)({
			type: "runCreated",
			runId: "run-abc",
			mode: "single",
			cwd: "/tmp/project",
			createdAt: "2026-06-01T00:00:00.000Z"
		});
		expect(event.type).toBe("runCreated");
		expect(event.runId).toBe("run-abc");
	});

	it("restricts control notification channels on run events", () => {
		const event = decode(RunEvent)({
			type: "controlNoticeEmitted",
			runId: "run-abc",
			event: {
				type: "needs_attention",
				to: "needs_attention",
				ts: "2026-06-01T00:00:00.000Z",
				agent: "worker",
				runId: "run-abc",
				message: "worker needs attention"
			},
			emittedAt: "2026-06-01T00:00:01.000Z",
			channels: ["event", "intercom"]
		});
		expect(event.type).toBe("controlNoticeEmitted");
		expect(() =>
			decode(RunEvent)({
				type: "controlNoticeEmitted",
				runId: "run-abc",
				event: {
					type: "needs_attention",
					to: "needs_attention",
					ts: "2026-06-01T00:00:00.000Z",
					agent: "worker",
					runId: "run-abc",
					message: "worker needs attention"
				},
				emittedAt: "2026-06-01T00:00:01.000Z",
				channels: ["email"]
			})
		).toThrow();
	});

	it("decodes workflow graph nodes recursively", () => {
		const node = decode(WorkflowGraphNode)({
			id: "root",
			kind: "parallel-group",
			label: "Parallel work",
			status: "running",
			children: [{ id: "child", kind: "agent", label: "Worker", status: "pending" }]
		});
		assert(Option.isSome(node.children), "expected recursive children");
		expect(node.children.value).toHaveLength(1);
		expect(() =>
			decode(WorkflowGraphNode)({
				id: "root",
				kind: "parallel-group",
				label: "Parallel work",
				status: "running",
				children: [{ id: 1, kind: "agent", label: "Worker", status: "pending" }]
			})
		).toThrow();
	});
});

describe("typed errors", () => {
	it("constructs public tagged errors with a message", () => {
		const error = new DecodeInvocationError({ message: "bad input" });
		expect(error._tag).toBe("DecodeInvocationError");
		expect(error.message).toBe("bad input");
	});
});

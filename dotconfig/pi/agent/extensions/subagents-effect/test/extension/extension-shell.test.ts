import { assert, describe, expect, it } from "vitest";
import type { Static } from "typebox";
import { registerSubagentsEffectExtension } from "../../src/extension/index.ts";
import type { SubagentEffectParameters } from "../../src/services/extension-registrar.ts";
import { PlaceholderSubagentToolDetails } from "../../src/services/subagent-tool.ts";
import type {
	PiCommandDefinition,
	PiHostApi,
	PiSessionShutdownHandler,
	PiToolDefinition
} from "../../src/services/pi-host.ts";

class FakePi implements PiHostApi {
	readonly tools: PiToolDefinition[] = [];
	readonly commands = new Map<string, PiCommandDefinition>();
	readonly shutdownHandlers: PiSessionShutdownHandler[] = [];
	readonly notifications: string[] = [];
	private sessionName: string | undefined;

	registerTool(definition: PiToolDefinition): void {
		this.tools.push(definition);
	}

	registerCommand(name: string, definition: PiCommandDefinition): void {
		this.commands.set(name, definition);
	}

	on(event: "session_shutdown", handler: PiSessionShutdownHandler): void {
		if (event === "session_shutdown") this.shutdownHandlers.push(handler);
	}

	sendMessage(): void {}

	sendUserMessage(): void {}

	setSessionName(name: string): void {
		this.sessionName = name;
	}

	getSessionName(): string | undefined {
		return this.sessionName;
	}

	makeContext() {
		return {
			cwd: "/tmp/subagents-effect-test",
			hasUI: true,
			signal: undefined,
			sessionManager: {
				getSessionFile: () => "/tmp/subagents-effect-test/session.jsonl"
			},
			ui: {
				notify: (message: string) => {
					this.notifications.push(message);
				}
			}
		};
	}
}

describe("subagents-effect extension shell", () => {
	it("registers the placeholder tool and doctor command", async () => {
		const pi = new FakePi();

		await registerSubagentsEffectExtension(pi);

		expect(pi.tools.map((tool) => tool.name)).toEqual(["subagent_effect"]);
		expect(pi.commands.has("subagents-effect-doctor")).toBe(true);
		expect(pi.shutdownHandlers).toHaveLength(1);
	});

	it("runs placeholder tool calls through the managed runtime", async () => {
		const pi = new FakePi();
		await registerSubagentsEffectExtension(pi);
		const tool = pi.tools[0];
		assert(tool !== undefined, "expected subagent_effect tool registration");

		const result = await tool.execute(
			"tool-1",
			{ agent: "reviewer", task: "smoke test" } satisfies Static<typeof SubagentEffectParameters>,
			undefined,
			undefined,
			pi.makeContext()
		);

		expect(result.content[0]?.type).toBe("text");
		expect(result.content[0]?.text).toContain("ManagedRuntime shell");
		assert(result.details instanceof PlaceholderSubagentToolDetails, "expected placeholder details");
		expect(result.details.status).toBe("placeholder");
		expect(result.terminate).toBe(true);
	});

	it("runs the doctor command and disposes on shutdown", async () => {
		const pi = new FakePi();
		await registerSubagentsEffectExtension(pi);
		const command = pi.commands.get("subagents-effect-doctor");
		assert(command !== undefined, "expected doctor command registration");

		await command.handler("", pi.makeContext());
		expect(pi.notifications[0]).toContain("subagents-effect doctor");

		const shutdown = pi.shutdownHandlers[0];
		assert(shutdown !== undefined, "expected shutdown handler registration");
		await shutdown({ type: "session_shutdown", reason: "reload" }, pi.makeContext());

		await expect(command.handler("", pi.makeContext())).rejects.toThrow();
	});
});

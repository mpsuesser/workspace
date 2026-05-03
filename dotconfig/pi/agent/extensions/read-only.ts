import { Effect } from "effect";
import { makeExtension, onBeforeAgentStart, onSessionShutdown, onSessionStart, onToolCall, PiApi, PiContext } from "effect-pi";

import { createModeToggle, formatModeLabel, type ModeToggle } from "./pi-mode-toggler/index.ts";

const READ_ONLY_STATUS = formatModeLabel("read-only", "#800000");
const READ_ONLY_PROMPT = [
	"Read-only mode is active.",
	"Do not call the built-in write or edit tools.",
	"Use read-only tools only unless the user explicitly asks to turn read-only mode off.",
].join(" ");

let mode: ModeToggle | undefined;

export default makeExtension({
	id: "read-only",
	onLoad: Effect.gen(function* () {
		const pi = yield* PiApi;
		mode = createModeToggle(pi.raw, {
			id: "read-only",
			color: "#800000",
			statusText: READ_ONLY_STATUS,
			description: "Block the built-in write and edit tools",
			persistence: {
				scope: "session",
			},
		});
	}),
	handlers: [
		onSessionStart(() =>
			Effect.gen(function* () {
				const ctx = yield* PiContext;
				mode?.onSessionStart(ctx.raw);
			}),
		),
		onBeforeAgentStart((event) => Effect.sync(() => mode?.beforeAgentStart(event, READ_ONLY_PROMPT))),
		onToolCall((event) =>
			Effect.sync(() => {
				if (!mode?.isEnabled()) return;
				if (event.toolName !== "write" && event.toolName !== "edit") return;

				return {
					block: true,
					reason: "Read-only mode is active. Press Tab and toggle read-only off.",
				};
			}),
		),
		onSessionShutdown(() =>
			Effect.gen(function* () {
				const ctx = yield* PiContext;
				mode?.onSessionShutdown(ctx.raw);
			}),
		),
	],
});

import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

import { createModeToggle, formatModeLabel } from "./pi-mode-toggler/index.ts";

const READ_ONLY_STATUS = formatModeLabel("read-only", "#800000");
const READ_ONLY_PROMPT = [
	"Read-only mode is active.",
	"Do not call the built-in write or edit tools.",
	"Use read-only tools only unless the user explicitly asks to turn read-only mode off.",
].join(" ");

export default function readOnlyExtension(pi: ExtensionAPI) {
	const mode = createModeToggle(pi, {
		id: "read-only",
		color: "#800000",
		statusText: READ_ONLY_STATUS,
		description: "Block the built-in write and edit tools",
		persistence: {
			scope: "session",
		},
	});

	pi.on("session_start", async (_event, ctx) => {
		mode.onSessionStart(ctx);
	});

	pi.on("before_agent_start", async (event) => {
		return mode.beforeAgentStart(event, READ_ONLY_PROMPT);
	});

	pi.on("tool_call", async (event) => {
		if (!mode.isEnabled()) return;
		if (event.toolName !== "write" && event.toolName !== "edit") return;

		return {
			block: true,
			reason: "Read-only mode is active. Press Option+P and toggle read-only off.",
		};
	});

	pi.on("session_shutdown", async (_event, ctx) => {
		mode.onSessionShutdown(ctx);
	});
}

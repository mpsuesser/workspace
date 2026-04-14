import type { ExtensionAPI, ExtensionContext } from "@mariozechner/pi-coding-agent";

const STATUS_KEY = "read-only";
const READ_ONLY_STATUS = "\x1b[1;38;2;128;0;0mread-only\x1b[0m";
const READ_ONLY_PROMPT = [
	"Read-only mode is active.",
	"Do not call the built-in write or edit tools.",
	"Use read-only tools only unless the user explicitly asks to turn read-only mode off.",
].join(" ");

function syncStatus(enabled: boolean, ctx: ExtensionContext): void {
	ctx.ui.setStatus(STATUS_KEY, enabled ? READ_ONLY_STATUS : undefined);
}

function getStatusMessage(enabled: boolean): string {
	return `Read-only mode ${enabled ? "enabled" : "disabled"}`;
}

export default function readOnlyExtension(pi: ExtensionAPI) {
	let enabled = false;
	let lastPromptEnabled: boolean | undefined;

	function setEnabled(nextEnabled: boolean, ctx: ExtensionContext): void {
		enabled = nextEnabled;
		syncStatus(enabled, ctx);
	}

	function toggle(ctx: ExtensionContext): void {
		setEnabled(!enabled, ctx);
		ctx.ui.notify(getStatusMessage(enabled), "info");
	}

	pi.on("session_start", async (_event, ctx) => {
		syncStatus(enabled, ctx);
		lastPromptEnabled = ctx.sessionManager
			.getBranch()
			.some((entry) => entry.type === "message" && entry.message.role === "user")
			? enabled
			: undefined;
	});

	pi.on("before_agent_start", async (event) => {
		const statusChanged = lastPromptEnabled !== undefined && lastPromptEnabled !== enabled;
		lastPromptEnabled = enabled;

		if (!enabled && !statusChanged) return;

		return {
			...(statusChanged
				? {
						message: {
							customType: STATUS_KEY,
							content: getStatusMessage(enabled),
							display: true,
						},
					}
				: {}),
			...(enabled ? { systemPrompt: `${event.systemPrompt}\n\n${READ_ONLY_PROMPT}` } : {}),
		};
	});

	pi.on("tool_call", async (event) => {
		if (!enabled) return;
		if (event.toolName !== "write" && event.toolName !== "edit") return;

		return {
			block: true,
			reason: "Read-only mode is active. Press Option+P to disable it.",
		};
	});

	pi.registerShortcut("alt+p", {
		description: "Toggle read-only mode",
		handler: async (ctx) => {
			toggle(ctx);
		},
	});
}

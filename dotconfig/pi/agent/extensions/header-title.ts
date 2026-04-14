import type {
	ExtensionAPI,
	ExtensionCommandContext,
	ExtensionContext,
	Theme,
} from "@mariozechner/pi-coding-agent";

function parseToggle(args: string | undefined, current: boolean): boolean {
	const value = args?.trim().toLowerCase();
	if (!value) return !current;
	if (["on", "enable", "enabled", "true"].includes(value)) return true;
	if (["off", "disable", "disabled", "false"].includes(value)) return false;
	return !current;
}

function buildHeaderRule(width: number, theme: Theme): string {
	if (width <= 1) return theme.fg("borderMuted", "─".repeat(Math.max(1, width)));
	const innerWidth = Math.max(0, width - 2);
	return theme.fg("borderMuted", `╭${"─".repeat(innerWidth)}╮`);
}

export default function headerTitleExtension(pi: ExtensionAPI): void {
	let enabled = false;

	const install = (ctx: ExtensionContext | ExtensionCommandContext) => {
		if (!enabled) {
			ctx.ui.setHeader(undefined);
			return;
		}

		ctx.ui.setHeader((_tui, theme) => ({
			invalidate() {},
			render(width: number): string[] {
				return [buildHeaderRule(width, theme)];
			},
		}));
	};

	pi.on("session_start", async (_event, ctx) => {
		install(ctx);
	});

	pi.registerCommand("header-title", {
		description: "Toggle the plain header border",
		handler: async (args, ctx) => {
			enabled = parseToggle(args, enabled);
			install(ctx);
			ctx.ui.notify(enabled ? "Header border enabled" : "Header border disabled", "info");
		},
	});
}

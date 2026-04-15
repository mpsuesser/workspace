import type {
	ExtensionAPI,
	ExtensionCommandContext,
	ExtensionContext,
} from "@mariozechner/pi-coding-agent";
import { CustomEditor } from "@mariozechner/pi-coding-agent";
import type { AutocompleteProvider } from "@mariozechner/pi-tui";
import { CURSOR_MARKER, truncateToWidth, visibleWidth } from "@mariozechner/pi-tui";

type WrapAutocomplete = (provider: AutocompleteProvider) => AutocompleteProvider;

const CURSOR_BLOCK_RE = new RegExp(`${escapeRegExp(CURSOR_MARKER)}\\x1b\\[7m([\\s\\S]*?)\\x1b\\[0m`, "g");

function escapeRegExp(text: string): string {
	return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function padToWidth(text: string, width: number): string {
	return text + " ".repeat(Math.max(0, width - visibleWidth(text)));
}

function buildRule(
	width: number,
	borderColor: (text: string) => string,
	leftCorner: string,
	rightCorner: string,
): string {
	if (width <= 1) return borderColor("─".repeat(Math.max(1, width)));
	const innerWidth = Math.max(0, width - 2);
	return borderColor(`${leftCorner}${"─".repeat(innerWidth)}${rightCorner}`);
}

function parseToggle(args: string | undefined, current: boolean): boolean {
	const value = args?.trim().toLowerCase();
	if (!value) return !current;
	if (["on", "enable", "enabled", "true"].includes(value)) return true;
	if (["off", "disable", "disabled", "false"].includes(value)) return false;
	return !current;
}

class WrappedAutocompleteEditor extends CustomEditor {
	constructor(
		tui: ConstructorParameters<typeof CustomEditor>[0],
		editorTheme: ConstructorParameters<typeof CustomEditor>[1],
		keybindings: ConstructorParameters<typeof CustomEditor>[2],
		private readonly wrapAutocomplete?: WrapAutocomplete,
	) {
		super(tui, editorTheme, keybindings);
	}

	override setAutocompleteProvider(provider: AutocompleteProvider): void {
		super.setAutocompleteProvider(this.wrapAutocomplete ? this.wrapAutocomplete(provider) : provider);
	}
}

class BoxedEditor extends WrappedAutocompleteEditor {
	private renderBarCursor(cell: string): string {
		if (cell === " " || cell.trim() === "") return this.borderColor("▏");
		// Underline the character instead of inserting a bar — keeps width at 1 cell
		return `\x1b[4m${cell}\x1b[24m`;
	}

	private normalizeCursor(line: string): string {
		// Re-emit CURSOR_MARKER so the TUI can position the hardware cursor
		return line.replace(CURSOR_BLOCK_RE, (_match, cell: string) => CURSOR_MARKER + this.renderBarCursor(cell));
	}

	private wrapBodyLine(line: string, width: number): string {
		const innerWidth = Math.max(1, width - 2);
		const clipped = truncateToWidth(this.normalizeCursor(line), innerWidth, "");
		const padded = padToWidth(clipped, innerWidth);
		return `${this.borderColor("│")}${padded}${this.borderColor("│")}`;
	}

	override render(width: number): string[] {
		if (width < 8) return super.render(width);

		const innerWidth = width - 2;
		const baseLines = super.render(innerWidth);
		if (baseLines.length < 2) return baseLines;

		const lines: string[] = [];
		lines.push(buildRule(width, this.borderColor, "┌", "┐"));

		if (this.isShowingAutocomplete()) {
			for (const line of baseLines.slice(1)) {
				lines.push(this.wrapBodyLine(line, width));
			}
			lines.push(buildRule(width, this.borderColor, "└", "┘"));
			return lines;
		}

		for (const line of baseLines.slice(1, -1)) {
			lines.push(this.wrapBodyLine(line, width));
		}

		lines.push(buildRule(width, this.borderColor, "└", "┘"));
		return lines;
	}
}

export default function editorBoxedExtension(pi: ExtensionAPI): void {
	let enabled = true;
	let wrapAutocomplete: WrapAutocomplete | undefined;

	const install = (ctx: ExtensionContext | ExtensionCommandContext) => {
		if (!enabled) {
			if (wrapAutocomplete) {
				ctx.ui.setEditorComponent((tui, editorTheme, keybindings) => {
					return new WrappedAutocompleteEditor(tui, editorTheme, keybindings, wrapAutocomplete);
				});
			} else {
				ctx.ui.setEditorComponent(undefined);
			}
			return;
		}

		ctx.ui.setEditorComponent((tui, editorTheme, keybindings) => {
			return new BoxedEditor(tui, editorTheme, keybindings, wrapAutocomplete);
		});
	};

	pi.events.on("pi-fzfp:check-editor", (ack: () => void) => {
		ack();
	});

	pi.events.on("pi-fzfp:provider", (fn: WrapAutocomplete) => {
		wrapAutocomplete = fn;
	});

	pi.on("session_start", async (_event, ctx) => {
		install(ctx);
	});

	pi.registerCommand("editor-boxed", {
		description: "Toggle the boxed editor style",
		handler: async (args, ctx) => {
			enabled = parseToggle(args, enabled);
			install(ctx);
			ctx.ui.notify(enabled ? "Boxed editor enabled" : "Default editor restored", "info");
		},
	});
}

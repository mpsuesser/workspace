import { Effect, Option } from "effect";
import {
	Input,
	fuzzyFilter,
	getKeybindings,
	matchesKey,
	truncateToWidth,
	visibleWidth,
} from "@mariozechner/pi-tui";
import {
	makeExtension,
	makeShortcut,
	PiApi,
	PiContext,
	Ui,
} from "effect-pi";

import {
	MODE_REGISTER_EVENT,
	MODE_UNREGISTER_EVENT,
	getRegisteredModes,
	type ModeContext,
	type ModeRegistration,
} from "./mode-toggle-helper.ts";

export {
	createModeToggle,
	formatModeLabel,
	type CreateModeToggleOptions,
	type ModeBeforeAgentStartEvent,
	type ModeContext,
	type ModePersistenceOptions,
	type ModePersistenceScope,
	type ModePiApi,
	type ModeRegistration,
	type ModeToggle,
} from "./mode-toggle-helper.ts";

const modes = new Map<string, ModeRegistration>();
const MAX_VISIBLE_MODES = 8;
const SELECTED_ROW_BG = "\x1b[48;2;46;46;46m";
const RESET_BG = "\x1b[49m";
const MODE_ON_DOT = "\x1b[1;38;2;80;220;120m●\x1b[39m";
const MODE_OFF_DOT = "\x1b[38;2;120;120;120m●\x1b[39m";
const BORDER = {
	topLeft: "╔",
	topRight: "╗",
	bottomLeft: "╚",
	bottomRight: "╝",
	horizontal: "═",
	vertical: "║",
} as const;

interface ModeSelectorTui {
	requestRender(): void;
}

interface ModeSelectorTheme {
	fg(color: string, text: string): string;
	bold(text: string): string;
}

interface ModeSelectorComponent {
	focused: boolean;
	render(width: number): string[];
	invalidate(): void;
	handleInput(data: string): void;
}

type ModeSelectorSize = number | `${number}%`;

interface ModeSelectorContext extends ModeContext {
	readonly ui: ModeContext["ui"] & {
		custom<T>(
			factory: (
				tui: ModeSelectorTui,
				theme: ModeSelectorTheme,
				keybindings: unknown,
				done: (result: T) => void,
			) => ModeSelectorComponent,
			options: {
				overlay?: boolean;
				overlayOptions?: {
					width?: ModeSelectorSize;
					minWidth?: number;
					maxHeight?: ModeSelectorSize;
				};
			},
		): Promise<T>;
	};
}

function registerMode(mode: ModeRegistration): void {
	modes.set(mode.id, mode);
}

function getModes(): ModeRegistration[] {
	return Array.from(modes.values()).sort((a, b) => a.name.localeCompare(b.name));
}

function isModeRegistration(value: unknown): value is ModeRegistration {
	if (!value || typeof value !== "object") return false;

	const record = value as Partial<ModeRegistration>;
	return (
		typeof record.id === "string" &&
		typeof record.name === "string" &&
		typeof record.color === "string" &&
		typeof record.isEnabled === "function" &&
		typeof record.setEnabled === "function"
	);
}

function frameLine(
	text: string,
	width: number,
	borderColor: (text: string) => string,
): string {
	const innerWidth = Math.max(1, width - 4);
	const content = truncateToWidth(text, innerWidth, "");
	const padding = " ".repeat(Math.max(0, innerWidth - visibleWidth(content)));
	return `${borderColor(BORDER.vertical)} ${content}${padding} ${borderColor(BORDER.vertical)}`;
}

function topBorder(width: number, borderColor: (text: string) => string): string {
	return borderColor(
		`${BORDER.topLeft}${BORDER.horizontal.repeat(Math.max(1, width - 2))}${BORDER.topRight}`,
	);
}

function bottomBorder(width: number, borderColor: (text: string) => string): string {
	return borderColor(
		`${BORDER.bottomLeft}${BORDER.horizontal.repeat(Math.max(1, width - 2))}${BORDER.bottomRight}`,
	);
}

function colorizeHexForeground(text: string, color: string): string {
	const normalized = color.trim().replace(/^#/, "");
	if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return text;

	const r = Number.parseInt(normalized.slice(0, 2), 16);
	const g = Number.parseInt(normalized.slice(2, 4), 16);
	const b = Number.parseInt(normalized.slice(4, 6), 16);
	return `\x1b[1;38;2;${String(r)};${String(g)};${String(b)}m${text}\x1b[39m`;
}

function renderModeLine(
	mode: ModeRegistration,
	selected: boolean,
	innerWidth: number,
): string {
	const dot = mode.isEnabled() ? MODE_ON_DOT : MODE_OFF_DOT;
	const label = colorizeHexForeground(mode.name, mode.color);
	const content = truncateToWidth(` ${dot}   ${label}`, innerWidth, "");
	const padded = `${content}${" ".repeat(Math.max(0, innerWidth - visibleWidth(content)))}`;
	return selected ? `${SELECTED_ROW_BG}${padded}${RESET_BG}` : padded;
}

async function showModeSelector(ctx: ModeSelectorContext): Promise<void> {
	const availableModes = getModes();
	if (availableModes.length === 0) {
		ctx.ui.notify("No modes registered", "warning");
		return;
	}

	await ctx.ui.custom<void>(
		(tui, theme, _keybindings, done) => {
			const searchInput = new Input();
			const kb = getKeybindings();
			let focused = false;
			let filteredModes = availableModes;
			let selectedIndex = 0;
			const borderColor = (text: string) => theme.fg("accent", text);

			const applyFilter = (): void => {
				const query = searchInput.getValue().trim();
				filteredModes = query.length === 0
					? availableModes
					: fuzzyFilter(availableModes, query, (mode) => mode.name);
				selectedIndex = Math.max(0, Math.min(selectedIndex, filteredModes.length - 1));
			};

			const toggleSelectedMode = (): void => {
				const mode = filteredModes[selectedIndex];
				if (!mode) return;
				mode.setEnabled(!mode.isEnabled(), ctx);
			};

			return {
				get focused(): boolean {
					return focused;
				},
				set focused(value: boolean) {
					focused = value;
					searchInput.focused = value;
				},
				render(width: number): string[] {
					const innerWidth = Math.max(1, width - 4);
					const startIndex = Math.max(
						0,
						Math.min(selectedIndex - Math.floor(MAX_VISIBLE_MODES / 2), filteredModes.length - MAX_VISIBLE_MODES),
					);
					const visibleModes = filteredModes.slice(startIndex, startIndex + MAX_VISIBLE_MODES);

					const lines = [topBorder(width, borderColor)];
					lines.push(frameLine(theme.fg("accent", theme.bold("Mode Toggler")), width, borderColor));
					lines.push(frameLine("", width, borderColor));
					for (const renderedLine of searchInput.render(innerWidth + 2)) {
						const line = renderedLine.startsWith("> ")
							? renderedLine.slice(2)
							: renderedLine;
						lines.push(frameLine(line, width, borderColor));
					}
					lines.push(frameLine("", width, borderColor));

					if (visibleModes.length === 0) {
						lines.push(frameLine(theme.fg("dim", "No matching modes"), width, borderColor));
					} else {
						for (const [offset, mode] of visibleModes.entries()) {
							lines.push(
								frameLine(
									renderModeLine(mode, startIndex + offset === selectedIndex, innerWidth),
									width,
									borderColor,
								),
							);
						}
					}

					lines.push(bottomBorder(width, borderColor));
					return lines;
				},
				invalidate(): void {
					searchInput.invalidate();
				},
				handleInput(data: string): void {
					if (kb.matches(data, "tui.input.newLine") || matchesKey(data, "shift+enter")) {
						done(undefined);
						return;
					} else if (matchesKey(data, "space") || data === " ") {
						if (searchInput.getValue().length === 0) {
							done(undefined);
							return;
						}

						searchInput.setValue("");
						applyFilter();
					} else if (kb.matches(data, "tui.select.up") || matchesKey(data, "shift+w") || data === "W") {
						if (filteredModes.length > 0) {
							selectedIndex = selectedIndex === 0 ? filteredModes.length - 1 : selectedIndex - 1;
						}
					} else if (kb.matches(data, "tui.select.down") || matchesKey(data, "shift+s") || data === "S") {
						if (filteredModes.length > 0) {
							selectedIndex = selectedIndex === filteredModes.length - 1 ? 0 : selectedIndex + 1;
						}
					} else if (kb.matches(data, "tui.select.pageUp")) {
						if (filteredModes.length > 0) {
							selectedIndex = Math.max(0, selectedIndex - MAX_VISIBLE_MODES);
						}
					} else if (kb.matches(data, "tui.select.pageDown")) {
						if (filteredModes.length > 0) {
							selectedIndex = Math.min(filteredModes.length - 1, selectedIndex + MAX_VISIBLE_MODES);
						}
					} else if (kb.matches(data, "tui.select.confirm")) {
						toggleSelectedMode();
					} else if (kb.matches(data, "tui.select.cancel")) {
						done(undefined);
						return;
					} else {
						searchInput.handleInput(data);
						applyFilter();
					}

					tui.requestRender();
				},
			};
		},
		{
			overlay: true,
			overlayOptions: {
				width: "50%",
				minWidth: 48,
				maxHeight: "70%",
			},
		},
	);
}

const openModeSelector = Effect.gen(function* () {
	const ctx = yield* PiContext;
	yield* Effect.promise(() => showModeSelector(ctx.raw));
});

export default makeExtension({
	id: "pi-mode-toggler",
	onLoad: Effect.gen(function* () {
		const pi = yield* PiApi;

		yield* Effect.sync(() => {
			modes.clear();
			for (const mode of getRegisteredModes()) {
				registerMode(mode);
			}

			const offRegister = pi.raw.events.on(MODE_REGISTER_EVENT, (value) => {
				if (isModeRegistration(value)) {
					registerMode(value);
				}
			});
			const offUnregister = pi.raw.events.on(MODE_UNREGISTER_EVENT, (value) => {
				if (typeof value === "string") {
					modes.delete(value);
				}
			});

			pi.raw.on("session_shutdown", async () => {
				offRegister();
				offUnregister();
			});
		});
	}),
	shortcuts: [
		makeShortcut({
			key: "tab",
			description: Option.some("Toggle modes"),
			handler: openModeSelector,
		}),
		makeShortcut({
			key: "space",
			description: Option.some("Open mode toggler when editor is empty"),
			handler: Effect.gen(function* () {
				const ui = yield* Ui;
				const editorText = yield* ui.getEditorText;
				if (editorText.length === 0) {
					yield* openModeSelector;
					return;
				}

				yield* ui.pasteToEditor(" ");
			}),
		}),
	],
});

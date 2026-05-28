import { Effect, Option } from "effect";
import {
	matchesKey,
	truncateToWidth,
	type KeyId,
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
const MODE_ON_DOT = "\x1b[1;38;2;80;220;120m●\x1b[39m";
const MODE_OFF_DOT = "\x1b[38;2;120;120;120m●\x1b[39m";
const KEY_COLOR = "\x1b[1;38;2;180;180;180m";
const DIM_COLOR = "\x1b[38;2;120;120;120m";
const ANSI_RESET_FG = "\x1b[39m";
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
	focused?: boolean;
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
		typeof record.key === "string" &&
		record.key.trim().length > 0 &&
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

function colorizeKey(text: string): string {
	return `${KEY_COLOR}${text}${ANSI_RESET_FG}`;
}

function colorizeDim(text: string): string {
	return `${DIM_COLOR}${text}${ANSI_RESET_FG}`;
}

function formatModeKey(key: string): string {
	const trimmed = key.trim();
	if (trimmed.length === 1) return trimmed.toUpperCase();

	return trimmed
		.split("+")
		.map((part) => {
			if (part.length === 0) return part;
			if (part.length === 1) return part.toUpperCase();
			return `${part[0]?.toUpperCase() ?? ""}${part.slice(1)}`;
		})
		.join("+");
}

function matchesModeKey(data: string, key: string): boolean {
	const trimmed = key.trim();
	if (trimmed.length === 0) return false;

	if (matchesKey(data, trimmed as KeyId)) return true;

	if (trimmed.length === 1) {
		const lowerKey = trimmed.toLowerCase();
		return matchesKey(data, `shift+${lowerKey}` as KeyId) ||
			(data.length === 1 && data.toLowerCase() === lowerKey);
	}

	return false;
}

function renderModeLine(
	mode: ModeRegistration,
	innerWidth: number,
	keyWidth: number,
): string {
	const keyText = formatModeKey(mode.key).padEnd(keyWidth, " ");
	const key = colorizeKey(keyText);
	const dot = mode.isEnabled() ? MODE_ON_DOT : MODE_OFF_DOT;
	const label = colorizeHexForeground(mode.name, mode.color);
	const description = mode.description ? colorizeDim(` — ${mode.description}`) : "";
	const content = truncateToWidth(` ${key}   ${dot}   ${label}${description}`, innerWidth, "");
	return `${content}${" ".repeat(Math.max(0, innerWidth - visibleWidth(content)))}`;
}

async function showModeSelector(ctx: ModeSelectorContext): Promise<void> {
	const availableModes = getModes();
	if (availableModes.length === 0) {
		ctx.ui.notify("No modes registered", "warning");
		return;
	}

	await ctx.ui.custom<void>(
		(tui, theme, _keybindings, done) => {
			const borderColor = (text: string) => theme.fg("accent", text);
			const keyWidth = Math.max(
				1,
				...availableModes.map((mode) => visibleWidth(formatModeKey(mode.key))),
			);

			const toggleMode = (mode: ModeRegistration): void => {
				mode.setEnabled(!mode.isEnabled(), ctx);
				done(undefined);
			};

			return {
				render(width: number): string[] {
					const innerWidth = Math.max(1, width - 4);
					const lines = [topBorder(width, borderColor)];

					lines.push(frameLine(theme.fg("accent", theme.bold("Mode Toggler")), width, borderColor));
					lines.push(frameLine(theme.fg("dim", "Press a mode key to toggle • Tab/Esc closes"), width, borderColor));
					lines.push(frameLine("", width, borderColor));

					for (const mode of availableModes) {
						lines.push(frameLine(renderModeLine(mode, innerWidth, keyWidth), width, borderColor));
					}

					lines.push(bottomBorder(width, borderColor));
					return lines;
				},
				invalidate(): void {},
				handleInput(data: string): void {
					if (matchesKey(data, "tab") || matchesKey(data, "escape") || matchesKey(data, "ctrl+c")) {
						done(undefined);
						return;
					}

					const mode = availableModes.find((candidate) => matchesModeKey(data, candidate.key));
					if (mode) {
						toggleMode(mode);
						return;
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

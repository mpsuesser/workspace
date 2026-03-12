import * as BunServices from '@effect/platform-bun/BunServices';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import type { PlatformError } from 'effect/PlatformError';
import * as ServiceMap from 'effect/ServiceMap';
import * as ChildProcess from 'effect/unstable/process/ChildProcess';
import * as ChildProcessSpawner from 'effect/unstable/process/ChildProcessSpawner';
import {
	type Action,
	Action as ActionEnum,
	actionToKeybindString,
	type GotoSplitDirection,
	type InspectorMode,
	type ResizeDirection,
	type SplitDirection,
	type WriteFileAction
} from './Action.ts';
import {
	GhosttyActionFailed,
	type GhosttyCliError,
	GhosttyCliError as GhosttyCliErrorClass,
	type GhosttyNotInstalled,
	GhosttyNotInstalled as GhosttyNotInstalledClass,
	GhosttyNotRunning
} from './GhosttyError.ts';

// --- Inlined from internal/applescript.ts ---

const osascriptArgs = (...statements: string[]) =>
	statements.flatMap((statement) => [
		'-e',
		statement
	]);

const runScriptVoid = (...statements: string[]) =>
	Effect.gen(function* () {
		const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
		const command = ChildProcess.make(
			'osascript',
			osascriptArgs(...statements)
		);
		yield* spawner.exitCode(command);
	});

const runScriptString = (...statements: string[]) =>
	Effect.gen(function* () {
		const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
		const command = ChildProcess.make(
			'osascript',
			osascriptArgs(...statements)
		);
		return yield* spawner.string(command).pipe(
			Effect.map((s) => Option.some(s.trim())),
			Effect.catchTag('PlatformError', () =>
				Effect.succeed(Option.none())
			)
		);
	});

const runScriptBoolean = (...statements: string[]) =>
	Effect.gen(function* () {
		const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
		const command = ChildProcess.make(
			'osascript',
			osascriptArgs(...statements)
		);
		return yield* spawner.string(command).pipe(
			Effect.map((s) => s.trim().toLowerCase() === 'true'),
			Effect.catchTag('PlatformError', () => Effect.succeed(false))
		);
	});

const isGhosttyRunning = Effect.gen(function* () {
	const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
	const command = ChildProcess.make('pgrep', [
		'-f',
		'Ghostty'
	]);
	return yield* spawner.exitCode(command).pipe(
		Effect.map((code) => code === 0),
		Effect.catchTag('PlatformError', () => Effect.succeed(false))
	);
});

const ensureRunning = Effect.gen(function* () {
	const running = yield* isGhosttyRunning;
	if (!running) {
		const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
		yield* spawner.exitCode(
			ChildProcess.make('open', [
				'-a',
				'Ghostty'
			])
		);
	}
});

const ensureFrontmost = Effect.gen(function* () {
	yield* ensureRunning;
	yield* runScriptVoid('tell application "Ghostty"', 'activate', 'end tell');
});

const getWindowCount = Effect.gen(function* () {
	const result = yield* runScriptString(
		'tell application "Ghostty"',
		'return count of windows',
		'end tell'
	);
	return Option.match(result, {
		onNone: () => 0,
		onSome: (s) => {
			const n = Number.parseInt(s, 10);
			return Number.isNaN(n) ? 0 : n;
		}
	});
});

const newWindow = Effect.gen(function* () {
	yield* ensureRunning;
	yield* runScriptVoid(
		'tell application "Ghostty"',
		'activate',
		'tell application "System Events"',
		'keystroke "n" using command down',
		'end tell',
		'end tell'
	);
});

const newTab = Effect.gen(function* () {
	yield* ensureFrontmost;
	yield* runScriptVoid(
		'tell application "System Events"',
		'keystroke "t" using command down',
		'end tell'
	);
});

const splitHorizontal = Effect.gen(function* () {
	yield* ensureFrontmost;
	yield* runScriptVoid(
		'tell application "System Events"',
		'keystroke "d" using {command down, shift down}',
		'end tell'
	);
});

const splitVertical = Effect.gen(function* () {
	yield* ensureFrontmost;
	yield* runScriptVoid(
		'tell application "System Events"',
		'keystroke "d" using command down',
		'end tell'
	);
});

const closeCurrentPane = Effect.gen(function* () {
	yield* ensureFrontmost;
	yield* runScriptVoid(
		'tell application "System Events"',
		'keystroke "w" using command down',
		'end tell'
	);
});

const typeText = (text: string) =>
	Effect.gen(function* () {
		yield* ensureFrontmost;
		const escaped = text.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
		yield* runScriptVoid(
			'tell application "System Events"',
			`keystroke "${escaped}"`,
			'end tell'
		);
	});

const sendKeys = (keys: string, modifiers: string[] = []) =>
	Effect.gen(function* () {
		yield* ensureFrontmost;
		const modStr =
			modifiers.length > 0
				? ` using {${modifiers.map((m) => `${m} down`).join(', ')}}`
				: '';
		yield* runScriptVoid(
			'tell application "System Events"',
			`keystroke "${keys}"${modStr}`,
			'end tell'
		);
	});

// --- Inlined from internal/cli.ts ---

const runGhosttyCommand = (
	args: ReadonlyArray<string>
): Effect.Effect<
	string,
	GhosttyCliError,
	ChildProcessSpawner.ChildProcessSpawner
> =>
	Effect.gen(function* () {
		const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
		const command = ChildProcess.make('ghostty', [
			...args
		]);
		return yield* spawner.string(command).pipe(
			Effect.map((s) => s.trim()),
			Effect.mapError(
				(error) =>
					new GhosttyCliErrorClass({
						command: `ghostty ${args.join(' ')}`,
						exitCode:
							'exitCode' in error &&
							typeof error.exitCode === 'number'
								? error.exitCode
								: 1,
						stderr: error.message
					})
			)
		);
	});

const isGhosttyInstalled: Effect.Effect<
	boolean,
	never,
	ChildProcessSpawner.ChildProcessSpawner
> = Effect.gen(function* () {
	const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
	const command = ChildProcess.make('which', [
		'ghostty'
	]);
	return yield* spawner.exitCode(command).pipe(
		Effect.map((code) => code === 0),
		Effect.catch(() => Effect.succeed(false)) // intentional: recover from any error with default
	);
});

const getGhosttyVersion: Effect.Effect<
	string,
	GhosttyNotInstalled | GhosttyCliError,
	ChildProcessSpawner.ChildProcessSpawner
> = Effect.gen(function* () {
	const installed = yield* isGhosttyInstalled;
	if (!installed) {
		return yield* new GhosttyNotInstalledClass({
			message: 'Ghostty CLI is not installed or not in PATH'
		});
	}
	return yield* runGhosttyCommand([
		'+version'
	]);
});

const parseThemeList = (output: string): ReadonlyArray<string> =>
	output
		.split('\n')
		.map((line) => line.trim())
		.filter((line) => line.length > 0);

const parseFontList = (
	output: string
): ReadonlyArray<{
	family: string;
	style: string;
	fullName: string;
}> =>
	output
		.split('\n')
		.map((line) => line.trim())
		.filter((line) => line.length > 0)
		.map((line) => {
			const parts = line.split(/\t+/);
			return {
				family: parts[0]?.trim() ?? '',
				style: parts[1]?.trim() ?? '',
				fullName: parts[2]?.trim() ?? ''
			};
		})
		.filter((font) => font.family.length > 0);

const parseKeybindList = (
	output: string
): ReadonlyArray<{
	trigger: string;
	action: string;
}> =>
	output
		.split('\n')
		.map((line) => line.trim())
		.filter((line) => line.length > 0)
		.map((line) => {
			const eqIndex = line.indexOf('=');
			if (eqIndex === -1) {
				return {
					trigger: line,
					action: ''
				};
			}
			return {
				trigger: line.slice(0, eqIndex).trim(),
				action: line.slice(eqIndex + 1).trim()
			};
		});

const parseActionList = (output: string): ReadonlyArray<string> =>
	output
		.split('\n')
		.map((line) => line.trim())
		.filter((line) => line.length > 0);

// --- Service definition ---

export interface FontInfo {
	readonly family: string;
	readonly style: string;
	readonly fullName: string;
}

export interface Keybind {
	readonly trigger: string;
	readonly action: string;
}

type GhosttyActionError =
	| GhosttyNotRunning
	| GhosttyActionFailed
	| PlatformError;

type KeystrokeMapping = {
	readonly key: string;
	readonly modifiers: ReadonlyArray<
		'command' | 'shift' | 'control' | 'option'
	>;
};

const defaultKeystrokeMappings: Partial<
	Record<Action['_tag'], KeystrokeMapping>
> = {
	CopyToClipboard: {
		key: 'c',
		modifiers: [
			'command'
		]
	},
	PasteFromClipboard: {
		key: 'v',
		modifiers: [
			'command'
		]
	},
	NewWindow: {
		key: 'n',
		modifiers: [
			'command'
		]
	},
	NewTab: {
		key: 't',
		modifiers: [
			'command'
		]
	},
	CloseSurface: {
		key: 'w',
		modifiers: [
			'command'
		]
	},
	CloseWindow: {
		key: 'w',
		modifiers: [
			'command',
			'shift'
		]
	},
	CloseTab: {
		key: 'w',
		modifiers: [
			'command',
			'shift'
		]
	},
	NextTab: {
		key: ']',
		modifiers: [
			'command',
			'shift'
		]
	},
	PreviousTab: {
		key: '[',
		modifiers: [
			'command',
			'shift'
		]
	},
	ToggleFullscreen: {
		key: 'return',
		modifiers: [
			'command'
		]
	},
	ReloadConfig: {
		key: ',',
		modifiers: [
			'command',
			'shift'
		]
	},
	OpenConfig: {
		key: ',',
		modifiers: [
			'command'
		]
	},
	IncreaseFontSize: {
		key: '+',
		modifiers: [
			'command'
		]
	},
	DecreaseFontSize: {
		key: '-',
		modifiers: [
			'command'
		]
	},
	ResetFontSize: {
		key: '0',
		modifiers: [
			'command'
		]
	},
	ClearScreen: {
		key: 'k',
		modifiers: [
			'command'
		]
	},
	SelectAll: {
		key: 'a',
		modifiers: [
			'command'
		]
	},
	ScrollPageUp: {
		key: 'pageup',
		modifiers: []
	},
	ScrollPageDown: {
		key: 'pagedown',
		modifiers: []
	},
	ScrollToTop: {
		key: 'home',
		modifiers: [
			'command'
		]
	},
	ScrollToBottom: {
		key: 'end',
		modifiers: [
			'command'
		]
	},
	ToggleSplitZoom: {
		key: 'return',
		modifiers: [
			'command',
			'shift'
		]
	},
	EqualizeSplits: {
		key: '=',
		modifiers: [
			'command',
			'shift'
		]
	},
	ToggleQuickTerminal: {
		key: '`',
		modifiers: [
			'command'
		]
	},
	ToggleCommandPalette: {
		key: 'p',
		modifiers: [
			'command',
			'shift'
		]
	},
	Undo: {
		key: 'z',
		modifiers: [
			'command'
		]
	},
	Redo: {
		key: 'z',
		modifiers: [
			'command',
			'shift'
		]
	},
	Quit: {
		key: 'q',
		modifiers: [
			'command'
		]
	}
};

const splitDirectionMappings: Record<SplitDirection, KeystrokeMapping> = {
	right: {
		key: 'd',
		modifiers: [
			'command'
		]
	},
	down: {
		key: 'd',
		modifiers: [
			'command',
			'shift'
		]
	},
	left: {
		key: 'd',
		modifiers: [
			'command'
		]
	},
	up: {
		key: 'd',
		modifiers: [
			'command',
			'shift'
		]
	},
	auto: {
		key: 'd',
		modifiers: [
			'command'
		]
	}
};

const gotoSplitMappings: Record<GotoSplitDirection, KeystrokeMapping> = {
	previous: {
		key: '[',
		modifiers: [
			'command'
		]
	},
	next: {
		key: ']',
		modifiers: [
			'command'
		]
	},
	left: {
		key: 'left',
		modifiers: [
			'command',
			'option'
		]
	},
	right: {
		key: 'right',
		modifiers: [
			'command',
			'option'
		]
	},
	up: {
		key: 'up',
		modifiers: [
			'command',
			'option'
		]
	},
	down: {
		key: 'down',
		modifiers: [
			'command',
			'option'
		]
	}
};

const gotoTabMappings: Record<number, KeystrokeMapping> = {
	1: {
		key: '1',
		modifiers: [
			'command'
		]
	},
	2: {
		key: '2',
		modifiers: [
			'command'
		]
	},
	3: {
		key: '3',
		modifiers: [
			'command'
		]
	},
	4: {
		key: '4',
		modifiers: [
			'command'
		]
	},
	5: {
		key: '5',
		modifiers: [
			'command'
		]
	},
	6: {
		key: '6',
		modifiers: [
			'command'
		]
	},
	7: {
		key: '7',
		modifiers: [
			'command'
		]
	},
	8: {
		key: '8',
		modifiers: [
			'command'
		]
	},
	9: {
		key: '9',
		modifiers: [
			'command'
		]
	}
};

const specialKeyMap: Record<string, string> = {
	pageup: 'page up',
	pagedown: 'page down',
	home: 'home',
	end: 'end',
	left: 'left arrow',
	right: 'right arrow',
	up: 'up arrow',
	down: 'down arrow',
	return: 'return',
	tab: 'tab',
	escape: 'escape',
	delete: 'delete',
	backspace: 'delete'
};

const buildKeystrokeStatement = (mapping: KeystrokeMapping): string => {
	const specialKey = specialKeyMap[mapping.key.toLowerCase()];
	const modStr =
		mapping.modifiers.length > 0
			? ` using {${mapping.modifiers.map((m) => `${m} down`).join(', ')}}`
			: '';

	if (specialKey) {
		return `key code (${getKeyCode(mapping.key)})${modStr}`;
	}
	return `keystroke "${mapping.key}"${modStr}`;
};

const getKeyCode = (key: string): number => {
	const keyCodes: Record<string, number> = {
		return: 36,
		tab: 48,
		escape: 53,
		delete: 51,
		home: 115,
		end: 119,
		pageup: 116,
		pagedown: 121,
		left: 123,
		right: 124,
		down: 125,
		up: 126
	};
	return keyCodes[key.toLowerCase()] ?? 0;
};

export class Ghostty extends ServiceMap.Service<Ghostty>()(
	'@workspace/ghostty-binding/Ghostty',
	{
		make: Effect.gen(function* () {
			const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;

			const provideExecutor = <A, E>(
				effect: Effect.Effect<
					A,
					E,
					ChildProcessSpawner.ChildProcessSpawner
				>
			) =>
				Effect.provideService(
					effect,
					ChildProcessSpawner.ChildProcessSpawner,
					spawner
				);

			const isInstalled = provideExecutor(isGhosttyInstalled);
			const version = provideExecutor(getGhosttyVersion);
			const listThemes = provideExecutor(
				runGhosttyCommand([
					'+list-themes'
				]).pipe(Effect.map(parseThemeList))
			);
			const listFonts = provideExecutor(
				runGhosttyCommand([
					'+list-fonts'
				]).pipe(Effect.map(parseFontList))
			);
			const listKeybinds = provideExecutor(
				runGhosttyCommand([
					'+list-keybinds'
				]).pipe(Effect.map(parseKeybindList))
			);
			const listDefaultKeybinds = provideExecutor(
				runGhosttyCommand([
					'+list-keybinds',
					'--default'
				]).pipe(Effect.map(parseKeybindList))
			);
			const listActions = provideExecutor(
				runGhosttyCommand([
					'+list-actions'
				]).pipe(Effect.map(parseActionList))
			);
			const showConfig = provideExecutor(
				runGhosttyCommand([
					'+show-config'
				])
			);
			const showDefaultConfig = provideExecutor(
				runGhosttyCommand([
					'+show-config',
					'--default',
					'--docs'
				])
			);
			const validateConfig = provideExecutor(
				runGhosttyCommand([
					'+validate-config'
				]).pipe(
					Effect.map(() => true),
					Effect.catchTag('GhosttyCliError', (e) =>
						e.exitCode === 0
							? Effect.succeed(true)
							: Effect.succeed(false)
					)
				)
			);

			const isRunning = provideExecutor(isGhosttyRunning);
			const ensureRunning_ = provideExecutor(ensureRunning);
			const ensureFrontmost_ = provideExecutor(ensureFrontmost);

			const executeKeystroke = (mapping: KeystrokeMapping) =>
				Effect.gen(function* () {
					yield* ensureFrontmost_;
					const statement = buildKeystrokeStatement(mapping);
					yield* provideExecutor(
						runScriptVoid(
							'tell application "System Events"',
							statement,
							'end tell'
						)
					);
				});

			const executeActionViaKeystroke = (
				action: Action
			): Effect.Effect<void, GhosttyActionError> =>
				ActionEnum.$match(action, {
					CopyToClipboard: () =>
						executeKeystroke(
							defaultKeystrokeMappings.CopyToClipboard!
						),
					PasteFromClipboard: () =>
						executeKeystroke(
							defaultKeystrokeMappings.PasteFromClipboard!
						),
					PasteFromSelection: () =>
						Effect.fail(
							new GhosttyActionFailed({
								action: actionToKeybindString(action),
								reason: 'paste_from_selection has no default macOS keybind'
							})
						),
					CopyUrlToClipboard: () =>
						Effect.fail(
							new GhosttyActionFailed({
								action: actionToKeybindString(action),
								reason: 'copy_url_to_clipboard has no default macOS keybind'
							})
						),
					CopyTitleToClipboard: () =>
						Effect.fail(
							new GhosttyActionFailed({
								action: actionToKeybindString(action),
								reason: 'copy_title_to_clipboard has no default macOS keybind'
							})
						),

					IncreaseFontSize: () =>
						executeKeystroke(
							defaultKeystrokeMappings.IncreaseFontSize!
						),
					DecreaseFontSize: () =>
						executeKeystroke(
							defaultKeystrokeMappings.DecreaseFontSize!
						),
					ResetFontSize: () =>
						executeKeystroke(
							defaultKeystrokeMappings.ResetFontSize!
						),
					SetFontSize: ({ size }) =>
						Effect.fail(
							new GhosttyActionFailed({
								action: actionToKeybindString(
									ActionEnum.SetFontSize({
										size
									})
								),
								reason: 'set_font_size requires configuration, no default keybind'
							})
						),

					ClearScreen: () =>
						executeKeystroke(defaultKeystrokeMappings.ClearScreen!),
					SelectAll: () =>
						executeKeystroke(defaultKeystrokeMappings.SelectAll!),
					Reset: () =>
						Effect.fail(
							new GhosttyActionFailed({
								action: actionToKeybindString(action),
								reason: 'reset has no default macOS keybind'
							})
						),

					ScrollToTop: () =>
						executeKeystroke(defaultKeystrokeMappings.ScrollToTop!),
					ScrollToBottom: () =>
						executeKeystroke(
							defaultKeystrokeMappings.ScrollToBottom!
						),
					ScrollToSelection: () =>
						Effect.fail(
							new GhosttyActionFailed({
								action: actionToKeybindString(action),
								reason: 'scroll_to_selection has no default macOS keybind'
							})
						),
					ScrollPageUp: () =>
						executeKeystroke(
							defaultKeystrokeMappings.ScrollPageUp!
						),
					ScrollPageDown: () =>
						executeKeystroke(
							defaultKeystrokeMappings.ScrollPageDown!
						),
					ScrollPageFractional: ({ fraction }) =>
						Effect.fail(
							new GhosttyActionFailed({
								action: actionToKeybindString(
									ActionEnum.ScrollPageFractional({
										fraction
									})
								),
								reason: 'scroll_page_fractional requires configuration, no default keybind'
							})
						),
					ScrollPageLines: ({ lines }) =>
						Effect.fail(
							new GhosttyActionFailed({
								action: actionToKeybindString(
									ActionEnum.ScrollPageLines({
										lines
									})
								),
								reason: 'scroll_page_lines requires configuration, no default keybind'
							})
						),

					AdjustSelection: ({ direction }) =>
						Effect.fail(
							new GhosttyActionFailed({
								action: actionToKeybindString(
									ActionEnum.AdjustSelection({
										direction
									})
								),
								reason: 'adjust_selection requires configuration, no default keybind'
							})
						),

					JumpToPrompt: ({ delta }) =>
						Effect.fail(
							new GhosttyActionFailed({
								action: actionToKeybindString(
									ActionEnum.JumpToPrompt({
										delta
									})
								),
								reason: 'jump_to_prompt requires configuration, no default keybind'
							})
						),

					WriteScrollbackFile: ({ action: fileAction }) =>
						Effect.fail(
							new GhosttyActionFailed({
								action: actionToKeybindString(
									ActionEnum.WriteScrollbackFile({
										action: fileAction
									})
								),
								reason: 'write_scrollback_file requires configuration, no default keybind'
							})
						),
					WriteScreenFile: ({ action: fileAction }) =>
						Effect.fail(
							new GhosttyActionFailed({
								action: actionToKeybindString(
									ActionEnum.WriteScreenFile({
										action: fileAction
									})
								),
								reason: 'write_screen_file requires configuration, no default keybind'
							})
						),
					WriteSelectionFile: ({ action: fileAction }) =>
						Effect.fail(
							new GhosttyActionFailed({
								action: actionToKeybindString(
									ActionEnum.WriteSelectionFile({
										action: fileAction
									})
								),
								reason: 'write_selection_file requires configuration, no default keybind'
							})
						),

					NewWindow: () =>
						executeKeystroke(defaultKeystrokeMappings.NewWindow!),
					CloseWindow: () =>
						executeKeystroke(defaultKeystrokeMappings.CloseWindow!),
					ToggleFullscreen: () =>
						executeKeystroke(
							defaultKeystrokeMappings.ToggleFullscreen!
						),
					ToggleMaximize: () =>
						Effect.fail(
							new GhosttyActionFailed({
								action: actionToKeybindString(action),
								reason: 'toggle_maximize has no default macOS keybind'
							})
						),
					ResetWindowSize: () =>
						Effect.fail(
							new GhosttyActionFailed({
								action: actionToKeybindString(action),
								reason: 'reset_window_size has no default macOS keybind'
							})
						),
					ToggleWindowFloatOnTop: () =>
						Effect.fail(
							new GhosttyActionFailed({
								action: actionToKeybindString(action),
								reason: 'toggle_window_float_on_top has no default macOS keybind'
							})
						),
					ToggleWindowDecorations: () =>
						Effect.fail(
							new GhosttyActionFailed({
								action: actionToKeybindString(action),
								reason: 'toggle_window_decorations has no default macOS keybind'
							})
						),

					NewTab: () =>
						executeKeystroke(defaultKeystrokeMappings.NewTab!),
					CloseTab: () =>
						executeKeystroke(defaultKeystrokeMappings.CloseTab!),
					NextTab: () =>
						executeKeystroke(defaultKeystrokeMappings.NextTab!),
					PreviousTab: () =>
						executeKeystroke(defaultKeystrokeMappings.PreviousTab!),
					LastTab: () =>
						Effect.fail(
							new GhosttyActionFailed({
								action: actionToKeybindString(action),
								reason: 'last_tab has no default macOS keybind'
							})
						),
					GotoTab: ({ index }) => {
						const mapping = gotoTabMappings[index];
						if (mapping) {
							return executeKeystroke(mapping);
						}
						return Effect.fail(
							new GhosttyActionFailed({
								action: actionToKeybindString(
									ActionEnum.GotoTab({
										index
									})
								),
								reason: `goto_tab:${index} has no default keybind (only 1-9 supported)`
							})
						);
					},
					MoveTab: ({ offset }) =>
						Effect.fail(
							new GhosttyActionFailed({
								action: actionToKeybindString(
									ActionEnum.MoveTab({
										offset
									})
								),
								reason: 'move_tab requires configuration, no default keybind'
							})
						),
					ToggleTabOverview: () =>
						Effect.fail(
							new GhosttyActionFailed({
								action: actionToKeybindString(action),
								reason: 'toggle_tab_overview has no default macOS keybind'
							})
						),
					PromptSurfaceTitle: () =>
						Effect.fail(
							new GhosttyActionFailed({
								action: actionToKeybindString(action),
								reason: 'prompt_surface_title has no default macOS keybind'
							})
						),

					NewSplit: ({ direction }) =>
						executeKeystroke(splitDirectionMappings[direction]),
					GotoSplit: ({ direction }) =>
						executeKeystroke(gotoSplitMappings[direction]),
					ToggleSplitZoom: () =>
						executeKeystroke(
							defaultKeystrokeMappings.ToggleSplitZoom!
						),
					ResizeSplit: ({ direction, amount }) =>
						Effect.fail(
							new GhosttyActionFailed({
								action: actionToKeybindString(
									ActionEnum.ResizeSplit({
										direction,
										amount
									})
								),
								reason: 'resize_split requires configuration, no default keybind'
							})
						),
					EqualizeSplits: () =>
						executeKeystroke(
							defaultKeystrokeMappings.EqualizeSplits!
						),
					CloseSurface: () =>
						executeKeystroke(
							defaultKeystrokeMappings.CloseSurface!
						),

					ToggleQuickTerminal: () =>
						executeKeystroke(
							defaultKeystrokeMappings.ToggleQuickTerminal!
						),

					ToggleVisibility: () =>
						Effect.fail(
							new GhosttyActionFailed({
								action: actionToKeybindString(action),
								reason: 'toggle_visibility has no default macOS keybind'
							})
						),

					ReloadConfig: () =>
						executeKeystroke(
							defaultKeystrokeMappings.ReloadConfig!
						),
					OpenConfig: () =>
						executeKeystroke(defaultKeystrokeMappings.OpenConfig!),

					Inspector: ({ mode }) =>
						Effect.fail(
							new GhosttyActionFailed({
								action: actionToKeybindString(
									ActionEnum.Inspector({
										mode
									})
								),
								reason: 'inspector requires configuration, no default keybind'
							})
						),
					ShowGtkInspector: () =>
						Effect.fail(
							new GhosttyActionFailed({
								action: actionToKeybindString(action),
								reason: 'show_gtk_inspector is Linux-only'
							})
						),

					Text: ({ text }) =>
						Effect.gen(function* () {
							yield* ensureFrontmost_;
							const escaped = text
								.replace(/\\/g, '\\\\')
								.replace(/"/g, '\\"');
							yield* provideExecutor(
								runScriptVoid(
									'tell application "System Events"',
									`keystroke "${escaped}"`,
									'end tell'
								)
							);
						}),
					Csi: ({ sequence }) =>
						Effect.fail(
							new GhosttyActionFailed({
								action: actionToKeybindString(
									ActionEnum.Csi({
										sequence
									})
								),
								reason: 'csi sequences cannot be sent via AppleScript keystroke'
							})
						),
					Esc: ({ sequence }) =>
						Effect.fail(
							new GhosttyActionFailed({
								action: actionToKeybindString(
									ActionEnum.Esc({
										sequence
									})
								),
								reason: 'esc sequences cannot be sent via AppleScript keystroke'
							})
						),
					CursorKey: ({ mode }) =>
						Effect.fail(
							new GhosttyActionFailed({
								action: actionToKeybindString(
									ActionEnum.CursorKey({
										mode
									})
								),
								reason: 'cursor_key mode cannot be set via AppleScript'
							})
						),

					ToggleSecureInput: () =>
						Effect.fail(
							new GhosttyActionFailed({
								action: actionToKeybindString(action),
								reason: 'toggle_secure_input has no default macOS keybind'
							})
						),

					ToggleCommandPalette: () =>
						executeKeystroke(
							defaultKeystrokeMappings.ToggleCommandPalette!
						),

					Undo: () =>
						executeKeystroke(defaultKeystrokeMappings.Undo!),
					Redo: () =>
						executeKeystroke(defaultKeystrokeMappings.Redo!),

					Quit: () =>
						executeKeystroke(defaultKeystrokeMappings.Quit!),
					Ignore: () => Effect.void,
					Unbind: () => Effect.void
				});

			const executeAction = (action: Action) =>
				executeActionViaKeystroke(action);

			return {
				isInstalled: Effect.fn('Ghostty.isInstalled')(
					() => isInstalled
				),
				version: Effect.fn('Ghostty.version')(() => version),
				listThemes: Effect.fn('Ghostty.listThemes')(() => listThemes),
				listFonts: Effect.fn('Ghostty.listFonts')(() => listFonts),
				listKeybinds: Effect.fn('Ghostty.listKeybinds')(
					() => listKeybinds
				),
				listDefaultKeybinds: Effect.fn('Ghostty.listDefaultKeybinds')(
					() => listDefaultKeybinds
				),
				listActions: Effect.fn('Ghostty.listActions')(
					() => listActions
				),
				showConfig: Effect.fn('Ghostty.showConfig')(() => showConfig),
				showDefaultConfig: Effect.fn('Ghostty.showDefaultConfig')(
					() => showDefaultConfig
				),
				validateConfig: Effect.fn('Ghostty.validateConfig')(
					() => validateConfig
				),

				isRunning: Effect.fn('Ghostty.isRunning')(() => isRunning),
				ensureRunning: Effect.fn('Ghostty.ensureRunning')(
					() => ensureRunning_
				),
				ensureFrontmost: Effect.fn('Ghostty.ensureFrontmost')(
					() => ensureFrontmost_
				),
				getWindowCount: Effect.fn('Ghostty.getWindowCount')(() =>
					provideExecutor(getWindowCount)
				),

				executeAction: Effect.fn('Ghostty.executeAction')(
					executeAction
				),

				copyToClipboard: Effect.fn('Ghostty.copyToClipboard')(() =>
					executeAction(ActionEnum.CopyToClipboard())
				),
				pasteFromClipboard: Effect.fn('Ghostty.pasteFromClipboard')(
					() => executeAction(ActionEnum.PasteFromClipboard())
				),
				pasteFromSelection: Effect.fn('Ghostty.pasteFromSelection')(
					() => executeAction(ActionEnum.PasteFromSelection())
				),
				copyUrlToClipboard: Effect.fn('Ghostty.copyUrlToClipboard')(
					() => executeAction(ActionEnum.CopyUrlToClipboard())
				),
				copyTitleToClipboard: Effect.fn('Ghostty.copyTitleToClipboard')(
					() => executeAction(ActionEnum.CopyTitleToClipboard())
				),

				increaseFontSize: Effect.fn('Ghostty.increaseFontSize')(
					(amount: number | undefined) =>
						executeAction(
							ActionEnum.IncreaseFontSize({
								amount
							})
						)
				),
				decreaseFontSize: Effect.fn('Ghostty.decreaseFontSize')(
					(amount: number | undefined) =>
						executeAction(
							ActionEnum.DecreaseFontSize({
								amount
							})
						)
				),
				resetFontSize: Effect.fn('Ghostty.resetFontSize')(() =>
					executeAction(ActionEnum.ResetFontSize())
				),
				setFontSize: Effect.fn('Ghostty.setFontSize')((size: number) =>
					executeAction(
						ActionEnum.SetFontSize({
							size
						})
					)
				),

				clearScreen: Effect.fn('Ghostty.clearScreen')(() =>
					executeAction(ActionEnum.ClearScreen())
				),
				selectAll: Effect.fn('Ghostty.selectAll')(() =>
					executeAction(ActionEnum.SelectAll())
				),
				reset: Effect.fn('Ghostty.reset')(() =>
					executeAction(ActionEnum.Reset())
				),

				scrollToTop: Effect.fn('Ghostty.scrollToTop')(() =>
					executeAction(ActionEnum.ScrollToTop())
				),
				scrollToBottom: Effect.fn('Ghostty.scrollToBottom')(() =>
					executeAction(ActionEnum.ScrollToBottom())
				),
				scrollToSelection: Effect.fn('Ghostty.scrollToSelection')(() =>
					executeAction(ActionEnum.ScrollToSelection())
				),
				scrollPageUp: Effect.fn('Ghostty.scrollPageUp')(() =>
					executeAction(ActionEnum.ScrollPageUp())
				),
				scrollPageDown: Effect.fn('Ghostty.scrollPageDown')(() =>
					executeAction(ActionEnum.ScrollPageDown())
				),
				scrollPageFractional: Effect.fn('Ghostty.scrollPageFractional')(
					(fraction: number) =>
						executeAction(
							ActionEnum.ScrollPageFractional({
								fraction
							})
						)
				),
				scrollPageLines: Effect.fn('Ghostty.scrollPageLines')(
					(lines: number) =>
						executeAction(
							ActionEnum.ScrollPageLines({
								lines
							})
						)
				),

				jumpToPrompt: Effect.fn('Ghostty.jumpToPrompt')(
					(delta: number) =>
						executeAction(
							ActionEnum.JumpToPrompt({
								delta
							})
						)
				),

				writeScrollbackFile: Effect.fn('Ghostty.writeScrollbackFile')(
					(action: WriteFileAction) =>
						executeAction(
							ActionEnum.WriteScrollbackFile({
								action
							})
						)
				),
				writeScreenFile: Effect.fn('Ghostty.writeScreenFile')(
					(action: WriteFileAction) =>
						executeAction(
							ActionEnum.WriteScreenFile({
								action
							})
						)
				),
				writeSelectionFile: Effect.fn('Ghostty.writeSelectionFile')(
					(action: WriteFileAction) =>
						executeAction(
							ActionEnum.WriteSelectionFile({
								action
							})
						)
				),

				newWindow: Effect.fn('Ghostty.newWindow')(() =>
					executeAction(ActionEnum.NewWindow())
				),
				closeWindow: Effect.fn('Ghostty.closeWindow')(() =>
					executeAction(ActionEnum.CloseWindow())
				),
				toggleFullscreen: Effect.fn('Ghostty.toggleFullscreen')(() =>
					executeAction(ActionEnum.ToggleFullscreen())
				),
				toggleMaximize: Effect.fn('Ghostty.toggleMaximize')(() =>
					executeAction(ActionEnum.ToggleMaximize())
				),
				resetWindowSize: Effect.fn('Ghostty.resetWindowSize')(() =>
					executeAction(ActionEnum.ResetWindowSize())
				),
				toggleWindowFloatOnTop: Effect.fn(
					'Ghostty.toggleWindowFloatOnTop'
				)(() => executeAction(ActionEnum.ToggleWindowFloatOnTop())),
				toggleWindowDecorations: Effect.fn(
					'Ghostty.toggleWindowDecorations'
				)(() => executeAction(ActionEnum.ToggleWindowDecorations())),

				newTab: Effect.fn('Ghostty.newTab')(() =>
					executeAction(ActionEnum.NewTab())
				),
				closeTab: Effect.fn('Ghostty.closeTab')(
					(mode: string | undefined) =>
						executeAction(
							ActionEnum.CloseTab({
								mode
							})
						)
				),
				nextTab: Effect.fn('Ghostty.nextTab')(() =>
					executeAction(ActionEnum.NextTab())
				),
				previousTab: Effect.fn('Ghostty.previousTab')(() =>
					executeAction(ActionEnum.PreviousTab())
				),
				lastTab: Effect.fn('Ghostty.lastTab')(() =>
					executeAction(ActionEnum.LastTab())
				),
				gotoTab: Effect.fn('Ghostty.gotoTab')((index: number) =>
					executeAction(
						ActionEnum.GotoTab({
							index
						})
					)
				),
				moveTab: Effect.fn('Ghostty.moveTab')((offset: number) =>
					executeAction(
						ActionEnum.MoveTab({
							offset
						})
					)
				),
				toggleTabOverview: Effect.fn('Ghostty.toggleTabOverview')(() =>
					executeAction(ActionEnum.ToggleTabOverview())
				),

				newSplit: Effect.fn('Ghostty.newSplit')(
					(direction: SplitDirection) =>
						executeAction(
							ActionEnum.NewSplit({
								direction
							})
						)
				),
				gotoSplit: Effect.fn('Ghostty.gotoSplit')(
					(direction: GotoSplitDirection) =>
						executeAction(
							ActionEnum.GotoSplit({
								direction
							})
						)
				),
				toggleSplitZoom: Effect.fn('Ghostty.toggleSplitZoom')(() =>
					executeAction(ActionEnum.ToggleSplitZoom())
				),
				resizeSplit: Effect.fn('Ghostty.resizeSplit')(
					(direction: ResizeDirection, amount: number) =>
						executeAction(
							ActionEnum.ResizeSplit({
								direction,
								amount
							})
						)
				),
				equalizeSplits: Effect.fn('Ghostty.equalizeSplits')(() =>
					executeAction(ActionEnum.EqualizeSplits())
				),
				closeSurface: Effect.fn('Ghostty.closeSurface')(() =>
					executeAction(ActionEnum.CloseSurface())
				),

				splitHorizontal: Effect.fn('Ghostty.splitHorizontal')(() =>
					executeAction(
						ActionEnum.NewSplit({
							direction: 'down'
						})
					)
				),
				splitVertical: Effect.fn('Ghostty.splitVertical')(() =>
					executeAction(
						ActionEnum.NewSplit({
							direction: 'right'
						})
					)
				),
				closeCurrentPane: Effect.fn('Ghostty.closeCurrentPane')(() =>
					executeAction(ActionEnum.CloseSurface())
				),

				toggleQuickTerminal: Effect.fn('Ghostty.toggleQuickTerminal')(
					() => executeAction(ActionEnum.ToggleQuickTerminal())
				),

				toggleVisibility: Effect.fn('Ghostty.toggleVisibility')(() =>
					executeAction(ActionEnum.ToggleVisibility())
				),

				reloadConfig: Effect.fn('Ghostty.reloadConfig')(() =>
					executeAction(ActionEnum.ReloadConfig())
				),
				openConfig: Effect.fn('Ghostty.openConfig')(() =>
					executeAction(ActionEnum.OpenConfig())
				),

				inspector: Effect.fn('Ghostty.inspector')(
					(mode: InspectorMode) =>
						executeAction(
							ActionEnum.Inspector({
								mode
							})
						)
				),

				sendText: Effect.fn('Ghostty.sendText')((text: string) =>
					executeAction(
						ActionEnum.Text({
							text
						})
					)
				),
				sendCsi: Effect.fn('Ghostty.sendCsi')((sequence: string) =>
					executeAction(
						ActionEnum.Csi({
							sequence
						})
					)
				),
				sendEsc: Effect.fn('Ghostty.sendEsc')((sequence: string) =>
					executeAction(
						ActionEnum.Esc({
							sequence
						})
					)
				),
				typeText: Effect.fn('Ghostty.typeText')((text: string) =>
					provideExecutor(typeText(text))
				),
				sendKeys: Effect.fn('Ghostty.sendKeys')(
					(keys: string, modifiers: string[]) =>
						provideExecutor(sendKeys(keys, modifiers))
				),

				toggleSecureInput: Effect.fn('Ghostty.toggleSecureInput')(() =>
					executeAction(ActionEnum.ToggleSecureInput())
				),

				toggleCommandPalette: Effect.fn('Ghostty.toggleCommandPalette')(
					() => executeAction(ActionEnum.ToggleCommandPalette())
				),

				undo: Effect.fn('Ghostty.undo')(() =>
					executeAction(ActionEnum.Undo())
				),
				redo: Effect.fn('Ghostty.redo')(() =>
					executeAction(ActionEnum.Redo())
				),

				quit: Effect.fn('Ghostty.quit')(() =>
					executeAction(ActionEnum.Quit())
				),

				runScript: Effect.fn('Ghostty.runScript')(
					(...statements: string[]) =>
						provideExecutor(runScriptString(...statements))
				)
			};
		})
	}
) {
	static readonly layer = Layer.effect(this, this.make).pipe(
		Layer.provide(BunServices.layer)
	);
}

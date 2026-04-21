import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import type { PlatformError } from 'effect/PlatformError';
import * as P from 'effect/Predicate';
import * as R from 'effect/Record';
import * as Context from 'effect/Context';
import * as ChildProcess from 'effect/unstable/process/ChildProcess';
import * as ChildProcessSpawner from 'effect/unstable/process/ChildProcessSpawner';

import {
	Action,
	type Action as ActionType,
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
	statements.flatMap((statement) => ['-e', statement]);

const runScriptVoid = Effect.fn('Ghostty.runScriptVoid')(
	(...statements: string[]) =>
		Effect.gen(function* () {
			const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
			const command = ChildProcess.make(
				'osascript',
				osascriptArgs(...statements)
			);
			yield* spawner.exitCode(command);
		})
);

const runScriptString = Effect.fn('Ghostty.runScriptString')(
	(...statements: string[]) =>
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
		})
);

const _runScriptBoolean = Effect.fn('Ghostty.runScriptBoolean')(
	(...statements: string[]) =>
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
		})
);

const isGhosttyRunning = Effect.fn('Ghostty.isGhosttyRunning')(() =>
	Effect.gen(function* () {
		const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
		const command = ChildProcess.make('pgrep', ['-f', 'Ghostty']);
		return yield* spawner.exitCode(command).pipe(
			Effect.map((code) => code === 0),
			Effect.catchTag('PlatformError', () => Effect.succeed(false))
		);
	})
);

const ensureRunning = Effect.fn('Ghostty.ensureRunning')(() =>
	Effect.gen(function* () {
		const running = yield* isGhosttyRunning();
		if (!running) {
			const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
			yield* spawner.exitCode(
				ChildProcess.make('open', ['-a', 'Ghostty'])
			);
		}
	})
);

const ensureFrontmost = Effect.fn('Ghostty.ensureFrontmost')(() =>
	Effect.gen(function* () {
		yield* ensureRunning();
		yield* runScriptVoid(
			'tell application "Ghostty"',
			'activate',
			'end tell'
		);
	})
);

const getWindowCount = Effect.fn('Ghostty.getWindowCount')(() =>
	Effect.gen(function* () {
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
	})
);

const _newWindow = Effect.fn('Ghostty._newWindow')(() =>
	Effect.gen(function* () {
		yield* ensureRunning();
		yield* runScriptVoid(
			'tell application "Ghostty"',
			'activate',
			'tell application "System Events"',
			'keystroke "n" using command down',
			'end tell',
			'end tell'
		);
	})
);

const _newTab = Effect.fn('Ghostty._newTab')(() =>
	Effect.gen(function* () {
		yield* ensureFrontmost();
		yield* runScriptVoid(
			'tell application "System Events"',
			'keystroke "t" using command down',
			'end tell'
		);
	})
);

const _splitHorizontal = Effect.fn('Ghostty._splitHorizontal')(() =>
	Effect.gen(function* () {
		yield* ensureFrontmost();
		yield* runScriptVoid(
			'tell application "System Events"',
			'keystroke "d" using {command down, shift down}',
			'end tell'
		);
	})
);

const _splitVertical = Effect.fn('Ghostty._splitVertical')(() =>
	Effect.gen(function* () {
		yield* ensureFrontmost();
		yield* runScriptVoid(
			'tell application "System Events"',
			'keystroke "d" using command down',
			'end tell'
		);
	})
);

const _closeCurrentPane = Effect.fn('Ghostty._closeCurrentPane')(() =>
	Effect.gen(function* () {
		yield* ensureFrontmost();
		yield* runScriptVoid(
			'tell application "System Events"',
			'keystroke "w" using command down',
			'end tell'
		);
	})
);

const typeText = Effect.fn('Ghostty.typeText')((text: string) =>
	Effect.gen(function* () {
		yield* ensureFrontmost();
		const escaped = text.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
		yield* runScriptVoid(
			'tell application "System Events"',
			`keystroke "${escaped}"`,
			'end tell'
		);
	})
);

const sendKeys = Effect.fn('Ghostty.sendKeys')(
	(keys: string, modifiers: string[] = []) =>
		Effect.gen(function* () {
			yield* ensureFrontmost();
			const modStr =
				modifiers.length > 0
					? ` using {${modifiers.map((m) => `${m} down`).join(', ')}}`
					: '';
			yield* runScriptVoid(
				'tell application "System Events"',
				`keystroke "${keys}"${modStr}`,
				'end tell'
			);
		})
);

// --- Inlined from internal/cli.ts ---

const runGhosttyCommand = Effect.fn('Ghostty.runGhosttyCommand')(
	(
		args: ReadonlyArray<string>
	): Effect.Effect<
		string,
		GhosttyCliError,
		ChildProcessSpawner.ChildProcessSpawner
	> =>
		Effect.gen(function* () {
			const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
			const command = ChildProcess.make('ghostty', [...args]);
			return yield* spawner.string(command).pipe(
				Effect.map((s) => s.trim()),
				Effect.mapError(
					(error) =>
						new GhosttyCliErrorClass({
							command: `ghostty ${args.join(' ')}`,
							exitCode:
								'exitCode' in error &&
								P.isNumber(error.exitCode)
									? error.exitCode
									: 1,
							stderr: error.message
						})
				)
			);
		})
);

const isGhosttyInstalled = Effect.fn('Ghostty.isGhosttyInstalled')(
	(): Effect.Effect<
		boolean,
		never,
		ChildProcessSpawner.ChildProcessSpawner
	> =>
		Effect.gen(function* () {
			const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
			const command = ChildProcess.make('which', ['ghostty']);
			return yield* spawner.exitCode(command).pipe(
				Effect.map((code) => code === 0),
				// intentional: recover from any error with default
				Effect.catchTag('PlatformError', () => Effect.succeed(false))
			);
		})
);

const getGhosttyVersion = Effect.fn('Ghostty.getGhosttyVersion')(
	(): Effect.Effect<
		string,
		GhosttyNotInstalled | GhosttyCliError,
		ChildProcessSpawner.ChildProcessSpawner
	> =>
		Effect.gen(function* () {
			const installed = yield* isGhosttyInstalled();
			if (!installed) {
				return yield* new GhosttyNotInstalledClass({
					message: 'Ghostty CLI is not installed or not in PATH'
				});
			}
			return yield* runGhosttyCommand(['+version']);
		})
);

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

const defaultKeystrokeMappings: Record<string, KeystrokeMapping> = {
	CopyToClipboard: {
		key: 'c',
		modifiers: ['command']
	},
	PasteFromClipboard: {
		key: 'v',
		modifiers: ['command']
	},
	NewWindow: {
		key: 'n',
		modifiers: ['command']
	},
	NewTab: {
		key: 't',
		modifiers: ['command']
	},
	CloseSurface: {
		key: 'w',
		modifiers: ['command']
	},
	CloseWindow: {
		key: 'w',
		modifiers: ['command', 'shift']
	},
	CloseTab: {
		key: 'w',
		modifiers: ['command', 'shift']
	},
	NextTab: {
		key: ']',
		modifiers: ['command', 'shift']
	},
	PreviousTab: {
		key: '[',
		modifiers: ['command', 'shift']
	},
	ToggleFullscreen: {
		key: 'return',
		modifiers: ['command']
	},
	ReloadConfig: {
		key: ',',
		modifiers: ['command', 'shift']
	},
	OpenConfig: {
		key: ',',
		modifiers: ['command']
	},
	IncreaseFontSize: {
		key: '+',
		modifiers: ['command']
	},
	DecreaseFontSize: {
		key: '-',
		modifiers: ['command']
	},
	ResetFontSize: {
		key: '0',
		modifiers: ['command']
	},
	ClearScreen: {
		key: 'k',
		modifiers: ['command']
	},
	SelectAll: {
		key: 'a',
		modifiers: ['command']
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
		modifiers: ['command']
	},
	ScrollToBottom: {
		key: 'end',
		modifiers: ['command']
	},
	ToggleSplitZoom: {
		key: 'return',
		modifiers: ['command', 'shift']
	},
	EqualizeSplits: {
		key: '=',
		modifiers: ['command', 'shift']
	},
	ToggleQuickTerminal: {
		key: '`',
		modifiers: ['command']
	},
	ToggleCommandPalette: {
		key: 'p',
		modifiers: ['command', 'shift']
	},
	Undo: {
		key: 'z',
		modifiers: ['command']
	},
	Redo: {
		key: 'z',
		modifiers: ['command', 'shift']
	},
	Quit: {
		key: 'q',
		modifiers: ['command']
	}
};

const splitDirectionMappings: Record<SplitDirection, KeystrokeMapping> = {
	right: {
		key: 'd',
		modifiers: ['command']
	},
	down: {
		key: 'd',
		modifiers: ['command', 'shift']
	},
	left: {
		key: 'd',
		modifiers: ['command']
	},
	up: {
		key: 'd',
		modifiers: ['command', 'shift']
	},
	auto: {
		key: 'd',
		modifiers: ['command']
	}
};

const gotoSplitMappings: Record<GotoSplitDirection, KeystrokeMapping> = {
	previous: {
		key: '[',
		modifiers: ['command']
	},
	next: {
		key: ']',
		modifiers: ['command']
	},
	left: {
		key: 'left',
		modifiers: ['command', 'option']
	},
	right: {
		key: 'right',
		modifiers: ['command', 'option']
	},
	up: {
		key: 'up',
		modifiers: ['command', 'option']
	},
	down: {
		key: 'down',
		modifiers: ['command', 'option']
	}
};

const gotoTabMappings: Record<number, KeystrokeMapping> = {
	1: { key: '1', modifiers: ['command'] },
	2: { key: '2', modifiers: ['command'] },
	3: { key: '3', modifiers: ['command'] },
	4: { key: '4', modifiers: ['command'] },
	5: { key: '5', modifiers: ['command'] },
	6: { key: '6', modifiers: ['command'] },
	7: { key: '7', modifiers: ['command'] },
	8: { key: '8', modifiers: ['command'] },
	9: { key: '9', modifiers: ['command'] }
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

/** Look up a default keystroke mapping by action tag, failing if absent. */
const requireDefaultKeystroke = (
	tag: string,
	action: ActionType
): Effect.Effect<KeystrokeMapping, GhosttyActionFailed> =>
	Option.match(R.get(defaultKeystrokeMappings, tag), {
		onNone: () =>
			Effect.fail(
				new GhosttyActionFailed({
					action: actionToKeybindString(action),
					reason: `${tag} has no default macOS keybind`
				})
			),
		onSome: Effect.succeed
	});

export class Ghostty extends Context.Service<Ghostty>()(
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

			const isInstalled = provideExecutor(isGhosttyInstalled());
			const version = provideExecutor(getGhosttyVersion());
			const listThemes = provideExecutor(
				runGhosttyCommand(['+list-themes']).pipe(
					Effect.map(parseThemeList)
				)
			);
			const listFonts = provideExecutor(
				runGhosttyCommand(['+list-fonts']).pipe(
					Effect.map(parseFontList)
				)
			);
			const listKeybinds = provideExecutor(
				runGhosttyCommand(['+list-keybinds']).pipe(
					Effect.map(parseKeybindList)
				)
			);
			const listDefaultKeybinds = provideExecutor(
				runGhosttyCommand(['+list-keybinds', '--default']).pipe(
					Effect.map(parseKeybindList)
				)
			);
			const listActions = provideExecutor(
				runGhosttyCommand(['+list-actions']).pipe(
					Effect.map(parseActionList)
				)
			);
			const showConfig = provideExecutor(
				runGhosttyCommand(['+show-config'])
			);
			const showDefaultConfig = provideExecutor(
				runGhosttyCommand(['+show-config', '--default', '--docs'])
			);
			const validateConfig = provideExecutor(
				runGhosttyCommand(['+validate-config']).pipe(
					Effect.map(() => true),
					Effect.catchTag('GhosttyCliError', (e) =>
						e.exitCode === 0
							? Effect.succeed(true)
							: Effect.succeed(false)
					)
				)
			);

			const isRunning = provideExecutor(isGhosttyRunning());
			const ensureRunning_ = provideExecutor(ensureRunning());
			const ensureFrontmost_ = provideExecutor(ensureFrontmost());

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

			const failAction = (action: ActionType, reason: string) =>
				Effect.fail(
					new GhosttyActionFailed({
						action: actionToKeybindString(action),
						reason
					})
				);

			const executeActionViaKeystroke = (
				action: ActionType
			): Effect.Effect<void, GhosttyActionError> =>
				Action.match(action, {
					CopyToClipboard: () =>
						requireDefaultKeystroke('CopyToClipboard', action).pipe(
							Effect.flatMap(executeKeystroke)
						),
					PasteFromClipboard: () =>
						requireDefaultKeystroke(
							'PasteFromClipboard',
							action
						).pipe(Effect.flatMap(executeKeystroke)),
					PasteFromSelection: () =>
						failAction(
							action,
							'paste_from_selection has no default macOS keybind'
						),
					CopyUrlToClipboard: () =>
						failAction(
							action,
							'copy_url_to_clipboard has no default macOS keybind'
						),
					CopyTitleToClipboard: () =>
						failAction(
							action,
							'copy_title_to_clipboard has no default macOS keybind'
						),

					IncreaseFontSize: () =>
						requireDefaultKeystroke(
							'IncreaseFontSize',
							action
						).pipe(Effect.flatMap(executeKeystroke)),
					DecreaseFontSize: () =>
						requireDefaultKeystroke(
							'DecreaseFontSize',
							action
						).pipe(Effect.flatMap(executeKeystroke)),
					ResetFontSize: () =>
						requireDefaultKeystroke('ResetFontSize', action).pipe(
							Effect.flatMap(executeKeystroke)
						),
					SetFontSize: ({ size }) =>
						failAction(
							Action.cases.SetFontSize.make({ size }),
							'set_font_size requires configuration, no default keybind'
						),

					ClearScreen: () =>
						requireDefaultKeystroke('ClearScreen', action).pipe(
							Effect.flatMap(executeKeystroke)
						),
					SelectAll: () =>
						requireDefaultKeystroke('SelectAll', action).pipe(
							Effect.flatMap(executeKeystroke)
						),
					Reset: () =>
						failAction(
							action,
							'reset has no default macOS keybind'
						),

					ScrollToTop: () =>
						requireDefaultKeystroke('ScrollToTop', action).pipe(
							Effect.flatMap(executeKeystroke)
						),
					ScrollToBottom: () =>
						requireDefaultKeystroke('ScrollToBottom', action).pipe(
							Effect.flatMap(executeKeystroke)
						),
					ScrollToSelection: () =>
						failAction(
							action,
							'scroll_to_selection has no default macOS keybind'
						),
					ScrollPageUp: () =>
						requireDefaultKeystroke('ScrollPageUp', action).pipe(
							Effect.flatMap(executeKeystroke)
						),
					ScrollPageDown: () =>
						requireDefaultKeystroke('ScrollPageDown', action).pipe(
							Effect.flatMap(executeKeystroke)
						),
					ScrollPageFractional: ({ fraction }) =>
						failAction(
							Action.cases.ScrollPageFractional.make({
								fraction
							}),
							'scroll_page_fractional requires configuration, no default keybind'
						),
					ScrollPageLines: ({ lines }) =>
						failAction(
							Action.cases.ScrollPageLines.make({ lines }),
							'scroll_page_lines requires configuration, no default keybind'
						),

					AdjustSelection: ({ direction }) =>
						failAction(
							Action.cases.AdjustSelection.make({
								direction
							}),
							'adjust_selection requires configuration, no default keybind'
						),

					JumpToPrompt: ({ delta }) =>
						failAction(
							Action.cases.JumpToPrompt.make({ delta }),
							'jump_to_prompt requires configuration, no default keybind'
						),

					WriteScrollbackFile: ({ action: fileAction }) =>
						failAction(
							Action.cases.WriteScrollbackFile.make({
								action: fileAction
							}),
							'write_scrollback_file requires configuration, no default keybind'
						),
					WriteScreenFile: ({ action: fileAction }) =>
						failAction(
							Action.cases.WriteScreenFile.make({
								action: fileAction
							}),
							'write_screen_file requires configuration, no default keybind'
						),
					WriteSelectionFile: ({ action: fileAction }) =>
						failAction(
							Action.cases.WriteSelectionFile.make({
								action: fileAction
							}),
							'write_selection_file requires configuration, no default keybind'
						),

					NewWindow: () =>
						requireDefaultKeystroke('NewWindow', action).pipe(
							Effect.flatMap(executeKeystroke)
						),
					CloseWindow: () =>
						requireDefaultKeystroke('CloseWindow', action).pipe(
							Effect.flatMap(executeKeystroke)
						),
					ToggleFullscreen: () =>
						requireDefaultKeystroke(
							'ToggleFullscreen',
							action
						).pipe(Effect.flatMap(executeKeystroke)),
					ToggleMaximize: () =>
						failAction(
							action,
							'toggle_maximize has no default macOS keybind'
						),
					ResetWindowSize: () =>
						failAction(
							action,
							'reset_window_size has no default macOS keybind'
						),
					ToggleWindowFloatOnTop: () =>
						failAction(
							action,
							'toggle_window_float_on_top has no default macOS keybind'
						),
					ToggleWindowDecorations: () =>
						failAction(
							action,
							'toggle_window_decorations has no default macOS keybind'
						),

					NewTab: () =>
						requireDefaultKeystroke('NewTab', action).pipe(
							Effect.flatMap(executeKeystroke)
						),
					CloseTab: () =>
						requireDefaultKeystroke('CloseTab', action).pipe(
							Effect.flatMap(executeKeystroke)
						),
					NextTab: () =>
						requireDefaultKeystroke('NextTab', action).pipe(
							Effect.flatMap(executeKeystroke)
						),
					PreviousTab: () =>
						requireDefaultKeystroke('PreviousTab', action).pipe(
							Effect.flatMap(executeKeystroke)
						),
					LastTab: () =>
						failAction(
							action,
							'last_tab has no default macOS keybind'
						),
					GotoTab: ({ index }) => {
						const mapping = gotoTabMappings[index];
						if (mapping) {
							return executeKeystroke(mapping);
						}
						return failAction(
							Action.cases.GotoTab.make({ index }),
							`goto_tab:${index} has no default keybind (only 1-9 supported)`
						);
					},
					MoveTab: ({ offset }) =>
						failAction(
							Action.cases.MoveTab.make({ offset }),
							'move_tab requires configuration, no default keybind'
						),
					ToggleTabOverview: () =>
						failAction(
							action,
							'toggle_tab_overview has no default macOS keybind'
						),
					PromptSurfaceTitle: () =>
						failAction(
							action,
							'prompt_surface_title has no default macOS keybind'
						),

					NewSplit: ({ direction }) =>
						executeKeystroke(splitDirectionMappings[direction]),
					GotoSplit: ({ direction }) =>
						executeKeystroke(gotoSplitMappings[direction]),
					ToggleSplitZoom: () =>
						requireDefaultKeystroke('ToggleSplitZoom', action).pipe(
							Effect.flatMap(executeKeystroke)
						),
					ResizeSplit: ({ direction, amount }) =>
						failAction(
							Action.cases.ResizeSplit.make({
								direction,
								amount
							}),
							'resize_split requires configuration, no default keybind'
						),
					EqualizeSplits: () =>
						requireDefaultKeystroke('EqualizeSplits', action).pipe(
							Effect.flatMap(executeKeystroke)
						),
					CloseSurface: () =>
						requireDefaultKeystroke('CloseSurface', action).pipe(
							Effect.flatMap(executeKeystroke)
						),

					ToggleQuickTerminal: () =>
						requireDefaultKeystroke(
							'ToggleQuickTerminal',
							action
						).pipe(Effect.flatMap(executeKeystroke)),

					ToggleVisibility: () =>
						failAction(
							action,
							'toggle_visibility has no default macOS keybind'
						),

					ReloadConfig: () =>
						requireDefaultKeystroke('ReloadConfig', action).pipe(
							Effect.flatMap(executeKeystroke)
						),
					OpenConfig: () =>
						requireDefaultKeystroke('OpenConfig', action).pipe(
							Effect.flatMap(executeKeystroke)
						),

					Inspector: ({ mode }) =>
						failAction(
							Action.cases.Inspector.make({ mode }),
							'inspector requires configuration, no default keybind'
						),
					ShowGtkInspector: () =>
						failAction(action, 'show_gtk_inspector is Linux-only'),

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
						failAction(
							Action.cases.Csi.make({ sequence }),
							'csi sequences cannot be sent via AppleScript keystroke'
						),
					Esc: ({ sequence }) =>
						failAction(
							Action.cases.Esc.make({ sequence }),
							'esc sequences cannot be sent via AppleScript keystroke'
						),
					CursorKey: ({ mode }) =>
						failAction(
							Action.cases.CursorKey.make({ mode }),
							'cursor_key mode cannot be set via AppleScript'
						),

					ToggleSecureInput: () =>
						failAction(
							action,
							'toggle_secure_input has no default macOS keybind'
						),

					ToggleCommandPalette: () =>
						requireDefaultKeystroke(
							'ToggleCommandPalette',
							action
						).pipe(Effect.flatMap(executeKeystroke)),

					Undo: () =>
						requireDefaultKeystroke('Undo', action).pipe(
							Effect.flatMap(executeKeystroke)
						),
					Redo: () =>
						requireDefaultKeystroke('Redo', action).pipe(
							Effect.flatMap(executeKeystroke)
						),

					Quit: () =>
						requireDefaultKeystroke('Quit', action).pipe(
							Effect.flatMap(executeKeystroke)
						),
					Ignore: () => Effect.void,
					Unbind: () => Effect.void
				});

			const executeAction = (action: ActionType) =>
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
					provideExecutor(getWindowCount())
				),

				executeAction: Effect.fn('Ghostty.executeAction')(
					executeAction
				),

				copyToClipboard: Effect.fn('Ghostty.copyToClipboard')(() =>
					executeAction(Action.cases.CopyToClipboard.make({}))
				),
				pasteFromClipboard: Effect.fn('Ghostty.pasteFromClipboard')(
					() =>
						executeAction(
							Action.cases.PasteFromClipboard.make({})
						)
				),
				pasteFromSelection: Effect.fn('Ghostty.pasteFromSelection')(
					() =>
						executeAction(
							Action.cases.PasteFromSelection.make({})
						)
				),
				copyUrlToClipboard: Effect.fn('Ghostty.copyUrlToClipboard')(
					() =>
						executeAction(
							Action.cases.CopyUrlToClipboard.make({})
						)
				),
				copyTitleToClipboard: Effect.fn('Ghostty.copyTitleToClipboard')(
					() =>
						executeAction(
							Action.cases.CopyTitleToClipboard.make({})
						)
				),

				increaseFontSize: Effect.fn('Ghostty.increaseFontSize')(
					(amount: Option.Option<number>) =>
						executeAction(
							Action.cases.IncreaseFontSize.make({
								amount
							})
						)
				),
				decreaseFontSize: Effect.fn('Ghostty.decreaseFontSize')(
					(amount: Option.Option<number>) =>
						executeAction(
							Action.cases.DecreaseFontSize.make({
								amount
							})
						)
				),
				resetFontSize: Effect.fn('Ghostty.resetFontSize')(() =>
					executeAction(Action.cases.ResetFontSize.make({}))
				),
				setFontSize: Effect.fn('Ghostty.setFontSize')((size: number) =>
					executeAction(Action.cases.SetFontSize.make({ size }))
				),

				clearScreen: Effect.fn('Ghostty.clearScreen')(() =>
					executeAction(Action.cases.ClearScreen.make({}))
				),
				selectAll: Effect.fn('Ghostty.selectAll')(() =>
					executeAction(Action.cases.SelectAll.make({}))
				),
				reset: Effect.fn('Ghostty.reset')(() =>
					executeAction(Action.cases.Reset.make({}))
				),

				scrollToTop: Effect.fn('Ghostty.scrollToTop')(() =>
					executeAction(Action.cases.ScrollToTop.make({}))
				),
				scrollToBottom: Effect.fn('Ghostty.scrollToBottom')(() =>
					executeAction(Action.cases.ScrollToBottom.make({}))
				),
				scrollToSelection: Effect.fn('Ghostty.scrollToSelection')(() =>
					executeAction(Action.cases.ScrollToSelection.make({}))
				),
				scrollPageUp: Effect.fn('Ghostty.scrollPageUp')(() =>
					executeAction(Action.cases.ScrollPageUp.make({}))
				),
				scrollPageDown: Effect.fn('Ghostty.scrollPageDown')(() =>
					executeAction(Action.cases.ScrollPageDown.make({}))
				),
				scrollPageFractional: Effect.fn('Ghostty.scrollPageFractional')(
					(fraction: number) =>
						executeAction(
							Action.cases.ScrollPageFractional.make({
								fraction
							})
						)
				),
				scrollPageLines: Effect.fn('Ghostty.scrollPageLines')(
					(lines: number) =>
						executeAction(
							Action.cases.ScrollPageLines.make({ lines })
						)
				),

				jumpToPrompt: Effect.fn('Ghostty.jumpToPrompt')(
					(delta: number) =>
						executeAction(
							Action.cases.JumpToPrompt.make({ delta })
						)
				),

				writeScrollbackFile: Effect.fn('Ghostty.writeScrollbackFile')(
					(action: WriteFileAction) =>
						executeAction(
							Action.cases.WriteScrollbackFile.make({
								action
							})
						)
				),
				writeScreenFile: Effect.fn('Ghostty.writeScreenFile')(
					(action: WriteFileAction) =>
						executeAction(
							Action.cases.WriteScreenFile.make({
								action
							})
						)
				),
				writeSelectionFile: Effect.fn('Ghostty.writeSelectionFile')(
					(action: WriteFileAction) =>
						executeAction(
							Action.cases.WriteSelectionFile.make({
								action
							})
						)
				),

				newWindow: Effect.fn('Ghostty.newWindow')(() =>
					executeAction(Action.cases.NewWindow.make({}))
				),
				closeWindow: Effect.fn('Ghostty.closeWindow')(() =>
					executeAction(Action.cases.CloseWindow.make({}))
				),
				toggleFullscreen: Effect.fn('Ghostty.toggleFullscreen')(() =>
					executeAction(Action.cases.ToggleFullscreen.make({}))
				),
				toggleMaximize: Effect.fn('Ghostty.toggleMaximize')(() =>
					executeAction(Action.cases.ToggleMaximize.make({}))
				),
				resetWindowSize: Effect.fn('Ghostty.resetWindowSize')(() =>
					executeAction(Action.cases.ResetWindowSize.make({}))
				),
				toggleWindowFloatOnTop: Effect.fn(
					'Ghostty.toggleWindowFloatOnTop'
				)(() =>
					executeAction(
						Action.cases.ToggleWindowFloatOnTop.make({})
					)
				),
				toggleWindowDecorations: Effect.fn(
					'Ghostty.toggleWindowDecorations'
				)(() =>
					executeAction(
						Action.cases.ToggleWindowDecorations.make({})
					)
				),

				newTab: Effect.fn('Ghostty.newTab')(() =>
					executeAction(Action.cases.NewTab.make({}))
				),
				closeTab: Effect.fn('Ghostty.closeTab')(
					(mode: Option.Option<string>) =>
						executeAction(
							Action.cases.CloseTab.make({ mode })
						)
				),
				nextTab: Effect.fn('Ghostty.nextTab')(() =>
					executeAction(Action.cases.NextTab.make({}))
				),
				previousTab: Effect.fn('Ghostty.previousTab')(() =>
					executeAction(Action.cases.PreviousTab.make({}))
				),
				lastTab: Effect.fn('Ghostty.lastTab')(() =>
					executeAction(Action.cases.LastTab.make({}))
				),
				gotoTab: Effect.fn('Ghostty.gotoTab')((index: number) =>
					executeAction(Action.cases.GotoTab.make({ index }))
				),
				moveTab: Effect.fn('Ghostty.moveTab')((offset: number) =>
					executeAction(Action.cases.MoveTab.make({ offset }))
				),
				toggleTabOverview: Effect.fn('Ghostty.toggleTabOverview')(() =>
					executeAction(Action.cases.ToggleTabOverview.make({}))
				),

				newSplit: Effect.fn('Ghostty.newSplit')(
					(direction: SplitDirection) =>
						executeAction(
							Action.cases.NewSplit.make({ direction })
						)
				),
				gotoSplit: Effect.fn('Ghostty.gotoSplit')(
					(direction: GotoSplitDirection) =>
						executeAction(
							Action.cases.GotoSplit.make({ direction })
						)
				),
				toggleSplitZoom: Effect.fn('Ghostty.toggleSplitZoom')(() =>
					executeAction(Action.cases.ToggleSplitZoom.make({}))
				),
				resizeSplit: Effect.fn('Ghostty.resizeSplit')(
					(direction: ResizeDirection, amount: number) =>
						executeAction(
							Action.cases.ResizeSplit.make({
								direction,
								amount
							})
						)
				),
				equalizeSplits: Effect.fn('Ghostty.equalizeSplits')(() =>
					executeAction(Action.cases.EqualizeSplits.make({}))
				),
				closeSurface: Effect.fn('Ghostty.closeSurface')(() =>
					executeAction(Action.cases.CloseSurface.make({}))
				),

				splitHorizontal: Effect.fn('Ghostty.splitHorizontal')(() =>
					executeAction(
						Action.cases.NewSplit.make({
							direction: 'down'
						})
					)
				),
				splitVertical: Effect.fn('Ghostty.splitVertical')(() =>
					executeAction(
						Action.cases.NewSplit.make({
							direction: 'right'
						})
					)
				),
				closeCurrentPane: Effect.fn('Ghostty.closeCurrentPane')(() =>
					executeAction(Action.cases.CloseSurface.make({}))
				),

				toggleQuickTerminal: Effect.fn('Ghostty.toggleQuickTerminal')(
					() =>
						executeAction(
							Action.cases.ToggleQuickTerminal.make({})
						)
				),

				toggleVisibility: Effect.fn('Ghostty.toggleVisibility')(() =>
					executeAction(Action.cases.ToggleVisibility.make({}))
				),

				reloadConfig: Effect.fn('Ghostty.reloadConfig')(() =>
					executeAction(Action.cases.ReloadConfig.make({}))
				),
				openConfig: Effect.fn('Ghostty.openConfig')(() =>
					executeAction(Action.cases.OpenConfig.make({}))
				),

				inspector: Effect.fn('Ghostty.inspector')(
					(mode: InspectorMode) =>
						executeAction(
							Action.cases.Inspector.make({ mode })
						)
				),

				sendText: Effect.fn('Ghostty.sendText')((text: string) =>
					executeAction(Action.cases.Text.make({ text }))
				),
				sendCsi: Effect.fn('Ghostty.sendCsi')((sequence: string) =>
					executeAction(Action.cases.Csi.make({ sequence }))
				),
				sendEsc: Effect.fn('Ghostty.sendEsc')((sequence: string) =>
					executeAction(Action.cases.Esc.make({ sequence }))
				),
				typeText: Effect.fn('Ghostty.typeText')((text: string) =>
					provideExecutor(typeText(text))
				),
				sendKeys: Effect.fn('Ghostty.sendKeys')(
					(keys: string, modifiers: string[]) =>
						provideExecutor(sendKeys(keys, modifiers))
				),

				toggleSecureInput: Effect.fn('Ghostty.toggleSecureInput')(() =>
					executeAction(Action.cases.ToggleSecureInput.make({}))
				),

				toggleCommandPalette: Effect.fn('Ghostty.toggleCommandPalette')(
					() =>
						executeAction(
							Action.cases.ToggleCommandPalette.make({})
						)
				),

				undo: Effect.fn('Ghostty.undo')(() =>
					executeAction(Action.cases.Undo.make({}))
				),
				redo: Effect.fn('Ghostty.redo')(() =>
					executeAction(Action.cases.Redo.make({}))
				),

				quit: Effect.fn('Ghostty.quit')(() =>
					executeAction(Action.cases.Quit.make({}))
				),

				runScript: Effect.fn('Ghostty.runScript')(
					(...statements: string[]) =>
						provideExecutor(runScriptString(...statements))
				)
			};
		})
	}
) {
	static readonly layer = Layer.effect(this, this.make);
}

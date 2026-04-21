/**
 * ZellijAction — thin, exhaustive wrappers over every `zellij action <verb>`
 * subcommand.
 *
 * Each exported function is a 1:1 mapping of a CLI verb. Argument parsing,
 * stdout capture, and error mapping are delegated to the {@link ZellijCli}
 * service, so every function here is pure argv construction + one CLI call.
 *
 * This namespace is the broadest, lowest-level slice of the package. Higher-
 * level namespaces ({@link ../ZellijPane}, `ZellijTab`, `ZellijSession`)
 * delegate *to* these functions and add decoding, defaults, and ergonomic
 * types on top.
 *
 * Return-type convention:
 *
 * - Mutation actions (most verbs) → `Effect<void, ZellijError>`
 * - Actions that return an id/data on stdout (`new-pane`, `list-panes`,
 *   `query-tab-names`, …) → `Effect<string, ZellijError>`. Callers parse
 *   further if needed; `ZellijPane.new` etc. do this automatically.
 * - Actions that signal state via the exit code
 *   (`are-floating-panes-visible`, `show-floating-panes`,
 *   `hide-floating-panes`) → `Effect<number, ZellijError>`. Zero/non-zero
 *   carry meaning that {@link ZellijCli.exit} preserves.
 *
 * Every function takes an optional trailing `options` object whose fields
 * include the action's own flags plus `session?: SessionName` to target a
 * session other than the caller's default.
 *
 * @since 0.1.0
 */

import { Effect } from 'effect';
import * as Arr from 'effect/Array';
import * as R from 'effect/Record';

import * as BlockStrategy from './schemas/BlockStrategy.ts';
import type * as Direction from './schemas/Direction.ts';
import type * as Mode from './schemas/Mode.ts';
import * as PaneId from './schemas/PaneId.ts';
import * as PaneSize from './schemas/PaneSize.ts';
import type * as ResizeDirection from './schemas/ResizeDirection.ts';
import type * as SessionName from './schemas/SessionName.ts';
import type * as TabId from './schemas/TabId.ts';
import * as ZellijCli from './ZellijCli.ts';
import type * as ZellijError from './ZellijError.ts';

// ───────────────────────────────────────────────────────────────────────────
// Shared option mixins
// ───────────────────────────────────────────────────────────────────────────

/**
 * Base mixin — every action accepts `session?` to target a named session
 * instead of the caller's default one (maps to `zellij --session <name>`).
 *
 * @category Options
 * @since 0.1.0
 */
export interface ActionOptions {
	readonly session?: SessionName.SessionName;
}

interface PaneIdOpt extends ActionOptions {
	readonly paneId?: PaneId.PaneId;
}

interface TabIdOpt extends ActionOptions {
	readonly tabId?: TabId.TabId;
}

// ───────────────────────────────────────────────────────────────────────────
// Internal argv helpers
// ───────────────────────────────────────────────────────────────────────────

/**
 * Emit `[name]` when `on` is `true`; otherwise an empty list.
 * Used for bare switch flags like `--floating`, `--in-place`.
 */
const when = (
	name: string,
	on: boolean | undefined
): ReadonlyArray<string> => (on === true ? [name] : []);

/**
 * Emit `[name, encoded]` when `value` is defined.
 * Used for value-taking flags like `--direction <DIR>`, `--name <NAME>`.
 */
const flag = <T>(
	name: string,
	value: T | undefined,
	encode: (v: T) => string = String
): ReadonlyArray<string> => value === undefined ? [] : [name, encode(value)];

/**
 * Emit `[name, "true"|"false"]` when a boolean option is defined.
 * Used for flags that explicitly accept a boolean value, like
 * `--borderless <BORDERLESS>` and `--pinned <PINNED>`.
 */
const boolFlag = (
	name: string,
	value: boolean | undefined
): ReadonlyArray<string> =>
	value === undefined ? [] : [name, value ? 'true' : 'false'];

/** Encode `{ k: v }` as `"k=v,k2=v2"` for `--configuration` args. */
const encodeConfig = (config: Readonly<Record<string, string>>): string =>
	Arr.map(R.toEntries(config), ([k, v]) => `${k}=${v}`).join(',');

/**
 * Thin wrapper around `cli.exec` that prepends `action <verb>` and discards
 * stdout. Fails on non-zero exit via {@link ZellijCli}'s default policy.
 */
const actionVoid = (
	verb: string,
	argv: ReadonlyArray<string>,
	options: ActionOptions | undefined
): Effect.Effect<void, ZellijError.ZellijError, ZellijCli.Service> =>
	Effect.gen(function* () {
		const cli = yield* ZellijCli.Service;
		// `ActionOptions` is structurally compatible with `ZellijCli.Options`
		// (both expose `session?: SessionName`), so we forward `options`
		// through directly. Reconstructing `{ session: options?.session }`
		// would produce `{ session: undefined }`, which `exactOptionalProperty
		// Types` rejects against an `{ session?: ... }` target.
		yield* cli.exec(['action', verb, ...argv], options).pipe(
			Effect.asVoid
		);
	});

/**
 * Thin wrapper around `cli.string` — used for actions that print their
 * result on stdout (ids, list tables, dumps, …).
 */
const actionString = (
	verb: string,
	argv: ReadonlyArray<string>,
	options: ActionOptions | undefined
): Effect.Effect<string, ZellijError.ZellijError, ZellijCli.Service> =>
	Effect.gen(function* () {
		const cli = yield* ZellijCli.Service;
		return yield* cli.string(['action', verb, ...argv], options);
	});

/**
 * Thin wrapper around `cli.exit` — used for actions that communicate state
 * through the exit code alone (e.g. `are-floating-panes-visible`).
 */
const actionExit = (
	verb: string,
	argv: ReadonlyArray<string>,
	options: ActionOptions | undefined
): Effect.Effect<number, ZellijError.ZellijError, ZellijCli.Service> =>
	Effect.gen(function* () {
		const cli = yield* ZellijCli.Service;
		return yield* cli.exit(['action', verb, ...argv], options);
	});

// ═══════════════════════════════════════════════════════════════════════════
// Pane — lifecycle & creation
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Options for {@link newPane}.
 *
 * Mirrors `zellij action new-pane`'s flags. `command` is the `--` tail that
 * replaces the default shell. Conflicting flag pairs are rejected by zellij
 * at invocation time, not statically here.
 *
 * @category Options
 * @since 0.1.0
 */
export interface NewPaneOptions extends ActionOptions {
	readonly closeOnExit?: boolean;
	readonly cwd?: string;
	readonly direction?: Direction.Direction;
	readonly floating?: boolean;
	readonly inPlace?: boolean;
	readonly closeReplacedPane?: boolean;
	readonly name?: string;
	readonly plugin?: string;
	readonly configuration?: Readonly<Record<string, string>>;
	readonly skipPluginCache?: boolean;
	readonly startSuspended?: boolean;
	readonly x?: PaneSize.PaneSize;
	readonly y?: PaneSize.PaneSize;
	readonly width?: PaneSize.PaneSize;
	readonly height?: PaneSize.PaneSize;
	readonly pinned?: boolean;
	readonly stacked?: boolean;
	readonly tabId?: TabId.TabId;
	readonly nearCurrentPane?: boolean;
	readonly borderless?: boolean;
	/** Optional blocking strategy — emits the matching `--block-*` flag. */
	readonly blocking?: BlockStrategy.BlockStrategy;
	/** Optional command + args to execute; rendered after `--`. */
	readonly command?: ReadonlyArray<string>;
}

const newPaneArgs = (options?: NewPaneOptions): ReadonlyArray<string> => [
	...when('--close-on-exit', options?.closeOnExit),
	...flag('--cwd', options?.cwd),
	...flag('--direction', options?.direction),
	...when('--floating', options?.floating),
	...when('--in-place', options?.inPlace),
	...when('--close-replaced-pane', options?.closeReplacedPane),
	...flag('--name', options?.name),
	...flag('--plugin', options?.plugin),
	...flag('--configuration', options?.configuration, encodeConfig),
	...when('--skip-plugin-cache', options?.skipPluginCache),
	...when('--start-suspended', options?.startSuspended),
	...flag('--x', options?.x, PaneSize.toCliArg),
	...flag('--y', options?.y, PaneSize.toCliArg),
	...flag('--width', options?.width, PaneSize.toCliArg),
	...flag('--height', options?.height, PaneSize.toCliArg),
	...boolFlag('--pinned', options?.pinned),
	...when('--stacked', options?.stacked),
	...flag('--tab-id', options?.tabId),
	...when('--near-current-pane', options?.nearCurrentPane),
	...boolFlag('--borderless', options?.borderless),
	...(options?.blocking === undefined
		? []
		: BlockStrategy.toArgs(options.blocking)),
	...(options?.command === undefined || options.command.length === 0
		? []
		: ['--', ...options.command])
];

/**
 * Open a new pane. Returns the created pane's id on stdout (e.g.
 * `"terminal_5"`); parse with {@link PaneId.fromCliArg} if needed.
 *
 * Maps to `zellij action new-pane`.
 *
 * @category Panes
 * @since 0.1.0
 */
export const newPane = Effect.fn('ZellijAction.newPane')(
	(options?: NewPaneOptions) =>
		actionString('new-pane', newPaneArgs(options), options)
);

/**
 * Options for {@link edit}.
 *
 * @category Options
 * @since 0.1.0
 */
export interface EditOptions extends ActionOptions {
	readonly direction?: Direction.Direction;
	readonly floating?: boolean;
	readonly inPlace?: boolean;
	readonly closeReplacedPane?: boolean;
	readonly lineNumber?: number;
	readonly cwd?: string;
	readonly x?: PaneSize.PaneSize;
	readonly y?: PaneSize.PaneSize;
	readonly width?: PaneSize.PaneSize;
	readonly height?: PaneSize.PaneSize;
	readonly pinned?: boolean;
	readonly nearCurrentPane?: boolean;
	readonly tabId?: TabId.TabId;
	readonly borderless?: boolean;
}

/**
 * Open `file` in `$EDITOR` inside a new pane. Returns the created pane's id
 * on stdout.
 *
 * Maps to `zellij action edit <FILE>`.
 *
 * @category Panes
 * @since 0.1.0
 */
export const edit = Effect.fn('ZellijAction.edit')(
	(file: string, options?: EditOptions) =>
		actionString(
			'edit',
			[
				file,
				...flag('--direction', options?.direction),
				...when('--floating', options?.floating),
				...when('--in-place', options?.inPlace),
				...when('--close-replaced-pane', options?.closeReplacedPane),
				...flag('--line-number', options?.lineNumber),
				...flag('--cwd', options?.cwd),
				...flag('--x', options?.x, PaneSize.toCliArg),
				...flag('--y', options?.y, PaneSize.toCliArg),
				...flag('--width', options?.width, PaneSize.toCliArg),
				...flag('--height', options?.height, PaneSize.toCliArg),
				...boolFlag('--pinned', options?.pinned),
				...when('--near-current-pane', options?.nearCurrentPane),
				...flag('--tab-id', options?.tabId),
				...boolFlag('--borderless', options?.borderless)
			],
			options
		)
);

/**
 * Open a pane's scrollback in `$EDITOR`.
 *
 * Maps to `zellij action edit-scrollback`.
 *
 * @category Panes
 * @since 0.1.0
 */
export const editScrollback = Effect.fn('ZellijAction.editScrollback')(
	(options?: PaneIdOpt & { readonly ansi?: boolean }) =>
		actionVoid(
			'edit-scrollback',
			[
				...flag('--pane-id', options?.paneId, PaneId.toCliArg),
				...when('--ansi', options?.ansi)
			],
			options
		)
);

/**
 * Close the focused pane, or the pane identified by `paneId`.
 *
 * Maps to `zellij action close-pane`.
 *
 * @category Panes
 * @since 0.1.0
 */
export const closePane = Effect.fn('ZellijAction.closePane')(
	(options?: PaneIdOpt) =>
		actionVoid(
			'close-pane',
			flag('--pane-id', options?.paneId, PaneId.toCliArg),
			options
		)
);

/**
 * Clear all buffers in the focused pane (or the pane identified by `paneId`).
 *
 * Maps to `zellij action clear`.
 *
 * @category Panes
 * @since 0.1.0
 */
export const clear = Effect.fn('ZellijAction.clear')(
	(options?: PaneIdOpt) =>
		actionVoid(
			'clear',
			flag('--pane-id', options?.paneId, PaneId.toCliArg),
			options
		)
);

// ═══════════════════════════════════════════════════════════════════════════
// Pane — focus & movement
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Focus the next pane.
 *
 * Maps to `zellij action focus-next-pane`.
 *
 * @category Panes
 * @since 0.1.0
 */
export const focusNextPane = Effect.fn('ZellijAction.focusNextPane')(
	(options?: ActionOptions) => actionVoid('focus-next-pane', [], options)
);

/**
 * Focus the previous pane.
 *
 * Maps to `zellij action focus-previous-pane`.
 *
 * @category Panes
 * @since 0.1.0
 */
export const focusPreviousPane = Effect.fn('ZellijAction.focusPreviousPane')(
	(options?: ActionOptions) => actionVoid('focus-previous-pane', [], options)
);

/**
 * Focus a specific pane by id.
 *
 * Maps to `zellij action focus-pane-id`.
 *
 * @category Panes
 * @since 0.1.0
 */
export const focusPaneId = Effect.fn('ZellijAction.focusPaneId')(
	(paneId: PaneId.PaneId, options?: ActionOptions) =>
		actionVoid('focus-pane-id', [PaneId.toCliArg(paneId)], options)
);

/**
 * Move focus in the given direction.
 *
 * Maps to `zellij action move-focus`.
 *
 * @category Panes
 * @since 0.1.0
 */
export const moveFocus = Effect.fn('ZellijAction.moveFocus')(
	(direction: Direction.Direction, options?: ActionOptions) =>
		actionVoid('move-focus', [direction], options)
);

/**
 * Move focus to the adjacent pane or, if at the screen edge, the neighbouring
 * tab.
 *
 * Maps to `zellij action move-focus-or-tab`.
 *
 * @category Panes
 * @since 0.1.0
 */
export const moveFocusOrTab = Effect.fn('ZellijAction.moveFocusOrTab')(
	(direction: Direction.Direction, options?: ActionOptions) =>
		actionVoid('move-focus-or-tab', [direction], options)
);

/**
 * Relocate the focused pane (or a specific pane) in the layout.
 *
 * Maps to `zellij action move-pane`.
 *
 * @category Panes
 * @since 0.1.0
 */
export const movePane = Effect.fn('ZellijAction.movePane')(
	(
		options?: PaneIdOpt & { readonly direction?: Direction.Direction }
	) => actionVoid(
		'move-pane',
		[
			...(options?.direction === undefined ? [] : [options.direction]),
			...flag('--pane-id', options?.paneId, PaneId.toCliArg)
		],
		options
	)
);

/**
 * Rotate the focused pane backwards in the layout order.
 *
 * Maps to `zellij action move-pane-backwards`.
 *
 * @category Panes
 * @since 0.1.0
 */
export const movePaneBackwards = Effect.fn('ZellijAction.movePaneBackwards')(
	(options?: PaneIdOpt) =>
		actionVoid(
			'move-pane-backwards',
			flag('--pane-id', options?.paneId, PaneId.toCliArg),
			options
		)
);

/**
 * Collapse the given panes into a single stack (top→bottom order).
 *
 * Maps to `zellij action stack-panes -- <pane-ids>`.
 *
 * @category Panes
 * @since 0.1.0
 */
export const stackPanes = Effect.fn('ZellijAction.stackPanes')(
	(panes: ReadonlyArray<PaneId.PaneId>, options?: ActionOptions) =>
		actionVoid(
			'stack-panes',
			['--', ...Arr.map(panes, PaneId.toCliArg)],
			options
		)
);

// ═══════════════════════════════════════════════════════════════════════════
// Pane — sizing & state
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Resize the focused pane.
 *
 * Maps to `zellij action resize`. Direction can be a cardinal name or the
 * bare `+`/`-` grow/shrink tokens.
 *
 * @category Panes
 * @since 0.1.0
 */
export const resize = Effect.fn('ZellijAction.resize')(
	(direction: ResizeDirection.ResizeDirection, options?: PaneIdOpt) =>
		actionVoid(
			'resize',
			[
				direction,
				...flag('--pane-id', options?.paneId, PaneId.toCliArg)
			],
			options
		)
);

/**
 * Options for {@link changeFloatingPaneCoordinates}.
 *
 * `paneId` is required — zellij needs to know which floating pane to move.
 *
 * @category Options
 * @since 0.1.0
 */
export interface ChangeFloatingPaneCoordinatesOptions extends ActionOptions {
	readonly paneId: PaneId.PaneId;
	readonly x?: PaneSize.PaneSize;
	readonly y?: PaneSize.PaneSize;
	readonly width?: PaneSize.PaneSize;
	readonly height?: PaneSize.PaneSize;
	readonly pinned?: boolean;
	readonly borderless?: boolean;
}

/**
 * Reposition and/or resize a floating pane.
 *
 * Maps to `zellij action change-floating-pane-coordinates`.
 *
 * @category Panes
 * @since 0.1.0
 */
export const changeFloatingPaneCoordinates = Effect.fn(
	'ZellijAction.changeFloatingPaneCoordinates'
)((options: ChangeFloatingPaneCoordinatesOptions) =>
	actionVoid(
		'change-floating-pane-coordinates',
		[
			...flag('--pane-id', options.paneId, PaneId.toCliArg),
			...flag('--x', options.x, PaneSize.toCliArg),
			...flag('--y', options.y, PaneSize.toCliArg),
			...flag('--width', options.width, PaneSize.toCliArg),
			...flag('--height', options.height, PaneSize.toCliArg),
			...boolFlag('--pinned', options.pinned),
			...boolFlag('--borderless', options.borderless)
		],
		options
	)
);

/**
 * Toggle fullscreen on the focused pane.
 *
 * Maps to `zellij action toggle-fullscreen`.
 *
 * @category Panes
 * @since 0.1.0
 */
export const toggleFullscreen = Effect.fn('ZellijAction.toggleFullscreen')(
	(options?: PaneIdOpt) =>
		actionVoid(
			'toggle-fullscreen',
			flag('--pane-id', options?.paneId, PaneId.toCliArg),
			options
		)
);

/**
 * Float an embedded pane or embed a floating pane.
 *
 * Maps to `zellij action toggle-pane-embed-or-floating`.
 *
 * @category Panes
 * @since 0.1.0
 */
export const togglePaneEmbedOrFloating = Effect.fn(
	'ZellijAction.togglePaneEmbedOrFloating'
)((options?: PaneIdOpt) =>
	actionVoid(
		'toggle-pane-embed-or-floating',
		flag('--pane-id', options?.paneId, PaneId.toCliArg),
		options
	)
);

/**
 * Toggle pin (always-on-top) state of a floating pane.
 *
 * Maps to `zellij action toggle-pane-pinned`.
 *
 * @category Panes
 * @since 0.1.0
 */
export const togglePanePinned = Effect.fn('ZellijAction.togglePanePinned')(
	(options?: PaneIdOpt) =>
		actionVoid(
			'toggle-pane-pinned',
			flag('--pane-id', options?.paneId, PaneId.toCliArg),
			options
		)
);

/**
 * Toggle the borderless state of a specific pane.
 *
 * Maps to `zellij action toggle-pane-borderless`. Note that `paneId` is
 * required by zellij.
 *
 * @category Panes
 * @since 0.1.0
 */
export const togglePaneBorderless = Effect.fn(
	'ZellijAction.togglePaneBorderless'
)((paneId: PaneId.PaneId, options?: ActionOptions) =>
	actionVoid(
		'toggle-pane-borderless',
		flag('--pane-id', paneId, PaneId.toCliArg),
		options
	)
);

/**
 * Explicitly set the borderless state of a pane.
 *
 * Maps to `zellij action set-pane-borderless`.
 *
 * @category Panes
 * @since 0.1.0
 */
export const setPaneBorderless = Effect.fn('ZellijAction.setPaneBorderless')(
	(
		paneId: PaneId.PaneId,
		borderless: boolean,
		options?: ActionOptions
	) => actionVoid(
		'set-pane-borderless',
		[
			...flag('--pane-id', paneId, PaneId.toCliArg),
			...boolFlag('--borderless', borderless)
		],
		options
	)
);

/**
 * Options for {@link setPaneColor}.
 *
 * Either provide `{ fg?, bg? }` *or* `{ reset: true }`. Zellij rejects
 * mixing `--reset` with `--fg`/`--bg`; we don't enforce that statically but
 * the CLI will.
 *
 * @category Options
 * @since 0.1.0
 */
export interface SetPaneColorOptions extends PaneIdOpt {
	readonly fg?: string;
	readonly bg?: string;
	readonly reset?: boolean;
}

/**
 * Set or reset the foreground/background color of a pane.
 *
 * Maps to `zellij action set-pane-color`. Colours accept hex (`"#00e000"`)
 * or rgb (`"rgb:00/e0/00"`) strings.
 *
 * @category Panes
 * @since 0.1.0
 */
export const setPaneColor = Effect.fn('ZellijAction.setPaneColor')(
	(options?: SetPaneColorOptions) =>
		actionVoid(
			'set-pane-color',
			[
				...flag('--pane-id', options?.paneId, PaneId.toCliArg),
				...flag('--fg', options?.fg),
				...flag('--bg', options?.bg),
				...when('--reset', options?.reset)
			],
			options
		)
);

// ═══════════════════════════════════════════════════════════════════════════
// Pane — naming
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Rename the focused pane (or the pane identified by `paneId`).
 *
 * Maps to `zellij action rename-pane`.
 *
 * @category Panes
 * @since 0.1.0
 */
export const renamePane = Effect.fn('ZellijAction.renamePane')(
	(name: string, options?: PaneIdOpt) =>
		actionVoid(
			'rename-pane',
			[
				...flag('--pane-id', options?.paneId, PaneId.toCliArg),
				name
			],
			options
		)
);

/**
 * Revert a pane's name to its default (remove the user-set name).
 *
 * Maps to `zellij action undo-rename-pane`.
 *
 * @category Panes
 * @since 0.1.0
 */
export const undoRenamePane = Effect.fn('ZellijAction.undoRenamePane')(
	(options?: PaneIdOpt) =>
		actionVoid(
			'undo-rename-pane',
			flag('--pane-id', options?.paneId, PaneId.toCliArg),
			options
		)
);

// ═══════════════════════════════════════════════════════════════════════════
// Pane — input
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Write literal characters to the focused pane (or a specific pane).
 *
 * Maps to `zellij action write-chars`.
 *
 * @category Input
 * @since 0.1.0
 */
export const writeChars = Effect.fn('ZellijAction.writeChars')(
	(chars: string, options?: PaneIdOpt) =>
		actionVoid(
			'write-chars',
			[
				...flag('--pane-id', options?.paneId, PaneId.toCliArg),
				chars
			],
			options
		)
);

/**
 * Write raw bytes to the focused pane.
 *
 * Maps to `zellij action write <BYTE>...`. `bytes` is an array of numeric
 * byte values (e.g. `[102, 111, 111]` for `"foo"`).
 *
 * @category Input
 * @since 0.1.0
 */
export const write = Effect.fn('ZellijAction.write')(
	(bytes: ReadonlyArray<number>, options?: PaneIdOpt) =>
		actionVoid(
			'write',
			[
				...flag('--pane-id', options?.paneId, PaneId.toCliArg),
				...Arr.map(bytes, String)
			],
			options
		)
);

/**
 * Paste a multi-line string using bracketed paste mode (faster + safer for
 * arbitrary text than {@link writeChars}).
 *
 * Maps to `zellij action paste`.
 *
 * @category Input
 * @since 0.1.0
 */
export const paste = Effect.fn('ZellijAction.paste')(
	(text: string, options?: PaneIdOpt) =>
		actionVoid(
			'paste',
			[
				...flag('--pane-id', options?.paneId, PaneId.toCliArg),
				text
			],
			options
		)
);

/**
 * Send one or more named keys to a pane (e.g. `["Ctrl a", "Enter"]`).
 *
 * Maps to `zellij action send-keys`.
 *
 * @category Input
 * @since 0.1.0
 */
export const sendKeys = Effect.fn('ZellijAction.sendKeys')(
	(keys: ReadonlyArray<string>, options?: PaneIdOpt) =>
		actionVoid(
			'send-keys',
			[
				...flag('--pane-id', options?.paneId, PaneId.toCliArg),
				...keys
			],
			options
		)
);

// ═══════════════════════════════════════════════════════════════════════════
// Pane — scrolling
// ═══════════════════════════════════════════════════════════════════════════

const scrollAction = (verb: string) =>
	Effect.fn(`ZellijAction.${verb.replaceAll('-', '')}`)(
		(options?: PaneIdOpt) =>
			actionVoid(
				verb,
				flag('--pane-id', options?.paneId, PaneId.toCliArg),
				options
			)
	);

/** Scroll up one line. Maps to `zellij action scroll-up`. @category Scrolling @since 0.1.0 */
export const scrollUp = scrollAction('scroll-up');
/** Scroll down one line. Maps to `zellij action scroll-down`. @category Scrolling @since 0.1.0 */
export const scrollDown = scrollAction('scroll-down');
/** Scroll up a full page. Maps to `zellij action page-scroll-up`. @category Scrolling @since 0.1.0 */
export const pageScrollUp = scrollAction('page-scroll-up');
/** Scroll down a full page. Maps to `zellij action page-scroll-down`. @category Scrolling @since 0.1.0 */
export const pageScrollDown = scrollAction('page-scroll-down');
/** Scroll up half a page. Maps to `zellij action half-page-scroll-up`. @category Scrolling @since 0.1.0 */
export const halfPageScrollUp = scrollAction('half-page-scroll-up');
/** Scroll down half a page. Maps to `zellij action half-page-scroll-down`. @category Scrolling @since 0.1.0 */
export const halfPageScrollDown = scrollAction('half-page-scroll-down');
/** Scroll to top. Maps to `zellij action scroll-to-top`. @category Scrolling @since 0.1.0 */
export const scrollToTop = scrollAction('scroll-to-top');
/** Scroll to bottom. Maps to `zellij action scroll-to-bottom`. @category Scrolling @since 0.1.0 */
export const scrollToBottom = scrollAction('scroll-to-bottom');

// ═══════════════════════════════════════════════════════════════════════════
// Pane — output / inspection
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Options for {@link dumpScreen}.
 *
 * When `path` is omitted, the dump is printed to stdout (returned as a
 * string); otherwise it is written to the given path and the function
 * resolves to an empty string.
 *
 * @category Options
 * @since 0.1.0
 */
export interface DumpScreenOptions extends PaneIdOpt {
	readonly path?: string;
	readonly full?: boolean;
	readonly ansi?: boolean;
}

/**
 * Dump a pane's viewport (and optionally full scrollback) to stdout or a
 * file.
 *
 * Maps to `zellij action dump-screen`.
 *
 * @category Panes
 * @since 0.1.0
 */
export const dumpScreen = Effect.fn('ZellijAction.dumpScreen')(
	(options?: DumpScreenOptions) =>
		actionString(
			'dump-screen',
			[
				...flag('--path', options?.path),
				...when('--full', options?.full),
				...when('--ansi', options?.ansi),
				...flag('--pane-id', options?.paneId, PaneId.toCliArg)
			],
			options
		)
);

/**
 * Dump the current session layout as KDL on stdout.
 *
 * Maps to `zellij action dump-layout`.
 *
 * @category Panes
 * @since 0.1.0
 */
export const dumpLayout = Effect.fn('ZellijAction.dumpLayout')(
	(options?: ActionOptions) => actionString('dump-layout', [], options)
);

/**
 * Options for {@link listPanes}.
 *
 * @category Options
 * @since 0.1.0
 */
export interface ListPanesOptions extends ActionOptions {
	readonly tab?: boolean;
	readonly command?: boolean;
	readonly state?: boolean;
	readonly geometry?: boolean;
	readonly all?: boolean;
	readonly json?: boolean;
}

/**
 * List all panes in the session; return stdout verbatim.
 *
 * Maps to `zellij action list-panes`. Higher-level `ZellijPane.list` decodes
 * the `--json` output into {@link PaneInfo} records.
 *
 * @category Panes
 * @since 0.1.0
 */
export const listPanes = Effect.fn('ZellijAction.listPanes')(
	(options?: ListPanesOptions) =>
		actionString(
			'list-panes',
			[
				...when('--tab', options?.tab),
				...when('--command', options?.command),
				...when('--state', options?.state),
				...when('--geometry', options?.geometry),
				...when('--all', options?.all),
				...when('--json', options?.json)
			],
			options
		)
);

// ═══════════════════════════════════════════════════════════════════════════
// Tab — lifecycle
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Options for {@link newTab}.
 *
 * @category Options
 * @since 0.1.0
 */
export interface NewTabOptions extends ActionOptions {
	readonly cwd?: string;
	readonly layout?: string;
	readonly layoutDir?: string;
	readonly layoutString?: string;
	readonly name?: string;
	readonly initialPlugin?: string;
	readonly closeOnExit?: boolean;
	readonly startSuspended?: boolean;
	readonly blocking?: BlockStrategy.BlockStrategy;
	/** Optional command + args for the initial pane; rendered after `--`. */
	readonly command?: ReadonlyArray<string>;
}

/**
 * Create a new tab. Returns the created tab's id on stdout.
 *
 * Maps to `zellij action new-tab`.
 *
 * @category Tabs
 * @since 0.1.0
 */
export const newTab = Effect.fn('ZellijAction.newTab')(
	(options?: NewTabOptions) =>
		actionString(
			'new-tab',
			[
				...flag('--cwd', options?.cwd),
				...flag('--layout', options?.layout),
				...flag('--layout-dir', options?.layoutDir),
				...flag('--layout-string', options?.layoutString),
				...flag('--name', options?.name),
				...flag('--initial-plugin', options?.initialPlugin),
				...when('--close-on-exit', options?.closeOnExit),
				...when('--start-suspended', options?.startSuspended),
				...(options?.blocking === undefined
					? []
					: BlockStrategy.toArgs(options.blocking)),
				...(options?.command === undefined ||
						options.command.length === 0
					? []
					: ['--', ...options.command])
			],
			options
		)
);

/**
 * Close the current tab (or the tab identified by `tabId`).
 *
 * Maps to `zellij action close-tab`.
 *
 * @category Tabs
 * @since 0.1.0
 */
export const closeTab = Effect.fn('ZellijAction.closeTab')(
	(options?: TabIdOpt) =>
		actionVoid(
			'close-tab',
			flag('--tab-id', options?.tabId),
			options
		)
);

/**
 * Close a tab by its stable id. Maps to `zellij action close-tab-by-id`.
 *
 * @category Tabs
 * @since 0.1.0
 */
export const closeTabById = Effect.fn('ZellijAction.closeTabById')(
	(tabId: TabId.TabId, options?: ActionOptions) =>
		actionVoid('close-tab-by-id', [String(tabId)], options)
);

// ═══════════════════════════════════════════════════════════════════════════
// Tab — navigation
// ═══════════════════════════════════════════════════════════════════════════

/** Go to the next tab. Maps to `zellij action go-to-next-tab`. @category Tabs @since 0.1.0 */
export const goToNextTab = Effect.fn('ZellijAction.goToNextTab')(
	(options?: ActionOptions) => actionVoid('go-to-next-tab', [], options)
);

/** Go to the previous tab. Maps to `zellij action go-to-previous-tab`. @category Tabs @since 0.1.0 */
export const goToPreviousTab = Effect.fn('ZellijAction.goToPreviousTab')(
	(options?: ActionOptions) => actionVoid('go-to-previous-tab', [], options)
);

/**
 * Go to the tab at the given ordinal index (1-based, as printed by zellij).
 *
 * Maps to `zellij action go-to-tab`.
 *
 * @category Tabs
 * @since 0.1.0
 */
export const goToTab = Effect.fn('ZellijAction.goToTab')(
	(index: number, options?: ActionOptions) =>
		actionVoid('go-to-tab', [String(index)], options)
);

/**
 * Go to a tab by its stable id. Maps to `zellij action go-to-tab-by-id`.
 *
 * @category Tabs
 * @since 0.1.0
 */
export const goToTabById = Effect.fn('ZellijAction.goToTabById')(
	(tabId: TabId.TabId, options?: ActionOptions) =>
		actionVoid('go-to-tab-by-id', [String(tabId)], options)
);

/**
 * Go to a tab by name. When `create: true` is passed and no such tab
 * exists, zellij creates it and prints the new tab id — the return string
 * will be non-empty in that case, empty otherwise.
 *
 * Maps to `zellij action go-to-tab-name`.
 *
 * @category Tabs
 * @since 0.1.0
 */
export const goToTabName = Effect.fn('ZellijAction.goToTabName')(
	(
		name: string,
		options?: ActionOptions & { readonly create?: boolean }
	) => actionString(
		'go-to-tab-name',
		[name, ...when('--create', options?.create)],
		options
	)
);

/**
 * Move the current tab (or a specified tab) left/right in the tab bar.
 *
 * Maps to `zellij action move-tab`. Accepts `"left"` or `"right"` only.
 *
 * @category Tabs
 * @since 0.1.0
 */
export const moveTab = Effect.fn('ZellijAction.moveTab')(
	(direction: 'left' | 'right', options?: TabIdOpt) =>
		actionVoid(
			'move-tab',
			[direction, ...flag('--tab-id', options?.tabId)],
			options
		)
);

// ═══════════════════════════════════════════════════════════════════════════
// Tab — naming
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Rename the focused tab (or the tab identified by `tabId`).
 *
 * Maps to `zellij action rename-tab`.
 *
 * @category Tabs
 * @since 0.1.0
 */
export const renameTab = Effect.fn('ZellijAction.renameTab')(
	(name: string, options?: TabIdOpt) =>
		actionVoid(
			'rename-tab',
			[...flag('--tab-id', options?.tabId), name],
			options
		)
);

/**
 * Rename a tab by its stable id.
 *
 * Maps to `zellij action rename-tab-by-id`.
 *
 * @category Tabs
 * @since 0.1.0
 */
export const renameTabById = Effect.fn('ZellijAction.renameTabById')(
	(tabId: TabId.TabId, name: string, options?: ActionOptions) =>
		actionVoid('rename-tab-by-id', [String(tabId), name], options)
);

/**
 * Revert a tab's name to its default.
 *
 * Maps to `zellij action undo-rename-tab`.
 *
 * @category Tabs
 * @since 0.1.0
 */
export const undoRenameTab = Effect.fn('ZellijAction.undoRenameTab')(
	(options?: TabIdOpt) =>
		actionVoid(
			'undo-rename-tab',
			flag('--tab-id', options?.tabId),
			options
		)
);

/**
 * Query the names of all tabs as a newline-separated string.
 *
 * Maps to `zellij action query-tab-names`.
 *
 * @category Tabs
 * @since 0.1.0
 */
export const queryTabNames = Effect.fn('ZellijAction.queryTabNames')(
	(options?: ActionOptions) => actionString('query-tab-names', [], options)
);

// ═══════════════════════════════════════════════════════════════════════════
// Tab — sync & swap layouts
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Toggle sync-panes-in-tab: when on, input goes to every pane in the tab
 * simultaneously.
 *
 * Maps to `zellij action toggle-active-sync-tab`.
 *
 * @category Tabs
 * @since 0.1.0
 */
export const toggleActiveSyncTab = Effect.fn(
	'ZellijAction.toggleActiveSyncTab'
)((options?: TabIdOpt) =>
	actionVoid(
		'toggle-active-sync-tab',
		flag('--tab-id', options?.tabId),
		options
	)
);

/**
 * Cycle to the next swap layout on a tab.
 *
 * Maps to `zellij action next-swap-layout`.
 *
 * @category Tabs
 * @since 0.1.0
 */
export const nextSwapLayout = Effect.fn('ZellijAction.nextSwapLayout')(
	(options?: TabIdOpt) =>
		actionVoid(
			'next-swap-layout',
			flag('--tab-id', options?.tabId),
			options
		)
);

/**
 * Cycle to the previous swap layout on a tab.
 *
 * Maps to `zellij action previous-swap-layout`.
 *
 * @category Tabs
 * @since 0.1.0
 */
export const previousSwapLayout = Effect.fn('ZellijAction.previousSwapLayout')(
	(options?: TabIdOpt) =>
		actionVoid(
			'previous-swap-layout',
			flag('--tab-id', options?.tabId),
			options
		)
);

/**
 * Options for {@link overrideLayout}.
 *
 * Pass exactly one of `path` or `layoutString`. Zellij rejects both.
 *
 * @category Options
 * @since 0.1.0
 */
export interface OverrideLayoutOptions extends ActionOptions {
	readonly path?: string;
	readonly layoutString?: string;
	readonly layoutDir?: string;
	readonly retainExistingTerminalPanes?: boolean;
	readonly retainExistingPluginPanes?: boolean;
	readonly applyOnlyToActiveTab?: boolean;
}

/**
 * Replace the current tab's layout with a new one (from file or inline KDL).
 *
 * Maps to `zellij action override-layout`.
 *
 * @category Tabs
 * @since 0.1.0
 */
export const overrideLayout = Effect.fn('ZellijAction.overrideLayout')(
	(options: OverrideLayoutOptions) =>
		actionVoid(
			'override-layout',
			[
				...(options.path === undefined ? [] : [options.path]),
				...flag('--layout-string', options.layoutString),
				...flag('--layout-dir', options.layoutDir),
				...when(
					'--retain-existing-terminal-panes',
					options.retainExistingTerminalPanes
				),
				...when(
					'--retain-existing-plugin-panes',
					options.retainExistingPluginPanes
				),
				...when(
					'--apply-only-to-active-tab',
					options.applyOnlyToActiveTab
				)
			],
			options
		)
);

// ═══════════════════════════════════════════════════════════════════════════
// Tab — info
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Options for {@link listTabs}.
 *
 * @category Options
 * @since 0.1.0
 */
export interface ListTabsOptions extends ActionOptions {
	readonly state?: boolean;
	readonly dimensions?: boolean;
	readonly panes?: boolean;
	readonly layout?: boolean;
	readonly all?: boolean;
	readonly json?: boolean;
}

/**
 * List all tabs; return stdout verbatim.
 *
 * Maps to `zellij action list-tabs`. Higher-level `ZellijTab.list` decodes
 * the `--json` output into {@link TabInfo} records.
 *
 * @category Tabs
 * @since 0.1.0
 */
export const listTabs = Effect.fn('ZellijAction.listTabs')(
	(options?: ListTabsOptions) =>
		actionString(
			'list-tabs',
			[
				...when('--state', options?.state),
				...when('--dimensions', options?.dimensions),
				...when('--panes', options?.panes),
				...when('--layout', options?.layout),
				...when('--all', options?.all),
				...when('--json', options?.json)
			],
			options
		)
);

/**
 * Return info about the currently active tab.
 *
 * Maps to `zellij action current-tab-info`. Higher-level
 * `ZellijTab.currentInfo` decodes the `--json` output into a {@link TabInfo}.
 *
 * @category Tabs
 * @since 0.1.0
 */
export const currentTabInfo = Effect.fn('ZellijAction.currentTabInfo')(
	(options?: ActionOptions & { readonly json?: boolean }) =>
		actionString(
			'current-tab-info',
			when('--json', options?.json),
			options
		)
);

// ═══════════════════════════════════════════════════════════════════════════
// Tab — floating pane visibility
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Check whether floating panes are currently visible.
 *
 * Maps to `zellij action are-floating-panes-visible`. Returns the raw exit
 * code (`0` = visible, `1` = not visible).
 *
 * @category Floating
 * @since 0.1.0
 */
export const areFloatingPanesVisible = Effect.fn(
	'ZellijAction.areFloatingPanesVisible'
)((options?: TabIdOpt) =>
	actionExit(
		'are-floating-panes-visible',
		flag('--tab-id', options?.tabId),
		options
	)
);

/**
 * Show all floating panes. Maps to `zellij action show-floating-panes`.
 *
 * Exit codes: `0` = panes were shown, `1` = no floating panes existed,
 * `2` = panes were already visible.
 *
 * @category Floating
 * @since 0.1.0
 */
export const showFloatingPanes = Effect.fn('ZellijAction.showFloatingPanes')(
	(options?: TabIdOpt) =>
		actionExit(
			'show-floating-panes',
			flag('--tab-id', options?.tabId),
			options
		)
);

/**
 * Hide all floating panes. Maps to `zellij action hide-floating-panes`.
 *
 * Exit codes: `0` = panes were hidden, `1` = no floating panes existed,
 * `2` = panes were already hidden.
 *
 * @category Floating
 * @since 0.1.0
 */
export const hideFloatingPanes = Effect.fn('ZellijAction.hideFloatingPanes')(
	(options?: TabIdOpt) =>
		actionExit(
			'hide-floating-panes',
			flag('--tab-id', options?.tabId),
			options
		)
);

/**
 * Toggle the visibility of floating panes; creates one if none exist.
 *
 * Maps to `zellij action toggle-floating-panes`.
 *
 * @category Floating
 * @since 0.1.0
 */
export const toggleFloatingPanes = Effect.fn(
	'ZellijAction.toggleFloatingPanes'
)((options?: TabIdOpt) =>
	actionVoid(
		'toggle-floating-panes',
		flag('--tab-id', options?.tabId),
		options
	)
);

// ═══════════════════════════════════════════════════════════════════════════
// Global UI
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Toggle whether pane frames are drawn.
 *
 * Maps to `zellij action toggle-pane-frames`.
 *
 * @category UI
 * @since 0.1.0
 */
export const togglePaneFrames = Effect.fn('ZellijAction.togglePaneFrames')(
	(options?: ActionOptions) => actionVoid('toggle-pane-frames', [], options)
);

// ═══════════════════════════════════════════════════════════════════════════
// Session / mode
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Detach from the session (leave it running in the background).
 *
 * Maps to `zellij action detach`.
 *
 * @category Session
 * @since 0.1.0
 */
export const detach = Effect.fn('ZellijAction.detach')(
	(options?: ActionOptions) => actionVoid('detach', [], options)
);

/**
 * Rename the current session.
 *
 * Maps to `zellij action rename-session`.
 *
 * @category Session
 * @since 0.1.0
 */
export const renameSession = Effect.fn('ZellijAction.renameSession')(
	(name: string, options?: ActionOptions) =>
		actionVoid('rename-session', [name], options)
);

/**
 * Immediately snapshot the session state to disk.
 *
 * Maps to `zellij action save-session`.
 *
 * @category Session
 * @since 0.1.0
 */
export const saveSession = Effect.fn('ZellijAction.saveSession')(
	(options?: ActionOptions) => actionVoid('save-session', [], options)
);

/**
 * Options for {@link switchSession}.
 *
 * @category Options
 * @since 0.1.0
 */
export interface SwitchSessionOptions extends ActionOptions {
	readonly tabPosition?: number;
	readonly paneId?: PaneId.PaneId;
	readonly layout?: string;
	readonly layoutDir?: string;
	readonly layoutString?: string;
	readonly cwd?: string;
}

/**
 * Switch the attached client to a different session.
 *
 * Maps to `zellij action switch-session`.
 *
 * @category Session
 * @since 0.1.0
 */
export const switchSession = Effect.fn('ZellijAction.switchSession')(
	(target: SessionName.SessionName, options?: SwitchSessionOptions) =>
		actionVoid(
			'switch-session',
			[
				target,
				...flag('--tab-position', options?.tabPosition),
				...flag('--pane-id', options?.paneId, PaneId.toCliArg),
				...flag('--layout', options?.layout),
				...flag('--layout-dir', options?.layoutDir),
				...flag('--layout-string', options?.layoutString),
				...flag('--cwd', options?.cwd)
			],
			options
		)
);

/**
 * Switch input mode for every client attached to the session.
 *
 * Maps to `zellij action switch-mode`.
 *
 * @category Session
 * @since 0.1.0
 */
export const switchMode = Effect.fn('ZellijAction.switchMode')(
	(mode: Mode.Mode, options?: ActionOptions) =>
		actionVoid('switch-mode', [mode], options)
);

/**
 * List all clients attached to the session.
 *
 * Maps to `zellij action list-clients`. Higher-level
 * `ZellijSession.listClients` parses the output into {@link ClientInfo}
 * records; here we just return the raw text table.
 *
 * @category Session
 * @since 0.1.0
 */
export const listClients = Effect.fn('ZellijAction.listClients')(
	(options?: ActionOptions) => actionString('list-clients', [], options)
);

// ═══════════════════════════════════════════════════════════════════════════
// Plugins
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Options common to {@link launchPlugin} and {@link launchOrFocusPlugin}.
 *
 * @category Options
 * @since 0.1.0
 */
export interface LaunchPluginOptions extends ActionOptions {
	readonly floating?: boolean;
	readonly inPlace?: boolean;
	readonly closeReplacedPane?: boolean;
	readonly configuration?: Readonly<Record<string, string>>;
	readonly skipPluginCache?: boolean;
	readonly tabId?: TabId.TabId;
}

const launchPluginArgs = (
	url: string,
	options?: LaunchPluginOptions
): ReadonlyArray<string> => [
	url,
	...when('--floating', options?.floating),
	...when('--in-place', options?.inPlace),
	...when('--close-replaced-pane', options?.closeReplacedPane),
	...flag('--configuration', options?.configuration, encodeConfig),
	...when('--skip-plugin-cache', options?.skipPluginCache),
	...flag('--tab-id', options?.tabId)
];

/**
 * Launch a new plugin instance. Returns the created plugin pane's id on
 * stdout (e.g. `"plugin_4"`).
 *
 * Maps to `zellij action launch-plugin`.
 *
 * @category Plugins
 * @since 0.1.0
 */
export const launchPlugin = Effect.fn('ZellijAction.launchPlugin')(
	(url: string, options?: LaunchPluginOptions) =>
		actionString('launch-plugin', launchPluginArgs(url, options), options)
);

/**
 * Options for {@link launchOrFocusPlugin}.
 *
 * Adds `moveToFocusedTab` on top of {@link LaunchPluginOptions}.
 *
 * @category Options
 * @since 0.1.0
 */
export interface LaunchOrFocusPluginOptions extends LaunchPluginOptions {
	readonly moveToFocusedTab?: boolean;
}

/**
 * Launch a plugin if not already running; focus it if it is. Returns the
 * plugin pane's id on stdout.
 *
 * Maps to `zellij action launch-or-focus-plugin`.
 *
 * @category Plugins
 * @since 0.1.0
 */
export const launchOrFocusPlugin = Effect.fn(
	'ZellijAction.launchOrFocusPlugin'
)((url: string, options?: LaunchOrFocusPluginOptions) =>
	actionString(
		'launch-or-focus-plugin',
		[
			...launchPluginArgs(url, options),
			...when('--move-to-focused-tab', options?.moveToFocusedTab)
		],
		options
	)
);

/**
 * Launch or reload a plugin (skipping cache). Useful for plugin development.
 *
 * Maps to `zellij action start-or-reload-plugin`.
 *
 * @category Plugins
 * @since 0.1.0
 */
export const startOrReloadPlugin = Effect.fn(
	'ZellijAction.startOrReloadPlugin'
)((
	url: string,
	options?: ActionOptions & {
		readonly configuration?: Readonly<Record<string, string>>;
	}
) => actionVoid(
	'start-or-reload-plugin',
	[
		url,
		...flag('--configuration', options?.configuration, encodeConfig)
	],
	options
));

/**
 * Options for the `zellij action pipe` variant.
 *
 * Note: this is *the action-variant* of pipe (targets plugins, may launch
 * them). The top-level `zellij pipe` is exposed separately on
 * `Zellij.pipe`.
 *
 * @category Options
 * @since 0.1.0
 */
export interface PipeOptions extends ActionOptions {
	readonly name?: string;
	readonly args?: Readonly<Record<string, string>>;
	readonly plugin?: string;
	readonly pluginConfiguration?: Readonly<Record<string, string>>;
	readonly forceLaunchPlugin?: boolean;
	readonly skipPluginCache?: boolean;
	readonly floatingPlugin?: boolean;
	readonly inPlacePlugin?: boolean;
	readonly pluginCwd?: string;
	readonly pluginTitle?: string;
}

/**
 * Send a message (and optionally launch) a plugin via a pipe. Returns
 * stdout verbatim — plugins may emit content back on the pipe.
 *
 * Maps to `zellij action pipe`. The top-level `zellij pipe` command is
 * exposed separately as `Zellij.pipe`.
 *
 * @category Plugins
 * @since 0.1.0
 */
export const pipe = Effect.fn('ZellijAction.pipe')(
	(payload: string, options?: PipeOptions) =>
		actionString(
			'pipe',
			[
				...flag('--name', options?.name),
				...flag('--args', options?.args, encodeConfig),
				...flag('--plugin', options?.plugin),
				...flag(
					'--plugin-configuration',
					options?.pluginConfiguration,
					encodeConfig
				),
				...when('--force-launch-plugin', options?.forceLaunchPlugin),
				...when('--skip-plugin-cache', options?.skipPluginCache),
				...boolFlag('--floating-plugin', options?.floatingPlugin),
				...boolFlag('--in-place-plugin', options?.inPlacePlugin),
				...flag('--plugin-cwd', options?.pluginCwd),
				...flag('--plugin-title', options?.pluginTitle),
				'--',
				payload
			],
			options
		)
);

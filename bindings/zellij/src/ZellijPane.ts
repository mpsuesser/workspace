/**
 * ZellijPane — operations scoped to a single zellij pane.
 *
 * This namespace represents "the pane" as a subject: every method either
 * inspects or mutates one pane. When a method takes a `paneId` option it
 * targets that specific pane; otherwise it targets the focused pane
 * (zellij's CLI default).
 *
 * Session-wide enumerations live on {@link ./ZellijSession.getPanes};
 * tab-scoped enumerations on {@link ./ZellijTab.getPanes}. There is no
 * `list` method here — "list on a pane" would be nonsensical.
 *
 * Every method delegates to {@link ./ZellijAction} for execution so argv
 * construction lives in one place; this layer adds decoded outputs,
 * ergonomic return types, and consistent option shapes.
 *
 * Value-added over the thin {@link ./ZellijAction} layer:
 *
 * - {@link Interface.currentId}      reads `$ZELLIJ_PANE_ID` via
 *   `Config.option` (testable via `ConfigProvider`, per EF-28)
 * - {@link Interface.currentIdOrFail} fails with
 *   {@link ZellijError.NotInSession} when the env var is absent
 * - {@link Interface.info}           looks up a single pane in
 *   `list-panes --json` and fails with
 *   {@link ZellijError.PaneNotFound} when the id isn't present
 * - {@link Interface.create},
 *   {@link Interface.openEditor},
 *   {@link Interface.launchPlugin},
 *   {@link Interface.launchOrFocusPlugin}
 *   parse the id on stdout into a typed {@link PaneId} instead of
 *   returning a raw string
 *
 * @since 0.1.0
 */

import { Effect, Layer } from 'effect';
import * as Arr from 'effect/Array';
import * as Context from 'effect/Context';
import * as Option from 'effect/Option';

import type * as Direction from './schemas/Direction.ts';
import * as PaneId from './schemas/PaneId.ts';
import * as PaneInfo from './schemas/PaneInfo.ts';
import type * as ResizeDirection from './schemas/ResizeDirection.ts';
import type * as SessionName from './schemas/SessionName.ts';
import * as ZellijAction from './ZellijAction.ts';
import * as ZellijCli from './ZellijCli.ts';
import * as ZellijError from './ZellijError.ts';

// ───────────────────────────────────────────────────────────────────────────
// Options types
// ───────────────────────────────────────────────────────────────────────────

/**
 * Base — every operation can target a session other than the caller's
 * default via `session`. Maps to `zellij --session <name>`.
 *
 * @category Options
 * @since 0.1.0
 */
export interface PaneOptionsBase {
	readonly session?: SessionName.SessionName;
}

/**
 * Options for verbs that accept an explicit pane id — otherwise the
 * action operates on the focused pane.
 *
 * @category Options
 * @since 0.1.0
 */
export interface PaneIdOptions extends PaneOptionsBase {
	readonly paneId?: PaneId.PaneId;
}

/**
 * Options for {@link Interface.create}. Mirrors
 * {@link ZellijAction.NewPaneOptions}.
 *
 * @category Options
 * @since 0.1.0
 */
export type CreateOptions = ZellijAction.NewPaneOptions;

/**
 * Options for {@link Interface.openEditor}. Mirrors
 * {@link ZellijAction.EditOptions}.
 *
 * @category Options
 * @since 0.1.0
 */
export type OpenEditorOptions = ZellijAction.EditOptions;

/**
 * Options for {@link Interface.launchPlugin}. Mirrors
 * {@link ZellijAction.LaunchPluginOptions}.
 *
 * @category Options
 * @since 0.1.0
 */
export type LaunchPluginOptions = ZellijAction.LaunchPluginOptions;

/**
 * Options for {@link Interface.launchOrFocusPlugin}. Mirrors
 * {@link ZellijAction.LaunchOrFocusPluginOptions}.
 *
 * @category Options
 * @since 0.1.0
 */
export type LaunchOrFocusPluginOptions =
	ZellijAction.LaunchOrFocusPluginOptions;

/**
 * Options for {@link Interface.startOrReloadPlugin}.
 *
 * @category Options
 * @since 0.1.0
 */
export interface StartOrReloadPluginOptions extends PaneOptionsBase {
	readonly configuration?: Readonly<Record<string, string>>;
}

/**
 * Options for {@link Interface.dumpScreen}. Mirrors
 * {@link ZellijAction.DumpScreenOptions}.
 *
 * @category Options
 * @since 0.1.0
 */
export type DumpScreenOptions = ZellijAction.DumpScreenOptions;

/**
 * Options for {@link Interface.editScrollback}.
 *
 * @category Options
 * @since 0.1.0
 */
export interface EditScrollbackOptions extends PaneIdOptions {
	readonly ansi?: boolean;
}

/**
 * Options for {@link Interface.move}.
 *
 * @category Options
 * @since 0.1.0
 */
export interface MovePaneOptions extends PaneIdOptions {
	readonly direction?: Direction.Direction;
}

/**
 * Options for {@link Interface.setColor}. Mirrors
 * {@link ZellijAction.SetPaneColorOptions}.
 *
 * @category Options
 * @since 0.1.0
 */
export type SetColorOptions = ZellijAction.SetPaneColorOptions;

/**
 * Options for {@link Interface.changeFloatingCoordinates}. Mirrors
 * {@link ZellijAction.ChangeFloatingPaneCoordinatesOptions}.
 *
 * @category Options
 * @since 0.1.0
 */
export type ChangeFloatingCoordinatesOptions =
	ZellijAction.ChangeFloatingPaneCoordinatesOptions;

/**
 * Options for {@link Interface.pipe}. Mirrors
 * {@link ZellijAction.PipeOptions}.
 *
 * @category Options
 * @since 0.1.0
 */
export type PipeOptions = ZellijAction.PipeOptions;

// ───────────────────────────────────────────────────────────────────────────
// Interface
// ───────────────────────────────────────────────────────────────────────────

/**
 * Capability surface of the {@link Service}.
 *
 * @category Models
 * @since 0.1.0
 */
export interface Interface {
	// ─── Current pane discovery ────────────────────────────────────────────

	/**
	 * Read `$ZELLIJ_PANE_ID`. Returns `None` when not running inside a
	 * zellij-managed terminal pane.
	 *
	 * Zellij only exposes terminal panes via this env var, so a positive
	 * read is always the `Terminal` {@link PaneId} variant.
	 */
	readonly currentId: () => Effect.Effect<
		Option.Option<PaneId.PaneId>,
		ZellijError.ZellijError
	>;

	/**
	 * Like {@link currentId} but fails with
	 * {@link ZellijError.NotInSession} when the env var is absent.
	 */
	readonly currentIdOrFail: () => Effect.Effect<
		PaneId.PaneId,
		ZellijError.ZellijError
	>;

	// ─── Inspection ────────────────────────────────────────────────────────

	/**
	 * Fetch the {@link PaneInfo} for a specific pane. Internally lists
	 * every pane in the session and filters by id; fails with
	 * {@link ZellijError.PaneNotFound} when the id isn't present.
	 *
	 * (Zellij's CLI has no direct "inspect pane N" verb, so this
	 * method's cost is roughly that of {@link ./ZellijSession.getPanes}.)
	 */
	readonly info: (
		paneId: PaneId.PaneId,
		options?: PaneOptionsBase
	) => Effect.Effect<PaneInfo.PaneInfo, ZellijError.ZellijError>;

	/**
	 * Dump the target pane's viewport (and optionally full scrollback)
	 * to stdout or to a file path specified in `options.path`.
	 */
	readonly dumpScreen: (
		options?: DumpScreenOptions
	) => Effect.Effect<string, ZellijError.ZellijError>;

	/**
	 * Open a pane's scrollback in `$EDITOR`.
	 */
	readonly editScrollback: (
		options?: EditScrollbackOptions
	) => Effect.Effect<void, ZellijError.ZellijError>;

	// ─── Creation (all return a typed PaneId) ──────────────────────────────

	/**
	 * Create a new pane. Returns the created pane's typed {@link PaneId}
	 * parsed from zellij's stdout.
	 */
	readonly create: (
		options?: CreateOptions
	) => Effect.Effect<PaneId.PaneId, ZellijError.ZellijError>;

	/**
	 * Open `file` in `$EDITOR` inside a new pane. Returns the created
	 * pane's typed {@link PaneId}.
	 */
	readonly openEditor: (
		file: string,
		options?: OpenEditorOptions
	) => Effect.Effect<PaneId.PaneId, ZellijError.ZellijError>;

	/**
	 * Launch a new plugin instance. Returns the created plugin pane's
	 * typed {@link PaneId} (always a `Plugin` variant).
	 */
	readonly launchPlugin: (
		url: string,
		options?: LaunchPluginOptions
	) => Effect.Effect<PaneId.PaneId, ZellijError.ZellijError>;

	/**
	 * Launch a plugin if not already running; focus it if it is.
	 * Returns the plugin pane's typed {@link PaneId}.
	 */
	readonly launchOrFocusPlugin: (
		url: string,
		options?: LaunchOrFocusPluginOptions
	) => Effect.Effect<PaneId.PaneId, ZellijError.ZellijError>;

	/**
	 * Launch or reload a plugin, skipping the plugin cache. Useful for
	 * plugin development. Does not return the pane id.
	 */
	readonly startOrReloadPlugin: (
		url: string,
		options?: StartOrReloadPluginOptions
	) => Effect.Effect<void, ZellijError.ZellijError>;

	// ─── Focus ─────────────────────────────────────────────────────────────

	/**
	 * Focus a specific pane by id.
	 */
	readonly focus: (
		paneId: PaneId.PaneId,
		options?: PaneOptionsBase
	) => Effect.Effect<void, ZellijError.ZellijError>;

	/** Focus the next pane in the focus cycle. */
	readonly focusNext: (
		options?: PaneOptionsBase
	) => Effect.Effect<void, ZellijError.ZellijError>;

	/** Focus the previous pane in the focus cycle. */
	readonly focusPrevious: (
		options?: PaneOptionsBase
	) => Effect.Effect<void, ZellijError.ZellijError>;

	/**
	 * Move focus in the given direction.
	 */
	readonly moveFocus: (
		direction: Direction.Direction,
		options?: PaneOptionsBase
	) => Effect.Effect<void, ZellijError.ZellijError>;

	/**
	 * Move focus in the given direction; if already at the screen edge,
	 * focus the neighbouring tab instead.
	 */
	readonly moveFocusOrTab: (
		direction: Direction.Direction,
		options?: PaneOptionsBase
	) => Effect.Effect<void, ZellijError.ZellijError>;

	// ─── Mutations on target pane ─────────────────────────────────────────

	/**
	 * Close the focused pane (or the pane identified by `paneId`).
	 */
	readonly close: (
		options?: PaneIdOptions
	) => Effect.Effect<void, ZellijError.ZellijError>;

	/**
	 * Rename the focused pane (or the pane identified by `paneId`).
	 */
	readonly rename: (
		name: string,
		options?: PaneIdOptions
	) => Effect.Effect<void, ZellijError.ZellijError>;

	/**
	 * Revert a pane's name to its default (remove the user-set name).
	 */
	readonly undoRename: (
		options?: PaneIdOptions
	) => Effect.Effect<void, ZellijError.ZellijError>;

	/**
	 * Clear all buffers in the target pane.
	 */
	readonly clear: (
		options?: PaneIdOptions
	) => Effect.Effect<void, ZellijError.ZellijError>;

	// ─── Geometry & state ─────────────────────────────────────────────────

	/**
	 * Resize the target pane in the given direction.
	 */
	readonly resize: (
		direction: ResizeDirection.ResizeDirection,
		options?: PaneIdOptions
	) => Effect.Effect<void, ZellijError.ZellijError>;

	/**
	 * Relocate the target pane in the layout, optionally in a specific
	 * direction.
	 */
	readonly move: (
		options?: MovePaneOptions
	) => Effect.Effect<void, ZellijError.ZellijError>;

	/**
	 * Rotate the target pane backwards in the layout order.
	 */
	readonly moveBackwards: (
		options?: PaneIdOptions
	) => Effect.Effect<void, ZellijError.ZellijError>;

	/**
	 * Toggle fullscreen on the target pane.
	 */
	readonly toggleFullscreen: (
		options?: PaneIdOptions
	) => Effect.Effect<void, ZellijError.ZellijError>;

	/**
	 * Float an embedded pane or embed a floating pane.
	 */
	readonly toggleEmbedOrFloating: (
		options?: PaneIdOptions
	) => Effect.Effect<void, ZellijError.ZellijError>;

	/**
	 * Toggle pin (always-on-top) state of a floating pane.
	 */
	readonly togglePinned: (
		options?: PaneIdOptions
	) => Effect.Effect<void, ZellijError.ZellijError>;

	/**
	 * Toggle the borderless state of a specific pane. Zellij requires a
	 * `paneId` here; this is not an implicit-focused-pane verb.
	 */
	readonly toggleBorderless: (
		paneId: PaneId.PaneId,
		options?: PaneOptionsBase
	) => Effect.Effect<void, ZellijError.ZellijError>;

	/**
	 * Explicitly set the borderless state of a pane.
	 */
	readonly setBorderless: (
		paneId: PaneId.PaneId,
		borderless: boolean,
		options?: PaneOptionsBase
	) => Effect.Effect<void, ZellijError.ZellijError>;

	/**
	 * Set (or reset) the foreground / background color of a pane.
	 */
	readonly setColor: (
		options?: SetColorOptions
	) => Effect.Effect<void, ZellijError.ZellijError>;

	/**
	 * Reposition and/or resize a floating pane.
	 */
	readonly changeFloatingCoordinates: (
		options: ChangeFloatingCoordinatesOptions
	) => Effect.Effect<void, ZellijError.ZellijError>;

	/**
	 * Collapse a list of panes into a single stack (top-to-bottom in
	 * the order given).
	 */
	readonly stack: (
		panes: ReadonlyArray<PaneId.PaneId>,
		options?: PaneOptionsBase
	) => Effect.Effect<void, ZellijError.ZellijError>;

	// ─── Input ────────────────────────────────────────────────────────────

	/**
	 * Write literal characters to the target pane.
	 */
	readonly writeChars: (
		chars: string,
		options?: PaneIdOptions
	) => Effect.Effect<void, ZellijError.ZellijError>;

	/**
	 * Write raw bytes to the target pane. `bytes` is an array of numeric
	 * byte values.
	 */
	readonly writeBytes: (
		bytes: ReadonlyArray<number>,
		options?: PaneIdOptions
	) => Effect.Effect<void, ZellijError.ZellijError>;

	/**
	 * Paste a multi-line string using bracketed paste mode (faster and
	 * safer for arbitrary text than {@link writeChars}).
	 */
	readonly paste: (
		text: string,
		options?: PaneIdOptions
	) => Effect.Effect<void, ZellijError.ZellijError>;

	/**
	 * Send one or more named keys to the target pane (e.g.
	 * `["Ctrl a", "Enter"]`).
	 */
	readonly sendKeys: (
		keys: ReadonlyArray<string>,
		options?: PaneIdOptions
	) => Effect.Effect<void, ZellijError.ZellijError>;

	// ─── Scrolling ────────────────────────────────────────────────────────

	/** Scroll up one line. */
	readonly scrollUp: (
		options?: PaneIdOptions
	) => Effect.Effect<void, ZellijError.ZellijError>;

	/** Scroll down one line. */
	readonly scrollDown: (
		options?: PaneIdOptions
	) => Effect.Effect<void, ZellijError.ZellijError>;

	/** Scroll up a full page. */
	readonly pageScrollUp: (
		options?: PaneIdOptions
	) => Effect.Effect<void, ZellijError.ZellijError>;

	/** Scroll down a full page. */
	readonly pageScrollDown: (
		options?: PaneIdOptions
	) => Effect.Effect<void, ZellijError.ZellijError>;

	/** Scroll up half a page. */
	readonly halfPageScrollUp: (
		options?: PaneIdOptions
	) => Effect.Effect<void, ZellijError.ZellijError>;

	/** Scroll down half a page. */
	readonly halfPageScrollDown: (
		options?: PaneIdOptions
	) => Effect.Effect<void, ZellijError.ZellijError>;

	/** Scroll to the top. */
	readonly scrollToTop: (
		options?: PaneIdOptions
	) => Effect.Effect<void, ZellijError.ZellijError>;

	/** Scroll to the bottom. */
	readonly scrollToBottom: (
		options?: PaneIdOptions
	) => Effect.Effect<void, ZellijError.ZellijError>;

	// ─── Plugin messaging ─────────────────────────────────────────────────

	/**
	 * Send a message (and optionally launch) a plugin via a pipe.
	 * Returns stdout verbatim — plugins may emit content back on the
	 * pipe.
	 *
	 * This is the **action-variant** of `pipe` — targets plugin panes
	 * and may launch them. The top-level `zellij pipe` command (which
	 * pipes data between panes/sessions) is not the same thing.
	 */
	readonly pipe: (
		payload: string,
		options?: PipeOptions
	) => Effect.Effect<string, ZellijError.ZellijError>;
}

/**
 * The `ZellijPane` service identity.
 *
 * @category Service
 * @since 0.1.0
 */
export class Service extends Context.Service<Service, Interface>()(
	'@workspace/zellij-binding/ZellijPane'
) {}

// ───────────────────────────────────────────────────────────────────────────
// Layer
// ───────────────────────────────────────────────────────────────────────────

/**
 * Helper shared by every creation method: parse zellij's stdout (which
 * contains a pane id string like `"terminal_5"` or `"plugin_3"`) into a
 * typed {@link PaneId}; fail with {@link ZellijError.DecodeFailure} when
 * the id is unparseable.
 */
const parsePaneId = (argv: ReadonlyArray<string>, stdout: string) =>
	Option.match(PaneId.fromCliArg(stdout.trim()), {
		onNone: () =>
			Effect.fail(
				ZellijError.decodeFailure({
					argv,
					output: stdout,
					issue: 'pane-id is not of the form terminal_N / plugin_N'
				})
			),
		onSome: Effect.succeed
	});

/**
 * Live implementation of {@link Service}. Captures {@link ZellijCli.Service}
 * in the closure so every method in the returned Interface has
 * `Requirements = never` (per the "No Requirement Leakage" rule in the
 * service-implementation skill).
 *
 * @category Layers
 * @since 0.1.0
 */
export const layer = Layer.effect(
	Service,
	Effect.gen(function* () {
		const cli = yield* ZellijCli.Service;

		// `runAction` satisfies a delegated Effect's captured
		// `ZellijCli.Service` requirement with the already-acquired
		// `cli` instance.
		const runAction = <A>(
			eff: Effect.Effect<
				A,
				ZellijError.ZellijError,
				ZellijCli.Service
			>
		): Effect.Effect<A, ZellijError.ZellijError> =>
			Effect.provideService(eff, ZellijCli.Service, cli);

		// ── Current pane discovery ───────────────────────────────────────

		const currentId: Interface['currentId'] = Effect.fn(
			'ZellijPane.currentId'
		)(() =>
			// `PaneId.fromEnv` already reads `$ZELLIJ_PANE_ID` via
			// `Config.option` and returns an `Option<Terminal>`; the
			// residual `ConfigError` is invariant (env values are always
			// strings) so we `orDie` it per EF-31.
			//
			// `Terminal` is a variant of the `PaneId` union, so the
			// `Option<Terminal>` produced by `fromEnv` is assignable to
			// `Option<PaneId>` without any cast — we rely on the
			// annotated `currentId: Interface['currentId']` binding to
			// widen the return type at the assignment site.
			PaneId.fromEnv.pipe(Effect.orDie)
		);

		const currentIdOrFail = Effect.fn('ZellijPane.currentIdOrFail')(() =>
			currentId().pipe(
				Effect.flatMap(
					Option.match({
						onNone: () => Effect.fail(ZellijError.notInSession()),
						onSome: Effect.succeed
					})
				)
			)
		);

		// ── Inspection ───────────────────────────────────────────────────

		const info = Effect.fn('ZellijPane.info')(
			(paneId: PaneId.PaneId, options?: PaneOptionsBase) =>
				Effect.gen(function* () {
					// No dedicated CLI for single-pane inspection — list
					// every pane and filter by id.
					const stdout = yield* runAction(
						ZellijAction.listPanes({ ...options, json: true })
					);
					const all = yield* PaneInfo.decodeJson(stdout).pipe(
						Effect.mapError((issue) =>
							ZellijError.decodeFailure({
								argv: ['action', 'list-panes', '--json'],
								output: stdout,
								issue: String(issue)
							})
						)
					);
					return yield* Option.match(
						Arr.findFirst(
							all,
							(p) =>
								p.is_plugin ===
									(paneId.kind === 'plugin')
								&& p.id === paneId.id
						),
						{
							onNone: () =>
								Effect.fail(ZellijError.paneNotFound(paneId)),
							onSome: Effect.succeed
						}
					);
				})
		);

		const dumpScreen = Effect.fn('ZellijPane.dumpScreen')(
			(options?: DumpScreenOptions) =>
				runAction(ZellijAction.dumpScreen(options))
		);

		const editScrollback = Effect.fn('ZellijPane.editScrollback')(
			(options?: EditScrollbackOptions) =>
				runAction(ZellijAction.editScrollback(options))
		);

		// ── Creation ─────────────────────────────────────────────────────

		const create = Effect.fn('ZellijPane.create')(
			(options?: CreateOptions) =>
				runAction(ZellijAction.newPane(options)).pipe(
					Effect.flatMap((stdout) =>
						parsePaneId(['action', 'new-pane'], stdout)
					)
				)
		);

		const openEditor = Effect.fn('ZellijPane.openEditor')(
			(file: string, options?: OpenEditorOptions) =>
				runAction(ZellijAction.edit(file, options)).pipe(
					Effect.flatMap((stdout) =>
						parsePaneId(['action', 'edit', file], stdout)
					)
				)
		);

		const launchPlugin = Effect.fn('ZellijPane.launchPlugin')(
			(url: string, options?: LaunchPluginOptions) =>
				runAction(ZellijAction.launchPlugin(url, options)).pipe(
					Effect.flatMap((stdout) =>
						parsePaneId(['action', 'launch-plugin', url], stdout)
					)
				)
		);

		const launchOrFocusPlugin = Effect.fn(
			'ZellijPane.launchOrFocusPlugin'
		)((url: string, options?: LaunchOrFocusPluginOptions) =>
			runAction(ZellijAction.launchOrFocusPlugin(url, options)).pipe(
				Effect.flatMap((stdout) =>
					parsePaneId(
						['action', 'launch-or-focus-plugin', url],
						stdout
					)
				)
			)
		);

		const startOrReloadPlugin = Effect.fn(
			'ZellijPane.startOrReloadPlugin'
		)((url: string, options?: StartOrReloadPluginOptions) =>
			runAction(ZellijAction.startOrReloadPlugin(url, options))
		);

		// ── Focus ────────────────────────────────────────────────────────

		const focus = Effect.fn('ZellijPane.focus')(
			(paneId: PaneId.PaneId, options?: PaneOptionsBase) =>
				runAction(ZellijAction.focusPaneId(paneId, options))
		);

		const focusNext = Effect.fn('ZellijPane.focusNext')(
			(options?: PaneOptionsBase) =>
				runAction(ZellijAction.focusNextPane(options))
		);

		const focusPrevious = Effect.fn('ZellijPane.focusPrevious')(
			(options?: PaneOptionsBase) =>
				runAction(ZellijAction.focusPreviousPane(options))
		);

		const moveFocus = Effect.fn('ZellijPane.moveFocus')(
			(
				direction: Direction.Direction,
				options?: PaneOptionsBase
			) => runAction(ZellijAction.moveFocus(direction, options))
		);

		const moveFocusOrTab = Effect.fn('ZellijPane.moveFocusOrTab')(
			(
				direction: Direction.Direction,
				options?: PaneOptionsBase
			) => runAction(ZellijAction.moveFocusOrTab(direction, options))
		);

		// ── Mutations ────────────────────────────────────────────────────

		const close = Effect.fn('ZellijPane.close')(
			(options?: PaneIdOptions) =>
				runAction(ZellijAction.closePane(options))
		);

		const rename = Effect.fn('ZellijPane.rename')(
			(name: string, options?: PaneIdOptions) =>
				runAction(ZellijAction.renamePane(name, options))
		);

		const undoRename = Effect.fn('ZellijPane.undoRename')(
			(options?: PaneIdOptions) =>
				runAction(ZellijAction.undoRenamePane(options))
		);

		const clear = Effect.fn('ZellijPane.clear')(
			(options?: PaneIdOptions) => runAction(ZellijAction.clear(options))
		);

		// ── Geometry & state ────────────────────────────────────────────

		const resize = Effect.fn('ZellijPane.resize')(
			(
				direction: ResizeDirection.ResizeDirection,
				options?: PaneIdOptions
			) => runAction(ZellijAction.resize(direction, options))
		);

		const move = Effect.fn('ZellijPane.move')(
			(options?: MovePaneOptions) =>
				runAction(ZellijAction.movePane(options))
		);

		const moveBackwards = Effect.fn('ZellijPane.moveBackwards')(
			(options?: PaneIdOptions) =>
				runAction(ZellijAction.movePaneBackwards(options))
		);

		const toggleFullscreen = Effect.fn('ZellijPane.toggleFullscreen')(
			(options?: PaneIdOptions) =>
				runAction(ZellijAction.toggleFullscreen(options))
		);

		const toggleEmbedOrFloating = Effect.fn(
			'ZellijPane.toggleEmbedOrFloating'
		)((options?: PaneIdOptions) =>
			runAction(ZellijAction.togglePaneEmbedOrFloating(options))
		);

		const togglePinned = Effect.fn('ZellijPane.togglePinned')(
			(options?: PaneIdOptions) =>
				runAction(ZellijAction.togglePanePinned(options))
		);

		const toggleBorderless = Effect.fn('ZellijPane.toggleBorderless')(
			(paneId: PaneId.PaneId, options?: PaneOptionsBase) =>
				runAction(ZellijAction.togglePaneBorderless(paneId, options))
		);

		const setBorderless = Effect.fn('ZellijPane.setBorderless')(
			(
				paneId: PaneId.PaneId,
				borderless: boolean,
				options?: PaneOptionsBase
			) => runAction(
				ZellijAction.setPaneBorderless(
					paneId,
					borderless,
					options
				)
			)
		);

		const setColor = Effect.fn('ZellijPane.setColor')(
			(options?: SetColorOptions) =>
				runAction(ZellijAction.setPaneColor(options))
		);

		const changeFloatingCoordinates = Effect.fn(
			'ZellijPane.changeFloatingCoordinates'
		)((options: ChangeFloatingCoordinatesOptions) =>
			runAction(ZellijAction.changeFloatingPaneCoordinates(options))
		);

		const stack = Effect.fn('ZellijPane.stack')(
			(
				panes: ReadonlyArray<PaneId.PaneId>,
				options?: PaneOptionsBase
			) => runAction(ZellijAction.stackPanes(panes, options))
		);

		// ── Input ────────────────────────────────────────────────────────

		const writeChars = Effect.fn('ZellijPane.writeChars')(
			(chars: string, options?: PaneIdOptions) =>
				runAction(ZellijAction.writeChars(chars, options))
		);

		const writeBytes = Effect.fn('ZellijPane.writeBytes')(
			(bytes: ReadonlyArray<number>, options?: PaneIdOptions) =>
				runAction(ZellijAction.write(bytes, options))
		);

		const paste = Effect.fn('ZellijPane.paste')(
			(text: string, options?: PaneIdOptions) =>
				runAction(ZellijAction.paste(text, options))
		);

		const sendKeys = Effect.fn('ZellijPane.sendKeys')(
			(keys: ReadonlyArray<string>, options?: PaneIdOptions) =>
				runAction(ZellijAction.sendKeys(keys, options))
		);

		// ── Scrolling ────────────────────────────────────────────────────

		const scrollUp = Effect.fn('ZellijPane.scrollUp')(
			(options?: PaneIdOptions) =>
				runAction(ZellijAction.scrollUp(options))
		);

		const scrollDown = Effect.fn('ZellijPane.scrollDown')(
			(options?: PaneIdOptions) =>
				runAction(ZellijAction.scrollDown(options))
		);

		const pageScrollUp = Effect.fn('ZellijPane.pageScrollUp')(
			(options?: PaneIdOptions) =>
				runAction(ZellijAction.pageScrollUp(options))
		);

		const pageScrollDown = Effect.fn('ZellijPane.pageScrollDown')(
			(options?: PaneIdOptions) =>
				runAction(ZellijAction.pageScrollDown(options))
		);

		const halfPageScrollUp = Effect.fn('ZellijPane.halfPageScrollUp')(
			(options?: PaneIdOptions) =>
				runAction(ZellijAction.halfPageScrollUp(options))
		);

		const halfPageScrollDown = Effect.fn(
			'ZellijPane.halfPageScrollDown'
		)((options?: PaneIdOptions) =>
			runAction(ZellijAction.halfPageScrollDown(options))
		);

		const scrollToTop = Effect.fn('ZellijPane.scrollToTop')(
			(options?: PaneIdOptions) =>
				runAction(ZellijAction.scrollToTop(options))
		);

		const scrollToBottom = Effect.fn('ZellijPane.scrollToBottom')(
			(options?: PaneIdOptions) =>
				runAction(ZellijAction.scrollToBottom(options))
		);

		// ── Plugin messaging ─────────────────────────────────────────────

		const pipe = Effect.fn('ZellijPane.pipe')(
			(payload: string, options?: PipeOptions) =>
				runAction(ZellijAction.pipe(payload, options))
		);

		return Service.of({
			currentId,
			currentIdOrFail,
			info,
			dumpScreen,
			editScrollback,
			create,
			openEditor,
			launchPlugin,
			launchOrFocusPlugin,
			startOrReloadPlugin,
			focus,
			focusNext,
			focusPrevious,
			moveFocus,
			moveFocusOrTab,
			close,
			rename,
			undoRename,
			clear,
			resize,
			move,
			moveBackwards,
			toggleFullscreen,
			toggleEmbedOrFloating,
			togglePinned,
			toggleBorderless,
			setBorderless,
			setColor,
			changeFloatingCoordinates,
			stack,
			writeChars,
			writeBytes,
			paste,
			sendKeys,
			scrollUp,
			scrollDown,
			pageScrollUp,
			pageScrollDown,
			halfPageScrollUp,
			halfPageScrollDown,
			scrollToTop,
			scrollToBottom,
			pipe
		});
	})
);

/**
 * Fully-wired default layer. Still requires a `ChildProcessSpawner` from
 * the platform (e.g. `BunServices.layer`).
 *
 * @category Layers
 * @since 0.1.0
 */
export const defaultLayer = layer.pipe(Layer.provide(ZellijCli.layer));

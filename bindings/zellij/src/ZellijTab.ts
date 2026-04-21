/**
 * ZellijTab — domain-oriented tab service.
 *
 * Every method delegates to {@link ZellijAction} for execution (so argv
 * construction lives in one place), adding decoded outputs, ergonomic
 * return types, and consistent option shapes on top.
 *
 * Value-added over the thin {@link ZellijAction} layer:
 *
 * - {@link Interface.list}        decodes `list-tabs --json`        → `ReadonlyArray<TabInfo>`
 * - {@link Interface.currentInfo} decodes `current-tab-info --json` → `TabInfo`
 * - {@link Interface.names}       splits  `query-tab-names`         → `ReadonlyArray<string>`
 * - {@link Interface.areFloatingVisible} lifts the exit code of
 *   `are-floating-panes-visible` into a `boolean` (0 = visible).
 * - Show/hide/toggle floating-pane verbs return `void` — the exit-code
 *   nuance of "no floating panes existed" vs. "already visible" is not
 *   surfaced here. Drop down to {@link ZellijAction} when that matters.
 *
 * This namespace covers the `zellij action <tab-verb>` surface and the
 * tab-scoped floating-pane visibility helpers. Session-wide or pane-level
 * operations live in `ZellijSession` / `ZellijPane`.
 *
 * @since 0.1.0
 */

import { Effect, Layer, pipe } from 'effect';
import * as Arr from 'effect/Array';
import * as Context from 'effect/Context';
import * as Str from 'effect/String';

import * as SessionName from './schemas/SessionName.ts';
import * as TabId from './schemas/TabId.ts';
import * as TabInfo from './schemas/TabInfo.ts';
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
export interface TabOptionsBase {
	readonly session?: SessionName.SessionName;
}

/**
 * Options for verbs that accept an explicit tab id — otherwise the action
 * operates on the focused tab.
 *
 * @category Options
 * @since 0.1.0
 */
export interface TabIdOptions extends TabOptionsBase {
	readonly tabId?: TabId.TabId;
}

/**
 * Options for {@link Interface.goToName}.
 *
 * @category Options
 * @since 0.1.0
 */
export interface GoToNameOptions extends TabOptionsBase {
	/** Create the tab if a tab of that name does not exist. */
	readonly create?: boolean;
}

/**
 * Options for {@link Interface.new}. Mirrors
 * {@link ZellijAction.NewTabOptions}.
 *
 * @category Options
 * @since 0.1.0
 */
export type NewTabOptions = ZellijAction.NewTabOptions;

/**
 * Options for {@link Interface.overrideLayout}. Mirrors
 * {@link ZellijAction.OverrideLayoutOptions}.
 *
 * @category Options
 * @since 0.1.0
 */
export type OverrideLayoutOptions = ZellijAction.OverrideLayoutOptions;

/**
 * The direction a tab can be shuffled within the tab bar.
 *
 * @category Options
 * @since 0.1.0
 */
export type MoveDirection = 'left' | 'right';

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
	// ─── Queries ────────────────────────────────────────────────────────────

	/**
	 * List every tab in the target session as typed {@link TabInfo} rows.
	 * Always requests `--json` internally; raw text output is not exposed.
	 */
	readonly list: (
		options?: TabOptionsBase
	) => Effect.Effect<
		ReadonlyArray<TabInfo.TabInfo>,
		ZellijError.ZellijError
	>;

	/**
	 * Return typed info for the currently focused tab.
	 */
	readonly currentInfo: (
		options?: TabOptionsBase
	) => Effect.Effect<TabInfo.TabInfo, ZellijError.ZellijError>;

	/**
	 * Return just the names of every tab, in tab-bar order.
	 *
	 * Maps to `zellij action query-tab-names`; the output is
	 * newline-separated text which this method splits and trims.
	 */
	readonly names: (
		options?: TabOptionsBase
	) => Effect.Effect<
		ReadonlyArray<string>,
		ZellijError.ZellijError
	>;

	/**
	 * `true` when the tab currently shows floating panes.
	 *
	 * Maps to `zellij action are-floating-panes-visible` — the exit code
	 * is lifted into a boolean (exit 0 → visible, any non-zero → not
	 * visible, which covers both "hidden" and "no floating panes exist").
	 */
	readonly areFloatingVisible: (
		options?: TabIdOptions
	) => Effect.Effect<boolean, ZellijError.ZellijError>;

	// ─── Lifecycle ─────────────────────────────────────────────────────────

	/**
	 * Create a new tab. `zellij`'s `new-tab` subcommand does not print the
	 * new tab's id, so this returns `void`; call {@link currentInfo}
	 * afterwards to read it back.
	 */
	readonly new: (
		options?: NewTabOptions
	) => Effect.Effect<void, ZellijError.ZellijError>;

	/**
	 * Close the focused tab (or the tab identified by `tabId`).
	 */
	readonly close: (
		options?: TabIdOptions
	) => Effect.Effect<void, ZellijError.ZellijError>;

	/**
	 * Close a tab by its stable {@link TabId}.
	 */
	readonly closeById: (
		tabId: TabId.TabId,
		options?: TabOptionsBase
	) => Effect.Effect<void, ZellijError.ZellijError>;

	// ─── Navigation ────────────────────────────────────────────────────────

	/** Focus the next tab. */
	readonly goToNext: (
		options?: TabOptionsBase
	) => Effect.Effect<void, ZellijError.ZellijError>;

	/** Focus the previous tab. */
	readonly goToPrevious: (
		options?: TabOptionsBase
	) => Effect.Effect<void, ZellijError.ZellijError>;

	/**
	 * Focus the tab at the given 1-based ordinal index (the position
	 * number printed in `list-tabs`; not stable across reorders).
	 */
	readonly goTo: (
		index: number,
		options?: TabOptionsBase
	) => Effect.Effect<void, ZellijError.ZellijError>;

	/**
	 * Focus a tab by its stable {@link TabId}.
	 */
	readonly goToById: (
		tabId: TabId.TabId,
		options?: TabOptionsBase
	) => Effect.Effect<void, ZellijError.ZellijError>;

	/**
	 * Focus a tab by name. When `create: true` is set, zellij creates a
	 * new tab with that name if none exists.
	 */
	readonly goToName: (
		name: string,
		options?: GoToNameOptions
	) => Effect.Effect<void, ZellijError.ZellijError>;

	/**
	 * Shuffle the focused tab (or a tab identified by `tabId`) left or
	 * right in the tab bar.
	 */
	readonly move: (
		direction: MoveDirection,
		options?: TabIdOptions
	) => Effect.Effect<void, ZellijError.ZellijError>;

	// ─── Naming ────────────────────────────────────────────────────────────

	/**
	 * Rename the focused tab (or the tab identified by `tabId`).
	 */
	readonly rename: (
		name: string,
		options?: TabIdOptions
	) => Effect.Effect<void, ZellijError.ZellijError>;

	/**
	 * Rename a tab by its stable {@link TabId}.
	 */
	readonly renameById: (
		tabId: TabId.TabId,
		name: string,
		options?: TabOptionsBase
	) => Effect.Effect<void, ZellijError.ZellijError>;

	/**
	 * Revert the focused tab's name to the default.
	 */
	readonly undoRename: (
		options?: TabIdOptions
	) => Effect.Effect<void, ZellijError.ZellijError>;

	// ─── Sync & swap layouts ───────────────────────────────────────────────

	/**
	 * Toggle sync-panes-in-tab: when on, keyboard input is broadcast to
	 * every pane in the tab simultaneously.
	 */
	readonly toggleSync: (
		options?: TabIdOptions
	) => Effect.Effect<void, ZellijError.ZellijError>;

	/** Cycle to the next swap layout on the target tab. */
	readonly nextSwapLayout: (
		options?: TabIdOptions
	) => Effect.Effect<void, ZellijError.ZellijError>;

	/** Cycle to the previous swap layout on the target tab. */
	readonly previousSwapLayout: (
		options?: TabIdOptions
	) => Effect.Effect<void, ZellijError.ZellijError>;

	/**
	 * Replace the current tab's layout with a new one, either from a file
	 * path or inline KDL.
	 */
	readonly overrideLayout: (
		options: OverrideLayoutOptions
	) => Effect.Effect<void, ZellijError.ZellijError>;

	// ─── Floating pane visibility (tab-scoped) ────────────────────────────

	/**
	 * Show every floating pane in the target tab. Exit-code nuances
	 * ("no floating panes", "already visible") are discarded — use
	 * {@link ZellijAction.showFloatingPanes} when they matter.
	 */
	readonly showFloating: (
		options?: TabIdOptions
	) => Effect.Effect<void, ZellijError.ZellijError>;

	/**
	 * Hide every floating pane in the target tab.
	 */
	readonly hideFloating: (
		options?: TabIdOptions
	) => Effect.Effect<void, ZellijError.ZellijError>;

	/**
	 * Toggle floating-pane visibility; creates a floating pane if none
	 * exist.
	 */
	readonly toggleFloating: (
		options?: TabIdOptions
	) => Effect.Effect<void, ZellijError.ZellijError>;
}

/**
 * The `ZellijTab` service identity.
 *
 * @category Service
 * @since 0.1.0
 */
export class Service extends Context.Service<Service, Interface>()(
	'@workspace/zellij-binding/ZellijTab'
) {}

// ───────────────────────────────────────────────────────────────────────────
// Layer
// ───────────────────────────────────────────────────────────────────────────

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
		// `ZellijCli.Service` requirement with the already-acquired `cli`
		// instance, so every public method returns
		// `Effect<A, ZellijError, never>`.
		const runAction = <A>(
			eff: Effect.Effect<
				A,
				ZellijError.ZellijError,
				ZellijCli.Service
			>
		): Effect.Effect<A, ZellijError.ZellijError> =>
			Effect.provideService(eff, ZellijCli.Service, cli);

		// ── Queries ───────────────────────────────────────────────────────

		const list = Effect.fn('ZellijTab.list')(
			(options?: TabOptionsBase) =>
				runAction(
					ZellijAction.listTabs({ ...options, json: true })
				).pipe(
					Effect.flatMap((stdout) =>
						TabInfo.decodeJsonArray(stdout).pipe(
							Effect.mapError((issue) =>
								ZellijError.decodeFailure({
									argv: ['action', 'list-tabs', '--json'],
									output: stdout,
									issue: String(issue)
								})
							)
						)
					)
				)
		);

		const currentInfo = Effect.fn('ZellijTab.currentInfo')(
			(options?: TabOptionsBase) =>
				runAction(
					ZellijAction.currentTabInfo({
						...options,
						json: true
					})
				).pipe(
					Effect.flatMap((stdout) =>
						TabInfo.decodeJsonSingle(stdout).pipe(
							Effect.mapError((issue) =>
								ZellijError.decodeFailure({
									argv: [
										'action',
										'current-tab-info',
										'--json'
									],
									output: stdout,
									issue: String(issue)
								})
							)
						)
					)
				)
		);

		const names = Effect.fn('ZellijTab.names')(
			(options?: TabOptionsBase) =>
				runAction(ZellijAction.queryTabNames(options)).pipe(
					Effect.map((stdout) =>
						// `query-tab-names` prints one name per line; some
						// zellij builds also append a trailing newline, so
						// trim each entry and drop blanks.
						pipe(
							Str.split('\n')(stdout),
							Arr.map(Str.trim),
							Arr.filter(Str.isNonEmpty)
						)
					)
				)
		);

		const areFloatingVisible = Effect.fn('ZellijTab.areFloatingVisible')(
			(options?: TabIdOptions) =>
				runAction(ZellijAction.areFloatingPanesVisible(options)).pipe(
					Effect.map((code) => code === 0)
				)
		);

		// ── Lifecycle ─────────────────────────────────────────────────────

		const new_ = Effect.fn('ZellijTab.new')(
			(options?: NewTabOptions) =>
				runAction(ZellijAction.newTab(options)).pipe(Effect.asVoid)
		);

		const close = Effect.fn('ZellijTab.close')(
			(options?: TabIdOptions) =>
				runAction(ZellijAction.closeTab(options))
		);

		const closeById = Effect.fn('ZellijTab.closeById')(
			(tabId: TabId.TabId, options?: TabOptionsBase) =>
				runAction(ZellijAction.closeTabById(tabId, options))
		);

		// ── Navigation ────────────────────────────────────────────────────

		const goToNext = Effect.fn('ZellijTab.goToNext')(
			(options?: TabOptionsBase) =>
				runAction(ZellijAction.goToNextTab(options))
		);

		const goToPrevious = Effect.fn('ZellijTab.goToPrevious')(
			(options?: TabOptionsBase) =>
				runAction(ZellijAction.goToPreviousTab(options))
		);

		const goTo = Effect.fn('ZellijTab.goTo')(
			(index: number, options?: TabOptionsBase) =>
				runAction(ZellijAction.goToTab(index, options))
		);

		const goToById = Effect.fn('ZellijTab.goToById')(
			(tabId: TabId.TabId, options?: TabOptionsBase) =>
				runAction(ZellijAction.goToTabById(tabId, options))
		);

		const goToName = Effect.fn('ZellijTab.goToName')(
			(name: string, options?: GoToNameOptions) =>
				// ZellijAction.goToTabName returns stdout (the new tab id
				// when `create` caused creation); we discard it — callers
				// wanting the id should read it via `currentInfo()`.
				runAction(ZellijAction.goToTabName(name, options)).pipe(
					Effect.asVoid
				)
		);

		const move = Effect.fn('ZellijTab.move')(
			(direction: MoveDirection, options?: TabIdOptions) =>
				runAction(ZellijAction.moveTab(direction, options))
		);

		// ── Naming ────────────────────────────────────────────────────────

		const rename = Effect.fn('ZellijTab.rename')(
			(name: string, options?: TabIdOptions) =>
				runAction(ZellijAction.renameTab(name, options))
		);

		const renameById = Effect.fn('ZellijTab.renameById')(
			(
				tabId: TabId.TabId,
				name: string,
				options?: TabOptionsBase
			) => runAction(ZellijAction.renameTabById(tabId, name, options))
		);

		const undoRename = Effect.fn('ZellijTab.undoRename')(
			(options?: TabIdOptions) =>
				runAction(ZellijAction.undoRenameTab(options))
		);

		// ── Sync & swap layouts ───────────────────────────────────────────

		const toggleSync = Effect.fn('ZellijTab.toggleSync')(
			(options?: TabIdOptions) =>
				runAction(ZellijAction.toggleActiveSyncTab(options))
		);

		const nextSwapLayout = Effect.fn('ZellijTab.nextSwapLayout')(
			(options?: TabIdOptions) =>
				runAction(ZellijAction.nextSwapLayout(options))
		);

		const previousSwapLayout = Effect.fn('ZellijTab.previousSwapLayout')(
			(options?: TabIdOptions) =>
				runAction(ZellijAction.previousSwapLayout(options))
		);

		const overrideLayout = Effect.fn('ZellijTab.overrideLayout')(
			(options: OverrideLayoutOptions) =>
				runAction(ZellijAction.overrideLayout(options))
		);

		// ── Floating pane visibility (tab-scoped) ─────────────────────────

		const showFloating = Effect.fn('ZellijTab.showFloating')(
			(options?: TabIdOptions) =>
				runAction(ZellijAction.showFloatingPanes(options)).pipe(
					Effect.asVoid
				)
		);

		const hideFloating = Effect.fn('ZellijTab.hideFloating')(
			(options?: TabIdOptions) =>
				runAction(ZellijAction.hideFloatingPanes(options)).pipe(
					Effect.asVoid
				)
		);

		const toggleFloating = Effect.fn('ZellijTab.toggleFloating')(
			(options?: TabIdOptions) =>
				runAction(ZellijAction.toggleFloatingPanes(options))
		);

		return Service.of({
			list,
			currentInfo,
			names,
			areFloatingVisible,
			new: new_,
			close,
			closeById,
			goToNext,
			goToPrevious,
			goTo,
			goToById,
			goToName,
			move,
			rename,
			renameById,
			undoRename,
			toggleSync,
			nextSwapLayout,
			previousSwapLayout,
			overrideLayout,
			showFloating,
			hideFloating,
			toggleFloating
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

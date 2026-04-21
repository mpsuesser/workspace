/**
 * Pane ID — a discriminated union of terminal panes and plugin panes.
 *
 * Terminal panes and plugin panes share overlapping numeric ID namespaces, so
 * zellij distinguishes them via the `terminal_N` / `plugin_N` prefix
 * convention (see docs: "CLI Actions > A note about pane ids").
 *
 * This module models pane IDs as a schema-first tagged union so call sites
 * pattern-match exhaustively on `Terminal` vs `Plugin` rather than fiddling
 * with ad-hoc string parsing.
 *
 * The `$ZELLIJ_PANE_ID` env var surfaces the current terminal pane's numeric
 * id (without prefix); see {@link fromEnv} for an Effect-ful reader.
 *
 * @since 0.1.0
 */

import * as Config from 'effect/Config';
import * as Effect from 'effect/Effect';
import * as Option from 'effect/Option';
import * as Schema from 'effect/Schema';

// ───────────────────────────────────────────────────────────────────────────
// Variants
// ───────────────────────────────────────────────────────────────────────────

/**
 * A terminal-type pane (i.e. hosts a shell or explicit command).
 *
 * @category Schemas
 * @since 0.1.0
 */
export class Terminal extends Schema.Class<Terminal>('Terminal')({
	kind: Schema.tag('terminal'),
	id: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0))
}) {}

/**
 * A plugin-type pane (e.g. tab-bar, status-bar, strider).
 *
 * @category Schemas
 * @since 0.1.0
 */
export class Plugin extends Schema.Class<Plugin>('Plugin')({
	kind: Schema.tag('plugin'),
	id: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0))
}) {}

/**
 * Discriminated union of every pane-id variant.
 *
 * @category Schemas
 * @since 0.1.0
 */
export const PaneId = Schema.Union([Terminal, Plugin])
	.annotate({
		identifier: 'PaneId',
		title: 'PaneId',
		description:
			'Pane identifier discriminated by `kind` (terminal | plugin).'
	})
	.pipe(Schema.toTaggedUnion('kind'));

/**
 * @category Types
 * @since 0.1.0
 */
export type PaneId = typeof PaneId.Type;

// ───────────────────────────────────────────────────────────────────────────
// Constructors
// ───────────────────────────────────────────────────────────────────────────

/**
 * Construct a terminal pane id.
 *
 * @category Constructors
 * @since 0.1.0
 * @example
 * import * as PaneId from '@workspace/zellij-binding/schemas/PaneId'
 *
 * const id = PaneId.terminal(3)  // { kind: 'terminal', id: 3 }
 */
export const terminal = (id: number): Terminal =>
	new Terminal({ kind: 'terminal', id });

/**
 * Construct a plugin pane id.
 *
 * @category Constructors
 * @since 0.1.0
 */
export const plugin = (id: number): Plugin =>
	new Plugin({ kind: 'plugin', id });

// ───────────────────────────────────────────────────────────────────────────
// Guards
// ───────────────────────────────────────────────────────────────────────────

/**
 * Type guard for the full `PaneId` union.
 *
 * @category Guards
 * @since 0.1.0
 */
export const isPaneId = Schema.is(PaneId);

/**
 * Refines to the `Terminal` variant.
 *
 * @category Guards
 * @since 0.1.0
 */
export const isTerminal: (self: PaneId) => self is Terminal = Schema.is(
	Terminal
);

/**
 * Refines to the `Plugin` variant.
 *
 * @category Guards
 * @since 0.1.0
 */
export const isPlugin: (self: PaneId) => self is Plugin = Schema.is(Plugin);

// ───────────────────────────────────────────────────────────────────────────
// Pattern matching
// ───────────────────────────────────────────────────────────────────────────

/**
 * Exhaustive pattern match on a `PaneId`.
 *
 * @category Pattern Matching
 * @since 0.1.0
 * @example
 * import * as PaneId from '@workspace/zellij-binding/schemas/PaneId'
 *
 * const label = PaneId.match({
 *   terminal: (t) => `terminal #${t.id}`,
 *   plugin:   (p) => `plugin #${p.id}`
 * })
 */
export const match = PaneId.match;

// ───────────────────────────────────────────────────────────────────────────
// CLI string encoding / decoding
// ───────────────────────────────────────────────────────────────────────────

const PANE_ID_PATTERN = /^(terminal|plugin)_(\d+)$/u;
const BARE_ID_PATTERN = /^\d+$/u;

/**
 * Render a `PaneId` in the `kind_n` form that zellij's CLI expects on
 * `--pane-id` flags and positional args.
 *
 * @category Encoding
 * @since 0.1.0
 */
export const toCliArg = PaneId.match({
	terminal: (t) => `terminal_${t.id}`,
	plugin: (p) => `plugin_${p.id}`
});

/**
 * Parse a zellij pane-id string.
 *
 * Accepts three forms:
 * - `"terminal_3"`  → `Terminal({ id: 3 })`
 * - `"plugin_7"`    → `Plugin({ id: 7 })`
 * - `"3"`           → `Terminal({ id: 3 })` — zellij treats bare integers as
 *                     terminal pane ids.
 *
 * Returns `Option.none()` for anything that doesn't match.
 *
 * @category Parsing
 * @since 0.1.0
 */
export const fromCliArg = (raw: string): Option.Option<PaneId> => {
	if (BARE_ID_PATTERN.test(raw)) {
		return Option.some(terminal(Number.parseInt(raw, 10)));
	}
	const parts = PANE_ID_PATTERN.exec(raw);
	if (parts === null) return Option.none();
	const [, kind, id] = parts;
	if (kind === undefined || id === undefined) return Option.none();
	const n = Number.parseInt(id, 10);
	return Option.some(kind === 'plugin' ? plugin(n) : terminal(n));
};

// ───────────────────────────────────────────────────────────────────────────
// Runtime environment reader
// ───────────────────────────────────────────────────────────────────────────

/**
 * Read the current terminal pane id from the `$ZELLIJ_PANE_ID` env var.
 *
 * Returns `Option.none()` when not running inside a zellij-managed pane, or
 * when the value isn't a parseable integer. Zellij only exposes terminal
 * panes this way, so a positive read is always a `Terminal` variant.
 *
 * Uses `Config.string` rather than raw `process.env` so tests can override
 * via `ConfigProvider` (EF-28). The `Config.option` wrapper collapses
 * "missing env var" into `Option.none()` on the success channel.
 *
 * @category Runtime
 * @since 0.1.0
 */
export const fromEnv = Effect.gen(function* () {
	const raw = yield* Config.string('ZELLIJ_PANE_ID').pipe(Config.option);
	return Option.flatMap(raw, (value) => {
		const n = Number.parseInt(value, 10);
		return Number.isFinite(n)
			? Option.some(terminal(n))
			: Option.none<Terminal>();
	});
});

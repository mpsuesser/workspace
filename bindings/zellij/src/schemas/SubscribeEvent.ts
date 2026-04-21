/**
 * SubscribeEvent — discriminated union of NDJSON events emitted by
 * `zellij subscribe --format json`.
 *
 * Two event shapes per the [Zellij Subscribe docs](https://zellij.dev/documentation/zellij-subscribe.html):
 *
 * - `pane_update`: delivered on subscribe (with `is_initial: true`) and on
 *   every subsequent viewport change. `scrollback` is only populated on the
 *   initial delivery (and only when `--scrollback` was passed).
 * - `pane_closed`: emitted once when a subscribed pane goes away.
 *
 * The CLI discriminator field is `event`; we use `toTaggedUnion("event")` so
 * `match`/`$is` keyed by the literal tag work cleanly.
 *
 * @since 0.1.0
 */

import * as Schema from 'effect/Schema';

import * as PaneId from './PaneId.ts';

// ───────────────────────────────────────────────────────────────────────────
// Variants
// ───────────────────────────────────────────────────────────────────────────

/**
 * Viewport / scrollback snapshot.
 *
 * The CLI surfaces `pane_id` as the `terminal_N` / `plugin_N` string form;
 * we decode to `PaneId.PaneId` via a schema transformation so consumers work
 * with the tagged union directly.
 *
 * @category Schemas
 * @since 0.1.0
 */
export class PaneUpdate extends Schema.Class<PaneUpdate>('PaneUpdate')(
	{
		event: Schema.tag('pane_update'),
		pane_id: Schema.String,
		viewport: Schema.Array(Schema.String),
		scrollback: Schema.OptionFromNullOr(Schema.Array(Schema.String)),
		is_initial: Schema.Boolean
	},
	{
		identifier: 'PaneUpdate',
		title: 'PaneUpdate',
		description: 'A viewport snapshot delivered by `zellij subscribe`.'
	}
) {}

/**
 * Emitted once when a subscribed pane closes. The subscribe process exits
 * when all subscribed panes have emitted this event.
 *
 * @category Schemas
 * @since 0.1.0
 */
export class PaneClosed extends Schema.Class<PaneClosed>('PaneClosed')(
	{
		event: Schema.tag('pane_closed'),
		pane_id: Schema.String
	},
	{
		identifier: 'PaneClosed',
		title: 'PaneClosed',
		description: 'Close event delivered by `zellij subscribe`.'
	}
) {}

// ───────────────────────────────────────────────────────────────────────────
// Union
// ───────────────────────────────────────────────────────────────────────────

/**
 * Tagged union of subscribe NDJSON events, keyed by the `event` field.
 *
 * @category Schemas
 * @since 0.1.0
 */
export const SubscribeEvent = Schema.Union([PaneUpdate, PaneClosed]).pipe(
	Schema.toTaggedUnion('event')
).annotate({
	identifier: 'SubscribeEvent',
	title: 'SubscribeEvent',
	description: 'NDJSON event from `zellij subscribe --format json`.'
});

/**
 * @category Types
 * @since 0.1.0
 */
export type SubscribeEvent = typeof SubscribeEvent.Type;

// ───────────────────────────────────────────────────────────────────────────
// Guards + matching
// ───────────────────────────────────────────────────────────────────────────

/**
 * @category Guards
 * @since 0.1.0
 */
export const isSubscribeEvent = Schema.is(SubscribeEvent);

/**
 * @category Guards
 * @since 0.1.0
 */
export const isPaneUpdate: (self: SubscribeEvent) => self is PaneUpdate =
	Schema.is(PaneUpdate);

/**
 * @category Guards
 * @since 0.1.0
 */
export const isPaneClosed: (self: SubscribeEvent) => self is PaneClosed =
	Schema.is(PaneClosed);

/**
 * @category Pattern Matching
 * @since 0.1.0
 */
export const match = SubscribeEvent.match;

// ───────────────────────────────────────────────────────────────────────────
// Convenience: parsed PaneId helper
// ───────────────────────────────────────────────────────────────────────────

/**
 * Parse the `pane_id` string on an event into a `PaneId.PaneId` tagged
 * union. Zellij always emits valid ids, so this is defensive; returns
 * `Option.none()` on malformed input rather than throwing.
 *
 * @category Decoders
 * @since 0.1.0
 */
export const getPaneId = (event: SubscribeEvent) =>
	PaneId.fromCliArg(event.pane_id);

// ───────────────────────────────────────────────────────────────────────────
// NDJSON-line decoding
// ───────────────────────────────────────────────────────────────────────────

/**
 * Decode a single NDJSON line into a `SubscribeEvent`.
 *
 * @category Decoders
 * @since 0.1.0
 */
export const decodeJsonLine = Schema.decodeUnknownEffect(
	Schema.fromJsonString(SubscribeEvent)
);

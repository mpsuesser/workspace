/**
 * TabInfo — the JSON object shape surfaced by `zellij action list-tabs --json`
 * and `zellij action current-tab-info --json`.
 *
 * @since 0.1.0
 */

import * as Schema from 'effect/Schema';

/**
 * Decoded row of `zellij action list-tabs --json` / `current-tab-info --json`.
 *
 * @category Schemas
 * @since 0.1.0
 */
export class TabInfo extends Schema.Class<TabInfo>('TabInfo')(
	{
		tab_id: Schema.Int,
		position: Schema.Int,
		name: Schema.String,

		// Active state
		active: Schema.Boolean,
		is_fullscreen_active: Schema.Boolean,
		is_sync_panes_active: Schema.Boolean,
		are_floating_panes_visible: Schema.Boolean,

		// Other clients focused on this tab
		other_focused_clients: Schema.Array(Schema.Int),

		// Swap layout
		active_swap_layout_name: Schema.OptionFromNullOr(Schema.String),
		is_swap_layout_dirty: Schema.Boolean,

		// Dimensions
		viewport_rows: Schema.Int,
		viewport_columns: Schema.Int,
		display_area_rows: Schema.Int,
		display_area_columns: Schema.Int,

		// Pane counts
		selectable_tiled_panes_count: Schema.Int,
		selectable_floating_panes_count: Schema.Int,
		panes_to_hide: Schema.Int,

		// Bell
		has_bell_notification: Schema.Boolean,
		is_flashing_bell: Schema.Boolean
	},
	{
		identifier: 'TabInfo',
		title: 'TabInfo',
		description:
			'A row of `zellij action list-tabs --json` or `current-tab-info --json`.'
	}
) {}

/**
 * @category Schemas
 * @since 0.1.0
 */
export const TabInfoArray = Schema.Array(TabInfo).annotate({
	identifier: 'TabInfoArray',
	title: 'TabInfoArray',
	description: 'The top-level array emitted by `list-tabs --json`.'
});

/**
 * Decoder for the raw JSON string output of `list-tabs --json`.
 *
 * @category Decoders
 * @since 0.1.0
 */
export const decodeJsonArray = Schema.decodeUnknownEffect(
	Schema.fromJsonString(TabInfoArray)
);

/**
 * Decoder for the raw JSON string output of `current-tab-info --json`.
 *
 * @category Decoders
 * @since 0.1.0
 */
export const decodeJsonSingle = Schema.decodeUnknownEffect(
	Schema.fromJsonString(TabInfo)
);

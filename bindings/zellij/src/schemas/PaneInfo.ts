/**
 * PaneInfo — the JSON object shape surfaced by `zellij action list-panes --json`.
 *
 * Zellij emits a rich JSON array; this module decodes each element into a
 * `PaneInfo` class. Ambiguous zellij quirks encoded here:
 *
 * - `id` is a bare integer; discriminate terminal vs plugin via `is_plugin`.
 * - Optional fields (`terminal_command`, `plugin_url`, `exit_status`, etc.)
 *   come through as `null` from the CLI; we decode to `Option` at the
 *   boundary (EF-2, EF-17).
 *
 * @since 0.1.0
 */

import * as Schema from 'effect/Schema';

import * as PaneId from './PaneId.ts';

// Note: zellij emits tab_name only on some record variants. Use
// OptionFromOptionalKey so a missing property becomes None (vs a null value,
// which OptionFromNullOr handles).

/**
 * A `cursor_coordinates_in_pane` value: `[column, row]` or null.
 *
 * @category Schemas
 * @since 0.1.0
 */
export const CursorCoordinates = Schema.Tuple([
	Schema.Int,
	Schema.Int
]).annotate({
	identifier: 'CursorCoordinates',
	title: 'CursorCoordinates',
	description: '[column, row] cursor position within the pane.'
});

/**
 * Decoded row of `zellij action list-panes --json`.
 *
 * @category Schemas
 * @since 0.1.0
 */
export class PaneInfo extends Schema.Class<PaneInfo>('PaneInfo')(
	{
		// Pane identity
		id: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
		is_plugin: Schema.Boolean,

		// Focus / layout state
		is_focused: Schema.Boolean,
		is_fullscreen: Schema.Boolean,
		is_floating: Schema.Boolean,
		is_suppressed: Schema.Boolean,
		is_selectable: Schema.Boolean,
		is_held: Schema.Boolean,

		// Display
		title: Schema.String,

		// Exit state
		exited: Schema.Boolean,
		exit_status: Schema.OptionFromNullOr(Schema.Int),

		// Geometry
		pane_x: Schema.Int,
		pane_content_x: Schema.Int,
		pane_y: Schema.Int,
		pane_content_y: Schema.Int,
		pane_rows: Schema.Int,
		pane_content_rows: Schema.Int,
		pane_columns: Schema.Int,
		pane_content_columns: Schema.Int,
		cursor_coordinates_in_pane: Schema.OptionFromNullOr(CursorCoordinates),

		// Command / plugin identity
		// `terminal_command` / `plugin_url` are always emitted; they
		// switch to `null` for the "other" variant. `pane_command` /
		// `pane_cwd` are omitted entirely on plugin panes — decoded as
		// `None` via `OptionFromOptionalKey`.
		terminal_command: Schema.OptionFromNullOr(Schema.String),
		plugin_url: Schema.OptionFromNullOr(Schema.String),
		pane_command: Schema.OptionFromOptionalKey(Schema.String),
		pane_cwd: Schema.OptionFromOptionalKey(Schema.String),

		// Colors — zellij emits these as null when the pane inherits the
		// terminal defaults, otherwise as a color descriptor object whose
		// exact shape we don't currently model. Keep as Unknown so future
		// introspection callers can drill in without us blocking decodes.
		default_fg: Schema.OptionFromNullOr(Schema.Unknown),
		default_bg: Schema.OptionFromNullOr(Schema.Unknown),

		// Pane-group membership. Usually an empty record `{}`; when a pane
		// belongs to a group, zellij populates it with group metadata whose
		// shape is not yet stable across zellij versions.
		index_in_pane_group: Schema.Record(Schema.String, Schema.Unknown),

		// Tab linkage
		tab_id: Schema.Int,
		tab_position: Schema.Int,
		tab_name: Schema.OptionFromOptionalKey(Schema.String)
	},
	{
		identifier: 'PaneInfo',
		title: 'PaneInfo',
		description: 'A row of `zellij action list-panes --json`.'
	}
) {
	/**
	 * This pane's `PaneId` union value, derived from `id` + `is_plugin`.
	 */
	get paneId(): PaneId.PaneId {
		return this.is_plugin
			? PaneId.plugin(this.id)
			: PaneId.terminal(this.id);
	}
}

/**
 * @category Schemas
 * @since 0.1.0
 */
export const PaneInfoArray = Schema.Array(PaneInfo).annotate({
	identifier: 'PaneInfoArray',
	title: 'PaneInfoArray',
	description: 'The top-level array emitted by `list-panes --json`.'
});

/**
 * Decoder for the raw JSON string output of `list-panes --json`.
 *
 * @category Decoders
 * @since 0.1.0
 */
export const decodeJson = Schema.decodeUnknownEffect(
	Schema.fromJsonString(PaneInfoArray)
);

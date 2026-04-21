/**
 * Pane dimension — either a fixed cell count or a percentage of the parent.
 *
 * Accepted by `--width`/`--height`/`--x`/`--y` flags across `zellij run`,
 * `zellij edit`, and `zellij action new-pane --floating`.
 *
 * @since 0.1.0
 */

import * as Schema from 'effect/Schema';

/**
 * Either a bare integer (e.g. `24`) or a percent string (e.g. `"50%"`).
 *
 * @category Schemas
 * @since 0.1.0
 */
export const PaneSize = Schema.Union([Schema.Number, Schema.String]).annotate({
	identifier: 'PaneSize',
	title: 'PaneSize',
	description: 'A pane dimension — integer cells or a percent string.'
});

/**
 * @category Types
 * @since 0.1.0
 */
export type PaneSize = typeof PaneSize.Type;

/**
 * Format a `PaneSize` for a CLI arg. Numbers become their `toString`; strings
 * pass through untouched (so `"50%"` remains `"50%"`).
 *
 * @category Encoding
 * @since 0.1.0
 */
export const toCliArg = (size: PaneSize): string =>
	typeof size === 'number' ? String(size) : size;

/**
 * Resize direction — used by `zellij action resize`.
 *
 * Accepts cardinal directions or the bare `+` / `-` grow/shrink tokens that
 * resize the focused pane along whichever axis has room.
 *
 * @since 0.1.0
 */

import * as Schema from 'effect/Schema';

/**
 * @category Schemas
 * @since 0.1.0
 */
export const ResizeDirection = Schema.Literals([
	'right',
	'left',
	'up',
	'down',
	'+',
	'-'
]).annotate({
	identifier: 'ResizeDirection',
	title: 'ResizeDirection',
	description: 'Direction or grow/shrink token for `zellij action resize`.'
});

/**
 * @category Types
 * @since 0.1.0
 */
export type ResizeDirection = typeof ResizeDirection.Type;

/**
 * @category Guards
 * @since 0.1.0
 */
export const isResizeDirection = Schema.is(ResizeDirection);

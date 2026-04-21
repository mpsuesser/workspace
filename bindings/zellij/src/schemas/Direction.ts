/**
 * Cardinal direction — used by focus/move actions.
 *
 * Maps to the `<DIRECTION>` positional arg of `zellij action move-focus`,
 * `move-pane`, and friends.
 *
 * @since 0.1.0
 */

import * as Schema from 'effect/Schema';

/**
 * @category Schemas
 * @since 0.1.0
 */
export const Direction = Schema.Literals([
	'right',
	'left',
	'up',
	'down'
]).annotate({
	identifier: 'Direction',
	title: 'Direction',
	description: 'Cardinal direction for focus/move actions.'
});

/**
 * @category Types
 * @since 0.1.0
 */
export type Direction = typeof Direction.Type;

/**
 * @category Guards
 * @since 0.1.0
 */
export const isDirection = Schema.is(Direction);

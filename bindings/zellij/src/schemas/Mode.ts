/**
 * Input mode — the state machine zellij uses for keybinding context.
 *
 * Maps to the `<MODE>` positional arg of `zellij action switch-mode`.
 *
 * @since 0.1.0
 */

import * as Schema from 'effect/Schema';

/**
 * @category Schemas
 * @since 0.1.0
 */
export const Mode = Schema.Literals([
	'locked',
	'pane',
	'tab',
	'resize',
	'move',
	'search',
	'session',
	'tmux'
]).annotate({
	identifier: 'Mode',
	title: 'Mode',
	description: 'Zellij input mode for `zellij action switch-mode`.'
});

/**
 * @category Types
 * @since 0.1.0
 */
export type Mode = typeof Mode.Type;

/**
 * @category Guards
 * @since 0.1.0
 */
export const isMode = Schema.is(Mode);

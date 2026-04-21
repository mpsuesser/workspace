/**
 * Block strategy — how `zellij run` / `zellij action new-pane` should
 * synchronise with the spawned command.
 *
 * Zellij exposes four related blocking flags on pane-creation commands; this
 * module models them as a tagged union so call sites choose exactly one
 * strategy type-safely (no two-flag conflicts) and `toArgs` knows which CLI
 * flag to emit.
 *
 * Strategy semantics (per CLI Recipes > Blocking Panes):
 *
 * - {@link UntilClose}         block until the pane is closed (user presses Ctrl-C)
 * - {@link UntilExit}          block until the command exits (any status) or the pane is closed
 * - {@link UntilExitSuccess}   block until the command exits with status 0 (retry on failure)
 * - {@link UntilExitFailure}   block until the command exits with non-zero status
 *
 * @since 0.1.0
 */

import * as Schema from 'effect/Schema';

/**
 * @category Schemas
 * @since 0.1.0
 */
export const BlockStrategy = Schema.TaggedUnion({
	UntilClose: {},
	UntilExit: {},
	UntilExitSuccess: {},
	UntilExitFailure: {}
}).annotate({
	identifier: 'BlockStrategy',
	title: 'BlockStrategy',
	description:
		'How `zellij run`/`new-pane` blocks on its spawned command (see CLI Recipes > Blocking Panes).'
});

/**
 * @category Types
 * @since 0.1.0
 */
export type BlockStrategy = typeof BlockStrategy.Type;

/**
 * Block until the pane is closed (maps to `--blocking`).
 *
 * @category Constructors
 * @since 0.1.0
 */
export const untilClose: BlockStrategy = BlockStrategy.cases.UntilClose.make(
	{}
);

/**
 * Block until the command exits regardless of status (maps to `--block-until-exit`).
 *
 * @category Constructors
 * @since 0.1.0
 */
export const untilExit: BlockStrategy = BlockStrategy.cases.UntilExit.make({});

/**
 * Block until the command exits with status 0 (maps to `--block-until-exit-success`).
 *
 * @category Constructors
 * @since 0.1.0
 */
export const untilExitSuccess: BlockStrategy =
	BlockStrategy.cases.UntilExitSuccess.make({});

/**
 * Block until the command exits with non-zero status (maps to `--block-until-exit-failure`).
 *
 * @category Constructors
 * @since 0.1.0
 */
export const untilExitFailure: BlockStrategy =
	BlockStrategy.cases.UntilExitFailure.make({});

/**
 * Encode a `BlockStrategy` as the corresponding zellij CLI flag (as a
 * single-element `ReadonlyArray<string>` so it splices cleanly into an arg
 * list).
 *
 * @category Encoding
 * @since 0.1.0
 */
export const toArgs: (strategy: BlockStrategy) => ReadonlyArray<string> =
	BlockStrategy.match({
		UntilClose: () => ['--blocking'],
		UntilExit: () => ['--block-until-exit'],
		UntilExitSuccess: () => ['--block-until-exit-success'],
		UntilExitFailure: () => ['--block-until-exit-failure']
	});

/**
 * @category Pattern Matching
 * @since 0.1.0
 */
export const match = BlockStrategy.match;

/**
 * @category Guards
 * @since 0.1.0
 */
export const isBlockStrategy = Schema.is(BlockStrategy);

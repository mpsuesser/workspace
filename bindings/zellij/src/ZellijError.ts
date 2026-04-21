/**
 * ZellijError — the single tagged error raised by every zellij-binding
 * service.
 *
 * Failures carry a `reason` field pointing to one of several discrete reason
 * classes (also `Schema.TaggedErrorClass`es). Consumers recover precisely via
 * `Effect.catchReason("ZellijError", "CommandFailed", handler)` or promote
 * the union into the error channel with `Effect.unwrapReason("ZellijError")`
 * and then `catchTags`.
 *
 * Reason variants:
 *
 * - {@link SpawnError}        `ChildProcess` failed (binary not found, fork failed, IO error)
 * - {@link CommandFailed}     zellij exited non-zero; argv + exit code + stderr preserved
 * - {@link DecodeFailure}     schema decoding of zellij's output failed
 * - {@link NotInSession}      `$ZELLIJ_SESSION_NAME` is unset — caller is outside any session
 * - {@link SessionNotFound}   named session doesn't exist
 * - {@link PaneNotFound}      referenced pane id doesn't exist
 * - {@link TabNotFound}       referenced tab id doesn't exist
 *
 * @since 0.1.0
 */

import * as Schema from 'effect/Schema';

import * as PaneId from './schemas/PaneId.ts';
import * as SessionName from './schemas/SessionName.ts';
import * as TabId from './schemas/TabId.ts';

// ───────────────────────────────────────────────────────────────────────────
// Reason variants
// ───────────────────────────────────────────────────────────────────────────

/**
 * Child-process spawning or IO failure — wraps the upstream `PlatformError`.
 *
 * @category Reasons
 * @since 0.1.0
 */
export class SpawnError extends Schema.TaggedErrorClass<SpawnError>()(
	'SpawnError',
	{
		argv: Schema.Array(Schema.String),
		cause: Schema.Defect
	},
	{ description: 'Failed to spawn or run the `zellij` binary.' }
) {}

/**
 * Zellij exited with a non-zero status. `stderr` is captured when available
 * so higher layers can surface the original CLI message.
 *
 * @category Reasons
 * @since 0.1.0
 */
export class CommandFailed extends Schema.TaggedErrorClass<CommandFailed>()(
	'CommandFailed',
	{
		argv: Schema.Array(Schema.String),
		exitCode: Schema.Int,
		stderr: Schema.String
	},
	{ description: 'Zellij CLI exited with a non-zero status.' }
) {}

/**
 * Schema decoding of zellij output failed. `output` is the raw CLI stdout;
 * `issue` is the formatted `SchemaError` message.
 *
 * @category Reasons
 * @since 0.1.0
 */
export class DecodeFailure extends Schema.TaggedErrorClass<DecodeFailure>()(
	'DecodeFailure',
	{
		argv: Schema.Array(Schema.String),
		output: Schema.String,
		issue: Schema.String
	},
	{ description: 'Failed to decode zellij output against its schema.' }
) {}

/**
 * Caller is not running inside a zellij session. Raised by APIs that rely on
 * `$ZELLIJ_SESSION_NAME` being set (or on the CLI implicitly targeting the
 * current session).
 *
 * @category Reasons
 * @since 0.1.0
 */
export class NotInSession extends Schema.TaggedErrorClass<NotInSession>()(
	'NotInSession',
	{},
	{
		description:
			'Caller is not inside a zellij session ($ZELLIJ_SESSION_NAME unset).'
	}
) {}

/**
 * Named session does not exist.
 *
 * @category Reasons
 * @since 0.1.0
 */
export class SessionNotFound extends Schema.TaggedErrorClass<SessionNotFound>()(
	'SessionNotFound',
	{ session: SessionName.SessionName },
	{ description: 'Named zellij session does not exist.' }
) {}

/**
 * Referenced pane does not exist in the target session.
 *
 * @category Reasons
 * @since 0.1.0
 */
export class PaneNotFound extends Schema.TaggedErrorClass<PaneNotFound>()(
	'PaneNotFound',
	{ paneId: PaneId.PaneId },
	{ description: 'Referenced zellij pane does not exist.' }
) {}

/**
 * Referenced tab does not exist in the target session.
 *
 * @category Reasons
 * @since 0.1.0
 */
export class TabNotFound extends Schema.TaggedErrorClass<TabNotFound>()(
	'TabNotFound',
	{ tabId: TabId.TabId },
	{ description: 'Referenced zellij tab does not exist.' }
) {}

// ───────────────────────────────────────────────────────────────────────────
// Union + umbrella error
// ───────────────────────────────────────────────────────────────────────────

/**
 * Union of all reason variants.
 *
 * @category Reasons
 * @since 0.1.0
 */
export const Reason = Schema.Union([
	SpawnError,
	CommandFailed,
	DecodeFailure,
	NotInSession,
	SessionNotFound,
	PaneNotFound,
	TabNotFound
]);

/**
 * @category Types
 * @since 0.1.0
 */
export type Reason = typeof Reason.Type;

/**
 * The umbrella error emitted by every zellij-binding service. Always carries
 * a `reason` pointing to one of the reason classes above.
 *
 * @category Schemas
 * @since 0.1.0
 * @example
 * import * as ZellijError from '@workspace/zellij-binding/ZellijError'
 * import { Effect } from 'effect'
 *
 * program.pipe(
 *   Effect.catchReasons('ZellijError', {
 *     NotInSession: () => Effect.succeed('no session'),
 *     SessionNotFound: (r) => Effect.logError(`missing: ${r.session}`).pipe(Effect.as(null))
 *   })
 * )
 */
export class ZellijError extends Schema.TaggedErrorClass<ZellijError>()(
	'ZellijError',
	{ reason: Reason },
	{ description: 'Failure from a zellij-binding service.' }
) {}

// ───────────────────────────────────────────────────────────────────────────
// Smart constructors
// ───────────────────────────────────────────────────────────────────────────

/**
 * Wrap a `SpawnError` reason.
 *
 * @category Constructors
 * @since 0.1.0
 */
export const spawnError = (
	argv: ReadonlyArray<string>,
	cause: unknown
): ZellijError => new ZellijError({ reason: new SpawnError({ argv, cause }) });

/**
 * Wrap a `CommandFailed` reason.
 *
 * @category Constructors
 * @since 0.1.0
 */
export const commandFailed = (params: {
	readonly argv: ReadonlyArray<string>;
	readonly exitCode: number;
	readonly stderr: string;
}): ZellijError =>
	new ZellijError({
		reason: new CommandFailed({
			argv: params.argv,
			exitCode: params.exitCode,
			stderr: params.stderr
		})
	});

/**
 * Wrap a `DecodeFailure` reason.
 *
 * @category Constructors
 * @since 0.1.0
 */
export const decodeFailure = (params: {
	readonly argv: ReadonlyArray<string>;
	readonly output: string;
	readonly issue: string;
}): ZellijError => new ZellijError({ reason: new DecodeFailure(params) });

/**
 * Wrap a `NotInSession` reason.
 *
 * @category Constructors
 * @since 0.1.0
 */
export const notInSession = (): ZellijError =>
	new ZellijError({ reason: new NotInSession({}) });

/**
 * Wrap a `SessionNotFound` reason.
 *
 * @category Constructors
 * @since 0.1.0
 */
export const sessionNotFound = (
	session: SessionName.SessionName
): ZellijError => new ZellijError({ reason: new SessionNotFound({ session }) });

/**
 * Wrap a `PaneNotFound` reason.
 *
 * @category Constructors
 * @since 0.1.0
 */
export const paneNotFound = (paneId: PaneId.PaneId): ZellijError =>
	new ZellijError({ reason: new PaneNotFound({ paneId }) });

/**
 * Wrap a `TabNotFound` reason.
 *
 * @category Constructors
 * @since 0.1.0
 */
export const tabNotFound = (tabId: TabId.TabId): ZellijError =>
	new ZellijError({ reason: new TabNotFound({ tabId }) });

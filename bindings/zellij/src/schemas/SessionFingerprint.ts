/**
 * SessionFingerprint — a stable identifier for a zellij session that
 * survives `rename-session`.
 *
 * Why this exists
 * ===============
 *
 * Long-lived processes that need to know which session they're attached
 * to (sidebars, status bars, ambient watchers) can't trust
 * `$ZELLIJ_SESSION_NAME`: it's captured at process launch and never
 * updates, so after a `rename-session` the env var is stale. Pane ids
 * (`$ZELLIJ_PANE_ID`) don't disambiguate either — pane numbering is
 * session-local, so `terminal_1` exists in every session.
 *
 * What does survive rename: zellij's per-session IPC socket inode.
 * `RenameSession` is implemented in `zellij-server-0.44.1/src/screen.rs`
 * via `std::fs::rename(old_socket, new_socket)`, which is a `rename(2)`
 * syscall and therefore preserves the inode. So we can record the
 * `(dev, ino)` of the process's session socket once at startup and look
 * it up in the socket directory thereafter to recover the current name.
 *
 * `SessionFingerprint` is the captured `(dev, ino)` token. The
 * companion {@link ZellijSession.Service.fingerprintCurrent} captures
 * one for the calling process; {@link ZellijSession.Service.findByFingerprint}
 * resolves it back to the current session name.
 *
 * @since 0.1.0
 */

import * as Schema from 'effect/Schema';

/**
 * `(dev, ino)` of a zellij session's IPC socket file. Stable across
 * `rename-session`; specific to the host filesystem (do not persist
 * across reboots or share between machines).
 *
 * @category Schemas
 * @since 0.1.0
 * @example
 * import * as ZellijSession from '@workspace/zellij-binding/ZellijSession'
 * import { Effect, Option } from 'effect'
 *
 * const program = Effect.gen(function* () {
 *   const session = yield* ZellijSession.Service
 *   const fp = yield* session.fingerprintCurrent()
 *   if (Option.isNone(fp)) return // not running in a zellij session
 *   // ...later, after the user may have renamed the session...
 *   const name = yield* session.findByFingerprint(fp.value)
 *   // name is the session's current name (or None if it was killed)
 * })
 */
export class SessionFingerprint extends Schema.Class<SessionFingerprint>(
	'SessionFingerprint'
)(
	{
		/** Filesystem device id of the socket file. */
		dev: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0)),
		/** Inode number of the socket file (preserved across rename). */
		ino: Schema.Int.check(Schema.isGreaterThanOrEqualTo(0))
	},
	{
		identifier: 'SessionFingerprint',
		title: 'SessionFingerprint',
		description:
			"`(dev, ino)` of a zellij session's IPC socket; survives rename-session."
	}
) {}

/**
 * Zellij — top-level operations that act across the zellij runtime as a
 * whole, not against any one session/tab/pane.
 *
 * This is currently a minimal stub covering just the commands that would
 * otherwise be homeless in the subject-scoped namespaces:
 *
 * - {@link Interface.listSessions} — enumerate every session on the
 *   machine (both active and resurrectable)
 * - {@link Interface.killAllSessions} — kill every running session
 * - {@link Interface.deleteAllSessions} — drop every cached exited
 *   session
 *
 * A full future revision will additionally expose `run`, `edit`, `setup`,
 * `version`, and the top-level `pipe` command, each of which currently
 * lives nowhere or is reachable only via {@link ./ZellijCli}. For now
 * those stay on the low-level layer.
 *
 * @since 0.1.0
 */

import { Effect, Layer } from 'effect';
import * as Context from 'effect/Context';
import * as Str from 'effect/String';

import * as SessionName from './schemas/SessionName.ts';
import * as SessionStatus from './schemas/SessionStatus.ts';
import * as ZellijCli from './ZellijCli.ts';
import * as ZellijError from './ZellijError.ts';

// ───────────────────────────────────────────────────────────────────────────
// Interface
// ───────────────────────────────────────────────────────────────────────────

/**
 * Capability surface of the {@link Service}.
 *
 * @category Models
 * @since 0.1.0
 */
export interface Interface {
	/**
	 * Enumerate every session on the machine as their names (both
	 * running and resurrectable). Uses `zellij list-sessions -s` so
	 * parsing is a simple line-per-name read; `(current)` / `(EXITED)`
	 * decoration from the default output is not surfaced here.
	 */
	readonly listSessions: () => Effect.Effect<
		ReadonlyArray<SessionName.SessionName>,
		ZellijError.ZellijError
	>;

	/**
	 * Enumerate every session on the machine as decoded
	 * {@link SessionStatus.SessionStatus} rows. Maps to
	 * `zellij list-sessions --no-formatting`, which emits one
	 * `<name> [Created <duration> ago] [(marker)]` line per session.
	 *
	 * Each row carries the parsed creation duration, the
	 * `(current)`-derived `isCurrent` flag, and an `isExited` flag for
	 * sessions in the resurrection cache. Use {@link listSessions} when
	 * just the names are needed.
	 *
	 * Note: `isCurrent` is parsed from zellij's live output, so it
	 * survives a `rename-session` call — unlike the snapshot
	 * `$ZELLIJ_SESSION_NAME` env var read by
	 * `ZellijSession.Service.current`.
	 */
	readonly listSessionsDetailed: () => Effect.Effect<
		ReadonlyArray<SessionStatus.SessionStatus>,
		ZellijError.ZellijError
	>;

	/**
	 * Kill every running session on the machine. Maps to
	 * `zellij kill-all-sessions -y` (the `-y` suppresses the confirm
	 * prompt).
	 */
	readonly killAllSessions: () => Effect.Effect<
		void,
		ZellijError.ZellijError
	>;

	/**
	 * Drop every cached exited session. Maps to
	 * `zellij delete-all-sessions -y`.
	 */
	readonly deleteAllSessions: () => Effect.Effect<
		void,
		ZellijError.ZellijError
	>;
}

/**
 * The `Zellij` service identity.
 *
 * @category Service
 * @since 0.1.0
 */
export class Service extends Context.Service<Service, Interface>()(
	'@workspace/zellij-binding/Zellij'
) {}

// ───────────────────────────────────────────────────────────────────────────
// Layer
// ───────────────────────────────────────────────────────────────────────────

/**
 * Live implementation of {@link Service}. Captures {@link ZellijCli.Service}
 * in the closure so every method in the returned Interface has
 * `Requirements = never` (per the "No Requirement Leakage" rule in the
 * service-implementation skill).
 *
 * @category Layers
 * @since 0.1.0
 */
export const layer = Layer.effect(
	Service,
	Effect.gen(function* () {
		const cli = yield* ZellijCli.Service;

		const listSessions = Effect.fn('Zellij.listSessions')(() =>
			Effect.gen(function* () {
				const lines = yield* cli.lines(['list-sessions', '-s']);
				return yield* Effect.forEach(
					lines,
					(line) =>
						SessionName.decodeUnknown(Str.trim(line)).pipe(
							Effect.mapError((issue) =>
								ZellijError.decodeFailure({
									argv: ['list-sessions', '-s'],
									output: line,
									issue: String(issue)
								})
							)
						)
				);
			})
		);

		const listSessionsDetailed = Effect.fn(
			'Zellij.listSessionsDetailed'
		)(() =>
			cli.string(['list-sessions', '--no-formatting']).pipe(
				Effect.map(SessionStatus.parseOutput)
			)
		);

		const killAllSessions = Effect.fn('Zellij.killAllSessions')(() =>
			cli.exec(['kill-all-sessions', '-y']).pipe(Effect.asVoid)
		);

		const deleteAllSessions = Effect.fn('Zellij.deleteAllSessions')(() =>
			cli.exec(['delete-all-sessions', '-y']).pipe(Effect.asVoid)
		);

		return Service.of({
			listSessions,
			listSessionsDetailed,
			killAllSessions,
			deleteAllSessions
		});
	})
);

/**
 * Fully-wired default layer. Still requires a `ChildProcessSpawner` from
 * the platform (e.g. `BunServices.layer`).
 *
 * @category Layers
 * @since 0.1.0
 */
export const defaultLayer = layer.pipe(Layer.provide(ZellijCli.layer));

/**
 * ZellijCli — internal service that shells out to the `zellij` binary.
 *
 * This is the single process boundary for the entire package. Every
 * higher-level namespace (ZellijAction, ZellijPane, ZellijTab, ZellijSession,
 * Zellij) captures `ZellijCli` in its `Layer.effect` closure and never sees
 * `ChildProcessSpawner` or `PlatformError` directly. All failures are lifted
 * into `ZellijError` with a tagged `reason`, so consumers recover via
 * `Effect.catchReasons('ZellijError', { ... })`.
 *
 * The interface is intentionally thin:
 *
 * - {@link Interface.exec}    — run `zellij <args>` and return stdout/stderr/exit
 * - {@link Interface.string}  — exec + trim stdout
 * - {@link Interface.lines}   — exec + split stdout on newlines
 * - {@link Interface.exit}    — run and return the exit code (no stdout capture)
 * - {@link Interface.json}    — exec + decode stdout via a Schema codec
 * - {@link Interface.stream}  — stream stdout (+ optionally stderr) as lines
 * - {@link Interface.withSession} — return a sub-interface pre-targeted at a session
 *
 * Non-zero exit codes always map to `ZellijError.CommandFailed` with stderr
 * captured, so CLI error messages surface intact to callers.
 *
 * @since 0.1.0
 */

import { Effect, Layer, pipe } from 'effect';
import * as Arr from 'effect/Array';
import * as Context from 'effect/Context';
import * as Option from 'effect/Option';
import * as Schema from 'effect/Schema';
import type * as Stream from 'effect/Stream';
import * as StreamModule from 'effect/Stream';
import * as Str from 'effect/String';
import * as ChildProcess from 'effect/unstable/process/ChildProcess';
import * as ChildProcessSpawner from 'effect/unstable/process/ChildProcessSpawner';

import type * as SessionName from './schemas/SessionName.ts';
import * as ZellijError from './ZellijError.ts';

// ───────────────────────────────────────────────────────────────────────────
// Public types
// ───────────────────────────────────────────────────────────────────────────

/**
 * Result of a completed `zellij` invocation.
 *
 * @category Models
 * @since 0.1.0
 */
export interface ExecResult {
	readonly stdout: string;
	readonly stderr: string;
	readonly exitCode: number;
}

/**
 * Options accepted by every exec-ish method.
 *
 * @category Models
 * @since 0.1.0
 */
export interface Options {
	/**
	 * When set, prepends `--session <name>` to every invocation so the command
	 * targets the named session instead of the caller's default session.
	 */
	readonly session?: SessionName.SessionName;
}

/**
 * Options accepted by {@link Interface.stream}.
 *
 * @category Models
 * @since 0.1.0
 */
export interface StreamOptions extends Options {
	/**
	 * Interleave stderr with stdout in the stream. Defaults to `false`.
	 */
	readonly includeStderr?: boolean;
}

/**
 * The public capability surface of {@link Service}.
 *
 * @category Models
 * @since 0.1.0
 */
export interface Interface {
	/**
	 * Run `zellij <args>` to completion. Captures stdout, stderr, and the exit
	 * code. Fails with {@link ZellijError.SpawnError} if the process cannot be
	 * started, {@link ZellijError.CommandFailed} on non-zero exit.
	 */
	readonly exec: (
		argv: ReadonlyArray<string>,
		options?: Options
	) => Effect.Effect<ExecResult, ZellijError.ZellijError>;

	/**
	 * Like {@link exec} but returns only `stdout.trimEnd()` on success.
	 */
	readonly string: (
		argv: ReadonlyArray<string>,
		options?: Options
	) => Effect.Effect<string, ZellijError.ZellijError>;

	/**
	 * Like {@link exec} but returns stdout split on `\n`, with empty trailing
	 * lines dropped.
	 */
	readonly lines: (
		argv: ReadonlyArray<string>,
		options?: Options
	) => Effect.Effect<ReadonlyArray<string>, ZellijError.ZellijError>;

	/**
	 * Run `zellij <args>` and return the raw exit code. Useful for actions
	 * that signal state through the exit code alone (e.g.
	 * `are-floating-panes-visible`, `show-floating-panes`).
	 *
	 * Unlike {@link exec}, non-zero exits do NOT raise — the caller decides
	 * how to interpret the number.
	 */
	readonly exit: (
		argv: ReadonlyArray<string>,
		options?: Options
	) => Effect.Effect<number, ZellijError.ZellijError>;

	/**
	 * Exec and decode stdout through a Schema codec. Fails with
	 * {@link ZellijError.DecodeFailure} when the output doesn't match.
	 *
	 * `schema` is applied to the stdout string directly — wrap it with
	 * `Schema.fromJsonString(...)` if the output is JSON.
	 */
	readonly json: <A, I>(
		argv: ReadonlyArray<string>,
		schema: Schema.Codec<A, I, never>,
		options?: Options
	) => Effect.Effect<A, ZellijError.ZellijError>;

	/**
	 * Stream stdout (optionally interleaved with stderr) as newline-split
	 * strings. The stream ends when the process exits; non-zero exits are
	 * not surfaced as failures here — if the caller needs exit-code
	 * granularity they should use {@link exec} instead.
	 */
	readonly stream: (
		argv: ReadonlyArray<string>,
		options?: StreamOptions
	) => Stream.Stream<string, ZellijError.ZellijError>;

	/**
	 * Run `zellij <args>` with inherited stdio — the caller's terminal
	 * becomes the child process's terminal. Used by `attach`, `watch`,
	 * and any long-running interactive handoff.
	 *
	 * Blocks until the zellij process exits; returns the exit code raw
	 * (non-zero exits do NOT raise, since "user detached" and "user killed
	 * the session" both exit non-zero in ways the caller may want to
	 * distinguish).
	 */
	readonly interactive: (
		argv: ReadonlyArray<string>,
		options?: Options
	) => Effect.Effect<number, ZellijError.ZellijError>;

	/**
	 * Return a new {@link Interface} that injects `--session <name>` on every
	 * call. Useful for code paths that operate on one specific session.
	 */
	readonly withSession: (session: SessionName.SessionName) => Interface;
}

/**
 * The `ZellijCli` service identity.
 *
 * @category Service
 * @since 0.1.0
 */
export class Service extends Context.Service<Service, Interface>()(
	'@workspace/zellij-binding/ZellijCli'
) {}

// ───────────────────────────────────────────────────────────────────────────
// Internal helpers
// ───────────────────────────────────────────────────────────────────────────

const BIN = 'zellij';

/**
 * Prepend `--session <name>` when `options.session` is set.
 */
const prefixArgs = (
	argv: ReadonlyArray<string>,
	options: Options | undefined
): ReadonlyArray<string> =>
	options?.session === undefined
		? argv
		: ['--session', options.session, ...argv];

/**
 * Concatenate a `Stream<Uint8Array>` into a single UTF-8 string. Used to
 * drain `handle.stdout` and `handle.stderr` concurrently with `exitCode`.
 * Generic over the upstream error/requirement channel so this stays
 * composable without narrowing `E` away.
 */
const collectText = <E, R>(
	stream: Stream.Stream<Uint8Array, E, R>
): Effect.Effect<string, E, R> =>
	pipe(stream, StreamModule.decodeText(), StreamModule.mkString);

// ───────────────────────────────────────────────────────────────────────────
// Layer
// ───────────────────────────────────────────────────────────────────────────

/**
 * Live implementation of {@link Service}.
 *
 * Captures `ChildProcessSpawner` in the closure so higher-level services
 * never see the platform dependency directly.
 *
 * @category Layers
 * @since 0.1.0
 */
export const layer = Layer.effect(
	Service,
	Effect.gen(function* () {
		const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;

		// Root `exec`: scoped spawn + concurrent collection of stdout/stderr/exit.
		// All PlatformErrors lift into ZellijError.SpawnError; non-zero exit
		// lifts into ZellijError.CommandFailed with stderr preserved.
		const execRaw = (
			argv: ReadonlyArray<string>,
			options: Options | undefined
		): Effect.Effect<ExecResult, ZellijError.ZellijError> =>
			Effect.gen(function* () {
				const fullArgs = prefixArgs(argv, options);
				const cmd = ChildProcess.make(BIN, fullArgs, {
					stdin: 'ignore'
				});

				const handle = yield* spawner.spawn(cmd).pipe(
					Effect.mapError((cause) =>
						ZellijError.spawnError(fullArgs, cause)
					)
				);

				const [stdout, stderr, exitCode] = yield* Effect.all(
					[
						collectText(handle.stdout),
						collectText(handle.stderr),
						handle.exitCode
					],
					{ concurrency: 'unbounded' }
				).pipe(
					Effect.mapError((cause) =>
						ZellijError.spawnError(fullArgs, cause)
					)
				);

				if (exitCode !== 0) {
					// `ZellijError` is a `Schema.TaggedErrorClass` and is itself
					// yieldable — no need to wrap it in `Effect.fail`.
					return yield* ZellijError.commandFailed({
						argv: fullArgs,
						exitCode,
						stderr
					});
				}

				return { stdout, stderr, exitCode };
			}).pipe(Effect.scoped);

		const exec = Effect.fn('ZellijCli.exec')(execRaw);

		const string = Effect.fn('ZellijCli.string')(
			(argv: ReadonlyArray<string>, options?: Options) =>
				pipe(
					execRaw(argv, options),
					Effect.map((r) => Str.trimEnd(r.stdout))
				)
		);

		const lines = Effect.fn('ZellijCli.lines')(
			(argv: ReadonlyArray<string>, options?: Options) =>
				pipe(
					execRaw(argv, options),
					Effect.map((r) => {
						// `Str.split('\n')` on a non-empty stdout always returns
						// at least one element, so `Arr.last` is the precise
						// way to peek at the trailing entry. We drop exactly
						// one empty tail line (from the terminal newline) but
						// preserve any meaningful blank lines mid-output.
						const parts = Str.split('\n')(r.stdout);
						return pipe(
							Arr.last(parts),
							Option.match({
								onNone: () => parts,
								onSome: (last) =>
									Str.isEmpty(last)
										? Arr.dropRight(parts, 1)
										: parts
							})
						);
					})
				)
		);

		// `exit` runs with stdin/stdout/stderr ignored and returns the exit
		// code verbatim. Used by actions like `are-floating-panes-visible`
		// that communicate via exit code rather than stdout.
		const exit = Effect.fn('ZellijCli.exit')(
			(argv: ReadonlyArray<string>, options?: Options) =>
				Effect.gen(function* () {
					const fullArgs = prefixArgs(argv, options);
					const cmd = ChildProcess.make(BIN, fullArgs, {
						stdin: 'ignore',
						stdout: 'ignore',
						stderr: 'ignore'
					});
					const code = yield* spawner.exitCode(cmd).pipe(
						Effect.mapError((cause) =>
							ZellijError.spawnError(fullArgs, cause)
						)
					);
					// `ExitCode` is `Brand.Branded<number, 'ExitCode'>`. The
					// public API returns bare `number`; `Number(...)` is a
					// no-op at runtime and a proper conversion at the type
					// level (no assertion).
					return Number(code);
				})
		);

		const json = Effect.fn('ZellijCli.json')(
			<A, I>(
				argv: ReadonlyArray<string>,
				schema: Schema.Codec<A, I, never>,
				options?: Options
			) => pipe(
				execRaw(argv, options),
				Effect.flatMap((r) =>
					Schema.decodeUnknownEffect(schema)(r.stdout).pipe(
						Effect.mapError((issue) =>
							ZellijError.decodeFailure({
								argv: prefixArgs(argv, options),
								output: r.stdout,
								issue: String(issue)
							})
						)
					)
				)
			)
		);

		// Stream: tail stdout as lines. PlatformError mid-stream maps to
		// SpawnError. We deliberately don't surface non-zero exit here —
		// streams generally consume until the process ends.
		const stream = (
			argv: ReadonlyArray<string>,
			options?: StreamOptions
		): Stream.Stream<string, ZellijError.ZellijError> => {
			const fullArgs = prefixArgs(argv, options);
			return pipe(
				spawner.streamLines(
					ChildProcess.make(BIN, fullArgs, { stdin: 'ignore' }),
					{ includeStderr: options?.includeStderr ?? false }
				),
				StreamModule.mapError((cause) =>
					ZellijError.spawnError(fullArgs, cause)
				)
			);
		};

		// `interactive` hands control of stdin/stdout/stderr to zellij so the
		// caller's terminal becomes the session's terminal. Uses
		// `spawner.exitCode` rather than `spawn` because we don't need to
		// capture output — it's going straight to the TTY.
		const interactive = Effect.fn('ZellijCli.interactive')(
			(argv: ReadonlyArray<string>, options?: Options) =>
				Effect.gen(function* () {
					const fullArgs = prefixArgs(argv, options);
					const cmd = ChildProcess.make(BIN, fullArgs, {
						stdin: 'inherit',
						stdout: 'inherit',
						stderr: 'inherit'
					});
					const code = yield* spawner.exitCode(cmd).pipe(
						Effect.mapError((cause) =>
							ZellijError.spawnError(fullArgs, cause)
						)
					);
					return Number(code);
				})
		);

		const makeInterface = (defaults: Options | undefined): Interface => {
			// Spread-merge is valid for both Options and StreamOptions because
			// every field in both is optional — TS resolves the result type
			// structurally from the call site, with no assertion required.
			// `{...undefined}` is an empty object, so the empty-options case
			// still produces a valid `Options`/`StreamOptions` instance.
			return {
				exec: (argv, options) =>
					exec(argv, { ...defaults, ...options }),
				string: (argv, options) =>
					string(argv, { ...defaults, ...options }),
				lines: (argv, options) =>
					lines(argv, { ...defaults, ...options }),
				exit: (argv, options) =>
					exit(argv, { ...defaults, ...options }),
				json: (argv, schema, options) =>
					json(argv, schema, { ...defaults, ...options }),
				stream: (argv, options) =>
					stream(argv, { ...defaults, ...options }),
				interactive: (argv, options) =>
					interactive(argv, { ...defaults, ...options }),
				withSession: (session) =>
					makeInterface({ ...defaults, session })
			};
		};

		return Service.of(makeInterface(undefined));
	})
);

// ───────────────────────────────────────────────────────────────────────────
// Convenience: access the service
// ───────────────────────────────────────────────────────────────────────────

/**
 * `yield*` helper for accessing the `ZellijCli` service.
 *
 * @category Service
 * @since 0.1.0
 */
export const make = Service;

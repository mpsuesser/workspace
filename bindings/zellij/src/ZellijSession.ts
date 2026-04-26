/**
 * ZellijSession — session-level operations: lifecycle, discovery, client
 * enumeration, and pane-output streaming.
 *
 * This namespace unifies two slices of the zellij CLI:
 *
 * 1. **Top-level session commands** (`zellij attach`, `zellij kill-session`,
 *    `zellij delete-session`, `zellij list-sessions`, `zellij watch`,
 *    `zellij subscribe`) — these run `zellij <verb>` rather than
 *    `zellij action <verb>`.
 * 2. **Session-affecting actions** (`detach`, `rename-session`,
 *    `save-session`, `switch-session`, `list-clients`, `dump-layout`) —
 *    these delegate to {@link ../ZellijAction} so we don't duplicate argv
 *    construction.
 *
 * Notable value-added over {@link ../ZellijAction}:
 *
 * - {@link Interface.list} parses `zellij list-sessions -s` into
 *   `ReadonlyArray<SessionName>`.
 * - {@link Interface.current} reads `$ZELLIJ_SESSION_NAME` via
 *   `Config.option` (testable via `ConfigProvider`, per EF-28).
 * - {@link Interface.listClients} parses the tabular `list-clients` output
 *   into `ReadonlyArray<ClientInfo>`.
 * - {@link Interface.subscribe} decodes `zellij subscribe --format json`
 *   NDJSON output into a typed `Stream<SubscribeEvent, ZellijError>`.
 *
 * @since 0.1.0
 */

import { Effect, Layer, pipe, Stream } from 'effect';
import * as Arr from 'effect/Array';
import * as Config from 'effect/Config';
import * as Context from 'effect/Context';
import * as FileSystem from 'effect/FileSystem';
import * as Option from 'effect/Option';
import * as Path from 'effect/Path';
import * as Str from 'effect/String';

import * as ClientInfo from './schemas/ClientInfo.ts';
import * as PaneId from './schemas/PaneId.ts';
import * as PaneInfo from './schemas/PaneInfo.ts';
import * as SessionFingerprint from './schemas/SessionFingerprint.ts';
import * as SessionName from './schemas/SessionName.ts';
import * as SubscribeEvent from './schemas/SubscribeEvent.ts';
import * as TabInfo from './schemas/TabInfo.ts';
import * as ZellijAction from './ZellijAction.ts';
import * as ZellijCli from './ZellijCli.ts';
import * as ZellijError from './ZellijError.ts';

// ───────────────────────────────────────────────────────────────────────────
// Options types
// ───────────────────────────────────────────────────────────────────────────

/**
 * Base — every write-ish operation accepts an optional `session` target to
 * scope the command (maps to `zellij --session <name> …`).
 *
 * @category Options
 * @since 0.1.0
 */
export interface SessionOptions {
	readonly session?: SessionName.SessionName;
}

/**
 * Options for {@link Interface.createBackground}.
 *
 * `defaultLayout` is forwarded as `options --default-layout <layout>` after
 * the session name, per the `zellij attach --create-background` subcommand
 * convention (see CLI Recipes → Background Sessions).
 *
 * @category Options
 * @since 0.1.0
 */
export interface CreateBackgroundOptions {
	readonly defaultLayout?: string;
}

/**
 * Options for {@link Interface.attach}.
 *
 * @category Options
 * @since 0.1.0
 */
export interface AttachOptions {
	/** Create the session if it does not exist. Maps to `-c, --create`. */
	readonly createIfMissing?: boolean;
	/** Force attaching even when another client is connected. */
	readonly force?: boolean;
}

/**
 * Options for {@link Interface.switch}.
 *
 * Mirrors `zellij action switch-session`'s flag set.
 *
 * @category Options
 * @since 0.1.0
 */
export interface SwitchOptions extends SessionOptions {
	readonly tabPosition?: number;
	readonly paneId?: PaneId.PaneId;
	readonly layout?: string;
	readonly layoutDir?: string;
	readonly layoutString?: string;
	readonly cwd?: string;
}

/**
 * Options for {@link Interface.subscribe}.
 *
 * `scrollback` has three behaviours:
 *   - omitted → no scrollback in the initial delivery
 *   - `true`  → include *all* scrollback
 *   - a number → include that many lines of scrollback
 *
 * @category Options
 * @since 0.1.0
 */
export interface SubscribeOptions extends SessionOptions {
	readonly scrollback?: number | true;
	readonly ansi?: boolean;
}

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
	// ─── Queries ────────────────────────────────────────────────────────────

	/**
	 * Read `$ZELLIJ_SESSION_NAME`. Returns `None` when not running inside
	 * a zellij-managed shell.
	 *
	 * Uses `Config.string` (+ `Config.option`) so tests can override via
	 * `ConfigProvider` rather than mutating real environment variables.
	 *
	 * NOTE: this env var is **not rename-safe** — it is captured at
	 * process launch and never updates, so a long-running process will
	 * see a stale value after `rename-session`. For rename-safe identity
	 * use {@link fingerprintCurrent} + {@link findByFingerprint}.
	 */
	readonly current: () => Effect.Effect<
		Option.Option<SessionName.SessionName>,
		ZellijError.ZellijError
	>;

	/**
	 * Capture a {@link SessionFingerprint.SessionFingerprint} for the
	 * current process's session by stat'ing the IPC socket file at
	 * `<socketDir>/$ZELLIJ_SESSION_NAME`. The captured `(dev, ino)`
	 * survives `rename-session` (zellij implements rename via
	 * `rename(2)`, which preserves the inode), so callers can hold this
	 * token across rename and re-resolve the live name via
	 * {@link findByFingerprint}.
	 *
	 * Returns `None` when not running in a zellij session, or when
	 * `$ZELLIJ_SESSION_NAME` no longer corresponds to an existing socket
	 * (i.e. a rename happened *before* the first capture). For long-lived
	 * consumers, capture this once at startup before any rename can
	 * happen.
	 */
	readonly fingerprintCurrent: () => Effect.Effect<
		Option.Option<SessionFingerprint.SessionFingerprint>,
		ZellijError.ZellijError
	>;

	/**
	 * Resolve a {@link SessionFingerprint.SessionFingerprint} back to the
	 * session's *current* name by scanning the socket directory for a
	 * file with matching `(dev, ino)`.
	 *
	 * Returns `None` if no live session has the given fingerprint (for
	 * instance, the session was killed, or the fingerprint was captured
	 * on a different machine / boot).
	 */
	readonly findByFingerprint: (
		fingerprint: SessionFingerprint.SessionFingerprint
	) => Effect.Effect<
		Option.Option<SessionName.SessionName>,
		ZellijError.ZellijError
	>;

	/**
	 * Like {@link current} but fails with
	 * {@link ZellijError.NotInSession} when the env var is absent.
	 */
	readonly currentOrFail: () => Effect.Effect<
		SessionName.SessionName,
		ZellijError.ZellijError
	>;

	/**
	 * `true` when `$ZELLIJ_SESSION_NAME` is set.
	 */
	readonly isInSession: () => Effect.Effect<
		boolean,
		ZellijError.ZellijError
	>;

	/**
	 * Enumerate every tab in the target session as typed
	 * {@link TabInfo} rows. Always requests `--json` internally; raw
	 * text output is not exposed.
	 */
	readonly getTabs: (
		options?: SessionOptions
	) => Effect.Effect<
		ReadonlyArray<TabInfo.TabInfo>,
		ZellijError.ZellijError
	>;

	/**
	 * Enumerate every pane in the target session as typed
	 * {@link PaneInfo} rows. Always requests `--json` internally; raw
	 * text output is not exposed.
	 */
	readonly getPanes: (
		options?: SessionOptions
	) => Effect.Effect<
		ReadonlyArray<PaneInfo.PaneInfo>,
		ZellijError.ZellijError
	>;

	/**
	 * Return just the tab names, in tab-bar order. Maps to
	 * `zellij action query-tab-names`; the output is newline-separated
	 * text which this method splits and trims.
	 */
	readonly getTabNames: (
		options?: SessionOptions
	) => Effect.Effect<
		ReadonlyArray<string>,
		ZellijError.ZellijError
	>;

	/**
	 * Enumerate the clients attached to the target session. Parses the
	 * `list-clients` text table into typed records.
	 */
	readonly getClients: (
		options?: SessionOptions
	) => Effect.Effect<
		ReadonlyArray<ClientInfo.ClientInfo>,
		ZellijError.ZellijError
	>;

	/**
	 * Return the session's layout as KDL text (the `layout { … }`
	 * block one would put in a layout file). Maps to
	 * `zellij action dump-layout`.
	 */
	readonly getLayout: (
		options?: SessionOptions
	) => Effect.Effect<string, ZellijError.ZellijError>;

	// ─── Lifecycle: top-level ──────────────────────────────────────────────

	/**
	 * Create a headless zellij session that is not attached to any
	 * terminal. Useful for scripted / CI workflows.
	 *
	 * Maps to `zellij attach --create-background <name> [options
	 * --default-layout <layout>]`.
	 */
	readonly createBackground: (
		name: SessionName.SessionName,
		options?: CreateBackgroundOptions
	) => Effect.Effect<void, ZellijError.ZellijError>;

	/**
	 * Attach the caller's terminal to a session. Stdio is inherited so
	 * this blocks until the user detaches or the session ends; the raw
	 * exit code is returned verbatim.
	 *
	 * Maps to `zellij attach [OPTIONS] <name>`.
	 */
	readonly attach: (
		name: SessionName.SessionName,
		options?: AttachOptions
	) => Effect.Effect<number, ZellijError.ZellijError>;

	/**
	 * Attach read-only to a session (no input is forwarded). Blocks like
	 * {@link attach} and returns the exit code.
	 *
	 * Maps to `zellij watch <name>`.
	 */
	readonly watch: (
		name: SessionName.SessionName
	) => Effect.Effect<number, ZellijError.ZellijError>;

	/**
	 * Kill a running session. Maps to `zellij kill-session <name>`.
	 */
	readonly kill: (
		name: SessionName.SessionName
	) => Effect.Effect<void, ZellijError.ZellijError>;

	/**
	 * Remove an exited / resurrectable session from the cache.
	 *
	 * Maps to `zellij delete-session <name>`.
	 */
	readonly delete: (
		name: SessionName.SessionName
	) => Effect.Effect<void, ZellijError.ZellijError>;

	// ─── Mutations via action subcommands ──────────────────────────────────

	/**
	 * Detach the attached client from the target session. The session
	 * keeps running in the background.
	 *
	 * Delegates to {@link ZellijAction.detach}.
	 */
	readonly detach: (
		options?: SessionOptions
	) => Effect.Effect<void, ZellijError.ZellijError>;

	/**
	 * Rename the target session. Delegates to
	 * {@link ZellijAction.renameSession}.
	 */
	readonly rename: (
		newName: SessionName.SessionName,
		options?: SessionOptions
	) => Effect.Effect<void, ZellijError.ZellijError>;

	/**
	 * Trigger an immediate state save for session resurrection. Delegates
	 * to {@link ZellijAction.saveSession}.
	 */
	readonly save: (
		options?: SessionOptions
	) => Effect.Effect<void, ZellijError.ZellijError>;

	/**
	 * Switch the attached client to a different session, optionally
	 * landing on a specific pane/tab/layout. Delegates to
	 * {@link ZellijAction.switchSession}.
	 */
	readonly switch: (
		target: SessionName.SessionName,
		options?: SwitchOptions
	) => Effect.Effect<void, ZellijError.ZellijError>;

	// ─── Streaming ─────────────────────────────────────────────────────────

	/**
	 * Subscribe to viewport changes for one or more panes. Returns a
	 * stream of decoded {@link SubscribeEvent}s (`PaneUpdate` and
	 * `PaneClosed`).
	 *
	 * The stream ends when every subscribed pane has closed, when the
	 * underlying zellij process exits, or when the Effect fiber is
	 * interrupted.
	 *
	 * Maps to `zellij subscribe --pane-id <id>… --format json`.
	 */
	readonly subscribe: (
		paneIds: ReadonlyArray<PaneId.PaneId>,
		options?: SubscribeOptions
	) => Stream.Stream<
		SubscribeEvent.SubscribeEvent,
		ZellijError.ZellijError
	>;
}

/**
 * The `ZellijSession` service identity.
 *
 * @category Service
 * @since 0.1.0
 */
export class Service extends Context.Service<Service, Interface>()(
	'@workspace/zellij-binding/ZellijSession'
) {}

// ───────────────────────────────────────────────────────────────────────────
// Layer
// ───────────────────────────────────────────────────────────────────────────

/**
 * Live implementation of {@link Service}. Captures {@link ZellijCli.Service}
 * in the closure so the returned methods have `Requirements = never`
 * (per the "No Requirement Leakage" rule in the service-implementation
 * skill).
 *
 * @category Layers
 * @since 0.1.0
 */
export const layer = Layer.effect(
	Service,
	Effect.gen(function* () {
		const cli = yield* ZellijCli.Service;
		const fs = yield* FileSystem.FileSystem;
		const path = yield* Path.Path;

		// `runAction` satisfies an effect's captured `ZellijCli.Service`
		// requirement with the already-acquired `cli` instance, so every
		// delegated action returns `Effect<A, ZellijError, never>`.
		const runAction = <A>(
			eff: Effect.Effect<
				A,
				ZellijError.ZellijError,
				ZellijCli.Service
			>
		): Effect.Effect<A, ZellijError.ZellijError> =>
			Effect.provideService(eff, ZellijCli.Service, cli);

		// ── Queries ──────────────────────────────────────────────────────

		// ─── Socket-fingerprint identity (rename-safe) ─────────────────────
		//
		// `socketDirCandidates` mirrors zellij-utils-0.44.1/src/consts.rs::
		// ZELLIJ_SOCK_DIR resolution order: `$ZELLIJ_SOCKET_DIR`, then
		// `$XDG_RUNTIME_DIR/zellij`, then `$TMPDIR/zellij-<uid>`, then
		// `/tmp/zellij-<uid>` — each suffixed with the contract version.
		//
		// `findSocketDir` returns the first candidate that exists; `None`
		// when no zellij socket dir is present (i.e. zellij is not running).
		const CONTRACT_DIR = 'contract_version_1';

		// `process.getuid` is undefined on Windows; zellij is Unix-only in
		// practice and the only candidate that uses uid is the
		// `/tmp/zellij-<uid>` fallback, so a 0 default is harmless on the
		// rare Windows pass-through.
		const readUid = Effect.sync(() => process.getuid?.() ?? 0);

		const socketDirCandidates = Effect.fn(
			'ZellijSession.socketDirCandidates'
		)(function* () {
			const envSocketDir = yield* Config.option(
				Config.string('ZELLIJ_SOCKET_DIR')
			).asEffect().pipe(Effect.orDie);
			const xdgRuntime = yield* Config.option(
				Config.string('XDG_RUNTIME_DIR')
			).asEffect().pipe(Effect.orDie);
			const tmpdir = yield* Config.option(
				Config.string('TMPDIR')
			).asEffect().pipe(Effect.orDie);
			const uid = yield* readUid;

			const withContract = (dir: string) => path.join(dir, CONTRACT_DIR);
			const named = (dir: string) => path.join(dir, `zellij-${uid}`);

			// `Arr.getSomes` collects the inner `string` of every `Some`;
			// `Arr.map(withContract)` then appends the contract-version dir
			// segment. We avoid `Arr.filterMap` because v4's signature wants
			// a `Result`-returning function rather than an `Option`-returning
			// one (see Effect MIGRATION.md — `Result` replaced `Option` in
			// many collection helpers).
			return pipe(
				[
					envSocketDir,
					Option.map(xdgRuntime, (d) => path.join(d, 'zellij')),
					Option.map(tmpdir, named),
					Option.some(named('/tmp'))
				],
				Arr.getSomes,
				Arr.map(withContract)
			);
		});

		const findSocketDir = Effect.fn('ZellijSession.findSocketDir')(
			function* () {
				const candidates = yield* socketDirCandidates();
				return yield* Effect.findFirst(candidates, (dir) =>
					fs
						.exists(dir)
						.pipe(Effect.orElseSucceed(() => false)));
			}
		);

		// Stat the socket file for `name` in `dir`, returning a fingerprint
		// when (a) the file exists, (b) the stat call succeeds, and (c) the
		// platform reports an inode (Bun/Node always do on Unix). Anything
		// else collapses to `None` — a missing file means the session is
		// gone, not an error condition.
		const statFingerprint = (dir: string, name: string) =>
			fs.stat(path.join(dir, name)).pipe(
				Effect.map((info) =>
					Option.map(
						info.ino,
						(ino) =>
							new SessionFingerprint.SessionFingerprint({
								dev: info.dev,
								ino
							})
					)
				),
				Effect.orElseSucceed(() =>
					Option.none<SessionFingerprint.SessionFingerprint>()
				)
			);

		const fingerprintCurrent = Effect.fn(
			'ZellijSession.fingerprintCurrent'
		)(() =>
			Effect.gen(function* () {
				const nameOpt = yield* current();
				const dirOpt = yield* findSocketDir();
				// Combine both Options into a single tuple-shaped Option;
				// missing either => the fingerprint is not derivable.
				const both = Option.flatMap(nameOpt, (name) =>
					Option.map(dirOpt, (dir) => ({ name, dir })));
				return yield* Option.match(both, {
					onNone: () =>
						Effect.succeed(
							Option.none<SessionFingerprint.SessionFingerprint>()
						),
					onSome: ({ name, dir }) =>
						statFingerprint(dir, name)
				});
			})
		);

		const findByFingerprint = Effect.fn(
			'ZellijSession.findByFingerprint'
		)((fingerprint: SessionFingerprint.SessionFingerprint) =>
			Effect.gen(function* () {
				const dirOpt = yield* findSocketDir();
				return yield* Option.match(dirOpt, {
					onNone: () =>
						Effect.succeed(
							Option.none<SessionName.SessionName>()
						),
					onSome: (dir) =>
						Effect.gen(function* () {
							const entries = yield* fs.readDirectory(dir).pipe(
								Effect.orElseSucceed(
									(): ReadonlyArray<string> => []
								)
							);
							// First filename whose stat matches the
							// fingerprint. Sequential `findFirst`
							// short-circuits, so the typical cost is one stat
							// call (cached name first works most of the time;
							// callers can stat the cached path themselves to
							// skip the directory scan in the fast path).
							const matching = yield* Effect.findFirst(
								entries,
								(entry) =>
									statFingerprint(dir, entry).pipe(
										Effect.map(
											Option.match({
												onNone: () => false,
												onSome: (fp) =>
													fp.dev === fingerprint.dev
													&& fp.ino ===
														fingerprint.ino
											})
										)
									)
							);
							return yield* Option.match(matching, {
								onNone: () =>
									Effect.succeed(
										Option.none<SessionName.SessionName>()
									),
								onSome: (entry) =>
									SessionName.decodeUnknown(entry).pipe(
										Effect.map(Option.some),
										Effect.orElseSucceed(() =>
											Option.none<
												SessionName.SessionName
											>()
										)
									)
							});
						})
				});
			})
		);

		const current = Effect.fn('ZellijSession.current')(() =>
			Effect.gen(function* () {
				// `Config.option(cfg)` produces a `Config<Option<A>>` where
				// missing env vars become `None` rather than raising. We
				// promote the Config to an Effect via `.asEffect()` and
				// `orDie` the residual ConfigError (validation failures from
				// `Config.string` on an env var are invariant violations —
				// env values are always strings).
				const raw = yield* Config.option(
					Config.string('ZELLIJ_SESSION_NAME')
				).asEffect().pipe(Effect.orDie);
				// `raw` is `Option<string>`; lift the inner value through
				// the branded SessionName schema so the caller gets an
				// `Option<SessionName>` rather than `Option<string>`.
				return yield* Option.match(raw, {
					onNone: () =>
						Effect.succeed(
							Option.none<SessionName.SessionName>()
						),
					onSome: (value) =>
						SessionName.decodeUnknown(value).pipe(
							Effect.map(Option.some),
							Effect.mapError((issue) =>
								ZellijError.decodeFailure({
									argv: ['$ZELLIJ_SESSION_NAME'],
									output: value,
									issue: String(issue)
								})
							)
						)
				});
			})
		);

		const currentOrFail = Effect.fn('ZellijSession.currentOrFail')(() =>
			current().pipe(
				Effect.flatMap(
					Option.match({
						onNone: () => Effect.fail(ZellijError.notInSession()),
						onSome: Effect.succeed
					})
				)
			)
		);

		const isInSession = Effect.fn('ZellijSession.isInSession')(() =>
			current().pipe(Effect.map(Option.isSome))
		);

		const getTabs = Effect.fn('ZellijSession.getTabs')(
			(options?: SessionOptions) =>
				runAction(
					ZellijAction.listTabs({ ...options, json: true })
				).pipe(
					Effect.flatMap((stdout) =>
						TabInfo.decodeJsonArray(stdout).pipe(
							Effect.mapError((issue) =>
								ZellijError.decodeFailure({
									argv: ['action', 'list-tabs', '--json'],
									output: stdout,
									issue: String(issue)
								})
							)
						)
					)
				)
		);

		const getPanes = Effect.fn('ZellijSession.getPanes')(
			(options?: SessionOptions) =>
				runAction(
					ZellijAction.listPanes({ ...options, json: true })
				).pipe(
					Effect.flatMap((stdout) =>
						PaneInfo.decodeJson(stdout).pipe(
							Effect.mapError((issue) =>
								ZellijError.decodeFailure({
									argv: ['action', 'list-panes', '--json'],
									output: stdout,
									issue: String(issue)
								})
							)
						)
					)
				)
		);

		const getTabNames = Effect.fn('ZellijSession.getTabNames')(
			(options?: SessionOptions) =>
				runAction(ZellijAction.queryTabNames(options)).pipe(
					Effect.map((stdout) =>
						pipe(
							Str.split('\n')(stdout),
							Arr.map(Str.trim),
							Arr.filter(Str.isNonEmpty)
						)
					)
				)
		);

		const getClients = Effect.fn('ZellijSession.getClients')(
			(options?: SessionOptions) =>
				runAction(ZellijAction.listClients(options)).pipe(
					Effect.map(ClientInfo.parseOutput)
				)
		);

		const getLayout = Effect.fn('ZellijSession.getLayout')(
			(options?: SessionOptions) =>
				runAction(ZellijAction.dumpLayout(options))
		);

		// ── Lifecycle ────────────────────────────────────────────────────

		const createBackground = Effect.fn(
			'ZellijSession.createBackground'
		)(
			(
				name: SessionName.SessionName,
				options?: CreateBackgroundOptions
			) => cli.exec([
				'attach',
				'--create-background',
				name,
				// `options --default-layout <v>` is a zellij subcommand
				// appended after the session name, not a regular flag.
				...(options?.defaultLayout === undefined
					? []
					: ['options', '--default-layout', options.defaultLayout])
			]).pipe(Effect.asVoid)
		);

		const attach = Effect.fn('ZellijSession.attach')(
			(
				name: SessionName.SessionName,
				options?: AttachOptions
			) => cli.interactive([
				'attach',
				...(options?.createIfMissing === true ? ['-c'] : []),
				...(options?.force === true ? ['--force-run-commands'] : []),
				name
			])
		);

		const watch = Effect.fn('ZellijSession.watch')(
			(name: SessionName.SessionName) => cli.interactive(['watch', name])
		);

		const kill = Effect.fn('ZellijSession.kill')(
			(name: SessionName.SessionName) =>
				cli.exec(['kill-session', name]).pipe(Effect.asVoid)
		);

		const delete_ = Effect.fn('ZellijSession.delete')(
			(name: SessionName.SessionName) =>
				cli.exec(['delete-session', name]).pipe(Effect.asVoid)
		);

		// ── Action-delegated mutations ────────────────────────────────────

		const detach = Effect.fn('ZellijSession.detach')(
			(options?: SessionOptions) =>
				runAction(ZellijAction.detach(options))
		);

		const rename = Effect.fn('ZellijSession.rename')(
			(
				newName: SessionName.SessionName,
				options?: SessionOptions
			) => runAction(ZellijAction.renameSession(newName, options))
		);

		const save = Effect.fn('ZellijSession.save')(
			(options?: SessionOptions) =>
				runAction(ZellijAction.saveSession(options))
		);

		const switch_ = Effect.fn('ZellijSession.switch')(
			(
				target: SessionName.SessionName,
				options?: SwitchOptions
			) => runAction(ZellijAction.switchSession(target, options))
		);

		// ── Streaming ────────────────────────────────────────────────────

		const subscribe = (
			paneIds: ReadonlyArray<PaneId.PaneId>,
			options?: SubscribeOptions
		): Stream.Stream<
			SubscribeEvent.SubscribeEvent,
			ZellijError.ZellijError
		> => {
			// Argv: one `--pane-id <encoded>` pair per id, plus format/
			// scrollback/ansi flags as requested. We always use
			// `--format json` so decoding yields typed events; raw text
			// output is not exposed through this Stream API.
			const paneArgs = Arr.flatMap(paneIds, (id) => [
				'--pane-id',
				PaneId.toCliArg(id)
			]);

			const scrollbackArgs = options?.scrollback === undefined
				? []
				: options.scrollback === true
				? ['--scrollback']
				: ['--scrollback', String(options.scrollback)];

			const ansiArgs = options?.ansi === true ? ['--ansi'] : [];

			const argv = [
				'subscribe',
				...paneArgs,
				...scrollbackArgs,
				...ansiArgs,
				'--format',
				'json'
			];

			return cli.stream(argv, options).pipe(
				// `zellij subscribe --format json` emits NDJSON — one JSON
				// object per line. `cli.stream` already splits on `\n`;
				// skip blank lines before decoding.
				Stream.filter((line) => Str.isNonEmpty(Str.trim(line))),
				Stream.mapEffect((line) =>
					SubscribeEvent.decodeJsonLine(line).pipe(
						Effect.mapError((issue) =>
							ZellijError.decodeFailure({
								argv,
								output: line,
								issue: String(issue)
							})
						)
					)
				)
			);
		};

		return Service.of({
			current,
			currentOrFail,
			isInSession,
			fingerprintCurrent,
			findByFingerprint,
			getTabs,
			getPanes,
			getTabNames,
			getClients,
			getLayout,
			createBackground,
			attach,
			watch,
			kill,
			delete: delete_,
			detach,
			rename,
			save,
			switch: switch_,
			subscribe
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

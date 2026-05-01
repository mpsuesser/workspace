/**
 * zellij-vertical-sessions-bar — single-file OpenTUI sidebar that lists every
 * running zellij session in a 20-col vertical bar, with the currently-attached
 * session highlighted with a dracula-orange `▌` marker on each of its three
 * lines (name / `{description}` / `{state}` placeholders).
 *
 * Replaces the Rust + wasm zellij plugin previously at
 * `/Users/m/repos/zellij-vertical-sessions-bar` with a Bun + OpenTUI program.
 * Wired into the dotconfig default layout as a borderless 20-col pane that
 * runs `bun run src/main.ts`.
 *
 * Effect data flow: `WorkspaceRuntime.runFork(main)` runs a single
 * `Effect.repeat`-driven poll every 1.5s. Each tick yields the
 * {@link Zellij.Service} binding directly (no intermediate service /
 * repository layer), then synchronously rebuilds the OpenTUI tree.
 *
 * Active-session detection is rename-safe via socket-inode fingerprinting.
 * zellij's own `(current)` marker compares each session name to the
 * calling process's `$ZELLIJ_SESSION_NAME` env var, which is captured
 * once at launch and never updates — so it is wrong for every row after
 * a `rename-session`. `$ZELLIJ_PANE_ID` is no help either: pane numbering
 * is session-local, so id `terminal_1` exists in every session.
 *
 * The stable-across-rename anchor is the per-session IPC socket inode.
 * `RenameSession` is implemented in zellij as `std::fs::rename(2)`, which
 * preserves the inode. So at startup we capture the `(dev, ino)` of
 * `<socketDir>/$ZELLIJ_SESSION_NAME` via
 * {@link ZellijSession.Service.fingerprintCurrent}; on every refresh we
 * call {@link ZellijSession.Service.findByFingerprint} to recover the
 * session's current name. The fetched `isCurrent` flag from
 * `list-sessions` is ignored; we override it from the resolved name.
 *
 * Keybindings (active when this pane is focused in zellij):
 *
 * - `s` — switch to the session below the active one in the sidebar.
 * - `w` — switch to the session above the active one in the sidebar.
 *
 * Both wrap at the edges. Navigation reads the most recent fetched
 * snapshot, so it is well-defined even if the next poll has not yet
 * landed.
 *
 * @since 0.1.0
 */

import {
	bold,
	BoxRenderable,
	createCliRenderer,
	dim,
	fg,
	t,
	TextRenderable,
	type CliRenderer,
	type KeyEvent,
	type Renderable
} from '@opentui/core';
import { WorkspaceRuntime } from '@workspace/runtime';
import {
	Zellij,
	ZellijSession,
	type SessionFingerprint,
	type SessionName,
	type SessionStatus
} from '@workspace/zellij-binding';
import {
	Duration,
	Effect,
	FiberHandle,
	Order,
	pipe,
	Ref,
	Schedule
} from 'effect';
import * as Arr from 'effect/Array';
import * as Bool from 'effect/Boolean';
import * as Cause from 'effect/Cause';
import * as Option from 'effect/Option';
import * as Schema from 'effect/Schema';
import {
	aggregateRunStateForSession,
	readResolvedAgentSessionStateRecords,
	type PiAgentRunState
} from 'pi-zellij-sessions-bar-integration/state';

// ─── Style constants (dracula palette; tweak these to re-skin) ───────────

const FG = '#f8f8f2';
const ACCENT = '#ffb86c';
const MUTED = '#6272a4';
const ERROR = '#ff5555';
const WORKING = '#50fa7b';
const DONE = '#f1fa8c';
const MARKER = '▌';

class RendererCreateError
	extends Schema.TaggedErrorClass<RendererCreateError>()(
		'RendererCreateError',
		{
			message: Schema.String,
			cause: Schema.Defect
		},
		{ description: 'Failed to create the OpenTUI CLI renderer.' }
	)
{}

// Refresh cadence — fast enough to feel live for session create/kill
// without flooding the CLI with `list-sessions` calls.
//
// TODO: replace polling with an event-driven trigger. The Zellij CLI
// only exposes `subscribe` for per-pane viewport updates, not for
// session lifecycle, so this will likely involve a combination of:
// filesystem watch on the session resurrection cache dir + per-session
// pane `subscribe` streams + manual triggers from our own keybinds.
// Until then, polling stays.
const REFRESH_INTERVAL = Duration.millis(1500);

// Hard ceiling on a single `zellij action switch-session` call. The CLI
// has been observed to hang past zellij's own server-side 1s
// SwitchSession timeout (the server gives up but the client keeps
// blocking on its IPC `recv()`). Without a client-side timeout, every
// hung invocation pins two unix sockets on the per-process fd table —
// burn through the macOS default `nofile=256` and the next IPC
// `accept()` panics with EMFILE. 2s is generous for a healthy switch
// (which completes in tens of ms locally) and short enough that even a
// pathological loop never accumulates more than ~1 outstanding child.
const SWITCH_TIMEOUT = Duration.seconds(2);

// Coalescing window for `s` / `w` keypresses. The dispatcher
// accumulates direction deltas during the window and fires a single
// switch at the end, so a fast `ssss` mash navigates four rows down
// in one CLI invocation rather than queuing four serial switches.
// Held keys with auto-repeat continue to scroll because the timer is
// re-armed only when the previous window has flushed.
const KEYPRESS_FLUSH_MS = 80;

// ─── Sort strategy ───────────────────────────────────────────────────────
//
// Today there's exactly one strategy: "by creation time, oldest first".
// It's modelled as a swappable `SortStrategy` (a pure
// `rows -> rows` function) so future strategies — custom user order,
// starred-on-top, active-on-top, etc. — can drop in without touching
// the renderer. The active strategy is selected via `activeStrategy`.

type SortStrategy = (
	rows: ReadonlyArray<SessionStatus>
) => ReadonlyArray<SessionStatus>;

// `createdAgo` is the time elapsed since session creation, captured at
// fetch time. Older sessions have larger `createdAgo` values, so to put
// the first-created session on top we sort by `createdAgo` *descending*
// — i.e. flip the natural Duration ordering.
const byCreationTime: SortStrategy = (rows) =>
	Arr.sort(
		rows,
		Order.flip(
			Order.mapInput(Duration.Order, (r: SessionStatus) => r.createdAgo)
		)
	);

const activeStrategy: SortStrategy = byCreationTime;

// ─── Fetch — yields the Zellij binding directly with no extra service ───

const fetchRows = Effect.fn('SessionsBar.fetchRows')(function* () {
	const zellij = yield* Zellij.Service;
	const rows = yield* zellij.listSessionsDetailed();
	return activeStrategy(rows);
});

// ─── Active-session detection (rename-safe via socket inode) ────────────
//
// `makeFindActiveSession` returns a tick-time effect that resolves the
// active session's *current* name by looking up the captured
// `SessionFingerprint` (`(dev, ino)` of the per-session IPC socket file)
// in zellij's socket directory. The fingerprint is stable across
// `rename-session` because zellij implements rename via `rename(2)`,
// which preserves the inode.
//
// When the fingerprint is `None` (running outside zellij, or socket
// missing at startup) detection collapses to `None` and the bar simply
// shows no active marker.

const makeFindActiveSession = (
	fingerprintOpt: Option.Option<SessionFingerprint>
) => Effect.fn('SessionsBar.findActiveSession')(function* () {
	if (Option.isNone(fingerprintOpt)) return Option.none<SessionName>();
	const session = yield* ZellijSession.Service;
	return yield* session.findByFingerprint(fingerprintOpt.value);
});

const isActive = (
	current: Option.Option<SessionName>,
	row: SessionStatus
): boolean =>
	Option.match(current, {
		onNone: () => false,
		onSome: (name) => name === row.name
	});

const stateContent = (state: PiAgentRunState) => {
	if (state === 'working') return fg(WORKING)('working');
	if (state === 'done') return fg(DONE)('done');
	return dim(fg(MUTED)('idle'));
};

// ─── Navigation ──────────────────────────────────────────────────────────
//
// Navigation walks the latest sorted snapshot in `rowsRef`, finds the
// active session, and asks zellij to switch to a row `delta` positions
// away (positive = down, negative = up). Wraps at the edges. A no-op
// when the snapshot is empty, has only one session, or has no
// `(current)` row (e.g. running outside any session).
//
// Deltas larger than ±1 happen when the keypress dispatcher coalesces
// a burst of presses inside `KEYPRESS_FLUSH_MS` — `ssss` becomes a
// single `targetForDelta(rows, +4, current)` call instead of four
// serial switches.

type NavigationDirection = 'up' | 'down';

const directionDelta = (direction: NavigationDirection): number =>
	direction === 'down' ? 1 : -1;

const targetForDelta = (
	rows: ReadonlyArray<SessionStatus>,
	delta: number,
	currentName: Option.Option<SessionName>
): Option.Option<SessionStatus> => {
	if (rows.length <= 1 || delta === 0) return Option.none();
	const n = rows.length;
	return pipe(
		currentName,
		Option.flatMap((name) =>
			Arr.findFirstIndex(rows, (r) => r.name === name)
		),
		Option.flatMap((idx) =>
			// JS `%` keeps the sign of the dividend, so `-1 % 5 === -1`.
			// `((x % n) + n) % n` normalises to `[0, n)` for any sign.
			Arr.get(rows, (((idx + delta) % n) + n) % n)
		)
	);
};

// ─── Rendering helpers ───────────────────────────────────────────────────

const buildBlock = (
	renderer: CliRenderer,
	row: SessionStatus,
	isCurrent: boolean,
	agentState: PiAgentRunState
): BoxRenderable => {
	const block = new BoxRenderable(renderer, {
		flexDirection: 'column',
		width: '100%'
	});

	// Active blocks get a bold orange `▌` on every line plus a bold name;
	// inactive blocks use a 2-space gutter and plain foreground for the
	// headline element. Line 2 remains a placeholder for future
	// per-session descriptions. Line 3 is the aggregate pi agent state
	// for every pi pane in this zellij session (`working > done > idle`).
	// `isCurrent` is supplied by the caller (rename-safe override) rather
	// than read from `row`.
	const renderedState = stateContent(agentState);
	const lines = Bool.match(isCurrent, {
		onTrue: () => ({
			name: t`${fg(ACCENT)(MARKER)} ${bold(fg(FG)(row.name))}`,
			desc: t`${fg(ACCENT)(MARKER)} ${dim(fg(MUTED)('{description}'))}`,
			state: t`${fg(ACCENT)(MARKER)} ${renderedState}`
		}),
		onFalse: () => ({
			name: t`  ${fg(FG)(row.name)}`,
			desc: t`  ${dim(fg(MUTED)('{description}'))}`,
			state: t`  ${renderedState}`
		})
	});

	block.add(new TextRenderable(renderer, { content: lines.name }));
	block.add(new TextRenderable(renderer, { content: lines.desc }));
	block.add(new TextRenderable(renderer, { content: lines.state }));
	return block;
};

const buildErrorLine = (
	renderer: CliRenderer,
	cause: Cause.Cause<unknown>
): TextRenderable => {
	// Trim aggressively — the bar is 20 cols wide.
	const message = Cause.pretty(cause)
		.split('\n')[0]
		?.slice(0, 80) ?? 'unknown error';
	return new TextRenderable(renderer, {
		content: t`${fg(ERROR)(`error: ${message}`)}`
	});
};

// ─── Main ────────────────────────────────────────────────────────────────

const main = Effect.gen(function* () {
	const renderer = yield* Effect.tryPromise({
		try: () =>
			createCliRenderer({
				targetFps: 30,
				exitOnCtrlC: true,
				// OpenTUI already installs SIGINT/SIGTERM/SIGHUP handlers and
				// an exitOnCtrlC keypress handler — all of which funnel through
				// `renderer.destroy()`. `onDestroy` fires at the end of that
				// teardown; here we dispose the Effect runtime (kills the
				// polling fiber and runs any layer finalizers) and then exit
				// the process so Node doesn't linger waiting on the runtime
				// keepalive.
				onDestroy: () => {
					void WorkspaceRuntime.dispose().finally(() =>
						process.exit(0)
					);
				}
			}),
		catch: (cause) =>
			new RendererCreateError({
				message: 'Failed to create OpenTUI CLI renderer',
				cause
			})
	}).pipe(Effect.orDie);

	const list = new BoxRenderable(renderer, {
		flexDirection: 'column',
		paddingTop: 1,
		paddingBottom: 1,
		gap: 1,
		width: '100%',
		height: '100%'
	});
	renderer.root.add(list);

	// Currently-attached child renderables, held in a Ref so each refresh
	// can swap them atomically across `Effect.repeat` iterations.
	const childrenRef = yield* Ref.make<ReadonlyArray<Renderable>>([
		new TextRenderable(renderer, {
			content: t`${dim(fg(MUTED)('loading…'))}`
		})
	]);
	Arr.forEach(yield* Ref.get(childrenRef), (c) => list.add(c));

	// Latest sorted rows, populated by `refresh`. The keypress handler
	// reads this for navigation.
	const rowsRef = yield* Ref.make<ReadonlyArray<SessionStatus>>([]);

	// ─── Rename-safe active-session tracking ──────────────────────────
	//
	// Capture our session's socket fingerprint exactly once, at startup,
	// when env vars are still consistent with zellij's view of the world.
	// This `(dev, ino)` survives any subsequent `rename-session` because
	// zellij renames the socket via `rename(2)`. Each refresh tick then
	// resolves the fingerprint back to the session's current name.
	//
	// `currentNameRef` is updated after each resolve so the keypress
	// handler (which fires synchronously, off the polling fiber) reads a
	// recent value without spawning its own resolution.
	const sess = yield* ZellijSession.Service;
	const fingerprint = yield* sess.fingerprintCurrent();
	yield* Effect.logDebug('captured session fingerprint', { fingerprint });
	const currentNameRef = yield* Ref.make<Option.Option<SessionName>>(
		Option.none()
	);

	const findCurrent = makeFindActiveSession(fingerprint);

	// `navigateBy(delta)` resolves the target row from the current
	// snapshot and switches to it. The CLI call is bounded by
	// `SWITCH_TIMEOUT` so a hung `zellij action switch-session`
	// (the server-side 1s timeout fires but the client keeps blocking)
	// can never pin its IPC sockets indefinitely — on timeout the inner
	// scope closes, which kills the spawned `zellij` child.
	const navigateBy = (delta: number) =>
		Effect.gen(function* () {
			const rows = yield* Ref.get(rowsRef);
			const currentName = yield* Ref.get(currentNameRef);
			const target = targetForDelta(rows, delta, currentName);
			if (Option.isNone(target)) return;
			yield* sess.switch(target.value.name).pipe(
				Effect.timeout(SWITCH_TIMEOUT),
				Effect.tap(() =>
					Effect.logDebug('switched session', {
						delta,
						target: target.value.name
					})
				),
				// Swallow failures (timeout, session vanished, interrupt
				// from a newer keypress preempting this one) so the
				// keypress handler stays best-effort. Pure-interrupt
				// causes are silent — they're the expected outcome of
				// the FiberHandle interrupting an in-flight switch when
				// a fresh keypress arrives mid-flight, and logging them
				// would just spam during normal mashing.
				Effect.catchCause((cause) =>
					Cause.hasInterruptsOnly(cause)
						? Effect.void
						: Effect.logWarning('session switch failed', { cause })
				)
			);
		});

	// Single-slot fiber for the in-flight switch. `FiberHandle.run`
	// (under the hood of `runOnHandle`) interrupts the previous fiber
	// when a new one is started — so a fresh keypress preempts any
	// switch that's still mid-CLI-call, and the spawn scope tears down
	// the child `zellij` process as part of that interruption. This is
	// the structural fix for the leak that exhausted the per-process fd
	// table on macOS (default `nofile=256`).
	const switchHandle = yield* FiberHandle.make<void, never>();
	const runOnHandle = yield* FiberHandle.runtime(switchHandle)<never>();

	// Bind `s` / `w` to navigate the sidebar list. Presses inside
	// `KEYPRESS_FLUSH_MS` are coalesced into a single switch with the
	// accumulated delta — mashing `ssss` ends up four rows below where
	// you started in one CLI call, instead of queueing four. Held keys
	// scroll naturally because each window flushes after its delay.
	const navigationBufferRef = yield* Ref.make({
		delta: 0,
		flushScheduled: false
	});
	const flushHandle = yield* FiberHandle.make<void, never>();
	const runFlush = yield* FiberHandle.runtime(flushHandle)<never>();

	const flushBufferedNavigation = Effect.sleep(
		Duration.millis(KEYPRESS_FLUSH_MS)
	).pipe(
		Effect.andThen(
			Effect.gen(function* () {
				const delta = yield* Ref.modify(
					navigationBufferRef,
					(state) => [
						state.delta,
						{ delta: 0, flushScheduled: false }
					]
				);
				if (delta === 0) return;
				runOnHandle(navigateBy(delta));
			})
		)
	);

	const onDirection = (direction: NavigationDirection) =>
		Effect.gen(function* () {
			const shouldSchedule = yield* Ref.modify(
				navigationBufferRef,
				(state) => [
					!state.flushScheduled,
					{
						delta: state.delta + directionDelta(direction),
						flushScheduled: true
					}
				]
			);
			if (shouldSchedule) {
				yield* Effect.sync(() => runFlush(flushBufferedNavigation));
			}
		});

	const runInMainContext = Effect.runForkWith(yield* Effect.context<never>());

	yield* Effect.sync(() => {
		renderer.keyInput.on('keypress', (key: KeyEvent) => {
			if (key.name === 's') runInMainContext(onDirection('down'));
			else if (key.name === 'w') runInMainContext(onDirection('up'));
		});
	});

	// `Renderable.remove(id)` keys by the child's string id (NOT the
	// instance) — passing the renderable object is a silent no-op which
	// otherwise causes children to accumulate across refreshes and yoga
	// to eventually abort with "Cannot add child".
	const replaceChildren = Effect.fn('SessionsBar.replaceChildren')(
		function* (next: ReadonlyArray<Renderable>) {
			const previous = yield* Ref.getAndSet(childrenRef, next);
			Arr.forEach(previous, (c) => list.remove(c.id));
			Arr.forEach(next, (c) => list.add(c));
			renderer.requestRender();
		}
	);

	const refresh = Effect.gen(function* () {
		const rows = yield* fetchRows();
		yield* Ref.set(rowsRef, rows);
		const piRecords = yield* readResolvedAgentSessionStateRecords();
		const current = yield* findCurrent();
		yield* Ref.set(currentNameRef, current);
		yield* replaceChildren(
			rows.map((r) =>
				buildBlock(
					renderer,
					r,
					isActive(current, r),
					aggregateRunStateForSession(r.name, piRecords)
				)
			)
		);
	}).pipe(
		// Render the failure inside the bar itself rather than crashing
		// the renderer or corrupting the pane with stderr writes. The
		// previous `rowsRef` / `currentNameRef` snapshot is intentionally
		// left in place so keyboard navigation keeps working through
		// transient errors.
		Effect.catchCause((cause) =>
			replaceChildren([buildErrorLine(renderer, cause)])
		)
	);

	yield* refresh.pipe(Effect.repeat(Schedule.spaced(REFRESH_INTERVAL)));
});

// `Effect.scoped` provides the Scope required by `FiberHandle.make`
// inside `main`. Since the Effect.repeat loop never returns, the scope
// effectively lives for the lifetime of the program (and is closed by
// `WorkspaceRuntime.dispose()` in the OpenTUI `onDestroy` hook).
WorkspaceRuntime.runFork(main.pipe(Effect.scoped));

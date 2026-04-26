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
import { Duration, Effect, Order, pipe, Ref, Schedule } from 'effect';
import * as Arr from 'effect/Array';
import * as Bool from 'effect/Boolean';
import * as Cause from 'effect/Cause';
import * as Option from 'effect/Option';

// ─── Style constants (dracula palette; tweak these to re-skin) ───────────

const FG = '#f8f8f2';
const ACCENT = '#ffb86c';
const MUTED = '#6272a4';
const ERROR = '#ff5555';
const MARKER = '▌';

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

// ─── Navigation ──────────────────────────────────────────────────────────
//
// `navigate(direction)` reads the latest sorted snapshot from
// `rowsRef`, finds the active session, and asks zellij to switch to its
// neighbour. Wraps at the edges. A no-op when the snapshot is empty,
// has only one session, or has no `(current)` row (e.g. running outside
// any session).

type NavigationDirection = 'up' | 'down';

const targetForNavigation = (
	rows: ReadonlyArray<SessionStatus>,
	direction: NavigationDirection,
	currentName: Option.Option<SessionName>
): Option.Option<SessionStatus> => {
	if (rows.length <= 1) return Option.none();
	const delta = direction === 'down' ? 1 : -1;
	return pipe(
		currentName,
		Option.flatMap((name) =>
			Arr.findFirstIndex(rows, (r) => r.name === name)
		),
		Option.flatMap((idx) =>
			Arr.get(rows, (idx + delta + rows.length) % rows.length)
		)
	);
};

const makeNavigate = (
	rowsRef: Ref.Ref<ReadonlyArray<SessionStatus>>,
	currentNameRef: Ref.Ref<Option.Option<SessionName>>
) => Effect.fn('SessionsBar.navigate')(function* (
	direction: NavigationDirection
) {
	const session = yield* ZellijSession.Service;
	const rows = yield* Ref.get(rowsRef);
	const currentName = yield* Ref.get(currentNameRef);
	const target = targetForNavigation(rows, direction, currentName);
	yield* Option.match(target, {
		onNone: () => Effect.void,
		onSome: (row) =>
			session.switch(row.name).pipe(
				Effect.tap(() =>
					Effect.logDebug('switched session', {
						direction,
						target: row.name
					})
				),
				// Switch failures (e.g. session vanished between the
				// snapshot and the call) are logged and swallowed so the
				// keypress handler stays best-effort.
				Effect.catchCause((cause) =>
					Effect.logWarning('session switch failed', { cause })
				)
			)
	});
});

// ─── Rendering helpers ───────────────────────────────────────────────────

const buildBlock = (
	renderer: CliRenderer,
	row: SessionStatus,
	isCurrent: boolean
): BoxRenderable => {
	const block = new BoxRenderable(renderer, {
		flexDirection: 'column',
		width: '100%'
	});

	// Active blocks get a bold orange `▌` on every line plus a bold name;
	// inactive blocks use a 2-space gutter and plain foreground for the
	// headline element. Lines 2 and 3 are placeholders awaiting future
	// per-session signals (description / state). `isCurrent` is supplied
	// by the caller (rename-safe override) rather than read from `row`.
	const lines = Bool.match(isCurrent, {
		onTrue: () => ({
			name: t`${fg(ACCENT)(MARKER)} ${bold(fg(FG)(row.name))}`,
			desc: t`${fg(ACCENT)(MARKER)} ${dim(fg(MUTED)('{description}'))}`,
			state: t`${fg(ACCENT)(MARKER)} ${dim(fg(MUTED)('{state}'))}`
		}),
		onFalse: () => ({
			name: t`  ${fg(FG)(row.name)}`,
			desc: t`  ${dim(fg(MUTED)('{description}'))}`,
			state: t`  ${dim(fg(MUTED)('{state}'))}`
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
		catch: (cause) => cause
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
	const navigate = makeNavigate(rowsRef, currentNameRef);

	// Bind `s` / `w` to navigate the sidebar list. Effects are dispatched
	// on the workspace runtime so the synchronous Node event handler can
	// stay free of `runPromise`/await ceremony, and so failures funnel
	// through the same fiber supervision as the polling loop.
	yield* Effect.sync(() => {
		renderer.keyInput.on('keypress', (key: KeyEvent) => {
			if (key.name === 's') {
				WorkspaceRuntime.runFork(navigate('down'));
			} else if (key.name === 'w') {
				WorkspaceRuntime.runFork(navigate('up'));
			}
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
		const current = yield* findCurrent();
		yield* Ref.set(currentNameRef, current);
		yield* replaceChildren(
			rows.map((r) => buildBlock(renderer, r, isActive(current, r)))
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

WorkspaceRuntime.runFork(main);

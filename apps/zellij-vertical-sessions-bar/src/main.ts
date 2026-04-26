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
 * Active-session detection comes from {@link Zellij.listSessionsDetailed}'s
 * `isCurrent` flag rather than `$ZELLIJ_SESSION_NAME` so the highlight
 * survives `rename-session` (the env var is a process-launch snapshot and
 * does not update on rename).
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
	direction: NavigationDirection
): Option.Option<SessionStatus> => {
	if (rows.length <= 1) return Option.none();
	const delta = direction === 'down' ? 1 : -1;
	return pipe(
		Arr.findFirstIndex(rows, (r) => r.isCurrent),
		Option.flatMap((idx) =>
			Arr.get(rows, (idx + delta + rows.length) % rows.length)
		)
	);
};

const makeNavigate = (
	rowsRef: Ref.Ref<ReadonlyArray<SessionStatus>>
) => Effect.fn('SessionsBar.navigate')(function* (
	direction: NavigationDirection
) {
	const session = yield* ZellijSession.Service;
	const rows = yield* Ref.get(rowsRef);
	const target = targetForNavigation(rows, direction);
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
	row: SessionStatus
): BoxRenderable => {
	const block = new BoxRenderable(renderer, {
		flexDirection: 'column',
		width: '100%'
	});

	// Active blocks get a bold orange `▌` on every line plus a bold name;
	// inactive blocks use a 2-space gutter and plain foreground for the
	// headline element. Lines 2 and 3 are placeholders awaiting future
	// per-session signals (description / state).
	const lines = Bool.match(row.isCurrent, {
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
				targetFPS: 30,
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
	const navigate = makeNavigate(rowsRef);

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

	const refresh = fetchRows().pipe(
		Effect.tap((rows) => Ref.set(rowsRef, rows)),
		Effect.flatMap((rows) =>
			replaceChildren(rows.map((r) => buildBlock(renderer, r)))
		),
		// Render the failure inside the bar itself rather than crashing
		// the renderer or corrupting the pane with stderr writes. The
		// previous `rowsRef` snapshot is intentionally left in place so
		// keyboard navigation keeps working through transient errors.
		Effect.catchCause((cause) =>
			replaceChildren([buildErrorLine(renderer, cause)])
		)
	);

	yield* refresh.pipe(Effect.repeat(Schedule.spaced(REFRESH_INTERVAL)));
});

WorkspaceRuntime.runFork(main);

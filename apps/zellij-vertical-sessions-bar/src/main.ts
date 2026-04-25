/**
 * zellij-vertical-sessions-bar — single-file OpenTUI sidebar that lists every
 * running zellij session in a 20-col vertical bar, with the currently-attached
 * session highlighted with a dracula-orange `▌` marker on each of its three
 * lines (name / description placeholder / pane count).
 *
 * Replaces the Rust + wasm zellij plugin previously at
 * `/Users/m/repos/zellij-vertical-sessions-bar` with a Bun + OpenTUI program.
 * Wired into the dotconfig default layout as a borderless 20-col pane that
 * runs `bun run src/main.ts`.
 *
 * Effect data flow: `WorkspaceRuntime.runFork(main)` runs a single
 * `Effect.repeat`-driven poll every 1.5s. Each tick yields the
 * {@link Zellij.Service} and {@link ZellijSession.Service} bindings directly
 * (no intermediate service / repository layer), then synchronously rebuilds
 * the OpenTUI tree.
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
	type Renderable
} from '@opentui/core';
import { WorkspaceRuntime } from '@workspace/runtime';
import {
	Zellij,
	ZellijSession,
	type SessionName
} from '@workspace/zellij-binding';
import { Duration, Effect, Order, Ref, Schedule } from 'effect';
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
// without flooding the CLI with `list-panes` calls.
//
// TODO: replace polling with an event-driven trigger. The Zellij CLI
// only exposes `subscribe` for per-pane viewport updates, not for
// session lifecycle, so this will likely involve a combination of:
// filesystem watch on the session resurrection cache dir + per-session
// pane `subscribe` streams + manual triggers from our own keybinds.
// Until then, polling stays.
const REFRESH_INTERVAL = Duration.millis(1500);

// ─── Domain row + ordering ───────────────────────────────────────────────

interface SessionRow {
	readonly name: SessionName;
	readonly paneCount: number;
	readonly isActive: boolean;
}

// Active session first, then alphabetical by name. SessionName is a
// branded NonEmptyString, so it is assignable to `string` structurally —
// no cast needed when feeding it into `Order.String`.
const rowOrder = Order.combine(
	Order.mapInput(Order.Boolean, (r: SessionRow) => !r.isActive),
	Order.mapInput(Order.String, (r: SessionRow) => r.name)
);

// ─── Fetch — yields the zellij bindings directly with no extra service ───

const fetchRows = Effect.fn('SessionsBar.fetchRows')(function* () {
	const zellij = yield* Zellij.Service;
	const session = yield* ZellijSession.Service;

	const names = yield* zellij.listSessions();
	const currentOpt = yield* session.current();
	const current = Option.getOrUndefined(currentOpt);

	// Fan out per-session pane counts. Bounded concurrency keeps a fork
	// cap on the underlying `zellij action list-panes --json` spawns.
	const rows = yield* Effect.forEach(
		names,
		(name) =>
			session.getPanes({ session: name }).pipe(
				Effect.map(
					(panes): SessionRow => ({
						name,
						// Mirror the original Rust plugin: count user-facing
						// terminal panes, ignoring plugins (status-bar, this
						// sidebar) and non-selectable scaffolding.
						paneCount: panes.filter(
							(p) => p.is_selectable && !p.is_plugin
						).length,
						isActive: name === current
					})
				),
				// A session can disappear between listSessions and getPanes.
				// Surface it as a 0-pane row instead of failing the refresh.
				Effect.catchCause(() =>
					Effect.succeed<SessionRow>({
						name,
						paneCount: 0,
						isActive: name === current
					})
				)
			),
		{ concurrency: 4 }
	);

	return Arr.sort(rows, rowOrder);
});

// ─── Rendering helpers ───────────────────────────────────────────────────

const buildBlock = (
	renderer: CliRenderer,
	row: SessionRow
): BoxRenderable => {
	const block = new BoxRenderable(renderer, {
		flexDirection: 'column',
		width: '100%'
	});

	const label = row.paneCount === 1 ? 'pane' : 'panes';
	const count = String(row.paneCount);

	// Active blocks get a bold orange `▌` on every line plus a bold name and
	// bold orange count number; inactive blocks use a 2-space gutter and
	// plain foreground for the headline elements.
	const lines = Bool.match(row.isActive, {
		onTrue: () => ({
			name: t`${fg(ACCENT)(MARKER)} ${bold(fg(FG)(row.name))}`,
			desc: t`${fg(ACCENT)(MARKER)} ${dim(fg(MUTED)('{description}'))}`,
			count: t`${fg(ACCENT)(MARKER)} ${bold(fg(ACCENT)(count))} ${
				dim(fg(MUTED)(label))
			}`
		}),
		onFalse: () => ({
			name: t`  ${fg(FG)(row.name)}`,
			desc: t`  ${dim(fg(MUTED)('{description}'))}`,
			count: t`  ${fg(FG)(count)} ${dim(fg(MUTED)(label))}`
		})
	});

	block.add(new TextRenderable(renderer, { content: lines.name }));
	block.add(new TextRenderable(renderer, { content: lines.desc }));
	block.add(new TextRenderable(renderer, { content: lines.count }));
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
		Effect.flatMap((rows) =>
			replaceChildren(rows.map((r) => buildBlock(renderer, r)))
		),
		// Render the failure inside the bar itself rather than crashing
		// the renderer or corrupting the pane with stderr writes.
		Effect.catchCause((cause) =>
			replaceChildren([buildErrorLine(renderer, cause)])
		)
	);

	yield* refresh.pipe(Effect.repeat(Schedule.spaced(REFRESH_INTERVAL)));
});

WorkspaceRuntime.runFork(main);

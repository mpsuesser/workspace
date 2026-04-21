import * as Arr from 'effect/Array';
import * as Config from 'effect/Config';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import * as PubSub from 'effect/PubSub';
import * as Ref from 'effect/Ref';
import * as Schedule from 'effect/Schedule';
import * as Schema from 'effect/Schema';
import * as Context from 'effect/Context';
import * as ChildProcess from 'effect/unstable/process/ChildProcess';
import * as ChildProcessSpawner from 'effect/unstable/process/ChildProcessSpawner';

// ── Schemas ──

export class TmuxError extends Schema.TaggedErrorClass<TmuxError>()(
	'TmuxError',
	{
		reason: Schema.Literals(['CommandFailed', 'ParseError', 'NotFound']),
		message: Schema.String
	}
) {}

export class TmuxSession extends Schema.Class<TmuxSession>('TmuxSession')({
	id: Schema.String,
	name: Schema.String,
	attached: Schema.Boolean,
	windows: Schema.Number,
	created: Schema.Number,
	activity: Schema.Number
}) {}

export class TmuxPane extends Schema.Class<TmuxPane>('TmuxPane')({
	id: Schema.String,
	title: Schema.String,
	pid: Schema.Number,
	width: Schema.Number,
	height: Schema.Number,
	active: Schema.Boolean
}) {}

// ── Primitives ──

const run = (args: ReadonlyArray<string>) =>
	Effect.gen(function* () {
		const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
		return yield* spawner.string(ChildProcess.make('tmux', [...args])).pipe(
			Effect.mapError(
				(e) =>
					new TmuxError({
						reason: 'CommandFailed',
						message: String(e.message ?? e)
					})
			)
		);
	});

const runVoid = (args: ReadonlyArray<string>) =>
	Effect.gen(function* () {
		const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
		yield* spawner.exitCode(ChildProcess.make('tmux', [...args])).pipe(
			Effect.mapError(
				(e) =>
					new TmuxError({
						reason: 'CommandFailed',
						message: String(e.message ?? e)
					})
			)
		);
	});

// ── Commands ──

const listSessionNames = Effect.fn('Tmux.listSessionNames')(() =>
	Effect.gen(function* () {
		const out = yield* run(['list-sessions', '-F', '#{session_name}']);
		return out
			.trim()
			.split('\n')
			.filter((s) => s.length > 0);
	})
);

const getAllSessions = Effect.fn('Tmux.getAllSessions')(() =>
	Effect.gen(function* () {
		const out = yield* run([
			'list-sessions',
			'-F',
			'#{session_id}\t#{session_name}\t#{session_attached}\t#{session_windows}\t#{session_created}\t#{session_activity}'
		]);
		const lines = out
			.trim()
			.split('\n')
			.filter((s) => s.length > 0);
		return lines.map((line) => {
			const parts = line.split('\t');
			return new TmuxSession({
				id: parts[0] ?? '',
				name: parts[1] ?? '',
				attached: parts[2] === '1',
				windows: Number(parts[3] ?? 0),
				created: Number(parts[4] ?? 0),
				activity: Number(parts[5] ?? 0)
			});
		});
	})
);

const newSession = (name: string) => runVoid(['new-session', '-d', '-s', name]);

const killSession = (name: string) => runVoid(['kill-session', '-t', name]);

const attachSession = (name: string) => runVoid(['attach-session', '-t', name]);

const detachClient = runVoid(['detach-client']);

const listWindows = (session: string) =>
	Effect.gen(function* () {
		const out = yield* run([
			'list-windows',
			'-t',
			session,
			'-F',
			'#{window_index}:#{window_name}'
		]);
		return out
			.trim()
			.split('\n')
			.filter((s) => s.length > 0);
	});

const newWindow = (session: string, name?: string) => {
	const args: string[] = ['new-window', '-t', session];
	if (name) args.push('-n', name);
	return runVoid(args);
};

const killWindow = (target: string) => runVoid(['kill-window', '-t', target]);

const selectWindow = (target: string) =>
	runVoid(['select-window', '-t', target]);

const listPanes = (target: string) =>
	Effect.gen(function* () {
		const out = yield* run([
			'list-panes',
			'-t',
			target,
			'-F',
			'#{pane_id}\t#{pane_title}\t#{pane_pid}\t#{pane_width}\t#{pane_height}\t#{pane_active}'
		]);
		const lines = out
			.trim()
			.split('\n')
			.filter((s) => s.length > 0);
		return lines.map((line) => {
			const parts = line.split('\t');
			return new TmuxPane({
				id: parts[0] ?? '',
				title: parts[1] ?? '',
				pid: Number(parts[2] ?? 0),
				width: Number(parts[3] ?? 0),
				height: Number(parts[4] ?? 0),
				active: parts[5] === '1'
			});
		});
	});

const splitWindowH = (target: string) =>
	runVoid(['split-window', '-h', '-t', target]);

const splitWindowV = (target: string) =>
	runVoid(['split-window', '-v', '-t', target]);

const selectPane = (target: string) => runVoid(['select-pane', '-t', target]);

const killPane = (target: string) => runVoid(['kill-pane', '-t', target]);

const switchClient = (target: string) =>
	runVoid(['switch-client', '-t', target]);

const displayMessage = (format: string) =>
	run(['display-message', '-p', format]);

const showOption = (target: string, option: string) =>
	run(['show-options', '-t', target, '-v', option]);

const setOption = (target: string, option: string, value: string) =>
	runVoid(['set-option', '-t', target, option, value]);

const sendKeys = (target: string, keys: string) =>
	runVoid(['send-keys', '-t', target, keys, 'Enter']);

const capturePane = (target: string) =>
	run(['capture-pane', '-p', '-t', target]);

/** Determine which session a pane belongs to via TMUX_PANE env var */
const TmuxPaneConfig = Config.option(Config.string('TMUX_PANE'));

const getCurrentSessionName = Effect.fn('Tmux.getCurrentSessionName')(() =>
	Effect.gen(function* () {
		const paneIdOption = yield* TmuxPaneConfig;
		if (Option.isNone(paneIdOption)) {
			return yield* new TmuxError({
				reason: 'NotFound',
				message: 'TMUX_PANE environment variable not set'
			});
		}
		const paneId = paneIdOption.value;
		const out = yield* run([
			'display-message',
			'-t',
			paneId,
			'-p',
			'#{session_name}'
		]);
		return out.trim();
	})
);

const renameSession = (target: string, newName: string) =>
	runVoid(['rename-session', '-t', target, newName]);

/** Determine which session a pane belongs to via TMUX_PANE env var (returns session ID) */
const getCurrentSessionId = Effect.fn('Tmux.getCurrentSessionId')(() =>
	Effect.gen(function* () {
		const paneIdOption = yield* TmuxPaneConfig;
		if (Option.isNone(paneIdOption)) {
			return yield* new TmuxError({
				reason: 'NotFound',
				message: 'TMUX_PANE environment variable not set'
			});
		}
		const paneId = paneIdOption.value;
		const out = yield* run([
			'display-message',
			'-t',
			paneId,
			'-p',
			'#{session_id}'
		]);
		return out.trim();
	})
);

const sourceFile = (path: string) => runVoid(['source-file', path]);

// ── Service ──

const sessionSnapshotKey = (sessions: ReadonlyArray<TmuxSession>): string =>
	sessions
		.map(
			(s) => `${s.id}:${s.name}:${s.attached}:${s.windows}:${s.activity}`
		)
		.join(',');

export class Tmux extends Context.Service<Tmux>()(
	'@workspace/tmux-binding/Tmux',
	{
		make: Effect.gen(function* () {
			const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;

			const provide = <A, E>(
				effect: Effect.Effect<
					A,
					E,
					ChildProcessSpawner.ChildProcessSpawner
				>
			) =>
				Effect.provideService(
					effect,
					ChildProcessSpawner.ChildProcessSpawner,
					spawner
				);

			const hub = yield* PubSub.unbounded<ReadonlyArray<TmuxSession>>();
			const lastKey = yield* Ref.make('');

			const pollSessions = Effect.gen(function* () {
				const current = yield* provide(getAllSessions()).pipe(
					Effect.catchTag('TmuxError', () =>
						Effect.succeed([] as ReadonlyArray<TmuxSession>)
					)
				);
				const key = sessionSnapshotKey(current);
				const prev = yield* Ref.get(lastKey);
				if (key !== prev) {
					yield* Ref.set(lastKey, key);
					yield* PubSub.publish(hub, current);
				}
			});

			yield* pollSessions.pipe(
				Effect.repeat(Schedule.spaced('1 second')),
				Effect.forkScoped
			);

			return {
				// Sessions
				getAllSessions: Effect.fn('Tmux.getAllSessions.svc')(() =>
					provide(getAllSessions())
				),
				getActiveSession: Effect.fn('Tmux.getActiveSession')(() =>
					Effect.map(provide(getAllSessions()), (sessions) =>
						Arr.findFirst(sessions, (s) => s.attached)
					)
				),
				onSessionChange: hub,

				listSessions: Effect.fn('Tmux.listSessions')(() =>
					provide(listSessionNames())
				),
				newSession: Effect.fn('Tmux.newSession')((name: string) =>
					provide(newSession(name))
				),
				killSession: Effect.fn('Tmux.killSession')((name: string) =>
					provide(killSession(name))
				),
				attachSession: Effect.fn('Tmux.attachSession')((name: string) =>
					provide(attachSession(name))
				),
				detachClient: Effect.fn('Tmux.detachClient')(() =>
					provide(detachClient)
				),

				// Windows
				listWindows: Effect.fn('Tmux.listWindows')((session: string) =>
					provide(listWindows(session))
				),
				newWindow: Effect.fn('Tmux.newWindow')(
					(session: string, name?: string) =>
						provide(newWindow(session, name))
				),
				killWindow: Effect.fn('Tmux.killWindow')((target: string) =>
					provide(killWindow(target))
				),
				selectWindow: Effect.fn('Tmux.selectWindow')((target: string) =>
					provide(selectWindow(target))
				),

				// Panes
				listPanes: Effect.fn('Tmux.listPanes')((target: string) =>
					provide(listPanes(target))
				),
				splitWindowH: Effect.fn('Tmux.splitWindowH')((target: string) =>
					provide(splitWindowH(target))
				),
				splitWindowV: Effect.fn('Tmux.splitWindowV')((target: string) =>
					provide(splitWindowV(target))
				),
				selectPane: Effect.fn('Tmux.selectPane')((target: string) =>
					provide(selectPane(target))
				),
				killPane: Effect.fn('Tmux.killPane')((target: string) =>
					provide(killPane(target))
				),

				// Commands
				switchClient: Effect.fn('Tmux.switchClient')((target: string) =>
					provide(switchClient(target))
				),
				displayMessage: Effect.fn('Tmux.displayMessage')(
					(format: string) => provide(displayMessage(format))
				),
				sendKeys: Effect.fn('Tmux.sendKeys')(
					(target: string, keys: string) =>
						provide(sendKeys(target, keys))
				),
				capturePane: Effect.fn('Tmux.capturePane')((target: string) =>
					provide(capturePane(target))
				),

				getCurrentSessionName: Effect.fn(
					'Tmux.getCurrentSessionName.svc'
				)(() => provide(getCurrentSessionName())),
				getCurrentSessionId: Effect.fn('Tmux.getCurrentSessionId.svc')(
					() => provide(getCurrentSessionId())
				),
				renameSession: Effect.fn('Tmux.renameSession')(
					(target: string, newName: string) =>
						provide(renameSession(target, newName))
				),

				// Options
				showOption: Effect.fn('Tmux.showOption')(
					(target: string, option: string) =>
						provide(showOption(target, option))
				),
				setOption: Effect.fn('Tmux.setOption')(
					(target: string, option: string, value: string) =>
						provide(setOption(target, option, value))
				),

				// Config
				sourceFile: Effect.fn('Tmux.sourceFile')((path: string) =>
					provide(sourceFile(path))
				)
			};
		})
	}
) {
	static readonly layer = Layer.effect(this, this.make);
}

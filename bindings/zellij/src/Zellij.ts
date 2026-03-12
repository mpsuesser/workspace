import * as BunServices from '@effect/platform-bun/BunServices';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import type { PlatformError } from 'effect/PlatformError';
import * as ServiceMap from 'effect/ServiceMap';
import * as ChildProcess from 'effect/unstable/process/ChildProcess';
import * as ChildProcessSpawner from 'effect/unstable/process/ChildProcessSpawner';
import * as PaneLocation from './schemas/PaneLocation.ts';
import * as ZellijSession from './ZellijSession.ts';

export { PaneLocation };
export type { NewSessionOptions } from './ZellijSession.ts';

// ---------------------------------------------------------------------------
// Interfaces inlined from internal/commands.ts
// ---------------------------------------------------------------------------

export interface RunOptions {
	readonly location?: PaneLocation.PaneLocation;
	readonly cwd?: string;
	readonly name?: string;
	readonly closeOnExit?: boolean;
	readonly startSuspended?: boolean;
}

export interface SwitchSessionOptions {
	readonly layout?: string;
	readonly cwd?: string;
}

export interface ZellijClient {
	readonly clientId: number;
	readonly paneId: string;
	readonly runningCommand: string | null;
}

// ---------------------------------------------------------------------------
// Command implementations (previously internal/commands.ts)
// ---------------------------------------------------------------------------

const listSessions = Effect.gen(function* () {
	const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
	return yield* spawner.lines(
		ChildProcess.make(
			'zellij',
			[
				'list-sessions'
			],
			{
				shell: true
			}
		)
	);
});

const getActiveSessionName = Effect.gen(function* () {
	const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
	const result = yield* spawner
		.string(
			ChildProcess.make(
				'echo',
				[
					'$ZELLIJ_SESSION_NAME'
				],
				{
					shell: true
				}
			)
		)
		.pipe(
			Effect.map((s) => s.trim()),
			Effect.catchTag('PlatformError', () => Effect.succeed(''))
		);
	return result === '' ? Option.none() : Option.some(result);
});

const isInSession = Effect.gen(function* () {
	const session = yield* getActiveSessionName;
	return Option.isSome(session);
});

const editFile = (filepath: string, location: PaneLocation.PaneLocation) =>
	Effect.gen(function* () {
		const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
		const args = PaneLocation.toArgs(location);
		const cmd = ChildProcess.make('zellij', [
			'edit',
			...args,
			filepath
		]);
		return yield* spawner.exitCode(cmd);
	});

const runCommand = (
	command: ReadonlyArray<string>,
	location: PaneLocation.PaneLocation
) =>
	Effect.gen(function* () {
		const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
		const args: string[] = [
			'run',
			...PaneLocation.toArgs(location)
		];
		args.push('--', ...command);
		const cmd = ChildProcess.make('zellij', args);
		return yield* spawner.exitCode(cmd);
	});

const run = (command: ReadonlyArray<string>, options?: RunOptions) =>
	Effect.gen(function* () {
		const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
		const args: string[] = [
			'run'
		];

		if (options?.location) {
			args.push(...PaneLocation.toArgs(options.location));
		}
		if (options?.cwd) args.push('--cwd', options.cwd);
		if (options?.name) args.push('-n', options.name);
		if (options?.closeOnExit) args.push('-c');
		if (options?.startSuspended) args.push('-s');

		args.push('--', ...command);

		const cmd = ChildProcess.make('zellij', args);
		return yield* spawner.exitCode(cmd);
	});

const newPane = (location: PaneLocation.PaneLocation) =>
	Effect.gen(function* () {
		const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
		const args: string[] = [
			'action',
			'new-pane',
			...PaneLocation.toArgs(location)
		];
		const cmd = ChildProcess.make('zellij', args);
		return yield* spawner.exitCode(cmd);
	});

const closePane = Effect.gen(function* () {
	const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
	const cmd = ChildProcess.make('zellij', [
		'action',
		'close-pane'
	]);
	return yield* spawner.exitCode(cmd);
});

const focusNextPane = Effect.gen(function* () {
	const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
	const cmd = ChildProcess.make('zellij', [
		'action',
		'focus-next-pane'
	]);
	return yield* spawner.exitCode(cmd);
});

const focusPreviousPane = Effect.gen(function* () {
	const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
	const cmd = ChildProcess.make('zellij', [
		'action',
		'focus-previous-pane'
	]);
	return yield* spawner.exitCode(cmd);
});

const newTab = (name?: string) =>
	Effect.gen(function* () {
		const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
		const args = name
			? [
					'action',
					'new-tab',
					'-n',
					name
				]
			: [
					'action',
					'new-tab'
				];
		const cmd = ChildProcess.make('zellij', args);
		return yield* spawner.exitCode(cmd);
	});

const closeTab = Effect.gen(function* () {
	const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
	const cmd = ChildProcess.make('zellij', [
		'action',
		'close-tab'
	]);
	return yield* spawner.exitCode(cmd);
});

const goToNextTab = Effect.gen(function* () {
	const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
	const cmd = ChildProcess.make('zellij', [
		'action',
		'go-to-next-tab'
	]);
	return yield* spawner.exitCode(cmd);
});

const goToPreviousTab = Effect.gen(function* () {
	const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
	const cmd = ChildProcess.make('zellij', [
		'action',
		'go-to-previous-tab'
	]);
	return yield* spawner.exitCode(cmd);
});

const renameTab = (name: string) =>
	Effect.gen(function* () {
		const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
		const cmd = ChildProcess.make('zellij', [
			'action',
			'rename-tab',
			name
		]);
		return yield* spawner.exitCode(cmd);
	});

const goToTab = (index: number) =>
	Effect.gen(function* () {
		const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
		const cmd = ChildProcess.make('zellij', [
			'action',
			'go-to-tab',
			String(index)
		]);
		return yield* spawner.exitCode(cmd);
	});

const toggleFloatingPanes = Effect.gen(function* () {
	const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
	const cmd = ChildProcess.make('zellij', [
		'action',
		'toggle-floating-panes'
	]);
	return yield* spawner.exitCode(cmd);
});

const toggleFullscreen = Effect.gen(function* () {
	const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
	const cmd = ChildProcess.make('zellij', [
		'action',
		'toggle-fullscreen'
	]);
	return yield* spawner.exitCode(cmd);
});

const writeChars = (chars: string) =>
	Effect.gen(function* () {
		const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
		const cmd = ChildProcess.make('zellij', [
			'action',
			'write-chars',
			chars
		]);
		return yield* spawner.exitCode(cmd);
	});

const queryTabNames = Effect.gen(function* () {
	const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
	const cmd = ChildProcess.make('zellij', [
		'action',
		'query-tab-names'
	]);
	return yield* spawner.lines(cmd);
});

const dumpLayout = Effect.gen(function* () {
	const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
	const cmd = ChildProcess.make('zellij', [
		'action',
		'dump-layout'
	]);
	return yield* spawner.string(cmd);
});

const dumpScreen = (path: string) =>
	Effect.gen(function* () {
		const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
		const cmd = ChildProcess.make('zellij', [
			'action',
			'dump-screen',
			path
		]);
		return yield* spawner.exitCode(cmd);
	});

const launchSessionManager = Effect.gen(function* () {
	const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
	const cmd = ChildProcess.make('zellij', [
		'action',
		'launch-plugin',
		'zellij:session-manager',
		'--floating'
	]);
	return yield* spawner.exitCode(cmd);
});

const switchSession = (name: string, _options?: SwitchSessionOptions) =>
	Effect.gen(function* () {
		const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;

		const cmd = ChildProcess.make('zellij', [
			'action',
			'pipe',
			'--plugin',
			'https://github.com/mostafaqanbaryan/zellij-switch/releases/latest/download/zellij-switch.wasm',
			'--name',
			'switch',
			'--',
			name
		]);
		return yield* spawner.exitCode(cmd);
	});

const listClients = Effect.gen(function* () {
	const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
	const cmd = ChildProcess.make('zellij', [
		'action',
		'list-clients'
	]);
	const output = yield* spawner.string(cmd);

	const lines = output.trim().split('\n').slice(1);
	return lines.map((line) => {
		const parts = line.trim().split(/\s+/);
		return {
			clientId: parseInt(parts[0] ?? '0', 10),
			paneId: parts[1] ?? '',
			runningCommand: parts.slice(2).join(' ') || null
		} as ZellijClient;
	});
});

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export class Zellij extends ServiceMap.Service<Zellij>()(
	'@workspace/zellij-binding/Zellij',
	{
		make: Effect.gen(function* () {
			const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;

			const provideExecutor = <A, E>(
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

			return {
				newSession: Effect.fn('Zellij.newSession')(
					(
						name: string,
						options?: ZellijSession.NewSessionOptions
					): Effect.Effect<number, PlatformError> =>
						provideExecutor(ZellijSession.newSession(name, options))
				),
				attach: Effect.fn('Zellij.attach')(
					(
						name: string,
						options?: {
							readonly createIfMissing?: boolean;
						}
					): Effect.Effect<number, PlatformError> =>
						provideExecutor(ZellijSession.attach(name, options))
				),
				killSession: Effect.fn('Zellij.killSession')(
					(name: string): Effect.Effect<number, PlatformError> =>
						provideExecutor(ZellijSession.killSession(name))
				),
				deleteSession: Effect.fn('Zellij.deleteSession')(
					(name: string): Effect.Effect<number, PlatformError> =>
						provideExecutor(ZellijSession.deleteSession(name))
				),
				listSessions: Effect.fn('Zellij.listSessions')(
					(): Effect.Effect<ReadonlyArray<string>, PlatformError> =>
						provideExecutor(listSessions)
				),
				getActiveSessionName: Effect.fn('Zellij.getActiveSessionName')(
					(): Effect.Effect<Option.Option<string>, PlatformError> =>
						provideExecutor(getActiveSessionName)
				),
				isInSession: Effect.fn('Zellij.isInSession')(
					(): Effect.Effect<boolean, PlatformError> =>
						provideExecutor(isInSession)
				),
				editFile: Effect.fn('Zellij.editFile')(
					(
						filepath: string,
						location: PaneLocation.PaneLocation
					): Effect.Effect<number, PlatformError> =>
						provideExecutor(editFile(filepath, location))
				),
				runCommand: Effect.fn('Zellij.runCommand')(
					(
						command: ReadonlyArray<string>,
						location: PaneLocation.PaneLocation
					): Effect.Effect<number, PlatformError> =>
						provideExecutor(runCommand(command, location))
				),
				run: Effect.fn('Zellij.run')(
					(
						command: ReadonlyArray<string>,
						options?: RunOptions
					): Effect.Effect<number, PlatformError> =>
						provideExecutor(run(command, options))
				),
				newPane: Effect.fn('Zellij.newPane')(
					(
						location: PaneLocation.PaneLocation
					): Effect.Effect<number, PlatformError> =>
						provideExecutor(newPane(location))
				),
				closePane: Effect.fn('Zellij.closePane')(
					(): Effect.Effect<number, PlatformError> =>
						provideExecutor(closePane)
				),
				focusNextPane: Effect.fn('Zellij.focusNextPane')(
					(): Effect.Effect<number, PlatformError> =>
						provideExecutor(focusNextPane)
				),
				focusPreviousPane: Effect.fn('Zellij.focusPreviousPane')(
					(): Effect.Effect<number, PlatformError> =>
						provideExecutor(focusPreviousPane)
				),
				newTab: Effect.fn('Zellij.newTab')(
					(name?: string): Effect.Effect<number, PlatformError> =>
						provideExecutor(newTab(name))
				),
				closeTab: Effect.fn('Zellij.closeTab')(
					(): Effect.Effect<number, PlatformError> =>
						provideExecutor(closeTab)
				),
				goToNextTab: Effect.fn('Zellij.goToNextTab')(
					(): Effect.Effect<number, PlatformError> =>
						provideExecutor(goToNextTab)
				),
				goToPreviousTab: Effect.fn('Zellij.goToPreviousTab')(
					(): Effect.Effect<number, PlatformError> =>
						provideExecutor(goToPreviousTab)
				),
				renameTab: Effect.fn('Zellij.renameTab')(
					(name: string): Effect.Effect<number, PlatformError> =>
						provideExecutor(renameTab(name))
				),
				goToTab: Effect.fn('Zellij.goToTab')(
					(index: number): Effect.Effect<number, PlatformError> =>
						provideExecutor(goToTab(index))
				),
				toggleFloatingPanes: Effect.fn('Zellij.toggleFloatingPanes')(
					(): Effect.Effect<number, PlatformError> =>
						provideExecutor(toggleFloatingPanes)
				),
				toggleFullscreen: Effect.fn('Zellij.toggleFullscreen')(
					(): Effect.Effect<number, PlatformError> =>
						provideExecutor(toggleFullscreen)
				),
				writeChars: Effect.fn('Zellij.writeChars')(
					(chars: string): Effect.Effect<number, PlatformError> =>
						provideExecutor(writeChars(chars))
				),
				queryTabNames: Effect.fn('Zellij.queryTabNames')(
					(): Effect.Effect<ReadonlyArray<string>, PlatformError> =>
						provideExecutor(queryTabNames)
				),
				dumpLayout: Effect.fn('Zellij.dumpLayout')(
					(): Effect.Effect<string, PlatformError> =>
						provideExecutor(dumpLayout)
				),
				dumpScreen: Effect.fn('Zellij.dumpScreen')(
					(path: string): Effect.Effect<number, PlatformError> =>
						provideExecutor(dumpScreen(path))
				),
				listClients: Effect.fn('Zellij.listClients')(
					(): Effect.Effect<
						ReadonlyArray<ZellijClient>,
						PlatformError
					> => provideExecutor(listClients)
				),
				launchSessionManager: Effect.fn('Zellij.launchSessionManager')(
					(): Effect.Effect<number, PlatformError> =>
						provideExecutor(launchSessionManager)
				),
				switchSession: Effect.fn('Zellij.switchSession')(
					(
						name: string,
						options?: SwitchSessionOptions
					): Effect.Effect<number, PlatformError> =>
						provideExecutor(switchSession(name, options))
				)
			};
		})
	}
) {
	static readonly layer = Layer.effect(this, this.make).pipe(
		Layer.provide(BunServices.layer)
	);
}

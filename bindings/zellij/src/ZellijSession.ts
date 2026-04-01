import * as Effect from 'effect/Effect';
import * as ChildProcess from 'effect/unstable/process/ChildProcess';
import * as ChildProcessSpawner from 'effect/unstable/process/ChildProcessSpawner';

export interface NewSessionOptions {
	readonly layout?: string;
	readonly cwd?: string;
}

export const newSession = Effect.fn('ZellijSession.newSession')(
	(sessionName: string, options?: NewSessionOptions) =>
		Effect.gen(function* () {
			const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
			const args: string[] = ['-s', sessionName];

			if (options?.layout) {
				args.push('--new-session-with-layout', options.layout);
			}
			if (options?.cwd) {
				args.push('--cwd', options.cwd);
			}

			const cmd = ChildProcess.make('zellij', args, {
				stdin: 'inherit',
				stdout: 'inherit',
				stderr: 'inherit'
			});
			return yield* spawner.exitCode(cmd);
		})
);

export const attach = Effect.fn('ZellijSession.attach')(
	(
		sessionName: string,
		options?: {
			readonly createIfMissing?: boolean;
		}
	) =>
		Effect.gen(function* () {
			const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
			const args = options?.createIfMissing
				? ['attach', '-c', sessionName]
				: ['attach', sessionName];

			const cmd = ChildProcess.make('zellij', args, {
				stdin: 'inherit',
				stdout: 'inherit',
				stderr: 'inherit'
			});
			return yield* spawner.exitCode(cmd);
		})
);

export const killSession = Effect.fn('ZellijSession.killSession')(
	(name: string) =>
		Effect.gen(function* () {
			const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
			const cmd = ChildProcess.make('zellij', ['kill-session', name]);
			return yield* spawner.exitCode(cmd);
		})
);

export const killAllSessions = Effect.fn('ZellijSession.killAllSessions')(() =>
	Effect.gen(function* () {
		const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
		const cmd = ChildProcess.make('zellij', ['kill-all-sessions', '-y']);
		return yield* spawner.exitCode(cmd);
	})
);

export const deleteSession = Effect.fn('ZellijSession.deleteSession')(
	(name: string) =>
		Effect.gen(function* () {
			const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
			const cmd = ChildProcess.make('zellij', ['delete-session', name]);
			return yield* spawner.exitCode(cmd);
		})
);

export const deleteAllSessions = Effect.fn('ZellijSession.deleteAllSessions')(
	() =>
		Effect.gen(function* () {
			const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
			const cmd = ChildProcess.make('zellij', [
				'delete-all-sessions',
				'-y'
			]);
			return yield* spawner.exitCode(cmd);
		})
);

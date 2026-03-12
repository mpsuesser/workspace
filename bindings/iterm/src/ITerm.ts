import * as BunServices from '@effect/platform-bun/BunServices';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import type { PlatformError } from 'effect/PlatformError';
import * as ServiceMap from 'effect/ServiceMap';
import * as ChildProcess from 'effect/unstable/process/ChildProcess';
import * as ChildProcessSpawner from 'effect/unstable/process/ChildProcessSpawner';

const osascriptArgs = (...statements: string[]) =>
	statements.flatMap((statement) => [
		'-e',
		statement
	]);

const runScriptVoid = (...statements: string[]) =>
	Effect.gen(function* () {
		const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
		const command = ChildProcess.make(
			'osascript',
			osascriptArgs(...statements)
		);
		yield* spawner.exitCode(command);
	});

const runScriptString = (...statements: string[]) =>
	Effect.gen(function* () {
		const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
		const command = ChildProcess.make(
			'osascript',
			osascriptArgs(...statements)
		);
		return yield* spawner.string(command).pipe(
			Effect.map((s) => Option.some(s.trim())),
			Effect.catchTag('PlatformError', () =>
				Effect.succeed(Option.none())
			)
		);
	});

const getTabTitle = Effect.gen(function* () {
	const result = yield* runScriptString(
		'tell application "iTerm2"',
		'tell current session of current tab of current window',
		'return name',
		'end tell',
		'end tell'
	);
	return Option.getOrElse(result, () => '');
});

const setTabTitle = (title: string) =>
	Effect.gen(function* () {
		const escaped = title.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
		yield* runScriptVoid(
			'tell application "iTerm2"',
			'tell current session of current tab of current window',
			`set name to "${escaped}"`,
			'end tell',
			'end tell'
		);
	});

export class ITerm extends ServiceMap.Service<ITerm>()(
	'@multitude/binding-iterm-core/ITerm',
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
				getTabTitle: Effect.fn('ITerm.getTabTitle')(
					(): Effect.Effect<string, PlatformError> =>
						provideExecutor(getTabTitle)
				),
				setTabTitle: Effect.fn('ITerm.setTabTitle')(
					(title: string): Effect.Effect<void, PlatformError> =>
						provideExecutor(setTabTitle(title))
				)
			};
		})
	}
) {
	static readonly layer = Layer.effect(this, this.make).pipe(
		Layer.provide(BunServices.layer)
	);
}

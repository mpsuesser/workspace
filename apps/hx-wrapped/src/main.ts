// hx-wrapped
//
// A wrapper around the Helix editor that injects per-mode theme
// environment variables and ensures clean child process teardown.
// ---

import { BunServices } from '@effect/platform-bun';
import * as Effect from 'effect/Effect';
import { ChildProcess } from 'effect/unstable/process';

const args = Bun.argv.slice(2);

const command = ChildProcess.make('hx', args, {
	env: {
		HX_MODETHEME_NORMAL: 'rose_pine',
		HX_MODETHEME_INSERT: 'beans',
		HX_MODETHEME_SELECT: 'github_dark_high_contrast'
	},
	extendEnv: true,
	stdin: 'inherit',
	stdout: 'inherit',
	stderr: 'inherit'
});

const program = Effect.gen(function* () {
	const handle = yield* command;
	yield* Effect.addFinalizer(() => handle.kill().pipe(Effect.ignore));
	const exitCode = yield* handle.exitCode;
	return exitCode;
}).pipe(Effect.scoped, Effect.provide(BunServices.layer));

Effect.runPromise(program);

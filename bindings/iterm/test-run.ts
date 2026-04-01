import * as BunServices from '@effect/platform-bun/BunServices';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';

import { ITerm } from './src/index.ts';

const program = Effect.gen(function* () {
	const iterm = yield* ITerm;

	const title = yield* iterm.getTabTitle();
	yield* Effect.logInfo(`Current title: ${title}`);

	yield* iterm.setTabTitle('My Custom Title');

	const newTitle = yield* iterm.getTabTitle();
	yield* Effect.logInfo(`New title: ${newTitle}`);
});

const runnable = program.pipe(
	Effect.provide(Layer.provide(ITerm.layer, BunServices.layer))
);

void Effect.runPromise(runnable);

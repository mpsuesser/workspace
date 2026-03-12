import * as Effect from 'effect/Effect';
import { ITerm } from './src/index.ts';

const program = Effect.gen(function* () {
	const iterm = yield* ITerm;

	const title = yield* iterm.getTabTitle;
	console.log('Current title:', title);

	yield* iterm.setTabTitle('My Custom Title');

	const newTitle = yield* iterm.getTabTitle;
	console.log('New title:', newTitle);
});

Effect.runPromise(program.pipe(Effect.provide(ITerm.layer)));

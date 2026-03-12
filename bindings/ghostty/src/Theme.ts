import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import * as Schema from 'effect/Schema';
import * as ServiceMap from 'effect/ServiceMap';
import { Ghostty } from './Ghostty.ts';
import type { GhosttyCliError } from './GhosttyError.ts';

export class Theme extends Schema.Class<Theme>('Theme')({
	name: Schema.String,
	isBuiltIn: Schema.Boolean,
	path: Schema.OptionFromUndefinedOr(Schema.String)
}) {}

export const ThemeConfig = Schema.Union([
	Schema.Struct({
		type: Schema.Literal('simple'),
		theme: Schema.String
	}),
	Schema.Struct({
		type: Schema.Literal('adaptive'),
		light: Schema.String,
		dark: Schema.String
	})
]);
export type ThemeConfig = typeof ThemeConfig.Type;

const adaptivePattern =
	/^(?:dark:([^,]+),light:([^,]+)|light:([^,]+),dark:([^,]+))$/;

const parseConfig = (config: string): Option.Option<ThemeConfig> => {
	const match = adaptivePattern.exec(config);
	if (match) {
		const dark = match[1] ?? match[4];
		const light = match[2] ?? match[3];
		if (dark && light) {
			return Option.some({
				type: 'adaptive' as const,
				dark,
				light
			});
		}
	}
	if (config.length > 0 && !config.includes(':') && !config.includes(',')) {
		return Option.some({
			type: 'simple' as const,
			theme: config
		});
	}
	return Option.none();
};

const formatConfig = (config: ThemeConfig): string => {
	switch (config.type) {
		case 'simple':
			return config.theme;
		case 'adaptive':
			return `dark:${config.dark},light:${config.light}`;
	}
};

export class GhosttyTheme extends ServiceMap.Service<GhosttyTheme>()(
	'@multitude/binding-ghostty-core/GhosttyTheme',
	{
		make: Effect.gen(function* () {
			const ghostty = yield* Ghostty;
			return {
				list: Effect.fn('GhosttyTheme.list')(() =>
					ghostty.listThemes()
				),
				parseConfig,
				formatConfig
			};
		})
	}
) {
	static readonly layer = Layer.effect(this, this.make).pipe(
		Layer.provide(Ghostty.layer)
	);
}

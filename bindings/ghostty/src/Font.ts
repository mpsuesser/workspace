import * as Array from 'effect/Array';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Schema from 'effect/Schema';
import * as ServiceMap from 'effect/ServiceMap';
import * as String from 'effect/String';
import { type FontInfo, Ghostty } from './Ghostty.ts';
import type { GhosttyCliError } from './GhosttyError.ts';

export type { FontInfo } from './Ghostty.ts';

export class FontConfig extends Schema.Class<FontConfig>('FontConfig')({
	family: Schema.String,
	familyBold: Schema.OptionFromUndefinedOr(Schema.String),
	familyItalic: Schema.OptionFromUndefinedOr(Schema.String),
	familyBoldItalic: Schema.OptionFromUndefinedOr(Schema.String),
	size: Schema.OptionFromUndefinedOr(Schema.Number)
}) {}

export class GhosttyFont extends ServiceMap.Service<GhosttyFont>()(
	'@multitude/binding-ghostty-core/GhosttyFont',
	{
		make: Effect.gen(function* () {
			const ghostty = yield* Ghostty;

			return {
				list: Effect.fn('GhosttyFont.list')(() => ghostty.listFonts()),
				listFamilies: Effect.fn('GhosttyFont.listFamilies')(
					function* () {
						const fonts = yield* ghostty.listFonts();
						return Array.dedupe(
							Array.sort(
								Array.map(fonts, (f) => f.family),
								String.Order
							)
						);
					}
				),
				findByFamily: Effect.fn('GhosttyFont.findByFamily')(function* (
					family: string
				) {
					const fonts = yield* ghostty.listFonts();
					const lowerFamily = family.toLowerCase();
					return Array.filter(fonts, (f) =>
						f.family.toLowerCase().includes(lowerFamily)
					);
				}),
				hasFamily: Effect.fn('GhosttyFont.hasFamily')(function* (
					family: string
				) {
					const fonts = yield* ghostty.listFonts();
					const lowerFamily = family.toLowerCase();
					return Array.some(
						fonts,
						(f) => f.family.toLowerCase() === lowerFamily
					);
				})
			};
		})
	}
) {
	static readonly layer = Layer.effect(this, this.make).pipe(
		Layer.provide(Ghostty.layer)
	);
}

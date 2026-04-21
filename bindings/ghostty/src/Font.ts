import * as Arr from 'effect/Array';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Schema from 'effect/Schema';
import * as Str from 'effect/String';

import { Ghostty, type FontInfo } from './Ghostty.ts';

export type { FontInfo } from './Ghostty.ts';

export class FontConfig extends Schema.Class<FontConfig>('FontConfig')({
	family: Schema.String,
	familyBold: Schema.OptionFromUndefinedOr(Schema.String),
	familyItalic: Schema.OptionFromUndefinedOr(Schema.String),
	familyBoldItalic: Schema.OptionFromUndefinedOr(Schema.String),
	size: Schema.OptionFromUndefinedOr(Schema.Number)
}) {}

export class GhosttyFont extends Context.Service<GhosttyFont>()(
	'@workspace/ghostty-binding/GhosttyFont',
	{
		make: Effect.gen(function* () {
			const ghostty = yield* Ghostty;

			return {
				list: Effect.fn('GhosttyFont.list')(() => ghostty.listFonts()),
				listFamilies: Effect.fn('GhosttyFont.listFamilies')(
					function* () {
						const fonts = yield* ghostty.listFonts();
						return Arr.dedupe(
							Arr.sort(
								Arr.map(fonts, (f) => f.family),
								Str.Order
							)
						);
					}
				),
				findByFamily: Effect.fn('GhosttyFont.findByFamily')(function* (
					family: string
				) {
					const fonts = yield* ghostty.listFonts();
					const lowerFamily = family.toLowerCase();
					return Arr.filter(
						fonts,
						(f) => f.family.toLowerCase().includes(lowerFamily)
					);
				}),
				hasFamily: Effect.fn('GhosttyFont.hasFamily')(function* (
					family: string
				) {
					const fonts = yield* ghostty.listFonts();
					const lowerFamily = family.toLowerCase();
					return Arr.some(
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

import * as Option from 'effect/Option';
import * as Schema from 'effect/Schema';

export const PaneLocation = Schema.TaggedUnion({
	Direction: {
		direction: Schema.Literals(['right', 'down', 'left', 'up']),
	},
	Floating: {
		width: Schema.OptionFromUndefinedOr(Schema.String),
		height: Schema.OptionFromUndefinedOr(Schema.String),
		x: Schema.OptionFromUndefinedOr(Schema.String),
		y: Schema.OptionFromUndefinedOr(Schema.String),
		pinned: Schema.OptionFromUndefinedOr(Schema.Boolean),
	},
	InPlace: {},
});

export type PaneLocation = typeof PaneLocation.Type;

export const toArgs: (location: PaneLocation) => ReadonlyArray<string> =
	PaneLocation.match({
		Direction: ({ direction }) => ['-d', direction],
		Floating: ({ width, height, x, y, pinned }) =>
		{
			const args: Array<string> = ['-f'];
			if (Option.isSome(width)) args.push('--width', width.value);
			if (Option.isSome(height)) args.push('--height', height.value);
			if (Option.isSome(x)) args.push('--x', x.value);
			if (Option.isSome(y)) args.push('--y', y.value);
			if (Option.isSome(pinned) && pinned.value)
				args.push('--pinned', 'true');
			return args;
		},
		InPlace: () => ['-i'],
	});

export const right = PaneLocation.cases.Direction.make({
	direction: 'right',
});
export const down = PaneLocation.cases.Direction.make({
	direction: 'down',
});
export const left = PaneLocation.cases.Direction.make({
	direction: 'left',
});
export const up = PaneLocation.cases.Direction.make({
	direction: 'up',
});
export const floating = (
	opts?: Partial<{
		readonly width: string;
		readonly height: string;
		readonly x: string;
		readonly y: string;
		readonly pinned: boolean;
	}>,
) => PaneLocation.cases.Floating.make({
	width: Option.fromNullishOr(opts?.width),
	height: Option.fromNullishOr(opts?.height),
	x: Option.fromNullishOr(opts?.x),
	y: Option.fromNullishOr(opts?.y),
	pinned: Option.fromNullishOr(opts?.pinned),
});
export const inPlace = PaneLocation.cases.InPlace.make({});

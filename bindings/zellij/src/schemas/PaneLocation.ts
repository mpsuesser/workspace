import * as Data from 'effect/Data';

export type PaneLocation = Data.TaggedEnum<{
	Direction: {
		readonly direction: 'right' | 'down' | 'left' | 'up';
	};
	Floating: {
		readonly width: string | undefined;
		readonly height: string | undefined;
		readonly x: string | undefined;
		readonly y: string | undefined;
		readonly pinned: boolean | undefined;
	};
	InPlace: {};
}>;

export const PaneLocation = Data.taggedEnum<PaneLocation>();

export const toArgs = (location: PaneLocation): ReadonlyArray<string> =>
	PaneLocation.$match(location, {
		Direction: ({ direction }) => [
			'-d',
			direction
		],
		Floating: ({ width, height, x, y, pinned }) => {
			const args: Array<string> = [
				'-f'
			];
			if (width) args.push('--width', width);
			if (height) args.push('--height', height);
			if (x) args.push('--x', x);
			if (y) args.push('--y', y);
			if (pinned) args.push('--pinned', 'true');
			return args;
		},
		InPlace: () => [
			'-i'
		]
	});

export const right = PaneLocation.Direction({
	direction: 'right'
});
export const down = PaneLocation.Direction({
	direction: 'down'
});
export const left = PaneLocation.Direction({
	direction: 'left'
});
export const up = PaneLocation.Direction({
	direction: 'up'
});
export const floating = (
	opts?: Partial<
		Omit<Data.TaggedEnum.Value<PaneLocation, 'Floating'>, '_tag'>
	>
) =>
	PaneLocation.Floating({
		width: opts?.width ?? undefined,
		height: opts?.height ?? undefined,
		x: opts?.x ?? undefined,
		y: opts?.y ?? undefined,
		pinned: opts?.pinned ?? undefined
	});
export const inPlace = PaneLocation.InPlace();

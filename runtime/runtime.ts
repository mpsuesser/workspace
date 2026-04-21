import * as BunServices from '@effect/platform-bun/BunServices';
import { Hammerspoon } from '@workspace/hammerspoon-binding';
import { Helix } from '@workspace/helix-binding';
import { ITerm } from '@workspace/iterm-binding';
import { Tmux } from '@workspace/tmux-binding';
import * as Layer from 'effect/Layer';
import * as ManagedRuntime from 'effect/ManagedRuntime';

const HammerspoonLayer = Hammerspoon.layer;
const HelixLayer = Helix.layer;
const ITermLayer = ITerm.layer;
const TmuxLayer = Tmux.layer;

export const WorkspaceRuntimeLayer = Layer.mergeAll(
	HammerspoonLayer,
	HelixLayer,
	ITermLayer,
	TmuxLayer
).pipe(Layer.provideMerge(BunServices.layer), Layer.orDie);

export type WorkspaceRuntimeServices = Layer.Success<
	typeof WorkspaceRuntimeLayer
>;

export const WorkspaceRuntime = ManagedRuntime.make(WorkspaceRuntimeLayer);

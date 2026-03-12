import * as BunServices from '@effect/platform-bun/BunServices';
import { Ghostty } from '@workspace/ghostty-binding';
import { Hammerspoon } from '@workspace/hammerspoon-binding';
import { Helix } from '@workspace/helix-binding';
import { ITerm } from '@workspace/iterm-binding';
import { Presenterm } from '@workspace/presenterm-binding';
import { Tmux } from '@workspace/tmux-binding';
import { Zellij } from '@workspace/zellij-binding';
import * as Layer from 'effect/Layer';
import * as ManagedRuntime from 'effect/ManagedRuntime';

const GhosttyLayer = Ghostty.layer;
const HammerspoonLayer = Hammerspoon.layer;
const HelixLayer = Helix.layer;
const ITermLayer = ITerm.layer;
const PresentermLayer = Presenterm.layer;
const TmuxLayer = Tmux.layer;
const ZellijLayer = Zellij.layer;

export const WorkspaceRuntimeLayer = Layer.mergeAll(
	GhosttyLayer,
	HammerspoonLayer,
	HelixLayer,
	ITermLayer,
	PresentermLayer,
	TmuxLayer,
	ZellijLayer
).pipe(Layer.provideMerge(BunServices.layer), Layer.orDie);

export type WorkspaceRuntimeServices = Layer.Success<
	typeof WorkspaceRuntimeLayer
>;

export const WorkspaceRuntime = ManagedRuntime.make(WorkspaceRuntimeLayer);

import * as BunServices from '@effect/platform-bun/BunServices';
import { Ghostty } from '@workspace/ghostty-binding';
import { Hammerspoon } from '@workspace/hammerspoon-binding';
import { Helix } from '@workspace/helix-binding';
import { ITerm } from '@workspace/iterm-binding';
import { Presenterm } from '@workspace/presenterm-binding';
import { Tmux } from '@workspace/tmux-binding';
import * as Zellij from '@workspace/zellij-binding/Zellij';
import * as ZellijCli from '@workspace/zellij-binding/ZellijCli';
import * as ZellijPane from '@workspace/zellij-binding/ZellijPane';
import * as ZellijSession from '@workspace/zellij-binding/ZellijSession';
import * as ZellijTab from '@workspace/zellij-binding/ZellijTab';
import * as Layer from 'effect/Layer';
import * as ManagedRuntime from 'effect/ManagedRuntime';

const GhosttyLayer = Ghostty.layer;
const HammerspoonLayer = Hammerspoon.layer;
const HelixLayer = Helix.layer;
const ITermLayer = ITerm.layer;
const PresentermLayer = Presenterm.layer;
const TmuxLayer = Tmux.layer;

// All four Zellij services share a single ZellijCli runner, so provide it
// once here instead of using each namespace's `defaultLayer` (which would
// still memoize correctly but expresses the sharing less clearly).
const ZellijLayer = Layer.mergeAll(
	Zellij.layer,
	ZellijSession.layer,
	ZellijTab.layer,
	ZellijPane.layer
).pipe(Layer.provide(ZellijCli.layer));

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

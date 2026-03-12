export type { PlatformError } from 'effect/PlatformError';
export {
	Action,
	type AdjustDirection,
	actionToKeybindString,
	type CursorKeyMode,
	type GotoSplitDirection,
	type InspectorMode,
	type ResizeDirection,
	type SplitDirection,
	type WriteFileAction
} from './Action.ts';
export { FontConfig, GhosttyFont } from './Font.ts';
export { type FontInfo, Ghostty, type Keybind } from './Ghostty.ts';
export {
	GhosttyConfig,
	parseConfig,
	serializeConfig
} from './GhosttyConfig.ts';

export {
	GhosttyActionFailed,
	GhosttyCliError,
	GhosttyConfigError,
	type GhosttyError,
	GhosttyNotInstalled,
	GhosttyNotRunning
} from './GhosttyError.ts';
export { GhosttyTheme, Theme, ThemeConfig } from './Theme.ts';

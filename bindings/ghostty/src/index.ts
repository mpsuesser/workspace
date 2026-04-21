export type { PlatformError } from 'effect/PlatformError';
export {
	Action,
	actionToKeybindString,
	type Action as ActionType,
	type AdjustDirection,
	type CursorKeyMode,
	type GotoSplitDirection,
	type InspectorMode,
	type ResizeDirection,
	type SplitDirection,
	type WriteFileAction
} from './Action.ts';
export { FontConfig, GhosttyFont } from './Font.ts';
export { Ghostty, type FontInfo, type Keybind } from './Ghostty.ts';
export {
	GhosttyConfig,
	parseConfig,
	serializeConfig
} from './GhosttyConfig.ts';

export {
	GhosttyActionFailed,
	GhosttyCliError,
	GhosttyConfigError,
	GhosttyNotInstalled,
	GhosttyNotRunning,
	type GhosttyError
} from './GhosttyError.ts';
export { GhosttyTheme, Theme, ThemeConfig } from './Theme.ts';

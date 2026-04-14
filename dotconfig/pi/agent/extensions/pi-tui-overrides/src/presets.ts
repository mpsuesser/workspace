import { DEFAULT_TUI_OVERRIDES_CONFIG, type TuiOverridesConfig } from "./types.js";

export const TUI_OVERRIDES_PRESETS = ["opencode", "balanced", "verbose"] as const;
export type TuiOverridesPreset = (typeof TUI_OVERRIDES_PRESETS)[number];

const TUI_OVERRIDES_PRESET_CONFIGS: Record<TuiOverridesPreset, TuiOverridesConfig> = {
	opencode: {
		...DEFAULT_TUI_OVERRIDES_CONFIG,
		registerToolOverrides: { ...DEFAULT_TUI_OVERRIDES_CONFIG.registerToolOverrides },
	},
	balanced: {
		...DEFAULT_TUI_OVERRIDES_CONFIG,
		registerToolOverrides: { ...DEFAULT_TUI_OVERRIDES_CONFIG.registerToolOverrides },
		readOutputMode: "summary",
		searchOutputMode: "count",
		mcpOutputMode: "summary",
		bashOutputMode: "summary",
	},
	verbose: {
		...DEFAULT_TUI_OVERRIDES_CONFIG,
		registerToolOverrides: { ...DEFAULT_TUI_OVERRIDES_CONFIG.registerToolOverrides },
		readOutputMode: "preview",
		searchOutputMode: "preview",
		mcpOutputMode: "preview",
		bashOutputMode: "preview",
		previewLines: 12,
		bashCollapsedLines: 20,
	},
};

function toolOverrideOwnershipEqual(a: TuiOverridesConfig, b: TuiOverridesConfig): boolean {
	return (
		a.registerToolOverrides.read === b.registerToolOverrides.read &&
		a.registerToolOverrides.grep === b.registerToolOverrides.grep &&
		a.registerToolOverrides.find === b.registerToolOverrides.find &&
		a.registerToolOverrides.ls === b.registerToolOverrides.ls &&
		a.registerToolOverrides.bash === b.registerToolOverrides.bash &&
		a.registerToolOverrides.edit === b.registerToolOverrides.edit &&
		a.registerToolOverrides.write === b.registerToolOverrides.write
	);
}

function configsEqual(a: TuiOverridesConfig, b: TuiOverridesConfig): boolean {
	return (
		toolOverrideOwnershipEqual(a, b) &&
		a.enableNativeUserMessageBox === b.enableNativeUserMessageBox &&
		a.readOutputMode === b.readOutputMode &&
		a.searchOutputMode === b.searchOutputMode &&
		a.mcpOutputMode === b.mcpOutputMode &&
		a.previewLines === b.previewLines &&
		a.expandedPreviewMaxLines === b.expandedPreviewMaxLines &&
		a.bashOutputMode === b.bashOutputMode &&
		a.bashCollapsedLines === b.bashCollapsedLines &&
		a.diffViewMode === b.diffViewMode &&
		a.diffSplitMinWidth === b.diffSplitMinWidth &&
		a.diffCollapsedLines === b.diffCollapsedLines &&
		a.diffWordWrap === b.diffWordWrap &&
		a.showTruncationHints === b.showTruncationHints &&
		a.showRtkCompactionHints === b.showRtkCompactionHints
	);
}

export function getTuiOverridesPresetConfig(preset: TuiOverridesPreset): TuiOverridesConfig {
	const config = TUI_OVERRIDES_PRESET_CONFIGS[preset];
	return {
		...config,
		registerToolOverrides: { ...config.registerToolOverrides },
	};
}

export function detectTuiOverridesPreset(config: TuiOverridesConfig): TuiOverridesPreset | "custom" {
	for (const preset of TUI_OVERRIDES_PRESETS) {
		if (configsEqual(config, TUI_OVERRIDES_PRESET_CONFIGS[preset])) {
			return preset;
		}
	}
	return "custom";
}

export function parseTuiOverridesPreset(raw: string): TuiOverridesPreset | undefined {
	const normalized = raw.trim().toLowerCase();
	if (!normalized) {
		return undefined;
	}
	return TUI_OVERRIDES_PRESETS.find((preset) => preset === normalized);
}

import { existsSync, mkdirSync, readFileSync, renameSync, unlinkSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import {
	BUILT_IN_TOOL_OVERRIDE_NAMES,
	BASH_OUTPUT_MODES,
	DEFAULT_TUI_OVERRIDES_CONFIG,
	type ConfigLoadResult,
	type ConfigSaveResult,
	DIFF_VIEW_MODES,
	MCP_OUTPUT_MODES,
	READ_OUTPUT_MODES,
	SEARCH_OUTPUT_MODES,
	type TuiOverridesConfig,
	type ToolOverrideOwnership,
} from "./types.js";

const CONFIG_DIR = join(homedir(), ".pi", "agent", "extensions", "pi-tui-overrides");
const CONFIG_FILE = join(CONFIG_DIR, "config.json");
const LEGACY_CONFIG_DIR = join(homedir(), ".pi", "agent", "extensions", "pi-tool-display");
const LEGACY_CONFIG_FILE = join(LEGACY_CONFIG_DIR, "config.json");

interface LegacyTuiOverridesConfigSource extends Partial<TuiOverridesConfig> {
	registerReadToolOverride?: unknown;
}

function clampNumber(value: unknown, min: number, max: number, fallback: number): number {
	if (typeof value !== "number" || Number.isNaN(value)) {
		return fallback;
	}
	const rounded = Math.floor(value);
	if (rounded < min) return min;
	if (rounded > max) return max;
	return rounded;
}

function toBoolean(value: unknown, fallback: boolean): boolean {
	return typeof value === "boolean" ? value : fallback;
}

function toRecord(value: unknown): Record<string, unknown> {
	if (!value || typeof value !== "object" || Array.isArray(value)) {
		return {};
	}
	return value as Record<string, unknown>;
}

function toReadOutputMode(value: unknown): TuiOverridesConfig["readOutputMode"] {
	return READ_OUTPUT_MODES.includes(value as TuiOverridesConfig["readOutputMode"])
		? (value as TuiOverridesConfig["readOutputMode"])
		: DEFAULT_TUI_OVERRIDES_CONFIG.readOutputMode;
}

function toSearchOutputMode(value: unknown): TuiOverridesConfig["searchOutputMode"] {
	return SEARCH_OUTPUT_MODES.includes(value as TuiOverridesConfig["searchOutputMode"])
		? (value as TuiOverridesConfig["searchOutputMode"])
		: DEFAULT_TUI_OVERRIDES_CONFIG.searchOutputMode;
}

function toMcpOutputMode(value: unknown): TuiOverridesConfig["mcpOutputMode"] {
	return MCP_OUTPUT_MODES.includes(value as TuiOverridesConfig["mcpOutputMode"])
		? (value as TuiOverridesConfig["mcpOutputMode"])
		: DEFAULT_TUI_OVERRIDES_CONFIG.mcpOutputMode;
}

function toBashOutputMode(value: unknown): TuiOverridesConfig["bashOutputMode"] {
	return BASH_OUTPUT_MODES.includes(value as TuiOverridesConfig["bashOutputMode"])
		? (value as TuiOverridesConfig["bashOutputMode"])
		: DEFAULT_TUI_OVERRIDES_CONFIG.bashOutputMode;
}

function toDiffViewMode(value: unknown): TuiOverridesConfig["diffViewMode"] {
	if (value === "stacked") {
		// Backward compatibility with older config naming.
		return "unified";
	}

	return DIFF_VIEW_MODES.includes(value as TuiOverridesConfig["diffViewMode"])
		? (value as TuiOverridesConfig["diffViewMode"])
		: DEFAULT_TUI_OVERRIDES_CONFIG.diffViewMode;
}

function cloneDefaultConfig(): TuiOverridesConfig {
	return {
		...DEFAULT_TUI_OVERRIDES_CONFIG,
		registerToolOverrides: { ...DEFAULT_TUI_OVERRIDES_CONFIG.registerToolOverrides },
	};
}

function normalizeToolOverrideOwnership(
	rawOverrides: unknown,
	legacyRegisterReadToolOverride: unknown,
): ToolOverrideOwnership {
	const source = toRecord(rawOverrides);
	const defaults = DEFAULT_TUI_OVERRIDES_CONFIG.registerToolOverrides;
	const legacyReadDefault = toBoolean(legacyRegisterReadToolOverride, defaults.read);

	const overrides = { ...defaults };
	for (const toolName of BUILT_IN_TOOL_OVERRIDE_NAMES) {
		const fallback = toolName === "read" ? legacyReadDefault : defaults[toolName];
		overrides[toolName] = toBoolean(source[toolName], fallback);
	}

	return overrides;
}

export function normalizeTuiOverridesConfig(raw: unknown): TuiOverridesConfig {
	const source =
		typeof raw === "object" && raw !== null ? (raw as LegacyTuiOverridesConfigSource) : ({} as LegacyTuiOverridesConfigSource);

	return {
		registerToolOverrides: normalizeToolOverrideOwnership(
			source.registerToolOverrides,
			source.registerReadToolOverride,
		),
		enableNativeUserMessageBox: toBoolean(
			source.enableNativeUserMessageBox,
			DEFAULT_TUI_OVERRIDES_CONFIG.enableNativeUserMessageBox,
		),
		readOutputMode: toReadOutputMode(source.readOutputMode),
		searchOutputMode: toSearchOutputMode(source.searchOutputMode),
		mcpOutputMode: toMcpOutputMode(source.mcpOutputMode),
		previewLines: clampNumber(source.previewLines, 1, 80, DEFAULT_TUI_OVERRIDES_CONFIG.previewLines),
		expandedPreviewMaxLines: clampNumber(
			source.expandedPreviewMaxLines,
			0,
			20_000,
			DEFAULT_TUI_OVERRIDES_CONFIG.expandedPreviewMaxLines,
		),
		bashOutputMode: toBashOutputMode(source.bashOutputMode),
		bashCollapsedLines: clampNumber(source.bashCollapsedLines, 0, 80, DEFAULT_TUI_OVERRIDES_CONFIG.bashCollapsedLines),
		diffViewMode: toDiffViewMode(source.diffViewMode),
		diffSplitMinWidth: clampNumber(source.diffSplitMinWidth, 70, 240, DEFAULT_TUI_OVERRIDES_CONFIG.diffSplitMinWidth),
		diffCollapsedLines: clampNumber(source.diffCollapsedLines, 4, 240, DEFAULT_TUI_OVERRIDES_CONFIG.diffCollapsedLines),
		diffWordWrap: toBoolean(source.diffWordWrap, DEFAULT_TUI_OVERRIDES_CONFIG.diffWordWrap),
		showTruncationHints: toBoolean(source.showTruncationHints, DEFAULT_TUI_OVERRIDES_CONFIG.showTruncationHints),
		showRtkCompactionHints: toBoolean(
			source.showRtkCompactionHints,
			DEFAULT_TUI_OVERRIDES_CONFIG.showRtkCompactionHints,
		),
	};
}

export function loadTuiOverridesConfig(): ConfigLoadResult {
	const configFile = existsSync(CONFIG_FILE)
		? CONFIG_FILE
		: existsSync(LEGACY_CONFIG_FILE)
			? LEGACY_CONFIG_FILE
			: undefined;

	if (!configFile) {
		return { config: cloneDefaultConfig() };
	}

	try {
		const rawText = readFileSync(configFile, "utf-8");
		const rawConfig = JSON.parse(rawText) as unknown;
		return { config: normalizeTuiOverridesConfig(rawConfig) };
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		return {
			config: cloneDefaultConfig(),
			error: `Failed to parse ${configFile}: ${message}`,
		};
	}
}

export function saveTuiOverridesConfig(config: TuiOverridesConfig): ConfigSaveResult {
	const normalized = normalizeTuiOverridesConfig(config);
	const tmpFile = `${CONFIG_FILE}.tmp`;

	try {
		mkdirSync(CONFIG_DIR, { recursive: true });
		writeFileSync(tmpFile, `${JSON.stringify(normalized, null, 2)}\n`, "utf-8");
		renameSync(tmpFile, CONFIG_FILE);
		return { success: true };
	} catch (error) {
		try {
			if (existsSync(tmpFile)) {
				unlinkSync(tmpFile);
			}
		} catch {
			// Ignore cleanup errors.
		}
		const message = error instanceof Error ? error.message : String(error);
		return {
			success: false,
			error: `Failed to save ${CONFIG_FILE}: ${message}`,
		};
	}
}

export function getTuiOverridesConfigPath(): string {
	return CONFIG_FILE;
}

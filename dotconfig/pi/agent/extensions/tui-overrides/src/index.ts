import type {
  ExtensionAPI,
  ExtensionCommandContext,
} from "@mariozechner/pi-coding-agent";
import {
  loadTuiOverridesConfig,
  normalizeTuiOverridesConfig,
  saveTuiOverridesConfig,
} from "./config-store.js";
import {
  applyTuiOverridesCapabilityGuards,
  detectTuiOverridesCapabilities,
  type TuiOverridesCapabilities,
} from "./capabilities.js";
import { registerTuiOverridesCommand } from "./config-modal.js";
import { registerToolRenderingOverrides } from "./tool-overrides.js";
import { registerThinkingLabeling } from "./thinking-label.js";
import registerNativeUserMessageBox from "./user-message-box-native.js";
import {
  BUILT_IN_TOOL_OVERRIDE_NAMES,
  type TuiOverridesConfig,
} from "./types.js";

function ownershipChanged(
  previous: TuiOverridesConfig,
  next: TuiOverridesConfig,
): boolean {
  return BUILT_IN_TOOL_OVERRIDE_NAMES.some(
    (toolName) =>
      previous.registerToolOverrides[toolName] !==
      next.registerToolOverrides[toolName],
  );
}

export default function tuiOverridesExtension(pi: ExtensionAPI): void {
  const initial = loadTuiOverridesConfig();
  let config: TuiOverridesConfig = initial.config;
  let pendingLoadError = initial.error;
  let capabilities: TuiOverridesCapabilities = {
    hasMcpTooling: false,
    hasRtkOptimizer: false,
  };

  const refreshCapabilities = (): void => {
    capabilities = detectTuiOverridesCapabilities(pi, process.cwd());
  };

  const getConfig = (): TuiOverridesConfig => config;
  const getCapabilities = (): TuiOverridesCapabilities => capabilities;
  const getEffectiveConfig = (): TuiOverridesConfig =>
    applyTuiOverridesCapabilityGuards(config, capabilities);

  const setConfig = (
    next: TuiOverridesConfig,
    ctx: ExtensionCommandContext,
  ): void => {
    const normalized = normalizeTuiOverridesConfig(next);
    const requiresReload = ownershipChanged(config, normalized);
    config = normalized;

    const saved = saveTuiOverridesConfig(normalized);
    if (!saved.success && saved.error) {
      ctx.ui.notify(saved.error, "error");
    }

    if (requiresReload) {
      ctx.ui.notify(
        "Tool ownership updates apply after /reload.",
        "warning",
      );
    }
  };

  registerToolRenderingOverrides(pi, getEffectiveConfig);
  registerNativeUserMessageBox(pi, getConfig);
  registerTuiOverridesCommand(pi, { getConfig, setConfig, getCapabilities });
  registerThinkingLabeling(pi);

  pi.on("session_start", async (_event, ctx) => {
    refreshCapabilities();
    if (pendingLoadError) {
      ctx.ui.notify(pendingLoadError, "warning");
      pendingLoadError = undefined;
    }
  });

  pi.on("before_agent_start", async () => {
    refreshCapabilities();
  });
}

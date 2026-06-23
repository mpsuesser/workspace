import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { COMPACT_VCC_INSTRUCTION, getLastCompactionStats } from "../hooks/before-compact";

const formatTokens = (n: number): string => {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
};

export const registerCompactVccCommand = (pi: ExtensionAPI) => {
  pi.registerCommand("compact-vcc", {
    description: "Compact conversation with compact-vcc structured summary",
    handler: async (_args, ctx) => {
      ctx.compact({
        customInstructions: COMPACT_VCC_INSTRUCTION,
        onComplete: () => {
          const stats = getLastCompactionStats();
          if (stats) {
            ctx.ui.notify(
              `Compacted ${stats.summarized} msgs | Kept last ${stats.kept} msgs [~${formatTokens(stats.keptTokensEst)} toks]`,
              "info",
            );
          } else {
            ctx.ui.notify("Compacted with compact-vcc", "info");
          }
        },
        onError: (err) => {
          if (err.message === "Compaction cancelled" || err.message === "Already compacted") {
            ctx.ui.notify("Nothing to compact", "info");
          } else {
            ctx.ui.notify(`Compaction failed: ${err.message}`, "error");
          }
        },
      });
    },
  });
};

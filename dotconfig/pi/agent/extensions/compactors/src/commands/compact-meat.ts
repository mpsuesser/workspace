import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { COMPACT_MEAT_INSTRUCTION, getLastCompactionStats } from "../hooks/before-compact";

const formatTokens = (n: number): string => {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
};

export const registerCompactMeatCommand = (pi: ExtensionAPI) => {
  pi.registerCommand("compact-meat", {
    description: "Compact conversation to user messages + assistant prose only",
    handler: async (_args, ctx) => {
      ctx.compact({
        customInstructions: COMPACT_MEAT_INSTRUCTION,
        onComplete: () => {
          const stats = getLastCompactionStats();
          if (stats) {
            ctx.ui.notify(
              `Compacted ${stats.summarized} msgs | Kept last ${stats.kept} msgs [~${formatTokens(stats.keptTokensEst)} toks]`,
              "info",
            );
          } else {
            ctx.ui.notify("Compacted with compact-meat", "info");
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

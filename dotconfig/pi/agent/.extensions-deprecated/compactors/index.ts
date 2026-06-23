import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { registerBeforeCompactHook } from "./src/hooks/before-compact";
import { registerCompactVccCommand } from "./src/commands/compact-vcc";
import { registerCompactMeatCommand } from "./src/commands/compact-meat";
import { registerCompactVccRecallCommand } from "./src/commands/compact-vcc-recall";
import { registerRecallTool } from "./src/tools/recall";

export default (pi: ExtensionAPI) => {
  registerBeforeCompactHook(pi);
  registerCompactVccCommand(pi);
  registerCompactMeatCommand(pi);
  registerCompactVccRecallCommand(pi);
  registerRecallTool(pi);
};

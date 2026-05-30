import type {
  ExtensionAPI,
  ExtensionCommandContext,
  ExtensionContext,
} from "@mariozechner/pi-coding-agent";
import { CustomEditor } from "@mariozechner/pi-coding-agent";
import { withPickers } from "@elianiva/pi-ckers";
import { dirPicker, filePicker } from "@elianiva/pi-ckers/builtin/fff";
import { CURSOR_MARKER, truncateToWidth, visibleWidth } from "@mariozechner/pi-tui";

const CURSOR_BLOCK_RE = new RegExp(
  `${escapeRegExp(CURSOR_MARKER)}\\x1b\\[7m([\\s\\S]*?)\\x1b\\[0m`,
  "g",
);

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function padToWidth(text: string, width: number): string {
  return text + " ".repeat(Math.max(0, width - visibleWidth(text)));
}

function buildRule(
  width: number,
  borderColor: (text: string) => string,
  leftCorner: string,
  rightCorner: string,
): string {
  if (width <= 1) return borderColor("─".repeat(Math.max(1, width)));
  const innerWidth = Math.max(0, width - 2);
  return borderColor(`${leftCorner}${"─".repeat(innerWidth)}${rightCorner}`);
}

function parseToggle(args: string | undefined, current: boolean): boolean {
  const value = args?.trim().toLowerCase();
  if (!value) return !current;
  if (["on", "enable", "enabled", "true"].includes(value)) return true;
  if (["off", "disable", "disabled", "false"].includes(value)) return false;
  return !current;
}

class BoxedEditor extends CustomEditor {
  constructor(
    tui: ConstructorParameters<typeof CustomEditor>[0],
    editorTheme: ConstructorParameters<typeof CustomEditor>[1],
    keybindings: ConstructorParameters<typeof CustomEditor>[2],
    options?: ConstructorParameters<typeof CustomEditor>[3],
  ) {
    super(tui, editorTheme, keybindings, options);
    // Belt-and-braces enable. The real source of truth is
    // settings.showHardwareCursor in ~/.pi/agent/settings.json — pi's
    // handleReloadCommand resets the TUI cursor flag from that setting AFTER
    // session.reload() resolves (which is where this constructor runs via
    // session_start), so any value set here would otherwise be clobbered on
    // /reload. The settings.json toggle is what actually keeps the cursor on
    // across reloads; this call just covers fresh installs that haven't set it.
    this.tui.setShowHardwareCursor(true);
  }

  private normalizeCursor(line: string): string {
    return line.replace(CURSOR_BLOCK_RE, (_match, cell: string) => CURSOR_MARKER + cell);
  }

  private wrapBodyLine(line: string, width: number): string {
    const innerWidth = Math.max(1, width - 2);
    const clipped = truncateToWidth(this.normalizeCursor(line), innerWidth, "");
    const padded = padToWidth(clipped, innerWidth);
    return `${this.borderColor("│")}${padded}${this.borderColor("│")}`;
  }

  override render(width: number): string[] {
    if (width < 8) return super.render(width);

    const innerWidth = width - 2;
    const baseLines = super.render(innerWidth);
    if (baseLines.length < 2) return baseLines;

    const lines: string[] = [];
    lines.push(buildRule(width, this.borderColor, "╭", "╮"));

    if (this.isShowingAutocomplete()) {
      for (const line of baseLines.slice(1)) {
        lines.push(this.wrapBodyLine(line, width));
      }
      lines.push(buildRule(width, this.borderColor, "╰", "╯"));
      return lines;
    }

    for (const line of baseLines.slice(1, -1)) {
      lines.push(this.wrapBodyLine(line, width));
    }

    lines.push(buildRule(width, this.borderColor, "╰", "╯"));
    return lines;
  }
}

const BoxedEditorWithPickers = withPickers(BoxedEditor as any, [
  filePicker(),
  dirPicker(),
]);

function installEditor(
  ctx: ExtensionContext | ExtensionCommandContext,
  enabled: boolean,
): void {
  if (!ctx.hasUI) return;

  if (!enabled) {
    ctx.ui.setEditorComponent(undefined);
    return;
  }

  ctx.ui.setEditorComponent((tui, editorTheme, keybindings) => {
    return new BoxedEditorWithPickers(tui, editorTheme, keybindings, undefined, ctx);
  });
}

export default function editorExtension(pi: ExtensionAPI): void {
  let enabled = true;

  const apply = (ctx: ExtensionContext | ExtensionCommandContext): void => {
    installEditor(ctx, enabled);
  };

  pi.on("session_start", async (_event, ctx) => {
    apply(ctx);
  });

  const toggle = async (args: string | undefined, ctx: ExtensionCommandContext) => {
    enabled = parseToggle(args, enabled);
    apply(ctx);
    ctx.ui.notify(
      enabled
        ? "Custom boxed editor enabled (@file: / @dir: pickers active)"
        : "Default editor restored",
      "info",
    );
  };

  pi.registerCommand("editor", {
    description: "Toggle the custom boxed editor with @file: and @dir: pickers",
    handler: toggle,
  });

  pi.registerCommand("editor-boxed", {
    description: "Toggle the boxed editor style",
    handler: toggle,
  });
}

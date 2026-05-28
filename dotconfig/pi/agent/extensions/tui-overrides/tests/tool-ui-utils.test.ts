import assert from "node:assert/strict";
import test from "node:test";
import type { MarkdownTheme } from "@mariozechner/pi-tui";
import {
  countWriteContentLines,
  getWriteContentSizeBytes,
  shouldRenderWriteCallSummary,
} from "../src/write-display-utils.ts";
import {
  extractUserMessageMarkdownState,
} from "../src/user-message-box-markdown.ts";
import {
  createUserMessageMarkdownLineRenderer,
  createUserMessageTitleLabelResolver,
  getUserMessageContentWidth,
  patchNativeUserMessagePrototype,
  pickRandomUserLabel,
  shouldBypassUserMessageMarkdownRebuild,
} from "../src/user-message-box-renderer.ts";
import { USER_LABELS } from "../src/constants/USER_LABELS.ts";
import {
  patchUserMessageRenderPrototype,
  type PatchableUserMessagePrototype,
} from "../src/user-message-box-patch.ts";
import {
  addUserMessageVerticalPadding,
  applyUserMessageBackground,
  normalizeUserMessageContentLine,
  normalizeUserMessageContentLines,
} from "../src/user-message-box-utils.ts";
import {
  buildCollapsedDiffHintText,
  clampRenderedLineToWidth,
} from "../src/line-width-safety.ts";

const codePointWidthOps = {
  measure: (text: string): number => [...text].length,
  truncate: (text: string, maxWidth: number): string =>
    [...text].slice(0, Math.max(0, maxWidth)).join(""),
};

const passthrough = (text: string): string => text;

const mockMarkdownTheme = {
  heading: passthrough,
  link: passthrough,
  linkUrl: passthrough,
  code: passthrough,
  codeBlock: passthrough,
  codeBlockBorder: passthrough,
  quote: passthrough,
  quoteBorder: passthrough,
  hr: passthrough,
  listBullet: passthrough,
  bold: passthrough,
  italic: passthrough,
  strikethrough: passthrough,
  underline: passthrough,
} satisfies MarkdownTheme;

test("write call summary moves metrics onto the first line when the result header omits them", () => {
  assert.equal(
    shouldRenderWriteCallSummary({
      hasContent: true,
      hasDetailedResultHeader: false,
    }),
    true,
  );
  assert.equal(
    shouldRenderWriteCallSummary({
      hasContent: true,
      hasDetailedResultHeader: true,
    }),
    false,
  );
  assert.equal(
    shouldRenderWriteCallSummary({
      hasContent: false,
      hasDetailedResultHeader: false,
    }),
    false,
  );
});

test("write content line counting ignores trailing newlines", () => {
  assert.equal(countWriteContentLines("alpha\nbeta\n"), 2);
  assert.equal(countWriteContentLines("alpha\r\nbeta"), 2);
  assert.equal(countWriteContentLines(""), 0);
});

test("write content size uses utf-8 bytes", () => {
  assert.equal(getWriteContentSizeBytes("hello"), 5);
  assert.equal(getWriteContentSizeBytes("é"), 2);
});

test("user message patch reapplies on reload when an older patch version is already present", () => {
  const originalRender = (width: number): string[] => [`original:${width}`];
  const prototype: PatchableUserMessagePrototype = {
    render: (width: number): string[] => [`stale:${width}`],
    __piUserMessageOriginalRender: originalRender,
    __piUserMessageNativePatched: true,
    __piUserMessagePatchVersion: 1,
  };

  patchUserMessageRenderPrototype(prototype, 9, (baseRender) => {
    return function patched(width: number): string[] {
      return [`patched:${baseRender.call(this, width).join("|")}`];
    };
  });

  assert.deepEqual(prototype.render(14), ["patched:original:14"]);
  assert.equal(prototype.__piUserMessagePatchVersion, 9);
  assert.equal(prototype.__piUserMessageNativePatched, true);
});

test("user message markdown extraction removes nested background styling", () => {
  const theme = mockMarkdownTheme;
  const color = (text: string): string => text;
  const extracted = extractUserMessageMarkdownState({
    children: [
      { lines: 1 },
      {
        text: "Hello **WezTerm**",
        theme,
        defaultTextStyle: {
          color,
          bgColor: (text: string): string => text,
          bold: true,
        },
      },
    ],
  });

  assert.equal(extracted?.text, "Hello **WezTerm**");
  assert.equal(extracted?.theme, theme);
  assert.equal(extracted?.defaultTextStyle?.color, color);
  assert.equal(extracted?.defaultTextStyle?.bold, true);
  assert.equal(extracted?.defaultTextStyle?.bgColor, undefined);
});

test("user message markdown renderer reuses cached markdown renders for identical state", () => {
  let rendererCreationCount = 0;
  let renderCallCount = 0;
  const renderMarkdown = createUserMessageMarkdownLineRenderer((state) => {
    rendererCreationCount++;
    return {
      render(width: number): string[] {
        renderCallCount++;
        return [`${state.text}:${width}`];
      },
    };
  });

  const instance = {};
  const theme = mockMarkdownTheme;

  assert.deepEqual(
    renderMarkdown(instance, { text: "cached", theme, defaultTextStyle: { bold: true } }, 24),
    ["cached:24"],
  );
  assert.deepEqual(
    renderMarkdown(instance, { text: "cached", theme, defaultTextStyle: { bold: true } }, 24),
    ["cached:24"],
  );
  assert.equal(rendererCreationCount, 1);
  assert.equal(renderCallCount, 1);

  assert.deepEqual(
    renderMarkdown(instance, { text: "cached", theme, defaultTextStyle: { bold: true } }, 48),
    ["cached:48"],
  );
  assert.equal(rendererCreationCount, 1);
  assert.equal(renderCallCount, 2);

  assert.deepEqual(
    renderMarkdown(instance, { text: "updated", theme, defaultTextStyle: { bold: true } }, 48),
    ["updated:48"],
  );
  assert.equal(rendererCreationCount, 2);
  assert.equal(renderCallCount, 3);
});

test("user message markdown rebuild guard bypasses oversized payloads", () => {
  assert.equal(
    shouldBypassUserMessageMarkdownRebuild({
      text: "short message",
      theme: mockMarkdownTheme,
    }),
    false,
  );
  assert.equal(
    shouldBypassUserMessageMarkdownRebuild({
      text: `${"line\n".repeat(2000)}tail`,
      theme: mockMarkdownTheme,
    }),
    true,
  );
});

test("user message labels list includes the configured notch titles", () => {
  assert.deepEqual(USER_LABELS, ["user", "bottleneck"]);
});

test("user message random label picker uses the provided index picker", () => {
  assert.equal(pickRandomUserLabel(() => 0), "user");
  assert.equal(pickRandomUserLabel(() => 1), "bottleneck");
});

test("user message title label resolver keeps the same random label per message", () => {
  const picks = [1, 0, 1];
  let pickIndexCalls = 0;
  const resolveLabel = createUserMessageTitleLabelResolver(() => {
    const next = picks[pickIndexCalls] ?? 0;
    pickIndexCalls++;
    return next;
  });

  const firstMessage = {};
  const secondMessage = {};

  assert.equal(resolveLabel(firstMessage), "bottleneck");
  assert.equal(resolveLabel(firstMessage), "bottleneck");
  assert.equal(resolveLabel(secondMessage), "user");
  assert.equal(pickIndexCalls, 2);
});

test("user message renderer reserves content width for border and side padding", () => {
  assert.equal(getUserMessageContentWidth(8), 4);
  assert.equal(getUserMessageContentWidth(20), 16);
  assert.equal(getUserMessageContentWidth(3), 1);
});

test("patched native user message renderer restores one blank line above the box", () => {
  const prototype: PatchableUserMessagePrototype = {
    render: (_width: number): string[] => ["", "Ping", ""],
  };

  patchNativeUserMessagePrototype(prototype, () => undefined, () => true);

  const instance: PatchableUserMessagePrototype = Object.create(prototype);
  const rendered = instance.render(20);

  assert.equal(rendered[0], "");
  assert.match(rendered[1] ?? "", /^╭/);
  assert.match(rendered[3] ?? "", /Ping/);
});

test("patched native user message renderer keeps the border but drops the gray background fill", () => {
  const prototype: PatchableUserMessagePrototype = {
    render: (_width: number): string[] => ["", "Ping", ""],
  };

  patchNativeUserMessagePrototype(
    prototype,
    () => ({
      fg: (_color: string, text: string): string => text,
      getBgAnsi: () => "\u001b[48;5;24m",
    }),
    () => true,
  );

  const instance: PatchableUserMessagePrototype = Object.create(prototype);
  const rendered = instance.render(20).join("\n");

  assert.doesNotMatch(rendered, /\u001b\[48;5;24m/);
  assert.doesNotMatch(rendered, /\u001b\[49m/);
  assert.match(rendered, /╭/);
  assert.match(rendered, /│ Ping/);
});

test("user message renderer adds one top and bottom padding row inside the box", () => {
  assert.deepEqual(addUserMessageVerticalPadding(["Ping"]), ["", "Ping", ""]);
  assert.deepEqual(addUserMessageVerticalPadding(["Line 1", "Line 2"]), ["", "Line 1", "Line 2", ""]);
});

test("user message blank ansi lines are cleared before wrapping", () => {
  assert.equal(normalizeUserMessageContentLine("\u001b[0m"), "");
  assert.equal(normalizeUserMessageContentLine("   \u001b[31m\u001b[0m"), "");

  const normalized = normalizeUserMessageContentLine("\u001b[31mhello\u001b[0m");
  assert.match(normalized, /hello/);
  assert.doesNotMatch(normalized, /\u001b\[0m/);
});

test("user message background painting keeps trailing padding inside explicit background cells", () => {
  const rendered = applyUserMessageBackground(
    {
      getBgAnsi: () => "\u001b[48;5;24m",
    },
    "\u001b[31mhello\u001b[0m   ",
  );

  assert.ok(rendered.startsWith("\u001b[48;5;24m"));
  assert.match(rendered, /hello/);
  assert.equal(rendered.indexOf("\u001b[49m"), rendered.lastIndexOf("\u001b[49m"));
  assert.equal(rendered.slice(rendered.lastIndexOf("\u001b[49m") - 3, rendered.lastIndexOf("\u001b[49m")), "   ");
  assert.doesNotMatch(rendered, /\u001b\[0m/);
});

test("user message background painting falls back to theme bg helper", () => {
  const rendered = applyUserMessageBackground(
    {
      bg: (_color, text) => `bg(${text})`,
    },
    "\u001b[32mworld\u001b[49m",
  );

  assert.equal(rendered, "bg(\u001b[32mworld)");
});

test("user message content trims edge padding but preserves intentional interior breaks", () => {
  assert.deepEqual(normalizeUserMessageContentLines(["", "hello", ""]), ["hello"]);
  assert.deepEqual(normalizeUserMessageContentLines(["", "hello", "", "world", ""]), [
    "hello",
    "",
    "world",
  ]);
  assert.deepEqual(normalizeUserMessageContentLines(["\u001b[0m", "   "]), []);
});

test("collapsed diff hint shrinks to fit narrow panes", () => {
  const hint = buildCollapsedDiffHintText(
    {
      remainingLines: 3970,
      hiddenHunks: 1,
    },
    35,
    codePointWidthOps,
  );

  assert.ok(codePointWidthOps.measure(hint) <= 35);
  assert.match(hint, /3970/);
  assert.doesNotMatch(hint, /Ctrl\+O/);
});

test("collapsed diff hint keeps full guidance when width allows", () => {
  const hint = buildCollapsedDiffHintText(
    {
      remainingLines: 12,
      hiddenHunks: 2,
    },
    80,
    codePointWidthOps,
  );

  assert.equal(hint, "… (12 more diff lines • 2 more hunks • Ctrl+O to expand)");
});

test("line width clamp never returns text wider than the requested width", () => {
  const clamped = clampRenderedLineToWidth(
    "… (3970 more diff lines • Ctrl+O to expand)",
    35,
    codePointWidthOps,
  );

  assert.ok(codePointWidthOps.measure(clamped) <= 35);
  assert.equal(clampRenderedLineToWidth("hello", 0, codePointWidthOps), "");
});


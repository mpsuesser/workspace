import {
  Markdown,
  truncateToWidth,
  visibleWidth,
} from "@mariozechner/pi-tui";
import {
  patchUserMessageRenderPrototype,
  type PatchableUserMessagePrototype,
} from "./user-message-box-patch.js";
import { USER_LABELS } from "./constants/USER_LABELS.js";
import {
  extractUserMessageMarkdownState,
  type UserMessageMarkdownState,
} from "./user-message-box-markdown.js";

export type { PatchableUserMessagePrototype } from "./user-message-box-patch.js";
import {
  addUserMessageVerticalPadding,
  normalizeUserMessageContentLine,
  normalizeUserMessageContentLines,
  type UserMessageBackgroundTheme,
} from "./user-message-box-utils.js";

export interface UserMessageTheme extends UserMessageBackgroundTheme {
  fg(color: string, text: string): string;
  bold?(text: string): string;
}

interface CachedUserMessageMarkdownRenderer {
  text: string;
  theme: UserMessageMarkdownState["theme"];
  defaultTextStyle?: UserMessageMarkdownState["defaultTextStyle"];
  renderer: { render(width: number): string[] };
  renderedWidth: number;
  renderedLines: string[];
}

const MIN_BORDER_WIDTH = 8;
const CONTENT_HORIZONTAL_PADDING_COLUMNS = 1;
const USER_MESSAGE_PATCH_VERSION = 9;
const USER_MESSAGE_OUTER_TOP_MARGIN_LINES = 1;
const MAX_USER_MESSAGE_MARKDOWN_TEXT_LENGTH = 100_000;
const MAX_USER_MESSAGE_MARKDOWN_LINE_COUNT = 2_000;
const DEFAULT_USER_LABEL = "user";

type UserLabelIndexPicker = (exclusiveMax: number) => number;

function defaultPickUserLabelIndex(exclusiveMax: number): number {
  if (exclusiveMax <= 1) {
    return 0;
  }

  const cryptoApi = globalThis.crypto;
  if (!cryptoApi?.getRandomValues) {
    return 0;
  }

  const values = new Uint32Array(1);
  cryptoApi.getRandomValues(values);
  return values[0] % exclusiveMax;
}

function formatUserMessageTitle(label: string): string {
  return ` ${label} `;
}

export function pickRandomUserLabel(
  pickIndex: UserLabelIndexPicker = defaultPickUserLabelIndex,
): string {
  if (USER_LABELS.length === 0) {
    return DEFAULT_USER_LABEL;
  }

  const index = pickIndex(USER_LABELS.length);
  return USER_LABELS[index] ?? DEFAULT_USER_LABEL;
}

export function createUserMessageTitleLabelResolver(
  pickIndex: UserLabelIndexPicker = defaultPickUserLabelIndex,
): (instance: unknown) => string {
  const userMessageTitleLabelCache = new WeakMap<object, string>();

  return (instance: unknown): string => {
    if (typeof instance !== "object" || instance === null) {
      return pickRandomUserLabel(pickIndex);
    }

    const cached = userMessageTitleLabelCache.get(instance);
    if (cached) {
      return cached;
    }

    const label = pickRandomUserLabel(pickIndex);
    userMessageTitleLabelCache.set(instance, label);
    return label;
  };
}

export const getUserMessageTitleLabel = createUserMessageTitleLabelResolver();

export function getUserMessageContentWidth(totalWidth: number): number {
  return Math.max(
    1,
    totalWidth - 2 - CONTENT_HORIZONTAL_PADDING_COLUMNS * 2,
  );
}

function getUserMessageOriginalRenderWidth(totalWidth: number): number {
  return Math.max(1, totalWidth - 2);
}

function colorBorder(theme: UserMessageTheme | undefined, text: string): string {
  if (!text || !theme) {
    return text;
  }

  try {
    return theme.fg("border", text);
  } catch {
    return text;
  }
}

function colorTitle(theme: UserMessageTheme | undefined, title: string): string {
  if (!title) {
    return title;
  }

  const base = theme?.bold ? theme.bold(title) : title;
  if (!theme) {
    return base;
  }

  try {
    return theme.fg("accent", base);
  } catch {
    return base;
  }
}

function buildTopBorder(
  totalWidth: number,
  titleLabel: string,
  theme: UserMessageTheme | undefined,
): string {
  const innerWidth = Math.max(0, totalWidth - 2);
  const title = truncateToWidth(formatUserMessageTitle(titleLabel), innerWidth, "");
  const fill = "─".repeat(Math.max(0, innerWidth - visibleWidth(title)));
  return `${colorBorder(theme, "╭")}${colorTitle(theme, title)}${colorBorder(theme, `${fill}╮`)}`;
}

function buildBottomBorder(
  totalWidth: number,
  theme: UserMessageTheme | undefined,
): string {
  const innerWidth = Math.max(0, totalWidth - 2);
  return `${colorBorder(theme, "╰")}${colorBorder(theme, `${"─".repeat(innerWidth)}╯`)}`;
}

function wrapContentLine(
  line: string,
  totalWidth: number,
  theme: UserMessageTheme | undefined,
): string {
  const sidePadding = " ".repeat(CONTENT_HORIZONTAL_PADDING_COLUMNS);
  const innerWidth = getUserMessageContentWidth(totalWidth);
  const normalizedLine = normalizeUserMessageContentLine(line);
  const content = truncateToWidth(normalizedLine, innerWidth, "", true);
  const padding = " ".repeat(Math.max(0, innerWidth - visibleWidth(content)));
  return `${colorBorder(theme, "│")}${sidePadding}${content}${padding}${sidePadding}${colorBorder(theme, "│")}`;
}

function createMarkdownRenderer(
  markdownState: UserMessageMarkdownState,
): { render(width: number): string[] } {
  return new Markdown(
    markdownState.text,
    0,
    0,
    markdownState.theme,
    markdownState.defaultTextStyle,
  );
}

function countUserMessageLines(text: string, maxLines: number): number {
  let lineCount = 1;
  for (const character of text) {
    if (character !== "\n") {
      continue;
    }

    lineCount++;
    if (lineCount > maxLines) {
      return lineCount;
    }
  }

  return lineCount;
}

function hasSameDefaultTextStyle(
  left: UserMessageMarkdownState["defaultTextStyle"],
  right: UserMessageMarkdownState["defaultTextStyle"],
): boolean {
  if (left === right) {
    return true;
  }
  if (!left || !right) {
    return left === right;
  }

  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);
  if (leftKeys.length !== rightKeys.length) {
    return false;
  }

  for (const key of leftKeys) {
    if (left[key] !== right[key]) {
      return false;
    }
  }

  return true;
}

function hasSameMarkdownState(
  cached: CachedUserMessageMarkdownRenderer,
  state: UserMessageMarkdownState,
): boolean {
  return cached.text === state.text
    && cached.theme === state.theme
    && hasSameDefaultTextStyle(cached.defaultTextStyle, state.defaultTextStyle);
}

export function shouldBypassUserMessageMarkdownRebuild(
  markdownState: UserMessageMarkdownState,
): boolean {
  if (markdownState.text.length > MAX_USER_MESSAGE_MARKDOWN_TEXT_LENGTH) {
    return true;
  }

  return countUserMessageLines(
    markdownState.text,
    MAX_USER_MESSAGE_MARKDOWN_LINE_COUNT,
  ) > MAX_USER_MESSAGE_MARKDOWN_LINE_COUNT;
}

export function createUserMessageMarkdownLineRenderer(
  buildRenderer: (
    markdownState: UserMessageMarkdownState,
  ) => { render(width: number): string[] } = createMarkdownRenderer,
): (
  instance: object,
  markdownState: UserMessageMarkdownState,
  width: number,
) => string[] {
  const cache = new WeakMap<object, CachedUserMessageMarkdownRenderer>();

  return (instance, markdownState, width) => {
    const cached = cache.get(instance);
    const canReuseRenderer = cached
      ? hasSameMarkdownState(cached, markdownState)
      : false;

    if (canReuseRenderer && cached?.renderedWidth === width) {
      return cached.renderedLines;
    }

    const renderer = canReuseRenderer && cached
      ? cached.renderer
      : buildRenderer(markdownState);
    const renderedLines = renderer.render(width);

    cache.set(instance, {
      text: markdownState.text,
      theme: markdownState.theme,
      defaultTextStyle: markdownState.defaultTextStyle,
      renderer,
      renderedWidth: width,
      renderedLines,
    });

    return renderedLines;
  };
}

const renderCachedUserMessageMarkdownLines =
  createUserMessageMarkdownLineRenderer();

function isUserMessageLike(instance: unknown): instance is { children?: unknown } {
  return typeof instance === "object" && instance !== null;
}

function renderUserMessageBodyLines(
  instance: unknown,
  contentWidth: number,
  originalRenderWidth: number,
  originalRender: (width: number) => string[],
): string[] {
  if (!isUserMessageLike(instance)) {
    return originalRender.call(instance, originalRenderWidth);
  }

  const markdownState = extractUserMessageMarkdownState(instance);
  if (!markdownState || shouldBypassUserMessageMarkdownRebuild(markdownState)) {
    return originalRender.call(instance, originalRenderWidth);
  }

  try {
    return renderCachedUserMessageMarkdownLines(
      instance,
      markdownState,
      contentWidth,
    );
  } catch {
    return originalRender.call(instance, originalRenderWidth);
  }
}

export function patchNativeUserMessagePrototype(
  prototype: PatchableUserMessagePrototype,
  getTheme: () => UserMessageTheme | undefined,
  isEnabled: () => boolean,
): void {
  patchUserMessageRenderPrototype(
    prototype,
    USER_MESSAGE_PATCH_VERSION,
    (originalRender) =>
      function renderWithNativeUserBorder(width: number): string[] {
        const safeWidth = Math.max(0, Math.floor(width));
        if (!isEnabled() || safeWidth < MIN_BORDER_WIDTH) {
          return originalRender.call(this, safeWidth);
        }

        const contentWidth = getUserMessageContentWidth(safeWidth);
        const lines = renderUserMessageBodyLines(
          this,
          contentWidth,
          getUserMessageOriginalRenderWidth(safeWidth),
          originalRender,
        );
        const contentLines = normalizeUserMessageContentLines(lines);
        const paddedContentLines = addUserMessageVerticalPadding(
          contentLines.length > 0 ? contentLines : [""],
        );
        const theme = getTheme();
        const outerTopMargin = Array.from(
          { length: USER_MESSAGE_OUTER_TOP_MARGIN_LINES },
          () => "",
        );

        return [
          ...outerTopMargin,
          buildTopBorder(safeWidth, getUserMessageTitleLabel(this), theme),
          ...paddedContentLines.map((renderLine) =>
            wrapContentLine(renderLine, safeWidth, theme),
          ),
          buildBottomBorder(safeWidth, theme),
        ];
      },
  );
}

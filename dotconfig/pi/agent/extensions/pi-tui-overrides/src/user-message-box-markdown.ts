import type {
  DefaultTextStyle,
  MarkdownTheme,
} from "@mariozechner/pi-tui";

interface MarkdownLike {
  text?: unknown;
  theme?: unknown;
  defaultTextStyle?: unknown;
}

interface UserMessageLike {
  children?: unknown;
}

export interface UserMessageMarkdownState {
  text: string;
  theme: MarkdownTheme;
  defaultTextStyle?: DefaultTextStyle;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isTextStyler(value: unknown): value is (text: string) => string {
  return typeof value === "function";
}

function isMarkdownTheme(value: unknown): value is MarkdownTheme {
  if (!isRecord(value)) {
    return false;
  }

  return isTextStyler(value.heading)
    && isTextStyler(value.link)
    && isTextStyler(value.linkUrl)
    && isTextStyler(value.code)
    && isTextStyler(value.codeBlock)
    && isTextStyler(value.codeBlockBorder)
    && isTextStyler(value.quote)
    && isTextStyler(value.quoteBorder)
    && isTextStyler(value.hr)
    && isTextStyler(value.listBullet)
    && isTextStyler(value.bold)
    && isTextStyler(value.italic)
    && isTextStyler(value.strikethrough)
    && isTextStyler(value.underline)
    && (value.highlightCode === undefined || typeof value.highlightCode === "function")
    && (value.codeBlockIndent === undefined || typeof value.codeBlockIndent === "string");
}

function isDefaultTextStyle(value: unknown): value is DefaultTextStyle {
  if (!isRecord(value)) {
    return false;
  }

  return (value.color === undefined || isTextStyler(value.color))
    && (value.bgColor === undefined || isTextStyler(value.bgColor))
    && (value.bold === undefined || typeof value.bold === "boolean")
    && (value.italic === undefined || typeof value.italic === "boolean")
    && (value.strikethrough === undefined || typeof value.strikethrough === "boolean")
    && (value.underline === undefined || typeof value.underline === "boolean");
}

function sanitizeDefaultTextStyle(value: unknown): DefaultTextStyle | undefined {
  if (!isDefaultTextStyle(value)) {
    return undefined;
  }

  const sanitized: DefaultTextStyle = {};

  if (value.color) {
    sanitized.color = value.color;
  }
  if (value.bold !== undefined) {
    sanitized.bold = value.bold;
  }
  if (value.italic !== undefined) {
    sanitized.italic = value.italic;
  }
  if (value.strikethrough !== undefined) {
    sanitized.strikethrough = value.strikethrough;
  }
  if (value.underline !== undefined) {
    sanitized.underline = value.underline;
  }

  return Object.keys(sanitized).length > 0 ? sanitized : undefined;
}

function isMarkdownLike(value: unknown): value is MarkdownLike & {
  text: string;
  theme: MarkdownTheme;
} {
  return isRecord(value)
    && typeof value.text === "string"
    && isMarkdownTheme(value.theme);
}

export function extractUserMessageMarkdownState(
  userMessage: UserMessageLike,
): UserMessageMarkdownState | undefined {
  const children = Array.isArray(userMessage.children) ? userMessage.children : [];
  const markdownChild = children.find((child) => isMarkdownLike(child));
  if (!markdownChild) {
    return undefined;
  }

  return {
    text: markdownChild.text,
    theme: markdownChild.theme,
    defaultTextStyle: sanitizeDefaultTextStyle(markdownChild.defaultTextStyle),
  };
}

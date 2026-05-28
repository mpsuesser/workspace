# Markdown - Configuration

This information was auto-generated from [https://plugins.dprint.dev/dprint/dprint-plugin-markdown/latest/schema.json](https://plugins.dprint.dev/dprint/dprint-plugin-markdown/latest/schema.json).

## lineWidth

The width of a line the printer will try to stay under. Note that the printer may exceed this width in certain cases.

- **Type:** number
- **Default:** 80

## newLineKind

The kind of newline to use.

- **"auto"** - For each file, uses the newline kind found at the end of the last line.
- **"crlf"** - Uses carriage return, line feed.
- **"lf"** - Uses line feed. (Default)
- **"system"** - Uses the system standard (ex. crlf on Windows).

## textWrap

Text wrapping possibilities.

- **"always"** - Always wraps text.
- **"maintain"** - Maintains line breaks. (Default)
- **"never"** - Never wraps text.

## emphasisKind

The character to use for emphasis/italics.

- **"asterisks"** - Uses asterisks (*) for emphasis.
- **"underscores"** - Uses underscores (_) for emphasis. (Default)

## strongKind

The character to use for strong emphasis/bold.

- **"asterisks"** - Uses asterisks (**) for strong emphasis. (Default)
- **"underscores"** - Uses underscores (__) for strong emphasis.

## unorderedListKind

The character to use for unordered lists.

- **"dashes"** - Uses dashes (-) as primary character for lists. (Default)
- **"asterisks"** - Uses asterisks (*) as primary character for lists.

## headingKind

The style of heading to use for level 1 and level 2 headings. Level 3 and higher always use ATX headings.

- **"atx"** - Uses # or ## before the heading text (ATX headings). (Default)
- **"setext"** - Uses an underline of = or - beneath the heading text (setext headings). Only applies to level 1 and 2 headings.

## ignoreDirective

The text to use for an ignore directive (ex. `<!-- dprint-ignore -->`).

- **Type:** string
- **Default:** "dprint-ignore"

## ignoreFileDirective

The text to use for an ignore file directive (ex. `<!-- dprint-ignore-file -->`).

- **Type:** string
- **Default:** "dprint-ignore-file"

## ignoreStartDirective

The text to use for an ignore start directive (ex. `<!-- dprint-ignore-start -->`).

- **Type:** string
- **Default:** "dprint-ignore-start"

## ignoreEndDirective

The text to use for an ignore end directive (ex. `<!-- dprint-ignore-end -->`).

- **Type:** string
- **Default:** "dprint-ignore-end"

## tags

Custom tag to file extension mappings for formatting code blocks. For example: { "markdown": "md" }

- **Type:** object
- **Default:** `<not specified>`

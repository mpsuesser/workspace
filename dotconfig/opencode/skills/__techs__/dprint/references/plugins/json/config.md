# JSON - Configuration

This information was auto-generated from [https://plugins.dprint.dev/dprint/dprint-plugin-json/latest/schema.json](https://plugins.dprint.dev/dprint/dprint-plugin-json/latest/schema.json).

## lineWidth

The width of a line the printer will try to stay under. Note that the printer may exceed this width in certain cases.

- **Type:** number
- **Default:** 120

## indentWidth

The number of characters for an indent.

- **Type:** number
- **Default:** 2

## useTabs

Whether to use tabs (true) or spaces (false).

- **true**
- **false** (Default)

## newLineKind

The kind of newline to use.

- **"auto"** - For each file, uses the newline kind found at the end of the last line.
- **"crlf"** - Uses carriage return, line feed.
- **"lf"** - Uses line feed. (Default)
- **"system"** - Uses the system standard (ex. crlf on Windows).

## commentLine.forceSpaceAfterSlashes

Forces a space after slashes.  For example: `// comment` instead of `//comment`

- **true** (Default)
- **false**

## preferSingleLine (Very Experimental)

If arrays and objects should collapse to a single line if it would be below the line width.

- **true**
- **false** (Default)

AST node-specific configuration property names:

- `array.preferSingleLine`
- `object.preferSingleLine`

## trailingCommas

Whether to use trailing commas.

- **"always"** - Always format with trailing commas. Beware: trailing commas can cause many JSON parsers to fail.
- **"jsonc"** - Use trailing commas in JSONC files and do not use trailing commas in JSON files. (Default)
- **"maintain"** - Keep the trailing comma if it exists.
- **"never"** - Never format with trailing commas.

## jsonTrailingCommaFiles

When `trailingCommas` is `jsonc`, treat these files as JSONC and use trailing commas (ex. `["tsconfig.json", ".vscode/settings.json"]`).

- **Type:** array
- **Default:** `<not specified>`

## ignoreNodeCommentText

The text to use for an ignore comment (ex. `// dprint-ignore`).

- **Type:** string
- **Default:** "dprint-ignore"

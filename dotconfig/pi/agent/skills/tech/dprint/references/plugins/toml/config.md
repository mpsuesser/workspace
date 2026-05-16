# TOML - Configuration

This information was auto-generated from [https://plugins.dprint.dev/dprint/dprint-plugin-toml/latest/schema.json](https://plugins.dprint.dev/dprint/dprint-plugin-toml/latest/schema.json).

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

## comment.forceLeadingSpace

Whether to force a leading space in a comment.

- **true** - Adds a leading space if there is none (ex. `# comment`) (Default)
- **false** - Doesn't force a space to be added and maintains what was done (ex. `#comment`)

## cargo.applyConventions

Whether to apply sorting to a Cargo.toml file.

- **true** (Default)
- **false**

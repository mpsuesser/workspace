# Dockerfile - Configuration

This information was auto-generated from [https://plugins.dprint.dev/dprint/dprint-plugin-dockerfile/latest/schema.json](https://plugins.dprint.dev/dprint/dprint-plugin-dockerfile/latest/schema.json).

## lineWidth

The width of a line the printer will try to stay under. Note that the printer may exceed this width in certain cases.

- **Type:** number
- **Default:** 120

## newLineKind

The kind of newline to use.

- **"auto"** - For each file, uses the newline kind found at the end of the last line.
- **"crlf"** - Uses carriage return, line feed.
- **"lf"** - Uses line feed. (Default)
- **"system"** - Uses the system standard (ex. crlf on Windows).

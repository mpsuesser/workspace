# Pretty YAML - Configuration

This information was auto-generated from [https://plugins.dprint.dev/g-plane/pretty_yaml/latest/schema.json](https://plugins.dprint.dev/g-plane/pretty_yaml/latest/schema.json).

## printWidth

The line width limitation that Pretty YAML should *(but not must)* avoid exceeding. Pretty YAML will try its best to keep line width less than this value, but it may exceed for some cases, for example, a very very long single word.

- **Type:** integer
- **Default:** 80

## indentWidth

Size of indentation.

- **Type:** integer
- **Default:** 2

## lineBreak

Specify whether use `\n` (LF) or `\r\n` (CRLF) for line break.

- **"lf"** (Default)
- **"crlf"**

## quotes

Control the quotes.

- **"preferDouble"** - Use double quotes as possible. However if there're quotes or escaped characters in strings, quotes will be kept as-is. (Default)
- **"preferSingle"** - Use single quotes as possible. However if there're quotes or `\` characters in strings, quotes will be kept as-is.
- **"forceDouble"** - Use double quotes as possible. However if there're escaped characters in strings, quotes will be kept as-is.
- **"forceSingle"** - Use single quotes as possible. However if there're `\` char or `"` char in strings, quotes will be kept as-is.

## trailingComma

Control whether trailing comma should be inserted or not.

- **Type:** boolean
- **Default:** true

## formatComments

Control whether whitespace should be inserted at the beginning of comments or not.

- **Type:** boolean
- **Default:** false

## indentBlockSequenceInMap

Control whether block sequence should be indented or not in a block map.

- **Type:** boolean
- **Default:** true

## braceSpacing

Control whether whitespace should be inserted between braces or not.

- **Type:** boolean
- **Default:** true

## bracketSpacing

Control whether whitespace should be inserted between brackets or not.

- **Type:** boolean
- **Default:** false

## dashSpacing

Control the whitespace behavior of block compact map in block sequence value. This option is only effective when `indentWidth` is greater than 2.

- **"oneSpace"** - Insert only one space after `-`. (Default)
- **"indent"** - Insert spaces to align indentation, respecting `indentWidth` option.

## preferSingleLine

Control whether items should be placed on single line as possible, even they're originally on multiple lines.

- **Type:** boolean
- **Default:** false

AST node-specific configuration property names:

- `flowSequence.preferSingleLine`
- `flowMap.preferSingleLine`

## trimTrailingWhitespaces

Control whether trailing whitespaces should be trimmed or not.

- **Type:** boolean
- **Default:** true

## trimTrailingZero

Control whether trailing zeros should be removed or not.

- **Type:** boolean
- **Default:** false

## proseWrap

Control whether to wrap prose in plain scalars when they exceed the print width.

- **"preserve"** - Don't change how prose is wrapped. (Default)
- **"always"** - Wrap prose if it exceeds the print width.

## ignoreCommentDirective

Text directive for ignoring formatting specific content.

- **Type:** string
- **Default:** "pretty-yaml-ignore"

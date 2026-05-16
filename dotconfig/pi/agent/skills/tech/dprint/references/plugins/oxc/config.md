# Oxc - Configuration

This information was auto-generated from [https://plugins.dprint.dev/dprint/dprint-plugin-oxc/latest/schema.json](https://plugins.dprint.dev/dprint/dprint-plugin-oxc/latest/schema.json).

## lineEnding

The kind of line ending.

- **"lf"** - Line feed. (Default)
- **"crlf"** - Carriage return, line feed.
- **"cr"** - Carriage return.

## indentWidth

The number of characters for an indent.

- **Type:** number
- **Default:** 2

## indentStyle

Whether to use tabs or spaces.

- **"tab"** - Use tabs. (Default)
- **"space"** - Use spaces.

## lineWidth

How many characters can be written on a single line.

- **Type:** number
- **Default:** 80

## semicolons

Whether to use semicolons.

- **"always"** - Semicolons are always added at the end of each statement. (Default)
- **"asNeeded"** - Semicolons are added only in places where it's needed, to protect from ASI.

## quoteStyle

The type of quote used when representing string literals.

- **"double"** - Use double quotes. (Default)
- **"single"** - Use single quotes.

## jsxQuoteStyle

The type of quote used in JSX attributes.

- **"double"** - Use double quotes. (Default)
- **"single"** - Use single quotes.

## quoteProperties

Whether property names inside objects should be quoted.

- **"asNeeded"** - Quotes when necessary. (Default)
- **"preserve"** - Maintains quotes on properties.
- **"consistent"** - All properties are quoted if any property requires quoting.

## arrowParentheses

Whether to add non-necessary parentheses to arrow functions.

- **"always"** - Parentheses are always added. (Default)
- **"asNeeded"** - Parentheses are added only when necessary.

## trailingCommas

Print trailing commas wherever possible in multi-line comma-separated syntactic structures.

- **"all"** - Trailing commas are always added. (Default)
- **"es5"** - Trailing commas are added only in places where it's supported in ES5.
- **"none"** - Trailing commas are never added.

## bracketSpacing

Surround the inner contents of some braces with spaces.

- **Type:** boolean
- **Default:** true

## bracketSameLine

Place the last angle bracket in JSX tags on the same line as the last attribute.

- **Type:** boolean
- **Default:** false

## attributePosition

How JSX/TSX attributes are positioned.

- **"auto"** - Attributes are automatically positioned. (Default)
- **"multiline"** - Each attribute is placed on its own line.

## expand

Whether to expand object and array literals to multiple lines.

- **"auto"** - Objects are expanded when the first property has a leading newline. Arrays are always collapsed unless they contain a newline. (Default)
- **"never"** - Objects and arrays are never expanded, if they are shorter than the line width.

## embeddedLanguageFormatting

Enable formatting for embedded languages (e.g., CSS, SQL, GraphQL) within template literals.

- **"auto"** - Enable formatting for embedded languages. (Default)
- **"off"** - Disable formatting for embedded languages.

## experimentalOperatorPosition

[EXPERIMENTAL - NOT FULLY SUPPORTED] Controls the position of operators in binary expressions when they wrap lines.

- **"start"** - Places the operator at the beginning of the next line.
- **"end"** - Places the operator at the end of the current line. (Default)

## experimentalTernaries

[EXPERIMENTAL - NOT FULLY SUPPORTED] Try prettier's new ternary formatting before it becomes the default behavior.

- **Type:** boolean
- **Default:** false

## experimentalSortImports

[EXPERIMENTAL] Sort import statements. When set, enables import sorting with the specified options.

- **Type:** object
- **Default:** `<not specified>`

## experimentalTailwindcss

[EXPERIMENTAL] Enable Tailwind CSS class sorting. When set, enables class sorting with the specified options.

- **Type:** object
- **Default:** `<not specified>`

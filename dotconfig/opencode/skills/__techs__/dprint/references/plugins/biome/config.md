# Biome - Configuration

This information was auto-generated from [https://plugins.dprint.dev/dprint/dprint-plugin-biome/latest/schema.json](https://plugins.dprint.dev/dprint/dprint-plugin-biome/latest/schema.json).

## lineEnding

The kind of line ending.

- **"lf"** - Line feed. (Default)
- **"crlf"** - Carriage return, line feed.
- **"cr"** - Carriage return.

## indentWidth

The number of characters for an indent.

- **Type:** number
- **Default:** 2

AST node-specific configuration property names:

- `css.indentWidth`
- `graphql.indentWidth`
- `javascript.indentWidth`
- `json.indentWidth`

## indentStyle

Whether to use tabs or spaces.

- **"tab"** - Use tabs. (Default)
- **"space"** - Use spaces.

AST node-specific configuration property names:

- `css.indentStyle`
- `graphql.indentStyle`
- `javascript.indentStyle`
- `json.indentStyle`

## semicolons

Whether to use semicolons.

- **"always"** - Semicolons are always added at the end of each statement. (Default)
- **"asNeeded"** - Semicolons are added only in places where it's needed, to protect from ASI.

## lineWidth

How many characters can be written on a single line.

- **Type:** number
- **Default:** 80

AST node-specific configuration property names:

- `css.lineWidth`
- `graphql.lineWidth`
- `javascript.lineWidth`
- `json.lineWidth`

## css.enabled

Enable css formatting.

- **Type:** boolean
- **Default:** false

## css.cssModules

Enable CSS modules support (enables :local and :global selectors).

- **Type:** boolean
- **Default:** false

## css.gritMetavariables

Enable parsing of GritQL metavariables in CSS. Overrides top-level gritMetavariables.

- **Type:** boolean
- **Default:** false

## graphql.enabled

Enable graphql formatting.

- **Type:** boolean
- **Default:** false

## graphql.bracketSpacing

Surround the inner contents of some braces with spaces.

- **Type:** boolean
- **Default:** true

## javascript.bracketSpacing

Surround the inner contents of some braces with spaces.

- **Type:** boolean
- **Default:** true

## javascript.gritMetavariables

Enable parsing of GritQL metavariables in JavaScript/TypeScript. Overrides top-level gritMetavariables.

- **Type:** boolean
- **Default:** false

## quoteStyle

The type of quote used when representing string literals.

- **"double"** - Use double quotes. (Default)
- **"single"** - Use single quotes

AST node-specific configuration property names:

- `css.quoteStyle`
- `graphql.quoteStyle`
- `javascript.quoteStyle`
- `jsxQuoteStyle`

## trailingCommas

Print trailing commas wherever possible in multi-line comma-separated syntactic structures.

- **"all"** - Trailing commas are always added. (Default)
- **"es5"** - Trailing commas are added only in places where it's supported in ES5.
- **"none"** - Trailing commas are never added.

## arrowParentheses

Whether to add non-necessary parentheses to arrow functions.

- **"always"** - Parentheses are always added. (Default)
- **"asNeeded"** - Parentheses are added only when necessary.

## quoteProperties

Whether property names inside objects should be quoted.

- **"asNeeded"** - Quotes when necessary. (Default)
- **"preserve"** - Maintains quotes on properties.

## bracketSameLine

Place the last angle bracket in JSX tags on the same line as the last attribute.

- **Type:** boolean
- **Default:** false

## bracketSpacing

Surround the inner contents of some braces with spaces.

- **Type:** boolean
- **Default:** true

## gritMetavariables

Enable parsing of GritQL metavariables.

- **Type:** boolean
- **Default:** false

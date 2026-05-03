# Pretty GraphQL - Configuration

This information was auto-generated from [https://plugins.dprint.dev/g-plane/pretty_graphql/latest/schema.json](https://plugins.dprint.dev/g-plane/pretty_graphql/latest/schema.json).

## printWidth

The line width limitation that Pretty GraphQL should *(but not must)* avoid exceeding. Pretty GraphQL will try its best to keep line width less than this value, but it may exceed for some cases, for example, a very very long single word.

- **Type:** integer
- **Default:** 80

## useTabs

Specify use space or tab for indentation.

- **Type:** boolean
- **Default:** false

## indentWidth

Size of indentation. When enabled `useTabs`, this option may be disregarded, since only one tab will be inserted when indented once.

- **Type:** integer
- **Default:** 2

## lineBreak

Specify whether use `\n` (LF) or `\r\n` (CRLF) for line break.

- **"lf"** (Default)
- **"crlf"**

## comma

Control whether commas should be inserted inside a list of items.

- **"always"** - Insert commas inside a list of items. For single line list, there won't be trailing comma; for multiple lines list, there will be trailing comma.
- **"never"** - Do not insert commas inside a list of items. All existed commas will be removed.
- **"noTrailing"** - Insert commas inside a list of items without trailing comma.
- **"onlySingleLine"** - Insert commas inside a list of items only for single line list. For multiple lines list, there won't be commas.
- **"inherit"** - Inherit from the base `comma` option.

AST node-specific configuration property names:

- `arguments.comma`
- `argumentsDefinition.comma`
- `directives.comma`
- `enumValuesDefinition.comma`
- `fieldsDefinition.comma`
- `inputFieldsDefinition.comma`
- `listValue.comma`
- `objectValue.comma`
- `schemaDefinition.comma`
- `schemaExtension.comma`
- `selectionSet.comma`
- `variableDefinitions.comma`

## singleLine

Control whether items should be placed on single line as possible, even they're originally on multiple lines, or force them to be on multiple lines.

- **"prefer"** - Place items on single line as possible.
- **"smart"** - Whether items should be placed on single line will be determined by original layout.
- **"never"** - Force items to be on multiple lines.
- **"inherit"** - Inherit from the base `singleLine` option.

AST node-specific configuration property names:

- `arguments.singleLine`
- `argumentsDefinition.singleLine`
- `directiveLocations.singleLine`
- `directives.singleLine`
- `enumValuesDefinition.singleLine`
- `fieldsDefinition.singleLine`
- `implementsInterfaces.singleLine`
- `inputFieldsDefinition.singleLine`
- `listValue.singleLine`
- `objectValue.singleLine`
- `schemaDefinition.singleLine`
- `schemaExtension.singleLine`
- `selectionSet.singleLine`
- `unionMemberTypes.singleLine`
- `variableDefinitions.singleLine`

## parenSpacing

Control whether whitespace should be inserted between parentheses or not.

- **Type:** boolean | null
- **Default:** `<not specified>`

AST node-specific configuration property names:

- `arguments.parenSpacing`
- `argumentsDefinition.parenSpacing`
- `variableDefinitions.parenSpacing`

## bracketSpacing

Control whether whitespace should be inserted between brackets or not.

- **Type:** boolean
- **Default:** false

## braceSpacing

Control whether whitespace should be inserted between braces or not.

- **Type:** boolean | null
- **Default:** `<not specified>`

AST node-specific configuration property names:

- `enumValuesDefinition.braceSpacing`
- `fieldsDefinition.braceSpacing`
- `inputFieldsDefinition.braceSpacing`
- `objectValue.braceSpacing`
- `schemaDefinition.braceSpacing`
- `schemaExtension.braceSpacing`
- `selectionSet.braceSpacing`

## formatComments

Control whether whitespace should be inserted at the beginning of comments or not.

- **Type:** boolean
- **Default:** false

## ignoreCommentDirective

Text directive for ignoring formatting specific content.

- **Type:** string
- **Default:** "dprint-ignore"

# TypeScript / JavaScript - Configuration

This information was auto-generated from [https://plugins.dprint.dev/dprint/dprint-plugin-typescript/latest/schema.json](https://plugins.dprint.dev/dprint/dprint-plugin-typescript/latest/schema.json).

## lineWidth

The width of a line the printer will try to stay under. Note that the printer may exceed this width in certain cases.

- **Type:** number
- **Default:** 120

## indentWidth

The number of columns for an indent.

- **Type:** number
- **Default:** 2

## useTabs

Whether to use tabs (true) or spaces (false).

- **true** - Uses tabs for indentation.
- **false** - Uses spaces for indentation. (Default)

## semiColons

How semi-colons should be used.

- **"always"** - Always uses semi-colons where applicable.
- **"prefer"** - Prefers semi-colons, but doesn't add one in certain scenarios such as for the last member of a single-line type literal. (Default)
- **"asi"** - Uses automatic semi-colon insertion. Only adds a semi-colon at the start of some expression statements when necessary. Read more: https://standardjs.com/rules.html#semicolons

## quoteStyle

How to use single or double quotes.

- **"alwaysDouble"** - Always uses double quotes. (Default)
- **"alwaysSingle"** - Always uses single quotes.
- **"preferDouble"** - Prefers using double quotes except in scenarios where the string contains more double quotes than single quotes.
- **"preferSingle"** - Prefers using single quotes except in scenarios where the string contains more single quotes than double quotes.

AST node-specific configuration property names:

- `jsx.quoteStyle`
  - How to use single or double quotes in JSX attributes.
  - **"preferDouble"** - Prefers using double quotes except in scenarios where the string contains more double quotes than single quotes. (Default)
  - **"preferSingle"** - Prefers using single quotes except in scenarios where the string contains more single quotes than double quotes.

## quoteProps

Change when properties in objects are quoted.

- **"asNeeded"** - Remove unnecessary quotes around property names.
- **"consistent"** - Same as 'asNeeded', but if one property requires quotes then quote them all.
- **"preserve"** - Preserve quotes around property names. (Default)

## newLineKind

The kind of newline to use.

- **"auto"** - For each file, uses the last newline kind found in the file.
- **"crlf"** - Uses carriage return, line feed.
- **"lf"** - Uses line feed. (Default)
- **"system"** - Uses the system standard (ex. crlf on Windows).

## useBraces

If braces should be used or not.

- **"maintain"** - Uses braces if they're used. Doesn't use braces if they're not used.
- **"whenNotSingleLine"** - Uses braces when the body is on a different line. (Default)
- **"always"** - Forces the use of braces. Will add them if they aren't used.
- **"preferNone"** - Forces no braces when the header is one line and body is one line. Otherwise forces braces.

AST node-specific configuration property names:

- `forInStatement.useBraces`
- `forOfStatement.useBraces`
- `forStatement.useBraces`
- `ifStatement.useBraces`
- `whileStatement.useBraces`

## bracePosition

Where to place the opening brace.

- **"maintain"** - Maintains the brace being on the next line or the same line.
- **"sameLine"** - Forces the brace to be on the same line.
- **"nextLine"** - Forces the brace to be on the next line.
- **"sameLineUnlessHanging"** - Forces the brace to be on the next line if the same line is hanging, but otherwise uses the same line. (Default)

AST node-specific configuration property names:

- `arrowFunction.bracePosition`
- `classDeclaration.bracePosition`
- `classExpression.bracePosition`
- `constructor.bracePosition`
- `doWhileStatement.bracePosition`
- `enumDeclaration.bracePosition`
- `forInStatement.bracePosition`
- `forOfStatement.bracePosition`
- `forStatement.bracePosition`
- `functionDeclaration.bracePosition`
- `functionExpression.bracePosition`
- `getAccessor.bracePosition`
- `ifStatement.bracePosition`
- `interfaceDeclaration.bracePosition`
- `moduleDeclaration.bracePosition`
- `method.bracePosition`
- `setAccessor.bracePosition`
- `staticBlock.bracePosition`
- `switchStatement.bracePosition`
- `switchCase.bracePosition`
- `tryStatement.bracePosition`
- `whileStatement.bracePosition`

## singleBodyPosition

Where to place the expression of a statement that could possibly be on one line (ex. `if (true) console.log(5);`).

- **"maintain"** - Maintains the position of the expression. (Default)
- **"sameLine"** - Forces the whole statement to be on one line.
- **"nextLine"** - Forces the expression to be on the next line.

AST node-specific configuration property names:

- `forInStatement.singleBodyPosition`
- `forOfStatement.singleBodyPosition`
- `forStatement.singleBodyPosition`
- `ifStatement.singleBodyPosition`
- `whileStatement.singleBodyPosition`

## nextControlFlowPosition

Where to place the next control flow within a control flow statement.

- **"maintain"** - Maintains the next control flow being on the next line or the same line.
- **"sameLine"** - Forces the next control flow to be on the same line. (Default)
- **"nextLine"** - Forces the next control flow to be on the next line.

AST node-specific configuration property names:

- `ifStatement.nextControlFlowPosition`
- `tryStatement.nextControlFlowPosition`
- `doWhileStatement.nextControlFlowPosition`

## trailingCommas

If trailing commas should be used.

- **"never"** - Trailing commas should not be used.
- **"always"** - Trailing commas should always be used.
- **"onlyMultiLine"** - Trailing commas should only be used in multi-line scenarios. (Default)

AST node-specific configuration property names:

- `arguments.trailingCommas`
- `parameters.trailingCommas`
- `arrayExpression.trailingCommas`
- `arrayPattern.trailingCommas`
- `enumDeclaration.trailingCommas`
- `exportDeclaration.trailingCommas`
- `importDeclaration.trailingCommas`
- `objectExpression.trailingCommas`
- `objectPattern.trailingCommas`
- `tupleType.trailingCommas`
- `typeLiteral.trailingCommas`
- `typeParameters.trailingCommas`

## operatorPosition

Where to place the operator for expressions that span multiple lines.

- **"maintain"** - Maintains the operator being on the next line or the same line.
- **"sameLine"** - Forces the operator to be on the same line.
- **"nextLine"** - Forces the operator to be on the next line. (Default)

AST node-specific configuration property names:

- `binaryExpression.operatorPosition`
- `conditionalExpression.operatorPosition`
- `conditionalType.operatorPosition`

## preferHanging

Set to prefer hanging indentation when exceeding the line width instead of making code split up on multiple lines.

- **true**
- **false** (Default)

AST node-specific configuration property names:

- `arguments.preferHanging`
  - **"always"** - Always prefers hanging regardless of the number of elements.
  - **"onlySingleItem"** - Only prefers hanging if there is a single item.
  - **"never"** - Never prefers hanging. (Default)
- `arrayExpression.preferHanging`
  - **"always"** - Always prefers hanging regardless of the number of elements.
  - **"onlySingleItem"** - Only prefers hanging if there is a single item.
  - **"never"** - Never prefers hanging. (Default)
- `arrayPattern.preferHanging`
- `doWhileStatement.preferHanging`
- `exportDeclaration.preferHanging`
- `extendsClause.preferHanging`
- `forInStatement.preferHanging`
- `forOfStatement.preferHanging`
- `forStatement.preferHanging`
- `ifStatement.preferHanging`
- `implementsClause.preferHanging`
- `importDeclaration.preferHanging`
- `jsxAttributes.preferHanging`
- `objectExpression.preferHanging`
- `objectPattern.preferHanging`
- `parameters.preferHanging`
  - **"always"** - Always prefers hanging regardless of the number of elements.
  - **"onlySingleItem"** - Only prefers hanging if there is a single item.
  - **"never"** - Never prefers hanging. (Default)
- `sequenceExpression.preferHanging`
- `switchStatement.preferHanging`
- `tupleType.preferHanging`
  - **"always"** - Always prefers hanging regardless of the number of elements.
  - **"onlySingleItem"** - Only prefers hanging if there is a single item.
  - **"never"** - Never prefers hanging. (Default)
- `typeLiteral.preferHanging`
- `typeParameters.preferHanging`
  - **"always"** - Always prefers hanging regardless of the number of elements.
  - **"onlySingleItem"** - Only prefers hanging if there is a single item.
  - **"never"** - Never prefers hanging. (Default)
- `unionAndIntersectionType.preferHanging`
- `variableStatement.preferHanging`
- `whileStatement.preferHanging`

## preferSingleLine (Very Experimental)

If code should revert back from being on multiple lines to being on a single line when able.

- **true**
- **false** (Default)

AST node-specific configuration property names:

- `arrayExpression.preferSingleLine`
- `arrayPattern.preferSingleLine`
- `arguments.preferSingleLine`
- `binaryExpression.preferSingleLine`
- `computed.preferSingleLine`
- `conditionalExpression.preferSingleLine`
- `conditionalType.preferSingleLine`
- `decorators.preferSingleLine`
- `exportDeclaration.preferSingleLine`
- `forStatement.preferSingleLine`
- `importDeclaration.preferSingleLine`
- `jsxAttributes.preferSingleLine`
- `jsxElement.preferSingleLine`
- `mappedType.preferSingleLine`
- `memberExpression.preferSingleLine`
- `objectExpression.preferSingleLine`
- `objectPattern.preferSingleLine`
- `parameters.preferSingleLine`
- `parentheses.preferSingleLine`
- `tupleType.preferSingleLine`
- `typeLiteral.preferSingleLine`
- `typeParameters.preferSingleLine`
- `unionAndIntersectionType.preferSingleLine`
- `variableStatement.preferSingleLine`

## arrowFunction.useParentheses

Whether to use parentheses around a single parameter in an arrow function.

- **"force"** - Forces parentheses.
- **"maintain"** - Maintains the current state of the parentheses. (Default)
- **"preferNone"** - Prefers not using parentheses when possible.

## binaryExpression.linePerExpression

Whether to force a line per expression when spanning multiple lines.

- **true** - Formats with each part on a new line.
- **false** - Maintains the line breaks as written by the programmer. (Default)

## jsx.bracketPosition

If the end angle bracket of a jsx open element or self closing element should be on the same or next line when the attributes span multiple lines.

- **"maintain"** - Maintains the position of the end angle bracket.
- **"sameLine"** - Forces the end angle bracket to be on the same line.
- **"nextLine"** - Forces the end angle bracket to be on the next line. (Default)

AST node-specific configuration property names:

- `jsxOpeningElement.bracketPosition`
- `jsxSelfClosingElement.bracketPosition`

## jsx.forceNewLinesSurroundingContent

Forces newlines surrounding the content of JSX elements.

- **true**
- **false** (Default)

## jsx.multiLineParens

Surrounds the top-most JSX element or fragment in parentheses when it spans multiple lines.

- **"never"** - Never wrap JSX with parentheses.
- **"prefer"** - Prefer wrapping with parentheses in most scenarios, except in function arguments and JSX attributes. (Default)
- **"always"** - Always wrap JSX with parentheses if it spans multiple lines.

## memberExpression.linePerExpression

Whether to force a line per expression when spanning multiple lines.

- **true** - Formats with each part on a new line.
- **false** - Maintains the line breaks as written by the programmer. (Default)

## typeLiteral.separatorKind

The kind of separator to use in type literals.

- **"semiColon"** - Use semi-colons. (Default)
- **"comma"** - Use commas.

AST node-specific configuration property names:

- `typeLiteral.separatorKind.singleLine`
- `typeLiteral.separatorKind.multiLine`

## enumDeclaration.memberSpacing

How to space the members of an enum.

- **"newLine"** - Forces a new line between members.
- **"blankLine"** - Forces a blank line between members.
- **"maintain"** - Maintains whether a newline or blankline is used. (Default)

## spaceAround

Whether to place spaces around enclosed expressions.

- **true** - Ex. `myFunction( true )`
- **false** - Ex. `myFunction(true)` (Default)

AST node-specific configuration property names:

- `arguments.spaceAround`
- `arrayExpression.spaceAround`
- `arrayPattern.spaceAround`
- `catchClause.spaceAround`
- `doWhileStatement.spaceAround`
- `forInStatement.spaceAround`
- `forOfStatement.spaceAround`
- `forStatement.spaceAround`
- `ifStatement.spaceAround`
- `parameters.spaceAround`
- `parenExpression.spaceAround`
- `switchStatement.spaceAround`
- `tupleType.spaceAround`
- `whileStatement.spaceAround`

## spaceSurroundingProperties

Whether to add a space surrounding the properties of single line object-like nodes.

- **true** - Ex. `{ key: value }` (Default)
- **false** - Ex. `{key: value}`

AST node-specific configuration property names:

- `objectExpression.spaceSurroundingProperties`
  - Whether to add a space surrounding the properties of a single line object expression.
  - **true** - Ex. `{ key: value }` (Default)
  - **false** - Ex. `{key: value}`
- `objectPattern.spaceSurroundingProperties`
  - Whether to add a space surrounding the properties of a single line object pattern.
  - **true** - Ex. `{ key: value } = obj` (Default)
  - **false** - Ex. `{key: value} = obj`
- `typeLiteral.spaceSurroundingProperties`
  - Whether to add a space surrounding the properties of a single line type literal.
  - **true** - Ex. `type Test = { key: string }` (Default)
  - **false** - Ex. `type Test = {key: string}`

## binaryExpression.spaceSurroundingBitwiseAndArithmeticOperator

Whether to surround the operator in a binary expression with spaces.

- **true** - Ex. `1 + 2` (Default)
- **false** - Ex. `1+2`

## commentLine.forceSpaceAfterSlashes

Forces a space after the double slash in a comment line.

- **true** - Ex. `//test` -> `// test` (Default)
- **false** - Ex. `//test` -> `//test`

## constructor.spaceBeforeParentheses

Whether to add a space before the parentheses of a constructor.

- **true** - Ex. `constructor ()`
- **false** - Ex. `constructor()` (Default)

## constructorType.spaceAfterNewKeyword

Whether to add a space after the `new` keyword in a constructor type.

- **true** - Ex. `type MyClassCtor = new () => MyClass;`
- **false** - Ex. `type MyClassCtor = new() => MyClass;` (Default)

## constructSignature.spaceAfterNewKeyword

Whether to add a space after the `new` keyword in a construct signature.

- **true** - Ex. `new (): MyClass;`
- **false** - Ex. `new(): MyClass;` (Default)

## doWhileStatement.spaceAfterWhileKeyword

Whether to add a space after the `while` keyword in a do while statement.

- **true** - Ex. `do { } while (condition);` (Default)
- **false** - Ex. `do { } while(condition);`

## exportDeclaration.spaceSurroundingNamedExports

Whether to add spaces around named exports in an export declaration.

- **true** - Ex. `export { SomeExport, OtherExport };` (Default)
- **false** - Ex. `export {SomeExport, OtherExport};`

## forInStatement.spaceAfterForKeyword

Whether to add a space after the `for` keyword in a "for in" statement.

- **true** - Ex. `for (const prop in obj)` (Default)
- **false** - Ex. `for(const prop in obj)`

## forOfStatement.spaceAfterForKeyword

Whether to add a space after the `for` keyword in a "for of" statement.

- **true** - Ex. `for (const value of myArray)` (Default)
- **false** - Ex. `for(const value of myArray)`

## forStatement.spaceAfterForKeyword

Whether to add a space after the `for` keyword in a "for" statement.

- **true** - Ex. `for (let i = 0; i < 5; i++)` (Default)
- **false** - Ex. `for(let i = 0; i < 5; i++)`

## forStatement.spaceAfterSemiColons

Whether to add a space after the semi-colons in a "for" statement.

- **true** - Ex. `for (let i = 0; i < 5; i++)` (Default)
- **false** - Ex. `for (let i = 0;i < 5;i++)`

## functionDeclaration.spaceBeforeParentheses

Whether to add a space before the parentheses of a function declaration.

- **true** - Ex. `function myFunction ()`
- **false** - Ex. `function myFunction()` (Default)

## functionExpression.spaceBeforeParentheses

Whether to add a space before the parentheses of a function expression.

- **true** - Ex. `function<T> ()`
- **false** - Ex. `function<T>()` (Default)

## functionExpression.spaceAfterFunctionKeyword

Whether to add a space after the function keyword of a function expression.

- **true** - Ex. `function <T>()`
- **false** - Ex. `function<T>()` (Default)

## getAccessor.spaceBeforeParentheses

Whether to add a space before the parentheses of a get accessor.

- **true** - Ex. `get myProp ()`
- **false** - Ex. `get myProp()` (Default)

## ifStatement.spaceAfterIfKeyword

Whether to add a space after the `if` keyword in an "if" statement.

- **true** - Ex. `if (true)` (Default)
- **false** - Ex. `if(true)`

## importDeclaration.spaceSurroundingNamedImports

Whether to add spaces around named imports in an import declaration.

- **true** - Ex. `import { SomeExport, OtherExport } from "my-module";` (Default)
- **false** - Ex. `import {SomeExport, OtherExport} from "my-module";`

## jsxSelfClosingElement.spaceBeforeSlash

Whether to add a space before a JSX element's slash when self closing.

- **true** - Ex. `<Test />` (Default)
- **false** - Ex. `<Test/>`

## jsxExpressionContainer.spaceSurroundingExpression

Whether to add a space surrounding the expression of a JSX container.

- **true** - Ex. `{ myValue }`
- **false** - Ex. `{myValue}` (Default)

## method.spaceBeforeParentheses

Whether to add a space before the parentheses of a method.

- **true** - Ex. `myMethod ()`
- **false** - Ex. `myMethod()` (Default)

## setAccessor.spaceBeforeParentheses

Whether to add a space before the parentheses of a set accessor.

- **true** - Ex. `set myProp (value: string)`
- **false** - Ex. `set myProp(value: string)` (Default)

## taggedTemplate.spaceBeforeLiteral

Whether to add a space before the literal in a tagged template.

- **true** - Ex. `html `<element />``
- **false** - Ex. `html`<element />`` (Default)

## typeAnnotation.spaceBeforeColon

Whether to add a space before the colon of a type annotation.

- **true** - Ex. `function myFunction() : string`
- **false** - Ex. `function myFunction(): string` (Default)

## typeAssertion.spaceBeforeExpression

Whether to add a space before the expression in a type assertion.

- **true** - Ex. `<string> myValue` (Default)
- **false** - Ex. `<string>myValue`

## whileStatement.spaceAfterWhileKeyword

Whether to add a space after the `while` keyword in a while statement.

- **true** - Ex. `while (true)` (Default)
- **false** - Ex. `while(true)`

## module.sortImportDeclarations

The kind of sort ordering to use.

- **"maintain"** - Maintains the current ordering.
- **"caseSensitive"** - Alphabetically and case sensitive.
- **"caseInsensitive"** - Alphabetically and case insensitive. (Default)

## module.sortExportDeclarations

The kind of sort ordering to use.

- **"maintain"** - Maintains the current ordering.
- **"caseSensitive"** - Alphabetically and case sensitive.
- **"caseInsensitive"** - Alphabetically and case insensitive. (Default)

## exportDeclaration.sortNamedExports

The kind of sort ordering to use.

- **"maintain"** - Maintains the current ordering.
- **"caseSensitive"** - Alphabetically and case sensitive.
- **"caseInsensitive"** - Alphabetically and case insensitive. (Default)

## exportDeclaration.sortTypeOnlyExports

The kind of sort ordering to use for typed imports and exports.

- **"first"** - Puts type-only named imports and exports first.
- **"last"** - Puts type-only named imports and exports last.
- **"none"** - Does not sort based on if a type-only named import or export. (Default)

## importDeclaration.sortNamedImports

The kind of sort ordering to use.

- **"maintain"** - Maintains the current ordering.
- **"caseSensitive"** - Alphabetically and case sensitive.
- **"caseInsensitive"** - Alphabetically and case insensitive. (Default)

## importDeclaration.sortTypeOnlyImports

The kind of sort ordering to use for typed imports and exports.

- **"first"** - Puts type-only named imports and exports first.
- **"last"** - Puts type-only named imports and exports last.
- **"none"** - Does not sort based on if a type-only named import or export. (Default)

## ignoreNodeCommentText

The text to use for an ignore comment (ex. `// dprint-ignore`).

- **Type:** string
- **Default:** "dprint-ignore"

## ignoreFileCommentText

The text to use for a file ignore comment (ex. `// dprint-ignore-file`).

- **Type:** string
- **Default:** "dprint-ignore-file"

## exportDeclaration.forceSingleLine

If code should be forced to be on a single line if able.

- **true**
- **false** (Default)

## importDeclaration.forceSingleLine

If code should be forced to be on a single line if able.

- **true**
- **false** (Default)

## exportDeclaration.forceMultiLine

If code import/export specifiers should be forced to be on multiple lines.

- **"always"**
- **"never"** (Default)
- **"whenMultiple"** - Force multiple lines only if importing more than one thing.

## importDeclaration.forceMultiLine

If code import/export specifiers should be forced to be on multiple lines.

- **"always"**
- **"never"** (Default)
- **"whenMultiple"** - Force multiple lines only if importing more than one thing.

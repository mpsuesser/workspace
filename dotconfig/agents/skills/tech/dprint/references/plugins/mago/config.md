# Mago - Configuration

This information was auto-generated from [https://plugins.dprint.dev/dprint/dprint-plugin-mago/latest/schema.json](https://plugins.dprint.dev/dprint/dprint-plugin-mago/latest/schema.json).

## phpVersionMajor

PHP major version for parsing.

- **Type:** number
- **Default:** 8

## phpVersionMinor

PHP minor version for parsing.

- **Type:** number
- **Default:** 4

## printWidth

Maximum line length before wrapping occurs.

- **Type:** number
- **Default:** 120

## tabWidth

Number of spaces per indentation level.

- **Type:** number
- **Default:** 4

## useTabs

Use tabs instead of spaces for indentation.

- **Type:** boolean
- **Default:** false

## endOfLine

End-of-line character sequence.

- **"lf"** - Line feed. (Default)
- **"crlf"** - Carriage return, line feed.
- **"cr"** - Carriage return.

## singleQuote

Prefer single quotes over double quotes.

- **Type:** boolean
- **Default:** true

## trailingComma

Add trailing comma to multi-line structures.

- **Type:** boolean
- **Default:** true

## removeTrailingCloseTag

Remove closing ?> tags from files.

- **Type:** boolean
- **Default:** true

## controlBraceStyle

Brace placement style.

- **"same-line"** - Opening brace on the same line.
- **"next-line"** - Opening brace on the next line.

## closureBraceStyle

Brace placement style.

- **"same-line"** - Opening brace on the same line.
- **"next-line"** - Opening brace on the next line.

## functionBraceStyle

Brace placement style.

- **"same-line"** - Opening brace on the same line.
- **"next-line"** - Opening brace on the next line.

## methodBraceStyle

Brace placement style.

- **"same-line"** - Opening brace on the same line.
- **"next-line"** - Opening brace on the next line.

## classlikeBraceStyle

Brace placement style.

- **"same-line"** - Opening brace on the same line.
- **"next-line"** - Opening brace on the next line.

## inlineEmptyControlBraces

Place empty control structure bodies on same line.

- **Type:** boolean
- **Default:** false

## inlineEmptyClosureBraces

Place empty closure bodies on same line.

- **Type:** boolean
- **Default:** true

## inlineEmptyFunctionBraces

Place empty function bodies on same line.

- **Type:** boolean
- **Default:** false

## inlineEmptyMethodBraces

Place empty method bodies on same line.

- **Type:** boolean
- **Default:** false

## inlineEmptyConstructorBraces

Place empty constructor bodies on same line.

- **Type:** boolean
- **Default:** true

## inlineEmptyClasslikeBraces

Place empty class bodies on same line.

- **Type:** boolean
- **Default:** true

## inlineEmptyAnonymousClassBraces

Place empty anonymous class bodies on same line.

- **Type:** boolean
- **Default:** true

## methodChainBreakingStyle

How to break method chains across lines.

- **"same-line"** - Keep chained methods on the same line when possible.
- **"next-line"** - Break chained methods to new lines. (Default)

## firstMethodChainOnNewLine

Place first method call on new line when chaining.

- **Type:** boolean
- **Default:** true

## preserveBreakingMemberAccessChain

Preserve existing line breaks in method chains.

- **Type:** boolean
- **Default:** false

## preserveBreakingArgumentList

Preserve existing line breaks in argument lists.

- **Type:** boolean
- **Default:** false

## preserveBreakingArrayLike

Preserve existing line breaks in array structures.

- **Type:** boolean
- **Default:** true

## preserveBreakingParameterList

Preserve existing line breaks in parameter lists.

- **Type:** boolean
- **Default:** false

## preserveBreakingAttributeList

Preserve existing line breaks in attribute lists.

- **Type:** boolean
- **Default:** false

## preserveBreakingConditionalExpression

Preserve existing line breaks in ternary expressions.

- **Type:** boolean
- **Default:** false

## breakPromotedPropertiesList

Always break parameter lists with promoted properties.

- **Type:** boolean
- **Default:** true

## lineBeforeBinaryOperator

Place binary operator on next line when breaking.

- **Type:** boolean
- **Default:** true

## alwaysBreakNamedArgumentsList

Always break named argument lists into multiple lines.

- **Type:** boolean
- **Default:** false

## alwaysBreakAttributeNamedArgumentLists

Always break named argument lists in attributes.

- **Type:** boolean
- **Default:** false

## arrayTableStyleAlignment

Use table-style alignment for arrays.

- **Type:** boolean
- **Default:** true

## alignAssignmentLike

Align consecutive assignment constructs in columns.

- **Type:** boolean
- **Default:** false

## sortUses

Sort use statements alphabetically.

- **Type:** boolean
- **Default:** true

## sortClassMethods

Sort class methods by visibility and type.

- **Type:** boolean
- **Default:** false

## separateUseTypes

Insert blank line between different use statement types.

- **Type:** boolean
- **Default:** true

## expandUseGroups

Expand grouped use statements individually.

- **Type:** boolean
- **Default:** true

## nullTypeHint

Format null type hints.

- **"question"** - Use question mark syntax (?Type). (Default)
- **"null-pipe"** - Use null pipe syntax (Type|null).

## parenthesesAroundNewInMemberAccess

Add parentheses around new in member access.

- **Type:** boolean
- **Default:** false

## parenthesesInNewExpression

Add parentheses to new expressions without arguments.

- **Type:** boolean
- **Default:** true

## parenthesesInExitAndDie

Add parentheses to exit and die constructs.

- **Type:** boolean
- **Default:** true

## parenthesesInAttribute

Add parentheses to attributes without arguments.

- **Type:** boolean
- **Default:** false

## spaceBeforeArrowFunctionParameterListParenthesis

Add space before arrow function parameters.

- **Type:** boolean
- **Default:** false

## spaceBeforeClosureParameterListParenthesis

Add space before closure parameters.

- **Type:** boolean
- **Default:** true

## spaceBeforeHookParameterListParenthesis

Add space before hook parameters.

- **Type:** boolean
- **Default:** false

## spaceBeforeClosureUseClauseParenthesis

Add space before closure use parentheses.

- **Type:** boolean
- **Default:** true

## spaceAfterCastUnaryPrefixOperators

Add space after cast operators like (int).

- **Type:** boolean
- **Default:** true

## spaceAfterReferenceUnaryPrefixOperator

Add space after reference operator (&).

- **Type:** boolean
- **Default:** false

## spaceAfterErrorControlUnaryPrefixOperator

Add space after error control operator (@).

- **Type:** boolean
- **Default:** false

## spaceAfterLogicalNotUnaryPrefixOperator

Add space after logical not operator (!).

- **Type:** boolean
- **Default:** false

## spaceAfterBitwiseNotUnaryPrefixOperator

Add space after bitwise not operator (~).

- **Type:** boolean
- **Default:** false

## spaceAfterIncrementUnaryPrefixOperator

Add space after prefix increment operator (++).

- **Type:** boolean
- **Default:** false

## spaceAfterDecrementUnaryPrefixOperator

Add space after prefix decrement operator (--).

- **Type:** boolean
- **Default:** false

## spaceAfterAdditiveUnaryPrefixOperator

Add space after unary + and - operators.

- **Type:** boolean
- **Default:** false

## spaceAroundConcatenationBinaryOperator

Add spaces around concatenation operator (.).

- **Type:** boolean
- **Default:** true

## spaceAroundAssignmentInDeclare

Add spaces around = in declare statements.

- **Type:** boolean
- **Default:** false

## spaceWithinGroupingParenthesis

Add spaces inside grouping parentheses.

- **Type:** boolean
- **Default:** false

## emptyLineAfterControlStructure

Add empty line after control structures.

- **Type:** boolean
- **Default:** false

## emptyLineAfterOpeningTag

Add empty line after opening <?php tag.

- **Type:** boolean
- **Default:** true

## emptyLineAfterDeclare

Add empty line after declare statement.

- **Type:** boolean
- **Default:** true

## emptyLineAfterNamespace

Add empty line after namespace declaration.

- **Type:** boolean
- **Default:** true

## emptyLineAfterUse

Add empty line after use statement blocks.

- **Type:** boolean
- **Default:** true

## emptyLineAfterSymbols

Add empty line after top-level symbols.

- **Type:** boolean
- **Default:** true

## emptyLineBetweenSameSymbols

Add empty line between consecutive same-type symbols.

- **Type:** boolean
- **Default:** true

## emptyLineAfterClassLikeConstant

Add empty line after class constant.

- **Type:** boolean
- **Default:** false

## emptyLineAfterEnumCase

Add empty line after enum case.

- **Type:** boolean
- **Default:** false

## emptyLineAfterTraitUse

Add empty line after use statement in trait.

- **Type:** boolean
- **Default:** false

## emptyLineAfterProperty

Add empty line after property.

- **Type:** boolean
- **Default:** false

## emptyLineAfterMethod

Add empty line after method.

- **Type:** boolean
- **Default:** true

## emptyLineBeforeReturn

Add empty line before return statement.

- **Type:** boolean
- **Default:** false

## emptyLineBeforeDanglingComments

Add empty line before dangling comments.

- **Type:** boolean
- **Default:** true

## separateClassLikeMembers

Separate different kinds of class members with blank line.

- **Type:** boolean
- **Default:** true

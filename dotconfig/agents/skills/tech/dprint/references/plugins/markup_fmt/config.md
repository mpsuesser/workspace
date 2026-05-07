# Markup_fmt - Configuration

This information was auto-generated from [https://plugins.dprint.dev/g-plane/markup_fmt/latest/schema.json](https://plugins.dprint.dev/g-plane/markup_fmt/latest/schema.json).

## printWidth

The line width limitation that markup_fmt should *(but not must)* avoid exceeding. markup_fmt will try its best to keep line width less than this value, but it may exceed for some cases, for example, a very very long single word.

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

## quotes

Control the quotes of attribute value.

- **"double"** - Use double quotes as possible. However if there're double quotes in strings, quotes will be kept as-is. (Default)
- **"single"** - Use single quotes as possible. However if there're single quotes in strings, quotes will be kept as-is.

## formatComments

Control whether whitespace should be inserted at the beginning and end of comments and comments should be indented properly or not.

- **Type:** boolean
- **Default:** false

## scriptIndent

Control whether the code block in the `<script>` tag should be indented or not.

- **Type:** boolean
- **Default:** false

## html.scriptIndent

Control whether the code block in the `<script>` tag should be indented or not for HTML.

- **Type:** boolean | null
- **Default:** `<not specified>`

## vue.scriptIndent

Control whether the code block in the `<script>` tag should be indented or not for Vue.

- **Type:** boolean | null
- **Default:** `<not specified>`

## svelte.scriptIndent

Control whether the code block in the `<script>` tag should be indented or not for Svelte.

- **Type:** boolean | null
- **Default:** `<not specified>`

## astro.scriptIndent

Control whether the code block in the `<script>` tag should be indented or not for Astro.

- **Type:** boolean | null
- **Default:** `<not specified>`

## styleIndent

Control whether the code block in the `<style>` tag should be indented or not.

- **Type:** boolean
- **Default:** false

## html.styleIndent

Control whether the code block in the `<style>` tag should be indented or not for HTML.

- **Type:** boolean | null
- **Default:** `<not specified>`

## vue.styleIndent

Control whether the code block in the `<style>` tag should be indented or not for Vue.

- **Type:** boolean | null
- **Default:** `<not specified>`

## svelte.styleIndent

Control whether the code block in the `<style>` tag should be indented or not for Svelte.

- **Type:** boolean | null
- **Default:** `<not specified>`

## astro.styleIndent

Control whether the code block in the `<style>` tag should be indented or not for Astro.

- **Type:** boolean | null
- **Default:** `<not specified>`

## closingBracketSameLine

Control the closing bracket (`>`) of a multi-line element should come at the end of the last line or on the next line (with a line break).

- **Type:** boolean
- **Default:** false

## closingTagLineBreakForEmpty

When there're no children in an element, this option controls whether to insert a line break before the closing tag or not.

- **"always"** - Always insert a line break before the closing tag.
- **"fit"** - Only insert a line break if it doesn't fit the `printWidth` option. (Default)
- **"never"** - Don't insert a line break.

## maxAttrsPerLine

Control the maximum number of attributes in one line. If this option is unset, there won't be any limitations. This option conflicts with `preferAttrsSingleLine` option.

- **Type:** integer | null
- **Default:** `<not specified>`

## preferAttrsSingleLine

Control whether attributes should be put on single line when possible. This option conflicts with `maxAttrsPerLine` option.

- **Type:** boolean
- **Default:** false

## singleAttrSameLine

Control whether single attribute should be put on the same line with tag name.

- **Type:** boolean
- **Default:** true

## html.normal.selfClosing

Control whether HTML normal element should be self-closed or not if it doesn't have children.

- **Type:** boolean | null
- **Default:** `<not specified>`

## html.void.selfClosing

Control whether HTML void element should be self-closed or not if it doesn't have children.

- **Type:** boolean | null
- **Default:** `<not specified>`

## component.selfClosing

Control whether Vue/Svelte/Astro/Angular component should be self-closed or not if it doesn't have children.

- **Type:** boolean | null
- **Default:** `<not specified>`

## svg.selfClosing

Control whether SVG element should be self-closed or not if it doesn't have children.

- **Type:** boolean | null
- **Default:** `<not specified>`

## mathml.selfClosing

Control whether MathML element should be self-closed or not if it doesn't have children.

- **Type:** boolean | null
- **Default:** `<not specified>`

## whitespaceSensitivity

Control the whitespace sensitivity before and after the children of an element.

- **"css"** - Respect the default value of CSS `display` property. (Default)
- **"strict"** - Whitespace (or the lack of it) around all tags is considered significant.
- **"ignore"** - Whitespace (or the lack of it) around all tags is considered insignificant.

## component.whitespaceSensitivity

Control the whitespace sensitivity before and after the children of an element for components.

- **"css"** - Respect the default value of CSS `display` property.
- **"strict"** - Whitespace (or the lack of it) around all tags is considered significant.
- **"ignore"** - Whitespace (or the lack of it) around all tags is considered insignificant.
- **`<not specified>`** - Use the value of `whitespaceSensitivity` option. (Default)

## doctypeKeywordCase

Control the case of "doctype" keyword in `<!DOCTYPE>`.

- **"ignore"** - Keep the case as-is.
- **"upper"** - Print "DOCTYPE" in upper case. (Default)
- **"lower"** - Print "doctype" in lower case.

## vBindStyle

Control Vue `v-bind` directive style.

- **"short"** - Use short-hand form like `:value`.
- **"long"** - Use long-hand form like `v-bind:value`.
- **`<not specified>`** - Style of `v-bind` directive won't be changed. (Default)

## vOnStyle

Control Vue `v-on` directive style.

- **"short"** - Use short-hand form like `@click`.
- **"long"** - Use long-hand form like `v-on:click`.
- **`<not specified>`** - Style of `v-on` directive won't be changed. (Default)

## vForDelimiterStyle

Control Vue `v-for` directive delimiter style.

- **"in"** - Use `in` as `v-for` delimiter.
- **"of"** - Use `of` as `v-for` delimiter.
- **`<not specified>`** - Style of `v-for` directive delimiter won't be changed. (Default)

## vSlotStyle

Control Vue `v-slot` directive style.

- **"short"** - Use short-hand form like `#default` or `#named`.
- **"long"** - Use long-hand form like `v-slot:default` or `v-slot:named`.
- **"vSlot"** - For default slot, use `v-slot` (shorter than `#default`); otherwise, use short-hand form.
- **`<not specified>`** - Style of `v-slot` directive won't be changed. (Default)

## component.vSlotStyle

Control Vue `v-slot` directive style for Vue components.

- **"short"**
- **"long"**
- **"vSlot"**
- **`<not specified>`** (Default)

## default.vSlotStyle

Control Vue `v-slot` directive style for default slot.

- **"short"**
- **"long"**
- **"vSlot"**
- **`<not specified>`** (Default)

## named.vSlotStyle

Control Vue `v-slot` directive style for named slot.

- **"short"**
- **"long"**
- **"vSlot"**
- **`<not specified>`** (Default)

## vBindSameNameShortHand

Control whether Vue attribute should be written in short-hand form or not if attribute name and value are same.

- **Type:** boolean | null
- **Default:** `<not specified>`

## vueComponentCase

Control the component naming style in template.

- **"ignore"** - Component names will not be changed. (Default)
- **"pascalCase"** - Component names will be converted to PascalCase.
- **"kebabCase"** - Component names will be converted to kebab-case.

## strictSvelteAttr

Control whether Svelte attribute value should be in strict mode or not.

- **Type:** boolean
- **Default:** false

## svelteAttrShorthand

Control whether Svelte attribute should be written in short-hand form or not when possible.

- **Type:** boolean | null
- **Default:** `<not specified>`

## svelteDirectiveShorthand

Control whether Svelte directive should be written in short-hand form or not when possible.

- **Type:** boolean | null
- **Default:** `<not specified>`

## astroAttrShorthand

Control whether Astro attribute should be written in short-hand form or not when possible.

- **Type:** boolean | null
- **Default:** `<not specified>`

## angularNextControlFlowSameLine

Control whether the next Angular control flow code should be on the same line with previous `}` or not.

- **Type:** boolean
- **Default:** true

## scriptFormatter

Tell markup_fmt what script formatter you are using.

- **Type:** string | null
- **Default:** "dprint"

## ignoreCommentDirective

Text directive for ignoring formatting specific element or node.

- **Type:** string
- **Default:** "markup-fmt-ignore"

## ignoreFileCommentDirective

Text directive for ignoring formatting a whole file.

- **Type:** string
- **Default:** "dprint-ignore-file"

# Markdown Code Formatter

## Install and Setup

In your project's directory with a dprint.json file, run:

```shellsession
dprint add markdown
```

This will update your config file to have an entry for the plugin. Then optionally specify a `"markdown"` property to add configuration:

```json
{
  "markdown": {
    // markdown config goes here
  },
  "plugins": [
    "https://plugins.dprint.dev/markdown-0.21.1.wasm"
  ]
}
```

## Code block formatters

Code blocks are formatted based on the other provided plugins. For example, if you wish to format JSON, TypeScript, and JavaScript code blocks, then ensure those plugins are also specified in the list of plugins to use.

```json
{
  "plugins": [
    "https://plugins.dprint.dev/typescript-0.95.15.wasm",
    "https://plugins.dprint.dev/json-0.21.3.wasm",
    "https://plugins.dprint.dev/markdown-0.21.1.wasm"
  ]
}
```

## Configuration

See [Configuration](markdown/config.md)

## Playground

See [Playground](https://dprint.dev/playground#plugin/markdown)

## Ignore Comments

Use an ignore comment:

```md
Some              text
```

Or a range ignore:

```md
<!-- dprint-ignore-start -->

Some    text

* other    text
*           testing

<!-- dprint-ignore-end -->
```

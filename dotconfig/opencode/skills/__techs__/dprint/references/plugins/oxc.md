# Oxc Plugin

Adapter plugin that formats JavaScript and TypeScript files via [Oxc](https://oxc.rs).

## Install and Setup

In your project's directory with a dprint.json file, run:

```shellsession
dprint add oxc
```

This will update your config file to have an entry for the plugin. Then optionally specify a `"oxc"` property to add configuration:

```json
{
  "oxc": {
    // oxc's config goes here
  },
  "plugins": [
    "https://plugins.dprint.dev/oxc-0.20.0.wasm"
  ]
}
```

## Configuration

See [Configuration](oxc/config.md)

## Playground

See [Playground](https://dprint.dev/playground#plugin/oxc)

## Source

See https://github.com/dprint/dprint-plugin-oxc

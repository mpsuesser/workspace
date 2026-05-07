# Mago Plugin

Adapter plugin that formats PHP code via [Mago](https://github.com/carthage-software/mago).

Formats .php files.

## Install and Setup

In your project's directory with a dprint.json file, run:

```shellsession
dprint add mago
```

This will update your config file to have an entry for the plugin. Then optionally specify a `"mago"` property to add configuration:

```json
{
  "mago": {
    // mago's config goes here
  },
  "plugins": [
    "https://plugins.dprint.dev/mago-0.17.0.wasm"
  ]
}
```

## Configuration

See [Configuration](mago/config.md)

## Playground

See [Playground](https://dprint.dev/playground#plugin/mago)

## Source

See https://github.com/dprint/dprint-plugin-mago

# Biome Plugin

Adapter plugin that formats JavaScript, TypeScript, and JSON files via [Biome](https://biomejs.dev).

## Install and Setup

In your project's directory with a dprint.json file, run:

```shellsession
dprint add biome
```

This will update your config file to have an entry for the plugin. Then optionally specify a `"biome"` property to add configuration:

```json
{
  "biome": {
    // biome's config goes here
  },
  "plugins": [
    "https://plugins.dprint.dev/biome-0.12.10.wasm"
  ]
}
```

## Configuration

See [Configuration](biome/config.md)

## Playground

See [Playground](https://dprint.dev/playground#plugin/biome)

## Source

See https://github.com/dprint/dprint-plugin-biome

# Ruff Plugin

Adapter plugin that formats Python code via [Ruff](https://docs.astral.sh/ruff/).

Formats .py and .pyi files.

Note: For formatting .ipynb files, use the [Jupyter plugin](jupyter.md) along with this plugin.

## Install and Setup

In your project's directory with a dprint.json file, run:

```shellsession
dprint add ruff
```

This will update your config file to have an entry for the plugin. Then optionally specify a `"ruff"` property to add configuration:

```json
{
  "ruff": {
    // ruff's config goes here
  },
  "plugins": [
    "https://plugins.dprint.dev/ruff-0.7.11.wasm"
  ]
}
```

## Configuration

See [Configuration](ruff/config.md)

## Playground

See [Playground](https://dprint.dev/playground#plugin/ruff)

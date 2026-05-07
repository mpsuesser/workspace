# Dockerfile Code Formatter

Formats [Dockerfiles](https://docs.docker.com/engine/reference/builder).

## Install and Setup

In your project's directory with a dprint.json file, run:

```shellsession
dprint add dockerfile
```

This will update your config file to have an entry for the plugin. Then optionally specify a `"dockerfile"` property to add configuration:

```json
{
  "dockerfile": {
    // dockerfile config goes here
  },
  "plugins": [
    "https://plugins.dprint.dev/dockerfile-0.3.3.wasm"
  ]
}
```

## Configuration

See [Configuration](dockerfile/config.md)

## Playground

See [Playground](https://dprint.dev/playground#plugin/dockerfile)

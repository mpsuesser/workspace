# Pretty YAML Plugin

Adapter plugin that formats YAML files via [Pretty YAML](https://github.com/g-plane/pretty_yaml).

## Install and Setup

In your project's directory with a dprint.json file, run:

```shellsession
dprint add g-plane/pretty_yaml
```

This will update your config file to have an entry for the plugin. Then optionally specify a `"yaml"` property to add configuration:

```json
{
  "yaml": { // not "pretty_yaml"
    // Pretty YAML config goes here
  },
  "plugins": [
    "https://plugins.dprint.dev/g-plane/pretty_yaml-v0.6.0.wasm"
  ]
}
```

## Configuration

See [Configuration](pretty_yaml/config.md) or read [full documentation site](https://pretty-yaml.netlify.app/) with code examples.

## Playground

See [Playground](https://dprint.dev/playground#plugin/pretty_yaml)

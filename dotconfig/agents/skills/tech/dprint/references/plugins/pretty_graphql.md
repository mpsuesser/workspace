# Pretty GraphQL Plugin

Adapter plugin that formats GraphQL files via [Pretty GraphQL](https://github.com/g-plane/pretty_graphql).

## Install and Setup

In your project's directory with a dprint.json file, run:

```shellsession
dprint add g-plane/pretty_graphql
```

This will update your config file to have an entry for the plugin. Then optionally specify a `"graphql"` property to add configuration:

```json
{
  "graphql": { // not "pretty_graphql"
    // Pretty GraphQL config goes here
  },
  "plugins": [
    "https://plugins.dprint.dev/g-plane/pretty_graphql-v0.2.3.wasm"
  ]
}
```

## Configuration

See [Configuration](pretty_graphql/config.md) or read [full documentation site](https://pretty-graphql.netlify.app/) with code examples.

## Playground

See [Playground](https://dprint.dev/playground#plugin/pretty_graphql)

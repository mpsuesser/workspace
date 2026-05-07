# Plugins

Dprint is made up of Wasm and process plugins.

- Wasm plugins are compiled to a `.wasm` file and run sandboxed.
- Process plugins are compiled to an executable file and do NOT run sandboxed.

It would be ideal for all plugins to be Wasm plugins, but unfortunately many languages don't support compiling to a single `.wasm` file. Until then, process plugins exist.

The setup for both is the same except process plugins require a checksum to be specified to ensure the downloaded file is the same as what was built on the CI pipeline.

## Wasm Plugins

- [Typescript / JavaScript](plugins/typescript.md)
- [JSON](plugins/json.md)
- [Markdown](plugins/markdown.md)
- [TOML](plugins/toml.md)
- [Dockerfile](plugins/dockerfile.md)
- [Biome](plugins/biome.md) (JS/TS/JSON)
- [Oxc](plugins/oxc.md) (JS/TS)
- [Malva](plugins/malva.md) (CSS/SCSS/Sass/Less)
- [Markup_fmt](plugins/markup_fmt.md) (HTML/Vue/Svelte/Astro/Angular/Jinja/Twig/Nunjucks/Vento)
- [Pretty GraphQL](plugins/pretty_graphql.md) (GraphQL)
- [Pretty YAML](plugins/pretty_yaml.md) (YAML)
- [Mago](plugins/mago.md) (PHP)
- [Ruff](plugins/ruff.md) (Python)
- [Jupyter](plugins/jupyter.md)
- [Gofumpt](plugins/gofumpt.md) (Go)

## Process Plugins

- [Prettier](plugins/prettier.md)
- [Roslyn](plugins/roslyn.md) (C#/VB)
- [Exec](plugins/exec.md) - Works with any formatting CLI installed on the system.

## Using Wasm Plugins in the Browser, Deno, or Node.js

See https://github.com/dprint/js-formatter

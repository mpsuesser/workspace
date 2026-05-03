# Gofumpt - Configuration

This information was auto-generated from [https://plugins.dprint.dev/jakebailey/dprint-plugin-gofumpt/latest/schema.json](https://plugins.dprint.dev/jakebailey/dprint-plugin-gofumpt/latest/schema.json).

## langVersion

The Go language version to target (e.g., "go1.24", "go1.25"). Must start with "go" prefix. If empty, defaults to "go1". Recommended to set explicitly.

- **Type:** string
- **Default:** ""

## modulePath

The module path of the package being formatted. Used for import sorting. Recommended to set explicitly.

- **Type:** string
- **Default:** ""

## extraRules

Enable extra formatting rules beyond the default gofumpt rules. These rules are stricter but may not be desired in all projects.

- **Type:** boolean
- **Default:** false

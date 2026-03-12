# Writing configuration.md Files

Configuration reference files document setup, config files, and bindings.

## Structure

```markdown
# [Product] Configuration

## Quick Start

\`\`\`toml
# Minimal working config
[section]
key = "value"
\`\`\`

## Full Configuration

### Section Name

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| key1 | string | - | Required. Does X |
| key2 | number | 100 | Optional. Controls Y |

\`\`\`toml
[section]
key1 = "required-value"
key2 = 200
\`\`\`

## Bindings

### Binding Name

\`\`\`toml
[[bindings]]
name = "BINDING_VAR"
type = "binding-type"
\`\`\`

Access in code:
\`\`\`typescript
env.BINDING_VAR.method()
\`\`\`
```

## Guidelines

### Start with Minimal Working Example
```toml
# Gets you from zero to working
name = "my-worker"
main = "src/index.ts"
compatibility_date = "2024-01-01"
```

Then expand to full options.

### Use Tables for Options
```markdown
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| main | string | - | Entry point file |
| compatibility_date | string | - | Workers runtime version |
| node_compat | boolean | false | Enable Node.js APIs |
```

### Show Binding → Code Connection
```toml
# wrangler.toml
[[kv_namespaces]]
binding = "MY_KV"
id = "abc123"
```

```typescript
// src/index.ts
export default {
  async fetch(request, env) {
    const value = await env.MY_KV.get("key")
    //                   ^^^^^^ matches binding name
  }
}
```

### Document Environment Differences
```markdown
## Environment-Specific Config

\`\`\`toml
# Production
[env.production]
vars = { LOG_LEVEL = "error" }

# Staging  
[env.staging]
vars = { LOG_LEVEL = "debug" }
\`\`\`
```

## Example: Workers Configuration

```markdown
# Workers Configuration

## Quick Start

\`\`\`toml
name = "my-worker"
main = "src/index.ts"
compatibility_date = "2024-01-01"
\`\`\`

## Core Settings

| Key | Type | Required | Description |
|-----|------|----------|-------------|
| name | string | Yes | Worker name (used in URLs) |
| main | string | Yes | Entry point file |
| compatibility_date | string | Yes | Runtime version date |
| compatibility_flags | string[] | No | Enable specific features |

## Bindings

### KV Namespace

\`\`\`toml
[[kv_namespaces]]
binding = "CACHE"
id = "your-namespace-id"
\`\`\`

### D1 Database

\`\`\`toml
[[d1_databases]]
binding = "DB"
database_name = "my-database"
database_id = "your-database-id"
\`\`\`
```

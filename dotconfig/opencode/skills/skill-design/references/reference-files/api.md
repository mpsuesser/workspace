# Writing api.md Files

API reference files document runtime APIs, methods, and types.

## Structure

```markdown
# [Product] API

## Core Types

\`\`\`typescript
interface MainType { ... }
type Options = { ... }
\`\`\`

## Methods

### methodName(args): ReturnType

[Brief description]

\`\`\`typescript
// Example usage
const result = await methodName(arg1, arg2)
\`\`\`

**Parameters:**
- `arg1` - Description
- `arg2` - Description (optional, default: X)

**Returns:** Description of return value

**Throws:** ErrorType when [condition]
```

## Guidelines

### Group by Concept, Not Alphabet
```markdown
## Reading Data
### get()
### list()
### query()

## Writing Data  
### put()
### delete()
### batch()
```

### Show Types Inline
```typescript
// GOOD - types visible
async function get(key: string): Promise<string | null>

// BAD - have to look elsewhere
async function get(key)
```

### Include Error Cases
```typescript
// What happens on failure?
const value = await kv.get(key)
if (value === null) {
  // Key doesn't exist - not an error, returns null
}

// vs
await d1.exec(sql) // Throws D1Error on invalid SQL
```

### Document Limits
```markdown
### put(key, value)

**Limits:**
- Key: max 512 bytes
- Value: max 25 MiB
- Requests: 1000/second per namespace
```

## Example: KV API

```markdown
# KV API

## Types

\`\`\`typescript
interface KVNamespace {
  get(key: string, options?: KVGetOptions): Promise<string | null>
  put(key: string, value: string, options?: KVPutOptions): Promise<void>
  delete(key: string): Promise<void>
  list(options?: KVListOptions): Promise<KVListResult>
}

interface KVPutOptions {
  expiration?: number      // Unix timestamp
  expirationTtl?: number   // Seconds from now
  metadata?: object        // Max 1024 bytes
}
\`\`\`

## Methods

### get(key, options?)

Retrieve a value by key.

\`\`\`typescript
const value = await env.MY_KV.get("user:123")
const parsed = await env.MY_KV.get("config", { type: "json" })
\`\`\`

**Returns:** `string | null` - null if key doesn't exist

**Options:**
- `type`: "text" | "json" | "arrayBuffer" | "stream"
- `cacheTtl`: Seconds to cache (min 60)
```

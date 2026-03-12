# Writing patterns.md Files

Pattern files document common workflows and best practices.

## Structure

```markdown
# [Product] Patterns

## Pattern: Name

**When:** [Trigger condition - when to use this]

**Approach:**
[Explanation of the pattern]

\`\`\`typescript
// Complete implementation
\`\`\`

**Why:** [Rationale - why this works]

**Avoid:** [Anti-pattern - what not to do instead]
```

## Guidelines

### Name Patterns by What They Solve
```markdown
## Pattern: Caching with Stale-While-Revalidate

NOT: ## Pattern: Using Cache API
```

### Include Trigger Conditions
```markdown
**When:**
- Response is cacheable but may change
- Stale data is acceptable for performance
- You want instant responses with background refresh
```

### Show Complete Implementations
```typescript
// GOOD - complete, copy-paste ready
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const cache = caches.default
    const cacheKey = new Request(request.url, request)
    
    let response = await cache.match(cacheKey)
    if (response) {
      // Refresh in background
      ctx.waitUntil(refreshCache(cacheKey, env))
      return response
    }
    
    response = await fetchFresh(env)
    ctx.waitUntil(cache.put(cacheKey, response.clone()))
    return response
  }
}
```

### Explain the "Why"
```markdown
**Why:** 
- `waitUntil` keeps the worker alive after response
- Cache refresh doesn't block the response
- Users always get instant response
```

### Show the Anti-Pattern
```typescript
// AVOID: Blocking on cache refresh
const fresh = await fetchFresh(env)      // User waits
await cache.put(cacheKey, fresh.clone()) // User still waiting
return fresh
```

## Pattern Categories

Organize patterns by what they accomplish:

```markdown
## Data Access Patterns
- Caching strategies
- Batch operations
- Pagination

## Error Handling Patterns
- Retry with backoff
- Graceful degradation
- Circuit breaker

## Performance Patterns
- Connection pooling
- Request coalescing
- Edge caching
```

## Example: D1 Patterns

```markdown
# D1 Patterns

## Pattern: Batch Inserts

**When:** Inserting multiple rows (>10)

**Approach:** Use batch API instead of individual inserts

\`\`\`typescript
const users = [
  { id: "1", name: "Alice" },
  { id: "2", name: "Bob" },
]

// Batch insert
const stmt = env.DB.prepare(
  "INSERT INTO users (id, name) VALUES (?, ?)"
)
await env.DB.batch(
  users.map(u => stmt.bind(u.id, u.name))
)
\`\`\`

**Why:** Single round-trip vs N round-trips. 10x+ faster for bulk operations.

**Avoid:**
\`\`\`typescript
// SLOW: N database round-trips
for (const user of users) {
  await env.DB.prepare("INSERT...").bind(...).run()
}
\`\`\`
```

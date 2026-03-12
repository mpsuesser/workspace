# Writing gotchas.md Files

Gotcha files capture tribal knowledge: the things that burn you the first time, the limits that aren't obvious, the mistakes that seem right.

## Structure

```markdown
# [Product] Gotchas

## Issue: Short Descriptive Name

**Symptom:** What you observe (error message, unexpected behavior)

**Cause:** Why it happens (the non-obvious reason)

**Solution:** How to fix it

\`\`\`typescript
// Fix example
\`\`\`
```

## What Belongs in Gotchas

### Hidden Limits
```markdown
## Issue: CPU Time vs Wall Clock Time

**Symptom:** Worker killed despite fast response

**Cause:** Workers have 10ms CPU time limit, not wall clock. 
Waiting on fetch() doesn't count, but JSON parsing does.

**Solution:** 
- Offload heavy compute to Durable Objects (30s limit)
- Use streaming for large payloads
- Consider Workers AI for ML workloads
```

### Surprising Defaults
```markdown
## Issue: KV Reads Return Stale Data

**Symptom:** Recently written data not visible on read

**Cause:** KV is eventually consistent. Writes propagate globally 
in ~60 seconds. Reads may hit stale edge caches.

**Solution:**
- Design for eventual consistency
- Use Durable Objects for strong consistency needs
- Set appropriate `cacheTtl` on reads
```

### Common Mistakes
```markdown
## Issue: Response Body Already Used

**Symptom:** `Error: Body has already been used`

**Cause:** Response bodies are streams, can only be read once.

\`\`\`typescript
// WRONG
const response = await fetch(url)
console.log(await response.text())  // First read
return response                      // Body consumed!

// RIGHT
const response = await fetch(url)
const body = await response.text()
console.log(body)
return new Response(body, response)
\`\`\`
```

### Error Message Decoders
```markdown
## Error: "Script startup exceeded CPU time limit"

**Cause:** Top-level code (outside handler) ran too long.
Common culprits:
- Large static data structures
- Synchronous file parsing
- Complex regex compilation

**Solution:** 
- Lazy-initialize heavy objects
- Move computation into handler
- Use `ctx.waitUntil()` for setup
```

## Guidelines

### Be Specific About Symptoms
```markdown
// GOOD
**Symptom:** `Error 1101: Worker threw exception`

// BAD
**Symptom:** It doesn't work
```

### Explain the Non-Obvious Cause
The symptom is what they see. The cause is what they don't understand. That's the value.

### Include the Fix, Not Just the Explanation
```markdown
// GOOD
**Solution:** Clone response before reading
\`\`\`typescript
const clone = response.clone()
\`\`\`

// BAD
**Solution:** You need to handle the stream differently
```

### Link to Deeper Resources
```markdown
**More info:** See [patterns.md](./patterns.md#streaming) 
for streaming patterns
```

## Gotcha Categories

```markdown
## Limits & Quotas
- CPU time, memory, request size
- Rate limits, concurrent connections

## Consistency & Timing
- Eventual consistency gotchas
- Race conditions
- Cache behavior

## Common Errors
- Specific error messages and fixes
- Debugging tips

## Migration Gotchas
- Breaking changes between versions
- Deprecated patterns
```

# Writing Gotchas Content

How to capture and document tribal knowledge effectively.

## What Belongs in Gotchas

### Include

- Hidden limits not in main docs
- Surprising default behaviors
- Common mistakes that look correct
- Error messages with non-obvious causes
- Migration pitfalls between versions

### Exclude

- Basic usage (belongs in README/patterns)
- API reference (belongs in api.md)
- Configuration options (belongs in configuration.md)
- Things that are obvious from docs

## The Gotcha Formula

```markdown
## Issue: [Short Name]

**Symptom:** [What you observe]

**Cause:** [Why it happens - the non-obvious part]

**Solution:** [How to fix it]

\`\`\`typescript
// Fix example
\`\`\`
```

## Good Gotcha Examples

### Hidden Limit

```markdown
## Issue: KV Value Size Limit

**Symptom:** `Error: Value too large` on put()

**Cause:** KV has a 25 MiB value limit, but this isn't validated 
client-side. Large JSON objects can exceed this unexpectedly.

**Solution:** Check size before writing, or use R2 for large values.

\`\`\`typescript
const MAX_KV_SIZE = 25 * 1024 * 1024
if (JSON.stringify(value).length > MAX_KV_SIZE) {
  return env.R2.put(key, value)
}
return env.KV.put(key, value)
\`\`\`
```

### Surprising Behavior

```markdown
## Issue: Response Body Single-Use

**Symptom:** `Error: Body has already been used`

**Cause:** Response bodies are streams. Reading consumes them.
This catches everyone the first time.

**Solution:** Clone before reading if you need the response again.

\`\`\`typescript
// WRONG
const text = await response.text()
return response  // Body consumed!

// RIGHT
const clone = response.clone()
const text = await clone.text()
return response  // Original intact
\`\`\`
```

### Error Decoder

```markdown
## Error: "Script startup exceeded CPU time limit"

**Symptom:** Worker fails immediately with this error.

**Cause:** Top-level code (outside handler) exceeded 400ms.
Common culprits:
- Large static data structures
- Eager initialization
- Complex regex compilation

**Solution:** Lazy-initialize expensive objects.

\`\`\`typescript
// WRONG - initializes on every cold start
const HUGE_MAP = buildHugeMap()

// RIGHT - initializes on first use
let hugeMap: Map | null = null
function getHugeMap() {
  return hugeMap ??= buildHugeMap()
}
\`\`\`
```

## Sourcing Gotchas

### From Experience
Document issues you've hit. If it burned you, it'll burn others.

### From Issues/Forums
Search GitHub issues, Discord, Stack Overflow for common problems.

### From Code Review
Patterns you've corrected in PRs are gotchas waiting to happen.

### From Changelog
Breaking changes and deprecations are gotcha goldmines.

## Anti-Patterns

### Too Vague

```markdown
## Issue: Performance Problems

**Symptom:** Things are slow

**Solution:** Make it faster
```

Be specific about what, why, and how.

### Obvious from Docs

```markdown
## Issue: Need to Configure Main

**Symptom:** Worker doesn't start

**Solution:** Add `main` to wrangler.toml
```

This is basic setup, not a gotcha.

### No Solution

```markdown
## Issue: Memory Limit

**Symptom:** Worker crashes with OOM

**Cause:** 128MB limit exceeded
```

Always include a solution or workaround.

# Progressive Loading

Skills support three levels of loading, each with different token costs.

## The Three Levels

| Level | Loaded When | Token Cost | Contains |
|-------|-------------|------------|----------|
| **Metadata** | Startup (always) | ~100 tokens | name, description |
| **Instructions** | Skill activated | <5,000 tokens | SKILL.md body |
| **Resources** | Explicitly read | Variable | references/* files |

## Why This Matters

```
Without progressive loading:
- 60 products × 500 lines each = 30,000 lines
- All loaded upfront = context blown

With progressive loading:
- Metadata: 60 × 2 lines = 120 lines (always)
- Instructions: 1 router = 150 lines (on activation)
- Resources: 1-3 files = 300 lines (as needed)
- Total per task: ~450 lines
```

You can have comprehensive coverage without paying the full cost upfront.

## Level 1: Metadata

The frontmatter loads at startup for all available skills:

```yaml
---
name: cloudflare
description: Comprehensive Cloudflare platform skill covering Workers, 
  Pages, storage (KV, D1, R2), AI (Workers AI, Vectorize)...
---
```

This appears in the system prompt:
```xml
<available_skills>
  <skill>
    <name>cloudflare</name>
    <description>Comprehensive Cloudflare platform skill...</description>
  </skill>
</available_skills>
```

**Budget**: ~100 tokens per skill. Keep descriptions dense with keywords.

## Level 2: Instructions

The SKILL.md body loads when the AI calls `skill({ name: "..." })`:

```markdown
# Cloudflare Skill

## Task Router
[Decision trees - helps AI navigate]

## Product Index
[Table of what's available]
```

**Budget**: <5,000 tokens. Put routing logic here, not detailed content.

## Level 3: Resources

Reference files load when explicitly read:

```typescript
// AI reads specific file based on task
read("./references/workers/api.md")
```

**Budget**: Unlimited total, but load strategically.

## Designing for Progressive Loading

### Put Routing in SKILL.md
The main file helps the AI decide what to load:

```markdown
## Task Router

Need storage?
├─ Key-value → Read references/kv/README.md
├─ SQL → Read references/d1/README.md
```

### Put Details in References
Detailed content lives in reference files:

```
references/
├── kv/
│   ├── README.md      # When to use KV
│   ├── api.md         # Full API reference
│   └── gotchas.md     # KV-specific pitfalls
```

### Index What's Available
Help the AI know what exists without loading it:

```markdown
## In This Skill

| Reference | When to Load |
|-----------|--------------|
| workers/ | Building serverless functions |
| d1/ | SQL database operations |
| kv/ | Key-value storage |
```

## See Also

- [descriptions.md](./descriptions.md) - Writing triggering descriptions
- [structure.md](./structure.md) - Structuring for partial loads

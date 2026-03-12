# Skill Size Issues

Your skill is too large, causing context bloat or truncation.

## Symptoms

- Slow skill loading
- Context window fills quickly
- Content gets truncated
- AI forgets earlier parts of skill

## Size Guidelines

| Component | Target | Maximum | Action if Exceeded |
|-----------|--------|---------|-------------------|
| SKILL.md | 100-200 lines | 300 lines | Extract to references/ |
| Each reference file | 100-200 lines | 400 lines | Split by topic |
| Total skill | 500-1500 lines | 5000 lines | Review structure |

## Diagnosis

Check your skill size:

```bash
# Total lines
wc -l $(find .opencode/skill/my-skill -name "*.md")

# Per file
find .opencode/skill/my-skill -name "*.md" -exec wc -l {} \;
```

## Solutions

### Problem: Monolithic SKILL.md

Before (800 lines):
```
skill/
└── SKILL.md     # Everything inline
```

After (structured):
```
skill/
├── SKILL.md           # 150 lines - router only
└── references/
    ├── api.md         # 200 lines
    ├── patterns.md    # 200 lines
    └── gotchas.md     # 150 lines
```

### Problem: Giant Reference File

Before (600 line api.md):
```
references/
└── api.md    # All APIs in one file
```

After (split by domain):
```
references/
├── api-core.md       # 150 lines
├── api-storage.md    # 200 lines
└── api-network.md    # 150 lines
```

### Problem: Redundant Examples

Before:
```typescript
// Example 1: Basic usage
const result = await kv.get("key")

// Example 2: Also basic usage  
const value = await kv.get("another-key")

// Example 3: Still basic usage
const data = await kv.get("yet-another")
```

After:
```typescript
// Basic usage
const value = await kv.get("key")

// With options
const parsed = await kv.get("config", { type: "json" })
```

One example per concept. Don't repeat.

### Problem: Inline Documentation

Before:
```markdown
The KV namespace provides a simple key-value store. It was introduced
in 2018 and has since become one of the most popular storage options.
The team at Cloudflare designed it for...
[100 lines of background]
```

After:
```markdown
KV provides global key-value storage with eventual consistency.

**Use when:** Simple key-value access, read-heavy workloads, global data.
```

Skip the history. Get to the point.

## Measuring Impact

Before optimization:
- Skill load: 800 tokens
- Every query loads everything

After optimization:
- Router load: 150 tokens
- Targeted file: 200 tokens
- Total per query: 350 tokens (56% reduction)

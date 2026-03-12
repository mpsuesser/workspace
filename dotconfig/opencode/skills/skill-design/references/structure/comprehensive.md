# Comprehensive Skills

Router-based skills for platforms with multiple products/tools.

## When to Use

- Cloud platforms (AWS, Cloudflare, Vercel)
- Multi-product ecosystems  
- Domains where "which tool should I use?" is a core question
- 500+ lines of reference material

## Structure

```
skill-name/
├── SKILL.md                    # Router + decision trees
└── references/
    └── <product>/              # One directory per product/tool
        ├── README.md           # Overview, when to use
        ├── api.md              # Runtime API reference
        ├── configuration.md    # Setup, config options
        ├── patterns.md         # Usage patterns
        └── gotchas.md          # Pitfalls, limitations
```

## SKILL.md as Router

The main SKILL.md doesn't contain detailed content. It:

1. **Routes** - Decision trees point to the right product
2. **Indexes** - Lists what's available
3. **Guides** - Helps the AI choose

```markdown
---
name: platform-skill
description: Comprehensive platform skill covering [products]. 
  Use for any [platform] development task.
---

# Platform Skill

## Task Router

\`\`\`
Need to [category]?
├─ [Requirement A] → product-a/
├─ [Requirement B] → product-b/
├─ [Requirement C] → product-c/
└─ [Requirement D] → product-d/
\`\`\`

## Product Index

| Product | Purpose | Key Files |
|---------|---------|-----------|
| [product-a](./references/product-a/) | [Brief] | api.md, patterns.md |
| [product-b](./references/product-b/) | [Brief] | configuration.md |
```

## The 5-File Pattern

Each product directory follows a consistent structure:

| File | Purpose | Load When |
|------|---------|-----------|
| README.md | Overview, when to use | Always first |
| api.md | Runtime APIs, methods | Implementing |
| configuration.md | Setup, config options | Initial setup |
| patterns.md | Common workflows | Design guidance |
| gotchas.md | Pitfalls, limits | Debugging |

Not every product needs all five. Use what's relevant.

## Decision Trees

Decision trees are the key differentiator. They encode architectural knowledge:

```
Need storage?
├─ Simple key-value, global → kv/
├─ SQL queries needed → d1/
├─ Large files/blobs → r2/
├─ Per-user isolated → durable-objects/
└─ Vector embeddings → vectorize/
```

Each branch:
- Starts with user's goal (not product name)
- Branches on requirements
- Terminates at a specific directory

## Cross-References

Keep references **one level deep**:

```markdown
## See Also

- [Related Product](../related-product/README.md)
```

Avoid chains: A → B → C confuses the AI about what's loaded.

## Size Guidelines

- **SKILL.md**: 100-200 lines (router only)
- **Each README.md**: 50-100 lines
- **Each detail file**: 100-300 lines
- **Total**: 500-5000+ lines (loaded progressively)

## Examples

- `cloudflare` skill - 60+ products, full decision trees
- See: https://github.com/dmmulroy/cloudflare-skill

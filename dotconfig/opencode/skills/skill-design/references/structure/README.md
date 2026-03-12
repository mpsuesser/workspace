# Skill Structure

Choosing the right structure for your skill depends on domain complexity and how the AI will use it.

## Decision Tree

```
How complex is your domain?
├─ Single concept/pattern
│   └─ → Minimal (single SKILL.md)
├─ One domain, multiple aspects
│   └─ → Standard (SKILL.md + references/)
├─ Multiple products/tools that solve similar problems
│   └─ → Comprehensive (router + 5-file refs)
└─ Unsure
    └─ Start minimal, evolve as needed
```

## Structure Comparison

| Aspect | Minimal | Standard | Comprehensive |
|--------|---------|----------|---------------|
| Files | 1 | 3-10 | 10-100+ |
| Lines | 50-150 | 150-500 | 500-5000+ |
| Load time | Instant | Fast | Progressive |
| Maintenance | Trivial | Moderate | Structured |
| Decision support | Limited | Moderate | Full trees |

## When Each Tier Fits

### Minimal
- Coding style guides
- Single library patterns
- Mental models / philosophies
- Decision frameworks

### Standard  
- Framework usage (one framework, multiple aspects)
- API client skills (one service, auth + endpoints + patterns)
- Testing approaches (setup + patterns + gotchas)

### Comprehensive
- Cloud platforms (AWS, Cloudflare, Vercel)
- Multi-product ecosystems
- Domains where "which tool?" is a core question

## Evolution Path

Skills can grow:

```
v1: Single SKILL.md (minimal)
    ↓ content exceeds 300 lines
v2: Extract examples to references/examples.md (standard)
    ↓ need multiple reference categories  
v3: Add patterns.md, gotchas.md (standard+)
    ↓ domain has multiple products/tools
v4: Router + decision trees + 5-file refs (comprehensive)
```

Don't over-engineer early. Start minimal, extract when painful.

## See Also

- [minimal.md](./minimal.md) - Single-file skill patterns
- [standard.md](./standard.md) - Multi-file skill patterns
- [comprehensive.md](./comprehensive.md) - Platform-scale patterns

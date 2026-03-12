# The 5-File Reference Pattern

For comprehensive skills, each product/topic gets a directory with up to 5 standardized files.

## The Files

| File | Purpose | Load When |
|------|---------|-----------|
| README.md | Overview, when to use | Always first |
| api.md | Runtime APIs, methods | Implementing features |
| configuration.md | Setup, config files | Initial setup |
| patterns.md | Common workflows | Design guidance |
| gotchas.md | Pitfalls, limits | Debugging issues |

## Why This Pattern

### Predictable Loading
The AI knows which file to load for which task:
- "Set up D1" → README.md + configuration.md
- "Write D1 queries" → api.md
- "D1 keeps timing out" → gotchas.md

### Efficient Context
Don't load api.md when debugging. Don't load configuration.md when implementing. Each file serves a specific purpose.

### Maintainable Updates
- New API? Edit api.md
- New gotcha discovered? Append to gotchas.md
- Config option added? Update configuration.md

No hunting through a monolithic file.

## Not Every Topic Needs All Five

Adapt to what's relevant:

| Topic Type | Likely Files |
|------------|--------------|
| Simple utility | README.md only |
| Library | README.md, api.md, patterns.md |
| Infrastructure | README.md, configuration.md, gotchas.md |
| Complex platform | All five |

## Directory Structure

```
references/
└── product-name/
    ├── README.md           # Start here
    ├── api.md              # Runtime reference
    ├── configuration.md    # Setup reference
    ├── patterns.md         # Usage patterns
    └── gotchas.md          # Tribal knowledge
```

## Cross-References

Keep references **one level deep**:

```markdown
## See Also

- [Related Product](../related-product/README.md)
- [Patterns](./patterns.md)
```

Avoid: A → B → C chains that confuse what's loaded.

## See Also

- [api.md](./api.md) - Writing API reference files
- [configuration.md](./configuration.md) - Writing config reference files
- [patterns.md](./patterns.md) - Writing pattern files
- [gotchas.md](./gotchas.md) - Writing gotcha files

# Official Documentation

Official docs are ground truth. They define what the technology IS and how it SHOULD be used.

## Role in Skill Creation

Official documentation provides:
- **Authoritative definitions** - What things are called, how they work
- **Intended usage patterns** - How the creators expect it to be used
- **Configuration reference** - All options and their meanings
- **API surface** - What's available and how to call it

GitHub exploration supplements this but doesn't replace it.

## What to Capture

### Essential (always capture)

| Section | Why |
|---------|-----|
| Getting Started | Core mental model |
| Core Concepts | Vocabulary and architecture |
| API Reference | Complete surface area |
| Configuration | Setup and options |

### Important (capture if exists)

| Section | Why |
|---------|-----|
| Best Practices | Official patterns |
| Migration Guides | Version gotchas |
| Troubleshooting | Official gotchas |
| FAQ | Common questions |

### Optional (skim for insights)

| Section | Why |
|---------|-----|
| Tutorials | May have patterns |
| Blog | Announcements, rationale |
| Roadmap | Future direction |

## Capture Strategies

### Strategy 1: Section-by-Section

For well-structured docs:

```
1. Fetch the docs index/sidebar
2. Identify key sections
3. Fetch each section systematically
4. Extract into skill structure:
   - Concepts → SKILL.md core
   - API → references/api.md
   - Config → references/configuration.md
   - Troubleshooting → references/gotchas.md
```

### Strategy 2: Task-Oriented

For docs organized by use case:

```
1. Identify primary user tasks
2. Find docs for each task
3. Extract patterns from each
4. Synthesize into skill patterns
```

### Strategy 3: Reference Dump

For comprehensive API docs:

```
1. Fetch complete API reference
2. Organize by category/module
3. Include type signatures
4. Add usage examples from docs
```

## Retrieval Best Practices

### Be Systematic
Don't cherry-pick. Cover the full API surface, then prioritize.

### Preserve Structure
Note how official docs organize things—it often reflects the technology's mental model.

### Capture Versions
Note which version the docs are for. APIs change.

### Link Back
Keep URLs so the skill can reference official docs for details.

## See Also

- [retrieval.md](./retrieval.md) - Fetching techniques
- [api-docs.md](./api-docs.md) - API reference specifics

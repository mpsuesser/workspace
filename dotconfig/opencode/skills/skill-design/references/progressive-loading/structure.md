# Structuring for Partial Loads

Design your skill so the AI can load exactly what it needs.

## Principle: Independence

Each reference file should be useful on its own:

```markdown
# workers/api.md

## Types
[Complete type definitions]

## Methods  
[Complete method docs]

## Examples
[Working examples with imports]
```

The AI shouldn't need to load configuration.md to understand api.md.

## Principle: Clear Boundaries

Separate concerns into distinct files:

```
GOOD:
├── api.md          # Runtime APIs only
├── configuration.md # Config files only
└── patterns.md      # Usage patterns only

BAD:
├── part1.md        # Half the API + some config
├── part2.md        # Rest of API + some patterns
```

## Principle: Shallow References

Cross-references should be one level deep:

```markdown
# workers/README.md

## See Also
- [KV Storage](../kv/README.md)     ✓ One level
- [D1 Database](../d1/README.md)    ✓ One level
```

Avoid chains: workers → kv → d1 → ... The AI loses track of what's loaded.

## Structuring Large Topics

If a single file exceeds ~300 lines, split by task:

```
Before:
└── workers/
    └── api.md    # 800 lines, everything

After:
└── workers/
    ├── api-core.md      # Request/Response, fetch
    ├── api-bindings.md  # KV, D1, R2 binding APIs
    └── api-runtime.md   # ExecutionContext, waitUntil
```

Update the README to route:
```markdown
## API Reference

- [Core APIs](./api-core.md) - Request, Response, fetch
- [Bindings](./api-bindings.md) - Storage and service bindings
- [Runtime](./api-runtime.md) - Execution context, lifecycle
```

## Loading Hints in SKILL.md

Guide the AI on what to load:

```markdown
## Task Router

| Task | Load These Files |
|------|------------------|
| New project setup | README.md + configuration.md |
| Implement feature | README.md + api.md + patterns.md |
| Debug issue | gotchas.md |
| Performance tuning | patterns.md + gotchas.md |
```

## File Size Guidelines

| File Type | Target | Maximum |
|-----------|--------|---------|
| README.md | 50-100 lines | 150 lines |
| api.md | 100-200 lines | 400 lines |
| configuration.md | 50-150 lines | 300 lines |
| patterns.md | 100-200 lines | 400 lines |
| gotchas.md | 50-150 lines | 300 lines |

If you exceed these, the file is doing too much. Split it.

## Anti-Pattern: Monolithic Reference

```markdown
# Everything About Workers

## Setup
[200 lines]

## API
[400 lines]

## Configuration  
[150 lines]

## Patterns
[300 lines]

## Gotchas
[200 lines]

Total: 1250 lines loaded for any Workers question
```

This defeats progressive loading. Split into 5 files.

## Handling Very Large Files

Sometimes a reference file must be large (API docs for a big library). Use these techniques:

### Table of Contents (>100 lines)

Add a TOC at the top of any reference file exceeding 100 lines:

```markdown
# Large API Reference

## Contents
- [Authentication](#authentication)
- [Users API](#users-api)
- [Posts API](#posts-api)
- [Media API](#media-api)
...

## Authentication
...
```

### Grep Patterns (>10k words)

For very large files (>10k words), include search patterns in SKILL.md:

```markdown
## API Reference

The API reference is comprehensive. Search patterns:
- Authentication: `grep -i "auth\|token\|session"`
- Rate limits: `grep -i "rate\|limit\|throttle"`
- Errors: `grep -i "error\|exception\|fail"`
```

This helps the agent find relevant sections without loading the entire file.

### Consider Splitting

If you need grep patterns, the file is probably too large. Consider:
- Split by category (auth.md, users.md, media.md)
- Split by operation type (read-apis.md, write-apis.md)
- Extract examples to separate file

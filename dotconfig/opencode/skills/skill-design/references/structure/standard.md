# Standard Skills

Multi-file skills for single domains with multiple aspects.

## When to Use

- Framework usage guides
- API client patterns  
- Testing approaches
- Any domain where you need ~300-500 lines but want organized loading

## Structure

```
skill-name/
├── SKILL.md              # Core instructions + index
└── references/
    ├── examples.md       # Code examples (loaded when implementing)
    ├── patterns.md       # Usage patterns (loaded for guidance)
    └── gotchas.md        # Pitfalls (loaded when debugging)
```

## SKILL.md Template

```markdown
---
name: my-skill
description: When and why to use this skill
---

# Skill Title

[Overview paragraph]

## When to Use This Skill

- Condition 1
- Condition 2

## Quick Reference

[Essential patterns that fit in ~100 lines]

## In This Skill

| Reference | When to Load |
|-----------|--------------|
| [examples.md](./references/examples.md) | Implementing features |
| [patterns.md](./references/patterns.md) | Design guidance |
| [gotchas.md](./references/gotchas.md) | Debugging issues |
```

## Reference File Templates

### examples.md
```markdown
# Examples

## Basic Usage

\`\`\`typescript
// Complete, runnable example
\`\`\`

## Advanced: [Topic]

\`\`\`typescript
// More complex example
\`\`\`
```

### patterns.md
```markdown
# Patterns

## Pattern: Name

**When**: [Trigger condition]

**Approach**:
[Explanation + code]

**Avoid**:
[Anti-pattern]
```

### gotchas.md
```markdown
# Gotchas

## Issue: Name

**Symptom**: [What you observe]
**Cause**: [Why it happens]
**Solution**: [How to fix]

\`\`\`typescript
// Fix example
\`\`\`
```

## Size Guidelines

- **SKILL.md**: 100-200 lines (quick reference + index)
- **Each reference**: 50-150 lines
- **Total**: 300-500 lines across all files

## Examples in This Repo

- `effect-testing` - Testing patterns with examples
- `effect-error-handling` - Core + patterns + gotchas

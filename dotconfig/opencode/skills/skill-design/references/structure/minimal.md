# Minimal Skills

Single-file skills for focused concepts.

## When to Use

- Coding style guides
- Single pattern or convention
- Mental models / decision frameworks
- Philosophical approaches (e.g., "wide events" observability)

## Template

```markdown
---
name: my-skill
description: Brief description of when to use this skill
---

# Skill Title

[1-2 sentence overview]

## When to Use This Skill

- Trigger condition 1
- Trigger condition 2

## Core Concept

[The main idea in 2-3 paragraphs or a code block]

## Patterns

### Pattern Name

[Brief explanation + code example]

## Anti-Patterns

### Avoid: Bad Pattern

[What not to do + why]

## Checklist

- [ ] Verification item 1
- [ ] Verification item 2
```

## Size Guidelines

- **Target**: 50-150 lines
- **Maximum**: 300 lines (beyond this, consider Standard tier)
- **Minimum viable**: ~30 lines (frontmatter + core concept)

## Style Variants

### Prose Style
Standard markdown with headers, paragraphs, code blocks. Good for explanatory content.

### Terse/Algebraic Style
Symbolic notation for density. Good for mental models:

```markdown
## Philosophy

<concept>
key := principle
correct := pattern  
wrong := anti-pattern
transform(wrong) → correct
</concept>
```

### Checklist Style
For procedural skills:

```markdown
## Workflow

1. [ ] First step
2. [ ] Second step  
3. [ ] Verify: [condition]
```

## Examples in This Repo

- `effect-wide-events` - Terse/conceptual style (~87 lines)
- `effect-context-witness` - Decision framework style

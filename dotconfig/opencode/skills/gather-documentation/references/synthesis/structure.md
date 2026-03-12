# Structuring the Output

Organizing gathered material into skill structure.

## From Sources to Skill

### Mapping Sources to Skill Files

```
Source Material          →    Skill File
─────────────────────────────────────────
Docs: Core concepts      →    SKILL.md
Docs: Getting started    →    SKILL.md
Docs: API reference      →    references/api.md
Docs: Configuration      →    references/configuration.md
Docs: Best practices     →    references/patterns.md
Docs: Troubleshooting    →    references/gotchas.md
GitHub: Examples         →    references/patterns.md
GitHub: Issues           →    references/gotchas.md
GitHub: Architecture     →    SKILL.md (structure decision)
```

### Choosing Skill Tier

Based on gathered material:

```
Material suggests...

Few concepts, small API
├─ 1-2 main patterns
├─ Simple configuration
└─ → Minimal skill (SKILL.md only)

Multiple concerns, moderate API
├─ 3-10 main patterns
├─ Configuration complexity
├─ Some gotchas
└─ → Standard skill (SKILL.md + references/)

Multiple products/tools
├─ "Which one?" questions arose
├─ Large API surface
├─ Many gotchas
└─ → Comprehensive skill (router + 5-file refs)
```

## SKILL.md Structure

### For Minimal Skills

```markdown
---
name: tech-name
description: [Comprehensive description with keywords]
---

# Tech Name

[Overview from docs]

## When to Use

[From docs + GitHub validation]

## Core Patterns

[From docs, illustrated with GitHub examples]

## Gotchas

[From issues + docs troubleshooting]
```

### For Standard Skills

```markdown
---
name: tech-name
description: [Comprehensive description]
---

# Tech Name

[Overview]

## When to Use
[Triggers]

## Quick Reference
[Essential patterns from docs]

## In This Skill

| Reference | When to Load |
|-----------|--------------|
| api.md | [task] |
| configuration.md | [task] |
| patterns.md | [task] |
| gotchas.md | [task] |
```

### For Comprehensive Skills

```markdown
---
name: tech-name
description: [Comprehensive description]
---

# Tech Name

## Task Router

[Decision trees from analysis]

## Product Index

[From docs structure + GitHub discovery]

## In This Skill

[Table pointing to references/product/]
```

## Reference File Structure

### api.md

```markdown
# [Tech] API

## [Category 1]

### method1()
[From official API docs]

### method2()
[From official API docs]

## [Category 2]
...
```

### configuration.md

```markdown
# [Tech] Configuration

## Quick Start
[Minimal config from docs]

## Full Reference
[All options from docs]

## Examples
[From GitHub repos]
```

### patterns.md

```markdown
# [Tech] Patterns

## Pattern: [Name]
[From docs]

**Example:**
[From GitHub]

## Pattern: [Name]
...
```

### gotchas.md

```markdown
# [Tech] Gotchas

## Issue: [Name]
[From docs troubleshooting + GitHub issues]

## Issue: [Name]
...
```

## Quality Check

Before finalizing:

- [ ] SKILL.md has proper frontmatter
- [ ] Description includes key technology terms
- [ ] Core concepts come from official docs
- [ ] Examples are complete and runnable
- [ ] Gotchas cite sources (issue links)
- [ ] Structure matches technology complexity
- [ ] Cross-references are one level deep

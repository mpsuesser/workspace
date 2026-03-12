# Skill Creation Workflow

The recommended process for creating effective skills.

## Overview

```
1. Understand → Study concrete examples first
2. Plan      → Decide structure, identify reusable pieces
3. Create    → Build the skill
4. Test      → Use on real tasks
5. Iterate   → Improve based on usage
```

## Phase 1: Understand

**Before writing anything**, study:

### Concrete Examples
- Find 2-3 well-designed skills in similar domains
- Note their structure, content organization, and style
- Identify patterns that work

### The Domain
- What does the agent need to know that it doesn't already?
- What decisions does the agent need help making?
- What gotchas exist that aren't obvious?

### The Users
- What tasks will they ask for?
- What terms will they use?
- What mistakes will they make?

## Phase 2: Plan

### Choose Tier

Based on domain complexity:

| If... | Then... |
|-------|---------|
| Few concepts, simple patterns | Minimal (SKILL.md only) |
| Multiple aspects, moderate API | Standard (+ references/) |
| Multiple products, "which one?" decisions | Comprehensive (router + refs) |

### Identify Reusable Pieces

- **Scripts**: Any deterministic operations that should be executed, not described?
- **Assets**: Any templates, files, or resources for output?
- **References**: What documentation needs to be loadable separately?

### Draft Description

Write the description FIRST—it defines what triggers the skill:
- What the skill covers
- When to use it
- Key terms for matching

## Phase 3: Create

### Structure

```bash
mkdir -p .opencode/skill/{name}/references
mkdir -p .opencode/skill/{name}/scripts  # if needed
mkdir -p .opencode/skill/{name}/assets   # if needed
```

### SKILL.md

1. Frontmatter with name and description
2. Core philosophy/approach (if needed)
3. Decision trees or task router (if needed)
4. Quick reference for common tasks
5. Index of references

### References

For each reference file:
1. Single clear purpose
2. Self-contained (usable without loading others)
3. TOC if >100 lines
4. Complete code examples

## Phase 4: Test

Use the skill on real tasks:

- Does it trigger when expected?
- Does the agent find the right references?
- Are the patterns actually helpful?
- Is anything missing?

## Phase 5: Iterate

Based on testing:

- **Not triggering?** → Improve description keywords
- **Wrong references loaded?** → Improve routing/task tables
- **Missing patterns?** → Add to appropriate reference
- **Too verbose?** → Cut ruthlessly
- **Agent struggling?** → Add decision tree or examples

## See Also

- [iteration.md](./iteration.md) - Detailed iteration guidance

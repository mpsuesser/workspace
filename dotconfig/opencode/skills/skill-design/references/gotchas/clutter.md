# What NOT to Include

Skills should be lean. Every file must justify its token cost.

## Files to Avoid

### Never include these:

| File | Why Not |
|------|---------|
| README.md | SKILL.md IS the readme |
| INSTALLATION_GUIDE.md | Installation goes in description or SKILL.md |
| QUICK_REFERENCE.md | That's what SKILL.md is for |
| CHANGELOG.md | Version history doesn't help the agent |
| CONTRIBUTING.md | Meta-documentation about contribution |
| LICENSE.md | Legal text wastes tokens |
| .github/* | CI/CD configs irrelevant to agent |

### The principle:

If it's **about the skill** rather than **for using the skill**, don't include it.

## Content to Avoid in SKILL.md

### "When to Use This Skill" sections

```markdown
WRONG (in SKILL.md body):
## When to Use This Skill
- When working with Tauri
- When building desktop apps
- When you need...

RIGHT: Put this in the description field only
```

The description is THE trigger mechanism. Don't duplicate it in the body.

### Lengthy introductions

```markdown
WRONG:
# My Skill

Welcome to this skill! This skill was created to help you
with X, Y, and Z. It covers many topics including A, B, C.
Let me explain the history of why this skill exists...

RIGHT:
# My Skill

[Immediately useful content]
```

### Meta-commentary

```markdown
WRONG:
## About This Section
This section will teach you about patterns.
Below you'll find several examples.

RIGHT:
## Patterns
[The actual patterns]
```

### Obvious statements

```markdown
WRONG:
## Important Note
It's important to handle errors properly.
Errors can cause problems if not handled.

RIGHT:
## Error Handling
[Specific error handling pattern]
```

## The Token Cost Test

For every piece of content, ask:

1. **Does the agent already know this?** → Remove it
2. **Is this about the skill rather than for using it?** → Remove it
3. **Would the agent perform worse without this?** → Keep it
4. **Is this duplicated elsewhere?** → Remove the duplicate

## Examples

### Before (cluttered)
```
skill/
├── SKILL.md
├── README.md           ← duplicate of SKILL.md
├── INSTALLATION.md     ← should be in SKILL.md
├── CHANGELOG.md        ← agent doesn't need this
├── QUICK_REFERENCE.md  ← that's what SKILL.md is
├── references/
│   ├── overview.md     ← duplicate of SKILL.md intro
│   └── api.md
└── docs/               ← wrong directory name
    └── guide.md
```

### After (lean)
```
skill/
├── SKILL.md
└── references/
    └── api.md
```

## The "Already Knows" Principle

The agent is already capable. It knows:
- How to write code in common languages
- Standard patterns and practices
- How to read documentation
- How to solve problems

Only include what the agent **doesn't** know:
- Domain-specific patterns
- Non-obvious gotchas
- Decisions between alternatives
- Specific API details not in training data

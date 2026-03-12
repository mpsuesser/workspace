# Skill Routing Issues

The AI loads your skill but reads the wrong reference files.

## Symptoms

- Loads configuration.md when you're implementing features
- Loads api.md when you're setting up a project
- Loads everything instead of targeted files
- Misses the most relevant file for the task

## Root Cause

No explicit guidance on which files to load for which tasks.

## Solution: Task Router Table

Add a routing table to SKILL.md:

```markdown
## When to Load What

| User Task | Load These |
|-----------|------------|
| "Set up X" / "Configure X" | README.md + configuration.md |
| "Implement X" / "Build X" | README.md + api.md + patterns.md |
| "Fix X" / "Debug X" / "Error with X" | gotchas.md |
| "Best practice for X" | patterns.md |
| "How does X work" | README.md |
```

## Solution: Decision Tree with Destinations

```markdown
## Task Router

What do you need?
├─ Initial setup → Read configuration.md
├─ API reference → Read api.md
├─ Common patterns → Read patterns.md
├─ Troubleshooting → Read gotchas.md
└─ Overview → Read README.md
```

## Solution: File Purpose Headers

Start each reference file with its purpose:

```markdown
# Workers API Reference

**Load this file when:** Implementing features, calling APIs, 
understanding method signatures.

**Don't load this for:** Initial setup (see configuration.md), 
debugging (see gotchas.md).
```

## Anti-Patterns

### No Routing Guidance
```markdown
# My Skill

Here's everything about X...

## See Also
- api.md
- configuration.md
- patterns.md
- gotchas.md
```

The AI has no guidance on which to load.

### Overlapping Content

```markdown
# api.md
## Configuration
[Config stuff that belongs in configuration.md]

# configuration.md  
## API Setup
[API stuff that belongs in api.md]
```

Split content cleanly by purpose.

### Deep Reference Chains

```markdown
# README.md
For setup, see configuration.md

# configuration.md
For bindings, see bindings.md

# bindings.md
For KV bindings, see kv/bindings.md
```

The AI loses track. Keep references one level deep.

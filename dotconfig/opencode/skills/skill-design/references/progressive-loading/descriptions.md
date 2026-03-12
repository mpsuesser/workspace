# Writing Triggering Descriptions

The `description` field is THE primary (and only) triggering mechanism. Get it wrong and your skill never activates. Get it right and it triggers exactly when needed.

## Critical Rule

**All "when to use" information goes in the description, NOT in the SKILL.md body.**

The body is only loaded AFTER triggering. Putting "When to Use This Skill" sections in the body is wasteful—the skill already triggered, that information served its purpose.

```yaml
# RIGHT: Trigger info in description
---
name: my-skill
description: Use when building desktop apps with Tauri, configuring 
  permissions, or calling Rust from JavaScript.
---

# SKILL.md body starts with useful content, not "when to use"
```

```markdown
# WRONG: Duplicate trigger info in body
---
name: my-skill
description: Tauri skill
---

## When to Use This Skill   ← REMOVE THIS
- When building desktop apps  ← Already in description
- When configuring Tauri      ← Already in description
```

## Anatomy of a Good Description

```yaml
description: [What it covers] + [When to use] + [Key terms]
```

### Example: Cloudflare Skill

```yaml
description: Comprehensive Cloudflare platform skill covering Workers, 
  Pages, storage (KV, D1, R2), AI (Workers AI, Vectorize, Agents SDK), 
  networking (Tunnel, Spectrum), security (WAF, DDoS), and 
  infrastructure-as-code (Terraform, Pulumi). Use for any Cloudflare 
  development task.
```

Breakdown:
- **What**: "Comprehensive Cloudflare platform skill covering..."
- **Key terms**: Workers, Pages, KV, D1, R2, Vectorize, Tunnel, WAF...
- **When**: "Use for any Cloudflare development task"

## Good vs Bad Descriptions

### Too Vague
```yaml
# BAD - won't trigger on specific queries
description: Helps with cloud stuff
```

### Too Narrow
```yaml
# BAD - misses related queries
description: How to deploy Workers
```

### Just Right
```yaml
# GOOD - specific but comprehensive
description: Cloudflare Workers deployment, configuration, and runtime 
  APIs. Use when building serverless functions, edge computing, or 
  deploying to Cloudflare's network.
```

## Include Key Terms

Think about what users will ask:

```yaml
# For a testing skill
description: Effect testing patterns using @effect/vitest for Effect 
  code and vitest for pure functions. Covers service tests, Layer 
  testing, time-dependent effects, error assertions, and property-based 
  testing. Use when writing tests for Effect-based applications.
```

Key terms included:
- @effect/vitest, vitest (libraries)
- service tests, Layer testing (concepts)
- time-dependent, error assertions (specific patterns)
- property-based testing (technique)

## Length Guidelines

- **Minimum**: 50 characters (enough for basic matching)
- **Target**: 150-300 characters (rich matching without bloat)
- **Maximum**: 1024 characters (spec limit)

## Testing Your Description

Ask: "If a user says X, would this description match?"

```yaml
description: Effect Schema composition patterns...
```

Would match:
- "How do I compose schemas?"
- "Schema transformation in Effect"
- "Validate data with Effect Schema"

Would NOT match (add these terms if needed):
- "Parse JSON with Effect" → add "parsing"
- "Decode unknown data" → add "decode, unknown"

## Common Patterns

### Platform Skills
```yaml
description: [Platform] [product list]. Use for any [platform] development.
```

### Library Skills
```yaml
description: [Library] patterns for [use cases]. Covers [key concepts]. 
  Use when [trigger conditions].
```

### Technique Skills
```yaml
description: [Technique] using [tools/approaches]. Apply when [conditions].
```

## Checklist

Before finalizing a skill:

- [ ] Description contains ALL trigger conditions
- [ ] Description includes key technology terms
- [ ] Description is 150-300 characters (target range)
- [ ] SKILL.md body has NO "When to Use" section
- [ ] Body immediately provides useful content

# Skill Triggering Issues

Your skill is installed but never activates.

## Diagnostic Checklist

1. **Verify location**: `.opencode/skill/<name>/SKILL.md`
2. **Check frontmatter**: Both `name` and `description` present
3. **Validate name format**: lowercase, hyphens only, 1-64 chars
4. **Test description**: Does it contain terms users actually say?

## Common Problems

### Frontmatter Syntax Error

```yaml
# WRONG - missing quotes around special characters
---
name: my-skill
description: Use for "complex" tasks
---

# RIGHT
---
name: my-skill
description: 'Use for "complex" tasks'
---
```

### Name Format Invalid

```yaml
# WRONG
name: My_Skill        # underscores
name: mySkill         # camelCase  
name: my--skill       # double hyphen
name: -my-skill       # leading hyphen

# RIGHT
name: my-skill
name: myskill
name: my-complex-skill-name
```

### Description Too Generic

```yaml
# WON'T TRIGGER - matches nothing specific
description: A helpful skill

# WILL TRIGGER - specific terms
description: Cloudflare Workers serverless functions, KV storage, 
  D1 SQL database. Use for edge computing and Cloudflare development.
```

## Testing Triggers

Mental test: "If someone asks X, would this skill be relevant?"

```yaml
description: Effect error handling with Schema.TaggedErrorClass, catchTag, 
  and typed error channels
```

Would trigger on:
- "How do I handle errors in Effect?"
- "What is TaggedError?"
- "catchTag vs catch"

Would NOT trigger on:
- "How do I log errors?" (missing "logging" terms)
- "Effect testing" (different skill domain)

## Description Keywords by Domain

### Platform Skills
Include: platform name, all product names, common tasks

### Library Skills  
Include: library name, package name, key APIs, use cases

### Pattern Skills
Include: pattern name, problem it solves, technologies involved

## Debugging Steps

1. Check skill appears in `<available_skills>` system prompt
2. Ask the AI directly: "What skills do you have available?"
3. Explicitly request: "Load the X skill and help me with Y"
4. If explicit load works but auto-trigger doesn't → improve description

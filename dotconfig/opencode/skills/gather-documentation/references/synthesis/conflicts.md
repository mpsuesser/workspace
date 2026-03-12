# Resolving Source Conflicts

When different sources say different things.

## Common Conflict Types

### Type 1: Outdated Official Docs

**Symptoms:**
- Official docs show old API
- GitHub examples use newer API
- Changelog confirms change

**Resolution:**
```markdown
## Pattern: [Current Approach]

[Current pattern from GitHub/changelog]

**Note:** Official docs may show older `oldMethod()`. 
Use `newMethod()` as of v2.0.
```

### Type 2: Multiple Valid Approaches

**Symptoms:**
- Docs show one way
- Community commonly uses another
- Both work correctly

**Resolution:**
```markdown
## Pattern: [Name]

**Official approach:**
\`\`\`typescript
official_way()
\`\`\`

**Alternative:** Community often uses:
\`\`\`typescript
alternative_way()
\`\`\`

Both are valid. Official approach recommended for [reason].
```

### Type 3: Platform/Version Differences

**Symptoms:**
- Works one way on macOS
- Different on Windows
- Or differs between versions

**Resolution:**
```markdown
## Pattern: [Name]

\`\`\`typescript
cross_platform_approach()
\`\`\`

**Platform notes:**
- macOS: [specifics]
- Windows: [specifics]
- Linux: [specifics]
```

### Type 4: Docs vs Reality

**Symptoms:**
- Docs say X should work
- In practice, X doesn't work
- Issues confirm the gap

**Resolution:**
```markdown
## Gotcha: [Name]

**Documented behavior:** X

**Actual behavior:** Y

**Workaround:**
\`\`\`typescript
workaround_code()
\`\`\`

**Tracking:** github.com/org/repo/issues/123
```

## Conflict Resolution Rules

### Rule 1: Verify Before Overriding

Don't assume GitHub is right:
1. Check official changelog
2. Check official GitHub repo (may be ahead of docs)
3. Check issue responses from maintainers

### Rule 2: Prefer Official When Equivalent

If both approaches work equally:
- Use official as primary
- Mention alternative if widely used

### Rule 3: Note the Conflict

When a conflict exists, document it:
```markdown
**Note:** Official docs recommend X, but Y is common 
in practice due to [reason].
```

### Rule 4: Date Your Sources

Help future updates:
```markdown
**As of v2.5 (2024-01):** [pattern]
```

## Verification Checklist

Before including a non-official pattern:

- [ ] Verified in multiple sources?
- [ ] Maintainer-endorsed in issues?
- [ ] Works in current version?
- [ ] Clear why it differs from docs?
- [ ] Noted as alternative, not primary?

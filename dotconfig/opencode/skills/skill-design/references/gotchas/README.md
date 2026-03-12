# Skill Authoring Gotchas

Common mistakes when writing skills, and how to avoid them.

## Issue: Skill Never Triggers

**Symptom:** Your skill exists but the AI never loads it.

**Causes:**
1. Description too vague - doesn't match user queries
2. Description missing key terms users actually say
3. Skill in wrong location

**Solutions:**
- Add specific product/library names to description
- Include action words: "Use when building...", "Apply for..."
- Verify path: `.opencode/skill/<name>/SKILL.md`

See: [../progressive-loading/descriptions.md](../progressive-loading/descriptions.md)

## Issue: AI Loads Wrong References

**Symptom:** AI loads configuration.md when you're debugging.

**Cause:** No routing guidance in SKILL.md.

**Solution:** Add explicit loading hints:

```markdown
## Task Router

| Task | Files to Load |
|------|---------------|
| Setup | README.md + configuration.md |
| Implement | api.md + patterns.md |
| Debug | gotchas.md |
```

See: [routing.md](./routing.md)

## Issue: Skill Too Large

**Symptom:** Context window bloat, slow loading, truncation.

**Cause:** Monolithic SKILL.md with everything inline.

**Solution:** 
- Extract to references/ directory
- Use progressive loading
- Split large topics

See: [size.md](./size.md)

## Issue: Examples Don't Work

**Symptom:** Copy-pasted code fails.

**Causes:**
1. Missing imports
2. Assumed context not documented
3. Version drift

**Solution:**
```typescript
// ALWAYS include imports
import { Effect, Schema } from "effect"

// ALWAYS show complete, runnable code
const program = Effect.gen(function* () {
  // ...
})

Effect.runPromise(program)
```

## Issue: Stale Content

**Symptom:** Skill recommends deprecated patterns.

**Cause:** Skills don't auto-update with upstream changes.

**Solution:**
- Date your skill content
- Include version compatibility notes
- Set up periodic review

```yaml
metadata:
  last_updated: "2024-01-15"
  compatible_with: "effect@3.x"
```

## See Also

- [triggering.md](./triggering.md) - Fixing trigger issues
- [routing.md](./routing.md) - Fixing routing issues  
- [size.md](./size.md) - Fixing size issues

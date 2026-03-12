# Skill Iteration

Skills improve through use. This guide covers the iteration cycle.

## The Iteration Loop

```
Use skill on real task
        ↓
Observe agent behavior
        ↓
Identify friction points
        ↓
Implement improvements
        ↓
    (repeat)
```

## What to Observe

### Triggering Behavior

- Does the skill load when it should?
- Does it load when it shouldn't? (false positives)
- Are there queries that should trigger it but don't?

**Fix**: Adjust description keywords

### Reference Loading

- Does the agent load appropriate references?
- Does it load too many references?
- Does it miss relevant references?

**Fix**: Improve task router or loading hints

### Pattern Application

- Does the agent apply patterns correctly?
- Does it miss important patterns?
- Does it misunderstand patterns?

**Fix**: Clarify examples, add anti-patterns

### Decision Making

- Does the agent make good choices?
- Does it struggle with "which approach?" decisions?
- Does it miss important considerations?

**Fix**: Add or refine decision trees

### Error Cases

- What errors does the agent encounter?
- What gotchas does it hit?
- What edge cases surprise it?

**Fix**: Add to gotchas.md

## Common Iteration Patterns

### "The skill never triggers"

1. Check description has relevant keywords
2. Add terms users actually say
3. Test with explicit: "Load the X skill"
4. Compare to skills that do trigger

### "The agent loads everything"

1. Add task-specific loading hints
2. Create task router table
3. Split monolithic references
4. Add clear file purposes

### "The patterns don't help"

1. Add more concrete examples
2. Show before/after transformations
3. Include complete, runnable code
4. Add "when to use" context to patterns

### "The agent makes wrong decisions"

1. Add decision tree for the choice
2. Clarify trade-offs between options
3. Add examples of each option's use case
4. Include "don't use X when..." guidance

### "The agent hits the same gotcha"

1. Add to gotchas.md with clear symptoms
2. Add to relevant pattern as warning
3. Consider if pattern itself needs adjustment
4. Add to decision tree if it's a choice issue

## Measuring Improvement

Track qualitatively:

- Time to complete tasks
- Number of wrong turns
- Need for user correction
- Agent confidence in decisions

## When to Stop Iterating

The skill is mature when:

- Triggers reliably on relevant queries
- Agent loads appropriate references
- Patterns cover common tasks
- Decisions are well-guided
- Gotchas are documented

Some iteration is always possible, but diminishing returns apply. A good skill handles 80% of cases well.

## Version Notes

When making significant changes:

```yaml
metadata:
  last_updated: "2024-01-15"
  compatible_with: "technology v2.x"
```

This helps future maintenance and debugging.

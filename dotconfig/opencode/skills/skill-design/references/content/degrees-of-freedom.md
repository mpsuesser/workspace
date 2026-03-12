# Degrees of Freedom

Match instruction specificity to task fragility and variability.

## The Spectrum

```
High Freedom ←――――――――――――――――――――――――――――――→ Low Freedom
(text guidance)    (pseudocode)    (specific scripts)
```

Think of the agent exploring a path:
- **Open field** → many valid routes (high freedom)
- **Narrow bridge with cliffs** → specific guardrails needed (low freedom)

## When to Use Each Level

### High Freedom: Text-Based Instructions

Use when:
- Multiple approaches are valid
- Decisions depend on context
- Heuristics guide the approach

```markdown
## Creating Components

Create React components following the project's existing patterns.
Use functional components with hooks. Colocate styles when appropriate.
```

### Medium Freedom: Pseudocode or Parameterized Patterns

Use when:
- A preferred pattern exists
- Some variation is acceptable
- Configuration affects behavior

```markdown
## API Error Handling

1. Catch the error
2. If retryable (429, 503): retry with exponential backoff (max 3 attempts)
3. If auth error (401, 403): surface to user with clear message
4. Otherwise: log details, return generic error to user
```

### Low Freedom: Specific Scripts or Exact Sequences

Use when:
- Operations are fragile and error-prone
- Consistency is critical
- A specific sequence must be followed

```markdown
## PDF Rotation

Use the bundled script:
\`\`\`bash
scripts/rotate_pdf.py input.pdf --degrees 90 --output rotated.pdf
\`\`\`

Do not implement rotation manually—the script handles edge cases
around PDF metadata and embedded fonts.
```

## Choosing the Right Level

| Task Characteristic | Freedom Level | Example |
|---------------------|---------------|---------|
| Many valid solutions | High | "Write clear documentation" |
| Best practice exists | Medium | "Handle errors with retry logic" |
| Fragile/error-prone | Low | "Use scripts/deploy.sh exactly" |
| Context-dependent | High | "Choose appropriate data structure" |
| Must be consistent | Low | "Follow the migration script" |
| Has known edge cases | Low | "Use the bundled parser" |

## Anti-Pattern: Wrong Freedom Level

### Too Rigid (frustrating)
```markdown
## Writing Tests

1. Create file named exactly: `{component}.test.tsx`
2. Import exactly: `import { render } from '@testing-library/react'`
3. Write exactly one describe block
...
```

This over-constrains when flexibility is fine.

### Too Loose (unreliable)
```markdown
## Database Migration

Update the schema as needed. Be careful with the data.
```

This under-constrains when precision is critical.

## Scripts for Low-Freedom Tasks

When a task needs low freedom, consider bundling a script:

```
skill/
├── SKILL.md
└── scripts/
    ├── migrate_db.py      # Deterministic migration
    ├── validate_config.sh # Exact validation steps
    └── rotate_pdf.py      # Handles edge cases
```

Scripts can be **executed without loading into context**, saving tokens while ensuring deterministic behavior.

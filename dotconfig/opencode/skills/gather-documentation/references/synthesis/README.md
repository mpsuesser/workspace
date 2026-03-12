# Synthesis

Combining sources into coherent skill material with proper prioritization.

## The Hierarchy

```
When sources conflict or overlap:

1. Official Documentation (ground truth)
   └─ Defines what things ARE
   └─ Defines intended usage
   └─ Overrides everything else

2. Official GitHub Repos
   └─ Supplements official docs
   └─ Provides working examples
   └─ Architecture insights

3. GitHub Search / Community
   └─ Real-world validation
   └─ Alternative patterns
   └─ Edge cases

4. Issues / Discussions
   └─ Gotchas and workarounds
   └─ Known limitations
```

## Synthesis Workflow

### Step 1: Establish Ground Truth

Start with official documentation:
- Core concepts → SKILL.md "Core Patterns"
- API reference → references/api.md
- Configuration → references/configuration.md
- Official gotchas → references/gotchas.md (seed)

### Step 2: Enrich with GitHub Insights

Layer GitHub findings onto the structure:
- Examples validate/illustrate patterns
- Repo analysis may suggest better organization
- Issue mining adds gotchas

### Step 3: Resolve Conflicts

When GitHub shows different patterns than docs:

```
Case: GitHub pattern differs from docs
├─ Docs pattern is correct → Use docs, note GitHub as alternative
├─ Docs are outdated → Verify, use current pattern, note version
├─ Both valid → Use docs as primary, GitHub as "Alternative:"
└─ GitHub is workaround → Put in gotchas, not patterns
```

### Step 4: Fill Gaps

GitHub can fill gaps docs don't cover:
- Integration patterns
- Project structure conventions
- Testing approaches
- Real-world gotchas

### Step 5: Verify (Fabrication Audit)

**Critical for Comprehensive-tier skills.** After drafting content, audit every specific technical claim against fetched sources:

- SDK method names → verified against fetched SDK docs?
- Error codes → verified against fetched error reference?
- Webhook event types → verified against fetched event list?
- Configuration defaults → verified against fetched config docs?
- Code examples → using verified API surface, not guessed methods?

See [verification.md](./verification.md) for the complete audit checklist.

**The rule**: Specific technical claims (method names, error codes, payload fields, defaults) require specific sources. General knowledge is acceptable only for truly generic facts.

## Integration Patterns

### Pattern: Docs + Examples

```markdown
## Pattern: [Name]

[Explanation from official docs]

\`\`\`typescript
// From official docs
official_example()
\`\`\`

**Real-world example:**
\`\`\`typescript
// From github.com/user/repo - shows integration with X
real_world_example()
\`\`\`
```

### Pattern: Docs + Gotchas from Issues

```markdown
## Configuration: [Option]

[Official description from docs]

**Gotcha:** [From GitHub issue]
[Workaround or solution]
```

### Pattern: GitHub Informs Architecture

If GitHub exploration reveals the technology has natural divisions:

```markdown
## Skill Structure (informed by exploration)

Official docs organized by:
- API reference
- Guides

But GitHub reveals users think in:
- Frontend (JS APIs)
- Backend (Rust commands)
- Configuration

→ Structure skill by user mental model, not doc structure
```

## What NOT to Do

### Don't Let GitHub Override Docs

```markdown
WRONG:
"Most repos do X, so that's the pattern"
(Even if docs recommend Y)

RIGHT:
"Official pattern is Y (see docs). 
Alternative: X is common in community repos."
```

### Don't Include Unverified Patterns

```markdown
WRONG:
Including a pattern from 1 random repo

RIGHT:
Including a pattern seen in multiple repos
OR from official examples
OR from high-star, well-maintained repos
```

### Don't Over-Index on Issues

```markdown
WRONG:
Every issue becomes a gotcha

RIGHT:
Patterns from multiple issues
OR issues with official responses
OR issues with many reactions
```

## Output Structure

After synthesis, you should have:

```
skill/
├── SKILL.md
│   ├─ Core concepts (from docs)
│   ├─ Decision trees (from analysis)
│   └─ Quick reference (from docs)
└── references/
    ├─ api.md (docs + type definitions)
    ├─ configuration.md (docs + examples)
    ├─ patterns.md (docs + GitHub examples)
    └─ gotchas.md (docs + issues + community)
```

Each file clearly grounded in official docs, supplemented by GitHub.

Every specific claim (API methods, error codes, config defaults) must trace to a fetched source. See [verification.md](./verification.md).

# GitHub Exploration

GitHub provides breadth, real-world context, and discovery that official docs often lack.

## Role in Skill Creation

GitHub exploration is **supplementary, not primary**:

| GitHub Provides | Official Docs Provide |
|-----------------|----------------------|
| Real-world usage patterns | Intended usage patterns |
| Community solutions | Official solutions |
| Edge cases from issues | Documented edge cases |
| Actual implementations | Reference implementations |
| Architectural insights | Architectural guidance |

**Principle**: Don't let GitHub overpower official docs. Use GitHub to:
- Inform the skill's overall architecture
- Supplement ground truth with real-world patterns
- Discover gotchas from issues
- Find examples official docs lack

## Exploration Strategy

### Phase 1: Map the Landscape (~20% of GitHub time)

```
1. Find the official GitHub org/repos
2. Identify key repos:
   - Main framework/library
   - Examples/demos
   - Plugins/extensions
   - Docs (if separate)
3. Note repo sizes, activity, stars
4. Identify community presence
```

### Phase 2: Deep Dive Official Repos (~40% of GitHub time)

```
1. Analyze repo structure
2. Read key files (README, ARCHITECTURE, CONTRIBUTING)
3. Browse examples/ directory
4. Skim tests for usage patterns
5. Check docs/ if exists
```

### Phase 3: Search for Patterns (~25% of GitHub time)

```
1. Search for specific patterns across GitHub
2. Find real implementations
3. Identify common approaches
4. Note variations and why
```

### Phase 4: Mine Issues/Discussions (~15% of GitHub time)

```
1. Search issues for common problems
2. Find gotchas and workarounds
3. Note closed issues with solutions
4. Check discussions for insights
```

## What to Capture

### From Repo Analysis
- Architecture decisions (from ARCHITECTURE.md, discussions)
- Project structure patterns
- Configuration examples
- Test patterns

### From Examples
- Complete, working implementations
- Different use cases covered
- Patterns not in official docs

### From Issues
- Common problems → gotchas
- Workarounds → patterns
- Limitations → constraints to document

### From Community Repos
- Real-world usage variations
- Popular patterns
- Integration approaches

## Effort Allocation

```
GitHub exploration is higher-effort but shouldn't dominate:

Total gathering time:
├─ Official docs: 40%
├─ GitHub exploration: 35%
│   ├─ Official repos: 15%
│   ├─ Pattern search: 12%
│   └─ Issue mining: 8%
├─ Discovery: 10%
└─ Synthesis: 15%
```

## See Also

- [repo-analysis.md](./repo-analysis.md) - Analyzing repo structure
- [search-patterns.md](./search-patterns.md) - Search strategies
- [issues.md](./issues.md) - Mining issues for gotchas

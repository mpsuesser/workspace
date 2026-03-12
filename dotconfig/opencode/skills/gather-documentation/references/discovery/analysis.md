# Technology Analysis

Understanding a technology's shape before gathering material.

## Why Analysis Matters

The technology's shape determines:
- Skill tier (minimal/standard/comprehensive)
- Reference structure (single file vs 5-file pattern)
- Whether decision trees are needed
- How much GitHub exploration is warranted

## Analysis Framework

### Question 1: What IS this?

```
Library       → Code you import and call
Framework     → Structure that calls your code
Tool          → Standalone executable
Platform      → Multiple products/services
Runtime       → Execution environment
```

### Question 2: How complex is the surface area?

```
Small (1-10 concepts)
├─ Single purpose
├─ Few configuration options
└─ → Minimal skill

Medium (10-50 concepts)
├─ Multiple features
├─ Configuration complexity
└─ → Standard skill

Large (50+ concepts)
├─ Multiple products/tools
├─ "Which one?" questions
└─ → Comprehensive skill
```

### Question 3: Does it have ecosystem?

```
Standalone
├─ No plugins/extensions
├─ Self-contained
└─ → Focus on core only

Ecosystem
├─ Official plugins
├─ Community extensions
├─ Integration points
└─ → Consider plugin coverage
```

### Question 4: What tasks will users do?

```
List the primary tasks:
- Setup/configuration
- Core usage patterns
- Integration with other tools
- Debugging/troubleshooting

Each major task category may warrant a reference file.
```

## Example Analysis: Tauri

```
Q1: What is it?
→ Framework (builds desktop apps from web tech)

Q2: Surface area?
→ Medium-Large
  - Core APIs (window, menu, dialog, etc.)
  - Configuration (tauri.conf.json)
  - Plugins (fs, shell, http, etc.)
  - Build/bundle process
  - Platform differences (macOS, Windows, Linux)

Q3: Ecosystem?
→ Yes
  - Official plugins (plugins-workspace)
  - Community plugins
  - Tooling (create-tauri-app, tauri-cli)

Q4: User tasks?
→ Primary tasks:
  - Create new app
  - Configure permissions
  - Use Tauri APIs from JS
  - Build for distribution
  - Debug platform issues

Analysis output:
→ Standard to Comprehensive tier
→ Decision trees: plugin selection, platform handling
→ 5-file pattern for core Tauri
→ Separate references for major plugin categories
```

## Analysis Output Template

```yaml
technology: {name}
type: library | framework | tool | platform | runtime

surface_area: small | medium | large
key_concepts:
  - concept1
  - concept2
  
has_ecosystem: true | false
ecosystem_components:
  - component1
  - component2

primary_tasks:
  - task1
  - task2

recommended_tier: minimal | standard | comprehensive
decision_trees_needed:
  - tree1 (e.g., "which plugin for X")
reference_structure:
  - reference1/
  - reference2/
```

## Red Flags

Watch for complexity signals:

| Signal | Implication |
|--------|-------------|
| Multiple "getting started" guides | Platform with products |
| "vs" comparisons in docs | Decision trees needed |
| Platform-specific sections | May need per-platform gotchas |
| Migration guides | Version-specific considerations |
| "Which X should I use?" FAQ | Decision tree candidate |

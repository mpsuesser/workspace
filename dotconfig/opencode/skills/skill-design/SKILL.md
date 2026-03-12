---
name: skill-design
description: Design effective opencode skills with proper structure, content organization, and progressive loading. Use when creating new skills, improving existing ones, or deciding between minimal vs comprehensive skill architectures.
---

# Skill Design

Skills are reusable instruction packages that give agents specialized knowledge. This skill helps you design skills that scale from simple single-file instructions to comprehensive platform coverage.

## Core Philosophy

**The context window is a public good.** Skills share context with everything else: system prompt, conversation history, other skills, user requests.

**The agent is already capable.** Only add what the agent doesn't already know. Challenge every piece of content: "Does this justify its token cost?" Prefer concise examples over verbose explanations.

**Encode judgment, not just information.** The best skills help agents make decisions, not just follow instructions. Teach the agent to think like a domain expert.

## Task Router

**What are you trying to do?**

```
Building a new skill?
├─ Simple pattern/style guide → references/structure/minimal.md
├─ Single domain with examples → references/structure/standard.md
├─ Complex platform (multiple products) → references/structure/comprehensive.md
└─ Unsure about scope → references/structure/README.md

Writing skill content?
├─ Need decision trees (product selection) → references/decision-trees/
├─ Writing code examples → references/content/examples.md
├─ Writing gotchas/pitfalls → references/gotchas/writing.md
└─ General content principles → references/content/README.md

Organizing reference files?
├─ When to use the 5-file pattern → references/reference-files/README.md
├─ Writing api.md files → references/reference-files/api.md
├─ Writing configuration.md → references/reference-files/configuration.md
├─ Writing patterns.md → references/reference-files/patterns.md
├─ Writing gotchas.md → references/reference-files/gotchas.md
└─ Cross-referencing between files → references/reference-files/cross-refs.md

Optimizing for token efficiency?
├─ Progressive loading strategy → references/progressive-loading/README.md
├─ Writing triggering descriptions → references/progressive-loading/descriptions.md
└─ Structuring for partial loads → references/progressive-loading/structure.md

Debugging skill issues?
├─ Skill not triggering → references/gotchas/triggering.md
├─ AI loading wrong references → references/gotchas/routing.md
├─ Content too large → references/gotchas/size.md
└─ Common mistakes → references/gotchas/README.md
```

## Quick Reference: Skill Tiers

| Tier | SKILL.md | Total | When to Use |
|------|----------|-------|-------------|
| **Minimal** | 50-150 lines | 50-150 | Style guides, simple patterns, mental models |
| **Standard** | <300 lines | 300-1000 | Single domain with multiple aspects |
| **Comprehensive** | <500 lines | 1000+ | Platforms with multiple products/tools |

**Critical limit**: SKILL.md body should stay under **500 lines**. Split to references/ when approaching this limit.

## Frontmatter (Required)

```yaml
---
name: skill-name           # 1-64 chars, lowercase, single hyphens
description: When and why  # 1-1024 chars, triggers skill loading
---
```

The `description` determines when the AI loads your skill. Be specific about:
- What the skill covers (capabilities)
- When to use it (trigger conditions)  
- Key domain terms (for matching)

## Directory Structure

```
.opencode/skill/<name>/
├── SKILL.md              # Required: router + core instructions
├── scripts/              # Optional: executable code (deterministic tasks)
├── references/           # Optional: documentation loaded on demand
│   └── <topic>/
│       ├── README.md     # Overview, when to use
│       ├── api.md        # API reference
│       ├── patterns.md   # Usage patterns
│       └── gotchas.md    # Pitfalls, limitations
└── assets/               # Optional: output files (templates, icons, fonts)
```

**Key distinction:**
- `references/` → Loaded INTO context when needed
- `scripts/` → Executed WITHOUT loading into context  
- `assets/` → Used in OUTPUT, never loaded into context

## Core Principle

> The best skills don't just provide information. They help the AI make decisions.

A flat list of API methods is useful. A decision tree that helps choose between approaches based on requirements changes how the AI works with you.

Encode **architectural judgement**, not just documentation. Teach the AI to think like a domain expert: assess the problem, pick the right tool, configure it correctly, avoid the pitfalls.

## In This Skill

| Reference | When to Load |
|-----------|--------------|
| [structure/](./references/structure/) | Deciding skill architecture |
| [content/](./references/content/) | Writing skill content and examples |
| [decision-trees/](./references/decision-trees/) | Building navigation trees |
| [reference-files/](./references/reference-files/) | Using the 5-file pattern |
| [progressive-loading/](./references/progressive-loading/) | Token optimization |
| [workflow/](./references/workflow/) | Creation and iteration process |
| [gotchas/](./references/gotchas/) | Debugging skill issues |

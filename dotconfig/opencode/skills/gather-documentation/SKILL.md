---
name: gather-documentation
description: Gather reference material for building skills or understanding technologies. Covers source discovery, official documentation retrieval, GitHub exploration, and synthesis strategies. Use when building skills, researching unfamiliar technologies, or collecting reference material.
---

# Gather Documentation

Systematic approach to collecting reference material for skill creation or technology research.

## Source Hierarchy

```
LLM-Consumable Docs (highest priority — complete ground truth)
├─ llms-full.txt (full content of all doc pages, single file)
├─ llms.txt (structured index with page URLs and descriptions)
└─ .well-known/llms.txt (alternative location)

Ground Truth (primary, authoritative)
├─ Official documentation websites
├─ Official API references
└─ Official guides/tutorials

Breadth & Discovery (supplementary, architectural influence)
├─ GitHub repositories (official + community)
├─ GitHub search (usage patterns, real implementations)
└─ GitHub issues/discussions (gotchas, edge cases)

Tertiary (validation, edge cases)
├─ Stack Overflow / forums
├─ Blog posts / tutorials
└─ Conference talks / videos
```

**Principle**: `llms-full.txt` is the single most valuable source — if it exists, it contains the COMPLETE documentation in one file. Official docs are source of truth. GitHub provides breadth. Don't fabricate content from general knowledge — every fact must trace to a fetched source.

## Task Router

```
What are you trying to do?

Discovering sources for a technology?
├─ Don't know where docs are → references/discovery/README.md
├─ Need to find official sources → references/discovery/strategies.md
├─ Need to scope the technology → references/discovery/analysis.md
└─ Looking for LLM-consumable docs → references/official-docs/llm-docs.md

Retrieving official documentation?
├─ LLM-consumable docs (llms.txt) → references/official-docs/llm-docs.md
├─ Web-based docs → references/official-docs/retrieval.md
├─ API reference material → references/official-docs/api-docs.md
└─ Deciding what to capture → references/official-docs/README.md

Exploring GitHub for breadth?
├─ Finding the right repos → references/github/README.md
├─ Analyzing repo structure → references/github/repo-analysis.md
├─ Searching for patterns → references/github/search-patterns.md
└─ Mining issues/discussions → references/github/issues.md

Combining sources into skill material?
├─ Prioritizing sources → references/synthesis/README.md
├─ Resolving conflicts → references/synthesis/conflicts.md
├─ Structuring the output → references/synthesis/structure.md
└─ Verifying content (fabrication audit) → references/synthesis/verification.md
```

## Workflow Overview

### Phase 0: LLM-Consumable Docs Check (~5% of effort)
**ALWAYS do this first.** Check if `llms.txt` or `llms-full.txt` exists at the docs site. This single file can replace 90%+ of individual page fetching.

### Phase 1: Discovery (~10% of effort)
Identify what exists: official docs URL, GitHub org, key repos.

### Phase 2: Official Documentation (~35% of effort)
Retrieve ground truth: core concepts, API reference, official patterns. Use `llms-full.txt` if available, otherwise fetch individual pages.

### Phase 3: GitHub Exploration (~30% of effort)
Gather breadth: real implementations, community patterns, gotchas from issues.

### Phase 4: Synthesis (~10% of effort)
Combine sources: official docs as foundation, GitHub as supplementary context.

### Phase 5: Verification (~10% of effort)
Audit every code example, API method, error code, and technical claim against a fetched source. Flag anything that cannot be traced to a source as "unverified" or remove it.

## Quick Start

For a technology like "Telnyx":

1. **LLM Docs**: Check `https://developers.telnyx.com/llms.txt` and `/llms-full.txt` — if full.txt exists, it contains ALL docs
2. **Discover**: Find developers.telnyx.com (official), github.com/team-telnyx (org)
3. **Official**: If no llms-full.txt, retrieve core concepts, API reference, configuration
4. **GitHub**: Explore team-telnyx/telnyx-node, search for usage patterns, mine issues for gotchas
5. **Synthesize**: Structure skill with official docs as ground truth, GitHub insights as supplements
6. **Verify**: Audit every code example and API method against fetched content

## In This Skill

| Reference | When to Load |
|-----------|--------------|
| [discovery/](./references/discovery/) | Finding sources for unfamiliar tech |
| [official-docs/](./references/official-docs/) | Retrieving authoritative material |
| [official-docs/llm-docs.md](./references/official-docs/llm-docs.md) | Working with llms.txt / llms-full.txt |
| [github/](./references/github/) | Breadth exploration and patterns |
| [synthesis/](./references/synthesis/) | Combining sources appropriately |
| [synthesis/verification.md](./references/synthesis/verification.md) | Fabrication audit and provenance |

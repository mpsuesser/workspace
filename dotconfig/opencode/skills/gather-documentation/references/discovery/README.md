# Source Discovery

Finding where documentation and reference material lives for a technology.

## Discovery Checklist

For any technology, identify:

- [ ] **Official website** (docs, guides, API reference)
- [ ] **GitHub organization** (repos, examples, issues)
- [ ] **Package registry** (npm, crates.io, PyPI)
- [ ] **Technology scope** (single tool vs platform vs ecosystem)

## Quick Discovery Pattern

```
1. Web search: "{technology} official documentation"
   → Find official docs URL

2. Web search: "{technology} github"
   → Find GitHub org/repo

3. Check official docs for:
   - GitHub link (usually in header/footer)
   - API reference section
   - Getting started guide

4. Check GitHub repo for:
   - docs/ directory
   - examples/ directory
   - Link back to official docs
```

## Scoping the Technology

Before gathering material, understand what you're dealing with:

```
Is this technology...

A single tool/library?
├─ One main repo
├─ One set of docs
└─ → Minimal or Standard skill tier

A framework with plugins/ecosystem?
├─ Core + extensions
├─ Multiple doc sections
└─ → Standard skill tier

A platform with multiple products?
├─ Multiple repos/tools
├─ "Which one should I use?" is a question
└─ → Comprehensive skill tier
```

## Example: Discovering Tauri

```
1. Search "tauri official documentation"
   → https://tauri.app/

2. Search "tauri github"
   → https://github.com/tauri-apps

3. Explore tauri.app:
   - Docs: https://tauri.app/v1/guides/
   - API: https://tauri.app/v1/api/
   - Links to GitHub

4. Explore github.com/tauri-apps:
   - tauri (main framework)
   - tauri-docs (documentation source)
   - plugins-workspace (official plugins)
   - create-tauri-app (scaffolding)

5. Scope assessment:
   - Framework with plugin ecosystem
   - Multiple products (core, plugins, tooling)
   - "Which plugin?" is sometimes a question
   → Standard to Comprehensive tier
```

## Tools for Discovery

| Tool | Use For |
|------|---------|
| `mcp_webfetch` | Fetch official docs pages |
| `mcp_github_search_repos` | Find repos by technology |
| `mcp_parallel_web_search` | Broad discovery search |

## See Also

- [strategies.md](./strategies.md) - Detailed discovery strategies
- [analysis.md](./analysis.md) - Analyzing technology scope

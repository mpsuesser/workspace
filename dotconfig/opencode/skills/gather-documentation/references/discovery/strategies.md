# Discovery Strategies

Detailed approaches for finding documentation sources.

## Strategy 0: LLM-Consumable Docs (Check FIRST)

**Always try this before any other strategy.** Many doc sites now provide machine-readable files:

```
1. Check: https://{docs-domain}/llms-full.txt  → Complete docs in one file
2. Check: https://{docs-domain}/llms.txt       → Structured index with URLs
3. Check: https://{docs-domain}/.well-known/llms.txt  → Alternative location
```

If `llms-full.txt` exists, it contains the COMPLETE documentation. A single fetch replaces hundreds of page-by-page retrievals. This file is the highest-value source you can find.

If only `llms.txt` exists, it provides a structured index of all pages — use it to scope the technology and plan targeted retrieval.

See `references/official-docs/llm-docs.md` for detailed processing guidance.

## Strategy 1: Official Docs First

Most reliable path to ground truth (when no llms-full.txt exists):

```
1. Web search: "{tech} documentation"
2. Look for official domain (.io, .dev, .app, or company domain)
3. Identify documentation structure:
   - Getting started / Quick start
   - Guides / Tutorials
   - API Reference
   - Configuration
4. Note the docs URL pattern for systematic retrieval
```

### Recognizing Official Sources

| Signal | Likely Official |
|--------|-----------------|
| {tech}.io, {tech}.dev, {tech}.app | Yes |
| Company domain (e.g., vercel.com/docs) | Yes |
| "Official" in title/description | Yes |
| Links FROM GitHub README | Yes |
| Read the Docs ({tech}.readthedocs.io) | Often official |
| Medium, dev.to | Usually not official |

## Strategy 2: GitHub Organization Mapping

Find the GitHub presence:

```
1. Search GitHub for the technology name
2. Look for:
   - Verified organization
   - High star count
   - Active maintenance
3. Map the org structure:
   - Main repo (framework/library)
   - Docs repo (if separate)
   - Examples repo
   - Plugins/extensions repos
```

### GitHub Org Patterns

| Pattern | Example |
|---------|---------|
| Single repo | facebook/react |
| Org with main + ecosystem | tauri-apps/tauri, tauri-apps/plugins-workspace |
| Monorepo | vercel/next.js (includes examples) |
| Docs as separate repo | {org}/{tech}-docs |

## Strategy 3: Package Registry Exploration

For libraries, start at the package registry:

```
npm: https://www.npmjs.com/package/{package}
crates.io: https://crates.io/crates/{crate}
PyPI: https://pypi.org/project/{package}

Look for:
- Homepage link → official docs
- Repository link → GitHub
- Documentation link → API docs
```

## Strategy 4: README Mining

The GitHub README often contains:

```markdown
## Documentation
- [Official Docs](https://...)
- [API Reference](https://...)
- [Examples](./examples)

## Related Projects
- [Plugin A](https://...)
- [Plugin B](https://...)
```

Extract these links as your source map.

## Strategy 5: Docs-as-Code Detection

Many projects store docs in the repo:

```
Look for:
- docs/ directory
- website/ directory (often Docusaurus)
- .md files in root (CONTRIBUTING, ARCHITECTURE)
- mdx files (documentation with components)
```

These can be read directly from GitHub, avoiding web scraping.

## Output: Source Map

After discovery, produce a source map:

```yaml
technology: tauri
official_docs: https://tauri.app/v1/guides/
api_reference: https://tauri.app/v1/api/
github_org: tauri-apps
key_repos:
  - tauri (main framework)
  - plugins-workspace (official plugins)
  - tauri-docs (docs source)
scope: framework with ecosystem
skill_tier: standard to comprehensive
```

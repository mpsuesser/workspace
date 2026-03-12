# Documentation Retrieval

Techniques for fetching and processing official documentation.

## Tools Available

| Tool | Best For |
|------|----------|
| `mcp_webfetch` | Single pages, specific URLs, llms-full.txt |
| `mcp_parallel_web_search` | Finding specific doc pages |
| `mcp_task` (explore agent) | Parallel extraction from large files |
| GitHub raw files | Docs stored in repos |

## Pre-Retrieval: Check for llms-full.txt

**ALWAYS check this first.** If the docs site provides an llms-full.txt file, it contains the complete documentation in a single fetch. See `llm-docs.md` for details.

```
1. Fetch: https://{docs-domain}/llms-full.txt
2. If exists → You have complete ground truth. Index by section, extract targeted content.
3. If 404 → Fetch llms.txt for structured index, then fall back to patterns below.
```

## Retrieval Patterns

### Pattern 1: Index-Driven

Start with the docs index/sidebar:

```
1. Fetch docs homepage
2. Extract navigation structure
3. Build URL list from nav
4. Fetch each page systematically
```

Example:
```
Fetch: https://tauri.app/v1/guides/
Extract: [getting-started, features/command, features/event, ...]
Fetch each: https://tauri.app/v1/guides/getting-started
            https://tauri.app/v1/guides/features/command
            ...
```

### Pattern 2: Sitemap-Based

Some sites have sitemaps:

```
1. Check /sitemap.xml
2. Filter to documentation URLs
3. Fetch relevant pages
```

### Pattern 3: Search-Targeted

When you know what you need:

```
1. Web search: "site:tauri.app configuration"
2. Get specific URLs from results
3. Fetch those pages directly
```

### Pattern 4: GitHub Docs Repo

Many projects store docs in GitHub:

```
1. Find docs repo (e.g., tauri-apps/tauri-docs)
2. Navigate to content directory
3. Read markdown files directly
4. Preserves full content without HTML parsing
```

## Processing Retrieved Content

### Clean HTML Noise
Web-fetched docs include navigation, footers, etc. Focus on main content.

### Preserve Code Examples
Code blocks are high-value. Extract them intact.

### Note URL Patterns
```
https://tauri.app/v1/api/js/window
               │   │   │    └── specific API
               │   │   └── language
               │   └── category
               └── version
```

Understanding patterns helps systematic retrieval.

### Handle Versioning
```
/v1/guides/...  → Version 1 docs
/v2/guides/...  → Version 2 docs

Check which version is current. Note differences if relevant.
```

## Chunking Large Docs

For very large doc sets:

```
Priority 1: Core concepts, getting started
Priority 2: API reference for main modules
Priority 3: Configuration reference
Priority 4: Advanced topics, edge cases

Gather Priority 1-3 thoroughly.
Skim Priority 4, capture only gotchas.
```

## Handling Fetch Failures

When a webfetch call returns 404 or fails:

```
1. Try URL variations:
   - With/without trailing slash
   - With/without .md extension  
   - With/without /docs/ prefix
   - lowercase vs original case
2. Check if URL has moved (look for redirect in response)
3. Try web search: "site:{domain} {specific-topic}"
4. Log the failure explicitly — do NOT silently skip
5. NEVER fabricate content to fill gaps from failed fetches
```

If multiple consecutive fetches fail, pause and investigate:
- Is the docs site down?
- Has the URL structure changed?
- Is there a rate limit in effect?
- Should you switch to the GitHub docs repo instead?

## Rate Limiting

When fetching many pages:

- Add delays between requests
- Batch related pages together
- Consider if GitHub docs repo is available (no rate limits for reading)

## Output Format

Structure retrieved content for synthesis:

```yaml
source: https://tauri.app/v1/guides/features/command
section: Core Concepts > Commands
key_points:
  - Commands are type-safe IPC between frontend and backend
  - Defined with #[tauri::command] macro
  - Called from JS with invoke()
code_examples:
  - |
    #[tauri::command]
    fn greet(name: &str) -> String {
      format!("Hello, {}!", name)
    }
gotchas:
  - Commands are async by default in JS
  - Must register commands in builder
```

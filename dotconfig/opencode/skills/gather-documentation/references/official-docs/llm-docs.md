# LLM-Consumable Documentation (llms.txt)

Many documentation sites now provide machine-readable documentation files designed for LLM consumption. These are by far the most efficient source of ground truth.

## What Are llms.txt Files?

The `llms.txt` specification (https://llmstxt.org/) defines a standard for providing LLM-friendly documentation:

| File | Purpose | Typical Size |
|------|---------|-------------|
| `llms.txt` | Structured index of all doc pages with URLs and descriptions | 10KB-500KB |
| `llms-full.txt` | **Complete content** of all doc pages in one file | 500KB-10MB+ |
| `.well-known/llms.txt` | Alternative location (same as above) | — |

**`llms-full.txt` is the holy grail.** It contains the FULL text of every documentation page — API references, guides, tutorials, code examples — all in one file. A single fetch replaces hundreds of individual page retrievals.

## Discovery: How to Check

**ALWAYS check these URLs before fetching individual pages:**

```
1. https://{docs-domain}/llms-full.txt     ← Check this first
2. https://{docs-domain}/llms.txt          ← Structured index
3. https://{docs-domain}/.well-known/llms.txt
```

Example:
```
https://developers.telnyx.com/llms-full.txt     → 4MB, 112K lines, complete docs
https://docs.anthropic.com/llms-full.txt        → Complete API reference
https://docs.stripe.com/llms.txt                → Stripe doc index
```

## Processing llms-full.txt

These files are often very large (100K+ lines). The webfetch tool may truncate them. When truncation occurs:

### Strategy 1: Use the truncated output file

When webfetch returns a truncated result, it saves the full content to a file. Read that file using the Read tool with offset/limit to navigate sections.

### Strategy 2: Index first, then extract

```
1. Fetch the file (it gets saved even if truncated)
2. Read the first 200 lines to understand the structure
3. Search for section headers (grep for # or ## patterns)
4. Build a line-number index of product areas
5. Use targeted reads (offset + limit) for each area
```

### Strategy 3: Use explore agents for parallel extraction

For very large files, launch multiple explore agents to extract content from different product areas simultaneously. Each agent reads specific line ranges.

## Processing llms.txt (Index)

The index file (`llms.txt`) contains structured entries:

```markdown
# Product Name

## Docs

- [Page Title](https://docs.example.com/page.md): Brief description of the page content
- [Another Page](https://docs.example.com/other.md): Another description
```

Use this to:
1. **Scope the technology** — count pages per product area
2. **Prioritize retrieval** — identify the most relevant pages
3. **Validate coverage** — ensure your skill covers all major areas

## Structure Patterns

Common structures in llms-full.txt:

| Pattern | Description |
|---------|-------------|
| **API-first** | OpenAPI-derived entries first, guides after | 
| **Two-part** | Part 1: API reference (sparse), Part 2: guides/tutorials (rich) |
| **Flat** | All pages sequentially, each starting with `# Title` |

Each entry typically follows:
```
# Page Title
Source: https://docs.example.com/path/to/page.md
<content of the page>
```

## When llms-full.txt Doesn't Exist

Fall back to the standard retrieval hierarchy:
1. Check for `llms.txt` (index only) — use it to build a fetch plan
2. Check for sitemap.xml — filter to documentation URLs
3. Fetch the docs homepage and extract navigation structure
4. Fetch individual pages systematically

## Minimum Retrieval Depth

For Comprehensive-tier skills, you must actually retrieve content for each product area:

| Skill Tier | Minimum Retrieval |
|------------|-------------------|
| Minimal | 1-2 core concept pages |
| Standard | Getting started + API reference + 2-3 key guides |
| Comprehensive | ≥3 pages per product area, OR llms-full.txt |

**The standard is INGEST, not DISCOVER.** Listing URLs in an index is discovery. Reading the actual content is ingestion. Only ingested content can appear in the skill.

## Failure Handling

When a fetch returns 404 or fails:

```
1. Try URL variations:
   - With/without trailing slash
   - With/without .md extension
   - With/without /docs/ prefix
   - HTTPS vs HTTP
2. Try the docs homepage and navigate from there
3. Try web search: "site:{domain} {topic}"
4. Log the failure — do NOT silently skip and fabricate
```

**Never fabricate content to fill gaps from failed fetches.** If you can't retrieve a source, say so explicitly.

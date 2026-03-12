---
name: github-repo-search
description: Search GitHub repositories using the global_repo_search_query tool. Covers query construction, qualifiers (language, org, stars, topics, etc.), sorting, pagination, and range filters. Use when searching for GitHub repos programmatically.
---

# GitHub Repository Search

Uses the `global_repo_search_query` tool backed by GitHub's search API.

## Parameters

Only `query` is required. Everything else narrows or orders results.

| Parameter | Type | Example |
|-----------|------|---------|
| `query` | string (required) | `"effect typescript"` |
| `language` | string | `"typescript"`, `"rust"` |
| `org` | string | `"Effect-TS"` |
| `user` | string | `"tim-smart"` |
| `topic` | string | `"cli"` |
| `topics` | string[] | `["effect", "typescript"]` |
| `stars` | range string | `">100"`, `"10..50"` |
| `forks` | range string | `">10"` |
| `size` | range string (KB) | `"<1000"` |
| `created` | date range | `">2024-01-01"` |
| `pushed` | date range | `">2024-06-01"` |
| `in` | string | `"name"`, `"description"`, `"readme"` |
| `inReadme` | boolean | `true` |
| `license` | string | `"mit"`, `"apache-2.0"` |
| `archived` | boolean | `false` |
| `fork` | string | `"true"`, `"false"`, `"only"` |
| `sort` | enum | `"stars"`, `"forks"`, `"updated"`, `"help-wanted-issues"` |
| `order` | enum | `"asc"`, `"desc"` |
| `limit` | number | `10` (default 30) |
| `page` | number | `1` |
| `qualifiers` | string[] | Raw qualifiers appended to query |

## Range Syntax

Stars, forks, size: `">100"`, `"<50"`, `"10..100"`, `">=500"`
Dates: `">2024-01-01"`, `"2024-01-01..2024-06-01"`

## Results

Each result returns: `url`, `description`, `topics`, `stargazers_count`, `forks_count`, `updated_at`.

## Effective Patterns

**Start broad, then filter.** GitHub search ANDs the `query` keywords with all qualifier fields — over-constraining returns nothing.

```
# Find popular Effect ecosystem packages
query: "effect", language: "typescript", stars: ">50", sort: "stars"

# Find recent activity in an org
query: "", org: "Effect-TS", pushed: ">2024-01-01", sort: "updated"

# Find repos by topic combination
query: "", topics: ["effect", "ai"], sort: "stars"

# Search README content specifically
query: "Schema.TaggedClass", inReadme: true, language: "typescript"
```

The `qualifiers` array is an escape hatch for anything not covered by named parameters — raw GitHub search qualifier strings appended directly to the query.

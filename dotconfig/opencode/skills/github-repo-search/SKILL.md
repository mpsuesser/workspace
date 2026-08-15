---
name: github-repo-search
description: Search GitHub repositories using the official github_search_repositories MCP tool. Covers GitHub query qualifiers, sorting, pagination, and range filters. Use when searching for GitHub repos programmatically.
---

# GitHub Repository Search

Use the official GitHub MCP tool `github_search_repositories`.

## Parameters

The tool accepts these parameters:

| Parameter        | Type              | Description                                      |
| ---------------- | ----------------- | ------------------------------------------------ |
| `query`          | string (required) | Search terms and all GitHub search qualifiers    |
| `sort`           | enum              | `stars`, `forks`, `updated`, `help-wanted-issues` |
| `order`          | enum              | `asc` or `desc`                                  |
| `perPage`        | number            | Results per page, 1 through 100 (default 30)      |
| `page`           | number            | Page number, starting at 1                        |
| `minimal_output` | boolean           | Return compact repository data (default `true`)   |

Unlike the previous custom tool, filters are not separate parameters. Put them directly in `query` using GitHub repository search syntax.

## Query Qualifiers

| Filter      | Query syntax                         |
| ----------- | ------------------------------------ |
| Language    | `language:typescript`                |
| Owner       | `org:Effect-TS` or `user:tim-smart`  |
| Topic       | `topic:effect topic:typescript`      |
| Search area | `in:name`, `in:description`, `in:readme` |
| Stars       | `stars:>100` or `stars:10..50`       |
| Forks       | `forks:>10`                          |
| Size        | `size:<1000`                         |
| Dates       | `created:>2024-01-01`, `pushed:>2024-06-01` |
| License     | `license:mit`                        |
| State       | `archived:false`, `fork:false`       |

## Range Syntax

Numeric qualifiers support `>100`, `<50`, `10..100`, and `>=500`.
Date qualifiers support `>2024-01-01` and `2024-01-01..2024-06-01`.

## Results

With `minimal_output: true`, the response contains `total_count`, `incomplete_results`, and compact `items` with fields including `name`, `full_name`, `html_url`, `description`, `language`, `stargazers_count`, `forks_count`, `topics`, and activity dates. Use full output only when the task needs additional GitHub API fields.

## Effective Patterns

**Start broad, then filter.** GitHub search ANDs the `query` keywords with all qualifier fields — over-constraining returns nothing.

```
# Find popular Effect ecosystem packages
query: "effect language:typescript stars:>50", sort: "stars", order: "desc"

# Find recent activity in an org
query: "org:Effect-TS pushed:>2024-01-01", sort: "updated", order: "desc"

# Find repos by topic combination
query: "topic:effect topic:ai", sort: "stars", order: "desc"

# Search README content specifically
query: "Schema.TaggedClass in:readme language:typescript"
```

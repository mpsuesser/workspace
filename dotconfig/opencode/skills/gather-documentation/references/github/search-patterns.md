# GitHub Search Patterns

Strategic searching across GitHub for real-world patterns.

## Search Types

### Pattern 1: Usage Pattern Search

Find how people actually use the technology:

```
Search: "{technology} example" OR "{technology} demo"
Filter: Sort by stars, recent updates
Goal: Find well-maintained examples
```

### Pattern 2: Integration Search

Find how the tech integrates with others:

```
Search: "{technology} {other-tech}"
Example: "tauri react", "tauri svelte", "tauri vue"
Goal: Framework-specific patterns
```

### Pattern 3: Problem/Solution Search

Find solutions to specific problems:

```
Search: "{technology} {problem}"
Example: "tauri authentication", "tauri database"
Goal: Real-world problem solutions
```

### Pattern 4: Code Pattern Search

Search for specific code patterns:

```
Search: "import { X } from '{package}'"
Search: "@tauri-apps/api language:typescript"
Goal: Actual usage in codebases
```

## Using mcp_github_search_repos

### Basic Searches

```typescript
// General technology search
mcp_github_search_repos({
  query: "tauri desktop app",
  sort: "stars",
  limit: 20
})

// Language-specific
mcp_github_search_repos({
  query: "tauri",
  language: "typescript",
  sort: "updated"
})

// Topic-based
mcp_github_search_repos({
  query: "tauri",
  topic: "desktop-app"
})
```

### Advanced Filters

```typescript
// Recent, active projects
mcp_github_search_repos({
  query: "tauri",
  pushed: ">2024-01-01",
  stars: ">100"
})

// Specific organization
mcp_github_search_repos({
  query: "plugin",
  org: "tauri-apps"
})

// Exclude forks
mcp_github_search_repos({
  query: "tauri example",
  fork: "false"
})
```

## What to Extract from Search Results

### From High-Star Repos

```
- Project structure patterns
- Configuration approaches
- Architecture decisions
- Popular integrations
```

### From Recent Repos

```
- Current best practices
- Modern API usage
- Updated patterns
```

### From Specific Integrations

```
- Framework-specific patterns
- Integration gotchas
- Setup procedures
```

## Search Strategy by Skill Type

### For Framework Skills (e.g., Tauri)

```
1. "{framework} example" → Basic usage
2. "{framework} {ui-library}" → Integration patterns
3. "{framework} production" → Real apps
4. "{framework} plugin" → Extension patterns
```

### For Library Skills

```
1. "{library} usage" → Basic patterns
2. "import {library}" → Real usage
3. "{library} best practices" → Recommendations
```

### For Platform Skills

```
1. "{platform} {product}" → Product-specific
2. "{platform} terraform" → Infrastructure patterns
3. "{platform} example" → General usage
```

## Capturing Search Results

For each valuable repo found:

```yaml
repo: username/repo-name
stars: 500
last_updated: 2024-06-15
relevance: high | medium | low
key_patterns:
  - Pattern 1 description
  - Pattern 2 description
files_to_examine:
  - src/main.ts
  - tauri.conf.json
notes: Why this repo is valuable
```

## Search Efficiency

Don't over-search. Focus on:

```
High value:
├─ Official examples
├─ Top 10 starred repos
├─ Recently updated popular repos
└─ Specific integration patterns you need

Low value:
├─ Abandoned repos (no updates >1 year)
├─ Tutorial clones
├─ Incomplete examples
└─ Forks without modifications
```

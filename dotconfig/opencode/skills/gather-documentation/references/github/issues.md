# Mining Issues and Discussions

Issues and discussions are goldmines for gotchas, workarounds, and real-world problems.

## Value of Issue Mining

| Source | Provides |
|--------|----------|
| Bug reports | Common problems, error messages |
| Closed issues | Solutions, workarounds |
| Feature requests | Limitations, missing features |
| Discussions | Architectural insights, best practices |
| "Help wanted" | Known challenges |

## Issue Search Strategies

### Pattern 1: Common Error Messages

```
Search in issues: "error" + specific message
Goal: Find solutions to common errors
Extract: Error → Cause → Solution
```

### Pattern 2: "How to" Questions

```
Search in issues: "how to" OR "how do I"
Goal: Find common tasks people struggle with
Extract: Question → Answer → Pattern
```

### Pattern 3: Workarounds

```
Search in issues: "workaround" OR "solution"
Goal: Find fixes for limitations
Extract: Problem → Workaround → Caveats
```

### Pattern 4: Breaking Changes

```
Search in issues: "breaking" OR "migration"
Goal: Find version-specific gotchas
Extract: Change → Impact → Migration
```

## Using GitHub API for Issues

### Via gh CLI (in Bash)

```bash
# Search issues
gh issue list -R tauri-apps/tauri --search "error" --state all

# View specific issue
gh issue view 1234 -R tauri-apps/tauri

# Search discussions
gh api repos/tauri-apps/tauri/discussions
```

### Via mcp tools

```typescript
// Search for issues via web search
mcp_parallel_web_search({
  searchQueries: [
    "site:github.com/tauri-apps/tauri/issues error",
    "site:github.com/tauri-apps/tauri/discussions best practice"
  ]
})
```

## What to Capture

### From Bug Reports

```markdown
## Gotcha: [Short Name]

**Error:** `Exact error message`

**Cause:** Why this happens (from issue discussion)

**Solution:** 
Working fix from closed issue

**Source:** github.com/org/repo/issues/123
```

### From Feature Discussions

```markdown
## Limitation: [What Can't Be Done]

**Requested:** What users wanted

**Current State:** Why it's not available

**Workaround:** If any exists

**Tracking:** Link to feature request
```

### From Architecture Discussions

```markdown
## Design Decision: [Topic]

**Context:** Why this came up

**Decision:** What was decided

**Rationale:** Why (from maintainer comments)

**Implications:** What this means for users
```

## Filtering for Quality

### High-Value Issues

- Closed with solution
- Multiple participants
- Maintainer response
- Linked to PR (fix implemented)
- High reaction count

### Low-Value Issues

- "Me too" issues
- Unanswered questions
- Off-topic discussions
- Very old, stale issues

## Issue Mining Workflow

```
1. Identify official repo
2. Search issues for:
   - "error" - Common errors
   - "how to" - Usage questions
   - "workaround" - Known limitations
   - "breaking" - Migration gotchas
3. Filter to closed issues (have solutions)
4. Extract pattern:
   Problem → Solution → Context
5. Incorporate into skill gotchas
```

## Example: Tauri Issue Mining

```yaml
search: "error site:github.com/tauri-apps/tauri/issues"

findings:
  - issue: "#1234 - Window not showing on macOS"
    problem: Window created but invisible
    solution: Call show() after setup
    gotcha: Windows hidden by default on macOS
    
  - issue: "#2345 - Command returns undefined"
    problem: Rust command result not reaching JS
    solution: Command must return Result<T, E>
    gotcha: Return type matters, not just function signature

extracted_gotchas:
  - macOS window visibility
  - Command return type requirements
  - IPC serialization limits
```

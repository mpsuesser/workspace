---
name: pi-subagents
description: |
  Delegate work to configured subagents with single-agent, chain, parallel,
  async, forked-context, and intercom-coordinated workflows. Use only agents
  discovered from user or project Markdown agent files.
---

# Pi Subagents

This skill is for the main parent orchestrator only. Do not inject or follow it
inside spawned child subagents. The parent session owns delegation,
orchestration, review fanout, and follow-up launches; child subagents should
receive concrete role-specific tasks.

`pi-subagents` ships no built-in agents. Before launching unfamiliar work, call
`subagent({ action: "list" })` and use only executable agent names returned by
that list. If no suitable agent exists, create one as a Markdown agent file via
management actions or ask the user which existing agent to use.

## Discovery

Agents are Markdown files with YAML frontmatter and a prompt body. Discovery is
recursive:

- User agents: `~/.pi/agent/agents/**/*.md`
- Project agents: `.pi/agents/**/*.md`
- Legacy project agents: `.agents/**/*.md`
- Legacy user agents: `~/.agents/**/*.md`

Project agents override user agents with the same runtime name. Files ending in
`.chain.md` are chain definitions, not agents.

Chains are reusable workflows:

- User chains: `~/.pi/agent/chains/**/*.chain.md` and `*.chain.json`
- Project chains: `.pi/chains/**/*.chain.md` and `*.chain.json`

## Agent files

A minimal agent file looks like this:

```markdown
---
name: code-reviewer
description: Reviews the current diff for correctness issues
tools: read, grep, find, ls, bash
systemPromptMode: replace
inheritProjectContext: true
inheritAvailableSkills: true
---

You are a focused review subagent. Inspect files directly and report concise,
evidence-backed findings with file paths and severity. Do not modify files unless
the task explicitly asks for edits.
```

Common frontmatter fields:

- `name`: local agent name. With `package`, runtime name is `package.name`.
- `package`: optional namespace such as `code-analysis`.
- `description`: shown in `subagent({ action: "list" })`.
- `tools`: child tool allowlist. Include `subagent` only for an explicit fanout
  agent that is allowed to delegate further.
- `model`, `fallbackModels`, `thinking`: runtime model defaults.
- `systemPromptMode`: `replace` or `append`.
- `inheritProjectContext`: whether project instruction files are kept.
- `inheritAvailableSkills`: whether discovered skills are visible.
- `defaultContext`: `fresh` or `fork` when the launch omits `context`.
- `skills`: skills to inject directly.
- `output`, `defaultReads`, `defaultProgress`: default file/output behavior.
- `completionGuard`: set `false` for non-writer agents that legitimately use
  write-capable tools without being implementation agents.

## Running subagents

Use the `subagent(...)` tool directly for execution, management, status, and
control. Humans can also use `/run`, `/parallel`, `/chain`, `/run-chain`, and
`/subagents-doctor`.

### Single run

```typescript
subagent({
  agent: "code-reviewer",
  task: "Review the current diff for correctness and regressions. Do not edit files.",
  context: "fresh"
})
```

### Parallel run

```typescript
subagent({
  tasks: [
    { agent: "correctness-reviewer", task: "Review the current diff for correctness. Do not edit files." },
    { agent: "test-reviewer", task: "Review test coverage and validation. Do not edit files." }
  ],
  context: "fresh",
  concurrency: 2
})
```

### Chain run

```typescript
subagent({
  chain: [
    { agent: "codebase-scout", task: "Map the relevant files for {task}", as: "context" },
    { agent: "implementation-planner", task: "Create a plan from {outputs.context}" }
  ],
  task: "Refactor the authentication flow"
})
```

Use `{task}`, `{previous}`, `{chain_dir}`, and `{outputs.name}` in chain task
templates. Prefer named outputs when a later step needs one specific result.

## Orchestration guidance

- Inspect `subagent({ action: "list" })` before assuming an agent exists.
- Give every child a narrow, concrete task with goal, evidence, constraints,
  validation, and expected output.
- Prefer async mode for long-running work so the parent can keep working:
  `async: true`.
- Keep writes single-threaded unless writers are isolated with `worktree: true`.
- Use fresh context for adversarial review unless the user explicitly asks for a
  forked branch of the current conversation.
- Use forked context when the child should inherit the parent thread as a real
  branched session.
- Do not let ordinary children run subagents. Only an agent whose `tools`
  explicitly includes `subagent` may use child-safe fanout, and only for the
  assigned fanout task.
- If a child encounters an unapproved product, scope, or architecture decision,
  it should ask the parent via the supervisor/intercom path when available.

## Management

Create agents and chains with management actions when a suitable Markdown file
does not exist:

```typescript
subagent({
  action: "create",
  config: {
    name: "code-reviewer",
    description: "Reviews code changes",
    scope: "project",
    tools: "read, grep, find, ls, bash",
    systemPrompt: "Review the requested change. Return concise evidence-backed findings."
  }
})
```

Use `action: "update"` and `action: "delete"` only for user or project agent
files. There are no built-in agents to update or disable.

## Status and control

```typescript
subagent({ action: "status" })
subagent({ action: "status", id: "run-id" })
subagent({ action: "interrupt", id: "run-id" })
subagent({ action: "resume", id: "run-id", message: "Follow up with this constraint." })
subagent({ action: "doctor" })
```

Use interrupt only when a run is clearly blocked or drifting. A soft interrupt
pauses the child; the parent must choose the next explicit action.

## Error handling

- `Unknown agent`: call `subagent({ action: "list" })`, create a Markdown agent,
  or ask the user which configured agent to use.
- No agents listed: add agent Markdown files under the user or project agents
  directory.
- Fork errors: persist the parent session before using `context: "fork"`.
- Parallel output conflict: give each parallel task a distinct output path or set
  `output: false`.
- Setup confusion: run `subagent({ action: "doctor" })`.

<p>
  <img src="https://raw.githubusercontent.com/nicobailon/pi-subagents/main/banner.png" alt="pi-subagents" width="1100">
</p>

# pi-subagents

`pi-subagents` lets Pi delegate work to focused child Pi sessions. Use it for
code review, research, implementation handoffs, parallel audits, saved workflows,
background jobs, and any task that benefits from another model pass.

The extension ships **no built-in agents**. The only runnable subagents are the
agents you define as Markdown files in the supported agent directories.

## Installation

```bash
pi install npm:pi-subagents
```

After installation, create at least one agent file. Without user or project agent
files, `subagent({ action: "list" })` will show no executable agents.

## Agent discovery

Agents are Markdown files with YAML frontmatter and a prompt body. Discovery is
recursive.

| Scope | Path |
|-------|------|
| User | `~/.pi/agent/agents/**/*.md` |
| User legacy | `~/.agents/**/*.md` |
| Project | `.pi/agents/**/*.md` |
| Project legacy | `.agents/**/*.md` |

Project agents override user agents with the same runtime name. If both legacy
`.agents/` and canonical `.pi/agents/` define the same project runtime name,
`.pi/agents/` wins. Files ending in `.chain.md` are chain definitions and do not
create agents.

Chains live in:

| Scope | Path |
|-------|------|
| User | `~/.pi/agent/chains/**/*.chain.md`, `~/.pi/agent/chains/**/*.chain.json` |
| Project | `.pi/chains/**/*.chain.md`, `.pi/chains/**/*.chain.json` |

## Create an agent

Create a project agent at `.pi/agents/code-reviewer.md`:

```markdown
---
name: code-reviewer
description: Reviews the current diff for correctness and regressions
tools: read, grep, find, ls, bash
systemPromptMode: replace
inheritProjectContext: true
inheritAvailableSkills: true
---

You are a focused code review subagent. Inspect files and diffs directly. Return
concise, evidence-backed findings with severity, file paths, and suggested fixes.
Do not modify files unless the task explicitly asks you to edit.
```

Then reload Pi and list agents:

```typescript
subagent({ action: "list" })
```

You can also create agents through the management action:

```typescript
subagent({
  action: "create",
  config: {
    name: "code-reviewer",
    description: "Reviews code changes",
    scope: "project",
    tools: "read, grep, find, ls, bash",
    systemPrompt: "Review the requested change and return concise findings."
  }
})
```

## Agent frontmatter

| Field | Notes |
|-------|-------|
| `name` | Local agent name. Required. |
| `package` | Optional namespace. `name: reviewer` and `package: code-analysis` registers as `code-analysis.reviewer`. |
| `description` | Short description shown by `action: "list"`. Required. |
| `tools` | Pi tool allowlist for the child. `mcp:` entries select direct MCP tools when available. |
| `extensions` | Omitted means normal extensions; empty means no extensions; comma-separated values allowlist paths. |
| `model` | Optional default model. Bare ids prefer the current provider when possible. |
| `fallbackModels` | Ordered backup models for provider failures. |
| `thinking` | Optional thinking level appended to model at runtime. |
| `systemPromptMode` | `replace` by default; `append` keeps Pi’s base prompt. |
| `inheritProjectContext` | Defaults to `false`; set `true` to keep project instruction files. |
| `inheritAvailableSkills` | Defaults to `true`; set `false` to hide the discovered skills catalog. |
| `defaultContext` | Optional `fresh` or `fork` launch default. |
| `skills` | Skills injected into this agent’s prompt. |
| `output` | Default single-agent output file. |
| `defaultReads` | Files to read before running in chain/parallel behavior. |
| `defaultProgress` | Maintain a progress file when supported. |
| `completionGuard` | Set `false` for non-writer agents that use write-capable tools but should not be judged as implementation agents. |
| `maxSubagentDepth` | Tightens nested delegation for this agent’s children. |

## Running agents

### Single agent

```typescript
subagent({
  agent: "code-reviewer",
  task: "Review the current diff for correctness issues. Do not edit files.",
  context: "fresh"
})
```

### Parallel agents

```typescript
subagent({
  tasks: [
    { agent: "correctness-reviewer", task: "Review the diff for correctness. Do not edit files." },
    { agent: "test-reviewer", task: "Review the tests and validation strategy. Do not edit files." }
  ],
  context: "fresh",
  concurrency: 2
})
```

### Chain agents

```typescript
subagent({
  chain: [
    { agent: "codebase-mapper", task: "Map relevant files for {task}", as: "context" },
    { agent: "implementation-planner", task: "Create an implementation plan from {outputs.context}" }
  ],
  task: "Refactor authentication"
})
```

Task templates support:

| Variable | Description |
|----------|-------------|
| `{task}` | Original task from the launch. |
| `{previous}` | Output from the previous step. |
| `{chain_dir}` | Shared chain artifact directory. |
| `{outputs.name}` | Text value from a prior step or parallel task with `as: "name"`. |

### Async/background

```typescript
subagent({
  agent: "implementation-worker",
  task: "Implement the approved plan and report changed files plus validation.",
  async: true
})
```

Background runs return a run id. Inspect or control them later:

```typescript
subagent({ action: "status", id: "run-id" })
subagent({ action: "interrupt", id: "run-id" })
subagent({ action: "resume", id: "run-id", message: "Continue with this extra constraint." })
```

## Slash commands

| Command | Description |
|---------|-------------|
| `/run <agent> [task]` | Run one configured agent. |
| `/parallel agent1 "task1" -> agent2 "task2"` | Run configured agents in parallel. |
| `/chain agent1 "task1" -> agent2 "task2"` | Run configured agents in sequence. |
| `/run-chain <chainName> -- <task>` | Run a saved chain. |
| `/subagents-doctor` | Show setup diagnostics. |

Add `--bg` for background execution and `--fork` for forked session context.

## Management actions

```typescript
subagent({ action: "list" })
subagent({ action: "get", agent: "code-reviewer" })
subagent({ action: "update", agent: "code-reviewer", config: { model: "anthropic/claude-sonnet-4" } })
subagent({ action: "delete", agent: "code-reviewer" })
```

`create`, `update`, and `delete` operate only on user or project files. There are
no packaged agents to update, disable, or shadow.

## Saved chains

Create `.pi/chains/review-flow.chain.md`:

```markdown
---
name: review-flow
description: Run two review agents and synthesize findings
---

## correctness-reviewer
phase: Review
label: Correctness
as: correctness
output: review/correctness.md

Review {task} for correctness and regressions. Do not edit files.

## test-reviewer
phase: Review
label: Tests
as: tests
output: review/tests.md

Review {task} for tests and validation. Do not edit files.

## review-synthesizer
phase: Synthesis
label: Synthesize

Synthesize {outputs.correctness} and {outputs.tests}. Separate blockers, fixes
worth doing now, optional improvements, and feedback to ignore.
```

Run it:

```text
/run-chain review-flow -- review the current diff
```

Use `.chain.json` for dynamic fanout or inline JSON Schema objects.

## Tool and extension selection

If `tools` is omitted, the child receives Pi’s normal tools. If `tools` is
present, regular tool names become an explicit allowlist. `mcp:` entries select
direct MCP tools when `pi-mcp-adapter` is installed. Path-like entries such as
`.ts` or `.js` files are treated as tool-extension paths.

Examples:

- `tools` omitted: normal Pi tools and normal extensions.
- `tools: read, grep, find, ls, bash`: only those Pi tools.
- `tools: read, mcp:chrome-devtools`: `read` plus selected direct MCP tools.
- `tools: subagent, read`: authorizes child-safe nested fanout for this agent.

Direct MCP tools require `pi-mcp-adapter`. A direct MCP entry named
`mcp:subagent` does not authorize nested fanout; only the regular tool name
`subagent` does.

## Context modes

`context: "fresh"` starts a clean child session with the task prompt and selected
agent prompt. `context: "fork"` creates a real branched child session from the
parent’s current persisted session. Forked runs fail fast when the parent session
has no session file or leaf id.

Agents can set `defaultContext: fresh` or `defaultContext: fork`; explicit launch
parameters always win.

## Worktree isolation

Parallel agents can clobber each other if they edit the same checkout. Use
`worktree: true` for intentionally parallel write workflows:

```typescript
subagent({
  tasks: [
    { agent: "implementation-worker", task: "Implement option A" },
    { agent: "implementation-worker", task: "Implement option B" }
  ],
  worktree: true
})
```

Requirements:

- run inside a git repo
- working tree must be clean
- task-level `cwd` overrides must be omitted or match the shared cwd
- configured worktree setup hooks must return valid JSON before timeout

After a worktree parallel step completes, per-agent diff stats are appended to
the output and full patch files are written to artifacts.

## Intercom coordination

`pi-subagents` works without `pi-intercom`. If `pi-intercom` is installed and the
bridge is active, child agents may receive a `contact_supervisor` path for
blocking decisions and meaningful progress updates.

Use supervisor contact only when the child is blocked on a decision or
clarification. Do not send routine completion handoffs; normal subagent results
already return to the parent.

## Configuration

Optional config lives in `~/.pi/agent/subagent-config.json`.

```json
{
  "asyncByDefault": true,
  "forceTopLevelAsync": false,
  "maxSubagentDepth": 1,
  "parallel": {
    "maxTasks": 8,
    "concurrency": 4
  },
  "intercomBridge": {
    "mode": "always"
  }
}
```

Common fields:

| Field | Description |
|-------|-------------|
| `asyncByDefault` | Run top-level calls in the background unless explicitly foregrounded. |
| `forceTopLevelAsync` | Force depth-0 runs into background mode and bypass clarify UI. |
| `defaultSessionDir` | Base directory for child session logs. |
| `maxSubagentDepth` | Limit nested delegation. |
| `parallel.maxTasks` | Maximum top-level parallel task count. |
| `parallel.concurrency` | Default top-level parallel concurrency. |
| `intercomBridge.mode` | `always`, `fork-only`, or `off`. |
| `worktreeSetupHook` | Repo-relative, absolute, or `~/...` hook for created worktrees. |

## Diagnostics

```typescript
subagent({ action: "doctor" })
```

The doctor report checks runtime paths, async support, discovery counts, current
session context, and intercom bridge state. With no user or project agent files,
the expected executable agent count is zero.

## Troubleshooting

**Unknown agent**

Run `subagent({ action: "list" })` and use one of the listed names, or create a
Markdown agent file.

**No executable agents**

Create at least one agent under `~/.pi/agent/agents/` or `.pi/agents/`, then
reload Pi.

**Forked context fails**

Persist the parent session before using `context: "fork"`.

**Parallel output-path conflict**

Give each task a distinct output path or set `output: false`.

**Child fails before starting**

Inspect `subagent({ action: "status", id: "..." })`, artifact metadata, output
logs, and `subagent({ action: "doctor" })`.

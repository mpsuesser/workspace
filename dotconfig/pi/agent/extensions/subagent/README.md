# @mpsuesser/pi-subagent

A pi extension that mimics [OpenCode]'s `task` / subagent system as closely as the pi extension API allows.

- Registers a `task` tool with the same parameter shape, description, and output format as OpenCode.
- Registers a `task_status` tool (stub — background subagents are not yet implemented).
- Loads agent definitions from `.pi/agents/*.md` (project, walks up from cwd) and `~/.pi/agent/agents/*.md` (user), with the same frontmatter shape OpenCode accepts.
- Ships built-in `general` and `explore` agents with system prompts ported verbatim from OpenCode.
- Adds `/agent-list`, `/agent-path`, and `/agent-new` slash commands.

[OpenCode]: https://github.com/anomalyco/opencode

## How an agent invocation works

Each `task` invocation spawns a fresh `pi -p --mode json` subprocess scoped to its own session file under `~/.pi/agent/state/subagent/<task_id>.jsonl`. The subprocess inherits the parent's cwd and writes JSONL events to stdout, which we stream back as live updates. The model only sees the final assistant text, wrapped in OpenCode's `<task_result>` / `<task_error>` envelope.

When the parent passes `task_id` to resume a previous subagent, we re-open the same `.jsonl` file with `pi --session <path>`, so the subagent continues with its previous history rather than starting fresh.

## Agent definition format

A subagent is a markdown file with YAML frontmatter:

```markdown
---
name: reviewer
description: Reviews recently written code for bugs, style, and obvious bugs
model: anthropic/claude-sonnet-4-5
tools: read, grep, find, ls
---

You are a senior code reviewer. Read the recently changed code and report issues...
```

### Frontmatter fields

| Field | Type | Notes |
|---|---|---|
| `name` | string | Optional. Defaults to the filename (sans `.md`). Nested paths preserve directory structure, e.g. `.pi/agents/team/reviewer.md` → `team/reviewer`. |
| `description` | string | When the agent should be used. Surfaced to the LLM in an `<available_subagents>` block. |
| `mode` | `"subagent"` | Only `"subagent"` is honored. OpenCode's `"primary"` / `"all"` are warned-and-coerced. |
| `hidden` | boolean | Hides the agent from `/agent-list` and the `<available_subagents>` block. Still invokable. |
| `disable` | boolean | Drops the agent entirely. |
| `color` | string | Hex `#RRGGBB` or theme key. Used by the renderer. |
| `model` | string | Forwarded to `pi --model`. Accepts pi's full pattern syntax (`anthropic/claude-haiku-4-5`, `*sonnet*`, etc.). |
| `tools` | record / string / array | Three shapes accepted: `{ read: true, bash: false }`, `"read, bash, grep"`, or `["read", "bash", "grep"]`. |
| `permission` | OpenCode permission shorthand | See below. |
| `options` | record | Free-form pass-through. Unknown frontmatter keys are folded in here. |

### Where the OpenCode shape doesn't transfer

These fields are accepted in frontmatter (so existing OpenCode-format agents parse cleanly) but have **no effect**, because pi exposes no CLI surface for them. They're folded into `options` and a warning is logged once at session start:

- `temperature`
- `top_p`
- `steps` / `maxSteps`
- `variant`

### Permissions

OpenCode's `permission` system is a per-tool, per-pattern allow/deny/ask matrix. pi has no equivalent — the only way to gate tools from a subprocess is the `pi --tools <csv>` allowlist. We translate as follows:

| OpenCode | pi |
|---|---|
| `read`, `bash`, `grep`, `task`, `webfetch`, `websearch`, `todowrite` | maps directly |
| `edit`, `write`, `patch` | collapse to pi's `edit`+`write` builtins |
| `glob` | pi's `find` |
| `list` | pi's `ls` |
| `external_directory`, `repo_clone`, `repo_overview`, `lsp`, `doom_loop`, `question`, `skill`, `plan_enter`, `plan_exit` | **dropped** with a warning (no pi equivalent) |
| Any rule with a pattern other than `"*"` | **dropped** with a warning (pi has no per-pattern gating) |
| `action: "ask"` | downgraded to `"deny"` with a warning (no per-tool prompt gate) |
| `task` permission | always defaults to `deny` unless explicitly allowed (matches OpenCode's `deriveSubagentSessionPermission`) |

Net effect: the simple `tools: read, grep, ls` form Just Works. Pattern-based permission rules degrade gracefully but won't enforce the patterns.

## Built-in agents

| Name | Mode | Tools | Notes |
|---|---|---|---|
| `general` | subagent | all defaults | Free-form, full-tool fallback. |
| `explore` | subagent | `read, grep, find, ls, bash` | Read-only researcher. Prompt ported verbatim from OpenCode's `explore.txt`. |

OpenCode's `scout` agent is intentionally not shipped here; its `repo_clone` / `repo_overview` permissions have no pi equivalent and the agent's value drops off sharply without them. If you want it back, create a `.pi/agents/scout.md` yourself.

## What we explicitly don't carry over

| Feature | Reason |
|---|---|
| Native `build`, `plan`, `compaction`, `title`, `summary` agents | These are all `mode: "primary"` — pi has no primary persona registry. Pi has its own compaction / title / summary pipeline. |
| `mode: "primary" \| "all"` | Same reason. Markdown files declaring these modes load, but a warning is logged and the agent is treated as `subagent`. |
| `task(background=true)` | Throws "not yet implemented." pi has no in-process job manager. |
| `task_status` actual polling | Registered as a stub (throws NYI). Becomes useful only when `background` lands. |
| In-process plugin trigger hooks (`plugin.trigger(...)`) | Subagents run as a separate process; the parent's `before_provider_request` etc. don't fire inside them. |
| Project-agent confirmation prompt | Disabled. Project agents run without prompting; treat your `.pi/agents/` directory like any other repo-controlled code. |
| Per-pattern permission enforcement | See permission mapping table above. |

## Commands

| Command | Description |
|---|---|
| `/agent-list` | Show all known agents grouped by `builtin / user / project`, with load-time warnings. |
| `/agent-path <name>` | Print the file path of an agent (handy for `pi -e $(pi /agent-path ...)`-style flows or just editing). |
| `/agent-new <description>` | Generate a `.pi/agents/<name>.md` from a natural-language description. (Stub — wire `generateAgentConfig` in your local fork to a real LLM call to enable.) |

## Resumption

Each successful `task` invocation returns a `task_id` in its output:

```
task_id: task_4f3a... (for resuming to continue this task if needed)

<task_result>
...
</task_result>
```

Pass that `task_id` back to `task` to continue the same subagent session with its prior history intact. The mapping is just `~/.pi/agent/state/subagent/<task_id>.jsonl` — feel free to inspect or delete those files manually.

## Installation

This package lives in your pi extensions directory (`~/.pi/agent/extensions/subagent/` or this workspace), so pi auto-loads it on startup.

If you'd like to use it elsewhere, copy the directory or symlink it into one of pi's discovery paths:

```bash
ln -s "$(pwd)" ~/.pi/agent/extensions/subagent
```

## Layout

```
subagent/
├── index.ts                # entry point
├── package.json
├── tsconfig.json
├── README.md
└── src/
    ├── agent-info.ts       # types
    ├── loader.ts           # .md frontmatter discovery
    ├── permission-map.ts   # OpenCode perms → pi --tools allowlist
    ├── defaults.ts         # general / explore
    ├── session-store.ts    # task_id ↔ session file
    ├── runner.ts           # subprocess spawn + JSONL stream parsing
    ├── task-tool.ts        # the `task` tool registration
    ├── task-status-tool.ts # NYI stub
    ├── generate.ts         # `/agent-new` command
    ├── render.ts           # TUI rendering for the `task` tool
    └── prompts/
        ├── task.txt        # verbatim from OpenCode src/tool/task.txt
        ├── task_status.txt # verbatim from OpenCode src/tool/task_status.txt
        ├── explore.txt     # verbatim from OpenCode src/agent/prompt/explore.txt
        └── generate.txt    # verbatim from OpenCode src/agent/generate.txt
```

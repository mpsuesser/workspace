# OpenCode Extensions

Complete guide to all 6 extension mechanisms.

## Table of Contents

- [Agents](#agents)
- [Commands](#commands)
- [Skills](#skills)
- [Custom Tools](#custom-tools)
- [Plugins](#plugins)
- [MCP Servers](#mcp-servers)

---

## Agents

Specialized AI assistants with custom prompts, models, and tool access. Two types: **primary** (Tab-switchable) and **subagent** (invoked by primary agents or `@mention`).

### Locations

- Project: `.opencode/agents/<name>.md`
- Global: `~/.config/opencode/agents/<name>.md`
- Config: `opencode.json` under `agent` key

### Markdown Agent (Recommended)

```markdown
---
description: Reviews code for quality and best practices
mode: subagent
model: anthropic/claude-sonnet-4-5
temperature: 0.1
tools:
  write: false
  edit: false
  bash: false
permission:
  bash:
    "*": ask
    "git diff": allow
    "grep *": allow
---

You are in code review mode. Focus on:

- Code quality and best practices
- Potential bugs and edge cases
- Performance implications
- Security considerations

Provide constructive feedback without making direct changes.
```

Filename becomes agent name: `review.md` → `review` agent.

### Agent Options

| Option | Type | Description |
|--------|------|-------------|
| `description` | string | **Required**. What the agent does |
| `mode` | string | `"primary"`, `"subagent"`, or `"all"` (default) |
| `model` | string | Override model (`provider/model-id`) |
| `prompt` | string | System prompt or `{file:./path.txt}` |
| `temperature` | number | 0.0-1.0 (lower = more deterministic) |
| `tools` | object | Enable/disable tools (`{ "bash": false }`) |
| `permission` | object | Override permissions for this agent |
| `steps` | number | Max agentic iterations before forced text response |
| `hidden` | boolean | Hide from `@` autocomplete (subagents only) |
| `color` | string | Hex color or theme color name |
| `top_p` | number | Response diversity (0.0-1.0) |
| `disable` | boolean | Disable the agent |

JSON agents use the same options under `"agent"` key in `opencode.json`. See configuration.md for JSON format and task permissions.

---

## Commands

Custom `/commands` for repetitive prompts. Support arguments, shell output injection, and file references.

### Locations

- Project: `.opencode/commands/<name>.md`
- Global: `~/.config/opencode/commands/<name>.md`
- Config: `opencode.json` under `command` key

### Markdown Command

```markdown
---
description: Run tests with coverage
agent: build
model: anthropic/claude-haiku-4-5
---

Run the full test suite with coverage report and show any failures.
Focus on the failing tests and suggest fixes.
```

Filename becomes command name: `test.md` → `/test`.

### Template Features

```markdown
---
description: Create a component
---

Create a new React component named $ARGUMENTS with TypeScript.
Also handle $1 as the name and $2 as the directory.

Recent changes for context:
!`git log --oneline -5`

Reference the existing pattern in @src/components/Button.tsx.
```

| Placeholder | Expands To |
|-------------|------------|
| `$ARGUMENTS` | Everything after the command name |
| `$1`, `$2`, `$3`... | Positional arguments |
| `` !`command` `` | Shell command output |
| `@path/to/file` | File contents |

### Command Options

| Option | Type | Description |
|--------|------|-------------|
| `template` | string | Prompt text (body in markdown, required in JSON) |
| `description` | string | Shown in TUI autocomplete |
| `agent` | string | Agent to execute the command |
| `model` | string | Override model for this command |
| `subtask` | boolean | Force subagent invocation |

---

## Skills

Reusable instruction packages loaded on-demand via the `skill` tool. See the `skill-design` skill for authoring guidance.

### Locations

- Project: `.opencode/skills/<name>/SKILL.md`
- Global: `~/.config/opencode/skills/<name>/SKILL.md`
- Also supported: `.claude/skills/`, `.agents/skills/`

### Structure

```
.opencode/skills/<name>/
├── SKILL.md          # Required: frontmatter + instructions
├── references/       # Optional: loaded on demand
│   ├── api.md
│   ├── patterns.md
│   └── gotchas.md
├── scripts/          # Optional: executable code
└── assets/           # Optional: templates, output files
```

### SKILL.md Format

```markdown
---
name: my-skill
description: 150-300 char description with trigger keywords
---

# My Skill

Instructions the agent receives when this skill is loaded.
```

### Rules

- `name` must match directory name, lowercase alphanumeric with hyphens
- `description` is 1-1024 chars, determines when the AI loads the skill
- Frontmatter only recognizes: `name`, `description`, `license`, `compatibility`, `metadata`
- File must be named `SKILL.md` (all caps)

### Skill Permissions

```jsonc
{
  "permission": {
    "skill": {
      "*": "allow",
      "internal-*": "deny",
      "experimental-*": "ask"
    }
  }
}
```

---

## Custom Tools

Functions the LLM can call. Defined in TypeScript/JavaScript, can invoke any language.

### Locations

- Project: `.opencode/tools/<name>.ts`
- Global: `~/.config/opencode/tools/<name>.ts`

### Basic Tool

```typescript
import { tool } from "@opencode-ai/plugin"

export default tool({
  description: "Query the project database",
  args: {
    query: tool.schema.string().describe("SQL query to execute"),
  },
  async execute(args, context) {
    const { directory, worktree, agent, sessionID } = context
    return `Executed: ${args.query}`
  },
})
```

Filename becomes tool name: `database.ts` → `database` tool.

### Multiple Tools Per File

```typescript
import { tool } from "@opencode-ai/plugin"

export const add = tool({
  description: "Add two numbers",
  args: {
    a: tool.schema.number().describe("First number"),
    b: tool.schema.number().describe("Second number"),
  },
  async execute(args) {
    return args.a + args.b
  },
})

export const multiply = tool({
  description: "Multiply two numbers",
  args: {
    a: tool.schema.number(),
    b: tool.schema.number(),
  },
  async execute(args) {
    return args.a * args.b
  },
})
```

Named exports create `<filename>_<exportname>` tools: `math_add`, `math_multiply`.

### Context Object

| Property | Description |
|----------|-------------|
| `agent` | Current agent name |
| `sessionID` | Current session ID |
| `messageID` | Current message ID |
| `directory` | Session working directory |
| `worktree` | Git worktree root |

Tools can invoke any language via `Bun.$` shell (e.g., `await Bun.$`python3 ${script} ${args.input}`.text()`).

---

## Plugins

Event-driven extensions. Hook into tool execution, session lifecycle, file changes, and more.

### Locations

- Project: `.opencode/plugins/<name>.ts`
- Global: `~/.config/opencode/plugins/<name>.ts`
- npm: `opencode.json` → `"plugin": ["package-name"]`

### Basic Plugin

```typescript
import type { Plugin } from "@opencode-ai/plugin"

export const MyPlugin: Plugin = async ({ project, client, $, directory, worktree }) => {
  return {
    // Event hook
    event: async ({ event }) => {
      if (event.type === "session.idle") {
        await $`osascript -e 'display notification "Done!" with title "opencode"'`
      }
    },

    // Tool before/after hooks
    "tool.execute.before": async (input, output) => {
      if (input.tool === "read" && output.args.filePath.includes(".env")) {
        throw new Error("Do not read .env files")
      }
    },

    // Shell environment injection
    "shell.env": async (input, output) => {
      output.env.MY_API_KEY = "secret"
    },

    // Custom tools (same tool() helper as custom tools)
    tool: {
      mytool: tool({
        description: "Custom tool from plugin",
        args: { foo: tool.schema.string() },
        async execute(args, context) {
          return `Hello ${args.foo}`
        },
      }),
    },

    // Compaction hook
    "experimental.session.compacting": async (input, output) => {
      output.context.push("## Custom Context\nPersist this across compaction.")
    },
  }
}
```

### Plugin Context

| Property | Description |
|----------|-------------|
| `project` | Current project info |
| `client` | OpenCode SDK client (`client.app.log()` for structured logging) |
| `$` | Bun shell API for commands |
| `directory` | Current working directory |
| `worktree` | Git worktree path |

### Event Types

**Session**: `session.created`, `session.compacted`, `session.deleted`, `session.diff`, `session.error`, `session.idle`, `session.status`, `session.updated`

**Message**: `message.part.removed`, `message.part.updated`, `message.removed`, `message.updated`

**Tool**: `tool.execute.before`, `tool.execute.after`

**File**: `file.edited`, `file.watcher.updated`

**Shell**: `shell.env`

**Permission**: `permission.asked`, `permission.replied`

**Other**: `command.executed`, `installation.updated`, `lsp.client.diagnostics`, `lsp.updated`, `server.connected`, `todo.updated`

**TUI**: `tui.prompt.append`, `tui.command.execute`, `tui.toast.show`

### Dependencies

Add a `package.json` in `.opencode/` with dependencies. OpenCode runs `bun install` at startup.

---

## MCP Servers

External tool integrations via Model Context Protocol. Full configuration details in configuration.md.

### Quick Reference

```jsonc
{
  "mcp": {
    // Local: stdio-based server
    "my-local": {
      "type": "local",
      "command": ["npx", "-y", "my-mcp-server"],
      "enabled": true,
      "environment": { "MY_VAR": "value" },
      "timeout": 5000
    },
    // Remote: HTTP-based server
    "my-remote": {
      "type": "remote",
      "url": "https://mcp.example.com/mcp",
      "headers": { "Authorization": "Bearer {env:API_KEY}" },
      "oauth": {}
    }
  }
}
```

### Key Points

- Tools are prefixed with server name: `my-local_search`, `my-local_list`
- Disable per-agent with glob: `"tools": { "my-local_*": false }`
- OAuth: `opencode mcp auth <name>` to authenticate
- Each MCP server adds to context — be selective

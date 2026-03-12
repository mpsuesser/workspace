---
name: opencode-configuration
description: Configure and extend OpenCode with agents, commands, skills, plugins, custom tools, and MCP servers. Covers opencode.json schema, AGENTS.md rules, permissions, plugin hooks, tool definitions, SDK, and CLI. Use when creating OpenCode extensions, configuring projects, or troubleshooting.
---

# OpenCode

Open source AI coding agent. Terminal TUI, desktop app, web UI, IDE extension. Extensible via agents, commands, skills, plugins, custom tools, and MCP servers.

## Architecture

```
opencode
├── Config (opencode.json / opencode.jsonc)
│   ├── model, provider, permission, tools
│   ├── agent, command, mcp, plugin
│   └── server, formatter, compaction, watcher
├── Rules (AGENTS.md)
│   ├── Project: ./AGENTS.md (or CLAUDE.md fallback)
│   ├── Global: ~/.config/opencode/AGENTS.md
│   └── Custom: instructions[] in opencode.json
├── Extensions (.opencode/ or ~/.config/opencode/)
│   ├── agents/       ← Specialized AI assistants (markdown)
│   ├── commands/     ← Custom /commands (markdown)
│   ├── skills/       ← Reusable instruction packages (SKILL.md)
│   ├── tools/        ← Custom tool definitions (TypeScript)
│   └── plugins/      ← Event hooks & integrations (TypeScript)
└── MCP Servers       ← External tool integrations (config)
```

## Task Router

```
What do you need?

Extending OpenCode?
├─ Add a specialized AI assistant    → Agent (references/extensions.md#agents)
├─ Create a reusable /command        → Command (references/extensions.md#commands)
├─ Package domain knowledge          → Skill (references/extensions.md#skills)
├─ Add a callable tool for the LLM   → Custom Tool (references/extensions.md#tools)
├─ Hook into events / add behavior   → Plugin (references/extensions.md#plugins)
├─ Integrate external service tools  → MCP Server (references/configuration.md#mcp)
└─ Unsure which mechanism            → Decision tree below

Configuring OpenCode?
├─ Set model / provider              → references/configuration.md#models
├─ Control tool permissions          → references/configuration.md#permissions
├─ Add project-specific rules        → AGENTS.md (see Rules below)
├─ Config file locations             → references/configuration.md#locations
└─ Environment variables             → references/cli-sdk.md#environment

Using OpenCode programmatically?
├─ Non-interactive CLI usage         → references/cli-sdk.md#cli
├─ TypeScript SDK integration        → references/cli-sdk.md#sdk
├─ HTTP server API                   → references/cli-sdk.md#server
└─ GitHub Actions agent              → opencode github install

Troubleshooting?
├─ OpenCode won't start              → Check logs: ~/.local/share/opencode/log/
├─ MCP server not loading            → Check timeout, enabled flag, tool permissions
├─ Skill not triggering              → Check SKILL.md caps, name match, frontmatter
├─ Permission issues                 → references/configuration.md#permissions
└─ Provider/model errors             → rm -rf ~/.cache/opencode && restart
```

## Extension Decision Tree

```
I need to...

Give the agent new abilities (callable functions)?
├─ Simple function, project-specific  → Custom Tool (.opencode/tools/)
├─ Complex integration + event hooks  → Plugin (.opencode/plugins/)
└─ External service (separate server) → MCP Server (opencode.json mcp)

Give the agent new knowledge/instructions?
├─ Domain expertise, reusable         → Skill (.opencode/skills/)
├─ Project rules, always loaded       → AGENTS.md
└─ Additional files, conditionally    → instructions[] in opencode.json

Give the agent a different personality/constraints?
├─ Read-only analysis mode            → Agent (mode: primary, tools restricted)
├─ Specialized subagent for tasks     → Agent (mode: subagent)
└─ Quick command with preset prompt   → Command (.opencode/commands/)

Automate a repetitive prompt?
└─ Always → Command (supports $ARGUMENTS, !`shell`, @files)
```

## Config Locations & Precedence

Configs merge (later overrides earlier for conflicting keys):

| Priority | Location | Purpose |
|----------|----------|---------|
| 1 (lowest) | `.well-known/opencode` | Org defaults (remote) |
| 2 | `~/.config/opencode/opencode.json` | User preferences |
| 3 | `OPENCODE_CONFIG` env var path | Custom overrides |
| 4 | `./opencode.json` (project root) | Project-specific |
| 5 | `.opencode/` directories | Agents, commands, plugins |
| 6 (highest) | `OPENCODE_CONFIG_CONTENT` env var | Runtime overrides |

## Rules (AGENTS.md)

```
AGENTS.md                    ← Project root, always loaded
~/.config/opencode/AGENTS.md ← Global, personal rules
CLAUDE.md                    ← Fallback if no AGENTS.md
```

Create with `/init` command. Reference external files via `instructions` in opencode.json:

```jsonc
{ "instructions": ["CONTRIBUTING.md", "docs/*.md", ".cursor/rules/*.md"] }
```

## Quick Reference: Built-in Agents

| Agent | Mode | Purpose |
|-------|------|---------|
| build | primary | Default. Full tool access for development |
| plan | primary | Analysis only. File edits and bash require approval |
| general | subagent | Full-access subagent for parallel work |
| explore | subagent | Read-only codebase exploration |

Switch primary agents: **Tab** key. Invoke subagents: `@agent-name` in prompt.

## Quick Reference: Built-in Tools

| Tool | Permission Key | Description |
|------|---------------|-------------|
| bash | `bash` | Shell commands |
| edit | `edit` | Modify files (also controls write, patch) |
| write | `edit` | Create/overwrite files |
| read | `read` | Read file contents |
| grep | `grep` | Regex content search |
| glob | `glob` | File pattern matching |
| skill | `skill` | Load skill instructions |
| todowrite | `todowrite` | Manage task lists |
| webfetch | `webfetch` | Fetch web content |
| websearch | `websearch` | Web search (requires OpenCode provider or EXA) |
| question | `question` | Ask user questions |

## Permission Defaults

All tools default to `"allow"` except:
- `doom_loop` and `external_directory` → `"ask"`
- `.env` files → `"deny"` for read

Three actions: `"allow"`, `"ask"`, `"deny"`. Last matching rule wins.

```jsonc
{
  "permission": {
    "*": "ask",              // catch-all first
    "bash": {
      "*": "ask",
      "git *": "allow",     // allow git commands
      "rm *": "deny"        // block rm
    },
    "edit": "allow"
  }
}
```

## Gotchas

- **Plural directory names**: `.opencode/agents/`, `commands/`, `plugins/`, `skills/`, `tools/` (singular works for compat)
- **Plugin tool names**: MCP tools are prefixed with server name (`mymcp_toolname`). Use glob `"mymcp_*": false` to disable all
- **Agent mode matters**: `mode: "primary"` = Tab-switchable, `mode: "subagent"` = invoked by primary agents or `@mention`
- **Config merge**: Configs merge, not replace. Agent-level permission overrides global
- **write uses edit permission**: The `write`, `patch`, and `multiedit` tools are all controlled by the `edit` permission key
- **MCP context cost**: Each MCP server adds tokens. Be selective — disable unused tools with glob patterns
- **Skill name = directory name**: The `name` in frontmatter must match the containing directory name
- **Custom tool naming**: Filename becomes tool name. `database.ts` → `database` tool. Named exports: `math.ts` export `add` → `math_add`

## In This Skill

| Reference | When to Load |
|-----------|--------------|
| [extensions.md](./references/extensions.md) | Creating agents, commands, skills, tools, or plugins |
| [configuration.md](./references/configuration.md) | Config schema, permissions, MCP servers, formatters |
| [cli-sdk.md](./references/cli-sdk.md) | CLI commands, SDK API, environment variables, server |

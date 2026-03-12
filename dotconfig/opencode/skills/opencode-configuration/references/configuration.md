# OpenCode Configuration

Complete config reference: schema, locations, permissions, variables.

## Table of Contents

- [Config Format](#config-format)
- [Locations & Precedence](#locations--precedence)
- [Schema Reference](#schema-reference)
- [Permissions](#permissions)
- [Variables](#variables)
- [TUI Config](#tui-config)

---

## Config Format

OpenCode uses JSON or JSONC (JSON with Comments). Always include the schema for validation:

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "model": "anthropic/claude-sonnet-4-5",
  "autoupdate": true,
  "server": {
    "port": 4096
  }
}
```

---

## Locations & Precedence

Configs **merge** (not replace). Later sources override earlier ones for conflicting keys only.

| Priority | Source | Path |
|----------|--------|------|
| 1 (lowest) | Remote | `.well-known/opencode` endpoint |
| 2 | Global | `~/.config/opencode/opencode.json` |
| 3 | Custom | `OPENCODE_CONFIG` env var |
| 4 | Project | `./opencode.json` in project root |
| 5 | Directories | `.opencode/` agents, commands, plugins |
| 6 (highest) | Inline | `OPENCODE_CONFIG_CONTENT` env var |

The `.opencode/` directory uses **plural names**: `agents/`, `commands/`, `plugins/`, `skills/`, `tools/`, `themes/`. Singular forms work for backward compatibility.

### Custom Directories

```bash
export OPENCODE_CONFIG_DIR=/path/to/config-dir  # Additional config directory
export OPENCODE_CONFIG=/path/to/config.json     # Custom config file
```

---

## Schema Reference

Full schema: [opencode.ai/config.json](https://opencode.ai/config.json)

### Core Settings

```jsonc
{
  "model": "anthropic/claude-sonnet-4-5",          // Default model
  "small_model": "anthropic/claude-haiku-4-5",     // For lightweight tasks
  "default_agent": "build",                         // Default primary agent
  "autoupdate": true,                               // Auto-update on startup
  "share": "manual",                                // "manual" | "auto" | "disabled"
}
```

### Provider Configuration

```jsonc
{
  "provider": {
    "anthropic": {
      "options": {
        "apiKey": "{env:ANTHROPIC_API_KEY}",
        "timeout": 600000,         // ms, default 300000
        "setCacheKey": true
      }
    },
    "amazon-bedrock": {
      "options": {
        "region": "us-east-1",
        "profile": "my-aws-profile",
        "endpoint": "https://bedrock-runtime.us-east-1.vpce-xxx.amazonaws.com"
      }
    }
  },
  "disabled_providers": ["openai"],    // Block even if keys exist
  "enabled_providers": ["anthropic"]   // Allowlist (disabled_providers takes priority)
}
```

### Tools

```jsonc
{
  "tools": {
    "write": false,        // Disable a built-in tool
    "bash": true,
    "mymcp_*": false       // Glob pattern to disable MCP tools
  }
}
```

### Server

```jsonc
{
  "server": {
    "port": 4096,
    "hostname": "0.0.0.0",
    "mdns": true,
    "mdnsDomain": "myproject.local",
    "cors": ["http://localhost:5173"]
  }
}
```

### Compaction

```jsonc
{
  "compaction": {
    "auto": true,       // Auto-compact when context is full
    "prune": true,      // Remove old tool outputs
    "reserved": 10000   // Token buffer for compaction
  }
}
```

### Formatters

```jsonc
{
  "formatter": {
    "prettier": { "disabled": true },
    "my-formatter": {
      "command": ["npx", "prettier", "--write", "$FILE"],
      "environment": { "NODE_ENV": "development" },
      "extensions": [".js", ".ts", ".jsx", ".tsx"]
    }
  }
}
```

### Watcher

```jsonc
{
  "watcher": {
    "ignore": ["node_modules/**", "dist/**", ".git/**"]
  }
}
```

### Instructions (External Rules)

```jsonc
{
  "instructions": [
    "CONTRIBUTING.md",
    "docs/guidelines.md",
    ".cursor/rules/*.md",
    "https://raw.githubusercontent.com/org/rules/main/style.md"
  ]
}
```

Supports file paths, globs, and remote URLs (5s timeout).

---

## Permissions

Control tool behavior: `"allow"`, `"ask"`, `"deny"`. Set globally and override per agent.

### Global Permissions

```jsonc
{
  "permission": {
    "*": "ask",              // Catch-all
    "read": "allow",
    "edit": "deny",
    "bash": {
      "*": "ask",
      "git *": "allow",
      "git push *": "deny",
      "grep *": "allow",
      "rm *": "deny"
    }
  }
}
```

**Last matching rule wins.** Put `*` first, specific rules after.

### Shorthand

```jsonc
{ "permission": "allow" }    // Allow everything
```

### Permission Keys

| Key | Matches Against | Controls |
|-----|----------------|----------|
| `read` | File path | Reading files |
| `edit` | File path | All file modifications (edit, write, patch, multiedit) |
| `glob` | Glob pattern | File pattern search |
| `grep` | Regex pattern | Content search |
| `list` | Directory path | Directory listing |
| `bash` | Parsed command | Shell execution |
| `task` | Subagent type | Launching subagents |
| `skill` | Skill name | Loading skills |
| `webfetch` | URL | Fetching web content |
| `websearch` | Query | Web search |
| `external_directory` | Path | Tools touching paths outside project |
| `doom_loop` | — | Same tool call repeated 3x identically |

### Wildcards

- `*` matches zero or more characters
- `?` matches exactly one character
- `~` and `$HOME` expand to home directory

### External Directories

Allow tool access outside the project working directory:

```jsonc
{
  "permission": {
    "external_directory": {
      "~/projects/personal/**": "allow"
    },
    "edit": {
      "~/projects/personal/**": "deny"    // Read allowed, edit denied
    }
  }
}
```

### Per-Agent Permissions

Agent permissions merge with global, agent rules take precedence:

```jsonc
{
  "permission": { "bash": "ask" },
  "agent": {
    "build": {
      "permission": {
        "bash": {
          "*": "ask",
          "git *": "allow"
        }
      }
    }
  }
}
```

### Defaults

| Permission | Default |
|------------|---------|
| Most tools | `"allow"` |
| `doom_loop` | `"ask"` |
| `external_directory` | `"ask"` |
| `read` for `.env*` | `"deny"` (except `.env.example`) |

### "Ask" Behavior

When prompted, three options:
- **once** — approve this request only
- **always** — approve matching pattern for this session
- **reject** — deny the request

---

## Variables

### Environment Variables

Use `{env:VARIABLE_NAME}` in config:

```jsonc
{
  "model": "{env:OPENCODE_MODEL}",
  "provider": {
    "anthropic": {
      "options": {
        "apiKey": "{env:ANTHROPIC_API_KEY}"
      }
    }
  }
}
```

Unset variables become empty strings.

### File References

Use `{file:path}` to inline file contents:

```jsonc
{
  "agent": {
    "review": {
      "prompt": "{file:./prompts/code-review.txt}"
    }
  }
}
```

Paths are relative to the config file, or absolute (`/`, `~`).

---

## TUI Config

Separate file for TUI-specific settings: `tui.json` or `tui.jsonc`.

```jsonc
{
  "$schema": "https://opencode.ai/tui.json",
  "theme": "tokyonight",
  "scroll_speed": 3,
  "scroll_acceleration": { "enabled": true },
  "diff_style": "auto"
}
```

Place alongside `opencode.json` (project) or in `~/.config/opencode/` (global).

Use `OPENCODE_TUI_CONFIG` env var for custom path.

Legacy `theme`, `keybinds`, and `tui` keys in `opencode.json` are deprecated.

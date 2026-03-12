# OpenCode CLI & SDK

CLI commands, SDK client API, and environment variables.

## Table of Contents

- [CLI](#cli)
- [SDK](#sdk)
- [Server](#server)
- [Environment Variables](#environment-variables)

---

## CLI

### Launch TUI

```bash
opencode                              # Start TUI
opencode --continue                   # Continue last session
opencode --session <id>               # Continue specific session
opencode --model provider/model       # Override model
opencode --agent plan                 # Start with specific agent
```

### Run Non-Interactively

```bash
opencode run "Explain closures in JS"
opencode run --model anthropic/claude-haiku-4-5 "Quick question"
opencode run --agent plan "Analyze this codebase"
opencode run --file src/index.ts "Review this file"
opencode run --continue "Follow up on last session"
opencode run --format json "Get raw events"
opencode run --share "Share this session"
opencode run --attach http://localhost:4096 "Use running server"
opencode run --command test           # Run custom command
```

### Auth Management

```bash
opencode auth login                   # Configure API keys
opencode auth list                    # List authenticated providers
opencode auth logout                  # Remove provider credentials
```

### Agent Management

```bash
opencode agent create                 # Interactive agent creation
opencode agent list                   # List all agents
```

### MCP Management

```bash
opencode mcp add                      # Add MCP server
opencode mcp list                     # List servers & status
opencode mcp auth <name>              # OAuth authenticate
opencode mcp auth list                # List OAuth status
opencode mcp logout <name>            # Remove credentials
opencode mcp debug <name>             # Debug connection
```

### Session Management

```bash
opencode session list                 # List all sessions
opencode session list -n 10           # Last 10 sessions
opencode session list --format json   # JSON output
opencode export <sessionID>           # Export session as JSON
opencode import session.json          # Import from file
opencode import https://opncd.ai/s/x  # Import from share URL
```

### Model Management

```bash
opencode models                       # List all available models
opencode models anthropic             # Filter by provider
opencode models --refresh             # Refresh model cache
opencode models --verbose             # Show costs/metadata
```

### Stats & Server

```bash
opencode stats                        # Token usage & costs
opencode stats --days 7               # Last 7 days
opencode stats --models 5             # Top 5 models
opencode serve                        # Headless HTTP server
opencode serve --port 4096            # Specify port
opencode web                          # Server + web UI
opencode attach http://host:4096      # Attach TUI to running server
```

### GitHub Agent

```bash
opencode github install               # Install GitHub Actions workflow
opencode github run                   # Run GitHub agent (in CI)
```

### Maintenance

```bash
opencode upgrade                      # Update to latest
opencode upgrade v1.2.3               # Update to specific version
opencode uninstall                    # Remove OpenCode
opencode uninstall --keep-config      # Keep config files
```

### Global Flags

| Flag | Short | Description |
|------|-------|-------------|
| `--help` | `-h` | Display help |
| `--version` | `-v` | Print version |
| `--print-logs` | | Print logs to stderr |
| `--log-level` | | DEBUG, INFO, WARN, ERROR |

---

## SDK

TypeScript client for the OpenCode server API.

### Install

```bash
npm install @opencode-ai/sdk
```

### Create Client

```typescript
import { createOpencode } from "@opencode-ai/sdk"

// Start server + client
const { client, server } = await createOpencode({
  hostname: "127.0.0.1",
  port: 4096,
  config: {
    model: "anthropic/claude-sonnet-4-5",
  },
})

// Or connect to existing server
import { createOpencodeClient } from "@opencode-ai/sdk"
const client = createOpencodeClient({
  baseUrl: "http://localhost:4096",
})
```

### Session API

```typescript
// Create session
const session = await client.session.create({
  body: { title: "My session" },
})

// Send prompt (with AI response)
const result = await client.session.prompt({
  path: { id: session.id },
  body: {
    model: { providerID: "anthropic", modelID: "claude-sonnet-4-5" },
    parts: [{ type: "text", text: "Hello!" }],
  },
})

// Inject context without AI response
await client.session.prompt({
  path: { id: session.id },
  body: {
    noReply: true,
    parts: [{ type: "text", text: "Context only." }],
  },
})

// Structured output
const structured = await client.session.prompt({
  path: { id: session.id },
  body: {
    parts: [{ type: "text", text: "List 3 colors" }],
    format: {
      type: "json_schema",
      schema: {
        type: "object",
        properties: {
          colors: { type: "array", items: { type: "string" } },
        },
        required: ["colors"],
      },
    },
  },
})
console.log(structured.data.info.structured_output)

// List, get, delete sessions
const sessions = await client.session.list()
const sess = await client.session.get({ path: { id: "..." } })
await client.session.delete({ path: { id: "..." } })
```

### Session Methods

| Method | Description |
|--------|-------------|
| `session.list()` | List all sessions |
| `session.get({ path })` | Get session by ID |
| `session.create({ body })` | Create new session |
| `session.delete({ path })` | Delete session |
| `session.update({ path, body })` | Update session |
| `session.prompt({ path, body })` | Send prompt |
| `session.command({ path, body })` | Execute command |
| `session.shell({ path, body })` | Run shell command |
| `session.messages({ path })` | List messages |
| `session.abort({ path })` | Abort running session |
| `session.share({ path })` | Share session |
| `session.revert({ path, body })` | Undo a message |
| `session.unrevert({ path })` | Redo reverted |
| `session.children({ path })` | List child sessions |

### File API

```typescript
// Search text in files
const results = await client.find.text({
  query: { pattern: "function.*handler" },
})

// Find files by name
const files = await client.find.files({
  query: { query: "*.ts", type: "file", limit: 50 },
})

// Read a file
const content = await client.file.read({
  query: { path: "src/index.ts" },
})

// Get file status
const status = await client.file.status()
```

### Other APIs

```typescript
// Health check
const health = await client.global.health()

// List agents
const agents = await client.app.agents()

// Logging
await client.app.log({
  body: { service: "app", level: "info", message: "Hello" },
})

// Config
const config = await client.config.get()
const providers = await client.config.providers()

// Events (SSE stream)
const events = await client.event.subscribe()
for await (const event of events.stream) {
  console.log(event.type, event.properties)
}

// Auth
await client.auth.set({
  path: { id: "anthropic" },
  body: { type: "api", key: "sk-..." },
})

// TUI control
await client.tui.appendPrompt({ body: { text: "Hello" } })
await client.tui.showToast({ body: { message: "Done", variant: "success" } })
await client.tui.submitPrompt()
```

### Types

```typescript
import type { Session, Message, Part } from "@opencode-ai/sdk"
```

All types generated from OpenAPI spec.

---

## Server

Start a headless server for API access or web UI.

```bash
opencode serve --port 4096 --hostname 0.0.0.0
opencode web --port 4096                       # With web UI
```

Set `OPENCODE_SERVER_PASSWORD` for HTTP basic auth (username defaults to `opencode`).

mDNS discovery:
```bash
opencode serve --mdns --hostname 0.0.0.0
```

Attach from another terminal:
```bash
opencode attach http://10.20.30.40:4096
```

---

## Environment Variables

### Core

| Variable | Description |
|----------|-------------|
| `OPENCODE_CONFIG` | Custom config file path |
| `OPENCODE_TUI_CONFIG` | Custom TUI config path |
| `OPENCODE_CONFIG_DIR` | Additional config directory |
| `OPENCODE_CONFIG_CONTENT` | Inline JSON config |
| `OPENCODE_PERMISSION` | Inline JSON permissions |
| `OPENCODE_SERVER_PASSWORD` | Enable basic auth for serve/web |
| `OPENCODE_SERVER_USERNAME` | Override auth username |
| `OPENCODE_CLIENT` | Client identifier (default: `cli`) |

### Feature Flags

| Variable | Description |
|----------|-------------|
| `OPENCODE_DISABLE_AUTOUPDATE` | Disable auto-update |
| `OPENCODE_DISABLE_AUTOCOMPACT` | Disable auto context compaction |
| `OPENCODE_DISABLE_DEFAULT_PLUGINS` | Disable default plugins |
| `OPENCODE_DISABLE_LSP_DOWNLOAD` | Disable auto LSP downloads |
| `OPENCODE_DISABLE_CLAUDE_CODE` | Disable all .claude support |
| `OPENCODE_DISABLE_CLAUDE_CODE_PROMPT` | Disable ~/.claude/CLAUDE.md |
| `OPENCODE_DISABLE_CLAUDE_CODE_SKILLS` | Disable .claude/skills |
| `OPENCODE_ENABLE_EXA` | Enable Exa web search tool |
| `OPENCODE_ENABLE_EXPERIMENTAL_MODELS` | Enable experimental models |

### Experimental

| Variable | Description |
|----------|-------------|
| `OPENCODE_EXPERIMENTAL` | Enable all experimental features |
| `OPENCODE_EXPERIMENTAL_LSP_TOOL` | Enable LSP tool |
| `OPENCODE_EXPERIMENTAL_BASH_DEFAULT_TIMEOUT_MS` | Bash timeout |
| `OPENCODE_EXPERIMENTAL_OUTPUT_TOKEN_MAX` | Max output tokens |
| `OPENCODE_EXPERIMENTAL_FILEWATCHER` | Enable full dir file watcher |

### Storage Locations

| Path | Contents |
|------|----------|
| `~/.config/opencode/` | Global config, agents, commands, plugins, skills |
| `~/.local/share/opencode/` | Sessions, auth, logs |
| `~/.local/share/opencode/log/` | Log files (last 10 kept) |
| `~/.local/share/opencode/auth.json` | API keys, OAuth tokens |
| `~/.cache/opencode/` | Provider packages, plugin deps |

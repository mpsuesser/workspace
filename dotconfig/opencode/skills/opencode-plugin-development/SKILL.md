---
name: opencode-plugin-development
description: Write OpenCode plugins that hook into events, intercept tools, inject session context, register custom tools, mutate config, manage subagents, and automate the TUI. Covers the full plugin API — all hooks, event types, SDK client methods, tool schema builders, and real-world patterns extracted from 20+ community plugins. Use when building or debugging OpenCode plugins.
---

# OpenCode Plugin Development

Plugins are TypeScript/JavaScript modules that extend OpenCode by hooking into events, intercepting tool calls, injecting context, registering custom tools, mutating runtime config, and managing subagent sessions.

## Plugin Structure

A plugin exports one or more async functions. Each receives a context object and returns a hooks object.

```ts
import type { Plugin } from "@opencode-ai/plugin";

export const MyPlugin: Plugin = async ({ project, client, $, directory, worktree }) => {
  return {
    // hooks go here
  };
};
```

**Context object:**

| Field | Type | Description |
|-------|------|-------------|
| `project` | object | Current project info (`.worktree` for git root) |
| `directory` | string | Current working directory |
| `worktree` | string | Git worktree path |
| `client` | SDK client | OpenCode SDK client for API calls |
| `$` | function | Bun shell tagged template API for executing commands |
| `Tool` | object | Native tool definition factory (alternative to `tool()` helper) |
| `z` | Zod | Zod schema library (when using `Tool.define`) |

## Hook Execution Order

Hooks fire in a specific order within each LLM turn. Understanding this is critical when hooks need to share state:

1. `chat.message` — fires when a user message arrives
2. `experimental.chat.messages.transform` — fires first among transforms
3. `experimental.chat.system.transform` — fires second
4. `chat.params` — fires before the LLM request is sent
5. `chat.headers` — fires before the HTTP request

Hooks sharing a closure can exploit this order. For example, Agent Identity writes the current agent name in `messages.transform` (step 2), then reads it in `system.transform` (step 3):

```ts
const agentBySession = new Map<string, string>();

return {
  "experimental.chat.messages.transform": async (_input, output) => {
    const lastUserMsg = output.messages.findLast(m => m.info.role === "user");
    if (lastUserMsg?.info.agent) {
      agentBySession.set(lastUserMsg.info.sessionID, lastUserMsg.info.agent);
    }
  },
  "experimental.chat.system.transform": async (input, output) => {
    const agent = agentBySession.get(input.sessionID);
    if (agent) {
      output.system.push(`You are the "${agent}" agent.`);
      agentBySession.delete(input.sessionID);
    }
  },
};
```

**Universal pattern:** All hooks receive `(input, output)`. The `input` is read-only context; the `output` is **mutated in place**. There is no return value.

---

## Hook Reference

### Tool Hooks

**`tool.execute.before`** — runs before a tool executes. Can modify args, block execution, or inject context.

```ts
"tool.execute.before": async (input, output) => {
  // input.tool       — tool name (string): "bash", "edit", "read", "write", "patch", "task", etc.
  // input.sessionID  — current session ID (string)
  // input.callID     — unique call identifier (string)
  // output.args      — mutable tool arguments (object) — modify to change what the tool receives

  // To block execution, throw:
  throw new Error("Blocked: reason");
}
```

**`tool.execute.after`** — runs after a tool finishes. Output fields are **mutable**.

```ts
"tool.execute.after": async (input, output) => {
  // input.tool       — tool name
  // input.sessionID  — current session ID
  // input.callID     — unique call identifier
  // output.output    — tool's return value (string) — MUTABLE
  // output.title     — display title in TUI (string) — MUTABLE
  // output.metadata  — arbitrary metadata (object) — MUTABLE
  // output.time      — { start: number, end: number }

  if (input.tool === "morph_edit") {
    output.title = `Fast Apply: ${output.title}`;
    output.metadata = { ...output.metadata, provider: "morph" };
  }
}
```

### Message Hooks

**`chat.message`** — fires on every user message. Use for first-message injection and per-message logic.

```ts
"chat.message": async (input, output) => {
  // input.model      — { providerID, modelID } (also on output.message.model)
  // input.variant    — message variant (string | undefined)
  // input.agent      — agent name (string | undefined)
  // input.sessionID  — session ID
  // input.messageID  — message ID
  // output.message.sessionID — session ID
  // output.message.model     — { providerID, modelID }
  // output.message.agent     — agent name
  // output.parts             — array of message parts (Part[])
}
```

### LLM Request Hooks

**`chat.params`** — modify LLM request parameters before they're sent. Stable (not experimental).

```ts
"chat.params": async (input, output) => {
  // input.model — { providerID, modelID, limit: { context: number } }
  // output.temperature — mutable (number | undefined)

  // Only override if user hasn't already set a custom temp
  if (output.temperature === undefined || Math.abs(output.temperature - 1.0) < 0.001) {
    output.temperature = 0.35;
  }
}
```

**`chat.headers`** — modify HTTP headers sent to the LLM provider.

```ts
"chat.headers": async (input, output) => {
  // output.headers — mutable headers object
}
```

### Event Hook

**`event`** — fires on any OpenCode event. Use for session lifecycle management, telemetry, and side effects.

```ts
event: async ({ event }) => {
  // event.type       — event name (string)
  // event.properties — event-specific data (object)
}
```

**Complete event types:**

| Event | Properties | When |
|-------|-----------|------|
| `session.created` | `{ info: { id, parentID?, title? } }` | New session started |
| `session.compacted` | `{ sessionID }` | Context was compacted |
| `session.deleted` | `{ info: { id } }` | Session removed |
| `session.idle` | `{ sessionID }` | Agent finished responding |
| `session.error` | `{ sessionID, error }` | Session errored |
| `session.status` | `{ status: { type: "idle"\|... }, sessionID }` | Session status changed (superset of idle) |
| `session.diff` | `{ ... }` | Lines-of-code change metrics |
| `message.updated` | `{ info: { sessionID, role, ... }, parts? }` | A message changed |
| `message.part.updated` | `{ part: { type, tool, state, callID, sessionID, messageID } }` | Tool part status changed (see below) |
| `permission.asked` | `{ ... }` | Permission prompt shown |
| `permission.updated` | `{ ... }` | Permission state changed |
| `permission.replied` | `{ ... }` | User responded to permission prompt |
| `command.executed` | `{ ... }` | A command completed (e.g., git commit) |
| `question.asked` | `{ ... }` | Question tool fired |
| `file.edited` | `{ ... }` | A file was modified |
| `todo.updated` | `{ ... }` | Todo list changed |

**`message.part.updated` tool state machine:**

```
pending → running → completed | error
```

```ts
event: async ({ event }) => {
  if (event.type === "message.part.updated") {
    const { part } = event.properties;
    if (part.type !== "tool") return;
    if (part.state.status !== "completed") return;

    // part.tool         — tool name (e.g., "edit", "bash")
    // part.callID       — unique call ID (for dedup)
    // part.sessionID    — session ID
    // part.messageID    — message ID
    // part.state.input  — tool input args
    // part.state.output — tool output text
    // part.state.title  — display title
    // part.state.metadata — { filePath?, filediff?, ... }
    // part.state.time   — { start, end }
  }
}
```

### Transform Hooks (experimental)

**`experimental.chat.system.transform`** — mutate the system prompt array in-flight.

```ts
"experimental.chat.system.transform": async (input, output) => {
  // input.sessionID — session ID
  // input.model     — { providerID, modelID, limit: { context: number } }
  // output.system   — mutable string array (the system prompt parts)

  // Append to the end
  output.system.push("You must always respond in haiku.");

  // Or insert early (after provider header) for salience
  const insertAt = output.system.length > 0 ? 1 : 0;
  output.system.splice(insertAt, 0, "<memory-blocks>...</memory-blocks>");
}
```

**`experimental.chat.messages.transform`** — mutate message history in-flight.

```ts
"experimental.chat.messages.transform": async (input, output) => {
  // output.messages — array of { info: Message, parts: Part[] }
  // info.role       — "user" | "assistant"
  // info.sessionID  — session ID
  // info.id         — message ID
  // info.agent      — agent name (runtime field, may need type assertion)
  // info.model      — { providerID, modelID } (on user messages)
  // parts[].type    — "text", "tool-invocation", etc.
  // parts[].synthetic — boolean, true = invisible to user
}
```

**`experimental.text.complete`** — modify text completion output before it's stored.

```ts
"experimental.text.complete": async (input, output) => {
  // input.sessionID  — session ID
  // input.messageID  — message ID
  // input.partID     — part ID
  // output.text      — mutable string (the completion text)

  output.text = output.text.replace(/hallucinated pattern/g, "");
}
```

### Command Hook

**`command.execute.before`** — intercept slash commands before they execute.

```ts
"command.execute.before": async (input, output) => {
  // input.command    — command name (string, without the leading /)
  // input.sessionID  — current session ID
  // input.arguments  — raw argument string

  if (input.command !== "mycommand") return;

  // output.parts — mutable Part[] array — what gets sent to the LLM
  // Clear to prevent the command template from reaching the LLM:
  output.parts.length = 0;

  // Handle the command yourself, then abort the pipeline:
  throw new Error("__MY_COMMAND_HANDLED__");
  // (The error message is swallowed; the LLM never sees it)

  // Or replace what the LLM sees:
  output.parts.length = 0;
  output.parts.push({ type: "text", text: "Processed: " + input.arguments });
}
```

### Permission Hook

**`permission.ask`** — programmatically auto-allow, auto-deny, or defer permissions.

```ts
"permission.ask": async (input, output) => {
  // input — Permission object:
  //   input.id          — permission ID
  //   input.type        — permission type string
  //   input.title       — display title
  //   input.sessionID   — session ID
  //   input.messageID   — message ID
  //   input.callID      — call ID
  //   input.metadata    — extra metadata
  //   input.pattern     — file pattern or command pattern

  // output.status — "ask" (default: show dialog) | "allow" (auto-approve) | "deny" (auto-reject)
  output.status = "allow";  // auto-approve
}
```

### Config Hook

**`config`** — mutate OpenCode's runtime configuration. Fires once at startup. Use to register slash commands, agents, tool permissions, and experimental flags.

```ts
config: async (opencodeConfig) => {
  // Register a slash command
  opencodeConfig.command ??= {};
  opencodeConfig.command["mycommand"] = {
    description: "Description shown in /help",
    template: "Instructions sent to the LLM when /mycommand is invoked",
  };

  // Register an agent
  opencodeConfig.agent ??= {};
  opencodeConfig.agent["explorer"] = {
    model: "anthropic/claude-sonnet-4-20250514",
    instructions: "You are an exploration agent...",
    // ...other agent config
  };

  // Set tool permissions
  opencodeConfig.permission ??= {};
  opencodeConfig.permission["compress"] = "allow"; // "ask" | "allow" | "deny"

  // Add tools to the primary tool set (available to main agent)
  const existing = opencodeConfig.experimental?.primary_tools ?? [];
  opencodeConfig.experimental = {
    ...opencodeConfig.experimental,
    primary_tools: [...existing, "my_tool"],
  };

  // Add tools available to subagents
  const existingSub = opencodeConfig.experimental?.subagent_tools ?? [];
  opencodeConfig.experimental = {
    ...opencodeConfig.experimental,
    subagent_tools: [...existingSub, "broadcast", "recall"],
  };

  // Register skill paths
  opencodeConfig.skills ??= {};
  opencodeConfig.skills.paths ??= [];
  opencodeConfig.skills.paths.push("~/.config/opencode/my-skills");
}
```

### Compaction Hook

**`experimental.session.compacting`** — inject context into the compaction prompt so the model retains critical state.

```ts
"experimental.session.compacting": async (input, output) => {
  // input.sessionID — session being compacted
  // output.context  — mutable string array, appended to compaction prompt
  // output.prompt   — set to replace the entire compaction prompt (overrides context)

  // Capture state BEFORE compaction
  const running = getRunningTasks(input.sessionID);
  const todos = getPendingTodos(input.sessionID);

  // Inject state so the compacted summary preserves it
  output.context.push(`Active delegations:\n${JSON.stringify(running)}`);
  output.context.push(`Pending todos:\n${JSON.stringify(todos)}`);
}
```

### Session Hooks

**`session.before.idle`** — fires before a session transitions to idle. Can prevent idle by setting a resume prompt.

```ts
"session.before.idle": async (input, output) => {
  // output.resumePrompt — set to a string to prevent idle and resume the session
  const pending = getPendingWork(input.sessionID);
  if (pending) {
    output.resumePrompt = `Subagent completed: ${pending.summary}`;
  }
}
```

**`session.idle`** — fires when a session becomes idle.

```ts
"session.idle": async (input, output) => {
  markSessionIdle(input.sessionID);
}
```

### Shell Hook

**`shell.env`** — inject environment variables into all shell execution.

```ts
"shell.env": async (input, output) => {
  // input.cwd    — current working directory
  // output.env   — mutable env object
  output.env.MY_VAR = "value";
}
```

---

## SDK Client Methods

The `client` object provides API access to OpenCode internals.

### Session Management

```ts
// Create a new session (optionally as a child of another)
const { data } = await client.session.create({
  body: { parentID: parentSessionID, title: "Background task" },
});
const newSessionID = data.id;

// Get session info (e.g., check if it's a subagent)
const { data } = await client.session.get({ path: { id: sessionID } });
const isSubagent = !!data.parentID;

// Update session metadata (e.g., set title)
await client.session.update({
  path: { id: sessionID },
  body: { title: "New title" },
});

// Delete a session
await client.session.delete({ path: { id: sessionID } });

// List child sessions
const { data } = await client.session.children({ path: { id: sessionID } });
```

### Session Messaging

```ts
// Inject a synthetic message (agent sees it, user doesn't)
await client.session.prompt({
  path: { id: sessionID },
  body: {
    noReply: true,                           // don't trigger an agent response
    parts: [{ type: "text", text: "...", synthetic: true }],
    model: { providerID, modelID },          // optional: target specific model
    agent: "build",                          // optional: target specific agent
  },
});

// Send a prompt that triggers an agent response
await client.session.prompt({
  path: { id: sessionID },
  body: {
    parts: [{ type: "text", text: "Do the task" }],
    agent: "coder",
  },
});

// Fire-and-forget prompt (don't await completion)
await client.session.promptAsync({
  path: { id: sessionID },
  body: { parts: [{ type: "text", text: "..." }] },
});

// List messages in a session
const { data } = await client.session.messages({
  path: { id: sessionID },
  query: { limit: 100 },
});
// data = array of { info: Message, parts: Part[] }

// Execute a slash command programmatically
await client.session.command({
  path: { id: sessionID },
  body: { command: "plan", arguments: "review the architecture", agent: "plan", model: undefined },
  query: { directory },
});
```

### TUI (Terminal UI)

```ts
// Show a toast notification
await client.tui.showToast({
  body: {
    title: "Task Complete",         // optional
    message: "All tests passed",
    variant: "success",             // "info" | "success" | "warning" | "error"
    duration: 4000,                 // milliseconds, optional
  },
});

// Execute a TUI command (e.g., create a new session)
await client.tui.executeCommand({ body: { command: "session_new" } });

// Pre-fill the prompt input area
await client.tui.appendPrompt({ body: { text: "Review this code..." } });
```

### App & Config

```ts
// Structured logging
await client.app.log({
  body: {
    service: "my-plugin",
    level: "info",     // "debug" | "info" | "warn" | "error"
    message: "Hello",
  },
});

// List all configured agents
const { data } = await client.app.agents();

// Get current OpenCode config
const { data } = await client.config.get();

// List all providers and models
const { data } = await client.provider.list();
// data.all = array of { id, models: { [modelID]: { name } } }
```

### Parts & Instance

```ts
// Update a specific message part
await client.part.update({
  path: { sessionID, messageID, partID },
  body: { /* updated part data */ },
});

// Dispose/reload the plugin instance (forces re-init)
await client.instance.dispose();
```

---

## Custom Tools

### Standard Pattern: `tool()` helper

```ts
import { tool } from "@opencode-ai/plugin";

return {
  tool: {
    my_tool: tool({
      description: "What the tool does",
      args: {
        input: tool.schema.string().describe("The input text"),
        count: tool.schema.number().int().positive().optional(),
        scope: tool.schema.enum(["global", "project"]).optional(),
        tags: tool.schema.array(tool.schema.string()).optional(),
        config: tool.schema.record(tool.schema.string()).optional(),
        verbose: tool.schema.boolean().optional(),
      },
      async execute(args, context) {
        // context.directory  — working directory
        // context.worktree   — git worktree path
        // context.sessionID  — current session ID
        // context.agent      — current agent name
        return `Result: ${args.input}`;
      },
    }),
  },
};
```

**`tool.schema` builder API (Zod-like):**

| Method | Description |
|--------|-------------|
| `tool.schema.string()` | String type |
| `tool.schema.number()` | Number type |
| `tool.schema.number().int()` | Integer |
| `tool.schema.number().int().positive()` | Positive integer |
| `tool.schema.number().int().nonnegative()` | Non-negative integer |
| `tool.schema.boolean()` | Boolean type |
| `tool.schema.enum(["a", "b"])` | Enum (string union) |
| `tool.schema.array(innerSchema)` | Array of inner type |
| `tool.schema.record(valueSchema)` | Record/dict with string keys |
| `.optional()` | Mark as optional (chainable on any type) |
| `.describe("...")` | Add description (chainable on any type) |

If a plugin tool name collides with a built-in, the plugin tool wins.

### Alternative Pattern: `Tool.define()` + `tool.register` hook

Some plugins use the native `Tool.define` factory with a `tool.register` hook instead of the `tool()` helper:

```ts
export const MyPlugin: Plugin = async ({ Tool, z }) => {
  const MyTool = Tool.define("my_tool", {
    description: "What the tool does",
    parameters: z.object({
      query: z.string().describe("Search query"),
      timeout: z.number().min(5).max(120).optional(),
    }),
    async execute(params, ctx) {
      // ctx.abort    — AbortSignal for cancellation
      // ctx.metadata — function to set TUI display metadata

      ctx.abort.addEventListener("abort", () => { /* cleanup */ }, { once: true });

      ctx.metadata({
        title: `Search: ${params.query}`,
        metadata: { query: params.query },
      });

      return {
        title: `Result: ${params.query}`,
        output: "...",
        metadata: { /* ... */ },
      };
    },
  });

  return {
    async ["tool.register"](_input, { register }) {
      register(MyTool);
    },
  };
};
```

---

## `$` Shell Executor

The plugin context includes `$`, a Bun shell tagged template API:

```ts
export const MyPlugin: Plugin = async ({ $, directory }) => {
  // Basic execution — returns text output
  const gitRoot = await $`git rev-parse --show-toplevel`.quiet().text();

  // Change working directory
  const output = await $`direnv export json`.cwd(directory).quiet().text();

  // Error handling
  try {
    const result = await $`some-command`.quiet().text();
  } catch (error) {
    const stderr = error.stderr; // string
  }

  return { /* hooks */ };
};
```

Methods: `.quiet()` (suppress stderr), `.cwd(dir)` (set working directory), `.text()` (get stdout as string).

---

## Patterns

### Inject context on first message in session

Use `chat.message` to detect the first message, `client.session.prompt` to inject, and the `event` hook to re-inject after compaction. Clean up on session deletion.

```ts
const injectedSessions = new Set<string>();

return {
  "chat.message": async (_input, output) => {
    const sessionID = output.message.sessionID;
    if (injectedSessions.has(sessionID)) return;
    injectedSessions.add(sessionID);

    await client.session.prompt({
      path: { id: sessionID },
      body: {
        noReply: true,
        model: output.message.model,
        agent: output.message.agent,
        parts: [{ type: "text", text: "Your injected context here", synthetic: true }],
      },
    });
  },

  event: async ({ event }) => {
    if (event.type === "session.compacted") {
      const sessionID = event.properties.sessionID;
      injectedSessions.delete(sessionID);
      // Will re-inject on next chat.message
    }
    if (event.type === "session.deleted") {
      injectedSessions.delete(event.properties.info.id);
    }
  },
};
```

### Intercept and transform tool args

```ts
"tool.execute.before": async (input, output) => {
  if (input.tool === "bash") {
    // Prefix every bash command with snip to reduce token usage
    output.args.command = `snip ${output.args.command}`;
  }
}
```

### Block dangerous operations

```ts
"tool.execute.before": async (input, output) => {
  if (input.tool === "read" && output.args.filePath?.includes(".env")) {
    throw new Error("Blocked: use envsitter tools instead of reading .env files directly");
  }
}
```

### Inject synthetic parts into message history (transform)

```ts
"experimental.chat.messages.transform": async (_input, output) => {
  const lastUser = output.messages.findLast(m => m.info.role === "user");
  if (!lastUser) return;

  // Dedup: check if already injected
  const alreadyInjected = lastUser.parts.some(
    p => p.type === "text" && p.synthetic && p.text.includes("MY_MARKER"),
  );
  if (alreadyInjected) return;

  lastUser.parts.unshift({
    type: "text",
    id: `synthetic-${Date.now()}`,
    sessionID: lastUser.info.sessionID,
    messageID: lastUser.info.id,
    text: "[SYSTEM: MY_MARKER — additional context here]",
    synthetic: true,
  });
}
```

### Register slash commands

Two-step: register via `config` hook, intercept via `command.execute.before`.

```ts
return {
  config: async (opencodeConfig) => {
    opencodeConfig.command ??= {};
    opencodeConfig.command["dcp"] = {
      template: "",
      description: "Show available DCP commands",
    };
  },

  "command.execute.before": async (input, output) => {
    if (input.command !== "dcp") return;

    const args = (input.arguments || "").trim().split(/\s+/).filter(Boolean);
    const subcommand = args[0]?.toLowerCase() || "";

    if (subcommand === "stats") {
      // Handle /dcp stats — show stats via toast or inject into session
      await client.tui.showToast({
        body: { message: "Tokens saved: 1234", variant: "info" },
      });
      throw new Error("__DCP_STATS_HANDLED__"); // abort pipeline
    }

    if (subcommand === "compress") {
      // Replace what the LLM sees
      output.parts.length = 0;
      output.parts.push({ type: "text", text: "Compress the context now." });
      return; // let the LLM process it
    }

    // Default: show help
    output.parts.length = 0;
    output.parts.push({ type: "text", text: "Available: /dcp stats, /dcp compress" });
  },
};
```

### Register agents via plugin

Load agent definitions (e.g., from markdown with YAML frontmatter) and inject via `config`:

```ts
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

function loadAgents(dir: string): Record<string, any> {
  const agents: Record<string, any> = {};
  for (const file of readdirSync(dir).filter(f => f.endsWith(".md"))) {
    const content = readFileSync(join(dir, file), "utf-8");
    const frontmatter = parseFrontmatter(content); // extract YAML between --- delimiters
    const name = file.replace(".md", "");
    agents[name] = {
      model: frontmatter.model,
      instructions: content.slice(content.indexOf("---", 3) + 3).trim(),
      ...frontmatter,
    };
  }
  return agents;
}

return {
  config: async (opencodeConfig) => {
    const agents = loadAgents(AGENT_DIR);
    if (Object.keys(agents).length > 0) {
      opencodeConfig.agent = { ...(opencodeConfig.agent ?? {}), ...agents };
    }
  },
};
```

### Background / child session management

Create fire-and-forget child sessions, monitor via events, clean up on completion:

```ts
const activeDelegations = new Map<string, { sessionID: string; parentID: string }>();

return {
  tool: {
    delegate: tool({
      description: "Delegate a task to a background agent",
      args: {
        prompt: tool.schema.string(),
        agent: tool.schema.string().optional(),
      },
      async execute(args, context) {
        // Create child session
        const { data } = await client.session.create({
          body: { parentID: context.sessionID, title: args.prompt.slice(0, 60) },
        });

        // Fire and forget — don't await
        client.session.prompt({
          path: { id: data.id },
          body: {
            parts: [{ type: "text", text: args.prompt }],
            agent: args.agent,
          },
        }).catch(err => console.error("Delegation failed:", err));

        activeDelegations.set(data.id, {
          sessionID: data.id,
          parentID: context.sessionID,
        });

        return `Delegated to session ${data.id}`;
      },
    }),
  },

  event: async ({ event }) => {
    if (event.type === "session.idle") {
      const sessionID = event.properties.sessionID;
      const delegation = activeDelegations.get(sessionID);
      if (!delegation) return;

      // Read final output from child
      const { data } = await client.session.messages({ path: { id: sessionID } });
      const lastAssistant = data?.findLast(m => m.info.role === "assistant");
      const summary = lastAssistant?.parts?.find(p => p.type === "text")?.text ?? "Done";

      // Notify parent
      await client.session.prompt({
        path: { id: delegation.parentID },
        body: {
          noReply: true,
          parts: [{ type: "text", text: `[Background task completed]\n${summary}`, synthetic: true }],
        },
      });

      activeDelegations.delete(sessionID);
    }
  },

  // Preserve delegation state across compactions
  "experimental.session.compacting": async (input, output) => {
    const running = [...activeDelegations.values()]
      .filter(d => d.parentID === input.sessionID);
    if (running.length > 0) {
      output.context.push(`Active background tasks: ${JSON.stringify(running)}`);
    }
  },
};
```

### TUI automation

Create pre-filled draft sessions with toast feedback:

```ts
async execute(args, context) {
  // Create a new session in the TUI
  await client.tui.executeCommand({ body: { command: "session_new" } });
  await new Promise(r => setTimeout(r, 150)); // small delay for TUI to update

  // Pre-fill the prompt
  await client.tui.appendPrompt({ body: { text: args.prompt } });

  // Notify the user
  await client.tui.showToast({
    body: {
      title: "Handoff Ready",
      message: "Review and edit the draft, then send",
      variant: "success",
      duration: 4000,
    },
  });

  return "Draft created in new session.";
}
```

### Subagent detection

Check if the current session is a subagent, and filter out internal agents by system prompt signatures:

```ts
async function isSubagent(client, sessionID): Promise<boolean> {
  const { data } = await client.session.get({ path: { id: sessionID } });
  return !!data?.parentID;
}

const INTERNAL_AGENT_SIGNATURES = [
  "You are a title generator",
  "You are a helpful AI assistant tasked with summarizing conversations",
];

"experimental.chat.system.transform": async (input, output) => {
  // Skip internal agents (title gen, summarizer, etc.)
  const systemText = output.system.join("\n");
  if (INTERNAL_AGENT_SIGNATURES.some(sig => systemText.includes(sig))) return;

  output.system.push("Your custom system prompt addition");
}
```

### Bounded state management

Cap in-memory collections to prevent unbounded growth:

```ts
const processedCallIds = new Set<string>();

function trackCallId(callID: string) {
  processedCallIds.add(callID);
  // Evict oldest half when at capacity
  if (processedCallIds.size > 1000) {
    const ids = Array.from(processedCallIds);
    for (let i = 0; i < 500; i++) processedCallIds.delete(ids[i]);
  }
}

// For Maps: evict oldest entry when at capacity
function setBounded<K, V>(map: Map<K, V>, key: K, value: V, max = 500) {
  if (map.size >= max) {
    const oldest = map.keys().next().value;
    map.delete(oldest);
  }
  map.set(key, value);
}
```

---

## Installation

**From npm** (published plugins):
```jsonc
// opencode.json
{ "plugin": ["my-plugin-package", "@org/another-plugin"] }
```

**From local files** (development):
```
.opencode/plugins/my-plugin.ts   — project-level, auto-loaded
~/.config/opencode/plugins/       — global, auto-loaded
```

**Dependencies for local plugins:**
```jsonc
// .opencode/package.json
{ "dependencies": { "some-dep": "^1.0.0" } }
```
OpenCode runs `bun install` at startup for `.opencode/package.json`.

---

## Injection Method Tradeoffs

| Method | Persists? | Per-turn cost | Survives compaction? |
|--------|-----------|---------------|---------------------|
| `client.session.prompt` with `noReply` | Yes, in history | None after injection | No — re-inject on `session.compacted` |
| `experimental.chat.system.transform` | No | Runs every turn | Yes — recomputed each time |
| `experimental.chat.messages.transform` | No | Runs every turn | Yes — recomputed each time |
| `experimental.session.compacting` + `context` | N/A | Only during compaction | Ensures state survives compaction |

- For large docs: prefer `session.prompt` + compaction re-inject (one-time cost)
- For small, always-needed context: prefer `system.transform` (simpler, no state tracking)
- For per-message dynamic content: prefer `messages.transform`
- For state that must survive compaction: use `experimental.session.compacting` `output.context`

---

## Dependencies

```jsonc
// package.json
{
  "dependencies": {
    "@opencode-ai/plugin": "^1.0.115"  // plugin SDK (definePlugin, tool helper, types)
  },
  "peerDependencies": {
    "@opencode-ai/sdk": "*"            // SDK types (Message, Part, Event, etc.)
  }
}
```

Key imports:
```ts
import type { Plugin, PluginInput, Hooks, ToolDefinition } from "@opencode-ai/plugin";
import { tool } from "@opencode-ai/plugin";
// or for the tool import path used by some plugins:
import { tool } from "@opencode-ai/plugin/tool";
import type { Message, Part, Event, Permission } from "@opencode-ai/sdk";
// SDK v2 types (when needed):
import type { Message, Part } from "@opencode-ai/sdk/v2";
```

The `PluginInput["client"]` type can be used to type the SDK client in helper functions:
```ts
import type { PluginInput } from "@opencode-ai/plugin";
type OpencodeClient = PluginInput["client"];
```

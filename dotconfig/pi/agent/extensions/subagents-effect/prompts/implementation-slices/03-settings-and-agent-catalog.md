# Slice 03: Settings repository, agent catalog, and management

Read `00-global-rules.md` first.

## Goal

Implement typed configuration and agent/chain discovery. This slice gives later compilation code a reliable `AgentCatalog` instead of ad hoc filesystem parsing.

## Create

- `src/services/settings-repository.ts`
- `src/services/agent-catalog.ts`
- `src/services/agent-management.ts`
- `src/domain/frontmatter.ts` if useful
- `src/domain/management.ts` if useful
- tests under `test/services/agent-catalog.test.ts` and `test/services/settings-repository.test.ts`

## Behavioral references

Use the old extension as behavior reference, not as code to copy wholesale:

- `../subagents/src/agents/agents.ts`
- `../subagents/src/agents/frontmatter.ts`
- `../subagents/src/agents/agent-management.ts`
- `../subagents/src/agents/identity.ts`
- `../subagents/src/agents/agent-selection.ts`
- `../subagents/src/agents/chain-serializer.ts`

## Services

### `SettingsRepository`

Responsibilities:

- locate user settings and project settings
- decode extension config using Effect Schema
- decode `subagents.agentOverrides`
- expose typed defaults from schema definitions, not fallback object literals
- report malformed files as `ConfigLoadError`

Use `FileSystem.FileSystem` and `Path.Path`. Use Schema JSON codecs rather than direct `JSON.parse`.

### `AgentCatalog`

Responsibilities:

- discover builtin agents from this new package once those exist, while allowing tests to pass custom builtin dirs
- discover user agents under `~/.pi/agent/agents/**/*.md`
- discover project agents under `.pi/agents/**/*.md` and legacy `.agents/**/*.md`
- discover user/project chains enough for list/get; full workflow compilation is later
- parse markdown frontmatter into `AgentDefinition`
- parse package/local names into runtime names
- split tools into builtin tools and direct MCP tools
- apply builtin overrides from settings
- implement precedence: builtin < user < project
- filter disabled agents

Expose methods like:

```ts
readonly discover: (cwd: string, scope: AgentScope) => Effect.Effect<AgentCatalogSnapshot, AgentDiscoveryError>;
readonly resolve: (name: RuntimeAgentName, cwd: string, scope: AgentScope) => Effect.Effect<ResolvedAgent, AgentResolutionError>;
readonly resolveMany: (... ) => Effect.Effect<ReadonlyArray<ResolvedAgent>, AgentResolutionError>;
```

### `AgentManagement`

Responsibilities:

- list agents/chains
- get a specific agent/chain
- create/update/delete user/project definitions in typed form
- validate names and scope
- surface warnings for missing skills/models only as data; do not fail unless the definition is invalid

This service should return typed management results; formatting belongs later.

## Tests

Use temporary directories and injected config paths. Do not depend on the user's real `~/.pi` state.

Test:

- user agent overrides builtin with same runtime name.
- project agent overrides user.
- package name `code-analysis` + local name `scout` yields runtime `code-analysis.scout`.
- `mcp:chrome-devtools` is separated from builtin tools.
- malformed frontmatter fails with typed error.
- malformed settings fails with typed error.
- disabled builtin is hidden.
- management list/get returns deterministic sorted data.

## Acceptance criteria

- No direct platform imports in service code.
- All config/frontmatter is schema-decoded.
- Services are layer-backed and testable with fake dirs.
- `npm run check` passes.

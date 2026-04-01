# effect-zellij Improvement Plan

## Overview

Comprehensive upgrade of effect-zellij to cover the full Zellij CLI API with proper Effect patterns.

## Tasks

### 1. Fix Command Splitting Bug (Critical)

**File**: `src/internal/commands.ts`
**Issue**: `command.split(" ")` breaks on commands with spaces/quotes
**Fix**: Accept `ReadonlyArray<string>` for command args, join properly or pass through

### 2. Model PaneLocation as ADT

**File**: `src/internal/PaneLocation.ts` (new)
**Current**: `"right" | "down" | "inplace" | "floating"` with hardcoded dimensions
**Target**:

```typescript
const PaneLocation = Data.TaggedEnum<{
	Direction: { direction: 'right' | 'down' | 'left' | 'up' };
	Floating: {
		width?: string;
		height?: string;
		x?: string;
		y?: string;
		pinned?: boolean;
	};
	InPlace: {};
}>();
```

- Update all commands to use new ADT
- Add helper to convert ADT to CLI args

### 3. Add Full `zellij run` Options

**File**: `src/internal/commands.ts`
**New signature**:

```typescript
interface RunOptions {
	location?: PaneLocation;
	cwd?: string;
	name?: string;
	closeOnExit?: boolean;
	startSuspended?: boolean;
}
run: (command: ReadonlyArray<string>, options?: RunOptions) =>
	Effect<number, PlatformError>;
```

### 4. Implement ZellijSession

**File**: `src/ZellijSession.ts`
**Actions**:

- `attach(sessionName: string, options?: { createIfMissing?: boolean })`
- `killSession(name: string)`
- `killAllSessions`
- `deleteSession(name: string)` - for resurrectable sessions
- `deleteAllSessions`

### 5. Add Query Actions

**File**: `src/internal/commands.ts` + expose via `Zellij.ts`
**New commands**:

- `queryTabNames: Effect<ReadonlyArray<string>, PlatformError>`
- `dumpLayout: Effect<string, PlatformError>` (returns KDL)
- `listClients: Effect<ReadonlyArray<Client>, PlatformError>`
- `dumpScreen(path: string): Effect<void, PlatformError>`

### 6. Add Pipe Support

**File**: `src/ZellijPipe.ts` (new)
**API**:

```typescript
interface PipeOptions {
	name?: string;
	plugin?: string;
	pluginConfiguration?: string;
	args?: string;
}
pipe: (payload: string, options?: PipeOptions) => Effect<string, PlatformError>;
```

## Implementation Order

1. **Task 1** - Bug fix (unblocks everything)
2. **Task 2** - ADT (foundation for proper typing)
3. **Task 3** - Run options (uses new ADT)
4. **Task 4** - Session management (independent)
5. **Task 5** - Query actions (independent)
6. **Task 6** - Pipe support (independent)

## Files to Create/Modify

- `src/internal/PaneLocation.ts` - NEW: ADT definition
- `src/internal/commands.ts` - MODIFY: fix bug, add new commands
- `src/Zellij.ts` - MODIFY: expose new capabilities
- `src/ZellijSession.ts` - MODIFY: implement session management
- `src/ZellijPipe.ts` - MODIFY: implement pipe support
- `src/index.ts` - MODIFY: export new modules

## Testing Notes

- All commands require being inside a zellij session to test
- Use `ZELLIJ_SESSION_NAME` env var to detect session
- Consider adding dry-run mode for testing command construction

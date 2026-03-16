# Plugin API — Utils

Utility functions and classes: `ya.*`, `fs.*`, `Command`, `Child`, `Output`, `Status`.

## Table of Contents

- [ya — Core utilities](#ya)
- [fs — Filesystem (async only)](#fs)
- [Command — External processes (async only)](#command)
- [Child — Running process](#child)
- [Output / Status](#output--status)

## ya

### UI & Interaction

| Function | Context | Signature | Description |
|----------|---------|-----------|-------------|
| `ya.emit` | any | `(action: string, args: table) -> void` | Send action to `[mgr]` layer |
| `ya.which` | async | `(opts) -> integer?` | Prompt key selection. Returns 1-based index or nil |
| `ya.input` | async | `(opts) -> (string?, integer)` or `Recv` | Request user input |
| `ya.confirm` | async | `(opts) -> boolean` | Request yes/no confirmation |
| `ya.notify` | any | `(opts) -> void` | Show foreground notification |

#### ya.emit

```lua
ya.emit("cd", { "/tmp" })
ya.emit("shell", { "echo hello", block = true })
-- Equivalent to: shell "echo hello" --block
```

Args table: integer keys = positional, string keys = named flags. Values follow ownership transfer rules.

#### ya.which

```lua
local idx = ya.which {
  cands = {
    { on = "a", desc = "Option A" },
    { on = "b", desc = "Option B" },
    { on = { "c", "d" }, desc = "Multi-key" },
  },
  silent = false,  -- show key indicator UI
}
-- idx is 1, 2, 3, or nil (cancelled)
```

#### ya.input

```lua
local value, event = ya.input {
  pos = { "top-center", y = 3, w = 40 },
  title = "Enter name:",
  value = "default",
  obscure = false,
  realtime = false,
  debounce = 0.3,  -- only with realtime=true
}
-- event: 0=error, 1=confirmed, 2=cancelled, 3=changed (realtime)
```

With `realtime = true`, returns a receiver:

```lua
local recv = ya.input { ..., realtime = true }
while true do
  local value, event = recv:recv()
  if not value then break end
end
```

#### ya.confirm

```lua
local yes = ya.confirm {
  pos = { "center", w = 40, h = 10 },
  title = "Delete?",
  body = ui.Text("Are you sure?"):wrap(ui.Wrap.YES),
}
```

#### ya.notify

```lua
ya.notify {
  title = "Done",
  content = "Operation complete",
  timeout = 5,
  level = "info",  -- "info" | "warn" | "error"
}
```

### Preview

| Function | Context | Signature |
|----------|---------|-----------|
| `ya.preview_code` | async | `(opts: {area, file, mime, skip}) -> (Error?, integer?)` |
| `ya.preview_widget` | async | `(opts: {area, file, mime, skip}, widget: Renderable\|Renderable[])` |
| `ya.image_show` | async | `(url: Url, rect: Rect)` |
| `ya.image_precache` | async | `(src: Url, dist: Url)` |
| `ya.file_cache` | any | `(opts: {file, skip}) -> Url?` |

```lua
-- Preview code with syntax highlighting
local err, upper = ya.preview_code {
  area = job.area, file = job.file, mime = "text/plain", skip = job.skip,
}

-- Preview custom widgets
ya.preview_widget(
  { area = job.area, file = job.file, mime = "text/plain", skip = 0 },
  ui.Text("Hello"):area(job.area)
)
```

### Threading & Sync

| Function | Context | Signature |
|----------|---------|-----------|
| `ya.sync` | top-level | `(fn) -> fn` | Make function synchronous (async→sync bridge) |
| `ya.async` | sync | `(fn) -> any` | Run function asynchronously (sync→async bridge, experimental) |

### System

| Function | Context | Signature |
|----------|---------|-----------|
| `ya.target_os()` | any | `-> string` ("linux", "macos", "windows", etc.) |
| `ya.target_family()` | any | `-> string` ("unix", "windows", "wasm") |
| `ya.hash(str)` | async | `-> string` (MD5, will change to xxHash) |
| `ya.quote(str)` | any | `-> string` (shell-escape) |
| `ya.clipboard(text?)` | async | `-> string?` (get/set system clipboard) |
| `ya.time()` | any | `-> number` (timestamp, float with ms precision) |
| `ya.sleep(secs)` | async | `-> void` |
| `ya.uid()` | any | `-> integer` (Unix only) |
| `ya.gid()` | any | `-> integer` (Unix only) |
| `ya.user_name(uid?)` | any | `-> string?` (Unix only) |
| `ya.group_name(gid?)` | any | `-> string?` (Unix only) |
| `ya.host_name()` | any | `-> string?` (Unix only) |

### Logging

| Function | Context | Signature |
|----------|---------|-----------|
| `ya.dbg(msg, ...)` | any | Log at debug level (any type supported) |
| `ya.err(msg, ...)` | any | Log at error level |

```lua
ya.dbg("value:", { foo = "bar", n = 42 })
```

## fs

All `fs.*` functions are **async only**.

| Function | Signature | Description |
|----------|-----------|-------------|
| `fs.cwd()` | `-> Url?, Error?` | Process CWD (not same as `cx.active.current.cwd`) |
| `fs.cha(url, follow?)` | `-> Cha?, Error?` | Get file characteristics |
| `fs.write(url, data)` | `-> boolean, Error?` | Write string to file |
| `fs.create(type, url)` | `-> boolean, Error?` | Create file/dir |
| `fs.remove(type, url)` | `-> boolean, Error?` | Remove file/dir |
| `fs.read_dir(url, opts?)` | `-> File[]?, Error?` | List directory contents |
| `fs.copy(from, to)` | `-> integer?, Error?` | Copy file (returns bytes copied) |
| `fs.rename(from, to)` | `-> boolean, Error?` | Rename/move (same filesystem only) |
| `fs.unique_name(url)` | `-> Url?, Error?` | Generate unique filename |

### fs.create types

`"dir"` — single directory, `"dir_all"` — recursive (like `mkdir -p`)

### fs.remove types

`"file"`, `"dir"` (empty only), `"dir_all"` (recursive), `"dir_clean"` (empty dirs only)

### fs.read_dir options

```lua
local files, err = fs.read_dir(url, {
  glob = "*.lua",    -- filter pattern
  limit = 100,       -- max files
  resolve = false,   -- resolve symlinks
})
```

### Cross-filesystem move pattern

```lua
local ok, err = fs.rename(from, to)
if not ok and err.kind == "CrossesDevices" then
  local len, err = fs.copy(from, to)
  if len and not err then fs.remove("file", from) end
end
```

## Command

Async process execution. Builder pattern API.

```lua
local child, err = Command("ls")
  :arg({ "-a", "-l" })
  :cwd("/tmp")
  :env("FOO", "bar")
  :stdin(Command.NULL)      -- NULL (default), PIPED, INHERIT
  :stdout(Command.PIPED)
  :stderr(Command.PIPED)
  :spawn()
```

| Stdio constant | Description |
|---------------|-------------|
| `Command.NULL` | Ignore stream (default) |
| `Command.PIPED` | Create pipe between parent/child |
| `Command.INHERIT` | Inherit from parent process |

### Builder methods (all return `self`)

| Method | Args |
|--------|------|
| `arg` | `string \| string[]` |
| `cwd` | `string` |
| `env` | `key: string, value: string` |
| `stdin` | `Stdio` |
| `stdout` | `Stdio` |
| `stderr` | `Stdio` |

### Execution methods

| Method | Returns | Description |
|--------|---------|-------------|
| `spawn()` | `Child?, Error?` | Start process, return handle |
| `output()` | `Output?, Error?` | Run to completion, collect output |
| `status()` | `Status?, Error?` | Run to completion, get exit status |

### Convenience patterns

```lua
-- One-shot: run and get output
local out, err = Command("git"):arg("status"):stdout(Command.PIPED):output()
if out then ya.dbg(out.stdout) end

-- Pipe commands: echo | rev
local echo = Command("echo"):arg("Hello"):stdout(Command.PIPED):spawn()
local rev = Command("rev"):stdin(echo:take_stdout()):stdout(Command.PIPED):output()
```

## Child

Handle to a spawned process.

### Reading output

| Method | Signature | Description |
|--------|-----------|-------------|
| `read(len)` | `-> string?, integer` | Read up to `len` bytes. Event: 0=stdout, 1=stderr, 2=EOF |
| `read_line()` | `-> string?, integer` | Read one line. Same events. |
| `read_line_with(opts)` | `-> string?, integer` | Read with timeout. Event 3=timeout. |

### Writing input

| Method | Signature | Description |
|--------|-----------|-------------|
| `write_all(src)` | `-> boolean, Error?` | Write string to stdin |
| `flush()` | `-> boolean, Error?` | Flush stdin buffer |

### Lifecycle

| Method | Signature | Description |
|--------|-----------|-------------|
| `wait()` | `-> Status?, Error?` | Wait for exit |
| `wait_with_output()` | `-> Output?, Error?` | Wait and collect output |
| `start_kill()` | `-> boolean, Error?` | Send SIGTERM |

### Stream access (call once only)

| Method | Returns | Description |
|--------|---------|-------------|
| `take_stdin()` | `Stdio?` | Take stdin for piping |
| `take_stdout()` | `Stdio?` | Take stdout for piping |
| `take_stderr()` | `Stdio?` | Take stderr for piping |

## Output / Status

### Output

| Property | Type |
|----------|------|
| `status` | `Status` |
| `stdout` | `string` |
| `stderr` | `string` |

### Status

| Property | Type | Description |
|----------|------|-------------|
| `success` | `boolean` | Exited successfully |
| `code` | `integer?` | Exit code |

# Plugin System

Yazi plugin concepts, patterns, and recipes. For API signatures see the `api-*.md` references.

## Table of Contents

- [Plugin structure](#plugin-structure)
- [Functional plugins](#functional-plugins)
- [Sync vs async](#sync-vs-async)
- [Annotations](#annotations)
- [Previewer plugins](#previewer-plugins)
- [Preloader plugins](#preloader-plugins)
- [DDS — inter-instance communication](#dds)
- [ya CLI companion](#ya-cli)
- [init.lua customization](#initlua)
- [Plugin recipes](#recipes)
- [Debugging](#debugging)

## Plugin Structure

```
~/.config/yazi/plugins/my-plugin.yazi/
├── main.lua     # Required entry point
├── README.md
└── LICENSE
```

Naming: kebab-case directory ending in `.yazi`. Install via `ya pkg`:

```bash
ya pkg add owner/plugin           # GitHub repo
ya pkg add owner/repo:subdir      # Monorepo subdirectory
ya pkg upgrade                    # Upgrade all
ya pkg list                       # List installed
ya pkg install                    # Install from package.toml lockfile
ya pkg delete owner/plugin        # Remove
```

Pin version in `package.toml`: prefix `rev` with `=`.

## Functional Plugins

Bind to a key in `keymap.toml`:

```toml
[[mgr.prepend_keymap]]
on  = "<C-p>"
run = "plugin my-plugin -- foo --bar --baz=qux"
```

```lua
-- plugins/my-plugin.yazi/main.lua
return {
  entry = function(self, job)
    ya.dbg(job.args[1])   -- "foo"
    ya.dbg(job.args.bar)  -- true
    ya.dbg(job.args.baz)  -- "qux"
  end,
}
```

## Sync vs Async

### Sync context

- Single shared context for the entire app lifecycle
- Has `cx` access (all app state: tabs, files, yanked, etc.)
- Plugin `state` persists across invocations
- Used for: UI rendering, `init.lua`, plugins with `--- @sync entry`

```lua
--- @sync entry
return {
  entry = function(state)
    state.i = state.i or 0
    ya.dbg("i = " .. state.i)  -- persists: 0, 1, 2, ...
    state.i = state.i + 1
  end,
}
```

### Async context (default)

- Created per invocation, isolated
- Can do I/O, network, time-consuming work without blocking UI
- Use `ya.sync()` blocks to bridge into sync context for state access

```lua
local set_state = ya.sync(function(state, val)
  state.data = val
end)

local get_hovered = ya.sync(function(state)
  local h = cx.active.current.hovered
  return h and tostring(h.url) or nil
end)

return {
  entry = function()
    set_state("hello")
    local path = get_hovered()
    -- Do async I/O work here
  end,
}
```

**Critical rules:**
- `ya.sync()` calls MUST be at file top level (not inside conditionals)
- Only sendable types cross thread boundary: `nil`, `boolean`, `number`, `string`, `Url`, `table`
- `Url` userdata transfers ownership when passed to cross-thread functions — clone with `Url(original)` to keep

### ya.async() — sync-to-async bridge

Run async work from sync context (experimental):

```lua
--- @sync entry
local function entry()
  local cwd = cx.active.current.cwd
  ya.async(function()
    ya.dbg(cwd)  -- cwd is Url (sendable), captured from outer sync scope
  end)
end
return { entry = entry }
```

## Annotations

Place at the very top of `main.lua`, before any code:

```lua
--- @sync entry      -- Run entry() in sync context
--- @since 25.2.13   -- Minimum Yazi version required
```

## Previewer Plugins

Return a table with `peek` (async) and `seek` (sync) methods:

```lua
local M = {}

function M:peek(job)
  -- job.area: Rect — available preview area
  -- job.file: File — file being previewed
  -- job.skip: integer — units to skip
  -- job.args: table — arguments from config

  -- Example: render text preview
  ya.preview_code {
    area = job.area,
    file = job.file,
    mime = "text/plain",
    skip = job.skip,
  }
end

function M:seek(job)
  -- job.file: File — file being scrolled
  -- job.area: Rect — preview area
  -- job.units: integer — scroll amount
  local h = cx.active.current.hovered
  if h then
    ya.emit("peek", { math.max(0, cx.active.preview.skip + job.units), only_if = h.url })
  end
end

return M
```

Register in `yazi.toml`:

```toml
[plugin]
prepend_previewers = [
  { mime = "text/x-custom", run = "my-previewer" },
]
```

## Preloader Plugins

```lua
local M = {}

function M:preload(job)
  -- job.file: File — file to preload
  -- Return (complete: bool, err?: Error)
  -- true = done, won't be called again
  -- false = retry on next opportunity
  return true
end

return M
```

Register in `yazi.toml`:

```toml
[plugin]
prepend_preloaders = [
  { mime = "image/heic", run = "my-preloader" },
]
```

## DDS

Data Distribution Service: pub/sub communication between Yazi instances.

### Subscribe in Lua (sync context — typically in init.lua/setup)

```lua
ps.sub("cd", function(body)
  ya.dbg("Local cd, tab=" .. body.tab)
end)

ps.sub_remote("cd", function(body)
  ya.dbg("Remote cd to " .. tostring(body.url))
end)
```

### Publish from Lua (sync context)

```lua
ps.pub("my-plugin-event", { key = "value" })
ps.pub_to(0, "my-plugin-event", data)  -- 0 = broadcast to all remote
```

### Built-in event kinds

| Kind | Trigger | Body (local) | Body (remote) |
|------|---------|-------------|--------------|
| `cd` | Dir change | `{tab}` | `{tab, url}` |
| `hover` | File hover | `{tab}` | `{tab, url}` |
| `rename` | Rename | `{tab, from, to}` | same |
| `bulk` | Bulk rename | Iterator of `(from, to)` | same |
| `@yank` | Yank (static) | `{}` | `{cut, Iterator<Url>}` |
| `move` | Move | `{items: [{from, to}]}` | same |
| `trash` | Trash | `{urls: [Url]}` | same |
| `delete` | Delete | `{urls: [Url]}` | same |

### Cross-instance yank (built-in session plugin)

```lua
-- init.lua
require("session"):setup { sync_yanked = true }
```

### Folder-specific sort rules via DDS

```lua
-- plugins/folder-rules.yazi/main.lua
local function setup()
  ps.sub("ind-sort", function(opt)
    local cwd = cx.active.current.cwd
    if cwd:ends_with("Downloads") then
      opt.by, opt.reverse, opt.dir_first = "mtime", true, false
    else
      opt.by, opt.reverse, opt.dir_first = "natural", false, true
    end
    return opt
  end)
end
return { setup = setup }
```

## ya CLI

```bash
# Publish to current instance (requires $YAZI_ID in subshell)
ya pub <kind> --str "body"
ya pub <kind> --list "a" "b" "c"
ya pub <kind> --json '{"key":"value"}'

# Publish to specific instance
ya pub-to <receiver> <kind> --str "body"

# Execute action on instance
ya emit cd /tmp
ya emit reveal /tmp/foo
ya emit-to "$YAZI_ID" cd /tmp

# Real-time stdout event reporting
yazi --local-events=cd,hover --remote-events=rename
# Output: kind,receiver,sender,json_body (one per line)
```

### Sync CWD from subshell (zsh)

```bash
if [[ -n "$YAZI_ID" ]]; then
  function _yazi_cd() { ya emit cd "$PWD" }
  add-zsh-hook zshexit _yazi_cd
fi
```

## init.lua

Runs synchronously at startup. Primary uses:

### Plugin configuration

```lua
require("my-plugin"):setup { option1 = "value" }
```

```lua
-- plugins/my-plugin.yazi/main.lua
return {
  setup = function(state, opts)
    state.option1 = opts.option1
  end,
}
```

### Custom linemode

```lua
function Linemode:my_mode()
  local size = self._file:size()
  return ya.readable_size(size or 0)
end
```

### Status bar additions

```lua
Status:children_add(function(self)
  local h = self._current.hovered
  return h and h.link_to and (" -> " .. tostring(h.link_to)) or ""
end, 3300, Status.LEFT)
```

### Header additions

```lua
Header:children_add(function()
  if ya.target_family() ~= "unix" then return "" end
  return ui.Span(ya.user_name() .. "@" .. ya.host_name() .. ":"):fg("blue")
end, 500, Header.LEFT)
```

## Recipes

### Smart enter (open files, enter dirs)

```lua
--- @sync entry
return {
  entry = function()
    local h = cx.active.current.hovered
    ya.emit(h and h.cha.is_dir and "enter" or "open", {})
  end,
}
```

### Confirm quit with multiple tabs

```lua
local count = ya.sync(function() return #cx.tabs end)

return {
  entry = function()
    if count() < 2 then return ya.emit("quit", {}) end
    if ya.confirm {
      pos = { "center", w = 62, h = 10 },
      title = "Quit?",
      body = ui.Text("Multiple tabs open. Quit?"):wrap(ui.Wrap.YES),
    } then
      ya.emit("quit", {})
    end
  end,
}
```

### Run external command and use output

```lua
return {
  entry = function()
    local output, err = Command("git")
      :arg({ "rev-parse", "--show-toplevel" })
      :stdout(Command.PIPED)
      :output()
    if output and output.status.success then
      local root = output.stdout:gsub("%s+$", "")
      ya.emit("cd", { root })
    end
  end,
}
```

### Interactive input

```lua
return {
  entry = function()
    local value, event = ya.input {
      pos = { "top-center", y = 3, w = 40 },
      title = "Enter path:",
      value = "",
    }
    if event == 1 and value and #value > 0 then
      ya.emit("cd", { value })
    end
  end,
}
```

## Debugging

1. `YAZI_LOG=debug yazi` — enable logging
2. `ya.dbg(value)` / `ya.err(value)` — log from plugins
3. Logs: `~/.local/state/yazi/yazi.log` (Unix)
4. Log levels: `debug > info > warn > error`

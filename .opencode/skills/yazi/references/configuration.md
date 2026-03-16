# Configuration Reference

Full reference for `yazi.toml`. Config location: `~/.config/yazi/yazi.toml` (Unix) or `%AppData%\yazi\config\yazi.toml` (Windows). Override with `YAZI_CONFIG_HOME` env var.

Only override what you need — Yazi merges your config with defaults.

## Table of Contents

- [mgr — Manager](#mgr)
- [preview — Preview pane](#preview)
- [opener — Define openers](#opener)
- [open — File open rules](#open)
- [tasks — Concurrency](#tasks)
- [plugin — Previewers, preloaders, fetchers](#plugin)
- [input — Input dialogs](#input)
- [confirm, pick, which](#other-sections)

## mgr

```toml
[mgr]
ratio        = [1, 4, 3]      # Parent/current/preview width ratio (use 0 to hide a pane)
sort_by      = "natural"       # none|mtime|btime|extension|alphabetical|natural|size|random
sort_sensitive = false         # Case-sensitive sorting
sort_reverse   = false         # Reverse sort order
sort_dir_first = true          # Directories before files
sort_translit  = false         # Transliterate for sorting (e.g. Â→A), only with natural sort
linemode     = "none"          # none|size|btime|mtime|permissions|owner or custom string (1-20 chars)
show_hidden  = false           # Show dotfiles
show_symlink = true            # Show symlink targets after filename
scrolloff    = 5               # Lines to keep above/below cursor (large value = centered cursor)
mouse_events = ["click", "scroll", "touch", "move", "drag"]  # Disable mouse: []
title_format = "{cwd}"         # Terminal title template (empty string = no title updates)
```

### Custom linemode

Set a custom string (1-20 chars) in `linemode`, then implement in `init.lua`:

```toml
# yazi.toml
[mgr]
linemode = "size_and_mtime"
```

```lua
-- init.lua
function Linemode:size_and_mtime()
  local time = math.floor(self._file.cha.mtime or 0)
  if time == 0 then
    time = ""
  elseif os.date("%Y", time) == os.date("%Y") then
    time = os.date("%b %d %H:%M", time)
  else
    time = os.date("%b %d  %Y", time)
  end
  local size = self._file:size()
  return string.format("%s %s", size and ya.readable_size(size) or "-", time)
end
```

## preview

```toml
[preview]
wrap         = "no"            # "yes"|"no" — word wrap in code preview
tab_size     = 2               # Tab width in spaces
max_width    = 600             # Max image preview width (px). Clear cache after changing.
max_height   = 900             # Max image preview height (px). Clear cache after changing.
cache_dir    = ""              # Custom cache dir (absolute path). Default: system cache.
image_delay  = 30              # ms to wait before sending image data (reduces lag on fast scrolling)
image_filter = "triangle"      # nearest|triangle|catmull-rom|lanczos3 (fast→slow, bad→good)
image_quality = 75             # 50-90, quality for cached images
ueberzug_scale  = 1.0          # Ueberzug++ image scale (0.5 for 2x HiDPI on Wayland)
ueberzug_offset = [0, 0, 0, 0] # [x, y, width, height] offset in cells
```

## opener

Define named opener groups. Each opener is an array of commands:

```toml
[opener]
edit = [
  { run = "$EDITOR %s", block = true, for = "unix" },
  { run = "%EDITOR% %s", block = true, for = "windows" },
]
play = [
  { run = "mpv %s",    orphan = true, for = "unix" },
  { run = "mpv.exe %s", orphan = true, for = "windows" },
]
open = [
  { run = "xdg-open %s", desc = "Open", for = "linux" },
  { run = "open %s",     desc = "Open", for = "macos" },
]
```

### Opener options

| Option | Description |
|--------|-------------|
| `run` | Command template (see formatting params below) |
| `block` | `true` = interactive, Yazi hides and shows program on main screen |
| `orphan` | `true` = process survives Yazi exit, detached from task system |
| `desc` | Description shown in "Open with" menu and help |
| `for` | OS filter: `linux`, `macos`, `windows`, `android`, `unix` (linux+macos+android) |

### Formatting parameters

| Param | Expands to |
|-------|------------|
| `%s` | Paths of all selected files |
| `%S` | URLs of all selected files |
| `%sN` | Path of Nth selected file (e.g. `%s1`) |
| `%h` | Path of hovered file |
| `%d` | Dirnames of all selected files |
| `%dN` | Dirname of Nth selected file |
| `%%` | Literal `%` |

## open

Map files to openers by URL glob or mime glob:

```toml
[open]
prepend_rules = [
  { url = "*.json",  use = "edit" },
  { url = "*.html",  use = ["open", "edit"] },  # Multiple openers
  { mime = "video/*", use = "play" },
]
```

| Option | Description |
|--------|-------------|
| `url` | Glob for file path. Case-insensitive; prefix `\s` for sensitive. |
| `mime` | Glob for mime-type. Case-insensitive; prefix `\s` for sensitive. |
| `use` | Opener name(s) from `[opener]`. Array = merged, first is default. |

When `use` is an array: `open` runs first command, `open --interactive` shows all.

## tasks

```toml
[tasks]
micro_workers    = 10     # Max concurrent micro-tasks
macro_workers    = 25     # Max concurrent macro-tasks
bizarre_retry    = 5      # Max retries on bizarre failure
suppress_preload = false  # Hide preload tasks from task list
image_alloc      = 0      # Max memory for decoding one image (bytes), 0 = unlimited
image_bound      = [0, 0] # Max [width, height] in pixels for one image, 0 = unlimited
```

## plugin

Configure fetchers, previewers, and preloaders:

```toml
[plugin]
prepend_previewers = [
  { mime = "image/heic", run = "heic" },   # Custom HEIC previewer
  { url = "*.raf",       run = "raf" },     # Custom RAF previewer
]
append_previewers = [
  { url = "*", run = "binary" },            # Fallback previewer
]

prepend_preloaders = [
  { mime = "image/heic", run = "heic" },
]
```

### Previewer/preloader rule options

| Option | Description |
|--------|-------------|
| `url` | Glob for file URL |
| `mime` | Glob for mime-type |
| `run` | Plugin name (corresponds to `plugins/<name>.yazi/main.lua`) |
| `prio` | Preloader priority: `low`, `normal`, `high` |

### Built-in plugins

| Plugin | Type | Purpose |
|--------|------|---------|
| `folder` | previewer | Directory preview |
| `code` | previewer | Syntax-highlighted code |
| `json` | previewer | JSON via `jq` |
| `image` | previewer + preloader | Image preview |
| `video` | previewer + preloader | Video thumbnails via `ffmpeg` |
| `pdf` | previewer + preloader | PDF via `pdftoppm` |
| `archive` | previewer | Archive listing via 7-Zip |
| `mime` | preloader | Mime-type detection |
| `noop` | both | No operation (disable preview/preload) |

### Disable all previewers/preloaders

```toml
[plugin]
preloaders = []
previewers = []
```

## input

Configure input dialog position and behavior:

```toml
[input]
cursor_blink = true

# Each input: cd, create, rename, filter, find, search, shell
# Options: <name>_title, <name>_origin, <name>_offset
cd_title  = "Cd to:"
cd_origin = "top-center"
cd_offset = [0, 2, 50, 3]  # [x, y, width, height]
```

Origins: `top-left`, `top-center`, `top-right`, `bottom-left`, `bottom-center`, `bottom-right`, `center`, `hovered`.

## Other Sections

### confirm

Same positioning as `[input]`. Available: `trash`, `delete`, `overwrite`, `quit`.

### pick

Same positioning as `[input]`. Available: `open` (the "Open with" selector).

### which

Key chord disambiguation menu:

```toml
[which]
sort_by        = "none"    # none|key|desc
sort_sensitive = false
sort_reverse   = false
sort_translit  = false
```

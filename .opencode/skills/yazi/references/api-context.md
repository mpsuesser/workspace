# Plugin API — Context & Runtime

State access via `cx` (sync context only), runtime config via `rt`, theme via `th`.

## Table of Contents

- [cx — App context](#cx)
- [tab::Tab](#tabtab)
- [tab::Folder](#tabfolder)
- [fs::File (context-aware)](#fsfile)
- [fs::Files](#fsfiles)
- [tab::Selected, tab::Mode, tab::Pref, tab::Preview](#tab-helpers)
- [mgr::Tabs, mgr::Yanked](#mgr-helpers)
- [tasks::Tasks](#taskstasks)
- [rt — Runtime config](#rt)
- [th — Theme config](#th)
- [Type aliases](#aliases)

## cx

Available in sync context only. Root of all app state.

| Property | Type | Description |
|----------|------|-------------|
| `cx.active` | `tab::Tab` | The active tab |
| `cx.tabs` | `mgr::Tabs` | All tabs |
| `cx.tasks` | `tasks::Tasks` | Task manager state |
| `cx.yanked` | `mgr::Yanked` | Yanked files |

### Common access patterns

```lua
-- Current directory
local cwd = cx.active.current.cwd

-- Hovered file
local h = cx.active.current.hovered
if h then
  ya.dbg(h.name)        -- filename
  ya.dbg(h.url)         -- full Url
  ya.dbg(h.cha.is_dir)  -- is directory?
  ya.dbg(h.cha.len)     -- size in bytes
  ya.dbg(h.cha.mtime)   -- modified time
end

-- All files in current folder
for i = 1, #cx.active.current.files do
  local f = cx.active.current.files[i]
end

-- Selected files
for _, url in pairs(cx.active.selected) do
  ya.dbg(tostring(url))
end

-- Parent folder
local parent = cx.active.parent
if parent and parent.hovered then
  ya.dbg(parent.hovered.name)
end

-- Number of tabs
local n = #cx.tabs

-- Yanked files
for _, url in pairs(cx.yanked) do
  ya.dbg(tostring(url))
end
local is_cut = cx.yanked.is_cut
```

## tab::Tab

| Property | Type | Description |
|----------|------|-------------|
| `name` | `string` | Tab name |
| `mode` | `tab::Mode` | Visual mode state |
| `pref` | `tab::Pref` | Tab preferences |
| `current` | `tab::Folder` | Current working folder |
| `parent` | `tab::Folder?` | Parent folder (nil if at root) |
| `selected` | `tab::Selected` | Selected files |
| `preview` | `tab::Preview` | Preview state |

## tab::Folder

| Property | Type | Description |
|----------|------|-------------|
| `cwd` | `Url` | Current working directory |
| `offset` | `integer` | Scroll offset |
| `cursor` | `integer` | Cursor position (0-based) |
| `window` | `fs::Files` | Files in visible area |
| `files` | `fs::Files` | All files in folder |
| `hovered` | `fs::File?` | Hovered file (nil if empty) |

## fs::File

Context-aware file (inherits from `File` type — has `url`, `cha`, `link_to`, `name`).

| Property/Method | Type | Description |
|----------------|------|-------------|
| `url` | `Url` | File URL (inherited) |
| `cha` | `Cha` | File characteristics (inherited) |
| `link_to` | `Path?` | Symlink target (inherited) |
| `name` | `string` | Filename (inherited) |
| `is_hovered` | `boolean` | Whether file is hovered |
| `size()` | `-> integer?` | File size (nil for unevaluated dirs) |
| `mime()` | `-> string?` | Mime-type (nil if not yet calculated) |
| `prefix()` | `-> string?` | Prefix relative to CWD (for flat/search view) |
| `icon()` | `-> Icon?` | Matched icon |
| `style()` | `-> Style?` | Matched filetype style |
| `is_yanked()` | `-> boolean` | Whether file is yanked |
| `is_selected()` | `-> boolean` | Whether file is selected |
| `found()` | `-> integer?, integer?` | Find match: (index, total) or nil |

## fs::Files

Indexable collection of `fs::File`.

| Method | Signature |
|--------|-----------|
| `#files` | `-> integer` (length) |
| `files[i]` | `-> fs::File?` (1-based index) |

## Tab Helpers

### tab::Selected

Iterable collection of `Url`s.

```lua
#cx.active.selected          -- count
for _, url in pairs(cx.active.selected) do ... end
```

### tab::Mode

| Property | Type | Description |
|----------|------|-------------|
| `is_select` | `boolean` | In select mode |
| `is_unset` | `boolean` | In unset mode |
| `is_visual` | `boolean` | In any visual mode |

`tostring(mode)` returns the mode name.

### tab::Pref

Current tab preferences (may differ from global config if changed at runtime):

| Property | Type |
|----------|------|
| `sort_by` | `string` (`"none"`, `"mtime"`, `"natural"`, etc.) |
| `sort_sensitive` | `boolean` |
| `sort_reverse` | `boolean` |
| `sort_dir_first` | `boolean` |
| `sort_translit` | `boolean` |
| `linemode` | `string` |
| `show_hidden` | `boolean` |

### tab::Preview

| Property | Type | Description |
|----------|------|-------------|
| `skip` | `integer` | Units skipped in preview |
| `folder` | `tab::Folder?` | Folder being previewed (nil if not folder preview) |

## mgr Helpers

### mgr::Tabs

| Property/Method | Type |
|----------------|------|
| `idx` | `integer` — active tab index |
| `#cx.tabs` | `integer` — tab count |
| `cx.tabs[i]` | `tab::Tab?` — tab by index |

### mgr::Yanked

| Property/Method | Type |
|----------------|------|
| `is_cut` | `boolean` — cut vs copy mode |
| `#cx.yanked` | `integer` — count |
| Iterable with `pairs()` | yields `(integer, Url)` |

## tasks::Tasks

| Property | Type |
|----------|------|
| `progress` | `{ total, succ, fail, found, processed }` — all integers |

## rt

Runtime config. Available in any context.

| Property | Type | Description |
|----------|------|-------------|
| `rt.args` | `table` | CLI arguments (`entries`, `cwd_file`, `chooser_file`) |
| `rt.term` | `table` | Terminal info (`light: boolean`) |
| `rt.mgr` | `table` | User `[mgr]` config |
| `rt.preview` | `table` | User `[preview]` config |
| `rt.plugin` | `table` | User `[plugin]` config |
| `rt.tasks` | `table` | User `[tasks]` config |

## th

Theme/flavor config. Available in any context. Each property is a table mirroring `theme.toml` sections:

`th.mgr`, `th.tabs`, `th.mode`, `th.status`, `th.which`, `th.confirm`, `th.spot`, `th.notify`, `th.pick`, `th.input`, `th.cmp`, `th.tasks`, `th.help`

## Aliases

Type aliases used across the API:

| Alias | Expands to |
|-------|------------|
| `Origin` | `"top-left" \| "top-center" \| "top-right" \| "bottom-left" \| "bottom-center" \| "bottom-right" \| "center" \| "hovered"` |
| `Sendable` | `nil \| boolean \| number \| string \| Url \| { [Sendable]: Sendable }` |
| `Renderable` | `Bar \| Border \| Clear \| Gauge \| Line \| List \| Text` |
| `AsPos` | `Pos \| { [1]: Origin, x?, y?, w?, h? }` |
| `AsSpan` | `string \| Span` |
| `AsLine` | `string \| Span \| Line \| (string\|Span\|Line)[]` |
| `AsText` | `string \| Span \| Line \| (string\|Span\|Line)[]` |
| `AsColor` | Named colors or hex `"#rrggbb"` string |

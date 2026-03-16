# Keymap Reference

Full reference for `keymap.toml`. Defines keybindings across 8 layers: `mgr`, `tasks`, `spot`, `pick`, `input`, `confirm`, `cmp`, `help`.

Default keybindings: https://github.com/sxyazi/yazi/blob/shipped/yazi-config/preset/keymap-default.toml

## Table of Contents

- [Structure](#structure)
- [Key notation](#key-notation)
- [mgr layer — File list actions](#mgr-layer)
- [Other layers](#other-layers)
- [Recipes](#recipes)

## Structure

```toml
[mgr]
# Override defaults (higher priority):
prepend_keymap = [
  { on = "<C-a>", run = "act1", desc = "My action" },
]
# After defaults (lower priority):
append_keymap = [
  { on = ["g", "b"], run = "act2",             desc = "Key chord" },
  { on = "c",        run = ["act1", "act2"],    desc = "Multiple actions" },
]
```

Yazi matches the first binding found: prepend > default > append.

To fully replace defaults: use `keymap = [...]` instead.

## Key notation

| Notation | Description | Notation | Description |
|----------|-------------|----------|-------------|
| `a`-`z`, `A`-`Z` | Letters | `<Space>` | Space |
| `<Enter>` | Enter | `<Esc>` | Escape |
| `<Backspace>` | Backspace | `<Tab>` | Tab |
| `<BackTab>` | Shift+Tab | `<Delete>` | Delete |
| `<Left/Right/Up/Down>` | Arrows | `<Home/End>` | Home/End |
| `<PageUp/PageDown>` | Page keys | `<F1>`-`<F19>` | Function keys |

### Modifiers

| Modifier | Key |
|----------|-----|
| `<C-…>` | Ctrl |
| `<S-…>` | Shift |
| `<A-…>` | Alt/Meta (not available on macOS without terminal config) |
| `<D-…>` | Command/Super (requires CSI u support) |

Examples: `<C-a>` = Ctrl+a, `<C-S-b>` or `<C-B>` = Ctrl+Shift+b.

Note: Legacy terminals treat `<Tab>` and `<C-i>`, `<Enter>` and `<C-m>` as identical. Enable CSI u (kitty keyboard protocol) to distinguish them.

## mgr Layer

### Navigation

| Action | Args | Description |
|--------|------|-------------|
| `arrow` | `[n]` | Move cursor. `n` (int), `"n%"`, `"top"`, `"bot"`, `"prev"`, `"next"` |
| `leave` | — | Go to parent directory |
| `enter` | — | Enter child directory |
| `back` | — | Previous directory in history |
| `forward` | — | Next directory in history |
| `cd` | `[url]`, `--interactive` | Change directory. `--interactive` opens input. |
| `reveal` | `[url]` | Hover over file (changes dir if needed) |
| `follow` | — | Follow symbolic link |
| `seek` | `[n]` | Scroll preview content (negative = up) |
| `spot` | — | Show file info panel |

### Selection

| Action | Args | Description |
|--------|------|-------------|
| `toggle` | `--state=on\|off` | Toggle/set selection of hovered file |
| `toggle_all` | `--state=on\|off` | Toggle/set selection of all files in CWD |
| `visual_mode` | `--unset` | Enter visual mode (selection or unset) |
| `escape` | `--all\|--find\|--visual\|--select\|--filter\|--search` | Cancel operations |

### File Operations

| Action | Args | Description |
|--------|------|-------------|
| `open` | `--interactive`, `--hovered` | Open selected files |
| `yank` | `--cut` | Copy/cut selected files |
| `unyank` | — | Cancel yank |
| `paste` | `--force`, `--follow` | Paste yanked files |
| `link` | `--relative`, `--force` | Symlink yanked files |
| `hardlink` | `--force`, `--follow` | Hardlink yanked files |
| `remove` | `--force`, `--permanently`, `--hovered` | Trash or delete files |
| `create` | `--dir`, `--force` | Create file (trail `/` for dir) |
| `rename` | `--hovered`, `--force`, `--empty=…`, `--cursor=…` | Rename file(s) |
| `copy` | `[what]`, `--separator`, `--hovered` | Copy path to clipboard |

#### `rename` options

| Option | Values | Description |
|--------|--------|-------------|
| `--empty` | `stem`, `ext`, `dot_ext`, `all` | Clear part of filename |
| `--cursor` | `end`, `start`, `before_ext` | Cursor position in rename input |

#### `copy` values

| `[what]` | Description |
|----------|-------------|
| `"path"` | Full file path |
| `"dirname"` | Parent directory path |
| `"filename"` | File name |
| `"name_without_ext"` | File name without extension |

### Shell

```
shell [template] --block --orphan --interactive --cursor=[n]
```

Template params: `%h` (hovered), `%s` (all selected), `%sN` (Nth selected), `%d` (dirnames), `%%` (literal %).

Use end-of-options `--` to avoid escaping:

```toml
{ on = "d", run = "shell -- trash-put %s", desc = "Trash" }
```

### Search, Find, Filter

| Action | Args | Description |
|--------|------|-------------|
| `search` | `--via=fd\|rg\|rga`, `--args='...'` | Search files |
| `find` | `--previous`, `--smart`, `--insensitive` | Incremental find |
| `find_arrow` | `--previous` | Next/previous find match |
| `filter` | `--smart`, `--insensitive` | Filter file list |
| `sort` | `[by]`, `--reverse`, `--dir-first`, `--translit` | Change sort method |

### Display

| Action | Args | Description |
|--------|------|-------------|
| `hidden` | `"show"\|"hide"\|"toggle"` | Hidden files visibility |
| `linemode` | `"none"\|"size"\|...` | Set line mode |

### Tabs

| Action | Args | Description |
|--------|------|-------------|
| `tab_create` | `[url]`, `--current` | Create new tab |
| `tab_close` | `[n]` | Close tab at position n |
| `tab_switch` | `[n]`, `--relative` | Switch to tab n |
| `tab_swap` | `[n]` | Swap current tab with position n |

### Other

| Action | Description |
|--------|-------------|
| `quit` | Exit (`--code=[n]`, `--no-cwd-file`) |
| `close` | Close tab or exit if last |
| `suspend` | Pause Yazi (resume with shell `fg`) |
| `help` | Open help menu |
| `plugin` | Run a functional plugin |
| `noop` | Disable a key (no action, hides from which menu) |

## Other Layers

### tasks

`show`, `close`, `arrow`, `inspect` (view task log), `cancel`, `help`, `plugin`, `noop`

### spot

`close`, `arrow`, `swipe [n]` (navigate files while in spot), `copy "cell"`, `plugin`, `noop`, `help`

### pick

`close` (`--submit`), `arrow`, `help`, `plugin`, `noop`

### input

Vim-like editing: `close` (`--submit`), `escape`, `move [n]`, `backward`, `forward` (`--end-of-word`), `insert` (`--append`), `visual`, `delete` (`--cut`, `--insert`), `yank`, `paste` (`--before`), `undo`, `redo`, `backspace` (`--under`), `kill` (`"bol"\|"eol"\|"backward"\|"forward"`)

### confirm

`close` (`--submit`), `arrow`

### cmp

`close` (`--submit`), `arrow`

### help

`close`, `escape`, `arrow`, `filter`

## Recipes

### Bookmarks with g-keys

```toml
[[mgr.prepend_keymap]]
on   = ["g", "d"]
run  = "cd ~/Downloads"
desc = "Go to Downloads"

[[mgr.prepend_keymap]]
on   = ["g", "p"]
run  = "cd ~/Pictures"
desc = "Go to Pictures"

[[mgr.prepend_keymap]]
on   = ["g", "r"]
run  = 'shell -- ya emit cd "$(git rev-parse --show-toplevel)"'
desc = "Git root"
```

### Drop to shell

```toml
[[mgr.prepend_keymap]]
on   = "!"
for  = "unix"
run  = 'shell "$SHELL" --block'
desc = "Open shell here"
```

### Flat view (recursive listing)

```toml
[[mgr.prepend_keymap]]
on   = ["g", "f"]
run  = 'search_do --via=fd --args="-d 3"'
desc = "Flat view (depth 3)"
```

### Copy selected to system clipboard while yanking

```toml
# X11
[[mgr.prepend_keymap]]
on  = "y"
run = ["shell -- echo %s | xclip -i -selection clipboard -t text/uri-list", "yank"]

# Wayland
[[mgr.prepend_keymap]]
on  = "y"
run = ['shell -- for path in %s; do echo "file://$path"; done | wl-copy -t text/uri-list', "yank"]
```

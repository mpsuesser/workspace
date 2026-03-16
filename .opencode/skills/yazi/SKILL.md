---
name: yazi
description: Configure and extend Yazi terminal file manager. Covers yazi.toml/keymap.toml/theme.toml, keybindings, openers, previewers, Lua plugins (sync/async), init.lua, ya CLI (package manager, DDS), shell wrapper, and flavors. Use when writing yazi config, creating plugins, or customizing keybindings.
---

# Yazi

Blazing-fast terminal file manager written in Rust with async I/O. Three-pane Miller columns layout with built-in image preview, Lua plugin system, and cross-instance communication (DDS).

## Mental Model

```
~/.config/yazi/
├── yazi.toml        # General config: layout, sorting, openers, preview, plugin rules
├── keymap.toml      # Keybindings per layer (mgr, tasks, input, etc.)
├── theme.toml       # Colors, icons, status bar styling
├── vfs.toml         # Virtual filesystem config (mounts)
├── init.lua         # Lua entry point: UI customization, plugin setup
├── package.toml     # Plugin/flavor lock file (managed by `ya pkg`)
└── plugins/
    └── foo.yazi/
        └── main.lua # Plugin entry point

Two binaries:
  yazi  — the file manager TUI
  ya    — CLI companion (package manager + DDS message bus)
```

## Task Router

```
What are you doing?

Customizing appearance or behavior
├─ Change sorting, hidden files, layout ratio  → yazi.toml [mgr]
├─ Change preview settings                     → yazi.toml [preview]
├─ Add/change file openers                     → yazi.toml [opener] + [open]
├─ Add custom previewer/preloader              → yazi.toml [plugin] + Lua plugin
├─ Change colors or icons                      → theme.toml or use a flavor
└─ Customize status bar, header, linemode      → init.lua

Changing keybindings
├─ Override a default key     → keymap.toml prepend_keymap (higher priority)
├─ Add new key after defaults → keymap.toml append_keymap
├─ Disable a default key      → prepend_keymap with run = "noop"
└─ Full custom keymap          → keymap.toml keymap = [...]
                                 See references/keymap.md

Writing a plugin
├─ Simple one-off action        → Functional plugin (bind to key)
├─ Custom file previewer        → Implement peek + seek methods
├─ Custom file preloader        → Implement preload method
├─ UI customization (init.lua)  → Sync context, runs at startup
├─ Async work (I/O, network)   → Default async context
└─ Cross-context data           → ya.sync() blocks
                                  See references/plugins.md

Managing plugins & flavors
├─ Install plugin    → ya pkg add owner/plugin-name
├─ Install from mono → ya pkg add owner/repo:subdir
├─ Upgrade all       → ya pkg upgrade
├─ Pin version       → prefix rev with = in package.toml
└─ List installed    → ya pkg list

Inter-instance communication (DDS)
├─ Send event to current instance  → ya pub <kind> --str/--list/--json
├─ Send event to specific instance → ya pub-to <id> <kind> ...
├─ Execute action on instance      → ya emit <action> <args>
├─ Subscribe in Lua                → ps.sub("kind", callback)
└─ Real-time stdout reporting      → yazi --local-events=cd,hover

Shell integration
├─ Change CWD on exit → Use the `y` shell wrapper function
├─ File chooser       → yazi --chooser-file=/dev/stdout
└─ Custom client ID   → yazi --client-id <id>
```

## Quick Reference

### Shell Wrapper (essential)

```bash
# Bash/Zsh — add to .bashrc/.zshrc
function y() {
  local tmp="$(mktemp -t "yazi-cwd.XXXXXX")" cwd
  command yazi "$@" --cwd-file="$tmp"
  IFS= read -r -d '' cwd < "$tmp"
  [ "$cwd" != "$PWD" ] && [ -d "$cwd" ] && builtin cd -- "$cwd"
  rm -f -- "$tmp"
}
```

Use `y` instead of `yazi`. Press `q` to quit and cd, `Q` to quit without cd.

### Default Keybindings (most important)

| Key | Action | Key | Action |
|-----|--------|-----|--------|
| `h/l` | Parent / Enter dir | `j/k` | Down / Up |
| `Enter` | Open file | `o/O` | Open / Open interactive |
| `Space` | Toggle select | `v` | Visual mode |
| `y` | Yank (copy) | `x` | Yank (cut) |
| `p/P` | Paste / Paste overwrite | `d/D` | Trash / Delete |
| `a` | Create file/dir | `r` | Rename |
| `f` | Filter | `/` | Find |
| `s/S` | Search (fd/rg) | `z/Z` | cd via fzf/zoxide |
| `;/:` | Shell / Shell (block) | `.` | Toggle hidden |
| `t` | New tab | `1-9` | Switch tab |
| `Tab` | Spot (file info) | `F1/~` | Help |
| `q` | Quit (write cwd) | `Q` | Quit (no cwd) |

### Configuration Mixing

Don't rewrite defaults — extend them:

```toml
# keymap.toml — prepend has higher priority than defaults
[mgr]
prepend_keymap = [
  { on = "<C-a>", run = "shell --block -- vim %h", desc = "Edit in vim" },
]
append_keymap = [
  { on = [ "g", "d" ], run = "cd ~/Downloads", desc = "Go to Downloads" },
]

# yazi.toml — same pattern for openers, open rules, previewers, preloaders
[open]
prepend_rules = [
  { url = "*.json", use = "edit" },
]
```

### Custom Opener

```toml
# yazi.toml
[opener]
play = [
  { run = "mpv %s", orphan = true, for = "unix" },
]
edit = [
  { run = "$EDITOR %s", block = true, for = "unix" },
]

[open]
prepend_rules = [
  { mime = "video/*", use = "play" },
]
```

Opener params: `%s` (all selected paths), `%h` (hovered path), `%sN` (Nth path), `%d` (dirnames).
Flags: `block` (interactive, takes over screen), `orphan` (detached process), `for` (os filter).

### init.lua Patterns

```lua
-- ~/.config/yazi/init.lua

-- Setup a plugin with options
require("my-plugin"):setup {
  key1 = "value1",
}

-- Custom linemode
function Linemode:my_mode()
  local size = self._file:size()
  return ya.readable_size(size or 0)
end

-- Add to status bar
Status:children_add(function(self)
  local h = self._current.hovered
  if h and h.link_to then
    return " -> " .. tostring(h.link_to)
  end
  return ""
end, 3300, Status.LEFT)

-- Add to header
Header:children_add(function()
  return ui.Span(ya.user_name() .. "@" .. ya.host_name() .. ":"):fg("blue")
end, 500, Header.LEFT)
```

## Gotchas

1. **Config files are TOML** — use the correct quoting and escaping. For shell commands with special chars, use `'''` multi-line strings or end-of-options `--` marker.
2. **prepend vs append**: `prepend_keymap` runs BEFORE defaults (overrides them), `append_keymap` runs AFTER (lower priority). Same for `prepend_rules`/`append_rules`.
3. **`file(1)` required**: Yazi needs the `file` command for mime-type detection. On Windows, use Git's bundled `file.exe` via `YAZI_FILE_ONE` env var.
4. **`ya` and `yazi` versions must match**: Always keep them in sync.
5. **Plugin directory naming**: Must be kebab-case ending in `.yazi/`, containing `main.lua`.
6. **Sync vs Async plugins**: UI access requires sync context. I/O work should be async. Use `ya.sync()` blocks to bridge.
7. **Ownership transfer**: Passing `Url` userdata to cross-thread functions transfers ownership. Clone with `Url(target)` if you need to reuse it.
8. **Debugging**: Set `YAZI_LOG=debug` before starting, logs go to `~/.local/state/yazi/yazi.log`. Use `ya.dbg()` in plugins.
9. **nerd-fonts**: Icons require a Nerd Font. If you don't want them, clear icon tables in `theme.toml`.
10. **Image preview in tmux**: Requires passthrough enabled (`set -g allow-passthrough on`).

## In This Skill

| Reference | When to Load |
|-----------|--------------|
| [configuration.md](./references/configuration.md) | Full yazi.toml reference: mgr, preview, opener, open, tasks, plugin sections |
| [keymap.md](./references/keymap.md) | All keymap actions with arguments, key notation, layer structure |
| [plugins.md](./references/plugins.md) | Plugin system concepts: sync/async, DDS, previewer/preloader patterns, recipes |
| [api-types.md](./references/api-types.md) | Plugin API types: Url, Path, Cha, File, Error, Window |
| [api-utils.md](./references/api-utils.md) | Plugin API utils: ya.*, fs.*, Command, Child, Output, Status |
| [api-ui.md](./references/api-ui.md) | Plugin API UI: Rect, Style, Span, Line, Text, Layout, Constraint, ui.*, ps.* |
| [api-context.md](./references/api-context.md) | Plugin API context: cx.* state access, rt.* runtime, th.* theme, type aliases |

# Desktop switcher

Tap **F8** (or remapped Caps Lock), then press:

| Key      | App                  |
| -------- | -------------------- |
| Backtick | Ghostty              |
| Space    | T3 Code              |
| A        | Curation Space Admin |
| D        | Google Chrome        |
| L        | Linear               |
| Q        | Rex Beta             |

F8 reveals the real desktop on the active display and draws six fixed radial
targets with native app icons. Click an icon or press its key. **Escape** or **F8**
returns to the previous workspace/window. Other keys are swallowed until the menu
closes. Fast selections work even before the menu finishes opening.

Keycaps sit on the inner ring, with each app icon farther out along the same ray.
There are no app names or center text; Space is shown as `␣`. Clicks outside the
icons/keycaps pass through to the desktop or system dialogs and cancel the menu.

Hammerspoon starts AeroSpace in the background if needed. Apps keep their existing
window positions and workspaces. If the selected app has no managed window, the
previous workspace is restored before opening it. Switching to an app on another
monitor also restores the source display first.

Bindings and radial positions live in `app-switcher.lua`. AeroSpace only supplies
floating-window workspaces; it has no competing keyboard shortcuts. F9 remains
reserved for Hex. Ghostty's old global F8 binding is explicitly unbound.

Keep AeroSpace's `launcher` workspace empty. The switcher refuses to hide an
existing window there. A display/Space change cancels the menu. Reloading
Hammerspoon restores the previous workspace; recovery state also survives a crash.

macOS native fullscreen uses a separate Space and must be exited first. Maximized
windows and AeroSpace fullscreen do not have this restriction. Secure Input can
prevent Hammerspoon from receiving keys while a password field is active.

Reload Hammerspoon after editing Lua. Reload Ghostty's configuration after changing
its bindings; do not restart the terminal or its sessions.

Run the state-machine tests from this directory with `bun run test` (requires
LuaJIT), or directly with `luajit tests/app-switcher-test.lua`.

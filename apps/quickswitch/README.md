# QuickSwitch

A native AppKit menu-bar app with a SwiftUI radial palette over your windows,
with an optional preloaded wallpaper backdrop (on by default).
Requires macOS 15+, Swift 6, and AeroSpace (tested with 0.20.3-Beta).

Tap **F8** (or remapped Caps Lock), then:

| Key | App                  |
| --- | -------------------- |
| Q   | Ghostty              |
| S   | T3 Code              |
| A   | Curation Space Admin |
| D   | Google Chrome        |
| W   | Linear               |
| E   | Rex Beta             |

**Escape** or **F8** dismisses the overlay without changing focus or workspaces. Targets follow the
keyboard order: **Q W E** above **A S D**, evenly spaced at 60° intervals.
The tight radial has compact cut-corner keycaps inside, transparent marks
just outside, linked by faint signal traces. Acid-green legends and edge lighting
contrast with the dark key faces. There are no app labels or center text.
Clicking an icon or keycap selects it. Other clicks pass through and
cancel after mouse-up, without reactivating the source app over a system dialog.

## Install

```sh
bun run install:app
open ~/Applications/QuickSwitch.app
```

Enable **QuickSwitch** under **System Settings → Privacy & Security →
Accessibility**. The menu has an **Enable Accessibility…** shortcut. Authorization
is detected automatically; no restart is normally required. QuickSwitch never
requests Screen Recording. Enable **Launch at Login** from its menu if desired.

The installer uses a stable ad-hoc signing requirement and bundle identifier
`local.quickswitch`. Set `QUICKSWITCH_SIGN_IDENTITY` to use your own certificate.
Set `QUICKSWITCH_INSTALL_DIR` to change the installation folder. Quit the app before
reinstalling. If macOS rejects an existing authorization after a rebuild, remove
QuickSwitch from Accessibility and add the installed app again.

## Instant overlay

F8 shows a nonactivating, animation-free panel without Accessibility queries,
subprocesses, wallpaper file reads, minimization, or workspace changes. Your windows
remain underneath it. Escape simply removes the panel; there is nothing to restore.

The **Wallpaper Backdrop** menu toggle switches between your wallpaper and a
transparent overlay. Wallpaper files are decoded into display-sized bitmaps at
startup and after display changes, never on F8. Choose **Reload Wallpaper** after
changing your wallpaper. Static wallpapers use an aspect-fill crop; dynamic/live
wallpapers show the image available from macOS, not their live animation. The
backdrop is not the real desktop: empty-space clicks still pass to the underlying
app and dismiss the picker. No screenshot or Screen Recording access is needed.

AeroSpace is consulted only after you choose an app, to locate its existing
workspace. Existing windows are focused without moving them. App/window activation
uses native Accessibility, not AeroSpace's `focus` command (which can assert on
floating windows in 0.20.3-Beta). If workspace lookup fails, native app activation
is still attempted. CLI waits remain bounded.

**Recover Desktop** handles a leftover recovery record from older versions only.
New picker sessions never use `launcher` or create a desktop recovery record.

Errors appear in the menu bar only, never in a popup or focus-stealing window.
Open the warning icon to read or dismiss an error. QuickSwitch never restarts
AeroSpace automatically: restarting AeroSpace while `launcher` is focused can
assign existing windows to that workspace. Move those windows back to your normal
workspaces before trying again; recovery does not silently relocate windows.

Hammerspoon is not involved. Ghostty must leave global F8 unbound. F9 remains
reserved for Hex. No Screen Recording, wallpaper capture, or desktop screenshot
is used.

## Transparent logos

All six apps ship with standalone transparent artwork by default—not dock icons
or dock-icon cutouts. Ghostty, T3, Linear, Chrome, Curation Space's ensō, and Rex's
mascot are bundled with the app. Sources are recorded in `Resources/IconSources.md`.
QuickSwitch adds no icon mask, background, or border.

Use **Open Icon Overrides**, then place transparent PNG, PDF, or SVG assets in
`~/Library/Application Support/QuickSwitch/Icons/`:

```text
ghostty.png
t3-code.png
curation-space-admin.png
chrome.png
linear.png
rex.png
```

Use those same stems for PDF/SVG. PNG takes precedence. Open the menu item again
after adding files, or restart, to reload. Overrides replace the bundled marks;
the app does not destructively strip backgrounds from icons.

## Development

```sh
swift build
swift test
swift run QuickSwitch --render-preview /path/to/preview.png
```

`QuickSwitchCore` holds bindings, radial geometry, snapshot decoding, and selection
state. The executable owns the AppKit lifecycle, nonactivating transparent panel,
main-run-loop input tap, Accessibility onboarding, and bounded AeroSpace adapter.
The Swift tests cover core logic; live global input requires Accessibility access
for the installed app.

Preview rendering captures only QuickSwitch's own SwiftUI view on a synthetic
dark background; it never captures the desktop or requests Screen Recording.

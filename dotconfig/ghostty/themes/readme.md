Below is a **practical, end‑to‑end primer** for authoring Ghostty/iTerm‑style terminal themes.

It will...

  1. decode what each palette entry actually affects
  2. show how Ghostty consumes themes
  3. give high‑leverage design and workflow guidance so you can pick good colors fast and ship themes immediately

---

## 1) Mental model: three color systems your theme must coexist with

**A. The core 16 (ANSI) colors — palette indices 0–15**

These are the terminal’s canonical colors. Apps select them with SGR codes:

* **Foreground 30–37 / Background 40–47** → indices **0–7**
* **Bright Foreground 90–97 / Bright Background 100–107** → indices **8–15** ([Wikipedia][1])

In iTerm‑style presets these appear as **“ANSI 0 … ANSI 15”** (e.g., *Ansi 4 Color*). That’s why iTerm2 presets (and Ghostty’s imported sets) revolve around exactly sixteen swatches. ([iTerm2][2])

**B. The extended 256‑color table — palette indices 0–255**

* 0–15: same ANSI colors as above
* **16–231**: a 6×6×6 RGB cube (216 colors)
* **232–255**: a 24‑step grayscale ramp
  Apps address these with **`ESC[38;5;N m`** (fg) and **`ESC[48;5;N m`** (bg). The exact RGB mapping is conventional but widely followed. ([Wikipedia][1])

**C. Truecolor (24‑bit) — not palette‑based**

Apps can bypass your palette entirely using **`ESC[38;2;R;G;B m`** / **`48;2;R;G;B m`**. Your theme still matters (background, cursor, selection, and how non‑Truecolor tools look), but Truecolor apps (e.g., modern editors) will render their own hex colors. ([Wikipedia][1])

---

## 2) Ghostty theme anatomy (what each key controls)

Ghostty theme files are regular config files that typically set only color options and are **loaded first**, so your main config can override them. Place named themes at `$XDG_CONFIG_HOME/ghostty/themes/<name>` to reference by `theme = <name>`. You can also set **separate light/dark themes**, and Ghostty will auto‑switch with system appearance. ([Ghostty][3])

Essential keys you’ll set:

* `background` — window background color
* `foreground` — default text color
* `cursor-color`, `cursor-text` — cursor block and the text under it
* `selection-background`, `selection-foreground` — explicit selection colors

  * If you omit these, Ghostty inverts fg/bg by default (`selection-invert-fg-bg` toggles). ([Ghostty][4])
* `palette` — **the 256‑color table**, syntax `palette = N=#RRGGBB` where **N is 0–255**. Hex, X11 names, and even binary/octal/hex indices are accepted. Ghostty links a canonical index cheat‑sheet. ([Ghostty][4])

Other high‑value switches while theming:

* `bold-is-bright = true|false` — whether **bold text maps to bright (8–15)** instead of just weight. Defaults vary; set it explicitly so your theme is deterministic. ([Ghostty][4])
* `minimum-contrast = <1..21>` — auto‑nudges text toward black/white to maintain WCAG contrast; **3+ improves legibility** without turning everything monochrome. ([Ghostty][4])
* `window-colorspace = srgb|display-p3` — on macOS, you can opt into **Display‑P3** for wider gamut; useful for saturated accents. ([Ghostty][4])

---

## 3) What each palette index “means” in practice

**ANSI 0–15** are the ones users and tools *name* (“red”, “bright blue”, etc.). Typical mapping and common usage patterns:

| Index | SGR fg/bg       | Conventional name   | Frequent usage in CLIs                                                |
| ----: | --------------- | ------------------- | --------------------------------------------------------------------- |
|     0 | 30 / 40         | black               | “dim” separators, faint UI chrome                                     |
|     1 | 31 / 41         | red                 | errors, deletions, failing tests                                      |
|     2 | 32 / 42         | green               | success, additions, passing tests                                     |
|     3 | 33 / 43         | yellow              | warnings, pending, attention                                          |
|     4 | 34 / 44         | blue                | titles, links, directory names                                        |
|     5 | 35 / 45         | magenta             | highlights, headings, prompts                                         |
|     6 | 36 / 46         | cyan                | secondary info, hints                                                 |
|     7 | 37 / 47         | white               | default‑ish “light” neutral                                           |
|  8–15 | 90–97 / 100–107 | **bright** variants | emphasized versions of the above (or used when `bold-is-bright=true`) |

This table reflects the **SGR to index mapping**, which is standardized; the specific *semantics* (e.g., “yellow = warning”) are conventions many tools follow, but apps ultimately choose their colors. ([Wikipedia][1])

**Indices 16–231 (color cube)** and **232–255 (gray ramp)** are used when tools say “color 178” or similar. Unless you restyle them, terminals use the conventional xterm cube and ramp; Ghostty lets you override any of them with `palette = N=...`. ([Ghostty][4])

**In iTerm presets**, those 16 ANSI slots appear as *Ansi 0 Color* … *Ansi 15 Color* inside `.itermcolors`. That’s why converting an iTerm preset to Ghostty boils down to copying those 16 values into `palette = 0..15` and mapping its background/foreground/cursor/selection keys to Ghostty’s keys. ([iTerm2][2])

---

## 4) Authoring workflow that gets you to a good theme quickly

### A. Start from a known baseline

* Use Ghostty’s built‑ins (sourced weekly from **iTerm2‑Color‑Schemes**) and tweak:
  `ghostty +list-themes` → set `theme = <name>` to preview, then create a file next to your config to override specifics. The scheme collection also includes a **`ghostty/`** directory you can copy straight into your config as a starting point. ([Ghostty][3], [GitHub][5])

* Alternatively, **design in a GUI**: *terminal.sexy* lets you craft a 16‑color palette and export to iTerm2/Xresources (easy to translate to Ghostty `palette=...`). ([terminal.sexy][6])

### B. Fill the essentials first (order that pays off)

1. **Background / Foreground**

   * Pick background first. For dark themes, aim \~`#111`–`#242` equivalent; for light, high‑value neutral.
   * Choose foreground at **WCAG ≥ 7:1** if you want “crisp” default text, or set Ghostty `minimum-contrast = 3–4` to guard readability against app‑chosen colors. ([Ghostty][4])

2. **Neutrals in ANSI**

   * **0 (black)** and **8 (bright black)**: establish your “dim” vs “subtle text” levels — bright‑black often becomes your “comments/less prominent” color.
   * **7 (white)** and **15 (bright white)**: define your high end; keep 15 sufficiently brighter than 7 to leave room for emphasize.
     Keep these four neutrals visually **evenly spaced** from bg→fg; they drive most UI contrast.

3. **Primary accents (1–6)**

   * Pick **six hues** that (a) fit your aesthetic, (b) remain legible on your background, and (c) align with common semantics (e.g., green readable for success, yellow legible for warnings).
   * Ensure **blue (4/12)** is light enough to read on your background; many “beautiful” blues are too dark on black backgrounds.
   * Make **yellow (3/11)** a warm gold/amber rather than neon for better text legibility.

4. **Bright variants (8–15)**

   * Reuse the same hues as 1–7 and **increase lightness/chroma** rather than changing hue; that keeps “bright” meaning “emphasis,” not “different thing.”
   * If you set `bold-is-bright = true`, apps using bold will map to these — test both bold and non‑bold in your preview. ([Ghostty][4])

5. **Cursor & selection**

   * For a block cursor against varied content, either set a high‑contrast `cursor-color`/`cursor-text` pair or let Ghostty invert with `cursor-invert-fg-bg`.
   * For selections, prefer explicit `selection-background`/`selection-foreground`. If you skip them, Ghostty inverts by default (good for quick iteration).

6. **(Optional) Extended table 16–255**

   * If you tweak these, keep the **grayscale ramp (232–255)** perceptually even and maintain smooth steps in the **6×6×6 cube**. Otherwise, the conventional xterm palette is acceptable. ([Wikipedia][1])

### C. Rapid preview loop

Add a trivial swatch script to hit everything an app might use:

```sh
# 16-color demo (normal + bright)
for i in {0..15}; do printf "\e[48;5;%sm  %3s  \e[0m" "$i" "$i"; done; echo
for i in {0..15}; do printf "\e[38;5;%sm%3s \e[0m" "$i" "$i"; done; echo

# 256-color grid
for i in {0..255}; do printf "\e[48;5;%sm %3s \e[0m" "$i" "$i"; (( (i+1)%16 )) || echo; done
```

Also test bold (`\e[1m`), faint (`\e[2m`), underline (`\e[4m`), inverse (`\e[7m`), and **Truecolor** snippets (e.g., `\e[38;2;R;G;Bm`) to see how your background plays with app‑picked 24‑bit colors. ([Wikipedia][1])

---

## 5) A concise mapping cheat‑sheet (ANSI 0–15)

This is the mapping Ghostty/iTerm2 expect; use it while you pick swatches:

```
# normal        # bright
0  black        8  bright black
1  red          9  bright red
2  green        10 bright green
3  yellow       11 bright yellow
4  blue         12 bright blue
5  magenta      13 bright magenta
6  cyan         14 bright cyan
7  white        15 bright white
```

* SGR fg: `30–37` (normal), `90–97` (bright); SGR bg: `40–47`, `100–107`.
* Extended/Truecolor: `38;5;n` / `48;5;n` and `38;2;r;g;b` / `48;2:r;g;b`. ([Wikipedia][1])

For a canonical reference of indices—including the conventional 256‑color cube and grayscale—keep this page handy. ([Ditig][7])

---

## 6) A minimal, clean **Ghostty theme template** you can drop in

Save as `~/.config/ghostty/themes/mytheme` and activate with `theme = mytheme`:

```toml
# --- Core window colors
background = #121417
foreground = #E6E9EF

# --- Selection & cursor
selection-background = #2A2E36
selection-foreground = #E6E9EF
cursor-color         = #E6E9EF
cursor-text          = #121417

# --- ANSI 0–15 (keep hues aligned; bright = lighter/higher chroma)
palette = 0=#1A1D23   # black
palette = 1=#E05A5A   # red
palette = 2=#65C18C   # green
palette = 3=#E6C56E   # yellow
palette = 4=#6AA9FF   # blue
palette = 5=#C495E5   # magenta
palette = 6=#61C7D8   # cyan
palette = 7=#C6CCD7   # white

palette = 8=#3A3F4A   # bright black (dim text)
palette = 9=#FF7A7A   # bright red
palette = 10=#79D8A1  # bright green
palette = 11=#FFD77A  # bright yellow
palette = 12=#8CBDFF  # bright blue
palette = 13=#D7A9F2  # bright magenta
palette = 14=#7ADEEE  # bright cyan
palette = 15=#F2F5FA  # bright white

# Optional safeguards
bold-is-bright   = true
minimum-contrast = 3.2
# macOS wide-gamut option (comment out on Linux)
window-colorspace = display-p3
```

(Adjust hues to taste; the structure and options are what matter.) Keys and behaviors referenced above: ([Ghostty][4])

---

## 7) Converting or borrowing from iTerm2 schemes

* Ghostty ships **hundreds of built‑ins** updated from the iTerm2 Color Schemes project. Test them quickly with `ghostty +list-themes`, then base your file on the closest match and tweak. ([Ghostty][3])
* If you download schemes from **iTerm2‑Color‑Schemes**, there’s a `ghostty/` folder in the repo—copy a file’s contents into your Ghostty config or theme file as a starting point. ([GitHub][5])
* To design in a browser then export, use **terminal.sexy** and transpose the 16 ANSI swatches to `palette = 0..15` plus Ghostty’s `background`/`foreground`/cursor/selection keys. ([terminal.sexy][6])

---

## 8) High‑leverage design heuristics (so your theme “just works”)

1. **Neutral ramp first.** Make `0/8/7/15` an evenly spaced progression from bg to fg. Most UI chrome and “dim” text uses these.
2. **Blue legibility audit.** On dark backgrounds, lighten **blue (4/12)** more than you think; default ANSI blues are notoriously low‑contrast.
3. **Yellow as amber.** Move **yellow (3/11)** toward orange/amber for readable text instead of high‑luminance but low‑contrast neon.
4. **Keep hues stable; vary lightness.** Bright variants should be same hue family with Δlightness/chroma, not a different hue.
5. **Plan for `bold-is-bright`.** If you enable it, bright slots are your emphasis tiers; if not, ensure bold weight alone is visible against your bg. ([Ghostty][4])
6. **Protect legibility globally.** Set `minimum-contrast` to **≥3** while developing to catch bad spots; you can lower later if you want more precise color. ([Ghostty][4])
7. **Cursor & selection clarity.** Prefer explicit selection colors that keep text readable; for cursors, either invert (`cursor-invert-fg-bg`) or pick a high‑contrast solid.
8. **Wider gamut on macOS.** If your display is P3‑capable, `window-colorspace = display-p3` yields richer accents without clipping. ([Ghostty][4])
9. **Remember Truecolor apps.** Your palette won’t affect editor colors using 24‑bit SGR; judge background/selection/cursor with those in mind. ([Wikipedia][1])
10. **Don’t neglect the 256 grayscale (232–255)** if you override it; keep perceptual steps even so tints/shading in tools look smooth. ([Wikipedia][1])

---

## 9) Quick reference: Ghostty options you’ll actually touch

* Theme lifecycle & locations; light/dark auto‑switch; built‑ins; example file. ([Ghostty][3])
* `background`, `foreground`, `selection-foreground`, `selection-background`, `selection-invert-fg-bg`. ([Ghostty][4])
* `palette = N=#RRGGBB` (N=0..255), accepts X11 names, multiple number bases; canonical index cheat‑sheet linked. ([Ghostty][4])
* `cursor-color`, `cursor-text`, `cursor-invert-fg-bg`.
* `bold-is-bright`, `minimum-contrast`, `window-colorspace`. ([Ghostty][4])

---

## 10) If you want a ready‑made “good defaults” light variant to adapt

```toml
background = #F7F9FC
foreground = #0F1115
selection-background = #DDE3EE
selection-foreground = #0F1115
cursor-color = #0F1115
cursor-text  = #F7F9FC

palette = 0=#2A2E36  # black
palette = 1=#C5403E  # red
palette = 2=#2C8F5C  # green
palette = 3=#B07D12  # yellow
palette = 4=#2466C6  # blue
palette = 5=#7D3FB2  # magenta
palette = 6=#1F8A99  # cyan
palette = 7=#5A6270  # white

palette = 8=#A0A7B3  # bright black (muted text)
palette = 9=#E25E5B  # bright red
palette = 10=#39B274 # bright green
palette = 11=#DBA53C # bright yellow
palette = 12=#3B82F6 # bright blue
palette = 13=#A06AD8 # bright magenta
palette = 14=#42C5D6 # bright cyan
palette = 15=#0F1115 # bright white (for reverse video usage)

bold-is-bright   = true
minimum-contrast = 3.0
```

---

## 11) Resources you’ll actually use

* **Ghostty Color Theme docs** (theme files, light/dark switching, built‑ins, example): start here. ([Ghostty][3])
* **Ghostty option reference** (palette 0–255, selection/cursor behaviors, minimum‑contrast, bold‑is‑bright, Display‑P3): essential while iterating. ([Ghostty][4])
* **ANSI/256/Truecolor SGR reference** (exact escape codes and index layout). ([Wikipedia][1])
* **Canonical 256‑color index cheat‑sheet** (numbers → colors). Keep it open when tuning extended indices. ([Ditig][7])
* **iTerm2‑Color‑Schemes repo** (includes a `ghostty/` folder to copy from). ([GitHub][5])
* **terminal.sexy** (GUI editor/exporter for 16‑color palettes). ([terminal.sexy][6])

---

### TL;DR workflow

1. Pick bg/fg, set `minimum-contrast >= 3`. ([Ghostty][4])
2. Build **0/8/7/15** neutrals → even contrast steps.
3. Fill **1–6** hues; ensure **blue** and **yellow** remain legible on your bg.
4. Derive **8–15** by brightening same hues; set `bold-is-bright = true` if desired. ([Ghostty][4])
5. Set selection/cursor explicitly.
6. Preview with the swatch script + a few real tools; tweak.
7. (Optional) Tune 16–255; otherwise rely on conventional mapping. ([Wikipedia][1])

You should be able to author new, readable themes in minutes with this structure.

[1]: https://en.wikipedia.org/wiki/ANSI_escape_code?utm_source=chatgpt.com "ANSI escape code"
[2]: https://iterm2.com/python-api/profile.html?utm_source=chatgpt.com "Profile — iTerm2 Python API 0.26 documentation"
[3]: https://ghostty.org/docs/features/theme "Color Theme - Features"
[4]: https://ghostty.org/docs/config/reference "Option Reference - Configuration"
[5]: https://github.com/mbadolato/iTerm2-Color-Schemes "GitHub - mbadolato/iTerm2-Color-Schemes: Over 400 terminal color schemes/themes for iTerm/iTerm2. Includes ports to Terminal, Konsole, PuTTY, Xresources, XRDB, Remmina, Termite, XFCE, Tilda, FreeBSD VT, Terminator, Kitty, MobaXterm, LXTerminal, Microsoft's Windows Terminal, Visual Studio, Alacritty, Ghostty, and many more"
[6]: https://terminal.sexy/?utm_source=chatgpt.com "terminal.sexy - Terminal Color Scheme Designer"
[7]: https://www.ditig.com/256-colors-cheat-sheet?utm_source=chatgpt.com "256 Colors - Cheat Sheet - Xterm, HEX, RGB, HSL - Ditig"

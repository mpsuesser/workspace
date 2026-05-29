---
name: poster-from-tsx
description: Turn a description into a beautiful rendered image (PNG/JPG/WebP/PDF/SVG) by authoring a single self-contained React/TSX component and rendering it with the `poster-ai` CLI. Use whenever the user says "create/make a poster", "make a poster as png that …", or asks for a chart, dashboard, report card, OG/social-share image, year-in-review, magazine/editorial layout, event poster, cover, certificate, menu, ticket, infographic — any static visual deliverable that should land as one image or document file. Not for interactive UIs.
---

# poster-from-tsx

You write a single `.tsx` file that default-exports a React component; the
`poster-ai` CLI renders it to an image. The root element's Tailwind size **is**
the canvas. Think like a graphic designer composing a fixed-size poster, not a
web developer building a responsive page.

**The bar:** it has to look amazing as a thumbnail in a feed. Confident type
hierarchy, one coherent accent family, realistic content (never `foo`/`bar`),
deliberate use of the whole canvas. A render that merely "works" but looks like
a webpage screenshot is a fail.

## How to render — always use the helper

A sibling `render.sh` wraps the CLI and handles every footgun for you
(workspace setup, the correct `--width`, engine selection, blocking broken
patterns). **Prefer it over calling `poster` directly.** Resolve it relative to
this skill file; in this dotconfig repo the path is:

```bash
POSTER_RENDER=/Users/m/repos/workspace/dotconfig/pi/agent/skills/poster-from-tsx/render.sh
```

Pipe TSX on stdin:

```bash
cat <<'EOF' | "$POSTER_RENDER" -o /abs/path/out.png
export default function App() {
  return (
    <div className="w-[1200px] p-12 text-white"
         style={{ background: "radial-gradient(800px 500px at 90% -10%, rgba(168,85,247,0.2), transparent 60%), #07060d", fontFamily: "'Inter', system-ui" }}>
      <div className="text-[14px] font-bold uppercase tracking-[0.4em] text-white/40">Pi · 29 May 2026</div>
      <h1 className="mt-3 text-6xl font-black tracking-tight">Hello, poster.</h1>
    </div>
  );
}
EOF
```

`-o` decides the format from its extension (`.png/.jpg/.webp/.pdf/.svg`). Use an
**absolute** output path when possible (relative paths are resolved before the
helper moves into its workspace). It prints the output path, pixel dims, and
where it archived the TSX so you can iterate. Force the engine with
`--engine chrome|takumi`; pass raw CLI flags after `--`.

Always **view the rendered PNG** (read the image file) and iterate — check the
canvas isn't clipped or letterboxed, type is legible at thumbnail scale, and the
composition fills the frame. First drafts are rarely the deliverable.

## The two engines (this is load-bearing — the README undersells the gaps)

`render.sh` picks the engine automatically, but you must understand why:

- **takumi** (default, PNG only, no browser, fast) — the workhorse. Real
  Tailwind + Google fonts, gorgeous output for layouts, cards, gradients,
  grain, and **hand-drawn SVG charts**.
- **chrome** (`--engine chrome`) — required for **JPG/WebP/PDF/SVG** and for
  **gradient text**. Full CSS fidelity; slower; uses system Chrome.

### Verified gotchas in poster-ai 0.5.0 — do not relearn these the hard way

1. **`recharts` is broken via the CLI** (duplicate-React crash on takumi; blank
   output on chrome). The helper refuses it. **Draw every chart as inline SVG**
   — area/line/bars/donut/rings/scatter. Recipes are in `reference.md`. SVG
   charts render beautifully and you control them exactly.
2. **Gradient text (`background-clip:text`) renders as a solid block under
   takumi.** The signature "italic reveal word" gradient only works on
   **chrome** — the helper auto-routes there when it sees clip-text. On takumi,
   use a solid accent color for the reveal word instead.
3. **takumi ignores the root width** and defaults to 1440px; the helper passes
   the correct `--width` derived from your `w-[Npx]`. (Height auto-fits and
   honors a root `h-[Npx]`.) If you ever call `poster` raw, you must pass
   `--width` yourself.
4. **chrome auto-measures the canvas only when the poster has no bare imports.**
   So for chrome targets (PDF/SVG/JPG/WebP, or gradient text), prefer
   **inline SVG icons over `lucide-react`**. `lucide-react` is fine on takumi
   (auto-resolves via esm.sh). Other bare imports beyond lucide are unsupported.

## The canvas contract

The root `<div>` declares the canvas. Break these and the render is wrong:

- **Always** put `w-[Npx]` on the root. Width-only is the default — height grows
  with content (the safe path; whatever you draw is captured in full).
- Add `h-[Npx]` **only** for a required fixed aspect (OG image 1200×630, story
  1080×1350). Fixed-height roots usually clip overflow — budget your content to
  fit, or drop the height and go content-driven.
- **Never** `min-h-screen` (stretches to a giant viewport), **never** a root
  `w-full` next to `w-[Npx]` (overrides it), **never** `aspect-[]` without a
  width.
- **Font floor 14px.** Nothing below `text-sm`/`text-[14px]` — it vanishes at
  thumbnail scale. (SVG chart labels: `fontSize` 13+.)
- Three fonts, no imports needed: `Inter` (sans), `'Source Serif 4'`
  (serif/italic), `'JetBrains Mono'` (mono). Set via inline `style={{ fontFamily }}`.

## Canvas sizes by shape

| shape | root |
|---|---|
| twitter / landscape / dashboard | `w-[1600px]` |
| instagram square / poster / cover | `w-[1200px]` |
| story / wrapped / vertical | `w-[1080px]` (+ `h-[1350px]` for fixed) |
| editorial / magazine / long-form | `w-[1400px]` |
| OG image | `w-[1200px] h-[630px]` (exact aspect required) |
| weather / hero card | `w-[1400px]` |

## Read this before authoring anything non-trivial

`reference.md` (sibling file) is the design library: the layout grammar (kicker
+ title headers, eyebrow labels, reveal words, cards, KPI stats, hero metrics,
activity rings, heatmaps, footers), color systems and gradient recipes,
**inline-SVG chart recipes** (since recharts is out), composition skeletons for
each poster type, content-voice guidance, and a pitfalls table. Load it whenever
the poster is more than a one-liner. Match a request to one of its composition
skeletons, then make it specific and real.

If `poster-ai` isn't installed: `bun install -g poster-ai` (or `npm i -g
poster-ai`). The first `render.sh` run also provisions a small workspace
(`~/.poster-workspace`) so takumi can resolve Tailwind.

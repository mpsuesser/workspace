# poster-from-tsx — design reference

The design library. SKILL.md covers how to render and the engine gotchas; this
file is the taste and grammar. Match a request to a composition skeleton, then
make it specific and real. Every primitive here is plain Tailwind + inline SVG —
no charting libraries (recharts is broken via the CLI; see SKILL.md).

---

## The layout grammar

Mix and match these primitives. They're what separate a poster from a webpage.

### Header row: kicker + title (left) + chip (right)

```tsx
<header className="flex items-end justify-between">
  <div>
    <div className="text-[14px] font-bold uppercase tracking-[0.3em] text-white/50">
      Pi · Friday, 29 May 2026
    </div>
    <h1 className="mt-2 text-5xl font-black tracking-tight">Good morning</h1>
  </div>
  <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[14px] text-white/60">
    Live · last 7 days
  </div>
</header>
```

Rule of thumb: **kicker = meta context, title = the answer, right chip = status/time.**

### Eyebrow kicker (the small-caps label)

```tsx
<div className="text-[14px] font-bold uppercase tracking-[0.3em] text-white/50">
  FIG. 1 — GLOBAL TEMPERATURE ANOMALY
</div>
```

`text-[14px]`–`text-[15px]`, `font-semibold`–`font-bold`, always `uppercase`,
`tracking-[0.2em]`–`tracking-[0.5em]` (more tracking = more formal). Muted:
`text-white/40`–`/60` on dark, `text-neutral-500` on light.

### Italic "reveal word" in a headline — the signature move

Break a headline with a Source Serif 4 italic in a contrasting treatment.

```tsx
<h1 className="text-7xl font-black tracking-tight leading-[0.9]">
  A century and a half of{" "}
  <em
    className="italic font-normal"
    style={{
      fontFamily: "'Source Serif 4', serif",
      background: "linear-gradient(180deg,#fef3c7 0%,#f472b6 55%,#a855f7 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    }}
  >
    warming,
  </em>{" "}
  charted in one line.
</h1>
```

**Engine note:** gradient-clipped text only renders on **chrome** — the helper
auto-routes there when it detects clip-text. If you want a PNG via **takumi**,
drop the gradient and give the `<em>` a solid accent color
(`style={{ color: "#f472b6" }}`); the italic serif alone still reads as the reveal.

Reusable gradients: `#fef3c7 → #f472b6 → #a855f7` (the poster-ai look),
`#fef3c7 → #f97316 → #dc2626` (cream→crimson), `#22d3ee → #8b5cf6` (cyan→violet),
`#fde68a → #f59e0b → #ec4899` (butter→pink).

### Card — the workhorse container

```tsx
<div
  className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5"
  style={{ boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.04), 0 20px 40px -24px rgba(0,0,0,0.6)" }}
>
  {children}
</div>
```

`rounded-xl`–`rounded-3xl`; border `white/[0.05–0.15]` on dark / `neutral-200/80`
on light; fill `white/[0.02–0.08]` on dark / pure `bg-white` on light. The inset
top highlight + offset shadow make it feel lifted.

### KPI stat

```tsx
<div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
  <div className="flex items-center justify-between">
    <div className="flex h-9 w-9 items-center justify-center rounded-xl"
         style={{ background: "linear-gradient(135deg,#22d3ee,#3b82f6)" }}>
      {/* inline SVG icon, 16px */}
    </div>
    <span className="text-[14px] font-medium text-emerald-400">+18.4%</span>
  </div>
  <div className="mt-4 text-[14px] uppercase tracking-wider text-white/40">ARR</div>
  <div className="mt-1 text-2xl font-semibold tabular-nums">$14.8M</div>
</div>
```

Gradient icon square + label + value + delta chip. `tabular-nums` on every number.

### Hero metric (the big single number)

```tsx
<div>
  <div className="text-[14px] font-bold uppercase tracking-[0.3em] text-white/80">You listened to</div>
  <div className="mt-2 font-black leading-[0.82] tracking-tighter tabular-nums" style={{ fontSize: 220 }}>586</div>
  <div className="mt-1 text-3xl font-bold">hours of music</div>
  <div className="mt-1 text-lg text-white/80">Longer than 83% of listeners in Portugal.</div>
</div>
```

Kicker → ENORMOUS number (180–260px, set `fontSize` inline) → unit → context line.

### Activity ring (Apple-Watch style)

```tsx
const stroke = 18, r = (200 - stroke) / 2, c = 2 * Math.PI * r;
const pct = Math.min(value / goal, 1.4);
<svg width={200} height={200} className="-rotate-90">
  <circle cx={100} cy={100} r={r} stroke={color} strokeOpacity={0.15} strokeWidth={stroke} fill="none" />
  <circle cx={100} cy={100} r={r} stroke={color} strokeWidth={stroke} strokeLinecap="round" fill="none"
          strokeDasharray={c} strokeDashoffset={c * (1 - pct)}
          style={{ filter: `drop-shadow(0 0 8px ${color}99)` }} />
</svg>
```

### Contribution heatmap (GitHub-style)

```tsx
const levelColor = ["rgba(255,255,255,0.05)", "#0e4429", "#006d32", "#26a641", "#39d353"];
<div className="flex gap-[3px]">
  {weeks.map((week, w) => (
    <div key={w} className="flex flex-col gap-[3px]">
      {week.map((level, d) => (
        <div key={d} className="h-[14px] w-[14px] rounded-sm" style={{ background: levelColor[level] }} />
      ))}
    </div>
  ))}
</div>
```

### Footer

```tsx
<footer className="mt-6 flex items-center justify-between border-t border-white/5 pt-4 text-[14px] text-white/30">
  <span>poster · generated 2026-05-29</span>
  <span>nebula.dev/pulse</span>
</footer>
```

### Inline SVG icons (instead of lucide on chrome targets)

Lucide works on takumi, but on chrome (PDF/SVG/JPG/WebP/gradient-text) prefer
inline SVG so the canvas measures correctly. Pattern — copy any 24×24 lucide
path:

```tsx
<svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400">
  <path d="M3 17l6-6 4 4 8-8" /><path d="M21 7v6h-6" />  {/* trending-up */}
</svg>
```

---

## Charts as hand-drawn SVG

This is how you chart — recharts does not work via the CLI. Plain SVG renders
perfectly on both engines and you control it exactly. Compute geometry in JS,
emit `<path>`/`<rect>`/`<circle>`. Always set explicit `width`/`height` (or a
`viewBox`) — never percentage heights that collapse to 0.

### Area + line

```tsx
const series = data;                       // number[]
const W = 1120, H = 300, n = series.length;
const max = Math.max(...series), min = Math.min(...series);
const x = (i: number) => (i / (n - 1)) * W;
const y = (v: number) => H - ((v - min) / (max - min || 1)) * H;
const line = series.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
const area = `${line} L${W},${H} L0,${H} Z`;
<svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.55} />
      <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
    </linearGradient>
  </defs>
  <path d={area} fill="url(#g)" />
  <path d={line} fill="none" stroke="#22d3ee" strokeWidth={3} strokeLinejoin="round" />
</svg>
```

Dashed forecast = a second `<path>` with `strokeDasharray="4 3"`. Grid =
horizontal `<line>`s at `stroke="rgba(255,255,255,0.06)"`.

### Bars (pixel math, never percent)

```tsx
const vals = data;                          // number[]
const max = Math.max(...vals), CH = 220, BW = 48, GAP = 24;
<svg width={vals.length * (BW + GAP)} height={CH + 28}>
  {vals.map((v, i) => {
    const h = (v / max) * CH, x = i * (BW + GAP);
    return (
      <g key={i}>
        <rect x={x} y={CH - h} width={BW} height={h} rx={6} fill="#22d3ee" />
        <text x={x + BW / 2} y={CH + 20} fontSize={13} fill="rgba(255,255,255,0.5)" textAnchor="middle">{labels[i]}</text>
      </g>
    );
  })}
</svg>
```

Diverging bars: anchor at a zero line `y0 = CH * (max / (max - min))`; positives
go up from `y0`, negatives down; color by sign.

### Donut / ring with segments

```tsx
const slices = [["TS", 62, "#22d3ee"], ["JS", 22, "#3b82f6"], ["Rust", 16, "#a78bfa"]];
const R = 70, C = 2 * Math.PI * R; let acc = 0;
<svg viewBox="0 0 200 200" width={200} height={200}>
  <g transform="rotate(-90 100 100)">
    {slices.map(([k, v, c], i) => {
      const len = ((v as number) / 100) * C, off = (acc / 100) * C; acc += v as number;
      return <circle key={i} cx={100} cy={100} r={R} fill="none" stroke={c as string}
                     strokeWidth={26} strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-off} />;
    })}
  </g>
</svg>
```

### Generative radial scatter (hero visuals about the *shape* of data)

```tsx
<svg viewBox="-300 -300 600 600" width={420} height={420}>
  {Array.from({ length: 320 }).map((_, i) => {
    const ring = Math.floor(i / 64), angle = ((i % 64) / 64) * Math.PI * 2;
    const radius = 40 + ring * 55 + Math.sin(i * 0.8) * 14, hue = ((ring / 5) * 300 + 180) % 360;
    return <circle key={i} cx={Math.cos(angle) * radius} cy={Math.sin(angle) * radius}
                   r={1 + Math.abs(Math.sin(i * 0.7)) * 4} fill={`hsl(${hue},80%,62%)`} opacity={0.82} />;
  })}
</svg>
```

### Hand-drawn / sketchy charts (roughjs) — the chart.xkcd look

For an organic, hand-sketched feel (think `chart.xkcd`), use **roughjs** — it's
pre-installed in the workspace, so it imports on **both** engines (on chrome,
give the root a fixed `h-[Npx]`; bare imports need it there). Use the *pure
generator* (`rough.generator()`, no DOM) and serialize each drawable to React
`<path>`s with `toPaths()`:

```tsx
import rough from "roughjs";

const gen = rough.generator();
const P = (d) => gen.toPaths(d).map((p, i) => (   // drawable -> React <path>s
  <path key={i} d={p.d} stroke={p.stroke} strokeWidth={p.strokeWidth}
        fill={p.fill} fillRule={p.fillRule} />
));

const bars = [42, 58, 50, 71, 88].map((v, i) =>
  gen.rectangle(40 + i * 110, 280 - v * 2.6, 80, v * 2.6,
    { roughness: 1.8, stroke: "#7c3aed", strokeWidth: 2.5,
      fill: "#a78bfa", fillStyle: "hachure", hachureGap: 6 }));

<svg width={600} height={300}>{bars.map((b, i) => <g key={i}>{P(b)}</g>)}</svg>
```

Generator methods: `rectangle`, `line`, `linearPath(points)`, `circle`,
`ellipse`, `polygon`, `arc`, `curve(points)`, `path(svgPathString)`. Key
options: `roughness` (1–3), `bowing`, `fillStyle` (`hachure` / `solid` /
`zigzag` / `cross-hatch` / `dots`), `hachureGap`, `hachureAngle`, `fillWeight`.
Overlay a `linearPath` trend line + sketchy `circle` dots on the bar tops, set a
casual font (`'Comic Sans MS'`, or Inter on a warm-paper base), and you have the
whole xkcd look. Lifted from `timqian/chart.xkcd` (roughjs is its engine; the
lib needs the DOM, the generator doesn't).

---

## Color systems

Pick ONE accent family and commit. Mixing 3+ accents = muddy.

**Dark bases:** `#05050a` (fuchsia-black), `#07060d`/`#0b0a12` (violet-black),
`#0a0a0f` (neutral near-black), `#0d1117` (GitHub), `#07080c` (blue-black).

**Light bases:** `#fafaf7` (editorial off-white), `#faf5ed` (warm paper),
`#f5e8de` (magazine cream), `#fef08a` (brutalist yellow), `#fef3c7` (pastel cream).

**Accent families (pick one):**

| family | swatches | vibe |
|---|---|---|
| cyan/violet | `#22d3ee` `#3b82f6` `#a78bfa` `#7c3aed` | tech, analytics, premium |
| amber/rose | `#fbbf24` `#f97316` `#fb7185` `#e11d48` | warm, retail, alerts |
| emerald | `#10b981` `#34d399` `#39d353` | growth, health, positive |
| fuchsia/violet | `#ec4899` `#f472b6` `#a855f7` `#6d28d9` | consumer, energy, wrapped |

**Named palettes (loved, drop-in).** Lift a whole scheme when a request wants a
specific mood. From starred theme repos: **Vesper** (`raunofreiberg/vesper`) —
bg `#101010`, fg `#FFFFFF`, peach `#FFC799`, mint `#99FFE4`; **Aura**
(`daltonmenezes/aura-theme`) — bg `#15141B`, purple `#A277FF`, green `#61FFCA`,
pink `#F694FF`, orange `#FFCA85`. Classics worth memorizing: **Catppuccin
Mocha** `#1E1E2E` / mauve `#CBA6F7`, **Nord** `#2E3440` / `#88C0D0`, **Gruvbox**
`#282828` / `#FABD2F`, **Dracula** `#282A36` / `#BD93F9`, **Rosé Pine** `#191724`
/ `#EBBCBA`, **Tokyo Night** `#1A1B26` / `#7AA2F7`.

**Gradient recipes:**

```ts
// radial hotspot (use two at opposite corners over a near-black base)
"radial-gradient(800px 500px at 90% 0%, rgba(139,92,246,0.18), transparent 60%), #0a0a0f"
// tech icon square
"linear-gradient(135deg,#22d3ee,#3b82f6)"
// painted sky (story/weather backgrounds)
"radial-gradient(ellipse at top, #7c3aed 0%, #ec4899 40%, #f97316 75%, #fbbf24 100%)"
```

**Grain overlay (poster-print feel):**

```tsx
<div className="pointer-events-none absolute inset-0 opacity-[0.08] mix-blend-overlay"
  style={{ backgroundImage: "repeating-radial-gradient(circle at 20% 30%, white 0, white 1px, transparent 1px, transparent 4px)" }} />
```

(Absolute overlays need a positioned, definite-height root — add `relative` and
`h-[Npx]`/`min-h-[Npx]`.)

---

## Visual effects that earn their keep

- **Floating card shadow:** `inset 0 1px 0 0 rgba(255,255,255,0.04), 0 20px 40px -24px rgba(0,0,0,0.6)`
- **Icon/ring glow:** `filter: drop-shadow(0 0 8px ${color}99)`
- **Glass card** (over colorful gradients): `rounded-3xl border border-white/20 bg-white/[0.08] backdrop-blur-2xl p-10` (chrome renders blur best)
- **Barcode strip** (editorial): a row of thin `<div>`s of widths 1–2px.

---

## Aesthetic genres lifted from CSS libraries

Two drop-in looks that push well past the default dark-glass deck.

### Retro-OS window — 98.css (chrome engine)

A pixel-faithful Windows-98 chrome — title bars, inset/outset bevels, status
bars, sunken panels, tables. Inject the CSS once via a `<style>` tag, then use
the class names. The bevels are pure `box-shadow`, so **render on chrome**
(takumi ignores raw `<style>`). Distilled essentials (full widget set:
`jdan/98.css`, or fetch `https://unpkg.com/98.css` and inline it whole):

```tsx
const css98 = `
.window{background:silver;box-shadow:inset -1px -1px #0a0a0a,inset 1px 1px #dfdfdf,inset -2px -2px grey,inset 2px 2px #fff;padding:3px;font-family:Arial;font-size:13px;color:#222}
.title-bar{display:flex;align-items:center;justify-content:space-between;background:linear-gradient(90deg,navy,#1084d0);padding:3px 2px 3px 3px}
.title-bar-text{color:#fff;font-weight:700;margin-right:24px}
.title-bar-controls{display:flex}.title-bar-controls button{min-width:16px;min-height:14px;margin-left:2px}
.window-body{margin:8px}
button{min-height:23px;min-width:75px;padding:0 12px;background:silver;border:none;box-shadow:inset -1px -1px #0a0a0a,inset 1px 1px #fff,inset -2px -2px grey,inset 2px 2px #dfdfdf}
.status-bar{display:flex;gap:1px;margin:0 1px}.status-bar-field{flex-grow:1;padding:2px 3px;box-shadow:inset -1px -1px #dfdfdf,inset 1px 1px grey}
.sunken{background:#fff;box-shadow:inset -1px -1px #fff,inset 1px 1px grey,inset -2px -2px #dfdfdf,inset 2px 2px #0a0a0a;padding:8px}
table{border-collapse:collapse;background:#fff;width:100%;font-size:13px}
th{background:silver;padding:0 6px;height:18px;text-align:left;font-weight:400;box-shadow:inset -1px -1px #0a0a0a,inset 1px 1px #fff,inset -2px -2px grey,inset 2px 2px #dfdfdf}
td{padding:0 6px;height:20px}tr.highlighted{background:navy;color:#fff}
`;

<div className="w-[820px] p-14" style={{ background: "#008080" }}>
  <style dangerouslySetInnerHTML={{ __html: css98 }} />
  <div className="window" style={{ width: 700 }}>
    <div className="title-bar">
      <div className="title-bar-text">Disk Cleanup — C:\</div>
      <div className="title-bar-controls"><button/><button/><button/></div>
    </div>
    <div className="window-body">…copy, a `.sunken` table, buttons…</div>
    <div className="status-bar"><p className="status-bar-field">3 categories</p></div>
  </div>
</div>
```

Teal `#008080` desktop, `silver` chrome, navy title bars. Great for retro
dashboards, fake OS dialogs / error boxes, task-manager stats, 90s installers.
The distilled set omits the control-button glyphs (empty bevels) — inline the
full file if you need them. Credit: `jdan/98.css`.

### Neobrutalism (both engines)

Loud, flat, hard-edged — thick black borders + a hard *offset* shadow (no blur),
saturated fills, heavy sans. Distinct from the 90s-industrial `brutalist`
example. The whole look is one recipe:

```tsx
className="border-[3px] border-black"
style={{ boxShadow: "8px 8px 0 0 #000" }}   // hard, un-blurred, offset
```

Base in a flat saturated color (`#fde047` yellow, `#a3e635` lime, `#60a5fa`
blue, `#f472b6` pink); fills are flat blocks; type is `font-black`, often
uppercase. Recolor the shadow for accent CTAs (`8px 8px 0 0 #f472b6`). Lifted
from `ekmas/neobrutalism-components`.

---

## Embedding images & brand logos

Remote `<img>` loads on **both** engines — drop in logos, avatars, map tiles, or
textures by URL, no import needed:

```tsx
<img src="https://github.com/github.png?size=160" width={120} height={120}
     style={{ borderRadius: 16 }} />
```

**Brand logos via svgl** (`pheralb/svgl`): `https://svgl.app/library/<name>.svg`
— `openai`, `cloudflare`, `supabase`, `vercel`, `stripe`, hundreds more. Sit a
mark on a white chip so dark logos read on a dark base:

```tsx
<div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white p-2">
  <img src="https://svgl.app/library/openai.svg" width={44} height={44} />
</div>
```

Caveats — **view every logo**: inline brand-SVG *source* mis-renders on takumi
(offset viewBoxes / `fill-rule:evenodd` collapse to a solid block), so use a
remote `<img>` instead; and a few individual assets render wrong on *both*
engines (e.g. the current `stripe.svg`) — swap the variant (`<name>-dark.svg` /
`<name>-light.svg` / `<name>-wordmark.svg`) if one looks off. Powers "trusted
by", partnership, pricing, and changelog posters.

---

## Content voice — realistic, not foo/bar

Plausible fake data makes a poster persuasive.

- **Names:** Ava Chen, Sora Okafor, Elena Rossi, Kai Nakamura, Jin Park, Lior Mendez.
- **Numbers:** precise, never round — `$48,291`, `$14.8M`, `+12.4%`. Pair metrics with deltas ("+N% vs last week").
- **Dates:** "Friday, 29 May 2026", "May 29 · Thursday", "Spring 2026".
- **Places:** Lisbon, Berlin, Tokyo, Reykjavík.
- **Names/handles:** products like Prism, Nebula, MUSE, Vol. XII; handles `@dev`, `@you`, `@team` (not personal names).
- **Three-part kickers** feel authoritative: `The Almanac · Vol. XII · Climate`, `Live at Tanzhaus · Berlin`.

---

## Composition skeletons

Reach for one based on the ask, then specialize it.

- **Dashboard** (`w-[1600px]`): header (greeting + status chip) → 4× KPI row →
  2-col (wide area chart + activity list) → 2-col (bars + donut) → footer.
- **Editorial data story** (`w-[1400px]`): masthead strip → big headline w/ serif
  reveal word + lede → Fig.1 captioned chart → two-col charts → pull quote (serif
  italic, left border) → footer (url + page N).
- **Year-in-review / wrapped** (`w-[1080px]`, often `h-[1350px]`): tiny header
  (app + @user) → HERO number (200px+) → top-N list w/ gradient progress bars →
  monthly rhythm bars → featured card → hashtag footer. Budget content to the
  height or go width-only.
- **Fitness/health** (`w-[1400px]`): date kicker + encouragement → 2-up (rings
  card | stat grid) → 2-up (heart-rate area | weekly bars).
- **Social / OG** (`w-[1600px]`, or `w-[1200px] h-[630px]` for OG): one hero
  element (giant word/number/icon), kicker above, url/handle below, dark base +
  two radial hotspots.
- **Event / concert poster** (`w-[1200px]`): mono corner metadata → THREE STACKED
  WORDS in alternating treatments → divider strip (date + status) → 2-col (lineup
  | info) → genre tag chips.
- **Weather hero** (`w-[1400px]`): painted-sky gradient root → glass card with
  location kicker, MASSIVE temperature (180px+ with °), icon+stat row, 24h area
  chart, 7-day forecast row.

---

## Pitfalls

| symptom | cause | fix |
|---|---|---|
| Content way too tall | `min-h-screen` on root | use `w-[Npx]`, no min-h-screen |
| Empty colored strip at bottom | forced `h-[Npx]` > content | drop the height, go content-driven |
| Content clipped on the right | takumi defaulting to 1440px | use `render.sh` (it sets `--width`); raw CLI needs `--width` |
| Reveal word is a solid block | gradient text on takumi | use chrome (auto via helper) or a solid color |
| Chart is blank / build error | recharts | draw it as inline SVG |
| chrome PNG is letterboxed/1440×900 | chrome + bare imports can't auto-measure | use inline SVG icons, or add a fixed `h-[Npx]` |
| Bars/elements with `height:X%` invisible | parent has no fixed height → % resolves to 0 | pixel math: `height: ${(v/max)*200}px` |
| Labels illegible at thumbnail | `text-xs`/`text-[11px]` | floor is 14px |
| Absolute shapes in wrong place | root has no definite height | add `relative` + `min-h-[Npx]` |
| "Muddy" feel | 3+ accent families | pick one family |
| "Generic webpage" feel | no kicker/footer rhythm | add small-caps eyebrows + muted footer |
| Brand SVG is a solid block | inline brand-SVG source on takumi (offset viewBox / evenodd) | embed as remote `<img>`; if still wrong, swap the svgl variant |
| Raw `<style>` CSS ignored (e.g. 98.css) | takumi doesn't apply raw `<style>` | render on chrome |
| roughjs chart blank / letterboxed | chrome + bare import with no fixed height | add `h-[Npx]` to the root |
| Build crash "Cannot use 'import.meta'" | package uses `import.meta` (e.g. `@thi.ng/*`) | use a dep without it, or inline the math |

### Budgeting a fixed-aspect canvas

When you set `w-[1080px] h-[1350px]`, content past 1350px is clipped (the root
usually clips overflow). Add up section heights before writing:

```
padding (p-14 = 56×2) 112 · header ~180 · hero card ~320 · stats row ~120
· authors card ~320 · rhythm ~160 · footer ~60  →  ~1272 (fits 1350 w/ slack)
```

If it's tight, drop a section or switch to width-only (content-driven height).

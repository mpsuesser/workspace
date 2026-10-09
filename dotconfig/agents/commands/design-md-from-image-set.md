---
description: Generate a maximally creative, decisive DESIGN.md from a directory of inspiration images. Run from inside a directory containing the images.
---

You are going to invent a complete visual design system from a curated set of images sitting in the current working directory, and write it as a `DESIGN.md` next to those images.

This is a creative exercise, not a code audit. There is no app to scan. There is no user to interview mid-run. The images are the entire source of truth. Treat each run as a single decisive act of design direction.

## Inputs

- The images in `pwd` (any common raster format: `.png`, `.jpg`, `.jpeg`, `.webp`, `.gif`). List them, then read every one of them as an image. Do not skim by filename.
- The impeccable skill conventions, which the output must cohere with:
  - `~/.pi/agent/skills/impeccable/SKILL.md` (shared design laws, absolute bans, color/typography/motion principles)
  - `~/.pi/agent/skills/impeccable/reference/document.md` (the exact DESIGN.md spec: YAML frontmatter token schema + six fixed sections in fixed order)
  - `~/.pi/agent/skills/impeccable/reference/brand.md` and `~/.pi/agent/skills/impeccable/reference/product.md` (the two registers — pick whichever the images push you toward; commit to one)

Read those before phase 1.

## Phase 1 — Inspect like an art critic, not a search engine

Spend real tokens here. The quality of phase 3 is set by how seriously you take phase 1. No shortcuts, no "the images appear to be...".

For each image individually, write a short critical reading. Use the vocabulary of someone who actually looks at pictures for a living. Cover, at minimum, with whatever proportion is appropriate to the image:

- **Form & composition** — geometry, mass distribution, asymmetry, negative space, where the eye is led, framing, depth structure
- **Color & light** — palette in OKLCH terms (hue, chroma, lightness), temperature, contrast structure, what role each color plays, the quality of light (flat, raking, ambient, dramatic, etc.)
- **Line, edge, texture, surface** — drawn vs. rendered, hard vs. soft edges, materiality, grain, finish, brush economy
- **Figure & subject** — what is depicted, how the subject sits in the frame, the implied relationship between subject and viewer, gesture, posture, gaze
- **Expression & emotion** — what the image *feels* like, what mood it transmits, what it withholds, what it asserts
- **Technique & medium** — what tradition or technique it evokes (woodblock, gouache, 3D render, photograph, collage, screenprint, oil, etc.) — name it specifically
- **Cultural / temporal register** — historical or regional traditions it references or refuses, era and place it conjures

Then write a **cross-set reading**. The images are not isolated; the *constellation* is itself a signal. What is consistent across them? Where do they intentionally diverge? What is the common voice underneath the surface variation? What is the curator (the user) clearly drawn to that they may not have named? Where is the tension — and is the tension load-bearing or accidental?

End phase 1 with **one paragraph** that names the unifying spirit of the set in your own words. Not "modern minimalism." Something specific, concrete, and yours: a metaphor, a scene, a named referent ("the bench at the back of a Chinese teahouse," "a stack of risograph zines on a steel desk under a north window," "a Studio Ghibli storyboard inked onto found newsprint"). This sentence is your north star for phase 2.

## Phase 2 — Decide

Switch gears completely. Phase 1 was reflection. Phase 2 is commitment. No more hedging, no more "could be." Every decision in phase 2 is load-bearing and final.

Make the following decisions and write them down before touching the file. Be specific:

1. **Register**: brand or product. Pick one.
2. **Creative North Star**: the named metaphor you ended phase 1 with, in quotes.
3. **Color strategy**: Restrained / Committed / Full palette / Drenched (per impeccable's color laws). Pick one and explain in one sentence why this set demands it.
4. **Palette**: sample real values from the images. Aim for 4–8 named colors, each with both an evocative descriptive name (e.g. *Stone-Garden Ink*, *Late-Afternoon Persimmon*, not *blue-800*) and an OKLCH value. Group by Primary / Secondary / Tertiary / Neutral per the spec. Tint every neutral toward the dominant hue — never pure `#000` or `#fff`.
5. **Type pairing**: pick specific fonts (real, named — Inter / Söhne / Cormorant Garamond / IBM Plex Mono / Marcellus Pro / Recoleta / whatever fits). Display + body + (optional) mono. Justify the pairing from phase 1's reading, not from category reflex.
6. **Density, motion, surface treatment, signature visual moves**: the things that distinguish this system from the ten nearest plausible alternatives.
7. **Anti-references**: what this system explicitly refuses. Name them. This is where you carry the impeccable absolute bans (side-stripe borders, gradient text, glassmorphism by default, hero-metric template, identical card grids, modal-first thinking) into the spec, plus any category clichés specifically inverted by your reading of these images.
8. **Three named rules** (minimum) in the format `**The [Name] Rule.** [forceful one-sentence doctrine]`. Stitch's own outputs do this; impeccable's spec encourages it; do it.

If two images suggest different directions, **pick one and own the choice**. Averaging across tensions produces mush. Better to commit hard to one reading and let the other tension live in a single secondary accent color or a single deliberate exception. The user is curating image sets specifically so that any individual run swings somewhere bold; safe centrist output is the failure mode.

## Phase 3 — Write `DESIGN.md`

Write the file at `./DESIGN.md` (next to the images, in the current working directory). Follow `document.md`'s spec **exactly**:

- YAML frontmatter with `name`, `description`, `colors`, `typography`, `rounded`, `spacing`, `components` per the Stitch token schema
- Markdown body with the six sections in the fixed order, headers matching character-for-character: `## 1. Overview`, `## 2. Colors`, `## 3. Typography`, `## 4. Elevation`, `## 5. Components`, `## 6. Do's and Don'ts`. Evocative subtitles after the section name are allowed.

Synthesize canonical primitives for `## 5. Components` (button, input, card, chip, nav) consistent with everything else you've decided, even though no real code exists yet. `document.md` explicitly supports this path. Treat the components section as "what these primitives would look like if this system already existed in code."

OKLCH-vs-hex in the frontmatter: this is a from-images creative artifact, not a Stitch-pipeline export, so prefer OKLCH directly in the frontmatter. Accept the linter warning trade-off; the spec allows it. Be consistent — don't mix.

Aim for a `DESIGN.md` somewhere in the **400–900 line** range. Long enough to be comprehensive, short enough to stay sharp. Cut anything that doesn't carry weight. Every line earns its place.

## Tone & voice

- Write the prose body in the **voice of a design director** — forceful, specific, opinionated. "Prohibited," "always," "never," not "consider" or "might prefer."
- Be willing to make claims the images don't strictly prove. The user explicitly wants bold assumptions. *"The set's restraint with chroma demands a similarly restrained typographic palette — no display serif games."* — that kind of inference is the whole point.
- Pull at least one **anti-pattern test** in the Stitch style: a concrete sensory check the reader can run. *"If the page looks like a 2014 SaaS product page, the radii are too round."*
- Resist obvious training-data reflexes. If the images are warm and earthy and you find yourself reaching for *terracotta and bone with a serif headline*, that's the first-order reflex; push past it. If they're cool and architectural and you're reaching for *Swiss grid + Inter + IBM Plex*, that's the second-order reflex (the impeccable critique-reject lanes). Run impeccable's category-reflex check from `SKILL.md` against your own phase 2 decisions before writing.

## House rules

- **Do not ask the user any questions during the run.** No `AskUserQuestion`, no mid-run confirmation, no "would you like me to..." The user curated the inputs in advance and is firing this prompt to find out what comes back. Decide and ship.
- **Do not pre-explain or post-narrate.** Don't preface phase 1 with "I'll now begin by examining each image." Just do the reading.
- **No safe averaging.** Three runs over the same image set with this prompt should produce three meaningfully different DESIGN.md files because each run commits to a different reading. That is the feature.
- **Don't overwrite an existing `DESIGN.md`** in the directory without first moving it aside to `DESIGN.md.prev-<timestamp>` so the user can compare runs. Then write the fresh one.
- **One file only.** Skip the `.impeccable/design.json` sidecar — this is a creative artifact, not an impeccable workflow seed.

## Output to me at the end

After writing the file, print:

1. The one-line description (matching the frontmatter `description` field).
2. The Creative North Star line, in quotes.
3. The three (or more) named rules you wrote, as a tight bulleted list.
4. The full palette as a tight table (descriptive name + OKLCH).

That's it. No recap, no summary of methodology, no offer to revise. The artifact is the file; the closing print-out is the thumbnail.

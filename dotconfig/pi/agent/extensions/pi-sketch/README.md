# pi-sketch

Quick sketch pad for [pi](https://github.com/badlogic/pi-mono) — now powered by [tldraw](https://tldraw.dev/).

## What it does

`/sketch` opens a local tldraw canvas in your browser.

When you click **Send to pi** or press **Cmd/Ctrl+Enter**, the extension:

- exports the current canvas as a PNG
- saves an editable `.tldr.json` snapshot next to it
- inserts `@/path/to/sketch.png` into pi's editor so you can add prompt text and send it

## Install

```bash
pi install npm:@ogulcancelik/pi-sketch
```

Or try without installing:

```bash
pi -e npm:@ogulcancelik/pi-sketch
```

## Usage

```text
/sketch
```

## Current UX

- blank white tldraw canvas with the default tldraw UI hidden
- top controls: **Clear**, **Cancel**, **Send to pi**
- bottom five-color palette: black, gray, blue, green, red
- **Shift+A** / **Shift+D** move left and right through the color list
- draw tool starts active, with black selected by default
- local persistence via tldraw so accidental refreshes are less painful
- Escape in pi cancels the sketch session

## Workflow

1. Run `/sketch`
2. Draw, paste screenshots, annotate, or build a diagram in tldraw
3. Click **Send to pi** or press **Cmd/Ctrl+Enter**
4. pi gets an `@/tmp/...png` attachment in the editor
5. Add any extra context you want and send

## Local development

If you're editing this package locally:

```bash
npm install
npm run build
```

Then reload pi:

```text
/reload
```

Useful scripts:

```bash
npm run dev
npm run build
npm run typecheck
```

## Notes

- The browser UI is built with Vite + React + tldraw.
- The pi extension serves the built `dist/` app from a temporary local HTTP server.
- `/sketch` opens a direct local URL like `http://localhost:61234/pi-sketch`.
- If `dist/` is missing, `/sketch` will show a page telling you to build first.

## License

MIT

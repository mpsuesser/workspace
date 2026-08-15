#!/usr/bin/env bash
# render.sh — render a poster TSX to an image/doc with the right engine + flags.
#
# Why this exists: the raw `poster` CLI (v0.5.0) has several non-obvious
# footguns that this script handles so renders Just Work:
#   • takumi (default PNG engine) IGNORES the root w-[Npx] and defaults to
#     1440px wide unless you pass --width. We auto-detect it from the TSX.
#   • chrome auto-measures the root correctly with NO size flags — but passing
#     --width breaks its height auto-fit. So we pass flags ONLY to takumi.
#   • takumi needs `tailwindcss` resolvable from cwd. We keep a tiny workspace
#     (~/.poster-workspace) with it installed and run from there.
#   • recharts is broken via the CLI in this version. We refuse it early with a
#     pointer to inline SVG (see reference.md).
#   • gradient text (background-clip:text) renders as a solid BLOCK under
#     takumi, so we auto-route gradient-text posters to chrome.
#
# Usage:
#   echo '<tsx>' | render.sh -o out.png
#   render.sh -o out.pdf --in poster.tsx
#   render.sh -o out.png --engine chrome      # force engine
#
# TSX comes from stdin unless --in <file> is given. -o is required; its
# extension picks the format (png/jpg/webp/pdf/svg). The TSX is also saved into
# the workspace so you can iterate on it.

set -euo pipefail

export PATH="$HOME/.bun/bin:$PATH"
unset NODE_PATH 2>/dev/null || true   # NODE_PATH shadows esm.sh auto-resolution

WS="$HOME/.poster-workspace"
OUT=""
ENGINE=""        # "", takumi, or chrome
IN=""            # optional input file; otherwise read stdin
EXTRA=()         # pass-through args after `--`

die() { echo "render.sh: $*" >&2; exit 1; }

while [[ $# -gt 0 ]]; do
  case "$1" in
    -o|--out)    OUT="$2"; shift 2 ;;
    --engine)    ENGINE="$2"; shift 2 ;;
    --in)        IN="$2"; shift 2 ;;
    --)          shift; EXTRA=("$@"); break ;;
    *)           die "unknown arg: $1 (use -o, --engine, --in, or -- for raw poster flags)" ;;
  esac
done

[[ -n "$OUT" ]] || die "missing -o <output path>"
command -v poster >/dev/null 2>&1 || die "poster CLI not found. Install: bun install -g poster-ai (or npm i -g poster-ai)"

# Resolve output to an absolute path BEFORE we cd into the workspace.
case "$OUT" in
  /*) OUT_ABS="$OUT" ;;
  *)  OUT_ABS="$PWD/$OUT" ;;
esac
mkdir -p "$(dirname "$OUT_ABS")"

# One-time workspace so takumi can resolve tailwindcss; lucide-react + roughjs
# let the chrome engine bundle those imports (takumi resolves them via esm.sh
# anyway). roughjs powers hand-drawn / sketchy charts (the chart.xkcd look) on
# both engines. The guard also re-runs if an existing workspace predates roughjs.
if [[ ! -d "$WS/node_modules/tailwindcss" || ! -d "$WS/node_modules/roughjs" ]]; then
  echo "render.sh: setting up $WS (one-time)…" >&2
  mkdir -p "$WS"
  ( cd "$WS" && bun add tailwindcss lucide-react roughjs >/dev/null 2>&1 ) \
    || die "failed to set up workspace ($WS). Run: cd $WS && bun add tailwindcss lucide-react roughjs"
fi

# Read the TSX.
if [[ -n "$IN" ]]; then
  [[ -f "$IN" ]] || die "input file not found: $IN"
  TSX="$(cat "$IN")"
else
  TSX="$(cat)"
fi
[[ -n "${TSX// }" ]] || die "no TSX provided (pipe it on stdin or pass --in <file>)"

# --- validation -------------------------------------------------------------
grep -qE 'w-\[[0-9]+px\]' <<<"$TSX" \
  || die "the root element must declare a canvas width, e.g. w-[1200px]. See reference.md (The canvas contract)."

if grep -qE 'from[[:space:]]*["'"'"']recharts' <<<"$TSX"; then
  die "recharts is broken via the poster CLI in this version (duplicate React under takumi; blank under chrome).
Draw charts with inline SVG instead — area/line/bars/donut/rings/scatter recipes are in reference.md (Charts as hand-drawn SVG)."
fi

# --- format + engine selection ---------------------------------------------
EXT="${OUT_ABS##*.}"; EXT="$(tr '[:upper:]' '[:lower:]' <<<"$EXT")"
[[ "$EXT" == "jpeg" ]] && EXT="jpg"
case "$EXT" in png|jpg|webp|pdf|svg) ;; *) die "unsupported output extension '.$EXT' (use png/jpg/webp/pdf/svg)" ;; esac

GRADIENT_TEXT=0
grep -qiE 'WebkitBackgroundClip|background-clip|bg-clip-text' <<<"$TSX" && GRADIENT_TEXT=1

if [[ -z "$ENGINE" ]]; then
  if [[ "$EXT" != "png" ]]; then
    ENGINE="chrome"                       # only chrome does jpg/webp/pdf/svg
  elif [[ "$GRADIENT_TEXT" == 1 ]]; then
    ENGINE="chrome"                       # takumi renders gradient text as a solid block
  else
    ENGINE="takumi"                       # fast, browserless default
  fi
fi

# --- size flags -------------------------------------------------------------
WIDTH="$(grep -oE 'w-\[[0-9]+px\]' <<<"$TSX" | head -1 | grep -oE '[0-9]+')"
# A fixed aspect only counts if h-[Npx] sits on the root (first ~600 chars).
HEAD="$(printf '%s' "$TSX" | head -c 600)"
HEIGHT="$(grep -oE 'h-\[[0-9]+px\]' <<<"$HEAD" | head -1 | grep -oE '[0-9]+' || true)"

SIZE_FLAGS=()
if [[ "$ENGINE" == "takumi" ]]; then
  SIZE_FLAGS+=(--width "$WIDTH")
  [[ -n "$HEIGHT" ]] && SIZE_FLAGS+=(--height "$HEIGHT")
else
  # chrome: let it auto-measure the root. Only force size when the poster has
  # bare imports AND a fixed height (chrome's auto-measure is unreliable with
  # imports). With imports but no fixed height, warn — prefer inline SVG.
  if grep -qE 'from[[:space:]]*["'"'"'][^./]' <<<"$TSX"; then
    if [[ -n "$HEIGHT" ]]; then
      SIZE_FLAGS+=(--width "$WIDTH" --height "$HEIGHT")
    else
      echo "render.sh: warning — chrome + bare imports + content-driven height is unreliable." >&2
      echo "           Add h-[Npx] to the root, or replace imports with inline SVG (see reference.md)." >&2
    fi
  fi
fi

# --- render -----------------------------------------------------------------
mkdir -p "$WS/.poster"
SAVE="$WS/.poster/$(basename "${OUT_ABS%.*}")-$(date +%s).tsx"

cd "$WS"
RESULT="$(printf '%s' "$TSX" | poster export - -o "$OUT_ABS" --engine "$ENGINE" \
  "${SIZE_FLAGS[@]}" --save "$SAVE" --json "${EXTRA[@]}" 2>/dev/null)" \
  || { printf '%s' "$TSX" | poster export - -o "$OUT_ABS" --engine "$ENGINE" "${SIZE_FLAGS[@]}" --save "$SAVE" "${EXTRA[@]}" >&2; die "render failed (see error above)"; }

printf '%s' "$RESULT" | python3 -c '
import json, sys
out, engine, save = sys.argv[1], sys.argv[2], sys.argv[3]
d = json.load(sys.stdin)
w, h, fmt = d.get("width"), d.get("height"), d.get("format")
kb = (d.get("bytes", 0) or 0) / 1024
dims = f"{w}x{h} | " if w and h else ""
print(f"OK  {out}")
print(f"    {fmt} | {dims}{kb:.1f} KB | engine={engine}")
print(f"    tsx saved -> {save}")
' "$OUT_ABS" "$ENGINE" "$SAVE"

#!/usr/bin/env bash
# verify-subagent-web-tools.sh
#
# Canary for the "researcher had no web tools" failure mode.
#
# A subagent's `tools:` field is an ALLOWLIST. A named tool only materializes if
# its extension actually loaded in the spawned child. If the web extension fails
# to load (config drift, upgrade, bad name), the allowlist silently collapses to
# builtins and the agent degrades to memory-only "research" with NO error.
#
# This script reproduces a research subagent's child launch as faithfully as the
# pi-subagents runner does, then asserts the web tools actually resolve. Run it
# after upgrading pi or pi-subagents, or whenever a subagent claims it "had no
# web tools".
#
# Exit 0 = all expected web tools present. Exit 1 = a tool is missing (or probe failed).

set -uo pipefail

REQUIRED=(web_search code_search fetch_content get_search_content)
# Mirrors the researcher allowlist the runner passes via `--tools`.
ALLOWLIST="read,write,web_search,code_search,fetch_content,get_search_content,intercom"
TIMEOUT="${PI_PROBE_TIMEOUT:-150}"

# Resolve the pi-subagents child runtime extension so the probe matches a real child.
RT="$(ls /Users/m/.pi/agent/npm/node_modules/pi-subagents/src/runs/shared/subagent-prompt-runtime.ts 2>/dev/null || true)"
EXT_ARGS=()
[ -n "$RT" ] && EXT_ARGS=(--extension "$RT")

echo "==> Probing a spawned subagent child for web tools (allowlist: $ALLOWLIST)"
[ -n "$RT" ] && echo "    runtime extension: $RT" || echo "    (runtime extension not found; probing without it)"

OUT="$(
  timeout "$TIMEOUT" pi --mode json -p --no-session "${EXT_ARGS[@]}" \
    --tools "$ALLOWLIST" \
    "Do NOT call any tool. List the EXACT machine names of every tool currently available to you, one per line, nothing else." \
    2>/dev/null | python3 -c '
import sys, json
out = []
for line in sys.stdin:
    line = line.strip()
    if not line:
        continue
    try:
        e = json.loads(line)
    except Exception:
        continue
    if e.get("type") == "turn_end":
        m = e.get("message", {})
        for c in (m.get("content") or []):
            if isinstance(c, dict) and c.get("type") == "text":
                out.append(c.get("text", ""))
        if m.get("text"):
            out.append(m["text"])
print("\n".join(out))
'
)"

echo "---- child reported tools ----"
echo "$OUT"
echo "------------------------------"

missing=()
for t in "${REQUIRED[@]}"; do
  if ! grep -qiw "$t" <<<"$OUT"; then
    missing+=("$t")
  fi
done

if [ ${#missing[@]} -ne 0 ]; then
  echo "FAIL: web tools missing from spawned child: ${missing[*]}"
  echo "      The web extension likely did not load in the child, or the tool"
  echo "      name drifted. Check: ls ~/.pi/agent/extensions/web/index.ts ; pi --help | grep extension"
  exit 1
fi

echo "PASS: all required web tools resolved in the spawned child (${REQUIRED[*]})"

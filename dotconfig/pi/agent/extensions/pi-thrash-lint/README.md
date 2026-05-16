# pi-thrash-lint

A pi extension that indexes your past session history for **agent-thrash patterns** and exposes them as four LLM-callable tools for mining lint-rule candidates.

## What's "thrash"?

Closed enum of detected signals:

| Signal | Meaning |
|---|---|
| `failed_edit_retry` | `edit`/`write` returns `isError: true`, agent retries on same file within a short window |
| `edit_oscillation` | ≥ 4 edits to the same file inside one window (default 10 min) |
| `bash_error_retry` | `bash` exits non-zero, agent retries another `bash` whose first token matches |
| `read_edit_loop` | `read(X)` → `edit(X)` → `read(X)` again (agent re-reading after misedit) |
| `tool_error_cascade` | ≥ 3 failing tool calls inside one window (default 2 min) |

Each signal is detected independently, then temporally adjacent hits are grouped into a single **incident** with a score in `[0, 1]`.

## Tools

The extension registers four tools designed to be called by an LLM in sequence:

### `thrash_find`
List ranked incidents.

```jsonc
{
  // all optional
  "signals": ["failed_edit_retry"],   // closed enum; rejects unknowns
  "project": "octopus",                // substring match
  "since":   "7d",                     // "7d" / "24h" / "30m" / ISO date
  "min_score": 0.3,                    // 0..1
  "limit":     20
}
```

Returns *summarised* incidents only — no raw content — so the LLM can triage without context bloat:

```jsonc
{
  "total_estimated": 331,
  "incidents": [
    {
      "incident_id":   "abc:e1:e2",      // opaque, used by thrash_inspect
      "project":       "m/repos",
      "session_id":    "abc",
      "started_at":    "2026-04-01T...",
      "duration_seconds": 42,
      "score":         0.9,
      "primary_signal": "read_edit_loop",
      "signals":       { "read_edit_loop": 3, "failed_edit_retry": 1, ... },
      "file_paths":    ["src/foo.ts"],
      "tool_calls":    12,
      "failed_tool_calls": 3,
      "summary":       "re-read after edit on src/foo.ts"
    }
  ]
}
```

### `thrash_inspect`
Drill into one incident.

```jsonc
{ "incident_id": "abc:e1:e2", "max_events": 50 }
```

Returns a structured trace (no raw JSON blobs) with signal annotations pointing at specific entry IDs.

### `thrash_cluster`
Group incidents to find patterns.

```jsonc
{
  "group_by": "signal" | "tool" | "file_extension" | "file_glob" | "project",
  "signals": [...],
  "project": "...",
  "limit": 20
}
```

Returns `groups: [{ key, count, sample_incident_ids (≤3), representative_summary }]`, sorted by count desc.

### `thrash_stats`
Corpus-wide calibration numbers. Use this *first* to know what a "high" count looks like.

```jsonc
{ "project": "octopus", "since": "30d" }
```

Returns totals, overall failure rate, per-tool failure rates, top thrash files, sorted signal counts.

## Caller-DX design choices

- **One verb per tool.** No flag soup or polymorphic returns.
- **Filters all optional with sane defaults.** First call works ("show me everything") and refines from there.
- **List endpoints return summaries, not blobs.** Drilldown is a separate explicit call.
- **`incident_id` is opaque.** The LLM doesn't need to know it's `session_id:first_entry:last_entry`.
- **Closed enums** for `signals` and `group_by` — rejected unknowns with a helpful error rather than silently mismatching.
- **Calibration before drilldown.** `thrash_stats` exists so the LLM can answer "is 5 retries a lot?" before deciding what to escalate.

## Workflow for extracting lint-rule proposals

```
thrash_stats {}                                  # baseline rates
  ↓
thrash_cluster { group_by: "signal" }            # which signal dominates?
  ↓
thrash_cluster { group_by: "file_extension",
                 signals: ["failed_edit_retry"] } # narrow by signal kind
  ↓
thrash_find    { signals: [...],
                 project: "...",
                 min_score: 0.5 }                # top examples to study
  ↓
thrash_inspect { incident_id: "..." }            # full trace for one example
  ↓
{ propose a lint rule, AST query, or AGENTS.md guideline }
```

## Architecture

```
extensions/
├── index.ts            # registers 4 tools + /thrash-stats command
├── lib/
│   ├── parser.ts       # JSONL → ordered Event[]
│   ├── detect.ts       # Event[] → Incident[]   (pure, unit-tested)
│   ├── corpus.ts       # session file discovery + caching
│   └── types.ts        # Event, Incident, SignalKind
├── tools/
│   ├── find.ts         # runThrashFind
│   ├── inspect.ts      # runThrashInspect
│   ├── cluster.ts      # runThrashCluster
│   └── stats.ts        # runThrashStats
└── __tests__/
    ├── parser.test.ts
    ├── detect.test.ts
    ├── tools.test.ts
    └── fixtures/        # one JSONL per thrash signal — doubles as spec
```

The tool runners are pure async functions over a `Corpus` so they're unit-testable without a real `ExtensionAPI`. `index.ts` is a thin adapter that builds the corpus once per call (with a 60s cache).

## Run tests

```bash
npx tsx --test extensions/__tests__/*.test.ts
```

## Smoke test against your real corpus

```bash
npx tsx scripts/smoke.ts
```

## Known limitations (v0)

- Heuristics are mechanical, no NLP. "User correction" / "agent claimed completion but was wrong" requires language detection and isn't implemented yet.
- Corpus is rebuilt in memory per command (60s in-process cache). A SQLite index keyed by `(session_path, mtime_ms)` is the obvious next step for incremental loading.
- Branching / forking in sessions: the parser walks the JSONL linearly rather than reconstructing the active leaf path. For sessions without branching this is identical; for branched sessions some "abandoned" tool calls may appear.
- Bash retry detection uses leading-token match. This catches "npm run test" vs "npm test" but also matches env-prefixed commands like `NODE_PATH=… node x` vs `NODE_PATH=… node y` — sometimes correctly, sometimes spuriously.

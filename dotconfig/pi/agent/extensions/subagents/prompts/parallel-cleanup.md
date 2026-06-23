---
description: Parallel cleanup review
---

Run a fresh-context cleanup review of the current work using configured
subagents only.

First call `subagent({ action: "list" })` unless the exact agent names are
already known. Choose executable review-capable agents. If no suitable agents are
available, stop and tell me which Markdown agent files need to be created.

Launch two review-only children with `context: "fresh"` and `output: false`:

1. A slop pass: comments that restate code, debug leftovers, vague defaults,
   unnecessary wrappers, duplicate helpers, brittle abstractions, noisy status
   text, generated-sounding docs, and style drift.
2. A brevity/clarity pass: needless verbosity in code, tests, docs, errors,
   receipts, and UI copy, while preserving behavior, useful invariants, and
   local style.

If relevant cleanup skills are available, pass them to the matching child;
otherwise inline the criteria above. Children must inspect files and diffs
directly, return evidence-backed findings with severity and file references, and
must not edit files unless I explicitly ask for a writer pass.

After they return, synthesize fixes worth doing now, optional cleanup, and
feedback to ignore. Do not blindly apply every suggestion.

Primary request, target, or focus:

$@

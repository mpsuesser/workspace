---
description: Parallel research/context builders into an implementation handoff plan
---

Use configured subagents to understand the request, inspect any external
references, inspect the local codebase, and produce a grounded implementation
handoff plan with a compact implementation-ready meta-prompt.

First call `subagent({ action: "list" })` unless the exact agent names are known.
Choose executable agents whose descriptions match external research, local
context building, implementation strategy, and synthesis. If no suitable agents
are available, stop and tell me which Markdown agent files need to be created.

Use `context: "fresh"` unless I explicitly ask for forked context. First read or
fetch any URLs, issue links, PRs, screenshots, plans, docs, or local files
mentioned in the request. Treat them as primary scope, not optional context.

Use the `subagent` tool in chain mode:

1. First step: a parallel group with distinct output paths under `handoff/`.
   Suggested angles are external evidence, local codebase context, and
   implementation strategy.
2. Second step: a synthesis-capable agent that reads the parallel findings and
   writes `handoff/final-handoff-plan.md`.

The final handoff should include recommended approach, likely files, constraints,
non-goals, validation, risks, unresolved questions, and a compact
implementation-ready meta-prompt.

Primary request, target, or focus:

$@

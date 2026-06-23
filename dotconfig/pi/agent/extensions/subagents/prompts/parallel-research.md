---
description: Parallel subagent research
---

Launch fresh-context research subagents to build a grounded answer to the
current question or decision.

First call `subagent({ action: "list" })` unless the exact agent names are known.
Choose configured agents whose descriptions match external research, local
codebase scouting, comparison, or decision analysis. If no suitable agents are
available, stop and tell me which Markdown agent files need to be created.

Use `context: "fresh"` unless I explicitly ask for forked context. Assign two or
three focused angles, such as:

- external evidence from official docs, standards, release notes, benchmarks, or
  primary sources
- local codebase context, affected files, existing patterns, constraints, and
  tests
- practical tradeoffs, risks, edge cases, and validation strategy

Each child should inspect its sources directly and return concise findings,
source links or file references, confidence level, gaps, and decision
implications. Do not ask children to edit unless I explicitly request
implementation.

After they return, synthesize the evidence into a practical recommendation.

Primary request, target, or focus:

$@

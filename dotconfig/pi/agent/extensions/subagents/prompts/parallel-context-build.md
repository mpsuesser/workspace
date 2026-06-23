---
description: Parallel context builders for planning handoff
---

Build grounded handoff context for planning or implementation using configured
subagents only.

First call `subagent({ action: "list" })` unless the exact agent names are known.
Choose executable agents whose descriptions match context building, codebase
scouting, requirements analysis, validation, or risk analysis. If no suitable
agents are available, stop and tell me which Markdown agent files need to be
created.

Use the `subagent` tool in chain mode with a single parallel step, not top-level
parallel tasks, so relative output files live under the temporary chain
directory. Use `context: "fresh"` unless I explicitly ask for forked context.
Give every parallel task a distinct `output` path, `label`, and `as` name, for
example:

- `context-build/request-and-scope.md`
- `context-build/codebase-and-patterns.md`
- `context-build/validation-and-risks.md`

Ask each child to read every relevant file needed for its slice, follow imports
or callers when useful, include constraints and gaps, and end with a compact
`meta-prompt` section for the next planning or implementation agent.

Do not write these context artifacts into the repository unless I explicitly ask
for persistent files.

After the children return, synthesize important context, recommended next
meta-prompt, open questions, assumptions, and artifact paths.

Primary request, target, or focus:

$@

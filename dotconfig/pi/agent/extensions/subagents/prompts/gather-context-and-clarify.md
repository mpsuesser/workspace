---
description: Use subagents to gather context, then ask clarifying questions
---

Gather context before planning or implementing using configured subagents only.

First call `subagent({ action: "list" })` unless the exact agent names are known.
Choose executable agents whose descriptions match local codebase scouting,
external research, requirements analysis, or risk analysis. If no suitable agents
are available, stop and tell me which Markdown agent files need to be created.

Launch one to three focused children with concrete meta prompts. Good angles are
local files and patterns, external evidence when it matters, and validation or
risk gaps. Ask each child to return concise findings plus remaining
clarification questions that materially affect implementation confidence.

After they return, synthesize what is known and ask me the unresolved questions
needed to reach shared understanding before planning or implementing.

Primary request, target, or focus:

$@

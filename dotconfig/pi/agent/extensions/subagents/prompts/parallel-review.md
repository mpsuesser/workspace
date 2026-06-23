---
description: Parallel subagent review
---

Launch a fresh-context parallel review of the current work using configured
subagents only.

First call `subagent({ action: "list" })` unless the exact agent names are
already known from the conversation. Choose executable agents whose descriptions
match review, validation, security, testing, or maintainability work. If no
suitable agents are available, stop and tell me which agent Markdown files need
to be created.

Use `context: "fresh"` unless I explicitly ask for forked context. Each child
must inspect the repository, relevant instructions, and current diff directly
from files and commands. Do not rely on the main conversation history.

Give each child a distinct angle based on the actual target. Examples of angles:

- correctness and regressions
- tests and validation quality
- simplicity and maintainability
- security, privacy, performance, docs, or user-flow behavior when relevant

Ask children to return concise, evidence-backed findings with file or line
references and suggested fixes. They must not edit files unless I explicitly ask
for a writer pass. Prefer `output: false` unless I ask for artifacts.

After the children return, synthesize:

- blockers or fixes worth doing now
- optional or deferred improvements
- feedback to ignore, with reasons
- whether another writer or review pass is warranted

Do not blindly apply every suggestion.

Primary request, target, or focus:

$@

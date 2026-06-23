---
description: Review/fix loop until clean
---

Run a parent-controlled review loop for the requested work using configured
subagents only.

First call `subagent({ action: "list" })` unless the exact agent names are known.
Choose executable agents whose descriptions match implementation, review,
validation, or fix work. If no suitable agents are available, stop and tell me
which Markdown agent files need to be created.

Keep the parent session as the loop controller and final decision-maker. Child
subagents receive concrete role-specific tasks; they must not run subagents or
manage the loop unless the chosen agent explicitly has `tools: subagent` and the
task is an assigned fanout task.

Default to a maximum of three review rounds unless I specify another cap. Count a
review round each time fresh-context review or validation agents inspect the
current diff after a writer pass. Stop early when no blockers or fixes worth
doing now remain.

Use one writer against the active worktree at a time unless I explicitly ask for
isolated worktrees. If implementation is needed, launch one async writer-capable
agent with the approved scope, validation contract, and expected handoff. After a
writer completes, launch fresh-context review or validation agents with distinct
angles. Children must inspect files and diffs directly and must not edit during
review-only steps.

After reviewers return, synthesize:

- blockers or scope/product/architecture decisions needing approval
- fixes worth doing now
- optional improvements
- feedback to ignore or defer

When fixes are worth doing and implementation is authorized, launch one async
writer-capable agent to apply only the synthesized fixes. Run another review
round only when that fix pass made material changes or addressed non-trivial
findings.

Primary request, target, or focus:

$@

# Orchestration plan

Use this only when delegating implementation to subagents.

## Phase 1: foundation

Run one worker on slice 01. Require it to create the domain model, tests, and compile cleanly.

## Phase 2: independent shell/catalog work

After slice 01 is stable, run two workers in parallel:

- worker A: slice 02 managed runtime shell
- worker B: slice 03 settings and agent catalog

Have a reviewer inspect both for service boundaries and Effect v4 API correctness.

## Phase 3: planning and child safety

Run two workers in parallel:

- worker A: slice 04 invocation decoder and workflow compiler
- worker B: slice 05 context sanitizer and child runtime

The sanitizer slice is high priority and should include the signed-thinking fixture tests before any later process work depends on it.

## Phase 4: execution kernel

Run slice 06 after slices 02, 04, and 05 are merged. This should be a single focused worker because process lifecycle code is subtle.

## Phase 5: foreground workflows

Run slice 07 after slice 06. Follow with review focused on interruption cleanup, output correctness, and acceptance failure propagation.

## Phase 6: background/event sourcing

Run slice 08 after foreground result types stabilize. Reviewer focus: replayability and avoiding mutable-state source-of-truth drift.

## Phase 7: user-facing adapter

Run slice 09 last. Keep first public name `subagent_effect` until the tool is proven stable.

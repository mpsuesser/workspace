# subagents-effect implementation slices

Use these prompts as staged implementation tickets. Each worker should read `00-global-rules.md` first.

Recommended order:

1. `01-domain-schemas-and-errors.md`
2. `02-managed-runtime-extension-shell.md` and `03-settings-and-agent-catalog.md` can run after slice 1 starts stabilizing.
3. `04-invocation-decoder-and-workflow-compiler.md` after slices 1 and 3.
4. `05-context-sanitizer-and-child-runtime.md` after slices 1 and 2.
5. `06-child-process-gateway-and-run-engine.md` after slices 2, 4, and 5.
6. `07-workflow-runner-outputs-and-acceptance.md` after slice 6.
7. `08-async-event-store-status-and-control.md` after run events and foreground results are stable.
8. `09-pi-tool-adapter-slash-and-doctor.md` last.

General handoff requirements for every slice:

- List files changed.
- List tests added.
- List commands run.
- State remaining integration risks.
- Do not claim completion if typecheck/test fails.

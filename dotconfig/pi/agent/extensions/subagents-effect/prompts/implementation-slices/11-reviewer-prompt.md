# Reviewer prompt for subagents-effect slices

Review the completed slice against these criteria:

1. Did the worker load and follow the relevant Effect skills?
2. Are all public decoded shapes schema-first?
3. Are service interfaces focused capabilities rather than monoliths?
4. Do service methods avoid leaking requirements in `R`?
5. Are dependencies captured in `Layer.effect` and wired with `Layer.provide`?
6. Are platform operations behind Effect platform services?
7. Are errors typed with `Schema.TaggedErrorClass` where public/cross-module?
8. Are absence and optional values modeled with `Option` / `Schema.OptionFrom*` rather than nullish domain values?
9. Are tests meaningful and deterministic?
10. Did `npm run check` pass?

For sanitizer/process/run-store slices, also check:

- signed-thinking assistant messages are never partially rewritten
- child processes are scoped and cleaned up
- async status can be replayed from persisted typed events
- interruption/failure paths are tested

Return:

- blocking findings
- non-blocking suggestions
- files inspected
- commands run

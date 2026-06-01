# First worker meta-prompt

You are the first implementation worker for `subagents-effect`.

Read these files first:

- `prompts/implementation-slices/00-global-rules.md`
- `prompts/implementation-slices/01-domain-schemas-and-errors.md`

Then implement slice 01 only.

Do not implement runtime services yet. Do not spawn child processes. Do not register Pi tools.

Your goal is to establish the domain and error model so later workers can build services on top of stable schemas.

Before finishing:

- run `npm run check`
- summarize files changed
- summarize tests added
- call out any schemas that may need adjustment by later slices

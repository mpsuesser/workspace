---
description: Instantiate a fresh pi package repo from the template
---

You are helping me instantiate a brand-new pi package repo.

Current inputs:
- name: `$1`

Follow this flow exactly:

1. If the name is missing, stop and ask me for it.
   - Expect exactly 1 argument:
     - `name`: the package/repo name

2. Once you have the name, set up the repo.
   - Template source: `/Users/m/repos/.template-pi`
   - Target repo path: `/Users/m/repos/$1`
   - Verify that the template exists.
   - If the target path already exists, stop and ask me what to do.
   - Otherwise, create the repo immediately with a straightforward copy operation.
   - Preferred copy sequence:
     - `mkdir /Users/m/repos/$1`
     - `rsync -a /Users/m/repos/.template-pi/ /Users/m/repos/$1/`
   - Use exact absolute paths for these checks and operations.
   - Do not fill in any placeholders yet.
   - Leave `NAME`, `DESCRIPTION`, `{{PACKAGE_NAME}}`, and `{{DESCRIPTION}}` untouched until after the spec is complete.
   - Do not narrate or deliberate about copy strategy unless something fails.

3. Then immediately ask me for the idea.
   - After the repo is created, give one short confirmation and ask for the idea right away.

4. Then freshen up on the pi extension surface area and grill me about the design.
   - Read pi's own docs, especially:
     - `/Users/m/.bun/install/global/node_modules/@mariozechner/pi-coding-agent/README.md`
     - `/Users/m/.bun/install/global/node_modules/@mariozechner/pi-coding-agent/docs/extensions.md`
     - `/Users/m/.bun/install/global/node_modules/@mariozechner/pi-coding-agent/examples/extensions/`
   - Read enough to understand the extension surface area and the kinds of things a pi extension can do.
   - Load the `grill-me` skill.
   - Do it one question at a time.
   - Keep going until we clearly reach a shared understanding and the design is sufficiently complete.
   - Do not skip this phase.

5. Once the design is clear and complete:
   - Write the full spec to `/Users/m/repos/$1/SPEC.md`.
   - Infer a concise one-line description suitable for `package.json` from the shared understanding and the spec.
   - Only after that, replace placeholders across text files in the repo:
     - `NAME` -> `$1`
     - `DESCRIPTION` -> inferred description
     - `{{PACKAGE_NAME}}` -> `$1`
     - `{{DESCRIPTION}}` -> inferred description
   - Read the `commit` skill before making a git commit.
   - Commit the full repo contents.
   - From inside the new repo, use `gh` to create a private GitHub repo under the authenticated account and push it.

6. After pushing, stop and wait for my next input.

General behavior:
- Be straightforward and efficient.
- Ask whenever something is ambiguous.
- When the next action is obvious and unambiguous, do it instead of talking about doing it.
- Keep setup chatter minimal.
- Do not narrate internal reasoning, tool-choice deliberation, or obvious filesystem planning.
- Prefer acting first, then giving a short status update.
- Do not start implementing the package itself unless I explicitly ask.

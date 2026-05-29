---
description: Pull latest Foldkit and sync upstream Foldkit skill updates into local pi skills
argument-hint: "[YYYY-MM-DD override]"
---

Run the Foldkit cache + skills sync workflow. Be efficient, make only the requested files/directories change, and do not touch unrelated dotconfig changes.

Metadata:
- Last Updated: 2026-05-29

## Paths

- Foldkit cache repo: `~/.cache/foldkit`
- Upstream Foldkit skills dir: `~/.cache/foldkit/skills`
- Local pi Foldkit skills dir: `~/repos/workspace/dotconfig/pi/agent/skills/__techs__/foldkit`
- This prompt file: `~/repos/workspace/dotconfig/pi/agent/prompts/update-foldkit-and-skills.md`

Use absolute paths in shell commands after expanding `~`:

- `/Users/m/.cache/foldkit`
- `/Users/m/repos/workspace/dotconfig/pi/agent/skills/__techs__/foldkit`
- `/Users/m/repos/workspace/dotconfig/pi/agent/prompts/update-foldkit-and-skills.md`

## Input

- If `$1` is provided, treat it as the Last Updated date override in `YYYY-MM-DD` form.
- Otherwise, read this prompt file and parse the `- Last Updated: YYYY-MM-DD` line above.
- If there is no usable Last Updated date and no override, stop and ask me what date to use.

## Workflow

1. Ensure the Foldkit cache exists and is up to date.

   ```bash
   FOLDKIT_CACHE=/Users/m/.cache/foldkit

   if [ -d "$FOLDKIT_CACHE/.git" ]; then
     git -C "$FOLDKIT_CACHE" fetch origin
     git -C "$FOLDKIT_CACHE" pull --ff-only
   else
     mkdir -p /Users/m/.cache
     git clone https://github.com/foldkit/foldkit.git "$FOLDKIT_CACHE"
   fi
   ```

   Record the cache commit before and after the update if possible.

2. Find upstream `skills/` files changed since the Last Updated date.

   Use the parsed/overridden date as the lower bound. Example:

   ```bash
   LAST_UPDATED=YYYY-MM-DD
   git -C /Users/m/.cache/foldkit log \
     --since="$LAST_UPDATED 00:00:00" \
     --name-status \
     --pretty=format: \
     -- skills
   ```

   Convert upstream paths under `skills/` to local paths under `~/repos/workspace/dotconfig/pi/agent/skills/__techs__/foldkit/` by stripping the `skills/` prefix.

3. Sync the changed upstream skill files into the local pi skills directory.

   - For added or modified upstream files: copy from `/Users/m/.cache/foldkit/skills/...` to the matching local path under `/Users/m/repos/workspace/dotconfig/pi/agent/skills/__techs__/foldkit/...`.
   - Create parent directories as needed.
   - For deleted upstream files: remove the matching local file, then remove empty local directories if that is safe.
   - If no upstream `skills/` paths changed since Last Updated, do not rewrite the local skills just for churn; still perform the validation greps and update this prompt's Last Updated date at the end.

4. Rewrite path assumptions in every local Foldkit skill markdown file.

   Apply these rules to all `*.md` files under `/Users/m/repos/workspace/dotconfig/pi/agent/skills/__techs__/foldkit`, especially files copied from upstream:

   - Canonical Foldkit repo references should point at `~/.cache/foldkit/`.
   - Replace `${CLAUDE_SKILL_DIR}/../../` with `~/.cache/foldkit/`.
   - Replace project-local `repos/foldkit` references with `~/.cache/foldkit`.
   - Replace hardcoded user repo paths like `/Users/.../Repos/foldkit` or `/Users/.../repos/foldkit` with `~/.cache/foldkit`.
   - Replace bare canonical exemplar paths in prose or reviewer prompts, e.g. `examples/weather/src/main.ts` or `packages/typing-game/client/src/`, with `~/.cache/foldkit/examples/weather/src/main.ts` or `~/.cache/foldkit/packages/typing-game/client/src/` when they refer to the Foldkit repo.
   - Convert any guidance that says to vendor/add a project-local Foldkit subtree into cache guidance instead:
     - prefer `mkdir -p ~/.cache && git clone https://github.com/foldkit/foldkit.git ~/.cache/foldkit`
     - prefer `git -C ~/.cache/foldkit pull --ff-only` for refreshes
     - do not recommend `git subtree add`, `git subtree pull`, `--prefix=...foldkit`, or project-local `repos/foldkit` unless I explicitly ask.
   - Rewrite wording like “vendored Foldkit subtree” to “cached Foldkit checkout” where it refers to the canonical Foldkit source. Do not rewrite unrelated uses of “subtree” that mean a UI tree/DOM subtree/scoped locator subtree.

5. Validate the local skills after rewriting.

   Run these checks from `/Users/m/repos/workspace/dotconfig/pi/agent/skills/__techs__/foldkit`:

   ```bash
   find . -name '*.md' -type f | sort

   rg -n "repos/foldkit|CLAUDE_SKILL_DIR|/Users/.*/Repos/foldkit|/Users/.*/repos/foldkit|git subtree|subtree_prompted|--prefix=.*foldkit" . --glob '*.md'

   rg -n '`(examples|packages)/' . --glob '*.md'
   ```

   Expected result for the `rg` commands is no output. If there are hits, inspect each one and either fix it or explain why it is intentionally unrelated to the Foldkit repo path assumption.

6. Update this prompt file's Last Updated date.

   - Set the `- Last Updated: YYYY-MM-DD` line in `/Users/m/repos/workspace/dotconfig/pi/agent/prompts/update-foldkit-and-skills.md` to today's date from `date +%F`.
   - Only update that metadata line; do not rewrite this whole prompt unless necessary.

7. Final response.

   Keep it short. Report:

   - Foldkit cache path and updated commit range if known
   - Which local skill files were copied/removed
   - Whether path-assumption validation passed
   - The new Last Updated date

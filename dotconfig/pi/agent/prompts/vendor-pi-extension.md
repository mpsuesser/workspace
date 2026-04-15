---
description: Vendor a pi extension from a GitHub repo into ~/.pi/agent/extensions
---

Vendor the pi extension from this GitHub URL: `$1`

Do this with minimal chatter.

1. If `$1` is missing, ask me for the GitHub repo URL.
2. Accept `https://github.com/{owner}/{repo}` URLs, with an optional trailing slash or `.git`, and extract `{owner}/{repo}` and `{repo}`.
   - If the URL is not a GitHub repo URL in that shape, stop and ask me to resend it.
3. Ensure `~/.pi/agent/extensions/` exists.
4. From `~/.pi/agent/extensions/`, run `gh repo clone {owner}/{repo}`.
   - If the target directory already exists, stop and ask me what to do.
5. Enter `~/.pi/agent/extensions/{repo}` and remove its `.git` directory so it becomes a plain vendored copy.
6. If there is a `package.json`:
   - update all packages in `package.json` to the latest versions
   - prefer `bunx npm-check-updates -u` for this
   - then run `bun install`
7. Run any available validation scripts from `package.json` that help confirm the extension is clean.
   - Prefer this order: `check`, `lint`, `typecheck`, `test`, `build`
   - Run whichever of these scripts actually exist
8. Make sure the result is clean:
   - `.git` is gone
   - dependency install succeeded
   - available checks passed
   - if anything fails, tell me exactly what failed

Keep the final reply short: cloned path, what was updated, and whether the checks passed.
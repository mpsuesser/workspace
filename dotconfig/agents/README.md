# Shared agent skills and commands

Edit `skills/` and `commands/` here. Both OpenCode and Claude Code read these
same files through directory symlinks:

- `~/.agents` → this directory
- `~/.claude/skills` → `~/.agents/skills`
- `~/.claude/commands` → `~/.agents/commands`
- `dotconfig/opencode/skills` → `../agents/skills`
- `dotconfig/opencode/commands` → `../agents/commands`

Run `sh dotconfig/agents/install.sh` from the workspace root to install the
home-directory links. The root `bun run install:dotconfig` includes this step.
The installer replaces existing symlinks but refuses to overwrite real
directories; move their contents into the shared source or archive them first.

Set `"syncClaudeAiSkills": false` in `~/.claude/settings.json` to keep Claude's
account-synced skills out of this shared directory.

Each skill lives at `skills/<name>/SKILL.md`; each command lives at
`commands/<name>.md`. Use `disable-model-invocation: true` for manual-only skills.
Keep command and skill names distinct unless the command is a thin launcher for
that same skill, as with Plannotator.

Claude Code prefers personal skills over project skills; OpenCode prefers project
skills. Shared skills must respect repository-specific policies rather than
relying on same-name project overrides. MCP configuration, plugins, and host
settings live in their respective tool configurations.

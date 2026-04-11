# Raycast

This repo no longer tracks Raycast's live extension bundles.

## What is tracked

- `package.json`
- `extensions.manifest.json`
- `scripts/snapshot-extensions.mjs`

## What is not tracked

- `~/.config/raycast/extensions/`
- `~/.config/raycast/ai/`

Those paths are local Raycast state and are intentionally ignored.

## Notes

- `~/.config/raycast` should be a real local directory, not a symlink into this repo.
- `bun run install:dotconfig` now only ensures the local directory exists.
- `bun run snapshot:extensions` refreshes the tracked extension manifest from the local Raycast install.

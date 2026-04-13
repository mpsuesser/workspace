# Vendored from upstream

- Upstream: https://github.com/jaylate/ghostty-dynamic.nvim/tree/main
- Original repository: https://github.com/jaylate/ghostty-dynamic.nvim
- Starting upstream commit: `b855e1f`
- Vendored into this repo on: 2026-04-13

## Why vendored

This plugin is kept in this dotfiles repo as a local Neovim plugin so it can be edited directly without submodules or a nested git repository.

## Local changes made after vendoring

- Restructured the plugin into a standard Neovim layout under `lua/ghostty-dynamic/...` so lazy.nvim can load it cleanly as a local plugin.
- Changed startup/background loading to work from the local plugin path.
- Added support for reading live Ghostty colors via `ghostty +show-config`.
- Added macOS Ghostty app theme-path fallback.
- Added `:GhosttyThemeReload`.
- Refactored the highlight mapping to use semantic colors derived from Ghostty bg/fg + ANSI roles instead of using raw palette slots directly for UI surfaces.
- Switched local Neovim config to load this vendored plugin from `dotconfig/nvim/local-plugins/ghostty-dynamic.nvim`.

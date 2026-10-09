#!/bin/sh
set -eu

root=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)

link_directory() {
  if [ -e "$2" ] && [ ! -L "$2" ]; then
    printf 'Move the existing directory aside before installing: %s\n' "$2" >&2
    exit 1
  fi
  ln -sfn "$1" "$2"
}

mkdir -p "$HOME/.claude"
link_directory "$root" "$HOME/.agents"
link_directory "../.agents/skills" "$HOME/.claude/skills"
link_directory "../.agents/commands" "$HOME/.claude/commands"

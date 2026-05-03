# .zshrc - Interactive shell configuration
# =============================================================================

export XDG_CONFIG_HOME="$HOME/.config"
export XDG_DATA_HOME="$HOME/.local/share"
export XDG_CACHE_HOME="$HOME/.cache"
export XDG_STATE_HOME="$HOME/.local/state"
export XDG_BIN_HOME="$HOME/.local/bin"

export EDITOR="nvim"
export VISUAL="$EDITOR"

# =============================================================================

eval "$(/opt/homebrew/bin/brew shellenv)"

source "$HOME/.cargo/env"
source "$HOME/.deno/env"

export BUN_INSTALL="$HOME/.bun"

# =============================================================================

export PATH="/opt/homebrew/bin:$PATH"
export PATH="$HOME/go/bin:$PATH"
export PATH="$BUN_INSTALL/bin:$PATH"
export PATH="$HOME/.local/bin:$PATH"
export PATH="$HOME/.bin:$PATH"
export PATH="$HOME/_/.bin:$PATH"
export PATH="$HOME/repos/multitude/.bin:$PATH"
# export PATH="/opt/homebrew/opt/node@20/bin:$PATH"

# =============================================================================

# Load zsh's completion system before any tool init that registers completions
# via `compdef` (zoxide, tv, …). Without this, tv's init script emits
# `(eval):230: command not found: compdef` on every new shell.
autoload -Uz compinit
compinit

# =============================================================================

export STARSHIP_CONFIG="$XDG_CONFIG_HOME/starship/starship.toml"

eval "$(starship init zsh)"

# =============================================================================

eval "$(zoxide init zsh)"

# =============================================================================

# Recursively find and source all regular files in aliases directory
# Ignore any subdirectories beginning with a dot
for config_file in $(find -L "$HOME/.config/aliases" -type f -name "[!.]*" -not -name "package.json" 2>/dev/null); do
    if [[ -f "$config_file" && -r "$config_file" ]]; then
        source "$config_file"
    fi
done

# =============================================================================

# Ghostty integration only when actually in Ghostty
if [[ ${TERM_PROGRAM:-} == "Ghostty" ]] \
   && [[ -n ${GHOSTTY_RESOURCES_DIR:-} ]] \
   && [[ -r "${GHOSTTY_RESOURCES_DIR}/shell-integration/zsh/ghostty.zsh" ]]; then
  source "${GHOSTTY_RESOURCES_DIR}/shell-integration/zsh/ghostty.zsh"
fi

# =============================================================================

# Television (tv) shell integration: Ctrl-T smart autocomplete, Ctrl-R history
# (must come after ghostty integration so its bindkeys win)
if command -v tv >/dev/null 2>&1; then
  eval "$(tv init zsh)"
fi

# =============================================================================

# Option/Alt word-editing + word-motion bindings.
#
# In zsh's default `viins` keymap (we're in vi mode because $EDITOR=nvim),
# most Option-prefixed sequences are undefined. When zsh can't match an
# ESC-prefixed sequence it strips the leading ESC and processes it as
# `vi-cmd-mode`, leaving the trailing bytes to run in `vicmd` -- silently
# swapping modes and doing weird things instead of editing/moving.
#
# Ghostty hides this because `macos-option-as-alt` defaults to false, so
# Option is swallowed upstream. Zellij forwards Option as Alt, which exposes
# the problem. These bindings fix it universally, covering all the encodings
# different terminals emit for the same logical key.

# -- word delete --
bindkey '^[^?' backward-kill-word       # Option+Backspace
bindkey '^[^H' backward-kill-word       # alt encoding of same
bindkey '^[[3;3~' kill-word             # Option+fn+Delete (forward word)
bindkey '^[d'     kill-word             # emacs-style Alt+d

# -- word motion (Option/Alt + arrows) --
bindkey '^[b'      backward-word        # emacs-style Alt+b
bindkey '^[f'      forward-word         # emacs-style Alt+f
bindkey '^[[1;3D'  backward-word        # CSI-u Alt+Left
bindkey '^[[1;3C'  forward-word         # CSI-u Alt+Right
bindkey '^[^[[D'   backward-word        # double-ESC Alt+Left
bindkey '^[^[[C'   forward-word         # double-ESC Alt+Right
bindkey '^[^[OD'   backward-word        # double-ESC SS3 Alt+Left
bindkey '^[^[OC'   forward-word         # double-ESC SS3 Alt+Right

# -- word motion (Ctrl + arrows, commonly emitted by some terminals) --
bindkey '^[[1;5D'  backward-word        # CSI-u Ctrl+Left
bindkey '^[[1;5C'  forward-word         # CSI-u Ctrl+Right

# Snappier ESC response in vi mode -- also shortens the window during which
# a stray ESC-prefixed sequence could be mis-parsed as bare ESC.
KEYTIMEOUT=1

# =============================================================================

rl() { source ~/.zshrc; }

# =============================================================================

source ~/.config/ls-colors.sh

# bun completions
[ -s "/Users/m/.bun/_bun" ] && source "/Users/m/.bun/_bun"

# Vite+ bin (https://viteplus.dev)
. "$HOME/.vite-plus/env"

# <<< littlebird wt
wt() {
  if [ "${1:-}" = "-" ]; then
    if [ -z "${_WT_PREV:-}" ]; then
      echo "No previous worktree." >&2
      return 1
    fi
    local prev="$_WT_PREV"
    export _WT_PREV="$PWD"
    cd "$prev"
    return
  fi
  local scripts_dir
  scripts_dir="$(git worktree list --porcelain | head -1 | sed 's/worktree //')/scripts"
  local result
  result="$(bash "$scripts_dir/worktree.sh" "$@")" || return $?
  if [ -n "$result" ] && [ -d "$result" ]; then
    export _WT_PREV="$PWD"
    cd "$result"
  elif [ -n "$result" ]; then
    echo "$result"
  fi
}

eval "$(direnv hook zsh)"

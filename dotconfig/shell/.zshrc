# .zshrc - Interactive shell configuration
# =============================================================================

export XDG_CONFIG_HOME="$HOME/.config"
export XDG_DATA_HOME="$HOME/.local/share"
export XDG_CACHE_HOME="$HOME/.cache"
export XDG_STATE_HOME="$HOME/.local/state"

export EDITOR="_hx"

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
export PATH="$HOME/multitude/.bin:$PATH"

# =============================================================================

eval "$(starship init zsh)"

# =============================================================================

# Recursively find and source all regular files in aliases directory
# Ignore any subdirectories beginning with a dot
for config_file in $(find "$HOME/multitude/packages/shell/aliases" -type f -name "[!.]*" -not -name "package.json" 2>/dev/null); do
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

rl() { source ~/.zshrc; }

# =============================================================================

source ~/.config/ls-colors.sh

# Flox auto-activate multitude monorepo (replaces manual `source .env`)
# Secrets are decrypted from secrets.enc.yaml via sops/age
export SOPS_AGE_KEY_FILE="$HOME/.config/sops/age/keys.txt"
eval "$(flox activate -d /Users/m/multitude -m dev)"

# bun completions
[ -s "/Users/m/.bun/_bun" ] && source "/Users/m/.bun/_bun"

alias claude-mem='bun "/Users/m/.claude/plugins/marketplaces/thedotmack/plugin/scripts/worker-service.cjs"'

# Added by Antigravity
export PATH="/Users/m/.antigravity/antigravity/bin:$PATH"

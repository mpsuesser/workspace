-- Editor options - ported from Helix [editor] section

local opt = vim.opt

-- System clipboard as default register (Helix: default-yank-register = '+')
opt.clipboard = 'unnamedplus'

-- Mouse disabled (Helix: mouse = false)
opt.mouse = ''

-- Cursor
opt.cursorline = true
opt.guicursor = 'n-c:block,v-ve:ver25,i-ci:ver25' -- Block in normal, bar in visual/insert
opt.virtualedit = 'onemore' -- Allow cursor one past EOL (closer to Helix/text-editor behavior)

-- Line wrapping (Helix-style soft wrap only; never insert hard line breaks automatically)
opt.wrap = true
opt.linebreak = true
opt.textwidth = 0
opt.wrapmargin = 0
opt.breakindent = true
opt.showbreak = '' -- No wrap indicator (Helix: wrap-indicator = "")

-- Indentation
opt.expandtab = true
opt.shiftwidth = 2
opt.tabstop = 2
opt.smartindent = true

-- Gutters (Helix: gutters = ["diagnostics"])
opt.signcolumn = 'yes'
opt.number = false
opt.relativenumber = false
opt.fillchars:append({ eob = ' ' }) -- Hide end-of-buffer `~`

-- Search
opt.ignorecase = true
opt.smartcase = true
opt.hlsearch = true
opt.incsearch = true

-- Completion
opt.completeopt = 'menu,menuone,noselect'
opt.pumheight = 10

-- UI
opt.termguicolors = true
opt.showmode = false -- Statusline shows mode
opt.laststatus = 3 -- Global statusline
opt.splitbelow = true
opt.splitright = true
opt.scrolloff = 8
opt.sidescrolloff = 8

-- Files
opt.swapfile = false
opt.undofile = true
opt.updatetime = 250
opt.timeoutlen = 400
opt.report = 9999 -- Suppress "x more lines" / "x lines changed" messages for multiline edits

-- Helix: completion-replace = true (replace on completion instead of insert)
-- Handled by blink.cmp config

-- Helix: file-picker.hidden = false (show hidden files in picker)
-- Handled by telescope config

-- Helix: smart-tab.enable = false
opt.smarttab = false

-- Helix: bufferline = "never"
opt.showtabline = 0

-- Helix: popup-border = "all"
opt.winborder = 'rounded'

-- Helix: auto-pairs
-- Handled by mini.pairs plugin

-- Helix: trim-final-newlines, trim-trailing-whitespace
-- Handled by autocmds

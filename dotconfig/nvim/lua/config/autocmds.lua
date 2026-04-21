-- Autocommands

local augroup = vim.api.nvim_create_augroup
local autocmd = vim.api.nvim_create_autocmd

-- Trim trailing whitespace on save (Helix: trim-trailing-whitespace = true)
autocmd('BufWritePre', {
  group = augroup('TrimWhitespace', { clear = true }),
  pattern = '*',
  callback = function()
    local pos = vim.api.nvim_win_get_cursor(0)
    vim.cmd([[%s/\s\+$//e]])
    vim.api.nvim_win_set_cursor(0, pos)
  end,
})

-- Trim final newlines on save (Helix: trim-final-newlines = true)
autocmd('BufWritePre', {
  group = augroup('TrimFinalNewlines', { clear = true }),
  pattern = '*',
  callback = function()
    local pos = vim.api.nvim_win_get_cursor(0)
    vim.cmd([[%s/\n\+\%$//e]])
    vim.api.nvim_win_set_cursor(0, pos)
  end,
})

-- Highlight on yank
autocmd('TextYankPost', {
  group = augroup('HighlightYank', { clear = true }),
  callback = function()
    vim.hl.on_yank({ timeout = 200 })
  end,
})

-- Return to last edit position when opening files
autocmd('BufReadPost', {
  group = augroup('LastPosition', { clear = true }),
  callback = function()
    local mark = vim.api.nvim_buf_get_mark(0, '"')
    local lcount = vim.api.nvim_buf_line_count(0)
    if mark[1] > 0 and mark[1] <= lcount then
      pcall(vim.api.nvim_win_set_cursor, 0, mark)
    end
  end,
})

-- Re-check files for external changes when nvim regains focus or cursor idles
autocmd({ 'FocusGained', 'CursorHold' }, {
  group = augroup('AutoReadExternal', { clear = true }),
  command = 'silent! checktime',
})

-- Detect and configure extension-less config files that use `#` for comments.
-- Without a filetype, `commentstring` is empty and `gcc` / <leader>c no-ops.
-- Match path patterns first (more reliable than sniffing content), then set
-- filetype = conf so syntax/comment tooling lights up.
vim.filetype.add({
  pattern = {
    ['.*/ghostty/config'] = 'ghostty',
    ['.*/%.config/ghostty/config'] = 'ghostty',
    ['.*/ghostty/keys'] = 'ghostty',
    ['.*/ghostty/shader'] = 'ghostty',
    ['.*/ghostty/themes/.*'] = 'ghostty',
  },
})

-- `ghostty` is not a known filetype in stock Neovim, so register its comment
-- string and treat it as a hash-commented config file.
autocmd('FileType', {
  group = augroup('HashCommentConfigs', { clear = true }),
  pattern = { 'ghostty', 'conf', 'config', 'fstab', 'gitconfig', 'gitignore', 'tmux' },
  callback = function()
    vim.bo.commentstring = '# %s'
  end,
})

-- Enforce Helix-style soft wrap even when filetype plugins try to enable hard wrapping
autocmd('FileType', {
  group = augroup('SoftWrapOnly', { clear = true }),
  pattern = '*',
  callback = function()
    vim.opt_local.textwidth = 0
    vim.opt_local.wrapmargin = 0
    vim.opt_local.formatoptions:remove({ 't', 'c', 'a' })
  end,
})

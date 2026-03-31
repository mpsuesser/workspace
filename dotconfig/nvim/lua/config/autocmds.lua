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

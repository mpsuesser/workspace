-- Keymaps - ported from Helix config.toml
-- Layout: WASD movement, custom editing grammar
--
-- Key principles:
--   w/a/s/d = up/left/down/right (WASD)
--   q = enter insert mode (i in vim)
--   e = change without yank
--   c = yank (copy)
--   x = select inner brackets
--   k/K = undo/redo
--   f = flash jump (goto_word)
--   r/v = visual/select mode
--   space/; = leader prefixes

local map = vim.keymap.set

-- Helper: feed keys with proper termcode translation
local function feed(keys, mode)
  local codes = vim.api.nvim_replace_termcodes(keys, true, false, true)
  vim.api.nvim_feedkeys(codes, mode or 'm', false)
end

local function focus_window(direction)
  return function()
    local mode = vim.api.nvim_get_mode().mode

    if mode:sub(1, 1) == 't' then
      feed('<C-\\><C-n><C-w>' .. direction, 'n')
      return
    end

    if mode:sub(1, 1) == 'i' then
      vim.cmd('stopinsert')
    end

    vim.cmd('wincmd ' .. direction)
  end
end

-- ============================================================================
-- NORMAL MODE - Movement (WASD)
-- ============================================================================

map('n', 'w', 'gk', { desc = 'Move up (visual line)' })
map('n', 's', 'gj', { desc = 'Move down (visual line)' })
map('n', 'a', 'h', { desc = 'Move left' })
map('n', 'd', 'l', { desc = 'Move right' })

map('n', 'W', '5gk', { desc = 'Move up 5 lines' })
map('n', 'S', '5gj', { desc = 'Move down 5 lines' })
map('n', 'A', '0', { desc = 'Go to line start' })
map('n', 'D', '$', { desc = 'Go to line end' })

-- ============================================================================
-- NORMAL MODE - Editing
-- ============================================================================

-- Enter insert mode (Helix: q = insert_mode)
map('n', 'q', 'i', { desc = 'Insert mode' })

-- Open line below/above (same as vim)
map('n', 'o', 'o', { desc = 'Open line below' })
map('n', 'O', 'O', { desc = 'Open line above' })

-- Change without yank (Helix: e = change_selection_noyank)
-- In normal mode with no selection: substitute char without yanking
map('n', 'e', '"_s', { desc = 'Change char (no yank)' })

-- Yank (Helix: c = yank)
map('n', 'c', 'yl', { desc = 'Yank char' })

-- Select inner brackets (Helix: x = @mim = match inner match)
-- Uses mini.ai's 'b' textobject for balanced brackets ()[]{}
map('n', 'x', function()
  vim.cmd('normal! vib')
end, { desc = 'Select inner brackets' })

-- Flash jump (Helix: f = goto_word)
-- Mapped in plugins/flash.lua

-- Insert "qu" at cursor (Helix: u = insert_mode + insert "qu" + move past)
-- Workaround because q enters insert mode, so u provides a way to type "qu"
map('n', 'u', function()
  vim.api.nvim_put({ 'qu' }, 'c', true, true)
end, { desc = 'Insert "qu"' })

-- Undo/Redo (Helix: k = undo, K = redo)
map('n', 'k', 'u', { desc = 'Undo' })
map('n', 'K', '<C-r>', { desc = 'Redo' })

-- Visual/Select mode (Helix: r/v = select_mode)
map('n', 'r', 'v', { desc = 'Visual mode' })
map('n', 'v', 'v', { desc = 'Visual mode' })

-- Select inner/around brackets (Helix: { = @mim, } = @mam)
map('n', '{', function()
  vim.cmd('normal! vib')
end, { desc = 'Select inner brackets' })

map('n', '}', function()
  -- Use normal! to bypass our visual mode 'a' remap
  vim.cmd('normal! vab')
end, { desc = 'Select around brackets' })

-- ============================================================================
-- NORMAL MODE - Line operations
-- ============================================================================

-- Delete line no yank (Helix: Q = extend_to_line_bounds + delete_selection_noyank)
map('n', 'Q', '"_dd', { desc = 'Delete line (no yank)' })

-- Yank line (Helix: R = extend_to_line_bounds + yank)
map('n', 'R', 'yy', { desc = 'Yank line' })

-- Delete line with yank (Helix: X = extend_to_line_bounds + delete_selection)
map('n', 'X', 'dd', { desc = 'Delete line' })

-- Replace with clipboard (Helix: E = replace_selections_with_clipboard)
map('n', 'E', '"_xP', { desc = 'Replace char with clipboard' })

-- Indent/dedent current line
map('n', '<', '<<', { desc = 'Dedent line' })
map('n', '>', '>>', { desc = 'Indent line' })

-- ============================================================================
-- NORMAL MODE - Navigation
-- ============================================================================

-- File start/end (Helix: g.g / G)
map('n', 'gg', 'gg', { desc = 'Go to file start' })
map('n', 'G', 'G', { desc = 'Go to file end' })

-- Search (Helix: F = @/ = text search)
map('n', 'F', '/', { desc = 'Search forward' })

-- Bold in markdown (Helix: b = @ms*ms* = surround with * twice)
map('n', 'b', function()
  local word = vim.fn.expand('<cword>')
  local esc = vim.api.nvim_replace_termcodes('<Esc>', true, false, true)
  vim.api.nvim_feedkeys('"_ciw**' .. word .. '**' .. esc, 'n', false)
end, { desc = 'Bold word (markdown)' })

-- ============================================================================
-- NORMAL MODE - Jump prefix (j)
-- ============================================================================

map('n', 'jw', 'gg', { desc = 'Jump to file start' })
map('n', 'ja', '0', { desc = 'Jump to line start' })
map('n', 'js', 'G', { desc = 'Jump to file end' })
map('n', 'jd', '$', { desc = 'Jump to line end' })
map('n', 'jl', '$', { desc = 'Jump to line end' })

-- ============================================================================
-- NORMAL MODE - Space leader
-- ============================================================================

map('n', '<leader>q', '<cmd>wq<cr>', { desc = 'Save and quit' })
map('n', '<leader>Q', '<cmd>q!<cr>', { desc = 'Quit without saving' })

-- Select inner word (Helix: space.w = @miw)
map('n', '<leader>w', 'viw', { desc = 'Select inner word', remap = true })
-- Select inner WORD (Helix: space.W = @miW)
map('n', '<leader>W', 'viW', { desc = 'Select inner WORD', remap = true })

map('n', '<leader>A', '0', { desc = 'Go to line start' })

-- Select full line (Helix: space.S = extend_to_line_bounds)
map('n', '<leader>S', 'V', { desc = 'Select line' })

-- Select inner textobject (Helix: space.i = select_textobject_inner)
-- Enters visual mode and waits for textobject character
map('n', '<leader>i', function()
  feed('vi', 'm')
end, { desc = 'Select inner textobject' })

-- Jump to near end of line, select word (Helix: space.d = @jdaaamiw)
-- goto_line_end, left 3, select inner word
map('n', '<leader>d', function()
  vim.cmd('normal! $3hviw')
end, { desc = 'Select word near line end' })

-- Change around brackets no yank (Helix: space.e = @mame)
-- select around match, change without yank
map('n', '<leader>e', function()
  vim.cmd('normal! vab"_c')
end, { desc = 'Change around brackets (no yank)' })

-- Select all (Helix: space.a / space.space)
map('n', '<leader>a', 'ggVG', { desc = 'Select all' })
map('n', '<leader><space>', 'ggVG', { desc = 'Select all' })

-- Surround inner textobject (Helix: space.s = select_textobject_inner + surround_add)
-- Triggers mini.surround add + inner textobject prefix
map('n', '<leader>s', function()
  feed('gzai', 'm')
end, { desc = 'Surround inner textobject' })

-- Select full line in visual (Helix: space.f = extend_to_line_bounds + select_mode)
map('n', '<leader>f', 'V', { desc = 'Select line (visual)' })

-- ============================================================================
-- NORMAL MODE - Semicolon leader (duplicate of space leader)
-- ============================================================================

map('n', ';q', '<cmd>wq<cr>', { desc = 'Save and quit' })
map('n', ';Q', '<cmd>q!<cr>', { desc = 'Quit without saving' })
map('n', ';w', 'viw', { desc = 'Select inner word', remap = true })
map('n', ';W', 'viW', { desc = 'Select inner WORD', remap = true })
map('n', ';A', '0', { desc = 'Go to line start' })
map('n', ';S', 'V', { desc = 'Select line' })

map('n', ';i', function()
  feed('vi', 'm')
end, { desc = 'Select inner textobject' })

map('n', ';e', function()
  vim.cmd('normal! vab"_c')
end, { desc = 'Change around brackets (no yank)' })

map('n', ';a', 'ggVG', { desc = 'Select all' })
map('n', ';<space>', 'ggVG', { desc = 'Select all' })

map('n', ';s', function()
  feed('gzai', 'm')
end, { desc = 'Surround inner textobject' })

map('n', ';f', 'V', { desc = 'Select line (visual)' })

-- Diagnostics picker (Helix: ;.; = diagnostics_picker)
map('n', ';;', function()
  vim.diagnostic.setloclist()
end, { desc = 'Diagnostics list' })

-- ============================================================================
-- VISUAL/SELECT MODE - Movement (WASD)
-- ============================================================================

map('x', 'w', 'gk', { desc = 'Extend up' })
map('x', 's', 'gj', { desc = 'Extend down' })
map('x', 'a', 'h', { desc = 'Extend left', nowait = true })
map('x', 'd', 'l', { desc = 'Extend right' })

map('x', 'W', '5gk', { desc = 'Extend up 5 lines' })
map('x', 'S', '5gj', { desc = 'Extend down 5 lines' })
map('x', 'A', 'b', { desc = 'Extend to prev word start' })
map('x', 'D', 'e', { desc = 'Extend to next word end' })

-- Extend to full line (Helix: r = extend_to_line_bounds)
map('x', 'r', 'V', { desc = 'Extend to line bounds' })

-- ============================================================================
-- VISUAL/SELECT MODE - Editing
-- ============================================================================

-- Indent/dedent selected lines
map('x', '<', '<gv', { desc = 'Dedent selection' })
map('x', '>', '>gv', { desc = 'Indent selection' })

-- Delete no yank (Helix: x = delete_selection_noyank + normal_mode)
map('x', 'x', '"_d', { desc = 'Delete selection (no yank)' })

-- Delete with yank (Helix: X = delete_selection + normal_mode)
map('x', 'X', 'd', { desc = 'Delete selection' })

-- Change without yank (Helix: e = change_selection_noyank)
map('x', 'e', '"_c', { desc = 'Change selection (no yank)' })

-- Yank (Helix: c = yank)
map('x', 'c', 'y', { desc = 'Yank selection' })

-- Bold in markdown (Helix: b = @ms*ms*)
map('x', 'b', function()
  -- Yank selection to z register, wrap with **
  vim.cmd('normal! "zy')
  local text = vim.fn.getreg('z')
  -- Re-select and replace
  vim.cmd('normal! gv"_c')
  -- Insert bold text (we're now in insert mode)
  local esc = vim.api.nvim_replace_termcodes('<Esc>', true, false, true)
  vim.api.nvim_feedkeys('**' .. text .. '**' .. esc, 'n', false)
end, { desc = 'Bold selection (markdown)' })

-- Exit visual mode (Helix: esc = normal_mode)
-- Default <Esc> already does this

-- ============================================================================
-- INSERT MODE
-- ============================================================================

-- Exit insert mode (Helix: q / esc = normal_mode)
-- Vim moves cursor left by 1 on insert exit. Track insert entry position
-- and compensate only when no text was typed (preserves position like Helix).
-- When text WAS typed, standard Vim behavior is correct (cursor on last char).
local _insert_enter_pos = { 0, 0 }
vim.api.nvim_create_autocmd('InsertEnter', {
  group = vim.api.nvim_create_augroup('InsertPosTracker', { clear = true }),
  callback = function()
    _insert_enter_pos = vim.api.nvim_win_get_cursor(0)
  end,
})

map('i', 'q', function()
  local cur = vim.api.nvim_win_get_cursor(0)
  local same_spot = (cur[1] == _insert_enter_pos[1] and cur[2] == _insert_enter_pos[2])
  if same_spot and cur[2] > 0 then
    -- No text typed and not at line start: <Esc> moves left, l compensates
    feed('<Esc>l', 'n')
  else
    vim.cmd('stopinsert')
  end
end, { desc = 'Exit insert mode' })

-- Line navigation in insert mode (Helix: Cmd-; / Cmd-S-;)
-- These require terminal support for Cmd key passthrough
map('i', '<D-;>', '<End>', { desc = 'Go to line end' })
map('i', '<D-S-;>', '<Home>', { desc = 'Go to line start' })

-- ============================================================================
-- Window navigation (using WASD pattern with Ctrl)
-- ============================================================================

map({ 'n', 'x', 'i', 't' }, '<M-a>', focus_window('h'), { desc = 'Focus left pane' })
map({ 'n', 'x', 'i', 't' }, '<M-d>', focus_window('l'), { desc = 'Focus right pane' })

map('n', '<C-w>w', '<C-w>k', { desc = 'Window up' })
map('n', '<C-w>s', '<C-w>j', { desc = 'Window down' })
map('n', '<C-w>a', '<C-w>h', { desc = 'Window left' })
map('n', '<C-w>d', '<C-w>l', { desc = 'Window right' })

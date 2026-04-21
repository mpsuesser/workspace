local M = {
  visible = false,
}

local group = vim.api.nvim_create_augroup('TopBar', { clear = true })
local blank_winbar = ' '

local function with_lualine(callback)
  local ok, mod = pcall(require, 'lualine')
  if ok then
    callback(mod)
  end
end

local function is_normal_window(win)
  if not vim.api.nvim_win_is_valid(win) then
    return false
  end

  local config = vim.api.nvim_win_get_config(win)
  if config.relative ~= '' then
    return false
  end

  local buf = vim.api.nvim_win_get_buf(win)
  return vim.api.nvim_get_option_value('buftype', { buf = buf }) == ''
end

local function set_winbar(win, value)
  if not is_normal_window(win) then
    return
  end

  vim.api.nvim_set_option_value('winbar', value, { win = win })
end

local function escape_statusline(text)
  return text:gsub('%%', '%%%%')
end

function M.tabline()
  local name = vim.fn.expand('%:t')
  if name == '' then
    name = '[No Name]'
  end
  return '%=' .. escape_statusline(name) .. '%='
end

function M.apply()
  vim.o.laststatus = 0

  with_lualine(function(mod)
    mod.hide({ place = { 'statusline', 'winbar', 'tabline' } })
  end)

  if M.visible then
    vim.o.showtabline = 2
    vim.o.tabline = "%!v:lua.require'config.topbar'.tabline()"
  else
    vim.o.showtabline = 0
    vim.o.tabline = ''
  end

  local value = M.visible and blank_winbar or ''
  for _, win in ipairs(vim.api.nvim_list_wins()) do
    if is_normal_window(win) then
      set_winbar(win, value)
    end
  end
end

function M.show()
  M.visible = true
  M.apply()
end

function M.hide()
  M.visible = false
  M.apply()
end

function M.toggle()
  M.visible = not M.visible
  M.apply()
end

function M.setup(opts)
  M.visible = opts and opts.visible or false

  vim.api.nvim_create_autocmd({ 'BufEnter', 'BufWinEnter', 'ColorScheme', 'VimResized', 'WinEnter', 'WinNew' }, {
    group = group,
    callback = function()
      vim.schedule(M.apply)
    end,
  })

  vim.api.nvim_create_autocmd('OptionSet', {
    group = group,
    pattern = 'background',
    callback = function()
      vim.schedule(M.apply)
    end,
  })

  vim.schedule(M.apply)
end

return M

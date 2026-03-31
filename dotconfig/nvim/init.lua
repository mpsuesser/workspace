-- Neovim configuration - ported from Helix
-- WASD movement, custom editing grammar, modular plugin setup

-- Set leader keys before loading plugins
vim.g.mapleader = ' '
vim.g.maplocalleader = ' '

-- Load editor options
require('config.options')

-- Load autocommands
require('config.autocmds')

-- Bootstrap lazy.nvim
local lazypath = vim.fn.stdpath('data') .. '/lazy/lazy.nvim'
if not vim.uv.fs_stat(lazypath) then
  vim.fn.system({
    'git', 'clone', '--filter=blob:none',
    'https://github.com/folke/lazy.nvim.git',
    '--branch=stable', lazypath,
  })
end
vim.opt.rtp:prepend(lazypath)

-- Setup plugins from lua/plugins/*.lua
require('lazy').setup('plugins', {
  change_detection = { notify = false },
  performance = {
    rtp = {
      disabled_plugins = {
        'gzip',
        'matchit',
        'matchparen',
        'netrwPlugin',
        'tarPlugin',
        'tohtml',
        'tutor',
        'zipPlugin',
      },
    },
  },
})

-- Load keymaps after plugins so plugin APIs are available
require('config.keymaps')

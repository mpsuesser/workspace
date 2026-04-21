-- UI: colorscheme, statusline, which-key

return {
  -- Vendored Ghostty-driven colorscheme source for easy local editing.
  -- Upstream: github.com/jaylate/ghostty-dynamic.nvim (see local-plugins/.../VENDORED_FROM.md).
  {
    dir = vim.fn.stdpath('config') .. '/local-plugins/ghostty-dynamic.nvim',
    name = 'ghostty-dynamic.nvim',
    lazy = false,
    priority = 1000,
    opts = {
      watch = true,
      watch_interval = 1,
      theme_check_interval = 5,
    },
    config = function(_, opts)
      require('ghostty-dynamic').setup(opts)
    end,
  },

  -- Keep lualine inert; the top bar is managed natively in config/topbar.lua.
  {
    'nvim-lualine/lualine.nvim',
    dependencies = { 'nvim-tree/nvim-web-devicons' },
    event = 'VeryLazy',
    opts = {
      options = {
        theme = 'auto',
        component_separators = { left = '|', right = '|' },
        section_separators = { left = '', right = '' },
        globalstatus = true,
      },
      sections = {},
      inactive_sections = {},
      winbar = {},
      inactive_winbar = {},
    },
    config = function(_, opts)
      require('lualine').setup(opts)
      require('config.topbar').setup({ visible = false })
    end,
  },

  -- Which-key: shows available keybindings
  {
    'folke/which-key.nvim',
    event = 'VeryLazy',
    opts = {
      preset = 'helix',
      delay = 300,
      icons = {
        mappings = false,
      },
      spec = {
        -- Group labels for leader keys
        { '<leader>q', desc = 'Save & quit' },
        { '<leader>Q', desc = 'Quit (no save)' },
        { '<leader>w', desc = 'Select inner word' },
        { '<leader>W', desc = 'Select inner WORD' },
        { '<leader>a', desc = 'Select all' },
        { '<leader>s', desc = 'Toggle top status line' },
        { '<leader>i', desc = 'Select inner' },
        { '<leader>e', desc = 'Change around brackets' },
        { '<leader>d', desc = 'Select word at line end' },
        { '<leader>f', desc = 'Select line' },
        { '<leader>S', desc = 'Select line bounds' },
        { '<leader>A', desc = 'Line start' },
        { '<leader>p', desc = 'Find files' },
        { '<leader>g', desc = 'Live grep' },
        { '<leader>b', desc = 'Buffers' },
        { '<leader>n', desc = 'File explorer' },
        { '<leader>o', group = 'OpenCode' },
        { '<leader>h', desc = 'Hover info' },
        { '<leader>r', desc = 'Rename' },
        { '<leader>t', desc = 'Treesitter select' },
        { '<leader>l', group = 'LSP / Lists' },
        { '<leader>lf', desc = 'Format buffer' },
        { '<leader>lx', desc = 'Diagnostics (Trouble)' },
        { '<leader>lX', desc = 'Buffer diagnostics (Trouble)' },
        { '<leader>lr', desc = 'LSP lists (Trouble)' },
        { '<leader>lq', desc = 'Quickfix list (Trouble)' },
        { '<leader>ll', desc = 'Location list (Trouble)' },
        { '<leader>u', group = 'UI / Utility' },
        { '<leader>uh', desc = 'Notification history' },
        { '<leader>ul', desc = 'Last message' },
        { '<leader>ud', desc = 'Dismiss notifications' },
        { '<leader>uu', desc = 'Undo tree' },
        { '<leader>k', desc = 'Undo tree' },
        { '<leader>um', desc = 'Toggle markdown render' },
        { '<leader>uz', desc = 'Zen mode' },
        { '<leader>ca', desc = 'Code action' },
        -- Jump prefix
        { 'j', group = 'Jump' },
        { 'jw', desc = 'File start' },
        { 'ja', desc = 'Line start' },
        { 'js', desc = 'File end' },
        { 'jd', desc = 'Line end' },
        { 'jl', desc = 'Line end' },
        -- Semicolon prefix
        { ';', group = 'Leader (;)' },
      },
    },
  },

  -- nvim-web-devicons (dependency for several plugins)
  {
    'nvim-tree/nvim-web-devicons',
    lazy = true,
    opts = {},
  },
}

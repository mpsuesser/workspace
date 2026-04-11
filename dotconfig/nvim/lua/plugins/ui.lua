-- UI: colorscheme, statusline, which-key

return {
  -- Rose Pine colorscheme (Helix: theme = 'rose_pine')
  {
    'rose-pine/neovim',
    name = 'rose-pine',
    lazy = false,
    priority = 1000,
    opts = {
      variant = 'main',
      dark_variant = 'main',
      dim_inactive_windows = false,
      extend_background_behind_borders = true,
      styles = {
        bold = true,
        italic = true,
        transparency = false,
      },
    },
    config = function(_, opts)
      require('rose-pine').setup(opts)
      vim.cmd('colorscheme rose-pine')
    end,
  },

  -- Lualine statusline (Helix statusline: spinner|diagnostics | file-name | position|mode)
  {
    'nvim-lualine/lualine.nvim',
    dependencies = { 'nvim-tree/nvim-web-devicons' },
    event = 'VeryLazy',
    opts = {
      options = {
        theme = 'rose-pine',
        component_separators = { left = '|', right = '|' },
        section_separators = { left = '', right = '' },
        globalstatus = true,
      },
      sections = {
        -- Left: diagnostics (Helix: left = ["spinner", "diagnostics"])
        lualine_a = {},
        lualine_b = {
          {
            'diagnostics',
            sources = { 'nvim_diagnostic' },
            sections = { 'error', 'warn' },
            symbols = { error = 'E:', warn = 'W:' },
          },
        },
        -- Center: filename (Helix: center = ["file-name"])
        lualine_c = {
          {
            'filename',
            path = 1, -- Relative path
            symbols = { modified = '+', readonly = '-' },
          },
        },
        -- Right: position, mode (Helix: right = ["position", "mode"])
        lualine_x = {
          {
            'location',
            fmt = function(str) return str:gsub('%s+', '') end,
          },
        },
        lualine_y = {},
        lualine_z = {
          {
            'mode',
            fmt = function(str)
              -- Helix mode indicators: _ (normal), + (insert), & (select)
              local mode_map = {
                NORMAL = '_',
                INSERT = '+',
                VISUAL = '&',
                ['V-LINE'] = '&',
                ['V-BLOCK'] = '&',
                SELECT = '&',
                COMMAND = ':',
                REPLACE = 'R',
                TERMINAL = 'T',
              }
              return mode_map[str] or str:sub(1, 1)
            end,
          },
        },
      },
      inactive_sections = {
        lualine_a = {},
        lualine_b = {},
        lualine_c = { 'filename' },
        lualine_x = {},
        lualine_y = {},
        lualine_z = {},
      },
    },
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
        { '<leader>s', desc = 'Surround' },
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
        { '<leader>l', group = 'LSP' },
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

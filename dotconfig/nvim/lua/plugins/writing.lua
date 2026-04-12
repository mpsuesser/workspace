-- Writing / prose UI: markdown rendering and zen mode

return {
  {
    'MeanderingProgrammer/render-markdown.nvim',
    ft = { 'markdown' },
    cmd = { 'RenderMarkdown' },
    keys = {
      { '<leader>um', '<cmd>RenderMarkdown buf_toggle<cr>', desc = 'Toggle markdown render' },
    },
    dependencies = {
      'nvim-treesitter/nvim-treesitter',
      'nvim-tree/nvim-web-devicons',
    },
    opts = {
      heading = {
        sign = false,
        width = 'block',
        position = 'inline',
        icons = { '', '', '', '', '', '' },
      },
      code = {
        sign = false,
        width = 'block',
        border = 'thick',
        left_pad = 2,
        right_pad = 2,
        language = true,
        language_icon = false,
        language_info = false,
        highlight_border = 'RenderMarkdownCode',
      },
      bullet = {
        icons = { '•', '◦', '▪', '▫' },
      },
      quote = {
        icon = '│',
      },
      pipe_table = {
        enabled = true,
      },
      dash = {
        enabled = true,
      },
    },
  },

  {
    'folke/zen-mode.nvim',
    cmd = 'ZenMode',
    keys = {
      { '<leader>uz', '<cmd>ZenMode<cr>', desc = 'Zen mode' },
    },
    opts = {
      window = {
        backdrop = 0.95,
        width = 100,
      },
    },
  },
}

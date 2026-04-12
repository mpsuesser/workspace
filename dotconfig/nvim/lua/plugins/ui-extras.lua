-- UI extras: notifications, commandline/messages, undo history

return {
  {
    'rcarriga/nvim-notify',
    event = 'VeryLazy',
    opts = {
      timeout = 3000,
      render = 'minimal',
      stages = 'fade_in_slide_out',
      background_colour = '#000000',
    },
    config = function(_, opts)
      local notify = require('notify')
      notify.setup(opts)
      vim.notify = notify
    end,
  },

  {
    'folke/noice.nvim',
    event = 'VeryLazy',
    dependencies = {
      'MunifTanjim/nui.nvim',
      'rcarriga/nvim-notify',
    },
    keys = {
      { '<leader>uh', '<cmd>Noice history<cr>', desc = 'Notification history' },
      { '<leader>ul', '<cmd>Noice last<cr>', desc = 'Last message' },
      { '<leader>ud', '<cmd>Noice dismiss<cr>', desc = 'Dismiss notifications' },
    },
    opts = {
      lsp = {
        override = {
          ['vim.lsp.util.convert_input_to_markdown_lines'] = true,
          ['vim.lsp.util.stylize_markdown'] = true,
        },
        signature = {
          enabled = false,
        },
      },
      presets = {
        bottom_search = false,
        command_palette = true,
        long_message_to_split = true,
        lsp_doc_border = true,
      },
    },
  },

  {
    'mbbill/undotree',
    cmd = { 'UndotreeToggle', 'UndotreeShow' },
    keys = {
      { '<leader>uu', '<cmd>UndotreeToggle<cr>', desc = 'Undo tree' },
      { '<leader>k', '<cmd>UndotreeToggle<cr>', desc = 'Undo tree' },
    },
    init = function()
      vim.g.undotree_SetFocusWhenToggle = 1
      vim.g.undotree_ShortIndicators = 1
    end,
  },
}

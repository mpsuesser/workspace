-- Diagnostics lists: trouble.nvim

return {
  {
    'folke/trouble.nvim',
    cmd = 'Trouble',
    keys = {
      { '<leader>lx', '<cmd>Trouble diagnostics toggle<cr>', desc = 'Diagnostics (Trouble)' },
      { '<leader>lX', '<cmd>Trouble diagnostics toggle filter.buf=0<cr>', desc = 'Buffer diagnostics (Trouble)' },
      { '<leader>lr', '<cmd>Trouble lsp toggle focus=false win.position=right<cr>', desc = 'LSP lists (Trouble)' },
      { '<leader>lq', '<cmd>Trouble qflist toggle<cr>', desc = 'Quickfix list (Trouble)' },
      { '<leader>ll', '<cmd>Trouble loclist toggle<cr>', desc = 'Location list (Trouble)' },
    },
    opts = {},
  },
}

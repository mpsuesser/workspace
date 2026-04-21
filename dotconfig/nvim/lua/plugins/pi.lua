-- pi.nvim: Neovim integration for the pi coding agent
-- Cloned from github.com/pablopunk/pi.nvim into local-plugins/ for local editing.

return {
  {
    dir = vim.fn.stdpath('config') .. '/local-plugins/pi.nvim',
    name = 'pi.nvim',
    event = 'VeryLazy',
    opts = {},
    keys = {
      { '<leader>pa', '<cmd>PiAsk<cr>', desc = 'Pi: ask with buffer context' },
      { '<leader>ps', '<cmd>PiAskSelection<cr>', mode = 'v', desc = 'Pi: ask with selection' },
      { '<leader>pc', '<cmd>PiCancel<cr>', desc = 'Pi: cancel' },
      { '<leader>pl', '<cmd>PiLog<cr>', desc = 'Pi: show log' },
    },
  },
}

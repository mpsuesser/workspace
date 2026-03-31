-- Flash: jump/motion plugin (replaces Helix goto_word)

return {
  {
    'folke/flash.nvim',
    event = 'VeryLazy',
    opts = {
      -- Use the same label alphabet as Helix config
      -- (Helix: jump-label-alphabet = "qweasdrf")
      labels = 'qweasdrf',
      modes = {
        -- Disable flash for f/t/F/T since we use f for jump and F for search
        char = { enabled = false },
        search = { enabled = false },
      },
      label = {
        uppercase = false,
        rainbow = { enabled = false },
      },
    },
    keys = {
      -- f = goto_word (Helix: f = goto_word)
      {
        'f',
        mode = { 'n', 'x', 'o' },
        function()
          require('flash').jump()
        end,
        desc = 'Flash jump',
      },
      -- Treesitter-aware selection
      {
        '<leader>t',
        mode = { 'n', 'x', 'o' },
        function()
          require('flash').treesitter()
        end,
        desc = 'Flash treesitter',
      },
    },
  },
}

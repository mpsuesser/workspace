-- OpenCode: native chat panel on the right side

return {
  {
    'sudo-tee/opencode.nvim',
    event = 'VeryLazy',
    dependencies = {
      'nvim-lua/plenary.nvim',
    },
    keys = {
      {
        '<leader>og',
        function()
          vim.cmd('Neotree show')
          require('opencode.api').toggle()
        end,
        desc = 'Open OpenCode layout',
      },
      {
        '<leader>oi',
        function()
          vim.cmd('Neotree show')
          require('opencode.api').open_input()
        end,
        desc = 'Open OpenCode input',
      },
      {
        '<leader>oI',
        function()
          vim.cmd('Neotree show')
          require('opencode.api').open_input_new_session()
        end,
        desc = 'Open OpenCode input (new session)',
      },
      {
        '<leader>oo',
        function()
          vim.cmd('Neotree show')
          require('opencode.api').open_output()
        end,
        desc = 'Open OpenCode output',
      },
      {
        '<leader>ot',
        function()
          require('opencode.api').toggle_focus()
        end,
        desc = 'Toggle OpenCode focus',
      },
      {
        '<leader>os',
        function()
          vim.cmd('Neotree show')
          require('opencode.api').select_session()
        end,
        desc = 'Select OpenCode session',
      },
    },
    config = function()
      require('opencode').setup({
        preferred_picker = 'telescope',
        preferred_completion = 'blink',
        keymap_prefix = '<leader>o',
        default_global_keymaps = false,
        ui = {
          position = 'right',
          window_width = 0.38,
          zoom_width = 0.72,
          persist_state = true,
          input = {
            auto_hide = false,
          },
        },
      })
    end,
  },
}

-- Fuzzy finder: telescope

return {
  {
    'nvim-telescope/telescope.nvim',
    branch = '0.1.x',
    dependencies = {
      'nvim-lua/plenary.nvim',
      {
        'nvim-telescope/telescope-fzf-native.nvim',
        build = 'make',
      },
    },
    cmd = 'Telescope',
    keys = {
      { '<leader>p', '<cmd>Telescope find_files<cr>', desc = 'Find files' },
      { '<leader>g', '<cmd>Telescope live_grep<cr>', desc = 'Live grep' },
      { '<leader>b', '<cmd>Telescope buffers<cr>', desc = 'Buffers' },
      { '<leader>/', '<cmd>Telescope current_buffer_fuzzy_find<cr>', desc = 'Search in buffer' },
      { '<leader>ld', '<cmd>Telescope diagnostics<cr>', desc = 'Diagnostics' },
      { '<leader>ls', '<cmd>Telescope lsp_document_symbols<cr>', desc = 'Document symbols' },
      -- Semicolon leader duplicates
      { ';p', '<cmd>Telescope find_files<cr>', desc = 'Find files' },
      { ';g', '<cmd>Telescope live_grep<cr>', desc = 'Live grep' },
      { ';b', '<cmd>Telescope buffers<cr>', desc = 'Buffers' },
    },
    config = function()
      local telescope = require('telescope')
      local actions = require('telescope.actions')

      telescope.setup({
        defaults = {
          -- WASD navigation in telescope results
          mappings = {
            i = {
              -- Insert mode uses default telescope bindings (C-n/C-p, C-j/C-k)
              ['<C-w>'] = actions.move_selection_previous,
              ['<C-s>'] = actions.move_selection_next,
              ['<Esc>'] = actions.close,
            },
            n = {
              -- Normal mode with WASD
              ['w'] = actions.move_selection_previous,
              ['s'] = actions.move_selection_next,
              ['q'] = actions.close,
              ['<Esc>'] = actions.close,
              ['<cr>'] = actions.select_default,
            },
          },
          file_ignore_patterns = { 'node_modules', '.git/' },
          layout_config = {
            horizontal = { preview_width = 0.55 },
          },
          -- Show hidden files (Helix: file-picker.hidden = false)
          hidden = true,
        },
        pickers = {
          find_files = {
            hidden = true,
          },
        },
      })

      -- Load fzf extension for better sorting
      pcall(telescope.load_extension, 'fzf')
    end,
  },
}

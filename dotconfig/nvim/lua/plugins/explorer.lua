-- File explorer: neo-tree (sidebar tree)

return {
  {
    'nvim-neo-tree/neo-tree.nvim',
    branch = 'v3.x',
    dependencies = {
      'nvim-lua/plenary.nvim',
      'nvim-tree/nvim-web-devicons',
      'MunifTanjim/nui.nvim',
    },
    cmd = 'Neotree',
    keys = {
      { '<leader>n', '<cmd>Neotree toggle<cr>', desc = 'Toggle file explorer' },
      { ';n', '<cmd>Neotree toggle<cr>', desc = 'Toggle file explorer' },
    },
    opts = {
      close_if_last_window = true,
      popup_border_style = 'rounded',
      filesystem = {
        filtered_items = {
          -- Show hidden files (Helix: file-picker.hidden = false)
          visible = true,
          hide_dotfiles = false,
          hide_gitignored = false,
        },
        follow_current_file = { enabled = true },
        use_libuv_file_watcher = true,
      },
      window = {
        position = 'left',
        width = 30,
        mappings = {
          -- WASD navigation in neo-tree
          ['w'] = 'move_cursor_up',
          ['s'] = 'move_cursor_down',
          ['a'] = 'close_node',
          ['d'] = 'open',
          ['<cr>'] = 'open',
          ['q'] = 'close_window',
          ['<esc>'] = 'close_window',
          -- Disable defaults that conflict
          ['h'] = 'none',
          ['l'] = 'none',
          ['j'] = 'none',
          ['k'] = 'none',
        },
      },
      default_component_configs = {
        indent = {
          with_markers = false,
        },
        icon = {
          folder_closed = '>',
          folder_open = 'v',
          folder_empty = '-',
        },
        git_status = {
          symbols = {
            added = '+',
            modified = '~',
            deleted = 'x',
            renamed = 'r',
            untracked = '?',
            ignored = '.',
            unstaged = 'u',
            staged = 's',
            conflict = '!',
          },
        },
      },
    },
  },
}

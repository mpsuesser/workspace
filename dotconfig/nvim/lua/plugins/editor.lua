-- Editor plugins: surround, textobjects, auto-pairs

return {
  -- mini.surround (Helix surround operations)
  -- Prefix: gz to avoid conflicts with WASD
  {
    'echasnovski/mini.surround',
    version = false,
    event = 'VeryLazy',
    opts = {
      mappings = {
        add = 'gza',            -- Add surrounding
        delete = 'gzd',         -- Delete surrounding
        find = 'gzf',           -- Find surrounding (right)
        find_left = 'gzF',      -- Find surrounding (left)
        highlight = 'gzh',      -- Highlight surrounding
        replace = 'gzr',        -- Replace surrounding
        update_n_lines = 'gzn', -- Update n_lines
      },
    },
  },

  -- mini.ai: extended text objects (Helix textobject system)
  -- Provides 'b' for balanced brackets, 'q' for quotes, etc.
  {
    'echasnovski/mini.ai',
    version = false,
    event = 'VeryLazy',
    opts = {
      n_lines = 500,
      custom_textobjects = nil, -- Use defaults: b=brackets, q=quotes, etc.
    },
  },

  -- mini.pairs: auto-close brackets (Helix: [editor.auto-pairs])
  {
    'echasnovski/mini.pairs',
    version = false,
    event = 'InsertEnter',
    opts = {
      -- Helix auto-pairs: () {} []
      -- mini.pairs handles these by default, plus '' "" ``
      mappings = {
        ['('] = { action = 'open', pair = '()', neigh_pattern = '[^\\].' },
        ['['] = { action = 'open', pair = '[]', neigh_pattern = '[^\\].' },
        ['{'] = { action = 'open', pair = '{}', neigh_pattern = '[^\\].' },
        [')'] = { action = 'close', pair = '()', neigh_pattern = '[^\\].' },
        [']'] = { action = 'close', pair = '[]', neigh_pattern = '[^\\].' },
        ['}'] = { action = 'close', pair = '{}', neigh_pattern = '[^\\].' },
        -- Disable auto-pairing for quotes (Helix config only has brackets)
        ['"'] = false,
        ["'"] = false,
        ['`'] = false,
      },
    },
  },
}

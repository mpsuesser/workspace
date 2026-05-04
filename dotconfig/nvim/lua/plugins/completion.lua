-- Completion: blink.cmp

return {
  {
    'saghen/blink.cmp',
    version = '*',
    event = 'InsertEnter',
    dependencies = {
      'rafamadriz/friendly-snippets',
    },
    opts = {
      keymap = {
        preset = 'default',
        -- Keep blink's defaults, but make Tab accept the selected completion.
        -- Enter is intentionally unmapped so it keeps normal newline behavior.
        ['<Tab>'] = { 'select_and_accept', 'snippet_forward', 'fallback' },
      },
      sources = {
        default = { 'lsp', 'path', 'snippets', 'buffer' },
      },
      completion = {
        accept = {
          auto_brackets = { enabled = true },
        },
        list = {
          selection = { preselect = true, auto_insert = false },
        },
        menu = {
          border = 'rounded',
          draw = {
            columns = {
              { 'kind_icon' },
              { 'label', 'label_description', gap = 1 },
            },
          },
        },
        documentation = {
          auto_show = true,
          auto_show_delay_ms = 200,
          window = {
            border = 'rounded',
          },
        },
      },
      signature = {
        enabled = true,
        window = {
          border = 'rounded',
        },
      },
      appearance = {
        use_nvim_cmp_as_default = false,
        nerd_font_variant = 'mono',
      },
    },
  },
}

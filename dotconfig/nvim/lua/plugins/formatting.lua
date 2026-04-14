-- Formatting: conform.nvim

local dprint_config = vim.fn.expand('~/.config/dprint/dprint.jsonc')

return {
  {
    'stevearc/conform.nvim',
    event = { 'BufWritePre' },
    cmd = { 'ConformInfo' },
    keys = {
      {
        '<leader>lf',
        function()
          require('conform').format({ async = true, lsp_format = 'fallback' })
        end,
        mode = 'n',
        desc = 'Format buffer',
      },
    },
    opts = {
      notify_on_error = true,
      notify_no_formatters = false,
      format_on_save = function(bufnr)
        if vim.bo[bufnr].buftype ~= '' then
          return
        end

        return {
          timeout_ms = 500,
          lsp_format = 'fallback',
        }
      end,
      formatters = {
        dprint_global = {
          command = 'dprint',
          args = { 'fmt', '--config', dprint_config, '--stdin', '$FILENAME' },
          stdin = true,
          condition = function(_, ctx)
            return not ctx.filename:match('%.mdx?$')
          end,
        },
      },
      formatters_by_ft = {
        lua = { 'stylua' },
        javascript = { 'dprint_global' },
        javascriptreact = { 'dprint_global' },
        typescript = { 'dprint_global' },
        typescriptreact = { 'dprint_global' },
        json = { 'dprint_global' },
        jsonc = { 'dprint_global' },
        yaml = { 'dprint_global' },
        toml = { 'dprint_global' },
        kdl = { 'dprint_global' },
        python = { 'dprint_global' },
        html = { 'dprint_global' },
        css = { 'dprint_global' },
        scss = { 'dprint_global' },
        bash = { 'shfmt' },
        sh = { 'shfmt' },
        zsh = { 'shfmt' },
        go = { 'goimports', 'gofmt' },
        rust = { 'rustfmt' },
      },
    },
  },
}

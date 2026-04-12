-- Formatting: conform.nvim

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
      format_on_save = function(bufnr)
        if vim.bo[bufnr].buftype ~= '' then
          return
        end

        return {
          timeout_ms = 500,
          lsp_format = 'fallback',
        }
      end,
      formatters_by_ft = {
        lua = { 'stylua' },
        javascript = { 'oxfmt', 'prettierd', 'prettier' },
        javascriptreact = { 'oxfmt', 'prettierd', 'prettier' },
        typescript = { 'oxfmt', 'prettierd', 'prettier' },
        typescriptreact = { 'oxfmt', 'prettierd', 'prettier' },
        json = { 'oxfmt', 'prettierd', 'prettier' },
        jsonc = { 'oxfmt', 'prettierd', 'prettier' },
        yaml = { 'prettierd', 'prettier' },
        html = { 'oxfmt', 'prettierd', 'prettier' },
        css = { 'oxfmt', 'prettierd', 'prettier' },
        scss = { 'oxfmt', 'prettierd', 'prettier' },
        bash = { 'shfmt' },
        sh = { 'shfmt' },
        zsh = { 'shfmt' },
        toml = { 'taplo' },
        go = { 'goimports', 'gofmt' },
        rust = { 'rustfmt' },
        python = { 'ruff_format', 'black' },
      },
    },
  },
}

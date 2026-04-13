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
        javascript = { 'prettierd', 'prettier' },
        javascriptreact = { 'prettierd', 'prettier' },
        typescript = { 'prettierd', 'prettier' },
        typescriptreact = { 'prettierd', 'prettier' },
        json = { 'prettierd', 'prettier' },
        jsonc = { 'prettierd', 'prettier' },
        yaml = { 'prettierd', 'prettier' },
        html = { 'prettierd', 'prettier' },
        css = { 'prettierd', 'prettier' },
        scss = { 'prettierd', 'prettier' },
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

-- LSP configuration: nvim-lspconfig + mason

return {
  -- Mason: portable package manager for LSP servers, linters, formatters
  {
    'williamboman/mason.nvim',
    cmd = 'Mason',
    opts = {
      ui = {
        border = 'rounded',
      },
    },
  },

  -- Bridge between mason and lspconfig
  {
    'williamboman/mason-lspconfig.nvim',
    dependencies = { 'williamboman/mason.nvim' },
    opts = {
      -- Servers are installed on-demand via :Mason
      automatic_installation = false,
    },
  },

  -- LSP config
  {
    'neovim/nvim-lspconfig',
    event = { 'BufReadPre', 'BufNewFile' },
    dependencies = {
      'williamboman/mason.nvim',
      'williamboman/mason-lspconfig.nvim',
    },
    config = function()
      -- Diagnostic config (Helix: end-of-line-diagnostics = "hint",
      -- inline-diagnostics.cursor-line = "warning")
      vim.diagnostic.config({
        virtual_text = {
          severity = { min = vim.diagnostic.severity.HINT },
          spacing = 4,
        },
        virtual_lines = false,
        signs = true,
        underline = true,
        update_in_insert = false,
        severity_sort = true,
        float = {
          border = 'rounded',
          source = true,
        },
      })

      -- LSP keymaps (set on attach)
      vim.api.nvim_create_autocmd('LspAttach', {
        group = vim.api.nvim_create_augroup('LspKeymaps', { clear = true }),
        callback = function(event)
          local buf = event.buf
          local function bmap(mode, lhs, rhs, desc)
            vim.keymap.set(mode, lhs, rhs, { buffer = buf, desc = 'LSP: ' .. desc })
          end

          bmap('n', 'gd', vim.lsp.buf.definition, 'Go to definition')
          bmap('n', 'gD', vim.lsp.buf.declaration, 'Go to declaration')
          bmap('n', 'gi', vim.lsp.buf.implementation, 'Go to implementation')
          bmap('n', 'gr', vim.lsp.buf.references, 'References')
          bmap('n', 'gt', vim.lsp.buf.type_definition, 'Type definition')
          bmap('n', '<leader>r', vim.lsp.buf.rename, 'Rename')
          bmap('n', '<leader>ca', vim.lsp.buf.code_action, 'Code action')
          bmap('n', '<leader>h', vim.lsp.buf.hover, 'Hover info')
          bmap('n', '[d', function() vim.diagnostic.jump({ count = -1 }) end, 'Prev diagnostic')
          bmap('n', ']d', function() vim.diagnostic.jump({ count = 1 }) end, 'Next diagnostic')
        end,
      })

      -- Setup servers that are installed
      -- Users should install servers via :Mason and add them here
      local lspconfig = require('lspconfig')
      local capabilities = vim.lsp.protocol.make_client_capabilities()

      -- Try to enhance capabilities with blink.cmp if available
      local ok, blink = pcall(require, 'blink.cmp')
      if ok then
        capabilities = blink.get_lsp_capabilities(capabilities)
      end

      -- Auto-setup any mason-installed servers
      -- mason-lspconfig populates a list; we iterate and configure each
      local installed = require('mason-lspconfig').get_installed_servers()
      for _, server_name in ipairs(installed) do
        lspconfig[server_name].setup({
          capabilities = capabilities,
        })
      end

      -- Add server-specific overrides here:
      -- lspconfig.lua_ls.setup({
      --   capabilities = capabilities,
      --   settings = {
      --     Lua = {
      --       workspace = { checkThirdParty = false },
      --       telemetry = { enable = false },
      --     },
      --   },
      -- })
    end,
  },
}

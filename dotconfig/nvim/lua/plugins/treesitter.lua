-- Treesitter: syntax highlighting and text objects

return {
  {
    'nvim-treesitter/nvim-treesitter',
    build = ':TSUpdate',
    event = { 'BufReadPost', 'BufNewFile' },
    config = function()
      -- Enable treesitter highlighting for supported filetypes
      vim.api.nvim_create_autocmd('FileType', {
        group = vim.api.nvim_create_augroup('TreesitterSetup', { clear = true }),
        callback = function()
          pcall(vim.treesitter.start)
        end,
      })

      -- Install parsers via :TSInstall or :TSUpdate
      -- To install all desired parsers at once, run:
      --   :TSInstall bash c css diff go html javascript json lua luadoc
      --     markdown markdown_inline python query regex rust toml tsx
      --     typescript vim vimdoc yaml
    end,
  },
}

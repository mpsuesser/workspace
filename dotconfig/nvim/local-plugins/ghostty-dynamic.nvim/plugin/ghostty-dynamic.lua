-- ghostty-dynamic.nvim
-- Pre-load Ghostty background to reduce startup flash before full theme setup.

local ok, bg = pcall(function()
  return require('ghostty-dynamic.config').get_background_color()
end)

if ok and bg then
  vim.api.nvim_set_hl(0, 'Normal', { bg = bg })
end

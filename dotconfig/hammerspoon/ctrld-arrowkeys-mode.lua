-- ~/.hammerspoon/init.lua
-- WASD↔︎Arrow software swap with a reliable toggle and clear ON-state badge.
-- Toggle: Ctrl+D. Failsafe OFF: Ctrl+Alt+Cmd+Shift+Esc.

local TOGGLE_MODS, TOGGLE_KEY = { "ctrl" }, "d"
local SOURCE_TAG = 0x1337 -- tag synthetic events to avoid re-handling

local log = hs.logger.new("wasd", "info")
local kc = hs.keycodes.map

local active = false
local tap = nil
local badge = nil
local screenWatcher = nil
local placeTimer = nil

-- ---------- Badge ----------
local function badgeFrameFor(screen)
  local f = screen:fullFrame()
  local w, h, m = 240, 64, 14
  return { x = f.x + f.w - w - m, y = f.y + m, w = w, h = h }
end

local function ensureBadge()
  if badge then return end
  badge = hs.canvas.new(badgeFrameFor(hs.mouse.getCurrentScreen()))
  badge:level(hs.canvas.windowLevels.overlay)

  badge[1] = {
    id = "bg",
    type = "rectangle",
    roundedRectRadii = { xRadius = 14, yRadius = 14 },
    fillColor = { red = 0.15, green = 0.65, blue = 0.25, alpha = 0.93 },
    strokeColor = { white = 1.0, alpha = 0.2 },
    strokeWidth = 1
  }
  badge[2] = {
    id = "label",
    type = "text",
    text = "WASD → Arrows (ON)",
    textSize = 18,
    textColor = { white = 1.0, alpha = 0.96 },
    textAlignment = "center",
    frame = { x = "5%", y = "12%", w = "90%", h = "40%" }
  }
  badge[3] = {
    id = "sub",
    type = "text",
    text = "Ctrl+D to disable",
    textSize = 12,
    textColor = { white = 1.0, alpha = 0.75 },
    textAlignment = "center",
    frame = { x = "5%", y = "54%", w = "90%", h = "36%" }
  }
end

local function placeBadge()
  if badge then badge:frame(badgeFrameFor(hs.mouse.getCurrentScreen())) end
end

local function showBadge()
  ensureBadge()
  badge:show()
  if not screenWatcher then
    screenWatcher = hs.screen.watcher.new(placeBadge)
    screenWatcher:start()
  end
  if not placeTimer then
    placeTimer = hs.timer.doEvery(0.5, function() if active then placeBadge() end end)
  end
end

local function hideBadge()
  if placeTimer then placeTimer:stop(); placeTimer = nil end
  if screenWatcher then screenWatcher:stop(); screenWatcher = nil end
  if badge then badge:delete(); badge = nil end
end

-- ---------- Mapping ----------
local function handleEvent(e)
  -- Synthetic? ignore.
  if e:getProperty(hs.eventtap.event.properties.eventSourceUserData) == SOURCE_TAG then
    return false
  end

  local t = e:getType()
  if t ~= hs.eventtap.event.types.keyDown and t ~= hs.eventtap.event.types.keyUp then
    return false
  end

  local code = e:getKeyCode()
  local mods = e:getFlags()
  local isDown = (t == hs.eventtap.event.types.keyDown)

  -- Ensure the toggle chord always passes through:
  if mods.ctrl and (code == kc.d) then return false end

  -- Don’t remap when Ctrl/Alt/Cmd are held (prevents hotkey starvation and preserves app shortcuts)
  if mods.ctrl or mods.alt or mods.cmd then return false end

  -- Map WASD <-> arrows, preserving Shift (so selection still works)
  local target = nil
  if     code == kc.w     then target = "up"
  elseif code == kc.a     then target = "left"
  elseif code == kc.s     then target = "down"
  elseif code == kc.d     then target = "right"
  elseif code == kc.up    then target = "w"
  elseif code == kc.left  then target = "a"
  elseif code == kc.down  then target = "s"
  elseif code == kc.right then target = "d"
  end
  if not target then return false end

  local ne = hs.eventtap.event.newKeyEvent(mods, target, isDown)
  ne:setProperty(hs.eventtap.event.properties.eventSourceUserData, SOURCE_TAG)
  ne:post()
  return true -- swallow original
end

local function startMapper()
  if tap then tap:stop(); tap = nil end
  tap = hs.eventtap.new({ hs.eventtap.event.types.keyDown, hs.eventtap.event.types.keyUp }, handleEvent)
  tap:start()
  active = true
  showBadge()
  log.i("WASD swap ON")
end

local function stopMapper()
  if tap then tap:stop(); tap = nil end
  active = false
  hideBadge()
  log.i("WASD swap OFF")
end

local function toggle()
  if active then stopMapper() else startMapper() end
end

-- Primary toggle: Ctrl+D
hs.hotkey.bind(TOGGLE_MODS, TOGGLE_KEY, toggle)

-- Failsafe OFF (works even if something captures the main hotkey)
hs.hotkey.bind({ "ctrl", "alt", "cmd", "shift" }, "escape", stopMapper)

-- Start OFF
stopMapper()

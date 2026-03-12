-- Enable IPC for CLI communication
require("hs.ipc")

-- Global function for displaying notifications from TypeScript
function showNotification(title, body)
    local notification = hs.notify.new({
        title = title,
        informativeText = body or ""
    })
    notification:send()
end

-- Dialog functions for user interaction
function showBlockingDialog(resultFile, message, informativeText, buttonOne, buttonTwo, style)
    hs.timer.doAfter(0.01, function()
        local button = hs.dialog.blockAlert(
            message,
            informativeText or "",
            buttonOne or "OK",
            buttonTwo or "",
            style or "informational"
        )
        local file = io.open(resultFile, "w")
        if file then
            -- Write as JSON string by manually quoting (hs.json.encode expects table, not string)
            file:write('"' .. (button or ""):gsub('"', '\\"') .. '"')
            file:close()
        end
    end)
    return "OK"
end

function showTextPromptDialog(resultFile, message, informativeText, defaultText, buttonOne, buttonTwo, secureField)
    -- Run dialog asynchronously and write result to file
    hs.timer.doAfter(0.01, function()
        local button, text = hs.dialog.textPrompt(
            message,
            informativeText or "",
            defaultText or "",
            buttonOne or "OK",
            buttonTwo or "Cancel",
            secureField or false
        )
        -- Write result to file when dialog completes
        local result = hs.json.encode({
            button = button or "",
            text = text or ""
        })
        local file = io.open(resultFile, "w")
        if file then
            file:write(result)
            file:close()
        end
    end)
    return "OK" -- Return immediately so CLI doesn't hang
end

-- This helper function is unchanged
local function shallowcopy(original_table)
    local new_table = {}
    for key, value in pairs(original_table) do
        new_table[key] = value
    end
    return new_table
end

-- Updated function to accept an optional appName
local function createModifierPreservingRemap(originalKey, newKey, appName)
    local modifierSets = {
        {},
        { "shift" }, { "alt" }, { "ctrl" },
        { "shift", "alt" }, { "shift", "ctrl" }, { "alt", "ctrl" },
        { "shift", "alt", "ctrl" }
    }

    for _, mods in ipairs(modifierSets) do
        local triggerMods = shallowcopy(mods)
        table.insert(triggerMods, "cmd")

        hs.hotkey.bind(triggerMods, originalKey, function()
            -- Check if the remap should apply
            -- It applies if:
            --   1. No appName was given (it's a global remap)
            --   2. An appName was given AND it matches the focused window's application name
            local focusedApp = hs.window.focusedWindow() and hs.window.focusedWindow():application()
            if not appName or (focusedApp and focusedApp:name() == appName) then
                -- App matches (or it's global), perform the remap
                hs.eventtap.keyStroke(mods, newKey)
            else
                -- App does not match, so "pass through" the original keypress
                -- We have to re-post the event because hs.hotkey.bind consumes it
                hs.eventtap.keyStroke(triggerMods, originalKey)
            end
        end)
    end
end

-- createModifierPreservingRemap('q', 'F3')
-- createModifierPreservingRemap("[", "F5")
-- createModifierPreservingRemap("]", "F6")

-- these only work when Ghostty is the active window
-- createModifierPreservingRemap('-', 'F9', 'Ghostty')
-- createModifierPreservingRemap('=', 'F10', 'Ghostty')

-- hs.grid.setGrid('3x3')
-- hs.grid.setMargins(hs.geometry.size(0,0)) -- no spacing between cells

-- Define a hotkey to show the grid overlay
-- hs.hotkey.bind({'cmd', 'shift'}, 'o', function()
--     hs.grid.show()
-- end)

-- Toggle focus for 'ooo' Safari web app with Cmd+X
local previousApp = nil
-- hs.hotkey.bind({'cmd'}, 'x', function()
--   local currentApp = hs.application.frontmostApplication()
--   if currentApp and currentApp:name() == 'ooo' then
--     -- Currently focused on ooo, switch back to previous app
--     if previousApp and previousApp:isRunning() then
--       previousApp:activate()
--     end
--   else
--     -- Not focused on ooo, save current app and switch to ooo
--     previousApp = currentApp
--     hs.application.open('/Users/m/Applications/ooo.app')
--   end
-- end)

-- Track focused app name in a variable (updated by appWatcher below).
-- The eventtap checks this instead of calling hs.window.focusedWindow() which
-- hits the accessibility API on every keypress and can cause macOS to kill the tap.
local currentAppName = (hs.window.focusedWindow() and hs.window.focusedWindow():application():name()) or ""

-- Cmd+WASD -> arrow keys (Tana only, exact Cmd modifier)
-- Uses eventtap so non-Tana keypresses pass through unmodified (no re-emission)
local wasdToArrow = {
    [hs.keycodes.map.w] = hs.keycodes.map.up,
    [hs.keycodes.map.a] = hs.keycodes.map.left,
    [hs.keycodes.map.s] = hs.keycodes.map.down,
    [hs.keycodes.map.d] = hs.keycodes.map.right,
}

local tanaWasdTap = hs.eventtap.new(
    { hs.eventtap.event.types.keyDown, hs.eventtap.event.types.keyUp },
    function(event)
        local flags = event:getFlags()
        if not (flags.cmd and not flags.shift and not flags.alt and not flags.ctrl) then
            return false
        end

        local arrowKey = wasdToArrow[event:getKeyCode()]
        if not arrowKey then
            return false
        end

        if currentAppName ~= 'Tana' then
            return false
        end

        local isDown = event:getType() == hs.eventtap.event.types.keyDown
        return true, { hs.eventtap.event.newKeyEvent({}, arrowKey, isDown) }
    end
)
tanaWasdTap:start()

-- Watchdog: macOS can silently disable event taps. Re-enable if that happens.
hs.timer.doEvery(2, function()
    if not tanaWasdTap:isEnabled() then
        print("[watchdog] tanaWasdTap was disabled, re-enabling")
        tanaWasdTap:start()
    end
end)

-- Toggle focus for 'Tana' app with Cmd+F8
local previousAppTana = nil
hs.hotkey.bind({ 'cmd' }, 'f8', function()
    local currentApp = hs.application.frontmostApplication()
    if currentApp and currentApp:name() == 'Tana' then
        -- Currently focused on Tana, switch back to previous app
        if previousAppTana and previousAppTana:isRunning() then
            previousAppTana:activate()
        end
    else
        -- Not focused on Tana, save current app and switch to Tana
        previousAppTana = currentApp
        hs.application.launchOrFocus('Tana')
    end
end)

-- Toggle focus for 'Zed' app with F8
-- local previousAppZed = nil
-- hs.hotkey.bind({}, 'f8', function()
--     local currentApp = hs.application.frontmostApplication()
--     if currentApp and currentApp:name() == 'Zed' then
--         -- Currently focused on Zed, switch back to previous app
--         if previousAppZed and previousAppZed:isRunning() then
--             previousAppZed:activate()
--         end
--     else
--         -- Not focused on Zed, save current app and switch to Zed
--         previousAppZed = currentApp
--         hs.application.launchOrFocus('Zed')
--     end
-- end)

--------------------------------------------------------------------------------
-- IPC: Dynamic hotkey registry (for TypeScript binding)
--------------------------------------------------------------------------------
local dynamicHotkeys = {}

function registerHotkey(id, mods, key)
    if dynamicHotkeys[id] then
        dynamicHotkeys[id]:delete()
    end
    dynamicHotkeys[id] = hs.hotkey.bind(mods, key, function()
        local file = io.open("/tmp/hs-hotkey-" .. id .. ".trigger", "w")
        if file then file:write(tostring(os.time())); file:close() end
    end)
    return hs.json.encode({ ok = true, id = id })
end

function unregisterHotkey(id)
    if dynamicHotkeys[id] then
        dynamicHotkeys[id]:delete()
        dynamicHotkeys[id] = nil
    end
    return hs.json.encode({ ok = true })
end

function listDynamicHotkeys()
    local ids = {}
    for id, _ in pairs(dynamicHotkeys) do
        table.insert(ids, id)
    end
    return hs.json.encode(ids)
end

--------------------------------------------------------------------------------
-- IPC: App focus watcher (writes current app to file for TypeScript polling)
--------------------------------------------------------------------------------
local contextFile = "/tmp/hs-context.json"

local appWatcher = hs.application.watcher.new(function(appName, eventType, app)
    if eventType == hs.application.watcher.activated then
        currentAppName = appName or ""
        local data = hs.json.encode({
            app = appName or "",
            bundleID = (app and app:bundleID()) or "",
            timestamp = os.time()
        })
        local file = io.open(contextFile, "w")
        if file then file:write(data); file:close() end
    end
end)
appWatcher:start()

-- F8, then a target key. Fixed positions make the menu learnable by muscle memory.
local M = {}

M.bindings = {
    { key = "`", label = "`", name = "Ghostty", bundleID = "com.mitchellh.ghostty", angle = 210 },
    { key = "space", label = "␣", name = "T3 Code", bundleID = "com.t3tools.t3code", angle = 90 },
    { key = "a", label = "A", name = "Curation Space Admin", bundleID = "com.google.Chrome.app.ibioofnnpndfmiedpmogibjlnljpfebh", angle = 150 },
    { key = "d", label = "D", name = "Google Chrome", bundleID = "com.google.Chrome", angle = 30 },
    { key = "l", label = "L", name = "Linear", bundleID = "com.linear", angle = -30 },
    { key = "q", label = "Q", name = "Rex Beta", bundleID = "com.superlogical.rex", angle = -90 }
}

-- Inject the Hammerspoon API to test the state machine without a desktop.
function M.new(api)
    local switcher = {}
    local aerospacePath = "/opt/homebrew/bin/aerospace"
    local recoveryKey = "desktopSwitcher.returnWorkspace"
    local log = api.logger.new("app-switcher", "info")
    local session, canvas, tap, screenWatcher, spacesWatcher
    local processes, consumedKeys, icons, targetsByCode = {}, {}, {}, {}
    local hitRegions, clickedTarget = {}, nil
    local settle

    local function alert(message)
        log.e(message)
        api.alert.show(message)
    end

    -- Never wait for a subprocess (or call Accessibility) in the keyboard tap.
    local function run(path, args, callback)
        local task, timeout
        local completed = false
        local function complete(code, stdout, stderr)
            if completed then return end
            completed = true
            if timeout then timeout:stop() end
            if task then processes[task] = nil end
            callback(code, stdout or "", stderr or "")
        end
        task = api.task.new(path, complete, args)
        if not task or not task:start() then
            complete(-1, "", "Could not start " .. path)
            return
        end
        if completed then return end
        timeout = api.timer.doAfter(3, function()
            task:setCallback(nil):terminate()
            complete(-1, "", "Timed out: " .. table.concat(args, " "))
        end)
        processes[task] = timeout
    end

    local function aerospace(args, callback)
        run(aerospacePath, args, callback)
    end

    local function decodeRows(output)
        local ok, rows = pcall(api.json.decode, output)
        if ok and type(rows) == "table" then return rows end
        return nil
    end

    local function hide()
        hitRegions = {}
        if canvas then canvas:hide() end
    end

    local function release(current, clearRecovery)
        if session ~= current then return end
        hide()
        session = nil
        if clearRecovery then api.settings.clear(recoveryKey) end
    end

    local function restore(current, refocus, callback)
        if not current.origin then callback(true); return end
        aerospace({ "workspace", current.origin.workspace }, function(code, _, stderr)
            if session ~= current then return end
            if code ~= 0 then
                alert("Could not restore the desktop: " .. stderr)
                callback(false)
                return
            end
            if refocus and current.windowID then
                aerospace({ "focus", "--window-id", tostring(current.windowID) }, function()
                    if session == current then callback(true) end
                end)
            else
                callback(true)
            end
        end)
    end

    local function launch(current, target)
        -- Restore first: a new/reopened window must never land in launcher.
        restore(current, false, function(restored)
            if not restored then release(current, false); return end
            run("/usr/bin/open", { "-b", target.bundleID }, function(code, _, stderr)
                if session ~= current then return end
                if code ~= 0 then alert("Could not open " .. target.name .. ": " .. stderr) end
                release(current, true)
            end)
        end)
    end

    local function focusTarget(current, target, windows)
        local app = api.application.get(target.bundleID)
        local preferred = app and (app:focusedWindow() or app:mainWindow())
        local preferredID = preferred and preferred:id()
        local destination
        for _, window in ipairs(windows) do
            if type(window) == "table" and window["app-bundle-id"] == target.bundleID
                and type(window["window-id"]) == "number" and type(window["monitor-id"]) == "number" then
                destination = destination or window
                if window["window-id"] == preferredID then destination = window; break end
            end
        end
        if not destination then launch(current, target); return end

        local function focus()
            aerospace({ "focus", "--window-id", tostring(destination["window-id"]) }, function(code)
                if session ~= current then return end
                if code == 0 then release(current, true) else launch(current, target) end
            end)
        end
        if destination["monitor-id"] == current.origin.monitorID then
            focus()
        else
            -- Do not leave the source display stranded on the empty workspace.
            restore(current, false, function(restored)
                if restored then focus() else release(current, false) end
            end)
        end
    end

    settle = function(current)
        if session ~= current or current.phase ~= "ready" or not current.choice then return end
        current.phase = "closing"
        hide()
        if current.choice == "cancel" then
            restore(current, not current.preserveClickedFocus, function(restored) release(current, restored) end)
            return
        end
        local target = current.choice
        aerospace({ "list-windows", "--all", "--format", "%{window-id} %{app-bundle-id} %{monitor-id}", "--json" }, function(code, stdout, stderr)
            if session ~= current then return end
            local windows = code == 0 and decodeRows(stdout)
            if not windows then
                alert("Could not read app windows: " .. stderr)
                restore(current, true, function(restored) release(current, restored) end)
                return
            end
            focusTarget(current, target, windows)
        end)
    end

    function switcher.select(key)
        if not session or session.phase == "closing" or session.choice then return end
        for _, target in ipairs(M.bindings) do
            if target.key == key then
                session.choice = target
                settle(session)
                return
            end
        end
    end

    function switcher.cancel()
        if not session or session.phase == "closing" then return end
        session.choice = "cancel"
        settle(session)
    end

    local function show(current)
        local frame = current.screen:frame()
        if canvas then canvas:delete() end
        canvas = api.canvas.new(frame)
        if not canvas then
            alert("Could not draw the desktop switcher")
            switcher.cancel()
            return
        end
        canvas:level(api.canvas.windowLevels.overlay)
        canvas:behavior({ "canJoinAllSpaces", "stationary", "ignoresCycle", "fullScreenAuxiliary" })
        canvas:clickActivating(false)
        local centerX, centerY = frame.w / 2, frame.h / 2
        local iconRadius = math.min(245, (frame.w - 100) / 2, (frame.h - 100) / 2)
        local keyRadius = iconRadius * 0.53
        local elements = {}
        hitRegions = {}
        local function append(target, element)
            table.insert(elements, element)
            table.insert(hitRegions, {
                target = target,
                x = frame.x + element.frame.x, y = frame.y + element.frame.y,
                w = element.frame.w, h = element.frame.h
            })
        end
        for _, target in ipairs(M.bindings) do
            local radians = math.rad(target.angle)
            local directionX, directionY = math.cos(radians), math.sin(radians)
            local iconX, iconY = centerX + iconRadius * directionX, centerY + iconRadius * directionY
            local keyX, keyY = centerX + keyRadius * directionX, centerY + keyRadius * directionY
            if icons[target.bundleID] then
                append(target, {
                    id = "app:" .. target.key, type = "image", image = icons[target.bundleID],
                    frame = { x = iconX - 38, y = iconY - 38, w = 76, h = 76 }
                })
            end
            local keyWidth = target.key == "space" and 58 or 46
            append(target, {
                id = "key:" .. target.key, type = "rectangle", action = "strokeAndFill",
                frame = { x = keyX - keyWidth / 2, y = keyY - 23, w = keyWidth, h = 46 },
                roundedRectRadii = { xRadius = 9, yRadius = 9 },
                fillColor = { white = 0.055, alpha = 0.98 },
                strokeColor = { white = 0.6, alpha = 0.55 }, strokeWidth = 1
            })
            table.insert(elements, {
                id = "key-face:" .. target.key, type = "rectangle", action = "strokeAndFill",
                frame = { x = keyX - keyWidth / 2 + 3, y = keyY - 20, w = keyWidth - 6, h = 36 },
                roundedRectRadii = { xRadius = 6, yRadius = 6 },
                fillColor = { white = 0.19, alpha = 0.98 },
                strokeColor = { white = 0.65, alpha = 0.35 }, strokeWidth = 0.75
            })
            table.insert(elements, {
                id = "legend:" .. target.key, type = "text", text = target.label,
                textFont = "Menlo", textSize = 21,
                textColor = { white = 0.96 }, textAlignment = "center",
                frame = { x = keyX - keyWidth / 2, y = keyY - 17, w = keyWidth, h = 30 }
            })
        end
        canvas:replaceElements(elements)
        -- No canvas mouse callbacks: the entire transparent window is click-through.
        -- The event tap only intercepts clicks on visible icons/keycaps, not the
        -- desktop or system permission dialogs behind the empty center.
        canvas:show()
    end

    local function mouseEvent(event, eventType)
        local types = api.eventtap.event.types
        if eventType == types.leftMouseUp and clickedTarget then
            local clicked = clickedTarget
            clickedTarget = nil
            if session == clicked.session then switcher.select(clicked.target.key) end
            return true
        end
        if not session then return false end
        if eventType == types.leftMouseUp or eventType == types.rightMouseUp or eventType == types.otherMouseUp then
            local current = session
            if current.clickCancelTimer then current.clickCancelTimer:stop() end
            -- Let the original mouse-up reach the button before restoring the
            -- workspace, and do not steal focus back from a permission dialog.
            current.preserveClickedFocus = true
            current.clickCancelTimer = api.timer.doAfter(0.01, function()
                if session == current then switcher.cancel() end
            end)
            return false
        end
        if eventType == types.leftMouseDown and session.phase == "ready" then
            local point = event:getLocation()
            for _, region in ipairs(hitRegions) do
                if point.x >= region.x and point.x <= region.x + region.w
                    and point.y >= region.y and point.y <= region.y + region.h then
                    clickedTarget = { target = region.target, session = session }
                    return true
                end
            end
        end
        return false
    end

    local function capture(current, attempt)
        aerospace({ "list-workspaces", "--focused", "--format", "%{workspace} %{monitor-id}", "--json" }, function(code, stdout, stderr)
            if session ~= current then return end
            if code ~= 0 and current.startedAeroSpace and attempt < 15 then
                current.retryTimer = api.timer.doAfter(0.1, function() capture(current, attempt + 1) end)
                return
            end
            local rows = code == 0 and decodeRows(stdout)
            local origin = rows and rows[1]
            if type(origin) ~= "table" or type(origin.workspace) ~= "string" or type(origin["monitor-id"]) ~= "number" then
                alert("Could not read the current AeroSpace workspace: " .. stderr)
                release(current, false)
                return
            end
            if origin.workspace == "launcher" then
                if current.recovered then
                    alert("Could not leave the launcher workspace")
                    release(current, false)
                    return
                end
                current.recovered = true
                local previous = api.settings.get(recoveryKey)
                if type(previous) ~= "string" or previous == "launcher" or previous == "" then previous = "main" end
                aerospace({ "workspace", previous }, function(restoreCode)
                    if session ~= current then return end
                    if restoreCode == 0 then
                        api.settings.clear(recoveryKey)
                        current.windowID = nil
                        capture(current, 15)
                    else
                        alert("Could not leave the launcher workspace")
                        release(current, false)
                    end
                end)
                return
            end
            if current.choice == "cancel" then release(current, true); return end
            current.origin = { workspace = origin.workspace, monitorID = origin["monitor-id"] }
            aerospace({ "list-windows", "--workspace", "launcher", "--count" }, function(emptyCode, count)
                if session ~= current then return end
                if emptyCode ~= 0 or tonumber(count) ~= 0 then
                    alert("The reserved launcher workspace is not empty; switching cancelled")
                    release(current, true)
                    return
                end
                if current.choice == "cancel" then release(current, true); return end
                api.settings.set(recoveryKey, origin.workspace)
                aerospace({ "summon-workspace", "launcher" }, function(summonCode, _, summonError)
                    if session ~= current then return end
                    current.phase = "ready"
                    if summonCode ~= 0 then
                        alert("Could not show the desktop: " .. summonError)
                        current.choice = "cancel"
                    end
                    if current.choice then settle(current) else show(current) end
                end)
            end)
        end)
    end

    local function begin(current)
        if session ~= current then return end
        if current.choice == "cancel" then release(current, false); return end
        local window = api.window.focusedWindow()
        if window and window:isFullScreen() then
            alert("Leave macOS native fullscreen to use the desktop switcher")
            release(current, false)
            return
        end
        current.windowID = window and window:id()
        current.screen = window and window:screen() or api.screen.mainScreen()
        if api.application.get("bobko.aerospace") then
            capture(current, 0)
        else
            current.startedAeroSpace = true
            run("/usr/bin/open", { "-g", "-b", "bobko.aerospace" }, function(code, _, stderr)
                if session ~= current then return end
                if code == 0 then capture(current, 0) else
                    alert("Could not start AeroSpace: " .. stderr)
                    release(current, false)
                end
            end)
        end
    end

    function switcher.toggle()
        if session then switcher.cancel(); return end
        session = { phase = "opening" }
        local current = session
        -- Reserve immediately so a fast F8 + letter sequence is buffered safely.
        -- A zero-delay hs.timer is parked, not a next-run-loop callback.
        current.beginTimer = api.timer.doAfter(0.001, function() begin(current) end)
    end

    function switcher.status()
        return session and session.phase or "idle"
    end

    function switcher.start()
        if tap then return end
        for _, target in ipairs(M.bindings) do
            targetsByCode[api.keycodes.map[target.key]] = target
            icons[target.bundleID] = api.image.imageFromAppBundle(target.bundleID)
        end
        local types = api.eventtap.event.types
        tap = api.eventtap.new({
            types.keyDown, types.keyUp, types.leftMouseDown, types.leftMouseUp,
            types.rightMouseDown, types.rightMouseUp, types.otherMouseDown, types.otherMouseUp
        }, function(event)
            local eventType = event:getType()
            if eventType ~= types.keyDown and eventType ~= types.keyUp then
                return mouseEvent(event, eventType)
            end
            local code = event:getKeyCode()
            if eventType == types.keyUp then
                if consumedKeys[code] then consumedKeys[code] = nil; return true end
                return false
            end
            -- Swallow repeats through key-up, even after focus has changed.
            if consumedKeys[code] then return true end
            local flags = event:getFlags()
            -- Physical function keys can carry fn; remapped Caps Lock does not.
            local unmodified = not (flags.cmd or flags.ctrl or flags.alt or flags.shift)
            if code == api.keycodes.map.f8 and unmodified then
                consumedKeys[code] = true
                switcher.toggle()
                return true
            end
            if not session then return false end
            consumedKeys[code] = true
            if code == api.keycodes.map.escape then switcher.cancel()
            elseif unmodified and targetsByCode[code] then switcher.select(targetsByCode[code].key) end
            -- Unbound keys cannot leak into Finder while the palette is open.
            return true
        end):start()
        screenWatcher = api.screen.watcher.new(switcher.cancel):start()
        spacesWatcher = api.spaces.watcher.new(switcher.cancel):start()
    end

    function switcher.stop()
        if tap then tap:stop(); tap = nil end
        if screenWatcher then screenWatcher:stop(); screenWatcher = nil end
        if spacesWatcher then spacesWatcher:stop(); spacesWatcher = nil end
        if session and session.beginTimer then session.beginTimer:stop() end
        if session and session.retryTimer then session.retryTimer:stop() end
        if session and session.clickCancelTimer then session.clickCancelTimer:stop() end
        for task, timeout in pairs(processes) do
            timeout:stop()
            task:setCallback(nil):terminate()
        end
        processes = {}
        if canvas then canvas:delete(); canvas = nil end
        if session and session.origin then
            -- Reload destroys Lua callbacks: this is the only synchronous boundary.
            -- Keep recovery state if restoration fails so the next F8 can recover.
            local quoted = "'" .. session.origin.workspace:gsub("'", "'\\''") .. "'"
            local _, ok = api.execute(aerospacePath .. " workspace " .. quoted)
            if ok then api.settings.clear(recoveryKey) end
        end
        session = nil
        consumedKeys = {}
        clickedTarget = nil
    end

    return switcher
end

return M

import AppKit
import ApplicationServices
import OSLog
import QuickSwitchCore

@MainActor final class SwitcherController {
    let input = InputMonitor()
    let palette = PalettePanel()
    var report: (String) -> Void = { _ in }
    private let aerospace = AeroSpace()
    private let windowFocus = WindowFocus()
    private let log = Logger(subsystem: "local.quickswitch", category: "switcher")
    private var state = SelectionState()
    private var snapshot: DesktopSnapshot?
    private var sourceWindow: ManagedWindow?
    private var revealed = false
    private var preserveClickedFocus = false
    private var preferred: [String: Int] = [:]
    private var session = UUID()
    private var operation: Task<Void, Never>?
    private let recoveryKey = "returnWorkspace"

    init() {
        input.toggle = { [weak self] in self?.toggle() }
        input.choose = { [weak self] in self?.select($0) }
        input.cancelAfterClick = { [weak self] in
            guard let self, self.state.phase != .idle else { return }
            self.preserveClickedFocus = true
            self.cancel()
        }
        input.hitTest = { [weak self] point in
            guard let self, self.state.phase == .visible else { return nil }
            return self.palette.target(at: point)
        }
        input.hover = { [weak self] in self?.palette.model.highlighted = $0 }
    }

    func recover() async {
        guard let workspace = UserDefaults.standard.string(forKey: recoveryKey) else { return }
        do {
            let current = try await aerospace.snapshot()
            // Do not move the user if they already recovered manually.
            if current.origin.name == "launcher" { try await aerospace.workspace(workspace) }
            UserDefaults.standard.removeObject(forKey: recoveryKey)
        } catch { report("Desktop recovery failed: \(error.localizedDescription)") }
    }

    func stopAndRecover() async {
        cancel()
        await operation?.value
        input.stop()
        await recover()
    }

    func toggle() {
        if state.phase != .idle { cancel(); return }
        guard state.begin() else { return }
        session = UUID()
        let token = session
        input.isActive = true
        preserveClickedFocus = false
        operation = Task {
            do {
                // Keep potentially slow AX queries outside the event tap.
                let app = NSWorkspace.shared.frontmostApplication
                let bundleID = app?.bundleIdentifier
                let captured = windowFocus.capture(bundleID: bundleID, pid: app?.processIdentifier)
                if captured.fullscreen { throw SwitchError.fullscreen }
                let title = captured.title
                let screen = NSScreen.main ?? NSScreen.screens.first
                let desktop = try await aerospace.snapshot()
                guard token == session else { return }
                guard desktop.origin.name != "launcher" else { throw SwitchError.sourceIsLauncher }
                guard desktop.launcherIsEmpty else { throw SwitchError.occupiedLauncher }
                snapshot = desktop
                sourceWindow = desktop.sourceWindow(bundleID: bundleID, title: title)
                if let sourceWindow { preferred[sourceWindow.bundleID] = sourceWindow.id }
                // A buffered selection never needs a desktop round trip.
                if state.choice != nil { await finish(); return }
                UserDefaults.standard.set(desktop.origin.name, forKey: recoveryKey)
                revealed = true // Restore even when summon partially succeeds then fails.
                try await aerospace.revealDesktop()
                guard token == session else { return }
                if state.choice != nil { await finish(); return }
                guard let screen else { throw SwitchError.invalidSnapshot }
                state.show()
                palette.show(on: screen)
            } catch {
                if revealed { await restore(focus: true) }
                fail(error)
            }
        }
    }

    func select(_ code: UInt16) {
        guard Target.all.contains(where: { $0.id == code }), state.choose(.target(code)) else { return }
        if state.phase == .visible { operation = Task { await finish() } }
    }

    func cancel() {
        guard state.choose(.cancel) else { return }
        if state.phase == .visible { operation = Task { await finish() } }
    }

    private func finish() async {
        guard state.phase == .opening || state.phase == .visible, let snapshot else { return }
        let choice = state.choice
        state.close()
        palette.hide()
        // Release input immediately; closing subprocesses must not trap typing.
        input.isActive = false
        defer { reset() }
        guard case .target(let code) = choice,
              let target = Target.all.first(where: { $0.id == code }) else {
            await restore(focus: !preserveClickedFocus)
            return
        }
        if let window = snapshot.destination(for: target, preferredID: preferred[target.bundleID]) {
            if revealed && window.monitorID != snapshot.origin.monitorID { await restore(focus: false) }
            do {
                try await aerospace.workspace(window.workspace)
                guard windowFocus.focus(bundleID: target.bundleID, title: window.title) else {
                    throw SwitchError.missingApplication(target.name)
                }
                preferred[target.bundleID] = window.id
                clearRecovery()
                return
            } catch { log.notice("Window disappeared; falling back to application activation") }
        }
        await restore(focus: false)
        guard let url = NSWorkspace.shared.urlForApplication(withBundleIdentifier: target.bundleID) else {
            report(SwitchError.missingApplication(target.name).localizedDescription)
            return
        }
        let configuration = NSWorkspace.OpenConfiguration()
        configuration.activates = true
        do { _ = try await NSWorkspace.shared.openApplication(at: url, configuration: configuration) }
        catch { report(error.localizedDescription) }
    }

    private func restore(focus: Bool) async {
        guard revealed, let snapshot else { return }
        do {
            try await aerospace.workspace(snapshot.origin.name)
            if focus, let sourceWindow {
                if !windowFocus.restoreSource(bundleID: sourceWindow.bundleID) {
                    log.notice("Source window is no longer available")
                }
            }
            clearRecovery()
        } catch { report("Could not restore desktop: \(error.localizedDescription). Use Recover Desktop in the menu.") }
    }

    private func clearRecovery() {
        revealed = false
        UserDefaults.standard.removeObject(forKey: recoveryKey)
    }

    private func fail(_ error: Error) {
        log.error("\(error.localizedDescription, privacy: .public)")
        reset()
        report(error.localizedDescription)
    }

    private func reset() {
        palette.hide()
        input.isActive = false
        state.reset()
        snapshot = nil
        sourceWindow = nil
        revealed = false
    }
}

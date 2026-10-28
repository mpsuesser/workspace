import AppKit
import OSLog
import QuickSwitchCore

@MainActor final class SwitcherController {
    let input = InputMonitor()
    let palette: any PalettePresenting
    var report: (String) -> Void = { _ in }
    private let aerospace: any DesktopAccess
    private let windowFocus = WindowFocus()
    private let log = Logger(subsystem: "local.quickswitch", category: "switcher")
    private var state = SelectionState()
    private var preferred: [String: Int] = [:]
    private var operation: Task<Void, Never>?
    private var session = UUID()
    private let recoveryKey = "returnWorkspace"

    init(aerospace: any DesktopAccess = AeroSpace(), palette: any PalettePresenting = PalettePanel()) {
        self.aerospace = aerospace
        self.palette = palette
        input.toggle = { [weak self] in self?.toggle() }
        input.choose = { [weak self] in self?.select($0) }
        input.cancelAfterClick = { [weak self] in self?.cancel() }
        input.hitTest = { [weak self] point in
            guard let self, self.state.phase == .visible else { return nil }
            return self.palette.target(at: point)
        }
        input.hover = { [weak self] in self?.palette.highlight($0) }
    }

    /// One-time compatibility recovery for the old workspace-reveal version.
    /// New picker sessions never switch to launcher or write a recovery record.
    func recover() async {
        guard let workspace = UserDefaults.standard.string(forKey: recoveryKey) else { return }
        do {
            let current = try await aerospace.snapshot()
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
        guard let screen = NSScreen.main ?? NSScreen.screens.first else { return }
        let started = ContinuousClock.now
        state.begin()
        state.show()
        input.isActive = true
        // Only prebuilt UI and decoded wallpaper: no AX, files, CLI or window changes.
        palette.show(on: screen)
        let elapsed = started.duration(to: .now)
        log.notice("Picker presentation submitted after \(String(describing: elapsed), privacy: .public)")
    }

    func select(_ code: UInt16) {
        guard Target.all.contains(where: { $0.id == code }), state.choose(.target(code)) else { return }
        let token = session
        operation = Task { await finish(session: token) }
    }

    func cancel() {
        guard state.choose(.cancel) else { return }
        // The source application never lost focus; no restoration is necessary.
        reset()
    }

    private func finish(session token: UUID) async {
        guard token == session, state.phase == .visible,
              case .target(let code) = state.choice,
              let target = Target.all.first(where: { $0.id == code }) else { return }
        state.close()
        palette.hide()
        input.isActive = false
        defer { reset() }
        // Workspace discovery is needed only after a target is chosen, never on F8.
        // A failed manager lookup must not prevent native app activation.
        do {
            let snapshot = try await aerospace.snapshot()
            if let window = snapshot.destination(for: target, preferredID: preferred[target.bundleID]) {
                if window.workspace != snapshot.origin.name {
                    try await aerospace.workspace(window.workspace)
                }
                if windowFocus.focus(bundleID: target.bundleID, title: window.title) {
                    preferred[target.bundleID] = window.id
                    return
                }
            }
        } catch { log.notice("Workspace lookup failed; using native application activation: \(error.localizedDescription, privacy: .public)") }
        guard let url = NSWorkspace.shared.urlForApplication(withBundleIdentifier: target.bundleID) else {
            report(SwitchError.missingApplication(target.name).localizedDescription)
            return
        }
        let configuration = NSWorkspace.OpenConfiguration()
        configuration.activates = true
        do { _ = try await NSWorkspace.shared.openApplication(at: url, configuration: configuration) }
        catch { report(error.localizedDescription) }
    }

    private func reset() {
        session = UUID()
        palette.hide()
        input.isActive = false
        state.reset()
    }
}

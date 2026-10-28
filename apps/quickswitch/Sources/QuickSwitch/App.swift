import AppKit
import ApplicationServices
import ServiceManagement
import SwiftUI

@main enum QuickSwitchApp {
    @MainActor static func main() {
        let app = NSApplication.shared
        if let index = CommandLine.arguments.firstIndex(of: "--render-preview"),
           CommandLine.arguments.indices.contains(index + 1) {
            renderPreview(to: CommandLine.arguments[index + 1])
            return
        }
        let delegate = AppDelegate()
        app.delegate = delegate
        app.setActivationPolicy(.accessory)
        withExtendedLifetime(delegate) { app.run() }
    }

    /// Renders our own view, never the user's screen, for visual regression review.
    @MainActor private static func renderPreview(to path: String) {
        let model = PaletteModel()
        model.loadIcons()
        if CommandLine.arguments.contains("--highlight") { model.highlighted = 13 }
        let renderer = ImageRenderer(content: PaletteView(model: model)
            .frame(width: 860, height: 640)
            .background(LinearGradient(colors: [Color(red: 0.12, green: 0.15, blue: 0.17), Color(red: 0.025, green: 0.045, blue: 0.04)], startPoint: .topLeading, endPoint: .bottomTrailing)))
        renderer.scale = 2
        guard let image = renderer.nsImage,
              let tiff = image.tiffRepresentation,
              let bitmap = NSBitmapImageRep(data: tiff),
              let png = bitmap.representation(using: .png, properties: [:]) else { return }
        do { try png.write(to: URL(fileURLWithPath: path)) }
        catch { FileHandle.standardError.write(Data(error.localizedDescription.utf8)) }
    }
}

@MainActor final class AppDelegate: NSObject, NSApplicationDelegate {
    private let controller = SwitcherController()
    private var item: NSStatusItem?
    private var permissionTimer: Timer?
    private var observers: [NSObjectProtocol] = []
    private var lastError: String?
    private var isQuitting = false

    func applicationDidFinishLaunching(_ notification: Notification) {
        // A single stable bundle identity owns the global tap.
        if NSRunningApplication.runningApplications(withBundleIdentifier: "local.quickswitch").count > 1 {
            NSApp.terminate(nil)
            return
        }
        controller.report = { [weak self] in self?.showError($0) }
        let item = NSStatusBar.system.statusItem(withLength: NSStatusItem.squareLength)
        item.button?.image = NSImage(systemSymbolName: "circle.hexagongrid", accessibilityDescription: "QuickSwitch")
        self.item = item
        rebuildMenu()
        Task { await controller.recover() }
        if !AXIsProcessTrusted() { requestPermission() }
        else if !controller.input.start() { showError("Could not start the input monitor. Check Accessibility permission, then retry from the menu.") }
        permissionTimer = Timer.scheduledTimer(withTimeInterval: 2, repeats: true) { [weak self] _ in
            MainActor.assumeIsolated {
                guard let self else { return }
                if AXIsProcessTrusted() { _ = self.controller.input.start() }
                else { self.controller.cancel(); self.controller.input.stop() }
            }
        }
        observers.append(NotificationCenter.default.addObserver(forName: NSApplication.didChangeScreenParametersNotification,
            object: nil, queue: .main) { [weak self] _ in MainActor.assumeIsolated {
                self?.controller.cancel()
                self?.controller.palette.reloadWallpapers()
            } })
    }

    private func rebuildMenu() {
        let menu = NSMenu()
        if let lastError {
            let label = NSTextField(wrappingLabelWithString: lastError)
            label.font = .systemFont(ofSize: 12)
            label.textColor = .secondaryLabelColor
            label.frame.size.width = 300
            label.preferredMaxLayoutWidth = 300
            let height = label.fittingSize.height
            let container = NSView(frame: NSRect(x: 0, y: 0, width: 324, height: height + 20))
            label.frame = NSRect(x: 12, y: 10, width: 300, height: height)
            container.addSubview(label)
            let message = NSMenuItem()
            message.view = container
            menu.addItem(message)
            let dismiss = NSMenuItem(title: "Dismiss Error", action: #selector(dismissError), keyEquivalent: "")
            dismiss.target = self
            menu.addItem(dismiss)
            menu.addItem(.separator())
        }
        for (title, action) in [
            ("QuickSwitch · F8", #selector(showSwitcher)),
            ("Enable Accessibility…", #selector(requestPermission)),
            ("Recover Desktop", #selector(recover)),
            ("Wallpaper Backdrop", #selector(toggleWallpaper)),
            ("Reload Wallpaper", #selector(reloadWallpaper)),
            ("Open Icon Overrides", #selector(openIcons)),
            ("Launch at Login", #selector(toggleLogin)),
            ("Quit QuickSwitch", #selector(quit))
        ] {
            let entry = NSMenuItem(title: title, action: action, keyEquivalent: "")
            entry.target = self
            if action == #selector(toggleLogin) { entry.state = SMAppService.mainApp.status == .enabled ? .on : .off }
            if action == #selector(toggleWallpaper) { entry.state = controller.palette.usesWallpaper ? .on : .off }
            menu.addItem(entry)
        }
        item?.menu = menu
    }

    @objc private func showSwitcher() { controller.toggle() }
    @objc private func toggleWallpaper() {
        controller.palette.setUsesWallpaper(!controller.palette.usesWallpaper)
        rebuildMenu()
    }
    @objc private func reloadWallpaper() { controller.palette.reloadWallpapers() }
    @objc private func requestPermission() {
        let options = ["AXTrustedCheckOptionPrompt": true] as CFDictionary
        _ = AXIsProcessTrustedWithOptions(options)
        NSWorkspace.shared.open(URL(string: "x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility")!)
    }
    @objc private func recover() {
        Task {
            await controller.stopAndRecover()
            if AXIsProcessTrusted() { _ = controller.input.start() }
        }
    }
    @objc private func openIcons() {
        do {
            try FileManager.default.createDirectory(at: PaletteModel.iconDirectory, withIntermediateDirectories: true)
            NSWorkspace.shared.open(PaletteModel.iconDirectory)
            controller.palette.reloadIcons()
        } catch { showError(error.localizedDescription) }
    }
    @objc private func toggleLogin() {
        do {
            if SMAppService.mainApp.status == .enabled { try SMAppService.mainApp.unregister() }
            else { try SMAppService.mainApp.register() }
            rebuildMenu()
        } catch { showError(error.localizedDescription) }
    }
    @objc private func quit() { NSApp.terminate(nil) }
    @objc private func dismissError() {
        lastError = nil
        item?.button?.image = NSImage(systemSymbolName: "circle.hexagongrid", accessibilityDescription: "QuickSwitch")
        item?.button?.toolTip = "QuickSwitch · F8"
        rebuildMenu()
    }

    func applicationShouldTerminate(_ sender: NSApplication) -> NSApplication.TerminateReply {
        guard !isQuitting else { return .terminateLater }
        isQuitting = true
        permissionTimer?.invalidate()
        Task {
            await controller.stopAndRecover()
            sender.reply(toApplicationShouldTerminate: true)
        }
        return .terminateLater
    }
    private func showError(_ message: String) {
        // Errors must never create managed windows on the desktop workspace,
        // capture input, or cover the user's applications.
        lastError = message
        item?.button?.image = NSImage(systemSymbolName: "exclamationmark.circle", accessibilityDescription: "QuickSwitch needs attention")
        item?.button?.toolTip = message
        rebuildMenu()
    }
}

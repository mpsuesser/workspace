import AppKit
import SwiftUI
import Observation
import QuickSwitchCore

@MainActor @Observable final class PaletteModel {
    var icons: [UInt16: NSImage] = [:]
    var highlighted: UInt16?

    static let iconDirectory = URL.applicationSupportDirectory
        .appending(path: "QuickSwitch/Icons", directoryHint: .isDirectory)

    func loadIcons() {
        for target in Target.all {
            let custom = ["png", "pdf", "svg"].lazy.compactMap { ext in
                NSImage(contentsOf: Self.iconDirectory.appending(path: "\(target.assetName).\(ext)"))
            }.first
            if let custom { icons[target.id] = custom }
            else if let url = Bundle.main.url(forResource: target.assetName, withExtension: "png", subdirectory: "Marks")
                ?? Bundle.module.url(forResource: target.assetName, withExtension: "png", subdirectory: "Assets"),
                    let image = NSImage(contentsOf: url) {
                icons[target.id] = image
            }
            else if let url = NSWorkspace.shared.urlForApplication(withBundleIdentifier: target.bundleID) {
                icons[target.id] = NSWorkspace.shared.icon(forFile: url.path)
            } else {
                icons[target.id] = NSImage(systemSymbolName: "app.dashed", accessibilityDescription: target.name)
            }
        }
    }
}

struct PaletteView: View {
    let model: PaletteModel

    var body: some View {
        GeometryReader { geometry in
            let layout = RadialLayout(size: geometry.size)
            Ellipse()
                .fill(RadialGradient(colors: [.black.opacity(0.42), .black.opacity(0.16), .clear], center: .center, startRadius: 30, endRadius: 270))
                .frame(width: 660, height: 560)
                .position(x: geometry.size.width / 2, y: geometry.size.height / 2)
            ForEach(Target.all) { target in
                let icon = layout.iconRect(for: target)
                let key = layout.keyRect(for: target)
                let highlighted = model.highlighted == target.id
                let accent = Color(red: 0.66, green: 1, blue: 0.55)
                Path { path in
                    let dx = icon.midX - key.midX, dy = icon.midY - key.midY
                    let length = hypot(dx, dy)
                    let ux = dx / length, uy = dy / length
                    let keyEdge = min(key.width / 2 / abs(ux), key.height / 2 / abs(uy)) + 3
                    let iconEdge = min(icon.width / 2 / abs(ux), icon.height / 2 / abs(uy)) + 3
                    path.move(to: CGPoint(x: key.midX + ux * keyEdge, y: key.midY + uy * keyEdge))
                    path.addLine(to: CGPoint(x: icon.midX - ux * iconEdge, y: icon.midY - uy * iconEdge))
                }
                .stroke(accent.opacity(highlighted ? 0.65 : 0.16), style: StrokeStyle(lineWidth: 0.7, dash: [2, 5]))
                if let image = model.icons[target.id] {
                    Image(nsImage: image)
                        .resizable()
                        .scaledToFit()
                        .frame(width: icon.width, height: icon.height)
                        .scaleEffect(highlighted ? 1.09 : 1)
                        .shadow(color: accent.opacity(highlighted ? 0.45 : 0.12), radius: highlighted ? 18 : 10)
                        .shadow(color: .black.opacity(0.5), radius: 6, y: 4)
                        .position(x: icon.midX, y: icon.midY)
                        .accessibilityLabel(target.name)
                }
                Keycap(legend: target.legend, highlighted: highlighted)
                    .frame(width: key.width, height: key.height)
                    .position(x: key.midX, y: key.midY)
            }
        }
        .animation(.easeOut(duration: 0.1), value: model.highlighted)
        .environment(\.colorScheme, .dark)
        .allowsHitTesting(false)
    }
}

private struct Keycap: View {
    let legend: String
    let highlighted: Bool

    var body: some View {
        let acid = Color(red: 0.72, green: 1, blue: 0.56)
        ZStack {
            CutKey()
                .fill(Color(red: 0.018, green: 0.035, blue: 0.025))
                .overlay(CutKey().stroke(acid.opacity(highlighted ? 0.9 : 0.32), lineWidth: 0.8))
                .shadow(color: .black.opacity(0.8), radius: 5, y: 5)
                .shadow(color: acid.opacity(highlighted ? 0.3 : 0.06), radius: 12, y: 2)
            CutKey()
                .fill(LinearGradient(
                    colors: highlighted
                        ? [Color(red: 0.20, green: 0.29, blue: 0.16), Color(red: 0.045, green: 0.10, blue: 0.055)]
                        : [Color(red: 0.12, green: 0.16, blue: 0.13), Color(red: 0.025, green: 0.05, blue: 0.035)],
                    startPoint: .topLeading, endPoint: .bottomTrailing
                ))
                .overlay(CutKey().stroke(LinearGradient(colors: [.white.opacity(0.3), acid.opacity(0.04)], startPoint: .topLeading, endPoint: .bottomTrailing), lineWidth: 0.6))
                .padding(.horizontal, 3)
                .padding(.top, 3)
                .padding(.bottom, 6)
            Text(legend)
                .font(.system(size: 17, weight: .medium, design: .monospaced))
                .foregroundStyle(acid.opacity(highlighted ? 1 : 0.9))
                .shadow(color: acid.opacity(0.4), radius: highlighted ? 6 : 2)
                .offset(y: -2)
        }
    }
}

private struct CutKey: Shape {
    func path(in rect: CGRect) -> Path {
        let cut: CGFloat = 6
        return Path { path in
            path.move(to: CGPoint(x: rect.minX + cut, y: rect.minY))
            path.addLine(to: CGPoint(x: rect.maxX - cut, y: rect.minY))
            path.addLine(to: CGPoint(x: rect.maxX, y: rect.minY + cut))
            path.addLine(to: CGPoint(x: rect.maxX, y: rect.maxY - cut))
            path.addLine(to: CGPoint(x: rect.maxX - cut, y: rect.maxY))
            path.addLine(to: CGPoint(x: rect.minX + cut, y: rect.maxY))
            path.addLine(to: CGPoint(x: rect.minX, y: rect.maxY - cut))
            path.addLine(to: CGPoint(x: rect.minX, y: rect.minY + cut))
            path.closeSubpath()
        }
    }
}

/// A prebuilt, nonactivating, click-through panel. Only exact icon/key rectangles
/// are intercepted by InputMonitor; empty space never blocks a system dialog.
@MainActor final class PalettePanel {
    let model = PaletteModel()
    private let panel: NSPanel
    private var layout = RadialLayout(size: .zero)
    private var primaryTop: CGFloat = 0

    init() {
        panel = NSPanel(contentRect: .zero, styleMask: [.borderless, .nonactivatingPanel], backing: .buffered, defer: false)
        panel.isOpaque = false
        panel.backgroundColor = .clear
        panel.hasShadow = false
        panel.hidesOnDeactivate = false
        panel.ignoresMouseEvents = true
        panel.isReleasedWhenClosed = false
        panel.level = .statusBar
        panel.collectionBehavior = [.canJoinAllSpaces, .stationary, .ignoresCycle, .fullScreenAuxiliary]
        panel.contentView = NSHostingView(rootView: PaletteView(model: model))
        model.loadIcons()
    }

    func show(on screen: NSScreen) {
        let frame = screen.visibleFrame
        primaryTop = NSScreen.screens.first?.frame.maxY ?? 0
        layout = RadialLayout(size: frame.size)
        model.highlighted = nil
        panel.setFrame(frame, display: true)
        panel.orderFrontRegardless()
    }

    func target(at globalPoint: CGPoint) -> Target? {
        let cocoaY = primaryTop - globalPoint.y
        let localPoint = CGPoint(x: globalPoint.x - panel.frame.minX, y: panel.frame.maxY - cocoaY)
        return layout.target(at: localPoint)
    }

    func hide() { panel.orderOut(nil); model.highlighted = nil }
}

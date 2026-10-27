import Foundation
import CoreGraphics

/// A fixed physical key, app identity, and position in the QWE / ASD cluster.
public struct Target: Identifiable, Equatable, Sendable {
    public let keyCode: UInt16
    public let legend: String
    public let name: String
    public let bundleID: String
    public let assetName: String
    public let row: Int
    public let column: Int
    public var id: UInt16 { keyCode }

    public static let all: [Target] = [
        .init(keyCode: 12, legend: "Q", name: "Ghostty", bundleID: "com.mitchellh.ghostty", assetName: "ghostty", row: 0, column: 0),
        .init(keyCode: 1, legend: "S", name: "T3 Code", bundleID: "com.t3tools.t3code", assetName: "t3-code", row: 1, column: 1),
        .init(keyCode: 0, legend: "A", name: "Curation Space Admin", bundleID: "com.google.Chrome.app.ibioofnnpndfmiedpmogibjlnljpfebh", assetName: "curation-space-admin", row: 1, column: 0),
        .init(keyCode: 2, legend: "D", name: "Google Chrome", bundleID: "com.google.Chrome", assetName: "chrome", row: 1, column: 2),
        .init(keyCode: 13, legend: "W", name: "Linear", bundleID: "com.linear", assetName: "linear", row: 0, column: 1),
        .init(keyCode: 14, legend: "E", name: "Rex Beta", bundleID: "com.superlogical.rex", assetName: "rex", row: 0, column: 2)
    ]
}

/// Coordinates are top-left-relative, shared by SwiftUI rendering and hit testing.
public struct RadialLayout: Sendable {
    public let size: CGSize

    public init(size: CGSize) { self.size = size }

    public func iconRect(for target: Target) -> CGRect {
        rect(center: anchor(for: target, radius: 158), itemSize: CGSize(width: 72, height: 72))
    }

    public func keyRect(for target: Target) -> CGRect {
        rect(center: anchor(for: target, radius: 82), itemSize: CGSize(width: 44, height: 44))
    }

    public func target(at point: CGPoint) -> Target? {
        Target.all.first { iconRect(for: $0).contains(point) || keyRect(for: $0).contains(point) }
    }

    private func anchor(for target: Target, radius: Double) -> CGPoint {
        // Q/W/E occupy the upper half, A/S/D the lower half, exactly 60° apart.
        // Both radii are smaller than every pair in the previous bowed layout.
        let degrees = target.row == 0 ? Double(target.column) * 60 - 150 : 150 - Double(target.column) * 60
        let radians = degrees * .pi / 180
        return CGPoint(x: radius * cos(radians), y: radius * sin(radians))
    }

    private func rect(center: CGPoint, itemSize: CGSize) -> CGRect {
        let scale = max(0, min(1, (size.width - 48) / 446, (size.height - 48) / 416))
        return CGRect(
            x: size.width / 2 + (center.x - itemSize.width / 2) * scale,
            y: size.height / 2 + (center.y - itemSize.height / 2) * scale,
            width: itemSize.width * scale, height: itemSize.height * scale
        )
    }
}

public struct Workspace: Decodable, Equatable, Sendable {
    public let name: String
    public let monitorID: Int
    private enum CodingKeys: String, CodingKey {
        case name = "workspace", monitorID = "monitor-id"
    }
}

public struct ManagedWindow: Decodable, Equatable, Sendable {
    public let id: Int
    public let bundleID: String
    public let workspace: String
    public let monitorID: Int
    public let title: String
    private enum CodingKeys: String, CodingKey {
        case id = "window-id", bundleID = "app-bundle-id", workspace
        case monitorID = "monitor-id", title = "window-title"
    }
}

/// A snapshot is advisory for focusing; AeroSpace remains authoritative.
public struct DesktopSnapshot: Sendable {
    public let origin: Workspace
    public let windows: [ManagedWindow]

    public init(origin: Workspace, windows: [ManagedWindow]) {
        self.origin = origin
        self.windows = windows
    }

    public var launcherIsEmpty: Bool { !windows.contains { $0.workspace == "launcher" } }

    public func destination(for target: Target, preferredID: Int?) -> ManagedWindow? {
        let candidates = windows.filter { $0.bundleID == target.bundleID }
        return candidates.first { $0.id == preferredID } ?? candidates.first
    }

    public func sourceWindow(bundleID: String?, title: String?) -> ManagedWindow? {
        let candidates = windows.filter { $0.bundleID == bundleID && $0.workspace == origin.name }
        return candidates.first { $0.title == title } ?? candidates.first
    }
}

/// The first target wins; cancellation can override it until closing begins.
public struct SelectionState: Sendable {
    public enum Phase: Sendable { case idle, opening, visible, closing }
    public enum Choice: Equatable, Sendable { case target(UInt16), cancel }
    public private(set) var phase: Phase = .idle
    public private(set) var choice: Choice?

    public init() {}

    @discardableResult public mutating func begin() -> Bool {
        guard phase == .idle else { return false }
        phase = .opening
        choice = nil
        return true
    }

    @discardableResult public mutating func choose(_ next: Choice) -> Bool {
        guard phase == .opening || phase == .visible else { return false }
        if next != .cancel && choice != nil { return false }
        choice = next
        return true
    }

    public mutating func show() { if phase == .opening { phase = .visible } }
    public mutating func close() { if phase != .idle { phase = .closing } }
    public mutating func reset() { self = .init() }
}

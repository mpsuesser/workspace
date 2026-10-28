import Foundation
import Synchronization
import QuickSwitchCore

enum SwitchError: LocalizedError {
    case command(String)
    case invalidSnapshot
    case occupiedLauncher
    case sourceIsLauncher
    case fullscreen
    case missingApplication(String)

    var errorDescription: String? {
        switch self {
        case .command(let message): message
        case .invalidSnapshot: "AeroSpace returned an invalid desktop snapshot."
        case .occupiedLauncher: "The reserved launcher workspace contains a window. Move it out before opening QuickSwitch."
        case .sourceIsLauncher: "You are already on the launcher workspace. Switch to your normal workspace, or choose Recover Desktop, then try F8 again."
        case .fullscreen: "Leave macOS native fullscreen before using QuickSwitch."
        case .missingApplication(let name): "Cannot find \(name) in Applications."
        }
    }
}

protocol DesktopAccess: Sendable {
    func snapshot() async throws -> DesktopSnapshot
    func workspace(_ name: String) async throws
}

/// Bounded subprocesses run off the UI thread. Both output streams drain concurrently.
struct AeroSpace: DesktopAccess {
    let executable: URL

    init() {
        let candidates = ["/opt/homebrew/bin/aerospace", "/usr/local/bin/aerospace"]
        executable = URL(fileURLWithPath: candidates.first { FileManager.default.isExecutableFile(atPath: $0) } ?? candidates[0])
    }

    func run(_ arguments: [String]) async throws -> Data {
        try await withCheckedThrowingContinuation { continuation in
            DispatchQueue.global(qos: .userInteractive).async {
                let process = Process()
                let stdout = Pipe(), stderr = Pipe()
                let output = Mutex((stdout: Data(), stderr: Data(), timedOut: false))
                process.executableURL = executable
                process.arguments = arguments
                process.standardOutput = stdout
                process.standardError = stderr
                do {
                    try process.run()
                } catch {
                    continuation.resume(throwing: SwitchError.command("Could not start AeroSpace: \(error.localizedDescription)"))
                    return
                }
                let timeout = DispatchWorkItem {
                    if process.isRunning {
                        output.withLock { $0.timedOut = true }
                        process.terminate()
                        // A wedged CLI must not hold the keyboard or app shutdown forever.
                        DispatchQueue.global().asyncAfter(deadline: .now() + 0.25) {
                            if process.isRunning { kill(process.processIdentifier, SIGKILL) }
                        }
                    }
                }
                DispatchQueue.global().asyncAfter(deadline: .now() + 3, execute: timeout)
                let readers = DispatchGroup()
                readers.enter()
                DispatchQueue.global().async {
                    let data = stdout.fileHandleForReading.readDataToEndOfFile()
                    output.withLock { $0.stdout = data }
                    readers.leave()
                }
                readers.enter()
                DispatchQueue.global().async {
                    let data = stderr.fileHandleForReading.readDataToEndOfFile()
                    output.withLock { $0.stderr = data }
                    readers.leave()
                }
                process.waitUntilExit()
                timeout.cancel()
                readers.wait()
                let result = output.withLock { $0 }
                if result.timedOut {
                    continuation.resume(throwing: SwitchError.command("AeroSpace timed out: \(arguments.joined(separator: " "))"))
                } else if process.terminationStatus != 0 {
                    let message = String(decoding: result.stderr, as: UTF8.self).trimmingCharacters(in: .whitespacesAndNewlines)
                    continuation.resume(throwing: SwitchError.command(message.isEmpty ? "AeroSpace command failed." : message))
                } else {
                    continuation.resume(returning: result.stdout)
                }
            }
        }
    }

    func snapshot() async throws -> DesktopSnapshot {
        // Parallel reads replace the old serial origin / empty-check / window-query chain.
        async let originData = run(["list-workspaces", "--focused", "--format", "%{workspace} %{monitor-id}", "--json"])
        async let windowData = run(["list-windows", "--all", "--format", "%{window-id} %{app-bundle-id} %{workspace} %{monitor-id} %{window-title}", "--json"])
        let workspaces = try JSONDecoder().decode([Workspace].self, from: await originData)
        let windows = try JSONDecoder().decode([ManagedWindow].self, from: await windowData)
        guard let origin = workspaces.first else { throw SwitchError.invalidSnapshot }
        return DesktopSnapshot(origin: origin, windows: windows)
    }

    func workspace(_ name: String) async throws { _ = try await run(["workspace", name]) }
}

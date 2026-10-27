// swift-tools-version: 6.0
import PackageDescription

let package = Package(
    name: "QuickSwitch",
    platforms: [.macOS(.v15)],
    products: [.executable(name: "QuickSwitch", targets: ["QuickSwitch"])],
    targets: [
        .target(name: "QuickSwitchCore"),
        .executableTarget(name: "QuickSwitch", dependencies: ["QuickSwitchCore"], resources: [.copy("Assets")]),
        .testTarget(name: "QuickSwitchCoreTests", dependencies: ["QuickSwitchCore"]),
        .testTarget(name: "QuickSwitchTests", dependencies: ["QuickSwitch"])
    ]
)

// swift-tools-version: 6.0

// WARNING:
// Swift Playground may regenerate this file. Keep app code in App.swift.

import PackageDescription
import AppleProductTypes

let package = Package(
    name: "GradeCrew Secure",
    platforms: [
        .iOS("17.0")
    ],
    products: [
        .iOSApplication(
            name: "GradeCrew Secure",
            targets: ["AppModule"],
            bundleIdentifier: "de.gradecrew.secure.playground",
            displayVersion: "0.1",
            bundleVersion: "1",
            appIcon: .placeholder(icon: .lock),
            accentColor: .presetColor(.blue),
            supportedDeviceFamilies: [
                .pad
            ],
            supportedInterfaceOrientations: [
                .portrait,
                .landscapeRight,
                .landscapeLeft,
                .portraitUpsideDown(.when(deviceFamilies: [.pad]))
            ]
        )
    ],
    targets: [
        .executableTarget(
            name: "AppModule",
            path: ".",
            exclude: ["README.md"]
        )
    ],
    swiftLanguageVersions: [.version("6")]
)

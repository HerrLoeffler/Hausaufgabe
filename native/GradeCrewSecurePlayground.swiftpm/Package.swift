// swift-tools-version: 5.9

// WARNING:
// Swift Playgrounds may regenerate this file. Keep app code in App.swift.

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
            appIcon: .placeholder(icon: .checkmark),
            accentColor: .presetColor(.blue),
            supportedDeviceFamilies: [
                .pad
            ],
            supportedInterfaceOrientations: [
                .portrait,
                .landscapeRight,
                .landscapeLeft,
                .portraitUpsideDown(.when(deviceFamilies: [.pad]))
            ],
            appCategory: .education
        )
    ],
    targets: [
        .executableTarget(
            name: "AppModule",
            path: ".",
            exclude: ["README.md"]
        )
    ]
)

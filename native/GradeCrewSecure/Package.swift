// swift-tools-version: 5.9
import PackageDescription
let package = Package(
    name: "GradeCrewSecureLabTests",
    platforms: [.macOS(.v13)],
    products: [],
    targets: [
        .target(name: "AssessmentLabCore", path: "Sources", exclude: ["AssessmentLab.swift", "GradeCrewSecureApp.swift", "StagingWebView.swift", "StartView.swift"], sources: ["AssessmentLabState.swift", "AssessmentLabTimer.swift"]),
        .testTarget(name: "AssessmentLabCoreTests", dependencies: ["AssessmentLabCore"], path: "Tests")
    ]
)

// swift-tools-version: 5.9
import PackageDescription
let package = Package(
    name: "GradeCrewSecureLabTests",
    platforms: [.macOS(.v13)],
    products: [],
    targets: [
        .target(name: "AssessmentLabCore", path: "Sources", exclude: ["AssessmentLab.swift", "GradeCrewSecureApp.swift", "StagingWebView.swift", "StartView.swift", "SecureAttemptStore.swift", "SecureAssessmentSession.swift", "SecureExamCoordinator.swift", "SecureExamWebView.swift", "SecureStagingRootView.swift", "SecureTheme.swift", "SecureEntryView.swift", "SecureLegalInformation.swift", "SecureExamChrome.swift", "SecureStatusView.swift", "SecureTelemetry.swift", "SecurePupilAccess.swift"], sources: ["SecureReleaseEnvironment.swift", "AssessmentLabState.swift", "AssessmentLabTimer.swift", "SecureExamPolicy.swift", "SecureAssessmentAPI.swift", "SecureSavedWork.swift", "SecureTelemetryPolicy.swift", "SecurePupilPolicy.swift", "SecureReplacementPolicy.swift"]),
        .testTarget(name: "AssessmentLabCoreTests", dependencies: ["AssessmentLabCore"], path: "Tests")
    ]
)

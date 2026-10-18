import Foundation

// Keep the legacy Live store names: pending answers from installed builds must survive.
enum SecureReleaseEnvironment {
    #if GRADECREW_STAGING
    static let projectID = "gradecrew-staging-2026"
    static let attemptService = "de.gradecrew.secure.test2026-attempt-v1"
    static let telemetryService = "de.gradecrew.secure.test2026-telemetry-v1"
    static let workDirectory = "SecureTest2026"
    #else
    static let projectID = "hausaufgabe-staging"
    static let attemptService = "de.gradecrew.secure.staging-attempt-v1"
    static let telemetryService = "de.gradecrew.secure.staging-telemetry-v1"
    static let workDirectory = "SecureStaging"
    #endif
    static let functionsURL = URL(string: "https://europe-west1-\(projectID).cloudfunctions.net/")!
}

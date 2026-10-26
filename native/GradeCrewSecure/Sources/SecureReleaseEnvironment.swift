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
    static var versionLabel:String { displayVersion(info:Bundle.main.infoDictionary ?? [:]) }
    static func displayVersion(info:[String:Any])->String {
        func value(_ key:String)->String {
            guard let text=info[key] as? String,!text.trimmingCharacters(in:.whitespacesAndNewlines).isEmpty else{return "unbekannt"}
            return text
        }
        return "Version \(value("CFBundleShortVersionString")) (Build \(value("CFBundleVersion")))"
    }
    static let functionsURL = URL(string: "https://europe-west1-\(projectID).cloudfunctions.net/")!
}

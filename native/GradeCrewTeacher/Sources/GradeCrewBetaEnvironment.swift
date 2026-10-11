import Foundation

// TestFlight should follow the continuously verified integration preview by default.
// Stable staging remains an explicit fallback. Production is never selectable here.
enum GradeCrewBetaEnvironment {
    static let stableStagingURL = URL(string: "https://hausaufgabe-staging.web.app/")!
    static let integrationPreviewURL = URL(string: "https://hausaufgabe-staging--gradecrew-app-integration-201hlnau.web.app/")!
    static let defaultURL = integrationPreviewURL
    static let preferenceKey = "gradecrew.teacher.stagingPreviewURL"
    static let stablePreference = "__stable_staging__"

    static func previewURL(from value: String) -> URL? {
        guard var components = URLComponents(string: value.trimmingCharacters(in: .whitespacesAndNewlines)),
              components.scheme?.lowercased() == "https",
              components.user == nil, components.password == nil, components.port == nil,
              let host = components.host?.lowercased(),
              host.hasPrefix("hausaufgabe-staging--"), host.hasSuffix(".web.app") else { return nil }
        let channel = host.dropFirst("hausaufgabe-staging--".count).dropLast(".web.app".count)
        guard !channel.isEmpty, channel.allSatisfy({ "abcdefghijklmnopqrstuvwxyz0123456789-".contains($0) }) else { return nil }
        components.host = host
        components.path = "/"
        components.query = nil
        components.fragment = nil
        return components.url
    }

    static func baseURL(for preference: String) -> URL {
        let normalized = preference.trimmingCharacters(in: .whitespacesAndNewlines)
        if normalized == stablePreference { return stableStagingURL }
        return previewURL(from: normalized) ?? defaultURL
    }

    static func environmentLabel(for preference: String) -> String {
        let url = baseURL(for: preference)
        if url.host == integrationPreviewURL.host { return "Integration" }
        if url.host == stableStagingURL.host { return "Staging" }
        return "Preview"
    }

    static func homeURL(preference: String, version: String) -> URL {
        appURL(preference: preference, version: version, intent: nil)
    }

    static func signInURL(preference: String, version: String) -> URL {
        appURL(preference: preference, version: version, intent: "login")
    }

    private static func appURL(preference: String, version: String, intent: String?) -> URL {
        var components = URLComponents(url: baseURL(for: preference), resolvingAgainstBaseURL: false)!
        var items = [
            URLQueryItem(name: "gradecrewApp", value: "teacher"),
            URLQueryItem(name: "source", value: "ios"),
            URLQueryItem(name: "appVersion", value: version)
        ]
        if let intent { items.append(URLQueryItem(name: "intent", value: intent)) }
        components.queryItems = items
        return components.url!
    }
}

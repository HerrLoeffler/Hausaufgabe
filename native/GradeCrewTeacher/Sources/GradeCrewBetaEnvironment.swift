import Foundation

// Live always uses the canonical school site. Test builds use a different project.
enum GradeCrewBetaEnvironment {
    #if GRADECREW_STAGING
    static let isStaging = true
    static let projectID = "gradecrew-staging-2026"
    static let preferenceKey = "gradecrew.teacher.test2026PreviewURL"
    #else
    static let isStaging = false
    static let projectID = "hausaufgabe-staging"
    static let preferenceKey = "gradecrew.teacher.liveURL"
    #endif
    static let publicHost = isStaging ? "\(projectID).web.app" : "gradecrew.de"
    static let webHosts: Set<String> = isStaging
        ? [publicHost]
        : [publicHost, "www.gradecrew.de", "hausaufgabe-staging.web.app"]
    static let stableStagingURL = URL(string: "https://\(publicHost)/")!
    static let integrationPreviewURL = stableStagingURL
    static let defaultURL = stableStagingURL
    static let stablePreference = "__stable_staging__"

    static func previewURL(from value: String) -> URL? {
        guard isStaging, var components = URLComponents(string: value.trimmingCharacters(in: .whitespacesAndNewlines)),
              components.scheme?.lowercased() == "https",
              components.user == nil, components.password == nil, components.port == nil,
              let host = components.host?.lowercased(),
              host.hasPrefix("gradecrew-staging-2026--"), host.hasSuffix(".web.app") else { return nil }
        let channel = host.dropFirst("gradecrew-staging-2026--".count).dropLast(".web.app".count)
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
        if url.host == stableStagingURL.host { return isStaging ? "Testumgebung" : "Live" }
        return "Preview"
    }

    static func homeURL(preference: String, version: String) -> URL {
        appURL(preference: preference, version: version, intent: "login")
    }

    static func signInURL(preference: String, version: String) -> URL {
        appURL(preference: preference, version: version, intent: "login")
    }

    private static func appURL(preference: String, version: String, intent: String?) -> URL {
        var components = URLComponents(url: baseURL(for: preference), resolvingAgainstBaseURL: false)!
        components.path = "/workspace.html"
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

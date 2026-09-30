import Foundation

// A Beta build can select a verified staging preview without shipping an
// expiring preview URL in the binary. Production is not a selectable target.
enum GradeCrewBetaEnvironment {
    static let defaultURL = URL(string: "https://hausaufgabe-staging.web.app/")!
    static let preferenceKey = "gradecrew.teacher.stagingPreviewURL"

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
        previewURL(from: preference) ?? defaultURL
    }

    static func homeURL(preference: String, version: String) -> URL {
        var components = URLComponents(url: baseURL(for: preference), resolvingAgainstBaseURL: false)!
        components.queryItems = [
            URLQueryItem(name: "gradecrewApp", value: "teacher"),
            URLQueryItem(name: "source", value: "ios"),
            URLQueryItem(name: "appVersion", value: version)
        ]
        return components.url!
    }
}

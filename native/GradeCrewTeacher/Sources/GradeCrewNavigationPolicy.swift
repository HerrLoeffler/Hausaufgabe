import Foundation

enum GradeCrewNavigationPolicy {
    static let firebaseAuthHost = "hausaufgabe-staging.firebaseapp.com"

    static func isTrustedHost(_ host: String, selectedBaseURL: URL) -> Bool {
        let normalizedHost = host.lowercased()
        let trustedHosts = [
            selectedBaseURL.host?.lowercased(),
            GradeCrewBetaEnvironment.integrationPreviewURL.host?.lowercased(),
            GradeCrewBetaEnvironment.stableStagingURL.host?.lowercased(),
            firebaseAuthHost,
        ].compactMap { $0 }
        if trustedHosts.contains(normalizedHost) { return true }
        return GradeCrewBetaEnvironment.previewURL(from: "https://\(normalizedHost)/") != nil
    }

    static func isTrustedInternalURL(_ url: URL, selectedBaseURL: URL) -> Bool {
        guard let scheme = url.scheme?.lowercased() else { return false }
        if ["about", "blob", "data"].contains(scheme) { return true }
        guard scheme == "https", url.user == nil, url.password == nil, url.port == nil,
              let host = url.host else { return false }
        return isTrustedHost(host, selectedBaseURL: selectedBaseURL)
    }

    static func shouldOpenExternally(_ url: URL, selectedBaseURL: URL, userActivated: Bool) -> Bool {
        userActivated && !isTrustedInternalURL(url, selectedBaseURL: selectedBaseURL)
    }

    static func safeDownloadFilename(_ suggestedFilename: String) -> String {
        let trimmed = suggestedFilename.trimmingCharacters(in: .whitespacesAndNewlines)
        let fallback = trimmed.isEmpty ? "GradeCrew-Download" : trimmed
        let forbidden = CharacterSet(charactersIn: "/\\:\0")
        let pieces = fallback.components(separatedBy: forbidden)
        let flattened = pieces.joined(separator: "-")
            .replacingOccurrences(of: "..", with: ".")
            .trimmingCharacters(in: .whitespacesAndNewlines)
        return flattened.isEmpty ? "GradeCrew-Download" : String(flattened.prefix(180))
    }
}

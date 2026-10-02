import Foundation

enum GradeCrewNavigationPolicy {
    static let firebaseAuthHost = "hausaufgabe-staging.firebaseapp.com"

    static func isTrustedInternalURL(_ url: URL, selectedBaseURL: URL) -> Bool {
        guard let scheme = url.scheme?.lowercased() else { return false }
        if ["about", "blob", "data"].contains(scheme) { return true }
        guard scheme == "https", url.user == nil, url.password == nil, url.port == nil,
              let host = url.host?.lowercased() else { return false }

        let trustedHosts = [
            selectedBaseURL.host?.lowercased(),
            GradeCrewBetaEnvironment.integrationPreviewURL.host?.lowercased(),
            GradeCrewBetaEnvironment.stableStagingURL.host?.lowercased(),
            firebaseAuthHost,
        ].compactMap { $0 }
        if trustedHosts.contains(host) { return true }

        return GradeCrewBetaEnvironment.previewURL(from: "https://\(host)/") != nil
    }

    static func shouldOpenExternally(_ url: URL, selectedBaseURL: URL, userActivated: Bool) -> Bool {
        userActivated && !isTrustedInternalURL(url, selectedBaseURL: selectedBaseURL)
    }
}

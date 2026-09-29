import SwiftUI
import WebKit

struct GradeCrewAppEnvironment {
    static let stagingBaseURL = URL(string: "https://hausaufgabe-staging.web.app/")!

    static func teacherURL(intent: String) -> URL {
        var components = URLComponents(url: stagingBaseURL, resolvingAgainstBaseURL: false)!
        components.queryItems = [
            URLQueryItem(name: "gradecrewApp", value: "teacher"),
            URLQueryItem(name: "intent", value: intent),
        ]
        return components.url ?? stagingBaseURL
    }
}

struct TeacherWebPortalView: View {
    @Environment(\.dismiss) private var dismiss
    let title: String
    let url: URL

    var body: some View {
        NavigationStack {
            GradeCrewWebView(url: url)
                .ignoresSafeArea(edges: .bottom)
                .navigationTitle(title)
                .navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    ToolbarItem(placement: .cancellationAction) {
                        Button("Schließen") { dismiss() }
                    }
                    ToolbarItem(placement: .primaryAction) {
                        Label("Staging", systemImage: "hammer.fill")
                            .font(.caption.weight(.semibold))
                            .foregroundStyle(.orange)
                    }
                }
        }
    }
}

private struct GradeCrewWebView: UIViewRepresentable {
    let url: URL

    final class Coordinator {
        var didLoadInitialURL = false
    }

    func makeCoordinator() -> Coordinator { Coordinator() }

    func makeUIView(context: Context) -> WKWebView {
        let configuration = WKWebViewConfiguration()
        configuration.websiteDataStore = .default()
        let webView = WKWebView(frame: .zero, configuration: configuration)
        webView.allowsBackForwardNavigationGestures = true
        return webView
    }

    func updateUIView(_ webView: WKWebView, context: Context) {
        guard !context.coordinator.didLoadInitialURL else { return }
        context.coordinator.didLoadInitialURL = true
        webView.load(URLRequest(url: url))
    }
}

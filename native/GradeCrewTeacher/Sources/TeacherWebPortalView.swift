import SwiftUI
import WebKit

struct GradeCrewAppEnvironment {
    static let stagingBaseURL = URL(string: "https://hausaufgabe-staging.web.app/")!

    static var teacherHomeURL: URL {
        var components = URLComponents(url: stagingBaseURL, resolvingAgainstBaseURL: false)!
        components.queryItems = [
            URLQueryItem(name: "gradecrewApp", value: "teacher"),
            URLQueryItem(name: "source", value: "ios"),
            URLQueryItem(name: "appVersion", value: "0.1.1"),
        ]
        return components.url ?? stagingBaseURL
    }

    static func teacherURL(intent: String, quizID: String? = nil) -> URL {
        var components = URLComponents(url: stagingBaseURL, resolvingAgainstBaseURL: false)!
        var items = [
            URLQueryItem(name: "gradecrewApp", value: "teacher"),
            URLQueryItem(name: "source", value: "ios"),
            URLQueryItem(name: "appVersion", value: "0.1.1"),
            URLQueryItem(name: "intent", value: intent),
        ]
        if let quizID, !quizID.isEmpty {
            items.append(URLQueryItem(name: "quizId", value: quizID))
        }
        components.queryItems = items
        return components.url ?? stagingBaseURL
    }
}

struct TeacherWebPortalView: View {
    @Environment(\.dismiss) private var dismiss
    let title: String
    let url: URL

    @State private var isLoading = true
    @State private var loadError: String?
    @State private var reloadID = 0

    var body: some View {
        NavigationStack {
            ZStack(alignment: .top) {
                GradeCrewWebView(
                    url: url,
                    reloadID: reloadID,
                    isLoading: $isLoading,
                    errorMessage: $loadError
                )
                .ignoresSafeArea(edges: .bottom)

                if isLoading {
                    ProgressView()
                        .progressViewStyle(.linear)
                        .tint(GradeCrewDesignTokens.Colors.primary)
                        .frame(maxWidth: .infinity)
                }
            }
            .navigationTitle(title)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Schließen") { dismiss() }
                }
                ToolbarItem(placement: .primaryAction) {
                    if loadError != nil {
                        Button {
                            loadError = nil
                            isLoading = true
                            reloadID += 1
                        } label: {
                            Label("Neu laden", systemImage: "arrow.clockwise")
                        }
                    }
                }
            }
        }
    }
}

struct GradeCrewWebView: UIViewRepresentable {
    let url: URL
    let reloadID: Int
    @Binding var isLoading: Bool
    @Binding var errorMessage: String?

    final class Coordinator: NSObject, WKNavigationDelegate, WKUIDelegate {
        var parent: GradeCrewWebView
        var didLoadInitialURL = false
        var lastReloadID: Int

        init(parent: GradeCrewWebView) {
            self.parent = parent
            self.lastReloadID = parent.reloadID
        }

        func webView(_ webView: WKWebView, didStartProvisionalNavigation navigation: WKNavigation!) {
            parent.isLoading = true
            parent.errorMessage = nil
        }

        func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
            parent.isLoading = false
            parent.errorMessage = nil
        }

        func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
            finishWith(error: error)
        }

        func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
            finishWith(error: error)
        }

        private func finishWith(error: Error) {
            parent.isLoading = false
            parent.errorMessage = error.localizedDescription
        }

        func webView(
            _ webView: WKWebView,
            createWebViewWith configuration: WKWebViewConfiguration,
            for navigationAction: WKNavigationAction,
            windowFeatures: WKWindowFeatures
        ) -> WKWebView? {
            guard navigationAction.targetFrame == nil,
                  let requestURL = navigationAction.request.url else {
                return nil
            }
            webView.load(URLRequest(url: requestURL))
            return nil
        }
    }

    func makeCoordinator() -> Coordinator {
        Coordinator(parent: self)
    }

    func makeUIView(context: Context) -> WKWebView {
        let configuration = WKWebViewConfiguration()
        configuration.websiteDataStore = .default()
        configuration.defaultWebpagePreferences.allowsContentJavaScript = true
        configuration.allowsInlineMediaPlayback = true

        let webView = WKWebView(frame: .zero, configuration: configuration)
        webView.navigationDelegate = context.coordinator
        webView.uiDelegate = context.coordinator
        webView.allowsBackForwardNavigationGestures = true
        webView.scrollView.keyboardDismissMode = .interactive
        webView.isOpaque = false
        webView.backgroundColor = .clear
        webView.customUserAgent = "GradeCrew-iOS/0.1.1"
        return webView
    }

    func updateUIView(_ webView: WKWebView, context: Context) {
        context.coordinator.parent = self

        if !context.coordinator.didLoadInitialURL {
            context.coordinator.didLoadInitialURL = true
            context.coordinator.lastReloadID = reloadID
            isLoading = true
            webView.load(URLRequest(url: url))
            return
        }

        if context.coordinator.lastReloadID != reloadID {
            context.coordinator.lastReloadID = reloadID
            isLoading = true
            webView.load(URLRequest(url: url))
        }
    }
}

import SwiftUI
import WebKit
import UIKit

struct GradeCrewAppEnvironment {
    static let version = Bundle.main.object(forInfoDictionaryKey: "CFBundleShortVersionString") as? String ?? "unknown"
    static var stagingBaseURL: URL { GradeCrewBetaEnvironment.baseURL(for: UserDefaults.standard.string(forKey: GradeCrewBetaEnvironment.preferenceKey) ?? "") }

    static var teacherHomeURL: URL {
        var components = URLComponents(url: stagingBaseURL, resolvingAgainstBaseURL: false)!
        components.queryItems = [
            URLQueryItem(name: "gradecrewApp", value: "teacher"),
            URLQueryItem(name: "source", value: "ios"),
            URLQueryItem(name: "appVersion", value: version),
        ]
        return components.url ?? stagingBaseURL
    }

    static func teacherURL(intent: String, quizID: String? = nil) -> URL {
        var components = URLComponents(url: stagingBaseURL, resolvingAgainstBaseURL: false)!
        var items = [
            URLQueryItem(name: "gradecrewApp", value: "teacher"),
            URLQueryItem(name: "source", value: "ios"),
            URLQueryItem(name: "appVersion", value: version),
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
        var lastURL: URL
        var lastReloadID: Int
        private var cancelDialog: (() -> Void)?

        init(parent: GradeCrewWebView) {
            self.parent = parent
            self.lastReloadID = parent.reloadID
            self.lastURL = parent.url
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
            if (error as NSError).code == NSURLErrorCancelled { return }
            parent.isLoading = false
            parent.errorMessage = error.localizedDescription
        }

        // The web app uses confirm() for deleting tests and ending sessions.
        // Every WebKit callback must finish exactly once, including teardown.
        private func presentDialog(_ alert: UIAlertController, in webView: WKWebView, fallback: @escaping () -> Void) {
            cancelActiveDialog()
            var responder: UIResponder? = webView
            while let current = responder, !(current is UIViewController) { responder = current.next }
            guard let presenter = responder as? UIViewController,
                  presenter.viewIfLoaded?.window != nil,
                  presenter.presentedViewController == nil else { fallback(); return }
            cancelDialog = { [weak alert] in alert?.dismiss(animated: false); fallback() }
            presenter.present(alert, animated: true)
        }

        func cancelActiveDialog() {
            let cancel = cancelDialog
            cancelDialog = nil
            cancel?()
        }

        func webView(_ webView: WKWebView, runJavaScriptAlertPanelWithMessage message: String,
                     initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping () -> Void) {
            var completed = false
            let finish = { if !completed { completed = true; completionHandler() } }
            let alert = UIAlertController(title: "GradeCrew", message: message, preferredStyle: .alert)
            alert.addAction(UIAlertAction(title: "OK", style: .default) { _ in finish() })
            presentDialog(alert, in: webView, fallback: finish)
        }

        func webView(_ webView: WKWebView, runJavaScriptConfirmPanelWithMessage message: String,
                     initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping (Bool) -> Void) {
            var completed = false
            let finish: (Bool) -> Void = { result in
                if !completed { completed = true; completionHandler(result) }
            }
            let alert = UIAlertController(title: "GradeCrew", message: message, preferredStyle: .alert)
            alert.addAction(UIAlertAction(title: "Abbrechen", style: .cancel) { _ in finish(false) })
            alert.addAction(UIAlertAction(title: "Bestätigen", style: .default) { _ in finish(true) })
            presentDialog(alert, in: webView) { finish(false) }
        }

        func webView(_ webView: WKWebView, runJavaScriptTextInputPanelWithPrompt prompt: String,
                     defaultText: String?, initiatedByFrame frame: WKFrameInfo,
                     completionHandler: @escaping (String?) -> Void) {
            var completed = false
            let finish: (String?) -> Void = { result in
                if !completed { completed = true; completionHandler(result) }
            }
            let alert = UIAlertController(title: "GradeCrew", message: prompt, preferredStyle: .alert)
            alert.addTextField { $0.text = defaultText }
            alert.addAction(UIAlertAction(title: "Abbrechen", style: .cancel) { _ in finish(nil) })
            alert.addAction(UIAlertAction(title: "OK", style: .default) { [weak alert] _ in finish(alert?.textFields?.first?.text) })
            presentDialog(alert, in: webView) { finish(nil) }
        }

        func webViewWebContentProcessDidTerminate(_ webView: WKWebView) {
            cancelActiveDialog()
            parent.isLoading = false
            parent.errorMessage = "Die Webansicht wurde beendet. Bitte lade GradeCrew erneut."
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
        configuration.applicationNameForUserAgent = "GradeCrew-iOS/\(GradeCrewAppEnvironment.version)"

        let webView = WKWebView(frame: .zero, configuration: configuration)
        webView.navigationDelegate = context.coordinator
        webView.uiDelegate = context.coordinator
        webView.allowsBackForwardNavigationGestures = true
        webView.scrollView.keyboardDismissMode = .interactive
        webView.scrollView.contentInsetAdjustmentBehavior = .automatic
        webView.isOpaque = false
        webView.backgroundColor = .clear
        return webView
    }

    static func dismantleUIView(_ webView: WKWebView, coordinator: Coordinator) {
        coordinator.cancelActiveDialog()
        webView.stopLoading()
        webView.navigationDelegate = nil
        webView.uiDelegate = nil
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

        if context.coordinator.lastReloadID != reloadID || context.coordinator.lastURL != url {
            context.coordinator.cancelActiveDialog()
            context.coordinator.lastURL = url
            context.coordinator.lastReloadID = reloadID
            isLoading = true
            webView.load(URLRequest(url: url))
        }
    }
}


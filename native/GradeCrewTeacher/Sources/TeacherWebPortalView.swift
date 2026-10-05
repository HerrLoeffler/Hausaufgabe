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
    var onShowDiagnostics: (() -> Void)? = nil
    var onLoadedURLChanged: ((URL?) -> Void)? = nil
    var onWebManifestCommitChanged: ((String?) -> Void)? = nil

    final class Coordinator: NSObject, WKNavigationDelegate, WKUIDelegate, WKDownloadDelegate {
        var parent: GradeCrewWebView
        var didLoadInitialURL = false
        var lastURL: URL
        var lastReloadID: Int
        private var cancelDialog: (() -> Void)?
        private weak var hostWebView: WKWebView?
        private var downloadDestinations: [ObjectIdentifier: URL] = [:]
        let nativeBridge = GradeCrewNativeBridge()
        private var latestNavigation: WKNavigation?
        private var requestedMainURL: URL?

        init(parent: GradeCrewWebView) {
            self.parent = parent
            self.lastReloadID = parent.reloadID
            self.lastURL = parent.url
        }

        @objc func handleDiagnosticsGesture(_ gesture: UILongPressGestureRecognizer) {
            guard gesture.state == .began else { return }
            parent.onShowDiagnostics?()
        }

        func webView(_ webView: WKWebView, didStartProvisionalNavigation navigation: WKNavigation!) {
            latestNavigation = navigation
            nativeBridge.beginNavigation()
            parent.isLoading = true
            parent.errorMessage = nil
            parent.onLoadedURLChanged?(nil)
            parent.onWebManifestCommitChanged?(nil)
        }

        func webView(_ webView: WKWebView, didCommit navigation: WKNavigation!) {
            guard navigation === latestNavigation else { return }
            nativeBridge.didCommitNavigation()
        }

        func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
            guard navigation === latestNavigation else { return }
            parent.isLoading = false
            parent.errorMessage = nil
            parent.onLoadedURLChanged?(webView.url)
            let loadedURL = webView.url
            webView.callAsyncJavaScript("return await window.GradeCrewNative.diagnostics();", arguments: [:], in: nil, in: .page) { [weak self, weak webView] result in
                guard let self, let webView, navigation === self.latestNavigation, webView.url == loadedURL else { return }
                if case let .success(value) = result, let diagnostics = value as? [String: Any] {
                    self.parent.onWebManifestCommitChanged?(diagnostics["webManifestCommit"] as? String)
                } else { self.parent.onWebManifestCommitChanged?(nil) }
            }
        }

        func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
            guard navigation === latestNavigation else { return }
            finishWith(error: error)
        }

        func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
            guard navigation === latestNavigation else { return }
            if nativeBridge.restoreAfterFailedNavigation() {
                parent.isLoading = false
                parent.onLoadedURLChanged?(webView.url)
            }
            finishWith(error: error)
        }

        private func finishWith(error: Error) {
            if (error as NSError).code == NSURLErrorCancelled { return }
            parent.isLoading = false
            parent.errorMessage = error.localizedDescription
        }

        private func openExternallyIfNeeded(_ requestURL: URL, navigationType: WKNavigationType) -> Bool {
            let userActivated = navigationType == .linkActivated
            guard GradeCrewNavigationPolicy.shouldOpenExternally(
                requestURL,
                selectedBaseURL: parent.url,
                userActivated: userActivated
            ) else { return false }
            UIApplication.shared.open(requestURL)
            return true
        }

        func webView(
            _ webView: WKWebView,
            decidePolicyFor navigationAction: WKNavigationAction,
            preferences: WKWebpagePreferences,
            decisionHandler: @escaping (WKNavigationActionPolicy, WKWebpagePreferences) -> Void
        ) {
            if navigationAction.targetFrame?.isMainFrame != false {
                requestedMainURL = navigationAction.request.url
            }
            if let requestURL = navigationAction.request.url,
               openExternallyIfNeeded(requestURL, navigationType: navigationAction.navigationType) {
                decisionHandler(.cancel, preferences)
                return
            }
            if navigationAction.shouldPerformDownload {
                decisionHandler(.download, preferences)
                return
            }
            decisionHandler(.allow, preferences)
        }

        func webView(
            _ webView: WKWebView,
            decidePolicyFor navigationResponse: WKNavigationResponse,
            decisionHandler: @escaping (WKNavigationResponsePolicy) -> Void
        ) {
            let response = navigationResponse.response
            let disposition = (response as? HTTPURLResponse)?
                .value(forHTTPHeaderField: "Content-Disposition")?
                .lowercased() ?? ""
            if disposition.contains("attachment") || !navigationResponse.canShowMIMEType {
                decisionHandler(.download)
            } else {
                decisionHandler(.allow)
            }
        }

        func webView(_ webView: WKWebView, navigationAction: WKNavigationAction, didBecome download: WKDownload) {
            if navigationAction.request.url == requestedMainURL { nativeBridge.restoreAfterFailedNavigation() }
            hostWebView = webView
            download.delegate = self
        }

        func webView(_ webView: WKWebView, navigationResponse: WKNavigationResponse, didBecome download: WKDownload) {
            if navigationResponse.isForMainFrame && navigationResponse.response.url == requestedMainURL {
                nativeBridge.restoreAfterFailedNavigation()
            }
            hostWebView = webView
            download.delegate = self
        }

        func download(
            _ download: WKDownload,
            decideDestinationUsing response: URLResponse,
            suggestedFilename: String,
            completionHandler: @escaping (URL?) -> Void
        ) {
            do {
                let root = FileManager.default.temporaryDirectory
                    .appendingPathComponent("GradeCrewDownloads", isDirectory: true)
                    .appendingPathComponent(UUID().uuidString, isDirectory: true)
                try FileManager.default.createDirectory(at: root, withIntermediateDirectories: true)
                let filename = GradeCrewNavigationPolicy.safeDownloadFilename(suggestedFilename)
                let destination = root.appendingPathComponent(filename, isDirectory: false)
                downloadDestinations[ObjectIdentifier(download)] = destination
                completionHandler(destination)
            } catch {
                completionHandler(nil)
                presentDownloadError("Der Download konnte nicht vorbereitet werden.")
            }
        }

        func downloadDidFinish(_ download: WKDownload) {
            guard let destination = downloadDestinations.removeValue(forKey: ObjectIdentifier(download)) else { return }
            guard let webView = hostWebView else {
                cleanupDownloadedFile(destination)
                return
            }
            presentShareSheet(for: destination, in: webView)
        }

        func download(_ download: WKDownload, didFailWithError error: Error, resumeData: Data?) {
            if let destination = downloadDestinations.removeValue(forKey: ObjectIdentifier(download)) {
                cleanupDownloadedFile(destination)
            }
            presentDownloadError("Der Download ist fehlgeschlagen: \(error.localizedDescription)")
        }

        private func cleanupDownloadedFile(_ fileURL: URL) {
            try? FileManager.default.removeItem(at: fileURL.deletingLastPathComponent())
        }

        private func presentShareSheet(for fileURL: URL, in webView: WKWebView) {
            guard let presenter = topPresenter(for: webView) else {
                cleanupDownloadedFile(fileURL)
                return
            }
            let share = UIActivityViewController(activityItems: [fileURL], applicationActivities: nil)
            if let popover = share.popoverPresentationController {
                popover.sourceView = webView
                popover.sourceRect = CGRect(x: webView.bounds.midX, y: webView.bounds.midY, width: 1, height: 1)
                popover.permittedArrowDirections = []
            }
            share.completionWithItemsHandler = { [weak self] _, _, _, _ in
                self?.cleanupDownloadedFile(fileURL)
            }
            presenter.present(share, animated: true)
        }

        private func presentDownloadError(_ message: String) {
            guard let webView = hostWebView, let presenter = topPresenter(for: webView),
                  !(presenter is UIAlertController) else { return }
            let alert = UIAlertController(title: "GradeCrew Download", message: message, preferredStyle: .alert)
            alert.addAction(UIAlertAction(title: "OK", style: .default))
            presenter.present(alert, animated: true)
        }

        // The web app uses confirm() for deleting tests and ending sessions.
        // Every WebKit callback must finish exactly once, including teardown.
        private func presenter(for webView: WKWebView) -> UIViewController? {
            var responder: UIResponder? = webView
            while let current = responder, !(current is UIViewController) { responder = current.next }
            guard let presenter = responder as? UIViewController,
                  presenter.viewIfLoaded?.window != nil else { return nil }
            return presenter
        }

        private func topPresenter(for webView: WKWebView) -> UIViewController? {
            guard var current = presenter(for: webView) else { return nil }
            while let next = current.presentedViewController { current = next }
            return current
        }

        private func presentDialog(_ alert: UIAlertController, in webView: WKWebView, fallback: @escaping () -> Void) {
            cancelActiveDialog()
            guard let presenter = presenter(for: webView), presenter.presentedViewController == nil else {
                fallback()
                return
            }
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

        func webView(
            _ webView: WKWebView,
            requestMediaCapturePermissionFor origin: WKSecurityOrigin,
            initiatedByFrame frame: WKFrameInfo,
            type: WKMediaCaptureType,
            decisionHandler: @escaping (WKPermissionDecision) -> Void
        ) {
            let trusted = GradeCrewNavigationPolicy.isTrustedHost(origin.host, selectedBaseURL: parent.url)
            decisionHandler(trusted ? .grant : .deny)
        }

        func webViewWebContentProcessDidTerminate(_ webView: WKWebView) {
            cancelActiveDialog()
            nativeBridge.beginNavigation()
            parent.onLoadedURLChanged?(nil)
            parent.onWebManifestCommitChanged?(nil)
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
            if navigationAction.shouldPerformDownload {
                webView.load(navigationAction.request)
            } else if !openExternallyIfNeeded(requestURL, navigationType: navigationAction.navigationType) {
                webView.load(URLRequest(url: requestURL))
            }
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
        context.coordinator.nativeBridge.attach(to: webView, selectedBaseURL: url)
        webView.navigationDelegate = context.coordinator
        webView.uiDelegate = context.coordinator
        webView.allowsBackForwardNavigationGestures = true
        webView.scrollView.keyboardDismissMode = .interactive
        webView.scrollView.contentInsetAdjustmentBehavior = .automatic
        webView.isOpaque = false
        webView.backgroundColor = .clear

        if onShowDiagnostics != nil {
            let gesture = UILongPressGestureRecognizer(
                target: context.coordinator,
                action: #selector(Coordinator.handleDiagnosticsGesture(_:))
            )
            gesture.minimumPressDuration = 1.0
            gesture.numberOfTouchesRequired = 2
            gesture.cancelsTouchesInView = false
            webView.addGestureRecognizer(gesture)
        }
        return webView
    }

    static func dismantleUIView(_ webView: WKWebView, coordinator: Coordinator) {
        coordinator.cancelActiveDialog()
        coordinator.nativeBridge.detach()
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
            context.coordinator.nativeBridge.attach(to: webView, selectedBaseURL: url)
            context.coordinator.lastURL = url
            context.coordinator.lastReloadID = reloadID
            isLoading = true
            webView.load(URLRequest(url: url))
        }
    }
}

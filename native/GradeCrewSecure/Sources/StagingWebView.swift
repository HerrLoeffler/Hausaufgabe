import SwiftUI
import WebKit

// This is a navigation boundary, NOT server authentication or exam attestation.
enum StagingPolicy {
    static let host = "hausaufgabe-staging.web.app"
    static func testURL(code: String) -> URL? {
        let normalized = code.trimmingCharacters(in: .whitespacesAndNewlines).uppercased()
        guard normalized.range(of: "^[A-Z0-9]{4,16}$", options: .regularExpression) != nil else { return nil }
        var components = URLComponents()
        components.scheme = "https"
        components.host = host
        components.path = "/"
        components.queryItems = [URLQueryItem(name: "test", value: normalized)]
        return components.url
    }
    static func allows(_ url: URL?) -> Bool {
        guard let url else { return false }
        return url.scheme == "https" && url.host == host &&
            (url.port == nil || url.port == 443) && url.user == nil && url.password == nil
    }
}

struct PreviewScreen: View {
    let url: URL
    @Environment(\.dismiss) private var dismiss
    @State private var message: String?
    @State private var showClose = false
    @State private var reloadID = UUID()
    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                Text("STAGING-VORSCHAU · KEINE GERÄTESPERRE")
                    .font(.caption.bold()).padding(10).frame(maxWidth: .infinity)
                    .background(Color.orange.opacity(0.15))
                if let message {
                    VStack(spacing: 16) {
                        Image(systemName: "wifi.exclamationmark").font(.largeTitle)
                        Text(message).multilineTextAlignment(.center)
                        Text("Vor dem Neuladen können ungespeicherte Antworten verloren gehen.")
                            .font(.footnote)
                        Button("Vorschau neu laden") { self.message = nil; reloadID = UUID() }
                            .buttonStyle(.borderedProminent)
                    }.padding().frame(maxWidth: .infinity, maxHeight: .infinity)
                } else {
                    StagingWebView(url: url) { message = $0 }.id(reloadID)
                }
            }
            .navigationTitle("Übungstest").navigationBarTitleDisplayMode(.inline)
            .toolbar { ToolbarItem(placement: .cancellationAction) {
                Button("Schließen") { showClose = true }
            }}
            .confirmationDialog("Vorschau schließen? Ungespeicherte Antworten können verloren gehen.", isPresented: $showClose, titleVisibility: .visible) {
                Button("Vorschau schließen", role: .destructive) { dismiss() }
            }
        }.interactiveDismissDisabled()
    }
}

struct StagingWebView: UIViewRepresentable {
    let url: URL
    let onError: (String) -> Void
    func makeCoordinator() -> Coordinator { Coordinator(onError: onError) }
    func makeUIView(context: Context) -> WKWebView {
        let configuration = WKWebViewConfiguration()
        // No teacher login persistence or native JS message handlers in this PoC.
        configuration.websiteDataStore = .nonPersistent()
        configuration.preferences.javaScriptCanOpenWindowsAutomatically = false
        let webView = WKWebView(frame: .zero, configuration: configuration)
        webView.navigationDelegate = context.coordinator
        webView.uiDelegate = context.coordinator
        webView.allowsBackForwardNavigationGestures = false
        webView.allowsLinkPreview = false
        if StagingPolicy.allows(url) { webView.load(URLRequest(url: url)) }
        return webView
    }
    func updateUIView(_ webView: WKWebView, context: Context) {}
    static func dismantleUIView(_ webView: WKWebView, coordinator: Coordinator) {
        webView.stopLoading()
        webView.navigationDelegate = nil
        webView.uiDelegate = nil
    }
    final class Coordinator: NSObject, WKNavigationDelegate, WKUIDelegate {
        let onError: (String) -> Void
        init(onError: @escaping (String) -> Void) { self.onError = onError }
        func webView(_ webView: WKWebView, decidePolicyFor action: WKNavigationAction,
                     decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
            decisionHandler(action.targetFrame != nil && StagingPolicy.allows(action.request.url) ? .allow : .cancel)
        }
        func webView(_ webView: WKWebView, decidePolicyFor response: WKNavigationResponse,
                     decisionHandler: @escaping (WKNavigationResponsePolicy) -> Void) {
            decisionHandler(response.canShowMIMEType && StagingPolicy.allows(response.response.url) ? .allow : .cancel)
        }
        func webView(_ webView: WKWebView, createWebViewWith configuration: WKWebViewConfiguration,
                     for navigationAction: WKNavigationAction, windowFeatures: WKWindowFeatures) -> WKWebView? { nil }
        func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
            report(error)
        }
        func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) { report(error) }
        func webViewWebContentProcessDidTerminate(_ webView: WKWebView) {
            onError("Die Webansicht wurde beendet. Bitte die Lehrkraft informieren.")
        }
        private func report(_ error: Error) {
            guard (error as NSError).code != NSURLErrorCancelled else { return }
            onError("Die Staging-Seite konnte nicht geladen werden. Prüfe die Internetverbindung.")
        }
    }
}

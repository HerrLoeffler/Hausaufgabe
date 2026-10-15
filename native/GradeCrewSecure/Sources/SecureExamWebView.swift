import SwiftUI
import WebKit

struct SecureExamWebView: UIViewRepresentable {
    let payload: [String: Any]
    let answers: [String: Any]
    let revision: Int
    let coordinator: SecureExamCoordinator

    func makeCoordinator() -> Bridge { Bridge(coordinator) }
    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.websiteDataStore = .nonPersistent()
        config.preferences.javaScriptCanOpenWindowsAutomatically = false
        var bootstrap = payload
        bootstrap["answers"] = answers
        bootstrap["revision"] = revision
        let bytes = (try? JSONSerialization.data(withJSONObject: bootstrap)) ?? Data("{}".utf8)
        let script = "window.__GC_EXAM__=" + String(decoding: bytes, as: UTF8.self) + ";"
        config.userContentController.addUserScript(WKUserScript(source: script, injectionTime: .atDocumentStart, forMainFrameOnly: true))
        config.userContentController.add(context.coordinator, name: "gradecrewSecure")
        let view = WKWebView(frame: .zero, configuration: config)
        view.navigationDelegate = context.coordinator
        view.allowsBackForwardNavigationGestures = false
        view.allowsLinkPreview = false
        view.isInspectable = false
        view.backgroundColor = UIColor(red:0.96, green:0.97, blue:0.98, alpha:1)
        if let url = Bundle.main.url(forResource: "index", withExtension: "html", subdirectory: "Exam") {
            context.coordinator.document = url
            view.loadFileURL(url, allowingReadAccessTo: url.deletingLastPathComponent())
        }
        coordinator.webView = view
        return view
    }
    func updateUIView(_ uiView: WKWebView, context: Context) {}
    static func dismantleUIView(_ uiView: WKWebView, coordinator: Bridge) {
        uiView.configuration.userContentController.removeScriptMessageHandler(forName: "gradecrewSecure")
        uiView.navigationDelegate = nil
    }
    @MainActor final class Bridge: NSObject, WKNavigationDelegate, WKScriptMessageHandler {
        weak var model: SecureExamCoordinator?
        var document: URL?
        init(_ model: SecureExamCoordinator) { self.model = model }
        func webView(_ webView: WKWebView, decidePolicyFor action: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
            decisionHandler(action.targetFrame?.isMainFrame == true && action.request.url == document ? .allow : .cancel)
        }
        func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
            guard message.name == "gradecrewSecure", message.frameInfo.isMainFrame,
                  message.frameInfo.request.url == document,
                  let data = message.body as? [String: Any] else { return }
            if data["type"] as? String == "snapshot", let revision = data["revision"] as? Int, let answers = data["answers"] as? [String: Any] {
                model?.snapshot(revision: revision, answers: answers)
            }
        }
        func webViewWebContentProcessDidTerminate(_ webView: WKWebView) {
            // Recreate the local renderer from the protected native snapshot; no new attempt.
            guard let document else { return }
            let answers = model?.restoredAnswers ?? [:]
            if let data = try? JSONSerialization.data(withJSONObject: answers) {
                webView.configuration.userContentController.addUserScript(WKUserScript(source: "window.__GC_EXAM__.answers=" + String(decoding:data, as:UTF8.self) + ";window.__GC_EXAM__.revision=\(model?.savedRevision ?? 0);", injectionTime:.atDocumentStart, forMainFrameOnly:true))
            }
            webView.loadFileURL(document, allowingReadAccessTo: document.deletingLastPathComponent())
        }
    }
}

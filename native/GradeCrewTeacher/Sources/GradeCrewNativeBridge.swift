import Foundation
import UIKit
import WebKit

/// Owns bridge replies and temporary files for one WebView, never its login/data.
final class GradeCrewNativeBridge: NSObject, WKScriptMessageHandlerWithReply {
    private weak var webView: WKWebView?
    private var selectedBaseURL: URL?
    private var documentState = GradeCrewNativeBridgePolicy.DocumentState()
    private struct PendingShare {
        let file: URL
        let controller: UIActivityViewController
        let reply: (Any?, String?) -> Void
    }
    private var pending: PendingShare?

    func attach(to webView: WKWebView, selectedBaseURL: URL) {
        detach()
        self.webView = webView
        self.selectedBaseURL = selectedBaseURL
        guard let resource = Bundle.main.url(forResource: "gradecrew-native-bridge", withExtension: "js"),
              let source = try? String(contentsOf: resource, encoding: .utf8),
              let host = selectedBaseURL.host else { return }
        let config = ["origin": "https://\(host)"]
        guard let data = try? JSONSerialization.data(withJSONObject: config),
              let json = String(data: data, encoding: .utf8) else { return }
        let controller = webView.configuration.userContentController
        controller.addScriptMessageHandler(self, contentWorld: .page, name: "gradecrewNative")
        controller.addUserScript(WKUserScript(source: source.replacingOccurrences(of: "__GRADECREW_CONFIG__", with: json),
                                             injectionTime: .atDocumentStart, forMainFrameOnly: true))
    }

    func cancelPendingRequest() {
        guard let share = pending else { return }
        pending = nil
        share.controller.dismiss(animated: false)
        GradeCrewNativeBridgePolicy.removeTemporaryFile(share.file)
        share.reply(["ok": true, "result": ["status": "cancelled"]], nil)
    }

    func beginNavigation() {
        documentState.beginNavigation()
        cancelPendingRequest()
    }

    func didCommitNavigation() { documentState.commit(webView?.url) }

    @discardableResult
    func restoreAfterFailedNavigation() -> Bool {
        guard let selectedBaseURL else { return false }
        return documentState.restoreAfterFailedNavigation(loadedURL: webView?.url, selectedBaseURL: selectedBaseURL)
    }

    func detach() {
        cancelPendingRequest()
        documentState = GradeCrewNativeBridgePolicy.DocumentState()
        if let controller = webView?.configuration.userContentController {
            controller.removeScriptMessageHandler(forName: "gradecrewNative", contentWorld: .page)
            controller.removeAllUserScripts()
        }
        webView = nil
        selectedBaseURL = nil
    }

    func userContentController(_ userContentController: WKUserContentController,
                               didReceive message: WKScriptMessage,
                               replyHandler: @escaping (Any?, String?) -> Void) {
        guard documentState.isReady, let webView, let selectedBaseURL,
              message.webView === webView,
              message.frameInfo.securityOrigin.protocol == "https",
              message.frameInfo.securityOrigin.host.lowercased() == selectedBaseURL.host?.lowercased(),
              [0, 443].contains(message.frameInfo.securityOrigin.port) else {
            reject("forbidden", "Diese Seite darf keine native Aktion ausführen.", replyHandler)
            return
        }
        let request: GradeCrewNativeBridgePolicy.Request
        do {
            request = try GradeCrewNativeBridgePolicy.validate(body: message.body, sourceURL: message.frameInfo.request.url,
                                                              loadedURL: webView.url, isMainFrame: message.frameInfo.isMainFrame,
                                                              selectedBaseURL: selectedBaseURL)
        } catch let failure as GradeCrewNativeBridgePolicy.Failure {
            let description: String
            switch failure {
            case .forbidden: description = "Diese Seite darf keine native Aktion ausführen."
            case .fileTooLarge: description = "Die Datei ist zu groß. Maximal 12 MB können direkt geteilt werden."
            case .unsupportedFile: description = "Dieser Dateityp kann nicht direkt geteilt werden."
            case .invalidRequest: description = "Die native Anfrage oder Datei ist ungültig."
            }
            reject(failure.rawValue, description, replyHandler)
            return
        } catch {
            reject("invalidRequest", "Die native Anfrage ist ungültig.", replyHandler)
            return
        }
        switch request.action {
        case "capabilities":
            replyHandler(["ok": true, "result": ["version": 1, "actions": ["shareFile", "diagnostics"],
                                                  "maximumFileBytes": GradeCrewNativeBridgePolicy.maximumFileBytes]], nil)
        case "diagnostics":
            replyHandler(["ok": true, "result": ["appVersion": GradeCrewAppEnvironment.version,
                                                  "build": Bundle.main.object(forInfoDictionaryKey: "CFBundleVersion") as? String ?? "unknown",
                                                  "bridgeVersion": 1, "loadedHost": webView.url?.host ?? "unknown"]], nil)
        case "shareFile":
            guard let file = request.file else { reject("invalidRequest", "Die Datei fehlt.", replyHandler); return }
            share(file, in: webView, reply: replyHandler)
        default:
            reject("unsupportedAction", "Diese native Aktion ist nicht verfügbar.", replyHandler)
        }
    }

    private func reject(_ code: String, _ message: String, _ reply: (Any?, String?) -> Void) {
        reply(["ok": false, "error": ["code": code, "message": message]], nil)
    }

    private func share(_ file: GradeCrewNativeBridgePolicy.File, in webView: WKWebView, reply: @escaping (Any?, String?) -> Void) {
        var responder: UIResponder? = webView
        while let current = responder, !(current is UIViewController) { responder = current.next }
        guard pending == nil, let presenter = responder as? UIViewController,
              presenter.viewIfLoaded?.window != nil, presenter.presentedViewController == nil else {
            reject("busy", "Bitte zuerst das geöffnete Menü schließen und dann erneut teilen.", reply)
            return
        }
        let destination: URL
        do { destination = try GradeCrewNativeBridgePolicy.writeTemporaryFile(file) }
        catch { reject("writeFailed", "Die Datei konnte nicht zum Teilen vorbereitet werden.", reply); return }
        let controller = UIActivityViewController(activityItems: [destination], applicationActivities: nil)
        if let popover = controller.popoverPresentationController {
            popover.sourceView = webView
            popover.sourceRect = CGRect(x: webView.bounds.midX, y: webView.bounds.midY, width: 1, height: 1)
            popover.permittedArrowDirections = []
        }
        controller.completionWithItemsHandler = { [weak self, weak controller] _, completed, _, error in
            guard let self, let controller, let share = self.pending, share.controller === controller else { return }
            self.pending = nil
            GradeCrewNativeBridgePolicy.removeTemporaryFile(share.file)
            if error != nil { self.reject("shareFailed", "Die Datei konnte nicht geteilt werden.", share.reply) }
            else { share.reply(["ok": true, "result": ["status": completed ? "completed" : "cancelled"]], nil) }
        }
        pending = PendingShare(file: destination, controller: controller, reply: reply)
        presenter.present(controller, animated: true)
    }
}

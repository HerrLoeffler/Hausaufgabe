import AppKit
import WebKit

final class CentralApp: NSObject, NSApplicationDelegate, NSWindowDelegate, WKNavigationDelegate, WKUIDelegate, WKDownloadDelegate {
    var window: NSWindow!
    var web: WKWebView!
    var status: NSTextField!
    var retry: NSButton!
    var stack: NSStackView!
    var origin: URL?
    var starting = false
    var downloads: [WKDownload] = []

    func applicationDidFinishLaunching(_ notification: Notification) {
        NSApp.setActivationPolicy(.regular)
        NSApp.appearance = NSAppearance(named: .darkAqua)
        makeMenus()
        window = NSWindow(contentRect: NSRect(x: 0, y: 0, width: 1280, height: 820), styleMask: [.titled, .closable, .miniaturizable, .resizable], backing: .buffered, defer: false)
        window.title = "GradeCrew Zentrale"
        window.minSize = NSSize(width: 900, height: 620)
        window.backgroundColor = NSColor(srgbRed: 0.035, green: 0.06, blue: 0.11, alpha: 1)
        window.isReleasedWhenClosed = false
        window.delegate = self
        window.center()
        window.setFrameAutosaveName("GradeCrewCentralWindow")
        let root = NSView(); window.contentView = root
        let config = WKWebViewConfiguration()
        config.websiteDataStore = .default()
        web = WKWebView(frame: .zero, configuration: config)
        web.navigationDelegate = self; web.uiDelegate = self
        web.underPageBackgroundColor = window.backgroundColor
        web.allowsBackForwardNavigationGestures = true
        web.translatesAutoresizingMaskIntoConstraints = false
        root.addSubview(web)
        NSLayoutConstraint.activate([web.leadingAnchor.constraint(equalTo: root.leadingAnchor), web.trailingAnchor.constraint(equalTo: root.trailingAnchor), web.topAnchor.constraint(equalTo: root.topAnchor), web.bottomAnchor.constraint(equalTo: root.bottomAnchor)])
        status = NSTextField(wrappingLabelWithString: "Die Zentrale startet …")
        status.font = .systemFont(ofSize: 17, weight: .medium); status.alignment = .center
        status.textColor = .labelColor
        retry = NSButton(title: "Erneut versuchen", target: self, action: #selector(start))
        retry.bezelStyle = .rounded
        stack = NSStackView(views: [status, retry]); stack.orientation = .vertical; stack.spacing = 20
        stack.translatesAutoresizingMaskIntoConstraints = false; root.addSubview(stack)
        NSLayoutConstraint.activate([stack.centerXAnchor.constraint(equalTo: root.centerXAnchor), stack.centerYAnchor.constraint(equalTo: root.centerYAnchor), stack.widthAnchor.constraint(lessThanOrEqualToConstant: 580)])
        showWindow(); start()
    }
    func makeMenus() {
        let main = NSMenu()
        func group(_ title: String) -> NSMenu {
            let item = NSMenuItem(); let menu = NSMenu(title: title); item.submenu = menu; main.addItem(item); return menu
        }
        let app = group("GradeCrew Zentrale")
        app.addItem(withTitle: "Über GradeCrew Zentrale", action: #selector(about), keyEquivalent: "")
        app.addItem(.separator())
        app.addItem(withTitle: "GradeCrew Zentrale ausblenden", action: #selector(NSApplication.hide(_:)), keyEquivalent: "h")
        app.addItem(withTitle: "GradeCrew Zentrale beenden", action: #selector(NSApplication.terminate(_:)), keyEquivalent: "q")
        let edit = group("Bearbeiten")
        for (title, selector, key) in [("Widerrufen", "undo:", "z"), ("Ausschneiden", "cut:", "x"), ("Kopieren", "copy:", "c"), ("Einsetzen", "paste:", "v"), ("Alles auswählen", "selectAll:", "a")] {
            edit.addItem(withTitle: title, action: Selector(selector), keyEquivalent: key)
        }
        let view = group("Ansicht")
        view.addItem(withTitle: "Neu laden", action: #selector(reload), keyEquivalent: "r")
        view.addItem(withTitle: "Im Browser öffnen", action: #selector(openBrowser), keyEquivalent: "")
        let windows = group("Fenster")
        windows.addItem(withTitle: "Zentrale öffnen", action: #selector(showWindow), keyEquivalent: "0")
        windows.addItem(withTitle: "Minimieren", action: #selector(NSWindow.miniaturize(_:)), keyEquivalent: "m")
        NSApp.windowsMenu = windows; NSApp.mainMenu = main
    }
    @objc func showWindow() { window?.makeKeyAndOrderFront(nil); NSApp.activate(ignoringOtherApps: true) }
    func applicationShouldHandleReopen(_ sender: NSApplication, hasVisibleWindows flag: Bool) -> Bool { showWindow(); return true }
    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool { false }
    @objc func about() {
        let alert = NSAlert(); alert.messageText = "GradeCrew Zentrale"
        alert.informativeText = "Deine Firmenzentrale auf diesem Mac.\n\nAufträge und Ergebnisse bleiben im bisherigen lokalen Datenbestand. Der lokale Dienst arbeitet auch nach dem Schließen der App weiter. Für neue KI-Aufträge wird die bestehende Codex-Anmeldung verwendet.\n\nLokale Version 0.2 · Live bleibt unverändert."
        alert.runModal()
    }
    func message(_ text: String, retryable: Bool) {
        web.isHidden = true; stack.isHidden = false; status.stringValue = text; retry.isHidden = !retryable
    }
    @objc func start() {
        guard !starting, let resources = Bundle.main.resourceURL else { return }
        starting = true; message("Die Zentrale startet …", retryable: false)
        DispatchQueue.global(qos: .userInitiated).async {
            var result: [String: Any] = [:]
            do {
                let process = Process(); let pipe = Pipe()
                let python = resources.appendingPathComponent("Python")
                process.executableURL = python.appendingPathComponent("bin/python3.12")
                process.arguments = ["-s", resources.appendingPathComponent("Workspace/tools/central_desktop.py").path, resources.path]
                var env = ProcessInfo.processInfo.environment.filter { !$0.key.hasPrefix("PYTHON") }
                env["PYTHONHOME"] = python.path; env["PYTHONDONTWRITEBYTECODE"] = "1"; env["PYTHONNOUSERSITE"] = "1"
                process.environment = env; process.currentDirectoryURL = resources
                process.standardOutput = pipe; process.standardError = FileHandle.nullDevice; process.standardInput = FileHandle.nullDevice
                try process.run()
                let data = pipe.fileHandleForReading.readDataToEndOfFile(); process.waitUntilExit()
                result = (try? JSONSerialization.jsonObject(with: data)) as? [String: Any] ?? [:]
            } catch { result = ["error": "Die App konnte ihren lokalen Dienst nicht starten. Bitte das App-Paket prüfen."] }
            let output = result
            DispatchQueue.main.async {
                self.starting = false
                guard let raw = output["url"] as? String, let url = URL(string: raw), url.scheme == "http", url.host == "127.0.0.1", url.port == 8796 else {
                    self.message(output["error"] as? String ?? "Der Start ist fehlgeschlagen. Bitte erneut versuchen.", retryable: true); return
                }
                self.origin = url
                self.web.load(URLRequest(url: url))
            }
        }
    }
    @objc func reload() { if origin == nil { start() } else { web.reload() } }
    @objc func openBrowser() { if let url = web.url ?? origin { NSWorkspace.shared.open(url) } }
    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        stack.isHidden = true; web.isHidden = false; window.makeFirstResponder(web)
    }
    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        if (error as NSError).code != NSURLErrorCancelled { message("Die Zentrale ist gerade nicht erreichbar. Erneut versuchen verbindet sie wieder mit ihrem Datenbestand.", retryable: true) }
    }
    func webViewWebContentProcessDidTerminate(_ webView: WKWebView) { message("Das Fenster muss neu geladen werden. Deine gespeicherten Aufträge bleiben erhalten.", retryable: true) }
    func webView(_ webView: WKWebView, decidePolicyFor action: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        guard let url = action.request.url, let base = origin else { decisionHandler(.cancel); return }
        switch destination(url, origin: base, userLink: action.navigationType == .linkActivated) {
        case .local: decisionHandler(action.shouldPerformDownload ? .download : .allow)
        case .download: decisionHandler(.download)
        case .external, .chat: NSWorkspace.shared.open(url); decisionHandler(.cancel)
        case .deny: decisionHandler(.cancel)
        }
    }
    func webView(_ webView: WKWebView, createWebViewWith configuration: WKWebViewConfiguration, for action: WKNavigationAction, windowFeatures: WKWindowFeatures) -> WKWebView? {
        guard let url = action.request.url, let base = origin else { return nil }
        switch destination(url, origin: base, userLink: action.navigationType == .linkActivated) {
        case .local: web.load(action.request)
        case .external, .chat: NSWorkspace.shared.open(url)
        default: break
        }
        return nil
    }
    func webView(_ webView: WKWebView, navigationAction: WKNavigationAction, didBecome download: WKDownload) { download.delegate = self; downloads.append(download) }
    func download(_ download: WKDownload, decideDestinationUsing response: URLResponse, suggestedFilename: String, completionHandler: @escaping (URL?) -> Void) {
        let panel = NSSavePanel(); panel.title = "Bericht speichern"
        panel.nameFieldStringValue = URL(fileURLWithPath: suggestedFilename).lastPathComponent
        panel.beginSheetModal(for: window) { result in completionHandler(result == .OK ? panel.url : nil) }
    }
    func downloadDidFinish(_ download: WKDownload) { downloads.removeAll { $0 === download } }
    func download(_ download: WKDownload, didFailWithError error: Error, resumeData: Data?) {
        downloads.removeAll { $0 === download }
        if (error as NSError).code == NSURLErrorCancelled { return }
        let alert = NSAlert(); alert.messageText = "Bericht konnte nicht gespeichert werden"
        alert.informativeText = "Das Ergebnis bleibt im Eingang erhalten. Bitte einen anderen Speicherort wählen."
        alert.beginSheetModal(for: window)
    }
}

@main struct Main {
    static func main() {
        let app = NSApplication.shared
        let delegate = CentralApp(); app.delegate = delegate
        withExtendedLifetime(delegate) { app.run() }
    }
}

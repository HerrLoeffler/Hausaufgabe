import AppKit
import WebKit

final class AppDelegate: NSObject, NSApplicationDelegate, WKNavigationDelegate {
 var window: NSWindow!
 var web: WKWebView!
 var worker: Process?
 var checks = 0
 let homeURL = URL(string: "http://127.0.0.1:4318")!
 func applicationDidFinishLaunching(_ notification: Notification) {
  let menu = NSMenu(); let item = NSMenuItem(); menu.addItem(item)
  let appMenu = NSMenu(); appMenu.addItem(withTitle: "GradeCrew beenden", action: #selector(NSApplication.terminate(_:)), keyEquivalent: "q"); item.submenu = appMenu; NSApp.mainMenu = menu
  web = WKWebView(frame: .zero); web.navigationDelegate = self
  window = NSWindow(contentRect: NSRect(x: 0, y: 0, width: 1280, height: 850), styleMask: [.titled,.closable,.miniaturizable,.resizable], backing: .buffered, defer: false)
  window.title = "GradeCrew · Entwicklungszentrale"; window.minSize = NSSize(width: 760, height: 580)
  window.contentView = web; window.center(); window.makeKeyAndOrderFront(nil); NSApp.activate(ignoringOtherApps: true)
  checkServer()
 }
 func checkServer() {
  let request = URLRequest(url: homeURL.appendingPathComponent("api/bootstrap"), timeoutInterval: 1)
  URLSession.shared.dataTask(with: request) { data, _, _ in
   let object = data.flatMap { try? JSONSerialization.jsonObject(with: $0) } as? [String:Any]
   DispatchQueue.main.async {
    if object?["service"] as? String == "gradecrew-control" { self.web.load(URLRequest(url:self.homeURL)); return }
    if data != nil { self.showError("Port 4318 wird von einem anderen oder älteren Dienst verwendet. Bitte den bisherigen GradeCrew-Server beenden und die App erneut öffnen."); return }
    if self.checks == 0 { self.startServer() }
    self.checks += 1
    if self.checks > 12 { self.showError("Der lokale Dienst konnte nicht gestartet werden. Bitte die Codex-Laufzeit und die Auftragsablage prüfen."); return }
    DispatchQueue.main.asyncAfter(deadline:.now()+0.5) { self.checkServer() }
   }
  }.resume()
 }
 func startServer() {
  guard let resource = Bundle.main.resourceURL else { showError("App-Ressourcen fehlen."); return }
  let node = FileManager.default.homeDirectoryForCurrentUser.appendingPathComponent(".cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node")
  let task = Process(); task.executableURL = node; task.arguments = [resource.appendingPathComponent("server.mjs").path]
  var env = ProcessInfo.processInfo.environment
  env["GC_CONTROL_STATE_DIR"] = Bundle.main.object(forInfoDictionaryKey:"GCStateDirectory") as? String
  task.environment = env; task.standardOutput = FileHandle.nullDevice; task.standardError = FileHandle.nullDevice
  do { try task.run(); worker = task } catch { showError("Die vorhandene Codex-Node-Laufzeit konnte nicht gestartet werden: \(error.localizedDescription)") }
 }
 func showError(_ message:String) { let alert = NSAlert(); alert.messageText = "GradeCrew konnte nicht starten"; alert.informativeText = message; alert.runModal() }
 func webView(_ webView: WKWebView, decidePolicyFor action:WKNavigationAction, decisionHandler:@escaping (WKNavigationActionPolicy)->Void) {
  guard let url = action.request.url else { decisionHandler(.cancel); return }
  if url.host == "127.0.0.1", url.port == 4318 { decisionHandler(.allow); return }
  if action.navigationType == .linkActivated, ["https","http"].contains(url.scheme ?? "") { NSWorkspace.shared.open(url) }
  decisionHandler(.cancel)
 }
 func applicationShouldTerminateAfterLastWindowClosed(_ sender:NSApplication)->Bool { true }
 // Keep the local task service alive so Codex can return results after the window closes.
}
let application = NSApplication.shared
let delegate = AppDelegate(); application.delegate = delegate
application.setActivationPolicy(.regular)
application.run()

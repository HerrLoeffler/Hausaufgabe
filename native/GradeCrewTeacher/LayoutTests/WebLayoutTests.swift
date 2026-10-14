import XCTest
import WebKit
import UniformTypeIdentifiers
@testable import GradeCrewLayoutHost

private final class OfflineLayoutFiles: NSObject, WKURLSchemeHandler {
    let root: URL
    init(root: URL) { self.root = root }
    func webView(_ webView: WKWebView, start task: WKURLSchemeTask) {
        guard let url = task.request.url, url.host == "fixture" else { task.didFailWithError(URLError(.unsupportedURL)); return }
        let file = root.appendingPathComponent(url.path == "/" ? "index.html" : String(url.path.dropFirst())).standardizedFileURL
        guard file.path.hasPrefix(root.standardizedFileURL.path + "/"), let data = try? Data(contentsOf: file) else { task.didFailWithError(URLError(.fileDoesNotExist)); return }
        let mime = ["js":"application/javascript", "mjs":"application/javascript", "css":"text/css", "html":"text/html", "json":"application/json"][file.pathExtension] ?? UTType(filenameExtension: file.pathExtension)?.preferredMIMEType ?? "application/octet-stream"
        task.didReceive(URLResponse(url: url, mimeType: mime, expectedContentLength: data.count, textEncodingName: mime.hasPrefix("text/") || mime.contains("javascript") ? "utf-8" : nil))
        task.didReceive(data); task.didFinish()
    }
    func webView(_ webView: WKWebView, stop task: WKURLSchemeTask) {}
}
private final class OfflineNativeHandler: NSObject, WKScriptMessageHandler { func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {} }

@MainActor
final class WebLayoutTests: XCTestCase {
    private var window: UIWindow!
    private var web: WKWebView!
    private let handler = OfflineNativeHandler()
    override func tearDown() { web?.stopLoading(); web?.configuration.userContentController.removeScriptMessageHandler(forName: "gradecrewNative"); window?.isHidden = true; window?.rootViewController = nil; window = nil; web = nil; super.tearDown() }

    private func js(_ source: String) async throws -> Any? { try await web.evaluateJavaScript(source) }
    func testWebSmallPhone() async throws {
        for s in ["screen=workspace&lang=de&role=admin", "screen=workspace&lang=en&role=teacher", "screen=editor&lang=de&type=single", "screen=editor&lang=de&type=single&variant=media"] { try await check(s, viewport: LayoutViewport.matrix[0]) }
    }
    func testWebScreenMatrix() async throws {
        try LayoutReportStore.clear(prefix: "web-")
        let types = ["single","multi","text","dropdown","truefalse","gapfill","matching","ordering","grouping","markwords","number"]
        var scenarios = ["screen=workspace&lang=de&role=admin", "screen=workspace&lang=en&role=teacher", "screen=settings&lang=de&role=teacher"]
        scenarios += types.map { "screen=editor&lang=de&role=teacher&type=\($0)" }
        scenarios += ["screen=editor&lang=en&role=teacher&type=single&variant=longtext", "screen=editor&lang=de&role=teacher&type=single&variant=media", "screen=editor&lang=de&role=teacher&type=single&variant=readonly"]
        for viewport in LayoutViewport.matrix {
            for scenario in scenarios { try await check(scenario, viewport: viewport) }
        }
    }
    private func check(_ scenario: String, viewport: LayoutViewport) async throws {
        let root = Bundle.main.url(forResource: "GeneratedWeb", withExtension: nil)
        guard let root else { XCTFail("Missing offline fixture bundle; run prepare_web_fixtures.py"); return }
        let config = WKWebViewConfiguration()
        config.setURLSchemeHandler(OfflineLayoutFiles(root: root), forURLScheme: "gc-layout")
        config.userContentController.add(handler, name: "gradecrewNative")
        web = WKWebView(frame: CGRect(x: 0, y: 0, width: viewport.width, height: viewport.height), configuration: config)
        web.scrollView.contentInsetAdjustmentBehavior = .never
        let controller = UIViewController(); controller.view.addSubview(web)
        let scene = UIApplication.shared.connectedScenes.compactMap { $0 as? UIWindowScene }.first { $0.activationState == .foregroundActive }
        window = scene.map { UIWindow(windowScene: $0) } ?? UIWindow(frame: web.frame)
        window.frame = web.frame; window.rootViewController = controller; window.overrideUserInterfaceStyle = .light; window.makeKeyAndVisible()
        web.load(URLRequest(url: URL(string: "gc-layout://fixture/index.html?" + scenario)!))
        var ready = false
        for _ in 0..<100 {
            if (try? await js("window.gcLayoutReady === true")) as? Bool == true { ready = true; break }
            try await Task.sleep(nanoseconds: 100_000_000)
        }
        let name = "web-\(scenario.replacingOccurrences(of: "&", with: "-").replacingOccurrences(of: "=", with: "_"))-\(viewport.name)"
        let loadDetail = ready ? "" : String(describing: try? await js("window.gcLayoutError || document.body.innerText.slice(0,300)"))
        XCTAssertTrue(ready, "Fixture failed to become ready: \(name); \(loadDetail)")
        guard ready else { cleanup(); return }
        let width = try await js("innerWidth") as? Double
        XCTAssertEqual(width ?? 0, Double(viewport.width), accuracy: 1, "Wrong WebKit viewport")
        if scenario.hasPrefix("screen=workspace") {
            let probe = try await js("JSON.stringify(gcLayoutAuditSelfTest())") as? String ?? "{}"
            let result = try JSONSerialization.jsonObject(with: Data(probe.utf8)) as? [String: Any]
            XCTAssertEqual(result?["passed"] as? Bool, true, "WebKit negative-control audit failed: \(probe)")
        }
        var states: [[String: Any]] = []
        var issues: [[String: Any]] = []
        for position in ["top", "answers", "bottom"] {
            _ = try await js(Self.scrollScript(position))
            try await Task.sleep(nanoseconds: 100_000_000)
            let raw = try await js("JSON.stringify(window.gcLayoutAudit())") as? String ?? "{}"
            let audit = try JSONSerialization.jsonObject(with: Data(raw.utf8)) as? [String: Any] ?? [:]
            states.append(["position": position, "audit": audit])
            for var issue in audit["issues"] as? [[String: Any]] ?? [["rule":"missing-audit"]] {
                issue["position"] = position; issues.append(issue)
            }
            let captured = try await web.takeSnapshot(configuration: nil)
            if !LayoutReportStore.hasPaintedContent(captured) { issues.append(["rule": "blank-screenshot", "position": position]) }
            if position != "top", let png = captured.pngData() {
                try FileManager.default.createDirectory(at: LayoutReportStore.directory, withIntermediateDirectories: true)
                try png.write(to: LayoutReportStore.directory.appendingPathComponent(name + "-" + position + ".png"))
            }
        }
        _ = try await js(Self.scrollScript("top"))
        try await Task.sleep(nanoseconds: 30_000_000)
        let screenshot = try await web.takeSnapshot(configuration: nil)
        if !LayoutReportStore.hasPaintedContent(screenshot) { issues.append(["rule": "blank-screenshot", "position": "gallery"]) }
        let data = try JSONSerialization.data(withJSONObject: ["name": name, "issues": issues, "states": states], options: [.sortedKeys])
        try LayoutReportStore.save(name: name, json: data, image: screenshot)
        XCTContext.runActivity(named: name) { activity in
            let report = XCTAttachment(data: data, uniformTypeIdentifier: "public.json"); report.name = name + ".json"; report.lifetime = .keepAlways; activity.add(report)
            let image = XCTAttachment(image: screenshot); image.name = name + ".png"; image.lifetime = .keepAlways; activity.add(image)
        }
        XCTAssertTrue(issues.isEmpty, "\(name): \(issues)")
        cleanup()
    }
    private static func scrollScript(_ position: String) -> String {
        // The real SPA also uses nested scrolling sections. window.scrollTo alone
        // leaves their offsets intact and would falsely label a middle image as top.
        let action = position == "bottom" ? "for(const e of containers.reverse()) e.scrollTo({top:e.scrollHeight,left:0,behavior:'instant'}); window.scrollTo({top:document.scrollingElement.scrollHeight,left:0,behavior:'instant'});" : (position == "answers" ? "document.querySelector('.answerEditor')?.scrollIntoView({block:'start',behavior:'instant'});" : "")
        return """
        (()=>{const containers=[...document.querySelectorAll('*')].filter(e=>!e.matches('textarea,input,[contenteditable=true]')&&e.clientHeight>0&&e.scrollHeight>e.clientHeight+1&&/(auto|scroll)/.test(getComputedStyle(e).overflowY)); for(const e of containers)e.scrollTo({top:0,left:0,behavior:'instant'});window.scrollTo({top:0,left:0,behavior:'instant'}); \(action) return containers.map(e=>({id:e.id,top:e.scrollTop,height:e.scrollHeight,client:e.clientHeight}));})()
        """
    }
    private func cleanup() { web.stopLoading(); web.configuration.userContentController.removeScriptMessageHandler(forName: "gradecrewNative"); window.isHidden = true; window.rootViewController = nil; window = nil; web = nil }
}

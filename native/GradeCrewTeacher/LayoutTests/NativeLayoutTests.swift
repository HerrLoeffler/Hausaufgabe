import XCTest
import SwiftUI
import UIKit
@testable import GradeCrewLayoutHost

struct LayoutViewport: Decodable {
    let name: String
    let width: CGFloat
    let height: CGFloat
    static let matrix: [Self] = {
        let root = Bundle.main.url(forResource: "GeneratedWeb", withExtension: nil)!
        let data = try! Data(contentsOf: root.appendingPathComponent("layout-policy.json"))
        struct Policy: Decodable { let viewports: [LayoutViewport] }
        return try! JSONDecoder().decode(Policy.self, from: data).viewports
    }()
}

@MainActor
final class NativeLayoutTests: XCTestCase {
    private var window: UIWindow!
    private static let fixtureBridge: GradeCrewQuickRemyCall = { action, _, completion in
        // Only readiness/recovery; any accidental account mutation or test creation fails.
        switch action {
        case "authPrepare", "openAiForm", "populateAiForm": completion(.success(["status": "ready", "formSession": "offline-layout-fixture"]))
        case "recoverPending": completion(.success(["status": "none"]))
        default: XCTFail("Unexpected action in layout-only fixture: \(action)"); completion(.failure(NSError(domain: "LayoutFixtureUnexpectedAction", code: 1, userInfo: [NSLocalizedDescriptionKey: action])))
        }
    }
    override func tearDown() { window?.isHidden = true; window?.rootViewController = nil; window = nil; super.tearDown() }

    static func violations(_ samples: [String: GradeCrewLayoutSample], width: CGFloat, contentSize: UIContentSizeCategory = .large, height: CGFloat = 10000) -> [String] {
        var issues: [String] = []
        for s in samples.values.sorted(by: { $0.id < $1.id }) {
            if s.frame.minX < -1 || s.frame.maxX > width + 1 { issues.append("\(s.id): horizontal clipping \(s.frame)") }
            if s.role == "center", abs(s.frame.midX - width / 2) > 1.5 { issues.append("\(s.id): center differs by \(s.frame.midX - width / 2)pt") }
            if s.role == "textInput" {
                let font = UIFont.preferredFont(forTextStyle: .body, compatibleWith: UITraitCollection(preferredContentSizeCategory: contentSize))
                if s.frame.height < font.lineHeight + 12 { issues.append("\(s.id): input text clipped at \(contentSize.rawValue): needs \(font.lineHeight + 12)pt, allocated \(s.frame.height)pt") }
            }
            if ["tap", "control"].contains(s.role), s.frame.width < 44 - 0.01 || s.frame.height < 44 - 0.01 { issues.append("\(s.id): tap target below 44pt \(s.frame.size)") }
            if let text = s.text, let size = s.fontSize, s.frame.width > 0 {
                let needed = (text as NSString).boundingRect(with: CGSize(width: s.frame.width, height: 10000), options: [.usesLineFragmentOrigin, .usesFontLeading], attributes: [.font: UIFont.systemFont(ofSize: size, weight: .semibold)], context: nil).height
                if needed > s.frame.height + 4 { issues.append("\(s.id): text needs \(ceil(needed))pt, allocated \(s.frame.height)pt") }
            }
        }
        if let left = samples["home.remy"], let right = samples["home.workspace"] {
            if abs(left.frame.width - right.frame.width) > 1.5 || abs(left.frame.height - right.frame.height) > 1.5 { issues.append("Home action cards have unequal sizes") }
            if abs((left.frame.minX + right.frame.maxX) / 2 - width / 2) > 1.5 { issues.append("Home action cards have unequal outside margins") }
        }
        let taps = samples.values.filter { $0.role == "tap" }
        func painted(_ sample: GradeCrewLayoutSample) -> CGRect {
            let viewport = sample.parent.flatMap { samples[$0]?.frame } ?? CGRect(x: 0, y: 0, width: width, height: height)
            return sample.frame.intersection(viewport)
        }
        for (i, a) in taps.enumerated() { for b in taps.dropFirst(i + 1) {
            let intersection = painted(a).intersection(painted(b))
            if !intersection.isNull && intersection.width > 1 && intersection.height > 1 { issues.append("\(a.id) overlaps \(b.id)") }
        }}
        return issues
    }

    func testGeometryRulesRejectBrokenLayout() {
        let blank = UIGraphicsImageRenderer(size: CGSize(width: 100, height: 100)).image { _ in UIColor.black.setFill(); UIRectFill(CGRect(x: 0, y: 0, width: 100, height: 100)) }
        XCTAssertFalse(LayoutReportStore.hasPaintedContent(blank), "Blank snapshots must fail")
        let samples = [
            "clipped": GradeCrewLayoutSample(id: "clipped", frame: CGRect(x: -8, y: 0, width: 340, height: 44), role: "content", parent: nil, text: nil, fontSize: nil),
            "center": GradeCrewLayoutSample(id: "center", frame: CGRect(x: 90, y: 50, width: 100, height: 50), role: "center", parent: nil, text: nil, fontSize: nil),
            "tap": GradeCrewLayoutSample(id: "tap", frame: CGRect(x: 10, y: 110, width: 20, height: 20), role: "tap", parent: nil, text: nil, fontSize: nil),
            "text": GradeCrewLayoutSample(id: "text", frame: CGRect(x: 10, y: 140, width: 90, height: 10), role: "content", parent: nil, text: "Willkommen zurück in der Crew", fontSize: 28)
        ]
        let failures = Self.violations(samples, width: 320)
        XCTAssertTrue(failures.contains { $0.contains("horizontal clipping") })
        XCTAssertTrue(failures.contains { $0.contains("center differs") })
        XCTAssertTrue(failures.contains { $0.contains("below 44pt") })
        let rounded = GradeCrewLayoutSample(id: "rounded", frame: CGRect(x: 0, y: 0, width: 44, height: 43.99999999999994), role: "tap", parent: nil, text: nil, fontSize: nil)
        XCTAssertTrue(Self.violations(["rounded": rounded], width: 320).isEmpty)
        let short = GradeCrewLayoutSample(id: "short", frame: CGRect(x: 0, y: 0, width: 44, height: 43.9), role: "tap", parent: nil, text: nil, fontSize: nil)
        XCTAssertTrue(Self.violations(["short": short], width: 320).contains { $0.contains("below 44pt") })
        XCTAssertTrue(failures.contains { $0.contains("text needs") })
        let header = GradeCrewLayoutSample(id: "header", frame: CGRect(x: 0, y: 0, width: 100, height: 44), role: "tap", parent: nil, text: nil, fontSize: nil)
        let clip = GradeCrewLayoutSample(id: "scroll", frame: CGRect(x: 0, y: 68, width: 320, height: 500), role: "viewport", parent: nil, text: nil, fontSize: nil)
        let offscreen = GradeCrewLayoutSample(id: "input", frame: CGRect(x: 0, y: 20, width: 100, height: 44), role: "tap", parent: "scroll", text: nil, fontSize: nil)
        XCTAssertFalse(Self.violations(["header":header,"scroll":clip,"input":offscreen],width:320,height:568).contains { $0.contains("overlaps") }, "A scrolled-out control is clipped, not painted over the header")
        let overlapping = GradeCrewLayoutSample(id: "other", frame: CGRect(x: 0, y: 0, width: 100, height: 44), role: "tap", parent: nil, text: nil, fontSize: nil)
        XCTAssertTrue(Self.violations(["header":header,"other":overlapping],width:320,height:568).contains { $0.contains("overlaps") })
    }

    func testSnapshotContentRecognizesPaintedMonochromeForms() throws {
        let url = try XCTUnwrap(Bundle.main.url(forResource: "painted-grouping-ci", withExtension: "png", subdirectory: "SnapshotSamples"))
        XCTAssertTrue(LayoutReportStore.hasPaintedContent(try XCTUnwrap(UIImage(contentsOfFile: url.path))), "The actual CI form is visibly painted despite its limited palette")
        let size = CGSize(width: 128, height: 128)
        let format = UIGraphicsImageRendererFormat(); format.scale = 1
        let renderer = UIGraphicsImageRenderer(size: size, format: format)
        let monochrome = UIGraphicsImageRenderer(size: CGSize(width: 32, height: 32), format: format).image { _ in
            UIColor.white.setFill(); UIRectFill(CGRect(x: 0, y: 0, width: 32, height: 32))
            UIColor.black.setFill()
            for y in stride(from: 0, to: 32, by: 8) { UIRectFill(CGRect(x: 4, y: y, width: 24, height: 4)) }
        }
        XCTAssertTrue(LayoutReportStore.hasPaintedContent(monochrome), "Painted content does not require nine distinct colors")
        for color in [UIColor.black, .white, .clear] {
            let blank = renderer.image { _ in color.setFill(); UIRectFill(CGRect(origin: .zero, size: size)) }
            XCTAssertFalse(LayoutReportStore.hasPaintedContent(blank), "Uniform snapshots must fail")
        }
        let dot = renderer.image { _ in
            UIColor.white.setFill(); UIRectFill(CGRect(origin: .zero, size: size))
            UIColor.black.setFill(); UIRectFill(CGRect(x: 64, y: 64, width: 1, height: 1))
        }
        XCTAssertFalse(LayoutReportStore.hasPaintedContent(dot), "One pixel does not establish a painted screen")
    }

    func testNativeScreenMatrix() async throws {
        try LayoutReportStore.clear(prefix: "native-")
        for viewport in LayoutViewport.matrix {
            for scenario in ["login", "register", "reset", "restoring", "home", "remy", "remy-expanded", "remy-error"] {
                try await check(scenario, viewport: viewport, type: .large)
            }
        }
        // Largest accessibility text, long account/error, and short available height.
        for viewport in [LayoutViewport.matrix[0], LayoutViewport.matrix[6], LayoutViewport.matrix[11]] {
            for scenario in ["login", "register", "home", "remy", "remy-expanded", "login-error"] { try await check(scenario, viewport: viewport, type: .accessibility3) }
        }
    }

    private func check(_ scenario: String, viewport: LayoutViewport, type: DynamicTypeSize) async throws {
        var samples: [String: GradeCrewLayoutSample] = [:]
        let view: AnyView
        switch scenario {
        case "login", "register", "reset", "login-error":
            let mode: GradeCrewAuthInputPolicy.Mode = scenario == "register" ? .register : (scenario == "reset" ? .reset : .login)
            view = AnyView(GradeCrewAuthView(layoutTestMode: mode, error: scenario == "login-error" ? "Die Verbindung konnte gerade nicht hergestellt werden. Prüfe bitte deine Internetverbindung und versuche es erneut." : nil, call: Self.fixtureBridge))
        case "restoring": view = AnyView(GradeCrewAuthRestoringView(animationStartedAt: .distantPast, feedback: { EmptyView() }))
        case "home":
            view = AnyView(GradeCrewHomeMenuView(animationStartedAt: .distantPast, accountLabel: "Alexandra Musterfrau – Grundschule am Stadtpark", isAuthRestored: true, workspaceOpening: false, auditMessage: "Test wird erstellt; Aufgaben und Medien werden anschließend geprüft.", auditNeedsReview: false, openRemy: {}, openWorkspace: {}, feedback: { EmptyView() }))
        case "remy-error": view = AnyView(QuickRemyView(onBack: {}, call: nil))
        case "remy-expanded": view = AnyView(QuickRemyView(layoutTestExpanded: true, call: Self.fixtureBridge))
        default: view = AnyView(QuickRemyView(onBack: {}, call: Self.fixtureBridge))
        }
        let size = CGSize(width: viewport.width, height: viewport.height)
        let root = view.environment(\.dynamicTypeSize, type).environment(\.locale, Locale(identifier: "de_DE")).frame(width: size.width, height: size.height).coordinateSpace(name: "gcLayoutViewport").onPreferenceChange(GradeCrewLayoutSamplesKey.self) { samples = $0 }
        let host = UIHostingController(rootView: root)
        let container = UIViewController()
        let scene = UIApplication.shared.connectedScenes.compactMap { $0 as? UIWindowScene }.first { $0.activationState == .foregroundActive }
        window = scene.map { UIWindow(windowScene: $0) } ?? UIWindow(frame: CGRect(origin: .zero, size: size))
        window.frame = CGRect(origin: .zero, size: size)
        window.overrideUserInterfaceStyle = .light
        window.rootViewController = container
        container.addChild(host); container.view.addSubview(host.view); host.didMove(toParent: container)
        host.view.frame = CGRect(origin: .zero, size: size)
        host.view.autoresizingMask = []
        host.view.backgroundColor = .clear
        container.setOverrideTraitCollection(UITraitCollection(horizontalSizeClass: viewport.width >= 700 ? .regular : .compact), forChild: host)
        window.makeKeyAndVisible()
        host.view.setNeedsLayout(); host.view.layoutIfNeeded()
        try await Task.sleep(nanoseconds: 250_000_000)
        let name = "native-\(scenario)-\(viewport.name)-\(type)"
        var issues = Self.violations(samples, width: viewport.width, contentSize: type.isAccessibilitySize ? .accessibilityExtraLarge : .large, height: viewport.height)
        var seen = Set(samples.keys)
        var scrollStates: [[String: Any]] = []
        XCTAssertFalse(samples.isEmpty, "No measurement anchors: \(name)")
        let expected = scenario == "home" ? "home.actions" : (scenario == "restoring" ? "restore.progress" : (scenario.hasPrefix("remy") ? "remy.nav.title" : "auth.heading"))
        XCTAssertNotNil(samples[expected], "Missing required screen \(name)")
        let metrics = samples.mapValues { ["x": $0.frame.minX, "y": $0.frame.minY, "width": $0.frame.width, "height": $0.frame.height] }
        let format = UIGraphicsImageRendererFormat(); format.scale = 1
        let image = UIGraphicsImageRenderer(size: size, format: format).image { _ in host.view.drawHierarchy(in: host.view.bounds, afterScreenUpdates: true) }
        if !LayoutReportStore.hasPaintedContent(image) { issues.append("Blank native screenshot") }
        if let scroll = firstScrollView(in: host.view), scroll.contentSize.height > scroll.bounds.height + 1 {
            // Visit the whole real scroll view so LazyVGrid controls are laid out, measured
            // and covered. Testing only the first screen would silently miss these rows.
            let maximum = max(0, scroll.contentSize.height - scroll.bounds.height)
            var offset = min(scroll.bounds.height * 0.7, maximum)
            while true {
                scroll.setContentOffset(CGPoint(x: 0, y: offset), animated: false)
                try await Task.sleep(nanoseconds: 60_000_000)
                let current = Self.violations(samples, width: viewport.width, contentSize: type.isAccessibilitySize ? .accessibilityExtraLarge : .large, height: viewport.height)
                issues += current.map { "scroll \(offset): \($0)" }
                seen.formUnion(samples.keys)
                scrollStates.append(["offset": offset, "measured": samples.keys.sorted(), "issues": current])
                if offset >= maximum { break }
                offset = min(maximum, offset + scroll.bounds.height * 0.7)
            }
            let bottom = UIGraphicsImageRenderer(size: size, format: format).image { _ in host.view.drawHierarchy(in: host.view.bounds, afterScreenUpdates: true) }
            try FileManager.default.createDirectory(at: LayoutReportStore.directory, withIntermediateDirectories: true)
            if !LayoutReportStore.hasPaintedContent(bottom) { issues.append("Blank native bottom screenshot") }
            if let png = bottom.pngData() { try png.write(to: LayoutReportStore.directory.appendingPathComponent(name + "-bottom.png")) }
        }
        if scenario.hasPrefix("remy") {
            XCTAssertTrue(seen.contains("remy.submit"), "Missing native test form")
            if scenario == "remy-expanded" {
                for id in ["remy.input.Höraufgaben (0–5)", "remy.input.Vorgelesene Antworten (0–5)", "remy.material.picker", "remy.type.single"] { XCTAssertTrue(seen.contains(id), "Missing expanded control \(id)") }
            }
        } else if scenario != "home" && scenario != "restoring" { XCTAssertTrue(seen.contains("auth.submit")) }
        let data = try JSONSerialization.data(withJSONObject: ["name": name, "viewport": [size.width, size.height], "issues": issues, "metrics": metrics, "scrollStates": scrollStates, "measuredControls": seen.sorted()], options: [.prettyPrinted, .sortedKeys])
        try LayoutReportStore.save(name: name, json: data, image: image)
        XCTContext.runActivity(named: name) { activity in
            let report = XCTAttachment(data: data, uniformTypeIdentifier: "public.json"); report.name = name + ".json"; report.lifetime = .keepAlways; activity.add(report)
            let screenshot = XCTAttachment(image: image); screenshot.name = name + ".png"; screenshot.lifetime = .keepAlways; activity.add(screenshot)
        }
        XCTAssertTrue(issues.isEmpty, "\(name):\n" + issues.joined(separator: "\n"))
        window.isHidden = true; window.rootViewController = nil; window = nil
    }
    private func firstScrollView(in view: UIView) -> UIScrollView? {
        if let scroll = view as? UIScrollView { return scroll }
        return view.subviews.compactMap { firstScrollView(in: $0) }.first
    }
}

@MainActor
enum LayoutReportStore {
    static var directory: URL { FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0].appendingPathComponent("LayoutReports") }
    static func hasPaintedContent(_ image: UIImage) -> Bool {
        // A correctly painted monochrome form can have only seven colors when
        // sparsely sampled. Use explicit interpolation and visible contrast area,
        // rather than a palette-size requirement that varies across iOS versions.
        let side = 128, count = side * side
        let bitmap = CGBitmapInfo.byteOrder32Big.rawValue | CGImageAlphaInfo.premultipliedLast.rawValue
        guard let cg = image.cgImage, let context = CGContext(data: nil, width: side, height: side, bitsPerComponent: 8, bytesPerRow: side * 4, space: CGColorSpaceCreateDeviceRGB(), bitmapInfo: bitmap) else { return false }
        context.setFillColor(UIColor.white.cgColor); context.fill(CGRect(x: 0, y: 0, width: side, height: side))
        context.interpolationQuality = .high
        context.draw(cg, in: CGRect(x: 0, y: 0, width: side, height: side))
        guard let data = context.data?.assumingMemoryBound(to: UInt8.self) else { return false }
        var histogram: [Int: Int] = [:]
        for i in 0..<count {
            let offset = i * 4
            let bucket = (Int(data[offset]) >> 4) << 8 | (Int(data[offset + 1]) >> 4) << 4 | Int(data[offset + 2]) >> 4
            histogram[bucket, default: 0] += 1
        }
        guard let dominant = histogram.max(by: { $0.value < $1.value })?.key else { return false }
        let background = [((dominant >> 8) & 15) * 16 + 7, ((dominant >> 4) & 15) * 16 + 7, (dominant & 15) * 16 + 7]
        var contrasting = 0
        for i in 0..<count {
            if (0..<3).contains(where: { abs(Int(data[i * 4 + $0]) - background[$0]) >= 32 }) {
                contrasting += 1
                // 0.39% of the sampled surface; a single pixel cannot pass.
                if contrasting >= 64 { return true }
            }
        }
        return false
    }
    static func clear(prefix: String) throws {
        try FileManager.default.createDirectory(at: directory, withIntermediateDirectories: true)
        for file in try FileManager.default.contentsOfDirectory(at: directory, includingPropertiesForKeys: nil) where file.lastPathComponent.hasPrefix(prefix) { try FileManager.default.removeItem(at: file) }
    }
    static func save(name: String, json: Data, image: UIImage) throws {
        guard hasPaintedContent(image) else { throw NSError(domain: "LayoutSnapshot", code: 1, userInfo: [NSLocalizedDescriptionKey: "Blank screenshot: \(name)"]) }
        try FileManager.default.createDirectory(at: directory, withIntermediateDirectories: true)
        try json.write(to: directory.appendingPathComponent(name + ".json"), options: .atomic)
        guard let png = image.pngData() else { throw CocoaError(.fileWriteUnknown) }
        try png.write(to: directory.appendingPathComponent(name + ".png"), options: .atomic)
    }
}

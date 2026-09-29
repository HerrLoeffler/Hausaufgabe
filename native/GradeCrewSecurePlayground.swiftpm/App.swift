import SwiftUI
import UIKit
import WebKit

@main
struct GradeCrewSecurePlaygroundApp: App {
    var body: some Scene {
        WindowGroup {
            StartView()
        }
    }
}

struct ExamDestination: Identifiable {
    let id = UUID()
    let url: URL
}

struct StartView: View {
    @StateObject private var assessment = SecureAssessmentController()
    @State private var testCode = ""
    @State private var errorText: String?
    @State private var destination: ExamDestination?
    @State private var completionText: String?

    var body: some View {
        ZStack {
            LinearGradient(
                colors: [
                    Color(red: 0.07, green: 0.11, blue: 0.18),
                    Color(red: 0.10, green: 0.17, blue: 0.26)
                ],
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()

            ScrollView {
                VStack(spacing: 24) {
                    Spacer().frame(height: 30)

                    ZStack {
                        Circle()
                            .fill(.white.opacity(0.08))
                            .frame(width: 108, height: 108)

                        Image(systemName: "lock.shield.fill")
                            .font(.system(size: 54))
                            .foregroundStyle(.white)
                    }

                    VStack(spacing: 8) {
                        Text("GradeCrew Secure")
                            .font(.system(size: 40, weight: .bold, design: .rounded))
                            .foregroundStyle(.white)

                        Text("Prüfung sicher öffnen")
                            .font(.title3.weight(.semibold))
                            .foregroundStyle(.white.opacity(0.72))
                    }

                    if let completionText {
                        Label(completionText, systemImage: "checkmark.seal.fill")
                            .font(.headline)
                            .foregroundStyle(.green)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal, 18)
                    }

                    VStack(spacing: 16) {
                        Text("Testcode eingeben")
                            .font(.headline)
                            .foregroundStyle(.white)

                        SystemKeyboardCodeField(
                            text: $testCode,
                            onSubmit: openExam
                        )
                        .frame(height: 64)

                        Text("Tippe in das Feld – GradeCrew verwendet die iPad-Systemtastatur.")
                            .font(.caption)
                            .foregroundStyle(.white.opacity(0.52))
                            .multilineTextAlignment(.center)

                        if let errorText {
                            Text(errorText)
                                .font(.footnote)
                                .foregroundStyle(.red)
                                .multilineTextAlignment(.center)
                        }

                        Button(action: openExam) {
                            Label(
                                assessment.lockdownEnabled ? "Prüfungsmodus starten" : "Staging-Test öffnen",
                                systemImage: assessment.lockdownEnabled ? "lock.shield.fill" : "arrow.right.circle.fill"
                            )
                            .font(.headline)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 16)
                        }
                        .buttonStyle(.borderedProminent)
                        .disabled(normalizedCode.count < 4 || assessment.phase == .starting || assessment.phase == .ending)
                    }
                    .padding(24)
                    .frame(maxWidth: 560)
                    .background(.white.opacity(0.07))
                    .clipShape(RoundedRectangle(cornerRadius: 26, style: .continuous))

                    Label(
                        assessment.lockdownEnabled
                            ? "AAC-Prüfungsmodus aktiviert"
                            : "Entwicklungsmodus · AAC ist vorbereitet, aber noch deaktiviert",
                        systemImage: assessment.lockdownEnabled ? "lock.shield.fill" : "hammer.fill"
                    )
                    .font(.footnote)
                    .foregroundStyle(.white.opacity(0.58))

                    Spacer().frame(height: 30)
                }
                .frame(maxWidth: .infinity)
                .padding(.horizontal, 28)
            }

            if assessment.phase == .starting {
                SecureTransitionOverlay(
                    icon: "lock.shield.fill",
                    title: "Prüfungsmodus wird aktiviert …",
                    message: assessment.status
                )
            }
        }
        .fullScreenCover(item: $destination) { item in
            ExamView(
                url: item.url,
                secureMode: assessment.lockdownEnabled,
                assessmentPhase: assessment.phase,
                closeDevelopmentPreview: {
                    guard !assessment.lockdownEnabled else { return }
                    destination = nil
                },
                submissionConfirmed: {
                    guard assessment.lockdownEnabled else {
                        // In development/TestFlight preview mode the web result remains visible.
                        return
                    }
                    assessment.endAfterConfirmedSubmission {
                        DispatchQueue.main.async {
                            completionText = "Abgabe gespeichert. Prüfungsmodus sicher beendet."
                            destination = nil
                        }
                    }
                },
                testUnavailable: { reason in
                    assessment.abort(reason: reason) {
                        DispatchQueue.main.async {
                            errorText = reason
                            destination = nil
                        }
                    }
                }
            )
        }
        .tint(.blue)
    }

    private var normalizedCode: String {
        testCode
            .trimmingCharacters(in: .whitespacesAndNewlines)
            .uppercased()
    }

    private func openExam() {
        let code = normalizedCode
        let valid = code.range(of: "^[A-Z0-9]{4,16}$", options: .regularExpression) != nil

        guard valid else {
            errorText = "Bitte 4 bis 16 Buchstaben oder Ziffern eingeben."
            return
        }

        var components = URLComponents(string: "https://hausaufgabe-staging.web.app/")!
        components.queryItems = [URLQueryItem(name: "test", value: code)]

        guard let url = components.url else {
            errorText = "Der Testlink konnte nicht erstellt werden."
            return
        }

        testCode = code
        errorText = nil
        completionText = nil

        assessment.begin(
            onActivated: {
                DispatchQueue.main.async {
                    destination = ExamDestination(url: url)
                }
            },
            onFailed: { message in
                DispatchQueue.main.async {
                    errorText = message
                    destination = nil
                }
            }
        )
    }
}

struct SecureTransitionOverlay: View {
    let icon: String
    let title: String
    let message: String

    var body: some View {
        ZStack {
            Color.black.opacity(0.72).ignoresSafeArea()
            VStack(spacing: 18) {
                Image(systemName: icon)
                    .font(.system(size: 52))
                    .foregroundStyle(.white)
                ProgressView()
                    .tint(.white)
                    .scaleEffect(1.25)
                Text(title)
                    .font(.title2.bold())
                    .foregroundStyle(.white)
                    .multilineTextAlignment(.center)
                Text(message)
                    .font(.body)
                    .foregroundStyle(.white.opacity(0.72))
                    .multilineTextAlignment(.center)
            }
            .padding(32)
            .frame(maxWidth: 480)
        }
    }
}

/// Low-level system-keyboard input for the iPad.
///
/// This intentionally does NOT draw a custom keyboard. `KeyboardInputView` conforms
/// to `UIKeyInput`, becomes first responder when tapped, and iPadOS supplies the
/// normal system keyboard. A physical keyboard is routed through the same responder.
struct SystemKeyboardCodeField: UIViewRepresentable {
    @Binding var text: String
    let onSubmit: () -> Void

    func makeUIView(context: Context) -> KeyboardInputView {
        let view = KeyboardInputView()
        view.onTextChanged = { value in
            DispatchQueue.main.async {
                self.text = value
            }
        }
        view.onSubmit = onSubmit
        view.setText(text)
        return view
    }

    func updateUIView(_ view: KeyboardInputView, context: Context) {
        view.onTextChanged = { value in
            DispatchQueue.main.async {
                self.text = value
            }
        }
        view.onSubmit = onSubmit

        if view.currentText != text {
            view.setText(text)
        }
    }
}

final class KeyboardInputView: UIView, UIKeyInput, UITextInputTraits {
    private let label = UILabel()
    private(set) var currentText = ""

    var onTextChanged: ((String) -> Void)?
    var onSubmit: (() -> Void)?

    var keyboardType: UIKeyboardType = .asciiCapable
    var returnKeyType: UIReturnKeyType = .go
    var enablesReturnKeyAutomatically: Bool = false
    var autocapitalizationType: UITextAutocapitalizationType = .allCharacters
    var autocorrectionType: UITextAutocorrectionType = .no
    var spellCheckingType: UITextSpellCheckingType = .no
    var smartQuotesType: UITextSmartQuotesType = .no
    var smartDashesType: UITextSmartDashesType = .no
    var smartInsertDeleteType: UITextSmartInsertDeleteType = .no
    var textContentType: UITextContentType? = .oneTimeCode

    override var canBecomeFirstResponder: Bool { true }
    var hasText: Bool { !currentText.isEmpty }

    override init(frame: CGRect) {
        super.init(frame: frame)
        setup()
    }

    required init?(coder: NSCoder) {
        super.init(coder: coder)
        setup()
    }

    private func setup() {
        backgroundColor = UIColor.white.withAlphaComponent(0.10)
        layer.cornerRadius = 18
        layer.cornerCurve = .continuous
        layer.borderWidth = 0

        label.translatesAutoresizingMaskIntoConstraints = false
        label.textAlignment = .center
        label.font = .monospacedSystemFont(ofSize: 23, weight: .semibold)
        label.textColor = .white
        label.adjustsFontSizeToFitWidth = true
        label.minimumScaleFactor = 0.75
        label.isUserInteractionEnabled = false
        addSubview(label)

        NSLayoutConstraint.activate([
            label.leadingAnchor.constraint(equalTo: leadingAnchor, constant: 16),
            label.trailingAnchor.constraint(equalTo: trailingAnchor, constant: -16),
            label.topAnchor.constraint(equalTo: topAnchor),
            label.bottomAnchor.constraint(equalTo: bottomAnchor)
        ])

        isAccessibilityElement = true
        accessibilityLabel = "Testcode"
        accessibilityTraits = [.keyboardKey]

        let tap = UITapGestureRecognizer(target: self, action: #selector(beginInput))
        addGestureRecognizer(tap)

        refreshLabel()
    }

    @objc private func beginInput() {
        let accepted = becomeFirstResponder()
        if accepted {
            layer.borderWidth = 3
            layer.borderColor = UIColor.systemBlue.cgColor
            backgroundColor = UIColor.white.withAlphaComponent(0.14)
        }
    }

    override func resignFirstResponder() -> Bool {
        let result = super.resignFirstResponder()
        layer.borderWidth = 0
        backgroundColor = UIColor.white.withAlphaComponent(0.10)
        return result
    }

    func insertText(_ text: String) {
        if text == "\n" || text == "\r" {
            onSubmit?()
            return
        }

        let incoming = text.uppercased().filter { character in
            character.isASCII && (character.isLetter || character.isNumber)
        }

        guard !incoming.isEmpty else { return }
        let remaining = max(0, 16 - currentText.count)
        guard remaining > 0 else { return }

        currentText += String(incoming.prefix(remaining))
        refreshLabel()
        onTextChanged?(currentText)
    }

    func deleteBackward() {
        guard !currentText.isEmpty else { return }
        currentText.removeLast()
        refreshLabel()
        onTextChanged?(currentText)
    }

    func setText(_ value: String) {
        let cleaned = String(
            value
                .uppercased()
                .filter { $0.isASCII && ($0.isLetter || $0.isNumber) }
                .prefix(16)
        )
        currentText = cleaned
        refreshLabel()
    }

    private func refreshLabel() {
        if currentText.isEmpty {
            label.text = "z. B. ABCD1234"
            label.textColor = UIColor.white.withAlphaComponent(0.34)
            accessibilityValue = "leer"
        } else {
            label.text = currentText
            label.textColor = .white
            accessibilityValue = currentText
        }
    }
}

enum GradeCrewWebEvent {
    case testReady
    case submissionConfirmed
    case testUnavailable(String)
}

struct ExamView: View {
    let url: URL
    let secureMode: Bool
    let assessmentPhase: SecureAssessmentController.Phase
    let closeDevelopmentPreview: () -> Void
    let submissionConfirmed: () -> Void
    let testUnavailable: (String) -> Void

    @State private var webReady = false
    @State private var submissionReceived = false

    var body: some View {
        ZStack(alignment: .topTrailing) {
            GradeCrewWebView(url: url) { event in
                switch event {
                case .testReady:
                    withAnimation(.easeOut(duration: 0.2)) {
                        webReady = true
                    }
                case .submissionConfirmed:
                    guard !submissionReceived else { return }
                    submissionReceived = true
                    submissionConfirmed()
                case .testUnavailable(let message):
                    testUnavailable(message)
                }
            }
            .opacity(webReady && !shouldHideExam ? 1 : 0.01)
            .allowsHitTesting(webReady && !shouldHideExam)
            .ignoresSafeArea()

            if !webReady && !submissionReceived {
                SecureTransitionOverlay(
                    icon: secureMode ? "lock.shield.fill" : "hourglass",
                    title: "Test wird geladen …",
                    message: secureMode
                        ? "Der Prüfungsmodus ist aktiv. GradeCrew bereitet deine Aufgaben vor."
                        : "GradeCrew lädt den Test und deine Aufgaben."
                )
            }

            if submissionReceived && secureMode {
                SecureTransitionOverlay(
                    icon: "checkmark.seal.fill",
                    title: "Abgabe gespeichert ✓",
                    message: "Prüfungsmodus wird sicher beendet …"
                )
            } else if secureMode && assessmentPhase == .ending {
                SecureTransitionOverlay(
                    icon: "exclamationmark.shield.fill",
                    title: "Prüfungsmodus wird beendet …",
                    message: "Bitte einen Moment warten."
                )
            }

            if !secureMode {
                Button(action: closeDevelopmentPreview) {
                    Image(systemName: "xmark")
                        .font(.headline)
                        .foregroundStyle(.primary)
                        .padding(12)
                        .background(.ultraThinMaterial)
                        .clipShape(Circle())
                }
                .padding()
                .accessibilityLabel("Entwicklungsvorschau schließen")
            }
        }
        .interactiveDismissDisabled(secureMode)
    }

    private var shouldHideExam: Bool {
        secureMode && (assessmentPhase == .ending || assessmentPhase == .failed || submissionReceived)
    }
}

struct GradeCrewWebView: UIViewRepresentable {
    let url: URL
    let onEvent: (GradeCrewWebEvent) -> Void

    func makeCoordinator() -> Coordinator {
        Coordinator(onEvent: onEvent)
    }

    func makeUIView(context: Context) -> WKWebView {
        let configuration = WKWebViewConfiguration()
        configuration.websiteDataStore = .nonPersistent()
        configuration.preferences.javaScriptCanOpenWindowsAutomatically = false

        // Bridge only observes the trusted GradeCrew student UI. It is useful for
        // the hardware pilot, but a production secure release should ultimately
        // end AAC from a server-verified submission receipt.
        let bridgeScript = WKUserScript(
            source: Self.bridgeJavaScript,
            injectionTime: .atDocumentEnd,
            forMainFrameOnly: true
        )
        configuration.userContentController.addUserScript(bridgeScript)
        configuration.userContentController.add(context.coordinator, name: "gradecrewSecure")

        let webView = WKWebView(frame: .zero, configuration: configuration)
        webView.navigationDelegate = context.coordinator
        webView.allowsBackForwardNavigationGestures = false
        webView.allowsLinkPreview = false
        webView.scrollView.keyboardDismissMode = .interactive
        webView.load(URLRequest(url: url, cachePolicy: .reloadIgnoringLocalCacheData))
        return webView
    }

    func updateUIView(_ webView: WKWebView, context: Context) {}

    static func dismantleUIView(_ webView: WKWebView, coordinator: Coordinator) {
        webView.navigationDelegate = nil
        webView.configuration.userContentController.removeScriptMessageHandler(forName: "gradecrewSecure")
    }

    private static let bridgeJavaScript = #"""
    (() => {
      if (window.__gradeCrewSecureBridgeInstalled) return;
      window.__gradeCrewSecureBridgeInstalled = true;
      const sent = new Set();

      const send = (type, payload = {}) => {
        if (sent.has(type)) return;
        try {
          window.webkit.messageHandlers.gradecrewSecure.postMessage({ type, ...payload });
          sent.add(type);
        } catch (_) {}
      };

      const check = () => {
        const unavailable = document.querySelector('#studentQuizCard .studentUnavailable');
        if (unavailable) {
          const message = unavailable.querySelector('p')?.textContent?.trim() || 'Dieser Test ist nicht verfügbar.';
          send('testUnavailable', { message });
          return;
        }

        const form = document.getElementById('studentForm');
        const questions = document.getElementById('studentQuestions');
        if (form && questions) send('testReady');

        const result = document.getElementById('studentResult');
        const submitted = form?.dataset?.submitted === 'true';
        const resultVisible = result && !result.classList.contains('hidden');
        if (submitted && resultVisible) send('submissionConfirmed');
      };

      const observer = new MutationObserver(check);
      observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'data-submitted']
      });
      document.addEventListener('DOMContentLoaded', check, { once: true });
      check();
    })();
    """#

    final class Coordinator: NSObject, WKNavigationDelegate, WKScriptMessageHandler {
        private let allowedHost = "hausaufgabe-staging.web.app"
        private let onEvent: (GradeCrewWebEvent) -> Void

        init(onEvent: @escaping (GradeCrewWebEvent) -> Void) {
            self.onEvent = onEvent
        }

        func webView(
            _ webView: WKWebView,
            decidePolicyFor navigationAction: WKNavigationAction,
            decisionHandler: @escaping (WKNavigationActionPolicy) -> Void
        ) {
            guard let target = navigationAction.request.url else {
                decisionHandler(.cancel)
                return
            }

            if target.scheme == "about" ||
                (target.scheme == "https" && target.host == allowedHost) {
                decisionHandler(.allow)
            } else {
                decisionHandler(.cancel)
            }
        }

        func userContentController(
            _ userContentController: WKUserContentController,
            didReceive message: WKScriptMessage
        ) {
            guard message.name == "gradecrewSecure",
                  let webView = message.webView,
                  webView.url?.scheme == "https",
                  webView.url?.host == allowedHost,
                  let body = message.body as? [String: Any],
                  let type = body["type"] as? String else { return }

            DispatchQueue.main.async { [onEvent] in
                switch type {
                case "testReady":
                    onEvent(.testReady)
                case "submissionConfirmed":
                    onEvent(.submissionConfirmed)
                case "testUnavailable":
                    let text = (body["message"] as? String)?.trimmingCharacters(in: .whitespacesAndNewlines)
                    onEvent(.testUnavailable(text?.isEmpty == false ? text! : "Dieser Test ist nicht verfügbar."))
                default:
                    break
                }
            }
        }
    }
}

import SwiftUI
import WebKit

/// Prepared production-grade flow behind `GradeCrewSecureBuild.secureBackendEnabled`.
/// It is intentionally not the default UI yet; the existing TestFlight/Staging
/// preview remains unchanged until the backend has been deployed and integration-tested.
struct SecureBackendStartView: View {
    private enum Step { case code, identity, waiting, activating, exam, finished }

    @StateObject private var assessment = SecureAssessmentController()
    @State private var step: Step = .code
    @State private var testCode = ""
    @State private var studentName = ""
    @State private var metadata: SecureTestMetadata?
    @State private var credentials: SecureAttemptCredentials?
    @State private var examSession: SecureNativeSession?
    @State private var busy = false
    @State private var errorText: String?
    @State private var completionText: String?

    var body: some View {
        ZStack {
            LinearGradient(
                colors: [Color(red: 0.07, green: 0.11, blue: 0.18), Color(red: 0.10, green: 0.17, blue: 0.26)],
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()

            ScrollView {
                VStack(spacing: 24) {
                    Spacer().frame(height: 28)
                    Image(systemName: "lock.shield.fill")
                        .font(.system(size: 58))
                        .foregroundStyle(.white)
                        .frame(width: 112, height: 112)
                        .background(.white.opacity(0.08))
                        .clipShape(Circle())

                    VStack(spacing: 7) {
                        Text("GradeCrew Secure")
                            .font(.system(size: 40, weight: .bold, design: .rounded))
                            .foregroundStyle(.white)
                        Text(stepSubtitle)
                            .font(.title3.weight(.semibold))
                            .foregroundStyle(.white.opacity(0.7))
                    }

                    if let completionText {
                        Label(completionText, systemImage: "checkmark.seal.fill")
                            .font(.headline)
                            .foregroundStyle(.green)
                            .multilineTextAlignment(.center)
                    }

                    Group {
                        switch step {
                        case .code:
                            codeCard
                        case .identity:
                            identityCard
                        case .waiting:
                            waitingCard
                        case .activating:
                            statusCard(title: "Prüfungsmodus wird aktiviert …", text: assessment.status, progress: true)
                        case .exam:
                            statusCard(title: "Prüfung läuft", text: "GradeCrew Secure ist aktiv.", progress: true)
                        case .finished:
                            statusCard(title: "Sicher abgegeben ✓", text: "Die Serverquittung wurde bestätigt und der Prüfungsmodus beendet.", progress: false)
                        }
                    }
                    .frame(maxWidth: 590)

                    if let errorText {
                        Text(errorText)
                            .font(.footnote)
                            .foregroundStyle(.red)
                            .multilineTextAlignment(.center)
                            .frame(maxWidth: 590)
                    }
                    Spacer().frame(height: 28)
                }
                .frame(maxWidth: .infinity)
                .padding(.horizontal, 28)
            }
        }
        .fullScreenCover(item: $examSession) { session in
            SecureExamContainerView(
                session: session,
                assessment: assessment,
                onFinished: {
                    SecureAttemptStore.shared.clearAll()
                    examSession = nil
                    credentials = nil
                    metadata = nil
                    testCode = ""
                    studentName = ""
                    completionText = "Abgabe sicher bestätigt."
                    step = .finished
                },
                onFailure: { message in
                    examSession = nil
                    errorText = message
                    step = .code
                }
            )
        }
        .task {
            guard GradeCrewSecureBuild.secureBackendEnabled,
                  let stored = SecureAttemptStore.shared.loadCredentials() else { return }
            credentials = stored
            testCode = stored.code
            studentName = stored.studentName
            metadata = stored.test
            await recover(stored)
        }
    }

    private var normalizedCode: String {
        testCode.trimmingCharacters(in: .whitespacesAndNewlines).uppercased()
    }

    private var stepSubtitle: String {
        switch step {
        case .code: return "Test prüfen – noch ohne Gerätesperre"
        case .identity: return "Prüfungsdaten bestätigen"
        case .waiting: return "Warteraum"
        case .activating: return "Sichere Umgebung wird vorbereitet"
        case .exam: return "Prüfungsmodus aktiv"
        case .finished: return "Fertig"
        }
    }

    private var codeCard: some View {
        VStack(spacing: 16) {
            Text("Testcode eingeben").font(.headline).foregroundStyle(.white)
            SystemKeyboardCodeField(text: $testCode, onSubmit: preflight)
                .frame(height: 64)
            Text("GradeCrew prüft den Test zuerst. Das iPad wird dabei noch nicht gesperrt.")
                .font(.caption)
                .foregroundStyle(.white.opacity(0.55))
                .multilineTextAlignment(.center)
            Button(action: preflight) {
                Label(busy ? "Wird geprüft …" : "Test prüfen", systemImage: "checkmark.shield")
                    .font(.headline)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 15)
            }
            .buttonStyle(.borderedProminent)
            .disabled(busy || normalizedCode.count < 4)
        }
        .secureCard()
    }

    private var identityCard: some View {
        VStack(alignment: .leading, spacing: 16) {
            if let metadata {
                Text(metadata.subject.isEmpty ? "Test" : metadata.subject.uppercased())
                    .font(.caption.bold()).foregroundStyle(.white.opacity(0.58))
                Text(metadata.title).font(.title2.bold()).foregroundStyle(.white)
                HStack(spacing: 10) {
                    if !metadata.grade.isEmpty { securePill("Klasse \(metadata.grade)") }
                    if let minutes = metadata.timeLimitMinutes { securePill("\(minutes) Minuten") }
                    securePill(metadata.startMode == "teacher" ? "Gemeinsamer Start" : "Eigener Start")
                }
                .fixedSize(horizontal: false, vertical: true)
            }

            Divider().overlay(.white.opacity(0.14))
            Text("Name oder vereinbartes Kürzel").font(.headline).foregroundStyle(.white)
            TextField("z. B. ML07", text: $studentName)
                .textInputAutocapitalization(.words)
                .autocorrectionDisabled()
                .padding(14)
                .background(.white.opacity(0.10))
                .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
                .foregroundStyle(.white)

            Button(action: prepareAttempt) {
                Label(busy ? "Sitzung wird vorbereitet …" : "Weiter zum Prüfungsmodus", systemImage: "lock.shield.fill")
                    .font(.headline)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 15)
            }
            .buttonStyle(.borderedProminent)
            .disabled(busy || studentName.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)

            Button("Anderen Code verwenden") {
                metadata = nil
                errorText = nil
                step = .code
            }
            .buttonStyle(.borderless)
            .foregroundStyle(.white.opacity(0.65))
            .disabled(busy)
        }
        .secureCard()
    }

    private var waitingCard: some View {
        VStack(spacing: 15) {
            Image(systemName: "hourglass")
                .font(.system(size: 34))
                .foregroundStyle(.white)
            Text("Du bist bereit")
                .font(.title2.bold()).foregroundStyle(.white)
            Text("Die Lehrkraft startet den Test für alle. Bis dahin bleibt dein iPad normal bedienbar.")
                .foregroundStyle(.white.opacity(0.68))
                .multilineTextAlignment(.center)
            ProgressView().tint(.white)
        }
        .secureCard()
        .task(id: credentials?.attemptId) {
            guard let credentials else { return }
            await waitForTeacher(credentials)
        }
    }

    private func statusCard(title: String, text: String, progress: Bool) -> some View {
        VStack(spacing: 15) {
            if progress { ProgressView().tint(.white).scaleEffect(1.15) }
            Text(title).font(.title2.bold()).foregroundStyle(.white)
            Text(text).foregroundStyle(.white.opacity(0.68)).multilineTextAlignment(.center)
        }
        .secureCard()
    }

    private func securePill(_ text: String) -> some View {
        Text(text)
            .font(.caption.weight(.semibold))
            .foregroundStyle(.white.opacity(0.82))
            .padding(.horizontal, 10).padding(.vertical, 6)
            .background(.white.opacity(0.09))
            .clipShape(Capsule())
    }

    private func preflight() {
        let code = normalizedCode
        guard code.range(of: "^[A-Z0-9]{4,16}$", options: .regularExpression) != nil else {
            errorText = "Bitte einen gültigen Testcode eingeben."
            return
        }
        busy = true
        errorText = nil
        Task { @MainActor in
            do {
                let result = try await SecureExamAPI.shared.preflight(code: code)
                metadata = result.test
                testCode = code
                step = .identity
            } catch {
                errorText = error.localizedDescription
            }
            busy = false
        }
    }

    private func prepareAttempt() {
        let name = studentName.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !name.isEmpty else { return }
        busy = true
        errorText = nil
        Task { @MainActor in
            do {
                let result = try await SecureExamAPI.shared.prepare(code: normalizedCode, studentName: name)
                credentials = result.credentials
                metadata = result.credentials.test
                try SecureAttemptStore.shared.saveCredentials(result.credentials)
                SecureAttemptStore.shared.clearRecovery()
                if result.canStartNow {
                    activateLockdown(result.credentials)
                } else {
                    step = .waiting
                }
            } catch {
                errorText = error.localizedDescription
            }
            busy = false
        }
    }

    @MainActor
    private func recover(_ stored: SecureAttemptCredentials) async {
        do {
            let status = try await SecureExamAPI.shared.status(stored)
            if status.status == "submitted" {
                let verified = try await SecureExamAPI.shared.verify(stored)
                if verified.submitted {
                    SecureAttemptStore.shared.clearAll()
                    completionText = "Deine letzte Abgabe war bereits sicher gespeichert."
                    step = .finished
                    return
                }
            }
            if status.status == "aborted" {
                SecureAttemptStore.shared.clearAll()
                step = .code
                return
            }
            if status.canStartNow || status.status == "running" {
                activateLockdown(stored)
            } else {
                step = .waiting
            }
        } catch {
            errorText = "Eine vorhandene Prüfungssitzung konnte noch nicht wiederhergestellt werden. \(error.localizedDescription)"
            step = .code
        }
    }

    @MainActor
    private func waitForTeacher(_ credentials: SecureAttemptCredentials) async {
        while step == .waiting {
            do {
                let status = try await SecureExamAPI.shared.status(credentials)
                if status.status == "submitted" {
                    let verified = try await SecureExamAPI.shared.verify(credentials)
                    if verified.submitted {
                        SecureAttemptStore.shared.clearAll()
                        completionText = "Abgabe bereits sicher gespeichert."
                        step = .finished
                        return
                    }
                }
                if status.canStartNow || status.status == "running" {
                    activateLockdown(credentials)
                    return
                }
            } catch {
                errorText = "Verbindung unterbrochen – GradeCrew versucht es automatisch erneut."
            }
            try? await Task.sleep(for: .seconds(1.2))
            if Task.isCancelled { return }
        }
    }

    @MainActor
    private func activateLockdown(_ credentials: SecureAttemptCredentials) {
        guard step != .activating && step != .exam else { return }
        step = .activating
        errorText = nil
        assessment.begin(
            onActivated: {
                DispatchQueue.main.async {
                    examSession = SecureNativeSession(credentials: credentials)
                    step = .exam
                }
            },
            onFailed: { message in
                DispatchQueue.main.async {
                    errorText = message
                    step = .code
                }
            }
        )
    }
}

private extension View {
    func secureCard() -> some View {
        self
            .padding(24)
            .frame(maxWidth: .infinity)
            .background(.white.opacity(0.07))
            .clipShape(RoundedRectangle(cornerRadius: 26, style: .continuous))
    }
}

struct SecureNativeSession: Identifiable {
    let id = UUID()
    let credentials: SecureAttemptCredentials
}

enum SecureNativeWebEvent {
    case ready
    case localSnapshot(revision: Int, answers: [String: Any])
    case submissionPending(receipt: String)
    case unavailable(String)
}

struct SecureExamContainerView: View {
    let session: SecureNativeSession
    @ObservedObject var assessment: SecureAssessmentController
    let onFinished: () -> Void
    let onFailure: (String) -> Void

    @State private var verifying = false
    @State private var verifyError: String?
    @State private var receiptHandled = false

    var body: some View {
        ZStack {
            SecureExamWebView(credentials: session.credentials) { event in
                handle(event)
            }
            .ignoresSafeArea()

            if verifying {
                SecureTransitionOverlay(
                    icon: "checkmark.seal.fill",
                    title: "Abgabe wird bestätigt …",
                    message: verifyError ?? "GradeCrew prüft die Serverquittung. Erst danach wird das iPad freigegeben."
                )
            }
        }
        .interactiveDismissDisabled(true)
    }

    private func handle(_ event: SecureNativeWebEvent) {
        switch event {
        case .ready:
            break
        case .localSnapshot(let revision, let answers):
            try? SecureAttemptStore.shared.saveRecovery(revision: revision, answers: answers)
        case .submissionPending(let receipt):
            guard !receiptHandled else { return }
            receiptHandled = true
            verifying = true
            verifyServerReceipt(expectedReceipt: receipt)
        case .unavailable(let message):
            assessment.abort(reason: message) {
                DispatchQueue.main.async {
                    Task { await SecureExamAPI.shared.abort(session.credentials) }
                    onFailure(message)
                }
            }
        }
    }

    private func verifyServerReceipt(expectedReceipt: String) {
        Task { @MainActor in
            var lastError: String?
            for attempt in 0..<12 {
                do {
                    let verified = try await SecureExamAPI.shared.verify(session.credentials)
                    if verified.submitted,
                       let receipt = verified.receipt,
                       !receipt.isEmpty,
                       receipt == expectedReceipt {
                        verifyError = nil
                        assessment.endAfterConfirmedSubmission {
                            DispatchQueue.main.async {
                                SecureAttemptStore.shared.clearAll()
                                onFinished()
                            }
                        }
                        return
                    }
                    lastError = "Die Abgabe ist auf dem Server noch nicht bestätigt."
                } catch {
                    lastError = error.localizedDescription
                }
                if attempt < 11 { try? await Task.sleep(for: .seconds(1.5)) }
            }
            // Fail closed: keep AAC active and never unlock from a web-only signal.
            verifying = true
            verifyError = "Serverquittung noch nicht bestätigt. Verbindung prüfen; die Prüfung bleibt aus Sicherheitsgründen gesperrt. \(lastError ?? "")"
            receiptHandled = false
        }
    }
}

struct SecureExamWebView: UIViewRepresentable {
    let credentials: SecureAttemptCredentials
    let onEvent: (SecureNativeWebEvent) -> Void

    func makeCoordinator() -> Coordinator { Coordinator(onEvent: onEvent) }

    func makeUIView(context: Context) -> WKWebView {
        let configuration = WKWebViewConfiguration()
        configuration.websiteDataStore = .nonPersistent()
        configuration.preferences.javaScriptCanOpenWindowsAutomatically = false

        let bootstrap = bootstrapJavaScript()
        configuration.userContentController.addUserScript(
            WKUserScript(source: bootstrap, injectionTime: .atDocumentStart, forMainFrameOnly: true)
        )
        configuration.userContentController.add(context.coordinator, name: "gradecrewSecure")

        let webView = WKWebView(frame: .zero, configuration: configuration)
        webView.navigationDelegate = context.coordinator
        webView.allowsBackForwardNavigationGestures = false
        webView.allowsLinkPreview = false
        webView.scrollView.keyboardDismissMode = .interactive
        webView.load(URLRequest(
            url: URL(string: "https://hausaufgabe-staging.web.app/secure-exam.html")!,
            cachePolicy: .reloadIgnoringLocalAndRemoteCacheData
        ))
        return webView
    }

    func updateUIView(_ webView: WKWebView, context: Context) {}

    static func dismantleUIView(_ webView: WKWebView, coordinator: Coordinator) {
        webView.navigationDelegate = nil
        webView.configuration.userContentController.removeScriptMessageHandler(forName: "gradecrewSecure")
    }

    private func bootstrapJavaScript() -> String {
        var object: [String: Any] = [
            "code": credentials.code,
            "attemptId": credentials.attemptId,
            "attemptToken": credentials.attemptToken
        ]
        if let recovery = SecureAttemptStore.shared.loadRecoveryObject() {
            object["recovery"] = recovery
        }
        guard let data = try? JSONSerialization.data(withJSONObject: object, options: []),
              let json = String(data: data, encoding: .utf8) else {
            return "window.__GRADECREW_SECURE_BOOTSTRAP__ = {};"
        }
        return "window.__GRADECREW_SECURE_BOOTSTRAP__ = \(json);"
    }

    final class Coordinator: NSObject, WKNavigationDelegate, WKScriptMessageHandler {
        private let allowedHost = "hausaufgabe-staging.web.app"
        private let allowedPath = "/secure-exam.html"
        private let onEvent: (SecureNativeWebEvent) -> Void

        init(onEvent: @escaping (SecureNativeWebEvent) -> Void) {
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
                (target.scheme == "https" && target.host == allowedHost && target.path == allowedPath) {
                decisionHandler(.allow)
            } else {
                decisionHandler(.cancel)
            }
        }

        func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
            guard message.name == "gradecrewSecure",
                  let webView = message.webView,
                  webView.url?.scheme == "https",
                  webView.url?.host == allowedHost,
                  webView.url?.path == allowedPath,
                  let body = message.body as? [String: Any],
                  let type = body["type"] as? String else { return }

            DispatchQueue.main.async { [onEvent] in
                switch type {
                case "testReady":
                    onEvent(.ready)
                case "localSnapshot":
                    let revision = (body["revision"] as? NSNumber)?.intValue ?? 0
                    let answers = body["answers"] as? [String: Any] ?? [:]
                    onEvent(.localSnapshot(revision: revision, answers: answers))
                case "submissionPending":
                    guard let receipt = body["receipt"] as? String, !receipt.isEmpty else { return }
                    onEvent(.submissionPending(receipt: receipt))
                case "testUnavailable":
                    let text = (body["message"] as? String)?.trimmingCharacters(in: .whitespacesAndNewlines)
                    onEvent(.unavailable(text?.isEmpty == false ? text! : "Dieser Test ist nicht verfügbar."))
                default:
                    break
                }
            }
        }
    }
}

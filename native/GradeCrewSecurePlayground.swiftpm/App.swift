import SwiftUI
import WebKit

@main
struct GradeCrewSecurePlaygroundApp: App {
    var body: some Scene {
        WindowGroup {
            StartView()
        }
    }
}

struct StartView: View {
    @State private var testCode = ""
    @State private var examURL: URL?
    @State private var errorText: String?

    var body: some View {
        NavigationStack {
            ZStack {
                Color.black.ignoresSafeArea()

                ScrollView {
                    VStack(spacing: 22) {
                        CrewStripView()
                            .frame(maxWidth: 720)
                            .frame(height: 230)
                            .clipShape(RoundedRectangle(cornerRadius: 28, style: .continuous))

                        VStack(spacing: 8) {
                            Text("GradeCrew Secure")
                                .font(.system(size: 40, weight: .bold, design: .rounded))
                                .foregroundStyle(.white)

                            Label("Sicherer Prüfungsmodus", systemImage: "lock.shield.fill")
                                .font(.headline)
                                .foregroundStyle(.secondary)
                        }

                        Text("Deine Prüfung. Deine Antworten. Sicher in GradeCrew.")
                            .font(.title3)
                            .foregroundStyle(.secondary)
                            .multilineTextAlignment(.center)

                        VStack(spacing: 14) {
                            Text("Bereit für deine Prüfung?")
                                .font(.headline)
                                .foregroundStyle(.white)

                            TextField("Testcode", text: $testCode)
                                .textInputAutocapitalization(.characters)
                                .autocorrectionDisabled()
                                .keyboardType(.asciiCapable)
                                .font(.title2.monospaced().weight(.semibold))
                                .multilineTextAlignment(.center)
                                .padding(.vertical, 17)
                                .padding(.horizontal, 18)
                                .background(Color.white.opacity(0.10))
                                .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))
                                .foregroundStyle(.white)
                                .submitLabel(.go)
                                .onSubmit(openExam)

                            if let errorText {
                                Text(errorText)
                                    .font(.footnote)
                                    .foregroundStyle(.red)
                            }

                            Button(action: openExam) {
                                Label("Prüfung öffnen", systemImage: "arrow.right.circle.fill")
                                    .font(.headline)
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, 16)
                            }
                            .buttonStyle(.borderedProminent)
                            .disabled(normalizedCode.isEmpty)
                        }
                        .padding(24)
                        .frame(maxWidth: 520)
                        .background(Color.white.opacity(0.08))
                        .clipShape(RoundedRectangle(cornerRadius: 26, style: .continuous))

                        Label("Entwicklungsmodus – die iPad-Sperre ist noch nicht aktiv.", systemImage: "hammer.fill")
                            .font(.footnote)
                            .foregroundStyle(.secondary)
                            .padding(.top, 4)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.horizontal, 28)
                    .padding(.vertical, 34)
                }
            }
            .fullScreenCover(item: Binding(
                get: { examURL.map(ExamDestination.init) },
                set: { examURL = $0?.url }
            )) { destination in
                ExamView(url: destination.url) {
                    examURL = nil
                }
            }
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
        let allowed = code.range(of: "^[A-Z0-9]{4,16}$", options: .regularExpression) != nil
        guard allowed,
              var components = URLComponents(string: "https://hausaufgabe-staging.web.app/") else {
            errorText = "Bitte 4–16 Buchstaben oder Ziffern eingeben."
            return
        }

        components.queryItems = [URLQueryItem(name: "test", value: code)]
        guard let url = components.url else {
            errorText = "Der Testlink konnte nicht erstellt werden."
            return
        }

        testCode = code
        errorText = nil
        examURL = url
    }
}

struct ExamDestination: Identifiable {
    let id = UUID()
    let url: URL
}

struct ExamView: View {
    let url: URL
    let close: () -> Void

    var body: some View {
        ZStack(alignment: .topTrailing) {
            SecureStagingWebView(url: url)
                .ignoresSafeArea()

            Button(action: close) {
                Image(systemName: "xmark")
                    .font(.headline)
                    .padding(12)
                    .background(.ultraThinMaterial)
                    .clipShape(Circle())
            }
            .padding()
            .accessibilityLabel("Entwicklungsvorschau schließen")
        }
    }
}

struct CrewStripView: UIViewRepresentable {
    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        let webView = WKWebView(frame: .zero, configuration: config)
        webView.isOpaque = false
        webView.backgroundColor = .clear
        webView.scrollView.backgroundColor = .clear
        webView.scrollView.isScrollEnabled = false
        webView.isUserInteractionEnabled = false

        let html = """
        <!doctype html>
        <html>
        <head>
          <meta name='viewport' content='width=device-width,initial-scale=1'>
          <style>
            * { box-sizing: border-box; }
            html, body { margin:0; width:100%; height:100%; overflow:hidden; background:transparent; }
            body { display:flex; align-items:center; justify-content:center; font-family:-apple-system,BlinkMacSystemFont,sans-serif; }
            .crew { width:100%; height:100%; display:grid; grid-template-columns:repeat(4,1fr); gap:10px; align-items:end; }
            .member { min-width:0; text-align:center; color:#d9e4f3; font-weight:700; font-size:13px; }
            .bubble { height:185px; border-radius:28px; display:flex; align-items:center; justify-content:center; overflow:hidden; }
            .member:nth-child(1) .bubble { background:#eef5fb; }
            .member:nth-child(2) .bubble { background:#f1f5f9; }
            .member:nth-child(3) .bubble { background:#fff3ec; }
            .member:nth-child(4) .bubble { background:#f8f2eb; }
            img { width:96%; height:96%; object-fit:contain; display:block; }
            .name { margin-top:7px; }
          </style>
        </head>
        <body>
          <div class='crew'>
            <div class='member'><div class='bubble'><img src='https://hausaufgabe-staging.web.app/assets/gradecrew/penguin-guide.svg'></div><div class='name'>Coco</div></div>
            <div class='member'><div class='bubble'><img src='https://hausaufgabe-staging.web.app/assets/gradecrew/elephant-create.svg'></div><div class='name'>Remy</div></div>
            <div class='member'><div class='bubble'><img src='https://hausaufgabe-staging.web.app/assets/gradecrew/fox-improve.svg'></div><div class='name'>Emmi</div></div>
            <div class='member'><div class='bubble'><img src='https://hausaufgabe-staging.web.app/assets/gradecrew/owl-grade.svg'></div><div class='name'>Wilma</div></div>
          </div>
        </body>
        </html>
        """

        webView.loadHTMLString(html, baseURL: nil)
        return webView
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {}
}

struct SecureStagingWebView: UIViewRepresentable {
    let url: URL

    func makeCoordinator() -> Coordinator {
        Coordinator()
    }

    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.websiteDataStore = .nonPersistent()
        config.preferences.javaScriptCanOpenWindowsAutomatically = false

        let webView = WKWebView(frame: .zero, configuration: config)
        webView.navigationDelegate = context.coordinator
        webView.allowsBackForwardNavigationGestures = false
        webView.allowsLinkPreview = false
        webView.load(URLRequest(url: url, cachePolicy: .reloadIgnoringLocalCacheData))
        return webView
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {}

    final class Coordinator: NSObject, WKNavigationDelegate {
        private let allowedHost = "hausaufgabe-staging.web.app"

        func webView(_ webView: WKWebView,
                     decidePolicyFor navigationAction: WKNavigationAction,
                     decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
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
    }
}

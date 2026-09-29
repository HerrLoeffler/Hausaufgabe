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

struct ExamDestination: Identifiable {
    let id = UUID()
    let url: URL
}

struct StartView: View {
    @State private var testCode = ""
    @State private var errorText: String?
    @State private var destination: ExamDestination?

    var body: some View {
        NavigationStack {
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
                                .frame(width: 112, height: 112)

                            Image(systemName: "lock.shield.fill")
                                .font(.system(size: 56))
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

                        VStack(spacing: 16) {
                            Text("Testcode eingeben")
                                .font(.headline)
                                .foregroundStyle(.white)

                            TextField("z. B. ABCD1234", text: $testCode)
                                .textInputAutocapitalization(.characters)
                                .autocorrectionDisabled()
                                .keyboardType(.asciiCapable)
                                .font(.title2.monospaced().weight(.semibold))
                                .multilineTextAlignment(.center)
                                .padding(.vertical, 18)
                                .padding(.horizontal, 16)
                                .background(.white.opacity(0.10))
                                .foregroundStyle(.white)
                                .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))
                                .submitLabel(.go)
                                .onSubmit(openExam)

                            if let errorText {
                                Text(errorText)
                                    .font(.footnote)
                                    .foregroundStyle(.red)
                                    .multilineTextAlignment(.center)
                            }

                            Button(action: openExam) {
                                Label("Staging-Test öffnen", systemImage: "arrow.right.circle.fill")
                                    .font(.headline)
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, 16)
                            }
                            .buttonStyle(.borderedProminent)
                            .disabled(normalizedCode.isEmpty)
                        }
                        .padding(24)
                        .frame(maxWidth: 520)
                        .background(.white.opacity(0.07))
                        .clipShape(RoundedRectangle(cornerRadius: 26, style: .continuous))

                        Label(
                            "Entwicklungsmodus · die iPad-Sperre ist noch nicht aktiv",
                            systemImage: "hammer.fill"
                        )
                        .font(.footnote)
                        .foregroundStyle(.white.opacity(0.58))

                        Spacer().frame(height: 30)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.horizontal, 28)
                }
            }
            .fullScreenCover(item: $destination) { item in
                ExamView(url: item.url) {
                    destination = nil
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
        destination = ExamDestination(url: url)
    }
}

struct ExamView: View {
    let url: URL
    let close: () -> Void

    var body: some View {
        ZStack(alignment: .topTrailing) {
            GradeCrewWebView(url: url)
                .ignoresSafeArea()

            Button(action: close) {
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
}

struct GradeCrewWebView: UIViewRepresentable {
    let url: URL

    func makeCoordinator() -> Coordinator {
        Coordinator()
    }

    func makeUIView(context: Context) -> WKWebView {
        let configuration = WKWebViewConfiguration()
        configuration.websiteDataStore = .nonPersistent()
        configuration.preferences.javaScriptCanOpenWindowsAutomatically = false

        let webView = WKWebView(frame: .zero, configuration: configuration)
        webView.navigationDelegate = context.coordinator
        webView.allowsBackForwardNavigationGestures = false
        webView.allowsLinkPreview = false
        webView.scrollView.keyboardDismissMode = .interactive
        webView.load(URLRequest(url: url, cachePolicy: .reloadIgnoringLocalCacheData))
        return webView
    }

    func updateUIView(_ webView: WKWebView, context: Context) {}

    final class Coordinator: NSObject, WKNavigationDelegate {
        private let allowedHost = "hausaufgabe-staging.web.app"

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
    }
}

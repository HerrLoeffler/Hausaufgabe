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
                        Spacer().frame(height: 26)

                        ZStack {
                            Circle()
                                .fill(.white.opacity(0.08))
                                .frame(width: 104, height: 104)

                            Image(systemName: "lock.shield.fill")
                                .font(.system(size: 52))
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

                            SystemCodeField(
                                text: $testCode,
                                placeholder: "z. B. ABCD1234",
                                onSubmit: openExam
                            )
                            .frame(height: 60)
                            .padding(.horizontal, 16)
                            .background(.white.opacity(0.10))
                            .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))

                            Text("Tippe in das Feld. Es wird die normale iPad-Systemtastatur verwendet; eine Hardware-Tastatur kann ebenfalls eingeben.")
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
                                Label("Staging-Test öffnen", systemImage: "arrow.right.circle.fill")
                                    .font(.headline)
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, 16)
                            }
                            .buttonStyle(.borderedProminent)
                            .disabled(normalizedCode.count < 4)
                        }
                        .padding(24)
                        .frame(maxWidth: 560)
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

/// Uses Apple's standard UITextField and therefore Apple's normal system keyboard.
/// No custom keyboard or replacement input view is installed.
struct SystemCodeField: UIViewRepresentable {
    @Binding var text: String
    let placeholder: String
    let onSubmit: () -> Void

    func makeCoordinator() -> Coordinator {
        Coordinator(parent: self)
    }

    func makeUIView(context: Context) -> UITextField {
        let field = UITextField(frame: .zero)
        field.delegate = context.coordinator
        field.addTarget(context.coordinator, action: #selector(Coordinator.editingChanged(_:)), for: .editingChanged)

        field.textAlignment = .center
        field.font = .monospacedSystemFont(ofSize: 23, weight: .semibold)
        field.textColor = .white
        field.tintColor = .white
        field.backgroundColor = .clear
        field.borderStyle = .none

        field.autocapitalizationType = .allCharacters
        field.autocorrectionType = .no
        field.spellCheckingType = .no
        field.smartDashesType = .no
        field.smartQuotesType = .no
        field.smartInsertDeleteType = .no
        field.keyboardType = .asciiCapable
        field.returnKeyType = .go
        field.clearButtonMode = .whileEditing

        field.attributedPlaceholder = NSAttributedString(
            string: placeholder,
            attributes: [.foregroundColor: UIColor.white.withAlphaComponent(0.35)]
        )

        field.accessibilityLabel = "Testcode"
        field.textContentType = .oneTimeCode
        field.text = text
        return field
    }

    func updateUIView(_ field: UITextField, context: Context) {
        context.coordinator.parent = self
        if field.text != text {
            field.text = text
        }
    }

    final class Coordinator: NSObject, UITextFieldDelegate {
        var parent: SystemCodeField

        init(parent: SystemCodeField) {
            self.parent = parent
        }

        @objc func editingChanged(_ sender: UITextField) {
            let cleaned = sanitize(sender.text ?? "")
            if sender.text != cleaned {
                sender.text = cleaned
            }
            parent.text = cleaned
        }

        func textField(
            _ textField: UITextField,
            shouldChangeCharactersIn range: NSRange,
            replacementString string: String
        ) -> Bool {
            guard let current = textField.text,
                  let swiftRange = Range(range, in: current) else {
                return true
            }

            let proposed = current.replacingCharacters(in: swiftRange, with: string)
            let cleaned = sanitize(proposed)

            textField.text = cleaned
            parent.text = cleaned
            return false
        }

        func textFieldShouldReturn(_ textField: UITextField) -> Bool {
            textField.resignFirstResponder()
            parent.onSubmit()
            return true
        }

        private func sanitize(_ raw: String) -> String {
            let uppercased = raw.uppercased()
            let asciiOnly = uppercased.replacingOccurrences(
                of: "[^A-Z0-9]",
                with: "",
                options: .regularExpression
            )
            return String(asciiOnly.prefix(16))
        }
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

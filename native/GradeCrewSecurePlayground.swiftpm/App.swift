import SwiftUI
import WebKit

@main
struct GradeCrewSecurePlaygroundApp: App {
    var body: some Scene {
        WindowGroup {
            SecureBrowserView()
                .ignoresSafeArea()
        }
    }
}

struct SecureBrowserView: UIViewRepresentable {
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
        webView.scrollView.keyboardDismissMode = .interactive
        webView.isOpaque = true
        webView.backgroundColor = UIColor(red: 0.07, green: 0.11, blue: 0.18, alpha: 1)
        webView.loadHTMLString(Self.startHTML, baseURL: nil)
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
            guard let url = navigationAction.request.url else {
                decisionHandler(.cancel)
                return
            }

            if url.scheme == "about" ||
                (url.scheme == "https" && url.host == allowedHost) {
                decisionHandler(.allow)
            } else {
                decisionHandler(.cancel)
            }
        }
    }

    private static let startHTML = #"""
    <!doctype html>
    <html lang="de">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
      <style>
        :root { color-scheme: dark; }
        * { box-sizing: border-box; }
        html, body { margin:0; min-height:100%; font-family:-apple-system,BlinkMacSystemFont,"SF Pro Display",sans-serif; background:#121c2e; color:white; }
        body {
          min-height:100vh;
          display:flex;
          align-items:center;
          justify-content:center;
          padding:max(28px, env(safe-area-inset-top)) 24px max(28px, env(safe-area-inset-bottom));
          background:linear-gradient(180deg,#111b2c 0%,#192b42 100%);
        }
        main { width:min(560px,100%); text-align:center; }
        .icon {
          width:104px; height:104px; margin:0 auto 20px;
          border-radius:52px; background:rgba(255,255,255,.08);
          display:flex; align-items:center; justify-content:center; font-size:52px;
        }
        h1 { margin:0; font-size:42px; line-height:1.05; letter-spacing:-1.2px; }
        .sub { margin:10px 0 28px; font-size:20px; font-weight:600; color:rgba(255,255,255,.68); }
        .card { padding:24px; border-radius:26px; background:rgba(255,255,255,.07); }
        label { display:block; margin-bottom:14px; font-size:17px; font-weight:700; }
        input {
          width:100%; height:62px; border:0; outline:none; border-radius:18px;
          background:rgba(255,255,255,.10); color:white; text-align:center;
          font:600 24px ui-monospace,SFMono-Regular,Menlo,monospace;
          text-transform:uppercase; letter-spacing:1px; padding:0 16px;
          -webkit-appearance:none;
        }
        input::placeholder { color:rgba(255,255,255,.33); }
        input:focus { box-shadow:0 0 0 3px rgba(70,145,255,.65); background:rgba(255,255,255,.14); }
        button {
          width:100%; height:58px; margin-top:16px; border:0; border-radius:17px;
          background:#1677ff; color:white; font-size:17px; font-weight:750;
        }
        button:active { transform:scale(.99); }
        #error { min-height:20px; margin:10px 0 0; color:#ff7777; font-size:14px; }
        .dev { margin-top:20px; font-size:13px; color:rgba(255,255,255,.47); }
      </style>
    </head>
    <body>
      <main>
        <div class="icon">🔒</div>
        <h1>GradeCrew Secure</h1>
        <div class="sub">Prüfung sicher öffnen</div>
        <form class="card" id="joinForm">
          <label for="code">Testcode eingeben</label>
          <input id="code" name="code" type="text" inputmode="text" autocomplete="off" autocorrect="off" autocapitalize="characters" spellcheck="false" maxlength="16" placeholder="z. B. ABCD1234">
          <div id="error"></div>
          <button type="submit">Staging-Test öffnen</button>
        </form>
        <div class="dev">Entwicklungsmodus · die iPad-Sperre ist noch nicht aktiv</div>
      </main>

      <script>
        const form = document.getElementById('joinForm');
        const code = document.getElementById('code');
        const error = document.getElementById('error');

        code.addEventListener('input', () => {
          const cleaned = code.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 16);
          if (code.value !== cleaned) code.value = cleaned;
          error.textContent = '';
        });

        form.addEventListener('submit', (event) => {
          event.preventDefault();
          const value = code.value.trim().toUpperCase();
          if (!/^[A-Z0-9]{4,16}$/.test(value)) {
            error.textContent = 'Bitte 4 bis 16 Buchstaben oder Ziffern eingeben.';
            code.focus();
            return;
          }
          window.location.href = 'https://hausaufgabe-staging.web.app/?test=' + encodeURIComponent(value);
        });
      </script>
    </body>
    </html>
    """#
}

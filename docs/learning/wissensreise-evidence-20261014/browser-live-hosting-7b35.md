# Live-Hosting-Leseprüfung · GC-LEARNING-WISSENSREISE-01

14.10.2026, Preview https://hausaufgabe-staging--gradecrew-wissensreise-20261014-tg3201gy.web.app/learning.html. Scope ausschließlich öffentliche Hostingmetadaten, tatsächlich sichtbarer normaler Einstieg und Konsole. Keine Logincredentials, Anmeldung, Userdatenwrites, Generierungs-/Providerstarts oder Runtimeänderungen. Funktionen waren beim Auftrag laut Implementer noch creating; ihr Zustand wurde hier nicht geprüft.

## Tatsächlicher Browser

Chrome1-Profil Martin, neu angelegter Tab1780324928. Chrome4-API-Neutabstart wurde wegen gefordertem aktiven Tab blockiert; visibility war nicht verfügbar. Ein neuer nativer Tab über die dokumentierte Chrome-App Cmd+T gelang. Die bestehende kanonische Stagingseite und andere Benutzertabs wurden nicht geändert. Der neue Previewtab wurde anschließend über BrowserAPI gebunden.

- learning.html lädt mit Titel Wissensreise · GradeCrew, Coco/GradeCrew sowie „Dein Test wird zur Wissensreise“. Sichtbar: „Melde dich als Lehrkraft an, um einen eigenen Test auszuwählen.“ und „Bei GradeCrew anmelden“.
- Preview-Origin ist nicht angemeldet. Keine eigene Testliste gelesen. Eine kanonische Anmeldung wird damit nicht als Preview-Anmeldung behauptet.
- Das dokumentierte Modulelement verwendet den öffentlichen Previewpfad learning/bootstrap.mjs; QR-Vendor und beide Stylesheets sind mit demselben Origin eingebunden. Sichtbarer Authcallback-Einstieg ist ein Laufzeitbeleg für diesen Einstieg, kein vollständiger Lernablauf.
- Loginlink navigiert zum selben Origin/index.html. Nach Laden zeigte sich die normale Crew-Startseite; Anmelden öffnete index.html?intent=login mit leerem E-Mail/Kurzname- und Passwortfeld, Sign in und Forgot password. Keine Eingabe oder Formularabgabe.
- Konsole error/warn=[] auf learning.html, geladener Startseite und Loginformular. Keine beobachtete CSP-, Firebase-Trusted-Domain- oder Redirectfehlermeldung im geprüften Einstieg. Authdomainprüfung durch tatsächlichen Login wurde nicht ausgeführt.
- Browsernavigation direkt auf release.json wurde von Chrome mit ERR_BLOCKED_BY_CLIENT blockiert. Kein Sicherheitsdialog umgangen; zur erfolgreichen Lernseite zurückgegangen. Öffentlicher HTTP-Read über curl außerhalb der eingeschränkten DNS-Sandbox gelang und ist gesondert dokumentiert.

## Tatsächlicher öffentlicher HTTP-Nachweis

release.json: project hausaufgabe-staging, version2.3.1-gc39, commit7b35f9ff23c5b824ca0e85402a5270751c0b06c5,170 Manifestdateien. Gesicherte Kopie live-release.json.

Alle vier unabhängig abgerufenen HTTP-Dateien haben genau denselben SHA256 wie release.json und der vorher geprüfte unveränderliche finale Snapshot:

| Datei | SHA256 |
|---|---|
| learning.html | 3624e416a6da35e4de521f7ae9570327b812bf510a3aa8f191a371b7335bd823 |
| learning/bootstrap.mjs | 34b62a6cab55e9086459e32ccd7106a830cb74a4ae98448e441c799c100ade41 |
| learning/ui.mjs | 1fe41f88090ed9cf4eb90f4a32a876056653572b70b329c88a8433fb5e226aa8 |
| learning/play.mjs | 194ba128d8b9bea71478b2f4815dd84d438afc2dd681e8cf816c93a4ee6d91ea |

HTTP200 für diese Dateien. learning.html Content-Type text/html;charset=utf-8. Kein Content-Security-Policy-Header in dessen erhaltenen Responseheaders und kein entsprechendes Metaelement in dieser HTML-Datei; dies ist nur eine Beobachtung, kein neuer allgemeiner Securityaudit. Browser-Konsolenprüfung zeigte keine CSP-Verletzung. Downloaddateien und Header sind ausschließlich öffentliche Buildquellen, keine Kontoinhalte.

## Ergebnis und Grenzen

Öffentliche Hostingvorschau und normaler Login-Einstieg am exakten Commit sind belegt. Kein vollständiger E2E-/Functions-/Rules-/CloudTask-/Provider-/Geräte-/Nutzertest. Kein erneuter Mockdurchlauf. Runtimezustand und echte Benutzeranmeldung bleiben getrennte Gates beim Root/Implementer.

Screenshots: live-preview-learning-entry.jpg und live-preview-login-modal.jpg. NativeTab wurde ausschließlich für diesen Auftrag neu angelegt; bestehende Tabs blieben unangetastet.

Nächster Schritt: Root bestätigt Functions-Deployment separat; anschließend kann Martin auf genau diesem Preview-Origin selbst anmelden, bevor echte gespeicherte Testlisten oder der komplette Flow geprüft werden.

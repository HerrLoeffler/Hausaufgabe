# GradeCrew iOS 0.1.9 – native Dateibrücke

Task: GC-IOS-02. Fortsetzung von „L APP GC“. Auftrag: aktuelle App prüfen, Plan sichern und nächste native Stufe lokal in Xcode umsetzen; Production unverändert.

## Geprüfte Basis

- Kanonischer App-Branch: feature/shared-gradecrew-design-system @ 79598be8a68d26319e5e9711d0df7c73e119684d, erneut am 06.10.2026 über GitHub geprüft.
- Lokaler Aufgabenbranch: feature/ios-native-bridge-019-20261005, eigener Checkout.
- Web-Integration: feature/gradecrew-app-integration @ bb91ce3590d773472ece60c4dd881da729bd32c1.
- Development Status auf aktuellem main 8360bc5f: Run 37358629953 erfolgreich. iOS +78/-625 gegenüber Web-Integration; kein offener iOS-PR. Das ist eine Branchtrennung, keine Aufforderung zu einem blinden Web-Merge.
- Historischer vollständiger Upload: 0.1.8 (18), Run 37076301215. Apple-Verarbeitung und Gerätetest sind weiterhin unbestätigt.
- Teacher README, TODO und zentrale Release-Datei enthalten ältere Angaben; deren Korrektur erfolgt als eigener Dokumentationsvorschlag gegen aktuelles main.
- Bestehender 0.1.8-Code baut lokal mit Xcode 27.0 ohne Signing. Sandbox-Compilerfehler verschwinden beim regulären lokalen Xcode-Build.

## Entscheidung und Alternativen

Die hybride SwiftUI/WKWebView-App bleibt bestehen. Vollständiger nativer Nachbau würde Login, Editor, KI, Bewertung und Datenmodell unnötig verdoppeln. Weitere einzelne WKDownload-Sonderfälle würden Blob-Exporte nicht als gemeinsamen Vertrag lösen. Daher wird eine kleine versionierte Schnittstelle ergänzt, die vorhandene Dateien an iOS übergibt.

## Umfang und Grenzen

1. `window.GradeCrewNative` bietet `capabilities()`, `diagnostics()` und `shareFile(blob, filename)` als Promise-API. Transport: WKScriptMessageHandlerWithReply, Protokollversion 1.
2. Bereits vorhandene `a.download`-Exporte mit gleichursprünglicher Blob-URL werden im Hauptdokument an dieselbe Dateibrücke geleitet. Es werden weder CSV-Daten noch PDF-Inhalte neu erzeugt. Normale Browser behalten ihr Verhalten, HTTP-Downloads bleiben bei WKDownload.
3. Native Aktionen akzeptieren ausschließlich das HTTPS-Hauptdokument des aktuell ausgewählten Staging-/Preview-Ursprungs. Andere Previews, Firebase-Auth, externe Seiten, Subframes, credentials und Sonder-Ports erhalten keinen Zugriff. Navigation/Reload/Teardown beenden offene Antworten genau einmal.
4. Dateitypen: PDF, CSV, Text, JSON, PNG, JPEG. Maximal 12 MiB pro Datei; base64-Größe wird vor Dekodierung geprüft. MIME und Dateiendung müssen passen, Namen werden auf einen ungefährlichen Dateinamen normalisiert. Keine Pfade oder entfernten URLs als Dateiquelle.
5. Eine native Teilen-Aktion gleichzeitig, mit iPad-Popover. Ergebnis: completed/cancelled; überlappende Aufrufe liefern busy. Temporäre Datei wird nach Abschluss/Abbruch entfernt. Fehler zeigen eine knappe deutsche Meldung; Abbruch erzeugt keinen zweiten Export.
6. Diagnose zeigt die tatsächlich geladene Hauptseiten-Domain statt nur des konfigurierten Start-Hosts, App-Version/Build und Bridge-Version. Native Diagnose liefert keine Query, Zugangsdaten oder Seiteninhalte. Web-SHA wird nur ausgewiesen, wenn ein geladenes Release-Manifest ihn tatsächlich liefert; kein konfigurierter SHA als Live-Nachweis.
7. Persistente Web-Anmeldung, bestehende Uploads, JavaScript-Dialoge und Downloadpfad bleiben erhalten. iOS/iPadOS 16.0, Bundle-ID de.gradecrew, keine zusätzlichen Produktabhängigkeiten.

Scanner, Haptik, Push, Siri, native Firebase-Anmeldung, Offline-Daten und Secure-Assessment werden in dieser Stufe nicht implementiert. Es gibt keinen Hosting-/Functions-/Rules-/Production-Deploy. Upload zu TestFlight bleibt eine eigene geprüfte Stufe nach Review.

## Nachweise

Foundation-Verhaltenstests prüfen Ursprung, Subframes, Protokollfehler, Größen-/MIME-Grenzen, Dateinamen und temporäre Dateien. JavaScript-Verhaltenstests führen das reale Bridge-Skript aus und prüfen Browser-Fallback, Blob-Export, unveränderte Bytes, Abbruch, Fehler und Größenlimit. Bestehende Routing-/Navigationstests werden erneut ausgeführt. Xcode baut den vollständigen neuen Stand lokal; Review-PR erhält eine eigene CI ohne Signing/Upload.

Ein lokaler Build oder erfolgreicher Upload ersetzt keinen physischen iPhone-/iPad-Test. Gerätetest umfasst Login, CSV/PDF → Teilen → Dateien, Abbrechen, iPad-Popover, externe Links und Reload während Teilen.

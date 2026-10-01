# Telemetrie: Datenstrategie und Übergabe

Stand 01.10.2026. Auftrag GC-TELEMETRY-DESIGN: ausführliche Vorüberlegung zur Hintergrundmessung; DOCX erneut vollständig gelesen, SHA256-identisch zur vorherigen Quelle.

## Gesichert
- docs/telemetry/MEASUREMENT_DESIGN.md: Code-Istbestand, 8 Messbereiche, IDs und Zustände, Kennzahlen/Nenner, geplanter Eventkatalog, Collector/Idempotenz, Transportqualität, Admin-Diagnose, Rollen/Löschung, Statistik, Kosten, Abnahme und Roadmap.
- App-Quellstand 74eb2ec08e81315875abfc4b1ae052d9f78797eb erneut bestätigt. app.js, functions/index.js, functions/lib/usage.js, functions/lib/diagnostics.js, firestore.rules geprüft. Operative Konten/Tests/Abgaben/Feedback/KI-Verbrauch existieren als Codepfade. Tatsächliche Cloudmenge und Retention nicht geprüft.
- Bereits vorhandenes Telemetrie-Fundament auf main bleibt deaktiviert und nicht eingebunden. Kein Collector und kein Produkt-Deploy.

## Prüfung und Grenzen
Dokumentationsänderung, keine Produktdateien geändert. Vollständiger Dokumenttext gegengelesen; Codebelege und offizielle Quellen geprüft. Keine neuen Verhaltenstests für diesen Plan. CI-Lauf dieses Commits separat prüfen; ältere 5 Modultests gehören zum vorherigen Fundament und belegen keine Datenerhebung.

## Nächster ausführbarer Schritt
GC-TELEMETRY-01: Quelleninventar Secure/Games/Native und Cloudretention ergänzen; konkrete Daten-/Auth-/Löschverträge für Collector, serverseitige Projektion und Join-/Submit-Pilot implementieren. Nutzerfehler und Security-Gates bleiben vorrangig. Retentionzahlen im Plan sind Vorschläge, keine festgelegten oder aktivierten Fristen.

# GradeCrew – gemeinsame To-do-Liste

Stand: 01.10.2026. Zentrale Aufgabenübersicht auf **main**. Dies ist keine Live-Freigabe.
Bei „Was steht auf der To-do-Liste?“ diese Datei frisch von GitHub lesen und P0, P1, blockierte Aufgaben und zuletzt Erledigtes zusammenfassen. Ohne Zugriff: fehlenden Zugriff nennen und diese Datei anfordern.

## Pflege durch jeden Arbeitschat

- Neue Wünsche zuerst einer vorhandenen ID zuordnen; sonst eine neue eindeutige ID ergänzen. Keine stillschweigend vergessenen Wünsche.
- Vor Arbeitsbeginn Status, zuständige Baustelle, tatsächlichen Branch und Überschneidungen prüfen. „Offen“ ist keine Behauptung, dass niemand in einem anderen Chat daran arbeitet.
- Pro Aufgabe getrennte Übergabe/Branch. Die Tabelle ist ein Überblick, keine globale exklusive Arbeitssperre.
- Nach einem gesicherten Teilschritt genau die betroffene Zeile aktualisieren. Vor Schreiben aktuellen Remote-Stand erneut lesen und fremde Änderungen erhalten.
- Erledigt nur mit nachvollziehbarem Nachweis; Code, CI, Deploy und Gerätetest unterscheiden. Ungeprüfte ältere Wünsche ausdrücklich als „Stand prüfen“ führen.
- Erledigte Einträge zunächst behalten, später mit Belegen archivieren. Ideen ohne Auftrag nicht eigenmächtig zu Pflichtaufgaben machen.
- Detailstatus steht in der verlinkten Übergabe. Bei Widerspruch tatsächliche Nachweise prüfen und Übersicht berichtigen.
- Weitere Chats werden nicht automatisch ausgelesen: dort vereinbarte Aufgaben müssen ebenfalls hier eingetragen werden.

## P0 – vor einem neuen öffentlichen Release

| ID | Aufgabe | Status | Baustelle / nächster Schritt |
|---|---|---|---|
| GC-TUTORIAL-01 | Manuelle Tutorialabgabe in der iPad-App funktioniert nicht | Offen, Nutzerbericht | Web-App: vorhandenen gc29-Entwurf sichern und gegen aktuellen Designstand vergleichen; reproduzieren, gezielt beheben, am Gerät testen. [Übergabe](workstreams/web-app.md) |
| GC-SECURITY-01 | Fehlgeschlagenen 30-Teilnehmer-Test diagnostizieren | Blockiert durch fehlenden Fehlernachweis | Security: Serverfehler anhand Referenz/Logs zuordnen, Ursache beheben, Test wiederholen. Keine vermutete Ursache als bewiesen darstellen. |
| GC-SECURITY-02 | Production-Security-Gates abschließen | Offen | Security-Branch: aktuellen Audit lesen; sichere Abgabe, Lösungsschutz und reale Freigaben belegen. |
| GC-RESTORE-01 | Tatsächlichen Live-Stand und vollständige Wiederherstellung absichern | Offen | Hosting-Release, Functions, Regeln, Datenbank, Auth und Uploads inventarisieren; Sicherung und Restore-Test planen. [Umgebungen](docs/releases/ENVIRONMENTS.md) |
| GC-REGRESSION-01 | PDF-, Bild- und Screenshot-Import sowie Kernabläufe erhalten | Stand prüfen, frühere Verlustmeldung | Aktuellen Integrationsstand prüfen: Import → KI → Editor → Veröffentlichung → Schülerabgabe → Auswertung. |
| GC-DEVICE-01 | Aktuellen Design-/Tutorialstand auf echten Geräten abnehmen | Offen | Desktop, iPad und iPhone einschließlich Tastatur; derzeit technisch geprüfter Designstand 74eb2ec. [Übergabe](workstreams/design-dashboard-v1.md) |

## P1 – nächste Verbesserungen

| ID | Aufgabe | Status | Baustelle / nächster Schritt |
|---|---|---|---|
| GC-TUTORIAL-02 | Ruhigeres Tempo, Wünsche manuell weiter, Aufgabe und Hilfe zusammen sichtbar | Stand prüfen | Web-App: aktuelle Tour gegen Nutzerwünsche prüfen; Katzenaufgabe vollständig sichtbar, gezieltes Scrollen, kein kompletter Neubau. |
| GC-TUTORIAL-03 | „Ich darf doch du sagen?“ bei der Namensfrage erhalten | Stand prüfen | Aktuellen Text und Regressionsschutz prüfen. |
| GC-TUTORIAL-04 | Tutorial nur einmal deutlich anbieten, jederzeit abbrechbar und erneut aufrufbar; Admin ohne Auto-Start | Implementiert auf isoliertem Branch, Tests grün; nicht deployed / Gerätetest offen | Branch `feature/tutorial-choice-replay-v1`, Draft-PR #16: einmalige Einladung statt Zwang, Account-Entscheidung, ×/Escape-Abbruch, Dashboard-Replay und Admin „Tutorial testen“. Testlauf `36935628293` grün. Als Nächstes visuelle Profil-/Geräteabnahme und Staging-only Deploy. [Übergabe](workstreams/tutorial-choice-replay-v1.md) |
| GC-ART-01 | Farbklekse und Randpixel an Figuren entfernen | Stand prüfen | Tatsächlich verwendete Assets visuell prüfen; zentrale Crew-Bibliothek erhalten. |
| GC-DESIGN-01 | Dashboard und Testkarten visuell feinjustieren | Implementiert, visuelle Abnahme offen | Design-Chat: bestehende Umsetzung prüfen, keine konkurrierende CSS-Schicht. |
| GC-DESIGN-02 | Neuer Test, Editor und KI-Erstellung auf gemeinsame Komponenten umstellen | Geplant | Nach Dashboard-Abnahme schrittweise; Import- und Bewertungsfunktionen erhalten. |
| GC-DIAGNOSTICS-01 | Fehler nachvollziehbar sammeln und Admin-Logs besser filtern | Stand prüfen | Vorhandene Diagnostics/Log-Tools inventarisieren; Referenz-ID, Version, Ablauf, Filter und Sortierung prüfen; keine Antworten oder Zugangsdaten protokollieren. |
| GC-AI-01 | KI-Qualitätsprüfung, Variantenfehler und fehlerhafte Listeneinträge prüfen | Stand prüfen, frühere Nutzerberichte | Reproduzierbare Fälle am aktuellen Stand sammeln, bestehende Fehlerbehebungen verifizieren. |
| GC-CREW-AI-01 | Coco, Remy, Emmi und Wilma als gemeinsame KI-Assistenten mit Spracheingabe und API-sparenden Standardantworten | Erstentwurf implementiert, CI grün; nicht deployed / Gerätetest offen | Branch `feature/crew-assistant-v1`, Draft-PR #12: gemeinsamer Crew-Core, lokaler Parser/Antwortkatalog, KI-Fallback, Remy→echtes Testformular und erster Diktierknopf. Head `fce4156`, CI `36927596099` grün. Als Nächstes Staging-/Gerätetest und kontrolliertes STT. [Übergabe](workstreams/crew-assistant.md) |
| GC-CREW-AI-02 | Emmi direkt im Editor: ganzen Test per Freitext/Sprachwunsch überarbeiten | Implementiert auf Aufbau-Branch, CI grün; nicht deployed / Gerätetest offen | Branch `feature/emmi-whole-test-revision-v1`, Draft-PR #13 auf Crew-Core: Emmi-Editorfeld, ein gebündelter Test-Level-KI-Aufruf, stabile Anzahl/Punkte, Bildschutz, Whole-Test-Undo und kein Auto-Save/Publish. Code-Head `c291314`, CI `36933680142` grün. Als Nächstes Staging-Runtime- und Geräteabnahme. [Übergabe](workstreams/emmi-whole-test-revision.md) |
| GC-IOS-01 | Installierten TestFlight-Build und verwendete Web-URL bestätigen | Offen | iPad-App-Version und Einstellungen prüfen; Web-Deploy nicht mit neuem nativen Build verwechseln. |
| GC-IOS-02 | Hybride Lehrer-App 0.2 härten und App-Store-tauglich weiterentwickeln | Review/Planung gesichert | Erst robuste WebView-App-Shell: verifizierte Preview als Beta-Quelle, Beta-Leiste entfernen, Navigation/Downloads/Share/Uploads/Diagnose/Tests verbessern; Native Dashboard erst danach gezielt. [Übergabe](workstreams/ios-app-v2.md) |
| GC-AUTOMATION-01 | Codex-Worker aktivieren und einmal vollständig testen | Blockiert durch Einrichtung | Separater API-Key und Aktivierungsvariable fehlen laut letzter Übergabe; API-Abrechnung beachten. [Einrichtung](docs/AUTOMATION_SETUP.md) |
| GC-AUTOMATION-02 | Automatische staging-only AI-Functions-WIF-Aktivierung abschließen | **Erledigt – WIF eingerichtet, automatischer Functions-E2E grün** | Setup am 02.10.2026 abgeschlossen. Automatischer Run `36943129026` deployte exakt Integrationscommit `a61759db…` mit Scope `functions:ai` nach `hausaufgabe-staging` und verifizierte `crewAssistant` + `reviseWholeTest`; Receipt Artifact `11200528486`. Production/Rules/Hosting wurden durch diesen Deploy nicht verändert. [Übergabe](workstreams/staging-functions-automation.md) |
| GC-GAMES-01 | Escape-Room-MVP mit Lehrerübersicht konkretisieren | MVP + Hub-Integration implementiert, CI grün; Lab-/Geräteabnahme offen | Branch `feature/escape-room-mvp-v1`, Draft-PR #10: „Die verriegelte Schule“ mit 3 Räumen, 8 Frage-Slots, 4 Rätseln, Preflight und Lehrerübersicht. Nächster Schritt: sicherer Lab-Preview-Deploy, echter iPad/Desktop-Test, danach GradeCrew-Test-/KI-Adapter. [Konzept](docs/games/ESCAPE_MVP.md) |

## Telemetrie – neue konkrete Schritte

| ID | Aufgabe | Status | Nächster Schritt |
|---|---|---|---|
| GC-TELEMETRY-01 | Collector und Datenvertrag | Implementiert auf isoliertem Branch; Aktivierung/CI/Deploy offen | `feature/telemetry-implementation` @ `4e4f0ba`: strikter Vertrag, Auth, Deduplizierung, Limits, 30-Tage-Pilot-Retention und Cleanup. Vor Aktivierung vollständige CI/Emulator-Prüfung, Cloud-Inventar und Retention-Freigabe. [Übergabe](workstreams/telemetry-implementation.md) |
| GC-TELEMETRY-02 | Beitritt/Abgabe als ersten Ablauf instrumentieren | Teilweise implementiert, nicht aktiviert | Secure-Client misst Join/Submit nach gültigem Attempt; zusätzliche inhaltsfreie Serveroperationen erfassen gültige Start-/Submit-/Receipt-Aufrufe und Fehler. Erwartete Teilnehmerzahl und unbekannte/nicht zuordenbare Joinfälle bleiben offen. [Übergabe](workstreams/telemetry-implementation.md) |
| GC-TELEMETRY-03 | Release-/Rundenübersicht im Adminbereich | Technische Staging-Ansicht implementiert, nicht deployed | Clientmeldungen, Serveroperationen, gespeicherter Rundenzustand und KI-Bestandsdaten getrennt anzeigen; als Nächstes CI/Emulator und sichere Staging-Aktivierung, danach lesbare UI statt Roh-JSON. [Übergabe](workstreams/telemetry-implementation.md) |

## P2 – vorgemerkt, noch keine laufende Umsetzung

| ID | Aufgabe | Status | Nächster Schritt |
|---|---|---|---|
| GC-REFERENCE-01 | Eingefrorene Referenz-Seite mit isolierten Testdaten | Vorschlag | Bedarf nach Restore-Konzept entscheiden; keine fünfte Site allein als vermeintliches Backup. |
| GC-GAMES-02 | Zweite Escape-Welt „Das verschwundene Prüfungsblatt“ | Idee bestätigt | Gemeinsamen Spielkern nach erstem Prototyp weiterverwenden. |
| GC-GAMES-03 | Optionale echte QR-Hinweise, Teams und komplexerer Multiplayer | Später | Erst nach funktionierendem digitalem Standardspiel bewerten. |
| GC-ANALYTICS-01 | Nutzungs- und Spielstatistiken | Teilimplementierung auf Telemetrie-Branch; Spiele/Aufgabenaggregate offen | KI-Bestandsauswertung und aktiver Lehrerzeit-Tracker sind isoliert implementiert; Tracker noch nicht verdrahtet. Spiele und Aufgaben erst nach sicherem Collector-/Join-/Abgabe-Pilot anbinden. [Übergabe](workstreams/telemetry-implementation.md) |

## Zuletzt erledigt – mit Grenzen

| ID | Ergebnis | Nachweis / Grenze |
|---|---|---|
| GC-HANDOFF-01 | Gemeinsamer Einstieg, Regeln und Aufgabenübergaben | START_HERE.md, AGENTS.md und workstreams auf main |
| GC-PREVIEW-01 | Automatischer App-Preview-Deploy mit Hashprüfung | Lauf 36878009106, Commit 74eb2ec; keine Production-Freigabe |
| GC-ARCHIVE-01 | Hosting-Snapshot-Archiv und Wiederherstellungsprüfung | Lauf 36914125942; 84 Dateien hashgleich wiederhergestellt; kein Datenbank-/Live-Backup |
| GC-DESIGN-FOUNDATION | Design Bible, Screen Map und gemeinsame Tokens | Design-Dokumentation und Dashboard integriert; visuelle Abnahme separat offen |

Die Liste sammelt sichtbare Aufträge und bekannte Übergaben. Sie behauptet keine Vollständigkeit über alle anderen Chats.

## Ergänzung 01.10.2026 – Telemetrie-Fundament

GC-TELEMETRY-BASE: gemeinsamer Ereignisvertrag und In-Memory-Puffer standardmäßig deaktiviert; Kennzahlberechnung mit explizitem Nenner; Verhaltenstests. Auf `feature/telemetry-implementation` wurden darauf aufbauend ein fail-closed Staging-Collector, Secure-Join/Submit-Adapter, getrennte Serveroperationsspur, Rundendiagnose, KI-Bestandsauswertung und ein isolierter aktiver Lehrerzeit-Tracker umgesetzt. Stand `4e4f0ba`: Code auf GitHub, 13 zusätzliche isolierte Rekonstruktionstests lokal grün; kein bestätigter Actions-/Deploy-/Gerätenachweis und keine Aktivierung.

GC-TELEMETRY-DESIGN: ausführliche Datenstrategie und Code-Istbestand dokumentiert; Production erhebt durch diese Arbeit keine neue Telemetrie. Siehe docs/telemetry/MEASUREMENT_DESIGN.md, workstreams/telemetry.md und workstreams/telemetry-implementation.md.

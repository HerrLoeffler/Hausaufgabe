# GradeCrew – gemeinsame To-do-Liste

Stand: 02.10.2026. Zentrale Aufgabenübersicht auf **main**. Dies ist keine Live-Freigabe.
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
| GC-TUTORIAL-04 | Tutorial nur einmal deutlich anbieten, jederzeit abbrechbar und erneut aufrufbar; Admin ohne Auto-Start | Auf Staging integriert; aktuelle Geräteabnahme offen | Gemeinsamer nachgewiesener Batch `18e30d0d`: Hosting `36991979723`, AI-Functions `36991979742`; neuere Branchspitzen separat prüfen. Verlauf siehe GRADECREW_STATE.json und vorhandene Workstream-Übergabe. |
| GC-ART-01 | Farbklekse und Randpixel an Figuren entfernen | Stand prüfen | Tatsächlich verwendete Assets visuell prüfen; zentrale Crew-Bibliothek erhalten. |
| GC-DESIGN-01 | Dashboard und Testkarten visuell feinjustieren | Implementiert, visuelle Abnahme offen | Design-Chat: bestehende Umsetzung prüfen, keine konkurrierende CSS-Schicht. |
| GC-DESIGN-02 | Neuer Test, Editor und KI-Erstellung auf gemeinsame Komponenten umstellen | Geplant | Nach Dashboard-Abnahme schrittweise; Import- und Bewertungsfunktionen erhalten. |
| GC-DIAGNOSTICS-01 | Fehler nachvollziehbar sammeln und Admin-Logs besser filtern | Stand prüfen | Vorhandene Diagnostics/Log-Tools inventarisieren; Referenz-ID, Version, Ablauf, Filter und Sortierung prüfen; keine Antworten oder Zugangsdaten protokollieren. |
| GC-AI-01 | KI-Qualitätsprüfung, Variantenfehler und fehlerhafte Listeneinträge prüfen | Stand prüfen, frühere Nutzerberichte | Reproduzierbare Fälle am aktuellen Stand sammeln, bestehende Fehlerbehebungen verifizieren. |
| GC-CREW-AI-01 | Coco, Remy, Emmi und Wilma als gemeinsame KI-Assistenten mit Spracheingabe und API-sparenden Standardantworten | Auf Staging integriert; aktuelle Geräteabnahme offen | Gemeinsamer nachgewiesener Batch `18e30d0d`: Hosting `36991979723`, AI-Functions `36991979742`; neuere Branchspitzen separat prüfen. Verlauf siehe GRADECREW_STATE.json und vorhandene Workstream-Übergabe. |
| GC-CREW-AI-02 | Emmi direkt im Editor: ganzen Test per Freitext/Sprachwunsch überarbeiten | Auf Staging integriert; aktuelle Geräteabnahme offen | Gemeinsamer nachgewiesener Batch `18e30d0d`: Hosting `36991979723`, AI-Functions `36991979742`; neuere Branchspitzen separat prüfen. Verlauf siehe GRADECREW_STATE.json und vorhandene Workstream-Übergabe. |
| GC-IOS-01 | Installierten TestFlight-Build und verwendete Web-URL bestätigen | Offen | 0.1.5 ist erfolgreich zu TestFlight hochgeladen; nach Apple-Verarbeitung auf iPad installieren und sichtbaren Host/`Integration` bestätigen. |
| GC-IOS-02 | Hybride Lehrer-App 0.2 härten und App-Store-tauglich weiterentwickeln | **ci_green / TestFlight-Upload 0.1.5 erfolgreich; Gerätetest offen** | Kanonischer App-Branch auf `8bdebaf1` fast-forwarded. 0.1.5 öffnet standardmäßig den automatisch verifizierten Integrations-Preview, normales Staging bleibt Fallback; Shared Tokens/Manifest synchronisiert. Run `37015111963` Routing/Archive/Upload grün. Als Nächstes physischer iPad-Test, danach Navigation/Downloads/Share/Uploads/Diagnose/AppIcon weiter härten. [Übergabe](workstreams/ios-app-v2.md) |
| GC-AUTOMATION-01 | Codex-Worker aktivieren und einmal vollständig testen | Blockiert durch Einrichtung | Separater API-Key und Aktivierungsvariable fehlen laut letzter Übergabe; API-Abrechnung beachten. [Einrichtung](docs/AUTOMATION_SETUP.md) |
| GC-AUTOMATION-02 | Automatische staging-only AI-Functions-WIF-Aktivierung abschließen | **Erledigt – WIF eingerichtet, automatischer Functions-E2E grün** | Setup am 02.10.2026 abgeschlossen. Automatischer Run `36943129026` deployte exakt Integrationscommit `a61759db…` mit Scope `functions:ai` nach `hausaufgabe-staging` und verifizierte `crewAssistant` + `reviseWholeTest`; Receipt Artifact `11200528486`. Production/Rules/Hosting wurden durch diesen Deploy nicht verändert. [Übergabe](workstreams/staging-functions-automation.md) |
| GC-GAMES-01 | Escape-Room-MVP mit Lehrerübersicht konkretisieren | MVP + Hub-Integration implementiert, CI grün; Lab-/Geräteabnahme offen | Branch `feature/escape-room-mvp-v1`, Draft-PR #10: „Die verriegelte Schule“ mit 3 Räumen, 8 Frage-Slots, 4 Rätseln, Preflight und Lehrerübersicht. Nächster Schritt: sicherer Lab-Preview-Deploy, echter iPad/Desktop-Test, danach GradeCrew-Test-/KI-Adapter. [Konzept](docs/games/ESCAPE_MVP.md) |

## Telemetrie – neue konkrete Schritte

| ID | Aufgabe | Status | Nächster Schritt |
|---|---|---|---|
| GC-TELEMETRY-01 | Collector und Datenvertrag | Implementiert auf isoliertem Branch; Aktivierung/CI/Deploy offen | `feature/telemetry-implementation` @ `4e4f0ba`: strikter Vertrag, Auth, Deduplizierung, Limits, 30-Tage-Pilot-Retention und Cleanup. Vor Aktivierung vollständige CI/Emulator-Prüfung, Cloud-Inventar und Retention-Freigabe. [Übergabe](workstreams/telemetry-implementation.md) |
| GC-TELEMETRY-02 | Beitritt/Abgabe als ersten Ablauf instrumentieren | Teilweise implementiert, nicht aktiviert | Secure-Client misst Join/Submit nach gültigem Attempt; zusätzliche inhaltsfreie Serveroperationen erfassen gültige Start-/Submit-/Receipt-Aufrufe und Fehler. Erwartete Teilnehmerzahl und unbekannte/nicht zuordenbare Joinfälle bleiben offen. [Übergabe](workstreams/telemetry-implementation.md) |
| GC-TELEMETRY-03 | Release-/Rundenübersicht im Adminbereich | Technische Staging-Ansicht implementiert, nicht deployed | Clientmeldungen, Serveroperationen, gespeicherter Rundenzustand und KI-Bestandsdaten getrennt anzeigen; als Nächstes CI/Emulator und sichere Staging-Aktivierung, danach lesbare UI statt Roh-JSON. [Übergabe](workstreams/telemetry-implementation.md) |

## Sprache, KI-Qualität und Internationalisierung – 02.10.2026

| ID | Aufgabe | Status | Nächster Schritt |
|---|---|---|---|
| GC-INTELLIGENCE-01 | Gemeinsame Sprach-/Locale-Verträge und messbare KI-Freigabe | **ci_green**, isoliert, nicht integriert/deployed | PR [#25](https://github.com/HerrLoeffler/Hausaufgabe/pull/25), Code `5af11ca`; 14 Tests und CLI-Syntax in CI grün. [Übergabe](workstreams/quality-routing-contract-v1.md) |
| GC-VOICE-02 | Vorhandenen Crew-Diktierpfad härten | Vertrag vorbereitet; Anbindung/Gerätetest offen | Formularrevision, Request-Deduplizierung, erlaubte Patches, Vorschau/Undo; Mikrofonabbruch, Negation, Lärm und Siri separat prüfen. Baut auf GC-CREW-AI-01 auf. |
| GC-AI-EVAL-02 | Fachlich geprüftes Pilot-Referenzset pro Job/Sprache | Offen | Referenzen und unabhängige Stichprobe prüfen, Qualitäts-/Regressionsgrenzen vorab festlegen; echte gepaarte Modellevaluation. Keine 99,99-%-Behauptung aus kleinen Testsets. |
| GC-AI-ROUTING-02 | Automatische Modellwahl nur nach belegter Qualität | **ci_green**, PR #26; Runtime inaktiv | Signierte Auswahl, Budgetreservierung, Deduplizierung und qualifizierter Fallback implementiert; CI `36975168993` einschließlich Firestore-Emulator grün. Code im Gateway enthalten; echte Referenzdaten, Signierbetrieb und Functions-Pilot offen. [Übergabe](workstreams/ai-orchestration-v1.md) |
| GC-I18N-02 | Vorhandenen i18n-Core fachlich und visuell absichern | Kontext-/Capability-Vertrag vorbereitet; Migration offen | Vier Sprachkontexte getrennt, Pseudolokalisierung, Nicht-DOM-Texte, Zahlen/Bewertung und sprachabhängige Spiele prüfen. Keine zusätzliche Sprache freigegeben. |
| GC-AI-OBS-02 | Gemeinsame KI-/Sprachdiagnose und vollständige Kostenabdeckung | Ledger/Statistik/isoliertes Admin-Widget **ci_green** | PR #26: inhaltsfreie Entscheidungen, Kosten je Modell/Job, unbekannte Kosten und geschätzte API-Ersparnis getrennt. Rollenprüfender Admin-Proxy, Widget-Mount und bestehende Functions noch offen; Remy-Metriken separat bereits deployed. |

## Gesamtprüfung 02.10.2026 – gesicherte Fortsetzung

| ID | Aufgabe | Status | Nächster Schritt |
|---|---|---|---|
| GC-HANDOFF-02 | Übergabe-CI und veraltete Aufgabenstände reparieren | Fehlendes Pflichtfeld `automation.agent_dispatch` wiederhergestellt | Run `36994507849` scheiterte nachweislich an KeyError; nach diesem Commit CI erneut prüfen. Teilupdates müssen bestehende Schlüssel erhalten. |
| GC-GAMES-COST-01 | Doppelte Tutoraufrufe, veralteten Cache und Fehlerbehandlung beheben | **ci_green**, PR #27, nicht deployed | 6 Tests und Games-CI grün; gegen inzwischen v0.6 integrieren. [Übergabe](workstreams/escape-tutor-cost-guards.md) |
| GC-AI-GATEWAY-03 | Claude/OpenAI-Gateway automatisch auf Staging ausrollen | **staging_deployed** | Run `36999999589` bestätigt Candidate, beide Provider-Smokes, Promotion und Receipt auf `46b21ff4`. Automatisches Routing bleibt gesondert inaktiv. |
| GC-ARCH-AUDIT-01 | Gesamtaufbau auf Integrationslücken prüfen | In Arbeit; bisheriger Audit gesichert | Design/Sprachparser, Escape-Generator, Modellkosten und Deploy-Grenzen am aktuellen Code prüfen. [Fortsetzung](workstreams/system-review-2026-10-02.md) |
| GC-ADMIN-SCALE-01 | Admin-Bestandsabfragen begrenzen | Befund aus bisherigem Audit, Umsetzung offen | Unbegrenzte users/quizzes/feedback-Abfragen prüfen und durch Pagination/Aggregate ersetzen. |

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


## Release-Control-Audit 02.10.2026 (Abend)

Diese Nachprüfung ergänzt ältere Zeilen; historische SHAs oben sind keine Behauptung des aktuellen Deploy-Stands. Details und Belege: [Audit-Übergabe](workstreams/release-control-evidence-v2.md).

| ID | Aufgabe | Verifizierter Stand / nächster Schritt |
|---|---|---|
| GC-RELEASE-01 | Release-Board gegen falsche grüne Nachweise absichern | PR #49 integriert. V2 liest echte Receipt-Inhalte, prüft Herkunft/Digest/Scope, blockiert alte Erfolge nach neuerem Fehlversuch und ungültige Abnahmen; 14 lokale Regressionstests grün. Eigener Fix-Branch; CI/Integration separat prüfen. |
| GC-RELEASE-02 | Combined CI **vor** Web-Integration | Aktuelle AI Staging Checks hat Push/Dispatch, keinen pull_request-Trigger. Merge-Result-Tests vor Integration ergänzen; Deploy bleibt an erfolgreichen Push gebunden. |
| GC-RELEASE-03 | Automatische Staging-Rules | Nicht eingerichtet. Security-Cutover-Gates und bestätigte Schema-/Client-Kompatibilität zuerst; niemals Hosting-Grün als Rules-Nachweis verwenden. |
| GC-RELEASE-04 | Games-Lab-Automatik und Receipts | Escape-Preview-Automatik vorhanden; neuester Run 37021633218 gescheitert bei secretmanager.secrets.get für OPENAI_API_KEY. Hosting danach übersprungen. Engen IAM-/Funktions-Deploy prüfen, keinen globalen Rechte-Fix. Receipt und stale-source-Schutz fehlen. |
| GC-RELEASE-05 | Branch Protection / Rulesets | Rulesets-API meldet Tarifbeschränkung für privates Repo; main protected=false. Protection-Details zusätzlich 403 für Connector. Keine erzwungenen Pflichtchecks behaupten. |
| GC-RELEASE-06 | Production-Promotion | Weiter gesperrt. Manueller Workflow mit geprüftem Komponentenmanifest, Abnahme, Rules-/Restore-Gates und expliziter Freigabe erst später. |
| GC-ACCEPTANCE-01 | Bedienbares Abnahmeboard mit Fehlerhistorie | Katalog vorhanden, results noch leer. Interaktives Abhaken, Notizen, Fix-Verknüpfung und unverlierbare Historie fehlen; aktuell Pflege über betreuenden Chat. |
| GC-ACCEPTANCE-02 | Games-/iOS-Komponenten korrekt binden | Games braucht verifiziertes Deployment-Receipt. iPad-Abnahme muss nativen Build **und** tatsächlich geladenen Web-SHA erfassen. TestFlight 0.1.6 hochgeladen; keine Geräteabnahme daraus ableiten. |
| GC-RELEASE-07 | State-Drift, Release-Alter und Inventar-Vollständigkeit | GRADECREW_STATE enthält ältere Release-SHAs. Live-Evidenz im Board priorisieren; später Live-Revision/Manifest prüfen, Nachweisalter/Preview-Ablauf und Feature-Abhängigkeiten automatisiert abgleichen. |

Frühere Review-PRs #39 (Gateway), #40 (Escape) und #41 (Remy) sind inzwischen nachweislich gemergt. Das ersetzt keine aktuelle Staging-/Geräteabnahme. Codex-Worker bleibt nachrangig.

Warning: truncated output (original token count: 26996)
Total output lines: 546

# GradeCrew – gemeinsame To-do-Liste

Stand: 05.10.2026. Zentrale Aufgabenübersicht auf **main**. Dies ist keine Live-Freigabe.
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


## 11.10.2026 — neue Rechercheaufgabe

| ID | Aufgabe | Status | Baustelle / nächster Schritt |
|---|---|---|---|
| GC-VIDEO-INSIGHTS-20261011 | Caption-/Videoanalyse aller Julian-Ivanov- und StrategieNerd-Videos vom 11.04. bis 11.10.2026, einschließlich regulärer Videos, Shorts und Streams; zusätzlich jv5-Xhp5s_k | **Recherche dokumentiert und in main integriert; keine Release-Erfüllung** | Alle Videos inventarisiert; StrategieNerd-Folgen nach Spiel/Serie gruppiert, 19 visuelle Proben und Grenzen der 49 Primärquellenprüfungen offengelegt. Dokumentationsintegration via PR #207 in main@57106997; kein Produkt-, Installations-, Pilot- oder Deploy-Status. [Ergebnisindex](docs/research/video-insights-20261011-summary.md) · [Übergabe](workstreams/research-videos-20261011.md) |

## 12.10.2026 — FastQuiz: binomische Formeln

| ID | Aufgabe | Status | Baustelle / nächster Schritt |
|---|---|---|---|
| GC-GAMES-FASTQUIZ-BINOMIAL-20261012 | Bestehendes Fast Quiz um leichte binomische Formeln / Klasse10 /3Minuten ergänzen | **Eigenes Staging deployed; PR224 offen/unmerged.** Source `2e5f8b8e`, CI38227329308 grün, fastquiz-Functions und43Dateien im eigenen7-Tage-Kanal bestätigt; echter synthetischer Lehrer-/Schülerlauf bis Endstand2/3/150 erfolgreich. | [Spiel öffnen](https://hausaufgabe-staging--gradecrew-binomial-20261012-y55vfkoh.web.app/fast-quiz/?mode=live), gültig bis19.10.2026 11:19CEST. Schnellwahl→Runde erstellen→QR/Code teilen→Start. Physical QR/iPad/phone/Nutzerabnahme offen; gc36/Rules/Production unverändert. [Übergabe](workstreams/fastquiz-binomial-20261012.md) · [Receipts](workstreams/fastquiz-binomial-release-receipts-20261012.json) |

## P0 – vor einem neuen öffentlichen Release

| ID | Aufgabe | Status | Baustelle / nächster Schritt |
|---|---|---|---|
| GC-TUTORIAL-01 | Manuelle Tutorialabgabe in der iPad-App funktioniert nicht | **Fix auf Staging; iPad-Abnahme offen** | PR147 nach PR148 in `2d2a776`; Combined CI37459917759 + Mobile37459917770 grün, Hosting37460057171 und AI/Assessment37460057237 verifiziert. Jetzt manuelle Abgabe, Abbruch und Timer bei offener Bestätigung auf echtem iPad prüfen. [Übergabe](workstreams/staging-closeout-20261006.md) |
| GC-SECURITY-01 | Fehlgeschlagenen 30-Teilnehmer-Test diagnostizieren | Blockiert durch fehlenden Fehlernachweis | Security: Serverfehler anhand Referenz/Logs zuordnen, Ursache beheben, Test wiederholen. Keine vermutete Ursache als bewiesen darstellen. |
| GC-SECURITY-02 | Production-Security-Gates abschließen | **Start-/Transaktionsfix auf Staging; weitere Gates offen** | Port PR148 in `2d2a776`; CI37459917759 und Assessment-Deploy37460057237 verifiziert. Gates C–G, Rules-Cutover und 30-Teilnehmer-Vorfall bleiben offen. [Übergabe](workstreams/staging-closeout-20261006.md) |
| GC-RESTORE-01 | Tatsächlichen Live-Stand und vollständige Wiederherstellung absichern | Offen | Hosting-Release, Functions, Regeln, Datenbank, Auth und Uploads inventarisieren; Sicherung und Restore-Test planen. [Umgebungen](docs/releases/ENVIRONMENTS.md) |
| GC-REGRESSION-01 | PDF-, Bild- und Screenshot-Import sowie Kernabläufe erhalten | Stand prüfen, frühere Verlustmeldung | Aktuellen Integrationsstand prüfen: Import → KI → Editor → Veröffentlichung → Schülerabgabe → Auswertung. |
| GC-DEVICE-01 | Aktuellen Design-/Tutorialstand auf echten Geräten abnehmen | Offen | Desktop, iPad und iPhone einschließlich Tastatur; derzeit technisch geprüfter Designstand 74eb2ec. [Übergabe](workstreams/design-dashboard-v1.md) |

## P1 – nächste Verbesserungen

| ID | Aufgabe | Status | Baustelle / nächster Schritt |
|---|---|---|---|
| GC-ACTIONS-COST-01 | Actions-Verbrauch reduzieren und Repo vorübergehend öffentlich nutzen | Öffentlich und alle drei Optimierungen integriert; aktuelle Prüfungen grün | #88 → main 3ae00f9; #89 → Visual e83fde3; #90 → Web f30fa44. Fünf Kontroll-PR-Checks, volle Web-CI 37213496846 und 35 lokale Amazonas-Tests grün. Web-Staging Hosting/AI-Functions erfolgreich. Quota-Reset 01.11.2026. [Übergabe](workstreams/actions-cost-policy-20261004.md) |
| GC-TUTORIAL-02 | Ruhigeres Tempo, Wünsche manuell weiter, Aufgabe und Hilfe zusammen sichtbar | Stand prüfen | Web-App: aktuelle Tour gegen Nutzerwünsche prüfen; Katzenaufgabe vollständig sichtbar, gezieltes Scrollen, kein kompletter Neubau. |
| GC-TUTORIAL-03 | „Ich darf doch du sagen?“ bei der Namensfrage erhalten | Stand prüfen | Aktuellen Text und Regressionsschutz prüfen. |
| GC-TUTORIAL-04 | Tutorial nur einmal deutlich anbieten, jederzeit abbrechbar und erneut aufrufbar; Admin ohne Auto-Start | Auf Staging integriert; aktuelle Geräteabnahme offen | Gemeinsamer nachgewiesener Batch `18e30d0d`: Hosting `36991979723`, AI-Functions `36991979742`; neuere Branchspitzen separat prüfen. Verlauf siehe GRADECREW_STATE.json und vorhandene Workstream-Übergabe. |
| GC-ART-01 | Farbklekse und Randpixel an Figuren entfernen | Stand prüfen | Tatsächlich verwendete Assets visuell prüfen; zentrale Crew-Bibliothek erhalten. |
| GC-DESIGN-01 | Dashboard und Testkarten visuell feinjustieren | Implementiert, visuelle Abnahme offen | Design-Chat: bestehende Umsetzung prüfen, keine konkurrierende CSS-Schicht. |
| GC-DESIGN-02 | Neuer Test, Editor und KI-Erstellung auf gemeinsame Komponenten umstellen | Geplant | Nach Dashboard-Abnahme schrittweise; Import- und Bewertungsfunktionen erhalten. |
| GC-DESIGN-03 | Startscreen Masterpiece v2 mit Multi-KI-Guardian veredeln | Automatisch aufgenommen, bei unklarem Provider-Ergebnis gestoppt | CSS-only, unveränderte Entry-/Startup-Blobs und module-web-v1; ein Versuch mit 2,40 USD Reservierung, Gesamtdeckel weiterhin 2,55 USD. Pilot-Staging bestätigt; Homepage-Run 37220142576 scheiterte beim Builder mit unbekanntem Provider-Ergebnis. Reservierung erhalten, kein automatischer neuer Versuch; Provider-Ergebnis/Kosten zuerst abgleichen. Alle drei KI-Reviews bleiben Pflicht. Finale visuelle Abnahme bleibt bei Martin. [Übergabe](workstreams/design-startscreen-multiai-v2.md) |
| GC-DESIGN-04 | Startscreen Masterpiece v4 / Premium-Polish mit i18n-Grenze | **Hosting-Preview deployed; visuelle Geräteabnahme offen** | GPT-6.1-Sol-Kandidat aus Run 37230004552 deterministisch von CSS-content-Verstoß bereinigt, ohne neuen Provider-Build. PR #123 → Integrationscommit `fb88dfa7…`; CI 37231463662 und Preview 37231545703 grün, 111 Dateien verifiziert. DE/EN Startscreen bleibt vollständig über DOM/i18n umschaltbar; Test- und Bewertungssprache unabhängig. Drei Guardian-Reviews auf dem salvagierten Kandidaten wurden nicht nachgeholt und dürfen nicht als bestanden gelten. Jetzt Desktop/iPad/Phone + DE/EN im echten Preview abnehmen. [Übergabe](workstreams/design-startscreen-multiai-v4.md) |
| GC-DESIGN-05 | Direkter Login/Register/Reset, schöne mobile Crew-Homepage und kurze Remy-Orientierung; bisherige Funktionen/Animationen erhalten | **Web gc37 kanonisch deployed `fd9a8f99`; Native0.1.18(37) TestFlight-Upload erfolgreich, Apple-Verarbeitung gestartet. Nutzer-/Geräteabnahme offen.** | PR226/225; Node22CI38282312768/38282770458, Preview38282960088/11761704040, AI+Assessment38282959918/11762526088/11761529376, canonical38283900267/11762766814.164Dateien/29PNG erhalten; Preview201hlnau undcanonicalidentisch. NativeRun38282021673/source771; Verarbeitung/Testerassignment/Installierbarkeit nichtverifiziert. FastQuiz/Rules/Production unverändert. [Übergabe](workstreams/gc-design-05-mobile-auth-20261012.md) · [Receipts](workstreams/gc-design-05-release-receipts-20261012.json). |
| GC-DIAGNOSTICS-01 | Fehler nachvollziehbar sammeln und Admin-Logs besser filtern | Stand prüfen | Vorhandene Diagnostics/Log-Tools inventarisieren; Referenz-ID, Version, Ablauf, Filter und Sortierung prüfen; keine Antworten oder Zugangsdaten protokollieren. |
| GC-BUGOPS-01 | Fehlerberichte skalierbar bündeln, priorisieren, gezielt melden und risikoarme Fälle bis Staging automatisiert beheben | **Staging deployed; Admin-/Browserabnahme offen** | Web-Inbox, serverseitige Incident-Aggregation und Admin-Attention-Badge sind in `feature/gradecrew-app-integration@bb91ce3` integriert. Combined CI `37238513381`, Hosting `37238585607` und AI-Functions `37238585657` grün; `aggregateBugFeedback` + `getBugOpsSummary` auf Staging bestätigt. Production unverändert. Auto-Reparatur aus echten Kundenmeldungen bleibt noch gesperrt; nächster Schritt: Staging praktisch testen und danach read-only Investigator → sichere Guardian-Brücke bauen. [Übergabe](workstreams/bug-ops-v1.md) |
| GC-CLASSROOM-01 | Schüler:innen-/Klassenverwaltung mit pseudonymen Codes und Klassenfreigaben | **Masterprojekt gesichert; branch_only, noch kein Produktcode** | `feature/classroom-student-management-v1` wurde vom aktuellen Integrationshead `bb91ce3` angelegt. Architektur nutzt den bestehenden Secure-Assessment-Lifecycle statt einer zweiten Exam-Engine: StudentIdentity, Klassen/Memberships, persönliche Codes und `assessmentAssignments`. Nächster Schritt ausschließlich statische Firebase-freie Mock-Testseite auf dem Aufgabenbranch; kein normales Staging/Production. [Masterplan](docs/CLASSROOM_STUDENT_MASTERPROJECT_V1.md) · [Übergabe](workstreams/classroom-student-management-v1.md) |
| GC-AI-01 | KI-Qualitätsprüfung, Variantenfehler und fehlerhafte Listeneinträge prüfen | Drei Generierungsregeln aus PR228 via GC39/PR233 integriert und Staging deployed; Konzept AL14/PB10/GR3 erhalten | SYSTEM-Regeln berücksichtigen Lernziel/Antwortverrat, abwechslungsreiche Wahrheit/Antwortpositionen ohne Schlüsseländerung und eindeutige Gruppenzuordnung. Keine automatische Qualitätsgarantie/Publishsperre, REVIEW_SYSTEM/WHOLE_TEST_REVISION_SYSTEM unverändert. [Übergabe](workstreams/ai-quality-answer-leak-20261013.md) · [Release](workstreams/feedback-gc39-release-20261013.md). Nächster Schritt: echte neue Aufgaben qualitativ prüfen; unbekannter50Aufgaben-Test und empirische Modellverteilung unverändert/ungeprüft. |
| GC-CREW-AI-01 | Coco, Remy, Emmi und Wilma als gemeinsame KI-Assistenten mit Spracheingabe und API-sparenden Standardantworten | Auf Staging integriert; aktuelle Geräteabnahme offen | Gemeinsamer nachgewiesener Batch `18e30d0d`: Hosting `36991979723`, AI-Functions `36991979742`; neuere Branchspitzen separat prüfen. Verlauf siehe GRADECREW_STATE.json und vorhandene Workstream-Übergabe. |
| GC-CREW-AI-02 | Emmi direkt im Editor: ganzen Test per Freitext/Sprachwunsch überarbeiten | Auf Staging integriert; aktuelle Geräteabnahme offen | Gemeinsamer nachgewiesener Batch `18e30d0d`: Hosting `36991979723`, AI-Functions `36991979742`; neuere Branchspitzen separat prüfen. Verlauf siehe GRADECREW_STATE.json und vorhandene Workstream-Übergabe. |
| GC-AUDIO-01 | KI-Höraufgaben: 0–5 Audio-Aufgaben, privater Hörtext, Editor- und Schülerplayer | **Staging deployed; Browser-/Geräteabnahme offen** | Audio Masterpiece V2 integriert in `efdc1a0`; CI `37230351466`, Hosting `37230439196`, AI + Assessment Functions `37230439199` grün. Hörtext bleibt privat, kein Autoplay, Stale-/Publish-Schutz aktiv. [V2-Übergabe](workstreams/audio-masterpiece-v2.md) |
| GC-AUDIO-02 | Audio-Lösungen/Erklärungen: 0–5, Remy-Steuerung, private TTS-Assets, Freigabe erst nach Testende | **Staging deployed; Browser-/Geräteabnahme offen** | Lösungsaudio ohne zusätzlichen Text-KI-Aufruf aus vorhandenem Lösungsschlüssel; private Speicherung und serverseitige Freigabe erst bei `solutionsReleased=true`. CI/Deploy-Nachweis wie GC-AUDIO-01. [Übergabe](workstreams/audio-masterpiece-v2.md) |
| GC-IOS-01 | Installierten TestFlight-Build und verwendete Web-URL bestätigen | Offen | 0.1.5 ist erfolgreich zu TestFlight hochgeladen; nach Apple-Verarbeitung auf iPad installieren und sichtbaren Host/`Integration` bestätigen. |
| GC-IOS-02 | Hybride Lehrer-App 0.2 härten und App-Store-tauglich weiterentwickeln | **ci_green / TestFlight-Upload 0.1.5 erfolgreich; Gerätetest offen** | Kanonischer App-Branch auf `8bdebaf1` fast-forwarded. 0.1.5 öffnet standardmäßig den automatisch verifizierten Integrations-Preview, normales Staging bleibt Fallback; Shared Tokens/Manifest synchronisiert. Run `37015111963` Routing/Archive/Upload grün. Als Nächstes physischer iPad-Test, danach Navigation/Downloads/Share/Uploads/Diagnose/AppIcon weiter härten. [Übergabe](workstreams/ios-app-v2.md) Neue GC-DESIGN-05-Beziehung: PR225 merged771; peerReview/CI38279296020 grün. Nach ausdrücklichem Human-Ja autoTestFlight38282021673 actual0.1.18(37) Archive/Upload erfolgreich und Appleprocessing gestartet; Assignment/Installierbarkeit/physischeAbnahme offen. [Verifizierter Receipt](https://github.com/HerrLoeffler/Hausaufgabe/blob/21e63b490e4d800b8cca6cfb71452255e300c315/workstreams/ios-native-bridge-019.md). |
| GC-AUTOMATION-01 | Codex-Worker aktivieren und einmal vollständig testen | Blockiert durch Einrichtung | Separater API-Key und Aktivierungsvariable fehlen laut letzter Übergabe; API-Abrechnung beachten. [Einrichtung](docs/AUTOMATION_SETUP.md) |
| GC-AUTOMATION-02 | Automatische staging-only AI-Functions-WIF-Aktivierung abschließen | **Erledigt – WIF eingerichtet, automatischer Functions-E2E grün** | Setup am 02.10.2026 abgeschlossen. Automatischer Run `36943129026` deployte exakt Integrationscommit `a61759db…` mit Scope `functions:ai` nach `hausaufgabe-staging` und verifizierte `crewAssistant` + `reviseWholeTest`; Receipt Artifact `11200528486`. Production/Rules/Hosting wurden durch diesen Deploy nicht verändert. [Übergabe](workstreams/staging-functions-automation.md) |
| GC-GAMES-01 | Escape-Room-MVP mit Lehrerübersicht konkretisieren | MVP + Hub-Integration implementiert, CI grün; Lab-/Geräteabnahme offen | Branch `feature/escape-room-mvp-v1`, Draft-PR #10: „Die verriegelte Schule“ mit 3 Räumen, 8 Frage-Slots, 4 Rätseln, Preflight und Lehrerübersicht. Isolierter Lab-Preview bereits erfolgreich: Run37021633218 Versuch2 für a7ffc382, inklusive Tests und Preview-Function. Alter Secret-Metadata-Fehler überholt. Nächster Schritt: echter iPad/Desktop-Test, danach GradeCrew-Test-/KI-Adapter. [Konzept](docs/games/ESCAPE_MVP.md) |

## Telemetrie – neue konkrete Schritte

| ID | Aufgabe | Status | Nächster Schritt |
|---|---|---|---|
| GC-TELEMETRY-01 | Collector und Datenvertrag | Implementiert auf isoliertem Branch; Aktivierung/CI/Deploy offen | `feature/telemetry-implementation` @ `4e4f0ba`: strikter Vertrag, Auth, Deduplizierung, Limits, 30-Tage-Pilot-Retention und Cleanup. Vor Aktivierung vollständige CI/Emulator-Prüfung, Cloud-Inventar und Retention-Freigabe. [Übergabe](workstreams/telemetry-implementation.md) |
| GC-TELEMETRY-02 | Beitritt/Abgabe als ersten Ablauf instrumentieren | Teilweise implementiert, nicht aktiviert | Secure-Client misst Join/Submit nach gültigem Attempt; zusätzliche inhaltsfreie Serveroperationen erfassen gültige Start-/Submit-/Receipt-Aufrufe und Fehler. Erwartete Teilnehmerzahl und unbekannte/nicht zuordenbare Joinfälle bleiben offen. [Übergabe](workstreams/telemetry-implementation.md) |
| GC-TELEMETRY-03 | Release-/Rundenübersicht im Adminbereich | Technische Staging-Ansicht implementiert, nicht deployed | Clientmeldungen, Serveroperationen, gespeicherter Rundenzustand und KI-Bestandsdaten getrennt anzeigen; als Nächstes CI/Emulator und sichere Staging-Aktivierung, danach lesbare UI statt Roh-JSON. [Übergabe](workstreams/telemetry-implementation.md) |
| GC-TELEMETRY-POSTHOG-01 | PostHog EU als datensparsame Analyseprojektion hinter bestehende Crew-Telemetrie hängen | **Staging deployed; echtes Event-Audit offen** | PR #100 Deploy-Control → main `fbdd795b`; PR #99 → Integration `461da164`; dedizierte CI `37235599673` und AI Staging Checks `37235725698` grün; AI Functions Run `37235811020` erfolgreich, Secret-Gate bestanden. Jetzt eine normale Remy-Aktion in Staging auslösen und eingegangene Properties in PostHog prüfen; danach Error Tracking V1. [Übergabe](workstreams/posthog-staging-telemetry-v1.md) |

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
| GC-GAMES-COST-01 | Doppelte Tutoraufrufe, veralteten Cache und Fehlerbehandlung beheben | Technischer Runtime-Umfang abgeschlossen im isolierten Games-Preview; Geräteabnahme separat | Code und vier Regressionstests aus PR27 bereits in a7ffc382. Run37021633218 Versuch2, Job111534877678 führt Tutor-Suite erfolgreich aus. PR27-Workflow/Übergabe fehlen im Ziel; PR bleibt offen, kein vollständiger PR-Merge behauptet. Gemeinsames Web-Staging noch nicht belegt. |
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
| GC-RELEASE-01 | Release-Board gegen falsche grüne Nachweise absichern | PR #49 integriert. V2 liest echte Receipt-Inhalte, prüft Herkunft/Digest/Scope, blockiert alte Erfolge nach neuerem Fehlversuch und ungültige Abnahmen; 14 lokale Regressionstests grün. PR #50: Actions 37074543429 mit echten Receipts erfolgreich; Integration separat prüfen. |
| GC-RELEASE-02 | Combined CI **vor** Web-Integration | PR #51 ergänzt Merge-Result-CI und fehlende Crew/Emmi/Admin/Login/Tutorial-Prüfungen; PR-Lauf 37074747781 vollständig grün (inklusive Firestore-Emulator). Noch nicht auf Integrationsbranch aktiviert; Deploy bleibt an erfolgreichen Push gebunden. |
| GC-RELEASE-03 | Automatische Staging-Rules | Nicht eingerichtet. Security-Cutover-Gates und bestätigte Schema-/Client-Kompatibilität zuerst; niemals Hosting-Grün als Rules-Nachweis verwenden. |
| GC-RELEASE-04 | Games-Lab-Automatik und Receipts | Escape-Preview-Automatik vorhanden; neuester Run 37021633218 gescheitert bei secretmanager.secrets.get für OPENAI_API_KEY. Hosting danach übersprungen. Engen IAM-/Funktions-Deploy prüfen, keinen globalen Rechte-Fix. Receipt und stale-source-Schutz fehlen. |
| GC-RELEASE-05 | Branch Protection / Rulesets | Rulesets-API meldet Tarifbeschränkung für privates Repo; main protected=false. Protection-Details zusätzlich 403 für Connector. Keine erzwungenen Pflichtchecks behaupten. |
| GC-RELEASE-06 | Production-Promotion | Weiter gesperrt. Manueller Workflow mit geprüftem Komponentenmanifest, Abnahme, Rules-/Restore-Gates und expliziter Freigabe erst später. |
| GC-ACCEPTANCE-01 | Bedienbares Abnahmeboard mit Fehlerhistorie | Katalog vorhanden, results noch leer. Interaktives Abhaken, Notizen, Fix-Verknüpfung und unverlierbare Historie fehlen; aktuell Pflege über betreuenden Chat. |
| GC-ACCEPTANCE-02 | Games-/iOS-Komponenten korrekt binden | Games braucht verifiziertes Deployment-Receipt. iPad-Abnahme muss nativen Build **und** tatsächlich geladenen Web-SHA erfassen. TestFlight 0.1.6 hochgeladen; keine Geräteabnahme daraus ableiten. |
| GC-RELEASE-07 | State-Drift, Release-Alter und Inventar-Vollständigkeit | GRADECREW_STATE enthält ältere Release-SHAs. Live-Evidenz im Board priorisieren; später Live-Revision/Manifest prüfen, Nachweisalter/Preview-Ablauf und Feature-Abhängigkeiten automatisiert abgleichen. |

Frühere Review-PRs #39 (Gateway), #40 (Escape) und #41 (Remy) sind inzwischen nachweislich gemergt. Das ersetzt keine aktuelle Staging-/Geräteabnahme. Codex-Worker bleibt nachrangig.

GC-AI-GATEWAY-04: Neuester Gateway-Run `37010376603` ist beim Preflight gescheitert: „No untagged Cloud Run revision currently owns 100% of normal traffic.“ Keine neue Image-/Traffic-Promotion in diesem Lauf. Vorheriger Erfolg ist historisch; aktive Revision/Tags prüfen. Signierte Modellqualifikation und automatische Routing-Aktivierung bleiben eigenständig offen.

Abschluss dieses Audits: PR #50 integriert (`f79d153`), Main-Release-Control `37075303003` erfolgreich. PR #48 Concurrency-Fix anschließend integriert (`e7a5e0d`); erster Main-Audit danach separat prüfen. PR #51 ist CI-grün und integrationsbereit, noch nicht gemergt/aktiviert, da der Merge automatisch Staging deployt. Kein Produkt-/Cloud-Deploy in diesem Audit. Nächster priorisierter Schritt: Staging-Aktivierung von PR #51, danach Gateway-Traffic- und Escape-Secret-Blocker bearbeiten.

## Automatische Stage-Fortsetzung – Nutzerkorrektur 03.10.2026

Der Auftrag ist nicht nur eine Statusanzeige: freigegebene Funktionen sollen von Entwicklung über technische Tests, unabhängige KI-Reviews, kontrollierte Integration und verifizierten Staging-Deploy automatisch weiterbearbeitet werden. Höchstens drei Versuche pro Stufe, dann sichtbarer Blocker. Codex/Guardian ist für dieses Ziel jetzt ein eigener priorisierter Baustein; frühere pauschale Aussage „Worker nachrangig“ gilt für diese neue Anforderung nicht mehr.

| ID | Aufgabe | Status / nächster Schritt |
|---|---|---|
| GC-AUTOMATION-03 | Stage Guardian mit dauerhaftem Versuchslimit und sicheren Worker-Starts | Erster Controller implementiert, 15 lokale Tests grün, Policy deaktiviert. CI prüfen. Nicht als vollständige automatische Kette melden. [Übergabe](workstreams/stage-guardian-v1.md) |
| GC-AUTOMATION-04 | Worker-Patch automatisch als begrenzten PR sichern | V2 über PR #57 auf main (b2df3aa) integriert: Text-/Pfad-/SHA-Grenzen, eigener Draft-PR, getrennte feste CI. 70 lokale Tests und echte isolierte Combined CI grün; Aktivierung/Pilot noch offen. |
| GC-AUTOMATION-05 | Unabhängige KI-Reviews und kontrollierte Integration | **Steuerung auf main integriert; noch deaktiviert.** PR #59 bindet physische Lieferung, PR #62 verlangt drei unabhängige Prüfer (Korrektheit/Sicherheit/QA), Merge `6a5c2d0`. 86 lokale Tests, Remote-Guardian-CI `37192179040` und isolierte Web-Rehearsal `37192179131` grün. Keys/Flags und echter Pilot fehlen. [Übergabe](workstreams/guardian-three-reviewers-v1.md) |
| GC-AUTOMATION-06 | Worker-Abschluss, Fehlerfeedback und drei begrenzte Reparaturrunden | V2 über PR #57 auf main integriert: vollständige Run-Zuordnung, Feedback/Usage, höchstens drei Bauversuche, unklare Ergebnisse stoppen; getrennte begrenzte Deploy-Retries. Main-CI 37083880267 grün. |
| GC-AUTOMATION-07 | Vollständigen Pilot von Auftrag bis verifiziertem Staging durchführen | **Begrenzter Web-Pilot E2E bestätigt:** Run 37218095594 mit Bau/CI/drei Reviews/Integration grün; integrierte CI 37218270539 grün. Hosting 37219916184 (zweiter begrenzter Deployversuch; 110 Dateien) und AI Functions 37219916242 mit digest-geprüften Receipts für denselben 2436a432-SHA bestätigt. Historie/Budget erhalten, 2/3 Versuche und 1,70/2,55 USD reserviert. Geräteabnahme offen. |


GC-AUTOMATION-08: Gesonderte Zulassungsprofile für Backend/Security/Rules, Games und native Apps sowie explizite Konflikt-Rebase-Aufträge sind weiter offen. V2 darf diese Workstreams nicht über die Web-Allowlist übernehmen. Hauptpriorität zuerst GC-AUTOMATION-07: einen echten kleineren Pilot nach sicherer Einrichtung bestätigen.


## Guardian-Aktivierung und günstigere kleine Aufträge – 04.10.2026

| ID | Aufgabe | Status / nächster Schritt |
|---|---|---|
| GC-AUTOMATION-12 | Kleines Kostenprofil und konkreten E2E-Pilot fertig vorbereiten | Über PR #71 auf main integriert (6810e163). 91 lokale Tests sowie Guardian-CI 37194975024, Handoff 37194975026, Development Status 37194975086 und isolierte Gesamt-Rehearsal 37194975244 grün. Gleiche vier Modelle, engere Eingabe-/Ausgabegrenzen, max. 0,85 USD/Versuch und 2,55 USD/Auftrag; Standardprofil bleibt kompatibel. Aktuelle offizielle Standardpreise geprüft. Secrets/Flags fehlen, kein bezahlter Pilot. [Übergabe](workstreams/guardian-budget-pilot-v1.md) |

## Guardian-Aktivierung und Gesamtprüfung 04.10.2026

| ID | Aufgabe | Aktueller Nachweis / nächster Schritt |
|---|---|---|
| GC-AUTOMATION-13 | Diagnostizierten Review-403-Pilot sicher fortsetzen | **Gelöst, integriert und echtes Staging bestätigt.** #95/#97/#102; Recovery 37218071013, neuer vollständiger Run 37218095594 und integrierte CI 37218270539 grün. Hosting/Functions-Receipts für 2436a432 verifiziert. Originale Historie/Hashes/Publikation/Usage/Reservierung unverändert erhalten; 2/3 Versuche, 1,70/2,55 USD reserviert, bekannte API-Nutzungsschätzung insgesamt 0,100344 USD. Homepage-Folgeauftrag automatisch aufgenommen. [Übergabe](workstreams/guardian-source-recovery-20261004.md) |
| GC-AUTOMATION-14 | Guardian-CI an verifiziertes Staging übergeben | **Übergabe #102 integriert (1825bad), fünf finale Checks grün.** Hosting 37219916184 und Functions 37219916242 erfolgreich, Controller bestätigt staging_deployed mit beiden Receipts für 2436a432. Keine neue bezahlte Bau-Runde hierfür. Snapshot-Kompatibilität #103 integriert (390ab81), vier Checks grün. Archiv 37220092242 im zweiten Versuch erfolgreich; Release enthält exakt den verifizierten 2436a432-Stand, ZIP/Manifest/Prüfsummen. Homepage-Lauf 37220142576 bereits aufgenommen; Production unverändert. [Übergabe](workstreams/guardian-staging-handoff-20261004.md) |
| GC-ARCH-AUDIT-02 | Gesamten aktuellen Code und automatische Zulassung aller Baustellen prüfen | Martin hat den vollständigen Audit und die Weiterbearbeitung geeigneter Aufträge freigegeben. Frisches Branch-/PR-Inventar: mehrere parallele Workstreams. 322 Web-Textdateien plus 124 ausgewählte Gateway/Games/iOS-Dateien geprüft; Syntaxprüfungen grün, genaue Testgrenzen und P0/P1-Befunde im [Audit](docs/REPOSITORY_AUDIT_2026-10-04.md). Startscreen-Vertrag korrigiert und an verifizierten Pilot gekoppelt. Backend/Rules/Games/iOS brauchen weiterhin eigene Profile. Keine automatische Geräte-/Production-Abnahme. [Übergabe](workstreams/guardian-recovery-audit-20261004.md) |

GC-AUTOMATION-01/07/12: frühere Setup-/403-Aussagen sind überholt. Zweiter echter Pilot 37218095594 hat alle vier Modellaufrufe, exakte CI, drei Reviews und Integration bestanden; beide Staging-Receipts für 2436a432 sind verifiziert. Erster Versuch und seine 0,85-USD-Reservierung bleiben erhalten. Bekannte Pilot-API-Nutzungsschätzung insgesamt 0,100344 USD, keine Rechnung. Neuer Homepage-Auftrag 37220142576 ist nach unbekanntem Provider-Ergebnis gestoppt; separate 2,40-USD-Reservierung innerhalb seines 2,55-USD-Limits bleibt erhalten. Kein automatischer Retry.

| GC-GAMES-INTEGRITY-01 | Fehlerjagd-Highscores serverseitig validieren und atomar abschließen | Auditbefund, eigener Games-Folgeauftrag | Client-Summary wird nur begrenzt; Attempt-Status außerhalb der Finalisierungstransaktion gelesen. Antwort-/Scorebeleg und konkurrierende Finalisierung testen. Keine automatische Änderung fremder Games-Branches. [Audit](docs/REPOSITORY_AUDIT_2026-10-04.md) |

## Chat-Wiederaufnahme 04.10.2026

| ID | Aufgabe | Status | Baustelle / nächster Schritt |
|---|---|---|---|
| GC-HANDOFF-03 | Verbindungsabbrüche und Ersatzchats mit belegtem Arbeitsstand fortsetzen | Wiederaufnahmeregel und Vorlage ergänzt; Integration/CI frisch prüfen | [Anleitung](docs/CHAT_RECOVERY.md), [Übergabe](workstreams/chat-recovery-20261004.md). Dieselbe Task-ID, Chat-Zuordnung, gesicherter Schritt, laufende IDs und Budget erhalten. Martin kann den Einstieg einmal in GradeCrew-Projektanweisungen übernehmen; diese Repo-Änderung setzt keine ChatGPT-Einstellung. |


GC-AUTOMATION-13 / Wiederaufnahme „Main GC (w)“ (04.10.2026): Letzter konkreter Quellenvertragsauftrag anhand Chatverlauf, abgeschlossener Ausführung und aktuellem Ledger als erledigt verifiziert. Zwei Pilotversuche / 1,70 USD Reservierung erhalten; kein neuer Bau, Recovery oder Deploy. Aktuelle Web-/Hosting-/AI-/Assessment-Quelle fb88dfa7; Geräte-/Rules-Abnahme bleibt offen. Details und abweichende alte Chat-Anzeige in [bestehender Übergabe](workstreams/guardian-source-recovery-20261004.md).


## Staging-Abschluss 2026-10-06 – belegter Zwischenstand

- GC-I18N-02/03: PR139 in `feature/gradecrew-app-integration@90b48d854e0deca87fbf33b376c76826c1fc2d60` integriert. Combined CI37417856806, Hosting37417963944 und AI/Assessment Functions37417963972 erfolgreich. DE/EN-Geräteprüfung, Browsercache und Fortsetzen bestehender Versuche offen; keine vollständige i18n-Abnahme.
- GC-SECURITY-02: PR146 (`b1119cc3`) isoliert CI-grün; Sol bereitet Integrations-PR vor. Noch nicht im veröffentlichten Kandidaten. Weitere Security-Gates offen.
- GC-TUTORIAL-01: WebView-confirm reproduziert; Sol bereitet Seitendialog-Fix samt Timer-Test gegen90b48d8 vor. Noch nicht deployed.
- GC-IOS-01/02: Fachchat meldet0.1.9 in PR144 als CI-grünen Entwurf; letzter belegter TestFlight-U…8996 tokens truncated…e/Team erhalten, Zahlen bleiben lokal. Tatsächlicher Bedarf weiter offen, keine garantierte Rentabilität oder Einreichung. Nächster Schritt: reale laufende Kosten, externe Leistungen und Gründervergütung erfassen. Kein App-/Release-/Productionwechsel; bestehende Übergabe aktualisiert.


## 08.10.2026 — GC-GAMES-ESCAPE-VISUAL-01: Wasser, Fuchs und Steuerung testbereit

Martin bestätigt verbesserte frühe Bedienung und3/10. Folgebereich ersetzt gezeichneten Hauptast durch denselbenMessbecher:100-/200-ml-Zuläufe,100-ml-Ablauf,genau1L eingießen. KeinzweiterBecher. LI3 liestLI1/LI2. VersteinerterFuchserwachtbeigültigemSatz,läuftzumTor,ziehtSeilschlaufe;ToröffnetnachRiegelfreigabe. Esc bietetWiederholungohneLernreset. Mausslider25–300%,Figur420cm/s. Sechs neueTafeln120Studien,gesamt385Konzeptmotive/26Bildaufrufe; NativeFigurdeutlichsimpleralsKonzepte.

Frisch16:56:16UTC:195portableChecks,4UE-Suites,0Fehler/8Epicidevice-Umgebungswarnungen. Frischer unabhängigerReview: FokusverlustundPfosten imLaufwegrot→grün in einemFixpass.20aktuelleAufnahmen;keinOS-/Kinder-/iPadtest. Remotec7653d9b25e0cc93ad95b61bb29f9f74a4077ae4,lokalb817014d034856b60b24142380ef184832d6fe8c,RuntimeGitbauma84531f3580764f87cf6dc4cda03eae5ef644215 bytegleich. DraftPR175/branch_only. EigeneSpielsessionPID37899überStartergestartet. NächsterSchritt:MartinprüftEsc→Fuchsaktionerneutansehenundnachfolgende1L-Aufgabe. [Prüfung](games/lerninsel-unreal/Production/WATER-FOX-REVIEW.md), [Vorlagen/Ablauf](docs/games/lerninsel/20261008-fox-water/README.md). AltesBuch-/Budget-/Versuchsgedächtniserhalten;Production/Webreleaseunverändert.


08.10.2026 Nutzerfeedback nach lokalem Start: Martin bestätigt, dass die Fuchsaktion gut aussieht. Die zwischenzeitlich gewünschte frische Spielsitzung wurde mit „ist egal“ nicht weiterverfolgt; kein Spielstand zurückgesetzt, kein neuer Testslot erzeugt und keine laufende Sitzung beendet. Natürliche Auslösung durch richtige Satzlösung bleibt, optionale Wiederholung verfügbar. Positives visuelles Feedback ist keine vollständige Abnahme der neuen Wasser-/Steuerungsstrecke. Code/Build/Branchstufe unverändert. Nächster Schritt: regulären Verlauf samt zweiter1-Liter-Aufgabe testen.


## 08.10.2026 — GC-GAMES-ESCAPE-VISUAL-01: Fundbuch und Perspektividee

Nutzer versteht „Drei Funde ordnen“ im aktuellen Durchlauf nicht. Aktueller Code geprüft: vier Reliefs mit E entdecken, im Fundbuch genau drei bekannte Bruchanteile auswählen, Summe1=10/10, Menge prüfen; Reihenfolge spielt keine Rolle. Die Benennung „ordnen“ ist irreführend und als offener Punkt der Aufgabenführung erfasst. Aktueller Runtimeblock unverändert; keine neuen Tests/Generation/Deploys.

Verbindlich für den Ideenbestand merken: räumlich getrennte Ringteile durch den eigenen Standpunkt/Blick zu einem Ring ergänzen. Als kleines eigenständiges Logik-/Perspektivrätsel für eine spätere Aktivierung nutzen. Knapper Hinweis: „Alles eine Frage der Perspektive.“ Die Ausrichtung soll selbst entdeckt werden; die konkrete Aktivierung ist noch offen. Die Trennung vom mathematischen Fundbuch ist eine spätere Umsetzungsidee, keine heute gebaute Änderung. Nächster Schritt: Fundbuchauftrag verständlicher benennen und die zwei Teilaufgaben bei der nächsten Überarbeitung klar auseinanderhalten.


## 08.10.2026 — GC-GAMES-ESCAPE-VISUAL-01: Tatsächliche Artlücke und Fundbereich abgelehnt

Martin bestätigt die ersten drei Level als funktionierenden Test. Der Fundbereich wird beim Herumlaufen nicht verstanden; die Chat-Erklärung wurde ausdrücklich als unzureichend zurückgewiesen. Aktuelle Aufgabenführung daher nicht akzeptiert. Referenztafel gegen echteFox-Stone/Fox-Grip/Arrival-Aufnahmen und Quellcode verglichen: Grafik3/10gegenVorlage, keine Gesamtspielreife aus früherer technischer9/10ableiten. Ursache: Vorlagen wurden noch nicht in gleichwertige3D-Assets umgesetzt; zusammengesetzteFuchsformen, einfache Materialien/Mauern/Pflanzen. Renderingauflösung allein löst das nicht.

Nächster Produktionsfokus: Fuchs/Satzplatz/Tor als eine ausgearbeitete Referenzszene, echte Unreal-Aufnahmen als Maßstab; keine neuen Bildmassen als Ersatz für Modelle. Fundbereich muss danach neu sichtbar geführt/gestaltet werden, separatePerspektiv-Ringidee erhalten. [Vergleich und Abnahmekriterien](docs/games/lerninsel/20261008-art-audit.md). Nur Audit/Übergabe gesichert, keine neueArtimplementierung/Build-/Deploybehauptung. Remotedoc28a60a34695f6c147d9a3ee71633adb09414c32e,lokal7d44d20. Runtimeweiterb817014/195Checks/4UE-Tests ausvorherigemBlock; keine neuen Tests wegenreinerDokumentation. Budget26Aufrufe/385Motive, Nutzerfortschritt, Webrelease und Production unverändert.


## 08.10.2026 — GC-GAMES-ESCAPE-VISUAL-01: Web/iPad und1000gleichzeitigeSpieler

Nutzer fragt, ob bessereGrafik/Render zu großerDatenlast und Websiteproblemen bei1000gleichzeitigenSpielern führen. Aktueller .uproject/README geprüft: lokalnativerUE5.8-Prototyp, nochkeineBrowserbereitstellung. OffizielleUE5.8PixelStreaming-/Hostingdoku,MDNWebGLundBabylonOptimierungsdoku frischgelesen. ZweiWege unterscheiden: Browser rendertlokal(nurAssets/Spielstanddaten herunterladen) gegenüberUEserverrendertundüberträgtlaufendWebRTCVideo. EigenständigeInteraktionen benötigenRender-/Encodingkapazität proSitzung, nicht1000Zuschauer desselbenStreams.1GPUproSpieler istkeineBehauptung; tatsächlicheDichte brauchtBenchmarks.

IllustrativeRechnung, keinMesswert:8Mbit/s×1000=8Gbit/s und3,6TBproStundeNurVideo; Overhead/TURN zusätzlich. Beispiel100MBoptimiertesAssetpaket×1000ersteLoads=100GB, mitCache spätereTransfersweniger; Arbeitsspeicherbedarf separat. Layoutbilder bleibenEntwicklungsreferenzen und werden nichtautomatischalleansSpiel ausgeliefert. GuteOptikbraucht nichtmaximalePolygon-/Texturmenge; passendeModelle,Materialgestaltung,vorberechnetesLicht,Kompression/Detailstufen undbereichsweisesLaden ermöglichenwebgerechteGestaltung. Einzelgerät kannbeiÜberlastung ruckeln/abbrechen;1000User belastenbeiBrowserrendering vorallemCDN/Backend, nichtzentral1000Renderer.

Empfehlung zurPrüfung, nochkeineEngineumstellung: für1000eigenständigeSchul-WebnutzerBrowserlokal8/10,UEPixelStreaming4/10 anhandBetriebskosten/Skalierung/iPad. BeideEinschätzungen bedingtdurchOptimierung undfehlendeGeräte-/Lastmessungen. VorweitererArtmassenproduktioneine repräsentativeFuchs-/Hofszene mitwebtauglichenAssets amältestenZiel-iPad vermessen(Ladegröße,GPU-Speicher,FPS,Ladezeit) und separatCDN/BackendLast. BisherigerC++UEcode istkeinEin-Klick-Browserexport;direkteWebversionbrauchtPort/angepassteLaufzeit. Keine1000User- oderiPad-Eignung alsbewiesenbehaupten;keineHosting-/Cloudkosten gestartet.

Quellen: https://dev.epicgames.com/documentation/en-us/unreal-engine/hosting-and-networking-guide-for-pixel-streaming-in-unreal-engine ; https://dev.epicgames.com/documentation/unreal-engine/pixel-streaming-in-unreal-engine ; https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API ; https://doc.babylonjs.com/features/featuresDeepDive/scene/optimize_your_scene ; https://editor.babylonjs.com/documentation/advanced/compressing-textures . Production/Runtime/26Bildaufrufe unverändert. NächsterSchritt: Web-Assetbudget undrepräsentativenGerätebenchmarkvorderfinalenInselgrafik festlegen.


08.10.2026 — Klarstellung Browserbetrieb ist nicht automatisch kostenlos: Renderingrechenleistung auf dem Schülergerät spart laufendeGPU-Streams, Hosting-Speicher und Dateiübertragung bleiben jeTarifkostenpflichtig. OffizielleFirebaseHostingdoku frischverifiziert: aufBlaze10GBmonatlicherTransferfrei, danach0,15USD/GB; CDNCachetrefferzählenauchalsTransfer. Beispiel100MB×1000ersteLoads=100GB, bei10GBnochvollfreierQuote90×0,15=13,50USDreinerTransfer, ohneSpeicher/Backend/Steuern und ohneweiterenProjekttraffic. Kein gemessenerSpielumfang oder geprüfterBillingtarif. BrowsercacheaufEndgerätkannerneuteDownloadsvermeiden,nichtgarantiert;CDNcachemachtAbrufenichtkostenlos. Quelle https://firebase.google.com/docs/hosting/usage-quotas-pricing . KeineTarifänderung/Deploy/Engineumstellung. NächsterSchritt realeAssetgrößenundTrafficbudgetsdefinieren.


09.10.2026 — GC-GAMES-ESCAPE-VISUAL-01: Nutzer lehnt grobe Fuchsmodelle ab und fordert nachvollziehbare lokale Blender-MCP-Einrichtung sowie detailreiche Figuren. Diagnose: vorhandenerSTDIO-Eintraguvx/mcp-for-blender, Add-on1.8/Protokoll13 passend; echterPython-Zugriff undKamerabild erfolgreich. AktiverFuchs21Meshteile/1020Basispolygone, keinRig/Subdivision/Bildtexturen; Bibliotheken/Generatoren aus. Tutorial nenntMakeHuman-CC0-Grundkörper/109064Dreiecke. Qualitätslücke liegt belegt in derModell-/Assetproduktion; Unreal verwendet lautÜbergabe noch prozeduraleGeometrie statt importierterBlenderFBX. VisuelleNähe zumDetailziel ungefähr3/10, keineGesamtprojektbewertung. NächsterSchritt: hochwertigesFuchsbasismodell ausarbeiten, sichtbarabnehmen, riggen undinUnrealintegrieren; vorÄnderung aktiveArtarbeit/DevelopmentStatusprüfen. NurDiagnose/Einrichtungshinweise, keinPaketwechsel/Generatorauftrag/Deploy; Budget26/385erhalten. Details inworkstreams/lerninsel-layouts-20261007.md.


## 09.10.2026 — GC-GAMES-ESCAPE-VISUAL-01: Unity eingeordnet

Nutzerfrage zu https://unity.com/: Brauchen wir Unity? Reine Beratung, kein Auftrag für Installation oder Enginewechsel. Aktuelles main und bestehende Lerninsel-Übergabe gelesen. Unity ist eine alternative Spiele-Engine mit 2D/3D-, Web- und mobilen Zielen. Offizielle Browserdokumentation nennt WebGL2/WebAssembly und Unterstützung mobiler Browser einschließlich iOS Safari15+. Daraus folgt keine geprüfte Eignung unserer Szene auf Ziel-iPads.

Empfehlung dieses Chats: aktuell Unity nicht zusätzlich einführen. Nutzen eines sofortigen Wechsels für die gegenwärtige Grafikbaustelle etwa3/10, begründet durch zusätzlichen Portierungsaufwand und die bereits dokumentierte Modell-/Material-/Rig-Lücke. Unity erzeugt aus den groben Fuchsmodellen keine hochwertigen Figuren; hochwertige Assets werden unabhängig von der Laufzeit benötigt. Für die spätere browserlokale Lerninsel ist Unity ein ernsthafter Prüfkandidat. Entscheidung bleibt offen bis repräsentative Szene, Ladegröße, Speicher, FPS und Bedienung am ältesten Ziel-iPad geprüft sind. Keine neue Engineentscheidung als Nutzerbeschluss erfassen.

Nächster Schritt: webtaugliche repräsentative Fuchs-/Hofszene mit hochwertigem Modell und klaren Geräte-/Assetbudgets für die Laufzeitentscheidung festlegen. Diese Beratung ersetzt keine laufende Artproduktion. Keine Codeänderung, Runtimeprüfung, neue Generation, Installation, bezahlte Provider-Anfrage oder Deployment; bestehende Task-ID, Runtime-/Release-Stufen, Budget26Bildaufrufe/385Motive und Versuchshistorie bleiben erhalten. Chat-Link unbekannt.

Quellen: https://unity.com/ ; https://docs.unity.com/en-us/engine/6000.7/manual/platform-specific/webgl/intro/browsercompatibility (6.7Beta-Dokumentation, nur als Fähigkeitsbeleg, keine Beta-Einführung empfohlen).

## Codex-Spielwerkzeuge – GC-IMG2THREEJS-01

| ID | Aufgabe | Status | Nächster Schritt |
| --- | --- | --- | --- |
| GC-IMG2THREEJS-01 | img2threejs installieren und für passende Spielearbeit verbindlich auffindbar machen | Lokal v2.0.0 installiert, Bildprobe und 23 Workflow-Tests erfolgreich. Gemeinsamer Einstieg und Nutzungsnachweis auf main integriert; Spiel-/Modellqualität weiterhin offen. | Zuständiger Spielechat liest [Werkzeug-/Qualitätsregel](docs/games/IMG2THREEJS_AND_ASSET_QUALITY.md) und belegt Nutzung oder begründete Alternative. [Übergabe](workstreams/img2threejs-codex-install-20261009.md) |
| GC-IMG2THREEJS-01 · Qualitätsfolgepunkt | Martins Rückmeldung: Spielqualität aktuell noch zu schlecht | Offen, nicht visuell abgenommen; dokumentierte Fuchs-Assetlücke unter GC-GAMES-ESCAPE-VISUAL-01 bleibt bestehen. Kein neuer Modell-/Spieltest durch diese Dokumentation. | Zuständiger Spielchat konkretisiert Referenz und kritische Mängel und prüft einen hochwertigen repräsentativen Abschnitt in der Spielszene. |


## 09.10.2026 — GC-WEB-REPAIR-20261007 / GC-SECURITY-02: Veröffentlichung und Audio-Schülerstart repariert

PR176–178 integriert auf `6ee594b6e733720e21ed683f5f044d7354d63b3a`; exact CI37948062983, Preview37948212494, AI-/Assessment-Functions37948212670 und kanonische Promotion37948608081/Receipt11624403965 erfolgreich, gc30/131Dateien. Sichere Staging-Regeln bytegleich geprüft und aktiv; acht echte anonyme Read-/Forged-Write-Versuche403. Firestore-Reihenfolgen-Speicherfehler behoben; echter11Typen-Test30Starts/90Polls/30Abgaben/30idempotenteDoppelabgaben erfolgreich. Betroffene29Aufgaben-Audiokopie lokalveröffentlicht, echterStart/Resume einschließlichAudioantwort ohneLösungs-/Hörtextleck erfolgreich. Staging-Schalter Aus→sicherBeendet→Ein→Veröffentlicht realbestätigt. LokalerDesignstand gezielterhalten/aktualisiert. KonkreterBlocker behoben, keine technischeNutzerfreigabe erforderlich; vollständigeGeräte-/Maximallast-/GateE-/Productionabnahme bleibtseparat offen. Production unverändert. [Nachweise und Übergabe](workstreams/security-audio-release-20261009.md). NächsterSchritt bestehendeSeite einmalneuladen; keineerneuteReparatur oderDeploywiederholung ohne neueFehlerbelege.


09.10.2026 · GC-WEB-REPAIR-20261007:20nummerierteCoco-Loginvorlagen erzeugt, lokaleÜbersicht gespeichert. Coco überKartenkante, vollständigerroterHerzballon mit „Schön, dass du da bist!“. Vorlagenauswahl offen; danach transparentesEinzelasset undlokalerEinbau. KeineCode-/Deployänderung. [Übergabe](workstreams/coco-login-poses-20261009.md).


09.10.2026 · GC-CREW-AI-01: CocoSuche/Dauergedächtnis vomNutzerzurUmsetzungfreigegeben. DraftPR179, feature/coco-support-memory-20261009 (Relatedfix/staging-feedback-coco-memory-20261009fürvolleCI), Remote370e1e1,315Web/191FunctionsundReviewkorrekturengrün. Statusbranch_only,nochkeinDeploy/Kontolive-Test. PermanenteeditierbareVorlieben/letzte40GesprächsnachrichtenohneTTL,eigentumsgeprüfteTest-/Bildmetadatensuche,TreffermitÖffnen. [Übergabe](workstreams/coco-support-memory-20261009.md). Next exakteCIundStaging-/lokaleVerbindungverifizieren,Productionausgeschlossen;alteBildnachbeschreibungundFeedbackverfolgungoffen.


## 09.10.2026 — GC-CREW-AI-01: Coco-Suche, dauerhafte Erinnerungen und konkreter Support auf Staging

PR179–183 in `c3a5fdcfb949bc0de23295a549388c23cf7655e6` integriert. Exakte CandidateCI37985370499, MergeCI37985594616, Preview37985751663 und AI/Assessment37985751577 erfolgreich. Canonical37986203915 Versuch2/Receipt11643860414 erfolgreich; Versuch1 vorDeploy durch Google-TokenHTTP403 abgebrochen, keine unbekannte Providerwiederholung. Lokal200Functions+291RootWeb+78UI grün. Reales Konto: Vorlieben speichern→Reload→wiederherstellen; ursprünglichen Wert zurückgesetzt. OrangenerDrache in „Nomen und Adjektive – verrückte Sprachideen“ gefunden/geöffnet, erneut nachReload ohne neuenBildaufruf. AktuellerTesttitel/29Aufgaben/Status richtig, eigeneMeldungsstände gelesen undFeedback nurvorbereitet/abgebrochen. 30Altbilder dauerhaftbeschrieben,18weiterenochfehlend; explizitebegrenzteNachbeschreibungbeiBedarf. Vorlieben ohneTTL,letzte40Nachrichten; ResetgenerationverhindertgeräteübergreifendeWiederbelebung. Statusstaging_deployed, agentLiveChecks bestanden, MartinsNutzer-/Geräteabnahme separat. Production unverändert. [Übergabe](workstreams/coco-support-memory-20261009.md). NextCocorealnutzen; kein erneutbezahltesBildindexierenfürbereitsgefundeneMotive,keinpauschalesunbegrenztesGedächtnisbehaupten.

## 10.10.2026 — zwei dauerhafte Fachrollen / GC-LAUNCH-CONTROLS-01

| ID | Auftrag / Stand | Genau nächster Schritt |
|---|---|---|
| GC-LAUNCH-CONTROLS-01 | Gemeinsamer Dokumentationseinstieg für40Kontrollen, zwei ausführende Fachrollen, alle Zentralen/Fach-Chats und neueGames. Isolierter Integrationsbranch; branch_only, Review/CI/Mainintegration separat belegen. Kein Produktaudit/Rechtszertifikat, keine Runtime-/Hookinstallation oder Deploys. | Zwei unabhängige Doku-Reviews/exakteCI abgleichen, nurDokusetup nachmain integrieren und tatsächlichen Receipt sichern. [Übergabe](workstreams/launch-controls-integration-20261010.md) |
| GC-LAUNCH-CONTROLS-01-SECURITY | Quell-PR189@873bf75b: SEC01–20 und Rollenbrief, exakteDoku-CI38062837565/38062837519 grün. Bestehende GC-SECURITY-02/Assessment/Coco/Gamesnachweise erhalten; nicht40Kontrollen erfüllt. | Quellen über gemeinsamenSetup-Owner integrieren; spätere konkrete technische Befunde im bestehenden Task/Scope prüfen. [Quellübergabe](workstreams/launch-controls-security-20261010.md) |
| GC-LAUNCH-CONTROLS-01-PRIVACY | Quell-PR188@d5e6988e: PRIV01–20 und Rollenbrief, exakteDoku-CI38062835957/38062835900 grün. Schul-/AVV-/Provider-/Fristenfacts offen; Dokuintegration ist keine Rechtsfreigabe. | NachDokusetup Coco-Metadatenmatrix PRIV07/20 quellengestützt im vorhandenenScope, keineKontoinhalte lesen/löschen. [Quellübergabe](workstreams/gc-launch-privacy-20261010.md) |

10.10.2026 · Ausführungsphase GC-LAUNCH-CONTROLS-01 ausdrücklich beauftragt: vorhandene Taskfamilien SECURITY/PRIVACY prüfen alle20 SEC-/PRIV-Punkte. security_role_setup Sol/high und privacy_fairness_role_setup Sol/medium durch Zentrale reaktiviert; Ergebnisse hier nicht verifiziert. Sechs Setupquellen bis Main-Receipt exklusiv Integration, dann eigene Katalogzuständigkeit übertragen. Neue Audit-/Fixbelege getrennt, Produktfixes separate geprüfte PRs im bestehenden Release-Train; keine Productionfreigabe/konkurrierenden Stagingdeploys. Keine zweite Gesamtprüfung durch Setup-Owner.


GC-LAUNCH-CONTROLS-01 · Dokumentationssetup über [PR190](https://github.com/HerrLoeffler/Hausaufgabe/pull/190) auf main@c567843590a950b7c5eca053f808bd9343e0c6e6 integriert; zwei unabhängige Doku-Reviews ohne Findings, Kandidaten- und Main-Dokuchecks grün (Main38064714219/38064714229, ReleaseControl38064714222). Das erfüllt keine Produktkontrolle:31 nicht geprüft/9offen. Bereits beauftragte SECURITY-/PRIVACY-Fachagenten erhalten aktuelle Main-/PR-Receipts und ihre jeweiligen drei Katalog-/Rollen-/Quellübergabepfade; sechsSetupdateien danach nicht mehr beim Integrationsowner bearbeiten. Shared-Dateien bleiben exklusiv Integration. Gesamtprüfungen je20 Punkte/Fixes separat im vorhandenen Task-/Release-Train, keine Production-/konkurrierenden Stagingdeploys. Keine zweite Gesamtprüfung durch Setup-Owner.


## 10.10.2026 — GC-HOOKS-01 / gezielte Skills

| ID | Belegter Umfang | Nächster Schritt |
|---|---|---|
| GC-HOOKS-01 | Bestehende fünf Zentralenrollen und adaptive Modellregel sind auf main; Hook-Entwurf [PR184](https://github.com/HerrLoeffler/Hausaufgabe/pull/184) bleibt branch_only. Keine Hooks/Runtime-Sperren installiert. Ursprüngliche Task-/Versuchshistorie erhalten. | Zuverlässige Threadidentität und Hook-Trust/Umsetzung separat qualifizieren, keine Aktivierung aus Dokumentation ableiten. |
| GC-HOOKS-01-SKILLS | Sechs ausgewählte standalone User-Skills auf Martins Mac installiert; Integrationowner hat28Manifesthashes tatsächlich erneut abgeglichen. Quellen-/Discovery-/Offlinebelege aus [PR193](https://github.com/HerrLoeffler/Hausaufgabe/pull/193), begrenzter unabhängiger Dokureview ohne Findings und exakte Doku-CI grün. [Facharbeit-Einstieg](docs/skills/GRADECREW_EXECUTION_SKILLS.md), [eigene Integrationsübergabe](workstreams/skills-integration-20261010.md). | Innerhalb konkret autorisierter Facharbeit einsetzen; andere Hosts/alte Desktopturns separat prüfen. Kein Deploy, neue Cloudrechte, Migration oder pauschales Skillpaket. |


## 10.10.2026 — GC-MODEL-GOVERNOR-01: native Codex-Defaults und GradeCrew-Starts

| ID | Belegter Umfang | Nächster Schritt |
|---|---|---|
| GC-MODEL-GOVERNOR-01 | PR 200 hat Luna/medium als globalen Native-Default auf main gebracht; manuelle Desktop-Overrides bleiben unberührt. Workbench-CLI-Governor nach PR 201 auf `feature/gradecrew-app-integration@507a0600` integriert (Tooling, kein Staging/Production). Source-CI `38090177717/114324833180` und gemeldete Post-Merge-Checks `114325311748`, `114325311725`, `114325311535` completed/success; unabhängige Reviewachsen bestanden. Lokaler Digest-Fix `2062aaaf→bc999d6d` (zwei Workbench-Dateien, 7/7 laut bestehender Recovery) und Site-8772-Receipt PID `57860`, keine aktiven Jobs in beiden Projekten. Runtime-Modell/Effort/Tokens/Kosten/Ersparnis bleiben unbekannt; keine inference/deploy claim. | PR 199 dokumentiert diese bestehenden Belege und wartet auf unabhängigen Delta-Review sowie frische main-basierte Dokumentationschecks; danach Sharedowner kann normal integrieren. Runtimewerte erst beim nächsten gewöhnlichen CLI-Auftrag erfassen. |
| GC-CHAT-PREFLIGHT-01 | Folgeauftrag zu GC-HOOKS-01 und GC-MODEL-GOVERNOR-01: Nutzerauftrag, vor jedem Enter die aktuelle Regelversion zu prüfen und Modell/Effort vor dem Call adaptiv zu wählen. Status: beauftragt; technische native Unterstützung offen, nicht implementiert. Keine Broadcasts, Fake-Hooks oder private App-DB/UI-Interception behauptet. | Bestehender Zentrale-Fachagent `/root/chat_rules_preflight` (Luna/medium angefordert) arbeitet entlang der vorhandenen Quelle `analysis/GC-MODEL-GOVERNOR-01/QUEUED_CHAT_PREFLIGHT.md`; nur die eigene technische Unterstützung/Belege fortführen. |


## 10.10.2026 — GC-LAUNCH-CONTROLS-01: vorhandene Arbeit erhalten, nächste Gates

- SECURITY: lokaler Checkpoint 778f88b017e75b3e868697966bf4faee6a8c2d9d auf checkpoint/gc-launch-security-preserve-20261010 erhält acht unveränderte Dateien + Metadatenhandoff; sauberer Baum, kein Scan/Test/Codefix/Merge/Deploy. Plattformstop „possible cybersecurity risk“ und gestoppter Recoveryturn erhalten, Reviewbefunde offen.209Tests/ESLint ohne gefundenen SHA-gebundenen Log nur Agentenbericht; kein fertigerFix. [Erhaltungsübergabe](workstreams/launch-controls-preservation-20261010.md).
- SEC20: öffentlicher npm-Abgleich durch Auto-Review wegen Export vollständiger Dependency-Namen/Versionen ohne Freigabe abgelehnt; laut Übergabe kein Request ausgeführt. Nicht wiederholen/kein anderes Ziel. Metadatenabgleich offen.
- PRIVACY: PR191@bb1c6bee, ZielWebc3a5fdcf. Tatsächlicher Admincheck38065021884 grün:6Contracttests +132-DateienBuild; Source berichtet19lokaleTests/Peer/synthetischeKeyboardUI. Keine CombinedCI-/Merge-/Deployfreigabe. [Eigene Integrationsvorlage](workstreams/privacy-controls-integration-20261010.md), gleicheTaskfamilie.
- Zusätzliche Screenshotmaßnahmen im bestehenden SEC09/11/12/20- und GC-RESTORE-01-Scope vormerken: technische Basis/gezielte autorisierte Fixes qualifizieren, Logredaktion/SessionShareddevice sowie Backup+synthetischenRestore belegen; kostenpflichtige Betriebsaktivierung erst mit geprüftem Paket. Keine neue Liste/Plattform, keine Durchschnitts-Sicherheitsnote oder pauschale Kostenabschaltung einer laufenden Schulprüfung. In dieser Übergabephase keine technische Umsetzung.


## 10.10.2026 — GC-POCOCK-RESEARCH-01 / parallele Skillzuständigkeit

| Task | Stand und Owner | Nächster Schritt |
|---|---|---|
| GC-POCOCK-RESEARCH-01 | Lokal beauftragte Caption-/Primärtextforschung des Originalkanals @mattpocockuk für10.04.–10.10.2026 inkl. Shorts/Livestream-Aufzeichnungen; Inventar laut Zentrale in Erweiterung. Exklusive Gruppen channel-inventory, wayfinder, v13/poteto, batch-a, kein zusätzlicher Scan durch Registrierung. V13/Wayfinder laut Koordinator captionbasiert vollständig, keine visuelle Vollvideoansicht behauptet. | Vorhandene Ergebnisse/Quellen-/Abdeckungsgrenzen abholen; nur eigene Zusammenfassung/Metadaten sichern, keine fremden Volltranskripte öffentlich. [Übergabe](workstreams/matt-pocock-research-20261010.md) |
| GC-HOOKS-01-SKILLS | Autorisierte ausgewählte offizielle Firebase-/Frontend-Design-Skill-Einrichtung exklusiv bei GradeCrew-Plugins recherchieren01a10e37-4955-7db3-957f-d397b9dd8dc4; konkrete Installation/Versions-/Verhaltensbelege hier ungeprüft, keine Migration/Paid-Reviews. | Eigene Skillnachweise dort abholen; gemeinsame Regeln nur gezielt über Integrationsowner, kein Komplettpaket oder zweite Statusdatenbank. |


Aktualisierung beim Wiederaufnehmen10.10.2026: [Draft-PR193](https://github.com/HerrLoeffler/Hausaufgabe/pull/193) liegt offen auf docs/gc-hooks-skills-setup-20261010@16b3fe3006b3b07d4b8867cb861742fa8ea94a60, sechs ausschließlich eigene Dokumentations-/Evidencepfade ohne Überschneidung mit dieser Sicherung. PR-Autor berichtet sechs lokal installierte Skills, frische Discovery und grüne Dokuchecks; hier nur PR-Metadaten gelesen, keine Installation/Discovery/Verhaltensprüfung wiederholt. Shared-Einstieg/GC-HOOKS-Deltas als separaten qualifizierten Integrationsschritt behandeln, kein automatisches Mitintegrieren.


Aktueller Skillreceipt: PR193 und Einstiegs-/StatusPR195 tatsächlich nachmain@c8ba1222a1266fa2241a6cd069a206036e1a7df3 integriert; [Integrationsübergabe](workstreams/skills-integration-20261010.md). Vorheriger ungeprüfter Kandidatenstatus im historischen Forschungsabschnitt ist damit überholt. Kein Researchupload, Hookinstall oder Deploy.


GC-POCOCK-RESEARCH-01 · aktueller textueller Abschluss:40/40Inventar-IDs,16Langvideos+4Streams+20Shorts,40lokaleCaptiondateien/Analysen und IDs durch Integrationsowner abgeglichen. Quellenagenten berichten volle Caption-Lektüre; unabhängiger Synthesereview prüfte Analysen/Schlüsselstellen. Audio/alle visuellen Demos nicht vollständig geprüft. [Eigene Zusammenfassung](docs/research/matt-pocock-20261010-summary.md), [Metadaten](docs/research/matt-pocock-20261010-evidence.json), [Übergabe](workstreams/matt-pocock-research-20261010.md). Historischer aktiver Inventarstand überholt; volle Captions lokal, keine neuen Piloten/Installationen/Deploys. Nächster Schritt: Zentrale wertet Bericht aus und wählt nur bei Bedarf einen bestehenden konkreten Fachauftrag.


GC-POCOCK-RESEARCH-01 · tatsächlicher Dokumentationsreceipt: [PR194](https://github.com/HerrLoeffler/Hausaufgabe/pull/194) finalab738f822b3b15c1d2ef18f75c762c1ef0d228b5 nach unabhängigem Doku-/Metadatenreview ohne Findings auf main@3142a6e42f2daca8d35b1b84b086a506a4b99a9b integriert. Kandidat-Handoff38082215129/DevelopmentStatus38082215063 und ready-DevelopmentStatus38082255964 success. EigenerBericht/Review, Zusammenfassung, kleineMetadaten, Registry und vorhandene Launch-/Privacyübergaben integriert; keineProdukt-/Deploystufe daraus. Researchregistrierung integrated; Folgeumsetzung/Pilot bleibt eigener Auftrag.

## 11.10.2026 — Kontoverwaltung auf bestehender Testseite

| ID | Aufgabe | Status | Baustelle / nächster Schritt |
|---|---|---|---|
| GC-WEB-REPAIR-20261007-ADMIN | Kontoauswahl, Rollen, Sperren und bestätigte Löschung in der bestehenden Administration | **Staging deployed b1251b/gc34; Nutzerabnahme offen** | [PR209](https://github.com/HerrLoeffler/Hausaufgabe/pull/209) gemergt nach unabhängiger Integrationsprüfung und exakter Kandidaten-CI38104518447. Mergebaum identisch geprüftem Kandidaten; bestehende Merge-CI38104693107 läuft. Getrennte Functions/Rules/Hosting-Nachweise und synthetischer Test auf8772 folgen. Production unverändert. [Übergabe](workstreams/admin-account-actions-20261011.md) |


## 11.10.2026 — Games-Produktion: bestehende Task GC-GAMES-PIPELINE-01

| ID | Aufgabe | Status | Baustelle / nächster Schritt |
|---|---|---|---|
| GC-GAMES-PIPELINE-01 | Gemeinsamer Produktionsworkflow mit gleichwertigen 2D-/3D-Profilen; Kochspiel 2D, Lerninsel 3D | **Dokumentationsguide in main integriert** (PR #217, Merge `f2da067`; main zuletzt `a3eefe` geprüft); keine Spielimplementierung behauptet | [Verbindlicher Guide](docs/games/GREAT_GAMES_WORKFLOW.md) und [Spielbrief](docs/games/GAME_PROJECT_TEMPLATE.md). Unabhängiger Review PASS für Head `340fc84` (Receipt-SHA `1131d27f…`); Doku-CI auf PR-Head und Merge-Commit erfolgreich. PR153/185 unverändert. Keine Runtime-, Geräte-, Asset- oder Deployabnahme. Reale visuelle Assetqualität bleibt als bestehender Folgepunkt GC-IMG2THREEJS-01 / GC-GAMES-ESCAPE-VISUAL-01 offen. Nächster Schritt: Guide im nächsten separat autorisierten Spielauftrag anwenden. [Übergabe](workstreams/great-games-production-20261006.md) |


## GC-PEDAGOGY-KB-01 Aufgabenpool-Anbindung

| ID | Auftrag | Stand | Nächster Schritt |
|---|---|---|---|
| GC-PEDAGOGY-KB-01 | Passende geprüfte Aufgabenprofile nach Fach, Jahrgang und Schulart automatisch bei der Testgenerierung berücksichtigen | **Code und CI grün; noch nicht integriert/deployed.** [PR218](https://github.com/HerrLoeffler/Hausaufgabe/pull/218), Commit64d78d19fd48b50b440adf829c26de5e85c5dc4f. 53 eigene anonyme Startprofile, strikte Prüf-/Kontext-/Mediengates, unveränderter Erstprompt ohne Treffer. 248 lokale Functions-Tests unter Node22/24; GitHub Functions/Lint/BugOps-Regeln success38137059508. | [Übergabe](workstreams/pedagogical-pool-20261011.md). Qualifizierte Integration in bestehenden App-Branch und Staging-Aktivierung; Modellqualität/Nutzertest offen. Lokal archivierte Originale und größere, teils ungeprüfte Register bleiben separat; vollständige Medienanalyse aus PR214/208 offen. |


## 11.10.2026 — GC-WEB-REPAIR-20261007 Feedback auf kanonischem Staging

PR221 integriert b1251b56200030190cb86c4b9b20c529a1bea05f, gc34/139Dateien. Node22CI38171575617+38171691368, AI/Assessment38171814538 (Receipts11714014948/11713429053), Preview38171814566 (11713154403), Canonical38172084789 (11714780489) erfolgreich. Sichere Rules exact195d40d6… veröffentlicht; echte authentifizierte lesende Browserprüfung von gespeichertem Entwurf, Audio-Modi/Locks und lokalem QR bestanden. Vorhandene Stagingdeltas durch Ancestry05306c→9363 erhalten; fremde lokale Dirtyarbeit bleibt unangetastet. Alte Höraufgaben ohne öffentlichen Arbeitsauftrag benötigen manuelle Lehrkraftprüfung; keine automatische Textmigration. Geräte-/Nutzerabnahme offen, Production unverändert. [Dauerhafte Übergabe](workstreams/feedback-release-20261011.md).


## GC-WEB-REPAIR-20261007 — gc34-Nachbesserungen / vollständiger lokaler Stand

**Aktiv, noch kein neuer Deploy.** Nutzer verlangt sämtliche lokalen Produktverbesserungen aufStaging: echte Höraufgabenfrage/ein öffentlicher Fragevertrag, Startanimation, ET, Coco-Erinnerungs-/Telefonbilder, Entfernung altesBereichtool, Remy nebenNeuerTest/blauerPapierkorb und bestehender Farbvertrag. Vollständiger337-Datei-Sourceabgleich gesichert; lokale Verbesserungen getrennt von alten Sicherheitsrückschritten rekonstruieren. Audio/Coco/Farbautoren getrennt, vorhandeneGuardserhalten, unabhängigerReview/Referenzvollständigkeit/echterlokal-vs-StagingAbgleich Pflicht. ETlocal-onlyEndpoints benötigen sicherenStagingvertrag, keineblindöffentlicheWorkbenchServerkopie. LetzterechterRelease bleibtb1251b/gc34. [Übergabe](workstreams/feedback-release-20261011.md).


### GC-PLUGINS-01 — ArtCraft/PdfCraft Kurztest (11.10.2026)
- [x] Offizielle portable CLI v0.6.0 am Archivhash geprüft; synthetisches Arbeitsblatt getrennt, kombiniert und kommentiert; unabhängige 7/7 Inhaltschecks und Renderprüfung bestanden. [Nachweis und Grenzen](workstreams/plugins-pdfcraft-pilot-20261011.md). Internes Werkzeug8/10, App-Abhängigkeit4/10; kein Deploy/Installationspaket. Optional nächster Schritt: drei anonymisierte echte PDF-Exporte vergleichen; noch nicht beauftragt.

## Final canonical reconciliation — 2026-10-12 CEST

GC-WEB-REPAIR-20261007, PR222 complete product reconciliation plus PR223 neutral login copy. Canonical **d6cd4e733e1a3b8e8b63a14058a364389f3f4488 / 2.3.1-gc36 /164 files**, https://hausaufgabe-staging.web.app/. Candidate Node22CI38178571533 and merge38178714448 success. Preview38178844102 receipt11716733398, AI/Assessment38178844003 receipts11716807408/11716253528, canonical38179306263 receipt11716594995; actual public release.json exact. First AI update request failed only getCrewTelemetrySummary; one same-SHA failed-job retry succeeded. Previous gc35 d62/38177890713/11716956308 remains history. Backend, config and allowlist trees unchanged for gc36; secure Rules195d40d6d65efa3edc7c647aba9a3004fd2dedbc584a0349bf9adc658ff90807 retained, no Rules redeploy or Production.

Full inventory workstreams/feedback-full-local-inventory-20261011.json:377 paths,243 already equal; all remaining paths consciously adopted/reconciled or retained as older guarded contracts, tests, unused pose variants or local execution boundary. SHA2563a02d62eb7eb166f15b375086a78f269f808d0edbcb7b4ad383f94429ada4fce. No pending/unclassified product improvement. Coco packaging loss was missing PNGs/tree/allowlist despite dynamic source references; Remy/bin/startanimation/runtime UI hunks previously omitted now preserved. Old local publishedCode CSS hid the real join code: rejected for Staging and now three exact bad rules removed locally after backup, remaining CSS unchanged.

Local minimal alignment:19 reviewed App functions +6Secure functions match source, with narrow math imports, locale, colors, authscroll, ETloopback and cache/helper hunks. All outside-owned Appregions preserved byte-for-byte after excluding only ownedfunctions/import/versionliterals. Backup /private/tmp/gc35-owned-local-alignment-before-20261011. Foreign local development and loopback ET server preserved. ET on Staging is explicit signed-admin/non-test navigation to the existing local workbench, no public execution bridge; local duplicate launcher hidden.

ActualHTTP all29 packaged Crew PNGs agree canonical/localHTTP/localSource/build. gc36 helper SHA256b4cc09b67905d8d415c8caeea4ed3bc22a9865999c0d3f7f970771dda99fbfdf matches canonical/local/reviewed source; servedstartup imports helper?v2. Independent actual gc35 signed dashboard smoke saw paper animation, Remy/new-test/bin/Coco/no compact region tool and local ET navigation. Final gc36 existing Browser4 tab actual AX showed neutral visible login; both login/register DOM hints neutral, visible STAGING nodes empty. Separate fresh-browser smoke was blocked by Mac lock; no unlock/new window, form submit, Register viewport/mobile390x740/physical-device claim.

Private Hörtext is never auto-published. New fromTask preserves its already-public question; listening tasks use one explicit publicquestion field, canonical clearing cannot revive nested old criteria. Only playable listening R/F uses generic DE/EN procedural fallback; it does not prove an unidentified old recording contains a sufficient statement. Userq5/q8 semantics unknown without testcode. Old criterion-less MC tasks need explicit teacher-reviewed public instructions; no migration performed. No real attempts/deletion/paid generation/user-data writes. User acceptance remains separate.

Durable local evidence: analysis/GC-WEB-REPAIR-20261007-ADMIN/feedback-followup-reconciliation-20261011.md and release-proof-20261011/ (component/canonical receipts, full assets, local alignment/CSS backup proofs, service equality, independent reviews, browser/HTTP smoke). Final STATE/TODO/registry update is documentation only; no new product release.


## 13.10.2026 — Test-Rallye: vierte Games-Kachel (Planungsentwurf)

| ID | Aufgabe | Status | Baustelle / nächster Schritt |
|---|---|---|---|
| GC-GAMES-TEST-RALLYE-01 | Vorschlag für vierte Webspiel-Kachel: vorhandenen GradeCrew-Test mit bestehenden automatisch bewertbaren Aufgaben im Games-Rundenfluss spielen | **Ausführlicher Implementierungsplan; Umsetzung und isoliertes Staging ausdrücklich beauftragt.** Vorhandener Docs-Branch/PR235 wird fortgeführt. | Defaults entschieden: eine Abgabe, Teilpunkte proportional, falsch−50/5s, Scorefloor0; eindeutiger Text erlaubt. Nächster Schritt: gesicherten Plan bauen und echtes Lehrer-/Schülerspiel auf eigenem Staging prüfen. [Plan](docs/games/test-rallye-plan-20261013.md) · [Übergabe](workstreams/test-rallye-plan-20261013.md) |

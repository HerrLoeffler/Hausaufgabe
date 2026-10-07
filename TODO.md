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
| GC-DESIGN-05 | Startscreen und Anmeldung | **Auf Staging; Nutzerabnahme offen** | PR151/154 in `c6eec209`; CI `37492560344`, Preview `37492715073`, Canonical Hosting `37493180662` und AI/Assessment-Functions `37492714872` grün. Martin prüft jetzt reale Anmeldung und Testanlage; Browser-/Geräteabnahme noch offen. [Korrektur](workstreams/gc-design-05-acceptance-20261006.md) |
| GC-DIAGNOSTICS-01 | Fehler nachvollziehbar sammeln und Admin-Logs besser filtern | Stand prüfen | Vorhandene Diagnostics/Log-Tools inventarisieren; Referenz-ID, Version, Ablauf, Filter und Sortierung prüfen; keine Antworten oder Zugangsdaten protokollieren. |
| GC-BUGOPS-01 | Fehlerberichte skalierbar bündeln, priorisieren, gezielt melden und risikoarme Fälle bis Staging automatisiert beheben | **Staging deployed; Admin-/Browserabnahme offen** | Web-Inbox, serverseitige Incident-Aggregation und Admin-Attention-Badge sind in `feature/gradecrew-app-integration@bb91ce3` integriert. Combined CI `37238513381`, Hosting `37238585607` und AI-Functions `37238585657` grün; `aggregateBugFeedback` + `getBugOpsSummary` auf Staging bestätigt. Production unverändert. Auto-Reparatur aus echten Kundenmeldungen bleibt noch gesperrt; nächster Schritt: Staging praktisch testen und danach read-only Investigator → sichere Guardian-Brücke bauen. [Übergabe](workstreams/bug-ops-v1.md) |
| GC-CLASSROOM-01 | Schüler:innen-/Klassenverwaltung mit pseudonymen Codes und Klassenfreigaben | **Masterprojekt gesichert; branch_only, noch kein Produktcode** | `feature/classroom-student-management-v1` wurde vom aktuellen Integrationshead `bb91ce3` angelegt. Architektur nutzt den bestehenden Secure-Assessment-Lifecycle statt einer zweiten Exam-Engine: StudentIdentity, Klassen/Memberships, persönliche Codes und `assessmentAssignments`. Nächster Schritt ausschließlich statische Firebase-freie Mock-Testseite auf dem Aufgabenbranch; kein normales Staging/Production. [Masterplan](docs/CLASSROOM_STUDENT_MASTERPROJECT_V1.md) · [Übergabe](workstreams/classroom-student-management-v1.md) |
| GC-AI-01 | KI-Qualitätsprüfung, Variantenfehler und fehlerhafte Listeneinträge prüfen | Stand prüfen, frühere Nutzerberichte | Reproduzierbare Fälle am aktuellen Stand sammeln, bestehende Fehlerbehebungen verifizieren. |
| GC-CREW-AI-01 | Coco, Remy, Emmi und Wilma als gemeinsame KI-Assistenten mit Spracheingabe und API-sparenden Standardantworten | Auf Staging integriert; aktuelle Geräteabnahme offen | Gemeinsamer nachgewiesener Batch `18e30d0d`: Hosting `36991979723`, AI-Functions `36991979742`; neuere Branchspitzen separat prüfen. Verlauf siehe GRADECREW_STATE.json und vorhandene Workstream-Übergabe. |
| GC-CREW-AI-02 | Emmi direkt im Editor: ganzen Test per Freitext/Sprachwunsch überarbeiten | Auf Staging integriert; aktuelle Geräteabnahme offen | Gemeinsamer nachgewiesener Batch `18e30d0d`: Hosting `36991979723`, AI-Functions `36991979742`; neuere Branchspitzen separat prüfen. Verlauf siehe GRADECREW_STATE.json und vorhandene Workstream-Übergabe. |
| GC-AUDIO-01 | KI-Höraufgaben: 0–5 Audio-Aufgaben, privater Hörtext, Editor- und Schülerplayer | **Staging deployed; Browser-/Geräteabnahme offen** | Audio Masterpiece V2 integriert in `efdc1a0`; CI `37230351466`, Hosting `37230439196`, AI + Assessment Functions `37230439199` grün. Hörtext bleibt privat, kein Autoplay, Stale-/Publish-Schutz aktiv. [V2-Übergabe](workstreams/audio-masterpiece-v2.md) |
| GC-AUDIO-02 | Audio-Lösungen/Erklärungen: 0–5, Remy-Steuerung, private TTS-Assets, Freigabe erst nach Testende | **Staging deployed; Browser-/Geräteabnahme offen** | Lösungsaudio ohne zusätzlichen Text-KI-Aufruf aus vorhandenem Lösungsschlüssel; private Speicherung und serverseitige Freigabe erst bei `solutionsReleased=true`. CI/Deploy-Nachweis wie GC-AUDIO-01. [Übergabe](workstreams/audio-masterpiece-v2.md) |
| GC-IOS-01 | Installierten TestFlight-Build und verwendete Web-URL bestätigen | Offen | 0.1.5 ist erfolgreich zu TestFlight hochgeladen; nach Apple-Verarbeitung auf iPad installieren und sichtbaren Host/`Integration` bestätigen. |
| GC-IOS-02 | Hybride Lehrer-App 0.2 härten und App-Store-tauglich weiterentwickeln | **ci_green / TestFlight-Upload 0.1.5 erfolgreich; Gerätetest offen** | Kanonischer App-Branch auf `8bdebaf1` fast-forwarded. 0.1.5 öffnet standardmäßig den automatisch verifizierten Integrations-Preview, normales Staging bleibt Fallback; Shared Tokens/Manifest synchronisiert. Run `37015111963` Routing/Archive/Upload grün. Als Nächstes physischer iPad-Test, danach Navigation/Downloads/Share/Uploads/Diagnose/AppIcon weiter härten. [Übergabe](workstreams/ios-app-v2.md) |
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
- GC-IOS-01/02: Fachchat meldet0.1.9 in PR144 als CI-grünen Entwurf; letzter belegter TestFlight-Upload0.1.8 Build18. Geräteinstallation/Web-SHA offen. PR145 korrigiert historische Angaben; Entwurf noch nicht integriert.
- GC-ARCH-AUDIT-01 / GC-BRAIN-01: 50 Katalog-IDs abgeglichen: 3 begrenzt abgeschlossen, 6 spätere Erweiterungen, 11 Abnahmen, 30 Prüf-/Umsetzungspunkte. Komponenten-Aktivierungsgates nicht pauschal Pflicht für bestehenden Web-Release. Bericht/Dispatch-Ledger auf `prototype/gradecrew-control-local-v1` unter `prototypes/gradecrew-control-local/`.

- GC-TUTORIAL-01 Zwischenstand 2026-10-06: PR147 Head1c994ecba37741eca81f256132efc721b4d42a6f enthält Seitendialog statt WebView-confirm, Timer-/Doppeltipp-/Altformular-Schutz; 51 gezielte lokale Tests und Build grün. Vollständige Kandidaten-CI und unabhängige Review werden nachgeholt; noch nicht integriert/deployed.

## Startscreen-Korrektur und feste Staging-Adresse — 6. Oktober 2026

| Aufgabe | Stand | Nächster Schritt |
| --- | --- | --- |
| GC-DESIGN-05B | Lokale Coco-Gasttour und kompakter Handy-Einstieg auf Staging; Emmis roter Feedback-Smiley in der Gasttour repariert, Nutzertest offen. PR154 und Reparatur-PR156 → `4d6ee69`; CI `37542394496`, Hosting-Receipt `11449022640`, AI/Assessment-Receipts `11448732514`/`11449512022`. | Auf [Staging](https://hausaufgabe-staging.web.app/) Gasttour bis Wilma, echten Login und das Erstellen/Speichern eines Tests prüfen; Desktop/Handy visuell abnehmen. Kein Production-Deploy. [Übergabe](workstreams/gc-design-05b-guest-tour-20261006.md) |
| GC-WEB-POLISH-20261007 | Startbühne und Lehreroberfläche nach Martins Screenshots: Remy-Fokus, Crew-/Login-/Testcode-Hierarchie, Dashboard-Tutorial, Headerbreite, sparsame Aktionslabels und Markwords-Titel. | **Auf Staging veröffentlicht; Login-/Geräteabnahme offen.** UI-PR157 reviewt und über PR159/`0931ade4` integriert; Merge-CI `37547012003`, kanonisches Hosting `37547422005`/Receipt `11450254448`, AI/Assessment-Functions `37547126016` grün. Jetzt Login und normalen Test erstellen/speichern, Desktop/Handy visuell prüfen. [Übergabe](workstreams/gc-web-polish-20261007.md) |
| GC-STAGING-CANONICAL-01 | Controller PR152 und API-Pfad-Fix PR155 integriert; Canonical Staging Hosting `37493180662` mit Receipt `11427025542` für `c6eec209` verifiziert. | Martin prüft reale Anmeldung und Testanlage; frühere fehlgeschlagene Preview `37482339993` bleibt ohne Receipt. [Übergabe](workstreams/staging-canonical-20261006.md) |

## Web-Reparaturpaket 07.10.2026

| Aufgabe | Stand | Nächster Schritt |
| --- | --- | --- |
| GC-WEB-REPAIR-20261007 | Gemeldete Regressionen + „Meine Tests“-Layout und Coco-Bewegung; keine Scrollgeschichte. | **Final `094546a4` auf kanonischem Staging; Nutzertest offen.** Exakte CI `37558924609`, Preview `37559039697`, AI/Assessment `37559039672` und kanonisches Hosting `37559354641`/Receipt `11456410883` erfolgreich;123Dateien verifiziert. Reale Staging-Testliste1920px ohne Seitenscroll, lokale390px-Ansicht und Tastaturschalter geprüft. Alte Fehlerjobs bleiben Historie. Neue private Audiomodi sind Lehrkraft-Entwürfe bis Live-Rules/Gates C–F/30Teilnehmer belegt. Automatisches Chat-Abholen PAUSED; Games/iOS/Production ausgeschlossen. [Übergabe](workstreams/web-repair-batch-20261007.md) |


## 2026-10-07 07:20 Europe/Berlin — gezielte Nutzertest-Nachkorrektur

094546a4 hat Martins visuelle Abnahme nicht bestanden. PR163 auf feature/audio-crew-visual-correction-20261007, exact 0b3b574b8add3fbb65ddbf288f668ae07158d038, lokaler b4b8c4c / identischer Tree0823b20e2ea2c6f7bdd1a5732d355d958a15e23e. Vier Originalfiguren und blauer Crewbutton, Vorteilsbilder, Breite ohne Ganzseiten-Verkleinerung, finite Bewegung respektiert Reduced Motion. Keine echte neue Flügel-/Türanimation der statischen Szene. Linke Navigation nur Empfehlung für später.

Zusätzliche Nutzermeldungen: AI-EDIT-001 RPT-MUXNE643-7B958 zeigt fehlenden Hörtext im Qualitätsreview. Reproduziert und korrigiert, Qualitätssperre unverändert. Explizite Testsprache füllt Formular und löst dessen change aus. Roter Smiley bietet fehlende Höraufgabe/falsche Sprache Rules-kompatibel. Antwort1–4 sichtbar ausgeblendet, Aria erhalten. KI-generierte Stimme bleibt. Grammatik-only Satzbau berücksichtigt auch Bedeutungsvarianten (purple/hungry); bestehende alternativeOrders-Bewertung geprüft, Prompts ergänzt. Konkreter vorhandener Test nicht verändert und keine vollständige KI-Ergebnisgarantie.

Gezielte Tests und123Files-Build erfolgreich; unabhängige Delta-Reviews ohne wichtige Befunde. Lokale Heroansicht1920 breit und390×844 mit0pxHorizontalüberstand und exakt844pxDokumenthöhe visuell geprüft; Dashboard-Handyabschluss noch laufend. AktuelleCI37575580701 noch offen. Kein neuer Stagingdeploy. CollectorPAUSED; privateAudio-Gates/Rules/Production unverändert. Nächster Schritt: exakteCIundfrischeIntegration, danach verifiziertePreview-/FunctionsReceipts undCanonicalrequest.


## 2026-10-07 — PR163 kanonisch veröffentlicht

App `12b54c2f9ee9761642c63378c724955c53b7d0c4`, Tree0823b20e2ea2c6f7bdd1a5732d355d958a15e23e. Exact CI37575725669 erfolgreich. Preview37575854754 Versuch1: Upload erfolgreich, sofortiger Manifestvergleich unterschiedlich; kein neuerer Branch/Hostinglauf. Ein begrenzter Wiederholungsversuch desselben unveränderlichen Builds bestand sämtliche Prüfungen, Receipt11462721822, Build11462581651. Diese Historie bleibt erhalten. AI/Assessment37575854717 erfolgreich, Receipts11462362075/11463141295.

Canonicalrequest auf main4dada15a5bffccd54ff1f9624ce274c32942e557, Run37576307264/Job112645925177 erfolgreich, Receipt11463137102 (sha256:37fc13072d6c4c4a0af7e205141ac2241e40266f25f88d9aa4d58bedb464d826). Feste Adresse https://hausaufgabe-staging.web.app/ veröffentlicht. Tatsächlicher kanonischer Browser1920 bestätigt vier Originalfiguren, keinen zusätzlichen Vektorpinguin und0pxSeitenüberstand. Screenshot lokalpr163-staging.jpg. LokaleHero390×844:0pxÜberstand, Dokumenthöhe844; Dashboard390:0px. Browserzugriff aufPreviewrelease.json war ERR_BLOCKED_BY_CLIENT; keinHTTP/Browserbypass, Veröffentlichung nur über bestehenden geprüften Workflow. Keine Geräte- oder bezahlte Generierungsabnahme behauptet.

Testsprache, Hörtext-Review, einfache Feedbackoptionen und ausgeblendete Audioantwortnummern veröffentlicht. KI-generierte Stimme bleibt. Grammatikvarianten werden explizit angefordert/geprüft; Bewertung bekannterAlternativen funktioniert. Vollständige semantische KI-Abnahme und vorhandeneTestreparatur nicht behauptet; DYVCHDPV unverändert. Echter neuer Flügel-/Türbewegungsfilm der statischen Klassenzimmerszene bleibt offen, nur finite Bewegung vorhandenerPorträts. Seitenleiste nur Empfehlung. PrivateAudioveröffentlichung weitergesperrtbisSecureRules/GatesC–F/30Teilnehmerfallbelegt. CollectorPAUSED; keineGames/iOS/Production. NächsterSchritt: MartinsNutzertestdiesesStandes, keineautomatischenZwischenabfragen.


## 2026-10-07 — PR164 Tutorial-Abgabe und neue Nutzerwünsche

Nutzer meldet blockierten Bestätigungsdialog. Reproduziert mit trusted Eingaben: Tutorialguard blockiert body-level studentSubmitConfirm. Nur während answering ist der offene Abgabedialog jetzt erlaubt; beide Escape-Guards lassen Dialogabbruch zu, übrige Seite bleibt gesperrt. Irreführender Nur-der-markierte-Schritt-Hinweis am Abschluss entfernt. 25 fokussierte Tests bestanden; Regression vorher fehlgeschlagen. Unabhängiger statischer Delta-Review ohne blockierende Befunde. PR164 Headccae343821250823654a25016fc1e7fd54d4e2a4, CandidateCI37583234472 erfolgreich; Mergebe39294ab9e9f85bb90c52760be374c5fe3e5b06 Treeb9bc6376c61199cd798a523cd4fce99b8faf05ba. MergeCI37583383799 läuft, noch kein Deploy behauptet.

Offen: Abschlussbild ist eingebetteter584x308Rasterausschnitt; Coco-Schärfe nicht korrigiert. Benefit-Reihenfolge Coco/Remy/Emmi/Wilma mit sinnvollen Rollen, Hero-Schrift frei von Remy und Originalporträt im Überblickskopf angefordert. Reviewmodus-Konzept vom Nutzer bestätigt: persistente elementbezogene Kommentare, Admin plus explizit berechtigte Lehrkräfte; Adminhinweise als autorisierte Arbeitsaufträge, Lehrkraftvorschläge erst nach Martins Freigabe umsetzen. Verarbeitung nur manuell gesammelt, keine KI pro Kommentar/keine automatische Abfrage. Noch nicht implementiert. Remy-Hilfe ausdrücklich erst Ideen: Antworten zum Anhören, antippbare Beispiele, sichtbare verstandene Anzahl/editierbar; natürliche Formulierungen unterstützen. Keine Erweiterung hierfür in PR164.

Nächster Schritt: exakten Merge-CI-Abschluss und verifizierte Preview-/Functions-Receipts abholen, danach bestehender Canonical-Workflow. CollectorPAUSED, privateAudio-Gates/Rules/Production unverändert.


## 2026-10-07 — PR165/166 Nutzerkorrekturen, noch vor kanonischer Veröffentlichung

PR165 integriert als0448767124c6c47d1ca7089558b1b84dc471a3b3: Emmi hilft dir beim Überarbeiten. / Sag Emmi, was du an deinem Test ändern möchtest. Vier Bridgeprüfungen, scoped review, CandidateCI37583638115 undMergeCI37583790228 bestanden; Preview37583912112/Functions37583912016 erfolgreich. Canonical noch offen, durch PR166 zu bündeln.

PR166 Head9749e2b950f763f527570928a21d2e7605a6db0a, Tree5b710fb09bb647827a3b010c79515eaec51d096a, CandidateCI37584648405 läuft. Vorwärts wiederholt q2 statt q3 reproduziert; Zielindex sofort setzen und vor Zwischenframes schützen. Review fand echten pointerdown-Zwischenschritt, ebenfalls reproduziert/korrigiert; unabhängiger Recheck ohneBlocker.25gezielteTests bestanden. Hörhinweis DE/EN mit Bildrichtung statt bloßHöraufgabe, Transkriptprivat. Neueste Nutzeranweisung ersetzt ältere: KI-generierte Stimme unterSchülerplayern entfernen. Download/Tempo imnativenPlayer via controlslist ausblenden, keineZugriffssperre behaupten.

Neue Anfrage: Testeinstellungen grundsätzlich eingeklappt; vorVeröffentlichen optional nurEinstellungen imübersichtlichenDialog prüfen; proNutzer DiesenHinweisnichtmehranzeigen, inpersönlichenEinstellungen rückgängig. Noch nichtimplementiert. GrünmarkierungSchülerübersicht vomNutzerzurückgezogen, vorhandeneFunktionunverändertlassen. RemyHilfeweitererstIdeen; ReviewmodusundBildqualitätausvorigemCheckpointoffen. Next: PR166exactCI,serielleIntegration,frischegemeinsameReceipts,Canonicalrequest. KeineProduction/Rulesfreigabe,CollectorPAUSED.


## 2026-10-07 — kurze Startseiten-Benefits umgesetzt, branch_only

GC-WEB-REPAIR-20261007. Martin konkretisiert ausschließlich die untere Leiste: Coco, Remy, Emmi, Wilma; keine Namen/Rollenlabels in der Beschriftung. Umgesetzt: Dein Ratgeber / Hilft dir weiter; Schnell erstellt / In wenigen Minuten; Frische Ideen / Neue Aufgabenvarianten; Direkt ausgewertet / Ergebnisse im Überblick. Bestehende größere Überschrift/kleinere Unterzeile und CSS unverändert. DE/EN-Kataloge synchronisiert,24bestehendeEntry/i18nChecksbestanden. Branch feature/audio-hero-benefits-20261007,Commit6e67cd8501bb445f72ab3a69d138e9cd7f71c972, lokal9f3c868. Noch nicht integriert oder kanonisch deployed. Nächster Schritt: scoped review/exactCI und Aufnahme ins bestehende Stagingpaket. Audio-fehlt-Blocker, adaptive Höranweisung, Punkte-/Vorschau-Mischlogik und bisherige offene Punkte bleiben offen.


## 2026-10-07 — Überarbeitungsmodus: Konzept und Umsetzungsprompt

Martin fordert ausführliches Konzept einschließlich Live-Vorschau, Tutorial-Wiederaufnahme und Einordnung der Speicherung. Dokument: docs/gradecrew-review-mode-concept-20261007.txt. Entwurf, keine Implementierung. Empfehlung: Hinweise auf Staging erfassen; Adminanweisungen im manuell gestarteten Stapel direkt bearbeiten, Lehrervorschläge nur nach Freigabe der konkreten Version. Lokale Live-Vorschau mit isolierten synthetischen Szenen/Prüfpunkten; bei nötigem Reload zur gleichen Stelle zurückkehren. Keine KI pro Kommentar/keine Chat-Abfrageautomation. Zweistufig: persistentes Feedback mit Serverrechten, danach Szenen-/Liveprüfworkflow; notwendige Kontextdaten von Anfang an vorsehen.

Speicherung am Code geprüft: lokale EditorentwürfeIndexedDB, Onlinequizzes/SettingsFirestore, privateAudioentwurfssync; GasttutorialnurArbeitsspeicher; sichereAntwortentwürfemittemporärer12hLokalsicherung. Keine vollständige dauerhafteDoppelkopieodergeprüfteDB/Medienbackupstrategie behaupten. LokalerWebtree864009add8905f6f7b96babcccfb5970f73cf95d identischmitRemote6e67cd8501bb445f72ab3a69d138e9cd7f71c972; Codebackup ist kein Deploy- oderDatenbackupnachweis. Next: Konzeptbewertung/konkreteImplementierungsplanung; aktueller Auftrag liefert Dokument, keine neue Funktion.


## GC-GAMES-ESCAPE-VISUAL-01 — Unreal-Fortsetzung, Auftrag vom07.10.2026

**Schriftliche Spezifikation bestätigt; zwei ausführbare Baupläne gesichert, Planprüfung/Ausführungswahl angefragt.** Martin bestätigt circa zehn Minuten und die überarbeitete Rätselidee. Acht Lernaufgaben, drei Umgebungs-/Inventarrätsel (Karte, Winde/Brücke, Strom/Funk),60–70% aktive Lernzeit. [Spezifikation](docs/superpowers/specs/2026-10-07-expedition-amazonas-unreal-design.md), [Unreal-Bauplan](docs/superpowers/plans/2026-10-07-expedition-amazonas-unreal.md), [GradeCrew-Brückenplan](docs/superpowers/plans/2026-10-07-expedition-gradecrew-bridge.md), [Übergabe](workstreams/escape-expedition-unreal-20261007.md). Empfehlung: selbst imChat umsetzen mit unabhängigerGesamtprüfung. VorhandeneAssessmentabgabe schließt gesamtenTest ab; separaterPractice-Lifecycle nutzt bestehendeBewertung. BlenderExecutable noch nicht lokalisiert, eigeneGeometrieskripte/UnrealBordmittel vorgesehen. KeinProduktcode/Build/Live-/Gerätenachweis/neuerDeploy. NächsterSchritt: Plan-/Ausführungsantwort aufnehmen, dann eigenerCheckout/Branch und Verhaltenstests. BestehendeTask-/Versuchshistorie, keineProviderkosten/Production.

## 2026-10-07 — Überarbeitungsmodus mit Ampel implementiert, CI läuft

GC-WEB-REPAIR-20261007; verantwortlicher Chat: laufender Web-Reparaturchat (Link unbekannt). PR167, Branch feature/review-mode-20261007, Head a82e035e42ae9be320f06032a7240dfc9e35bf98. Servergeprüfte Admin-/Lehrerrechte, revisionsgebundene Freigabe, persistente Hinweise/Offline-Outbox, Element-/Aufgabenbezug, manuelle Ampel mit Buildnachweisen und lokale explizit startbare automatisierte Checks implementiert. Ampelkatalog ist datierter Import 05./06.10., keine Übernahme alter grüner Statuswerte und keine Live-Synchronisierung. Lokale isolierte Vorschau bietet echte App-Szenen mit Reload zum gespeicherten repräsentativen Abschnitt; keine beliebige Wiederherstellung laufender Antworten. Keine KI pro Kommentar oder Hintergrundabfrage.

Belege: lokal179Functionstests,54UItests,48bestehendeAppregressionen und5Previewtests bestanden; Stagingbuild127Dateien. Unabhängiger Review: konkreteAufgabenreferenz, rekursiverQuellfingerprint/Testlaufänderung und blockierendeOutboxfehler behoben und regressiongetestet. Disk-Neuladen und idempotentesReplay synthetisch geprüft; kein Cloudbackup-Restore behauptet. PR167 mergeable, Integrationsbasis6390766d80488f1885bb69ac5ff90337305c73a8. Exact combinedCI37629871764 läuft; noch nicht integriert/deployed. Kein Production/Rulesdeploy. Browserabnahme blockiert: ChromeBridgeinitialisierung gescheitert, InAppBrowserPolicyprüfungnichtverfügbar; keineUmgehung. Reviewpanel derzeitDeutsch, volleDE/EN-Abnahmeoffen. Code/Bedienung in docs/review-mode/README.md imPR. Ältere Audio-fehlt-/Punkte-/Testsettings-Aufträge bleiben offen.

Nächster Schritt: CI37629871764 auswerten, bei Erfolg frischen Integrationsstand prüfen und seriell integrieren; anschließend bestehende Stagingpipelines mit exakten Receipts. LokalerServer127.0.0.1:8768; keine öffentlicheFreigabe. Versuchshistorie/Budgets/CollectorPAUSED erhalten.


## 2026-10-07 — Überarbeitungsmodus und Ampel auf kanonischem Staging

GC-WEB-REPAIR-20261007, PR167 integriert und auf https://hausaufgabe-staging.web.app/ veröffentlicht. App-Commit fa51e2781a8e00b219892fdceb2d25fb88203ff5; Kandidaten-CI37629871764, Merge-CI37630241490 und Mobiletutorial37630241356 bestanden. Hostingpreview37630432043 / Receipt11485409743; AI/Assessment-Functions37630432069 / Receipts11486900356 und11486302530; kanonischer Run37631350330 / Receipt11486023795 (sha256:d716ce086e5ec2b4d16a51ff03cdf36c2f01f55577b1258271bf0912e49b069c). reviewMode(europe-west1) erfolgreich erstellt und explizit verifiziert. Initialer AI-Deploy scheiterte beim Abruf der Funktionsliste; genau ein begrenzter Wiederholungsversuch desselben Quellstands bestand. Historie erhalten.

Bedienung: Admin anmelden → Seite überarbeiten → Stelle markieren → Hinweis speichern. Testkollegium separat freischalten; deren konkrete Hinweisfassung benötigt Adminfreigabe. Ampel enthält den datierten vorhandenen Prüfkatalog und pro Build gespeicherte Ergebnisse. Automatische Checks sind eine bewusst gestartete lokale Option, keine KI pro Kommentar. Lokale Vorschau http://127.0.0.1:8768 nutzt Beispieldaten und direkte App-/Tutorialszenen; Quelländerungen laden den ausgewählten Abschnitt neu. Entwürfe/Outbox in IndexedDB, bestätigte Onlinehinweise in Firestore; lokale Vorschau zusätzlich .review-local/notes.json. Kein vollständiges Datenbackup oder Cloud-Restore behauptet.

Status staging_deployed, NICHT user_tested. Visuelle Browser-/Geräteabnahme und echter Admin-/Lehrkraft-Durchlauf offen, weil Browser-Bridge bzw. Richtlinienprüfung den Zugriff blockierte; keine Umgehung. Panel zunächst deutsch, Ampelkatalog kein Live-Sync der Zentrale, Szenen stellen keine beliebigen Antworten/Tutorialzwischenstände wieder her. Ältere Audio-fehlt-, Bewertungs-/Mischlogik- und Testeinstellungswünsche bleiben separat offen. Rules/private Audio-Gates, Production und CollectorPAUSED unverändert. Nächster Schritt: Martin prüft als Admin einen gespeicherten Hinweis, einen Ampelnachweis und optional eine Lehrkraftfreigabe.


## 2026-10-07 — Review-Nachbesserung und weitere Editoraufträge

GC-WEB-REPAIR-20261007 fortgeführt. PR168 Head a09b88ac94bf991ad8be4c5bf5be219c9c67cf8e: freie Rechteckmarkierung, Sprünge zu Hinweisen/geeigneten Ampelansichten, Desktop-Herotext in eigener Zeile ohne Bildüberlagerung. Quellstand lokal und remote identisch; 180 Functionstests,56 UI-Tests und127-Dateien-Build bestanden, unabhängiger Review fand zwei wichtige Fälle (Rechteck außerhalb des sichtbaren Bereichs, Drag-Ende über Sidebar), beide reproduziert und korrigiert;20 fokussierte Tests grün. Exakte CI37638284400 läuft. Browserbridge weiter defekt; Martins zwei gemeldete Onlinehinweise noch NICHT gelesen. Noch kein neuer Deploy für PR168.

Neue ausdrücklich gewünschte Editorfunktionen: einzelne fehlerhafte Antwort-Audiospur über Emmi erneut erzeugen; echte Audiofehler erkennen, 0:00-Anzeige allein ist kein Leerdateinachweis. Aufgabentypwechsel mit KI-gerechter neuer Aufgabenstellung/Antworten/Lösung und Hinweis während der Erzeugung; ursprüngliche Fassung beim Zurückwechseln erhalten. Bild-, Varianten-, Alternativen- und Typänderungen müssen vollständigen aktuellen Aufgabenkontext erhalten, serverseitige Lösungen jedoch nicht im Schülerbild preisgeben. Nutzerbeispiel zeigt falsche Zuordnungslinien und unpassende Gegenstände im erzeugten Bild. Diese drei Editorpunkte sind erfasst, Untersuchung läuft; noch keine Behebung behauptet. Bestehende KI-Anbindung verwenden, keine neuen Credentials/Provider oder bezahlten Smokeaufrufe. Zuerst PR168 sichern, dann Editoränderungen separat integrieren.


## 2026-10-07 — PR168 integriert; Editorfolgeauftrag
PR168 nach exakter CI37638284400 und BugOps37638330043 sowie frischem Development-Audit37638500667 in aed60ecf61537d3c38e2b3a6dbd6413d9776056c integriert. Staging-Nachweise für diesen Stand noch ausstehend. Browserabnahme und Lesen der zwei Onlinehinweise weiter blockiert durch Browserbridge.
Editorfolgeauftrag erweitert: Schloss in Aufgabenübersicht schaltet Navigation/Verschieben; bisheriges Drei-Punkte-Menü samt Aktionsleiste entfernen; klarer Papierkorb neben rotem Smiley mit bestehender Löschbestätigung. Einzelspur-Audioreparatur, KI-Typwechsel mit Rückkehr zur ursprünglichen Fassung und vollständiger Kontext für alle KI-Änderungen bleiben im Auftrag. Bildursache belegt: generateQuestionMedia erhält question, nutzt sie aber bisher nur im Diagnose-Catch; Generator/Review bekommen nicht die Antwortpaare. Nächster Schritt: neue isolierte Editorfolgebranch vom geprüften Integrationshead, Verhaltenstests und Kontextdurchleitung implementieren. Bestehende Versuche/Budgets unverändert; kein Production/Rules-Deploy.


## 2026-10-07 — Editorzwischenstand und weitere Nutzerwünsche
Editorbranch feature/audio-editor-context-20261007 remote7727de2c577299aa6df7d05b86af69f156a9fe05 (lokal e14b00d, identischer Tree) gesichert. Vollständiger Bildkontext/Prüfung, Einzelspur-Audioreparatur mit Decodierung, KI-Typwechsel/Originalfassung, Schloss-Reihenfolge und Papierkorb implementiert, noch branch_only. Unabhängiger Review fand vier Regressionen (Variablenfehler Varianten, gesperrte Retrybuttons nach Abschluss, transienter Typwechselzustand im Undo, nicht unterstützte Tutorialkonvertierung); Korrekturen und Regressionstests laufen, keine Fertig-/Deploybehauptung.
Coco neu ausdrücklich gewünscht: Gesprächsbezug, erlaubte Navigation zu Remy/Testseiten, Testauswahl, kurz hervorgehobene Bedienelemente, bestehender KI-Fallback bei wiederholtem Nichtverstehen; inhaltsbezogenes Wiederfinden eines Tests, etwa Katzenbild. Testübersicht mit kompakter Liste/Sammlungen und wärmerer Hintergrund sind zunächst IDEEN, keine Implementierungsfreigabe daraus ableiten. Nutzer verlangt zusätzlich frühere farbige Markieraufgaben wiederfinden und häufiger passend generieren sowie schöne A4-Druckfassung mit Namenskopf/Schreibraum/Seitenumbrüchen und separaten Lösungen. Hör-/Farbaufgaben brauchen geeignete Druckdarstellung. Bestehende älteren Wünsche bleiben offen. Nächster Schritt: aktuellen Editorstand stabilisieren, dann Guide/Farbmarkierung/Druck sauber anschließen.
PR168 exakte Merge-CI37639151101 und Hostingpreview37639362021/Receipt11490984119 sowie Functions37639361958/AI11491656204/Assessment11491326494 für aed60ecf erfolgreich. Kanonische Veröffentlichung jetzt angefordert; Browserabnahme und zwei Onlinehinweise weiter nicht gelesen. CollectorPAUSED, privateAudio-Gates/Rules/Production unverändert.

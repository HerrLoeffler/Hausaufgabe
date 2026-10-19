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

**Grundrichtung bestätigt; schriftlicher Zehn-Minuten-Entwurf zur Prüfung gesichert.** Beratung vom 08.10.2026: gezielte Überarbeitung aus spielbarem Prüfbau, getrennten Lerninhalten und KI-Unterstützung empfohlen; Spiel-Reviewmodus nur Idee, kein Umsetzungsauftrag. [Beratung](workstreams/escape-expedition-unreal-20261007.md). Martin bestätigt Unreal-Mobile/Camp→Ufer→Station und fordert circa zehn Minuten sowie eine neue Rätselgestaltung (bisher circa3/10 laut Nutzer). Neuer Scope: acht Lernaufgaben, drei echte Umgebungs-/Inventarrätsel mit Karte, Winde/Brücke und Strom/Funk;60–70% aktive Lernzeit. Frühere20–30Minuten/zwölf Stationen/sechs Rätsel ersetzt. [Spezifikation](docs/superpowers/specs/2026-10-07-expedition-amazonas-unreal-design.md) und [Übergabe](workstreams/escape-expedition-unreal-20261007.md). Schriftliche Spec-Prüfung steht aus; anschließend Implementierungsplan samt Ausführungswahl. Task-ID/Branchhistorie erhalten, Visual-PR83@6434ddef frisch geprüft; Live-Audit37640906261 gelesen. UE5.8 lokal vorhanden; noch kein Unreal-Expeditionsprojekt, Build, Live-Anbindung, Gerätetest oder neues Deployment. Keine neuen Providerkosten/Production.

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


GC-WEB-REPAIR-20261007 · Nutzer verlangt alle umgesetzten Änderungen auf Staging: PR168/169/170 zusammen deployed d5e0f44f7735c7edd011a2fa058a8fda185624e0. Merge-CI37679341669 grün, Preview37679524303 Receipt11508997430, Functions37679524132 AI11508227774/Assessment11508073240, Canonical37679819532 Receipt11508903261. https://hausaufgabe-staging.web.app/ Dateihashes geprüft; Nutzertest ausstehend. Farbmarkierung, DIN-A4-Druck, mathematische Glyphdiagnose und übrige unerledigte Wünsche bleiben offen; keine pauschale Erledigt-Markierung. Dashboard/Hintergrund Ideen. Production unverändert. CI37642627776 Wrapper-Fehler korrigiert, Folgelauf37679070729 grün. Frühere fehlgeschlagene main-Ref-Updates nicht wiederholt; Contents API Checkpoints erfolgreich. Nächster Schritt: Nutzerabnahme neuer Stand und Originalformeltext zur Glyphdiagnose.


GC-WEB-REPAIR-20261007 · PR172 Staging-Batch deployed c475d0e7c6feb14f3d62ba179ccfb7cabbcfdec7. MergeCI37687543142, Preview37687715280 Receipt11510939538, Functions37687715188 AI11511379079/Assessment11511717783, Canonical37688108976 Receipt11511808010 erfolgreich; exact source/filehashes geprüft. Klassenraum-Panorama, reduzierte Copy, Coco3Seiten und kompaktes Bereichswerkzeug mit serverseitigem Backlog sind veröffentlicht. Bereich Visuelle Hinweise: area visual-feedback, nur tatsächliche Martin authorId bei Auftrag; keine technischen checks. Künftige Änderungen sammeln/gesichert inAufgabenbranch, erst nach ausdrücklichem Deployen integrieren/deployen. Kein automatischerKI-Aufruf proKommentar. Browserabnahme pending; lokale vorherige Standalone-Notizen bleiben imlocalhostBrowser und sind nicht bereits automatischonline. Tutorial-Positionierungsregression, mathematischeGlyphdiagnose, mehrfarbigesMarkieren undDIN-A4Druck bleibenoffen. Productionunverändert.


GC-WEB-REPAIR-20261007 · Visuelle Hinweise — OFFEN, NUR ERFASSEN: Rahmensymbol auch auf dem Startbildschirm anzeigen. Martin hat ausdrücklich klargestellt: Testmeldungen jetzt nur sammeln, nicht automatisch implementieren. Umsetzung erst nach explizitem Arbeitsauftrag; Deployment separat nach Deployen. Die irrtümlich gestartete lokale Umsetzung wurde vollständig zurückgenommen; kein neuer Deploy.


GC-WEB-REPAIR-20261007 · Aktiver expliziter Reparaturauftrag: etwa9 Rahmenhinweise nicht sichtbar. Tatsächliche Anzahl unbekannt, Browserpolicy blockiert. Lokaler Fix: Administration→Visuelle Hinweise getrennt online/pending/legacyLocalStorage, JSONSicherung, Retry nurvisual, OnlineSpeicherbestätigung, Accountwechselbereinigung;16Review/SceneTests pass. Code in fix/visual-backlog-recovery-20261007 lokal committed. KeinDeploy; Startseitenbutton bleibt nurgesammelterWunsch. Nächster Schritt Nutzer prüft im selben Browser localhost8771, ob vorhandene Hinweise erscheinen; nicht neu markieren/keinBrowserdatenlöschen.


GC-WEB-REPAIR-20261007 · Korrektur des Rahmen-Backlogs: Martin verlangt Staging→Feedback→Screenshot-Fehler, keine separate lokale Übersicht. dd72b7cRecovery-UI entfernt. Fix lokal2cbb647 (fix/visual-backlog-recovery-20261007): atomare Spiegelung neuerRahmenmeldungen infeedback category screenshot_error, idempotenterAdminAbgleich bestehender eigenerOnlineRahmenmeldungen, keineStatusrücksetzung, keineKI/BugOpsTrigger;25Tests pass. Nicht deployed, Batchregel Deployen bleibtgültig. Tatsächliche neun Hinweise unbekannt;BrowserpolicyverhindertZugriff. LocalStorage-onlyHinweise nicht automatischimCloudAbgleich. Arbeitsauftrag Screenshot-Fehler nurcategory+authorId/userIdMartin, keine technischenChecks. NächsterSchritt explizitesDeployen und exakteCI/Receipts; dann tatsächlicheAnzahl aufStaging prüfen.

### GC-WEB-REPAIR-20261007 – Idee zusätzliche Vorschauseite (2026-10-08)
Martin erwägt eine zusätzliche Vorschauseite zwischen lokal und Staging, auf der gesammelte Änderungen ohne einzelne Deploy-Rückfragen bereitstehen. **Idee, kein Umsetzungsauftrag.** Bestehende Sammeln/Abarbeiten/Deployen-Regel bleibt gültig; aktuelle PR174-Staging-Freigabe bleibt separat. Technische Deploy-Zeit wird dadurch nicht automatisch verkürzt.


GC-GAMES-ESCAPE-VISUAL-01 · Ego-Lerninsel Gestaltung: sechs Nutzerreferenzen geprüft, fünf Tafeln mit20 Motiven plus Einzelmotiv21; Spielbuch7929 Wörter, acht Gebiete, vier Hauptmechaniken und32Ideen. DraftPR173 https://github.com/HerrLoeffler/Hausaufgabe/pull/173, docs/lerninsel-layouts-20261007 Head a87abfe4d11b1223630aa2c6ecf2fca2326e2db7. Martins Korrektur verbindlich: 1-Liter-Eimer, Skala1/10..10/10, Ziel3/10=300ml; ursprünglicher8-Liter/Achtelentwurf verworfen. Bilder/Spielbuch sind Entwürfe, kein spielbarerBuild/CI-/Geräte-/Deploynachweis. Bestehende Amazonas-/Pizza-Stände unverändert. Übergabe workstreams/lerninsel-layouts-20261007.md; sieben Bildaufrufe erhalten. Nächster Schritt Gestaltungsprüfung, danach konkreterVier-Rätsel-Implementierungsplan. Productionunverändert.

### GC-WEB-REPAIR-20261007 – Screenshot-Fehler Staging deployed 2026-10-08
PR174 → `ea7def2f691021fd06f99085a5de51c6a6b935e4`. Explicit user Deployen honored. Existing frame notes mirrored to Admin Feedback category `screenshot_error`; sync own online visual notes on Administration open/refresh, deterministic IDs preserve done status. Independent review caught misplaced admin sync/syntax before publishing; fixed local0847243. Targeted25 tests and app syntax passed. CandidateCI37693545201, mergeCI37693716864 green. Preview37693855491 receipt11514577306; Functions37693855508 AI11515185528 + Assessment11514990841; canonical37694245235 receipt11515166129 all verified exact SHA. Production/Rules unchanged. Actual nine notes and browser acceptance **not confirmed**; localStorage-only notes are not imported by online sync. Next: Martin reloads https://hausaufgabe-staging.web.app/ → Administration → Feedback → Screenshot-Fehler. Additional intermediate preview site remains collected idea only. No further implementation/deploy without request.

### GC-WEB-REPAIR-20261007 – neue Screenshot-Fehler abarbeiten (2026-10-08)
Expliziter Nutzerauftrag: alle neuen eigenen Screenshot-Fehler aus Staging Admin Feedback einholen und überarbeiten; Änderungen sammeln, kein neuer Deploy autorisiert. Kategorie `screenshot_error`, Martins eigene authorId/userId, offene Meldungen; technische Prüfungen/andere Kategorien ausgeschlossen. **Auftrag gespeichert, Meldungen noch nicht eingelesen.** Browser-Anbindung zunächst Tab nicht gefunden/app-server initialization failed; erneutes Öffnen abgewiesen: admin-enforced policy could not be verified, browser security check unavailable. Kein indirekter Zugriff/Workaround; keine Fehlermeldungen erfunden und keine Produktänderung begonnen. Integration/canonical bestätigt `ea7def2f691021fd06f99085a5de51c6a6b935e4`, PR174-Deploybelege bleiben erhalten. Nächster Schritt: Browser-Verbindung wiederherstellen und eigene neue Screenshot-Fehler lesen, alternativ vom Nutzer exportierte/kopierte Feedbackmeldungen lesen; erst dann gezielte Umsetzung.


## 08.10.2026 — GC-GAMES-ESCAPE-VISUAL-01 Ego-Lerninsel erster Spielabschnitt

Martin autorisiert erneute Planprüfung und selbstständigen Baubeginn. Eigener UE5.8-Abschnitt Ankunft, begrenzte Verbprobe/Hauptpfad, 1-Liter-Eimerterrasse in Zehnteln gebaut. 3/10=300ml, 100ml pro Hub. DraftPR175, Branch feature/lerninsel-ego-v1, Remote1fc4203a289bd9fe18edb5062925bff82091dbc1, lokaler Reviewfix9a87e02. DevelopmentEditor kompiliert,59Regelchecks und1UE-Spieltest bestanden,0Fehler/0Warnungen. Unabhängiger Review:3wichtige Randfälle reproduziert/behoben (Eimer-Recovery, Torlücke währendAnimation, Fortschritt bei defektemTransform). Reale Spielbilder imBranch; ersteArtstufe, kein fertigesWitness-Niveau behauptet. Ein kleiner Befund offen: unterscheidbares Bodenfehlersymbol; permanente Pfadfehleranzeige vorhanden. Statusbranch_only, keineCI-/Merge-/Deploy-/iPadabnahme. DesignPR173/21Motive/7929-Wörter-Spielbuch undsiebenBildaufrufe erhalten. [Übergabe](workstreams/lerninsel-layouts-20261007.md), [Bau-/Prüfbericht](games/lerninsel-unreal/Production/REVIEW.md). Next: Nutzerdurchlauf, Gelände/Architektur weiter ausarbeiten, Satzweg/Felsfenster; BrowserStreaming/iPad separat. Production/Web-Release-Train unverändert.


## 08.10.2026 — GC-GAMES-ESCAPE-VISUAL-01: Vier-Rätsel-Prototyp gebaut

Methodische PR171-Unterlagen gelesen; eigener Ego-Inselbranch/PR175 weitergeführt. Verbpfad, Satz-V2, exakte Zehntel-Bruchleitung und Felsfenster aus bekannten Funden plus tatsächlicher Projektion sind implementiert. Dazu 1-Liter-Eimer/3/10=300ml und2Zusatzfragen. NativeUMG, versionierteLI2-Sicherung mitLI1-Migration, feste Gateblocker und gesonderte Blickhilfe.147Regelprüfungen und2UE-Tests erfolgreich,0Fehler/4bekannteEpicidevice-Umgebungswarnungen; letzterReport2026.10.08-11.10.06UTC. UnabhängigerReview:6angenommene Bedien-/Validierungsfälle reproduziert und korrigiert. Pointer-Fixture mitkanonischerCursor-ID undattachedWidgetCapturestabilisiert; keinmenschlicherDesktop-/iPad-Hittest.

Zwölf neue Tafeln/240Studien, zusammen261Konzeptmotive. Lokal280seitigerillustrierterBauatlas(28Text+12Übersichten+240Studien), keine280einzigartigenDrehbuchseiten oder261fertigenAssets. BearbeitbareTexte, Bilder undGeneratoraufGitHub;58MBPDF lokalreproduzierbar. Remotedd374a0f4ec9c01e56c754b480e8865db2b26e92, lokalda26552, gesamterRuntimeGitbaum6fa9add4bbed720f3441427552ad94363a0bcfda bytegleich. Statusbranch_only, DraftPR175; keineIntegration/Production. ActualPrototypgrafikeinfacheralsKonzepte. NächsterSchritt:NutzerdurchlaufundTerrain/Artbewertung;Browserstreaming,echtesiPad,Audio/volleachtGebietespäter. [Übergabe](workstreams/lerninsel-layouts-20261007.md), [Bedienung](games/lerninsel-unreal/README.md), [Review](games/lerninsel-unreal/Production/REVIEW-FOUR.md).


## 13.10.2026 — GC-FINANCE-BAYSTARTUP-20261008 / Investmentgespräch 19.10.

Bestehende FinanceTask fortgeführt: erster Fragen-/Folienplan für Erstgespräch Beratung und mögliche Finanzierung gesichert auf docs/baystartup-financing-20261008; zehn priorisierte Mussfragen, Fachzuständigkeiten, Pilot-/Kosten-/Marken-/Datenschutz-/CodeReview-/Steuerfragen und10Reservefolien. [Plan](docs/finance/investment-meeting-plan-20261019.md), [bestehende Übergabe](workstreams/baystartup-financing-20261008.md). Nur Dokumentation; keine PPTX, Einreichung/Kontaktaufnahme, App-/Release-/Productionänderung. Aktueller Kapitalbedarf, Steuerstatus, zahlende Pilotnachweise und Gesprächspartner/Dauer weiterhin offen. Nächster Schritt: Martin priorisiert/ergänzt Plan, PowerPoint separat beauftragen. Mainintegration dieses Unterauftrags noch nicht erfolgt.

GC-FINANCE-BAYSTARTUP-20261008 · VIDIS-Steering13.10.2026 im bestehenden [Investmentplan](docs/finance/investment-meeting-plan-20261019.md) ergänzt: kurzfristig Readiness für Bundeslandpartner, mittelfristig tatsächlicher Bundeslandpartner, langfristig VIDIS-Anbindung. Landesweg/Gaps/Kosten/Paid-Pilot als erste Mussfragen; nur Planungsziele, keine vorhandene Kooperation, Prüfung, OIDC-Anbindung oder Freigabe. Offizielle Teilnahmequelle geprüft; keine App-/STATE-/Releaseänderung. Nächster Schritt: Landesansprechpartner und Prioritäten/Readiness-Leistungspaket im Erstgespräch klären. Keine Registrierung/Kontaktaufnahme/PPTX gestartet.

GC-FINANCE-BAYSTARTUP-20261008 · Gesprächspartner bestätigt: Philipp Geim von BayStartUP. Bestehender Investmentplan jetzt mit fünf direkten Coachingfragen (Landesweg, PaidPilot, Reviewkontakte, Meilensteinbudget, Unterstützungsangebot/NextSteps); VIDIS-Ziele und zehn Mussfragen bleiben erhalten. Dauer/Ort offen; keine Investorrolle/garantierte Vermittlung, Steuer-/Rechtsentscheidungen weiter bei Fachberatung. Nur bestehende dreiDokupfade, keine Kontaktaufnahme/PPTX/App-/STATE-/Releaseänderung.

GC-FINANCE-BAYSTARTUP-20261008 · Ausdrücklich beauftragte PowerPoint lokal erstellt:20Folien(14Haupt+6Anhang), kurze Martin-/GradeCrewvorstellung, Website-/Crew-Schwerpunkt, GradeCrewTeacher undSecure(Prototyp), Verzeichnis, VIDIS-Zielstufen/Pilot/Review/Finanzierung. Vollständiger [Plan](docs/finance/investment-meeting-plan-20261019.md) aktualisiert; nativeeditables/Paket-/Geometrie-/Font-/Reimportprüfunggrün,20finalPNGvisuell geprüft. PPTXundSummarybleibenlokal,optionalerPDFExporterfehlendesBundledfontmodul→keinPDF. [Übergabe](workstreams/baystartup-financing-20261008.md). PersönlicheDetails/Geräteprobenochergänzbar,keineInvestitionssumme/Rechtsfreigabe/Partnerzusage. NurDoku,keineApp-/Main-/STATE-/Release-/Kontaktaktion. NächsterSchritt: MartinreviewtundprobtkurzeVorstellung.

GC-FINANCE-BAYSTARTUP-20261008 · Nutzerpräzisierung/Design v3 umgesetzt:Web-AppimBrowserHauptprodukt,TeacherbildetWebproduktalsLehrkräfteApp/digitaleLeistungsnachweiseab,SecurevorgeseheneSchüler-Testdurchführung(Prototyp). PowerPoint20Folien mitgrößererCrew/OriginalLogo,farbigenThemenflächen,vergrößertenProduktbeispielen undrollenpassendenFiguren; Fragenübersichtlich. Paket/Geometrie/Fonts/ReimportPASS,20FinalPNGAuthor+RootgezielteQA ohneLayoutbefund. [Plan](docs/finance/investment-meeting-plan-20261019.md) und[Übergabe](workstreams/baystartup-financing-20261008.md) aktualisiert; PPTX/MDlokal. KeineProdukt-/Appcode-/Main-/STATE-/Deployänderung. NextMartinreview/proben.

GC-FINANCE-BAYSTARTUP-20261008 · V4vollständigeNeufassung nachNutzerkritiklokalfertig:14Folien inklGradeCrewGames,hellesCoverLogo-only,5Kapitel,Web-App-Schwerpunkt,GradeCrewApp/SecurePrototyp/Alltag/4Ziele/7einfacheFragen/Wünsche. PersönlicheKurzbiografielokal,keineAnimation. Paket/Geometrie/Fonts/ReimportPASS,14FinalPNGAuthor+RootQA,konkreteCrew-/Zielkartenbefundebehoben. NeuePPTX/PlanV4lokal,alteVersionenerhalten;[RepoPlan](docs/finance/investment-meeting-plan-20261019.md) und[Übergabe](workstreams/baystartup-financing-20261008.md)aktualisiert. Exakt3Docs,keineApp/Gamescode/MainSTATE/Deploy/Kontaktaktion. NextMartinV4review/Präsentationsgeräteprobe,dannAnimationensondernbeauftragen.


GC-FINANCE-BAYSTARTUP-20261008 · V5-Präsentation lokal finalisiert am 14.10.2026: `outputs/gradecrew-investment-20261019/files/GradeCrew_Erstgespraech_20261019_v5_final.pptx`, 14 Folien/14 Notizen, SHA-256 `a6703edfb774bc3247619ffbba142b347f7f797f2c6d6913ea5e3673f0b2776a`. Korrigierte Folien 2/5/6/7 erneut gerendert und visuell geprüft. Automatische native Fade-Timings für vier Crew-Bilder im Paket. PowerPoint öffnete die bytegleiche V5-Testdatei, erkannte Animation auf Folie 1 und zeigte nach kurzer Wiederholung alle Bilder; die gestaffelte Sequenz konnte wegen Screenshot-Latenz nicht beobachtet werden. [Plan](docs/finance/investment-meeting-plan-20261019.md) und [Übergabe](workstreams/baystartup-financing-20261008.md) aktualisiert. Main/STATE/App/Release/Deploy unverändert. Nächster Schritt: Wiedergabe am Präsentationsgerät prüfen.

GC-FINANCE-BAYSTARTUP-20261008 · V6-Crewfilm – vorbereitet, Produktion offen (14.10.2026)

Fortsetzung des bestehenden V5-Auftrags: Wunsch nach vollständigem 42-Sekunden-Film mit Coco zuerst allein, danach Remy, Emmi und Wilma einzeln; Drehbuch, konkrete Zeitfenster, Reaktionen, Figuren-/Prop-Tracks und lokale deutsche Sprachproben sind für den nächsten Schritt vorbereitet. Vier Roh-Posebögen sind vorhanden, aber undurchsichtig und mit unstetigen Gehposen; Apples Vision-Freistellung scheiterte am nicht ladbaren Systemmodell. Keine sauberen Matten, kein Bewegungstest, kein MP4 und kein V6-PPTX. Keine bezahlten/unverbundenen Dienste, App-/Main-/STATE-/Release-/Deploy-/Kontaktaktionen. Runway aktuell nicht verbunden; Weave mangels Figma-Verbindung nicht nutzbar. V5 bleibt unverändert und lokal final: 14 Folien/14 Notizen, SHA-256 `a6703edfb774bc3247619ffbba142b347f7f797f2c6d6913ea5e3673f0b2776a`. Übergabe mit Produktionslücke und nächstem Schritt in `workstreams/baystartup-financing-20261008.md`; Plan und Szene liegen lokal unter `outputs/gradecrew-investment-20261019/animation-v6/`.

**Offen / nächster Schritt:** passende Video-/Animationsverbindung herstellen; erst 10,2-Sekunden-Coco-Test mit echter Figurenkontinuität, natürlicher Bewegung, sauberer Matte und Hörprüfung beurteilen. Bei Erfolg restliche Szenen produzieren und in einer V5-Kopie ausschließlich Folie 1 als Film ersetzen. Kein exaktes Lip-Sync versprechen, bevor es belegt ist.

GC-FINANCE-BAYSTARTUP-20261008 · V6-Korrektur Runway/Voice (14.10.2026)

Runway ist nun in Martins persönlichem Workspace authentifiziert, aber der Free-Tarif enthält keine Videomodelle; kein Kauf/Upgrade autorisiert. Die lokal generierten macOS-Systemstimmen lehnte der Nutzer ausdrücklich als schrecklich ab; gewünscht sind wärmere, weniger computergenerierte Stimmen. Sie werden nicht verwendet. Eine einzige Coco-Probe via Runway/ElevenLabs wurde erstellt (Task `fb209300-de70-44c6-beb7-2d146a5aeaa3`, eleven_v3 Lisa de, Speed 0,92; 3,92 s Provider / ca. 3,971 s lokale MP3, 63.990 Bytes; 2 Credits). Hörbewertung/Freigabe offen. Keine weiteren Stimmen, kein Video und keine V6-PPTX; V5 unverändert. Übergabe aktualisiert; kein Upgrade/keine weiteren Medienaufrufe autorisiert.

GC-FINANCE-BAYSTARTUP-20261008 · V6 ElevenLabs-Verfügbarkeit präzisiert (14.10.2026)

Die frühere Suche nach einem separaten ElevenLabs-Plugin war zu diesem Zeitpunkt ohne Treffer; inzwischen ist das direkte ElevenLabs-Plugin verfügbar. Eine reine Stimmenabfrage `creative_list_voices` mit German/female/conversational ergab 19 Bibliotheksstimmen, darunter Irene (friendly approachable), Ela (Empathetic Warm) und Lea (Natural Conversation). Das sind verfügbare Optionen, keine neue Audioerzeugung und keine Hörfreigabe. Die über Runway erzeugte Lisa-Coco-Probe bleibt die einzige Erzeugung (2 Credits); keine weiteren API-/Medienaufrufe erfolgten. Der Free-Video-Block betrifft Runway. Eine direkte ElevenLabs-Videofunktion wurde nicht geprüft und wird nicht als blockiert oder verfügbar behauptet.

GC-FINANCE-BAYSTARTUP-20261008 · Stimmenplan und Testsätze gesichert (14.10.2026)

Der freigegebene Dialogschluss lautet „Noch Fragen? Ich bin hier. Aber erst mal ist Martin dran!“ Vier kurze ElevenLabs-eleven_v4-Stimmproben (Coco/Irene, Remy/Lennart, Emmi/Lyra, Wilma/Victoria) wurden als einzelne Testzeilen erzeugt; alle Flows abgeschlossen, keine Fehler. Kostenschätzung zusammen 299 Credits / 2,99 US-Cent, keine bestätigte Rechnung. Hörbewertung offen, keine Gesamt-Audio-/Videoanimation und keine PPT-Änderung. Runway-Lisa-Probe bleibt historische Einzelprobe. Nächster Schritt: Stimmen hören/bewerten und Startseiten-Umfang mit wenigen Posen planen; keine weitere Generation bis dahin.

GC-FINANCE-BAYSTARTUP-20261008 · Jüngere Crew-Stimmen freigegeben (14.10.2026)

Nutzerfeedback: „die stimmen sind super! Gerne das so als dialog jetzt vorbereiten“. Vier jüngere ElevenLabs-eleven_v4-Stimmen wurden freigegeben: Coco/Milly Maple (4,56 s), Remy/Dylan Carter (6,00 s), Emmi/Lumi (6,16 s), Wilma/Skittle Bee (4,64 s); je 1 Variation, alle erfolgreich, Kostenschätzung 299 Credits / 2,99 US-Cent (keine bestätigte Rechnung). Frühere Irene/Lennart verworfen; Lyra/Victoria werden ebenfalls ersetzt. ElevenLabs nur für Präsentationsmedien, nie GradeCrew-Tests/Hörtexte. Zehn Dialogzeilen, gemischtes Audio und Timingmanifest sind noch in laufender Facharbeit; noch kein Ergebnis vorwegnehmen. V5 unverändert, keine vollständige Animation/PPT-Änderung. Nächster Schritt: laufende Audio-/Manifestübergabe validieren.

GC-FINANCE-BAYSTARTUP-20261008 · Dialogteilprobe 8/10, ElevenLabs-Zugang blockiert (14.10.2026)

Flow `W0TsplxmFLPNiprgpqod`: 8/10 Zeilen erfolgreich, fehlgeschlagen sind nur Zeile 4 (Emmi, lang) und 7 (Wilma, Prüfzeile), Provider-Meldung „Unusual activity ... Free Tier access has been disabled ...“. Keine Retries, kein Upgrade/Kauf, fehlende Zeilen nicht ersetzt. Lokale Dateien: `outputs/gradecrew-investment-20261019/animation-v6/audio-elevenlabs/full-dialogue-v1/Dialog_Teilprobe_8von10.wav` (33,13 s, mono PCM16/44,1 kHz), `dialogue-transcript.md`, `voiceprofile-and-generation-manifest.json`, acht Einzel-MP3/WAV. Rohschätzung 640 Credits/6,40 US-Cent enthält fehlgeschlagene Zeilen und ist keine bestätigte Rechnung. Kein vollständiger Dialog, kein Hörtest, kein Video/PPTX; V5 unverändert. Nächster Schritt: Zugang klären und bei Verfügbarkeit nur Zeilen 4/7 abschließen, dann gesamten Dialog mischen/prüfen; keine aktuellen Retries oder Upgrades.

GC-FINANCE-BAYSTARTUP-20261008 · Dialoglautheit angleichen (offen, 14.10.2026)

Nutzer meldet extrem unterschiedliche Lautstärken der acht erfolgreichen Clips und verlangt ein einheitliches wahrgenommenes Sprachlautheitsniveau. Auftrag: nur lokal die vorhandenen acht Clips angleichen und Teilmix mit gleicher Reihenfolge/Pausen neu erstellen. Fehlzeilen 4 und 7 bleiben offen; keine neuen ElevenLabs-Aufrufe, Retries, Upgrades, Video- oder PPT/Produktänderung. Bearbeitung läuft/noch nicht bestätigt. Nächster Schritt: lokalen Audio-Fachagenten abschließen lassen; dann Messwerte und neue Teilmix-Datei sichern.

GC-FINANCE-BAYSTARTUP-20261008 · Lautheitsangleichung 8/10 abgeschlossen (14.10.2026)

Acht vorhandene Sprachclips wurden lokal mit 20-ms Active-RMS-Gate, statischem Gain je Clip, Ziel −24 dBFS und Peak-Limit −3 dBFS angeglichen. Vorher −18,7…−38,4 dBFS / 19,6 dB Streuung; nachher alle −24 dBFS innerhalb Messauflösung. Mischpeak −3,389 dBFS, kein Clipping. Reihenfolge/Pausen/Dauer unverändert: 33,133265 s, mono PCM16/44,1 kHz. Datei: `outputs/gradecrew-investment-20261019/animation-v6/audio-elevenlabs/full-dialogue-v1/Dialog_Teilprobe_8von10_Lautstaerke_angeglichen.wav`; Originale behalten, Einzeldateien unter `normalized/`, Manifest um Werte/Gains/Timing ergänzt. Zeilen 4 und 7 fehlen weiterhin; keine neuen ElevenLabs-Aufrufe. Keine menschliche Hörabnahme, kein vollständiger Dialog, kein Video/PPTX; V5 unverändert. Nächster Schritt: normalisierte Teilprobe anhören; Provider-Zugang für die zwei fehlenden Zeilen klären.

GC-FINANCE-BAYSTARTUP-20261008 · PPTX-Medienverdrahtung als Test gesichert (14.10.2026)

V5final bleibt unverändert (SHA-256 `a6703edfb774bc3247619ffbba142b347f7f797f2c6d6913ea5e3673f0b2776a`). Separate Testkopie `outputs/gradecrew-investment-20261019/animation-v6/ppt-wiring/v6-video-wiring-test.pptx` (SHA-256 `6f30c48b59c9ebc0b4d31c97564713b84b6260a78bc6a7466c32c85971fb4012`) enthält vorläufig den Coco-Proof; 14 Folien/14 Notizseiten, ZIP und 83 XML-/Relationships-Teile geprüft, nur drei Ursprungsbestandteile der ersten Folie geändert. OOXML hat einen vollflächigen Videomedia-Shape mit `delay=0`/Endbildhalten; native PowerPoint-Wiedergabe ist damit noch nicht verifiziert. Pose-Sheets sind tatsächlich transparent (frühere Opazitätsdiagnose korrigiert); einziger generierter Mundpatch war größen-/formfalsch und verworfen. Coco-Proof ist nur Test, kein Crewfilm; Mundbewegung ist eine Näherung. Acht normalisierte Dialogzeilen vorhanden, Zeilen 4/7 weiterhin fehlend. Nächster Schritt: sibling-Filmdatei aus `animation-v6/film-v6-teilprobe/` prüfen, in neue V6-Kopie einsetzen und PowerPoint-Autostart/Endbild prüfen; V5 und andere Folien bleiben unberührt. Keine neuen Mediengenerationen/Upgrades oder Produktänderungen.


GC-FINANCE-BAYSTARTUP-20261008 · V6-Crewfilm-Teilprobe eingebettet (14.10.2026)

Neue lokale Datei `outputs/gradecrew-investment-20261019/files/GradeCrew_Erstgespraech_20261019_v6_animiert_teilprobe.pptx` (13.748.127 Bytes; SHA-256 `9134848d4f0f80719318e96dcd6a2b51ad0071d5099b5246c63872634096893b`). Standalone- und eingebetteter Film `outputs/gradecrew-investment-20261019/animation-v6/film-v6-teilprobe/GradeCrew-Teilprobe.mp4` (8.017.531 Bytes; SHA-256 `f3d9a493f17aa34066aa225ded7b3dfd452164b00abf5c7adee887c1b2f5e0c0`), ca. 38,93 s, 1920×1080 H.264/AAC. Teilprobe: 8/10 Zeilen; 4/7 fehlen weiterhin. Mund cue basiert grob auf Audioaktivität, nicht exaktes Phonem-Lip-Sync.

ZIP/XML valide, 14 Folien/14 Notizen. Nur Folie 1 XML/Relationships und Content Types gegenüber V5 geändert, übrige ursprüngliche Paketbestandteile bytegleich. Autostart/Endbild in nativer PowerPoint-Wiedergabe wegen CUA-Timeout nicht verifiziert. V5 unverändert: SHA-256 `a6703edfb774bc3247619ffbba142b347f7f797f2c6d6913ea5e3673f0b2776a`. Nächster Schritt: V6 lokal in PowerPoint abspielen; 4/7 erst bei verfügbarem Providerzugang ergänzen. Keine neuen Medienaufrufe/Upgrades und keine App-/Main-/STATE-/Deployänderung.


GC-FINANCE-BAYSTARTUP-20261008 · V6-Animation abgelehnt; Coco-Qualitätsgate (15.10.2026)

Nutzerfeedback: erster Crewfilm „absolute Katastrophe“. V6-Teilprobe `outputs/gradecrew-investment-20261019/files/GradeCrew_Erstgespraech_20261019_v6_animiert_teilprobe.pptx` (SHA-256 `9134848d4f0f80719318e96dcd6a2b51ad0071d5099b5246c63872634096893b`) ist nur ein erhaltener Versuch, keine akzeptierte Endfassung; V5 und V6-Artefakte nicht überschreiben/löschen. Native PowerPoint-Wiedergabe war nicht geprüft.

Beanstandungen: wenige Posen erzeugen wackelige Bewegung trotz 30 fps; falsche Mundlochform; untere Schnabelartikulation fehlt; Körper-/Beinbewegungen brauchen mehr unterscheidbare glatte Zwischenposen. Schlussbild zeigt außerdem flach/angeschnitten wirkende Köpfe bei Remy, Emmi und Wilma und fremde Fußfragmente unter der Grundlinie. Diese weiteren Figurenbefunde sind notiert und werden jetzt nicht pauschal überarbeitet.

Nächster Schritt ausschließlich isolierter 10–12s-Coco-Proof mit verbessertem Mund/Schnabel, unterscheidbaren flüssigen Körper-/Beinposen und sauberer Silhouette; Martin prüft ihn, bevor weitere Animation oder neue PPT-Folie beginnt. Keine neuen Stimmen, ElevenLabs-Produktintegration, bezahlte Videogeneration, kompletter Film oder V7-Deck in diesem Schritt; keine Produkt-/Main-/STATE-/Deployänderung.


GC-FINANCE-BAYSTARTUP-20261008 · V7-Coco-Rig-Checkpoint (15.10.2026)

Lokaler Proof mit fünf Kiefer- und acht Geh-Keyframes ist visuell gescheitert: weiße Lücke/abgesetzter Unterkiefer, Körper angeschnitten, Füße wirken getrennt. Noch kein V7-MP4. Proof unter `outputs/gradecrew-investment-20261019/animation-v7-coco-proof/review/`, Rig unter `.../animation-v7-coco-proof/rig/`. Ein Imagegen-Clean-Plate-Versuch zeichnete/vergrößerte Coco global und ist nicht registrierbar; verworfen, bleibt erhalten, keine Wiederholung. Geometry-Reviewer prüft isolierte maskierte Transformationen; Voice-Actor besitzt Renderer/Timeline/Video. Nächster Qualitätsgate bleibt kurzer Coco-Proof vor Vollfilm. Nutzerablehnung von V6 gilt; V5/V6 unverändert. Keine neuen Stimmen, ElevenLabs-Integration, bezahlte Videogeneration, PowerPoint-/Produktänderung und keine Fertig-/Akzeptanzbehauptung.


GC-FINANCE-BAYSTARTUP-20261008 · V7-Coco-Eintritt/Sprechen v2 (15.10.2026)

Korrigierte lokale 10-s-Probe: `outputs/gradecrew-investment-20261019/animation-v7-coco-proof/combined-proof-v2/Coco_V7_Eintritt_und_Sprechen_v2.mp4` (1280×720, 30 fps, H.264/AAC; SHA-256 `02a7ddc2638e859c7af7f3b42c89a32d37690eb1103e786c5e3c64e331834a55`). Root sichtete Eintrittsframes: 0 s offstage, 0,8 s links, 1,6 s mittig. Echter Eintritt korrigiert v1; technischer Kandidat für menschliches Feedback, keine Nutzerfreigabe, kein vollständiger Gehzyklus. Dokumentierter 1,7-s-Kameraschnitt, moderater Watschelgang, hinterer Fuß teilweise verdeckt. v1 und 5,233-s-Kieferstudie bleiben erhalten.

Kein vollständiger Film/keine V7-PPTX; V6 bleibt abgelehnt und alle Decks unverändert. Nächster Schritt: Martins Sicht-/Hörprüfung der Coco-Proofs, erst danach Entscheidung über Fortsetzung. Keine neuen Voice-/ElevenLabs-/bezahlten Videoaufrufe und keine Produkt-/Main-/STATE-/Deployänderung.


GC-FINANCE-BAYSTARTUP-20261008 · V8 Coco Planentwurf, 15.10.2026

- [ ] Martins Sichtprüfung des 20-Bilder-Artplaybooks und der Coco-Regie/450-Frame-Planwerte; Konzeptbilder sind keine gerenderten Frames und zeigen den Links-Rechts-Fußwechsel nicht zuverlässig. Nutzerfreigabe betrifft nur V7-Unterkieferbewegung, nicht Körpergang/Konzeptbilder.
- [ ] Vor weiterem Film: separate Entscheidung und Arbeit am stilgetreuen Coco-Modell/Rig, danach kurzer Eintritts-/Gangtest mit Weltkontakt der Füße und sauberer Form. Noch kein Coco-Rig vorhanden; Blender-Weg ist nur empfohlen.
- V8-Planmaterial liegt lokal unter `outputs/gradecrew-investment-20261019/animation-v8-coco-plan/`. V6 bleibt abgelehnt/unverändert; kein V8-Film oder PPTX, keine weiteren Voice-/Paid-Videoaufrufe.


GC-FINANCE-BAYSTARTUP-20261008 · V9 Coco-only Produktionsstart vorbereitet, 15.10.2026

- [ ] Coco-Probe prüfen: sichtbarer wechselnder Links-Rechts-Fußkontakt ohne Rutschen; Kopf/Flossen können gezielt reagieren; Telefon wird mit Kontakt gegriffen/abgelegt; freigegebene V7-Unterkieferform bleibt erhalten.
- [ ] Nur Remys Rüssel von rechts darf das Telefon ins Bild schieben und sich zurückziehen.
- Ausführung separat durch Coco-Motion-/Artagenten; geplanter Ausgabeordner `outputs/gradecrew-investment-20261019/animation-v9-coco-video/`. Vor Rendercheckpoint noch kein V9-Video verifiziert.
- V6 bleibt abgelehnt, V7-Mund freigegeben aber Körpergang nicht; V8 ist Konzeptmaterial. Keine neuen Stimmen/Voice-Calls, keine bezahlte Videogenerierung/Käufe, kein PPTX/Produkt/Main/STATE/Deploy/Kontakt. Task bleibt auf bestehendem Doku-Branch, ohne Main-Integration.


GC-FINANCE-BAYSTARTUP-20261008 · V9 aktive Coco-Timeline aktualisiert, 15.10.2026

- [ ] Root prüft Kontakt-Proof, bevor vollständiger Coco-Render beginnt.
- V9 aktive 20 s: 0–1 Coco späht; 1–3 Remys Rüssel schiebt Telefon von rechts ins Bild; 3–3,6 Rückzug/Blickfolge; 3,6–7,6 ca. acht alternierende Schritte; 7,6–8,6 Welle; 8,6–9,6 setzen; 9,6–10,6 greifen; 10,6–11,6 zuhören; 11,6–12,6 zurücklegen; 12,6–16,805714 vorhandene Coco-Zeile; 17–18 Blick nach rechts; bis 20 halten/blinzeln.
- Artikulierter 2.5D-Ansatz mit getrennt steuerbaren Füßen, keine Behauptung eines fertigen 3D-Rigs. V7-Unterkiefer ist freigegeben und bleibt erhalten. V8-15-s-Plan ist nur Referenz und bleibt unverändert.


GC-FINANCE-BAYSTARTUP-20261008 · V9 Coco-Videokandidat liegt lokal, Abnahme offen (15.10.2026)

- [ ] Martin prüft den 20-s-Film und entscheidet, ob die 2.5D-Fuß-/Kopf-/Telefonbewegung als Coco-Kandidat weiterverwendet werden kann.
- Kandidat: `outputs/gradecrew-investment-20261019/animation-v9-coco-video/Coco_V9_Auftritt_Telefon_und_Stimme.mp4`, 1280×720, 30 fps, H.264/AAC, SHA-256 `f5c7c286cb84f0da409b2b8a5af189ed056900a3b3f9eff0ee26b5150d38aec9`; 12 dekodierte Frames stichprobengeprüft. 2.5D-Puppet, keine 3D-/Physikgarantie; Mund ist Audioenergie-Näherung, kein Phonem-Sync. Nutzerabnahme und vollständiger Echtzeitdurchlauf noch offen.
- Vorhandene normalisierte Coco-Zeile unverändert; keine neue Stimme, kein Paid-Video, keine PPT-/Produkt-/Main-/STATE-/Deployänderung. V6 abgelehnt, V7-Mund freigegeben, Körpergang bisher nicht freigegeben.


GC-FINANCE-BAYSTARTUP-20261008 · V9 Encoder-/Audio-Prüfung ergänzt, 15.10.2026

Finalmanifest `animation-v9-coco-video/Coco_V9_manifest.json` SHA-256 `786227e019dabbc65139f69133b87d326b6119f595c3c688ee148c00684f9db4`; 600 eindeutige Quellbilder/600 kodierte Samples, 20 s H.264/AAC. AAC alignment delta 0 Samples, Korrelation 0.9993866, RMS-Verhältnis 0.9983283; Byteidentität gilt nur für Quell-PCM im gepolsterten WAV. Root prüfte 12 dekodierte Bilder, kein vollständiger Durchlauf; Nutzerabnahme offen. Versuchshistorie präzisiert: zwei Sandbox-Encodefehler (-11834), zwei erfolgreiche lokale Exporte, Vor-Peek-Export erhalten.


GC-FINANCE-BAYSTARTUP-20261008 · V9 visuell abgelehnt; V10 Bild-Gate offen (15.10.2026)

- V9 MP4 bleibt als technisch geprüfter, aber vom Nutzer visuell abgelehnter Versuch erhalten; Root-Ursache: Stilabweichung zum V8-Konzept durch ältere V7-Referenz/2.5D-Torso und falsche Rüsselrichtung.
- [ ] Zuerst zwölf Szenen-/Einzelbilder im verbindlichen V8-Referenzstil erstellen und Root-Bildprüfung abwarten.
- [ ] Nur bei bestandenem Bild-Gate kurze Bildbewegungsprobe. Kein Vollclip davor.
- Rüssel muss von links nach rechts das Telefon schieben und nach links zurück. Keine neue Stimme, kein Paid-Video, Kauf/Upgrade, PPTX/Produkt/Main/STATE/Deploy.


GC-FINANCE-BAYSTARTUP-20261008 · V10 Referenzbilder geprüft, Flow-Proof abgelehnt (15.10.2026)

- V8-stilgerechte Bildtafel mit 12 Konzeptposen und 4 generierten Detailbildern erstellt; beide von Root visuell geprüft. Lokal: `outputs/gradecrew-investment-20261019/animation-v10-reference-match/art/coco-phone-push-12frames-v2.png` (1932×814, SHA-256 `cf0b0d1c646e7e4768fb88bebac2e22f91a577c5124c76ad139eb2d677354c23`) und `.../coco-phone-push-4details.png` (1672×941, SHA-256 `fe58e2d3b986b909b7e9f5314ab0e10b8d8a7b96392155aa433ca97495f54c52`). Konzept-/Detailbilder, keine gerenderten Filmframes.
- Der einzelne kurze Bewegungs-Proof scheiterte an verformter Wählscheibe („melty dial“); kein V10-Film, kein Vollrender. Nächster Schritt: nur einen begrenzten korrigierten Flow-Proof prüfen; ohne Bild-/Formpass keinen Vollfilm.
- Bindend: Coco bleibt in der vom Nutzer beigefügten V8-Bildsprache; Rüssel schiebt das Telefon von links nach rechts und zieht sich nach links zurück. V9 ist visuell abgelehnt und wird nicht als Bildquelle verwendet. V7-Mundfreigabe ist keine Freigabe für V7-Figur/Identität.
- Nutzerbewegungsabnahme offen. Keine neue Stimme, bezahlte Video-/Audioaufrufe, Käufe/Upgrades, PPTX-/Produkt-/Main-/STATE-/Deployänderungen. Bestehende V6/V7/V8/V9-Historie und Dateien erhalten.


GC-FINANCE-BAYSTARTUP-20261008 · V11 Remy-Original geprüft; Flow offen (15.10.2026)

- Korrektur: V10-Rüssel-Farb-/Formannahme falsch; frühere Rüssel-/Gesamtszenenfreigabe zurückgezogen. Root-Briefing hatte eine rosa Unterseite erfunden und die tatsächliche Originalreferenz nicht vorher geprüft.
- Dauerhafte Gate-Regel: jedes Anhängsel zuerst mit dem Original derselben Figur vergleichen; keine Farbe von anderen Figuren/Ohren ableiten. Remy-Original `animation-v6/art/references/image3.png` SHA-256 `3af4ee9699c2e7c17408e51fdc9ef6b31a91c194ccbb98319a7d4ae5204c9777`: blass periwinklefarbener, gerundeter/zulaufender Rüssel, Querfalten, rundes Nasenloch, kein rosa Streifen.
- Root hat V11-Detailbild `animation-v11-remy-reference-fix/art/remy-trunk-4details-v1.png` (1672×941, SHA-256 `6927754d436c06827a2297cdde455701e0f5a237e56acb51e6013b2d14ef1bc9`) und 12er-Tafel `.../remy-trunk-12frames-v1.png` (1932×814, SHA-256 `6010570392536d7cff50091e09ed8578d3bdb77a2d92a85b85770fc53dada15a`) im Stilabgleich zum Original bestanden. Vergleich `.../remy-trunk-comparison.png`, SHA-256 `27ac77bbce46d53ec9e587fe8668bd7dd733d7cd47eb39921cf189b6c7657845`.
- Nur Erscheinungsform bestanden: eine Zelle zeigt Telefon außerhalb der Szene/nur Rüsselspitze. Zeitliche Kontinuität und Bewegung offen; kein V11-Film, kein Audio/Voice, keine PPTX-/Produkt-/Deployänderung. Nächster Schritt nur begrenzter Telefon-/Rüssel-Flow-Proof, danach Nutzerprüfung.


---

GC-FINANCE-BAYSTARTUP-20261008 · V12 Coco-Produktionsplan, 16.10.2026

Nutzerauftrag: ultradetaillierter schriftlicher Produktionsplan; heute keine Bilder, Modelle, Audios, Videos oder Präsentationsdatei erzeugen/ändern. Das neue Coco-Modell und alle Rigs fehlen. Blender 5.2.2 LTS/bpy ist verbunden, die geprüfte Szene enthält nur Standardobjekte; Generatoren und Assetbibliotheken sind nicht verfügbar.

Verbindlicher Coco-Bildkanon ist das zuletzt bestätigte V8-Storyboard `Coco_Storyboard_20Bilder.png` (SHA-256 `712701d2e34fdd03e73823263424d155379b0fc558e41e81750ee8778acfcba8`). V11 besteht nur den statischen Rüssel-Erscheinungsvergleich mit Remys Original; keine Bewegungsfreigabe. Nutzerakzeptiert ist V7 ausschließlich als Unterkiefermechanik, nicht als V7-Gesicht. Für den Audioabschnitt gilt nur die bereits normalisierte Coco-Datei; keine neue Audioerzeugung.

Der Plan sieht 20 gemeinsame Rig-/Stil-Gatestills und 600 geplante Film-Frame-IDs vor. Sechs begrenzte Bewegungstests decken Gang [60,120), Rüssel [201,231), Sitzen [231,261), Griff [261,291), Rückgabe [318,354) und Sprechen [390,420) ab: zusammen 216 Frames. Diese können nur bei identischen finalen Renderbedingungen wiederverwendet werden; dann bleiben 384 Filmframes zusätzlich. Basisrechnung: 20 + 600 = 620 geplante Frame-/Still-Ausgaben. Null neue KI-Referenzbilder im Basisweg; höchstens vier einzeln begründete Ansichten nur nach separater Root-Freigabe.

Lokale Arbeitsdateien:
- `outputs/gradecrew-investment-20261019/animation-v12-production-plan/Coco_Produktionsplan_V12.md` (SHA-256 `b17c1db53ef8ef77c05b33e1f506709f145fbacdef2d58bde34eae162267d45d`)
- `outputs/gradecrew-investment-20261019/animation-v12-production-plan/Coco_Produktionsplan_V12.pdf` (17 Seiten; SHA-256 `f602812d33608ba6b5eaee6fe6b79d0eca605712ff5b5f49b0983a1f383f4380`)
- `outputs/gradecrew-investment-20261019/animation-v12-production-plan/Coco_Bildliste_600_Frames.csv` (600 Zeilen F000–F599; SHA-256 `051fc39a4c3ba96f7453d71c2f7b9a0424f4f0258709e17bce38d7ed76912b25`)

Repo-Plan: `docs/superpowers/plans/2026-10-15-coco-animation-production.md`. PDF-Seitenbogen und Zeitplantabelle wurden visuell geprüft. Der Plan ist eine künftige Arbeitsanweisung, keine Produktionsfreigabe und keine Abnahme eines Films. V6/V9 bleiben abgelehnt; V10/V11-Standbilder sind keine Animation. Keine Deckänderung oder Nutzerfreigabe für Körperbewegung.

Neues Stilgate: Root prüft alle 20 Einzelstills; Martin erhält Kontaktbogen plus drei große Ansichten und entscheidet einmalig über Coco-/Remy-Ähnlichkeit, bevor Bewegungsproben starten. Filmabnahme bleibt separat.

Nächster Schritt: erst nach separater Produktionsfreigabe einen stilgetreuen Coco-/Telefon-/Rüssel-Blockout und das 20-Still-Stilgate erstellen; bei Stilabweichung nicht in die Bewegung gehen. Vollfilm, weitere Crew-Szenen und PPTX-Einbettung bleiben getrennte spätere Aufgaben.


---

## GC-FINANCE-BAYSTARTUP-20261008 · V13 Ganzcrew-Animatic und Bildpaket (16.10.2026)

Der Nutzer autorisierte die Ausarbeitung der Coco-Prüfbilder und der erweiterten Auftritte von Remy, Emmi und Wilma. Der geprüfte lokale Export ist ein 74-Sekunden-Storyboard-Animatic, kein flüssiger Animationsfilm: 1920×1080, H.264/AAC, 50 fps, 3.700 gleichmäßig getaktete Samples. V2 hat gegenüber V1 einen engeren Bildausschnitt. Root prüfte eine Stichprobe von 22 dekodierten Bildern und gab nur die statische Storyboard-Framingprüfung frei; kein vollständiger Echtzeitdurchlauf oder menschliche Bewegungsabnahme wird behauptet.

V2 MP4: `outputs/gradecrew-investment-20261019/animation-v13-full-crew/motion/V2_Bildausschnitt/GradeCrew_V13_Ganze_Crew_Storyboard_Teilvertonung.mp4` (53.792.695 Bytes; SHA-256 `91b949afe41bb2f943a662793fc7bae9f342f1d172deefe2fb726c4598779c3e`). Die zugehörige 22-Bilder-Stichprobe: `.../V2_Bildausschnitt/GradeCrew_V13_Decodierte_Szenen_22_Bilder.jpg` (SHA-256 `ade46418beff83501131f4355b64a9be1d1a481a1e640c7834b5750a162f1478`). Acht normalisierte vorhandene Sprachclips liegen im Tonmaster; Zeilen 4 und 7 bleiben sichtbar als stille Text-/Gestenabschnitte. Keine neuen Stimmen, bezahlten Videoaufrufe, PowerPoint-/Produktänderungen oder Deployments.

Statische Bildprüfung: 20 Coco-Checks, davon 19 bestanden; Coco-Panel 19 (sicherer Griff um den Telefonhörer) bleibt offen. Zwölf Crew-Szenenbeats und ein separater Telefonankunft-Key bestanden statisch. Insgesamt 32/33 Konzeptbilder statisch bestanden; Standbilder sind kein zeitlicher Bewegungsnachweis. Der Coco-3D-Prototyp (55 Objekte/14 Kontrollen) verfehlte das V8-Identitätsgate in allen fünf begrenzten Lookdev-Pässen; 15 Diagnoseansichten wurden geprüft. Es gibt kein freigegebenes Modell/Rig und keine laufende Modellarbeit. Natürlicher Gang, kontinuierliche Figuren-/Kontaktbewegung, sicherer Griff, vollständiger Ton und Nutzerabnahme bleiben offen.

Arbeitsdateien: `outputs/gradecrew-investment-20261019/animation-v13-production-plan/GradeCrew_Produktionsplan_V13.md` (SHA-256 `8a376ba0f91ede52c1a218c2a48680a399aabebff7ba70b02d4351dd9a961f82`), `GradeCrew_Produktionsplan_V13.pdf` (10 Seiten; SHA-256 `774af7368b0abcddcfdc4b74c7eeed3c49c0a875c7140e3dd5c0cf3562e3c3fd`) und `GradeCrew_V13_Bildpaket.zip` (86 eindeutige ZIP-Einträge, ZIP-Test bestanden; SHA-256 `87235cc633f945630fcbf70634c9923b3bbe64eb14d7b5b640cf3e5bc1047cfd`; enthält Bilder/Plan/Manifeste, nicht das MP4). Vollständiger V13-Arbeitsplan: `docs/superpowers/plans/2026-10-16-gradecrew-whole-crew-intro-v13.md`. V1/V2 und verworfene Lookdev-/Bildversuche bleiben als Verlauf erhalten; V2 ist der einzige aktuelle Animatic-Export.

Nächster Schritt: natürlicher Film bleibt offen und erfordert eine tatsächlich stiltreue, animierbare Figur sowie validierte Gang-/Telefonkontakte und spätere Nutzerprüfung. Die fünf Lookdev-Pässe wurden gestoppt; das Animatic wird nicht als Ersatz für natürliche Animation ausgegeben. Keine Änderung an PowerPoint, Produkt, Main, STATE, Release oder Deploy.


---

## GC-FINANCE-BAYSTARTUP-20261008 · V15-Anforderung nach V14-Ablehnung (18.10.2026)

**Neue Nutzeranforderung:** V14 wird als halbfertig abgelehnt. Der nächste Kandidat soll ein vollständiger Film mit der ganzen Crew und tatsächlichen 24 fps sein; die zuvor akzeptierte Coco-Schnabelbewegung muss wiederhergestellt werden. Dieser Checkpoint hält Auftrag und Abnahmekriterien fest; er behauptet keine V15-Medienproduktion.

**V14-Regression laut Nutzer-/Koordinationsübergabe, in diesem Dokumentationsschritt nicht am Medium unabhängig geprüft:** Die ersten 20 Sekunden verwenden gehaltene V13-Szenenbilder statt der akzeptierten Coco-Unterkiefermechanik. Der Rest wird als gleitende Sprites mit audioenergie-gesteuertem Kiefer beschrieben, nicht als natürliche Figurenanimation. V14 bleibt als Verlauf erhalten und wird nicht zur finalen Erfüllung erklärt. Eine V14-Datei/Hash wurde in dieser Übergabe nicht nachgewiesen.

**Abnahmekriterien für V15:** (1) durchgehender Film mit Coco, Remy, Emmi und Wilma; (2) finaler Stream tatsächlich 24 fps, per Medienmetadaten belegt; (3) sichtbare zusammenhängende Körper-, Bein-, Kopf- und Kontaktbewegung, keine bloß gehaltenen V13-Bilder oder gleitenden Figuren; (4) Coco in der bestätigten V8-Bildsprache und mit wiederhergestellter akzeptierter V7-Unterkiefermechanik: Oberkiefer/Identität bleibt stabil, Unterkiefer artikuliert sichtbar; die bisherige Audioenergie-Näherung genügt nicht als Nachweis; (5) vollständigen Film in Echtzeit prüfen und Abweichungen/Restgrenzen vor Übergabe benennen. Der Nutzer verlangt die 24-fps-Vollfassung; endgültige menschliche Sicht-/Hörabnahme ist separat zu dokumentieren.

**Tonstatus:** Die zuletzt verifizierte Sprachbasis hat acht von zehn Zeilen; Zeilen 4 (Emmi) und 7 (Wilma) waren still. Eine vollständige Tonspur ist daher nicht belegt. In diesem Checkpoint sind keine neuen Stimmen/Provider-Aufrufe, Käufe oder Upgrades autorisiert; bis zu frischem Nachweis bleibt 8/10 der dokumentierte Stand. Keine neue Mediendatei, PowerPoint-, Produkt-, Main-, STATE-, Release- oder Deployänderung durch den Dokumentations-Owner.

**Branch-/Übergabestand vor diesem Eintrag:** Bestehende Task-ID und Branch beibehalten: `docs/baystartup-financing-20261008`, HEAD `35990f4d2f980067776a6bd9791c53f703aa9006`. Es gibt keinen offenen PR mit diesem Branch als Head. Der letzte gefundene Live-Audit `GradeCrew Development Status` lief erfolgreich am 18.10.2026 15:54 UTC auf main `8560992c072779814017ebac6e86b65e938bc951`; der GitHub-Vergleich zeigt den Doku-Branch 97 Commits voraus und 137 hinter main, divergiert, mit fünf geänderten Dokumentationspfaden. Daher kein Merge/Integration aus diesem Checkpoint ableiten; keine PR-Aktualisierung. Die zentrale Task-/Workstream-Leseabfrage fand die übergebene ID dort nicht, während die bestehende Repo-Übergabe und TODO die Task-ID fortführen. Die Release-State-Datei ist zuletzt auf 13.10.2026 datiert; daraus wird kein aktueller Produkt- oder Produktionsstand abgeleitet.

**Nächster Schritt:** Medien-/Voice-/Motion-Fachstand und tatsächliche V15-Dateien/Hashes abwarten, dann gegen diese Kriterien prüfen. Bis dahin gilt V14 als vom Nutzer abgelehnt, der natürliche 24-fps-Film und die Wiederherstellung der Coco-Schnabelbewegung sind offen. Versuchshistorie, vorhandene Artefakte und alle älteren Einträge bleiben erhalten.


### V15-Fortschritt: Emmi-Zeile und V14-Codeprüfung (18.10.2026)

Eine vorhandene fehlende Sprachzeile ist inzwischen ergänzt: Wilma/L7-Generierung `ZpYx4JCnhw8dbntRyimR`; normalisierte Datei `outputs/gradecrew-investment-20261019/animation-v6/audio-elevenlabs/full-dialogue-v1/missing-lines-run2/line-07-wilma-normalized.wav`, SHA-256 `e92eade0665b636c52d2330a240f610bd22517989690f2fbb938520e621bb818`, 6,191 s, mono PCM16/44,1 kHz, aktiver RMS −24 dBFS, kein Clipping. Damit sind nun 9/10 Einzelzeilen verfügbar; das Mischmaster bzw. ein neuer Filmexport ist nicht als aktualisiert belegt. Emmi/L4 scheiterte erneut an der Free-Tier-Meldung „Unusual activity“/gesperrtem Zugang. Keine Wiederholung, kein Kauf/Upgrade; L4 bleibt offen.

Der Motion-Fachagent hat V14-Code geprüft: die ersten 20 Sekunden verwenden statische V13-Platten; Coco enthält dort keine Mund-ROI-Komposition und keine Atembewegung, außerdem keinen Aufruf der zuvor verwendeten `V7 compose_mouth`-Mechanik. Dies bestätigt den im V15-Checkpoint dokumentierten Rückschritt gegenüber dem akzeptierten Unterkiefer. V14 bleibt abgelehnt; die Codeprüfung macht daraus keinen Filmnachweis.

Als begrenzter Qualitätsversuch wird eine einzelne 5-s-Coco-Probe mit Wan 2.7 bei 720p vorbereitet; die Vorabschätzung beträgt 7,5 der vorhandenen 10 Credits, ein gestarteter Anbieterjob bzw. Ergebnis ist noch nicht bestätigt. Keine weiteren Generierungen, Wiederholungen, Trials, Käufe oder Upgrades in diesem Checkpoint. Der 74-s-Film wäre laut aktueller Übergabe mit 111 Credits bei 720p bzw. mindestens 185 bei 1080p veranschlagt; vorhandenes Guthaben reicht nicht. Runway-Free stellt keine Video-Modelle bereit. Kein Vollfilm und keine 24-fps-Abnahme behauptet. Nächster Schritt: nur den Beleg zum einzelnen Probejob/Ergebnis abwarten; danach Status und konkrete Kosten-/Zugangsgrenze aktualisieren, bevor irgendein längerer Anbieterauftrag erwogen wird.


### V15-Abschluss des begrenzten Coco-Proofs: Qualitätsgate nicht bestanden (18.10.2026)

Der vorbereitete Provider-Test wurde tatsächlich ausgeführt: Job `de401485-7c6a-48e1-9e1b-defe8d459728`, 5 Sekunden, 7,5 Credits belastet; der Anbieterstand wurde danach frisch mit 2,5 verbleibenden Credits geprüft (vorher 10). Lokale Datei `outputs/gradecrew-investment-20261019/animation-v15-video-proof/Coco-v15-proof.mp4`, 1.238.149 Bytes, SHA-256 `8d056a2ef2cdbdee8208099437ad3612dd785d5bc636d57f8e9d75ce83a79d57`. Tatsächliche Ausgabe: 1030×894, ungefähr 30 fps, 150 Frames, 5 s; damit weder angefragtes 16:9/720p noch 24 fps.

Root prüfte echte Bilder bei ca. 0,9 s, 2,516 s, 4,02 s und am Ende: Kopf/Augen/Flosse bewegen sich, das Telefon bleibt am Boden. Das Coco-Beak bleibt jedoch in allen Stichproben einschließlich der stillen Schlussphase offen; dies stellt die akzeptierte Unterkieferartikulation nicht wieder her. Extraktion/Kontaktbogen scheiterte im AVFoundation-Decoder (Fehler −11821/−12911); AAC-Spur vorhanden, aber PCM-Extraktion blieb leer. Sprachinhalt und Lippensynchronität sind deshalb nicht verifiziert. Die interne Kiefer-Komposition zeigt zudem eine weiße Naht und ist für Produktion nicht verwendbar. QA-Dateien: `animation-v15-video-proof/art/v15-proof-manifest.json` und `qa/qa-report.json`. Ergebnis: Pilot-/Qualitätsgate **nicht bestanden**, kein Ganzcrewfilm und keine Abnahme.

Die Motion-Feasibility-Notiz `outputs/gradecrew-investment-20261019/animation-v15-24fps-feasibility/CHECKPOINT_V15.md` rechnet 74 Sekunden Filmzeit bei 24 fps = 1.776 Ausgabeframes; 16 Anbieterclips auf 79 Sekunden Anfragedauer aufgerundet. Die Schätzung beträgt 118,5 Credits bei 720p bzw. mindestens 197,5 bei 1080p. Das sind Schätzwerte, kein verlässliches Angebot oder garantierter Endpreis; der misslungene Pilot ist kein Beleg, dass ein Vollfilm denselben Weg erfolgreich nutzt. Providergrenzen: Runway Free bietet aktuell keine Video-Modelle; ElevenLabs-Video/LTX wurde nur als Paid-Plan blockiert; die MiniMax-Prüfung erhielt wegen fehlendem Bildargument keinen Preis. Für diese Prüfungen wurden keine weiteren Video- oder Audiokosten gebucht. Emmi/L4 bleibt wegen Account-/Free-Tier-Sperre fehlend; Wilma/L7 liegt lokal normalisiert vor. Es laufen keine Generierungen, Käufe, Upgrades oder Trials; keine weiteren Versuche im aktuellen Restguthaben.

**Weiter offen:** vollständiger natürlicher Film mit allen vier Figuren, echte 24-fps-Ausgabe, stabiler Coco-Look und wiederhergestellte Unterkieferbewegung, durchgehende Beak-/Audio-Synchronität sowie menschliche Wiedergabeabnahme. Vor jeder längeren Produktion ist erst ein technisch und visuell tragfähiger Bewegungs-/Mund-Synchronisationsweg nachzuweisen. Der 5-s-Coco-Pilot ersetzt V14 nicht als gelungene Fassung; V14 bleibt abgelehnt. Keine PowerPoint-, Produkt-, Main-, STATE-, Release- oder Deployänderung. Task bleibt unerledigt.


### V15-Audioversion: Dialog, Viererchor und Schlusscue gesichert (18.10.2026)

Auf ausdrücklichen Nutzerauftrag wurden sieben neue ElevenLabs-Takes im bestehenden Flow `W0TsplxmFLPNiprgpqod` ausgeführt: 7/7 erfolgreich, keine Fehler, 373 Credits tatsächlich verbraucht. Die Manifestfelder nennen `raw_price_cents_actual=7.46`; bei wörtlicher Cent-Umrechnung sind das USD 0,0746. Der Connector hat den aktuellen Kontostand nicht offengelegt. Generation-IDs: L4 Emmi `4AnFyZ4tDUE2NdjN6hnf`; L10-Coco-Cue `NsznYNZwIRDHsKDktCem`; Chor Coco/Remy/Emmi/Wilma `61hcFIv7sHjrRihNy17y`, `5TD7B6VfgEiAEooMU7E3`, `vZuE52POIjXQvy3Zhqy5`, `7SJQpGfAANT8V0zmVJkW`; Coco-Schluss `ZjbUH6iN9b3BL2FteIdJ`. Der frühere L7-Take bleibt aus dem vorigen Lauf erhalten. Acht akzeptierte ältere Clips wurden wiederverwendet; die frühere L10-Quelle ist erhalten, wird im neuen Master aber durch den neuen Cue ersetzt. Quelldateien bleiben neben den normalisierten Fassungen erhalten.

Neu gemischter Dialogmaster: `outputs/gradecrew-investment-20261019/animation-v6/audio-elevenlabs/full-dialogue-v2/dialogue-master-compact.wav` (48,020612 s, mono PCM16/44,1 kHz, 4.235.462 Bytes, SHA-256 `7f0146eaf9b0aca84234ac2fad0fcce336891e39b5a3254365ed47f195f5d53a`). Der Chor liegt zusätzlich in `chorus-mix.wav` (4,800816 s, 423.476 Bytes, SHA-256 `cd2cf20c1f73a13080cae2905ef7ed21356090963996cfc9d4d03044dc2403d7`). Manifest `dialogue-audio-manifest.json`, SHA-256 `bd23813c76c3fec960751911d968421d038d9510e633875a1a2a15aed03d8f3d`, enthält sieben Generationen, 15 normalisierte Stems und 12 Timeline-Events.

Nutzertexte im neuen Abschluss: Emmi/L4 „Zeig mal her! Oh, da hab ich eine Idee! Diese Frage können wir noch klarer machen.“ Coco-Cue „Und zusammen?“ Alle vier sprechen synchron „Sind wir GradeCrew, deine Crew für digitale Leistungsnachweise!“; Coco schließt mit „Und jetzt ist Martin dran!“ Der vorherige −24-LUFS-Mix verfehlte das Ziel bei drei älteren Coco-Takes wegen der Peak-Grenze. Ein lokaler Neuaufbau verwendete daher −28 LUFS, ohne Kompression, mit −3 dBFS Peak-Ceiling. Der finale Master misst ca. −28,000 LUFS, Sample-Peak −3,577 dBFS, 4× kubische True-Peak-Schätzung −3,566 dBFS und null geclippte Samples. Der Chor misst −28 LUFS. Die 4× Schätzung ist kein zertifiziertes True-Peak-Meter.

Wortanfänge des Viererchors wurden mit ElevenLabs Scribe geschätzt (80-ms-Quantisierung); Abstände wurden durch Stille angleichen, Sprachsamples und Tonhöhe blieben erhalten. Das belegt technische Ausrichtung, aber keine menschliche Hör- oder subjektive Klangabnahme; auch eine vollständige Bild-/Lippensynchronität ist nicht geprüft. Es wurden nach den sieben Takes keine weiteren Aufrufe gemacht.

Dies ist ausschließlich ein Audiofortschritt. Kein V15-Film wurde erzeugt oder abgenommen: V14 bleibt abgelehnt, der V15-Coco-Pilot ist weiterhin am Mund-/Qualitätsgate gescheitert, und der vollständige natürliche 24-fps-Ganzcrewfilm bleibt offen. Keine Video-/Bildgenerierung, keine PowerPoint-/Produktänderung, keine Integration, kein Release oder Deploy.


### V16-Zwischenstand: vollständiger neuer Dialog, begrenzter Coco-Proof läuft (18.10.2026)

Der Nutzer hat die Vollcrew-Animation mit 24 fps und dem akzeptierten Dialog erneut beauftragt. Der Audio-Agent hat sieben neue ElevenLabs-Takes erfolgreich erzeugt (7/7, 373 Credits; genaue Takes und normalisierte Mischung stehen im V15-Audioeintrag). Der daraus gebaute kompakte Master ist vollständig und wurde byte-/Signalprüfungen unterzogen. Für V16 wurde daraus eine 72,000-s-Timeline mit 24 fps und 1.728 Frame-Zeitpunkten vorbereitet; die Sprecherauftritte und der gemeinsame Viererchor sind zeitlich eingeplant. Diese Daten sind Vorbereitungsartefakte und kein fertiger Film.

Lokale V16-Vorbereitung unter `outputs/gradecrew-investment-20261019/animation-v16-dialogue-production/`: `audio/dialogue-film-72s-master-PCM-preserved.wav` (SHA-256 `aaf1617127bf05ad0cd81a67f18a263d1769824d1a7275b107e6047492b3d4ce`), `dialogue-timeline-24fps.csv` (SHA-256 `33dd74664b9773560e311d36f5e3a1ced6925dd35dcdc5946f3df241c02ad477`) und `audio/PCM-verification.json` (SHA-256 `558c4b22519c6f1f76b646ceda1cac12373596b5659f83a19797b6fbaf51eef9`). Der begleitende Regieplan und die endgültige Prüfung der Retimingdateien stehen noch aus.

Ein einzelner Coco-Video-Proof wurde nach Vorabschätzung gestartet: LTX-Job `dzyKzZyujTYeHScAvVQZ`, eine Variation, gemeldete tatsächliche Belastung 1.308,96 Credits innerhalb der ausdrücklich gesetzten 1.500-Credit-Grenze. Zum Zeitpunkt dieses Checkpoints läuft die Generierung noch; ein MP4, technische Metadaten und eine Bild-/Mundbewegungsprüfung sind nicht belegt. Es gab keinen Wiederholungsversuch und keinen Vollfilm-Auftrag. Kein Anbieterpreis oder Budget für den vollständigen Film wurde freigegeben.

Der frühere V15-Coco-Pilot bleibt am Schnabel-/Qualitätsgate gescheitert; V14 bleibt abgelehnt. Dieser Zwischenstand ersetzt diese Befunde nicht und verspricht keine natürliche Animation. Vollcrewfilm, 24-fps-Ausgabe, Coco-Schnabelsynchronität sowie menschliche Sicht-/Hörabnahme bleiben offen. Keine PPTX-, Produkt-, Main-, STATE-, Release- oder Deployänderung.


### V16-Coco-Proof abgeschlossen; Vollfilm weiterhin offen (18.10.2026)

Der eine autorisierte LTX-Test ist abgeschlossen: Job `dzyKzZyujTYeHScAvVQZ`, eine Variation, 1.308,96 Credits gemeldet belastet (innerhalb der 1.500-Credit-Grenze); das Provider-Metadatum nennt zusätzlich USD 0,261792, eine separate Rechnungsprüfung liegt nicht vor. Es gab keine Wiederholung und keinen Ganzfilmauftrag.

MP4: `outputs/gradecrew-investment-20261019/animation-v16-dialogue-production/Coco-LTX-proof.mp4`, 639.612 Bytes, SHA-256 `0ac8063a8be5f14aa3916f6e15bfd19693d243c875a0130d59b70ac86772aa9d`. Metadaten: 5,0 s, 480×480, H.264/AAC, 120 kodierte Samples; die native FPS-Angabe fehlt. Das verfehlt das geplante 16:9/1920×1080-Ausgabeformat. Eine begrenzte Sichtprüfung des Proof-Ergebnisses meldet geschlossenen Schnabel am Anfang, leichtes Öffnen um ca. 1,2 s, weiteres Öffnen um ca. 2,5 s und geschlossen bei 5 s nach der stillen Schlussphase; Augen/Kopf/Flosse bewegen sich leicht. Der Clip umfasst nur Gesicht/Oberkörper, keine Füße, kein Telefon und keine vollständige Szene. Lokales AVFoundation-Decoding scheiterte (−11821/−12911); deshalb sind Sprachinhalt und genaue Lippen-/Audio-Synchronität nicht technisch verifiziert. Dies ist ein begrenztes Anzeichen für Mundbewegung, kein bestandenes Film- oder Natürlichkeitsgate und keine Nutzerabnahme.

V16-Plan- und Tonunterbau liegen lokal unter `outputs/gradecrew-investment-20261019/animation-v16-dialogue-production/`: `PRODUKTIONSPLAN_V16.md` SHA-256 `d97fa5ef40ff9e85aa5e62b12acb83934e44ed4dc8fb843ab509dc569e59d331`; `production-pack.json` SHA-256 `9a8c62a1c54762ff336bbe623f0ed66d6aa77d562f1e87db1882b066f3770ea4`; `dialogue-timeline-24fps.csv` SHA-256 `33dd74664b9773560e311d36f5e3a1ced6925dd35dcdc5946f3df241c02ad477`; `audio/PCM-verification.json` SHA-256 `558c4b22519c6f1f76b646ceda1cac12373596b5659f83a19797b6fbaf51eef9`. Der Prüfbericht bestätigt vier quellenidentische PCM-Abschnitte, 15 geprüfte Stems und eine 72-s-Tonspur mit 3.175.200 Samples. Zielplan: 72 s, 24 fps, 1.728 Frame-IDs, 1920×1080. Diese Planung und der erfolgreiche Audioaufbau belegen keinen fertig animierten Film.

**Status:** Der V16-Coco-Proof ist ein begrenzter, nicht abschließend synchron geprüfter Versuch. Der vollständige natürliche Film mit vier Figuren, 24-fps-/1080p-Ausgabe, stabiler Identität, glaubwürdigen Körper-/Telefonkontakten und menschlicher Echtzeit-Wiedergabeabnahme bleibt unerfüllt. V14 bleibt abgelehnt; der V15-Pilot bleibt ein dokumentierter Fehlschlag. Nächster Schritt ist die Auswertung, ob ein konkreter Bewegungs-/Synchronisationsweg die offenen Gates bestehen kann; für einen Vollfilmauftrag liegt keine konkrete belastbare Gesamtkostenschätzung oder Freigabe vor. Keine PowerPoint-, Produkt-, Main-, STATE-, Release- oder Deployänderung.


### V16-Proof: aktualisierte native Decode-/Audio-QA (18.10.2026)

Nach dem ersten lokalen AVFoundation-Fehler wurde eine spätere native Dekodierung erfolgreich abgeschlossen. Korrektur zum vorigen Zwischenstand: Der Proof hat 24 native fps und 120 komprimierte Frames bei 5,0 Sekunden (480×480); FPS sind also inzwischen belegt. Eine AAC-Spur enthält 4,899 Sekunden; 0,101 Sekunden des vorgesehenen fünfsekündigen Eingabefensters fehlen am Ende. Die 11 tatsächlichen Stichproben liegen zwischen 0,0 und 4,9167 Sekunden. Die frühere Decoder-Fehlermeldung bleibt als erster fehlgeschlagener Prüfversuch erhalten, ist aber nicht mehr der aktuelle Decode-Status.

Der dekodierte Ton stimmt mit dem lokalen Eingabefenster bei null Samples Versatz überein: 216.046 Samples, Korrelation 0,9999924, linearer Pegelfaktor 0,999472. Das ist ein Wellenformvergleich, kein Phonem-/Mund-Sync-Nachweis. Der Sprechertext ist technisch vorhanden; Root hat keine Echtzeit-Hörprüfung oder phonetische Abnahme behauptet. Die 11 von Root geprüften Bilder zeigen das aktuelle Coco-Gesicht mit geschlossenem Schnabel bei 0 s, Öffnung etwa von 0,5 bis 3,5 s und Schließen bei 4,0–4,9167 s; leichte Augen-/Kopf-/Flossenbewegung ist sichtbar. Das verwendete Eingangsbild ist selbst ein 496×496-Gesichts-/Kieferschnitt; daher ist der quadratische Gesicht/Oberkörper-Ausschnitt erwartungsgemäß und kein Beleg für ein Ganzkörpermodell. Füße, Telefon, Ganzszene und natürliche Körperbewegung bleiben ungeprüft.

Prüfbelege: `proof-inspection/actual-media-inspection.json`, `proof-inspection/audio-comparison.json` und der echte 11-Bilder-Bogen `proof-inspection/Coco_LTX_Decodierte_Bilder.jpg` (SHA-256 `392b907f38b51e05b1273d784af5defa6f6119677155975bc3c4f38bcc0739eb`) unter `outputs/gradecrew-investment-20261019/animation-v16-dialogue-production/`. Die bestätigte 24-fps-Rate verbessert den Metadatenstand, ändert aber nicht den begrenzten Proof-Umfang oder die weiterhin offene Abnahme des vollständigen Films.


### V16-Produktionsplan und Anbieterblockade: Referenzfreigabe ausstehend (18.10.2026)

Der ausführliche V16-Produktionsplan liegt nun lokal als `outputs/gradecrew-investment-20261019/animation-v16-dialogue-production/PRODUKTIONSPLAN_V16.md`, SHA-256 `368d63730c1976aa698a47e28239b2b984319f9d50c0490cc8464808fb3723be`; der zugehörige Statusbericht `CHECKPOINT_V16.md`, SHA-256 `42fea365e7256d2aa8e1f8aa59117bfcb6f8e408e457101fb57d9775476c8cae`. Er beschreibt 72 s/24 fps/1.728 Frame-IDs, zwölf Dialogereignisse, 15 Stems und ein lokales Ton-/Szenenpaket. Das ist Produktionsplanung und kein abgeschlossener Film.

Ein konkreter Übermittlungsversuch der vorhandenen V13-Referenzpose `pose-walk-screenright-support.png` an ElevenLabs wurde von der automatischen Prüfungsinstanz abgelehnt, weil die ausdrückliche Freigabe zur Übermittlung dieser Referenzdatei an den Anbieter fehlte. Es wurde kein Ausweichweg verwendet. Die Koordination hat um asynchrone Zustimmung zur Übermittlung bereits bestätigter Coco-, Remy-, Emmi- und Wilma-Referenzbilder an ElevenLabs gebeten; diese Zustimmung ist zum Zeitpunkt dieses Eintrags noch nicht eingegangen. Deshalb erfolgt kein weiterer Upload oder Anbieterauftrag, bis die Freigabe vorliegt.

Zusätzliche Vorprüfung: Kling 2.6 Pro nannte 2.121 Credits bzw. USD 0,4242 für einen fünfsekündigen 16:9-Test, jedoch nur mit dem vorhandenen 496×496-Gesichts-/Kieferausschnitt als Eingabe; das ist kein belastbarer Preis für den gewünschten Ganzkörper-/Ganzcrewfilm. Bei LTX A2V mit verbundenem Bild blockiert der Endpunkt Änderungen von Seitenverhältnis und Auflösung, sodass 16:9/720p nicht angeboten bzw. geschätzt werden konnte. Keine dieser Prüfungen startete einen neuen Auftrag oder belastet zusätzliche Credits. Der einzige ausgeführte Medienjob bleibt der dokumentierte 1.308,96-Credit-Coco-Proof.

Damit bleibt der gewünschte natürliche 24-fps-Film offen. Vor weiterer Produktion fehlen sowohl die Zustimmung zur Drittanbieterübermittlung geeigneter Referenzen als auch ein erfolgreicher Ganzkörper-/Bewegungsproof und eine belastbare Vollfilm-Kalkulation. Der einzelne LTX-Proof zeigt begrenzte Gesichts-/Schnabelbewegung und korrespondierendes Audiosignal, aber weder Ganzkörperanimation noch geprüfte Phonemsynchronität. Keine weiteren Videoaufrufe, Käufe oder Upgrades, keine PPTX-/Produkt-/Main-/STATE-/Release-/Deployänderung.


### V16 Produktionsbuch: Bildinventar, Prompts und Referenzfreigabe (18.10.2026)

Der Nutzer hat der Übermittlung der bereits bestätigten Crew-Referenzbilder an Anbieter ausdrücklich zugestimmt. Damit ist die frühere Asset-Berechtigungssperre erledigt; eine erneute Zustimmung ist dafür nicht nötig. Es erfolgte danach noch kein weiterer Upload und kein Providerstart: Root pausiert diese Schritte, bis die Frage nach dem tatsächlichen Bildbestand und der Produktionsplanung beantwortet ist.

Die Frage nach „20 einzelnen Bildern“ ist wie folgt zu beantworten: **20 einzelne Coco-Prüf-PNG-Dateien liegen vor, aber sie sind keine 20 unabhängig generierten oder fertig anschlussfähigen Filmszenen.** Sie sind verlustfreie Crops aus vier vorhandenen Bildtafeln: sechs Ansichten, sechs statische Aktionsposen, fünf Schnabelzustände und drei Telefonkontakte. 19 davon bestehen die statische Bildprüfung; der sichere Griff (Q19) bleibt ungeklärt. Dazu kommen zwölf Crew-Storyboard-Crops aus zwei Tafeln und ein Schlüsselbild für Coco/Telefon/Rüssel. Diese Bestände sind Konzepte und Prüfbilder; eine kontinuierliche Bewegungsserie folgt daraus nicht. Der V16-EDL hat 21 Zeitfenster und das Produktionsbuch 23 Regieeinheiten, aber diese Zahlen bezeichnen keine vorhandenen Einzelbilder.

Das detaillierte Produktionsbuch mit shot-by-shot-Regie und getrennten englischen I2V-/A2V-Promptvorlagen liegt lokal unter `outputs/gradecrew-investment-20261019/animation-v16-dialogue-production/promptbook/`:
- `GradeCrew_V16_Produktionsbuch_und_Prompts.md` SHA-256 `a9c236a6e065470858afdb9c89c0c903b6e495c6c5440e8f8f5533b74ae0275c`; es behandelt 72 s/24 fps/1.728 geplante Frame-IDs, 23 Regieeinheiten, 24 Anschlussziele, Referenz-/Kontinuitätsanforderungen, den gemeinsamen Viererstimmen-Chor und die Grenzen der verfügbaren Anbieterports.
- `shot-prompts-and-assets.json` SHA-256 `2ff3aa10cbaacac9369960dca985c2a9189c23f269d4374065e2e506bf56b80e` (23 Einheiten).
- `asset-inventory.json` SHA-256 `6f5c22a03d2f09b63b46d205a66d00503a246485334791d5cd446548e94b317c` und `production-boundary-needs.json` SHA-256 `f613afc19f2cbfd085ff3c57bf7a085b754663fc224d1684cc0c75b5fd29ba5a`.
- Deutsche Inventarbögen: `Inventar_20_Coco_Pruefbilder.jpg` SHA-256 `c60958a2dae8e2da52649b72367b2b998850b4a7671d3d491b3a0db337ade3f2` und `Inventar_12_Crew_Szenenkonzepte.jpg` SHA-256 `0f9584e362fbc79b7bca3e56c5861417d4d792ea54aca8c93f8d24ae4d52113e`.

Die zusätzliche Video-Vorprüfung ist begrenzt: Kling 2.6 Pro nannte 2.121 Credits/0,4242 USD für einen 5-s-16:9-Test mit dem bestehenden 496×496-Gesichtscrop; das ist kein Ganzkörper- oder Vollfilmangebot. LTX A2V mit verbundenem Bild erlaubt laut Preflight keine angeforderte Änderung auf 16:9/720p. Es wurde kein weiterer Auftrag ausgelöst. Der bereits dokumentierte einzelne 5-s-Coco-Proof bleibt das einzige ausgeführte V16-Videoexperiment; er enthält 24 native fps, aber nur ein quadratisches Gesicht/Oberkörperbild und beweist weder Körperbewegung noch Phonem-Sync.

Nächster Schritt: Das Produktionsbuch und die 20- bzw. 12-Panel-Inventarbögen als Planung/Bestandsauskunft vorlegen. Vor einem Vollfilm fehlen weiterhin individuell passende Anschlussbilder, ein geklärter Griff und ein bestandener natürlicher Bewegungs-/Ganzkörperproof. Die neue Zustimmung erlaubt Referenzübermittlung, sie besagt nicht, dass der Film fertig oder der einzelne Proof für die Vollproduktion ausreichend ist. Keine neue Generation, kein Kauf/Upgrade und keine PPTX-/Produkt-/Main-/STATE-/Release-/Deployänderung.


### V16-Produktionsbuch: finale Prompt-/PDF-Revision (18.10.2026)

Die korrigierte lokale Endfassung liegt unter `outputs/gradecrew-investment-20261019/animation-v16-dialogue-production/promptbook/`:
- `GradeCrew_V16_Produktionsbuch_und_Prompts.md` (125.856 Bytes; SHA-256 `bae312d372dd168e41c12cbf7bf4a0b2c03869a26be7a6fbb8175b81e929fab4`).
- `GradeCrew_V16_Produktionsbuch_und_Prompts.pdf` (39 Seiten, 1.905.787 Bytes; SHA-256 `bdc564dc6140ed772b8e26a6e4fe2bcfd5aa7a96f5948a82b328e7177b8f0fd0`).
- `shot-prompts-and-assets.json` (177.326 Bytes; SHA-256 `3b7bd8aa39ea6c5cd7fb7159141620f16cf0c4a6972dc11f825037bd29ed7f13`).
- Inventarbögen `Inventar_20_Coco_Pruefbilder.jpg` (732.612 Bytes; SHA-256 `c60958a2dae8e2da52649b72367b2b998850b4a7671d3d491b3a0db337ade3f2`) und `Inventar_12_Crew_Szenenkonzepte.jpg` (644.332 Bytes; SHA-256 `0f9584e362fbc79b7bca3e56c5861417d4d792ea54aca8c93f8d24ae4d52113e`).

Die finale 23-Shot-Fassung enthält für jede Einheit englische I2V-Prompts, ausdrücklich geplante Provider-Take-/10-s-/Schnittfenster und die getrennten A2V-Anforderungen. Die Emmi-A2V-Regie ist auf Fuchsschnauze korrigiert (kein Rüssel). Root prüfte PDF-Seite 1 und 12 auf Lesbarkeit/Überlauf und bestätigte den 20-Coco-Überblick sowie das Telefonbewegungs-Timing. Die Stilbögen bleiben statische Crops aus Vorlagen und ersetzen keine 20 eigenständigen Filmshots.

Die Nutzerfreigabe für Übermittlung bereits bestätigter Referenzen besteht. Gemäß aktueller Koordination bleiben neue Uploads und Anbieterstarts vorerst pausiert; diese Pause ist kein offener Nutzerfreigabepunkt. Es wurde in dieser Revision keine weitere Generierung oder Anbieterbelastung ausgelöst. Vollständige natürliche Animation und echte Anschlussbilder bleiben offene Produktionsarbeit.


### V17-Auftrag: fehlende Crew-Szenenbilder und Videoausführung autorisiert (18.10.2026)

Der Nutzer hat jetzt die tatsächliche Erzeugung der fehlenden Ganzcrew-Szenenbilder und das Erstellen eines Videos ausdrücklich beauftragt; dies ist keine weitere Plan-only-Runde. Die frühere Zustimmung zur Übermittlung der Crew-Referenzen gilt weiterhin. Root legt die Ausführungsreihenfolge fest: zuerst ein fünfsekündiger Chorus-Clip mit allen vier Figuren gleichzeitig sichtbar, danach die übrigen Körperszenen. Ziel bleibt die vollständige 24-fps-Animation mit dem freigegebenen Audio V2.

Arbeitsannahme für die Bildseite: bis zu 29 noch fehlende Anschluss-/Grenzbilder anhand des kanonischen Bildmaterials von Coco, Remy, Emmi und Wilma, einschließlich eines korrekt gehaltenen Telefonhörer-Griffs. Diese Zahl ist ein Arbeitsumfang, keine Behauptung, dass Bilder bereits vorliegen. Vor langen Provideraufträgen wird eine konkrete Kostenschätzung eingeholt. Für Video gilt ein vom Root gesetztes Gesamtlimit von höchstens 12.000 Credits für diesen Ausführungsdurchgang; dieses Limit ist keine Aussage über die ausreichende technische Qualität oder einen erfolgreichen Vollfilm. Pro Auftrag nur eine Variation; keine blinden Wiederholungen oder Konto-Upgrades.

Zum Zeitpunkt dieses Zwischencheckpoints liegen noch keine neuen V17-Job-IDs, erzeugten V17-Szenenbilder oder V17-Videodatei mit geprüften Metadaten vor. Daher wird hier keine Generierung oder Fertigstellung behauptet. Die vorherige V16-Bildinventur bleibt gültig: 20 Coco-PNGs sind einzelne statische Prüfcrops, nicht 20 fertige Filmshots; der sichere Griff war offen. V16-Plan, V16-Coco-Proof, Nutzerfeedback und sämtliche vorherigen Fehlversuche bleiben als Historie erhalten.

Nächster Schritt: tatsächliche Generierungs-IDs, Einzeldateien/Hashes und Providerkosten der ersten Bild- und Chorus-Aufträge erfassen; anschließend Qualität und vierfach sichtbare Chor-Szene prüfen, bevor weitere Szenensegmente ausgeführt werden. Keine PPTX-, Produkt-, Main-, STATE-, Release- oder Deployänderung.


**Klarstellung zum internen Credit-Limit:** 12.000 Credits sind ein von Root für diesen Ausführungsdurchgang gesetztes internes Providerlimit, kein vom Nutzer festgelegtes Budget und kein Vollfilmangebot. Die früheren 1.308,96 Credits für den V16-Proof und 373 Credits für die separate V15-Audiogenerierung bleiben getrennte, bereits dokumentierte Verbräuche. Ein aktueller Kontostand ist nicht belegt; Starter-Credits werden nicht unterstellt.


### V17-Chorauftrag gestartet: vier getrennte Sprecherclips in Arbeit (18.10.2026)

Der erste Videoauftrag nach dem neuen Nutzerauftrag ist der priorisierte Fünf-Sekunden-Chor: Coco, Remy, Emmi und Wilma sind jeweils gleichzeitig im selben Szenenbild vorgesehen, aber jede Figur erhält ihre eigene ausgerichtete Stimmeingabe. Die Nutzerfreigabe für die Crew-Referenzen lag vor. Vier freigestellte Ganzkörperreferenzen, vier fünfsekündige WAV-Eingaben und eine Bühnenreferenz wurden im bestehenden ElevenLabs-Flow `W0TsplxmFLPNiprgpqod` hochgeladen. Ein erster Uploadversuch wurde durch die Auto-Prüfung abgelehnt; derselbe zulässige Uploadweg wurde danach mit belegter TTS-Herkunft und Nutzerfreigabe akzeptiert. Kein alternativer oder verdeckter Übermittlungsweg wurde benutzt.

Vier einzelne `ltx-audio-to-video`-Jobs wurden gestartet, je ein Take und je 2.617,92 Credits; die im Ledger erfasste Summe beträgt 10.471,68 Credits und liegt unter dem internen Durchgangslimit von 12.000 Credits. Es handelt sich um vier getrennte Generierungen für einen gemeinsamen Chormoment, nicht um einen fertigen Chorusclip. IDs/Status zum Checkpoint:
- Coco: generation `rAJXkBjFeKV4Dg4Z03ia`, session `7MBivXCsoAgSrCMzJlyY`.
- Remy: generation `13JkWNudC4bx7l6ym3O7`, session `VvqUJAoxPYhMIDVXL0ei`.
- Emmi: generation `Plpb9KGuKyMkCxHtj9R2`, session `UjFA8GPxjfOSSWSkyv6D`.
- Wilma: generation `L252H7TQtnfdpddN9Jxe`, session `5RgPZ17Hag3ZHSPkNSvE`.

Beim Checkpoint standen alle vier Jobs auf `started`; noch lagen keine Ergebnisclips oder Abschluss-QA vor. Der lokale `video-production/production-ledger.json` hält Schätzungen, Uploadasset-IDs, Freigabeverlauf und Jobdaten fest. Eine separate aktuelle Kontostands-/Rechnungsprüfung ist nicht belegt. Keine weiteren Variationen oder Wiederholungen werden gestartet, bevor diese vier Ergebnisse geprüft sind.

Vorhandene lokale Bilddateien unter `production-art/frames/` umfassen B00/B01, den Bühnenhintergrund, vier transparente Sprecherreferenzen und zwei B21-Gruppenvarianten (offene bzw. geschlossene Münder). B21 mit geschlossenen Mündern ist als möglicher Chorus-Eingang vorzuziehen; das allein macht die vier generierten Clips noch nicht zu einem synchronisierten Viererchor. Ein vorhandenes V13-Walk-Referenzbild wurde zur Bewegungseingabe verwendet; einzelne weitere Szenenbilder sind noch in Bearbeitung. Die Gesamtserie fehlender Filmszenen ist nicht vollständig.

Die bereits erzeugten V16-Assets ändern den Status des Coco-Proofs nicht: dessen 5-s-Ergebnis bleibt ein quadratischer Gesichts-/Oberkörperclip. Ziel der Ausführung bleibt ein natürlicher, vollständiger 24-fps-Ganzcrewfilm; weder der Chor noch die gesamte Animation sind derzeit als fertig oder abgenommen belegt. Keine PowerPoint-, Produkt-, Main-, STATE-, Release- oder Deployänderung.


### V17-Ausführung: erstes Bildpaket und erste Rückgabe (18.10.2026)

Root hat das interne Providerlimit dieser Runde auf 15.000 Credits angehoben; es ist weiterhin weder Nutzerbudget noch Vollfilmangebot. Vier Chorus-Jobs und ein einzelner Coco-Gangjob sind nun gestartet. Das Ledger meldet 12.592,68 Credits committed, somit innerhalb dieses internen Limits; ein aktueller Kontostand oder eine separate Rechnung wurde nicht geprüft.

Die vier bereits dokumentierten Chorus-Jobs laufen weiterhin als einzelne Sprecheraufnahmen für denselben gemeinsamen Fünf-Sekunden-Chor. Eine erste Datei ist zurückgekommen: Emmi `outputs/gradecrew-investment-20261019/animation-v16-dialogue-production/video-production/raw/Emmi-chorus.mp4`, 1.472.407 Bytes, gemeldete Dauer 5 s/1024×1024, SHA-256 `5ae7481c305639a91a4e50d245a6e8fe57dc860df05c3af5cb888a6332bea3b1`. Es liegt noch kein Qualitäts-Pass vor; die Einzelaufnahme allein ist kein Viererchorclip. Die drei anderen Sprecherjobs waren beim letzten Ledgerstand noch `started`.

Zusätzlicher Ganzkörperversuch: Coco-Gangclip mit neuem B01/B02-Endbildpaar, Kling 2.6 Pro, ein 5-s-Take ohne Sprache, Generation `mX08SHf5ZFy2Sxpn5d9d`, Session `pGCygVu0LEnybGoe1L0T`, 2.121 Credits gemeldet committed. Der Ausgang ist noch nicht eingegangen und unbewertet. Insgesamt liegen jetzt fünf tatsächliche Coco-Telefon-Boundarybilder (B00–B04) unter `production-art/frames/`; die Gruppe B21, Bühnenplatte und vier transparenten Sprecherreferenzen liegen daneben. Das ist ein Teilbestand, keine vollständige 29-Bild-Serie.

Die vier Chorus-Uploads verwendeten je eine eigene aligned 5-s-WAV, eine Ganzkörperreferenz und dieselbe Stage-Referenz. Beim ersten Bildupload wies Auto-review den Versuch wegen fehlender anerkannter TTS-Herkunft zurück; der erneute Durchgang mit dokumentierter Herkunft und ausdrücklicher Nutzerfreigabe wurde akzeptiert. Beide Vorgänge sind im lokalen `video-production/production-ledger.json` verzeichnet. Es wurde kein Review block umgangen. Es laufen keine weiteren Aufgaben über die fünf gestarteten Jobs hinaus, bis die Ergebnisse gelesen und geprüft sind.


### V17-Chorusclips und erste Anschluss-Stills eingegangen (18.10.2026)

Alle vier separat gestarteten Chorusjobs sind nun lokal als MP4 zurückgekommen. Die Dateien werden noch einzeln/zeitlich geprüft; derzeit ist kein gemeinsamer Chor zusammengesetzt oder von Root als Bewegung/Identität bestanden. Geprüfte Dateihashes und Größen:
- Coco: `video-production/raw/Coco-chorus.mp4`, 1.538.788 Bytes, SHA-256 `4c0c069055ad6351a20fc0a63967008bc8ee4c2e8a8b89324a2162ecb6e0c4be`.
- Remy: `video-production/raw/Remy-chorus.mp4`, 2.342.433 Bytes, SHA-256 `2e520f5749e37a7309e903f16f0262577ab7dd730df89277ab726597d7df766c`.
- Emmi: `video-production/raw/Emmi-chorus.mp4`, 1.472.407 Bytes, SHA-256 `5ae7481c305639a91a4e50d245a6e8fe57dc860df05c3af5cb888a6332bea3b1`.
- Wilma: `video-production/raw/Wilma-chorus.mp4`, 1.561.395 Bytes, SHA-256 `f77c4714e48ae69d0a470e5e1c70d30c34d81cb4bac539e2571d5bc37340be71`.

Der Viererchor wurde als vier getrennte 5-s-LTX-Audio-to-Video-Generierungen mit einer Stimmeingabe und einer Figurenreferenz pro Job angelegt. Die Jobausgaben sind vorhanden; Bildrate, Bildgröße und durchgehende Synchronität dieser vier neuen Dateien werden erst nach technischer Metadaten-/Decodeprüfung behauptet. Die vier Stimmenclips sind kein bereits compositeter gemeinsamer Chormoment. Die lokale LEDGER-Meldung bleibt: 10.471,68 Credits für diese vier Jobs und zusammen 12.592,68 Credits einschließlich des separat gestarteten Coco-Gangjobs. Das Root-interne Limit für diesen Durchgang beträgt nun 15.000 Credits; weder das noch die Einzeljobpreise sind eine Vollfilm-Kalkulation oder ein Nutzerbudget.

Zusätzliche Stills sind jetzt einzeln als B00–B08 vorhanden: leere Bühne, Coco-Peek, Coco stehend/gesetzt, Telefon platziert, Coco sitzend, Hörer halten/hören/auflegen. Artagent hat die Bilder statisch visuell geprüft. Bei B08 ist der Hörer auf beiden Gabelpfosten gestützt; Telefonperspektive/-größe weicht gegenüber B06 leicht ab. Diese Anschlusskontinuität ist offen und die Stills beweisen keinen echten Bewegungsfluss. B21 als Gruppenbild, Bühnenplatte und vier transparente Sprecher-Referenzen bleiben ebenfalls erhalten.

Der Coco-Gangjob Kling 2.6 Pro (`mX08SHf5ZFy2Sxpn5d9d`, 2.121 Credits gemeldet) steht weiterhin auf `started`; ein Ergebnis liegt in diesem Checkpoint nicht vor. Nächster Schritt: die vier zurückgekommenen Chorclips tatsächlich dekodieren, je Bild-/Audio-/Identitätsstatus dokumentieren, dann eine Viererkomposition nur aus geprüften Einzelclips aufbauen. Kein Vollfilm und keine menschliche Gesamtwiedergabeabnahme behauptet.


### V17-QA der Einzelclips und Coco-Gang: zwei offene Bewegungstore (18.10.2026)

Alle vier Chorus-MP4s sind jetzt nativ dekodiert: je 5 Sekunden, 120 Frames bei 24 fps, 1024×1024. Das Bewegungs-/Sprechbild ist uneinheitlich: Coco hat klar erkennbare Mundbewegung, Remys Mund öffnet wiederholt, Wilma zeigt nur kleine Öffnungen; Emmis Mund bleibt über den gesamten Clip geschlossen (**Mund-QA nicht bestanden**). Damit ist noch kein gemeinsamer Viererchor freigegeben. Die Prüfkontaktbögen und Einzelbilder liegen in `video-production/speech-QA/`; das Ergebnis beruht auf dekodierten Frames, nicht auf einer behaupteten vollständigen Echtzeit-Hör-/Phonemabnahme.

Der separat gestartete Coco-Gangclip Kling 2.6 Pro liegt lokal als `video-production/raw/Coco-walk-Kling.mp4` vor (3.882.331 Bytes; SHA-256 `6bdcf58d4fdc9a378311bdc2f11e9328a3b5be1eddfc511607a039637d002f82`). Metadaten laut Motion-QA: 5,084 s, 122 Frames, 24 fps, 1916×1080. Das Bewegungs-Gate ist **nicht bestanden**: die Flosse wird wie eine Bodenhand aufgesetzt und der hintere Fuß bleibt über F24–72 stehen; die verlangten acht echten alternierenden Schritte sind nicht vorhanden. Der Walkclip ist kein akzeptabler Ersatz für den natürlichen Ganzkörpergang.

Eine einzige neue Emmi-Großgesichtskorrektur wurde danach gestartet, um das geschlossene Maul des Chorclips gezielt zu beheben: LTX-Job `RBYeM9LOM5anMPvzprBB`, Session `USsAXqHv83imvXkQHnT5`, 1.308,96 Credits gemeldet; Ergebnis ausstehend. Root-interne Obergrenze für diese Runde beträgt 16.500 Credits; die bislang gemeldete kumulative Belastung ist 13.901,64 Credits. Dies ist weder ein Nutzerbudget noch ein Vollfilmangebot. Eine alternative neue Coco-Ganzkörper-Walkgeneration wird nur nach passendem Startbild und frischer Einzelschätzung erwogen; sie wurde zum Zeitpunkt dieses Checkpoints noch nicht gestartet.

Aktuelle Bilddateien B00–B08 sind statische Übergangs-/Telefon-Keys. Art-QA sieht bei B08 gegenüber B06 eine leichte Telefonperspektiv-/Größenabweichung. Der nächste Szenenkey sollte auf der akzeptierten B21-Gruppenbühne beruhen und die Figuren entfernen, statt die Kamera/Größe neu zu rahmen; keine Bewegungsfreigabe folgt aus diesen Stills. Keine fertig compositierte Chorsequenz und kein Vollfilm liegen vor. Die fehlenden Szenenbilder bleiben in Arbeit; die finale natürliche 24-fps-Ganzcrew-Animation ist unerfüllt.


### V17-Update: Chorus-Frames dekodiert, erster Gang fehlgeschlagen, Korrekturen laufen (18.10.2026)

Die vier Chorus-MP4s wurden inzwischen einzeln nativ dekodiert: alle vier haben je 120 Frames, 24 fps, 1024×1024 und 5 Sekunden. Mundstatus: Coco deutlich beweglich, Remy wiederholt offen/schließend, Wilma nur geringe Öffnung, Emmi in sämtlichen 120 Frames geschlossen. Damit bestehen drei Clips ein erstes bloßes Bewegungsscreening mit unterschiedlicher Qualität; Emmi besteht es nicht. Ein gemeinsamer Viererchor ist noch nicht zusammengesetzt, und keine der Dateien beweist für sich eine vollständige gemeinsame Bild-/Audiolippensynchronität. Der Agent dokumentierte die vier Bildbögen in `video-production/speech-QA/`.

Der erste Coco-Walk-Kling-Clip ist jetzt zurückgekehrt und wurde **abgelehnt**: `video-production/raw/Coco-walk-Kling.mp4` (3.882.331 Bytes, SHA-256 `6bdcf58d4fdc9a378311bdc2f11e9328a3b5be1eddfc511607a039637d002f82`), 5,084 s, 122 Frames, 24 fps, 1916×1080. Die Flosse setzt wie eine Bodenhand auf und der hintere Fuß bleibt über F24–72 unbewegt; es fehlen die verlangten acht alternierenden Schritte. Dies ist kein akzeptabler Gang und wird nicht weiterverwendet.

Zwei begrenzte Einzelkorrekturen sind als nächste Prüfversuche gestartet; noch kein Ergebnis liegt vor:
- Emmi-Gesichtscrop vergrößert: `RBYeM9LOM5anMPvzprBB`, Session `USsAXqHv83imvXkQHnT5`, 1.308,96 Credits.
- Coco aufrechter Gang mit neuem Startbild: `KQWvqEdEETPBSRV7b7qk`, Session `8ZogzGwEGmLQid3OEoUf`, 2.121 Credits.

Das lokale Produktionsledger meldet sieben gestartete Aufträge und kumulativ 16.022,64 Credits innerhalb des root-internen 16.500-Credit-Limits. Noch 477,36 Credits bleiben in diesem internen Rahmen; das ist kein Plattformkontostand. Weitere Einzeljobs, volle Filmsegmente und ein fertiger Film sind dadurch nicht automatisch genehmigt oder finanziert. Die ursprünglichen vier Chorusjobs kosteten zusammen 10.471,68 Credits; beide Coco-Walkversuche jeweils 2.121, die Emmi-Korrektur 1.308,96. Eine neue Gesamtkostenrechnung liegt nicht vor.

Neu vorhandene Bilddateien umfassen B00–B14, B18, B21-Varianten, Telefonbühne und Chorcutouts; B15–B17/B19–B23 und eine vollständig konsistente Sequenz sind in diesem Nachweis nicht als vorhanden belegt. Auch B06/B08 haben eine kleine Telefonperspektiv-/Größenabweichung. Die Szenenbilder sind Schlüsselstills, keine kontinuierliche Filmbewegung. V17 bleibt in Produktion; natürlicher Vollcrewfilm und menschliche Gesamtwiedergabeabnahme sind offen.


### V17-Chor-Composite und Emmi-Nachkorrektur geprüft (18.10.2026)

Die vier unabhängigen Sprecherclips wurden auf einer gemeinsamen Bühne zusammengesetzt. Lokaler Clip `GradeCrew_V16_Chor_Teilprobe_Emmi_Mund_geschlossen.mp4`, 3.794.187 Bytes, SHA-256 `889862814a4e2aece2d3d67b7bb367058281aa376071004d31134434b23b2c6e`: 5 Sekunden, 1920×1080, 24 fps, 120 Frames. Der Composite ist tatsächlich vorhanden und zeigt alle vier Figuren gleichzeitig; **kein Chor-QA-Pass**, weil Emmi auch nach der einen Face-Crop-Korrektur in allen 120 Frames den Mund geschlossen hält. Coco/Remy/Wilma haben Mundbewegung, aber keine abgeschlossene phonetische Echtzeit-Abnahme. Der Folgejob `RBYeM9LOM5anMPvzprBB`/Session `USsAXqHv83imvXkQHnT5` ist abgeschlossen und hat die gemeldeten 1.308,96 Credits verbraucht; er löste den Fehler nicht.

Das Coco-Upright-Biped-Korrekturvideo ist weiterhin in Arbeit: Kling-Job `KQWvqEdEETPBSRV7b7qk`, Session `8ZogzGwEGmLQid3OEoUf`, 2.121 Credits gemeldet. Es ist nicht als eingegangen oder bestanden vermerkt. Der erste Walk bleibt abgelehnt.

Artagent hat einen lokalen Überblick und ein aktualisiertes Mapping erstellt: `production-art/overview/GradeCrew_V16_Artuebersicht.png` (2080×1304, SHA-256 `4cd89a96978c48fd1813a990df27d0ed6d9a964b99b23b6412c89dbc6ed7230c`), `production-art/art-manifest-v16.json` (26 eindeutige Bildassets, SHA-256 `affa32e7b0fccfc13ec3c67deb79aacf81d090020778adc598e97bb3fcc0c66f`). Das Mapping führt B00–B23 plus B01b, referenzierte Quellen und Ausschlüsse auf. Root prüfte ausgewählte Keys: B10-v2, B13-v2, B14, B18 und B21 bestanden einen statischen Identitäts-/Propabgleich. B13-alt und B11/B12 mit Größenversatz sind ausgeschlossen; B06–B08 haben weiterhin leichte Skalierungsabweichungen. Diese Teilprüfung bestätigt keine Bewegungskontinuität.

Ledgerstand: 7 gestartete Jobs, 16.022,64 Credits committed unter dem root-internen Limit von 16.500; 477,36 bleiben in diesem Durchgangsrahmen. Ein Plattformkonto-Restguthaben wird daraus nicht abgeleitet. Kein weiterer Job über die dokumentierte Coco-Korrektur hinaus ist zurückgekehrt; der natürliche Vollcrewfilm, vollständiger synchroner Chor und durchgehende 72-s-Abnahme bleiben offen.


### V17 Coco-Auftritt: kurzer aufrechter Gang bestanden; neue begrenzte Sprachclips autorisiert (18.10.2026)

Der zweite Coco-Gangversuch ist zurückgekommen: `video-production/raw/Coco-upright-walk-Kling.mp4`, 3.215.321 Bytes, SHA-256 `05f7c16656633adc2f2bbcb3c82882c908ef4e99fba4c4c0b96d09ab5327d23f`. Metadaten: 5,084 s, 122 Bilder, native 24 fps, 1916×1080, ohne Audiospur. Root prüfte die echten Kontaktbilder und akzeptierte den kurzen aufrechten Eintritt mit 2–3 sichtbaren Schritten; alternierende Kontakte sind um F32/F40/F48 zu sehen, Flossen bleiben vom Boden. Das ist ein lokales, begrenztes Gang-Teilresultat, keine acht Schritte, keine vollständige Coco-Telefon-/Sitzbewegung und kein Ganzcrewfilm. Der erste Walkclip (Flosse auf Boden, stehender Hinterfuß) bleibt als verworfener Versuch dokumentiert.

Die Emmi-Großgesichtskorrektur `RBYeM9LOM5anMPvzprBB` ist inzwischen abgeschlossen, 1.308,96 Credits gemeldet, ohne das Mundproblem zu beheben: alle 120 Frames bleiben geschlossen. Sie besteht daher weiterhin nicht als sprechender Chorclip. Der vorhandene Composite `GradeCrew_V16_Chor_Teilprobe_Emmi_Mund_geschlossen.mp4` bleibt ein sichtbarer Viererbild-Proof mit Emmi-Mund-QA-Fehler, nicht ein freigegebener Chor.

Root hat einen weiteren begrenzten Ausführungsrahmen autorisiert: neun non-Emmi-Sprachclips bei LTX 512 insgesamt 8.191,908 Credits (eine Generation je Clip) sowie ein materiell anders geführter fünfsekündiger Emmi-Open-Jaw-Test bis höchstens 1.310 Credits. Damit läge die geplante Obergrenze bei 25.523,508 Credits; Root-internes Gesamtlimit für diesen Schritt ist 25.600. Emmis Dialogzeilen L4/L6 sind erst nach einem funktionierenden Mundweg freigegeben; der neue Test beschränkt sich auf die Chorroute. Ein frischer Providerkontostand von 20.633 verbleibenden Startercredits wurde vor diesen künftigen Aufträgen geprüft. Das ist getrennt vom internen Arbeitslimit und kein Kauf/Top-up. Zum Zeitpunkt dieses Checkpoints waren diese neun Clips und der Emmi-Test noch nicht gestartet; bislang committed bleiben 16.022,64 Credits. Für fünf Körperclips wird nur eine Schätzung geprüft, kein Job ist autorisiert oder gestartet.

Die V16-Filmaufgabe bleibt offen. Der bestandene kurze Coco-Eintritt kann nur dann wiederverwendet werden, wenn er in einer späteren Gesamtkomposition ohne Identitäts-/Perspektivsprung passt; ein Einzelclip ersetzt weder den übrigen Körperablauf noch den vollständigen, natürlich synchronisierten Viererchor. Weitere Ergebnisse müssen einzeln mit ID, Kosten, Hash und echtem Sicht-/Decode-QA belegt werden.


### V17: Aktuelle Starts für Sprachclips und Emmi-Open-Mouth-Test (18.10.2026)


Der Nutzer hat die überarbeiteten Dialoge und die Ausführung freigegeben. Die ursprünglichen neun Audiodateien bleiben erhalten; dieser Batch ergänzt neue Takes für Coco-Schluss, Remy, Emmi, Wilma, den gemeinsamen Crew-Satz und Coco-Abschluss. Der Status bezieht sich auf tatsächliche Starts, nicht auf fertige Clips oder einen fertigen Film.

Sechs von neun vorgesehenen nicht-Emmi-Sprachjobs wurden mit je einem Take tatsächlich gestartet: L1, L2, L3, L7, L9 und der Crew-Cue. Die sechs Providerkosten im Ledger summieren sich auf 6.064,848 Credits. Erfolgreiche Starts und Generation-IDs: L1 9HQuQ8Ll9ewYkHicRDxM (Node EeBYDkfHxNVu5hLyEnuv, Session X91DifVFF7WhiM2KaRbO, 1.101,708 Credits); L2 InFmt5y8cnVhVzBFDhGq (Node QI1MS5NTPuE3cRpqsZjM, Session RuvvdIEWSVicHpFLrTSZ, 894,456); L3 2NqbqAy36w9iFSGCwLFw (Node DxQO5lFmPB6HWzTpuPy4, Session xaIiqgpzZt3HYdjGhKMU, 1.559,844); L7 ldPuD36ydqvEMpwQxPZE (Node g2sSyVGouj2o5LUBdtFZ, Session oue6cEM66R1LLKCHZmV8, 1.625,292); L9 1i7vhkw86E8rn7IKunM0 (Node S20RGVIwPpUx5oIQOrxq, Session jK6oErQcpPvTLK6ACRYE, 621,756); Crew-Cue 3upxnonBGAgiBzketAz0 (Node n3HMAlOZE0TL8BytpazI, Session cMUvvaxGIA59KS6ud6xY, 261,792). Drei weitere Nodes (L4, L6 und L8) scheiterten beim Start mit MongoDB-Transaktionsfehler „NoSuchTransaction“/fehlender Session: Fdgx8twI1LIz8EJCjQo6, J9xKAXsyIFw14SS4f88o und qyD3ykaZ92tscSozpqI0. Für diese drei Starts liegen keine Generation-/Session-IDs oder bestätigten Kosten vor. Sie werden nicht blind wiederholt; zunächst wird nur geprüft, ob doch ein Job existiert.

Zusätzlich wurde ein anders angelegter Emmi-Open-Mouth-Test gestartet: Generation UQaFOjFZStLAFSjJZHu0, Node Rf6l3boPcbyUA1LiQxcW, Session P4wBvnimjGD6AA54B3Fb, 1.308,96 Credits. Ergebnis und Mund-QA stehen aus. Die vorherige Emmi-Korrektur mit geschlossenem Mund bleibt als fehlgeschlagener Versuch dokumentiert. Die Emmi-Dialogzeilen L4/L6 sind weiterhin nicht freigegeben; dieser Test ist keine Freigabe für neue Dialogjobs.

Das Produktionsledger weist nun 14 tatsächliche Starts und insgesamt 23.396,448 Credits committed aus. Root-internes Limit dieses Durchgangs: 25.600 Credits; rechnerischer Rest 2.203,552 Credits. Das Limit ist weder Nutzerbudget noch Filmangebot. Der zuletzt bestätigte Providerkontostand von 20.633 Credits lag vor diesen neuen Starts und ist kein aktueller Kontostand. Es gab keinen Kauf oder Top-up. Die neuesten MP4-/WAV-Ergebnisse für sechs Sprachjobs und Emmi-Test sind zum Zeitpunkt dieses Checkpoints noch nicht eingegangen; deshalb werden weder Audio-Mix noch vollständige Animation als fertig behauptet.

Nächster Schritt: die gestarteten Jobs anhand ihrer IDs und der lokalen Startbelege abholen, tatsächliche Mediendateien/Hashes und Kosten dokumentieren und die drei Transaktionsfehler read-only auf vorhandene Doppelstarts prüfen, bevor irgendein Neustart erwogen wird. Keine PPTX-, Produkt-, Main-, STATE-, Release- oder Deployänderung.

### V17: Aktualisierter Ausführungsstand und offene Gates (18.10.2026)

Der zwischenzeitliche 6/9-Startcheckpoint ist überholt: nach read-only Prüfung der drei MongoDB-Fehler wurden die fehlenden Nodes jeweils einmal erneut gestartet. Damit sind alle neun vorgesehenen Sprachjobs gestartet; die ursprünglichen Transaktionsfehler und die Reissue-Historie bleiben im lokalen Ledger erhalten. Zusätzlich wurden fünf Körperclips mit je einem Take gestartet. Insgesamt meldet das Ledger nun 22 tatsächliche Starts und 36.128,508 Credits committed. Das Root-interne Limit für diesen Ausführungsabschnitt beträgt 36.150 Credits; der rechnerische Spielraum beträgt 21,492 Credits. Das ist ein internes Arbeitslimit, kein Nutzerbudget und kein Plattformkontostand. Providerkosten fehlgeschlagener oder unbrauchbarer Jobs sind nicht als abschließende Rechnung bestätigt. Kein Kauf oder Top-up.

Der Viererchor ist jetzt als tatsächliche gemeinsame Szene exportiert: outputs/gradecrew-investment-20261019/animation-v16-dialogue-production/GradeCrew_V16_Vier_Stimmen_Chor.mp4, 5 Sekunden, 1920×1080, 24 fps, 120 Frames, SHA-256 061f4c189905b23eb2c02b2519e8b7fb8e93fa98e0391e91f5f6e8b984772552. Root hat die dekodierten Bilder samt Emmi-Mundbogen geprüft: alle vier Figuren sind sichtbar und alle vier zeigen Mundbewegung. Das ist ein bestandener visueller Chorus-Test, keine Behauptung perfekter Phonem-Synchronität oder einer menschlichen Echtzeit-Wiedergabeabnahme.

Die neun LTX-512-Sprachclips zeigen überwiegend geschlossene Münder; ein Clip für Wilma L9 ist beschädigt und ausgeschlossen. Daher besteht der native Lippensynchronitäts-Gate für diese Clips nicht. Root hat stattdessen die kontrollierte lokale Unterkieferanimation aus passender offener/geschlossener Kunst freigegeben. Ein erster Coco-Closed/Open-Nachweis wurde visuell als brauchbarer Mechanik-Proof bewertet; die übrigen Zeilen sind damit noch nicht automatisch repariert oder abgenommen.

Bei den fünf Körperjobs bestanden Emmi- und Wilma-Eintritte die Root-Sichtprüfung für sichtbare Schritte. Der erste aufrechte Coco-Gang bleibt ein früherer begrenzter Pass von 2–3 Schritten, kein vollständiger Lauf. Der Remy-Providerjob ist blockiert und wird nicht wiederholt. Die Telefon/Rüssel-Aktion fiel durch: grauer statt korrekter rüsselartiger Kontakt, Telefon schwebte und die Aufnahme passierte vor dem Greifen; diese Ausgabe wird ausgeschlossen. Eine lokale kontrollierte Kontakt-/Rüsselbewegung und weitere Szenezusammensetzung sind in Arbeit. Das Auftreten eines einzelnen bestandenen Bild-/Bewegungstests bedeutet keinen bestandenen Gesamtfilm.

Der aktuelle Bildbestand enthält 32 eindeutige PNG-Dateien und 25 Boundary-/Support-Mappings. Die überarbeitete Übersicht liegt lokal unter outputs/gradecrew-investment-20261019/animation-v16-dialogue-production/production-art/overview/GradeCrew_V16_Artuebersicht.png (2080×1630, SHA-256 105b06b1c4ab361c03ab021aee0d54943e5058115e91591db447d65058d20007); das Manifest production-art/art-manifest-v16.json hat SHA-256 46674d19c91d86b2900d29504fcfa9d24493873946a12bbae8ebaa615a948f85. Die Bilder sind Einzelkeys/Support-Assets und kein Beleg für kontinuierliche Ganzcrew-Bewegung.

Status bleibt offen: vollständiger natürlicher Crewfilm mit korrekter Telefon-/Rüssel-Kontinuität und geprüfter synchroner Sprache liegt nicht vor. Nächster Schritt ist die lokale Unterkiefermechanik in der Szenenkomposition zu verifizieren, die beschädigte/geschlossenen Mundtests nicht als Pass zu behandeln und nur anhand tatsächlich dekodierter Frames sowie Audiovergleich über weitere Segmente zu entscheiden. Keine PPTX-, Produkt-, Main-, STATE-, Release- oder Deployänderung.

### V7 Crew-Intro und finale hybride Filmfassung (19.10.2026)

Die neue lokale Präsentation `outputs/gradecrew-investment-20261019/files/GradeCrew_Erstgespraech_20261019_v7_crewintro_validated.pptx` baut auf der freigegebenen V5-Datei auf und ersetzt ausschließlich das Cover durch das 72-Sekunden-Crew-Intro. Sie enthält 14 Folien und 14 Notizen. Paketprüfung: alle Folien 2–14 und sämtliche Notizen sind byte-identisch zu V5; nur `[Content_Types].xml`, `ppt/slides/slide1.xml` und dessen Beziehungen änderten sich, dazu kamen Video und Poster. Das eingebettete Video stimmt per SHA-256 mit der freigegebenen Filmdatei `outputs/gradecrew-investment-20261019/animation-v16-dialogue-production/GradeCrew_Crewintro_24fps.mp4` überein: `f6449248777729c080b833ac7024b76c56645406ec710616aa8815f9087c04ac` (53.938.479 Bytes; 72 s; 24 fps; 1.728 Frames; 1280×720). Die Folie ist für automatischen Start bei Verzögerung 0 und Halten des Schlussbilds verdrahtet. Der erste Cover-Render zeigt Film, Logo und Titel ohne erkennbare Überdeckung; Proof: `outputs/gradecrew-investment-20261019/build/v7-preview/cover.png`.

Der Film ist die von Root geprüfte hybride Präsentationsfassung mit nativen Charakterclips und lokal komponierten Kontakt-/Unterkieferbewegungen. Das ist kein Anspruch auf perfekte Kinoanimation oder exakte Phonemsynchronität. Die Strukturprüfung des PPTX besteht; native Wiedergabe in PowerPoint wurde wegen der gesperrten Mac-Oberfläche nicht verifiziert. Die Vorschau ist kein menschlicher Echtzeit-Wiedergabe- oder Audiohörtest.

Das Produktionsledger meldet 22 gestartete Anbieterjobs und 36.128,508 Credits committed; das ist keine bestätigte Endabrechnung. Die separat zuletzt sichtbare UI-Restmenge war 2.648 Credits; eine Erstattung des fehlgeschlagenen Remy-Jobs ist unbestätigt. Es gab keine weiteren Anbieterstarts oder Käufe für diesen Deckschritt. Für künftige Sprachjobs gilt die dokumentierte Lehre, Auflösung und Mundbewegung erst je Figur in einem passenden Proof zu validieren, bevor mehrere Clips gestartet werden.

Status: lokale V7-Präsentation erstellt und strukturell geprüft; nativer PowerPoint-Start offen. Keine Main-, Produkt-, Release- oder Deployänderung.


### GC-FINANCE-BAYSTARTUP-20261008 — PowerPoint autoplay diagnosis (19.10.2026)

A separate native-PowerPoint diagnostic copy of V7, `outputs/gradecrew-investment-20261019/native-powerpoint-tests/V7_timing-sequence-test.pptx` (SHA-256 `51013a52a02bfcc0e158404faa517ed42285d1a7054a96b67e129fb2da49e322`), visibly progressed from the opening Coco shot to later Coco+Remy footage on two starts. It differs from source V7 only by wrapping the same delay-0 video node in a V6-style `mainSeq` timing sequence; V7's original slide-1 video node is directly under `tmRoot`. This is a likely cause of intermittent playback, not proven causality. CUA timings were unreliable; the previous “about 2.5 seconds” scene timing is withdrawn. Audio was not heard. V7 visual quality remains user-rejected.

Next: after corrected-film QA is accepted, create a new versioned cover-only deck with sequence timing, retain V5 slides 2–14 and all notes byte-identical, and test that actual deck in native PowerPoint. Audio remains separate until audibly verified. Full test detail: `outputs/gradecrew-investment-20261019/native-powerpoint-tests/v7-native-playback-2026-10-19.md`. No PPTX was changed in this diagnostic step; the temporary copy is not a deliverable.


### V8: korrigierter Film, Cover-only-Deck und nativer Autostart (19.10.2026)

Die freigegebene V17-Datei ist `outputs/gradecrew-investment-20261019/animation-v17-cleanup/GradeCrew_Crewintro_24fps_bereinigt.mp4`: SHA-256 `4e6ccf7e4a9aeb13b408cda63ed8e6764e6fc0b4eeee9322a3c541057fe238f1`, 46.858.134 Bytes, 62,583333 s, 1.502 Frames, 24 fps, 1280×720. Diese Version ersetzt den zurückgezogenen Export `4f2eca…`; der Emmi-Nasenankerfehler wurde korrigiert und die 28 Blink-/Mundzustände visuell geprüft. Die Film-QA nennt 12 erhaltene Sprach-PCM-Bereiche, 12 AAC-Ereignisse ohne Versatz und 15 Rhubarb-Cues. Das sind akustisch geschätzte tierische Kieferformen, keine perfekt menschlichen Phoneme. Die Präsentation verwendet einen stilisierten 2D-Hybrid mit sichtbaren Pose-/Szenenwechseln.

Neue Datei: `outputs/gradecrew-investment-20261019/files/GradeCrew_Erstgespraech_20261019_v8_crewintro_autoplay.pptx`, SHA-256 `3ceceaa58001a1aa8d24e7f83c865788e70afea4ef61581912c8f67afa58e27f`, 52.280.318 Bytes. Sie basiert auf dem beibehaltenen V5-Deck und ändert nur das Cover: GradeCrew-Logo/-Wortmarke bleiben im oberen Band; das Video ersetzt die vier statischen Coverfiguren. Die Paketprüfung bestätigt 14 Folien und 14 Notizen; Folien 2–14 sowie alle Notizen sind byte-identisch zu V5. Das eingebettete MP4 stimmt exakt mit der oben genannten V17-Prüfsumme überein. Das Cover besitzt die `seq/mainSeq`-Sequenz mit Verzögerung 0 und Halten des Schlussbilds. Audit: `outputs/gradecrew-investment-20261019/native-powerpoint-tests/v8-package-audit.json`; sichtbarer Cover-Render wurde in PowerPoint geprüft.

In Microsoft PowerPoint wurde genau diese V8-Datei zweimal vom Anfang gestartet. Nach Wechsel von der Referenten- in die eigentliche Bildschirmpräsentationsansicht lief das Covervideo jeweils sichtbar weiter, ohne Folien-Weiterschalten: zuerst vom Coco-Start zu späteren Telefon-/Remy-Bildern, beim zweiten Start zu einer späteren Coco-/Telefonpose. Die CUA-Latenz erlaubt keine belastbare Zeit- oder Frameangabe. Damit ist sichtbarer nativer Autostart zweimal beobachtet. Audio wurde nicht hörgeprüft und bleibt insofern unbestätigt; es gibt keinen Screenshot-Export als lokale Datei. Testnotiz: `outputs/gradecrew-investment-20261019/native-powerpoint-tests/v8-native-playback-2026-10-19.md` (SHA-256 `4ef7ea829ccf9a3520f10137b9c1b24ca618602f87aad420daa386c6eed5df3f`).

Keine weiteren Medienanbieteraufrufe oder Käufe für V8. Die vorherige V7-Ablehnung bleibt als Historie erhalten; V8 ist ein neuer Cover-Kandidat, und eine persönliche Qualitätsabnahme durch den Nutzer ist nicht behauptet. Das Produktionsledger meldet weiterhin 22 gestartete Aufträge und 36.128,508 Credits committed; dies ist keine bestätigte Endabrechnung. Der separat zuletzt sichtbare UI-Restbetrag von 2.648 Credits ist kein Beleg für tatsächliche Gesamtkosten; die Erstattung des fehlgeschlagenen Remy-Auftrags ist unbestätigt. Keine Änderung an Main, Produktcode, Release-Status oder Deployment.


### GC-FINANCE-BAYSTARTUP-20261008 — V18 nur Remy-Gang und Cocoeinstieg (19.10.2026)

Der Nutzer begrenzt die nächste Filmkorrektur auf Remys Gang und Cocos Einstieg; der Rest von V17 soll unverändert bleiben. Motion prüft Assets und Schätzung zuerst. Noch kein neuer Job, kein V18-Film und keine freigegebene Anbieterausgabe. V8-Deck bleibt bei SHA-256 `3ceceaa58001a1aa8d24e7f83c865788e70afea4ef61581912c8f67afa58e27f`; V17-Film bleibt bei `4e6ccf7e4a9aeb13b408cda63ed8e6764e6fc0b4eeee9322a3c541057fe238f1`, bis Root einen Ersatzfilm freigibt. Erst nach diesem Film-Gate ein V9-Cover-only-Deck erstellen, mainSeq-Autostart sowie Folien 2–14 und Notizen unverändert erhalten und nativen Start neu prüfen.

Budgethistorie bleibt: 22 gestartete Providerjobs, 36.128,508 Credits als Ledger-Summe (keine bestätigte Endabrechnung); letzter UI-Restbetrag 2.648 Credits ist nicht aktuell. V18 hat keine neuen Starts/Käufe. Live-Audit run 39259533166 meldete den Branch als nicht klassifiziert, ohne PR-Suchergebnis; Vergleich mit main +172/−155. Details und nächste Schritte: `workstreams/baystartup-financing-20261008.md`.


### GC-FINANCE-BAYSTARTUP-20261008 — V18 zwei Starts: Remy da, Coco ausstehend (19.10.2026)

Root gab zwei Runway Gen-4 Turbo Takes frei (je 909 Credits, zusammen 1.818). Remy-Generation `REQoGsqepU01dwAIhJ6f` / Session `H6G2YKI4ZgprGpGdcLTK` ist zurückgekehrt (3,0417 s/24 fps); Root sah verbesserten Gang, noch kein Film-Integrationsgate. Coco-Sitzen Generation `GGDVK6JakGlmcFpwuqxF` / Session `Jjh9qunAfR5MMbI1Ap2P` läuft noch. Keine weiteren Takes/Käufe freigegeben. Kling-Fehlertext dokumentiert; kein Retry desselben Jobs.

Gemeldeter Ledgerstand 24 Starts / 37.946,508 Credits committed, keine bestätigte Schlussrechnung. UI-Restbetrag 2.648 ist veraltet; 830 ist nur Rahmenrechnung, kein bestätigter Kontostand. V8/V17 bleiben unverändert. Nächster Schritt: Coco-Ergebnis read-only abholen und tatsächliche QA/Hash festhalten, danach Root-Filmgate; erst nach Freigabe V9-Cover-only bauen. Details: `workstreams/baystartup-financing-20261008.md`.


**V18-Remy Nachtrag:** Der zurückgekehrte Remy-Clip hat SHA-256 `f5f6451468ba430a390e8a881187ae3673628cfe12e3158a0c8b6f00e1f85afd` (1280×720, 24 fps). Die lokale 2-s/48-Frame-Probe `remy-proof/motion-with-audio.mp4` wartet auf Root-Prüfung; nicht als Gesamtfilm-Pass werten. Exakte Generation-ID `REqoGsqepU01dwAIhJ6f`. Coco-Job war zuletzt pending.


### GC-FINANCE-BAYSTARTUP-20261008 — V9-Filmtausch im Cover (19.10.2026)

V18 wurde nach Root-Freigabe in einer neuen Deckversion eingesetzt: `outputs/gradecrew-investment-20261019/files/GradeCrew_Erstgespraech_20261019_v9_crewintro_autoplay.pptx`, SHA-256 `922cf6456f3bcc5ef59d16ff8c260aa2361cc716d6e06824527568b6d1661aa0`, 52.158.333 Bytes. Die Ausgangsdatei V8 wurde vorher frisch geprüft. Der Paketvergleich bestätigt 14 Folien/14 Notizen; exakt ein ZIP-Bestandteil änderte sich: `ppt/media/media1.mp4`. Alle übrigen Einträge einschließlich Coverlayout/-poster/-Timing, Folien 2–14 und sämtlicher Notizen sind byte-identisch zu V8. Das eingebettete MP4 ist exakt V18 SHA-256 `80f1ca0985f909d92c1ffed42572906b1d001a4f770183dfb5b3217e553aa3b4` (46.851.396 Bytes; 62,583333 s; 1.502 Frames; 24 fps; 1280×720). MainSeq-Autostart bleibt erhalten.

Microsoft PowerPoint zeigte beim nativen Start der neuen V9-Datei zweimal sichtbare Bewegung innerhalb von Folie 1; kein Folienwechsel wurde beobachtet. Das belegt den visuellen Autostart in diesen zwei Starts. Audio wurde nicht hörgeprüft. Ein separater lokaler Screenshot dieser UI-Starts wurde nicht gespeichert; der Paket-/OOXML-Audit ist unter `outputs/gradecrew-investment-20261019/native-powerpoint-tests/v9-package-audit.json` dokumentiert. Keine belastbare Zeit-/Frameangabe aus der CUA-Latenz ableiten.

Der V18-Film ändert nur Coco F0–116 und Remy F317–364 gegenüber V17; die übrigen 1.337 Quellbilder sowie die vollständige Audiospur sind byte-identisch. Root hat den Film und kritische Kontaktbilder unabhängig geprüft. Begrenzung: stilisierte hybride 2D-/Poseanimation, keine behauptete perfekte Kinoanimation oder exakte menschliche Phonem-Synchronität; Remys Gang endet mit einem sichtbaren Posewechsel in die sitzende Dialogpose, nicht mit einer natürlichen Hinsetzbewegung. Eine persönliche Qualitätsabnahme durch den Nutzer ist nicht behauptet.

Der Ledgerstand bleibt 24 Providerstarts und 37.946,508 gemeldete Credits committed (22 frühere Starts/36.128,508 plus zwei V18-Starts/1.818). Das ist keine bestätigte Schlussabrechnung. Zuletzt sichtbare UI-Restmenge 2.648 Credits ist nicht frisch; 830 Credits sind nur rechnerischer Rahmenrest, keine belegte Kontobalance. Keine weiteren Starts oder Käufe. Keine Main-, Produkt-, Release- oder Deploymentänderung.

# Aufgabe: GC-AUTOMATION-08

- Aktualisiert (UTC): 2026-10-05 19:28
- Verantwortlicher Chat / Auftrag: Weiter mit GradeCrew nach einem Chat-Abbruch; Martin: automatische Phasenkette auf weitere Aufgabenarten erweitern und Staging-Rückstand prüfen.
- Chat-Bezeichnung / Link: aktueller Recovery-Chat; Link unbekannt.
- Vorheriger Chat: Main GC (w); Quellenvertrags-Recovery separat über PR #125 gesichert.
- Arbeitszustand: aktiv; Spec und Plan freigegeben; Inline-Implementation aktiv; Escape-Deploy erfolgreich verifiziert.
- Aufgabenbranch: docs/guardian-admission-profiles-20261004
- Basiscommit: ced8e6dbe1cec5215edeb88b551afc363fe634cc
- Integrationsziel: main
- PR: siehe PR dieses Aufgabenbranches; noch nicht integriert.
- Betroffene Dateien: feste Controller-/Profil-/Validator-/Workflow-/Testdateien, Spec/Plan/Audit/Übergabe/TODO/Registry; Release-State nur eigene GC08-Stufe und belegte historische Escape-Komponenten.
- Überschneidungen: zentrale TODO/Registry; PR #65 betrifft GC-AUTOMATION-09 bis -11, bleibt getrennt. Controller-Dateien geändert; keine Produktdatei oder andere Workstream-Implementation geändert.

## Maßgeblicher aktueller Stand — 2026-10-05 19:28 UTC

GC-AUTOMATION-08 bleibt derselbe Auftrag/PR126. Plan/Inline-Ausführung freigegeben, Games-Testseite für getrennte Tests/Veröffentlichungen erlaubt; Haupt-App-/Seiten-Zusammenführung zurückgestellt. Kein neuer Paid-Call, keine Queue-Zulassung/Reservation, kein Deploy/IAM-Eingriff in diesem Implementierungsblock.
Tasks 1/2/4/5 implementiert und lokal getestet. Task3-Qualifikation bleibt offen: alle 36 Originaltests byte-identisch, 35 bestehen, M1.4-Timingtest rot; lokaler Browserstart sandboxbedingt blockiert. Rehearsal-CI prüft Games-Kontrakte und Browser getrennt und kaschiert den Fehler nicht. app.js 81,638 Bytes passt nicht in den unveränderten 80,000-Byte-Quellvertrag; enger CSS/HTML-Auftrag wäre erst nach übrigen Gates zu beurteilen. Kein Budget erhöht.
130 Automation-Tests unter Node22.23.3/Python3.12 bestehen. Reale Controller-/Publisher-Funktionen liefen offline von Reservation über Fake-Build/alle drei Reviews/FF/CI/Fake-Hosting/Receipt; keine externen Provider-/Cloud-Mutationen. Erfolgs-Receipt erlaubt nur technischen separaten Hosting-Stand, nie menschliche Abnahme.
Aktuelles main 8360bc5 normal zusammengeführt (Classroom/ASV-Privacy und Hero-Dokumentation erhalten). Ledger frisch gelesen: Pilot zwei alte Reservationen à0.85, v2/v3/v4 je2.40 unverändert, keine neue Reservation. v2/v3 gestoppt/unklar, v4 repairable bleibt unverändert.
Remote vor nächstem Checkpoint 1f0883: Web-Rehearsal 37324017708 grün; Stage Guardian 37324017065 wegen neuer relativer Importstelle beim direkten Scriptaufruf rot. Reproduziert im neuen Test und behoben; erneute CI am neuen Controller nötig, alter Erfolg wird nicht übertragen. Code lokal bis 8559757 committed, anschließend neues Task6-Diff; letzter gesicherter lokaler Main-Merge a207325.
Nächster Schritt: diesen Code/Übergabe committen/pushen, unabhängige gesamte Branch-Review und aktuelle CI auswerten. Games-Profil/Publisher standardmäßig aus; tatsächlicher manueller Publisher hat noch andere Concurrency und blockiert vor Cloud-Login. Hosting-Identität unverifiziert; Backend/Rules/Games-AI/Native weiterhin geschlossen.

Die folgenden ursprünglichen Checkpoints sind historische Versuchshistorie; dieser aktuelle Abschnitt entscheidet bei abweichenden älteren Aussagen.

## Ziel und gewünschtes Verhalten

Weitere Aufgabenarten durch dieselbe belegbare Phasenkette führen, mit eigenen unveränderlichen Zulassungs-, Test-, Review- und Staging-Gates. Bestehende Aufgaben/Kandidaten erhalten und Release-Rückstand anhand tatsächlicher Nachweise einordnen.

## Umfang / nicht verändern

Dieser Commit sichert Audit und empfohlenen Zuschnitt, keine Implementation und keine neue Zulassung. Keine Production-, IAM-, Secret-, Budget-, Provider- oder Deploy-Änderung. GRADECREW_STATE.json nicht pauschal überschreiben. Backend/Rules/Games/iOS bleiben bis eigenen vollständig belegten Profilen gesperrt.

## Akzeptanzkriterien

Bestandsaufnahme trennt deployed/CI/Review/Geräteabnahme. GC-AUTOMATION-08 bleibt dieselbe ID. Profilentwurf bewahrt drei unabhängige Reviews, ursprüngliche Gesamtbudgets und Ownership; kein unbekanntes Provider-Ergebnis wird wiederholt.

## Zwischenstand

- Lokal geändert: keine Produktdateien; Vorbereitung über GitHub-Connector.
- Auf GitHub gesichert: Commit dieses Branchs mit Audit, TODO und Registry-Zuordnung.
- Geprüft: main ced8e6d; Development Status 37233003312; offene PRs/Branches; Run-/Job-/Deploy-Logs und aktuelle Gateway/Games/Telemetry/Native-Übergaben. Konkrete Quellen und Gate-Grenzen im [Audit](../docs/STAGING_BACKLOG_2026-10-04.md).
- Deployed: nichts durch diesen Auftrag. Gateway ist bereits auf vier Providern Staging; zentrale alte Übergabe ist überholt. L3 ist neuer als Retro-V2-Preview.
- Gerätetest: keiner durch diesen Auftrag; TestFlight-Erfolg ist keine Geräteabnahme.

## Offene Probleme und Unsicherheiten

Martin hat die Weiterarbeit „alles ready“ beauftragt; vorgeschlagener Zuschnitt zur schriftlichen Ausarbeitung übernommen. Konkrete Spec von Martin ausdrücklich freigegeben; Implementierungsplan/Implementation noch offen. Freitext-Klassifizierer 9/9 lokal grün (Node24); keine Browser-/Emulatorfreigabe. Escape secrets.get bestätigt, tatsächliche Deploy-SA via read-only Cloud-Troubleshooter bestätigt: gradecrew-github-staging@hausaufgabe-staging.iam.gserviceaccount.com; Allow-Bindung secrets.get fehlt am existierenden OPENAI_API_KEY. Browser-Zugriff vorhanden; konkrete Secret-Viewer-Bindung von Martin freigegeben und am einzelnen Secret gespeichert (Cloud: Richtlinie aktualisiert, Keine Übernahme). Noch kein Deploy; Propagation-/Kandidaten-/Workflowcheck offen.
Secrets/Token-Präsenz und Apple-Verarbeitung/Gerätestand nicht belegbar. Secure-Preview scheitert in 36870114409 an integrierten DOM-Verträgen; Escape-MVP in 37021633218 an Secret-Manager-403. Diese Blocker nicht blind wiederholen.
18 aktive Workstreams/neun mögliche Dateiüberschneidungen; einzelne historische Branches sind weit hinter Zielständen. Keine pauschale Integration.

## Nächster konkreter Schritt

[Schriftliche Spezifikation](../docs/superpowers/specs/2026-10-04-guardian-admission-profiles-design.md) ist von Martin freigegeben; [Implementierungsplan](../docs/superpowers/plans/2026-10-04-guardian-admission-profiles.md) prüfen und Execution-Methode wählen. Unabhängige Fehlerdiagnosen sind im Audit gesichert.

## Wiederaufnahme nach Abbruch

- Letzter gesicherter Teilschritt: Audit und empfohlener Zuschnitt, 2026-10-04 21:06 UTC.
- Gepushter Codecommit / Remote-Branch: kein Produktcode; Dokumentationscommit dieses Branchs.
- Ungesicherte Änderungen / Checkout: keine Produktänderungen; projektloser Chat, GitHub-Connector genutzt.
- Laufende oder unklare Vorgänge: kein neuer Guardian-/Deploy-/Providerlauf gestartet. Bestehende v2/v3-Providerunklarheit im Audit erhalten.
- Bereits ausgeführte externe Aktionen / Kostenreservationen: nur GitHub-Reads und dieser Dokumentationscheckpoint; keine neue API-Kostenreservation.
- Was darf noch nicht als erledigt gelten? GC-AUTOMATION-08, Zulassung neuer Aufgabenprofile, neue L3-/PostHog-/Security-Deployments und menschliche Abnahmen.
- Was vor Wiederholung prüfen? Aktuelles main, Branch/PR dieses Checkpoints, aktuelle Ledger/Actions und Kandidaten; identischen Audit/Branch nicht neu erzeugen.
- Genau ein nächster ausführbarer Schritt: den schriftlichen Implementierungsplan prüfen und Execution-Methode auswählen.

Vor Übernahme [../docs/CHAT_RECOVERY.md](../docs/CHAT_RECOVERY.md) lesen.

## Externe Fortsetzung vorab gesichert

Secret-Viewer ausdrücklich freigegeben und gespeichert; Policy Troubleshooter bestätigt wirksames secrets.get. Aktueller Escape-Head a7ffc382 unverändert, Run 37021633218/Attempt1 completed failure, keine aktiven/queued Jobs. Geplant: nur fehlgeschlagenen Job dieses Runs unter dem bestehenden Weiterarbeitsauftrag fortsetzen; Ziel ausschließlich generateEscapePreview + gradecrew-escape-dev in Staging. Ergebnis/Attempt2 nach API-Aufruf sofort sichern, keinen unklaren Start wiederholen. Keine Provider-Testanfrage.

Externer Start bestätigt: bestehender Run 37021633218, Attempt 2, Status in_progress, Quelle a7ffc382128c49b418a79c31812f88e7fe0fd3d2; GitHub-API success. Deployment-Ergebnis offen, nicht erneut starten.

### Escape-Fortsetzung abgeschlossen — 2026-10-04 21:28 UTC

[37021633218, Attempt 2](https://github.com/HerrLoeffler/Hausaufgabe/actions/runs/37021633218) completed/success am unveränderten Source a7ffc382128c49b418a79c31812f88e7fe0fd3d2; Job 111534877678. Unter Node22: 41 Escape-Tests und 105 Functions-Tests bestanden. Secret-Metadatenblocker gelöst. CLI meldet Successful create operation für generateEscapePreview(europe-west1), danach Deploy complete; Hosting-Channel gradecrew-escape-dev erfolgreich, Ablauf 2026-11-03T21:25:55Z.
Preview: https://hausaufgabe-staging--gradecrew-escape-dev-mpuh7wg1.web.app . Read-only Browser-DOM bestätigt „Die verriegelte Schule“, drei Räume/acht Lernfragen/vier Minirätsel und Einstieg. Keine Vorbereitung/Generierung gestartet. Die direkte Function-GET-Prüfung war im Browser durch ERR_BLOCKED_BY_CLIENT blockiert; dies ist kein Serverfehlernachweis und wurde nicht umgangen. Kein tatsächlicher Generator-/Provider-E2E-Test.
CLI führt die übliche Runtime-Secret-Bindung für 950775032930-compute aus; dieselbe Secret-Accessor-Bindung war schon vor der Änderung sichtbar. Agent hat ausschließlich die ausdrücklich freigegebene direkte Viewer-Bindung ergänzt; kein Secret-Payload gelesen.
GRADECREW_STATE.json wird in diesem PR für games-escape und zwei getrennte Preview-Komponenten aktualisiert. Kein Bestandteil des gemeinsamen Web-Release-Batches, keine Rules- oder Production-Änderung. Das Legacy-Workflowlog ist Deploynachweis, besitzt aber noch kein neues kryptografisches Guardian-Paket-/Receipt-Profil. Geräteabnahme und drei neue Profilreviews bleiben offen. Versuch 1 und ältere Läufe bleiben in previous_observation erhalten.

## Implementation checkpoint — Task 1

Martin hat Plan/Inline-Umsetzung freigegeben. Games bleiben getrennt von Haupt-App/Seite; separate Games-Testseite darf weiter genutzt werden. Keine Zusammenführung autorisiert. Eigener lokaler Checkout des bestehenden PR126-Branches, aktuelles main 7b5b322 normal zusammengeführt (PostHog/BugOps erhalten). Live Development Status 37237576635 geprüft: 19 aktive Workstreams, 12 Überschneidungen; keine andere GC08-Implementation gefunden. Profilresolver und explizite Admission-Grenze implementiert, Games weiterhin standardmäßig aus. RED: drei neue Profiltests fehlten. GREEN: 108 Automation-Tests bestanden; Node24 lokal, kein Node22-/Deploy-/Human-Nachweis. Keine Queue-/Ledger-/Budget-/Provider-/Cloud-Aktion. Nächster Schritt: Lifecycle/CI-Profilbindung.

Task 2 local checkpoint: explicit separate-target routing in prepare/build/publication/review/integration/CI; profile-bound ownership before writes, existing Web control guard unchanged. 110 automation tests passed. New workflow routing follows with actual Task3 validator to avoid dangling reusable workflows. No paid call/deploy. Next: trusted Games fixtures/packaging/CI.

## Aktueller Recovery-/Implementierungsstand — 2026-10-05

Task-ID unverändert GC-AUTOMATION-08, verantwortlicher Chat Main CODEX (w), 01a1089e-bbae-74c2-9a6a-6ce71fb3dba7. Plan und Inline-Execution freigegeben. Separate Games-Testseite darf weiter testen/veröffentlichen; Integration in Haupt-App/Seite ist ausdrücklich zurückgestellt.
Main d59059c normal integriert, Classroom- und BugOps-Einträge im Registry-Konflikt gemeinsam erhalten. Development Status 37280956629 geprüft. PR126 Remote vor diesem Checkpoint 65a6496; Task2 lokal 9a3d839, Main-Merge 6bf8f3b.
Task1/2 umgesetzt. Task3: credentialfreier Validator, unveränderte pinned Fixtures, physische Hash-/Paketgrenzen, Browser-Smoke und getrennte reusable Games-CI implementiert. 114 Python-Automationstests bestanden unter Node22.23.3/Python3.12. Kein bezahlter Provider-, Queue-, Budget- oder Deploy-Aufruf.
Games-Qualifikation bleibt ROT: tatsächlicher Snapshot hat 36 Tests, 35 bestehen, M1.4 learning timers erwartet alte 850/650/500 statt L3 1050/700/550. Kein Test geschwächt. Original Builder separat bestanden; Browserprozess lokal durch Sandbox SIGABRT/EPERM blockiert, kein Browser-Erfolg behauptet. Zusätzlich aktuelle app.js 81,638 Bytes > unverändertem 80,000-Byte-Kontextlimit: kein Pilotvertrag aufgenommen.
Neue Profile/realer Publisher bleiben aus. Diese Blocker verhindern Aktivierung; die unabhängigen Controller-/Review-/Receipt-Adapter können weiter implementiert werden. Nächster Schritt: exakte Profil-/Paketbindung aller drei Reviews und integrierte Games-CI, danach Hosting-Receipt-Reconciliation ohne Veröffentlichung.
Historische Escape-Preview-Fortsetzung vom 04.10. bleibt unverändert, keine Wiederholung. Neuere Web-/BugOps-Deployments gehören nicht zu diesem Auftrag.

Task4 checkpoint: legacy Web review/report shapes remain compatible. Games now binds all three reviewer responses to profile+package digests, explicit target and exact candidate; integrated CI selects Web/Games and emits component-specific receipt. 116 automation tests passed; no paid review/FF/deploy run. Task5 receipt-verifier negative tests passed; live publisher/setup/channel ownership remain unwired/disabled. Existing Games qualification blockers retained.

Task5 implementation: main-only trusted artifact extraction, setup/identity gate, actual legacy publisher concurrency check, before-login/before-publish rechecks, fixed Hosting-only CLI and REST Hosting version + downloaded raw-byte verification. Receipt ties task/profile/control/CI/deploy attempts/package; reconciliation reuses exact existing receipt and does no blind dispatch/retry. Common group uses cancel-in-progress=false. Existing legacy Visual publisher still differs and blocks BEFORE cloud login; WIF identity qualification also unverified. No IAM/policy changes or cloud operation. 124 automation tests passed before final resume test; targeted Task5 suite green (see current task ledger). Node validation now clears child credentials and requires a separate unprivileged CI user. No candidate script executes with cloud credentials.

## Review-Fix-Checkpoint — 2026-10-05

Unabhängige Gesamt-Branch-Review (gpt-6-astra, lokaler Head6e04bc6, identischer Remote18d6514-Tree) abgeschlossen: zwei neue Befunde, keine ausgeschlossenen Prüfpunkte/Minor-Befunde. P1: getrennte UID blockiert Temp-Paket-Bereinigung. P2: bekannte Syntax-/Test-/Build-/Browserfehler verlieren ihr gebundenes Fehlerartefakt. Beide Ursachen geprüft und in EINEM Fix-Pass bearbeitet: Besitz des festen temp/build ohne Symlink-Dereferenzierung im finally zurückholen; bounded candidate/profile-bound failure/blocked evidence schreiben und Browser-Misserfolg überschreibt vorherigen Erfolg.
RED→GREEN lokal: Ownership-Grenztest führt echten Node/Test/Builder aus und modelliert ausschließlich die nicht verfügbare sudo/UID-Ressourcengrenze; Syntaxfehler und Browser-Ergebnisüberschreibung separat reproduziert. 134 Tests, OK mit einer ausdrücklich übersprungenen tatsächlichen Linux-UID-Prüfung. Zusätzlicher Linux-CI-Test prüft echte Benutzertrennung über rein synthetische Fixture, ohne den originalen Games-Vertrag zu ändern oder als bestanden auszugeben. Originale 36 Games-Tests bleiben byte-identisch und 35/36 rot.
Remote18d-Läufe abgeschlossen: Games-Rehearsal37364456260 failure (Originaltest); controller111946214005 und browser111946213837 cancelled, deren Logs404/kein Nachweis. Stage37364456188, Status37364456213, Handoff37364456385 und Web-Rehearsal37364456783 ebenfalls geschlossen/failure mit abgebrochenen Hauptjobs, keine aktuelle positive Controller-/Web-/Browserprüfung. Dieser Chat hat keinen Lauf abgebrochen oder rerun gestartet. Grund der fremden Abbrüche ist nicht belegt.
Nächster Schritt: Fix-Code und diese Übergabe committen/pushen; neue CI ausschließlich für diesen geänderten Controller auswerten, tatsächlichen Linux-UID-/Browser-/Web-Nachweis sichern. Keine erneute Gesamt-Review oder Paid-Runde. Neue Games-Zulassung/Publisher und Production bleiben aus.

## CI-Fortsetzung am geänderten Controller — 2026-10-05

Remote29e8559: reale Linux-UID-/Controllerprüfung im Job111955005361 grün (134 Tests, einschließlich echter getrennter UID). Damit P1-Bereinigung tatsächlich bestätigt. Browser111955005547 scheiterte vor UI an unzugänglichem Prüfskript im privaten Runner-Checkout. Feste Browser-Dependencies und readonly Probe/Paket werden nun in zugängliche /tmp-Verzeichnisse gelegt; keine HOME-/Cloud-/User-Credentials weitergegeben. Trusted Builder läuft ebenfalls aus der readonly Scratch-Kopie.
Stage37367167217 zeigte einen dritten deterministischen CI-Fehler: stale-control Reportzeile ohne taskId/attempts → KeyError beim Markdownrendern. End-to-End read-only main-Test RED→GREEN, vollständige Zeile, vorhandene Ledger-Historie/Budget unverändert. Weitere 29e-Läufe inzwischen abgeschlossen/failure; keine Wiederholung gestartet, solange ein Lauf noch offen war.
136 lokale Automation-Tests bestehen mit genau einer lokalen Linux-only-Auslassung; echter UID-Nachweis liegt für134 am29e bereits vor und wird für den neuen Controller erneut geprüft.
Rehearsal behandelt den unveränderlichen6434ddef/M1.4-Blocker als expliziten NEGATIVtest: nur genau36/35/1 mit dem bekannten Testnamen und --test-Fehler darf diesen Rehearsal-Schritt bestehen. Evidence bleibt testResult=failure/qualification=blocked/automaticActivation=false. Jede andere Abweichung blockiert. Positive Kandidaten-/Integrated-CI verwendet weiterhin unverändert alle36 Tests und schlägt am aktuellen Originalspiel fehl. Kein continue-on-error, keine Review-/Deploy-/Human-Gates ersetzt.
Nächster Schritt: gebündelten Fix-Commit pushen, einmal neue CI für diesen geänderten Code abwarten und konkrete positive sowie negative Nachweise sichern. Neue Games-Zulassung/Publisher bleiben aus.

## Laufende endgültige Prüfung — Remote73c6969

Games37369818847: Browser111963898692 success (Camp, Hint, Submit-Lock, Transfer); known-blocker111963898488 success als NEGATIVnachweis der weiterhin blockierten35/36-Qualifikation. Development Status37369818735 success. Aktuelle Controller-/Web-/Stage-Prüfungen weiter beobachten; kein zweiter Start.
Handoff37370029777 failure: dessen allgemeine CI hat keinen Games-Validatorbenutzer; die neue Syntax-Unit-Fixture erwartete trotzdem einen Kandidatenfehler und bekam korrekt blocked. Exakt mit GITHUB_ACTIONS=true reproduziert. Nur die vertrauenswürdige reine Syntax-Fixture setzt nun im Test diesen Umgebungsmarker auf false; echte Games-CI nutzt weiterhin getrennte UID und node_environment-Scrub. Produktionsguard/unprivileged contract unverändert, alle136 lokalen Tests grün (eine lokale Linux-only-Skip). Fix lokal gesichert; erst nach Abschluss vorhandener Läufe als gebündelten Checkpoint pushen.

73c-Läufe abgeschlossen: Games37369818847 failure ausschließlich wegen vor Ausführung abgebrochenem controller111963898587; browser111963898692 und known-blocker111963898488 success. Stage37369818730 check111963897533 cancelled/continue skipped; Web37369925246 source vor Ausführung abgebrochen, keine neue Web-Abnahme. Status37369818735 success; Handoff37370029777 wegen inzwischen reproduzierter/behobener Syntax-Unit-Umgebung failure. Gründe der externen Cancelled-Jobs nicht belegt. Keine Re-runs, keine Cancellation durch diesen Chat.
Lokal2794c01 sichert nur die Unit-Fixture-Korrektur/Übergabe; Controller-/Profil-/Validator-/Deploy-Code ist identisch zu remote73c und dessen Browser-/Blocker-Nachweisen. Fehlende Handoff/Controller/Web-Nachweise müssen an der aktualisierten Testquelle geprüft werden. Games-Qualifikation bleibt blocked; weitere Profile unaktiviert. Code136 lokal OK (eine lokale Linux-Auslassung), tatsächliche UID134 an29e bestätigt.

# Telemetrie / Produktdiagnose – Übergabe

Aktiver Arbeitsbranch: `feature/telemetry-implementation`.
Verifizierter GitHub-Stand dieser Übergabe: `4e4f0ba90a5bbb68e63a8836782289b46fbef21f`.
Basis des Branches: `feature/gradecrew-app-integration@74eb2ec08e81315875abfc4b1ae052d9f78797eb`.

## Gesichert auf dem Branch

- Staging-only Collector mit strengem Ereignisvertrag, Owner-/Attempt-Token-Autorisierung, Deduplizierung, Konfliktprüfung, Größen-/Tageslimits, 30-Tage-Pilot-Retention und Cleanup. Production fail closed.
- Secure-Client-Adapter für Join/Submit nach erfolgreichem Attempt. Messfehler dürfen die Prüfungsoperation nicht beeinflussen.
- Separate inhaltsfreie Serveroperationsspur für Info/Start/Submit/Receipt sowie fehlgeschlagene Resume-Aufrufe. Gespeichert werden nur Owner/Testcode, Operation, Status, Fehlercode, Dauer, technische Referenz und Revision; keine Namen, Antworten oder Tokens.
- Rundendiagnose aus tatsächlichen Attempts/Submissions. Erwartete Teilnehmerzahl und Start-Erfolgsquote bleiben `null`, solange der Nenner nicht verlässlich gespeichert wird.
- Read-only Bestandsauswertung vorhandener KI-Ereignisse und eigener `ai_question`-Bewertungen. Historische Token-0-Werte gelten als mehrdeutig; Kosten und echte Akzeptanzquote bleiben ohne belastbare Preis-/Nutzungsverkettung `null`.
- Isolierter `teacher-active-time.mjs`-Tracker: aktive Bearbeitungszeit getrennt von Idle/Hintergrund und Vordergrund-KI-Wartezeit. Noch nicht in den Editor verdrahtet oder persistiert.
- Technische Staging-Adminansicht hält Clientmeldungen, Serveroperationen, gespeicherten Rundenzustand und KI-Bestandsdaten getrennt.

## Prüfstatus

- 13 zusätzliche isolierte Rekonstruktionstests wurden in diesem Backup-Chat lokal erfolgreich ausgeführt.
- Bestehender Branch-Workflow enthält `feature/telemetry-implementation` als Push-Trigger und `npm test --prefix assessment-functions`; der Lehrerzeit-Test fällt zusätzlich unter `ai-*.test.js`.
- Über die verfügbare GitHub-Verbindung ist aktuell kein bestätigter Actions-Run für die neuen Commits nachweisbar. Daher **kein CI-grün behaupten**.
- Kein Emulator-Nachweis, kein Deployment, keine Staging-Aktivierung, kein Gerätetest.
- Production wurde nicht verändert.

## Aktivierung

Collector und Serveroperationsspur schreiben nur, wenn auf den Assessment-Functions gleichzeitig `GC_TELEMETRY_ENABLED=true` und `GCLOUD_PROJECT=hausaufgabe-staging` gelten. Der Client benötigt zusätzlich explizites `telemetryEnabled` und einen verifizierten 40-stelligen Release-Commit. Default bleibt aus.

## Offen / nächste Reihenfolge

1. Vollständige Branch-CI und Assessment-Emulatorprüfung ausführen; Fehler vor jeder Aktivierung beheben.
2. Tatsächliche Cloud-Datenbestände, Zugriffe, Löschpfade und Aufbewahrung inventarisieren; 30-Tage-Pilot-Retention rechtlich/technisch freigeben oder anpassen.
3. Staging-only Aktivierung und kontrollierten Join/Submit-Pilot durchführen; Browser-, Server- und gespeicherten Zustand gegeneinander prüfen.
4. Verlässlichen Nenner für erwartete Teilnehmer einer Runde definieren/speichern; erst dann Start-/Abgaberaten berechnen.
5. Aktive Lehrerzeit sauber an Editor-/KI-Lifecycle und Testversion anbinden und als `prepare`-Ereignis persistieren.
6. Generierung → Lehreraktion → Testversion → Veröffentlichung → tatsächlichen Unterrichtseinsatz verknüpfen; erst dann Akzeptanz-/Nutzungskennzahlen ausweisen.
7. Games-Telemetrie mit Welt-/Inhalts-/Mechanikversion adaptieren; danach Aufgabenaggregate und Kostenmodell.
8. Technische JSON-Diagnose in eine lesbare Adminoberfläche mit Zeitraum, Version, Nenner und Datenabdeckung überführen.

Legacy-Tutorial-Abgabe ist nicht mit dem Secure-Assessment-Submit gleichzusetzen und darf nicht als bereits instrumentiert bezeichnet werden.

## Analytics V1 Umsetzung 21.10.2026
Owner: ausführender Fachchat GC · Betrieb & Qualität / Analytics; Chat-Link unbekannt. Task GC-ANALYTICS-01 / GC-TELEMETRY-POSTHOG-01 unverändert. Eigener Branch feature/analytics-teacher-v1-20261021, Basis39e70b2; main abc1380 frisch gelesen. Alter Primary4e4f0ba606Commits behind: nur Tracker+begrenzte Outbox gezielt übernommen, keine Altarchitektur integriert. Runtime-Modell/Effort unknown; komplexe Datenflussarbeit Sol/medium eingeordnet, keine Runtimeumschaltung behauptet.

Checkpoint: Quellenmetadaten/strikte Projektion, explizit getrenntes Schulziel, freiwilliges Opt-in, Rollen-/Testmarker, bounded Outbox/Dedupe, gemeinsames serverseitiges Aktivzeitbudget. Neue Gates standardmäßig aus. Random Actor-ID90Tage, Firestoreereignisse30Tage. SDK-bestätigte Save/Publish/Results nur acknowledged, serverautoritatives Funnel folgt. NativeWeb separat; kein Nativebuild. Lokal Node24.19: Functions289/289, Browsertracker/Outbox/Client11/11; Node22CI noch offen. Kein Deploy oder neue Ingestion.

Unabhängiger Quellenreview: Schuldeploy aktualisierte recordCrewTelemetry, crewAssistant blieb alt; keine Cloud-Byteprüfung möglich. Breites functions:ai würde12fehlende Learningfunktionen gefährden, gezielter neuer Selector erforderlich. firebase/gcloud nicht im PATH. Git-Push Auth fehlt, Connectorobjekte als normaler sicherer Weg verfügbar. Zentralenregel separat PR261/f7d379f unabhängig geprüft, nicht als Mainintegration melden.

Dashboard https://eu.posthog.com/project/293682/dashboard/1043578 enthält3frisch ausgeführte historische Diagnosecharts und deutlich sichtbare Abdeckungslücke; keine Schulzahlen. DataCatalog-Leserecht fehlt, noncanonical. Teacher-Tiles erst nach v2-Ingestion.

Assurance Scope: SEC01/03/06/07/14/17/20 und PRIV01/04/05/06/07/08/12/17/20 (Credentials, Rollen, Schema, Fristen, Zweck, Release). Tests sind Teilbeleg; unabhängiger Kandidatenreview/Cloudnachweis/Betreiber-/Retentiongates offen. PostHogretention planbestimmt, kein Löschwerkzeug; Firestorecleanup bestätigt keine PostHoglöschung. Kein Rechtszertifikat.

Nächster Schritt: serverbestätigte Lifecycle-/Usageprojektion ergänzen, Kandidat vollständig testen/reviewen, selektiven getrennten Testdeploy bis Dashboard nachweisen. Fehlende Aktivierungsvoraussetzungen konkret: Clouddeployzugang/Selektor, eigenes Schul-PostHogziel/Runtimekonfiguration, belegte Zwecke/Fristeninformation. Marketing/Schüler/Games getrennt. Keine Accuracy-, Zahlungs- oder Zeitersparnisbehauptung.


### Geprüfter Kandidat b8b48833 (21.10.2026)
- Remote Sicherung zuerst deac632/PR263; aktueller lokaler Kandidat b8b48833, Integrationsziel2a6ff107 per normalem Merge erhalten. Baumvergleich remote deac632 = lokal6693ce9c exakt4e637fe4. Weitere Sicherung folgt ohne Forcepush.
- Unabhängige Reviews gegen immutable4d4b6fad,6693ce9c,b8b48833. P1 Legacy-Schulconsent, P2 spätes Retry/KIwait/Expiry/Terminalqueue/vertrauenswürdigeReady-Herkunft behoben und nachgeprüft; kein weiterer offensichtlicher Codeblocker. Rechts-/Cloud-/Gerätefreigabe separat.
- Serverquellen: aiJobs ready→test_ready/generation_completed; Quizpublished-Übergang→test_published; aiEvents→nur Tokens/Cache (Kosten unknown); Submission nur Exists+Quizowner→technische Bestätigung, keinerlei Studentdata() gelesen. Client kann Serverevents nicht melden. DBbestätigte Veröffentlichung ist keine Inhaltsqualitätsgarantie. SDK Save/Results acknowledged getrennt.
- Reale Cloudsource aus RAM, keine .env gelesen: SchulcrewAssistant Revision crewassistant-00071-ged, Sourcegeneration1791896705173213, AdapterSHA256197bf2a1c5ab9736c7f34ffd26d21bdfbeb193e4b1a92783a1e52e673610c644 hat hausaufgabe-staging Gate und KEIN source_project. SchulrecordCrewTelemetry generation1792352696108723 hat Adapter49d6a3dcb28896830b96ddf197f765195773031093792ab0f51e5d458e19b347 mit Testprojektgate. Beide Testfunktionen gleicher49d6Adapter. Tokenkonfig ist kein Bytebeleg und wurde nicht gelesen. Inventar Schule58/Test44Functions. Alter Schulpfad also tatsächlich exportfähig; kein Nachweis, dass er derzeit nichts exportiert.
- Bestehende Firebaseanmeldung erfolgreich über temporäre CLI (kein neues Login/Secret gesucht). Nur gezielter9-Funktionsselector vorbereitet/getestet, noch kein Deploy. Exaktes Ziel/SHA vor Start zu nennen. PostHogschulziel/Zweck-/Fristeninformation und Nativeprivacy bleiben Aktivierungsgates. Node22CI, echte Ingestion und Geräteabnahme offen.
- Datenqualität bewusst: D1/D7/D30 nur innerhalb zufälliger90TageActorlebenszeit, Grenzen/Rotation in Berichten offenlegen. Arbeitzeit servercapped client estimate, keine exakte Zeiterfassung. Kein vollständiger Onboarding-/Signupfunnel, kein Marketing/Schülerprofil. KIpreis-/Testzuordnung fehlen, Kostenkennzahl unknown. Weitere Messungen priorisiert: ersterErfolg/Tutorial, Wiederherstellungs-/Uploadfehler, Verwerfen/Neugenerieren als Nutzungssignal, echte Nutzung/Ergebnisöffnung, Plattform/Release/Kohorte. Supportaufwand erst bei sauberem technischen Bezugsnenner, kein Freitextexport.

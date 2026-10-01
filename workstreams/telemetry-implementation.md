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

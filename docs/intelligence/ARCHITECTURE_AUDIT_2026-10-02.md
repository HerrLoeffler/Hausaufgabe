# Architektur- und Kostencheck, 02.10.2026

## Prüfgrundlage

Frisch geprüft: Remote-main `6d722418`, App-Integration `a61759db`, Gateway `232c0ed4`, Qualitätsvertrag `890a0118`, Telemetrie `4e4f0ba9`, Escape `0f89995c` und offene PRs. Prüfung von KI-/Crew-/Cache-/Usage-Modulen, Gateway/WIF/Deploy-Skript, Admin-Datenpfaden, Secure-Submit/-Lifecycle, Firebase-Konfiguration und beiden Firestore-Regelsätzen sowie Escape-Tutor. Kein neuer Live-/Geräte-/Cloud-IAM-Test. Dies ist keine Vollständigkeits- oder Sicherheitszertifizierung des gesamten Produkts.

## Konkrete Befunde

| Priorität | Befund und Beleg | Behandlung |
| --- | --- | --- |
| P0 | `firebase.json` referenziert `firestore.rules`; dort sind veröffentlichte `questions` clientlesbar und direkte `submissions` erlaubt. `firestore.secure-assessment.rules` enthält strengere Grenzen separat. | Bestehender Security-Cutover bleibt Release-Gate. Keine ungeprüfte Umstellung; dieser Codebefund beweist nicht den tatsächlich deployed Rules-Stand. |
| P1 | Bestehende KI-Aufrufer in `functions/index.js` verwenden direkt OpenAI. Gateway-Policy allein kontrolliert sie nicht. | Schrittweise Backend-Anbindung nötig, bestehende Auth/Quoten/Schema-/Bild-/Reviewregeln dabei erhalten. Neuer Router ist kein bereits globaler Kostendeckel. |
| P1 | Gateway hatte keine Prüfung der Provider-Capability pro Job. | Im Router korrigiert; Textadapter darf keine STT-/TTS-/Bildgenerierung vortäuschen. Regressionstest. |
| P1 | Gateway-/WIF-Fehler übernahmen freitextbasierte Providerantworten. Regex auf einen Keytyp schützt keine Inhalte/JWTs. | API-Antworten/Logs erhalten feste Codes; Providerantwort-Rohkörper entfernt. Tests mit privaten Beispieltexten. |
| P1 | WIF-Exchange hatte keine eigene Deadline und nahm unbekannte Tokenlaufzeit pauschal an. | 10-Sekunden-Signal und validierte echte Laufzeit. Gesamtdeadline für automatische Aufträge; unbekannte Kosten stoppen Retry. |
| P1 | Automatisches Routing brauchte persistente Budget- und Wiederholsperren. Cloud Run hat mehrere Instanzen. | Firestore-Transaktionen vor API-Aufruf, getrennte Budgets, idempotentes Settlement; echter Emulator mit parallelen Anfragen in CI. |
| P1 | Escape: gleichzeitige Anfragen doppelt, Cache nach ID trotz bearbeiteter Aufgabe, kein lokaler Fallback bei Bridge-Fehler. | Separater Fix-Branch/PR #27; 5 Verhaltenstests. Inhalte bleiben vor Backend-Integration Lab/Übung; Autorisierung der Lösungen weiterhin offen. |
| P1 | `functions/lib/usage.js` speichert fehlende Tokenwerte als 0; alte Rollups halten nur letztes Modell. | Altdaten nicht als kostenlose oder modellgenau bepreiste Nutzung ausgeben. Neuer Ledger bewahrt unbekannt; Migration/Anbindung ist offen. |
| P1 | `app.js:loadAdminData` lädt vollständige users/quizzes/feedback-Sammlungen; bei Wachstum teuer/langsam. | Eigenes TODO: serverseitige Pagination/Aggregate. Neues Widget nutzt begrenzte Gateway-Zusammenfassung, bestehende Übersicht noch nicht migriert. |
| P1 | Generierte KI-Inhalte, Modellselbstvertrauen und geringe Lehrerkorrektur sind kein belastbarer Qualitätsnachweis. | Qualifikation pro Scope mit unabhängigen Referenzen und Fehlergrenzen. Automatischer Publisher kann nur entsprechend geprüfte Evidenz signieren. |
| P2 | Gesamtkosten inklusive Nacharbeit gegen API-only-Kosten erzeugen scheinbare Ersparnis. | Separaten API-Referenzbeleg eingeführt; ansonsten Ersparnis unbekannt. UI und Tests unterscheiden beide. |
| P2 | Kleine Kostenschwankungen können überflüssige Modellwechsel verursachen. | Einstellbare Mindestverbesserung/Wartefrist; gesperrte aktive Route darf sofort durch qualifizierten Ersatz ersetzt werden. |
| P2 | Neue Gateway-Abhängigkeiten enthielten transitive moderate uuid/gaxios-Advisories. | Kompatible uuid-11.1.1-Override im Gateway, danach Audit/Emulator erneut prüfen. Kein pauschales Major-Upgrade bestehender Functions. |
| P2 | TODO/Workstream-Texte nennen Crew/Emmi teils noch unintegriert, zentrale Release-State enthält bereits Staging-Nachweise. | Registry-Konsistenz verbessern; reale CI/Deploy-Artefakte bleiben maßgeblich. Keine Geräteabnahme aus CI ableiten. |

## Bewährte Grenzen, die erhalten bleiben

- Vorhandene KI-Functions: Authentifizierung, Quoten, begrenzte Reparaturen, strukturierte Schemata, Bildprüfung und Hintergrundjobs. 127 vorhandene Tests lokal bestanden.
- Secure-Submit: bestehende transaktionale Attempt-/Submission-Logik bleibt unberührt. Keine Änderungen an laufenden Leistungsnachweisen oder Bewertung durch den neuen Router.
- Crew: bestehender Parser/Antwortkatalog bleibt die erste Stufe; kein zusätzlicher Klassifizierungsaufruf pro Klick.
- Bildcache: bereits auf Lehrkraft und exakten Kontext begrenzt. Keine neue globale Datenweitergabe.
- Telemetrie: bestehendes isoliertes Projekt mit Retention-/Aktivierungsgates; neuer Kostenledger speichert keine Prompts/Antworten/Audio. Anbindung/Fristen müssen vor Aktivierung abgestimmt werden.

## Weitere Release-Blocker außerhalb dieses Fixes

Manuelle Tutorial-Abgabe in der App, nachvollziehbarer Fehlernachweis zum 30-Teilnehmer-Test, Security-Freigaben, echte Desktop/iPad/iPhone-Abnahme, vollständiger Restore einschließlich Daten/Auth/Uploads. Ein Hosting-Snapshot allein ist kein vollständiges Backup. Keine dieser Aufgaben wird wegen grüner KI-Tests als erledigt markiert.

## Nächster Integrationsschritt

PR #26 auf den vorhandenen Qualitäts-/Gateway-Stack prüfen, danach zunächst einen klar abgegrenzten Textauftrag mit realer Referenzevidenz anbinden. Parallel PR #27 in den Spielebranch prüfen. Freigabe-/Budget-/Datenschutzprofile und Admin-Proxy vervollständigen, dann erst Staging-Aktivierung. Production ist nicht Bestandteil dieses Auftrags.

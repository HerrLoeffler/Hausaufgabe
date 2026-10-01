# GradeCrew: Regeln für Arbeitsagenten

## Einstieg und belegbarer Stand
- Vor Änderungen `START_HERE.md`, `GRADECREW_STATE.json`, `TODO.md`, `workstreams/README.md` und `workstreams/registry.json` auf dem aktuellen Remote-main lesen; danach die Regeln und Übergabe des tatsächlichen Arbeitsbranches.
- Ohne GitHub-Zugriff diese Einschränkung sofort nennen und die Übergabedateien anfordern. Andere Chats und Erinnerungen ersetzen keine Prüfung des Codes.
- Remote-Branches und offene PRs frisch prüfen. Wenn ein Checkout verfügbar ist, `python tools/branch_audit.py` ausführen. Einen neuen Branch erst beginnen, wenn vorhandene Primary-/Related-Branches und PRs nicht bereits dieselbe Funktion abdecken.
- Branch, Commit, lokale Änderungen und verfügbaren Zugriff prüfen. Nicht stillschweigend den Branch wechseln.
- Zustände lokal, GitHub-Commit, Unit/Verhaltenstest, Emulator, CI, Deploy, Browser, Gerät und Production getrennt mit Nachweisen dokumentieren. Keine alten Testergebnisse einem neuen Commit zuschreiben.

## Parallele Aufgaben und Unterbrechungen
- Pro Aufgabe eigener Branch und eigener Checkout/Worktree sowie eine Übergabe nach `workstreams/TEMPLATE.md`. Gemeinsame Dateien und Zuständigkeiten vorher benennen.
- `workstreams/registry.json` pflegt primären Branch, Integrationsziel, Zustand und bekannte Related-Branches. Zustände nur nach tatsächlichem Fortschritt ändern; nichts automatisch löschen.
- Sinnvolle Teilschritte früh committen und pushen, auch als ausdrücklich unfertigen Zwischenstand. Keine Zugangsdaten oder personenbezogenen Testdaten committen.
- Vor längeren Arbeitsschritten und beim Abschluss die Übergabe aktualisieren: erledigt, Belege, offene Punkte, Testmatrix, nächster konkreter Schritt. Nicht erst auf eine Tokenwarnung warten.
- Vor Integration aktuellen Zielbranch erneut lesen, Branch-Audit wiederholen, konkurrierende Änderungen erhalten und relevante Tests ausführen. Kein Force-Push, Reset oder Löschen fremder Arbeit.
- Routineentscheidungen selbst treffen; neue wesentliche Produktentscheidungen und große Refactors brauchen einen entsprechenden Auftrag.

## Firebase-/Emulator-Pflicht
- Änderungen an Firestore Rules, Auth/Berechtigungen, Firebase Functions, serverseitigen Transaktionen, Prüfungsabläufen oder privater Telemetrie benötigen neben Unit-/Contract-Tests passende Emulator-Tests oder einen dokumentierten Blocker.
- Zentrale Ausführung: `bash tools/run_emulator_tests.sh`. Details und Mindestabdeckung: `docs/EMULATOR_TEST_STANDARD.md`.
- Neue Firebase-relevante Workstreams ergänzen die Testmatrix im Handoff und möglichst domänenspezifische Emulatorfälle. `n. a.` benötigt eine Begründung.
- Ein grüner Emulatorlauf ersetzt keinen Lasttest, kein Staging, keinen echten Gerätetest und keine Datenschutz-/Release-Freigabe.

## Sicherheit und Deployment
- Production (`hausaufgabe-40294`) nur nach ausdrücklicher Freigabe im aktuellen Auftrag. Diese Koordinationsarbeit beinhaltet keine Deploy-Freigabe.
- Preview, normales Staging und Production getrennt behandeln. Keine automatische Übertragung von Preview-Regeln auf normales Staging; Security-Cutover benötigt die dokumentierten Gates.
- Lösungsschlüssel bleiben serverseitig. Abgabe und Bewertung serverseitig, Attempt-Abgabe idempotent, private Rate-Limit-Daten nicht clientlesbar. Aktive Prüfungsinhalte unveränderlich; manuelle Bewertung und Lösungsfreigabe kontrolliert zurückhalten.
- Bei Security-Arbeit die aktuellen branchspezifischen Audit-/Gate-Dokumente lesen. Bei Fehlern zuerst Ursache und reproduzierbaren Ablauf klären; keine Vermutungen als behoben melden.
- Kleine zusammenhängende Änderungen, passende Verhaltenstests; bestehende Prüfungen, deutsche UI und Release-Manifeste erhalten.
- Ein CI-Lauf ersetzt weder einen echten Gerätetest noch einen bestätigten Deploy.

## Abschluss
Kurz berichten: Änderung, Branch/Commit, tatsächlich ausgeführte Unit-/Emulator-/CI-Prüfungen, Deployment-Status, offene Risiken und nächster Schritt. Repo-Dateien starten keinen Agenten und sichern keinen uncommitteten Code automatisch.

## Gemeinsame To-do-Liste
- Zu Beginn und bei Fragen nach offenen Aufgaben TODO.md frisch auf main lesen. P0/P1, Blocker und nächste Schritte nennen; ohne GitHub-Zugriff die Datei anfordern.
- Neue Nutzerwünsche einer Task-ID zuordnen oder ergänzen; nach gesicherten Teilschritten den Status mit Nachweisen aktualisieren. Keine Erledigt-Markierung allein wegen eines Plans.
- Vor Änderungen an der Liste Remote-Stand erneut lesen; nur betroffene Aufgaben ändern und parallele Ergänzungen erhalten. Details und Zwischenstände weiterhin in eigener Workstream-Übergabe führen.

## Pflicht zur Dokumentation aller Chats
- docs/CHAT_CONTRACT.md gilt auch für reine Design-, Produkt- und Planungschats. Auftrag einer Task-ID zuordnen, neue Wünsche/Blocker erfassen, Entscheidungen und Gründe in der passenden Übergabe sichern.
- Vor Abschluss oder Aufgabenwechsel TODO.md und Workstream aktualisieren; Commit, echte Prüfungen, offene Punkte und nächsten ausführbaren Schritt nennen. Ohne Schreibzugriff eine kopierbare Übergabe liefern und fehlende Speicherung ausdrücklich melden.

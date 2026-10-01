# GradeCrew: Regeln für Arbeitsagenten

## Einstieg und belegbarer Stand
- Vor Änderungen `START_HERE.md`, `GRADECREW_STATE.json` und `workstreams/README.md` auf dem aktuellen Remote-main lesen; danach die Regeln und Übergabe des tatsächlichen Arbeitsbranches.
- Ohne GitHub-Zugriff diese Einschränkung sofort nennen und die Übergabedateien anfordern. Andere Chats und Erinnerungen ersetzen keine Prüfung des Codes.
- Branch, Commit, lokale Änderungen und verfügbaren Zugriff prüfen. Nicht stillschweigend den Branch wechseln.
- Zustände lokal, gepusht, getestet, deployed und am Gerät bestätigt getrennt mit Nachweisen dokumentieren. Keine alten Testergebnisse einem neuen Commit zuschreiben.

## Parallele Aufgaben und Unterbrechungen
- Pro Aufgabe eigener Branch und eigener Checkout/Worktree sowie eine Übergabe nach `workstreams/TEMPLATE.md`. Gemeinsame Dateien und Zuständigkeiten vorher benennen.
- Sinnvolle Teilschritte früh committen und pushen, auch als ausdrücklich unfertigen Zwischenstand. Keine Zugangsdaten oder personenbezogenen Testdaten committen.
- Vor längeren Arbeitsschritten und beim Abschluss die Übergabe aktualisieren: erledigt, Belege, offene Punkte, nächster konkreter Schritt. Nicht erst auf eine Tokenwarnung warten.
- Vor Integration aktuellen Zielbranch erneut lesen, konkurrierende Änderungen erhalten und relevante Tests ausführen. Kein Force-Push, Reset oder Löschen fremder Arbeit.
- Routineentscheidungen selbst treffen; neue wesentliche Produktentscheidungen und große Refactors brauchen einen entsprechenden Auftrag.

## Sicherheit und Deployment
- Production (`hausaufgabe-40294`) nur nach ausdrücklicher Freigabe im aktuellen Auftrag. Diese Koordinationsarbeit beinhaltet keine Deploy-Freigabe.
- Preview, normales Staging und Production getrennt behandeln. Keine automatische Übertragung von Preview-Regeln auf normales Staging; Security-Cutover benötigt die dokumentierten Gates.
- Lösungsschlüssel bleiben serverseitig. Abgabe und Bewertung serverseitig, Attempt-Abgabe idempotent, private Rate-Limit-Daten nicht clientlesbar. Aktive Prüfungsinhalte unveränderlich; manuelle Bewertung und Lösungsfreigabe kontrolliert zurückhalten.
- Bei Security-Arbeit die aktuellen branchspezifischen Audit-/Gate-Dokumente lesen. Bei Fehlern zuerst Ursache und reproduzierbaren Ablauf klären; keine Vermutungen als behoben melden.
- Kleine zusammenhängende Änderungen, passende Verhaltenstests; bestehende Prüfungen, deutsche UI und Release-Manifeste erhalten.
- Ein CI-Lauf ersetzt weder einen echten Gerätetest noch einen bestätigten Deploy.

## Abschluss
Kurz berichten: Änderung, Branch/Commit, tatsächlich ausgeführte Prüfungen, Deployment-Status, offene Risiken und nächster Schritt. Repo-Dateien starten keinen Agenten und sichern keinen uncommitteten Code automatisch.

## Gemeinsame To-do-Liste
- Zu Beginn und bei Fragen nach offenen Aufgaben TODO.md frisch auf main lesen. P0/P1, Blocker und nächste Schritte nennen; ohne GitHub-Zugriff die Datei anfordern.
- Neue Nutzerwünsche einer Task-ID zuordnen oder ergänzen; nach gesicherten Teilschritten den Status mit Nachweisen aktualisieren. Keine Erledigt-Markierung allein wegen eines Plans.
- Vor Änderungen an der Liste Remote-Stand erneut lesen; nur betroffene Aufgaben ändern und parallele Ergänzungen erhalten. Details und Zwischenstände weiterhin in eigener Workstream-Übergabe führen.

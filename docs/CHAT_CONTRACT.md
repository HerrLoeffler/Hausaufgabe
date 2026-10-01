# Verbindliche Übergabe für jeden GradeCrew-Chat

Gilt für Produkt-, Design-, Spiele-, Infrastruktur- und Coding-Aufgaben, sobald der Chat diese Repo-Regeln gelesen hat.

## Beginn
1. GitHub-Zugriff prüfen. Ohne Zugriff Einschränkung nennen und START_HERE.md, TODO.md und die passende Übergabe anfordern.
2. START_HERE.md, AGENTS.md, TODO.md, `workstreams/README.md` und `workstreams/registry.json` frisch von main lesen.
3. Remote-Branches und offene PRs prüfen; bei Checkout `python tools/branch_audit.py` ausführen.
4. Konkreten Auftrag einer vorhandenen Task-ID zuordnen oder eine neue anlegen. Zuständigkeit/Primary-Branch, Related-Branches, PRs und Dateiüberschneidungen prüfen.
5. Keinen neuen parallelen Lösungsbranch beginnen, bevor vorhandene Arbeit zur gleichen Funktion ausgeschlossen oder ausdrücklich als Integrationsquelle eingeordnet wurde.

## Während der Arbeit
- Neue relevante Wünsche, offene Fragen und Blocker in TODO.md aufnehmen, bevor der Chat endet. Ideen als Ideen kennzeichnen; abgelehnte Vorschläge nicht als beschlossene Aufgaben erfassen.
- Technische/Produktentscheidungen und Begründung in der eigenen Workstream-Übergabe festhalten. Keine vollständigen Chatkopien, Zugangsdaten oder Schülerdaten ablegen.
- Nach jedem sinnvollen gesicherten Teilschritt, vor einem Aufgabenwechsel und vor längeren Prüfungen einen wiederaufnehmbaren Zwischenstand speichern.
- Code tatsächlich committen/pushen; ein Text-Checkpoint sichert keinen Code.
- Vor Änderungen an gemeinsamen Dateien neu lesen und fremde Einträge erhalten. Eigener Branch für Umsetzung, kein Überschreiben konkurrierender Arbeit.
- Bei Firebase-relevanten Änderungen die Testmatrix pflegen und `docs/EMULATOR_TEST_STANDARD.md` anwenden. Unit/Contract, Rules Emulator, Functions Emulator, Parallel/Idempotenz, CI und Staging/Gerät getrennt kennzeichnen.

## Abschluss oder Unterbrechung
Ein Arbeitsblock endet mit:
- Task-ID und konkret erledigtem Teil;
- Commit/Branch und tatsächlich ausgeführten Prüfungen;
- Status getrennt nach Code, Unit/Verhaltenstest, Emulator, CI, Deploy, Browser, Gerät und Production;
- offenen Punkten und genau einem nächsten ausführbaren Schritt;
- aktualisierter TODO-Zeile, Registry-Eintrag falls Zustand/Zuständigkeit geändert wurde und Aufgabenübergabe.

Kann etwas mangels Zugriff nicht gespeichert werden, muss der Chat es ausdrücklich sagen und eine kopierbare Übergabe liefern. Nicht behaupten, andere Chats wüssten bereits Bescheid.

## Branch-Lebenszyklus

`active` → optional `integration_ready` → `integrated` bzw. `archive_candidate`; bei Blockern `blocked`.

Ein alter Branch wird nie allein wegen Alter oder Namens gelöscht. Erst prüfen, ob einzigartige Arbeit, offene PRs oder Handoffs daran hängen. Details: `docs/BRANCH_WORKSTREAM_POLICY.md`.

## Grenzen
Diese Regeln sind verbindliche Projektanweisungen, keine technische Kontrolle aller ChatGPT-Gespräche. Ein Chat, der weder Repo noch Anhang erhält, kann sie nicht automatisch kennen. START_HERE.md als Einstieg verwenden; bestehende Chats einmal zum Neulesen auffordern. Harte Abbrüche sind nicht zuverlässig vorhersehbar, deshalb früh und regelmäßig sichern.

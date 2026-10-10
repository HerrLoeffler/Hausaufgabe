# Verbindliche Übergabe für jeden GradeCrew-Chat

Gilt für Produkt-, Design-, Spiele-, Infrastruktur- und Coding-Aufgaben, sobald der Chat diese Repo-Regeln gelesen hat.

## Beginn
1. GitHub-Zugriff prüfen. Ohne Zugriff Einschränkung nennen und START_HERE.md, GRADECREW_STATE.json, TODO.md und die passende Übergabe anfordern.
2. START_HERE.md, AGENTS.md, GRADECREW_STATE.json, TODO.md und Aufgabenregister frisch von main lesen.
3. Konkreten Auftrag einer vorhandenen Task-ID zuordnen oder eine neue anlegen. Zuständigkeit/Branch, Release Train und Überschneidungen prüfen.
4. Vor neuer Arbeit feststellen, ob dieselbe Funktion bereits auf einem Feature-, Fix-, Lab-, Integrationsbranch oder offenen PR existiert.

## Während der Arbeit
- Neue relevante Wünsche, offene Fragen und Blocker in TODO.md aufnehmen, bevor der Chat endet. Ideen als Ideen kennzeichnen; abgelehnte Vorschläge nicht als beschlossene Aufgaben erfassen.
- Technische/Produktentscheidungen und Begründung in der eigenen Workstream-Übergabe festhalten. Keine vollständigen Chatkopien, Zugangsdaten oder Schülerdaten ablegen.
- Nach jedem sinnvollen gesicherten Teilschritt, vor einem Aufgabenwechsel und vor längeren Prüfungen einen wiederaufnehmbaren Zwischenstand speichern.
- Code tatsächlich committen/pushen; ein Text-Checkpoint sichert keinen Code.
- Vor Änderungen an gemeinsamen Dateien neu lesen und fremde Einträge erhalten. Eigener Branch für Umsetzung, kein Überschreiben konkurrierender Arbeit.
- Ein Feature darf nicht nur „fertig“ heißen. Zulässige Release-Stufen sind `branch_only`, `ci_green`, `integrated`, `staging_deployed`, `user_tested`, `production`.
- Bei jedem Stufenwechsel `GRADECREW_STATE.json` mit Branch/Commit, Beleg und nächstem Schritt aktualisieren. Ein Hosting-Deploy darf nicht als Functions-/Rules-Deploy verbucht werden.
- Staging-Batches laufen über `GRADECREW_STATE.json -> release_train`. Parallele Chats dürfen Features isoliert bauen, aber nicht stillschweigend einen konkurrierenden Gesamt-Staging-Stand behaupten.

## Abschluss oder Unterbrechung
Ein Arbeitsblock endet mit:
- Task-ID und konkret erledigtem Teil;
- Commit/Branch und tatsächlich ausgeführten Prüfungen;
- Status getrennt nach Code, CI, Integration, Staging-Hosting, Staging-Functions/Rules falls relevant, Nutzertest und Production;
- offenen Punkten und genau einem nächsten ausführbaren Schritt;
- aktualisierter TODO-Zeile, Aufgabenübergabe und – bei geändertem Releasezustand – `GRADECREW_STATE.json`.

Kann etwas mangels Zugriff nicht gespeichert werden, muss der Chat es ausdrücklich sagen und eine kopierbare Übergabe liefern. Nicht behaupten, andere Chats wüssten bereits Bescheid.

## Wiederaufnahme und Zuständigkeit
Bei Ersatzchats gilt zusätzlich [CHAT_RECOVERY.md](CHAT_RECOVERY.md). Jede Aufgabenübergabe nennt die ursprüngliche Task-ID, verantwortlichen Chat, bekannten Chat-Link oder „unbekannt“, Aufgabenbranch/PR, Zeitpunkt und letzten gesicherten Teilschritt. Bei Übernahme alten und neuen Verantwortlichen festhalten; andere aktive Baustellen nicht übernehmen.

Vor einem längeren Arbeitsschritt oder externen Start den nächsten Schritt dokumentieren; nach dem Start dessen Run-/Request-ID zeitnah sichern. Auch „Ergebnis unbekannt“ und noch laufende Vorgänge gehören in die Übergabe. Keine automatischen KI-Aufrufe oder zusätzliche Actions pro Chatnachricht zur Fortschrittssicherung.

Ein Ersatzchat prüft zuerst, ob die alte Arbeit noch läuft, ob Commit/PR/Run bereits existiert und welcher Schritt tatsächlich fehlt. Derselbe Auftrag erhält keine neue Task-ID, keinen zurückgesetzten Versuchszähler und keine neue Budgetreservierung allein wegen des Chatwechsels. Ein Chat-Link ist ein Suchhinweis, kein garantierter Zugriff.

## Grenzen
Diese Regeln sind verbindliche Projektanweisungen, keine technische Kontrolle aller ChatGPT-Gespräche. Ein Chat, der weder Repo noch Anhang erhält, kann sie nicht automatisch kennen. START_HERE.md als Einstieg verwenden; bestehende Chats einmal zum Neulesen auffordern. Harte Abbrüche sind nicht zuverlässig vorhersehbar, deshalb früh und regelmäßig sichern.


## Beschlossene Zentralenrolle — GC-HOOKS-01, 10.10.2026

Diese Rollenregel gilt ausschließlich für **GradeCrew Zentrale**, Thread-ID `01a10df6-736b-7a62-bd38-2724cf254c2e`. Martin: „DU FÜHRST KEINE BEFEHLE MEHR SELBST AUS, du koordinierst, mach das wie eine fixe regel!“

- Die Zentrale liest Status über koordinierende APIs, priorisiert, erstellt vollständige Briefings, beauftragt vorhandene Fach-Chats, wählt deren tatsächlich verfügbares Modell nach Schwierigkeit, prüft Ergebnisse und berichtet.
- Die Zentrale führt selbst keine Shell-/Terminalbefehle aus, ändert keine Code-/Projektdateien und startet keine Builds, Tests, Integration oder Deployments. Fehlt eine Zuständigkeit, organisiert sie diese, statt selbst einzuspringen.
- Fach-Chats führen ihre ausdrücklich beauftrageten Tätigkeiten in den sicheren eigenen Checkouts aus. Diese Regel ist kein Ausführungsverbot für alle GradeCrew-Chats. Production-Freigaben, Budget-/Versuchshistorie, Wiederaufnahme und strengere Review-/CI-Gates bleiben bestehen.
- Eine mögliche Bereichszentrale für Games und deren Verhältnis zu Spiel-Fachchats sind bislang ein Entwurf; keine neue Zentrale, kein Chat und keine Hierarchie-Aktivierung aus dieser Regel ableiten. Eine spätere Rollenbindung braucht einen konkreten Owner und geprüfte Quellen.
- Technische Hook-Sperren sind noch nicht installiert oder qualifiziert. Die Rollenregel gilt bereits als Nutzeranweisung; ihr Wirksamkeitsnachweis wird nicht aus dem Vorhandensein dieser Dokumentation abgeleitet. Details: `workstreams/codex-lifecycle-hooks-20261010.md`.

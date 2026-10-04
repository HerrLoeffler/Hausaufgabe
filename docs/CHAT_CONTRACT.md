# Verbindliche Übergabe für jeden GradeCrew-Chat

Gilt für Produkt-, Design-, Spiele-, Infrastruktur- und Coding-Aufgaben, sobald der Chat diese Repo-Regeln gelesen hat.

## Beginn
1. GitHub-Zugriff prüfen. Ohne Zugriff Einschränkung nennen und START_HERE.md, GRADECREW_STATE.json, TODO.md und die passende Übergabe anfordern.
2. START_HERE.md, AGENTS.md, GRADECREW_STATE.json, TODO.md und Aufgabenregister frisch von main lesen.
3. Konkreten Auftrag einer vorhandenen Task-ID zuordnen oder eine neue anlegen. Zuständigkeit/Branch, Release Train und Überschneidungen prüfen.
4. Vor neuer Arbeit feststellen, ob dieselbe Funktion bereits auf einem Feature-, Fix-, Lab-, Integrationsbranch oder offenen PR existiert.

## Evidenzpflicht bei Lernentscheidungen
- Für wesentliche didaktische Entscheidungen gilt zusätzlich [EVIDENCE_RESEARCH_RULE.md](EVIDENCE_RESEARCH_RULE.md).
- Vor der endgültigen Umsetzung von Fehlerfeedback, Scaffolding, Worked Examples, Transfer, Adaptivität, Gamification, Prüfungs-/Aufgabenlogik oder Bewertungsmechanismen einen kurzen Evidence Check durchführen.
- Consensus ist das bevorzugte Recherchewerkzeug für peer-reviewte Evidenz; keine personenbezogenen Daten, Schülerantworten, vertraulichen Uploads oder Freitexte dorthin senden.
- Dauerhafte Produktentscheidungen mit relevanter Lernwirkung unter `docs/evidence/` mit Frage, Evidenz, Grenzen und GradeCrew-Entscheidung dokumentieren.
- Forschung und Nutzungsdaten trennen: Consensus liefert Evidenz aus Studien, PostHog beobachtet später datensparsam tatsächliches Produktverhalten; weder das eine noch das andere allein ersetzt pädagogisches Urteil.

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

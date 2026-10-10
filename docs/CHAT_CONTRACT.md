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


## Beschlossene Zentralenrollen — GC-HOOKS-01, 10.10.2026

Martins feste Regel: Zentralen koordinieren ausschließlich. Die zunächst für die Hauptzentrale beschlossene Grenze wurde ausdrücklich auf die folgende Hierarchie erweitert: **GradeCrew-Zentrale → gemeinsame Games-Zentrale → Zentrale je Spiel → ausführende Fach-Chats**. Die fünf bestehenden Zentralenchats wurden konkret zugeordnet; keine neue Chat-Erstellung durch diese Regel.

| Rolle | Bestehender Chat | Thread-ID |
|---|---|---|
| Hauptzentrale | GradeCrew Zentrale | `01a10df6-736b-7a62-bd38-2724cf254c2e` |
| Gemeinsame Games-Zentrale | GC · Games-Zentrale | `01a11864-3ec7-7091-acc0-9ff292f530f3` |
| Spielzentrale Pizza | Pizza Spiel Zentrale | `01a111e6-c211-76a2-928e-8ed88a7b7bec` |
| Spielzentrale Lerninsel | GC · Lerninsel-Zentrale | `01a1183f-dad9-7640-8a82-23107c980d6e` |
| Spielzentrale Escape-Expedition | GC · Escape-Expedition-Zentrale | `01a11681-00e3-79d1-8f27-c48267b86c0d` |

- Alle genannten Zentralen führen ausschließlich Koordinations-, Recherche- und Statusaktionen über geeignete APIs aus: priorisieren, Quellen/Belege lesen, vollständige Briefings erstellen, Fach-Chats beauftragen, deren verfügbares Modell nach Schwierigkeit wählen, Ergebnisse prüfen und berichten.
- Zentralen führen selbst keine Shell-/Terminalbefehle aus, ändern keine Code-/Projektdateien und starten keine Tests, Builds, Integration oder Deployments. Das gilt auch für vermeintlich lesende Shellbefehle und Dokumentationsänderungen. Erforderliche dauerhafte Repo-Dokumentation nach CHAT_CONTRACT wird einem autorisierten Fachchat zugewiesen; die Pflicht ist keine Ausnahme vom Ausführungsverbot. Fehlende Zuständigkeit organisieren, statt selbst einzuspringen.
- Fach-Chats führen ihre konkret beauftrageten Tätigkeiten in eigenen sicheren Checkouts aus. Diese Rollenregel ist kein Ausführungsverbot für alle GradeCrew-Chats. Production-Freigaben, Budget-/Versuchshistorie, Wiederaufnahme und strengere Review-/CI-Gates bleiben bestehen. Keine zusätzliche Task-ID oder Kostenreservierung je Hierarchieebene.
- Die gemeinsame Games-Zentrale koordiniert spielübergreifende Verträge; Spielzentralen koordinieren jeweils ihr Spiel und dessen Fachaufträge. Eine Zentrale darf frühere Implementierung im Chat als historische Evidenz lesen, aber daraus keine aktuelle Ausführungsbefugnis ableiten.
- Forks kopieren Historie, liefern keinen fortlaufenden Informationssync und erben keine neue Fachzuständigkeit allein dadurch. Gemeinsame aktuelle Projektdateien und explizite Owner-/Rollenbindung sind maßgeblich. Normale Forks können dieselbe Root-sessionId behalten; sessionId, Chatname oder Pfad allein identifizieren daher keine Zentralenrolle zuverlässig.
- Bestehendes GradeCrew Central 0.4.0 wiederverwenden; die drei vorgeschlagenen Rollen-Skills koordinieren/umsetzen/unabhängig abnehmen sind noch nicht installiert. Keine pauschale Erlaubnis aller Plugin-Werkzeuge: lesende Statuszugriffe von schreibenden/Verbindungsaktionen unterscheiden.
- Technische Hook-Sperren sind noch nicht installiert oder qualifiziert. Die Rollenregel gilt als beschlossene Nutzeranweisung; Dokumentation ist kein Runtime-Durchsetzungsnachweis. Details und nächster Schritt: `workstreams/codex-lifecycle-hooks-20261010.md`.

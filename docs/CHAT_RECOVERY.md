# GradeCrew nach einem Chat-Abbruch fortsetzen

Diese Anleitung ergänzt START_HERE.md und CHAT_CONTRACT.md. Sie schützt die Wiederaufnahme; sie behebt keine ChatGPT-Verbindungsstörung und startet keine Automatik.

## Für Martin

1. Bei „Connection interrupted“ zunächst denselben Chat neu laden und prüfen, ob die Antwort oder Arbeit wieder sichtbar wird. Den ursprünglichen großen Auftrag nicht mehrfach neu absenden.
2. Ist der Chat wieder bedienbar, den untenstehenden Fortsetzungstext verwenden.
3. Bleibt er unbenutzbar, seine aktive Ausführung – soweit die Oberfläche das erlaubt – stoppen, bevor ein Ersatzchat auf denselben Branch schreibt. Bereits gestartete GitHub-Jobs können weiterlaufen.
4. Einen Ersatzchat im GradeCrew-Projekt öffnen. Thema und möglichst Task-ID, Branch, PR oder bekannten Chat-Link mitgeben. Eine dieser Zuordnungen genügt häufig; ein nicht bekannter Link ist kein Blocker.
5. Für neue Chats den Wiederaufnahmetext verwenden. Alte umfangreiche Chatkopien sind ergänzende Hinweise; aktuelle GitHub-Nachweise entscheiden über den Arbeitsstand.

### Im bisherigen Chat

> Weiter mit dem bisherigen GradeCrew-Auftrag nach dem Verbindungsabbruch. Lies auf main START_HERE.md und docs/CHAT_RECOVERY.md. Prüfe den letzten gepushten Commit, offene Änderungen, PRs und laufende oder unklare externe Vorgänge. Sichere eine aktuelle Übergabe und setze beim nächsten belegten offenen Schritt fort. Bereits ausgeführte Schritte nicht blind wiederholen; ursprüngliche Task-ID, Versuchshistorie und Budget erhalten.

### Im neuen Chat

> GradeCrew-Wiederaufnahme nach Chat-Abbruch. Repository: HerrLoeffler/Hausaufgabe. Thema/alter Chat: [kurz benennen; Task-ID, Branch, PR oder Link ergänzen, falls bekannt]. Lies auf aktuellem main START_HERE.md, AGENTS.md, docs/CHAT_RECOVERY.md, TODO.md, GRADECREW_STATE.json und die passende Workstream-Übergabe. Ordne den Auftrag zu, prüfe aktuelle Branches/PRs, letzten gesicherten Commit sowie laufende/unklare Vorgänge und alte Zuständigkeit. Übernimm denselben Auftrag und setze beim nächsten belegten offenen Schritt fort. Historie und Budget erhalten; Production nur mit ausdrücklicher Freigabe. Wenn mehrere Aufgaben passen, erst die fehlende Zuordnung klären.

### Einmalig in die GradeCrew-Projektanweisungen übernehmen

> Für jede GradeCrew-Arbeit zuerst den aktuellen Repository-Einstieg START_HERE.md auf main von HerrLoeffler/Hausaufgabe lesen und die dort verlinkten Regeln befolgen. Bei einem Abbruch oder Ersatzchat zusätzlich docs/CHAT_RECOVERY.md lesen. Auftrag mit vorhandener Task-ID und Aufgabenübergabe fortsetzen; Code, CI, Integration, Deploy und Gerätetest anhand aktueller Nachweise unterscheiden. Nach sinnvollen Teilschritten und vor längeren Wartephasen Code und Übergabe sichern. Ohne GitHub-Zugriff die Einschränkung nennen und aktuelle Dateien anfordern.

Diese Projektanweisung muss tatsächlich in den Projekteinstellungen hinterlegt werden; das Vorhandensein dieser Datei ändert keine ChatGPT-Einstellung. Bestehende Chats einmal zum Neulesen auffordern.

## Für den übernehmenden Agenten

1. **Zuordnen:** TODO.md, workstreams/registry.json, passende Übergabe, vorhandene Branches und offene PRs lesen. Thema, Task-ID, Branch und Zuständigkeit abgleichen. Mehrere plausible Aufgaben nicht raten. Ohne Repo-Zugriff aktuelle Übergabe anfordern und den ungeprüften Stand nennen.
2. **Aktive Arbeit prüfen:** Der Text „Connection interrupted“ beweist keinen gestoppten Agenten. Alte Zuständigkeit und bekannte laufende Vorgänge prüfen. Kann aktive Schreibarbeit desselben Auftrags nicht ausgeschlossen werden, nur lesen und prüfen; vor konkurrierenden Änderungen die Übernahme klären.
3. **Stand belegen:** Nach frischem Fetch aktuellen Remote-Head, Zielbranch, PR-Diff, CI und Deploy-Receipts prüfen. Lokal git status prüfen, falls der alte Checkout verfügbar ist. Neues temporäres Arbeitsverzeichnis bedeutet nicht, dass im alten keine ungesicherten Änderungen liegen. Unzugänglichen lokalen Stand als unbekannt erfassen.
4. **Unklare Vorgänge abgleichen:** Existieren Commit, PR, Workflow-Run oder Deployment bereits? Bei bezahlten Provider-Aufrufen Request-/Response-ID, Ergebnis und Kosten prüfen. Keine Wiederholung bei unklarem Ergebnis; bestehende Versuchszähler, Reservierungen und Historie erhalten. Ein anderer Chat oder neu benannter Branch darf keinen Budgetschutz umgehen.
5. **Übernahme sichern:** Ursprüngliche Task-ID und vorhandene Aufgabe fortführen. Chat-Bezeichnung/Link falls bekannt, alter/neuer Verantwortlicher, UTC-Zeit, Branch/PR, letzter gesicherter Schritt, ungesicherter Stand und laufende IDs in der passenden Übergabe festhalten. Die Release-Stufe bleibt unverändert, solange kein neuer Nachweis vorliegt.
6. **Gezielt fortsetzen:** Kurz nennen, was nachweislich erledigt ist, was unklar/offen bleibt und welcher einzelne Schritt als Nächstes folgt. Nur den fehlenden Schritt ausführen. Kein neuer Gesamtaudit oder pauschaler Re-run allein wegen des Abbruchs.

## Checkpoints während der Arbeit

- Nach einem zusammenhängenden Teilschritt sowie vor längeren Tests, Audits, Wartephasen oder externen Starts sichern. Nicht bis zur abschließenden Chatantwort warten.
- Code committen und pushen; ergänzend die Aufgabenübergabe aktualisieren. tools/checkpoint.py allein sichert keinen Code.
- Vor externem Start geplante Aktion festhalten; nach dem Start erhaltene Run-/Request-ID zeitnah ergänzen. Bleibt der Start unklar, „Ergebnis unbekannt“ festhalten.
- Kleine zusammengehörige Dokumentationsupdates sammeln. Keine neue Actions-/KI-Schleife pro Toolaufruf oder Chatnachricht.
- Ein Checkpoint nennt Task-ID, Chat-Zuordnung, Zeit, Branch/PR, letzten gesicherten Codecommit, echte Prüfungen, Release-/Deploy-Stufe, lokale Reständerungen, laufende/unklare Vorgänge, Blocker und genau einen nächsten Schritt.
- Keine Zugangsdaten, Schülerdaten oder vollständigen Chatverläufe speichern. Öffentliche Chat-Links nur freiwillig bekannte, nicht neu freigegebene Links; keine Chatfreigabe erzeugen.

## Was ein neuer Chat wissen kann

Repo-Dateien liefern den gesicherten Projektstand. Projektanweisungen können den gemeinsamen Einstieg festlegen. Erinnerungen und alte Chatnachrichten helfen bei der Zuordnung, garantieren aber weder Vollständigkeit noch Aktualität. Nicht gespeicherte Arbeit ist ohne Zugriff auf den ursprünglichen Checkout möglicherweise nicht rekonstruierbar.

Diese Regeln gelten nach dem Lesen der Anweisungen; sie können unbekannte Chats nicht technisch steuern. Neue Regeln sichern auch frühere ungesicherte Arbeit nicht rückwirkend.

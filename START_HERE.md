# GradeCrew: Einstieg für jeden Arbeitschat

Gemeinsames Register: `HerrLoeffler/Hausaufgabe`, Branch **main**.
Diese Datei ist Projektkoordination, keine Aussage darüber, welcher Code live läuft.

1. GitHub-Zugriff prüfen. Ohne Zugriff sofort sagen, dass kein aktueller Code geprüft werden kann, und diese Datei, `GRADECREW_STATE.json` sowie die passende Aufgabenübergabe anfordern. Keine Zugangsdaten anfordern.
2. Auf **main** diese Datei, `AGENTS.md`, `GRADECREW_STATE.json` sowie `TODO.md` und `workstreams/README.md` lesen. Ein alter Feature-Branch kann veraltete Kopien enthalten.
3. In `GRADECREW_STATE.json` zuerst den aktuellen `release_train`, die eigene Workstream-Stufe und das Integrationsziel prüfen. Ein Feature darf nicht nur als „fertig“ bezeichnet werden; der genaue Zustand muss genannt werden.
4. Passende Baustelle auswählen; deren Remote-Branch, Commit, Regeln und Statusdateien frisch lesen. Der Registry-Eintrag ist eine datierte Beobachtung, keine automatische Wahrheit.
5. Ziel und betroffene Dateien in einer eigenen Aufgabenübergabe festhalten. Überschneidungen abstimmen, bevor dieselben Dateien parallel verändert werden.
6. Eigener Aufgabenbranch / eigener Checkout. Keine gemeinsamen uncommitteten Arbeitsverzeichnisse zwischen unabhängigen Chats. Bestehende Änderungen zuerst sichern, niemals durch Reset/Force-Push beseitigen.
7. Nach einem sinnvollen Teilschritt: überprüfbaren Zwischencommit sichern, pushen und Übergabe aktualisieren. Bei Abbruch maximal den letzten ungesicherten Teilschritt verlieren.
8. Vor Integration: aktuellen Zielbranch erneut prüfen, Konflikte bewusst lösen, passende Tests ausführen. Vor Deployment das Ziel und den genauen Commit nennen.
9. Sobald ein Feature eine Stufe wechselt, `GRADECREW_STATE.json` aktualisieren: Branch → CI → integriert → Staging → Nutzertest → Production. Andere Chats dürfen nicht aus Chat-Aussagen ableiten, dass dieser Schritt bereits erfolgt ist.

## Status korrekt unterscheiden

`branch_only` → `ci_green` → `integrated` → `staging_deployed` → `user_tested` → `production`.

Jede Stufe benötigt ihren eigenen Nachweis. Ein Commit ist kein CI-Nachweis. Eine grüne CI ist kein Deploy. Ein Hosting-Preview ist kein Functions-Deploy. Ein deployed Build ist kein Gerätetest. Ein hochgeladener iOS-Build ist noch kein Gerätetest.

**Verbotene Kurzform:** „Feature ist fertig“, wenn nicht zusätzlich gesagt wird, auf welcher Stufe es steht.

## Release Train

`GRADECREW_STATE.json -> release_train` ist die zentrale Antwort auf:
- Was soll als Nächstes gemeinsam auf Staging?
- Welche Features sind schon zusammen integriert?
- Welche Gates fehlen noch?
- Welcher Commit wurde tatsächlich deployed?
- Was hat Martin selbst bereits getestet?

Parallele Chats dürfen neue Features isoliert bauen, aber ein Staging-Batch wird über genau diesen Release Train zusammengeführt. So sammeln sich keine unsichtbaren „fertigen, aber irgendwo liegenden“ Features an.

## Werkzeuge

- `tools/checkpoint.py`: liest Git-Stand und schreibt einen kleinen JSON-Bericht; sichert **keinen Code**.
- `tools/release_status.py`: zeigt aus `GRADECREW_STATE.json` den aktuellen Release Train und die Workstream-Stufen kompakt an.
- `workstreams/TEMPLATE.md`: Auftrag und Übergabe pro Aufgabe.
- `.github/workflows/handoff-check.yml`: prüft die Koordinationsdateien und liefert einen Bericht im jeweiligen Actions-Lauf. Führt keine App-Tests oder Deployments aus.
- `GRADECREW_STATUS.md`: ältere Übergabe; historische Aussagen anhand der jeweiligen Baustelle prüfen.

## Starttext zum Kopieren

> Weiter mit GradeCrew, Baustelle: … . Lies auf main START_HERE.md, GRADECREW_STATE.json und die passende Übergabe. Prüfe zuerst Zugriff, tatsächlichen Branch/Commit, Release-Train-Stufe und ungesicherte Änderungen. Setze beim nächsten belegten offenen Schritt fort.

## Automatisierung aktivieren und prüfen

Die ausführbaren Workflows und die einmalige Einrichtung stehen in `docs/AUTOMATION_SETUP.md`. Ein neuer Auftrag in `agent-queue/` kann nach Aktivierung den Codex-Worker starten. Nach erfolgreicher App-CI kann der Preview-Workflow Hosting veröffentlichen und Prüfsummen kontrollieren.

Die Preview-Automatik ist seit 01.10.2026 Ende-zu-Ende für **Hosting** bestätigt. Functions und Regeln sind davon getrennte Deploy-Stufen. Worker-Key, Worker-Aktivierung und dessen erster End-to-End-Lauf sind noch offen. Keine Aktivierung aus dem Vorhandensein der Dateien ableiten. Bestehende Chats müssen diesen Einstieg neu lesen. Agent-Ergebnisse werden vor Integration unabhängig geprüft.

## Was steht auf der To-do-Liste?

`TODO.md` auf dem aktuellen main ist die gemeinsame Aufgabenübersicht. `GRADECREW_STATE.json` ist dagegen die zentrale Release-/Deploy-Sicht. Bei „Was ist fertig/deployed/offen?“ beide frisch lesen und nicht aus Erinnerung antworten.

## Verbindliche Arbeitsbedingung

Alle GradeCrew-Chats – einschließlich Planung und Design – befolgen [docs/CHAT_CONTRACT.md](docs/CHAT_CONTRACT.md). Neue Wünsche bleiben nicht nur im Gespräch: Task-ID, TODO-Status, Release-Stufe und passende Übergabe vor Abschluss sichern. Bei fehlendem Zugriff die ungespeicherte Übergabe ausdrücklich nennen.

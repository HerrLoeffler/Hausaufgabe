# GradeCrew: Einstieg für jeden Arbeitschat

Gemeinsames Register: `HerrLoeffler/Hausaufgabe`, Branch **main**.
Diese Datei ist Projektkoordination, keine Aussage darüber, welcher Code live läuft.

1. GitHub-Zugriff prüfen. Ohne Zugriff sofort sagen, dass kein aktueller Code geprüft werden kann, und diese Datei, `GRADECREW_STATE.json` sowie die passende Aufgabenübergabe anfordern. Keine Zugangsdaten anfordern.
2. Auf **main** diese Datei, `AGENTS.md`, `GRADECREW_STATE.json` und `workstreams/README.md` lesen. Ein alter Feature-Branch kann veraltete Kopien enthalten.
3. Passende Baustelle auswählen; deren Remote-Branch, Commit, Regeln und Statusdateien frisch lesen. Der Registry-Eintrag ist eine datierte Beobachtung, keine automatische Wahrheit.
4. Ziel und betroffene Dateien in einer eigenen Aufgabenübergabe festhalten. Überschneidungen abstimmen, bevor dieselben Dateien parallel verändert werden.
5. Eigener Aufgabenbranch / eigener Checkout. Keine gemeinsamen uncommitteten Arbeitsverzeichnisse zwischen unabhängigen Chats. Bestehende Änderungen zuerst sichern, niemals durch Reset/Force-Push beseitigen.
6. Nach einem sinnvollen Teilschritt: überprüfbaren Zwischencommit sichern, pushen und Übergabe aktualisieren. Bei Abbruch maximal den letzten ungesicherten Teilschritt verlieren.
7. Vor Integration: aktuellen Zielbranch erneut prüfen, Konflikte bewusst lösen, passende Tests ausführen. Vor Deployment das Ziel und den genauen Commit nennen.

## Status korrekt unterscheiden

`lokal geändert` → `Commit auf GitHub` → `Prüfungen bestanden` → `deployed` → `am Gerät bestätigt`.
Jede Stufe benötigt ihren eigenen Nachweis. Ein hochgeladener iOS-Build ist noch kein Gerätetest.
Eine grüne CI beweist keinen Firebase-Deploy, keine Security-Freigabe und keinen bestandenen Klassentest.

## Werkzeuge

- `tools/checkpoint.py`: liest Git-Stand und schreibt einen kleinen JSON-Bericht; sichert **keinen Code**.
- `workstreams/TEMPLATE.md`: Auftrag und Übergabe pro Aufgabe.
- `.github/workflows/handoff-check.yml`: prüft die Koordinationsdateien und liefert einen Bericht im jeweiligen Actions-Lauf. Führt keine App-Tests oder Deployments aus.
- `GRADECREW_STATUS.md`: ältere Übergabe; historische Aussagen anhand der jeweiligen Baustelle prüfen.

## Starttext zum Kopieren

> Weiter mit GradeCrew, Baustelle: … . Lies auf main START_HERE.md und die passende Übergabe. Prüfe zuerst Zugriff, tatsächlichen Branch/Commit und ungesicherte Änderungen. Setze beim nächsten belegten offenen Schritt fort.

## Automatisierung aktivieren und prüfen

Die ausführbaren Workflows und die einmalige Einrichtung stehen in `docs/AUTOMATION_SETUP.md`. Ein neuer Auftrag in `agent-queue/` kann nach Aktivierung den Codex-Worker starten. Nach erfolgreicher App-CI kann der Preview-Workflow Hosting veröffentlichen und Prüfsummen kontrollieren.

Die Preview-Automatik ist seit 01.10.2026 durch Lauf 36874596096 Ende-zu-Ende bestätigt (82 Dateiprüfsummen). Worker-Key, Worker-Aktivierung und dessen erster End-to-End-Lauf sind noch offen. Keine Aktivierung aus dem Vorhandensein der Dateien ableiten. Bestehende Chats müssen diesen Einstieg neu lesen. Agent-Ergebnisse werden vor Integration unabhängig geprüft.

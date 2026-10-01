# Aufgabe: GC-GAMES-01

- Aktualisiert (UTC): 2026-10-01
- Verantwortlicher Chat / Auftrag: Escape-Room-MVP „Die verriegelte Schule“ technisch umsetzen und in den Games Hub integrieren
- Aufgabenbranch: `feature/escape-room-mvp-v1`
- Draft-PR: `#10` gegen `lab/games-structure`
- Basiscommit: `869ca416b868667c9e48c05f81c967fe6ad59020` (`lab/games-structure`)
- Wichtige Checkpoints: `408f621` Engine, `19e34d1` Lösungsweg-/Resume-Tests, `2e51f89` Hub-Integration, `9dd0849` Browser-Visibility-Fix, `664f605` vollständig grüner Code-Stand
- Betroffene Dateien: `lab/escape-room/**`, `lab/shared/games-catalog.js`, `lab/games-hub/**`, `tools/build-lab-escape-room.mjs`, `tools/games/**`, `deploy-lab-games-hub.sh`
- Überschneidungen: spätere echte Lehrer-/KI-/Testintegration berührt die Web-App; Live/Multiplayer gehört ausdrücklich nicht zu diesem MVP

## Ziel und gewünschtes Verhalten

Erster spielbarer, vollständig digitaler Escape-Room-Prototyp „Die verriegelte Schule“ mit deterministischer Spiellogik. Lernfragen sind austauschbare Datenobjekte. Lehrkräfte müssen die Mechanik später nicht selbst bauen oder durchspielen.

## Implementiert

- drei Räume plus Finale: Klassenzimmer → Flur → Sekretariat → Ausgang
- acht austauschbare Single-Choice-Platzhalterfragen
- vier gezählte Minirätsel: Tafelmuster, Türcode, Spind-Symbolfolge, Schlüsselbrett-Symbolfolge
- zusätzliche Inventarinteraktion Batterie → Taschenlampe ohne künstliche Rätselzählung
- drei falsche Lernantworten führen zur Lösung und blockieren den Spielfortschritt nicht dauerhaft
- lokales Speichern/Fortsetzen mit Welt-/Versionsschlüssel
- aktive Spielzeit statt bloßer Tab-Dauer
- kontextuelle Hinweise und einfaches Feedback am Ende
- Preflight der Welt-/Fragedefinition
- Lehrer-Vorschau mit Route, allen Fragen, Lösungen und Hinweisen ohne Durchspielen
- lokale `gradecrew:escape-event`-Hooks, aber kein Analytics-Upload
- eigener isolierter Build mit SHA-256-Manifest
- Games-Hub-Katalog als viertes Spiel; Escape Room bewusst nur im Modus `Üben`
- Escape Room erscheint nicht in Rundencode-/Live-Auswahl und nicht in Highscore/Live-Modus
- gemeinsamer Hub-Build prüft Escape-Daten, App und Buildskript per Syntaxcheck

## Automatisierte Prüfungen

`tools/games/escape-room.test.cjs` prüft:

1. kanonischer Preflight besteht und ungültige doppelte IDs werden abgelehnt
2. Lehrer-Vorschau zeigt Route, acht Fragen und Preflight ohne Durchspielen
3. kompletter Lösungsweg erreicht den Ausgang; Q1 wird absichtlich dreimal falsch beantwortet und darf trotzdem keine Sackgasse erzeugen
4. gespeicherter Fortschritt wird nach Reload wieder angeboten und korrekt fortgesetzt

Gemeinsame Regressionsprüfungen prüfen zusätzlich Hub-Filter, Modusgrenzen, Join-Auswahl, Release-Manifeste und die Escape-Integration in den Shared Shell. Chromium prüft Desktop-/Tablet-/Mobile-Hub sowie die neun bisherigen Legacy-Modi und Escape `practice`.

## Gefundener und behobener Integrationsfehler

Der erste Chromium-Lauf nach Hub-Integration (`36923989725`) fand einen echten CSS-Fehler: `homeView` blieb trotz `hidden` sichtbar, weil die eigene `display:grid`-Regel die Browser-Standarddarstellung überstimmte. Fix in `9dd0849`: zentrale Regel `[hidden]{display:none!important}`. Der Test wurde nicht abgeschwächt.

## Umfang / nicht verändern

- Bestehende drei Spiele und deren Backends nicht funktional verändern.
- Keine Production-Veröffentlichung aus diesem Aufgabenbranch.
- Noch keine KI-, Klassen-, Schüler-, Live-, Highscore- oder Telemetrie-Collector-Anbindung für Escape Room.
- Lösungsschlüssel später nicht ungeschützt an Schüler ausliefern; die aktuelle Lab-Lehrerübersicht ist nur UI-Prototyp und noch kein Sicherheitsmodell.
- Keine frei von KI erfundene ausführbare Spiellogik; KI soll später ausschließlich validierte Frage-/Inhaltsdaten liefern.

## Nachweisstatus

- Code auf GitHub gesichert: ja, Branch `feature/escape-room-mvp-v1`, Draft-PR `#10`
- Isolierter Build: **erfolgreich**
- Node-/jsdom-Strukturtests: **23/23 grün** auf dem integrierten Code-Stand
- Chromium-Browserprüfung: **grün** auf Code-Commit `664f605`, Workflow-Run `36924444942`; inklusive bestehender neun Spiel/Modus-Flows und Escape `practice`
- Deployed: **nein**; weder Staging noch Production wurden in diesem Chat veröffentlicht
- Physischer Gerätetest: **nein**; Chromium emuliert Viewports, ersetzt keinen echten iPad-/Handy-Test

## Offene Probleme und nächste Schritte

1. Sicheren Lab-Preview-Deploy durchführen und auf echtem Desktop/iPad testen.
2. Adapter vom GradeCrew-Test-/KI-Frageformat auf die acht validierten Frage-Slots definieren.
3. Lehrer-Vorschau bei echter GradeCrew-Integration an Lehrer-Auth/Berechtigungen binden.
4. Erst nach dem Telemetrie-Collector-Vertrag die vorhandenen lokalen Event-Hooks an echte Erhebung anschließen.
5. Welt 2 („Das verschwundene Prüfungsblatt“) erst auf dem gemeinsamen stabilen Escape-Kern aufbauen.

## Wiederaufnahme nach Abbruch

Zuerst `START_HERE.md`, `AGENTS.md`, `TODO.md`, `GAMES_STATUS.md`, diesen Workstream und PR `#10` lesen. Dann Branchspitze und aktuellen PR-Checkstatus verifizieren. Nicht aus Erinnerungen ableiten, dass der Branch deployed oder physisch gerätegetestet wurde.

# Aufgabe: GC-GAMES-01

- Aktualisiert (UTC): 2026-10-01
- Verantwortlicher Chat / Auftrag: Escape-Room-MVP technisch umsetzen; zuerst Engine mit Platzhalterfragen
- Aufgabenbranch: `feature/escape-room-mvp-v1`
- Basiscommit: `869ca416b868667c9e48c05f81c967fe6ad59020` (`lab/games-structure`)
- Betroffene Dateien: `lab/escape-room/**`, `tools/build-lab-escape-room.mjs`, diese Übergabe; Hub noch nicht verändert
- Überschneidungen mit anderen Aufgaben: spätere Hub-/GradeCrew-Integration berührt Games-Katalog bzw. Lehrer-Web-App; dieser Teilschritt tut das ausdrücklich noch nicht

## Ziel und gewünschtes Verhalten

Erster spielbarer, vollständig digitaler Escape-Room-Prototyp „Die verriegelte Schule“ mit deterministischer Spiellogik. Lernfragen sind austauschbare Datenobjekte. Lehrkräfte müssen die Mechanik später nicht selbst bauen oder durchspielen.

## Umfang / nicht verändern

- Bestehende drei Spiele und deren Backends nicht verändern.
- Keine Production-/Staging-Veröffentlichung in diesem Teilschritt.
- Noch keine KI-, Klassen-, Schüler-, Live- oder Telemetrie-Collector-Anbindung.
- Lösungsschlüssel später nicht ungeschützt an Schüler ausliefern; die aktuelle Lab-Lehrerübersicht ist nur UI-Prototyp und noch kein Sicherheitsmodell.

## Akzeptanzkriterien

- drei Räume + Finale, acht Frage-Slots, mindestens vier Escape-Mechaniken
- keine Sackgasse nach drei falschen Lernantworten
- lokales Speichern/Fortsetzen
- Touch-/Tastatur-taugliche Interaktion ohne zwingendes Drag-and-Drop
- Preflight prüft Welt-/Fragedefinition vor Start
- Lehrer-Vorschau zeigt Route, Fragen und Lösungen ohne Durchspielen
- keine Netzwerk-Telemetrie; nur lokale Event-Hooks für spätere Instrumentierung
- isolierter Build erzeugt Manifest mit Prüfsummen

## Zwischenstand

- Lokal geändert: MVP-Quelldateien und isolierter Build erstellt
- Auf GitHub gesichert (Commit): ausstehend
- Geprüft (Befehl / CI-Link / Ergebnis / Commit): JS-Syntax- und Build-Prüfung lokal bestanden; nach Commit erneut prüfen
- Deployed (Ziel / URL / Commit / Nachweis): nein
- Gerätetest (Gerät / Version / Ergebnis): nein

## Offene Probleme und Unsicherheiten

- Lehrer-Vorschau benötigt bei echter Integration Auth/Berechtigung.
- Placeholder-Fragen sind noch nicht an den GradeCrew-Testvertrag gekoppelt.
- Hub-Anbindung und gemeinsame Browser-CI folgen erst nach bestandenem isoliertem Engine-Schritt.

## Nächster konkreter Schritt

Isolierten Build und Syntax nach dem GitHub-Commit erneut prüfen; danach Hub-Anbindung als getrennten Teilschritt vornehmen.

## Wiederaufnahme nach Abbruch

Der Aufgabenbranch startet exakt auf dem verifizierten Games-Strukturcommit. Vor Hub-Änderungen `GAMES_STATUS.md`, Katalog und aktuelle Branchspitze erneut lesen. Dieser MVP darf noch nicht als GradeCrew-integriert, deployed oder gerätegetestet bezeichnet werden.

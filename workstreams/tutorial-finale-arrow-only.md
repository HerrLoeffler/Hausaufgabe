# Aufgabe: GC-TUTORIAL-05

- Aktualisiert: 2026-10-02
- Aufgabenbranch: `fix/tutorial-finale-arrow-only`
- Basis: `feature/gradecrew-app-integration@a61759db01e41f19b7d34e6eb0e88bac42484c1e`
- Zielbranch: `feature/gradecrew-app-integration`
- Production: nicht verändern

## Problem

Bei der letzten Crew-Sortieraufgabe des Tutorials verleitet der sichtbare Drag-Griff auf Touchgeräten zum Ziehen/Wischen. Während der Schülerphase ist Scrollen grundsätzlich erlaubt; dadurch konnte der blaue Abgabe-Button aus dem Sichtbereich geraten.

## Umsetzung

- Tutorial-Finale ausschließlich mit ↑/↓ statt Drag & Drop.
- Drag-Griff im Finale ausblenden.
- Drag-, Touchmove- und Wheel-Gesten direkt auf den Sortierzeilen blockieren.
- Abgabe-Button bei sichtbarer Finalaufgabe bei Bedarf am unteren Viewport-Rand halten.
- Nach Interaktion starken Viewport-Drift automatisch korrigieren.
- Ursprüngliches Ordering-Verhalten nach Ende der Tutorial-Antwortphase wiederherstellen.
- Reale Schüler-Ordering-Aufgaben außerhalb des Tutorials unverändert lassen.

## Dateien

- `tutorial-ordering-guard.js`
- `tutorial-ordering-guard.test.mjs`
- `gradecrew-tour-v8.js`
- `workstreams/tutorial-choice-replay-v1.md`
- diese Übergabe

## Status

- Code auf GitHub: ja
- letzter Stand vor PR: `121e2b5520fccdefe6632dd1bbe89596fc5820b4`
- automatisierte Tests: offen bis PR-CI
- in Web-Integration: nein
- Staging: nein
- Browser-/Touchgerät: nein
- Production: unverändert

## Nächster Schritt

PR nach `feature/gradecrew-app-integration` öffnen, CI prüfen, erst bei grünem Gate integrieren. Anschließend automatischen Staging-Preview abwarten und dort auf Desktop/iPad praktisch testen.

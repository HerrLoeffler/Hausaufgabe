# GC-REMY-POINTS-20261028 — Auto-Punkte

Stand: 2026-10-28, Umsetzung und Release in Arbeit.

## Auftrag

Martin hat den blauen kompakten Auto-Schalter mit Strich im Punktefeld bestätigt und am 28.10. den Livegang auf gradecrew.de sowie Auto als Standard für neue Tests beauftragt. Das ist eine ausdrückliche Freigabe für die GradeCrew-Live-Umgebung `hausaufgabe-staging`; das getrennte Testprojekt ist `gradecrew-staging-2026`. Das Altprojekt `hausaufgabe-40294` bleibt außerhalb des Auftrags.

## Umsetzung

- Neue Remy-Tests beginnen mit `pointsMode: "auto"`. Die feste Zahl bleibt im Formular erhalten, wenn zwischen Auto und fest gewechselt wird.
- Auto sendet keine Zielsumme an den Server. Remy vergibt Einzelpunkte in 0,5er-Schritten passend zu bewertbaren Antworten und Lösungsschritten. Die Summe ergibt sich aus den fertigen Aufgaben.
- Feste Punkte und alte Anfragen ohne `pointsMode` behalten das bisherige Verhalten. Varianten bleiben bei ihren Quellpunkten.
- Betroffene Dateien: `index.html`, `styles.css`, `app.js`, `remy-ai-help.js`, `functions/index.js`, `functions/lib/prompts.js`, `functions/lib/test-batches.js` und gezielte Tests.

## Nachweise und offene Gates

- Ausgangsbasis des Live-Hostings: Commit `89aaea9e22912d37b1d5472f29a8f7147e6003e3` laut `https://gradecrew.de/release.json` am 28.10.; Firebase-Projekt `hausaufgabe-staging`.
- Neuester Integrationszweig bei der Implementierung: `feature/design-auth-student-20261026` auf `e6af8328`; vor Release auf diesen Stand bringen.
- Lokale Functions-Prüfung: 350/350 Tests und Syntax/Lint bestanden; UI-Gesamttests 24/24, gezielte Formular-/Remy-Tests 29/29. Nach Rebase erneut prüfen.
- Offen: Staging-Deploy und Prüfung, PR/Review und CI, exakter Live-Deploy von Hosting plus den betroffenen KI-Funktionen, Live-Hash-/Funktionsnachweis und Aufgabenübergabe aktualisieren.

# Tutorial Choice & Replay V1

Task: `GC-TUTORIAL-04`

## Ziel

Die GradeCrew-Einführung soll neue Lehrkräfte stark zum Tutorial einladen, aber nicht mehr in einer unabwählbaren Pflicht-Tour festhalten.

## Produktregeln

- automatische Einladung nur einmal pro Lehrkraft
- kein automatischer Start der eigentlichen Tour
- primärer CTA: `Tutorial starten · ca. 5–7 Min.`
- sekundär: `Jetzt nicht – später jederzeit über Tutorial`
- nach einer Entscheidung keine erneute automatische Einladung auf weiteren Logins/Geräten
- Tour ist jederzeit über × oder Escape abbrechbar
- kleiner manueller Tutorial-Button bleibt auf dem Dashboard verfügbar
- Admin: keine automatische Einladung; manueller Button `Tutorial testen`
- bestehende vollständige Crew-Reise bleibt inhaltlich erhalten
- Production nicht verändern

## Zeitmessung

Die bestehende Tour misst bereits lokal `startedAt` bis Abschluss und zeigt die Dauer im Finale an. V1 speichert keine personenbezogenen Zeitdaten. Für eine spätere datensparsame Produktmessung sollen nur Start/Abbruch/Abschluss, letzter Schritt und Dauer/Bucket über den separaten Telemetrie-Vertrag erfasst werden; keine Antworten/Testinhalte.

## Status

- Ausgangscode geprüft: `gradecrew-tour-v7.js`, `gradecrew-tour-v8.js`, `crew-tour-hardening.js`, `app.js`
- Ursache bestätigt: Hardening entfernt Abbruchsteuerung und blockiert Escape
- Umsetzung auf eigenem Branch geplant
- kein Deploy

# GradeCrew Escape Room – MVP V1

Standalone-Lab-Prototyp für `GC-GAMES-01`. Die erste Welt heißt **„Die verriegelte Schule“**.

## Was dieser Stand kann

- vollständig digitales Spiel, keine Vorbereitung im Klassenraum
- drei Räume plus Finale
- acht austauschbare Single-Choice-Platzhalterfragen
- deterministische Escape-Mechaniken: Inventar, Gegenstand verwenden, Muster, Symbolfolge, Zahlenschloss
- dreistufige kontextuelle Hinweise
- drei Fehlversuche pro Lernfrage blockieren den Spielfortschritt nicht dauerhaft
- lokale Wiederaufnahme per `localStorage`
- aktive Spielzeit statt bloßer Tab-Dauer
- Preflight-Prüfung der Welt-/Fragedefinition
- kompakte Lehrer-Vorschau mit Ablauf und Lösungen
- lokale Event-Hooks (`gradecrew:escape-event`) ohne Analytics-Upload

## Bewusste Grenzen

- Die Lehrer-Vorschau ist im Lab **noch nicht authentifiziert**. Sie demonstriert nur die spätere Oberfläche; in GradeCrew muss sie an echte Lehrerrechte gebunden werden.
- Keine KI-, Test-, Klassen-, Schüler- oder Backend-Anbindung in diesem ersten Engine-Schritt.
- Keine Live-Runde, Highscore oder Multiplayer.
- Kein Telemetrie-Collector und kein Datentransfer. Die Event-Hooks sind nur Integrationspunkte.
- Placeholder-Inhalte sind Prozentrechnung und dienen nur dem Prototyp.

## Architektur

- `escape-data.js`: Weltdefinition, Fragen, Preflight-Vertrag
- `app.js`: zustandsbasierte Escape-Engine und UI-Logik
- `styles.css`: responsive Darstellung ohne externe Assets/Bibliotheken
- `index.html`: Runtime und Lab-Lehrerübersicht

Die späteren GradeCrew-Fragen ersetzen ausschließlich die Frageobjekte. Die ausführbare Escape-Logik bleibt deterministisch.

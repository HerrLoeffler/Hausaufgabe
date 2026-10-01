# GradeCrew Escape Room – MVP V1

Lab-Prototyp für `GC-GAMES-01`. Die erste Welt heißt **„Die verriegelte Schule“** und ist auf dem Feature-Branch als viertes Spiel in den gemeinsamen Games Hub eingebunden.

## Was dieser Stand kann

- vollständig digitales Spiel, keine Vorbereitung im Klassenraum
- drei Räume plus Finale
- acht austauschbare Single-Choice-Platzhalterfragen
- vier gezählte Minirätsel: Tafelmuster, Türcode, Spind-Symbolfolge, Schlüsselbrett-Symbolfolge
- zusätzliche Inventarinteraktion Batterie → Taschenlampe
- dreistufige kontextuelle Hinweise
- drei Fehlversuche pro Lernfrage blockieren den Spielfortschritt nicht dauerhaft
- lokale Wiederaufnahme per `localStorage`
- aktive Spielzeit statt bloßer Tab-Dauer
- Preflight-Prüfung der Welt-/Fragedefinition
- kompakte Lehrer-Vorschau mit Ablauf und Lösungen
- lokale Event-Hooks (`gradecrew:escape-event`) ohne Analytics-Upload
- Integration in den Games Hub ausschließlich im Modus **Üben**

## Automatische Prüfungen

- Preflight akzeptiert die kanonische Welt und lehnt fehlerhafte Frage-IDs ab.
- Lehrer-Vorschau wird ohne Durchspielen geprüft.
- Ein kompletter Lösungsweg läuft automatisiert bis zum Ausgang.
- Der Lösungsweg beantwortet die erste Lernfrage absichtlich dreimal falsch und prüft, dass keine Sackgasse entsteht.
- Save/Resume wird über einen neuen Browserzustand geprüft.
- Der gemeinsame Hub-Test prüft, dass Escape Room nicht in Live-/Rundencode-/Highscore-Flows angeboten wird.
- Chromium prüft den Hub auf Desktop-/Tablet-/Mobile-Viewports und startet Escape Room über den gemeinsamen Shared Shell.

Der vollständig grüne Code-Nachweis für den integrierten Stand ist GitHub-Actions-Run `36924444942` auf Commit `664f605`.

## Bewusste Grenzen

- Die Lehrer-Vorschau ist im Lab **noch nicht authentifiziert**. Sie demonstriert nur die spätere Oberfläche; in GradeCrew muss sie an echte Lehrerrechte gebunden werden.
- Keine KI-, Test-, Klassen-, Schüler- oder Backend-Anbindung in diesem MVP.
- Keine Live-Runde, kein Highscore und kein Multiplayer für Escape Room.
- Kein Telemetrie-Collector und kein Datentransfer. Die Event-Hooks sind nur Integrationspunkte.
- Placeholder-Inhalte sind Prozentrechnung und dienen nur dem Prototyp.
- Noch kein Escape-Preview-Deploy und noch kein physischer iPad-/Handy-Test aus dieser Arbeitsrunde.

## Architektur

- `escape-data.js`: Weltdefinition, Fragen, Preflight-Vertrag
- `app.js`: zustandsbasierte Escape-Engine und UI-Logik
- `styles.css`: responsive Darstellung ohne externe Assets/Bibliotheken
- `index.html`: Runtime und Lab-Lehrerübersicht
- `tools/build-lab-escape-room.mjs`: isolierter Build mit Manifest/Prüfsummen
- `tools/games/escape-room.test.cjs`: Preflight-, Lösungsweg- und Resume-Regressionen

Die späteren GradeCrew-Fragen ersetzen ausschließlich die Frageobjekte. Die ausführbare Escape-Logik bleibt deterministisch.

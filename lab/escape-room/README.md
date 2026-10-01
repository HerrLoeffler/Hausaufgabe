# GradeCrew Escape Room – Lern-MVP v0.2

Lab-Prototyp für `GC-GAMES-01`. Die erste Welt heißt **„Die verriegelte Schule“**. Sie wird auf `feature/escape-room-mvp-v1` als eigenständiges Referenzspiel entwickelt; erst nach Abnahme soll sie wieder in den gemeinsamen Games-Stand integriert werden.

## Was dieser Stand kann

- vollständig digitales Spiel ohne Vorbereitung im Klassenraum
- drei Räume plus Finale
- acht austauschbare Lern-Slots mit Lernziel, Lösung, Hinweis, Remediation und Transferaufgabe
- vier gezählte Minirätsel: Tafelmuster, Türcode, Spind-Symbolfolge, Schlüsselbrett-Symbolfolge
- zusätzliche Inventarinteraktion Batterie → Taschenlampe
- lokale Wiederaufnahme per `localStorage`
- aktive Spielzeit statt bloßer Tab-Dauer
- Preflight-Prüfung der Welt-/Fragedefinition
- Lehrer-Vorschau mit Ablauf, allen Inhalten und direkter Aufgabenbearbeitung
- kleine Figur bewegt sich zum angeklickten Bereich; Point-and-Click bleibt touchfreundlich
- lokale Event-Hooks (`gradecrew:escape-event`) ohne Analytics-Upload

## Lernschleife statt Durchraten

Der alte MVP ließ nach drei Fehlversuchen automatisch weiterlaufen. Das ist in v0.2 bewusst entfernt.

- 1. Fehlversuch: normal erneut versuchen.
- 2. Fehlversuch: Antworten neu mischen und Remy-Hilfe anbieten.
- Ab dem 3. Versuch ohne sicheren Lernerfolg: kurze Erklärung + aktive Eingabe eines zentralen Lerninhalts.
- Danach kommt eine neue Transferaufgabe zum selben Lernziel.
- Erst eine erfolgreiche Transferaufgabe löst den Spielfortschritt aus.
- Wird eine Multiple-Choice-Lösung erst nach mehreren Versuchen gefunden, folgt trotzdem der Lerncheck.

Bei informationsbasierten Symbolrätseln stoppt die Engine nach wiederholtem falschem Durchprobieren und verlangt, den ursprünglichen Hinweis erneut anzusehen.

Die verbindlichen Regeln stehen in `docs/games/LEARNING_GUARDRAILS.md`.

## Remy und API-Sparen

`escape-tutor.js` arbeitet nach **AI only when needed**:

1. bekannte Verständnisfrage aus lokalem Wissenskatalog beantworten;
2. normalisierte Wiederholung derselben Frage aus dem Sitzungscache beantworten;
3. nur über eine explizite `GradeCrewTutorBridge` eine externe KI anfragen;
4. ohne externe Brücke auf die vorhandene fachliche Erklärung zurückfallen.

Der Lab-MVP sendet standardmäßig **keine** Schülerfrage an einen Server. Der externe KI-Bridge-Vertrag ist nur vorbereitet und noch nicht an ein Backend angeschlossen.

## Lehrer-Inhalte

Die Lehrkraft kann in der Lab-Vorschau vor dem Start alle acht Lern-Slots prüfen und bearbeiten:

- Lernziel
- Fragetext
- vier Antwortoptionen und richtige Lösung
- fachlicher Hinweis
- kurze Lösungserklärung
- Erklärung nach wiederholten Fehlern
- aktiver Merksatz / Eingabetext
- neue Transferaufgabe und akzeptierte Antworten

`window.GradeCrewEscapeIntegration` stellt einen validierten Frage-Set-Vertrag bereit. Das ist **noch nicht** der echte Adapter zum aktuellen GradeCrew-Testformat; dafür muss zuerst der aktuelle Web-App-Fragevertrag separat gelesen und abgebildet werden.

## Automatische Prüfungen

`tools/games/escape-room.test.cjs` prüft unter anderem:

- vollständigen v0.2-Preflight inklusive Lernschleifen-Daten
- Lehrer-Vorschau und Bearbeitung eines Lern-Slots
- verpflichtende Remediation nach drei Fehlversuchen
- keine Freigabe vor erfolgreicher Transferaufgabe
- lokalen Remy-Knowledge-Hit + Sitzungscache ohne externen API-Aufruf
- Anti-Raten-Sperre bei der Spind-Symbolfolge
- vollständigen Lösungsweg bis zum Ausgang
- Save/Resume

Der isolierte Build erzeugt weiterhin ein SHA-256-Manifest. Das Manifest kennzeichnet ausdrücklich, dass externe Tutor-KI, Telemetrie-Upload und Lehrer-Auth im Lab noch nicht aktiviert sind.

## Bewusste Grenzen

- Lehrer-Vorschau im Lab noch **nicht authentifiziert**; echte Lösungen müssen in GradeCrew geschützt/serverseitig bleiben.
- Noch keine echte GradeCrew-Test-/KI-/Klassen-/Schüler-Anbindung.
- `GradeCrewTutorBridge` ist nur eine Schnittstelle, noch kein API-Backend.
- Keine Live-Runde, kein Highscore und kein Multiplayer für Escape Room.
- Kein Telemetrie-Collector und keine serverseitige Speicherung von Schülerfragen.
- Prozentrechnung dient weiterhin als Referenzinhalt für den Prototyp.
- Ein echter iPad-/Handy-Gerätetest des v0.2-Stands ist separat nach dem Escape-only Preview-Deploy nötig.

## Architektur

- `escape-data.js`: Welt, Lern-Slots, Remediation-/Transferdaten, Preflight
- `escape-tutor.js`: lokale Wissensantworten, Sitzungscache, optionaler externer Bridge-Vertrag
- `app.js`: deterministische Escape-Engine, Lernschleife, Anti-Raten, Lehrerbearbeitung
- `styles.css`: Basisdarstellung
- `escape-v2.css`: zusätzliche Immersion, Remy-, Lern- und Lehreroberflächen
- `index.html`: Runtime, Lehrer-Vorschau und Editor
- `tools/build-lab-escape-room.mjs`: isolierter Build mit Manifest/Prüfsummen
- `tools/games/escape-room.test.cjs`: Verhaltens- und Regressionsprüfungen

Die spätere KI darf nur validierte Inhaltsdaten liefern. Die ausführbare Spiellogik und die Lernleitplanken bleiben deterministisch.

# GradeCrew Escape Room – Lern-MVP v0.2

Lab-Prototyp für `GC-GAMES-01`. Die erste Welt heißt **„Die verriegelte Schule“**. Sie wird auf `feature/escape-room-mvp-v1` als eigenständiges Referenzspiel entwickelt; erst nach Abnahme soll sie wieder in den gemeinsamen Games-Stand integriert werden.

## Was dieser Stand kann

- vollständig digitales Spiel ohne Vorbereitung im Klassenraum
- drei Räume plus Finale
- acht austauschbare Lern-Slots mit Lernziel, Lösung, Hinweis, Remediation und Transferaufgabe
- Hauptfragen als Auswahl, sicher automatisch prüfbarer Freitext oder Zahl mit Toleranz/Einheit
- vier gezählte Minirätsel: Tafelmuster, Türcode, Spind-Symbolfolge, Schlüsselbrett-Symbolfolge
- zusätzliche Inventarinteraktion Batterie → Taschenlampe
- lokale Wiederaufnahme per `localStorage`
- aktive Spielzeit statt bloßer Tab-Dauer
- Preflight-Prüfung der Welt-/Fragedefinition
- Lehrer-Vorschau mit Ablauf, allen Inhalten und direkter Aufgabenbearbeitung für Auswahlfragen
- Freitext-/Zahlfragen bleiben im GradeCrew-Testeditor bearbeitbar, statt in einen ungeeigneten Auswahl-Editor gezwungen zu werden
- kleine Figur bewegt sich zum angeklickten Bereich; Point-and-Click bleibt touchfreundlich
- lokale Event-Hooks (`gradecrew:escape-event`) ohne Analytics-Upload

## Lernschleife statt Durchraten

Der alte MVP ließ nach drei Fehlversuchen automatisch weiterlaufen. Das ist in v0.2 bewusst entfernt.

- 1. Fehlversuch: normal erneut versuchen.
- 2. Fehlversuch: Auswahlantworten neu mischen bzw. Eingabe erneut versuchen und Remy-Hilfe anbieten.
- Ab dem 3. Versuch ohne sicheren Lernerfolg: kurze Erklärung + aktive Eingabe eines zentralen Lerninhalts.
- Danach kommt eine neue Transferaufgabe zum selben Lernziel.
- Erst eine erfolgreiche Transferaufgabe löst den Spielfortschritt aus.
- Wird eine Auswahl-Lösung erst nach mehreren Versuchen gefunden, folgt trotzdem der Lerncheck.
- Hilfe von Remy kann Verständnis fördern, schaltet den Spielfortschritt aber niemals selbst frei.

Auch die Minirätsel sind gegen blindes Durchprobieren gehärtet:

- Spind- und Schlüsselbrett-Symbolfolgen verlangen nach wiederholten Fehlversuchen das erneute Lesen ihrer Quelle.
- Das Tafelmuster wird nach zwei Fehlversuchen geschlossen und verlangt bewusstes erneutes Lesen des Musters.
- Der Türcode wird nach zwei falschen Codes gesperrt. Vor einem neuen Versuch müssen Regal, Computer **und** Tafel als drei Codequellen erneut geprüft werden.

Die verbindlichen Regeln stehen in `docs/games/LEARNING_GUARDRAILS.md`.

## Remy und API-Sparen

`escape-tutor.js` arbeitet nach **AI only when needed**:

1. bekannte Verständnisfrage aus lokalem Wissenskatalog beantworten;
2. normalisierte Wiederholung derselben Frage aus dem Sitzungscache beantworten;
3. nur über eine explizite `GradeCrewTutorBridge` eine externe KI anfragen;
4. ohne externe Brücke auf die vorhandene fachliche Erklärung zurückfallen.

Der Lab-MVP sendet standardmäßig **keine** Schülerfrage an einen Server. Der externe KI-Bridge-Vertrag ist nur vorbereitet und noch nicht an ein Backend angeschlossen.

Die globale GradeCrew-Kosten-/Memory-Infrastruktur wird separat auf `feature/ai-cost-memory-v1` entwickelt. Escape baut keine zweite parallele Langzeitspeicherung auf, sondern soll später deren geprüfte Misconception-/Erklärungs-Memory verwenden.

## Lehrer-Inhalte und GradeCrew-Adapter

Die Lehrkraft kann vor dem Start alle acht Lern-Slots in einer kompakten Vorschau prüfen. Sichtbar sind Lernziel, Fragetext, Lösung, fachlicher Hinweis, Fehlererklärung und Transferaufgabe.

Für Auswahlfragen gibt es im Lab weiterhin eine direkte Bearbeitung. Freitext- und Zahlfragen werden in der echten GradeCrew-Integration im Testeditor bearbeitet, damit deren Antwortvarianten, Toleranz und Einheit fachlich korrekt erhalten bleiben.

`gradecrew-question-adapter.js` bildet den tatsächlich geprüften GradeCrew-Fragevertrag auf die acht Escape-Slots ab. Sicher unterstützt sind aktuell:

- `single`
- `dropdown`
- `truefalse`
- `text`, wenn `manualReview === false` und mindestens eine akzeptierte Antwort vorhanden ist
- `number` mit numerischer Lösung, Toleranz ≥ 0 und optionaler Einheit

Manuell zu prüfender Freitext bleibt absichtlich **fail-closed**: Eine fachlich unsichere automatische Bewertung darf niemals Spielfortschritt freischalten. Komplexe bzw. bildabhängige Typen bleiben ebenfalls gesperrt, bis der Escape-Slot sie ohne Informationsverlust darstellen und prüfen kann.

`window.GradeCrewEscapeIntegration` stellt zusätzlich einen validierten Frage-Set-Vertrag bereit. Die eigentliche Hauptprodukt-Oberfläche **„Als Escape Room spielen“** ist noch nicht verdrahtet.

## Automatische Prüfungen

`tools/games/escape-room.test.cjs` und `tools/games/gradecrew-escape-adapter.test.cjs` prüfen unter anderem:

- vollständigen v0.2-Preflight inklusive Lernschleifen-Daten
- Lehrer-Vorschau und Bearbeitung eines Lern-Slots
- verpflichtende Remediation nach drei Fehlversuchen
- keine Freigabe vor erfolgreicher Transferaufgabe
- Freitext-Antwortvarianten als echtes Fortschritts-Gate
- Zahlantworten inklusive Dezimalkomma und Toleranz als echtes Fortschritts-Gate
- manuell zu prüfenden Freitext als gesperrten Typ
- lokalen Remy-Knowledge-Hit + Sitzungscache ohne externen API-Aufruf
- Anti-Raten-Sperren für Tafelmuster, Türcode und Symbolfolgen
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
- Ein echter iPad-/Handy-Gerätetest dieses Stands ist separat nach dem Escape-only Preview-Deploy nötig.

## Architektur

- `escape-data.js`: Welt, Lern-Slots, Remediation-/Transferdaten, Preflight
- `escape-tutor.js`: lokale Wissensantworten, Sitzungscache, optionaler externer Bridge-Vertrag
- `gradecrew-question-adapter.js`: sicherer GradeCrew-Test → Escape-Lernslot-Adapter
- `app.js`: deterministische Escape-Engine, Lernschleife, Anti-Raten, Lehrerbearbeitung
- `styles.css`: Basisdarstellung
- `escape-v2.css`: zusätzliche Immersion, Remy-, Lern- und Lehreroberflächen
- `index.html`: Runtime, Lehrer-Vorschau und Editor
- `tools/build-lab-escape-room.mjs`: isolierter Build mit Manifest/Prüfsummen
- `tools/games/escape-room.test.cjs`: Verhaltens- und Regressionsprüfungen
- `tools/games/gradecrew-escape-adapter.test.cjs`: GradeCrew-Frageadapter-Regressionsprüfungen

Die spätere KI darf nur validierte Inhaltsdaten liefern. Die ausführbare Spiellogik und die Lernleitplanken bleiben deterministisch.

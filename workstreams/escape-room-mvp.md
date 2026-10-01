# Aufgabe: GC-GAMES-01

- Aktualisiert (UTC): 2026-10-01
- Verantwortlicher Chat / Auftrag: Escape-Room-MVP „Die verriegelte Schule“ als lernwirksames Referenzspiel weiterentwickeln
- Aufgabenbranch: `feature/escape-room-mvp-v1`
- Draft-PR: `#10` gegen `lab/games-structure`
- Basiscommit: `869ca416b868667c9e48c05f81c967fe6ad59020` (`lab/games-structure`)
- Wichtige ältere Checkpoints: `408f621` Engine, `19e34d1` Lösungsweg-/Resume-Tests, `2e51f89` Hub-Integration, `9dd0849` Browser-Visibility-Fix, `664f605` vollständig grüner v0.1-Code-Stand
- v0.2-Checkpoints dieser Runde: `5bc4853` Lern-/Transferdaten, `76de659` lokaler Tutor/Cache, `53fdb64` verpflichtende Lernschleife/Anti-Raten, `4c720d3` erweiterte Tests
- Betroffene Dateien: `lab/escape-room/**`, `tools/build-lab-escape-room.mjs`, `tools/games/escape-room.test.cjs`, Escape-Preview-Workflow und Games-Dokumentation

## Ziel und Produktentscheidung

„Die verriegelte Schule“ wird zunächst als **ein einzelnes sauberes Referenzspiel** fertiggestellt. Der gemeinsame Games Hub bleibt bestehen, wird aber während dieser Escape-Iteration nicht automatisch vom Escape-Branch aktualisiert. Erst nach Abnahme wird der Stand wieder in den gemeinsamen Games-Zweig integriert.

Verbindliches Lernprinzip: **Spaß motiviert; entscheidender Spielfortschritt wird regelmäßig durch nachgewiesenes Lernen verdient.** Die Details stehen in `docs/games/LEARNING_GUARDRAILS.md`.

## Implementiert – v0.1 Basis

- drei Räume plus Finale: Klassenzimmer → Flur → Sekretariat → Ausgang
- acht austauschbare Lernslots
- vier gezählte Minirätsel: Tafelmuster, Türcode, Spind-Symbolfolge, Schlüsselbrett-Symbolfolge
- Inventarinteraktion Batterie → Taschenlampe
- lokales Speichern/Fortsetzen und aktive Spielzeit
- Preflight der Welt-/Fragedefinition
- Lehrer-Vorschau mit Route und Lerninhalten
- lokale `gradecrew:escape-event`-Hooks, aber kein Analytics-Upload
- Practice-/Üben-Spiel, kein Live/Highscore

## Implementiert – Lern-MVP v0.2

### Lernschleife

- Welt-/Fragedaten auf Version `0.2.0` erweitert.
- Jeder Lernslot enthält Lernziel, kurze Remediation, aktive Lernaufgabe und neue Transferaufgabe.
- Erste Fehlversuche bleiben normale Wiederholungen; Antworten werden neu gemischt.
- Nach wiederholten Versuchen gibt es **keine automatische Freigabe mehr**.
- Nach dem dritten Versuch ohne sicheren Lernerfolg: kurze Erklärung → aktiver Merksatz/Eingabe → neue Transferaufgabe.
- Erst die erfolgreiche Transferaufgabe schaltet den zugehörigen Spielfortschritt frei.
- Auch eine erst nach mehreren Auswahlversuchen gefundene richtige Antwort führt in den Lerncheck.
- Remediation-Stufe wird im lokalen Spielstand gespeichert; Dialog schließen/neu öffnen umgeht sie nicht.

### Remy / API-sparende Hilfe

- `escape-tutor.js` mit lokaler Wissensbibliothek und normalisiertem Sitzungscache.
- bekannte Verständnisfragen benötigen keinen externen API-Aufruf.
- optionaler `window.GradeCrewTutorBridge`-Vertrag für spätere echte KI-Anbindung.
- ohne Bridge fällt Remy auf die vorhandene fachliche Erklärung zurück.
- Rohtext der Schülerfrage wird nicht in den lokalen Event-Hook geschrieben.
- externe KI ist in diesem Lab-Stand **nicht** aktiviert.

### Anti-Raten bei Rätseln

- Spind- und Schlüsselbrett-Symbolfolgen zählen Fehlversuche.
- Nach wiederholtem falschem Durchprobieren wird das Rätsel geschlossen.
- Vor einem neuen Versuch muss der ursprüngliche Hinweis erneut angesehen werden.
- Türcode und Lernfortschritt bleiben weiterhin aus gefundenen Hinweisen zusammengesetzt.

### Lehrer-Inhalte

- Lehrerübersicht zeigt alle acht Lernslots inklusive Lernziel, Lösung, Hinweis, Remediation und Transfer.
- jeder Slot kann im Lab direkt bearbeitet werden.
- Bearbeitung wird erneut gegen denselben Preflight-Vertrag validiert.
- `window.GradeCrewEscapeIntegration.getQuestionSet()` / `replaceQuestionSet()` bildet einen validierten Inhaltsvertrag für die spätere GradeCrew-Anbindung.
- Das ist noch **nicht** der echte Adapter zum aktuellen GradeCrew-Testformat.

### Spielgefühl

- kleine Explorer-Figur bewegt sich beim Antippen zu Objekten.
- zusätzliche dezente Raum-/Hover-/Statusanimationen ohne externe Assets.
- Point-and-Click bleibt bewusst der robuste Standard für Desktop/iPad/Handy.

## Deployment-Struktur

- Der bisherige gemeinsame Channel `gradecrew-games-dev` wurde bereits einmal erfolgreich mit dem v0.1-Hub veröffentlicht.
- `.github/workflows/games-dev-preview.yml` ist auf dem Escape-Branch nun nur noch manuell startbar; Escape-Pushes überschreiben den gemeinsamen Hub nicht mehr automatisch.
- Für v0.2 wird ein eigener Hosting-Preview-Channel `gradecrew-escape-dev` eingerichtet, der ausschließlich den isolierten Escape-Build veröffentlicht.
- Firebase-Projekt: `hausaufgabe-staging`.
- Production (`hausaufgabe-40294`) wird von diesen Workflows nicht angesprochen.
- Functions/Firestore werden nicht deployed.

## Tests für v0.2

`tools/games/escape-room.test.cjs` wurde erweitert und prüft:

1. v0.2-Preflight inklusive Remediation-/Transferdaten.
2. Lehrerübersicht mit acht bearbeitbaren Slots.
3. Bearbeitung eines Lernslots und Rückgabe über den Integrationsvertrag.
4. Drei Fehlversuche führen zur verpflichtenden Lernschleife; vorher bleibt Fortschritt 0/8.
5. lokaler Remy-Wissenshit + Sitzungscache ohne externen Bridge-Aufruf.
6. kompletter Lösungsweg; wiederholtes Spindraten erzwingt erneutes Lesen des Hinweises.
7. Save/Resume.

Der finale CI-/Deploy-Nachweis für v0.2 wird erst nach dem neuen Escape-only Workflow eingetragen. Alte grüne v0.1-Runs dürfen nicht als v0.2-Nachweis verwendet werden.

## Umfang / nicht verändern

- Bestehende drei anderen Games und deren Backends nicht funktional verändern.
- Production nicht aus diesem Aufgabenbranch veröffentlichen.
- Keine Live-/Highscore-/Multiplayer-Funktion für Escape in dieser Iteration.
- Kein Telemetrie-Collector und keine dauerhafte serverseitige Speicherung von Schülerfragen ohne separaten Datenvertrag.
- Lösungsschlüssel bei späterer Hauptprodukt-Integration nicht ungeschützt an Schüler ausliefern; Lehrer-Lab-Vorschau ist noch kein Sicherheitsmodell.
- Keine frei von KI erfundene ausführbare Spiellogik. KI liefert später ausschließlich validierte Inhaltsdaten.

## Offene Punkte / nächste Schritte

1. Escape-only Workflow hinzufügen und v0.2 CI + isolierten Build prüfen.
2. Erfolgreich auf `gradecrew-escape-dev` deployen und echten URL-Nachweis sichern.
3. v0.2 auf echtem Desktop und iPad testen; insbesondere Touch, Dialoge, Remediation und Lehrereditor.
4. Danach aktuellen GradeCrew-Web-App-Fragevertrag lesen und echten Adapter planen/implementieren, ohne parallel arbeitende Web-App-Dateien blind zu überschreiben.
5. Lehreransicht bei echter Integration an echte Lehrer-Auth/Berechtigungen binden.
6. Externe Tutor-KI erst über eine serverseitige, datenschutzkonforme Brücke aktivieren; lokale Wissens-/Cache-Stufe bleibt davor.
7. Welt 2 erst nach stabilem Referenzspiel.

## Wiederaufnahme nach Abbruch

Zuerst `START_HERE.md`, `AGENTS.md`, `GRADECREW_STATE.json`, `TODO.md`, `GAMES_STATUS.md`, `docs/games/LEARNING_GUARDRAILS.md`, diese Übergabe und PR #10 lesen. Danach Branchspitze, neueste CI-Runs und Preview-URL frisch verifizieren. Code, Tests, Deploy und physische Geräteabnahme getrennt berichten.

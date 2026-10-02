# GradeCrew Escape Room – Lern-MVP v0.4

Lab-Prototyp für `GC-GAMES-01`. Die erste Welt heißt **„Die verriegelte Schule“** und wird auf `feature/escape-room-mvp-v1` zunächst als einzelnes Referenzspiel fertiggestellt. Erst nach Abnahme wird sie wieder in den gemeinsamen Games-Stand integriert.

## Was dieser Stand kann

- vollständig digitales Escape-Spiel ohne Vorbereitung im Klassenraum
- drei Räume plus Finale
- acht austauschbare Lern-Slots
- Hauptfragen als Auswahl, sicher automatisch prüfbarer Freitext oder Zahl mit Toleranz/Einheit
- vier Minirätsel: Tafelmuster, Türcode, Spind-Symbolfolge, Schlüsselbrett-Symbolfolge
- Inventar, lokale Wiederaufnahme, aktive Spielzeit und Preflight
- kleine Explorer-Figur; Point-and-Click bleibt touchfreundlich
- lokale `gradecrew:escape-event`-Hooks, aber kein Analytics-Upload

## Lernschleife v0.3 – Lernen statt Durchklicken

Entscheidender Spielfortschritt darf nicht durch systematisches Raten entstehen.

- **Beim ersten Versuch richtig:** Aufgabe ist bestanden; kurze Erklärung und Spielfortschritt.
- **Erster Fehlversuch:** sofort eine konkrete fachliche **Denkhilfe aus dem Aufgaben-Hinweis** statt „lies noch einmal“; Antworten werden bei Auswahlaufgaben neu gemischt.
- **Danach richtig:** noch kein direkter Spielfortschritt. Eine neue Transferaufgabe zum selben Lernziel muss zeigen, dass das Prinzip verstanden wurde.
- **Mehrere Fehlversuche:** kurze sachliche Erklärung → aktiver Lernschritt/Merksatz → neue Transferaufgabe.
- Erst der erfolgreiche Transfer gibt den Spielfortschritt frei.
- Coco kann Verständnis fördern, schaltet aber niemals selbst Fortschritt frei.

Damit lohnt sich blindes Klicken nicht: Wer versteht, ist schneller als jemand, der Antwortmöglichkeiten durchprobiert.

Auch die Minirätsel bleiben gegen Raten gehärtet:

- Spind- und Schlüsselbrett-Symbolfolgen verlangen nach wiederholten Fehlversuchen das erneute Lesen ihrer Quelle.
- Das Tafelmuster wird nach zwei Fehlversuchen geschlossen und verlangt bewusstes erneutes Lesen des Musters.
- Der Türcode wird nach zwei falschen Codes gesperrt. Vor einem neuen Versuch müssen Regal, Computer und Tafel erneut geprüft werden.

Die verbindlichen Leitplanken stehen in `docs/games/LEARNING_GUARDRAILS.md`.

## Coco und API-Sparen

`escape-tutor.js` arbeitet nach **AI only when needed**:

1. bekannte Verständnisfragen aus lokalem Wissenskatalog beantworten;
2. Wiederholungen aus dem Sitzungscache beantworten;
3. allgemeine Hilfewünsche wie „Wie fange ich an?“, „Erklär einfacher“ oder „Gib mir ein Beispiel“ lokal aus vorhandenen Lerninformationen beantworten;
4. nur eine wirklich individuelle Verständnisfrage über eine explizite `GradeCrewTutorBridge` an externe KI weiterreichen;
5. ohne externe Brücke auf die fachliche Erklärung zurückfallen.

Der Lab-MVP sendet standardmäßig keine Schülerfrage an einen Server. Die globale GradeCrew-Kosten-/Memory-Infrastruktur wird separat entwickelt; Escape baut keine parallele Langzeitspeicherung auf.

## Coco + einfache KI-Aufgabenerstellung v0.4

Escape verwendet sichtbar nur noch **Coco** und die vorhandenen GradeCrew-Coco-Assets (`penguin-guide.svg` / `penguin-guide-welcome.svg`) statt Emoji-Platzhaltern oder eines zweiten Maskottchennamens. Interne Legacy-IDs wie `remyHelp` bleiben vorerst nur aus Kompatibilitätsgründen bestehen.

Die Lehrer-Vorschau hat zusätzlich einen kompakten KI-Generator:

- Fach
- Klasse
- Thema
- Schwierigkeit
- optional ein eigener Wunsch
- Aktion **„8 Escape-Aufgaben erstellen“**

Es wird **kein zweites KI-Backend** gebaut. Der Lab-Preview nutzt den vorhandenen authentifizierten GradeCrew-Callable `generateTest` in `europe-west1`. Für den eigenständigen Preview meldet sich die Lehrkraft einmal mit dem GradeCrew-Lehrerkonto an; in der späteren Haupt-App kann dieselbe UI über `GradeCrewEscapeAiBridge` die bestehende Sitzung nutzen.

Ein KI-Lauf erzeugt 16 bildfreie, automatisch prüfbare Aufgaben: die ersten 8 Hauptaufgaben und die Aufgaben 9–16 als passende Transferpaare. Nur die 8 Hauptaufgaben erscheinen als Lernslots. Die Transferaufgaben werden in die bestehende Lernschleife eingebaut. Spiellogik und Anti-Raten-Regeln werden niemals von der KI erzeugt.

Der erzeugte Fragensatz wird lokal für den Preview gespeichert, damit ein Reload bzw. Save/Resume nicht auf die Prozentrechnungs-Beispielfragen zurückfällt.

## Kompakte Lehrerprüfung wie in GradeCrew

Die Lehrer-Vorschau wurde in v0.3 bewusst näher an den aktuellen GradeCrew-Testeditor gebracht, aber einfacher gehalten:

- pro Karte zuerst nur **Aufgabe, Antworttyp und richtige Lösung**
- `Lernhilfe & Transfer anzeigen` ist einklappbar
- beim Bearbeiten stehen **Frage + Antworten + richtige Lösung** im Vordergrund
- Lernziel, Hinweis, Lösungserklärung, Remediation, aktiver Lernschritt und Transfer liegen unter **„Lernhilfe & Transfer anpassen (optional)“**
- die Lehrkraft muss also nicht sieben didaktische Felder anfassen, wenn nur eine Frage oder Antwort geändert werden soll

Für sicher automatisch prüfbare Freitext-/Zahlfragen bleibt der GradeCrew-Testeditor die maßgebliche Bearbeitung, damit Antwortvarianten, Toleranz und Einheit korrekt erhalten bleiben.

## GradeCrew-Adapter

`gradecrew-question-adapter.js` bildet den geprüften GradeCrew-Fragevertrag auf die acht Escape-Slots ab. Sicher unterstützt sind:

- `single`
- `dropdown`
- `truefalse`
- `text`, wenn `manualReview === false` und akzeptierte Antworten vorhanden sind
- `number` mit numerischer Lösung, Toleranz ≥ 0 und optionaler Einheit

Manuell zu prüfender Freitext bleibt fail-closed: Eine fachlich unsichere automatische Bewertung darf keinen Spielfortschritt freischalten. Komplexe bzw. bildabhängige Typen bleiben ebenfalls gesperrt, bis sie ohne Informationsverlust dargestellt und geprüft werden können.

`gradecrew-escape-builder.js` bereitet den Ablauf **GradeCrew-Test → 8 Aufgaben → Lernpakete → Lehrerprüfung → Preflight → startfähiges Escape-Paket** vor. Die eigentliche Hauptprodukt-Schaltfläche „Als Escape Room spielen“ ist noch nicht in den parallel entwickelten Haupt-App-Branch verdrahtet.

## Automatische Prüfungen

Die Escape-, Coco-, Adapter- und Builder-Tests prüfen unter anderem:

- Lehrer-Vorschau und kompakten Editor
- kanonische Coco-Darstellung statt Emoji-Platzhalter
- kompakten KI-Generator und 8 Haupt-/8 Transfer-Paarung
- konkrete Denkhilfe nach dem ersten Fehler
- **einmal falsch → danach richtig → Transfer erforderlich**
- vollständige Remediation nach mehreren Fehlversuchen
- keine Freigabe vor erfolgreichem Transfer
- Freitext- und Zahlantworten als echte Fortschritts-Gates
- lokalen Coco-Cache und lokale Standardhilfen ohne API-Aufruf
- Anti-Raten-Sperren für Tafelmuster, Türcode und Symbolfolgen
- vollständigen Lösungsweg und Save/Resume
- GradeCrew-Test → Escape-Vorbereitung

Der isolierte Build erzeugt ein SHA-256-Manifest. Externe Tutor-KI und Telemetrie-Upload sind im Lab weiterhin nicht aktiviert. Der Lehrer-KI-Generator verwendet dagegen bewusst den bestehenden, authentifizierten GradeCrew-Staging-Callable.

## Bewusste Grenzen

- Lehrer-Vorschau im Lab ist noch nicht als eigener geschützter Produktbereich integriert; echte Lösungsschlüssel müssen bei der Hauptprodukt-Integration geschützt bleiben.
- Noch keine echte Klassen-/Schüler-Anbindung und noch keine Hauptprodukt-Schaltfläche „Als Escape Room spielen“.
- Keine Live-Runde, kein Highscore und kein Multiplayer für Escape in dieser Iteration.
- Keine serverseitige Speicherung von Schülerfragen.
- Prozentrechnung bleibt Referenzinhalt des Prototyps.
- Echter Desktop-/iPad-/Handy-Gerätetest dieses **v0.4-Stands** ist weiterhin separat nötig.
- Der echte authentifizierte Klick auf `8 Escape-Aufgaben erstellen` muss nach dem Preview-Deploy einmal mit einem Lehreraccount als E2E geprüft werden; Unit-/Build-Tests ersetzen diesen Backend-E2E-Test nicht.

## Architektur

- `escape-data.js`: Welt, Lern-Slots, Remediation-/Transferdaten, Preflight
- `escape-tutor.js`: Local-first-Hilfe, Sitzungscache, optionaler externer Bridge-Vertrag
- `gradecrew-question-adapter.js`: sicherer GradeCrew-Test → Escape-Lernslot-Adapter
- `gradecrew-escape-builder.js`: Lehrerprüfung und startfähiges Escape-Paket
- `app.js`: deterministische Engine, Lernschleife, Anti-Raten, Lehrerbearbeitung
- `escape-teacher-compact.js`: kompakte GradeCrew-nahe Lehreroberfläche
- `escape-coco-ai.js`: Coco-Darstellung, kompakter Lehrer-KI-Generator und bestehende GradeCrew-AI-Brücke
- `styles.css` / `escape-v2.css`: Darstellung und Immersion
- `tools/build-lab-escape-room.mjs`: isolierter Build mit Manifest/Prüfsummen
- `tools/games/*.test.cjs`: Regressionstests

Die KI darf validierte Inhaltsdaten liefern. Spiellogik und Lernleitplanken bleiben deterministisch.

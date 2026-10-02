# GradeCrew Escape Room – Lern-MVP v0.6

Lab-Prototyp für `GC-GAMES-01`. Die Referenzwelt heißt **„Die verriegelte Schule“** und wird auf `feature/escape-room-mvp-v1` als einzelnes Referenzspiel fertiggestellt. Weitere Welten und die breite Games-Integration folgen erst nach Geräte-/UX-Abnahme.

## Produktprinzip

**Spaß motiviert; entscheidender Spielfortschritt wird durch nachgewiesenes Lernen verdient. Blindes Klicken/Raten darf nie die schnellste Strategie sein.**

Vorhanden:

- vollständig digital, keine Vorbereitung im Klassenzimmer
- 3 Räume + Finale: Klassenzimmer → Flur → Sekretariat → Ausgang
- 8 austauschbare Lernslots
- 4 Minirätsel: Tafelmuster, Türcode, Spindfolge, Schlüsselbrettfolge
- Inventar, lokale Wiederaufnahme, aktive Spielzeit und Preflight
- Auswahl-, sicher prüfbare Freitext- und Zahlantworten
- Anti-Raten-Sperren und Transferaufgaben nach Fehlversuchen
- kompakte Lehrerprüfung vor dem Spielstart
- Practice-Spiel; noch kein Live/Highscore/Multiplayer
- lokale Events; kein Analytics-Upload aus dem Lab

## Crew-Rollen

Die Rollen folgen dem gemeinsamen GradeCrew-Crew-Vertrag:

- **Remy = Erstellen & Ideen**
- **Coco = Begleitung & Orientierung / Lernhilfe im Spiel**
- Emmi = Überarbeiten & Prüfen
- Wilma = Bewerten & Auswerten

Escape verwendet deshalb ab v0.6 Remy in der Erstellungskarte und Coco ausschließlich als Explorer-/Hilfefigur im eigentlichen Spiel.

## Shared Designsystem

Es werden keine eigenen Maskottchenvarianten für Escape gepflegt.

- Coco: `assets/gradecrew/penguin-guide.svg` aus dem Shared-Designsystem
- Remy: `assets/gradecrew/elephant-create.svg` und `assets/gradecrew/clay-remy-writing.svg` aus dem Shared-Designsystem
- `gradecrew-brand.css` und `crew-clay.css` als gemeinsame visuelle Basis
- Escape-spezifische Styles ergänzen nur Spielspezifika

Die CI-Prüfung vergleicht die übernommenen Remy-Dateien mit den Git-Objekten des Shared-Design-Branches, damit nicht wieder eine alte Datei nur unter demselben Namen verwendet wird.

## Lehrer-first Ablauf

Eine neue Runde startet nicht direkt im Spiel:

**Escape vorbereiten → Lehrerbereich → Aufgaben festlegen/prüfen → Escape mit diesen Aufgaben starten**

Damit sieht die Lehrkraft vor dem Start immer zuerst Inhalt, Lösungen, Lernhilfen und Transferaufgaben. Die bestehende Save-/Resume-Logik einer bereits begonnenen Runde bleibt getrennt erhalten.

## Remy-Aufgabenerstellung v0.6

Die Erstellungskarte enthält:

- Fach
- Klasse
- Thema
- Schwierigkeit
- optionaler eigener Wunsch
- `🎙 Mit Remy sprechen`
- Remy-Erstellaktion

Der echte GradeCrew-Generator bleibt über `GradeCrewEscapeAiBridge.generateTest(...)` vorbereitet. Ein echter Lauf erzeugt weiterhin 16 bildfreie, automatisch prüfbare Aufgaben:

- 8 Hauptaufgaben
- 8 zugeordnete Transferaufgaben

Nur die 8 Hauptaufgaben erscheinen als normale Escape-Lernslots. Räume, Rätsel, Inventar, Codes, Progression und Anti-Raten-Regeln bleiben deterministisch und werden niemals von der KI erfunden.

### Standalone-Lab ohne Extra-Anmeldung

Der Lab-Preview enthält bewusst keine zweite Lehrer-Anmeldung und keinen anonym geöffneten KI-Endpunkt.

Der Remy-Button ist trotzdem **klickbar**:

- ohne Host-Bridge übernimmt Remy Fach/Klasse/Thema als **ehrliche Vorschauvorbereitung** und lässt die bestehenden Beispielaufgaben unverändert;
- die UI sagt ausdrücklich, dass dabei keine neuen KI-Aufgaben vorgetäuscht werden;
- sobald die integrierte GradeCrew-Lehreransicht die geschützte Bridge bereitstellt, führt derselbe Button die echte 8+8-Erstellung aus.

So bleibt der UX-Weg testbar, ohne API-Key im Browser, anonymen KI-Zugriff oder ein zweites Backend zu bauen.

## Sprache / Remy

`escape-remy-voice.js` ergänzt im Lab `🎙 Mit Remy sprechen` als Progressive Enhancement nach dem bereits bestehenden GradeCrew-Diktat-V1-Prinzip:

- nutzt `SpeechRecognition` / `webkitSpeechRecognition`, wenn der Browser es unterstützt
- gesprochener Text landet sichtbar im Feld **Eigener Wunsch**
- kein Raw-Audio wird gespeichert
- bei fehlender Browser-Unterstützung gibt es nur eine lokale Hinweismeldung
- spätere Produktintegration soll den gemeinsamen Crew-Assistant-/Voice-Vertrag und kontrolliertes STT verwenden; Escape baut kein separates Voice-Backend auf

Der zentrale GradeCrew-Remy kann später ganze natürliche Anweisungen wie Fach, Klasse, Thema und Wünsche strukturiert auswerten. Der Standalone-Escape dupliziert diesen Parser bewusst nicht.

## Lernschleife

1. Beim ersten Versuch richtig → kurze Erklärung + Spielfortschritt.
2. Erster Fehlversuch → konkrete fachliche Denkhilfe; Auswahlantworten werden neu gemischt.
3. Danach richtige Hauptantwort → noch kein Fortschritt; passende Transferaufgabe muss gelöst werden.
4. Mehrere Fehlversuche → Erklärung + aktiver Lernschritt/Merksatz + Transfer.
5. Erst erfolgreicher Transfer gibt den Spielfortschritt frei.

Auch Minirätsel sind gegen Raten gehärtet: wiederholte falsche Eingaben erzwingen das erneute Lesen der tatsächlichen Hinweisquelle.

## GradeCrew-Adapter

`gradecrew-question-adapter.js` unterstützt sicher:

- `single`
- `dropdown`
- `truefalse`
- `text`, wenn `manualReview === false` und akzeptierte Antworten vorhanden sind
- `number` mit numerischer Lösung, Toleranz ≥ 0 und optionaler Einheit

Manuell zu prüfender Freitext und bildabhängige/komplexe Typen bleiben fail-closed, bis sie ohne Informationsverlust und ohne unsichere automatische Freigabe eingebunden werden können.

## Architektur

- `escape-data.js`: Welt, Lernslots, Remediation/Transfer, Preflight
- `escape-tutor.js`: Coco-Hilfe local-first, Sitzungscache, optionale externe Tutor-Bridge
- `gradecrew-question-adapter.js`: GradeCrew-Test → sichere Escape-Lernslots
- `gradecrew-escape-builder.js`: Lehrerprüfung und startfähiges Escape-Paket
- `app.js`: deterministische Engine, Lernschleife, Anti-Raten, Lehrerbearbeitung
- `escape-teacher-compact.js`: kompakte Lehreroberfläche
- `escape-teacher-flow.js`: Lehrerbereich vor neuem Spielstart
- `escape-coco-ai.js`: Remy-Erstellungskarte, 8+8-Generatorvertrag und Host-AI-Bridge; Coco-Identität im Spiel
- `escape-remy-voice.js`: Standalone-Diktatadapter ohne Audio-Speicherung
- `gradecrew-brand.css` / `crew-clay.css`: gemeinsame GradeCrew-Designbasis
- `styles.css` / `escape-v2.css`: Escape-spezifische Darstellung
- `tools/build-lab-escape-room.mjs`: isolierter Build mit SHA-256-Manifest
- `tools/games/*.test.cjs`: Regressionstests

## Verifikation v0.6

Produktcommit: `649deb8e79470d69042cb40cfb4e107514a58592`.

Automatisierter Prüflauf `36994939830`:

- fokussierte Escape-/Remy-/Coco-/Tutor-/Adapter-/Builder-Tests: **30/30 grün**
- JavaScript-Syntaxchecks: grün
- isolierter Escape-Build: **v0.6.0 grün**
- exaktes Shared-Remy-Artwork: geprüft
- Remy-Erstellung statt Coco-Erstellung: geprüft
- Standalone-Remy-Aktion klickbar: geprüft
- keine vorgetäuschte KI-Erstellung ohne Host-Bridge: geprüft
- Voice-Control vorhanden und sauberer Fallback ohne Browser-Speech-Support: geprüft
- Standalone-Build weiterhin ohne `firebase-config.js`: geprüft

Der Escape-only Staging-Deploy wird über den bestehenden Preview-Workflow separat geprüft. Production wird aus diesem Branch nicht verändert.

## Bewusste Grenzen

- echte neue KI-Aufgaben werden im Standalone-Lab ohne authentifizierte Host-Bridge **nicht** erzeugt
- echte KI-Erstellung über die vorhandene GradeCrew-Lehrersitzung ist noch nicht E2E integriert
- der volle Remy-Natural-Language-Parser wird nicht im Escape dupliziert; er gehört in den gemeinsamen Crew Assistant
- noch keine echte Klassen-/Schüler-Anbindung und keine Hauptprodukt-Schaltfläche „Als Escape Room spielen“
- kein Live/Highscore/Multiplayer in dieser Iteration
- keine serverseitige Speicherung von Schülerfragen
- echter Desktop-/iPad-/Handy-Gerätetest von v0.6 ist noch separat nötig

Production bleibt unverändert.

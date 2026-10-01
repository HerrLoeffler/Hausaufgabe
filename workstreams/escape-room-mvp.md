# Aufgabe: GC-GAMES-01

- Aktualisiert (UTC): 2026-10-01
- Verantwortlicher Chat / Auftrag: Escape-Room-MVP „Die verriegelte Schule“ als lernwirksames Referenzspiel weiterentwickeln
- Aufgabenbranch: `feature/escape-room-mvp-v1`
- Draft-PR: `#10` gegen `lab/games-structure`
- Basiscommit: `869ca416b868667c9e48c05f81c967fe6ad59020` (`lab/games-structure`)
- Verifizierter aktueller Preview-Stand: Commit `9f0ccac8f77210c939abd5a9f0ccc92991ca2992`, Workflow `36937439109`
- Escape-only Preview: `https://hausaufgabe-staging--gradecrew-escape-dev-mpuh7wg1.web.app`
- Betroffene Dateien: `lab/escape-room/**`, `tools/build-lab-escape-room.mjs`, `tools/games/**`, Escape-Preview-Workflow und Games-Dokumentation

## Ziel und Produktentscheidung

„Die verriegelte Schule“ wird zunächst als **ein einzelnes sauberes Referenzspiel** fertiggestellt. Der gemeinsame Games Hub bleibt bestehen, wird aber während dieser Escape-Iteration nicht automatisch vom Escape-Branch aktualisiert. Erst nach Abnahme wird der Stand wieder in den gemeinsamen Games-Zweig integriert.

Verbindliches Lernprinzip: **Spaß motiviert; entscheidender Spielfortschritt wird regelmäßig durch nachgewiesenes Lernen verdient.** Schüler dürfen entdecken und ausprobieren, aber blindes Klicken/Raten darf nicht die schnellste Fortschrittsstrategie sein.

## Implementiert – Referenzspiel

- drei Räume plus Finale: Klassenzimmer → Flur → Sekretariat → Ausgang
- acht austauschbare Lernslots
- vier gezählte Minirätsel: Tafelmuster, Türcode, Spind-Symbolfolge, Schlüsselbrett-Symbolfolge
- Inventarinteraktion Batterie → Taschenlampe
- lokales Speichern/Fortsetzen und aktive Spielzeit
- Preflight der Welt-/Fragedefinition
- Lehrer-Vorschau mit Route und Lerninhalten
- lokale `gradecrew:escape-event`-Hooks, aber kein Analytics-Upload
- Practice-/Üben-Spiel, kein Live/Highscore
- kleine Explorer-Figur bewegt sich beim Antippen zu Objekten; Point-and-Click bleibt touchfreundlicher Standard

## Lernschleife / kein Wegklicken

- Jeder Lernslot enthält Lernziel, Hinweis, kurze Erklärung, Remediation, aktive Lernaufgabe und Transferaufgabe.
- Erste Fehlversuche bleiben normale Wiederholungen.
- Nach wiederholten Fehlversuchen gibt es **keine automatische Freigabe**.
- Nach dem dritten Versuch ohne sicheren Lernerfolg: kurze Erklärung → aktive Eingabe/Verarbeitung eines Lerninhalts → neue ähnliche Transferaufgabe.
- Erst eine erfolgreiche Transferaufgabe schaltet den zugehörigen Spielfortschritt frei.
- Auch eine erst nach mehreren Auswahlversuchen gefundene richtige Lösung kann weiterhin den Lerncheck auslösen.
- Remediation-Stufe wird gespeichert; Dialog schließen/neu öffnen umgeht sie nicht.

## Antwortmodi / GradeCrew-Inhalte

Die Escape-Runtime und der GradeCrew-Adapter unterstützen aktuell sicher:

- `single` / Auswahl
- `dropdown`
- `truefalse`
- `text`, wenn `manualReview === false` und mindestens eine akzeptierte Antwortvariante existiert
- `number` mit numerischer Lösung, Toleranz ≥ 0 und optionaler Einheit; Dezimalkomma wird akzeptiert

Manuell zu prüfender Freitext bleibt absichtlich fail-closed und darf keinen automatischen Spielfortschritt auslösen. Komplexe und bildabhängige Aufgaben bleiben gesperrt, solange Escape sie nicht ohne Informationsverlust darstellen/prüfen kann.

`gradecrew-question-adapter.js` übernimmt keine willkürliche Spiellogik und erfindet keine Distraktoren. Die fachliche Lösung bleibt aus dem GradeCrew-Testvertrag.

## GradeCrew-Vorbereitungsschicht

Neu vorhanden: `gradecrew-escape-builder.js`.

Der Builder bildet den geplanten Hauptprodukt-Workflow ab:

1. GradeCrew-Test bzw. acht explizit ausgewählte Aufgaben übernehmen.
2. Acht Lernhilfe-/Transferpakete ergänzen.
3. Adapter-Sicherheitsregeln prüfen.
4. Escape-Preflight ausführen.
5. Kompakte Lehrer-Prüfübersicht erzeugen: Route, alle 8 Fragen, Lösungen, Hinweise, Lernziele, Remediation und Transfer.
6. Erst danach ein startfähiges `launchPayload` erzeugen.

`GradeCrewEscapeBuilder.apply()` übergibt ein geprüftes Paket an `GradeCrewEscapeIntegration.replaceQuestionSet()`.

Noch **nicht** umgesetzt ist die eigentliche Hauptprodukt-Schaltfläche **„Als Escape Room spielen“**. Diese Verdrahtung soll auf dem passenden GradeCrew-Integrationsbranch erfolgen und darf parallele Haupt-App-Arbeit nicht blind überschreiben.

## Remy / AI only when needed

`escape-tutor.js` arbeitet lokal-first:

1. Sitzungscache
2. fragebezogene bekannte Verständnisfragen (`tutorAnswers`)
3. generische lokale Hilfewünsche
4. erst dann optionale externe `GradeCrewTutorBridge`
5. fachlicher Fallback

Generische Fälle benötigen damit keine API:

- „Wie fange ich an?“ → vorhandener Hinweis
- „Welcher Schritt ist wichtig?“ → vorhandener Hinweis
- „Erklär es einfacher“ → vorhandene Remediation-Erklärung
- „Hast du ein Beispiel?“ → Transferaufgabe als ähnliches Beispiel, ohne Lösung
- „Sag mir die Lösung“ → Lösung wird nicht verraten; vorhandener Hinweis wird genutzt

Eine wirklich individuelle unbekannte Schülerfrage darf später die externe Bridge nutzen. Dieselbe Frage wird danach im Sitzungscache beantwortet. Hilfe von Remy schaltet **niemals** Spielfortschritt frei; Lernnachweis/Transfer bleiben Pflicht.

Die globale langfristige Kosten-/Memory-/Misconception-Infrastruktur wird separat auf `feature/ai-cost-memory-v1` entwickelt. Escape baut dafür bewusst keine parallele dauerhafte Datenspeicherung.

## Anti-Raten bei Rätseln

- Spind- und Schlüsselbrett-Symbolfolgen zählen Fehlversuche und verlangen danach das erneute Lesen ihrer Hinweisquelle.
- Tafelmuster wird nach zwei falschen Versuchen geschlossen; der Schüler muss das Muster bewusst erneut lesen, bevor ein neuer Versuch möglich ist.
- Türcode wird nach zwei falschen Codes gesperrt. Vor einem weiteren Versuch müssen **alle drei Codequellen** erneut geprüft werden: Regal, Computer, Tafel.
- Anti-Raten-Zustand wird gespeichert und lässt sich nicht durch bloßes Schließen/Öffnen umgehen.

## Lehrer-Inhalte

- Lehrerübersicht zeigt alle acht Lernslots inklusive Lernziel, Lösung, Hinweis, Remediation und Transfer.
- Auswahlfragen können im Lab direkt bearbeitet werden.
- Freitext-/Zahlfragen bleiben für die echte Integration im GradeCrew-Testeditor bearbeitbar, damit akzeptierte Varianten, Toleranz und Einheit korrekt erhalten bleiben.
- Bearbeitete/übernommene Inhalte werden erneut gegen den Preflight-Vertrag geprüft.
- Echte Lehrer-Auth/Berechtigungen fehlen im Lab weiterhin; Lösungen dürfen bei Produktintegration nicht ungeschützt an Schüler ausgeliefert werden.

## Deployment-Struktur

- gemeinsamer alter Games-Dev-Hub: vorhanden, aber nicht Fokus dieser Iteration
- eigener Escape-only Channel: `gradecrew-escape-dev`
- Firebase-Projekt: `hausaufgabe-staging`
- aktuelle URL: `https://hausaufgabe-staging--gradecrew-escape-dev-mpuh7wg1.web.app`
- Production (`hausaufgabe-40294`) wird nicht angesprochen
- Functions/Firestore werden nicht durch diesen Workflow deployed

## Verifizierter aktueller Stand

Workflow `36937439109` auf Commit `9f0ccac8f77210c939abd5a9f0ccc92991ca2992`:

- Escape-/Remy-/Adapter-/Builder-Testlauf: **20/20 grün**
- isolierter Escape-Build: **grün**
- Firebase-Staging-Credential: **grün**
- Escape-only Preview-Deploy: **grün**
- Preview-URL: `https://hausaufgabe-staging--gradecrew-escape-dev-mpuh7wg1.web.app`

Geprüft werden unter anderem:

- Preflight und Lehrer-Vorschau
- direkte Bearbeitung eines Lernslots
- verpflichtende Remediation + Transfer
- Freitextantwortvarianten
- Zahlantworten mit Dezimalkomma/Toleranz
- lokaler Remy-Hit / generische Hilfe ohne externen API-Aufruf
- unbekannte Remy-Frage über Bridge + Sitzungscache
- Anti-Raten bei Tafel, Türcode und Symbolfolgen
- kompletter Lösungsweg
- Save/Resume
- GradeCrew-Test → Teacher Review → Launch-Payload Builder
- fail-closed bei manuell zu prüfendem Freitext

## Prüfgrenze

- **Auf GitHub gesichert:** ja
- **Automatisierte Tests:** ja, aktueller Nachweis 20/20
- **Escape-only Build:** ja
- **Staging Preview deployed:** ja
- **Production:** unverändert
- **echter physischer iPad-/Handy-Gerätetest dieses aktuellen Stands:** noch nicht dokumentiert
- **echte Hauptprodukt-Verknüpfung „Als Escape Room spielen“:** noch offen
- **echte externe Tutor-KI:** noch nicht aktiviert
- **Lehrer-Auth für Lösungen:** noch offen

## Umfang / nicht verändern

- Bestehende drei anderen Games und deren Backends nicht funktional verändern.
- Production nicht aus diesem Aufgabenbranch veröffentlichen.
- Keine Live-/Highscore-/Multiplayer-Funktion für Escape in dieser Iteration.
- Kein Telemetrie-Collector und keine dauerhafte serverseitige Speicherung von Schülerfragen ohne separaten Datenvertrag.
- Lösungsschlüssel bei späterer Hauptprodukt-Integration nicht ungeschützt an Schüler ausliefern.
- Keine frei von KI erfundene ausführbare Spiellogik. KI liefert ausschließlich validierte Inhaltsdaten.
- Globale AI-Cost-/Memory-Infrastruktur nicht parallel auf diesem Branch neu bauen; `feature/ai-cost-memory-v1` koordinieren.

## Nächste Schritte

1. Aktuellen Escape-only Stand auf echtem Desktop/iPad prüfen: Touch, Dialoge, Freitext/Zahl, Remediation, Lehrer-Vorschau und Anti-Raten.
2. `feature/gradecrew-app-integration` und offene parallele Haupt-App-Arbeit frisch prüfen; dort den Workflow **„Als Escape Room spielen“** verdrahten, ohne gemeinsame Dateien blind zu überschreiben.
3. Lehrerfluss: 8 Aufgaben auswählen/erzeugen → Lernpakete erzeugen → kompakte Prüfung → Bearbeiten/Neu generieren im GradeCrew-Testeditor → Preflight → Spiel starten.
4. Lehrer-Vorschau bei echter Integration an Lehrer-Auth/Berechtigungen binden.
5. Externe Tutor-KI erst über datenschutzkonforme serverseitige Bridge aktivieren; lokale Wissens-/Cache-Stufe bleibt davor.
6. Später weitere interaktive GradeCrew-Fragetypen nur als echte Escape-Interaktionen ergänzen, nicht künstlich auf Multiple Choice reduzieren.
7. Welt 2 erst nach stabilem Referenzspiel und Geräteabnahme.

## Wiederaufnahme nach Abbruch

Zuerst `START_HERE.md`, `AGENTS.md`, `GRADECREW_STATE.json`, `TODO.md`, `GAMES_STATUS.md`, `docs/games/LEARNING_GUARDRAILS.md`, `docs/games/GRADECrew_ESCAPE_ADAPTER.md`, diese Übergabe und PR #10 lesen. Danach Branchspitze, offene PRs, parallele Branches, neuesten CI-Lauf und Preview-URL frisch verifizieren. Code, Tests, Deploy und physische Geräteabnahme getrennt berichten.

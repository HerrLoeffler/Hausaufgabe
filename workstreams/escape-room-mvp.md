# Aufgabe: GC-GAMES-01

- Aktualisiert (UTC): 2026-10-02
- Auftrag: Escape-Room-MVP **„Die verriegelte Schule“** als lernwirksames Referenzspiel fertigstellen
- Aufgabenbranch: `feature/escape-room-mvp-v1`
- Draft-PR: `#10` gegen `lab/games-structure`
- Basis: `lab/games-structure@869ca416b868667c9e48c05f81c967fe6ad59020`
- v0.4 Produktcode: `1c1c05437604ed38805a50d3ae6ed0d9fc6e0134`
- verifizierter/deployter v0.4-Stand: `8c9c178343d1131e0b3fd23cf2f6f5a7930ca368`
- verifizierter Preview-Run: `36984735575`
- Escape-only Preview: `https://hausaufgabe-staging--gradecrew-escape-dev-mpuh7wg1.web.app`
- Production: **unverändert**

## Produktentscheidung

„Die verriegelte Schule“ bleibt zunächst ein einzelnes Referenzspiel. Der gemeinsame Games Hub ist nicht der aktuelle Entwicklungsfokus. Welt 2 und weitere Games erst nach sauberer Referenzwelt und Geräteabnahme.

Verbindliches Lernprinzip:

> **Spaß motiviert; entscheidender Spielfortschritt wird durch nachgewiesenes Lernen verdient. Blindes Klicken/Raten darf nie die schnellste Strategie sein.**

## Referenzspiel

- 3 Räume + Finale: Klassenzimmer → Flur → Sekretariat → Ausgang
- 8 austauschbare Lernslots
- 4 Minirätsel: Tafelmuster, Türcode, Spindfolge, Schlüsselbrettfolge
- Inventar, Batterie/Taschenlampe, Hauptschlüssel
- lokale Wiederaufnahme und aktive Spielzeit
- Preflight
- Coco als kleine Explorer-/Hilfefigur; Point-and-Click bleibt touchfreundlich
- Practice-Spiel, kein Live/Highscore/Multiplayer
- lokale Events, kein Analytics-Upload

## Lernschleife v0.3/v0.4

### Hauptfragen

1. **Beim ersten Versuch richtig:** kurze Erklärung, dann Spielfortschritt.
2. **Erster Fehlversuch:** konkrete fachliche Denkhilfe aus `question.hint`; kein generisches „lies noch einmal“. Auswahlantworten werden neu gemischt.
3. **Danach richtig:** noch keine Freigabe. Eine neue Transferaufgabe zum selben Lernziel muss erfolgreich gelöst werden.
4. **Mehrere Fehlversuche:** kurze sachliche Erklärung → aktiver Lernschritt/Merksatz → Transferaufgabe.
5. Erst erfolgreicher Transfer schaltet Spielfortschritt frei.

Damit kann ein Schüler nicht einfach Antwortmöglichkeiten nacheinander anklicken und beim zufällig richtigen zweiten Versuch sofort weiterkommen.

### Rätsel-Anti-Raten

- Symbolfolgen: nach wiederholtem Raten ursprüngliche Hinweisquelle erneut lesen.
- Tafelmuster: nach zwei falschen Versuchen schließen und Muster erneut bewusst lesen.
- Türcode: nach zwei falschen Codes alle drei Quellen erneut prüfen: Regal, Computer, Tafel.
- Rate-/Review-Zustand wird gespeichert; Dialog schließen umgeht ihn nicht.

## Coco / AI only when needed

`escape-tutor.js` bleibt intern aus Kompatibilitätsgründen teilweise mit Legacy-`remy*`-IDs benannt, aber **sichtbar im Escape ist ausschließlich Coco**.

Die Tutor-Hilfe arbeitet lokal-first:

1. Sitzungscache
2. bekannte fragebezogene Verständnisfragen
3. generische lokale Hilfe aus Hinweis/Erklärung/Transfer
4. erst dann optionale externe `GradeCrewTutorBridge`
5. lokaler fachlicher Fallback

Standardfälle wie „Wie fange ich an?“, „Welcher Schritt?“, „Erklär einfacher“, „Hast du ein Beispiel?“ und „Sag mir die Lösung“ brauchen keine API. Eine wirklich individuelle unbekannte Schülerfrage kann später die externe Bridge nutzen. Coco selbst schaltet nie Spielfortschritt frei.

Die globale Kosten-/Memory-/Misconception-Infrastruktur bleibt eine separate Baustelle. Keine parallele Langzeitspeicherung auf dem Escape-Branch.

## v0.4 – Coco-Design

- Sichtbare Escape-Begleitung ist **Coco**.
- Emoji-Pinguin-Platzhalter und sichtbare „Remy“-Texte wurden entfernt.
- Verwendete bestehende GradeCrew-Coco-Assets: `assets/gradecrew/penguin-guide.svg` und `penguin-guide-welcome.svg`.
- Keine parallele neue Maskottchen-Datei im Escape gebaut.
- Interne Legacy-Namen werden erst koordiniert mit dem parallelen Tutor-/Design-Stand umbenannt, um unnötige Merge-Konflikte zu vermeiden.

## v0.4 – kompakte KI-Aufgabenerstellung für Lehrkräfte

Neue Lehrer-Karte in der Escape-Vorschau:

- Fach
- Klasse
- Thema
- Schwierigkeit
- optionaler eigener Wunsch
- **„✨ 8 Escape-Aufgaben erstellen“**

Technik:

- kein zweites KI-Backend
- kein API-Key im Browser
- Wiederverwendung des bestehenden authentifizierten GradeCrew-Callables `generateTest` in `europe-west1`
- v0.4-Historie: der eigenständige Preview verlangte kurzzeitig eine Extra-Anmeldung; diese wird in v0.5 wieder entfernt
- spätere Haupt-App: vorbereitete `GradeCrewEscapeAiBridge`, damit die vorhandene GradeCrew-Sitzung benutzt werden kann und keine zweite Anmeldung nötig ist
- ein KI-Lauf erzeugt **16 bildfreie automatisch prüfbare Aufgaben**: 8 Hauptaufgaben + 8 zugeordnete Transferaufgaben
- nur die 8 Hauptaufgaben erscheinen als Escape-Lernslots; die zweiten 8 werden als Transfer verwendet
- sicher erlaubte Typen werden automatisch eingeschränkt
- Räume, Rätsel, Inventar, Fortschrittslogik und Anti-Raten-Regeln bleiben deterministisch und werden nicht von der KI erfunden
- `gradecrew-question-adapter.js` und Escape-Preflight bleiben das Sicherheitsgate
- generierter Fragensatz wird für den eigenständigen Preview lokal gespeichert und nach Reload wiederhergestellt
- manuelle Änderungen an übernommenen Aufgaben werden mitgesichert

Wichtig: Die KI erzeugt in diesem ersten einfachen v0.4-Stand die Haupt-/Transferaufgaben. Lernziel, Hinweis, Erklärung und Lernstrategie werden lokal deterministisch aus Thema/Fragetyp/Lösung aufgebaut. Nicht behaupten, dass diese Lernhilfen bereits eine eigenständige Qualitäts-KI durchlaufen.

## Antwortmodi / GradeCrew-Inhalte

Sicher unterstützt:

- `single`
- `dropdown`
- `truefalse`
- `text`, wenn `manualReview === false` und akzeptierte Antworten vorliegen
- `number` mit numerischer Lösung, Toleranz ≥ 0 und optionaler Einheit

Manuell zu prüfender Freitext bleibt fail-closed und darf niemals automatisch Fortschritt freigeben. Komplexe/bildabhängige Typen bleiben blockiert, bis Escape sie ohne Informationsverlust darstellen kann.

## Kompakte Lehreroberfläche

- pro Frage zuerst **Aufgabe + Antworttyp + richtige Lösung**
- Lernziel, Hinweis, Erklärung, Remediation und Transfer nur über `Lernhilfe & Transfer anzeigen`
- Bearbeitungsdialog: **Frage + Antworten + richtige Lösung** sofort sichtbar
- didaktische Zusatzfelder unter `Lernhilfe & Transfer anpassen (optional)` eingeklappt
- Auswahlfragen im Lab direkt editierbar
- Freitext/Zahl sollen bei echter Hauptproduktintegration im GradeCrew-Testeditor bearbeitet werden

## GradeCrew-Vorbereitungsschicht

Vorhanden:

- `gradecrew-question-adapter.js`
- `gradecrew-escape-builder.js`
- `GradeCrewEscapeIntegration`
- `escape-coco-ai.js`

Technisch vorbereiteter Ablauf:

**Thema/GradeCrew-Test → 8 geeignete Hauptaufgaben + Transfer → Sicherheitsprüfung → Escape-Preflight → kompakte Lehrerprüfung → startfähiges Launch-Paket.**

Die Hauptprodukt-Schaltfläche **„Als Escape Room spielen“** ist noch nicht in `feature/gradecrew-app-integration` verdrahtet. Vor dieser Integration dort erneut aktuellen Branch-/PR-/Parallelstand prüfen.

## Verifikation v0.4

Preview-Run `36984735575` auf Commit `8c9c178343d1131e0b3fd23cf2f6f5a7930ca368`:

- Escape-/Coco-/Adapter-/Builder-Tests: **25/25 grün**
- Coco-Asset/Lehrer-KI-UI-Test: grün
- KI-Anfragevertrag: ein 16-Fragen-Lauf für 8 Haupt-/8 Transferpaare: grün
- GradeCrew-Fragen → 8 validierte Escape-Slots + Transfer: grün
- Regression **einmal falsch → danach richtig → Transfer erforderlich**: grün
- isolierter Escape-Build: **grün**
- Lab-Release-Manifest: `0.4.0`
- Firebase Credential: **grün**
- Escape-only Preview-Deploy: **grün**
- Preview-URL: `https://hausaufgabe-staging--gradecrew-escape-dev-mpuh7wg1.web.app`

### Noch nicht als E2E bestätigt

- echter Login im v0.4-Preview mit einem GradeCrew-Lehreraccount
- echter Klick auf **„8 Escape-Aufgaben erstellen“** gegen den Staging-Callable `generateTest`
- fachliche Sichtprüfung des real erzeugten 8+8-Satzes
- echter Desktop-/iPad-/Handy-Gerätetest von v0.4

Automatisierte Unit-/Build-/Deploy-Tests ersetzen diese echte Backend-/Geräteprüfung nicht.

## Statusvokabular

- **Produktcode auf GitHub:** ja
- **automatisiert getestet:** ja, 25/25
- **isolierter Build:** ja, v0.4.0
- **Escape-only Staging Preview deployed:** ja
- **echter KI-E2E-Klick bestätigt:** nein, nächster manueller Test
- **am echten Desktop/iPad/Handy bestätigt:** noch nicht dokumentiert
- **in Haupt-GradeCrew integriert:** nein
- **Production:** unverändert
- **externe Schüler-Tutor-KI:** noch nicht aktiviert
- **Hauptprodukt-Lehrer-Auth für Lösungsschlüssel:** noch offen

## Nicht verändern / Leitplanken

- Production nicht aus diesem Branch deployen.
- andere Games nicht funktional verändern.
- keine frei von KI erfundene ausführbare Spiellogik; KI liefert nur validierte Inhaltsdaten.
- keine dauerhafte Speicherung von Schülerfragen ohne separaten Datenschutz-/Datenvertrag.
- Lösungsschlüssel bei Hauptproduktintegration nicht ungeschützt an Schüler ausliefern.
- keine globale AI-Memory-/Kosten-Infrastruktur parallel nachbauen.
- vorhandene parallele Tutor-/Design-/AI-Branches vor strukturellen Umbauten erneut prüfen.

## Nächste Schritte

1. Preview öffnen → **Lehrer-Vorschau** → einmal mit GradeCrew-Lehreraccount anmelden → Fach/Klasse/Thema setzen → **8 Escape-Aufgaben erstellen**.
2. Erzeugte 8 Hauptaufgaben und Transfer/Lernhilfe fachlich/UX-seitig prüfen; bei Fehler Screenshot/Fehlermeldung dokumentieren.
3. v0.4 auf echtem Desktop und iPad testen: Coco-Darstellung, KI-Lehrerkarte, Fragenbearbeitung, falsche Antwort → Denkhilfe → Transfer, Save/Resume.
4. UX-/Backend-Fehler direkt im Escape-Branch korrigieren.
5. Danach `feature/gradecrew-app-integration`, relevante Feature-/Fix-/Integrationsbranches und offene PRs frisch prüfen.
6. Hauptprodukt-Fluss **„Als Escape Room spielen“** anbinden: Test erstellen/öffnen → 8 Aufgaben auswählen/erzeugen → kompakte Lehrerprüfung → Preflight → Spiel starten.
7. Lehreransicht bei echter Integration an Auth/Berechtigungen binden.
8. Externe Schüler-Tutor-KI nur serverseitig/datenschutzkonform anbinden; Local-first bleibt davor.
9. Welt 2 erst nach stabiler Referenzwelt.

## Wiederaufnahme

Zuerst `START_HERE.md`, `AGENTS.md`, `GRADECREW_STATE.json`, `TODO.md`, `GAMES_STATUS.md`, `docs/games/LEARNING_GUARDRAILS.md`, `docs/games/GRADECrew_ESCAPE_ADAPTER.md`, diese Übergabe und PR #10 lesen. Danach Branchspitze, parallele Branches/PRs, aktuellen CI-Stand und Preview-URL frisch prüfen. Code, GitHub-Sicherung, Tests, Deploy, KI-E2E, Gerätetest und Production immer getrennt berichten.


## v0.5 – Shared Design + Lehrer-first (in Arbeit)

Anforderung vom 02.10.2026:

- exakt derselbe Coco wie im gemeinsamen GradeCrew-Designsystem, keine alte Escape-Pinguin-Kopie
- keine Extra-Anmeldung im eigenständigen Escape-Lab
- keine neue Runde direkt von der Startseite
- Reihenfolge: **Lehrerbereich/Vorschau → Aufgaben festlegen bzw. prüfen → Start**

Technische Entscheidung:

- die offiziellen Coco-/Clay-Dateien werden unverändert aus `feature/shared-gradecrew-design-system` übernommen
- `gradecrew-brand.css` bleibt gemeinsame Basissprache; `crew-clay.css` wird ebenfalls aus dem Shared-Design-System übernommen
- echte KI bleibt geschützt und wird im Standalone-Lab nicht durch anonyme Zugriffe umgangen
- `GradeCrewEscapeAiBridge` bleibt der Integrationspunkt für die später bereits angemeldete GradeCrew-Lehrersitzung
- bestehende Escape-Spiel-/Lernlogik und der parallele Tutor-Cost-Guard-Branch werden nicht strukturell umgebaut

**Prüfstatus:** wird durch den v0.5-Patch-Workflow getestet; danach separater Escape-only Staging-Deploy. Production bleibt unverändert.

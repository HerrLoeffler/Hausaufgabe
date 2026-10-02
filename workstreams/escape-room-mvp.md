# Aufgabe: GC-GAMES-01 — Escape Room MVP

- Aktualisiert: 2026-10-02
- Referenzwelt: **„Die verriegelte Schule“**
- Aufgabenbranch: `feature/escape-room-mvp-v1`
- Draft-PR: `#10` gegen `lab/games-structure`
- Basis: `lab/games-structure@869ca416b868667c9e48c05f81c967fe6ad59020`
- v0.6 funktionaler Produktcommit: `649deb8e79470d69042cb40cfb4e107514a58592`
- v0.6 dokumentierter/deployter Code-Stand: `f38338dcd0cfad808f38b95e799c634e71b58e3d`
- v0.6 Patch-/Verifikationsrun: `36994939830`
- v0.6 Escape-only Preview-Run: `36995185868`
- Preview: `https://hausaufgabe-staging--gradecrew-escape-dev-mpuh7wg1.web.app`
- Production: **unverändert**

## Verbindliches Produktprinzip

> **Spaß motiviert; entscheidender Spielfortschritt wird durch nachgewiesenes Lernen verdient. Blindes Klicken/Raten darf nie die schnellste Strategie sein.**

„Die verriegelte Schule“ bleibt zunächst die einzelne Referenzwelt. Neue Welten und breitere Games-Integration erst nach Geräte-/UX-Abnahme.

## Referenzspiel

- 3 Räume + Finale: Klassenzimmer → Flur → Sekretariat → Ausgang
- 8 austauschbare Lernslots
- 4 Minirätsel: Tafelmuster, Türcode, Spindfolge, Schlüsselbrettfolge
- Inventar, Batterie/Taschenlampe, Hauptschlüssel
- lokale Wiederaufnahme und aktive Spielzeit
- Preflight
- Practice-Spiel; aktuell kein Live/Highscore/Multiplayer
- lokale Events; kein Analytics-Upload

## Crew-Rollen — verbindlich

Die gemeinsame GradeCrew-Rollenverteilung ist auch für Games maßgeblich:

- **Remy = Erstellen & Ideen**
- **Coco = Begleitung & Orientierung / Lernhilfe**
- **Emmi = Überarbeiten & Prüfen**
- **Wilma = Bewerten & Auswerten**

Konsequenz für Escape v0.6:

- Remy erscheint in der Aufgaben-Erstellung.
- Coco bleibt Explorer und Lernhilfe im eigentlichen Spiel.
- Keine zweite lokale Rolleninterpretation im Escape bauen.

## Shared Designsystem

v0.5/v0.6 beheben Asset-Drift, bei dem unter denselben Dateinamen alte reduzierte Maskottchenbilder lagen.

Aktuell verwendet Escape:

- Coco: Shared `assets/gradecrew/penguin-guide.svg` mit sechs Clay-Posen
- Remy: Shared `assets/gradecrew/elephant-create.svg` mit sechs Clay-Posen
- Remy-Erstellung: Shared `assets/gradecrew/clay-remy-writing.svg`
- gemeinsame `gradecrew-brand.css`
- gemeinsame `crew-clay.css`

Die einmalige v0.6-Patch-CI hat die Remy-Dateien per Git-Objekthash gegen `feature/shared-gradecrew-design-system` geprüft. Keine neue Escape-eigene Remy-/Coco-Datei bauen.

## Lehrer-first Startfluss

Neue Runde:

**Escape vorbereiten → Lehrerbereich → Aufgaben festlegen/prüfen → Escape mit diesen Aufgaben starten**

- kein direkter Start auf der ersten Seite
- Lehrer sieht vor Start Aufgaben, Lösungen, Lernhilfen und Transfer
- Save/Resume einer begonnenen Runde bleibt getrennt erhalten

## Remy-Erstellung v0.6

Erstellungskarte:

- Fach
- Klasse
- Thema
- Schwierigkeit
- eigener Wunsch optional
- `🎙 Mit Remy sprechen`
- Remy-Erstellaktion

Echter KI-Vertrag bleibt:

- vorhandenes Backend, kein zweites KI-Backend
- `GradeCrewEscapeAiBridge.generateTest(...)` als Host-Integration
- 16 bildfreie automatisch prüfbare Aufgaben pro Lauf
- 8 Hauptaufgaben + 8 passende Transferaufgaben
- nur Hauptaufgaben werden normale Escape-Lernslots
- KI erzeugt keine Räume, Inventarregeln, Codes, Progressionslogik oder Anti-Raten-Regeln

### Standalone-Lab ohne Extra-Login

Der Lab-Preview enthält keine zweite E-Mail-/Passwort-Anmeldung und keinen anonym geöffneten KI-Endpunkt.

Der frühere tote Button wurde in v0.6 korrigiert:

- Button bleibt **klickbar**, auch ohne Host-Bridge.
- Ohne Bridge übernimmt Remy Fach/Klasse/Thema als Lab-Vorschau und lässt die bestehenden Beispielaufgaben bewusst unverändert.
- Die UI erklärt ausdrücklich, dass dabei **keine neue KI-Erstellung vorgetäuscht** wird.
- Mit vorhandener `GradeCrewEscapeAiBridge` führt derselbe Weg die echte 8+8-Erstellung aus.

Kein API-Key im Browser, kein anonymes `generateTest`, kein paralleles Preview-KI-Backend.

## Sprache / Remy

`escape-remy-voice.js` ergänzt eine echte Diktieroberfläche für den Standalone-Preview:

- Progressive Enhancement mit `SpeechRecognition` / `webkitSpeechRecognition`
- `🎙 Mit Remy sprechen`
- gesprochener Text landet sichtbar im Feld `Eigener Wunsch`
- kein Raw-Audio wird gespeichert
- Browser ohne Speech Recognition bekommen einen lokalen Hinweis statt eines Fehlers

Wichtig: Das ist nur der Lab-Adapter. Der gemeinsame Produktstand hat bereits den Crew-Assistant-/Remy-Vertrag mit Text + Push-to-Dictate + Local-first Parser + AI-Fallback. Bei Hauptproduktintegration diesen gemeinsamen Vertrag benutzen und **keinen zweiten Natural-Language-Parser oder Voice-Backend im Escape** bauen.

Geplanter Produktweg bleibt:

**Sprache/Text → gemeinsamer Remy/Crew Assistant → strukturierte Felder/Aktion → Lehrer bestätigt → Generierung**

Später Siri/App Intents ebenfalls auf denselben Action-Contract legen.

## Lernschleife

1. Beim ersten Versuch richtig → kurze Erklärung + Fortschritt.
2. Erster Fehlversuch → konkrete fachliche Denkhilfe; Auswahlantworten werden neu gemischt.
3. Danach richtig → Transferaufgabe zum selben Lernziel erforderlich.
4. Mehrere Fehlversuche → Erklärung + aktiver Lernschritt/Merksatz + Transfer.
5. Erst erfolgreicher Transfer gibt Spielfortschritt frei.

Rätsel-Anti-Raten bleibt aktiv:

- Symbolfolgen → Hinweisquelle erneut lesen
- Tafelmuster → nach Fehlversuchen Quelle erneut prüfen
- Türcode → nach wiederholtem Raten Regal, Computer und Tafel erneut prüfen

## Antwortmodi / GradeCrew-Adapter

Sicher unterstützt:

- `single`
- `dropdown`
- `truefalse`
- `text`, wenn `manualReview === false` und akzeptierte Antworten vorhanden sind
- `number` mit numerischer Lösung, Toleranz ≥ 0 und optionaler Einheit

Manuell zu prüfender Freitext und komplexe/bildabhängige Typen bleiben fail-closed, bis sie ohne Informationsverlust und ohne unsichere automatische Fortschrittsfreigabe eingebunden werden können.

## Verifikation v0.6

### Produkt-/Patch-Prüfung

Run `36994939830`, Produktcommit `649deb8e79470d69042cb40cfb4e107514a58592`:

- **30/30 Tests grün**
- JavaScript-Syntaxchecks grün
- isolierter Build **v0.6.0 grün**
- Shared-Remy-Assets per Git-Hash geprüft
- Remy statt Coco in der Erstellung geprüft
- Standalone-Remy-Aktion klickbar geprüft
- keine vorgetäuschte KI-Erstellung ohne Bridge geprüft
- Voice-Control + Fallback geprüft
- Standalone-Build weiterhin ohne `firebase-config.js`

### Escape-only Staging Preview

Run `36995185868` auf Code-Stand `f38338dcd0cfad808f38b95e799c634e71b58e3d`:

- **30/30 Tests grün**
- Build **v0.6.0 grün**
- Firebase Credential grün
- Preview-Deploy grün
- URL: `https://hausaufgabe-staging--gradecrew-escape-dev-mpuh7wg1.web.app`

Temporäre v0.6-Patchdateien/Apply-Workflow wurden nach erfolgreicher Produktprüfung aus dem Branch entfernt. Ein zwischenzeitlicher Cleanup-Run des bereits gelöschten Einmal-Workflows schlug erwartbar fehl, weil sein Patch-Helfer in demselben Cleanup entfernt worden war; der aktuelle Head und der echte Escape-Preview-Run sind grün.

## Status — ausdrücklich getrennt

- **funktionaler Produktcode auf GitHub:** ja (`649deb8…`)
- **bereinigter/deployter Stand auf GitHub:** ja (`f38338d…` plus dieser Handoff-Commit)
- **automatisiert getestet:** ja, 30/30
- **isolierter Build:** ja, v0.6.0
- **Escape-only Staging Preview deployed:** ja
- **Remy-Rolle im Code/Build geprüft:** ja
- **Shared Remy/Coco im Code/Build geprüft:** ja
- **Voice-UI automatisiert geprüft:** ja
- **Mikrofon auf Martins echtem Browser bestätigt:** noch nicht dokumentiert
- **visuelle Abnahme auf Desktop/iPad/Handy:** noch nicht dokumentiert
- **echte KI-Erstellung über angemeldete GradeCrew-Sitzung:** noch nicht integriert/E2E getestet
- **voller gemeinsamer Remy-Natural-Language-Parser im Escape:** noch nicht integriert; bewusst nicht dupliziert
- **in Haupt-GradeCrew integriert:** nein
- **Production:** unverändert

## Parallele Arbeit / vor Änderungen frisch prüfen

Besonders relevant:

- `feature/gradecrew-app-integration` — aktueller gemeinsamer Crew Assistant / spätere Escape-Integration
- `feature/crew-assistant-v1` / PR #12 — Assistant-Grundlage
- bereits integrierte Remy-Telemetrie-/Parser-Arbeit aus PR #30/#31 im App-Integration-Stand
- `feature/shared-gradecrew-design-system` — freigegebene Crew-Artworks
- `fix/escape-tutor-cost-guards` / PR #27 — Tutor-/Kostenlogik
- `lab/games-design-system` / PR #28 — gamespezifische Design-Erweiterungen
- AI-Gateway-/Orchestrierungsbranches vor Backend-Umbauten

## Nicht verändern / Leitplanken

- Production nicht aus diesem Branch deployen.
- andere Games nicht funktional verändern.
- keine KI-generierte ausführbare Spiellogik.
- keine dauerhafte Speicherung von Schülerfragen ohne separaten Datenschutz-/Datenvertrag.
- Lösungsschlüssel bei Hauptproduktintegration nicht ungeschützt an Schüler ausliefern.
- keine globale AI-Memory-/Kosten-/Routing-Infrastruktur im Escape duplizieren.
- Shared-Designsystem als Assetquelle benutzen.
- Remy/Coco/Emmi/Wilma-Rollen nicht lokal neu definieren.
- Voice/Natural-Language bei Integration an den gemeinsamen Crew Assistant hängen.

## Nächste Schritte

1. Preview auf echtem Desktop testen: Remy-Bild, klickbarer Preview-Button, Lehrer-first Ablauf.
2. `🎙 Mit Remy sprechen` im aktuellen Browser testen und Mikrofonfreigabe/Transkript prüfen.
3. iPad/Handy: Darstellung, Lehrerbereich, Diktat-Fallback bzw. Unterstützung, Escape-Spiel selbst.
4. UX-Feedback direkt im Escape-Branch korrigieren.
5. Danach `feature/gradecrew-app-integration` + aktuelle Crew-/AI-/Design-Branches frisch prüfen.
6. Escape in die echte GradeCrew-Lehreransicht einbinden: vorhandene Sitzung → gemeinsamer Remy → `GradeCrewEscapeAiBridge` → 8+8-Erstellung → Prüfung → Start.
7. Gemeinsamen Remy-Natural-Language-Parser statt Escape-eigener Parserlogik verwenden.
8. Siri/App-Intent später über denselben strukturierten Action-Contract anbinden.
9. Welt 2 erst nach stabiler Referenzwelt und Geräteabnahme.

## Wiederaufnahme

Zuerst `START_HERE.md`, `AGENTS.md`, `GRADECREW_STATE.json`, `TODO.md`, `GAMES_STATUS.md`, `docs/games/LEARNING_GUARDRAILS.md`, `docs/games/GRADECrew_ESCAPE_ADAPTER.md`, diese Übergabe und PR #10 lesen. Danach Branchspitze, parallele Branches/PRs, CI und Preview frisch prüfen. Code, GitHub-Sicherung, Tests, Deploy, KI-E2E, Gerätetest und Production immer getrennt berichten.

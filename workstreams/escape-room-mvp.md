# Aufgabe: GC-GAMES-01 — Escape Room MVP

- Aktualisiert: 2026-10-02
- Referenzwelt: **„Die verriegelte Schule“**
- Aufgabenbranch: `feature/escape-room-mvp-v1`
- Draft-PR: `#10` gegen `lab/games-structure`
- Basis: `lab/games-structure@869ca416b868667c9e48c05f81c967fe6ad59020`
- v0.5 funktionaler Produktcommit: `84e3a71d82c27522c994dd94af297abfafab41ed`
- v0.5 getesteter/deployter Code-Stand: `3cf6d0b235a652f93fd2b4af32f4c2e5c0dfdb68`
- v0.5 Patch-/Verifikationsrun: `36990569083`
- v0.5 Escape-only Preview-Run: `36990874389`
- Preview: `https://hausaufgabe-staging--gradecrew-escape-dev-mpuh7wg1.web.app`
- Production: **unverändert**

## Aktueller Produktstand v0.5

„Die verriegelte Schule“ bleibt zunächst die einzelne Referenzwelt. Neue Welten und eine breitere Games-Integration folgen erst nach Geräte-/UX-Abnahme.

Verbindliches Lernprinzip:

> **Spaß motiviert; entscheidender Spielfortschritt wird durch nachgewiesenes Lernen verdient. Blindes Klicken/Raten darf nie die schnellste Strategie sein.**

Vorhanden:

- 3 Räume + Finale: Klassenzimmer → Flur → Sekretariat → Ausgang
- 8 austauschbare Lernslots
- 4 Minirätsel: Tafelmuster, Türcode, Spindfolge, Schlüsselbrettfolge
- Inventar, lokale Wiederaufnahme, aktive Spielzeit und Preflight
- Anti-Raten-Sperren für Lernfragen und Rätsel
- Transferaufgabe nach einem Fehlversuch, bevor Spielfortschritt freigegeben wird
- sicher automatisch prüfbare Auswahl-, Text- und Zahlantworten
- kompakte Lehrerprüfung und Bearbeitung
- Coco-Hilfe local-first; externe Tutor-KI nur über spätere Bridge
- Practice-Spiel, aktuell kein Live/Highscore/Multiplayer

## v0.5 — Shared Coco / gemeinsames GradeCrew-Designsystem

Der frühere Escape-Stand hatte unter `assets/gradecrew/penguin-guide.svg` noch eine alte, reduzierte Pinguinzeichnung, obwohl der Dateiname dem GradeCrew-Asset entsprach. Das war die Ursache dafür, dass Coco im Escape anders aussah als auf der GradeCrew-Seite.

v0.5 behebt das bewusst ohne eine dritte Maskottchenkopie:

- offizielles `penguin-guide.svg` unverändert aus `feature/shared-gradecrew-design-system`
- offizielles `penguin-guide-welcome.svg` ebenfalls aus dem Shared-Designsystem
- das offizielle Sheet enthält `pose-1` bis `pose-6`
- Begrüßung nutzt `#pose-1`
- Hilfe nutzt `#pose-4`
- Explorer nutzt `#pose-5`
- `gradecrew-brand.css` wird als gemeinsame GradeCrew-Basissprache eingebunden
- `crew-clay.css` wird ebenfalls aus dem Shared-Designsystem übernommen
- Escape-spezifische Styles dürfen danach nur Spielspezifika ergänzen

Der Patch-Workflow hat beim Kopieren den Git-Objekthash des Coco-Assets gegen den Shared-Design-Branch geprüft. Damit ist nicht nur der Dateiname, sondern die tatsächlich übernommene Datei identisch mit diesem freigegebenen Shared-Stand.

## v0.5 — Lehrerbereich vor Spielstart

Neue Reihenfolge für eine neue Runde:

**Escape vorbereiten → Lehrerbereich → Aufgaben erstellen/prüfen → Escape mit diesen Aufgaben starten**

Konkret:

- der bisherige direkte CTA „Escape starten“ wurde zu **„Escape vorbereiten“**
- dieser öffnet zuerst den Lehrerbereich
- der alte zweite „Lehrer-Vorschau“-Einstieg ist für neue Runden ausgeblendet
- im Lehrerbereich steht sichtbar der Ablauf **1 Aufgaben festlegen · 2 Kurz prüfen · 3 Escape starten**
- erst der Button **„Escape mit diesen Aufgaben starten“** ruft den bestehenden, bereits getesteten Spielstart auf
- Resume-/Save-Logik der bestehenden Runde bleibt getrennt erhalten

`escape-teacher-flow.js` kapselt diese Reihenfolge, ohne die vorhandene Engine unnötig umzubauen.

## v0.5 — keine Extra-Anmeldung im Escape-Lab

Die kurzzeitig in v0.4 vorhandene zusätzliche E-Mail-/Passwort-Anmeldung im eigenständigen Escape-Preview wurde vollständig entfernt.

Wichtig:

- **kein spezieller Escape-Account nötig**
- **keine E-Mail-/Passwortfelder im Standalone-Lab**
- keine `signInWithEmailAndPassword`-Abhängigkeit im Escape-AI-Client
- keine Standalone-`firebase-config.js` mehr im Escape-Build
- der geschützte GradeCrew-Callable `generateTest` wird nicht anonym umgangen

Der echte Generator bleibt vorbereitet über:

`GradeCrewEscapeAiBridge.generateTest(...)`

Bei der späteren Integration in die GradeCrew-Lehreransicht verwendet Escape damit die **bereits vorhandene authentifizierte Lehrersitzung**. Es entsteht keine zweite Anmeldung.

Im eigenständigen Preview bleibt der KI-Button deshalb bewusst deaktiviert, solange der Host keine Bridge bereitstellt. Die Beispielaufgaben können vollständig geprüft, bearbeitet und gespielt werden.

## KI-Aufgabenvertrag

Der einfache Lehrer-Generator ist für folgende Eingaben vorbereitet:

- Fach
- Klasse
- Thema
- Schwierigkeit
- optional eigener Wunsch

Ein KI-Lauf soll weiterhin 16 bildfreie, sicher automatisch prüfbare Aufgaben liefern:

- 8 Hauptaufgaben
- 8 passende Transferaufgaben

Nur die Hauptaufgaben erscheinen als normale Escape-Lernslots. Die Transferaufgaben greifen in die bestehende Lernschleife. KI erzeugt **keine** Räume, Inventarregeln, Codes, Progressionslogik oder Anti-Raten-Regeln.

Sicher unterstützte GradeCrew-Typen:

- `single`
- `dropdown`
- `truefalse`
- `text`, nur wenn automatisch sicher prüfbar und akzeptierte Antworten vorhanden sind
- `number` mit Lösung, Toleranz und optionaler Einheit

Manuell zu prüfender Freitext und bildabhängige/komplexe Typen bleiben fail-closed.

## Lernschleife

1. Beim ersten Versuch richtig → kurze Erklärung + Fortschritt.
2. Erster Fehlversuch → konkrete fachliche Denkhilfe; bei Auswahl werden Antworten neu gemischt.
3. Danach richtige Hauptantwort → noch kein Fortschritt; passende Transferaufgabe muss gelöst werden.
4. Mehrere Fehlversuche → Erklärung + aktiver Lernschritt/Merksatz + Transfer.
5. Erst erfolgreicher Transfer gibt den Spielfortschritt frei.

Rätsel sind ebenfalls gegen Raten gehärtet: wiederholte falsche Eingaben erzwingen das erneute Lesen der tatsächlichen Hinweisquelle.

## Verifikation v0.5

Patch-/Produktprüfung `36990569083`:

- **27/27 Tests grün**
- JavaScript-Syntaxcheck grün
- isolierter Build **v0.5.0 grün**
- Shared-Coco mit sechs offiziellen Posen geprüft
- Standalone-Build ohne `firebase-config.js` geprüft
- Regression Lehrerbereich vor Start: grün
- Regression keine Standalone-Firebase-Anmeldung: grün

Escape-only Staging-Preview `36990874389` auf Code-Stand `3cf6d0b235a652f93fd2b4af32f4c2e5c0dfdb68`:

- **27/27 Tests grün**
- isolierter Build **v0.5.0 grün**
- Firebase Credential grün
- Preview-Deploy grün
- URL: `https://hausaufgabe-staging--gradecrew-escape-dev-mpuh7wg1.web.app`

Temporäre v0.5-Patchskripte und der einmalige Apply-Workflow wurden nach erfolgreichem Produktcommit wieder aus dem Branch entfernt.

## Status — ausdrücklich getrennt

- **funktionaler Produktcode auf GitHub:** ja (`84e3a71…`)
- **bereinigter/deployter Code-Stand auf GitHub:** ja (`3cf6d0b…`)
- **automatisiert getestet:** ja, 27/27
- **isolierter Build:** ja, v0.5.0
- **Escape-only Staging Preview deployed:** ja
- **Coco aus Shared-Designsystem im Code/Build verifiziert:** ja
- **Lehrer-first Startfluss automatisiert verifiziert:** ja
- **keine Extra-Anmeldung automatisiert verifiziert:** ja
- **echte visuelle Abnahme am Browser/iPad/Handy:** noch nicht dokumentiert
- **echte KI-Erstellung über bereits angemeldete GradeCrew-Sitzung:** noch nicht integriert/E2E getestet
- **in Haupt-GradeCrew integriert:** nein
- **Production:** unverändert

## Parallele Arbeit / nicht blind überschreiben

Vor strukturellen Änderungen frisch prüfen:

- `fix/escape-tutor-cost-guards` / PR #27 — Tutor-/Kostenlogik
- `feature/shared-gradecrew-design-system` — gemeinsame Produkt-Designquelle
- `feature/gradecrew-design-foundation-v1`
- `feature/design-dashboard-v1`
- `lab/games-design-system` / PR #28 — gamespezifische Design-Erweiterungen
- `feature/gradecrew-app-integration` — spätere Hauptproduktintegration
- aktuelle AI-/Gateway-/Orchestrierungsbranches vor Backend-Umbauten

Keine parallele neue Coco-Datei, kein zweites KI-Backend und keine separate Escape-Authentifizierung bauen.

## Nicht verändern / Leitplanken

- Production nicht aus diesem Branch deployen.
- andere Games nicht funktional verändern.
- keine KI-generierte ausführbare Spiellogik; KI liefert nur validierte Inhaltsdaten.
- keine dauerhafte Speicherung von Schülerfragen ohne separaten Datenschutz-/Datenvertrag.
- Lösungsschlüssel bei Hauptproduktintegration nicht ungeschützt an Schüler ausliefern.
- globale AI-Memory-/Kosten-/Routing-Infrastruktur nicht im Escape-Branch duplizieren.
- Shared-Designsystem als Quelle benutzen statt Assets lokal neu zu interpretieren.

## Nächste Schritte

1. v0.5 Preview auf echtem Desktop öffnen und **hart neu laden**.
2. Visuell bestätigen: Coco entspricht dem aktuellen Shared-GradeCrew-Coco; keine alte Pinguinzeichnung mehr.
3. Flow prüfen: **Escape vorbereiten → Lehrerbereich → Fragen prüfen → Escape mit diesen Aufgaben starten**.
4. Prüfen, dass im Standalone-Lab **keine Anmeldung** mehr erscheint.
5. Danach denselben Stand auf iPad/Handy testen: Dialog, Sticky-Startbereich, Coco-Größen, Touchziele, Save/Resume.
6. UX-Fehler im Escape-Branch korrigieren.
7. Erst danach `feature/gradecrew-app-integration` und aktuelle AI-/Design-Branches erneut frisch prüfen und `GradeCrewEscapeAiBridge` an die bereits angemeldete Lehrersitzung anbinden.
8. Dann echte KI-Erstellung 8+8 E2E testen und fachlich sichten.
9. Welt 2 erst nach stabiler Referenzwelt/Geräteabnahme.

## Wiederaufnahme

Zuerst tatsächliche Branchspitze, PR #10, offene parallele PRs/Branches und die auf diesem Branch vorhandenen Projektregeln/Statusdateien frisch prüfen. `START_HERE.md` ist auf diesem Escape-Branch aktuell nicht vorhanden und darf nicht als gelesen behauptet werden. Danach diese Übergabe, `GAMES_STATUS.md`, `docs/games/LEARNING_GUARDRAILS.md` und `docs/games/GRADECrew_ESCAPE_ADAPTER.md` lesen. Code, GitHub-Sicherung, Tests, Deploy, Geräteabnahme, Hauptproduktintegration und Production immer getrennt berichten.

# Aufgabe: GC-GAMES-01

- Aktualisiert (UTC): 2026-10-02
- Auftrag: Escape-Room-MVP **„Die verriegelte Schule“** als lernwirksames Referenzspiel fertigstellen
- Aufgabenbranch: `feature/escape-room-mvp-v1`
- Draft-PR: `#10` gegen `lab/games-structure`
- Basis: `lab/games-structure@869ca416b868667c9e48c05f81c967fe6ad59020`
- Produktcheckpoint v0.3: `91192bcfd21611a9fd1a6c8ea5711f38704a68c9`
- letzter verifizierter/deployter v0.3-Stand: `33d0758dc76c6e22fdc4a1b87a738e99395b4a42`
- verifizierter Preview-Run: `36977730312`
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
- kleine Explorer-Figur / Point-and-Click
- Practice-Spiel, kein Live/Highscore/Multiplayer
- lokale Events, kein Analytics-Upload

## Lernschleife v0.3

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

## Remy / AI only when needed

`escape-tutor.js` arbeitet lokal-first:

1. Sitzungscache
2. bekannte fragebezogene Verständnisfragen
3. generische lokale Hilfe aus Hinweis/Erklärung/Transfer
4. erst dann optionale externe `GradeCrewTutorBridge`
5. lokaler fachlicher Fallback

Standardfälle wie „Wie fange ich an?“, „Welcher Schritt?“, „Erklär einfacher“, „Hast du ein Beispiel?“ und „Sag mir die Lösung“ brauchen keine API. Eine wirklich individuelle unbekannte Schülerfrage kann später die externe Bridge nutzen. Remy selbst schaltet nie Spielfortschritt frei.

Die globale Kosten-/Memory-/Misconception-Infrastruktur bleibt eine separate Baustelle. Keine parallele Langzeitspeicherung auf dem Escape-Branch.

## Antwortmodi / GradeCrew-Inhalte

Sicher unterstützt:

- `single`
- `dropdown`
- `truefalse`
- `text`, wenn `manualReview === false` und akzeptierte Antworten vorliegen
- `number` mit numerischer Lösung, Toleranz ≥ 0 und optionaler Einheit

Manuell zu prüfender Freitext bleibt fail-closed und darf niemals automatisch Fortschritt freigeben. Komplexe/bildabhängige Typen bleiben blockiert, bis Escape sie ohne Informationsverlust darstellen kann.

## GradeCrew-Vorbereitungsschicht

Vorhanden:

- `gradecrew-question-adapter.js`
- `gradecrew-escape-builder.js`
- `GradeCrewEscapeIntegration`

Geplanter/technisch vorbereiteter Ablauf:

**GradeCrew-Test → genau 8 geeignete Aufgaben → Lernhilfe-/Transferpakete → Sicherheitsprüfung → Escape-Preflight → Lehrerprüfung → startfähiges Launch-Paket.**

Die Hauptprodukt-Schaltfläche **„Als Escape Room spielen“** ist noch nicht in `feature/gradecrew-app-integration` verdrahtet. Vor dieser Integration dort erneut aktuellen Branch/PR-/Parallelstand prüfen.

## Lehreroberfläche v0.3

Der vorherige Lab-Editor zeigte zu viele didaktische Felder gleichzeitig. v0.3 orientiert sich deshalb kompakt am aktuellen GradeCrew-Testeditor:

- pro Frage zuerst **Aufgabe + Antworttyp + richtige Lösung**
- Lernziel, Hinweis, Erklärung, Remediation und Transfer nur über `Lernhilfe & Transfer anzeigen`
- Bearbeitungsdialog: **Frage + Antworten + richtige Lösung** sofort sichtbar
- didaktische Zusatzfelder unter `Lernhilfe & Transfer anpassen (optional)` eingeklappt
- bestehende Validierung/Preflight bleibt erhalten
- Auswahlfragen im Lab direkt editierbar
- Freitext/Zahl sollen bei echter Hauptproduktintegration im GradeCrew-Testeditor bearbeitet werden

`escape-teacher-compact.js` implementiert diese zusätzliche kompakte UI-Schicht, ohne den Haupt-App-Editor zu duplizieren.

## Verifikation v0.3

Preview-Run `36977730312` auf Commit `33d0758dc76c6e22fdc4a1b87a738e99395b4a42`:

- Escape-/Remy-/Adapter-/Builder-Tests: **21/21 grün**
- expliziter Regressionstest: **einmal falsch → danach richtig → Transfer erforderlich**: grün
- kompakter Lehrereditor: Test grün
- isolierter Escape-Build: grün
- Lab-Release-Manifest: `0.3.0`
- Firebase Credential: grün
- Escape-only Preview-Deploy: grün
- URL: `https://hausaufgabe-staging--gradecrew-escape-dev-mpuh7wg1.web.app`

Nach dem Deploy wurden nur temporäre Patch-/Workflow-Hilfsdateien entfernt und diese Übergabe aktualisiert. Der deployte Produktcode wurde dabei nicht verändert.

## Statusvokabular

- **Produktcode auf GitHub:** ja
- **automatisiert getestet:** ja, 21/21
- **isolierter Build:** ja
- **Escape-only Staging Preview deployed:** ja
- **am echten Desktop/iPad/Handy bestätigt:** noch nicht dokumentiert
- **in Haupt-GradeCrew integriert:** nein
- **Production:** unverändert
- **externe Remy-KI:** noch nicht aktiviert
- **Lehrer-Auth für Lösungsschlüssel:** noch offen

## Nicht verändern / Leitplanken

- Production nicht aus diesem Branch deployen.
- andere Games nicht funktional verändern.
- keine frei von KI erfundene ausführbare Spiellogik; KI liefert nur validierte Inhaltsdaten.
- keine dauerhafte Speicherung von Schülerfragen ohne separaten Datenschutz-/Datenvertrag.
- Lösungsschlüssel bei Hauptproduktintegration nicht ungeschützt an Schüler ausliefern.
- keine globale AI-Memory-/Kosten-Infrastruktur parallel nachbauen.

## Nächste Schritte

1. v0.3 auf echtem Desktop und iPad testen: insbesondere falsche Antwort → Denkhilfe → Transfer sowie kompakte Lehrerbearbeitung.
2. UX-Feedback aus diesem Gerätetest direkt im Escape-Branch korrigieren.
3. Danach `feature/gradecrew-app-integration`, relevante Feature-/Fix-/Integrationsbranches und offene PRs frisch prüfen.
4. Hauptprodukt-Fluss **„Als Escape Room spielen“** anbinden: Test erstellen/öffnen → 8 Aufgaben auswählen → Lernpakete vorbereiten → kompakte Lehrerprüfung → Preflight → Spiel starten.
5. Lehreransicht bei echter Integration an Auth/Berechtigungen binden.
6. Externe Tutor-KI nur serverseitig/datenschutzkonform anbinden; Local-first bleibt davor.
7. Welt 2 erst nach stabiler Referenzwelt.

## Wiederaufnahme

Zuerst `START_HERE.md`, `AGENTS.md`, `GRADECREW_STATE.json`, `TODO.md`, `GAMES_STATUS.md`, `docs/games/LEARNING_GUARDRAILS.md`, `docs/games/GRADECrew_ESCAPE_ADAPTER.md`, diese Übergabe und PR #10 lesen. Danach Branchspitze, parallele Branches/PRs, aktuellen CI-Stand und Preview-URL frisch prüfen. Code, GitHub-Sicherung, Tests, Deploy, Gerätetest und Production immer getrennt berichten.

## v0.4 – Coco + kompakte KI-Aufgabenerstellung

- Sichtbare Escape-Begleitung ist **Coco**; Emoji-Platzhalter und sichtbare „Remy“-Texte wurden entfernt.
- Canonical Escape-Art: `assets/gradecrew/penguin-guide.svg` und `penguin-guide-welcome.svg`.
- Neue Lehrer-Karte: Fach, Klasse, Thema, Schwierigkeit, optionaler Wunsch → **8 Escape-Aufgaben erstellen**.
- Wiederverwendung des bestehenden authentifizierten GradeCrew-Callables `generateTest`; kein zweites KI-Backend und kein clientseitiger API-Key.
- Ein KI-Lauf erzeugt 8 Hauptaufgaben + 8 passende Transferaufgaben; der Escape-Adapter/Preflight bleibt das Gate.
- Generator beschränkt sich auf sicher automatisch prüfbare, bildfreie Typen.
- Eigenständiger Preview: einmalige GradeCrew-E-Mail/Passwort-Anmeldung über Firebase Auth. In der späteren Haupt-App ist `GradeCrewEscapeAiBridge` als Sitzungs-/Generator-Brücke vorgesehen.
- Generierter Satz wird im Preview lokal gespeichert und bei Reload wiederhergestellt; manuelle Änderungen werden mitgesichert.
- Production bleibt unberührt.

**Prüfstatus dieses Abschnitts:** Codeänderungen werden durch den v0.4-Patch-Workflow getestet und erst danach committed. Escape-only Staging-Deploy erfolgt anschließend durch den bestehenden Preview-Workflow; Geräteabnahme bleibt separat.

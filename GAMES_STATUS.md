# GradeCrew Games – aktueller Arbeitsstand

Stand: 01.10.2026. Diese Datei beschreibt die Spiele und den gemeinsamen Games-Bereich. Für Escape-Arbeit zusätzlich `workstreams/escape-room-mvp.md` und `docs/games/LEARNING_GUARDRAILS.md` lesen.

## Aktiver Stand

| Feld | Wert |
| --- | --- |
| Repository | HerrLoeffler/Hausaufgabe |
| Struktur-Basis | lab/games-structure |
| Escape-Feature-Branch | feature/escape-room-mvp-v1 |
| Escape-Draft-PR | #10 gegen lab/games-structure |
| Lab-Projekt | hausaufgabe-staging |
| Escape Dev Channel | gradecrew-escape-dev |
| Escape Dev URL | https://hausaufgabe-staging--gradecrew-escape-dev-mpuh7wg1.web.app |
| Escape Dev Version | v0.2.0 Lern-MVP |
| Games Dev Channel | gradecrew-games-dev |
| Games Integrated Preview Channel | gradecrew-games-preview |
| Production | unverändert; kein Games-/Escape-Workflow darf Production deployen |

## Preview-Strategie

Während „Die verriegelte Schule“ zum Referenzspiel ausgebaut wird, hat Escape bewusst einen **eigenen Entwicklungs-Preview**. Der gemeinsame Games Hub bleibt erhalten, wird aber vom Escape-Feature-Branch nicht mehr automatisch überschrieben.

- `gradecrew-escape-dev`: aktuelle Escape-Baustelle, nur isolierter Escape-Build.
- `gradecrew-games-dev`: gemeinsamer experimenteller Hub; auf diesem Branch nur manuell deploybar.
- `gradecrew-games-preview`: später gemeinsamer geprüfter/integrationsreifer Games-Stand.
- Einzelne fertige Spiele sollen langfristig wieder Unterpfade des gemeinsamen Systems sein. Der eigene Escape-Link ist eine Entwicklungsumgebung, keine neue dauerhafte Produkt-Domain.

Alle Preview-Workflows verwenden ausschließlich Firebase Hosting im Projekt `hausaufgabe-staging`. Functions, Firestore und Production werden nicht deployed.

## Vorhandene Spiele

| Spiel | Frontend | Backend-Codebase / Status | Modi |
| --- | --- | --- | --- |
| Fast Quiz | lab/fast-quiz/ | fastquiz / fastQuizApi | Üben, Highscore, Live |
| Fehlerjagd Deutsch | lab/fehlerjagd-deutsch/ | fehlerjagd / fehlerjagdApi | Üben, Highscore, Live |
| Vocab Rush | lab/vocab-rush/ | vocabrush / vocabRushApi | Üben, Highscore, Live |
| Escape Room – Die verriegelte Schule | lab/escape-room/ | isolierter Lern-MVP, noch kein echtes Tutor-/Klassenbackend | **nur Üben** |

Die drei bisherigen Spiele behalten ihre vorhandenen Live-Systeme. Escape wird weiterhin nicht in Rundencode, Highscore oder Live angeboten.

## Escape Room v0.2 – Lern-MVP

### Kernspiel

- 3 Räume + Finale
- 8 validierte Lernslots
- 4 deterministische Minirätsel
- Inventar, Hinweise, aktive Spielzeit, lokales Fortsetzen
- kleine Explorer-Figur bewegt sich zu angeklickten Bereichen
- dezente zusätzliche Raum-/Interaktionsanimationen

### Lernen statt Durchraten

Die alte v0.1-Regel „nach drei Fehlern Lösung zeigen und weiter“ wurde entfernt.

- normale Wiederholung bei frühen Fehlversuchen
- Antwortoptionen werden neu gemischt
- ab wiederholten Fehlversuchen kurze Erklärung + aktive Verarbeitung eines zentralen Lerninhalts
- danach neue Transferaufgabe zum selben Lernziel
- erst erfolgreiche Transferaufgabe schaltet den Spielfortschritt frei
- auch eine erst nach mehreren Multiple-Choice-Versuchen gefundene richtige Antwort führt in den Lerncheck
- Symbolfolgen sperren nach wiederholtem Raten und verlangen erneutes Lesen des ursprünglichen Hinweises

Verbindliche Produktregel: `docs/games/LEARNING_GUARDRAILS.md`.

### Remy / AI only when needed

- lokale geprüfte Antworten für bekannte Verständnisfragen
- normalisierter Sitzungscache für Wiederholungen
- optionale `GradeCrewTutorBridge` für spätere externe KI
- aktuell **kein** externer Tutor-API-Aufruf im Lab
- Hilfe allein schaltet niemals Fortschritt frei
- Schüler-Rohtext wird nicht in den Event-Hook geschrieben

### Lehrerübersicht

Vor dem Start sieht die Lehrkraft ohne Durchspielen:

- Lernziel
- Frage
- Lösung
- Hinweis
- Remediation
- Transferaufgabe
- vollständigen Spielweg

Jeder Lernslot kann im Lab direkt bearbeitet werden und wird danach erneut validiert. `GradeCrewEscapeIntegration` stellt einen validierten Frage-Set-Vertrag für die spätere Hauptprodukt-Anbindung bereit. Das ist noch nicht der echte GradeCrew-Testadapter.

Die Lab-Lehreransicht ist weiterhin **nicht authentifiziert**. In der realen Integration müssen Lösungen/Lehrerrechte geschützt werden.

## Verifiziert

### v0.1 Historie

- integrierter Code-Stand `664f605` vollständig grün, Workflow `36924444942`
- Hub-/Browserflows mit Desktop/Tablet/Mobile bestanden
- gemeinsamer Games-Dev-Preview erfolgreich veröffentlicht

### v0.2 Escape-only

Workflow `Escape Room Dev Preview`, Run `36933237316`, Commit `afbec01a4807d52b00a23c0ab804b37b0645b402`:

- 7/7 Escape-Verhaltenstests grün
- Lehrerbearbeitung getestet
- verpflichtende Lernschleife + Transfer getestet
- lokaler Remy-Knowledge-Hit/Cache ohne externe Bridge getestet
- Anti-Raten-Sperre bei Symbolfolge getestet
- kompletter Lösungsweg + Save/Resume getestet
- isolierter Escape-Build v0.2.0 grün
- Firebase Hosting Preview `gradecrew-escape-dev` erfolgreich deployed
- URL: `https://hausaufgabe-staging--gradecrew-escape-dev-mpuh7wg1.web.app`

**Prüfgrenze:** Der neue Escape-only Workflow ist automatisiert grün und deployed. Ein echter physischer iPad-/Handy-Test des v0.2-Stands ist noch offen. Die vollständigen gemeinsamen Chromium-/PR-Checks werden separat als PR-CI-Nachweis betrachtet. Keine externe Tutor-KI und kein echtes GradeCrew-Klassenbackend sind angeschlossen.

## Verbindliche Arbeitsregeln

- Production nur nach ausdrücklicher Freigabe und separatem Produktionspfad.
- Escape zunächst als Referenzspiel sauber abnehmen; erst danach in den gemeinsamen Games-Stand integrieren.
- Keine frei von KI erfundene ausführbare Spiellogik; KI liefert später nur validierte Inhalte.
- Spaß ist erwünscht, aber Lernfortschritt darf nicht durch systematisches Durchprobieren ersetzbar sein.
- Externe KI nur nach dem Prinzip deterministisch → lokale Wissensbasis → Cache → günstige KI → starkes Modell als Ausnahme.
- Keine dauerhafte serverseitige Sammlung von Schülerfragen ohne separaten Datenschutz-/Telemetry-Vertrag.
- Lösungen und Lehreransichten bei echter Integration nicht ungeschützt an Schüler ausliefern.

## Nächste Aufgaben

1. vollständigen PR-CI-/Chromium-Lauf für den v0.2-Head prüfen und eventuelle Regressionen beheben.
2. Escape-v0.2 auf echtem Desktop/iPad testen; besonders Touch, Lernschleife, Remy und Lehrereditor.
3. aktuellen `feature/gradecrew-app-integration`-Fragevertrag lesen und einen echten Adapter in isolierter Form bauen.
4. externe Tutor-KI später über serverseitige GradeCrew-Brücke integrieren; lokale Wissens-/Cache-Stufe davor beibehalten.
5. Lehreransicht bei Hauptprodukt-Integration an Auth/Berechtigungen binden.
6. nach stabiler Referenzwelt Welt 2 planen.

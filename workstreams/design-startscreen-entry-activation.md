# GradeCrew – Startscreen Entry-Aktivierung

Stand: 2026-10-03

## Befund

Der neue öffentliche Startscreen war vollständig im Preview-Build enthalten, wurde im Browser aber nicht aktiviert.

Ursache: `startup.js` importierte `gradecrew-entry-flow.js`, rief die exportierte Funktion `installGradeCrewEntryFlow()` aber nicht auf. Dadurch blieb das alte statische `authView` aus `index.html` sichtbar, obwohl Build und bisherige Regressionstests grün waren.

## Fix

- `startup.js`: benannten Export `installGradeCrewEntryFlow` laden und vor `app.js` explizit ausführen.
- Start wird abgebrochen und sichtbar als Ladefehler gemeldet, falls der Entry nicht installiert werden kann.
- Entry-Import auf `?v=3` angehoben.
- `ai-entry-flow.test.js`: schützt jetzt ausdrücklich Import **und tatsächlichen Aufruf** vor dem App-Import.
- `gradecrew-design-foundation.test.mjs`: gleiche Reihenfolge als Design-Vertrag abgesichert.

## Nicht verändert

- Firebase Auth
- Functions
- Firestore Rules
- Secure Assessment
- Test-/Bewertungslogik
- Production

## Status

- Root Cause: gefunden
- aktiver Fix-Branch: `feature/design-startscreen-entry-activation-fix`
- vorheriger Zwischenbranch `fix/design-startscreen-entry-activation`: superseded, keine zweite Lösung
- Code auf GitHub: ja
- CI: durch diesen Commit ausgelöst; Ergebnis noch zu prüfen
- Integration in `feature/gradecrew-app-integration`: erst nach grünem CI
- Hosting Preview: danach neu deployen
- Gerätetest: offen
- Production: unverändert

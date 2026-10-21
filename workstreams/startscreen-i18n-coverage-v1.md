# GradeCrew Startscreen i18n coverage v1

## Anlass

Der neue Crew-first Startscreen wurde nach der englischen UI-Integration aufgebaut und enthält daher zusätzliche deutsche UI-Texte, die im bestehenden `en-GB`-Katalog noch nicht vollständig abgedeckt waren. Martin hat ausdrücklich festgelegt: Der Startscreen muss beim Wechsel der Oberflächensprache vollständig mitwechseln.

## Produktgrenze

Diese Änderung betrifft ausschließlich UI-Sprache.

Nicht gekoppelt werden:
- Test-/Aufgabensprache;
- Schülerantworten;
- Bewertungssprache;
- gespeicherte Prüfungsinhalte.

Die bestehende Trennung aus `shared/i18n` bleibt unverändert.

## Abgedeckt

Englische UI-Übersetzungen für:
- Public Navigation;
- Coco-Hero, Kurzclaim und Crew-Rollen;
- Schüler-Testcode-Leiste;
- vier Benefit-Texte;
- Login-/Registrierungsübergänge;
- Gastname-/Tutorial-Einstieg;
- Tutorial-Texte und vorbereitete Demoauswahl;
- Account-Speicher-Gate;
- relevante aria-labels, Alt-/Placeholder-Texte und dynamische Tutorialmuster.

Der vorhandene Browser-i18n-MutationObserver übersetzt den von `gradecrew-entry-flow.js` dynamisch erzeugten DOM bereits beim Einfügen und bei späterem DE/EN-Wechsel. Es wird keine zweite Übersetzungslogik im Startscreen eingeführt.

## Tests

`i18n-integration.test.mjs` schützt die kritischen neuen Startscreen-Quelltexte gegen fehlende englische Katalogeinträge.

## Status

- Code auf GitHub: ja
- UI-/Assessment-/Grading-Trennung erhalten: ja
- PR/CI: offen
- Integration: offen
- Preview: offen
- Production: unverändert

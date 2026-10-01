# Aufgabe: gradecrew-design-foundation-v1

- Aktualisiert (UTC): 2026-10-01
- Verantwortlicher Chat / Auftrag: GradeCrew Designchat – visuelle Produktgrundlage, Screen-System, Crew-System und erste Design-Tokens
- Aufgabenbranch: `feature/gradecrew-design-foundation-v1`
- Basiscommit: `cfb9ec184bc1b64784239c8f978a5d11dcebe5e2` (`main`)
- Betroffene Dateien: `design/*`, `workstreams/design-system.md`; Registry-Dateien erst bei Integration aktualisieren
- Überschneidungen mit anderen Aufgaben: Website `feature/gradecrew-app-integration`; iPad/älteres Shared-Design `feature/shared-gradecrew-design-system`; Tutorial/Polish; Spiele. Keine Produktdateien ohne Vergleich dieser Branches verändern.

## Ziel und gewünschtes Verhalten

Eine gemeinsame, dokumentierte GradeCrew-Designgrundlage schaffen, bevor einzelne Screens weiter poliert werden. Sie soll Website, Teacher-App, Schüleransicht, Secure und Spiele langfristig konsistent halten, ohne die ruhigen Prüfungsabläufe mit dekorativer Gestaltung zu überladen.

Die vorhandene Crew-Konzeption wird beibehalten und systematisiert:
- Coco (Pinguin): Guide / Orientierung / Hilfe
- Remy (Elefant): Erstellen / KI / Entwurf
- Emmi (Fuchs): Verbessern / Varianten / Überarbeiten
- Wilma (Eule): Prüfen / Qualität / Veröffentlichung / Bewertung

## Umfang / nicht verändern

In diesem ersten Teilschritt:
- Designregeln und Prioritäten dokumentieren
- Screen-Map anlegen
- Crew-Einsatzsystem definieren
- Design-Tokens als neutrale technische Grundlage anlegen

Noch nicht:
- bestehende Web-/App-Oberfläche umbauen
- Production oder Staging deployen
- alte Crew-Assets löschen/ersetzen
- Tutorial-Logik, Security, Prüfungsabläufe oder Geschäftslogik ändern
- neue Tierrollen erfinden, bevor die vorhandenen Rollen bewusst überprüft wurden

## Akzeptanzkriterien

- Eigener Designbranch auf GitHub vorhanden.
- Verbindliche Designprinzipien einschließlich Informationshierarchie, Maskottchen-Dichte, Zustände und Accessibility dokumentiert.
- Alle wesentlichen Lehrer-, Schüler-, Admin- und Systemansichten in einer Screen-Map erfasst.
- Crew-Rollen und Einsatzmatrix dokumentiert.
- Erste Design-Tokens sind maschinenlesbar und referenzierbar, aber noch nicht ungeprüft an bestehende Produkt-CSS angeschlossen.
- Offene Überschneidungen mit Website/Tutorial/iOS sind ausdrücklich dokumentiert.

## Zwischenstand

- Lokal geändert: nein; Änderungen erfolgen direkt auf dem Aufgabenbranch über GitHub.
- Auf GitHub gesichert (Commit): Branch angelegt; Dokument-/Token-Commits folgen.
- Geprüft: Dokumentstruktur und JSON-Syntax nach Erstellung prüfen; keine Aussage über UI-/App-Tests.
- Deployed: nein.
- Gerätetest: nein.

## Offene Probleme und Unsicherheiten

- Der aktuelle Web-App-Branch enthält neuere UI-/Tutorial-Arbeit, die nicht in `main` steckt.
- `feature/shared-gradecrew-design-system` enthält bereits ältere Brand-/Crew-Dokumente und Assets. Diese gelten als Referenz, nicht automatisch als aktueller Produktcode.
- Die konkrete Farbpalette und Typografie dürfen erst nach Vergleich mit dem tatsächlich zu integrierenden Webstand als endgültig gelten.
- Der gc29-Webentwurf ist laut Übergabe noch nicht auf GitHub gesichert; besonders Suche/Filter und Tutorialabgabe dürfen nicht versehentlich überschrieben werden.

## Nächster konkreter Schritt

Nach Sicherung dieser Grundlage den tatsächlichen Webstand inventarisieren und zuerst Dashboard + „Meine Tests“ als Referenzscreens gegen das neue System mappen. Erst danach gezielte UI-Änderungen auf einem Integrationsbranch vornehmen.

## Wiederaufnahme nach Abbruch

Keine ungesicherten lokalen Änderungen geplant. Branch `feature/gradecrew-design-foundation-v1` und diese Datei sind die Übergabe. Design-Dokumentation bedeutet noch keine implementierte oder getestete Oberfläche.

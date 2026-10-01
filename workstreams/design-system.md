# Aufgabe: gradecrew-design-foundation-v1

- Aktualisiert (UTC): 2026-10-01
- Verantwortlicher Chat / Auftrag: GradeCrew Designchat – visuelle Produktgrundlage, Screen-System und Crew-System
- Aufgabenbranch: `feature/gradecrew-design-foundation-v1`
- Basiscommit: `cfb9ec184bc1b64784239c8f978a5d11dcebe5e2` (`main` beim Start)
- Betroffene Dateien: `design/*`, `workstreams/design-system.md`, branchlokale Registry-Aktualisierung
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
- vorhandene zentrale Token-/Asset-Architektur auf dem Shared-Design-Branch verifizieren und als Grundlage festlegen

Noch nicht:
- bestehende Web-/App-Oberfläche umbauen
- Production oder Staging deployen
- alte Crew-Assets löschen/ersetzen
- Tutorial-Logik, Security, Prüfungsabläufe oder Geschäftslogik ändern
- ein zweites konkurrierendes Token-System erstellen

## Akzeptanzkriterien

- Eigener Designbranch auf GitHub vorhanden.
- Verbindliche Designprinzipien einschließlich Informationshierarchie, Maskottchen-Dichte, Zustände und Accessibility dokumentiert.
- Alle wesentlichen Lehrer-, Schüler-, Admin- und Systemansichten in einer Screen-Map erfasst.
- Crew-Rollen, Ausbauprinzip und Placement Patterns dokumentiert.
- Bestehendes Shared-Design-System (`tokens.json`, `assets.json`, Generator, Web-/Swift-Ausgaben) verifiziert und als zu erhaltende Architektur dokumentiert.
- Offene Überschneidungen mit Website/Tutorial/iOS ausdrücklich dokumentiert.

## Zwischenstand

- Lokal geändert: nein; Änderungen erfolgten direkt auf dem Aufgabenbranch über GitHub.
- Auf GitHub gesichert: ja. Wesentliche Commits:
  - `3655fa1` Workstream angelegt
  - `e2f1299` Design Bible
  - `7dff596` Screen Map
  - `07d2ad1` Crew Library Plan
  - `6f4cd7c` branchlokale Registry auf neuesten Automationsstand + Design ergänzt
  - `fef6116` Aufgabenregister ergänzt
  - `da44ee2` bestehendes Shared-Design-System auditiert
- Geprüft: GitHub-Zugriff, Remote-Branches/Heads, `main`-Weiterentwicklung und vorhandene Shared-Design-Dateien wurden über GitHub gelesen. Keine UI-/App-Tests ausgeführt, da noch keine Produktdateien geändert wurden.
- Deployed: nein.
- Gerätetest: nein.

## Verifizierte relevante Remote-Stände

- `main` bewegte sich während der Arbeit auf `9f1fbe004c8e7e57efbd3213fb114d8f924062ef`; der zusätzliche Commit betrifft Automation/Preview-Workflow und wurde nicht überschrieben.
- Website: `feature/gradecrew-app-integration` bei `5a3b8ea168c74bc25dd14aad599670d17bafaa92`.
- Shared Design / iOS: `feature/shared-gradecrew-design-system` bei `9fe3e37407832e20f75536bf4d59fec9ba801298`.

## Offene Probleme und Unsicherheiten

- Der aktuelle Web-App-Branch enthält neuere UI-/Tutorial-Arbeit, die nicht in `main` steckt.
- Der Shared-Design-Branch enthält bereits echte Tokens, Assets, Generator und native/web Ausgaben; er ist Referenz, aber nicht automatisch der aktuelle Integrationsstand.
- Die konkrete Farbpalette und Typografie werden erst nach Vergleich mit dem tatsächlich zu integrierenden Webstand final bewertet.
- Der gc29-Webentwurf ist laut Übergabe noch nicht auf GitHub gesichert; besonders Suche/Filter und Tutorialabgabe dürfen nicht versehentlich überschrieben werden.

## Nächster konkreter Schritt

Den tatsächlichen Webstand inventarisieren und zuerst Dashboard + „Meine Tests“ als Referenzscreens gegen Design Bible und vorhandene Tokens mappen. Danach einen gezielten Integrationsbranch aus dem aktuellen Web-App-Stand erstellen; kein Big-Bang-Rewrite.

## Wiederaufnahme nach Abbruch

Keine ungesicherten lokalen Änderungen. Branch `feature/gradecrew-design-foundation-v1` und diese Datei sind die Übergabe. Design-Dokumentation und Audit bedeuten noch keine implementierte, getestete oder deployte Oberfläche.

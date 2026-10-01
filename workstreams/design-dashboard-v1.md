# Aufgabe: design-dashboard-v1

- Aktualisiert (UTC): 2026-10-01
- Verantwortlicher Chat / Auftrag: GradeCrew Designchat – erste sichtbare Umsetzung der Design Foundation
- Aufgabenbranch: `feature/design-dashboard-v1`
- Basiscommit: `d42973e9e29361795f773f68e6d6ac8008c36917` (`feature/gradecrew-app-integration`)
- Betroffene Dateien: `index.html`, neue Shared-Design-Quellen/Ausgaben, neue Dashboard-CSS-Schicht, diese Übergabe
- Überschneidungen: Web-App/Tutorial auf `feature/gradecrew-app-integration`; älteres Shared-Design auf `feature/shared-gradecrew-design-system`. Keine Tutorial-, Assessment-, Backend- oder Security-Logik verändern.

## Ziel und gewünschtes Verhalten

Die erste sichtbare GradeCrew-Designumsetzung auf der aktuell verifizierten Web-Basis. Zuerst wird das vorhandene zentrale Token-/Asset-System in den aktuellen Webstand übernommen. Danach werden `Meine Tests` und Testkarten als erster Referenzscreen ruhiger, klarer und konsistenter gestaltet.

## Umfang / nicht verändern

In diesem Teilschritt:
- zentrale plattformneutrale Design-Tokens und Asset-Manifest übernehmen
- generierte Web-Tokens vor bestehende Styles laden
- eine isolierte, zuletzt geladene Dashboard-Foundation-CSS ergänzen
- Dashboard-Hierarchie, Suche/Filter, Testkarten, Statusdarstellung und Empty State visuell ordnen
- Legacy-Asset-Alias `falcon-create.svg` in den zwei sichtbaren Dashboard/Create-Verwendungen durch das kanonische Remy-Asset ersetzen

Nicht verändern:
- Tutorial-State oder Tutorial-Interaktion
- Test-/Bewertungs-/Publishing-Logik
- Firestore/Functions/Security
- Schülerprüfung/Secure
- Production oder normales Staging

## Akzeptanzkriterien

- Branch basiert exakt auf verifiziertem Webstand `d42973e`.
- Shared-Design-Quelle ist maschinenlesbar und bleibt Single Source of Truth.
- Neue CSS-Schicht verändert nur Dashboard/Create-nahe Darstellung und keine Prüfungslogik.
- `+ Neuer Test` bleibt eindeutige Hauptaktion; Papierkorb bleibt sekundär.
- Suche/Filter sind kompakter als die Inhaltskarten.
- Testkarten priorisieren Titel, Metadaten, Status und Hauptaktionen; seltene Aktionen bleiben unter `Weitere Aktionen`.
- Mobile Layout bleibt einspaltig und Touch-Ziele mindestens 44 px.
- CI/Build nach Commit ausführen; kein Deploy ohne gesonderten Nachweis.

## Zwischenstand

- Lokal geändert: nein; Änderungen direkt auf Aufgabenbranch über GitHub.
- Auf GitHub gesichert: Workstream angelegt.
- Geprüft: aktueller Web-Head `d42973e`, Preview-Nachweis auf main-Registry, `index.html`, `styles.css`, `design-system.css`, `gradecrew-brand.css`, `workspace.css` und QuizCard-Renderer gelesen.
- Deployed: nein.
- Gerätetest: nein.

## Offene Probleme und Unsicherheiten

- Der aktuelle Webstand enthält mehrere historische CSS-Schichten mit überlappenden Root-Variablen. Foundation V1 konsolidiert diese noch nicht vollständig; die neue letzte Schicht soll bewusst klein und reversibel bleiben.
- Der frühere gc29-Entwurf mit kompakter Suche/Filter war laut main-Übergabe nicht gesichert. Hier wird die Idee neu und isoliert umgesetzt, nicht als behauptete Wiederherstellung dieses Entwurfs.

## Nächster konkreter Schritt

Shared Tokens/Assets + Generator übernehmen, Web-Ausgabe erzeugen/committen, Dashboard-Foundation-CSS ergänzen, `index.html` anbinden und anschließend CI/Build prüfen.

## Wiederaufnahme nach Abbruch

Keine lokalen ungesicherten Dateien. Ausgangspunkt ist dieser Branch. Bis CI/Preview nachgewiesen sind, gilt die sichtbare Überarbeitung nur als auf GitHub gesicherter Implementierungsstand.

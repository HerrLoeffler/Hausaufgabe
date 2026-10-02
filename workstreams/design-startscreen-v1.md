# Aufgabe: design-startscreen-v1

- Aktualisiert (UTC): 2026-10-03
- Verantwortlicher Chat / Auftrag: GradeCrew Designchat – Startscreen mit kanonischer Crew
- Aufgabenbranch: `feature/design-startscreen-v1`
- Basisbranch: `feature/gradecrew-app-integration`
- Basiscommit: `8aba2a7ce70c75842fbe4b81c4e6491136366768`
- Betroffene Dateien: `gradecrew-auth-startscreen.css`, `startup.js`, `tools/build-staging.mjs`, `gradecrew-design-foundation.test.mjs`, diese Übergabe
- Nicht berührt: Test-/Bewertungs-/Publishinglogik, Tutorial-State, Firestore, Functions, Secure Assessment, Production

## Ziel

Der öffentliche GradeCrew-Einstieg soll deutlich hochwertiger und klarer wirken, ohne neue oder von einer Bild-KI neu interpretierte Maskottchen einzuführen. Die bestehende HTML-Struktur und alle IDs/Formulare bleiben unverändert; die Umsetzung ist eine isolierte visuelle Schicht für `#authView`.

## Verbindliche Bildquelle

Es gelten ausschließlich die kanonischen Assets aus `shared/gradecrew-design/assets.json`.

- Coco: `penguin-guide.svg` / bestehende Gruppenszene `clay-welcome.svg`
- Remy: `elephant-create.svg`
- Emmi: `fox-improve.svg`
- Wilma: `owl-grade.svg`

Die bereits im Einstieg verwendete `clay-welcome.svg` bleibt die große Hero-Szene. Die drei vorhandenen Rollenchips verwenden exakt Remy, Emmi und Wilma aus den Projektassets. Keine Tiere werden neu generiert oder nachgezeichnet.

## Umgesetzt

- neuer isolierter Startscreen-Style `gradecrew-auth-startscreen.css`
- großzügigere Hero-Hierarchie und responsive Crew-Präsentation
- stärkere Trennung zwischen schnellem Schülerzugang und Lehrkraft-Login
- bestehende Testcode-, Login- und Registrierungsformulare unverändert funktionsfähig
- kanonische Remy-/Emmi-/Wilma-Assets direkt in den bestehenden Rollenindikatoren
- Design-Tokens für Farben, Radien, Abstände, Touch-Ziele und Motion wiederverwendet
- sichtbare Focus-Zustände und `prefers-reduced-motion`
- Staging-Build paketiert die neue CSS-Datei
- Design-Regressionstest schützt Scope, Build-Einbindung und kanonische Figuren

## Sicherheits- und Integrationsgrenzen

- keine Änderung an `index.html` und damit keine Änderung bestehender Form-IDs oder App-Hooks
- CSS ist auf `#authView` begrenzt
- keine Selektoren für Dashboard, Schüleransicht oder Secure Assessment
- keine Firebase-/Backendänderung
- keine Production-Änderung und kein Production-Deploy

## Status

- lokal geändert: nein; Änderungen direkt auf Aufgabenbranch über GitHub gesichert
- auf GitHub gesichert: ja
- Branch: `feature/design-startscreen-v1`
- automatisiert getestet: noch nicht bestätigt; PR/CI ist der nächste Gate
- Staging integriert: nein
- deployed: nein
- visuell im echten Browser/iPad bestätigt: nein
- Production: unverändert

## Nächster Schritt

1. Draft-PR gegen `feature/gradecrew-app-integration` öffnen.
2. Vollständige CI abwarten und Ergebnis prüfen.
3. Erst bei grünem CI in den Integrationsbranch übernehmen.
4. Danach über den verifizierten Staging-/Preview-Weg Desktop, iPad und Handy visuell prüfen.
5. Erst nach visueller Abnahme weitere Startscreen-Politur oder nächste Designansicht beginnen.

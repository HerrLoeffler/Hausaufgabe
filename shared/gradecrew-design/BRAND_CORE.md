# GradeCrew Brand Core V1

## Zweck

Alle GradeCrew-Produkte verwenden dieselbe zentrale Markenquelle. Ein Logo wird nie als produktbezogene Kopie neu angelegt oder in einer einzelnen Oberfläche hart verdrahtet.

## Verbindliche Quelle

- Manifest: `shared/gradecrew-design/assets.json`
- Hauptlogo: `brand.primary`
- kompaktes Symbol / App-Icon: `brand.icon`
- Browser-Favicon: `brand.favicon`
- kanonische Assets: `assets/gradecrew/`

`brand-primary-v1.svg` ist Martins bereitgestellte vollständige Vektorzeichnung. `brand-icon-v1.svg` enthält dieselben sichtbaren Vektorpfade, aber ohne weißen Vollflächen-Hintergrund und mit engem quadratischem ViewBox für kleine Darstellungen. Es ist keine Neuzeichnung.

## Produkte

| Produktbereich | Markenquelle |
| --- | --- |
| GradeCrew Web / Login / Dashboard | `brand.primary`, `brand.icon`, `brand.favicon` |
| Lehrer-App | dieselben semantischen Brand-Einträge |
| GradeCrew Games / Spiele-Hub | dieselben semantischen Brand-Einträge |
| GradeCrew Live | dieselben semantischen Brand-Einträge |
| Schüler-/Studentenoberflächen | dieselben semantischen Brand-Einträge |
| GradeCrew Secure | gleiche Markenfamilie, später eigener expliziter `brand.secure`-Eintrag; nicht stillschweigend das Hauptlogo verändern |

## Regeln

1. Keine Dateien wie `games-logo.svg`, `teacher-logo.svg`, `login-logo.png` oder ähnliche Produktkopien anlegen.
2. Neue Oberflächen referenzieren semantische Manifest-Namen statt versionsgebundener Dateinamen.
3. Ein Logo-Wechsel erfolgt zuerst im Manifest und in der kanonischen Asset-Datei; Generatoren aktualisieren Web-/Native-Zuordnungen.
4. Favicon/App-Icon bleiben echte Vektoren ohne eingebettete Rastergrafik.
5. Legacy-Aliase dürfen nur existieren, wenn Tests sicherstellen, dass sie bytegleich mit dem aktuellen semantischen Asset bleiben.
6. Games dürfen visuell spielerischer werden, behalten aber das zentrale GradeCrew-Markenzeichen.
7. Production wird nur nach ausdrücklicher Freigabe aktualisiert.

## Logo-Wechsel

1. neues versioniertes SVG unter `assets/gradecrew/` ablegen;
2. `brand.primary`, `brand.icon` und/oder `brand.favicon` im Manifest umstellen;
3. Manifest-Version erhöhen;
4. `node tools/generate-gradecrew-design.mjs` ausführen;
5. Brand-Core-Regression, Produkt-CI und Staging-Preview erfolgreich abschließen;
6. erst danach geräteübergreifend abnehmen und Production gesondert freigeben.

# GradeCrew Brand Core / Hauptlogo V1

Task-ID: `GC-BRAND-01`

## Ziel
Das von Martin bereitgestellte GC+Bildungs-Symbol als gemeinsame GradeCrew-Hauptmarke verwenden und Logo-/Icon-Wechsel zentral ermöglichen. Web, Login, Dashboard, Lehrer-App, Games, Live und Schüleroberflächen sollen keine eigenen Hauptlogo-Kopien pflegen. GradeCrew Secure bleibt dieselbe Markenfamilie, erhält später aber eine ausdrücklich definierte Sicherheits-/Schloss-Variante.

## Verifizierter Stand
- Brand-Core-Featurebranch: `feature/brand-core-v1`
- final geprüfter Feature-Head: `c458dd1a82f82873b52877b9d914d24efd0b27c5`
- Feature-CI: `36993466338` erfolgreich
- In aktuellen Web-Integrationsbranch gemergt: ja
- Web-Integrationscommit: `c13431a0002ed3acec8a7b71130e9b6060a711fd`
- Integrations-CI: `36993645956` vollständig erfolgreich
- Automatic staging preview: `36993794594` erfolgreich: exakten getesteten Commit gebaut, Branch-Head vor Deploy bestätigt, Preview deployed und Manifest-/Dateihashes nach Veröffentlichung verifiziert
- Preview: `https://hausaufgabe-staging--gradecrew-app-integration-201hlnau.web.app`
- Games-Lab-Integration: `lab/games-structure@55e58e4f6147d0d274d8e5f51578b5d60cb33b4e`
- Games-CI: Push `36993086082` und PR-Lauf `36993091180` erfolgreich, inklusive Build-, Struktur- und Chromium-Browserchecks
- Geräte-/visuelle Abnahme durch Martin: Browser-Favicon/kleine Icondarstellung nach neuem Brand-Core-Deploy noch offen
- Production: unverändert / nicht angefordert

## Aktuelle Logoquelle
- Die zuvor manuell nachgebaute SVG wurde verworfen.
- Die von Martin am 02.10.2026 bereitgestellte echte Vektor-SVG `image.svg` ist die verbindliche visuelle Quelle für GradeCrew Hauptlogo V1.
- Vollständiges Hauptlogo: `assets/gradecrew/brand-primary-v1.svg`.
- Die hochgeladene SVG enthält echte Vektorpfade und keine eingebettete Rastergrafik.
- Für die Runtime wurde ausschließlich die große eingebettete C2PA-Metadatenstruktur entfernt; sichtbare Geometrie, Pfade, Farben, Verlauf und `viewBox="0 0 1254 1254"` stammen aus der bereitgestellten SVG.

## Browser-/App-Icon
- Kompakte Vektorvariante: `assets/gradecrew/brand-icon-v1.svg`.
- Sie verwendet die sichtbaren Pfade/Farben der bereitgestellten SVG, entfernt aber den weißen Vollflächen-Hintergrund und nutzt einen engen quadratischen `viewBox="142 125 971 971"`, damit das Zeichen bei 16–32 px deutlich größer und sauberer erscheint.
- Es ist keine Neuzeichnung und enthält keine Rastergrafik.
- Stabiler Alias: `assets/gradecrew/brand-icon.svg`.
- Der alte First-Paint-Pfad `assets/gradecrew/penguin-icon.svg` bleibt vorläufig als Legacy-Alias bestehen, ist aber bytegleich mit dem aktuellen GC-Icon. Dadurch kann der Browser vor dem JavaScript-Start nicht mehr kurz das alte Pinguin-Symbol laden.

## GradeCrew Brand Core V1
- Semantische Quelle: `shared/gradecrew-design/assets.json`, Version `1.2.0`.
- `brand.primary` -> vollständiges Hauptlogo.
- `brand.icon` -> kompakte Vektorvariante.
- `brand.favicon` -> kompakte Vektorvariante.
- `tools/generate-gradecrew-design.mjs` erzeugt Web- und Native-Zuordnungen.
- Web: `generated/gradecrew-assets.js`.
- Native Shared: `native/Shared/GradeCrewAssets.swift`.
- Verbindliche Regeln: `shared/gradecrew-design/BRAND_CORE.md`.
- Brand-Core-Pflicht ist dokumentiert für Web, Teacher-App, Games, Live und Student/Schüleroberflächen.
- Neue Produktkopien wie `games-logo.svg`, `teacher-logo.svg`, `login-logo.png` sind ausdrücklich unerwünscht.

## Games
- Games Hub verwendet das zentrale GC-Icon als Header-Marke und Favicon.
- Die Build-Pipeline injiziert dasselbe Symbol/Favicon in Fast Quiz, Fehlerjagd Deutsch und Vocab Rush.
- `lab/shared/brand-core.css` kapselt nur die Darstellung.
- `tools/games/brand-core.test.cjs` schützt Vektorformat und verhindert produktbezogene Games-Logo-Kopien.
- Die vorhandenen Spielengines, Wertungen und Backends wurden für diesen Brand-Schritt nicht verändert.

## Späteres Logo austauschen
1. neues versioniertes SVG unter `assets/gradecrew/` hinzufügen;
2. `brand.primary`, `brand.icon` und/oder `brand.favicon` im Manifest umstellen;
3. Manifest-Version erhöhen;
4. `node tools/generate-gradecrew-design.mjs` ausführen;
5. Source-Asset, Manifest und generierte Web-/Native-Maps gemeinsam committen;
6. Brand-Regression + Produkt-CI + verifizierten Staging-Preview-Deploy abwarten;
7. danach geräteübergreifend visuell abnehmen und Production gesondert freigeben.

## Schutz / Tests
- `gradecrew-brand-assets.test.mjs` schützt Manifest, Voll- und Kompaktlogo, Legacy-First-Paint-Alias, Web-/Swift-Ausgaben und Build-Vertrag.
- Der Kompakt-Test prüft unter anderem engen ViewBox, fehlende Rasterbilder und fehlenden weißen Vollflächen-Hintergrund.
- Web-Integrations-CI `36993645956`: vollständig erfolgreich inklusive Browser-, Secure-, Firestore- und Staging-Build-Gates.
- Preview `36993794594`: Build, Stale-Branch-Guard, Deployment und veröffentlichte Hash-Verifikation erfolgreich.
- Games `36993086082` / `36993091180`: Build-, Struktur- und Chromium-Browserchecks erfolgreich.

## Nächster Schritt
Preview auf Desktop/iPad/iPhone visuell prüfen: besonders Browser-Tab-Favicon bei 16–32 px sowie Headerlogo. Wenn nur Größe/Ausrichtung nicht passt, ausschließlich Präsentations-CSS bzw. Icon-ViewBox anpassen; die bereitgestellte Haupt-SVG nicht erneut nachzeichnen oder durch eine KI-Interpretation ersetzen.

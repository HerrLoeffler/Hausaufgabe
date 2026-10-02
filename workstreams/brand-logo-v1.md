# GradeCrew Hauptlogo V1

Task-ID: `GC-BRAND-01`

## Ziel
Das ausgewählte GC+Bildungs-Symbol zunächst als Hauptlogo der normalen GradeCrew-App einsetzen und den Austausch später zentral ermöglichen. GradeCrew Secure bleibt eine getrennte Produktidentität und erhält später eine eigene Sicherheits-/Schloss-Variante.

## Verifizierter Stand
- Feature-Branch: `feature/brand-logo-v1`
- Feature-Head: `4fa14f111ef92ba5dc01b00ccfa9edad68fbf526`
- In Web-Integrationsbranch integriert: ja
- Aktueller geprüfter Integrationscommit: `bb3f8bcef9be23c3cdc706772ecd21892668fa66`
- Integrations-CI: `36990775917` erfolgreich
- Automatic staging preview: `36990944103` erfolgreich gebaut, Preview deployed und veröffentlichte Manifest-/Dateihashes verifiziert
- Preview: `https://hausaufgabe-staging--gradecrew-app-integration-201hlnau.web.app`
- Geräte-/visuelle Abnahme durch Martin: offen
- Production: unverändert / nicht angefordert

## Aktuelle Logoquelle
- Die zuvor manuell nachgebaute SVG wurde verworfen.
- Die von Martin am 02.10.2026 bereitgestellte echte Vektor-SVG `image.svg` ist jetzt die verbindliche visuelle Quelle für GradeCrew Hauptlogo V1.
- Kanonische Runtime-Datei: `assets/gradecrew/brand-primary-v1.svg`.
- Die hochgeladene SVG enthält echte Vektorpfade (17 `path`-Elemente) und keine eingebettete Rastergrafik (`image`-Elemente: 0).
- Für die Runtime wurde ausschließlich die große eingebettete C2PA-Metadatenstruktur entfernt. Sichtbare Geometrie, Pfade, Farben, Verlauf und `viewBox="0 0 1254 1254"` stammen unverändert aus der bereitgestellten SVG.
- Dadurch sinkt die Runtime-Dateigröße ungefähr von 80 KB auf 9 KB, ohne die sichtbare Logozeichnung neu zu interpretieren oder nachzuzeichnen.

## Zentrale Architektur
- Kanonische Logo-Datei: `assets/gradecrew/brand-primary-v1.svg`
- Semantische Quelle: `shared/gradecrew-design/assets.json`
- `brand.primary`, `brand.icon` und `brand.favicon` zeigen auf dieselbe aktuelle Hauptmarke.
- `tools/generate-gradecrew-design.mjs` erzeugt Web- und Native-Zuordnungen.
- Web: `generated/gradecrew-assets.js`
- Native Shared: `native/Shared/GradeCrewAssets.swift`
- `startup.js` setzt Headerlogo und Favicon aus `GRADECREW_ASSETS`; Seitenlogik kennt keinen versionsgebundenen Dateinamen.
- `gradecrew-logo.css` kapselt nur die Präsentation des Logos.
- Bestehendes Header-Markup bleibt als No-JavaScript-Fallback.

## Späteres Logo austauschen
1. neues versioniertes SVG unter `assets/gradecrew/` hinzufügen;
2. in `shared/gradecrew-design/assets.json` nur `brand.primary`, `brand.icon` und `brand.favicon` auf die neue Datei zeigen lassen;
3. Manifest-Version erhöhen;
4. `node tools/generate-gradecrew-design.mjs` ausführen;
5. Source-Asset, Manifest und generierte Web-/Native-Maps gemeinsam committen;
6. Brand-Regression + Staging-CI + verifizierten Preview-Deploy abwarten.

Die konsumierenden Seiten und Apps müssen für einen reinen Logo-Tausch nicht geändert werden.

## Schutz / Tests
- `gradecrew-brand-assets.test.mjs` schützt Manifest, kanonische Datei, Web-/Swift-Ausgaben und Build-Vertrag.
- Staging-Build enthält Asset-Map, Logo-CSS und kanonisches SVG.
- CI prüft Brand-Branches explizit.
- Preview-Automation baut exakt den getesteten Commit, verweigert stale Branches und prüft nach Veröffentlichung Manifest plus Dateihashes.
- CI-Lauf `36990775917`: vollständig erfolgreich inklusive Browser-, Secure-, Firestore- und Staging-Build-Gates.
- Preview-Lauf `36990944103`: Build, Branch-Head-Guard, Deployment und veröffentlichte Hash-Verifikation erfolgreich.

## Nächster Schritt
Preview auf Desktop/iPad/iPhone visuell prüfen: Headerlogo, Größe/Ausrichtung und Browser-Favicon. Wenn die Darstellung zu klein, zu groß oder optisch ungünstig sitzt, nur die Präsentations-CSS anpassen; die bereitgestellte SVG selbst nicht erneut nachzeichnen oder durch eine KI-Interpretation ersetzen.
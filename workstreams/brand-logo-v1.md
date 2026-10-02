# GradeCrew Hauptlogo V1

Task-ID: `GC-BRAND-01`

## Ziel
Das ausgewählte GC+Bildungs-Symbol zunächst als Hauptlogo der normalen GradeCrew-App einsetzen und den Austausch später zentral ermöglichen. GradeCrew Secure bleibt eine getrennte Produktidentität und erhält später eine eigene Sicherheits-/Schloss-Variante.

## Verifizierter Stand
- Feature-Branch: `feature/brand-logo-v1`
- Feature-Head: `4fa14f111ef92ba5dc01b00ccfa9edad68fbf526`
- In Web-Integrationsbranch integriert: ja
- Aktueller geprüfter Integrationscommit: `27ebf56775a5597cd06226a3dbbbf50d76f18f5e`
- Integrations-CI: `36983854068` erfolgreich
- Mobile-Tutorial-Check auf identischem Produktcode vor reinem Handoff-Commit: `36983783832` erfolgreich
- Automatic staging preview: `36984017434` erfolgreich gebaut, Preview deployed und veröffentlichte Manifest-/Dateihashes verifiziert
- Preview: `https://hausaufgabe-staging--gradecrew-app-integration-201hlnau.web.app`
- Geräte-/visuelle Abnahme durch Martin: offen
- Production: unverändert / nicht angefordert

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

## Nächster Schritt
Preview auf Desktop/iPad/iPhone visuell prüfen: Headerlogo, Größe/Ausrichtung und Browser-Favicon. Die Logoform selbst ist bewusst V1 und kann später über das Manifest ersetzt werden, ohne die Architektur erneut umzubauen.
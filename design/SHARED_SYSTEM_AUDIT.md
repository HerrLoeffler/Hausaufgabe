# Shared GradeCrew Design System · Audit 2026-10-01

## Verifizierte Quelle

Branch: `feature/shared-gradecrew-design-system`
Verifizierter Head: `9fe3e37407832e20f75536bf4d59fec9ba801298`

Der Branch enthält bereits eine technisch sinnvolle Single-Source-of-Truth-Architektur. Sie wird nicht parallel neu erfunden.

## Vorhandene zentrale Dateien

- `shared/gradecrew-design/README.md` – Regeln und Migrationsstrategie
- `shared/gradecrew-design/tokens.json` – plattformneutrale Design-Tokens, Version 1.0.0
- `shared/gradecrew-design/assets.json` – semantisches Manifest für Coco, Remy, Emmi, Wilma und Szenen
- `tools/generate-gradecrew-design.mjs` – Generator
- `generated/gradecrew-design-tokens.css` – Web-Ausgabe
- `generated/gradecrew-assets.js` – Web-Asset-Lookup
- `native/Shared/GradeCrewDesignTokens.swift` – Swift-Ausgabe
- `native/Shared/GradeCrewAssets.swift` – native Asset-Zuordnung

## Verifizierte bestehende Token-Gruppen

`tokens.json` enthält bereits:

- Farben
- Radius-Skala
- Spacing-Skala
- Layout-Grenzen
- Mindest-Touchziel
- Typografie-Größen
- Motion-Dauern / Reduced-Motion-Regel
- Schatten

Damit existiert die gewünschte zentrale technische Grundlage bereits. Neue Designarbeit erweitert diese Quelle nach Prüfung, statt ein zweites Token-System anzulegen.

## Verifizierte Crew-Struktur

`assets.json` definiert bereits semantisch:

- Coco / `guide` / Pinguin
- Remy / `create` / Elefant
- Emmi / `improve` / Fuchs
- Wilma / `grade` / Eule

sowie Welcome-, Finale-, Übergabe-, Retry-, Save- und weitere Clay-Szenen.

## Entscheidung für Foundation V1

1. Bestehende Shared-Design-Architektur beibehalten.
2. Neue Design Bible, Screen-Map und Crew-Library-Plan als Produkt-/UX-Schicht darüberlegen.
3. Noch keine neuen Farbwerte erfinden, bis der aktuelle Web-App-Branch und die tatsächlich genutzten CSS-Variablen verglichen sind.
4. Bei Integration zuerst den vorhandenen Generator und die JSON-Quellen übernehmen/aktualisieren.
5. Web und native App teilen Spezifikation, Tokens und Assets – nicht zwangsläufig dieselben ausführbaren Layout-Komponenten.
6. Secure übernimmt Marke und Kern-Tokens, darf in Prüfungsansichten aber absichtlich ruhiger sein.

## Noch offen vor Code-Integration

- Web-App-Branch `feature/gradecrew-app-integration` gegen das Shared-Design-System diffen.
- Nicht auf GitHub gesicherten gc29-Entwurf berücksichtigen.
- Dashboard und „Meine Tests“ als erste Referenzscreens mappen.
- Token-Namen auf bereits verwendete CSS-Variablen abbilden, ohne Big-Bang-Rewrite.
- vorhandene Generator-/Stale-File-Checks prüfen und ggf. in den aktuellen Integrationsbranch übernehmen.

## Abgrenzung

Dieser Audit bestätigt Dateistruktur und dokumentierte Architektur auf dem genannten Branch. Er bestätigt keinen aktuellen Staging-Deploy, keine visuelle Endabnahme und keinen physischen App-Gerätetest.

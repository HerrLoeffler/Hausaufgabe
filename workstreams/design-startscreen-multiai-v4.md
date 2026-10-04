# GradeCrew – Startscreen Masterpiece v4

Stand: 2026-10-04
Basis: feature/gradecrew-app-integration@578677633c1759e75fee6479f416fb64566f5c5c
Production: unverändert

## Warum v4

v2 verlor den alten synchronen Provider-Aufruf am HTTP-Timeout. PR #105 stellte OpenAI Guardian auf Background Responses um.
v3 kam dadurch kontrolliert zurück, endete aber ohne fertigen Kandidaten. Die große Basis-CSS musste vollständig neu ausgegeben werden; Publish, Tests und Reviews liefen deshalb nicht.

PR #114 hat die Design-Architektur daraufhin geändert:
- gradecrew-auth-startscreen.css bleibt stabile Basis.
- gradecrew-auth-startscreen-polish.css ist ein kleiner nachgelagerter visueller Layer.
- Staging-Build und Regressionstests kennen diesen Layer.
- DE/EN-UI-Abdeckung aus PR #108 bleibt erhalten.

## v4 Scope

Writable:
- gradecrew-auth-startscreen-polish.css

Read-only Kontext:
- gradecrew-auth-startscreen.css
- gradecrew-entry-flow.js

Ziel: Premium-Polish für Komposition, Licht, Tiefe, Spacing und Responsive – ohne Produktlogik oder Texte umzubauen.

## i18n-Regel

Der Startscreen muss bei DE/EN vollständig mitwechseln.
Deshalb:
- keine sichtbaren Wörter per CSS content;
- keine eingebrannten Texte in Bildern/Data-URIs;
- sichtbare Copy bleibt im DOM/i18n-Katalog;
- Test-/Inhaltssprache und Bewertungssprache bleiben unabhängig von der UI-Sprache.

## Multi-KI-Gate

1. GPT-6.1 Sol baut ausschließlich den kleinen Polish-Layer.
2. Exact Combined Web Validation.
3. GPT-6 Astra: Korrektheit/Auftragstreue.
4. Claude Sonnet 5.5: Produkt-/Sicherheitsgrenzen.
5. GPT-6 Sol: QA/Nutzerfluss.
6. Nur bei drei Freigaben Integration in feature/gradecrew-app-integration.
7. Technischer Staging-Preview.
8. Martin prüft Desktop, iPad, Phone sowie DE/EN.
9. Production bleibt gesperrt.

## Budget

module-web-v1: maximal 2,40 USD Reservat für diesen einen Task; Task-Cap 2,55 USD.
Alte v2/v3 Historie und Reservate bleiben unverändert.

## Status

- isolierter Polish-Layer: integriert, Post-Merge AI Staging Checks grün
- Background Responses: auf main integriert
- sichere Terminaldiagnostik: auf main integriert
- v4 Task/Policy: auf diesem Branch
- v4 Provider-Aufruf: noch nicht
- Production: UNVERÄNDERT

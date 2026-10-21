# GradeCrew – Startscreen polish layer v1

Stand: 2026-10-04
Basis: feature/gradecrew-app-integration@63cbac307919c6488e33afa74f4e98b3fff8e92b
Production: unverändert

## Anlass

Die beiden großen Multi-KI-Startscreen-Versuche haben keinen veröffentlichbaren Kandidaten erzeugt:
- v2 endete am alten synchronen OpenAI-Socket-Timeout.
- v3 nutzte bereits Background Responses, erreichte aber nach mehreren Minuten einen terminalen unvollständigen Modell-Response. Es entstand erneut kein Kandidat.

Die stabile Startscreen-CSS ist groß. Der Guardian-Builder muss laut Sicherheitsvertrag komplette Dateiinhalte statt Patches liefern. Für reine visuelle Iteration ist eine vollständige Neuausgabe der großen Basisdatei unnötig und erhöht Output-/Reasoning-Risiko.

## Lösung

Neuer isolierter Layer:
- gradecrew-auth-startscreen-polish.css

Er wird nach gradecrew-auth-startscreen.css geladen und im Staging-Build verpackt. Die Basis bleibt stabil.

Der Layer ist bewusst fast leer. Der nächste Guardian-Designauftrag darf ausschließlich diesen kleinen Layer verändern und erhält Basis-CSS + Markup nur als read-only Kontext.

## Internationalisierung

Der Startscreen ist inzwischen vollständig in die bestehende DE/EN-UI-Grenze eingebunden.

Für den Polish-Layer gilt:
- sichtbare Texte bleiben ausschließlich im DOM/i18n-Katalog;
- kein CSS content mit sichtbarer Copy;
- keine data:image-Hintergründe mit eingebranntem Text;
- UI-Sprache bleibt unabhängig von Test-/Inhaltssprache und Bewertungssprache.

Diese Grenze ist durch Design-Regressionstests geschützt.

## Geänderte Dateien

- gradecrew-auth-startscreen-polish.css
- startup.js
- tools/build-staging.mjs
- gradecrew-design-foundation.test.mjs
- ai-entry-flow.test.js
- diese Übergabe

## Status

- lokal geändert: nein
- GitHub gesichert: ja
- Aufgabenbranch: feature/design-startscreen-polish-layer-v1
- CI: offen
- in feature/gradecrew-app-integration integriert: nein
- Staging deployed: nein
- visuell bestätigt: nein
- Production: UNVERÄNDERT

## Nächster Schritt

1. AI Staging Checks vollständig grün.
2. PR in feature/gradecrew-app-integration integrieren.
3. aktuellen Web-SHA feststellen.
4. neuen Guardian-Task mit neuer ID und ausschließlich gradecrew-auth-startscreen-polish.css als writable scope anlegen.
5. Builder + exakte Combined Validation + Astra + Claude + Sol.
6. nur nach drei Freigaben automatisch integrieren/deployen.
7. Martin prüft Desktop/iPad/Phone und DE/EN im echten Preview.

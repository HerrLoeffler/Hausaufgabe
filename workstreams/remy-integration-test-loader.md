# Remy integration test loader fix

Stand: 02.10.2026. Basis `feature/gradecrew-app-integration@e024024322a809dc5fadcaa6fb6e2e3c9a9504de`. Production unverändert.

## Ziel

Den nach Integration von PR #41 aufgetretenen Browser-Regressionsfehler beheben, ohne die Remy-Parserkorrekturen zurückzunehmen.

## Ursache

`remy-ai-help.test.mjs` führt `remy-ai-help.js` in JSDOM per `eval()` aus. Die Test-Fixture entfernte den mehrzeiligen Telemetrie-Import nur für die alte Cache-Bust-Version `?v=1`. Der Runtime-Import wurde inzwischen korrekt auf `crew-telemetry-client.mjs?v=2` angehoben. Dadurch blieb im Test-Eval ein statisches `import` stehen und Node meldete `Cannot use import statement outside a module`.

Das ist ein Test-Harness-/Loaderproblem, kein bestätigter Produktfehler in Remy.

## Änderung

- Der Test entfernt den bekannten Telemetrie-Import jetzt unabhängig von seiner Cache-Bust-Query.
- Produktcode, Parserlogik, Firebase-Aufrufe und Telemetrie bleiben unverändert.
- Die bestehende JSDOM-Prüfung testet weiterhin die echte lokale Remy-Formularintegration.

## Status

- Branch: `fix/remy-integration-test-loader`
- erster Fix-Commit: `ae76e13c93f64292ea576d355f6e37bbff8efcc2`
- GitHub gesichert: ja
- CI: nach PR-Erstellung prüfen
- Staging: noch nicht
- Gerät: noch nicht
- Production: unverändert

## Nächster Schritt

PR gegen `feature/gradecrew-app-integration` öffnen, CI prüfen, bei grün kontrolliert integrieren und anschließend den Integrations-CI sowie den automatisch ausgelösten Staging-Deploy am exakten Mergecommit verifizieren.

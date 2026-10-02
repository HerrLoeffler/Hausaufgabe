# AI Gateway staging preflight diagnostics

Stand: 02.10.2026. Basis `integration/ai-gateway-staging@af8b06ac09b1bc4a4f82445dbe0763c6ac010d6f`. Production unverändert.

## Ausgangslage

Nach Integration der Routing-Härtung war der Code-/Emulator-/Container-Verify-Job vollständig grün. Der staging-only Deploy stoppte anschließend vor Image-Build und vor Traffic-Promotion im Guard `Refuse configuration drift before deployment`. Der bisherige Inline-Guard nutzte mehrere stille `jq -e`/`test`-Assertions und verriet deshalb nicht, welche erwartete Cloud-Run-Metadatenstruktur abwich.

## Änderung

- Neuer testbarer Checker `ai-gateway/tools/check-staging-service-config.mjs`.
- Prüft Runtime-Service-Account, die vier erwarteten Anthropic-Variablennamen, die Secret-Manager-Referenz von `OPENAI_API_KEY`, vorhandene Service-URL und genau die für Rollback benötigte ungetaggte 100%-Revision.
- Gibt bei Abweichungen konkrete, sichere Fehlermeldungen aus.
- Loggt ausschließlich ungefährliche Metadaten: Variablennamen, Service-Account-Identität, Secret-Referenzname, URL-Vorhandensein und aktive Revisionskennung. Keine Secret-Werte.
- Schreibt bei erfolgreichem Check `service_url` und `previous_revision` in `GITHUB_OUTPUT` für die bestehenden Deploy-/Rollback-Schritte.
- Unit-Tests decken Happy Path, fehlende Anthropic-Variable, unerwarteten Secret-Referenznamen und ungültige Traffic-Struktur ab.
- Der vorhandene Fail-Closed-Guard wird nicht gelockert und kein Cloud-Wert automatisch repariert.

## Status

- Branch: `fix/ai-gateway-preflight-diagnostics`
- Implementiert und auf GitHub gesichert.
- PR-/CI-Prüfung folgt.
- Staging: noch kein neuer Deploy aus diesem Branch.
- Production: unverändert.
- Automatische Modellwahl: unverändert deaktiviert.

## Nächster Schritt

PR gegen `integration/ai-gateway-staging` öffnen. Bei grüner AI-Gateway-CI kontrolliert integrieren. Der anschließende staging-only Deploylauf soll entweder die aktuelle Konfiguration exakt benennen und vor Deploy stoppen oder – falls der Dienst dem Vertrag entspricht – den normalen Candidate-Smoke/Promotion-Pfad durchlaufen. Keine Cloud-Konfiguration auf Verdacht ändern.

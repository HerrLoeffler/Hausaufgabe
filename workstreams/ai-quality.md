# KI-Qualität / Review-Workflow

Stand: 01.10.2026. Diese Datei ordnet bestehende Branches ein; sie erklärt keinen davon automatisch zum aktuellen Produktstand.

- Registry-ID: `ai-quality`
- Primärer Prüfbranch: `fix/ai-review-workflow`
- Integrationsziel: `feature/gradecrew-app-integration`
- Task: `GC-AI-01`
- Related Branches: `feature/ai-integration`, `fix/ai-format-reliability`

## Verifizierte Branch-Beziehungen

- `fix/ai-review-workflow` baut auf `feature/ai-integration` auf und enthält deutlich weitere Arbeit.
- `fix/ai-format-reliability` liegt hinter `fix/ai-review-workflow` und enthält gegenüber diesem keine einzigartigen Commits.
- Daraus folgt **nicht**, dass `fix/ai-review-workflow` bereits in den aktuellen Web-Integrationsstand übernommen wurde.

## Startregel

Vor KI-Qualitätsarbeit zuerst `fix/ai-review-workflow`, dessen branch-eigene Statusdateien und offene PRs lesen. Danach gegen `feature/gradecrew-app-integration` und den separaten Freitext-Workstream vergleichen. Keine weitere parallele KI-Review-Lösung beginnen, bevor vorhandene Arbeit eingeordnet wurde.

## Offen

- tatsächlichen aktuellen Funktionsstand und Tests des Review-Branches gegen den heutigen Integrationsstand prüfen;
- entscheiden, welche Teile übernommen, verworfen oder neu integriert werden;
- erst danach Registry-Zustand auf `integration_ready`/`integrated` ändern.

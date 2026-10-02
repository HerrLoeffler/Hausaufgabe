# Development Status V1

## Ziel
GitHub als gemeinsame Control Plane für parallele GradeCrew-Chats/Agenten nutzen. Der Status soll live aus Git/PR-Daten berechnet werden; manuell gepflegt werden nur Workstream-Zuordnung, Integrationsziel und Lifecycle-Zustand.

## Scope
- `workstreams/registry.json`: kleine maschinenlesbare Zuordnung aktiver/relevanter Baustellen.
- `tools/development_status.py`: read-only Branch-/PR-/Overlap-/Release-Audit.
- `.github/workflows/development-status.yml`: regelmäßige und manuelle Statusberechnung, Job Summary + Artefakt.
- `START_HERE.md` / `AGENTS.md`: neue Chats prüfen den Live-Audit vor paralleler Entwicklungsarbeit.

## Sicherheitsgrenzen
- Keine Branches, PRs oder Dateien automatisch löschen, mergen oder verschieben.
- Keine Deployments.
- Production wird nur aus `GRADECREW_STATE.json` gelesen, nie verändert.
- Überschneidungen sind Warnungen, keine Dateisperren.

## Status
- Branch: `feature/development-status-v1`
- Basis: aktuelles `main` bei Start `b71683d83f9a1a07c1262ed3002755c3e4f80b8d`
- Phase: Implementierung

## Akzeptanzkriterien
1. Aktive/relevante Workstreams mit Branch, Ziel, SHA, ahead/behind und offenen PRs sichtbar.
2. Potenzielle Dateiüberschneidungen zwischen parallelen aktiven Workstreams sichtbar.
3. Unregistrierte Remote-Branches und offene PRs ohne Registry-Zuordnung sichtbar.
4. Staging-Zahl und Production-Status aus `GRADECREW_STATE.json` eingebunden.
5. Kompakte Ampel-Zeile in GitHub Actions.
6. Audit bleibt read-only und blockiert nicht automatisch normale Produktarbeit.

## Offen
- Erster echter Actions-Lauf auf dem Feature-Branch.
- Ergebnis prüfen, Registry anhand realer Warnungen nachschärfen.
- Danach kontrollierte Integration nach `main`.

# Staging Assessment Functions Deploy V1

Stand: 04.10.2026. Production unverändert.

## Auftrag

Audio Masterpiece V2 erweitert die bereits kontrollierte serverseitige Lösungsfreigabe um optionales Lösungsaudio. Der bestehende automatische Staging-Functions-Workflow deployt bisher ausschließlich die Firebase-Codebase `ai`. Für einen echten V2-Staging-Test muss auch die getrennte Codebase `assessment` exakt vom grün getesteten Integrations-SHA veröffentlicht und nachgewiesen werden.

## Architektur

- Bestehender vertrauenswürdiger Workflow `.github/workflows/staging-functions.yml` bleibt der einzige OIDC-Einstieg; die vorhandene WIF-Bedingung muss nicht aufgeweicht werden.
- Neuer Job `deploy-assessment-functions` nutzt dieselbe staging-only Deploy-Identität, aber einen strikt eigenen Scope: `--only functions:assessment`.
- Vor Cloud-Login:
  - exakter getesteter Integrations-SHA,
  - stale-head guard,
  - Codebase `assessment` im `firebase.json`,
  - erwartete Assessment-Exports,
  - vollständige Assessment-Tests + Syntaxcheck.
- Nach Deploy werden die sechs erwarteten Assessment-Funktionen in `hausaufgabe-staging` nachgewiesen.
- Eigener Receipt `staging-assessment-functions-receipt-<sha>`.
- Kein Hosting, keine Rules, keine AI-Codebase und keine Production-Zieladresse im Assessment-Job.

## Parallelität

PR #100 verändert ebenfalls `.github/workflows/staging-functions.yml`, jedoch im bestehenden AI-Job für eine staging-only PostHog-Laufzeitvariable. Diese Arbeit wird nicht überschrieben. Der Assessment-Job ist als eigener YAML-Block angehängt; vor Merge muss main/PR #100 erneut geprüft und ein eventueller Konflikt bewusst aufgelöst werden.

## Status

- Branch: `feature/staging-assessment-functions-deploy-v1`
- Basis: main beim Branchstart
- Produktcode: unverändert
- Deploy-Steuerung: implementiert
- eigener unprivilegierter Check: läuft nach Push
- in main integriert: nein
- Assessment-Deploy Staging: nein
- Production: unverändert

## Nächster Schritt

Check-Workflow grün bekommen, aktuellen main/PR #100 erneut prüfen, PR öffnen. Nach Integration muss ein neuer erfolgreicher `AI Staging Checks`-Lauf des aktuellen Integrationsheads den Assessment-Job auslösen; danach Receipt prüfen und Audio V2 im Browser end-to-end abnehmen.

# Staging Deploy Actions Read Fix

Stand: 2026-10-04

## Ziel
Die automatischen Staging-Workflows fuer Hosting-Preview und AI Functions sollen den ausloesenden GitHub-Actions-Lauf ueber `tools.automation.deployment_evidence` lesen koennen.

## Ursache
Nach erfolgreichem `AI Staging Checks` fuer `feature/gradecrew-app-integration@e46b747188e82043787824b412b11922703d1f8d` scheiterten:
- Automatic staging preview Run 37106607929
- Automatic staging AI functions Run 37106607928

Beide stoppten im `source`-Job vor Build/Cloud-Login. Der Workflow-Token hatte nur `contents: read`, waehrend `deployment_evidence.py` `GET actions/runs/<id>` benoetigt.

## Aenderung
- `.github/workflows/staging-preview.yml`: `actions: read` fuer Source und privilegierten Deploy-Job.
- `.github/workflows/staging-functions.yml`: `actions: read` fuer Source und privilegierten Deploy-Job.
- Regressionstest `tools/automation/test_staging_deploy_permissions.py` verhindert Rueckfall und verbietet `actions: write`.

## Nachweis
- Project handoff checks Run 37193563281: success auf Branch-Head `e58acccbbde39497de80957e81bdb44360bca9fc`.
- App-Code, Firestore Rules und Production wurden nicht veraendert.

## Naechster Schritt
Nach Merge nach `main` den bereits erfolgreichen `AI Staging Checks` Run 37106491774 fuer `e46b747...` erneut ausfuehren. Danach automatische Hosting-/Functions-Laeufe und Receipts pruefen. Erst bei exaktem SHA-Gleichstand Benutzerabnahme starten.

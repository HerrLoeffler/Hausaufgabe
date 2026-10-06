# GC-SECURITY-02 — vorbereiteter Web-Integrationspatch

Request-ID `GC-CENTRAL-15f5dd8b-6dc0-438f-8c4e-d2def7d5d25f`. Auftrag und Versuchshistorie bleiben [PR #146](https://github.com/HerrLoeffler/Hausaufgabe/pull/146) und [Security-Übergabe](security-production-gates-20261006.md) zugeordnet. Verantwortlicher Chat: GC · Automatisierung & Integration (`01a1089e-bbae-74c2-9a6a-6ce71fb3dba7`); Zentrale `01a10df6-736b-7a62-bd38-2724cf254c2e` übernimmt nach Prüfung Integration/Staging. Kein weiterer Guardian-/Provider-Versuch und keine Budgetreservierung.

## Belegter Ausgangspunkt

- Am 06.10.2026 frisch geprüft: `feature/gradecrew-app-integration@90b48d854e0deca87fbf33b376c76826c1fc2d60`, Merge i18n PR #139; [Combined CI 37417856806](https://github.com/HerrLoeffler/Hausaufgabe/actions/runs/37417856806) erfolgreich.
- Aktueller i18n-Staging-Rollout vor diesem Patch: Hosting [37417963944](https://github.com/HerrLoeffler/Hausaufgabe/actions/runs/37417963944) und Assessment-Functions [37417963972](https://github.com/HerrLoeffler/Hausaufgabe/actions/runs/37417963972) abgeschlossen erfolgreich. Diese Runs beweisen keinen Deploy des Security-Patches.
- Security-Quellpatch: [PR #146](https://github.com/HerrLoeffler/Hausaufgabe/pull/146) @ `b1119cc3c58957f002e2310af60bad30801843b0`; [dessen CI 37417782699](https://github.com/HerrLoeffler/Hausaufgabe/actions/runs/37417782699) 284 Tests erfolgreich, inklusive Firestore-Transaktionen. Original-Branch Security @ `76417085b6ae42cb9f6d5733af726c2eeb05dd79` liegt weit hinter dem aktuellen Webstand; ausschließlich den gezielten Patch übertragen.
- Separater, frischer Checkout/Branch `fix/gc-security-02-web-integration-20261006` basiert exakt auf `90b48d8`. Keine Überschneidung mit einer bereits offenen Security-Web-Integration gefunden.

## Bewusst übernommene und erhaltene Änderungen

- `assessment-functions/lib/secure-lifecycle.js`: nur die geprüften Issue-#6-/Transaktions-Retry-Hunks. Aktuelle Lösungsaudio-Ausgabe bleibt enthalten.
- Bestehender Verhaltenstestadapter aus PR #146 vereint geordnete Questions- und direkte Collection-Reads; i18n-Tests von `assessment-core.js` und dessen Bytes bleiben erhalten. Vor Port rot: fünf zielgerichtete Tests auf der exakten Web-Basis schlugen erwartungsgemäß fehl.
- Assessment- und Rules-Lockfiles. `tools/rules/package.json` behält `test:bugops` und `overrides.ignore=7.0.10`; `test:secure` erhält die vier echten Start-Transaktionsfälle. Rules-Lockfile auf dem aktuellen Webpaket neu erzeugt. Alle bestehenden Workflows/Deploypfade bleiben bestehen; nur deren Dependency-Installationsbefehle nutzen die jeweiligen Lockfiles via `npm ci`.

## Release und nächster Schritt

Dieser Port ist vor der neuen CI zunächst `branch_only`. Weder Integration noch Security-Preview, Rules-Cutover, Gerätetest oder Production-Freigabe durch diesen Branch. Die Gates C–G und der ungeklärte 30-Teilnehmer-Fehler bleiben wie in der Security-Übergabe offen.

Nächster Schritt: denselben isolierten Kandidaten einmal vollständig in Node-22-/Java-21-CI auf dem aktuellen Webstand prüfen, unabhängiges Read-only-Review abgleichen, PR gegen `feature/gradecrew-app-integration` als Draft sichern. Main übernimmt erst danach seriell. Kein konkurrierender Deploy.

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

Dieser Port bleibt `branch_only`. Weder Integration noch Security-Preview, Rules-Cutover, Gerätetest oder Production-Freigabe durch diesen Branch. Die Gates C–G und der ungeklärte 30-Teilnehmer-Fehler bleiben wie in der Security-Übergabe offen.

Nächster Schritt: Zentrale gleicht den finalen PR-Commit mit der weiterhin aktuellen Web-Basis ab und übernimmt Integration/Staging seriell innerhalb der bestehenden Gates. Kein konkurrierender Deploy.

## CI-Start auf isoliertem Branch

Draft-[PR #148](https://github.com/HerrLoeffler/Hausaufgabe/pull/148) @ Remote-Checkpoint `f62ad1e8253e777feb202b4a72c5c109fa1e873c` angelegt. Der bestehende `AI Staging Checks`-Workflow prüfte bislang nur bestimmte Push-Branches; neue PR-Zielbranches lösten ihn nicht aus. Für die geforderte vollständige Kombination wurde allein das Muster `fix/gc-security-*` in die bestehenden Push-Filter aufgenommen. Ein Suchlauf über `.github/workflows` zeigte keinen `workflow_run`-Folge-Deploy auf diese CI. Es ist ein Testworkflow; keine Cloud-Identität oder Deploy-Stufe hinzugefügt.

## Geprüfter Web-Kandidat

- Remote-Commit `fa6b41b24790bf7865c48948af2374654d1a1673`, Tree `88072eccebf0a5c323f6486d9bcf4d685cab9408`, gegen unveränderte Web-Basis `90b48d854e0deca87fbf33b376c76826c1fc2d60` geprüft. Der abweichende lokale Commit `70bc6074862363b715f1fb6edc32ad2da078af16` hat denselben Tree.
- [AI Staging Checks 37431017785](https://github.com/HerrLoeffler/Hausaufgabe/actions/runs/37431017785) auf genau `fa6b41b` erfolgreich: Node 22/Java 21, 51 Assessment-Tests, beide Rules-Suiten mit 11 bestehenden und 4 neuen echten Firestore-Emulator-Fällen, weitere Web-Tests und Staging-Build. Der Workflow hat nichts deployed.
- [BugOps Server Checks 37431025857](https://github.com/HerrLoeffler/Hausaufgabe/actions/runs/37431025857) auf genau `fa6b41b` erfolgreich, einschließlich BugOps-Regeln und Function-Tests.
- Unabhängiges Read-only-Review des Diffs `90b48d8..70bc607`: keine konkreten Findings; Lösungsaudio/i18n, Firestore-Lese-vor-Schreib-Reihenfolge, Retry-Ergebnis, Rules-Override, BugOps-Tests und bestehende Deploy-Guards geprüft. Lokaler Host hat kein Java; die vier Emulator-Fälle sind allein durch den oben verlinkten CI-Run belegt.
- Die Übergabe ist ein anschließender reiner Dokumentations-Commit. Dessen eigene CI-Ergebnisse sind vor der finalen Übergabe erneut gegen den dann exakten PR-Head zu prüfen; die unveränderten Code- und Lockfile-Bytes des geprüften Kandidaten bleiben maßgeblich.

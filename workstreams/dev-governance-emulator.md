# Aufgabe: Entwicklungsordnung und Firebase-Emulator-Gates

- Task-IDs: `GC-DEV-01`, `GC-TEST-EMULATOR-01`
- Aktualisiert (UTC): 2026-10-01
- Verantwortlicher Chat / Auftrag: Backup Main GC – Branch-/Workstream-Struktur und wiederverwendbare Emulatorprüfung
- Registry-Workstream / Zustand: `dev-governance-emulator` / `active`
- Aufgabenbranch: `feature/dev-governance-emulator`
- Integrationsziel: `main`
- Basiscommit: `93b6379734223b00107b4f4489586a7e7e2bbbbe`
- Erster Governance-Commit: `c22b833a47653f409b06924899522cf6b626fd17`
- Betroffene Bereiche: Chat-Einstieg, Workstream-Registry, Branch-Audit, CI-Gates, Firebase-Emulator-Teststandard

## Ziel

Viele parallele GradeCrew-Chats und Branches sollen ohne Doppelbau und Statusverwechslung funktionieren. Firebase-relevante Entwicklungsbereiche erhalten zusätzlich zu Unit-/Contract-Tests wiederverwendbare Emulatorprüfungen für Rules, Functions, Berechtigungen, Transaktionen und Idempotenz.

## Erledigt

- Maschinenlesbares `workstreams/registry.json` mit Primary-/Related-Branches, Integrationsziel und Lifecycle-Zustand.
- Verbindliche Startregeln: Remote-Branches, offene PRs und Dateiüberschneidungen vor neuer Arbeit prüfen.
- `tools/branch_audit.py`: Registry-Validierung, Branch-Verfügbarkeit, ahead/behind, offene PR-Zuordnung, potenzielle Dateiüberschneidungen und unklassifizierte Branches als Triage-Warnung.
- Branch-Lebenszyklus dokumentiert: `active`, `integration_ready`, `blocked`, `integrated`, `archive_candidate`.
- Große lose Stränge zusätzlich eingeordnet: KI-Qualität, Freitext-Review und Legacy-Branch-Triage. `dev` bleibt wegen einzigartiger Commits bewusst blockiert und wird nicht automatisch gelöscht.
- Firebase-Emulator-Teststandard und Testmatrix für künftige Firebase-relevante Workstreams.
- Zentrale Emulator-Suite:
  - Firestore-Rules-Baseline;
  - Secure-Assessment-Lifecycle gegen echte emulierte Assessment Functions + Firestore;
  - Token-/Berechtigungsfehler;
  - Start-Idempotenz;
  - parallele/repetierte Submit-Idempotenz;
  - Lösungsschlüssel-Leak-Schutz.
- `tools/run_emulator_tests.sh` startet ausschließlich die für den Assessment-Test benötigten Emulatoren/Functions in einem temporären Config-Scope; kein Deploy und keine Production-Zugangsdaten.
- `.github/workflows/development-gates.yml`: Branch-Governance auf Entwicklungsbranches; Firebase-Emulator nur bei anwendbarem Firebase-Stand.
- Start-/Agent-/Chat-Vertrag und Workstream-Template trennen Unit, Emulator, CI, Deploy, Browser, Gerät und Production.

## Tatsächliche Prüfungen

### Governance-Branch

GitHub Actions Run `36933879010` auf `c22b833`:
- Branch-Governance: **grün**.
- Firebase-Job: korrekt **nicht anwendbar/übersprungen**, weil dieser reine main-basierte Koordinationsbranch kein `firebase.json`/`firestore.rules` enthält. Das ist **kein** Emulator-Laufzeitnachweis.

### Echter Firebase-/Assessment-Emulator

Für die Laufzeitprüfung wurde ein isolierter Testbranch `integration/telemetry-emulator-gate` direkt von `feature/telemetry-implementation@4e4f0ba90a5bbb68e63a8836782289b46fbef21f` erstellt. Er enthält nur Emulator-Testgerüst/Runner/Validation-Workflow; der Telemetrie-Produktbranch wurde nicht überschrieben.

- Run `36934064744` auf `fa051678`: **fehlgeschlagen**. Ursache war ein Test-Isolationsrennen: `clearFirestore()` löste den realen Quiz-Lösch-Trigger aus; wiederverwendete Quiz-IDs erlaubten einem verspäteten Cleanup, Testdaten des nächsten Falls zu löschen. Kein bestätigter GradeCrew-Sicherheitsfehler.
- Testfixtures anschließend pro Fall auf eindeutige Quiz-IDs umgestellt.
- Run `36934351905` auf `dd722845a1f75feaa0369fde34a1d0dee3c56c52`: **grün**. Firestore Rules, tatsächliche Assessment Functions, Start/Resume/Submit, Berechtigungen, Transaktionen sowie parallele/repetierte Abgabe liefen gemeinsam im Emulator.

Dieser Nachweis gilt für den genannten isolierten Integrationsstand. Er ist kein Staging-/Geräte-/Production-Nachweis und kein Lasttest.

## Testmatrix

| Änderung / Risiko | Unit / Contract | Rules Emulator | Functions Emulator | Parallel / Idempotenz | Staging / Gerät |
|---|---|---|---|---|---|
| Branch-Audit / Registry | Governance-CI grün | n. a. – keine Firebase-Laufzeit | n. a. | n. a. | n. a. |
| Firestore-Regeln | zentrale Testfälle | ✅ Run `36934351905` | n. a. | n. a. | offen |
| Secure Assessment | bestehende isolierte Tests + Emulatorfälle | ✅ | ✅ Run `36934351905` | ✅ parallele/repetierte Submit-Fälle | offen |
| Development-Gates Workflow | ✅ Run `36933879010` | echter Firebase-Nachweis separat ✅ | echter Firebase-Nachweis separat ✅ | ✅ im Integrationslauf | n. a. |

## Zwischenstand

- Lokal geändert: kein ungesicherter Produktcode aus dieser Arbeit behauptet.
- Auf GitHub gesichert: `feature/dev-governance-emulator` ab `c22b833`; getestete Nachbesserungen werden im nächsten Commit dieses Branches gesichert.
- Emulator-Test: **grün** auf isoliertem Firebase-Integrationsbranch `dd722845`, Run `36934351905`.
- CI: Governance-CI auf `c22b833` grün; finaler CI-Lauf nach dem Nachbesserungscommit noch erneut prüfen.
- Preview/Staging deployed: nein.
- Browser geprüft: n. a. für diese Entwicklungsinfrastruktur.
- Gerätetest: n. a. für diese Infrastruktur; Produkt-Gerätetests bleiben separat.
- Production: unverändert.

## Offene Punkte

- Die Registry ordnet die wichtigen aktiven Stränge ein; unklassifizierte Altbranches bleiben Triage-Warnungen und werden nie automatisch gelöscht.
- `dev` enthält einzigartige alte Commits und muss vor Archivierung fachlich geprüft werden.
- Nach dem finalen Governance-Commit dessen CI prüfen und danach die Integration nach `main` über einen Review-/PR-Schritt vorbereiten.
- Das Emulator-Gate ist ein Grundgerüst: neue Firebase-Domänen ergänzen eigene fachliche Tests statt nur auf die Assessment-Suite zu vertrauen.

## Nächster konkreter Schritt

Finalen Governance-/Registry-/Emulator-Nachbesserungscommit sichern, Development-Gates erneut grün prüfen und anschließend den Branch als Integrationskandidat zu `main` bereitstellen. Kein Deploy.

## Nicht verändern

- Keine Production-Deployments.
- Keine bestehenden Games-, Crew-Assistant-, Design-, Secure-Assessment-, KI-, Freitext- oder Telemetriebranches überschreiben.
- Keine Altbranches automatisch löschen oder force-pushen.

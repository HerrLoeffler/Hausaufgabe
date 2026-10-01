# Aufgabe: Entwicklungsordnung und Firebase-Emulator-Gates

- Task-IDs: `GC-DEV-01`, `GC-TEST-EMULATOR-01`
- Aktualisiert (UTC): 2026-10-01
- Verantwortlicher Chat / Auftrag: Backup Main GC – Branch-/Workstream-Struktur und wiederverwendbare Emulatorprüfung
- Registry-Workstream / Zustand: `dev-governance-emulator` / `active`
- Aufgabenbranch: `feature/dev-governance-emulator`
- Integrationsziel: `main`
- Basiscommit: `93b6379734223b00107b4f4489586a7e7e2bbbbe`
- Betroffene Bereiche: Chat-Einstieg, Workstream-Registry, Branch-Audit, CI-Gates, Firebase-Emulator-Teststandard

## Ziel

Viele parallele GradeCrew-Chats und Branches sollen ohne Doppelbau und Statusverwechslung funktionieren. Firebase-relevante Entwicklungsbereiche sollen zusätzlich zu Unit-/Contract-Tests wiederverwendbare Emulatorprüfungen für Rules, Functions, Berechtigungen, Transaktionen und Idempotenz erhalten.

## Erledigt in diesem Arbeitsstand

- Maschinenlesbares `workstreams/registry.json` mit Primary-/Related-Branches, Integrationsziel und Lifecycle-Zustand entworfen.
- Verbindliche Startregeln um Remote-Branches, offene PRs und Überschneidungsprüfung erweitert.
- `tools/branch_audit.py` entwickelt: Registry-Validierung, Branch-Verfügbarkeit, ahead/behind, offene PR-Zuordnung, potenzielle Dateiüberschneidungen und unklassifizierte Branches als Triage-Warnung.
- Branch-Lebenszyklus dokumentiert: `active`, `integration_ready`, `blocked`, `integrated`, `archive_candidate`.
- Firebase-Emulator-Teststandard dokumentiert und in den Workstream-Handoff übernommen.
- Zentrale Emulator-Suite angelegt:
  - Firestore-Rules-Baseline
  - Secure-Assessment-Lifecycle gegen Functions + Firestore Emulator
  - Token-/Berechtigungsfehler
  - Start-Idempotenz
  - parallele/repetierte Submit-Idempotenz
  - Lösungsschlüssel-Leak-Schutz
- `tools/run_emulator_tests.sh` als gemeinsamer lokaler/CI-Einstieg erstellt; enthält keinen Deploy.
- `.github/workflows/development-gates.yml` erstellt: Branch-Governance bei allen Entwicklungsbranchtypen; Firebase-Emulator nur wenn Firebase-Dateien im geprüften Stand vorhanden sind.
- Start-/Agent-/Chat-Vertrag und Workstream-Template so erweitert, dass Unit, Emulator, CI, Deploy, Browser, Gerät und Production getrennt nachgewiesen werden.

## Testmatrix

| Änderung / Risiko | Unit / Contract | Rules Emulator | Functions Emulator | Parallel / Idempotenz | Staging / Gerät |
|---|---|---|---|---|---|
| Branch-Audit / Registry | Syntax/Struktur lokal geprüft | n. a. – keine Firebase-Laufzeit | n. a. | n. a. | n. a. |
| Firestore-Regeln | Testcode statisch geprüft | Lauf offen | n. a. | n. a. | offen |
| Secure Assessment | bestehende isolierte Tests auf Quellbranch vorhanden | indirekt Baseline vorgesehen | Lauf offen | Lauf offen | offen |
| Development-Gates Workflow | YAML/Struktur lokal geprüft | Lauf offen auf Firebase-Branch | Lauf offen auf Firebase-Branch | Lauf offen | n. a. |

## Zwischenstand

- Lokal geändert: Struktur und Testgerüst erstellt; statische Syntax-/Strukturprüfungen erfolgreich.
- Auf GitHub gesichert (Commit): **offen – wird nach diesem Handoff in einem zusammenhängenden Commit gesichert.**
- Unit-/Verhaltenstests: Nur statische Checks dieses neuen Gerüsts; keine neuen Laufzeitbehauptungen.
- Emulator-Test: **noch nicht tatsächlich ausgeführt.** Die Governance-Branchbasis enthält selbst kein `firebase.json`; echter Lauf folgt auf einem isolierten Integrations-/Firebase-Stand.
- CI: **noch nicht bestätigt.** Workflow existiert erst mit dem neuen Commit.
- Preview/Staging deployed: nein.
- Browser geprüft: n. a. für diese reine Entwicklungsinfrastruktur.
- Gerätetest: nein / n. a. für Infrastruktur.
- Production: unverändert.

## Offene Probleme und Unsicherheiten

- Das Repo enthält zahlreiche ältere Feature-/Fix-/Lab-/Integration-Branches. Das Audit markiert nicht registrierte Branches bewusst nur als Triage-Warnung; kein automatisches Löschen.
- Ein echter Emulatorlauf benötigt einen Stand mit `firebase.json`, `firestore.rules` und Assessment Functions. Deshalb muss das Gerüst nach Sicherung auf einem isolierten Firebase-Integrationsstand ausgeführt werden.
- Ein grüner Emulatorlauf ersetzt keinen Lasttest, Staging-/Gerätetest oder Production-Gate.

## Nächster konkreter Schritt

Diesen Stand auf `feature/dev-governance-emulator` committen und pushen; danach einen isolierten Firebase-Teststand auf Basis des aktuellen Telemetrie/Secure-Assessment-Codes verwenden, um `bash tools/run_emulator_tests.sh` tatsächlich auszuführen und Fehler zu beheben, bevor Integration nach main vorgeschlagen wird.

## Nicht verändern

- Keine Production-Deployments.
- Keine bestehenden Games-, Crew-Assistant-, Design-, Secure-Assessment- oder Telemetriebranches überschreiben.
- Keine Altbranches automatisch löschen oder force-pushen.

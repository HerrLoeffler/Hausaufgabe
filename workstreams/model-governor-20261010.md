# Aufgabe: GC-MODEL-GOVERNOR-01

- Aktualisiert (UTC): 2026-10-10
- Verantwortlicher Chat / Auftrag: authorized GradeCrew executor; subtask /root/model_governor_recovery
- Chat-Bezeichnung / Link: unbekannt
- Vorheriger Chat / Übernahmezeitpunkt: same task continuation after interruption; prior chat link unknown
- Arbeitszustand: zur Übernahme bereit
- Aufgabenbranch: local source work fix/visual-backlog-recovery-20261007; evidence branch docs/gc-model-governor-evidence-20261010
- Basiscommit: local code baseline e9cc5ae5924bff21a8a7757a1bb9129de4976d55; documentation PR branch based on remote main 91f52ec2d0aa4cb11b5003fc5abd31fa2e4659e9
- Integrationsziel: local Site 8772 only for the scoped code checkpoint; documentation-only PR targets remote main
- PR: documentation-only, draft https://github.com/HerrLoeffler/Hausaufgabe/pull/199 (PR #199)
- Betroffene Dateien: local code commit has nine tools/dev-workbench paths; remote docs only docs/automation/model-governor-20261010/activation-receipt.md and this handoff
- Überschneidungen: none observed for these two new documentation paths

## Ziel und gewünschtes Verhalten

Routine work in the existing local Workbench CLI launch requests an explicit Luna/medium model choice and records requested, host-accepted and observed model/effort separately. Unclear outcomes do not trigger automatic retry.

## Umfang / nicht verändern

This code path does not control native Codex UI chats, already-running chats, other launch paths, global Codex defaults, private app databases, production or staging deployments. No live inference was started for validation.

## Akzeptanzkriterien

- Local Site 8772 code checkpoint is a commit containing only nine approved Workbench paths.
- The existing local service is running from that checkout and returns HTTP 200 on GET /__dev.
- Receipt persistence succeeds before CLI spawn; storage refusal prevents spawn.
- Scope limits and lack of live runtime model/usage evidence are explicit.
- Remote code publication waits for a confirmed matching source baseline.

## Zwischenstand

- Lokal geändert: none after committed scoped code checkpoint; unrelated pre-existing local changes were left untouched.
- Auf GitHub gesichert (Commit): local active checkout commit 2062aaafdec172182088fea4a7b5381422e10559; documentation PR branch is based on remote main.
- Geprüft: 17 focused Node tests passed, git diff --check passed; independent recheck of receipt correction 0752d591848182adcdd8c7683faa74cc645a2260 passed.
- Service evidence: PID 17646, user martin, listener 127.0.0.1:8772, expected checkout CWD, read-only GET /__dev HTTP 200.
- Persisted jobs: 21 readable records, 20 done + 1 error, none queued/working/unknown before or after service start.
- Deployment / device test / production: none.
- Unclear external work: none. No live model request; no model usage or cost evidence.

## Offene Probleme und Unsicherheiten

The local source baseline commit and local branch are not available on GitHub. The remote branch lookup returned 404 and commit lookup returned 422. Current main is not known to be an equivalent Workbench source baseline. No matching task entry was found in the remote registry, TODO search or open-PR search. Shared TODO, release state and registry remain untouched by this evidence step.



## Aktualisierter technischer Stand — 11.10.2026

Dieser Abschnitt ersetzt nur den damaligen offenen nächsten Schritt; die folgenden Einträge vom 10.10.2026 bleiben als historische Aktivierungsbelege erhalten.

- Remote-Quell-/Integrationsstand: PR [201](https://github.com/HerrLoeffler/Hausaufgabe/pull/201), Quellhead `3a155f84bb3ec0428fa8ffb92ab94fdac8b99219`, wurde in `feature/gradecrew-app-integration` mit Mergecommit `507a06008c7a9a95a9a84e8d3fdbb54fe9f08581` integriert. Der unabhängige bestehende Central-Reviewer hat beide Reviewachsen bestanden. Source-CI Run `38090177717` / Job `114324833180` ist erfolgreich. Die Post-Merge-Checks `114325311748` (test), `114325311725` (Node 22 tests) und `114325311535` (Dev Workbench) wurden als completed/success gemeldet.
- Separater lokaler Digest-Fix laut bestehender Recovery-Übergabe: von `2062aaafdec172182088fea4a7b5381422e10559` zu `bc999d6d4b612726c4468e94c227c4dd5e8d60c3`, ausschließlich `tools/dev-workbench/codex-patch-provider.mjs` und `tools/dev-workbench/live-editor.mjs`; dort sind 7/7 gezielte Checks belegt. Diese Prüfungen und der Restart werden hier nicht wiederholt. Der bestehende Startweg meldete Site 8772 PID `57860`; der gespeicherte Check fand in beiden Projekten keine aktiven Jobs. Das ist ein damaliger lokaler Tooling-Receipt, kein aktueller Live-Health-Check.
- PR 200 hat den globalen Native-Default Luna/medium auf main integriert. Manuelle Desktop-Auswahlen und bestehende Overrides bleiben manuell; nichts wurde erzwungen oder broadcastet. Das lokale Workbench-CLI ist ein separater Toolingpfad auf dem Integrationszweig; es ist weder ein Staging- noch ein Production-Deploy.
- Tatsächliches Runtime-Modell/Effort, Tokenverbrauch, Kosten und Einsparung sind weiterhin `unknown` und können erst aus einem gewöhnlichen späteren CLI-Auftrag belegt werden. Inferenz, Deploy, Production und Nutzertest wurden für diesen Dokumentationsabschluss nicht ausgeführt.

## Nächster konkreter Schritt

Unabhängige Prüfung dieses kleinen PR-199-Deltas und der frischen main-basierten Dokumentationschecks; danach kann der Sharedowner PR 199 normal in main integrieren. Reale Runtime-/Tokenwerte nur bei einem späteren regulären CLI-Auftrag dokumentieren.

## Wiederaufnahme nach Abbruch

- Letzter gesicherter Teilschritt: Die PR-201-Integration und der lokale Aktivierungsreceipt sind oben mit ihren getrennten Scopes und Nachweisen eingetragen.
- Gepushter Codecommit / Remote-Branch: Workbench-Integration PR 201 auf `feature/gradecrew-app-integration` bei `507a06008c7a9a95a9a84e8d3fdbb54fe9f08581`; PR 199 bleibt eine Dokumentationsänderung für main.
- Laufende oder unklare Vorgänge: keine neuen Vorgänge gestartet; Runtimewerte bleiben unbekannt.
- Bereits ausgeführte externe Aktionen / Kostenreservierungen: keine Inferenz- oder Deployaktion durch diesen Dokumentationsabschluss.
- Was darf noch nicht als erledigt gelten? PR-199-Delta-Review/Main-Integration und Runtime-/Tokenbeobachtung.
- Was muss vor Wiederholung geprüft werden? PR-199-Head, frische Main-/CI-Checks und Reviewergebnis; keine Tests oder Services erneut starten.
- Genau ein nächster ausführbarer Schritt: Sharedowner prüft den PR-199-Dokumentationsdelta.

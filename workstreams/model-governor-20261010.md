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

## Nächster konkreter Schritt

The Workbench source owner identifies the intended remote source branch/commit that matches the active local service; only then prepare a scoped code PR against that baseline.

## Wiederaufnahme nach Abbruch

- Letzter gesicherter Teilschritt: local source commit 2062aaafdec172182088fea4a7b5381422e10559; local service PID 17646 verified on 127.0.0.1:8772.
- Gepushter Codecommit / Remote-Branch: none; local source branch is not present remotely.
- Laufende oder unklare Vorgänge: none observed; no live model request was started.
- Bereits ausgeführte externe Aktionen / Kostenreservierungen: none for inference.
- Was darf noch nicht als erledigt gelten? Remote code publication, CI/merge, user acceptance, and runtime model/usage observation.
- Was muss vor Wiederholung geprüft werden? Exact intended remote source baseline and branch ownership.
- Genau ein nächster ausführbarer Schritt: owner identifies the matching remote source lineage.
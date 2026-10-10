# GC-MODEL-GOVERNOR-01 — local activation evidence

Recorded: 2026-10-10. This file records a local development-service activation only.

## Source and policy

- The local Site 8772 checkout started from e9cc5ae5924bff21a8a7757a1bb9129de4976d55 on fix/visual-backlog-recovery-20261007. The four pre-existing scoped source files matched that baseline byte-for-byte; the five new scoped policy/test files were absent.
- Scoped local source commit: 2062aaafdec172182088fea4a7b5381422e10559. It contains only nine tools/dev-workbench files. The independent receipt-persistence correction was reviewed at 0752d591848182adcdd8c7683faa74cc645a2260; the review recheck passed.
- Launch path: hub.mjs POST /__dev/live/jobs → live-editor.mjs::run → codex-patch-provider.mjs::runCodexPatch. Routine CLI starts explicitly request gpt-6-luna / medium; justified complexity may request Sol/medium and authorized high-risk work may request high effort. Receipt write failure before spawn fails closed.
- Requested, host-accepted and observed model/effort remain separate. Missing model, effort, Task ID or usage stays unknown/null. Auth, DNS, quota and unknown outcomes do not trigger automatic retries or escalation.

## Local service evidence

- Started through the existing tools/dev-workbench/Werkzeug starten.command entrypoint → start.mjs → server.mjs, preserving the existing .review-local data directory.
- Local process PID 17646 was observed listening as user martin on 127.0.0.1:8772 with the expected checkout as its CWD. Read-only GET /__dev returned HTTP 200.
- The existing job store had 21 readable records before and after start: 20 done, 1 error, no queued/working/unknown jobs. No request/job was created for validation.
- 17 focused Node tests passed in the active checkout; git diff --check passed. The tests use stubbed CLI launches and synthetic events.

## Limits and next step

- No live model inference, actual runtime-model/usage observation, cost measurement, token-savings claim, deploy or Production action occurred. Real usage evidence can only come from a later ordinary user job.
- This integration governs only that local Workbench Codex CLI path. Native Codex UI chats, already-running chats and other launch paths are outside its control.
- The local e9cc5ae... source baseline is not present on GitHub: the matching remote branch returned 404 and the commit lookup returned 422. Current remote main was 91f52ec2d0aa4cb11b5003fc5abd31fa2e4659e9 when checked. PRs 197 and 198 have unrelated heads. This documentation PR does not publish Workbench source code.
- No matching GC-MODEL-GOVERNOR-01 entry was found in the targeted remote workstream registry, TODO search or open-PR search. Shared TODO.md, GRADECREW_STATE.json and workstreams/registry.json were not changed.
- The local patch bundle and complete baseline/final hash manifests are preserved in the task workspace evidence directory; backups of original source files remain outside the repository.

The next step is for the source owner to identify a remote branch whose Workbench source baseline matches this local activation, then prepare a scoped code PR against that exact source lineage.

## Folgebeleg — integrierte Quelllinie und lokaler Digest-Fix (11.10.2026)

Die frühere Aussage, eine passende Remote-Quelllinie müsse erst noch identifiziert werden, beschreibt den Stand bei Erstellung dieses Receipts am 10.10.2026. Sie ist für die aktuelle Weiterarbeit überholt: PR [201](https://github.com/HerrLoeffler/Hausaufgabe/pull/201) integrierte den Workbench-CLI-Pfad auf `feature/gradecrew-app-integration` aus Quellhead `3a155f84bb3ec0428fa8ffb92ab94fdac8b99219` (Mergecommit `507a06008c7a9a95a9a84e8d3fdbb54fe9f08581`). Source-CI `38090177717` / Job `114324833180` und die gemeldeten Post-Merge-Checks `114325311748`, `114325311725` und `114325311535` completed/success; die unabhängige bestehende Review hat beide Achsen bestanden.

Die bestehende lokale Aktivierung wurde anschließend mit dem Digest-Fix `bc999d6d4b612726c4468e94c227c4dd5e8d60c3` auf Basis `2062aaafdec172182088fea4a7b5381422e10559` aktualisiert; der Quellreceipt begrenzt ihn auf `codex-patch-provider.mjs` und `live-editor.mjs` und berichtet 7/7 Checks. Die vorhandene Site-8772-Aktivierung verwendete den bestehenden Startweg; beim dokumentierten Check war PID `57860` aktiv und es gab in beiden Projekten keine aktiven Jobs. Checks und Restart wurden für diese Dokumentationsfortsetzung nicht wiederholt.

PR 200 hat den allgemeinen Native-Codex-Default Luna/medium auf main integriert. Manuelle Desktop-Overrides bleiben unberührt. Dieser Workbench-Pfad ist Tooling auf dem Integrationsbranch und kein Staging-/Production-Deploy. Tatsächliches Runtime-Modell/Effort, Tokens, Kosten und Einsparung bleiben unbekannt, bis ein gewöhnlicher CLI-Auftrag entsprechende Werte liefert. Keine Inferenz oder Deployaktion im Rahmen dieses Updates.

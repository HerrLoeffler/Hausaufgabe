# GC-MODEL-GOVERNOR-01 — Native Codex model defaults and start policy

**Owner:** native model policy / documentation. **Responsible chat:** unknown. **Date:** 2026-10-10. **Branch:** `feat/gc-native-chat-model-20261010`. **Base:** verified GitHub `main` `91f52ec2d0aa4cb11b5003fc5abd31fa2e4659e9`. **PR:** [#200](https://github.com/HerrLoeffler/Hausaufgabe/pull/200), draft and open. Current reviewed PR head: `837ec933796b1c5eaa5856b8690f79c411038911`. The first GitHub blob transfer exceeded the shell output limit; the complete files were restored additively, and the final comparison against main confirmed only six intended files, additions only. This receipt follow-up is a separate docs-only commit; do not treat earlier checks as checks on this new head.

## Purpose and current receipt

The user explicitly authorized Luna/medium as the general Codex default, including chats outside GradeCrew. Only the two user-level keys `model` and `model_reasoning_effort` were changed; all other config bytes were verified unchanged. Strict config parsing succeeded; the bundled catalog showed Luna with medium supported; doctor’s config-load check was `ok` and reported `gpt-6-luna`. The doctor process exited nonzero for unrelated network reachability/state-path checks. No paid inference was attempted. The running desktop app was not restarted, so its in-memory model default remains unverified until the next normal restart. Previous user-level default was Sol/high; complete rollback detail is held only in local recovery notes outside the repo.

This changes the user-level default for new/unoverridden starts. Existing chats can have an explicit current-chat selection and may remain Sol/high. The current desktop UI offers model/reasoning controls under the composer and `/model`, `/reasoning` for the current chat; manually align an existing idle GradeCrew chat before its next task if needed. Never imply a config change rewrites an active call.

## GradeCrew start rule

The adaptive policy now explicitly covers direct normal GradeCrew Codex chats as well as coordinators/delegations: routine Luna/medium; consider low only after demonstrated fit on comparable low-risk work; complex Sol/medium; high only with a concrete reason; no more than two changes per connected task. Authentication, network, quota and missing permissions are not model-upgrade reasons. For every programmable new thread or delegation, explicitly pass model and effort and put requested model/effort, observed actual model/effort (or `unknown`), and reason in the existing handoff. The desktop UI is manually selectable; repository text cannot enforce it. Active calls are not switched or interrupted. No hooks were installed and PR184 was not touched.

## Task continuity and current repository status

Continue task `GC-MODEL-GOVERNOR-01`; do not reset prior experiments, cost/budget history or CLI-governor work. At start, verified `main` was `91f52ec2d0aa4cb11b5003fc5abd31fa2e4659e9`; PR #199 was a separate docs-only CLI evidence PR and PR #184 remains the hooks draft, mergeability dirty. Neither was modified. No release-state transition or deployment is part of this task.

## Files and verification

- Native evidence: `docs/automation/native-chat-model-20261010/README.md`.
- Shared policy deltas: `AGENTS.md`, `docs/CHAT_CONTRACT.md`, `TODO.md`, `workstreams/registry.json`.
- Release file `GRADECREW_STATE.json` intentionally unchanged.
- At PR source head `837ec933796b1c5eaa5856b8690f79c411038911`, Project handoff checks run `38088997623`, job `114321368848`, and GradeCrew Development Status run `38088997529`, job `114321368593`, completed successfully. These checks are tied to that source/documentation head; this receipt-only follow-up creates a newer PR head.
- Local checks for this receipt: `git diff --check`, new-document whitespace check, and `python3 -m json.tool workstreams/registry.json` passed. Local config checks were `codex --strict-config --help` (exit 0), `codex debug models --bundled` (exit 0; Luna/medium listed), and filtered `codex doctor --json` (`checks.config.load.status=ok`, model Luna; overall exit 1 for unrelated provider reachability/state-path checks). No inference. Command results were observed in the task transcript; no standalone logs or full config were saved. Safe config receipt: only the two top-level values moved from Sol/high to Luna/medium; all other bytes were verified unchanged. Exact backup remains outside the repository.

## Next step

Finish scoped documentation/registry updates, validate only the changed docs and JSON, then open a draft PR for independent review by the root coordinator. Do not merge or deploy.

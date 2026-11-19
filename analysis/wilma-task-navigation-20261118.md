# Wilma task navigation — isolated teacher UI evidence

Task IDs: GC-WEB-REPAIR-20261007 / GC-PEDAGOGY-KB-01. Owner: delegated teacher navigation specialist; parent owns integration, backend, scheduler, app wiring and release. Branch `fix/wilma-task-nav-20261118`, base `19117b4`. No new workstream or paid attempt.

## Scope and coordination

Read current origin/main START_HERE, AGENTS, GRADECREW_STATE, TODO, workstreams/README, CHAT_CONTRACT, design and assurance entry. Parent supplied freshly checked main `c1d1ec7`, Development Status run `44346330053` green, actual live source `4c736c2`. Parent retains central records and release responsibility. Local isolated worktree only; no external writes, real submissions, provider calls or deployment here.

Teacher files only: `wilma-answer-review.mjs/css`, new focused DOM tests, existing synthetic browser fixture/matrix. Existing scoring, source guards, manual decision/undo and clarity comparison remain. Requested/actual model inherited from parent runtime (no model switch; actual usage unavailable).

## Implementation

- Native collapsible task overview; broad view initially open, narrow view initially closed. Active question plus exact pending-answer count remain visible outside disclosure. Numbered grid wraps and scrolls vertically within 160px; no horizontal strip. Separate task filters “Nur offene” / “Alle”. Active completed task remains reachable in open filter; selecting a completed task reveals its answers.
- Completion uses `reviewItem.requiresReview` over every submission. Only zero remaining teacher decisions gives green/check “Fertig”; proposals/deferred/unknown remain open. Running/waiting/queued, error and blocked states have text and distinct treatment. Selection adds an independent inset outline and aria-current.
- Row status shows queued/running/waiting/error/blocked categories and supplied detail. Validated volatile proposals show “Vorschlag nur in diesem Tab verfügbar”; they remain unconfirmed.
- Optional `recoverQuestion({questionId})` offers free “Status aktualisieren”. Optional `retryAnswer({questionId,submissionId,expectedFailureAt})` is exposed only for an open nontechnical/nonstale answer with phase error, retryAllowed true and finite numeric failedAt; permission is rechecked at click. It explicitly says the new request uses the quota. Both callbacks await under aiBusy/generation guards; neither calls saveDecision.
- Background rendering preserves unfinished point input, keyboard focus, response/task filters and disclosure state. Existing criteria input is captured before asynchronous refresh. No grade/point algorithm changes.

## Evidence checkpoint

- TDD: six new DOM behaviors failed against baseline (navigation, completion, phases, callback availability, volatile warning, point draft loss), then passed. Additional disclosure-focus test failed before adding a stable focus action; guard/race tests passed.
- 17 focused DOM/clarity/compact tests green.
- Chromium + WebKit local fictional matrix: 72 scenarios green: 20/40/50/100 tasks × 9 viewport/touch/zoom cases × 2 engines, widths 320–2560. Checks no horizontal overflow, bounded panel height, native narrow disclosure, task/response filters, complete status, active outline/ARIA, last task reachable, keyboard next-open response, class overview handoff and touch targets. Test first observed old horizontal-scroll geometry fail, then passed new grid.
- Screenshots inspected: `/tmp/gc-layout-evidence/wilma-chromium-390.png`, `/tmp/gc-layout-evidence/wilma-chromium-1920.png` (plus other generated sizes/engines). Geometry JSON: `/tmp/gc-layout-evidence/wilma-layout.json`. Browser runs bind localhost only; initial restricted run correctly failed EPERM, then approved local-only execution succeeded.

## Limits / next step

Local synthetic evidence only; no physical device, real account, paid request, Firestore, push, CI or deploy. Parent must wire agreed callbacks, independently review exact integrated source, run integrated checks, and perform authorized release gates. Clarity matrix and broader local regressions pending at this checkpoint. No production claim.

## Final local regression results (2026-11-18)

- Root web suite: `node --test *.test.mjs *.test.js` — **617 passed, 0 failed** (`/tmp/gc-wilma-navigation-root-tests.log`).
- Existing UI regression and Wilma inline review: **40 passed, 0 failed** (`/tmp/gc-wilma-navigation-ui-tests.log`).
- Focused new navigation suite: **9 passed**, including click-time retry permission, finite failure token, confirmed/stale guards, recovery double-click/race, cleared-session guard, unfinished point draft and native summary-focus retention. Compact+clarity alongside these: **17 passed**.
- Existing Chromium/WebKit answer comparison: **16 scenarios passed**, widths 320/390/768/1180 at 1×/2×, only two synthetic save/undo operations each, no external requests. Evidence `/tmp/gc-wilma-clarity-preview/verification.json` and screenshots.
- `git diff --check` clean. No dependency symlinks committed.

Relevant assurance scope: SEC08/14 (UI never turns recovery/retry into score writes; retry token/click-time guards tested; server authority remains parent-owned), PRIV12 (pending/proposal/error/completion claims grounded in existing reviewItem), PRIV14/15 (status text accompanies colour, independent active outline and visible focus; keyboard/touch/zoom verified synthetically). Owner is this specialist for UI and parent for integrated server/release. Broader legal/account/security controls are unchanged and not claimed as verified. Physical-device/screen-reader acceptance remains not checked. Colour contrast of newly introduced status pairs is measured separately if required by the integrating reviewer; no global accessibility claim.

## Final contract audit and exact-source rerun

Initial implementation checkpoint commit: `f665775`. The final audit found that a deferred answer's row badge could conceal an existing failed-KI category. A new test reproduced it red; status now includes both “KI-Prüfung fehlgeschlagen” and “Zurückgestellt”, preserving deferral without hiding the failure.

After that fix, fresh runs on the final source passed: **618 root tests**, **40 UI regression/inline tests**, **18 focused compact/clarity/navigation tests** (including **10 new navigation tests**), **72 Chromium/WebKit task overview scenarios**, and **16 Chromium/WebKit answer-comparison scenarios**, all zero failures. Final logs `/tmp/gc-wilma-navigation-root-tests-final.log`, `/tmp/gc-wilma-navigation-ui-tests-final.log`; browser evidence paths above refreshed.

Measured WCAG relative-luminance contrast for new status text/background pairs: open `#795009/#fff8e9` **6.70:1**, complete `#23613b/#f0f8f2` **6.83:1**, error `#952b2b/#fff2f2` **7.24:1**, running `#27517b/#eef5fc` **7.49:1**. New active outline `#213e62/#f0f8f2` **10.06:1**, native summary focus `#275c9b/#ffffff` **6.80:1**. This supersedes the earlier “measured separately if required” note for these pairs only; no global accessibility claim.

No running local test processes remain. Ready for parent integration and independent review; no push/CI/deploy/live data action performed.

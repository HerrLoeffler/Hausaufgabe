# Wilma answer-first correction — local evidence

Existing tasks GC-WEB-REPAIR-20261007 / GC-PEDAGOGY-KB-01; delegated teacher UI specialist, isolated `fix/wilma-first-answer-20261118` from actual source `d67b0b5`. Parent owns current main/release records, app wiring, legacy-job diagnosis and backend/scheduler. No new task/workstream, paid request, real data, external writes or deploy.

## Reproduction before implementation

Fictional fixture: 15 questions, 9 fictional submissions, q2 exactly 8 open nonmatching gap responses, q12 also open. Existing preparation simulates an old unknown failure plus free-cache-miss message, no proposals and disabled confirmation. Original UI rendered that raw diagnostic twice from two rowHtml branches (`.wilmaPreparation` and `.wilmaCritical` fallback); the preparation message itself also contained two failure/cache sentences. Before fixture was run and screenshot/geometry captured before production edits.

Evidence `/tmp/gc-wilma-first-answer/before-geometry.json` and `before-{chromium,webkit}-{1180,390}-zoom{1,2}.png` (8 cases). Chromium before: desktop first answer y501.47, context318.44px; 390×700 header247.77px, first answer y618.34; 390×700 at2× reflow (195×350 CSS viewport) first answer y753.78, invisible. All answer fonts13px CSS. WebKit confirms same class of failure.

Observed red: new first-answer geometry test failed old318px context; new DOM tests failed missing single problem line, old six-option dropdown, missing guarded resume action and stale-error/proposal precedence.

## Implementation scope

- Expanded Wilma header is one44px control row, no global diagnostic paragraph/logo consuming answer space. Free status refresh and class overview remain accessible, icon form at narrow widths with explicit accessible names.
- Current task/open count + next-open action occupy one compact row. Native bounded task chooser contains all tasks, including completed tasks; no second task open/all filter and no long diagnostic sentences on every chip. Chooser closes after selecting a task. Active outline/ARIA independent of status colour.
- Answer filter is only Offene/Alle, explicitly labelled “Antworten zeigen”. Completed/filtered-out answers remain accessible, choosing an already complete task selects Alle. Undo, source guards, typed draft/focus and existing grade calculation preserved.
- Question text/reference remain available in “Aufgabe und Lösung”, collapsed initially to prioritize answers at short/zoomed viewports. Per-gap response/expected alternatives remain13px side-by-side, with list marker suppressed at source style.
- One short actionable `.wilmaProblem` replaces both raw diagnostic branches. Provider/cache diagnostics are not rendered in ordinary teacher rows. Proposal reason/points remain separate; a validated proposal supersedes stale preparation error, stays unconfirmed, and retains volatile-persistence warning.
- Existing callbacks recoverQuestion (free status only) and retryAnswer({questionId,submissionId,expectedFailureAt}) preserved. New optional resumeAnswer({questionId,submissionId}) exposes one “KI prüfen” action only with current resumeAllowed true on an open, nontechnical/nonstale answer, no validated proposal or queued/running/waiting preparation. Settled failure retry takes precedence. Click rechecks permission, awaits one callback under aiBusy/generation guard, never saves teacher points, never auto-resumes from scroll/open/reload. Parent owns final server/quota enforcement.

## Checkpoint

22 focused DOM tests pass, including the new compact/filter/problem/resume/proposal precedence contracts. Eight Chromium/WebKit first-answer geometry scenarios now pass: first-answer content visible by at least24px at1180×700 and390×700, each1×/2×, unchanged13px answer font and no horizontal overflow. Screenshots visually inspected. Larger-task/clarity/root reruns pending at checkpoint.

Relevant assurance: PRIV12 truthful states, PRIV14/15 legible controls/keyboard/zoom, SEC08/14 no score changes from recovery/resume and permission guards. This is bounded synthetic UI evidence, not broad account/security/legal/device approval. Parent integrates and independently reviews before release; no physical device or screen-reader acceptance here.

## Final exact-source verification and audit corrections

Implementation checkpoint `95094e7`. Full checks found and corrected three narrow UI issues before handoff:

1. Selecting an item while the native task chooser was open initially restored its old disclosure state during render. Red regression reproduced it; selection now closes it and returns keyboard focus to the chooser summary. The72-case click/keyboard matrix exercises this real path.
2. Old technical-transfer/source-conflict guards must take precedence over a stored proposal. New red/green test keeps the proposal hidden in those cases and shows the one actionable transfer/version line. A valid current proposal suppresses a stale preparation error in row, task chip and collapsed overall summary, without being teacher-confirmed.
3. Existing global button `transition:.15s` animated all properties during CSS page zoom in WebKit, temporarily shrinking computed min-height below44CSS pixels. The unchanged strict44px target check caught it. Wilma now transitions only colours/borders/shadow, preserving fixed geometry through zoom; no test tolerance was relaxed.

Fresh final results:

- Root web tests: **630 passed,0 failed**, `/tmp/gc-wilma-first-answer-root-final.log`.
- Existing UI regression + Wilma inline review: **40 passed,0 failed**, `/tmp/gc-wilma-first-answer-ui-final.log`, including undo/manual point controls, class-table8-column/footer behavior.
- Focused DOM review/navigation/compact/clarity: **35 passed**, including15 navigation behaviors. The initial full run's two obsolete wording assertions were reconciled with the explicitly requested shorter teacher copy; manual AI scope remains explicitly “für diese Aufgabe”. The real open/review and no-green-zero assertions remain.
- **8 first-answer geometry scenarios passed** in Chromium/WebKit,1180×700 and390×700 at1×/2×. Test now asserts the actual first response text's full bounding box fits the visible viewport, rather than merely asserting a row starts above the fold. Both engines at2×: first response bottom≤345.1CSS px within350CSS px. The response retains13px CSS font; expected alternatives remain side-by-side. No horizontal overflow, no external requests, no automatic score/request writes. Explicit free recovery and one-answer resume are exercised with local counters only.
- **72 chooser scenarios passed**,20/40/50/100 tasks ×9 viewport/touch/CSS-page-zoom cases ×2 engines. All tasks remain reachable; chooser is bounded with vertical scrolling; completed-task selection reveals existing answers; keyboard next-open, focus, close/class-overview handoff and44px controls preserved.
- **16 existing clarity scenarios passed**, per-gap expected alternatives, editable points/undo under keyboard/zoom, no external requests.

Before/after Chromium metrics: desktop first answer y501.5→314.0, phone y618.3→307.0, phone2× y753.8→307.1; expanded header66/247.8/234.7→52px, task context318.4/242.5/385.3→145px. WebKit corroborates: first answer499/586/724→313/307/307. All screenshots and before/after geometry remain at `/tmp/gc-wilma-first-answer/`; broader chooser evidence `/tmp/gc-layout-evidence/wilma-layout.json`, clarity `/tmp/gc-wilma-clarity-preview/verification.json`. Original before artifacts were captured before production edits and were not overwritten by the final rerun.

Integration contract: optional `resumeAnswer({questionId,submissionId})` only. No bulk/header resume callback is necessary; one explicit row click invokes one awaited callback. `resumeAllowed` is rechecked at click, and confirmed/source/transfer/proposal/current-running guards block the action. Parent must enforce job-identity/accounting/server guards and wire this callback; UI alone cannot prove billing authorization. `recoverQuestion` remains free status-only, never reused for new requests. No running test processes remain; no push, CI, release or live action performed here.

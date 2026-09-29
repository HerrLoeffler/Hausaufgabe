# Staging release audit — 29 September 2026

Baseline: `fix/gradecrew-staging-polish` at `92fcb1f5bce486f6c8fb01c46484058e17c0b7b0`.

## Verified

- Public staging homepage renders the new Clay crew and the teacher/student entry points.
- Deployed `crew-tour-gc25-final-polish.js` matches the baseline source (ignoring a trailing newline).
- Baseline GitHub AI Staging Checks succeeded.
- 35 focused local DOM/logic tests pass after this patch, covering the tour, final copy, dashboard completion, and client attempt guard. These are not real-device layout tests.

## Corrected in this patch

The free-answer coach was in document flow, but the tour still locked document scrolling, blocked touch/wheel gestures outside the current target, and floated the save button over the page. Resize also repeatedly centered the answer when a mobile keyboard opened.

- Enable scrolling only during the free-answer review step, preserving restrictions on unrelated actions.
- Move the actual save button after the answer card for the step; preserve its event listener and restore its original position on cleanup.
- Override the older floating-button style during this step.
- Show the explanation first without repeated resize scrolling.
- Add lifecycle and keyboard-resize regressions.

## Release blockers and remaining checks

1. Authenticated staging tour and mobile visual checks remain unverified: the available browser is signed out. Test 320/375/390px portrait, landscape, and the on-screen keyboard. Verify points, save, the Crew finale, and tutorial completion; repeat ordinary review outside the tour.
2. `firestore.rules` still allows published question documents to be read publicly and submissions to be created directly by clients. `SECURE_EXAM_PLAN.md` identifies solutions in the question data and the lack of a server-enforced single submission. The client attempt guard is mitigation, not completion. Server-side solution separation, scoring, attempt ownership, and idempotent submission remain release blockers for secure graded assessments.
3. Run actual staging submission checks: double-click, reload, back/forward, two tabs, network retry, and one result per attempt. Existing DOM tests do not prove deployed Firestore behavior.
4. Verify the exact staging deployment revision after deployment. Inspect production configuration and migration/rollback before promoting; no production deployment was performed in this audit.

No native app, Apple configuration, production backend, or data was changed.

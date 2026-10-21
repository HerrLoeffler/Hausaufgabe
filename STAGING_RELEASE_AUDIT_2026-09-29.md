# Staging release audit — 29 September 2026

Baseline before final polish: `fix/gradecrew-staging-polish` at `92fcb1f5bce486f6c8fb01c46484058e17c0b7b0`.

## Verified

- Public staging homepage renders the new Clay crew and the teacher/student entry points.
- Baseline GitHub AI Staging Checks succeeded.
- The authenticated desktop walkthrough in the preceding Staging Work session reached the real guided tour, verified the handoffs and the “Danke, Remy!” transition, and exposed the remaining preference-copy issue described below.
- Focused DOM/logic tests cover the tour, final copy, dashboard completion, mobile review lifecycle, keyboard resize behavior, and the client attempt guard. These tests are not a substitute for a real-device layout test.

## Corrected in the final tutorial patch

The free-answer coach was already placed in document flow, but the tour still locked document scrolling, blocked touch/wheel gestures outside the current target, and floated the save button over the content. Resize also repeatedly centered the answer when a mobile keyboard opened.

- Enable scrolling only during the free-answer review step while preserving restrictions on unrelated actions.
- Move the actual save button after the answer card during the step, preserve its event listener, and restore its original position on cleanup.
- Override the older floating-button presentation during this step.
- Show the explanation first without repeatedly scrolling when the on-screen keyboard resizes the viewport.
- Add lifecycle and keyboard-resize regressions.

The authenticated walkthrough also found that the preference explanation could still say “Persönliche KI-Vorgaben” after “Wünsche übernehmen”, even though the visible field is called “Vorgaben für Remy”. The older gc23 layer changes the existing coach in place instead of adding a new coach, so the previous observer could miss it.

- Observe in-place changes inside the current coach and replace the legacy wording with “Vorgaben für Remy”.
- Add a regression that mutates the same existing coach exactly as the real tutorial does.

## Release blockers and remaining checks

1. A final real-device/mobile visual pass is still required: 320/375/390 px portrait, landscape, and an on-screen keyboard. Verify free-answer points, save button, Crew finale, tutorial completion, and ordinary review outside the tutorial.
2. `firestore.rules` still allows published question documents to be read publicly and submissions to be created directly by clients. `SECURE_EXAM_PLAN.md` identifies solutions in the question data and the lack of a server-enforced single submission. The browser attempt guard is mitigation, not completion. Server-side solution separation, scoring, attempt ownership, and idempotent submission remain blockers for secure graded assessments.
3. Actual deployed staging submission behavior still needs adversarial checks: double-click, reload, back/forward, two tabs, network retry, and exactly one result per attempt. DOM tests do not prove deployed Firestore behavior.
4. Before production promotion, verify the exact staging release manifest, migrate the secure submission path, and replace/audit the legacy production deployment scripts. Do not use the current production scripts for this GradeCrew release candidate.

No production backend, production hosting, production data, or Apple configuration was changed by this audit.

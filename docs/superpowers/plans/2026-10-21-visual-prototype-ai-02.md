# Issue 255 implementation plan

Goal: Integrate the user-approved Prototype 02 into the existing GradeCrew workflow, on an isolated preview in gradecrew-staging-2026.
Spec: GitHub issue 255 and the explicit 21 October implementation request. Existing design is approved by the user; no new design interview is needed.
Architecture: Preserve vanilla modules and existing flows. Existing single/multi/number remain. A single visual interaction family carries the 12 additional prototype interactions using a versioned visualTask JSON string; no arbitrary markup. The checked prototype model validates and grades server-side; solutions are stripped from the public paper. JSON string avoids Firestore nested-array restrictions. Existing quotas, ownership, immutable attempts and idempotent submission apply.

- [ ] Backend: reuse checked prototype core, extend AI schema/prompts, validation/normalization/job mapping, single and whole-test Emmi; secure public/private assessment and grading; regression tests.
- [ ] Frontend: reuse renderers with safe scoped styles, editor preview and teacher solution, preserve serialization/import/export/Emmi, secure student rendering/answers and existing practice preview; movable protractor with keyboard/touch controls, no digital answer; build includes.
- [ ] Verify: full configured relevant suites and independent review; correct defects.
- [ ] Release: exact committed source, isolated hosting channel and isolated new backend codebase/function names in gradecrew-staging-2026; do not change canonical hosting or school Live; use existing server Secret Manager reference.
- [ ] Real E2E: fraction 6/12 Remy, Emmi revision, adopt/save/reload, correct and wrong answers and points; NT or German, keyboard/touch. Capture request IDs/model/usage, no secrets or student data.

Review focus: public solution leakage; malformed IDs/markup and excessive data; save/reload loss; server/browser grading parity and multi-answer partial credit; concurrent attempt submission.
Ruling: native managed worktree cannot attach this projectless checkout (saved GradeCrew project is not a Git repository); an own fresh clone/branch provides isolation.
Model requested for complex integration: Sol medium by project guidance; actual runtime effort unavailable/unknown. No runtime model switch claimed.

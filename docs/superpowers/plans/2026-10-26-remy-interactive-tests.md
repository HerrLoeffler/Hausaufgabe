# Remy Interactive Tests Implementation Plan

Goal: integrate five prioritised interactive task families into normal Remy-created real tests using existing blueprints and AI lab.
Architecture: Reuse the existing visual question type, its closed schema, deterministic renderer and server-authoritative Assessment contract from the laboratory. Extend only the missing multi-event timeline and picture sequence, with shared validator parity and normal generation controls.
Tech stack: Existing vanilla JS modules, CommonJS Firebase Functions/Assessment, SVG and existing secure test flow.
Spec: docs/superpowers/specs/2026-10-26-remy-interactive-tests.md.

Constraints: no duplicate generator, no teacher JSON editor, no arbitrary AI HTML/SVG/URLs, no exposed private solutions. Current feedback-learning and public homepage retained. Existing task/budget/attempt histories preserved. Production not included.

Review focus: public-only solution stripping; extra/duplicate/partial answers; stale persisted job format restrictions; declared picture vs drawn scene consistency; keyboard/touch and saved answer restore.

- [x] Merge existing PR296 lab into own current integration checkout; preserve conflict halves. Baseline recorded with inherited fixture failures to reconcile.
- [x] Contract worker: add timeline/sequence to shared core/three server/client adapters, examples, grading, public validation and focused tests (fail before implementation).
- [x] UI worker: reuse renderer with true scale timeline, reversible labels and sequence pictures, botanical plant art, keyboard and saved responses; focused DOM tests.
- [x] Root: connect normal Remy picker, persisted request choices, bounded blueprint authoring guidance and output constraints; reconcile pre-existing UI fixtures against real code.
- [x] Run core/client/Functions/Assessment tests, packaging, browser actual teacher/student flow. Seek independent security/correctness review of exact candidate.
- [x] Secure PR/checkpoint and central task handoff; publish/test only approved separate staging scope if existing credentials allow; distinguish code/CI/staging/live AI proof/Production.

# Publication review Implementation Plan

> Execute inline using executing-plans; root performs independent review before release.

**Goal:** Every normal publication entry presents the same three-step safe settings review.
**Architecture:** Focused publish-review.mjs native dialog, publish-review.css, minimal app.js hooks. Existing save and practice server publisher retained.
**Tech Stack:** Vanilla JS/CSS, native dialog, node:test/JSDOM, browser fixtures.
**Spec:** docs/superpowers/specs/2026-10-26-publish-review-design.md

## Constraints and review focus
No cloud writes until final button. Preserve existing audio guards and immutable active runs. Keep local draft settings after cancel. Account/draft/remote changes refuse stale publish. Errors cannot blindly retry an ambiguous write. German/English, keyboard/focus and short viewport.

## Task1 focused review
- [x] Write failing real DOM tests: zero publication opening/navigation/cancel; settings retained, validation, practice acknowledgment, single flight, error retention, language/focus.
- [x] Run node --test publish-review.test.mjs (fail: missing module).
- [x] Implement requestPublishReview({settings,scales,onChange,onPublish,doc,locale}) and CSS.
- [x] Run tests and browser fixture sizes/touch/keyboard where available.
- [x] Commit scoped module and tests.

## Task2 common publication integration
- [x] Write failing integration contract/behavior tests for editor, dashboard/reopen funnels and version/single-flight guards.
- [x] Connect all publish entry points to common review; apply changes to editor draft; save only final; integrate conscious practice approval; transactional normal publication guards.
- [x] Run root node tests, tools/ui regression suite, focused existing audio/publication/server tests. Record actual failures/limits.
- [x] Commit with HDF and return SHA for root independent review. No deployment.

Verification record: docs/evidence/publish-review-live-20261026/verification.json. Root independent review/release remains separate.

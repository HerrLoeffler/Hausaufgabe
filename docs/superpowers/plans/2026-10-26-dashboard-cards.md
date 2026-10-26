# Dashboard Cards Implementation Plan

> Execute in this Fachchat with test-first changes; coordinate the `app.js` renderer hunk against PR #328 before integration.

**Goal:** Compact, legible, status-correct dashboard cards with visible student and teacher-live entry points.

**Architecture:** Reuse `renderQuizList`, native per-card `details`, `showPublish` and existing GradeCrew CSS layer. Avoid changes to publication handlers.

**Tech Stack:** Vanilla JS/CSS, node:test + JSDOM, synthetic Chromium/WebKit layout fixture.

**Spec:** `docs/superpowers/specs/2026-10-26-dashboard-cards-design.md`

## Constraints

- Source starts at live `f048ed1a`; do not roll unrelated staging changes into a live build.
- Keep PR #328 publication review owner and backend unpublished-code guard separate.
- No real student, test, duplicate, publish or timer writes during QA.

## Work

- [x] Add failing renderer tests: visible link only for valid active published cards; teacher live action only for waiting/running; existing handlers and per-card disclosure; status variants and English label.
- [x] Implement minimal `renderQuizList` changes and English string mapping; rerun focused tests.
- [x] Watch the card CSS regression check fail before the fix; add a 52-card browser geometry check and update existing card CSS minimally.
- [x] Check 320/390/430, iPad portrait/landscape, desktop, open/closed menu, long titles and no horizontal overflow or overlap in Chromium/WebKit.
- [x] Run focused and relevant root/UI tests, staging build, diff check; preserve exact results and remaining limits in the existing task handoff.
- [ ] Commit and publish own branch; request independent review, then coordinate preview and any explicitly authorized Live release from exact source/asset manifest. Commits, GitHub PR #329 and review are done; preview and release coordination remain.

## User follow-up, 26 October

- [x] Verify `endQuiz` closes student access and preserves results; verify `deleteQuiz` confirms recoverable trash placement.
- [x] Add failing card tests for a top-right trash action outside the closed disclosure and a clear end label; implement while preserving handlers and 44px target.
- [x] Repeat 52-card Chromium/WebKit geometry and local root/UI/build checks.
- [ ] Secure the follow-up on PR #329, refresh the handoff, and coordinate integration/preview with the release owner.

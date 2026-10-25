# Remy/Emmi image target repair — Implementation Plan

> For agentic workers: use superpowers:executing-plans task by task. Existing user scope fixes the required behavior; use the existing verified image pipeline, not a parallel provider.

**Goal:** Explicit requests for two images produce two actual task images or an honest incomplete result with targeted recovery.
**Architecture:** Keep text revision separate from image fulfillment. Reuse verified, quota-bound media creation. Count real usable media rather than task labels; retain intact source media and locks. Persist logical media operation identity before provider dispatch and reuse it across retry/reload.
**Tech Stack:** Existing JavaScript/Node22, Firebase callables/transactions, browser editor modules and node:test.
**Spec:** User repair scope recorded in workstreams/remy-emmi-image-target-20261025.md.

## Global Constraints
No real provider request during diagnosis; no Production, Rules, plugin or402 deployment. No source test changes on the server without explicit save. Keep100-question limit,0–5 new image budget, existing image quotas, image safety checks, account/write gates and immutable submitted tests.

## Review Focus
Already-existing but unrenderable image; ambiguous or oversized request; account/test change during generation; provider timeout with unknown result; undo/reload while an image is pending.

### Task1 — Image goal and revision contract
- [ ] Add and observe failing existing-module regressions: total2 at0/1/2 images, additional2, explicit replacement, no image wish, locked tasks, safety fallbacks.
- [ ] Add bounded image-goal parsing/validation to the existing revision boundary; preserve only valid needed media intents and keep original media when no change is requested.
- [ ] Keep points/order/IDs/type guards and independent feedback-learning path unchanged; report unfulfilled media separately.
- [ ] Run focused server tests and commit.

### Task2 — Verified media lifecycle
- [ ] Add failing operation/retry fixtures, then atomic owner/content-bound deduplication for the existing media callable. Completed assets reusable; running/unknown operations must not incur a second request. Explicit retries only for known failures.
- [ ] Retain existing per-attempt quota/cache/review constraints and return truthful media status. Server-side journal remains private; inspect existing Rules before choosing storage path.
- [ ] Test concurrent calls, failure, retry, result recovery, cancellation and account boundaries using fixtures, no paid calls.
- [ ] Run server suite/lint and commit.

### Task3 — Editor and initial creation
- [ ] Add failing real-handler fixtures for editor fulfillment and initial partial media output.
- [ ] Minimal owned app.js hunks: preserve media, generate only missing/new required assets, verify image readability, persist pending identities, expose image-only retry and distinct counts. Keep full undo and stale-editor guards.
- [ ] Remy job partial media report must not claim fulfilled image target; preserve useful draft and support targeted image retry instead of whole paid regeneration.
- [ ] Correct protected-task label; no audio task may be relabeled as a generated image.
- [ ] Test fixture image attachment, visible rendering/save/reload,0→2/1→2/2→2/add2, failure/retry/doubleclick/undo/account switch.

### Task4 — Candidate verification and preview
- [ ] Refresh live development/target to retain Analytics changes, run root/functions suites and appropriate CI.
- [ ] Independent scoped review of exact candidate; fix findings before integration.
- [ ] Provide existing isolated test preview only after preview gates. No school-live change. Any real minimal image-generation proof needs explicit bounded budget first.
- [ ] Save exact commit/PR/check/preview receipts and remaining device/provider limitations in handoff and separate central TODO update.

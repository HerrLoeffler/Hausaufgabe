# AI cost, storage and memory — V1

Updated: 2026-10-02

## Scope and safety

- Branch: `feature/ai-cost-memory-v1`
- Base: `feature/gradecrew-app-integration@74eb2ec08e81315875abfc4b1ae052d9f78797eb`
- Production: untouched.
- Staging: not deployed from this branch yet.
- Goal: keep expensive/raw data short-lived, retain compact useful memory, and avoid repeat AI calls when an exact verified result already exists.

## Important lifecycle clarification

Uploaded source material under `aiUploads/` is not part of a finished test. During generation/analyse it is read into the server request and the generation flow calls `deleteUploadedMaterials(...)` in `finally`, so a successfully handled upload is normally removed immediately after that AI operation. The existing 24-hour purge is a safety net for abandoned/orphaned uploads that never reached normal cleanup.

The finished test itself is persisted separately in Firestore under `quizzes/{code}` plus its question documents. Therefore a test can still be conducted after 32 hours, days or months without the original PDF/image upload. If a teacher later wants the AI to re-read the original source file itself, the file must currently be uploaded again. A future derived material-memory layer should store only a compact safe summary/fingerprint, not the original file by default.

## Implemented on this branch

### 1. Bounded raw AI telemetry

`users/{uid}/aiEvents/*` now receives an `expiresAt` timestamp with a 30-day horizon. The daily cleanup also removes expired `aiEvents` documents. Raw per-call data is therefore debugging/operations data, not permanent product memory.

### 2. Compact long-term usage rollups

Every AI usage event also updates one compact monthly document per user and usage kind under:

`users/{uid}/aiUsageRollups/{YYYY-MM}-{kind}`

The rollup stores request count, input/output/total tokens, cache hits and the last model/prompt version. This lets GradeCrew retain cost/usage trends without keeping millions of raw events forever.

### 3. Short-lived quota documents

Daily quota documents under `users/{uid}/aiUsage/{YYYY-MM-DD}` now receive a 14-day `expiresAt`. They are operational rate-limit state, not historical analytics. The monthly rollups are the long-term record.

The minute limiter was also corrected to use a separate minute key per quota kind. Previously a request of another kind could advance one shared minute marker while leaving an older burst count behind.

### 4. Verified image memory

A persistent server-side cache now exists for verified AI-generated task images:

`aiGeneratedCache/<hashed-user-scope>/<exact-context-hash>.webp`

The cache key includes the authenticated user scope, image model/prompt version, image prompt, expected scene, actual question text, alt text and size limit. Only an image that has passed the existing visual quality review is saved.

On an exact cache hit GradeCrew skips both the image-generation API call and the repeat visual-review AI call. Image quota is consumed only on a real cache miss. Cache hits are recorded separately as `image_cache_hit`.

The cache retention is 30 days and the daily cleanup removes older cache objects. This cache is only an optimization: failure to read/write it never discards a paid-for verified image.

### 5. Existing upload cleanup retained

- normal handled material: deleted by the generation/analyse flow in `finally`;
- orphaned upload fallback: deleted after 24 hours;
- generated verified-image cache: deleted after 30 days.

### 6. Cleanup indexes

`firestore.indexes.json` now explicitly includes collection-group indexes for `expiresAt` on `aiEvents` and `aiUsage`, matching the daily cleanup queries.

## Verification performed

- Targeted local Node harness: 13/13 tests passed for usage retention helpers, cache-key scoping, upload/cache retention and the media-flow cache-hit path.
- Syntax checks passed for the modified helper modules in the same harness.
- A branch-specific GitHub Actions workflow was added, but no remote workflow run was observed through the connector after these commits. Therefore this branch is **not** marked full-CI verified yet.
- No deploy or device verification was performed.

## What is deliberately not changed yet

1. Finished test images are still embedded in the question document as optimized WebP data URLs. Moving durable test media to Storage needs a backwards-compatible renderer/storage migration and should not be mixed into this cost-control patch.
2. `loadQualityMemory()` still reads raw `ai_question` feedback and aggregates it at generation time. At scale this must become pre-aggregated memory documents so a generation reads a handful of summaries instead of potentially thousands/millions of feedback rows.
3. There is not yet a reusable approved-question bank that can satisfy a new test request without a model call.
4. There is not yet an accepted-answer/explanation memory for student free-text/game help.
5. Original teaching materials are intentionally not retained as a cache. The next safe step is a compact derived summary/fingerprint with explicit privacy/copyright bounds.

## Next implementation order

1. Pre-aggregate feedback into small context buckets (subject/grade/type) and change generation to read those buckets.
2. Add an approved-question memory with provenance/versioning and strict reuse rules; do not silently reuse a question that has been negatively rated or whose curriculum context differs.
3. Add accepted-answer and misconception/explanation memory for free-text grading and games, with local/rule-based matching before AI.
4. Move durable generated task images from Firestore base64 to Storage references with compatibility support for old tests.
5. Add an admin cost dashboard fed from `aiUsageRollups`, with cache-hit rate and estimated provider cost per real classroom round.
6. Only after full repository tests: integrate into `feature/gradecrew-app-integration`, deploy to Staging, verify actual Firestore/Storage behavior, then consider Production separately.

## Status vocabulary

- Code on GitHub: yes, on `feature/ai-cost-memory-v1`.
- Integrated into GradeCrew staging branch: no.
- Targeted local tests: passed.
- Full repository CI: not yet observed/verified.
- Deployed to Staging: no.
- Device verified: no.
- Production: unchanged.

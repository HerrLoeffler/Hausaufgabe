# Visual feedback images implementation plan

> **For agentic workers:** Use superpowers:executing-plans task-by-task.

**Goal:** Every new general visual report carries a real, privately stored, reviewed raster image.
**Architecture:** Reuse reviewMode, reviewNotes, feedback mirror and IndexedDB outbox. Current-tab Screen Capture with verified Capture Handle; manual screenshot file fallback. Client flattens crop/redaction into final JPEG. Server decodes/re-encodes using existing sharp, private Storage and server-only upload leases; authenticated bounded image reads; daily expiry and deletion.
**Tech Stack:** Vanilla ES modules/canvas, Firebase callable/Auth/Firestore/Storage, existing sharp.
**Spec:** Human scope recorded in existing workstreams/feedback-gc39-release-20261013.md, section26Oct.

## Global constraints
- Existing task GC-WEB-REPAIR-20261007; base actual Live1951f197; no unrelated web/analytics/smiley changes.
- Browser native permission respected; reject non-current tab; no DOM redraw called screenshot.
- <=2MiB final JPEG, <=4096px per dimension, <=12MP; original never persisted/uploaded; metadata stripped server-side.
- Local final-image draft/outbox survives offline/reload; no server receipt without image; retries same ID/content.
- Private Storage deny-all remains; server active-owner/admin image retrieval; no public download token/URL.
- Orphan uploads24h; attached images90days; explicit image removal; account deletion integrated; old reports clearly without image.
- Independent review/exact CI before deployment; coordinate freshest Live package before any hosting.

## Review Focus
- Wrong-tab capture rejected and tracks stopped on every exit; unsupported browsers get file fallback.
- Crop/redaction survives real export pixels, reset cannot leak originals to persistence.
- Delayed account switch cannot upload/send/render into another account.
- Upload success/receipt loss/retry/cleanup races cannot create false sent state or overwrite image.
- Old notes, pending approvals, admin-only reads and private central media remain compatible.

### Task1: private image backend
- [ ] Write/run red tests: image normalization rejects malformed/oversize/SVG; metadata removed; upload idempotent/immutable; owner/admin/foreign access; expiry/orphan/delete; visual create rejects missing image, commits ready lease, old notes unaffected.
- [ ] Implement functions/lib/feedback-images.js; review-mode service and callable integration; scheduled cleanup and account cleanup. Storage/Firestore rules remain deny-all for new paths, add explicit negative emulator coverage.
- [ ] Run focused tests then functions suite/check, commit.

### Task2: real capture and final-pixel editor
- [ ] Red tests for tab verification/stop and final pixels/crop/limits, local draft, upload retry/account switch; implement review-image.mjs and integrate compact capture/review outbox.
- [ ] Preview before send, file fallback, full viewport default, optional region. Accessible controls, existing teal/white/system typography; responsive image stage. No new visual identity.
- [ ] Test focused/browser/root suites, commit.

### Task3: admin and central retrieval
- [ ] Red tests: old/noimage distinction, authenticated image render, denial, disconnect-safe connector media and pagination no automatic bulk image download.
- [ ] Implement admin image control and central image read tool returning actual image content; existing lists expose bounded image availability only. Build includes new module.
- [ ] Exact candidate CI, independent spec/security review, synthetic browser evidence; final coherent release after overlap check.

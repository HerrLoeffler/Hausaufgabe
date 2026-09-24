# Testify AI architecture

Status: AI beta, Staging only.

## Safety boundary

- Production remains the verified V2.3.0 release until an explicit later production release.
- Development branch: `feature/ai-integration`.
- Staging project: `hausaufgabe-staging`.
- OpenAI credentials never enter browser code or Firebase config. They are read by Cloud Functions from Secret Manager as `OPENAI_API_KEY`.
- The AI beta is currently restricted server-side to users whose Firestore profile has `role == "admin"` and is active.

## Request flow

Browser -> Firebase callable function -> server-side auth/profile/quota checks -> OpenAI -> Testify validators -> browser draft.

The browser uses `ai-client.js`; model names, quotas and API credentials remain server-controlled. Callable functions automatically carry Firebase Auth credentials. App Check enforcement is intentionally disabled during the first staging bring-up and must only be enabled after a verified App Check web configuration.

## Text generation

- Responses API.
- Structured Outputs with strict JSON Schema.
- Text model: `gpt-5.6-terra`.
- `store: false`.
- Test generation validates the result again with Testify-specific semantic rules. One bounded repair request is allowed when a structurally valid response violates semantic constraints.
- Per-question AI edits return exactly one question and preserve the existing question ID client-side.

## Media

- Existing Testify question images remain compatible through `imageDataUrl` / `imageUrl`.
- AI-generated images are generated server-side with `gpt-image-2`, compressed to WebP, and returned as a bounded `imageDataUrl`. This deliberately reuses the existing renderer for the first beta and avoids introducing a second student-asset authorization path at the same time as the AI backend.
- Image-answer options use optional `imageDataUrl` / `imageAlt` fields on existing single/multi options; old options remain valid.
- Teacher source materials are uploaded privately to Cloud Storage under `aiUploads/{uid}/...` and read by the backend with the Admin SDK.
- AI-generated source crops are not automatically faked. `uploaded_crop` remains reserved for the later deterministic crop workflow.

## Source material

Supported beta MIME types: PDF, JPEG, PNG, WebP, TXT, CSV, DOCX, PPTX and XLSX, max 15 MB each and max five files per generation. Uploads are private to the owner. Material contents are explicitly treated as untrusted data in prompts so embedded instructions cannot override Testify rules.

## Quotas and observability

Per-user minute/day counters are stored in private server-managed subcollections below the user document. Normal client Firestore rules do not expose these collections. AI event records contain usage metadata (tokens, model, request type, time) but not full uploaded content or full prompts.

## Compatibility

All new media fields are optional. Existing tests, JSON import, manual editor, student renderer and deterministic correction remain available. The legacy external prompt/JSON import remains as a fallback inside the AI screen during the beta.

## Rollout

1. Deploy only to `hausaufgabe-staging`.
2. Configure `OPENAI_API_KEY` secret in staging.
3. Verify admin account access.
4. Run text generation smoke tests.
5. Test question regeneration and undo.
6. Test materials.
7. Test image generation / image answers.
8. Configure and verify App Check, then switch callable functions to `enforceAppCheck: true` in a later hardening commit.
9. No production deploy without a separate explicit release decision and rollback checkpoint.
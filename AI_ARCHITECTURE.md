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
- Text model on staging: `gpt-5.6-luna` (compare generated test quality before promoting).
- `store: false`.
- Test generation validates the result again with Testify-specific semantic rules. Individual invalid or repeated questions are replaced through bounded, independently validated question requests while the valid questions, point total and selected image counts remain intact. If there are global errors or local replacement is exhausted, one full-test repair is attempted. Only a fully valid test reaches the editor; repair attempts are counted in token usage and may increase costs and runtime.
- Total points are brought to the teacher's requested value in deterministic 0.5-point steps before semantic validation, including after full regeneration; incompatible counts and point totals are rejected before the AI request.
- The teacher requests exact numbers of questions with one generated image (0–5) and questions with illustrated answer options (0–3), with at most five visual questions total. Validation and the bounded repair require those counts. Each illustrated choice triggers a separate image request (2–4 per question); the form shows the total range before generation. Cached older clients retain their original optional-image behavior.
- Per-question AI edits return exactly one question and preserve the existing question ID client-side.
- Quality checks reject comma-counting tasks that already show the commas and image-choice tasks that disclose the answer or try to express a non-observable temporal meaning through one image. These are targeted checks, not a guarantee of semantic accuracy. Illustration prompts ask for the specific objects and relationship in each answer; the teacher still reviews the resulting images.

## Beta question feedback

- The editor offers green and red ratings on AI-generated tasks (admins can also rate legacy tasks). Red feedback requires one of five reason codes and optionally a short teacher note; "other" requires a note. The teacher can keep, replace with AI or remove the task after saving the feedback. Positive ratings keep the task.
- Feedback is stored in the existing private Firestore `feedback` collection under `category: "ai_question"`. The record contains teacher ID, test/question IDs, rating, reason, optional comment, action, prompt/model version and a bounded question/answer snapshot. It does not copy image binaries, uploaded material or student submissions. Repeated ratings of the same question content update the same record.
- The admin Feedback tab filters KI-Aufgaben, shows reason counts and lets the admin inspect the question snapshot and mark negative reports as reviewed. Positive ratings are recorded as completed. Review recurring reasons, decide which issues are generalizable, then make versioned prompt/validator changes and add regression cases. Feedback never automatically retrains the model or enters unrelated generation prompts. If the teacher explicitly chooses AI replacement, that teacher's note is sent as an instruction for that one replacement.
- Image mismatches require teacher review: the stored snapshot records that an image existed, but does not archive the actual picture. This limits reproduction after removal and calls for a separate, consent-aware image quality workflow if image errors become frequent.

## Media

- Existing Testify question images remain compatible through `imageDataUrl` / `imageUrl`.
- AI-generated images are generated server-side with `gpt-image-2`, compressed to WebP, and returned as a bounded `imageDataUrl`. This deliberately reuses the existing renderer for the first beta and avoids introducing a second student-asset authorization path at the same time as the AI backend.
- Image-answer options use optional `imageDataUrl` / `imageAlt` fields on existing single/multi options; old options remain valid.
- Teacher source materials are uploaded privately to Cloud Storage under `aiUploads/{uid}/...` and read by the backend with the Admin SDK. The original bytes are sent to the OpenAI Responses API when generating from materials; the image endpoint receives only a newly written text prompt.
- The material selector offers two content-scope choices: topic guidance with supplementary knowledge or subject matter limited to the uploaded material. Neither mode changes the fact that the original bytes are transferred to OpenAI, so neither mode clears privacy or reuse rights.
- AI-generated source crops are not automatically faked. `uploaded_crop` remains reserved for the later deterministic crop workflow.

## Source material

Supported beta MIME types: PDF, JPEG, PNG, WebP, TXT, CSV, DOCX, PPTX and XLSX, max 15 MB each and max five files per generation. Uploads are private to the owner; new uploads are restricted to active beta admins. Material contents are explicitly treated as untrusted data in prompts so embedded instructions cannot override Testify rules. The upload form requires confirmation that no third-party personal data is present and the rights to process the material with external AI are cleared. This declaration is a guardrail, not a license or a substitute for the school's legal review.

After an AI test generation or material analysis attempt, the server deletes the uploaded originals, including on errors. The client also tries to remove them and keeps failed deletions visible. Logout attempts to clear pending materials and removes their names from local state when accounts change. A daily scheduled job deletes abandoned uploads once they are at least 24 hours old (normally within 24–48 hours of upload). This only covers Firebase originals. The API requests set `store: false`, but default OpenAI abuse-monitoring logs can contain customer content for up to 30 days. Generated questions, images, student submissions and AI usage events in Firestore need a separate retention policy.

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

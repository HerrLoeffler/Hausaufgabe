# Independent final review — web acceptance 20261007

Candidate: `5cb88f34c46e6b8fe76218d14b0db95139728376`; baseline: `0931ade4e415690cc149c829c5f1a6703d085177`.
Task/branch: existing web-repair-20261007 / feature/audio-web-acceptance-20261007. Read-only source review; no source edits, provider calls, CI dispatch, integration or deployments. START_HERE, AGENTS and coordination files fetched from current GitHub main. Review focused runtime diff and audio contracts; not a broad historical security audit.

## Decision

**Reject staging eligibility pending the two Important fixes below.** No Critical issue verified. Existing frontend/server draft-only audio gates must remain false. Exact-candidate remote CI and the root's remaining visual CTA check are still required; parent-reported broad passing tests are not independently rerun or represented as reviewer evidence.

## Important — persisted in-flight flag permanently disables restored audio drafts

`app.js:4615` and `app.js:4649` store `audioGenerationInFlight = true` directly on the question, immediately followed by `markDirty()`. `editorDraftSnapshot` at line 5197 deep-clones all questions; the 180 ms autosave therefore saves the transient flag while generation is pending. Draft restoration at lines 3426/3442 retains it; `initializeTypeData` does not reset it. After a refresh/close during a slow request, no request exists in the restored session, but both generation methods return “Audio wird bereits erzeugt.” forever. This is a normal recovery flow for the newly added conversion feature.

Verified using functions extracted from pinned candidate: begin deferred generation, JSON-clone the question as the actual snapshot does, restore it in a fresh runtime, call conversion. Result: flag `true`, message `Audio wird bereits erzeugt.`, no generator request.

Fix: keep operation state in an external WeakMap/WeakSet/token registry, or explicitly omit transient flags from snapshots and clear them on every restoration. Test interrupted question and answer generation recovery, including failed/stale completions whose finally block does not schedule a fresh draft save.

## Important — late direct-conversion response overwrites explicit audio edits/removal

`app.js:4621–4624`: the fromTask guard compares only the derived task text and question type/context. The editor still permits custom transcript/presentation changes and audio removal while generation runs. `clearQuestionAudio` changes none of the compared fields. Consequently a late response restores removed audio, overwrites a newly written custom transcript, and resets presentation to listening-only/supplement.

Verified with pinned candidate functions and deferred generator: start fromTask on a question containing prior audio; call `clearQuestionAudio(q)`; resolve request. Audio returns and presentation becomes listening-only. Separate reproduction: change `q.audioScript` to `Teacher custom edit` while pending; it becomes `Original question` on completion.

Fix: capture an operation/revision token invalidated by every relevant audio edit/removal/presentation change and verify it before attachment. Also compare the actual derived source when the optional custom-script path falls back to task text. Add behavioral tests for removal, custom transcript changes and presentation changes during pending generation.

## Minor / mandatory before secure audio cutover — structured audio missing from authoring fingerprint

`assessment-functions/lib/assessment-core.js:144–153` adds authoritative `audioAnswerItems`; `fingerprintQuestion` (lines 289–315) omits the array, unlike audio stored in options. Regenerating only a grouping/matching/ordering memo changes the public paper but not `authoringFingerprint`, used by `contractForQuestions` to reject changed active assessments.

Verified: two otherwise identical ordering audio questions with different `audioAnswerItems[0].audioDataUrl` produce equal authoring fingerprints. Current draft-only gates prevent reaching the public student lifecycle with these modes, so this is not a current data-exposure finding and does not independently block gated draft staging. Before enabling secure publication, include normalized structured memo key/source/audio/stale fields in the fingerprint and test changed bytes/staleness.

## Positive evidence and limits

The patch retains the false secure-audio publication gates; structured public paper uses opaque identifiers and strips answer source text. Audio quota repair preserves the existing bounded repair loop and validation. Startup imports and staging allowlist include the new workspace module/styles; local UI fixtures are outside that allowlist. No source modification or access expansion was performed during review.

Review reproductions ran locally with the bundled Node binary and pinned git-show app source; no paid requests. Remaining release/device/CI proof belongs to serial root integration. Next step: fix the two Important issues, add their focused regressions, then review the new immutable diff before staging.

## Successor delta review — acd8512d3386bee2ca663a08088da240e3294d83

Bounded review of 5cb88f3..acd8512 only. Independently ran audio-task-conversion, assessment audio-answer-contract and gradecrew-tour suites: **37/37 passed**. The persisted-busy-state issue, the original direct-conversion removal/transcript races and structured-media fingerprint omission are resolved by this successor.

**Decision remains reject pending one residual branch of the same Important stale-response issue.** With the optional custom transcript empty, `generateAiAudioForQuestion(q, container)` uses task text as its source, but line 4635 only compares task text when `fromTask` is true. The actual “Eigenen Hörtext vorlesen” control calls without that flag. Reproduction against pinned successor: question text `Old task`, empty audioScript; start deferred default conversion; change text to `Edited task`; resolve request. Result: audioScript `Old task`, new audio attached, audioNeedsRegeneration false. No external request was made.

Fix: capture whether the request actually uses task text and check the corresponding current derived source before attaching, including the empty-optional-transcript fallback. Add a deferred-response regression for this UI route. All other findings above are closed; this is a residual of the original source-change guard recommendation, not a new broad audit.

## Final successor decision — 6ac3adc2cb46362091787791048a641d00eaa293

Reviewed only acd8512..6ac3adc for the residual source-change guard. `usesTaskText` now reflects both direct conversion and empty/whitespace custom-transcript fallback, and the late-response guard checks the actual derived source. Independently reran all 11 audio-conversion tests: **11/11 passed**, including the new deferred empty-transcript regression and all earlier race/recovery regressions. Prior successor's independently verified 37-test result remains recorded above; no broad suite was repeated in this final bounded pass.

**APPROVED for scoped staging eligibility with existing draft-only audio gates retained.** All concrete findings from this review are closed. This supersedes the earlier rejection decisions without deleting their history. Approval is a code-review result, not evidence of exact remote CI, integration, deployment, user/device acceptance, secure Rules cutover or Production authorization. Root must still obtain the exact candidate CI/deploy evidence and complete its pending visual check through the normal release workflow. No additional findings in this bounded delta. No source edits, provider calls, CI dispatch, merges or deployments by reviewer.

## Independent CSS-only follow-up — cb5a5b3 / remote02ac0203

After PR161 integration, the actual Preview exposed horizontal overflow from the transparent publication checkbox and from mobile column-flex wrapping. Reviewer acceptance_final_review independently approved only the two targeted CSS deltas: relative label + visually clipped1px input, then a single-column mobile primary-action grid with shrinkable full-width buttons. The native control, DOM order, keyboard operation, visible switch focus and existing44px minimum action height are preserved. No broad suite or source writing by reviewer.

Parent browser proof: before correction desktop1920 overflow55px / phone390 overflow305px. After both corrections the actual local current renderer at390×844 has0px overflow; checkbox1px. Desktop1920 likewise0px. This is browser viewport proof, not physical-device or human acceptance. Final local cb5a5b3eefba08059c2c80d8d7add4a65bd7c5fa and remote02ac020369807a3428aacfaa1a38703f683c0ffe share treed4649445e5b4e201c003baae1efd09d3fa7ca9e5. Existing private-audio draft gates remain required.

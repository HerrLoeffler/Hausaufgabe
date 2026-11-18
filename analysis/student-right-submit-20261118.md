# Student right sidebar and typed submission · 18 November 2026

Existing tasks GC-WEB-REPAIR-20261007 / GC-PEDAGOGY-KB-01. Isolated implementation specialist `student_right_submit`; parent owns integration/release and shared coordination documents. Branch `fix/student-right-submit-20261118`, base 19117b4. Parent verified current main c1d1ec7 / Development Status 44346330053 success and live 4c736c2 before dispatch. No new task, provider attempt, budget, account access or deployment. Runtime model/effort unknown; no model switch.

## Scope and decisions

Latest human brief supersedes the earlier left sidebar: questions left, 208px progress/navigation right with 24px gap; large Test abgeben button immediately below overview. Side layout starts at 1180 CSS px / 600 CSS px height in both real Secure and legacy/teacher preview; 1024px stacks. Existing fonts and generous question width retained: Secure 860px wide in side layout and existing max-width on compact. Main visual tokens retained (#f5f7fb surface, #ffffff cards, #172033 text, #1769e0 action, existing inherited type); no new branding. Baseline compact layout displays overview before questions, submit after questions. CSS changes layout without replacing or moving live inputs/audio on resize.

A browser screenshot revealed a pre-existing height assumption: sidebar begins below title but was sized as if it started directly below sticky header. Both navigators now measure actual sidebar top, reserving space for the submit card and leaving only the overview list scrollable. This makes the big button visible on initial load and while scrolling.

Shared dialog displays answered/open counts and a warning when open tasks remain. Manual real submission requires trimmed, NFKC-normalized, case-insensitive ABGEBEN (German) or SUBMIT (English). Cancel/Escape/abort never submit; native dialog semantics, label/description, initial cancel focus and focus return retained. Plain text input supports normal keyboard/OS dictation; no voice service, identity check, CAPTCHA, or new external dependency. Preview retains its no-save semantics and does not require the final-submission word. One outer English label added to existing catalog.

Real Secure saves its existing draft before opening the decision, ignores duplicate taps and preserves answers after cancel/offline error. Deadline/teacher-end aborts an open decision; existing frozen snapshot and callable/idempotency path retained. The form-associated button now resides in the sidebar, outside the answer form; deadline guard message lookup follows the relocated button. Legacy caller supplies counts; existing preview/tutorial persistence behavior remains, no new legacy storage policy.

## Verification checkpoint

- RED first: shared confirmation word/count/English tests, sidebar/form association and breakpoint regression; observed failures against the original implementation, then green.
- Focused 27 behavior/source tests passed for manual submit, cancel, double taps, offline retry, forced dialog abort, frozen answers, navigation and locale.
- Root + tools/ui suite with `node --experimental-vm-modules --test *.test.mjs *.test.cjs tools/ui/*.test.cjs tools/ui/*.test.mjs`: 813/813 passed. Initial run had two dependency-resolution failures (audio-instruction and teacher-feedback-end-to-end); reusing existing sibling functions dependencies resolved both. Existing unrelated jsdom teardown console messages remain in the suite log, no assertion failures.
- Chromium/WebKit layout matrix: 36/36 passed, 320/390/768/1024/1180/1440/2560 widths, 400px short viewport, 200% equivalent CSS width, 1/18/40/50 tasks, long text/image/audio. Checks right geometry, >=828px content (actual860 where side), submit visibility, navigation/Escape, resize focus/node/value/audio preservation and Secure reload. Screenshots reviewed at narrow phone,1024 tablet,1180 and1440 desktop.
- Existing actual Secure progress journeys: 8/8 passed, partial answers/clearing/ordering confirmation/reload; synthetic transport only.
- Full browser submission journeys and final build/checkpoint still running at this intermediate checkpoint. No actual grades, student data, Firestore, cloud, external providers, real browser tabs, physical devices, native app or deploy touched.

## Relevant assurance scope

SEC08 server authority: scoped implementation preserves callable-only real Secure submission and sends no trusted grading fields (existing tests passed); server security unchanged, not re-audited. SEC15: dialog builds text and labels via textContent/DOM APIs, no innerHTML or external data rendering. PRIV07: typed confirmation never included in payload or storage, no new personal data/provider call. PRIV15: local keyboard/Escape/focus tests passed; real screenreader/OS-dictation/physical-device acceptance not performed. Native-specific work belongs to the separate owner. Independent review and exact integrated CI/release are parent's next step.

## Merge notes

app.js changes only renderStudentQuiz markup (~7687) and shared dialog caller counts (~8185). Preserve parent's unrelated Wilma/results integration. One-line English catalog change `source:Test abgeben`. Shared root registry/STATE/TODO/handoff unchanged per parent ownership. Local dependency symlinks are test setup only and must not be committed.

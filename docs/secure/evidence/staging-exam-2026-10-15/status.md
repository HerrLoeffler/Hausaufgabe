# GradeCrew Secure Staging pilot — 2026-10-15

## Scope and architecture

User confirmed that AAC Lab0.2.0(1031) locks and releases the physical iPad. The next pilot connects real **Staging** assessments. Production and the teacher app are unchanged.

The native entry shows the current Crew, Secure logo, test code and participant name/alias. Metadata is fetched before the user confirms AAC start. AAC must report active before the start/resume request exposes any questions. The existing Staging student renderer is bundled locally, covering11question types with the same answer shapes; navigation and active network requests from the renderer are blocked. Question media remains HTTPS and may need a connection.

Native code calls only getAssessmentInfo/startAssessmentAttempt/resumeAssessmentAttempt/submitAssessmentAttempt/getAssessmentReceipt at europe-west1-hausaufgabe-staging.cloudfunctions.net. Contract source is integration commit8f8697901f8c1aea89897be855ca2872c82d0f2b, assessment-functions/main.js and lib/secure-lifecycle.js. No old prepared secureExamApi deployment is used.

## Time, submission and connection loss

The server owns the deadline. Native continuous monotonic elapsed time drives the countdown, including sleep, without trusting a changed device clock. At expiry answers are frozen and submitted automatically; early submission uses the same path. Native Keychain holds attempt identity/token; protected, backup-excluded local storage holds snapshots. A final immutable snapshot is retried idempotently. A separate server receipt must match the attempt before AAC is ended; completion waits for Apple's didEnd callback. Per-lifecycle generation checks prevent stale requests from ending another test or erasing its data.

This pilot is **not a full offline examination mode**. It cannot start offline. Locally rendered inputs remain usable during temporary loss and answers stay on the iPad. Final submission is retried after reconnect. The deployed server rejects submissions beyond30seconds after deadline; an extended outage is shown as unresolved and requires teacher intervention. There is no new per-answer server autosave, remote teacher rescue, guaranteed offline media cache or offline deadline waiver. Restarting the app is never described as successful submission.

## Verification and delivery status

- Live invalid-code request reaches Staging and returns the expected NOT_FOUND.
-19Swift tests cover lab lifecycle, five-minute deadline, recovery deadline, immutable final answers, callable envelope/errors, receipt binding and stale-completion gate.
-12Python distribution/installer tests.
-4DOM renderer tests cover all11types, restored answers, snapshots, immutable freeze and escaping.
- Real WKWebView local-file/CSP/native-bridge smoke passes.
- Three Simulator schemes and optimized device archive pass locally; final incremental changes are rechecked in CI.
- Signed iPad Simulator launch visually checked; no questions are exposed without actual AAC. Unsigned Simulator builds cannot access Keychain; they are compilation checks only.
- Independent code review: stale completion P1 fixed and re-reviewed; no remaining blocker reported.

GitHub CI, distribution entitlement check, upload and Apple processing are recorded separately after execution. A valid published Staging code has been requested for live testing. No positive live submission, real five-minute device test or offline recovery is claimed yet.

## iPad pilot checklist

Use only fictitious participant names and Staging test data. This remains a controlled pilot, not an unattended school deployment.

1. Publish/start a Staging assessment with a five-minute limit; enter its code and a fictitious name.
2. Confirm AAC and verify the expected title/questions. Answer several types; confirm local saved status.
3. First run: submit early; confirm exactly one Staging submission and only then iPad release.
4. Second run: let the full five minutes expire; editing must stop, automatic submission must appear exactly once, and release must follow confirmed receipt.
5. Brief controlled outage: confirm local answers persist and reconnect before the server deadline/grace; verify one submission. Do not assume an extended outage will be accepted.
6. Check interruption/relaunch recovery without extending the server deadline. Record iPad model, iPadOS, build and observed results; stop classroom rollout if any gate fails.

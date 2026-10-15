# GradeCrew Secure Staging pilot — 2026-10-15

## Scope and architecture

User confirmed that AAC Lab0.2.0(1031) locks and releases the physical iPad. The next pilot connects real **Staging** assessments. Production and the teacher app are unchanged.

The native entry shows the current Crew, Secure logo, test code and participant name/alias. Metadata is fetched before the user confirms AAC start. AAC must report active before the start/resume request exposes any questions. The existing Staging student renderer is bundled locally, covering11 question types with the same answer shapes; navigation and active network requests from the renderer are blocked. Question media remains HTTPS and may need a connection.

Native code calls only getAssessmentInfo/startAssessmentAttempt/resumeAssessmentAttempt/submitAssessmentAttempt/getAssessmentReceipt at europe-west1-hausaufgabe-staging.cloudfunctions.net. Contract source is integration commit8f8697901f8c1aea89897be855ca2872c82d0f2b, assessment-functions/main.js and lib/secure-lifecycle.js. No old prepared secureExamApi deployment is used.

## Time, submission and connection loss

The server owns the deadline. Native continuous monotonic elapsed time drives the countdown, including sleep, without trusting a changed device clock. At expiry answers are frozen and submitted automatically; early submission uses the same path. Native Keychain holds attempt identity/token; protected, backup-excluded local storage holds snapshots. A final immutable snapshot is retried idempotently. A separate server receipt must match the attempt before AAC is ended; completion waits for Apple's didEnd callback. Per-lifecycle generation checks prevent stale requests from ending another test or erasing its data.

This pilot is **not a full offline examination mode**. It cannot start offline. Locally rendered inputs remain usable during temporary loss and answers stay on the iPad. Final submission is retried after reconnect. The deployed server rejects submissions beyond 30 seconds after deadline; an extended outage is shown as unresolved and requires teacher intervention. There is no new per-answer server autosave, remote teacher rescue, guaranteed offline media cache or offline deadline waiver. Restarting the app is never described as successful submission.

## Verification and delivery status

- Live invalid-code request reaches Staging and returns the expected NOT_FOUND.
- 19 Swift tests cover lab lifecycle, five-minute deadline, recovery deadline, immutable final answers, callable envelope/errors, receipt binding and stale-completion gate.
- 12 Python distribution/installer tests.
- 4 DOM renderer tests cover all 11 types, restored answers, snapshots, immutable freeze and escaping.
- Real WKWebView local-file/CSP/native-bridge smoke passes.
- Three Simulator schemes and optimized device archive pass locally; final incremental changes are rechecked in CI.
- Signed iPad Simulator launch visually checked; no questions are exposed without actual AAC. Unsigned Simulator builds cannot access Keychain; they are compilation checks only.
- Independent code review: stale completion P1 fixed and re-reviewed; no remaining blocker reported.

GitHub CI, distribution entitlement check, upload and Apple processing are recorded separately after execution. A valid published Staging code has been requested for live testing. At upload time no positive live submission, real five-minute device test or offline recovery had yet been claimed; the later user-reported device result is recorded below.

## iPad pilot checklist

Use only fictitious participant names and Staging test data. This remains a controlled pilot, not an unattended school deployment.

1. Publish/start a Staging assessment with a five-minute limit; enter its code and a fictitious name.
2. Confirm AAC and verify the expected title/questions. Answer several types; confirm local saved status.
3. First run: submit early; confirm exactly one Staging submission and only then iPad release.
4. Second run: let the full five minutes expire; editing must stop, automatic submission must appear exactly once, and release must follow confirmed receipt.
5. Brief controlled outage: confirm local answers persist and reconnect before the server deadline/grace; verify one submission. Do not assume an extended outage will be accepted.
6. Check interruption/relaunch recovery without extending the server deadline. Record iPad model, iPadOS, build and observed results; stop classroom rollout if any gate fails.

## Confirmed TestFlight delivery

- Source commit: `05f464e7b1bd7eb362a4556ce91d9992884c0d7a` on `feature/secure-aac-device-lab-20261015`.
- GradeCrew Secure **0.2.1 (1051)**, bundle `de.gradecrew.secure`, Staging exam configuration.
- [GitHub Actions run38750069101](https://github.com/HerrLoeffler/Hausaufgabe/actions/runs/38750069101), job116473833717: every step succeeded.
- Renderer tests, Swift tests, Python tests, real WK smoke, three Simulator builds, built-plist mode check, device archive and Apple distribution export succeeded.
- Signed app and distribution profile both contain AAC; strict signature/profile/mode checks passed before upload.
- Upload succeeded without errors at **2026-10-15T14:21:43Z (16:21Berlin)**. Delivery UUID `cc416c60-e9cf-4b26-b171-ba3775763f55`.
- Earlier run38749369918 was stopped before upload because Xcode omitted the generated custom mode key. Explicit StagingInfo.plist and a real built-file check fixed the root cause; the upload gate was preserved.
- At upload time Apple processing, tester visibility, positive published-code submission, five-minute physical-device behavior and outage recovery remained unverified. The previous physical lock/release report applies to AAC Lab1031, not automatically to this complete exam flow.
- No Production, backend, rules or Hosting deployment; no teacher app changes.

## Later user-reported physical test

The user subsequently reports that a real test worked both when ended early and when allowed to expire: the iPad was locked during both runs and unlocked afterwards. This is positive user-reported evidence for the integrated exam flow after its TestFlight delivery, in addition to the earlier standalone AAC Lab report.

The installed build number, exact iPad model/iPadOS version, timed measurement and independent server-answer/duplicate-submission inspection were not supplied in that report. Do not turn this report into a separately observed server audit or a long-offline recovery pass. The user's wording “vorzeitig abgebrochen” records an early end; it does not request a new unrestricted AAC abort control.

Remaining work requested by the user is now layout clarity and the missing website-style numbered question navigation with green completion indicators. Detailed design and implementation plan are saved under docs/superpowers; no new runtime build is implied by those planning files.

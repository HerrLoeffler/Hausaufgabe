# GradeCrew agent instructions

These instructions apply to the entire repository.

## Start every task with context

Before making changes:
1. Read `GRADECREW_STATUS.md` completely.
2. Read `DIAGNOSTICS_GUIDE.md` for debugging / incident work.
3. Read `SECURE_ASSESSMENT_AUDIT_2026-09-30.md` for assessment security and release gates.
4. Check `git status`, current branch, and recent commits.
5. Prefer the current branch named in `GRADECREW_STATUS.md`; never silently switch branches.

If repository state and documentation disagree, treat the repository state as evidence, investigate the mismatch, and update the handoff only after verification.

## Production safety

Production is `hausaufgabe-40294`.

Never deploy, alter, migrate, or reconfigure Production unless the user explicitly asks for a Production action in the current task.

During Secure Assessment Gates C-F:
- do not deploy Production;
- do not use historical generic Production deployment scripts;
- do not switch `firestore.secure-assessment.rules` onto normal staging before Gate F;
- do not turn a preview deployment into a normal staging cutover without explicit approval.

Staging is `hausaufgabe-staging`.

## Secure Assessment invariants

Do not weaken these properties:
- the public student client must not receive author questions with solution keys;
- grading is server-authoritative;
- attempts/submissions are server-authoritative and submit remains idempotent;
- `assessmentPrivate` and rate-limit data remain client-inaccessible;
- active published assessment contents remain immutable through normal client paths;
- preliminary scores/grades for manual-review submissions remain withheld server-side;
- solution release follows the documented end-time plus grace-period policy;
- browser/UI restrictions are not a substitute for server-side security.

## How to change code

- Find and explain the actual root cause before editing.
- Prefer the smallest coherent fix over broad rewrites.
- Add or update a regression/behavior test for the real failure mode whenever practical.
- Do not remove diagnostics or security checks just to make a test pass; fix stale test harnesses when the application dependency is legitimate.
- Keep user-visible German wording and GradeCrew terminology consistent with the current UI.
- Preserve release metadata and build-manifest integrity.

## Verification

For Secure Assessment preview work, use the repository's guarded scripts rather than reconstructing deploy commands by hand:

```bash
bash deploy-secure-assessment-preview.sh --check
```

Only after that check is fully green may a staging preview deploy be considered. A preview deploy does not prove Gate D/E/F.

GitHub CI / DOM tests do not replace real-device, concurrency, network-loss, or Firebase end-to-end tests. Never report an unperformed gate as passed.

## Documentation / handoff

After a meaningful completed work block:
- update `GRADECREW_STATUS.md` with only verified facts;
- document root cause, fix and verification in the appropriate diagnostics/security document when relevant;
- record remaining real-world checks explicitly instead of implying completion.

Keep handoff files concise enough that a new Codex or ChatGPT session can resume without the user pasting prior chats.

## Deployment workflow goal

Prefer repository-driven CI/CD over manual copy/paste from chat. Staging preview automation may be used only when it is explicitly restricted to `hausaufgabe-staging`, the secure assessment codebase / preview channel, and does not deploy Firestore rules or Production.

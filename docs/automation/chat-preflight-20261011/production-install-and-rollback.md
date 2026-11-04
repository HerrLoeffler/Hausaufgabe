# Production hook install and rollback package

Status: **prepared, inactive; no production installation or trust is authorized by this document.** Stage A qualified one temporary CLI test source only. A separate explicit activation decision is required before following this procedure.

## Pinned candidate and scope

- Candidate commit: `837fc87120dcccbba8b6494fa0551ff8fb8bbf1a`.
- Candidate script SHA-256: `6d961fdadb3bfb2008f142f76d86fedfb679c781a5f00f9ece3b285dc988b2c2`.
- Public hook profile template SHA-256: `4fb37654b2a096d9ed39b2a8933232130b6b503581ee777d3e7539d00686e5c4`.
- Runtime schema: `UserPromptSubmit`, synchronous command, 20-second timeout, 1000-character additional-context limit.
- Target: only explicitly approved exact GradeCrew/Game mirror roots in a private local profile. An absent, invalid, unrelated, nested, or unknown scope must remain a no-op.

The private production profile and hook definition are machine-specific. Do not commit their contents or host paths. Before installation, compute and record their exact byte hashes in a private receipt. The profile must have `qualification_mode` absent, a pointer cache TTL of zero, and only the exact approved mirror roots. The test-only qualification profile and block sentinel must never be used in production.

## Guarded installation procedure

1. Recheck that the approved candidate commit is still the reviewed candidate and that the script SHA-256 exactly matches the value above. Recheck the public profile-template hash. Validate the private profile and hook definition against the documented schema; record their byte hashes without publishing private paths.
2. Resolve the active Codex state root using the documented runtime configuration. Before writing, inspect only the hook source metadata needed to proceed. If the source changed since the last reviewed inventory, stop and preserve it for a fresh review. If `hooks.json` exists, make a timestamped byte-for-byte backup and record its hash. Never replace it wholesale.
3. Prepare the pinned script and private profile as user-owned files with restrictive permissions. Verify their hashes and permissions before registering the handler.
4. Register the single named `UserPromptSubmit` entry by conflict-aware JSON merge. If the same identifier/command already exists, or the file changes during the operation, stop instead of overwriting. Write through a unique temporary file in the private state directory, set restrictive permissions, and atomically replace only after confirming the source hash still matches the backup. Preserve every unrelated hook entry.
5. Read back the resulting source and verify its parsed structure, unrelated-entry preservation, and exact command/profile arguments. Record the resulting source hash. Then use the normal supported `/hooks` review UI to inspect and trust only the exact current definition. If the UI rejects or the displayed definition differs, stop; do not use a trust bypass, private database, or binary patch.
6. Verify the source inventory through the supported metadata interface for one explicitly approved project CWD. Confirm the candidate event and trust state. Do not submit a personal prompt or infer model-generation behavior from hook metadata. Native Composer model/effort switching, ChatGPT Work, and old-chat refresh are outside this hook's capability.

## Hash-guarded rollback

1. Re-read the current hook source. Remove only this task's handler if its definition still matches the recorded installed-definition bytes. If the source has any unexpected change, stop and preserve it for manual review.
2. If there was no source before installation, restore that absence only after verifying the current file contains only this task's handler. If a source existed before installation, restore the backup only when the current source hash matches the exact post-install hash recorded at step 5; otherwise stop rather than discard intervening edits.
3. Verify the resulting source bytes and confirm unrelated entries remain. Remove the pinned script and private profile only after confirming no active source references them; guard each removal with its recorded byte hash.
4. Revoke trust through the supported `/hooks` UI when available. If supported UI revocation is unavailable or rejected, leave the trust record untouched, remove the source and files, and report the remaining trust hash as dormant. Never edit trust storage directly.

## Required receipt

Record the approval identity, reviewed commit, script/profile/definition hashes, prior-source presence and hash, backup location in private records only, post-install source hash, supported trust UI outcome, exact project-scope metadata, and rollback outcome. Do not record credentials, account identifiers, private machine paths in public files, prompt text, or model request bodies. No install, trust, or production behavior is claimed until a later receipt proves it.

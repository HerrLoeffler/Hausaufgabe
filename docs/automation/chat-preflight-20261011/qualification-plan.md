# Codex CLI hook qualification (no paid inference)

Status: **Stage A passed narrowly for the frozen candidate on the installed Codex CLI.** This is a CLI lifecycle result, not activation of the GradeCrew production hook. The temporary source, script copy, qualification profile, and empty test mirror have been removed. See the current task receipt for the full attempt history.

## Frozen artifacts

- PR #203 candidate commit: `837fc87120dcccbba8b6494fa0551ff8fb8bbf1a`.
- Candidate script SHA-256: `6d961fdadb3bfb2008f142f76d86fedfb679c781a5f00f9ece3b285dc988b2c2`.
- Test-only qualification profile byte SHA-256: `0f72ad66e5b16aab3741cd71b4f2d44a7acc048168c3cc7b6ae77c935272f571`.
- Temporary test hook-definition byte SHA-256: `da1d6e09d5f30044f335887c539ca8f0a293e6c2826efdebd28ec5a806fccbe0`.

These hashes identify the bytes reviewed for this attempt. The hook-definition digest is not claimed to be Codex's internal trust-hash algorithm, and does not attest to the script/profile bytes. The private profile contains exactly one test-only mirror root, `pointer_cache_ttl_seconds: 0`, and `qualification_mode: "block"`; no machine path is published here.

## Original isolated attempt (failed; historical)

The original qualification plan proposed a separate temporary `CODEX_HOME`, with no shared user state or trust records. Its first attempt stopped before the hook source review because the installed CLI did not detect a running Ollama server; the local fake endpoint had not received the expected health checks. A corrected health-only startup reached the first-run UI but presented a sign-in choice. No credentials were copied, no sign-in was attempted, no hook was trusted or invoked, and no prompt or model request was sent. This original isolated path is not the method that passed Stage A.

## Separately authorized normal-profile test (completed)

The user explicitly approved trusting the exact temporary test hook through the normal Codex `/hooks` UI for one synthetic prompt, with execution outside the sandbox during Codex prompts, an exact private test-root block and no-op elsewhere, then cleanup. No credential copy, sign-in, trust bypass, paid call, or production activation was authorized or performed.

Immediately before registration, the normal user `hooks.json` source was absent and the App Server inventory for the exact GradeCrew mirror CWD had zero handlers. The temporary source contained only one `UserPromptSubmit` test handler. The normal UI displayed that exact candidate command/profile and showed one installed hook total. The UI's standard trust control was used; the subsequent hook details showed the handler enabled and `Trusted`. No other handler was installed or trusted by this temporary source.

One non-personal synthetic prompt was sent from the exact empty, `.git`-less test mirror. Codex displayed `Blocked by hook` with reason `GC-CHAT-PREFLIGHT-01 local qualification sentinel`. This confirms the candidate command was invoked and its block JSON was accepted before model generation. The owned fake Ollama-compatible provider bound only to `127.0.0.1:11434`; it recorded health/catalog reads (`GET /v1/models=4`, `/api/tags=1`, `/api/version=1`) and **zero POST/generation requests**. No OpenAI request or real model inference occurred. The event's selected model and effort were not observed through the candidate output; both remain unknown for this hook event. The CLI displayed only its local fake model setting, which is not evidence of an engine call.

After the test, the CLI and provider were stopped. The temporary `hooks.json`, pinned script, qualification profile, and empty test mirror were removed after hash checks; the normal `hooks.json` source is absent again, and the existing hooks directory was preserved. No production hook, global feature flag, model configuration, auth state, or database was edited directly.

The normal trust action wrote trust state for the exact temporary definition. A later attempt to reopen `/hooks` to disable/revoke it was rejected by automatic approval review because the approval was scoped to one synthetic prompt. No workaround was attempted. Since the source and referenced files are absent, any remaining trust hash is dormant and may persist; it was not edited outside the supported UI.

## What this proves—and what it does not

Stage A proves the pinned command and `UserPromptSubmit` output path were loaded, normally trusted, invoked, and accepted for one exact test-root prompt by Codex CLI `0.162.0-alpha.17.2`. The block happened before provider generation. It does not qualify normal freshness fetching, changed-main deltas, GitHub failure handling, production-profile behavior, model/effort routing, native composer model switching, ChatGPT Work, other projects, or old-chat refresh. The App Server fake caller's model/effort ordering is a separate caller-owned capability and is not evidence of native composer control.

The hook event schema documents `model` but not `effort`; the candidate reports effort as unknown. Even where the event supplies a model slug, a `UserPromptSubmit` hook cannot select or downgrade the model for a request already selected by Codex. ChatGPT Work does not load local Codex hooks. No Desktop-wide or historical-chat coverage follows from this qualification.

## References

- [Codex Hooks](https://learn.chatgpt.com/docs/hooks) — hook event schema and trust review.
- [Codex environment variables](https://learn.chatgpt.com/docs/config-file/environment-variables) — `CODEX_HOME` behavior for the original isolated attempt.
- [Codex developer commands](https://learn.chatgpt.com/docs/developer-commands) — local OSS provider and CLI options.
- [Ollama chat API](https://docs.ollama.com/api/chat) — local stub compatibility.

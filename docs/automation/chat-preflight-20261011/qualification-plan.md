# Hook lifecycle qualification (no paid inference)

This is a controlled test recipe, not permission to install or activate the hook. The reviewed source hash and the local approved-root profile must be fixed before qualification.

## Coverage

Official Codex documentation lists `~/.codex/hooks.json` and `~/.codex/config.toml` as user-level hook sources and says non-managed hooks require review/trust for the exact current definition hash through `/hooks`. Codex app agents share configuration with CLI and IDE. ChatGPT Work chats run managed and do not read local Codex configuration; local command hooks are unsupported with Work Cloud orchestration. The test can qualify a local Codex lifecycle only. It cannot claim every ChatGPT desktop/Work chat or historical chat is covered.

## Before testing

1. Complete review of the exact script and `hook-profile.template.json`. Confirm no API token, secret store, browser store, transcript or credential is read. The public pointer request is unauthenticated and includes no prompt text.
2. Prepare a separate local profile with `schema: 1`, an explicit `approved_project_roots` list, and `pointer_cache_ttl_seconds: 0`. For the project mirror without `.git`, list only its exact canonical absolute root locally; never put a host path in the repository. A path prefix such as `~/.codex/.chatgpt-projects` or a shared `session_id` is not a project allowlist.
3. Inspect active sources for `~/.codex/hooks.json` and `~/.codex/config.toml`; hook sources accumulate. Do not overwrite an existing source or duplicate the same hook in both representations. Create a dedicated isolated test profile/workspace if there is any ambiguity.
4. In the Codex hook review UI/`/hooks`, inspect and trust only the exact test hook command and current definition hash. Do not use `--dangerously-bypass-hook-trust`. If hook loading, trust, or workspace scope is unclear, stop; the test is not a runtime receipt.

## Zero-paid-call test

Use an isolated idle specialist test chat and a test-only hook handler whose only behavior is to append a fixed invocation marker to a private temporary log and return `{"decision":"block","reason":"GC-CHAT-PREFLIGHT-01 qualification sentinel"}`. It must not call a model, network, API, MCP server, app database or credential store. Send one synthetic prompt. Pass only if the UI reports the sentinel block, the marker appears exactly once, and there is no model/turn-start event or provider request. The block occurs before generation, so this test does not require a local model and cannot silently fall through to a paid OpenAI call.

Then run the candidate script's deterministic offline probe with fake GitHub responses and fake App Server caller. That probe verifies current/stale/unknown/failure cases and `model/list` before explicit model/effort `turn/start` without making an inference. These two receipts prove different things: the sentinel proves Codex loaded and ran a trusted `UserPromptSubmit` hook; the offline probe proves candidate logic. Neither proves Desktop Work coverage nor native composer model switching.

If a future runtime test needs an allowed prompt to reach a model, first require a separate explicit authorization and pin a local-only provider with a verifiable local endpoint. Never use an OpenAI provider or assume that a hook will block if it fails to load. This PR does not perform that test.

## After test

Capture only the hook event name, test hook source hash, Codex CLI/app version, sentinel block result, invocation count, and absence of a provider call. Do not capture prompt contents, session transcripts, secrets, or model responses. Remove the isolated test config and trust only through the supported hook UI. Keep this as a local qualification receipt, not as proof of broad installation or all-chat coverage.

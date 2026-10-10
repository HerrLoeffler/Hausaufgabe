# Candidate hook lifecycle qualification (no paid inference)

This is a recipe for a later, separately approved qualification. It does not authorize installation or activation. No test has been run in Codex with this candidate. The goal is to prove that the actual Codex runtime invokes this exact script and accepts its output schema while guaranteeing that a missed hook cannot reach an OpenAI provider.

## Scope and prerequisites

Official Codex hook docs list user-level `~/.codex/hooks.json` and `~/.codex/config.toml` sources; non-managed hooks require review/trust for the exact current definition hash through `/hooks`. Hook sources accumulate. Codex app agents share configuration with CLI and IDE. ChatGPT Work is managed and does not read local Codex hooks. This qualification can establish only the tested Codex runtime/surface, not every Desktop chat, historical chat, or Work conversation.

1. Review the exact candidate `preflight.py`, its SHA-256, the hook profile schema, and the local allowlist. Verify the script reads no credentials, browser store, transcript, or app database.
2. Use an isolated Codex config root and isolated idle specialist test chat. Do not point the test at the shared Codex home or reuse global hook sources. Use only documented config fields and a supported hook trust UI. If an isolated configuration root or exact trust review cannot be established through supported Codex controls, stop without testing.
3. Configure the isolated test session to use a verified local fake provider only. Confirm its provider name and endpoint are local, not OpenAI, before opening the composer. If that boundary cannot be proven, do not send any prompt.
4. Install no normal refresh behavior for this test. The private test profile must contain the exact approved GradeCrew mirror root, `pointer_cache_ttl_seconds: 0`, and `qualification_mode: "block"`. This mode is accepted only by the candidate script; it validates the event's project identity and immediately emits a deterministic block without cache access, network, GitHub, MCP, or model calls.

## Exact command and test

In the isolated hook source, use the candidate template's handler fields and point `command` to the reviewed candidate source and the dedicated local test profile. The command must resolve to the exact file whose SHA-256 was recorded in the receipt, for example:

```text
python3 /ABSOLUTE/CANDIDATE/PATH/tools/chat-preflight/preflight.py --profile /ABSOLUTE/PRIVATE/PATH/qualification-profile.json
```

The local profile is equivalent to:

```json
{
  "schema": 1,
  "approved_project_roots": ["/ABSOLUTE/EXACT/GRADECREW/MIRROR/ROOT"],
  "pointer_cache_ttl_seconds": 0,
  "qualification_mode": "block"
}
```

Review and trust the exact test hook definition hash in the supported `/hooks` UI. Send one synthetic, non-sensitive prompt from the isolated chat whose actual working directory is under the allowlisted mirror. Pass only if Codex reports the candidate's sentinel block, the candidate invocation is recorded exactly once by the supported runtime evidence, and there is no model/turn-start event or provider request. If the hook is not loaded, the preconfigured local fake provider remains the only possible provider. Never use an OpenAI provider as a fallback.

Also run the deterministic repository tests offline. They exercise the real candidate entrypoint with `qualification_mode`, assert that an unrelated CWD and an invalid profile produce no stdout, and verify normal hook refresh/cache/model-caller behavior with fake responses. These tests do not prove that Codex loaded the command.

## Boundaries and receipt

The exact candidate command test would prove only that the tested Codex version loaded this user-level `UserPromptSubmit` definition, launched the reviewed script, and accepted its block output. It would not prove native Desktop composer model switching, all-chat coverage, Work coverage, or production policy enforcement. The App Server fake caller is separate and proves only pre-call `model`/`effort` selection for a client that owns `turn/start`.

Record only the runtime surface/version, script SHA-256, hook definition hash, exact command/profile schema revision, allowlisted scope description (do not publish the host path), sentinel result, invocation count, and confirmation that no provider request occurred. Do not capture prompt text, transcripts, secrets, model responses, or provider credentials. Remove the isolated test configuration and trust only through supported UI controls. If any runtime receipt is missing or ambiguous, mark runtime qualification `unverified` and do not broaden activation.

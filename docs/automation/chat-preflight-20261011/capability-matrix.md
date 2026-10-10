# GC-CHAT-PREFLIGHT-01 capability matrix

Evidence checked 2026-10-11 against official OpenAI documentation and the installed Codex CLI protocol schema. This is a capability finding, not a claim that a hook is installed or active in existing chats.

| Capability | Codex runtime evidence | Ordinary ChatGPT desktop chats | Safe conclusion |
| --- | --- | --- | --- |
| Synchronous prompt preflight | `UserPromptSubmit` is a documented hook. It receives the prompt about to be sent; it can add `additionalContext` or block the prompt. Non-managed hooks require review and trust. | The official page calls these Codex lifecycle hooks; routing of every ordinary desktop/Work chat through this runtime is not established. | A trusted Codex hook can check freshness before its prompt call. Do not claim all desktop chats are covered. |
| Model visibility in hook input | The common hook input documents an active `model` slug. | Not established for every desktop surface. | Report the field when present; otherwise model is `unknown`. |
| Effort visibility or mutation in hook | No reasoning-effort field is documented for hook input; hook output only adds context/blocks. | Not established. | Effort is `unknown`; never infer it from a global default. A hook cannot select the model or effort. |
| Select model/effort before generation | App Server `turn/start` documents explicit `model` and `effort`; installed local protocol schema also contains both. | The native composer’s internal request path is not established by the public docs. | A caller that owns `turn/start` can select both before its request. This does not prove the Desktop composer is that caller. |
| Change an active turn | App Server `turn/steer` explicitly has no turn-level model/effort override. | Not established. | Do not describe hooks or steer as a model switch for an active request. |
| Refresh skill listing | Installed protocol supports `skills/list` with `forceReload`; `skills/changed` says a client should rerun `skills/list`. | No documented hook-to-current-chat refresh bridge found. | Supported for an App Server client that owns the call. A hook can only tell the model that freshness needs review. |
| Refresh MCP servers | Installed protocol has `config/mcpServer/reload`. | No documented hook-to-current-chat refresh bridge found. | App Server capability exists, but it does not prove that an installed hook can refresh the current desktop session’s tool catalog. Refresh only when needed. |
| Reload general config | Installed protocol exposes config read/write and MCP-server reload; no general config reload operation was found in the generated schema. | No documented native config reload path found. | Do not claim config reload or changed settings in an already-open chat. |
| Share updates with old chats | A global trusted Codex hook can run on each prompt where that hook is loaded; the script can read a current policy pointer. | Cross-surface coverage, hook trust, and hot reload of hook definitions are not established. | A cached version hash can cheaply invalidate context for covered Codex sessions. No historic chat broadcast or old-chat guarantee. |
| Avoid public API rate exhaustion across many chats | Public GitHub API has unauthenticated rate limits; the hook must not assume every prompt can fetch a pointer. | Same runtime caveat. | Candidate shares a private local pointer cache for five minutes. It reports `cached-verified` with the last-five-minute wording; expired/offline/429 checks remain unverified and do not block ordinary prompts. |
| Identify project/role | Hook input includes `cwd`, `session_id`, and active `model`; shared session IDs are possible across forks. | Surface identity not established. | Match only an exact repository identity (canonical origin plus checkout root). Project identity does not establish coordinator/specialist role. Unknown role stays unknown. |

## Sources

- Official OpenAI Hooks: <https://learn.chatgpt.com/docs/hooks> — hook locations and trust, event timing, hook input/output, `UserPromptSubmit`, and limitations.
- Official OpenAI Codex App Server: <https://learn.chatgpt.com/docs/app-server> — `model/list`, `turn/start`, `turn/steer`, skill input and configuration methods.
- Local installed CLI evidence: `codex --help`, `codex app-server --help`, and `codex app-server generate-json-schema --out /tmp/gc-chat-preflight-schema` on the installed ChatGPT.app Codex CLI. The generated schema included `turn/start`, `skills/list` (`forceReload`), `skills/changed`, `config/mcpServer/reload`, config read/write. No inference was run.

## Main-source identity

GitHub reports current main as `7eb49b50315b34e25e4af67a46c2addfa575febe`. Policy-file content SHAs fetched from main:

| File | GitHub blob SHA |
| --- | --- |
| `START_HERE.md` | `85c5de38da633c864c1452169c2140c63a78ac40` |
| `AGENTS.md` | `e0866436984d981f3de1231ce80122dca4c96680` |
| `docs/CHAT_CONTRACT.md` | `22f9c252c8f27156db5a9deaf74cbfc67a700444` |
| `docs/CHAT_RECOVERY.md` | `c2782f94dd3ff64931a7681b412acbe03b48936b` |
| `docs/skills/GRADECREW_EXECUTION_SKILLS.md` | `4a95aebe03948e80cd1b383de44fd26392315886` |

Those values are a recorded baseline, not a live claim. The hook candidate below queries the public `main` commit pointer on each covered prompt and fetches policy text only when it changes. If the network is unavailable, it reports the cached commit and marks freshness unverified. Only explicit high-impact prompts (production/deployment, destructive deletion, force-push) are blocked on unverified/stale rules; ordinary prompts continue with a short warning.

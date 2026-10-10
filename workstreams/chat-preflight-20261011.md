# GC-CHAT-PREFLIGHT-01 — Chat Preflight and Rule Freshness

Owner: specialist execution (current task handoff; chat link not available). Linked tasks: GC-HOOKS-01 and GC-MODEL-GOVERNOR-01. Review branch: `feat/gc-chat-preflight-20261011`, based on current main `7eb49b50315b34e25e4af67a46c2addfa575febe`.

## Request

Make policy/tool freshness visible in existing GradeCrew/Games chats before each new prompt, use one clear next-step response tied to actual stage/evidence, and choose model/effort before the call where the caller supports it. Keep old chat histories, attempts, budgets and role assignments intact. Production remains separately authorized.

## Current evidence

- GitHub current main observed at `7eb49b50315b34e25e4af67a46c2addfa575febe` (commit search, 2026-10-11).
- Current main `START_HERE.md` blob `85c5de38…`, `AGENTS.md` `e0866436…`, `docs/CHAT_CONTRACT.md` `22f9c252…`, `docs/CHAT_RECOVERY.md` `c2782f94…`, and skill map `4a95aebe…` fetched from the GitHub connector.
- Open PR #184 is still open. Its lifecycle design is reference evidence only; this task does not install or trust it.
- Official OpenAI documentation confirms Codex `UserPromptSubmit` supports context injection or blocking and requires trust for non-managed hooks. The hook input includes `model` but has no documented effort field.
- Official App Server docs and local installed CLI schema confirm an owning caller can pass explicit `model` and `effort` to `turn/start`; `turn/steer` cannot change them. The schema supports `skills/list(forceReload)` and `config/mcpServer/reload`, but no general config reload was found.
- Inference, hooks, trust changes, app database/binary inspection, plugin install, and global config writes: none.

## Candidate files

- `docs/automation/chat-preflight-20261011/capability-matrix.md`
- `docs/automation/chat-preflight-20261011/design.md`
- `tools/chat-preflight/preflight.py`

The script is an uninstalled candidate and includes a deterministic fake-caller probe. It does not claim the ChatGPT desktop composer is an App Server caller. The Codex hook can inspect freshness and model when present, but effort remains unknown and the hook cannot change either setting. Role remains unresolved even when repository identity proves GradeCrew project scope.

## Local checkpoint

- Offline probe: `python3 -B tools/chat-preflight/preflight.py --self-check` — PASS. It covers cached pointer reuse, changed main and bounded delta, unknown project/model/effort/role, explicit risky action vs plan discussion while offline, explicit model/effort before fake `turn/start`, and missing advertised target model stopping before send. No inference.
- Syntax: `PYTHONPYCACHEPREFIX=/tmp/gc-chat-preflight-pyc python3 -m py_compile tools/chat-preflight/preflight.py` — PASS.
- Hygiene scan over the four candidate files: no trailing whitespace or conflict markers.
- Freshness polling uses a shared private temp cache for five minutes to limit unauthenticated GitHub API traffic across existing chats. Reused pointers are labeled `cached-verified`; expired/offline/rate-limited checks report freshness as unverified. Risk blocking is limited to imperative explicit production/destructive requests, not plan discussion.
- SHA-256 values are refreshed when the final four candidate files are assembled into the remote review commit.

## Checkout boundary

The local Git transport could not resolve `github.com`; no local clone contains current main. The candidate is assembled through the authorized GitHub connector on `feat/gc-chat-preflight-20261011`, whose starting ref was verified as exact parent `7eb49b50315b34e25e4af67a46c2addfa575febe`. No stale local branch was used and no shared files were edited.

## Status and next action

Candidate branch for independent review; CI/integration, desktop hook activation, staging and production are not claimed. The deterministic probe and syntax check pass locally. Before any future activation, the hook owner must review/trust the exact command in the UI and qualify it on an idle specialist chat; desktop coverage remains unverified and no model inference is needed for hook qualification.

# GC-MODEL-GOVERNOR-01 — native Codex model defaults

**Scope:** Codex in the ChatGPT desktop app, CLI and IDE for Martin’s account, plus GradeCrew start/delegation policy. This is configuration and operator guidance, not a UI enforcement mechanism.

## Supported controls and limits

- Codex documents `model` and `model_reasoning_effort` in `config.toml`. The desktop app’s bundled Codex CLI uses the same local configuration; app-server `thread/start` and `turn/start` accept model/effort selection. New Codex app threads created through the app interface can also be assigned a model and thinking effort.
- The desktop model/reasoning picker and `/model` and `/reasoning` commands change the selection for the current chat. Existing chats may therefore retain an explicit selection even after the global default changes. Check/adjust an existing idle GradeCrew chat before its next task when an older override is possible.
- Configuration precedence permits project/profile/command/turn selections to override the user default. Project configuration is conditional on project trust. This work did not add project config or trust entries.
- A repo instruction cannot force manual UI choices or rewrite an active model call. Start/delegation paths must pass the requested model and effort explicitly; record requested values separately from actual values. The current runtime model/effort is `unknown` when not observable. `turn/steer` does not change the model on an already-running call. No hooks or UI guard were installed; PR184 was not changed.
- A global configuration edit does not prove an already-running desktop process has reloaded it. Official troubleshooting guidance says restart the client after config changes. This task did not restart the desktop app, to avoid interrupting ongoing work; the next normal app restart is required before claiming the GUI process has reloaded this default.

## Default and policy receipt (2026-10-10)

The explicitly authorized user-level default now sets only `model = "gpt-6-luna"` and `model_reasoning_effort = "medium"`; all other configuration bytes were verified unchanged. This is the default for new/unoverridden Codex starts. Existing conversations with saved explicit Sol/high choices may remain overridden until manually changed in that chat. No active call was changed and no inference was run.

GradeCrew routine work starts Luna/medium. `low` may be tried only after comparable, low-risk work has demonstrated suitability. Complex coordination, architecture and diagnosis start Sol/medium. `high` requires a concrete difficulty-based reason. Limit each connected task to two model changes. Authentication, network, quota and missing permissions are not reasons to upgrade. Before work, record `requested model/effort`, `actual model/effort` (or `unknown`) and a short reason in the existing workstream/task handoff. Use explicit `model`/`thinking` parameters for programmable thread starts and explicit model/effort for each delegation.

## Local verification

The bundled CLI was `codex-cli 0.162.0-alpha.17.2`. `codex --strict-config --help` exited 0. `codex debug models --bundled` exited 0 and listed `gpt-6-luna` with medium effort support. `codex doctor --json` reported `checks.config.load.status = ok` and model `gpt-6-luna`; the overall doctor command exited 1 because unrelated provider-reachability and state-path checks failed. No model call was made. The new desktop runtime value was not observed because the app was not restarted.

The previous user defaults were Sol/high; after the update, only the two authorized top-level keys changed. No secret values or full configuration were copied into this repository. The exact prior values were preserved in the user’s local recovery notes, outside the repository.

## Official product references

- [Codex models and desktop model/reasoning controls](https://learn.chatgpt.com/docs/models?surface=app)
- [Codex configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference)
- [Codex app server start/turn controls](https://learn.chatgpt.com/docs/app-server)
- [Codex desktop slash commands, including `/model` and `/reasoning`](https://learn.chatgpt.com/docs/reference/slash-commands)
- [Troubleshooting and config reload guidance](https://learn.chatgpt.com/docs/reference/troubleshooting)

These pages establish supported controls, not a global enforcement guarantee. This policy does not establish model-quality equivalence, usage savings, or a runtime guard.

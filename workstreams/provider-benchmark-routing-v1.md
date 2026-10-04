# Provider benchmark and routing v1

Status: planning branch. No runtime route changes.

## Goal

Turn the four-provider staging gateway into an evidence-based GradeCrew routing system without changing Production or the current reliable generation path.

## Current hypothesis

- Gemini Flash-Lite / Mistral Small: low-latency, high-volume low-risk transformations and routing.
- OpenAI Luna / Claude Haiku: constrained educational generation, review and verification.
- High-risk grading remains conservative until paired teacher-reviewed evidence exists.
- Stronger paid tiers are escalation candidates only after a scope proves the baseline insufficient.

## Added on this branch

- `docs/intelligence/PROVIDER_STRATEGY_V1.md`: human-readable task/provider strategy.
- `tools/evaluation/provider-benchmark-plan.v1.json`: machine-readable staged benchmark manifest.
- No provider allowlist expansion.
- No signed route publication.
- No paid benchmark calls in CI.
- No Production change.

## Next implementation step

Build the trusted evaluation worker that takes a reviewed case bundle, runs the four allowed staging models under the separate evaluation budget, records content-free technical metrics plus reviewer outcomes, and emits evidence compatible with `quality-gate.mjs`. Start with Phase A before composite test generation.

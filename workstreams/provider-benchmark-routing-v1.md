# Provider benchmark and routing v1

Status: planning branch. No runtime route changes.

## Goal

Turn the four-provider staging gateway into an evidence-based GradeCrew routing system without changing Production or the current reliable generation path.

## Current hypothesis

This is a competency/collaboration study, not a winner-takes-all comparison.

- Gemini Flash-Lite / Mistral Small: likely useful as low-latency interpreters, extractors and high-volume generators.
- OpenAI Luna / Claude Haiku: likely useful for constrained educational generation, critique and verification.
- A difficult job may intentionally use different providers for generation and verification if that combination proves useful.
- High-risk grading remains conservative until paired teacher-reviewed evidence exists.
- Stronger paid tiers are escalation candidates only after a scope proves the baseline insufficient.

## Added on this branch

- `docs/intelligence/PROVIDER_STRATEGY_V1.md`: human-readable task/provider and collaboration strategy.
- `tools/evaluation/provider-benchmark-plan.v1.json`: machine-readable staged benchmark manifest.
- `tools/evaluation/run-provider-benchmark.mjs`: guarded evaluation worker with deterministic call/cost caps, durable evaluation reservations and no provider retry.
- `tools/evaluation/provider-benchmark-worker.test.mjs`: worker safety/identity/cost tests.
- `tools/evaluation/provider-price-snapshot.2026-10-04.json`: reviewed baseline API price snapshot.
- `tools/evaluation/provider-benchmark-bundle.example.json`: synthetic input-contract example only.
- No provider allowlist expansion.
- No signed route publication.
- No paid benchmark calls in CI.
- No Production change.

## Next implementation step

The worker exists. Next: connect it to a dedicated staging evaluator identity with Firestore evaluation-budget access, create the first **human-reviewed Phase-A case bundle**, then run a very small paid pilot. The first deliverable is a role/capability matrix (including useful generator→critic combinations), not a global model ranking. Only after review should evidence be converted into `quality-gate.mjs` inputs.

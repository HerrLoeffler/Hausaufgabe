# GradeCrew Provider Strategy v1

Stand: 2026-10-04. This is a benchmark hypothesis, not a runtime authorization.

## Current staging baseline

The staging gateway has four real text providers wired and smoke-tested:

- OpenAI: `gpt-5.6-luna`
- Anthropic: `claude-haiku-4-5`
- Google: `gemini-3.5-flash-lite`
- Mistral: `mistral-small-2603`

Production and the current GradeCrew generation path remain unchanged. Automatic routing is still disabled.

## Product principle

This is **not a winner-takes-all model tournament**. GradeCrew should build a competency map and use complementary roles: interpreter, generator, critic, verifier and hard-case escalator. A provider can be excellent in one role and intentionally paired with another provider in a second role.

For simple low-risk work, one qualified model should usually be enough. For complex or high-risk work, the product may deliberately use two different qualified systems in sequence — for example one generates and another independently critiques or verifies. Cost still matters, but only after the required role quality is met.

Provider strengths below are hypotheses to test against GradeCrew's own held-out cases. No provider receives a runtime route from this document alone.

## Working role split

| GradeCrew job | First benchmark focus | Why this is a plausible fit | Escalation / cross-check |
| --- | --- | --- | --- |
| `crew_intent` | Gemini Flash-Lite, Mistral Small | fast classification, slot extraction, routing, short structured output | OpenAI Luna if ambiguity is high |
| `question_rewriting` | Mistral Small, Gemini Flash-Lite | cheap high-volume text transformation | Claude Haiku for nuance / long source text |
| `curriculum_matching` | Gemini Flash-Lite, Claude Haiku | long-context/document matching and semantic comparison | OpenAI Luna for difficult ambiguous mapping |
| `multiple_choice_generation` | OpenAI Luna, Claude Haiku | structured generation plus answer/distractor discipline | second-model validator on risky items |
| `distractor_generation` | Claude Haiku, OpenAI Luna | semantic plausibility without leaking the answer | Gemini/Mistral for cheap draft candidates |
| `test_generation` | keep incumbent OpenAI as baseline; benchmark Claude/Gemini/Mistral | this is a composite high-value job with many constraints | stronger model tier only after failed validator or hard profile |
| `solution_verification` | Claude Haiku, OpenAI Luna | independent reasoning / consistency checks | two-provider agreement for high-risk scopes, never majority vote as truth |
| `quality_control` | Claude Haiku first benchmark, OpenAI Luna second | reviewing language, ambiguity, logic and constraint compliance | escalate to stronger tier for complex whole-test audits |
| `free_text_grading` | incumbent + strict paired benchmark; no cheap-first switch | high consequence and rubric sensitivity | teacher review and conservative fallback required |
| `student_tutoring` | Mistral Small, Gemini Flash-Lite | low-latency explanation and short interactive help | Claude/OpenAI when multi-step reasoning is required |
| `game_hint` | Mistral Small, Gemini Flash-Lite | very short low-cost hint generation | Claude/OpenAI only if validator detects solution leakage / poor explanation |
| `game_content_generation` | OpenAI Luna, Mistral Small | structured creative content at controlled cost | Claude for quality audit |
| image/STT/TTS jobs | not part of this text baseline | current gateway adapters are text-only | separate modality contracts and benchmarks required |

## Escalation model

The default path should be three levels:

1. **Fast/cheap**: Gemini Flash-Lite or Mistral Small for classification, extraction, rewriting, simple hints and low-risk transformations.
2. **General quality**: OpenAI Luna or Claude Haiku for generation, semantic review, verification and more constrained educational tasks.
3. **Hard-case escalation**: a stronger model from the same or another provider only for scopes that demonstrably need it. Expensive models remain blocked until a benchmark and explicit allowlist change exist.

This preserves cost while avoiding the dangerous pattern "small model first for everything, then retry blindly". A validator or trusted task profile must decide whether escalation is allowed.

## Benchmark order

Phase A — low-risk / high-volume:
- crew_intent
- question_rewriting
- game_hint

Phase B — core generation:
- multiple_choice_generation
- distractor_generation
- test_generation
- game_content_generation

Phase C — correctness / review:
- solution_verification
- quality_control
- curriculum_matching

Phase D — high-risk:
- free_text_grading
- student_tutoring in assessment-adjacent contexts

Each scope must use the existing quality gate with held-out reviewed cases, critical-failure blocking, latency, and complete cost per accepted result.

## What we expect to learn: a competency map, not a leaderboard

The benchmark should answer, per job, scope and role:

- Which models are qualified as **interpreters/extractors**?
- Which models are qualified as **generators**?
- Which models are qualified as **critics/verifiers** and catch errors from a different provider?
- Which models introduce critical subject-matter or grading errors?
- Which models follow GradeCrew JSON/schema constraints reliably?
- Which combinations reduce repair/retry calls rather than merely duplicating work?
- What is p95 latency and complete cost per accepted result for each role and useful combination?
- At which difficulty/risk boundary does a second independent provider measurably improve quality?

The output is therefore a **role/capability matrix**. The runtime may select one model or a qualified collaboration pattern; there is no global winner. Only reviewed evidence may later authorize a signed route or collaboration profile.

## Evaluation worker

`tools/evaluation/run-provider-benchmark.mjs` now implements the guarded research worker. It is dry-run by default. Paid execution requires all of the following: explicit `--execute`, `GC_EVALUATION_EXECUTE=true`, the staging project, a private Cloud Run identity token, a deterministic call/cost cap, and a **durable evaluation budget store**. There is no provider retry.

Every paid call is reserved before contacting the gateway and settled afterward. Raw prompts/model outputs are written only to a private review packet with restrictive file permissions; the metrics file is content-free. Neither file can authorize runtime routing by itself.

The current reviewed price snapshot is `tools/evaluation/provider-price-snapshot.2026-10-04.json`. `provider-benchmark-bundle.example.json` is deliberately synthetic and only documents the input contract.

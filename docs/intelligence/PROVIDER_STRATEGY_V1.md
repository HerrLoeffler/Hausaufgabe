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

Do not choose a single "best AI". Choose the cheapest qualified model for each GradeCrew job, and escalate only when the job or validator says the cheap path is not sufficient.

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

## What we expect to learn

The benchmark should answer, per job and scope:

- Which model has the best accepted-result rate?
- Which model introduces critical subject-matter or grading errors?
- Which model follows GradeCrew JSON/schema constraints most reliably?
- Which model creates the fewest repair/retry calls?
- Which model is fastest at p95?
- Which model is cheapest per accepted result, not per raw token?
- When does a stronger second call actually improve quality enough to justify the cost?

Only after those results exist should the signed router publish an active route.

# Provider Phase A cases v1

Status: development benchmark material only. No runtime routing authorization.

## Goal

Create the first small, realistic GradeCrew competency set for the four-provider evaluation worker. This is intentionally **not a leaderboard**. Cases are designed to reveal complementary roles such as interpreter, generator, critic, verifier and tutor.

## Development bundles

- `phase-a-crew-intent.de.dev.v1.json`: 12 German teacher-form requests covering explicit field extraction, preservation, negation and corrections.
- `phase-a-question-rewriting.de.dev.v1.json`: 12 assessment wording cases covering meaning preservation, numbers/units, negation, clarity and answer-leak prevention.
- `phase-a-game-hint.de.dev.v1.json`: 12 subject-spanning hint cases covering scaffolding without giving away the answer.
- `phase-a-development-reference.de.v1.json`: separate development-only review criteria and case checks; never sent to providers.

All bundles are synthetic, contain no student personal data, and remain `reviewStatus=development`.

## Safety

The reference file is separate from prompts so providers do not receive expected answers or forbidden-answer lists. Offline CI validates all bundles against the benchmark plan and price snapshot. No API calls occur in CI.

## Next

1. Human-review and adjust the development references.
2. Promote a small subset to a held-out reviewed bundle.
3. Wire the dedicated staging evaluator identity and durable evaluation budget.
4. Run an 8-call micro-pilot before scaling.
5. Review outputs by role and combination; do not select a global winner.

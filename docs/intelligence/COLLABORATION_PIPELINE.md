# GradeCrew AI collaboration core v1

This contract defines **how multiple qualified AI systems may cooperate**. It does not choose a provider and it does not enable automatic routing.

## Core pipeline

The default architecture is:

`understand -> generate/act -> deterministic validation -> optional independent critic -> at most one repair -> final deterministic validation -> accept/stop/human review`

Not every job uses every stage.

### Hard loop limits

- one primary AI call;
- at most one independent critic call when the execution profile requires it;
- at most one repair call, and only for explicitly repairable jobs;
- no second repair loop;
- unresolved high/critical findings stop automatic acceptance;
- critical grading work requires human review.

The resulting maximum is normally 1 AI call for simple work, 2 calls for non-repairable independent verification, or 3 calls for generate -> critic -> one repair.

## Independent critic

The critic receives only:

- the original task,
- the produced artifact,
- the review rubric,
- trusted context.

The contract has **no field** for generator chain-of-thought, hidden scratchpad, provider identity or earlier critique. This reduces anchoring and prevents accidental propagation of private reasoning.

Critic output is structured:

- `status`: pass / warn / fail
- `severity`: none / minor / major / critical
- `confidence`: low / medium / high
- stable `issueCode`
- optional item index
- bounded user-safe detail

## Risk and complexity

Risk and complexity are separate.

Examples:
- a single Crew form patch can be low-risk and low-complexity;
- a long test can be medium-risk but high-complexity;
- free-text grading is critical because it affects assessment, even if the answer is short.

Server-derived metadata, not the user or model, controls the execution profile.

## Deterministic checks first

Deterministic validation should handle constraints that code can verify better than a model: schema, points, counts, option uniqueness, allowed types, numeric ranges, duplicate tasks, required solution fields and similar invariants.

Semantic critics are reserved for ambiguity, subject correctness, pedagogical fit, answer leaks and other judgments that deterministic code cannot reliably settle.

## Data policy is a hard routing gate

`data-policy.mjs` is deliberately fail-closed. A provider is eligible only when a trusted, current policy row explicitly approves the exact:

`provider + job + data class + requested region`

There is no default approval and no provider fallback that can bypass the data-policy gate.

The repository intentionally contains **no real provider/privacy approvals yet**. Those rows require separate privacy/legal review; the module only supplies the enforcement contract.

## Runtime status

These modules are offline contracts only. They are not wired into Production or the current GradeCrew generation path. Runtime collaboration remains disabled until provider-role evidence, privacy rows, validators and staging E2E tests exist.

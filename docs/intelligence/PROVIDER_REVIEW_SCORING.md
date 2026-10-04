# Provider review scoring v1

The evaluator intentionally does not produce a global provider ranking. Review output is converted into a **role-specific development competency matrix**.

## Why there is no automatic winner

A provider may be useful as an interpreter and weak as a critic, or strong at generation and expensive for trivial transformations. GradeCrew therefore records evidence by:

`provider + exact model + job + role + case bundle`

The matrix has `globalWinner: null` by contract.

## Two layers of review

### 1. Deterministic development checks

These checks are deliberately narrow and auditable:

- Crew intent: strict JSON patch parsing, exact expected field values, preservation of fields that must not change, superseded-value rejection.
- Question rewriting: exact preservation of case-specific constraints such as numbers, units, negation and required answer count where a reference provides them.
- Game hint: known final-answer leakage checks.

A deterministic check may flag a critical failure, but passing it is **not enough** to approve a model.

### 2. Human review

Semantic criteria still require a reviewer:

- meaning preservation,
- ambiguity,
- subject correctness,
- pedagogical fit,
- usefulness of a hint,
- answer leakage not captured by exact references.

The scorer accepts a bounded manual review file and aggregates manual pass/critical-failure evidence by role.

## Outputs

The development matrix records:

- technical completion rate,
- automated critical failures,
- manual reviewed count,
- manual pass rate,
- manual critical failures,
- average latency,
- known API cost and cost coverage,
- review completeness.

Every output remains `runtimeAuthorized: false`. Held-out reviewed evidence still has to pass the existing statistical quality gate before a runtime route can be published.

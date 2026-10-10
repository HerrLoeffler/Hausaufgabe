---
name: gradecrew-review-retro
description: Use when a GradeCrew change needs a scoped PR or commit review, a reviewable PR explanation, or a requested retrospective of a session with concrete problems. Not for ordinary status updates, unsolicited full audits, or automatic global instruction changes.
license: MIT
metadata:
  source: mattpocock/skills@49dd158d1076134a641b33efb035946536778336
---

# Review evidence; learn from actual problems

Read current project rules, assigned role, task, exact base/head and originating brief. Coordinators only brief/assess via permitted APIs; specialists perform assigned reads/tests. This skill grants no fix, merge, deployment, external message or settings rights. Keep existing independent review/security/Guardian gates; this is not a replacement security scanner.

## Review / PR mode

Fix the source SHA and changed scope before review. Separate author-stated intent from an approved specification; missing criteria remain missing, not invented. Read relevant standards/contracts and actual code/callers/tests, rather than treating the PR body or green CI as proof.

Keep two axes visibly separate: **Spec** checks requirements, incorrect behavior and scope creep; **Standards** checks concrete repo conventions, contracts and maintainability. For authorized independent review, give each existing available reviewer only its own axis and the raw relevant sources. No installed named Matt reviewer/tracker is assumed. If only one reviewer is available, label sequential passes and their independence limit; do not claim two independent agents. Available Superpowers review/verification workflows may be used as qualified aids, not pretended Matt dependencies.

Use the [review record](references/review-record.md). Link requirement/rule, exact file/line, evidence, impact and confidence for each actionable finding. Label a stylistic/code-smell concern as a judgment call. Keep findings and missing evidence per axis; one axis never cancels the other. Record tests as performed, author-reported or unperformed, attached to the actual SHA.

Explain the PR in product terms: trigger, before/after behavior, evidence and its limits, affected surface and rollback/reversibility. A compact sketch is optional if it clarifies the change. No fabricated screenshot, approval or full acceptance; retain useful evidence after cleanup.

## Retro mode

Use only when requested or a concrete notable failure warrants the assigned retrospective. Read the actual session/commit/run evidence and existing check wiring first. Produce at most three ranked observations using the [retro shape](references/retro-shape.md), then one next check/owner action. Mechanical patterns go to a suitable existing lint/type/test/CI mechanism; judgment belongs in review. Distinguish missing, disconnected and broken checks. Suggestions do not automatically rewrite AGENTS, global skills, memory, hooks or permissions. Implement within already authorized scope when assigned; otherwise route the concrete candidate through Root/owner. Costs, savings and observed model remain unknown without actual measurements.

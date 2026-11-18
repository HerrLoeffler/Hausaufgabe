# Autonomous recipe optimization Implementation Plan

> For agentic workers: use superpowers:executing-plans inline. Existing isolated task GC-EXTENDED-QUESTION-TYPES-01 / PR419; no new task or worktree. User says choose best approach and explicitly approves 5 USD total for the first autonomous run.

**Goal:** Codex conducts a resumable autonomous experiment that proposes small recipe changes, compares them on identical wishes, checks transfer on withheld wishes and presents at most ten diverse verified finalists. Human feedback is optional until this final selection.

**Architecture:** Reuse existing real API generator/blind solver, rational oracle, versioned Firestore attempts and scoped test function. Add a shared 5-USD session reservation checked transactionally across all experiment runs, fixed operator-owned manifests, tracked recipe optimizer and independent adversarial review. A Codex-driven local controller conducts this first bounded run without per-task clicks; this is not a deployed permanent daily scheduler. All intermediate state is durable in the test database and resumable without duplicate provider calls. No autonomous code execution or relaxed validators from model suggestions.

**Tech stack:** Existing Node/Firebase test backend and Chromium. Existing OpenAI secret, GPT-6-Luna generation, GPT-6.2-Sol checking. No new key, no Production, no base-model fine-tuning job. Recipe optimization is distinguished from neural-weight training; retain vetted data for a later justified fine-tuning experiment.

**Spec:** Latest user correction: racing-game-like repeated improvement, adversarial evaluation, small inherited improvements, little human work, diverse final examples; approved first-run cap5USDtotal. Earlier plan docs/superpowers/plans/2026-11-18-remy-dreisatz-training-lab.md remains conceptual basis. Existing64tests and historical provider budget remain separate.

## Experimental contract

Frozen development wishes and disjoint transfer wishes. Compare baseline recipe and subsequent small-change variants on identical development inputs. Optimizer sees only development failures and concrete reviewer reasons. Withheld inputs and answers never enter optimization. Accept a challenger only if factual/fit regressions do not increase and verified coverage improves; ties are explicitly ties, never invented progress. Final ten are examples selected for diverse learning actions, no claim of perfect recipes or99percentreliability. Critical contradictory cases remain visible in report. AI approvals are never teacher approvals.

All calls including optimizer/adversary share one session's 5,000,000 microUSD limit. Unknown provider outcomes retain reservation and stop affected work. Stable session/phase/case IDs; no reopening past attempts. At most two candidate-recipe changes and bounded per-candidate repairs. Failed tasks count in first-pass metrics. Automatic recipe hints may change wording/help/layout guidance, never grading truth, access rules, model budget, or execution code.

## Tasks

- [ ] Shared session budgets: extend store reservation/settlement with parent session; tests for parallel overspend, repeated requests and unknown outcomes RED→GREEN.
- [ ] Fixed autonomous manifests and session creation: operator-only, immutable manifests, graph-family runs; development/holdout separation and same-input baseline/challenger proof. Bind strategy version to each run and propagate guidance only to generator.
- [ ] Tracked optimizer/adversarial API phases with bounded schemas; use public view for independent reviewers and no previous verdict/key. Store small changes with lineage. Select champions by explicit metrics, preserve ties/failures.
- [ ] Resumable controller drives real calls, saves receipts and at most ten diverse accepted finalists as an operator-owned shared test deck. No perpetual scheduling or new production capability. Expose results through test-page deep link rather than multiple new top controls.
- [ ] Fresh independent review once; relevant local suite; only owned test function/hosting if needed; conduct first5USD-bounded real experiment. Browser finalists and preserve old decks. Document exact results, budget and limitations; update existing runtime/docs PRs.

## Review focus

Shared-budget races; generation hints leaking to judges/holdout; misleading champion acceptance from different inputs; duplicates masquerading as diversity; uncertain/replayed paid calls; AI verdicts pretending to be human approvals; unsupported autonomous scheduler or fine-tuning claims. Add regression tests for each relevant input class.

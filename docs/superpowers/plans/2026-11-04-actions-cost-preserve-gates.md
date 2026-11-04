# Actions cost implementation plan

> For agentic workers: use superpowers:executing-plans; keep the existing GC-ACTIONS-COST-01 history.

**Goal:** Reduce repeated CI work while preserving test and release gates.
**Architecture:** Two narrow candidates against existing Web and native branches. Cache downloaded packages, never test results; suppress only obsolete push checks.
**Tech stack:** Existing GitHub Actions YAML and npm.
**Spec:** ../specs/2026-11-04-actions-cost-preserve-gates-design.md

## Constraints and review focus

Public repository, no additional spending, unchanged deployment and signing rights. Preserve manual qualification, all unique commands, simulator matrices, upload needs/concurrency, and exact lockfile installation. No automatically claimed cache hit or saving percentage.

## Task1: Web CI candidate

- [x] Compare actual branch workflows and current control-plane deploy guards.
- [x] Reproduce missing concurrency/cache coverage and duplicate pure checks with an offline parsed-YAML compatibility audit.
- [x] Add event/ref-scoped push cancellation and complete npm lockfile caches; remove duplicate-only checks. Add the narrow cost qualification branch pattern.
- [x] Confirm all original unique commands, job identities, environments and gates survive.
- [ ] Independently review immutable candidate; publish own branch/PR; read exact CI.

## Task2: Native cache candidate

- [x] Preserve every simulator and upload dependency. Cache downloads with exact tools/ui lockfile and platform keys, without changing Node versions.
- [x] Compare parsed workflows to baseline, allowing cache configuration only.
- [ ] Independently review immutable candidate and publish own branch/PR; read applicable existing checks without manually starting TestFlight uploads.

Implementation checks are scoped to configuration and unchanged test coverage. Product suites still run in the original workflows. After adoption, record warm-cache/cancellation evidence on a regular task. Control-plane consolidation and Mac-to-Linux migration remain deferred until separately proven safe.

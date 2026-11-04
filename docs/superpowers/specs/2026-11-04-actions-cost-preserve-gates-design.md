# GC-ACTIONS-COST-01: preserve gates while avoiding repeated CI work

Martin approved implementation of the existing cost-audit plan on04November: keep the repository public, authorize no additional spending, retain important tests and independent reviews. Billing observations remain local and are not included here.

Selected first increment: remove only byte-identical repeated pure Web checks, extend npm download caches to every installed lockfile, and supersede obsolete read-only push checks on the same ref. Manual qualification uses a separate concurrency group. All original commands remain at least once, with unchanged environments, job names, permissions, triggers, simulators and dependency gates. A narrow additional fix/actions-cost-web-* push pattern qualifies this CI-only change without using an integration/deploy branch.

Considered alternatives: disabling full browser/native suites would save more but violate the quality requirement. Moving simulator tests to Linux is unsuitable because those tests use Xcode and actual iPhone/iPad simulators. Deduplicating the control-plane event graph needs separate proof of recovery and required-check semantics; it is deferred, not reported as implemented.

Web scope: AI Staging Checks on the existing design/app branch. Native scope: npm caches only in Teacher adaptive layout, Teacher TestFlight and Secure TestFlight workflows on the existing native integration branch. Keep uploads non-cancellable and keep their complete dependency chain. Native upload jobs retain the runner's existing Node version; only ~/.npm is cached. No node_modules, signing material or workflow result is cached. npm ci always runs.

Existing hosting/functions upstream gates accept the canonical integration branch, not the cost candidate branch. This patch does not change deploy workflows, release targets, account settings, quotas, API calls or repository visibility. Caches are built-in standard caches under the existing10GB allowance; no storage limit is increased. No paid/larger runner is introduced.

Acceptance: YAML validates; the original job structure and unique command coverage are preserved; only the identified duplicate commands disappear; cache keys include the relevant lockfiles and runner platform; independent review passes; exact public CI qualifies the candidate. Real warm-cache savings will be measured on later regular runs, not asserted from configuration alone.

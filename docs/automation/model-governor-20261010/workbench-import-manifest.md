# GradeCrew Workbench import manifest

Provenance for the bounded dev-only Workbench first import. This records the exact source snapshot and target checked before copying; it contains paths and content hashes only.

- Source snapshot: local commit `2062aaafdec172182088fea4a7b5381422e10559` (tree `80102977f550a4096fd2a9a71fd2a635c23ada79`); the source commit is not published on GitHub.
- Target snapshot: `origin/feature/gradecrew-app-integration` at `c3a5fdcfb949bc0de23295a549388c23cf7655e6` (tree `3ea47d0b8f98ce5b906d53475179a835b95e60a9`).
- Source Workbench files: 40 tracked paths; all absent on the exact target snapshot before import.
- Runtime dependency manifest: 6 additional paths. Four target files were byte-identical and left untouched; the shared `tools/review-preview/server.mjs` existed with a different contract and was left untouched; only `tools/review-preview/visual-tasks.mjs` was absent and added.
- Imported runtime scope: 42 files (41 under `tools/dev-workbench/` plus the missing visual-task store). The current import has adapted files beyond the original source snapshot; source hashes below are provenance hashes, not assertions that final imported bytes are identical. The copied browser toolbar references `et-touch-icon.png`; it is the sole image asset in the Workbench tree.
- `tools/dev-workbench/server.mjs` is a dedicated Workbench handler, built from source snapshot `tools/review-preview/server.mjs` SHA-256 `386a263587b249cedb175f8bf9b8db1243b22752dab183a6be4971d543548cfa` with six relative imports rewired into the Workbench path. It does not import or overwrite the target’s shared review-preview server.
- Fixture-mode homepage loads both the review-preview client and the Workbench client. Staging homepage loads only the Workbench client so the fixture client's login-event interception cannot block real login handling. On loopback staging responses for `app.js`, the handler appends a small allowlisted module tail from `tools/dev-workbench/app-bridge-source.mjs`; the tracked product `app.js` is unchanged. The bridge uses lexical app state only to block reload while editor, student, AI, settings, or nonempty sign-in state is active. Its checkpoint/context include only view and quiz ID, never form values, student answers, tokens, or prompt text.
- The governor passes the task-store acceptance digest as a distinct `acceptanceHash`; the provider writes that digest once into the receipt. Its regression test covers a completed routine attempt followed by a same-criteria semantic escalation and rejects changed criteria before a second CLI start.
- Source `tools/dev-workbench/server.mjs` was a 96-byte wrapper SHA-256 `34b6e4da843b7e7d93743fee7404ec65394235e032d91b9c3fad26e5a134ac07`; the imported standalone handler SHA-256 is `86e5081a33a5a4dcfff78076c2e917898d20c288fe83a394d1793584ec2a0e19`.
- No product/design dirty files, history/logs, secrets, `node_modules`, `output`, or `tmp` are included.

## Workbench source files

All paths below were absent from target `c3a5fdc` before import. SHA-256 and byte count are from the source Git blob at `2062aaaf`.

| Source SHA-256 | Bytes | Path |
|---|---:|---|
| `88fd81eff1ea0b95415c9042399296c23ad4e38a7306dfc9c5b429fa8c65eb4b` | 420 | `tools/dev-workbench/Mac-Leiste starten.command` |
| `1c925817e219ee5ed8623b9f3f73eea6293464e41041d6d90d8de70f17287d01` | 5613 | `tools/dev-workbench/README.md` |
| `ccc815c7b6f973173f4f928cffbc3fc6e1162deec08a041fcfe7c4a0afe9fae6` | 280 | `tools/dev-workbench/Werkzeug starten.command` |
| `f2ee18a8ff9f292f7319f898674ef69a39fa4d339ba61d8f48178d22084dd5ab` | 1336 | `tools/dev-workbench/app-bridge.test.mjs` |
| `722b5761eb209dd94fed3b61d5a2ad176f81529ae7fd43739bed7d25d266d0a0` | 35600 | `tools/dev-workbench/browser-toolbar.mjs` |
| `b766a838c5184680cdc6de4079bdb6453214b2415cd725826b2d703e1bd468b6` | 14601 | `tools/dev-workbench/browser-toolbar.test.mjs` |
| `9f7c3b37701137cb658bde0706b1a0703f3def5b5b67680f2794919c16404c5e` | 42983 | `tools/dev-workbench/build-handbook.py` |
| `0ac30cce6ae69a3286035b5d31dc912ba1b786f110b304ba0433025115bb194c` | 929 | `tools/dev-workbench/client.mjs` |
| `70f3bda214a9092b2c425e1eac3013992a46d7011f69f6824f9fae6afcaf31ec` | 4688 | `tools/dev-workbench/codex-model-policy.mjs` |
| `2d96a17170289b36097f417fd5555e93919e66786347d136cfa89ea4d8020679` | 4960 | `tools/dev-workbench/codex-model-policy.test.mjs` |
| `5afb5a2e64f3c8768c84aff21719a9ca698252c19c9cd1a2be2afb9ad3ab50ff` | 8804 | `tools/dev-workbench/codex-patch-provider.mjs` |
| `72f5de8e9aa3424ec6165cb69849399e2ba62480b320db559beeb9cdc5716e9d` | 7161 | `tools/dev-workbench/codex-patch-provider.test.mjs` |
| `eb1c5ed3a0375786bf2418d89f42621d5539880bdd83dcfda0627f165c0bea3f` | 5631 | `tools/dev-workbench/edit-history.mjs` |
| `9604eb7a10261764636f03ee6e1c76a4c1e4683144a24c4bc8f586b03ec63f06` | 483768 | `tools/dev-workbench/et-touch-icon.png` |
| `f5cc90e6775403779b211b47d3d5485735704376f6e8677d628bad78f0d229b5` | 2939 | `tools/dev-workbench/http.test.mjs` |
| `8eeb28b52d75e4579cd00b1ca17bef96e123984947af0d26cd333642357c4e58` | 2927 | `tools/dev-workbench/hub.css` |
| `698a2b1e38fbb6aec777525c28d3e3653e526d73a977630318b44510a0e2159c` | 3874 | `tools/dev-workbench/hub.html` |
| `6676195130d037eed5a0cdd18a69c202f8e5e695cc717a0f0da2fc5d2afe5a3c` | 8933 | `tools/dev-workbench/hub.mjs` |
| `d3eb5da8d9e83b8072cc6219dfbf1830e74c6238371bee0dff806604ba157a64` | 10023 | `tools/dev-workbench/live-controls.mjs` |
| `ac32cb245d4fb006f9b844ce494f42e1d1f34fa7b8550fec92d237ecb121d3b4` | 4999 | `tools/dev-workbench/live-edit.test.mjs` |
| `6d199bd21cd829ffd599a2cd9a1975a2e1985cc60041cecae0572989eeb4c888` | 4465 | `tools/dev-workbench/live-editor-governance.test.mjs` |
| `27da5aa1becba4cec602ce934b0c3cfc4abf04bf3009381e7e97fb2caae90f10` | 9299 | `tools/dev-workbench/live-editor.mjs` |
| `fb3812a22d74480da7e3f2e60e1a3642fe94e9f1d4d43c85c9bd50ed74079f46` | 1544 | `tools/dev-workbench/live-smoke.mjs` |
| `0e1f1a560081244241e0dcb5b0e6d9e56dec4cdf169db11c143826166a08d899` | 15597 | `tools/dev-workbench/native/GradeCrewWorkbench.swift` |
| `c1fdd0f77e55f0fe8ce2425d5ea150f4c301dd6828eec9b37ab268493e1458a3` | 1112 | `tools/dev-workbench/native/build.sh` |
| `6cb2d63845ddc54b398742bbfd1c2ce0fb9a8b77676eafe57ebee7eb9da5bb6d` | 834 | `tools/dev-workbench/notes.mjs` |
| `2864d1ef9973659964158477c1be8c7debd027c1a0faa8e224f9bb04cfc5aab7` | 553 | `tools/dev-workbench/outbox.mjs` |
| `97d1486defb1db0347caab5502669b32e77b5135ca637623ca42bd19d7f78ec0` | 1683 | `tools/dev-workbench/project-registry.mjs` |
| `6d38ed1acf22b090eb2cc53dc8a3ce66429365dc7d01abec1111a1f18b49fb51` | 1832 | `tools/dev-workbench/scaffold.mjs` |
| `2ae22ee0f706cbc38c5f5d6e381588ecf055790b0bd241de595f64fbc5fcb933` | 866 | `tools/dev-workbench/sdk.mjs` |
| `34b6e4da843b7e7d93743fee7404ec65394235e032d91b9c3fad26e5a134ac07` | 96 | `tools/dev-workbench/server.mjs` |
| `b0bad4d66f027fc6f5ecde43e3bec02594f29ff3a27d8ebe172d36f2180e0ec9` | 1558 | `tools/dev-workbench/start.mjs` |
| `5abb6390f0f9e23eabee81be1e59942de96e3e6ce6211c89993702b2e911e9d8` | 3246 | `tools/dev-workbench/store.test.mjs` |
| `7c1d72892794cd59ac295db39321c94725c6f39422568aba0bb85b2e93be4219` | 1780 | `tools/dev-workbench/task-store-governance.test.mjs` |
| `6b464575ccdf248fe7aedeb74157e36f01772032d17f9a2f9c8370bfec8fa91a` | 9005 | `tools/dev-workbench/task-store.mjs` |
| `7af215e75da75dfaceca8258ea4e41f2284e5e5d70431b2b01b38335ffb640c2` | 1398 | `tools/dev-workbench/testing/index.html` |
| `177d355138ec1da47a1b974335848dfcdcfcde98bf97bb7e873233758f658551` | 873 | `tools/dev-workbench/testing/style.css` |
| `3ffe44b6e5784fcc2fb9642d16ea4cc92d7099084d30db300fc6c06727120d32` | 1175 | `tools/dev-workbench/testing/surface.mjs` |
| `935df6cb14bf5ad08acd6d0accaab5c489b09f6ac00e0f455578150faa862648` | 1613 | `tools/dev-workbench/watch.mjs` |
| `64249d567bd3c2182eb253f95b457941f31899cb55be0929b5acbe75679008e8` | 1133 | `tools/dev-workbench/watch.test.mjs` |

## Additional runtime dependencies

| Path | Source SHA-256 | Target state at c3a5fdc | Action |
|---|---|---|---|
| `tools/review-preview/server.mjs` | `386a263587b249cedb175f8bf9b8db1243b22752dab183a6be4971d543548cfa` | present, different content (target SHA-256 `e721751bf40e26a12b268a9e19dd5f504ccc9aa3aba953c4dd597004fbf90f2d`) | left unchanged; dedicated handler is under tools/dev-workbench/server.mjs |
| `tools/review-preview/data-store.mjs` | `c15c5a4c763bd3ac8c32ab5693d1a5a37f49c78c96e4db2357866d9efd556cd8` | present, byte-identical (target SHA-256 `c15c5a4c763bd3ac8c32ab5693d1a5a37f49c78c96e4db2357866d9efd556cd8`) | left unchanged |
| `tools/review-preview/fingerprint.mjs` | `d2840fc8d0f8cc9a10f452645479f98ee61ba6156a659f0bb62af7c889fe9f5c` | present, byte-identical (target SHA-256 `d2840fc8d0f8cc9a10f452645479f98ee61ba6156a659f0bb62af7c889fe9f5c`) | left unchanged |
| `tools/review-preview/visual-tasks.mjs` | `cfacedd8447e05059f2853b2876a8c4161509c86511b0ac51e009ff2a640b41e` | absent (target SHA-256 `—`) | added from the source blob |
| `functions/lib/review-mode.js` | `a116dfe4c6a5965576848bbd931bc5422b9292659be49334598eaabb2b0fff1c` | present, byte-identical (target SHA-256 `a116dfe4c6a5965576848bbd931bc5422b9292659be49334598eaabb2b0fff1c`) | left unchanged |
| `functions/lib/review-checks.json` | `5bca50f071b3caacde48cc61a81bdd9d2ef373283c797013f94880e4d7444fec` | present, byte-identical (target SHA-256 `5bca50f071b3caacde48cc61a81bdd9d2ef373283c797013f94880e4d7444fec`) | left unchanged |

## Verification notes

- The original shared `tools/review-preview/server.mjs` remains unchanged.
- The first import’s separate HTTP handler binds only to `127.0.0.1` and serves the Workbench UI, toolbar asset, project listing, live-state endpoint, and CLI-backed live-editor route.
- Model selection/launch tests use stubbed process creation; no model inference or staging record was started.
- The standalone loopback test uses temporary fixture storage. DOM tests requiring `jsdom` were not made to trigger a third-party install.

## Adapted import files

- `tools/dev-workbench/server.mjs` is the standalone Workbench handler described above. Its current imported bytes differ from the original 96-byte source wrapper (source hash `34b6e4da843b7e7d93743fee7404ec65394235e032d91b9c3fad26e5a134ac07`) and from the earlier PR candidate; the final candidate commit records the actual imported hash.
- `tools/dev-workbench/http.test.mjs` now starts that Workbench handler instead of the shared review-preview server. It verifies staging does not inject the fixture review client, fixture mode still does, the local UI, toolbar asset, project and live-state APIs, foreign-origin rejection, task-save deduplication, and path traversal. Its generated-handbook PDF assertion is omitted because `output/` artifacts are intentionally excluded; the final candidate commit records the actual imported hash.
- Other source Workbench files remain byte-identical to their recorded source blobs.

## Test evidence

- Focused governor, policy, browser-toolbar, store, watch, live-edit, and bridge suite: 46 passed, 0 failed. It used the already-present `jsdom` from the source checkout; no dependency was installed or copied.
- Isolated loopback HTTP contract tests: staging and fixture pages are checked separately on temporary storage and free ports; staging checks absence of the login-intercepting fixture client, fixture mode checks its presence, and only staging serves the app bridge. These checks do not submit a CLI job or read/write staging records.
- The original imported app-bridge test expected a bridge embedded in tracked `app.js`, which is absent on the remote target. It was replaced with tests for the equivalent allowlisted dev-only response tail and its semantics; no product `app.js` change was needed.
- These tests used the bundled Node runtime. No model inference, staging record, or live service restart was performed.

## Workflow boundary

- On this target snapshot, `.github/workflows/ai-staging-check.yml` runs on pushes to `feature/gradecrew-app-integration`; it has no path allowlist, but ignores Markdown and `docs/**` / `workstreams/**`. It is a test workflow and contains no deploy step. A dedicated `.github/workflows/dev-workbench-check.yml` now runs bounded Workbench tests for pull requests and pushes to that branch, filtered to Workbench runtime/dependency paths; it has no deploy or model-inference steps.
- `.github/workflows/mobile-tutorial-check.yml` also lists the integration branch, but its paths filter excludes this Workbench scope. No workflow files were changed.

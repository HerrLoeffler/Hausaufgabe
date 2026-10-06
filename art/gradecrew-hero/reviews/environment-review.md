# GC-DESIGN-05 — independent environment review

Reviewed 2026-10-06, branch `docs/gc-design-05-reference-plan-20261006`, local HEAD `513647a` (environment/source-contract checkpoint). Scope: `environment-review.diff`, environment scripts/artifacts, canonical source contract. Ongoing `coco-pilot/` was neither reviewed nor changed. No Blender runs or renders were repeated. Current main START_HERE and linked coordination rules were read through the GitHub connector; this is a delegated review of the existing task, not a new implementation or deployment.

## Verdicts

- **SPEC: PASS for the observed local environment proof.** Actual Python MCP → stdio server → live addon scene read/change/save/render is supported by `mcp-proof.json` and local process logs. Independent headless reopening is supported by `.gradecrew-tools/reopen-proof.log`: `GC_REOPEN_OK`, Blender 5.2.2 LTS, `GC_ConnectionProof`, x=0.3499999940395355. The successful run used narrowly approved host access; native Codex tool registration remains explicitly false. This does not approve hero visuals or deployment.
- **QUALITY: CHANGES REQUESTED for safe reruns**, because the fixed-port client does not establish the identity of the disposable Blender process before mutating it (P2 below). The completed proof remains valid; the finding concerns reproducing it when the port is already occupied.

## Finding

### P2 — Verify disposable session identity before modifying a fixed-port Blender scene

Locations: `environment/start_mcp_session.py:15–19`, `environment/verify_mcp.py:15,25–30`.

The bootstrap binds 127.0.0.1:9877, but the pinned addon's `BlenderMCPServer.start()` catches bind exceptions, calls `stop()`, and returns. The bootstrap then only prints `GC_MCP_READY False`; the verifier independently connects to the fixed port. If a previously running Blender MCP instance occupies that port, the verifier can address that older process. Finding an object named `Cube` is insufficient to distinguish a factory test scene from a user's scene. The verifier would rename/move that object, change render settings, and save the older scene into the proof path. Consequently README's statement that a fresh process prevents interference with an existing user file needs an enforced ownership check.

Remedy: fail visibly when the bootstrap cannot start, and establish a per-session nonce or other process identity that the verifier checks through a read-only request before any mutation. The verification must also refuse a loaded user file. A startup success flag alone does not identify the client target. Validate the collision/identity guard without rerendering the successful proof.

## Evidence checked

- The four artifacts recorded in `toolchain-proof.json` have matching actual byte sizes and SHA256 hashes: `.blend`, `.png`, bootstrap, verifier. The 256×256 PNG was opened and shows the expected cube tooling scene.
- The GUI session log reports `GC_MCP_READY True`, localhost:9877, and the saved PNG. MCP evidence reports success and the expected moved object; the separate reopen log reports the same object/coordinate and build `d13f752e3b9c`.
- Installed distribution metadata pins MCP for Blender 2.1.8 to archive commit `34b7bd277fff75a693cde78930b4359478958a01` and archive SHA256 `783b7e…111333`. SDK 1.30.0 accounts for the MCP serverInfo version and is distinguished from package version 2.1.8.
- `BLENDER_MCP_SAFE_MODE=1` and `DISABLE_TELEMETRY=true` in the verifier correspond to the installed source's actual controls. Safe mode guards the MCP execution path; it is not an addon-socket sandbox. Telemetry's disabled flag suppresses collection. The reviewed scripts do not install addons globally, save Blender preferences, or edit global Codex configuration.
- Canonical SVG paths at immutable `bb91ce3590d773472ece60c4dd881da729bd32c1` were freshly fetched through GitHub: all four blob IDs match. Matching local copies independently produce the listed SHA256 and Git blob hashes. All are SVG wrappers embedding WebP pose atlases. Extracted atlases were visually inspected: species, palette, and dark eyes agree with the contract. Side/back views and unknown original 3D models are properly marked as assumptions/unknowns.

## Nonblocking reproducibility notes

- The repository deliberately depends on a sibling `.gradecrew-tools/` layout. README states that requirement, but adding exact restore/install and independent reopen commands would make a fresh-machine handoff easier. This is documentation improvement, not evidence that the completed local run failed.
- The raw independent reopen log is local rather than in the reviewed commit. Archiving its short output and exact command beside the JSON would strengthen portable audit evidence; it is available and was checked here.
- Version pinning and the bootstrap's removal of the update timer agree with the documented session. The download checksum file matches the declared macOS-arm64 checksum; this review did not redownload or rehash the large installer.

No P0/P1 issues identified. No source identity mismatch, invented native registration, or unsupported visual approval identified. Next step: enforce disposable-session identity before treating these scripts as safe reusable launch/verify tooling.

## Focused re-review — isolation fix, 2026-10-06

Reviewed only `environment-fix-review.diff`, its updated environment evidence, and the relevant existing process output. No runs/renders were repeated and no other implementation was inspected.

**SPEC: PASS. QUALITY: PASS. Original P2 resolved.** These verdicts supersede the initial quality verdict for the reviewed fix.

- Bootstrap now requests an OS-assigned loopback port directly on the bound socket (`port=0`), rejects a failed start, and publishes a receipt only after success. A pre-existing service on the old fixed port can no longer become its implicit target.
- A random per-session scene nonce travels through that receipt. Both the matching nonce and the dedicated scene name are asserted inside the actual Blender execution request before the first object/setting/file mutation. The check and mutations run together, avoiding a separate check/mutate gap. A reopened proof scene may intentionally be reused; another loaded scene lacks the matching marker/name and is refused.
- The changed verifier deliberately sends the same mutation code with a wrong nonce first. The existing GUI/MCP logs show `AssertionError: Wrong Blender test session` at code line 2, before mutations. The following correct request succeeds and the updated JSON records `wrong_session_rejected: true`.
- The separate fresh-process log confirms `GC_REOPEN_OK`, unchanged expected x=0.3499999940395355, Blender 5.2.2 LTS/build d13f752e3b9c, and `session_marker: true`. All four updated artifact hashes and byte sizes match the actual files. MCP JSON and toolchain JSON consistently report the observed per-session port 62024.

No new defect identified in the changed lines. The previous optional handoff/documentation notes remain nonblocking. Verdict remains limited to local tooling proof and safe use of the documented factory-startup process, without native Codex registration, hero visual approval, or deployment approval.

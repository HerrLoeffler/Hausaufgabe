# GC-DESIGN-05 — bounded Astra refinement result

Owner: Astra subagent of current GC-DESIGN-05 implementation chat; chat link unknown.
Branch: docs/gc-design-05-reference-plan-20261006; existing PR 143 retained by parent.
Release state: branch_only. No CI, merge, staging, user acceptance or production claim.
Baseline: 6f085c70a929156e4b0440f7ef2736ac0df28131. Sol source and evidence remain unchanged (empty scoped git diff against baseline confirmed).

## Result and gate

Technical prototype: PASS (25 checks passed, 0 failed).
Canonical visual master: NOT PASSED after the maximum three focused visual rounds.
No further visual round, crew modeling, website implementation or deployment.

Both eyes now remain dark with small highlights. Shallow curved patches follow the head, replacing raised ellipsoid sclera. The square-bottom forehead mask is replaced by tapered navy between soft cream lobes. Fine dense laid curve fibers improve plush coherence. Orange beak/feet now read warm orange instead of peach/coral. Slight head tilt and deeper upper chest reduce symmetry but do not solve the sculpt problem.

Remaining blocking visual issues: head/neck/shoulder forms still visibly read as joined primitives; cheeks and expressions lack canonical sculpt character; blink is scale squash and reveals smooth bare eye ovals; groom lacks the atlas's authored soft clump variation. Side/back inferred. Door top rail black end artifacts remain a secondary room issue.

Smallest next production remedy: a unified sculpt/retopology pass across head, neck and shoulders plus properly deforming eyelids with groom masks that follow the closure. Retain the existing editable room, cameras, door-contact composition, render pipeline and identity palette. This is a different modeling step rather than another material-parameter round; it is not evidence that AI cannot do it or that a paid service is required. Recheck front, three-quarter, profile and closed-eye poses against the canonical atlas before any web master acceptance.

## Actual proof

- Source: art/gradecrew-hero/coco-astra/build_coco_astra.py and coco-door-astra.blend.
- Blend: 10,187,239 bytes, SHA256 87e13420ec6e9a566b8026f2bd412a32d63ffd7af9e80fe601f892821d2ff7e2.
- Eight final PNGs: desktop-frame-01, inspection-frame-01, mobile-frame-01, side-frame-01, pose-frame-01/12/24, reopened-desktop under coco-astra/renders/.
- Actual final rendering: Blender 5.2.2 LTS (d13f752e3b9c), Cycles CPU, 64 samples; seven-view batch log elapsed 47.379 seconds. Fresh-open desktop render 9.358 seconds. Local measurements, not production animation estimates.
- Fresh separate-process open and desktop rerender succeeded. PNG hashes differ; no byte-identical output claim. Both reviewed visually.
- 25 checks: fresh file open, actual camera containment, both blink controls and evaluated pupil geometry shrink/reopen, head/flipper changes, fixed door contact, feet/ankle contacts, no baked text/image textures, hidden placeholders, two rebuilds preserving an unrelated scene/collection/object/material, no duplicate owned objects, world count stable at 2.
- Builder now reuses its World and avoids the unused blush material. Verification writes only to ignored _verification; original delivered source stays intact.
- Final views and all three pose images visually inspected. No fake billboard, image-plane character, reference bitmap material or postprocessed illustration.

## History and safeguards

Three visual rounds preserved in attempt-history.json. Local early comparison images are ignored under rounds/. No paid provider calls, no reset budget, no global configuration changes, no MCP/GUI scene modifications. Blender processes required narrow approved local runtime access due the already diagnosed sandbox crash.

Source checkpoint was included in parent's concurrent commit 568754d; report checkpoint 6f1360d; final source refinement checkpoint a14494b. No reset/amend was used. Subsequent commits use explicit paths/--only to avoid shared-index inclusion. Final artifacts are committed by this agent; parent handles remote durable upload, shared TODO/workstream updates and independent review. Current-main START_HERE and linked rules were checked by parent at 8360bc5f056837118ffd83138ffa2468ae42647e; local START_HERE, AGENTS and CHAT_CONTRACT also read by this agent.

Next executable step: parent independently reviews and remotely secures this exact source/evidence, then carries the specific sculpt/eyelid/groom blocker into the existing GC-DESIGN-05 handoff. No approval to advance to website production is implied.

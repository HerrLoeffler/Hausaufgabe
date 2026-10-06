# Task C — scoped Astra frozen re-review

Reviewed 2026-10-06 at exact HEAD `bc8505d48d38552ce56d6a5a91131ee9efa6fe88`. Inputs: task-c-astra-brief/report/review.diff, frozen coco-astra source/evidence/views, prior Sol review and previously inspected canonical atlas. No source edits, modeling, rerenders, unchanged-source retests, paid calls or agents.

**Integrity: PASS. Technical prototype evidence: PASS. Canonical visual master: NOT PASSED.** The bounded refinement genuinely improves eyes, mask, fur and orange palette, but remaining joined forms and closed-eye artifacts support the report's failed visual checkpoint. Full crew/web production must remain held. No overall score is assigned.

## Evidence integrity

- All **16** manifest entries independently match actual size and SHA-256, including scripts, documentation, evidence, blend and eight PNGs. Blend is 10,187,239 bytes, hash `87e13420ec6e9a566b8026f2bd412a32d63ffd7af9e80fe601f892821d2ff7e2`, matching verification evidence.
- Frozen diff exactly equals the coco-astra scoped diff from baseline `6f085c70a929156e4b0440f7ef2736ac0df28131` to exact HEAD. Owned working-tree scope is clean. Sol coco-pilot has an empty diff against its frozen baseline.
- Existing verification evidence contains exactly **25 passed / 0 failed** checks. Source implements matching checks for both blink controls and evaluated pupils, camera containment, head/wing changes, static door/foot contact and isolated rebuild preservation. These are prior-run evidence; this reviewer did not rerun them.
- Recorded reopen PNG exists, matches manifest hash `ee0e4cbd59a8ee503074a0fbfd4a7165e3d79f0590e22a3061331f085fe0d907`, and visually matches the original desktop composition. Different image bytes are honestly recorded. I did not independently open Blender.
- All eight final PNGs were visually inspected. Actual mesh/curve construction remains present; no bitmap character, baked words or camera-specific image-plane substitute appears. Desktop retains quiet right space; mobile retains head/feet. Save/reopen, geometry and preservation evidence remain suitable for the limited prototype.

## Prior findings — disposition

| Finding | Disposition | Actual evidence |
|---|---|---|
| C1: pale asymmetric eye / raised button layers | **Addressed for the specific prior defect.** Both eyes now read dark with small highlights; side view removes the pronounced stacked sclera/button profile. This does not approve the whole face. | inspection and side PNGs; `build_coco_astra.py:399–441,657–663`: shallow head-following patches and low eye specular. |
| I1: squared mask / stiff sparse groom | **Partly addressed.** Squared tip is removed; cream lobes and narrow taper are coherent. Fur now reads much finer, denser and softer across views. Remaining uniform grooming lacks the atlas's authored clump variation. | inspection/side PNGs; builder `108–117,262–321,391–398`. |
| I2: constructed head/body/wing transitions | **Not addressed sufficiently.** Chest adjustment and tilt improve presentation, but closeup and side still expose distinct head/neck/body junction and rigid wing attachment. | inspection/side PNGs; builder `381–398,462–473`. |
| M1: orphan worlds / unused blush material | **Addressed for both identified allocations.** World reused; unused blush allocation removed. Existing evidence records world counts `[2,2]`. | builder `614–618,636–672`; verifier `138–146`. General unused global name `BLUSH` does not allocate a material. |
| M2: left-only blink assertion | **Addressed.** Both control scales and both evaluated pupil extents close/reopen are now checked. | verifier `65–76`; matching four checks in evidence. |
| M3: black door-rail ends | **Not addressed.** Clearly remains in desktop/mobile. Secondary room fault, correctly disclosed. | desktop/mobile PNGs. |

## Remaining acceptance blockers

**Important — unified character forms and expression.** The narrow head/body seam and assembled shoulders remain visible, especially profile. Face is recognizable as navy/cream Coco, but cheeks and expression still lack the canonical sculptural character. This preserves I2's visual hold; no additional material-only round is justified by the evidence.

**Important — blink reveals fixed smooth eye ovals.** `renders/pose-frame-12.png` shows thin compressed eye lines within visibly bare, smooth oval areas. Builder excludes groom in fixed eye regions (`290–291`) and squashes eye groups (`450–452`), so the geometry checks prove movement, not eyelid closure quality. A curve named upper lid is present, but properly deforming lids and groom masks are not evidenced. This is a disclosed production-quality limitation; the minimal prototype-control requirement itself remains satisfied.

**Important — groom authorship remains incomplete.** Fine laid fibers remove the former stubble problem, but the atlas's soft varied clumps are not reproduced. Assess this together with the sculpt/eyelid pass, rather than treating strand count as visual acceptance.

The door and door-side wing remain fixed, as explicitly tested and disclosed. No animated contact solver or full production rig is claimed or required for this bounded gate. Head-turn, squash blink and welcome-wing poses remain useful prototype controls. Side/back are inferred.

## Verdict

Accept this as an improved, intact editable technical prototype and a completed bounded comparison checkpoint. Keep **visual acceptance false**. Retain the current sources/evidence and the specific unified-form, eyelid/groom blockers in the existing handoff; no new fixed source is necessary to conclude this failed checkpoint honestly. Any later master acceptance requires sculpt/retopology and deforming eyelid/groom work reviewed in front, three-quarter, profile and closed-eye poses. This re-review authorizes neither additional rounds nor downstream crew/web work.

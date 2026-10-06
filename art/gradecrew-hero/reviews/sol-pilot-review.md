# Task C frozen Sol pilot review — GC-DESIGN-05

Reviewed 2026-10-06. Frozen commit `6f085c70a929156e4b0440f7ef2736ac0df28131`; only `art/gradecrew-hero/coco-pilot/` and the supplied brief/report/diff were inspected. No Astra work inspected, source edited, test rerun, render produced, paid call, push or agent spawned.

**SPEC: technical prototype deliverables PASS; complete visual acceptance FAIL. QUALITY: 4/10 for the agreed Coco/door visual gate, not the overall project.** Editable geometry, room composition and useful proof views are present. Canonical eyes, soft groom and coherent face still miss explicit acceptance criteria; full crew production remains blocked. The report correctly states `visual_acceptance: false`.

## Integrity and evidence

- Frozen `task-c-review.diff` exactly equals ordinary `git show --format=` of the commit. Commit contains exactly 17 files in the owned pilot path; current owned path has no tracked modifications.
- All ten manifest entries independently match actual file size and SHA-256, including the 2,057,153-byte `.blend`, both main scripts and seven final images. Source SHA-256 is `925081e1aece33bfdc0c5b0ec81fdfd9a07f4f9dd0d60b219f36bcb59eae3b05`.
- `verification-evidence.json` contains 21 true checks/zero false checks; these are preserved prior-run evidence, not newly rerun tests. The fresh-open PNG exists and independently matches its recorded SHA-256 `5fb42792ae42d53c37956e5cda88e547cdd89c3f111822e70b004babe7243694`. Visual inspection finds the same composition/defects as the original desktop. Its differing bytes do not establish a reproducibility failure; neither the report nor this review claims identical exports.
- `build_coco_pilot.py:148–343,377–455` constructs mesh/curve character surfaces, actual room geometry and named controls; no image-plane character or texture-based cutout is used. The saved-source evidence, hashes, builder and side view together support real editable 3D source. I did not independently open Blender during this read-only review.
- Desktop, closeup, mobile, side and blink-pose PNGs were visually inspected against the canonical `analysis/GC-DESIGN-05/reference-assets/penguin-guide.webp`. Desktop has Coco left, a partly open wooden door, shadows/warm light and empty right area. Mobile retains head and feet; no rendered words visible. Navy/cream/orange palette and cheerful beak remain recognizable.
- Builder saves before renders and again afterward (`build_coco_pilot.py:643–661`). Fresh-open verification records actual camera bounds, foot floor proximity, fixed contact, control changes and two isolated rebuilds (`verify_coco_pilot.py:38–133`). Sentinel preservation supports the tested unrelated scene/collection/material case. It does not prove every possible shared-data scenario.

## Findings

### Critical — visual identity gate remains failed

**C1. Eyes do not consistently read as canonical dark eyes and remain visibly layered buttons.** `renders/inspection-frame-01.png` and `renders/side-frame-01.png`; `build_coco_pilot.py:395–405,619–622`. One frontal pupil has a broad pale grey reflection, while the other reads dark; the ivory/brown/pupil stack protrudes from the face in side view. The brief explicitly excludes disconnected/uncanny eyes. This is a critical acceptance issue for this visual gate, not a source-integrity or security fault. Required action: embed/rework eye surfaces and their reflection response, then review closeup/side in the same lighting. Already honestly disclosed in README/report.

### Important — character quality requires refinement

**I1. Mask and groom miss canonical softness.** `renders/inspection-frame-01.png`, `renders/side-frame-01.png`; `build_coco_pilot.py:108–117,262–317`. The forehead mask has a hard flat-ended navy stem rather than the guide's curved transition. Groom reads as stiff sparse bristles over a smooth surface, especially belly and silhouette; 39,500 strands do not establish soft fluff. These are explicit visual acceptance concerns and warrant the focused artist/modeling pass already underway.

**I2. Head/body and wing transitions remain visibly constructed.** `renders/side-frame-01.png`; `build_coco_pilot.py:377–444`. The distinct head/body junction and rigid flipper attachment/silhouette expose the parametric prototype. Canonical plump identity is recognizable, but does not yet meet the brief's coherent character-quality target. Side/back are disclosed inferences; no canonical unseen surface is invented as a requirement.

### Minor — bounded technical/report limits

**M1. Rebuild is object-idempotent, not datablock-idempotent.** `build_coco_pilot.py:32–48,577–581,623`; `verify_coco_pilot.py:129–133`. Each configure call creates a new world; cleanup excludes worlds. The unused `CheekWarmth` material is also created every build but never assigned, so the cleanup's collected-material list misses it. Repeated in-session rebuilds can retain these orphan blocks while the owned-object count remains 89. No demonstrated current render or preservation failure; clean owned orphan worlds/materials before scaling repeated tooling.

**M2. Eye blink assertion covers only left control.** `verify_coco_pilot.py:65–67`. Both controls are recorded and builder keys both, and the actual frame-12 image shows both squashed; thus delivered proof is adequate. The boolean could miss a future right-control regression. Extend the assertion when modifying blink behavior; no need to rerun unchanged baseline merely for this review.

**M3. Door rail end faces are conspicuously black.** `renders/desktop-frame-01.png`, `renders/mobile-frame-01.png`; README unresolved item 7. Small environment-quality fault, correctly disclosed.

## Scope boundaries and verdict

The minimal head-turn, eye-scale blink and welcome-wing controls satisfy the prototype control requirement, supported by frames 1/12/24. They are **not** a full production rig: no modeled lids, skinning, eye aim, expression system or weight-shift controls are evidenced. The door and door-side wing are fixed; the tiny handle-surface distance supports static proximity only. It does **not** prove animated opening/contact solving or collision-free motion. Those features and the final 96-frame animation were explicitly outside this gate.

Save/reopen and tested unrelated-collection preservation have suitable existing evidence. No additional blocking technical evidence gap was found. Keep the frozen source as a valid technical baseline; require the focused eye/mask/groom/transition revision to pass visual review before accepting Coco or expanding to the full crew. No claim is made about Astra's unfinished revision.

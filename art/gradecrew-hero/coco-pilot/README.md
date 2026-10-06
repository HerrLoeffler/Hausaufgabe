# GC-DESIGN-05 — Coco and door, Sol pilot

This is a real, locally rendered, editable Blender prototype. **The visual
quality gate is not passed.** Keep it as the inspectable Sol baseline for a
focused face/material review; do not start full crew production from it.

The source has actual head/body meshes, shallow eye geometry, a shaped beak,
flippers, toes, covered ankles and approximately 39,500 seeded curved down
strands. The wooden door, room, floor, lights and cameras belong to the same
scene. There are no billboard cutouts, bitmap materials, baked words, purchased
assets or paid provider calls. Remy/Emmi/Wilma are hidden spatial placeholders.
The old provider attempt history and its reserved budget were not touched.

## Files and current evidence

- `build_coco_pilot.py`: deterministic builder, seed `20261006`.
- `coco-door-pilot.blend`: approximately 2 MB editable source, saved before
  rendering and reopened in a fresh process. Own scene `GC_CocoPilotScene`, own
  collection `GC_CocoPilot`. The factory scene is retained separately.
- `renders/desktop-frame-01.png`: 1200 × 800, quiet right region for future HTML.
- `renders/inspection-frame-01.png`: 900 × 1000, face and proportions inspection.
- `renders/mobile-frame-01.png`: 720 × 1080, full head and feet included.
- `renders/pose-frame-{01,12,24}.png`: three actual control poses, 540 × 640.
- `renders/side-frame-01.png`: 800 × 900, inferred side geometry inspection.
- `build-evidence.json`, `verification-evidence.json`, `artifact-manifest.json`
  and `attempt-history.json`: actual settings, behavior checks, hashes and limits.
- `verify_coco_pilot.py`: fresh-open checks, desktop rerender, collection-safe
  double rebuild. Temporary scenes are written into ignored `_verification/`.
- `diagnose_material.py`: preserved one-variable sheen/specular diagnostic;
  it renders without saving the opened source.

## Verified toolchain and commands

Actual application: Blender **5.2.2 LTS**, build hash `d13f752e3b9c`, built
2026-09-15 01:49:19. This pilot used **Cycles CPU**, 48 samples, denoising, AgX
Medium High Contrast, exposure −0.10, 24 fps. No external Python dependencies
are needed; run through Blender's bundled Python.

Run from the repository root. On this macOS host the verified application is:

```sh
BLENDER='/Users/martin/.codex/.chatgpt-projects/g-p-6ab1877c30108191b2aabf44e8bf23e4/.gradecrew-tools/apps/Blender.app/Contents/MacOS/Blender'
"$BLENDER" --background --factory-startup \
  --python art/gradecrew-hero/coco-pilot/build_coco_pilot.py \
  -- --render all --samples 48
"$BLENDER" --background art/gradecrew-hero/coco-pilot/coco-door-pilot.blend \
  --python art/gradecrew-hero/coco-pilot/verify_coco_pilot.py
```

The verified background processes required narrowly approved macOS runtime
access outside the default sandbox. They were separate from the coordinator's
GUI/MCP proof and did not connect to or alter that scene. `--engine BLENDER_EEVEE`
is available as an unverified preview option; the delivered proofs are Cycles.
`--render desktop|inspection|mobile|poses|all|none` and `--output PATH` control
output. Final seven-view render batch took approximately 30.15 seconds in the
Blender log; the fresh-process desktop proof took approximately 6.55 seconds.
These are local pilot timings, not a production animation estimate.

The builder replaces only its named collection inside its own scene. It
does not delete every open object. Verification explicitly created an unrelated
scene/collection/object and an unreferenced `GC_` material and retained them
through two rebuilds. 21 behavior checks passed, 0 failed. The reopened PNG
was successfully rendered, but was **not byte-identical** to the first desktop
PNG; both hashes are recorded. No claim of exact rendered image identity is made.

## Controls and useful checks

`GC_CTRL_CocoRoot` places Coco. `GC_CTRL_HeadTurn` turns about the neck;
`GC_CTRL_Blink_L/R` compress the eye groups; `GC_CTRL_FlipperWave` moves the
welcome wing. Frames 1, 12 and 24 demonstrate open eyes, blink/head turn, and
reopened eyes with a different wing position. The fixed door-side wing meets
the fixed knob; there is no animated door opening solver.

The three main cameras contain the evaluated head, feet and welcome flipper.
Lowest foot surface is approximately z=0.003; feet do not slide across the tested
frames. The body overlaps its covered ankles, which overlap the feet. The nearest
door-wing/knob surface distance is approximately 0.000195 scene units. These
measurements support the prototype's contacts; they do not substitute for
visual review or prove collision-free production animation.

## Identity sources and explicit assumptions

Canonical reference inspected before modeling:
`analysis/GC-DESIGN-05/reference-assets/penguin-guide.webp` in the parent project
workspace. The supplied screenshot was inspected for door/foreground/light
composition. Canonical navy, warm ivory fields, dark brown eyes, orange beak and
feet, rounded head, plump body and flippers take priority over screenshot
accessories. No scarf, glasses or backpack were added. Side/back forms and the
door-contact pose are inferred because no canonical 3D source was supplied.

## Unresolved visual and rig limits — do not call this accepted

1. One eye catches a large pale/grey reflection, so both eyes do not read
   consistently as the canonical dark eyes. The eye/sclera relief is still
   visibly layered on the face, especially in the close-up and side view.
2. The central navy forehead tip ends in a squared U. The cream lobes are more
   curved than the initial attempt, but the mask still needs character artwork.
3. Geometry fur looks sparse and stiff, especially against the ivory surface;
   it does not reach the reference's dense, soft, directional fluff.
4. The broad head/body shapes and beak remain a scripted prototype. Some body
   transitions and the welcome wing silhouette need a character artist pass.
5. Blink uses a scale squash; modeled eyelids, eye aim controls, expression
   shapes, deformation skinning, feet weight shifts and contact-aware door
   animation are not implemented. There is no final 96-frame clip.
6. Room dressing is minimal. Mobile keeps Coco intact but allocates a large
   quiet upper area; actual HTML/mobile layout has not been built or tested.
7. Dark end faces remain visible on the top door-frame rail. This should be
   checked during room/material refinement rather than hidden in a final crop.

The coordinator reviewed three actual render rounds and stopped further Sol
look-development at this baseline. The concrete eye/mask/fur limits justify
the user-authorized focused Astra review. A model change is not a guarantee
of final quality. No staging, production deploy, push or PR was performed.

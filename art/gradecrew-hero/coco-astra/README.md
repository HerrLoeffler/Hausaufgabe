# GC-DESIGN-05 — Coco, bounded Astra refinement

An editable local Blender refinement of the Sol source at
`6f085c70a929156e4b0440f7ef2736ac0df28131`. The original `coco-pilot/` is retained.
**Visual master gate: NOT PASSED.** This source is an improved prototype for
comparison and a future character sculpt pass, not approved website artwork.

## What changed and why

- Eye surfaces now follow the actual curved head surface. The sclera no longer
  uses a raised ellipsoid; its center sits approximately 0.0023 scene units
  above the head. Dark iris/pupil geometry remains shallow. Specular is reduced
  to keep both eyes dark. Small highlights and an upper lid follow the surface.
- The former square-bottom forehead patch is replaced by rounded cream lobes
  and a tapered navy wedge. Slightly different left/right lobes and a small
  head tilt reduce symmetry. Cream coloration stays on the actual head mesh.
- Approximately 181,000 candidate strands, excluding eye areas, replace the
  39,500-strand baseline. Curved, downward laid, tapered four-point fibers are
  thinner and denser, with longer chin fibers. No raster fur or whole-image blur.
- Navy is richer. Orange beak/feet have less specular whitening. Upper chest
  depth is adjusted to improve the head/body transition, though the remaining
  junction still fails the intended sculpt quality.
- Rebuilding reuses the owned World. The unused blush material is no longer
  allocated. Unrelated scenes, objects, collections and materials are retained.

## Source and images

`build_coco_astra.py` builds real surfaces, curve fibers, lights, room, controls
and cameras. `coco-door-astra.blend` is the saved editable source. The default
scene is `GC_CocoAstraScene`, owned collection `GC_CocoAstra`; factory scene
is retained separately. No reference image texture, billboards, baked text,
paid provider calls, accessories, finished crew or website implementation.

The `renders/` directory contains desktop (1200 × 800), inspection (900 × 1000),
mobile (720 × 1080), side (800 × 900), and frames 1/12/24 (540 × 640).
`reopened-desktop.png` is the separate-process rerender. Inspect it together
with `verification-evidence.json`; technical checks do not approve likeness.
All 25 technical checks passed, including evaluated geometry for both blinking
eyes. The reopened image is not byte-identical; both hashes are retained.

Canonical identity source: parent project's
`analysis/GC-DESIGN-05/reference-assets/penguin-guide.webp`, visually inspected.
User's supplied screenshot was inspected for scene composition. Side/back
shape and door pose remain inferred from 2D references.

## Reproduction

Verified local application: Blender 5.2.2 LTS, build `d13f752e3b9c`.
Final views use Cycles CPU, 64 samples, denoising, AgX Medium High Contrast,
exposure −0.10, fixed seed 20261006, 24 fps. No external Python packages.
From the repository root:

```sh
BLENDER='/Users/martin/.codex/.chatgpt-projects/g-p-6ab1877c30108191b2aabf44e8bf23e4/.gradecrew-tools/apps/Blender.app/Contents/MacOS/Blender'
"$BLENDER" --background --factory-startup \
  --python art/gradecrew-hero/coco-astra/build_coco_astra.py \
  -- --render all --samples 64
"$BLENDER" --background art/gradecrew-hero/coco-astra/coco-door-astra.blend \
  --python art/gradecrew-hero/coco-astra/verify_coco_astra.py
```

Background runs require narrowly approved local Blender runtime access on
this host because the default sandbox crashes when Blender opens scenes.
They do not connect to the coordinator's GUI/MCP scene or change global config.
The builder saves before rendering and after returning to frame 1. It supports
`--render desktop|inspection|mobile|poses|all|none`, `--samples` and `--output`.
Verification rebuilds go to ignored `_verification/`; intermediate render
comparisons are in ignored `rounds/`, not additional production assets.

## Remaining gate failures and rig limits

1. Canonical Coco has a more organic expressive face and sculpted cheeks.
   This head remains a simplified ellipsoid with a mathematically smooth mask;
   the white eye area retains a faint edge in some views.
2. The head/body junction remains visible. More coherent fur improves the
   surface but does not replace anatomically coherent sculpting and shoulders.
3. The fibers now read more like velvet/plush; the canonical atlas has varied
   soft clumps and richer directional down. Further parametric noise is not
   a substitute for an authored groom and character sculpt.
4. Blink still scales the eye group. Closed-eye frames reveal the smooth,
   ungroomed eye region; no deforming eyelid covers the eyeball. The head and
   flipper transform controls work, but no production facial rig is claimed.
5. Feet/ankles and the two-part beak remain simplified. Warm orange still needs
   the final sculpt/material/light review in the complete hero scene.
6. The scene is a minimal room with black end-face artifacts on the door top
   rail, hidden crew placeholders, and a fixed door. No contact-aware door
   opening or long animation exists. Mobile layout is a framing study only.

Three focused visual rounds were used. No fourth refinement, paid API run,
web implementation, deployment or source replacement was performed. The next
useful step is a unified head/neck/shoulder sculpt and retopology, plus
deforming lids and matching groom masks. Preserve the cameras, room, door and
render pipeline. This requires a different modeling step, not a mandatory paid
service. Compare front, three-quarter, profile and blink poses before acceptance.

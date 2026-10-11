# Level1 implementation — GC-GAMES-LERNINSEL-LEVEL1-PLAN-20261011

Spiel: Lerninsel. Parent GC-GAMES-ESCAPE-VISUAL-01; L1-history GC-GAMES-LERNINSEL-L1 preserved.
Human approval 11.10.2026: build approved PR219@5315f67; profile S, deliberate stepping with E/click alternative, whole blue stones without checkmarks. No further design gate.
Owner GC · Lerninsel · Gameplay & Integration, 01a12568-0502-7831-9451-a7f8d91ce950. Own exclusive checkout work/lerninsel-l1; implementation branch feature/lerninsel-level1-reference-20261011 based on remote5315f67. Original source checkout untouched.
Fresh main startup/contract/assurance/games rules read. Development Status38141038786: game+19/-127, PR175/219 drafts; known design/.gitignore overlaps untouched. No Unreal/Blender session at start. No merge/deploy/paid provider work.
Requested Sol6.1/medium; actual runtime/usage unknown; no live model switch. A/B only on final unchanged candidate, reused existing reviewers.
Baseline portable231 passed. No new runtime result yet.

## Ledger and rulings

Plan: docs/games/lerninsel/20261011-level1/meilensteine.md and spielbrief.md.
M1/M2→M3 shared interface: terrain/physical word top and component-ID hitbinding must agree with step centre. M3→M4: one input path/profile S and same state drives HUD/menu. M2/M4→M5: safe poses, initial mode and slots selected before all loads. M5→M6: same attempt GUID and isolated continuation.
Ruling: author small native Unreal terrain/vegetation/stone scene using existing project materials and Engine basic shapes, not reconstruct a particular proprietary object/figure through Three.js. img2threejs v2.0.0 SKILL.md read for suitability. No new downloaded assets/figures/paid images; source geometry will be inspectable and native. Cost if wrong: scene art may still require later manual polish, explicitly judged in real camera.
Tasks M1/M2/M3/M4/M5/M6 active/pending; M7 A/B final once; M8 local reviewable delivery. Save old modes intact; no ET/shared/backends/normal map edits.
Next: RED→GREEN profile/step guards, then native geometry and map binding.

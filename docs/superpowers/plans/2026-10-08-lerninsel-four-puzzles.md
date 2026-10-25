# Lerninsel Four Puzzle Prototype Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans task-by-task. Martin explicitly authorizes reviewing the existing basis, learning from PR171 and building the prototype in this chat. This continues the existing task, worktree and DraftPR175.

**Goal:** Complete a coherent first-person prototype with verb path, sentence order, exact fraction routing, observation-window search and the corrected one-liter bucket.

**Architecture:** Existing tested Island state owns durable milestones; new pure puzzle definitions own sentence/route/find selections and alignment. Unreal focus and world actors bridge named actions, never bypass prerequisites. Art, UI and saved data remain distinct and independently testable.

**Tech Stack:** UE5.8.3 C++, portable C++17 checks, native editor automation and original procedural art; built-in imagegen reference boards.

**Spec:** docs/games/lerninsel/20261008-production/bauvertrag.md and docs/games/lerninsel/20261007/spielbuch.md. New tenths values supersede original eighths for the first prototype water/coast tasks.

## Global Constraints

- GC-GAMES-ESCAPE-VISUAL-01; reuse feature/lerninsel-ego-v1 own isolated checkout; update DraftPR175, no duplicate implementation.
- First-person eye160cm/FOV75, no required jumping/sprinting, safe reading, limited explicit selection, immutable solved gates.
- Sentence IDs0heute,1öffnet,2derFuchs,3denEingang. Exactly four unique groups; second position1; accept all six valid permutations.
- Water1L/tenths. RoutesA5+3+2=10, B5+2+1=8, C3+2+2=7. Complete same-branch paths only; backtrack allowed, duplicate edges do not add water.
- Coast IDs0..3 tenths1,2,4,5; exactly three known finds, only mask13 sums10. Correct amount plus stand radius75cm and yaw5°/pitch7° required.
- Bucket1L target300ml/3tenths,100ml strokes. Fix carried scale/capacity labels and continuous rim; preserve normal wrong-amount pickup.
- LI2 save validates new state, accepts oldLI1 with new unsolved milestones, preserves puzzle progress on transform recovery.
- Twelve20-panel artboards remain concept references, not240assets/runtime screenshots. Image generation receipts/prompts saved; no separate providers/keys.
- No production merge/deploy, public stream server, iPad signing or physical-device claim.

## Review Focus

1. New actions reached before prior gate opens cannot silently unlock later milestones (Task1 prerequisites + Task2 actor actions).
2. Removing one middle selection/backtracking must preserve bounded valid state, never duplicate answers or solved milestones (Task1 rules + Task2 UI).
3. Pointer-down and release in different UI/focus states must not activate two actions or leave camera/movement held (Task2 controller lifecycle).
4. LI1 migration and corrupt LI2 must be atomic and retain valid completed progress at a safe pose (Task1 deserialize + Task3 saved fixtures).
5. Correct coast sum from wrong place/blick must remain unconfirmed; projection must match actual geometry (Task1 tolerances + Task3 world view).

---

### Task 1: New puzzle definitions and versioned state

**Files:** Create Source/Lerninsel/Core/IslandPuzzles.h, Tests/puzzles_test.cpp; modify Core/IslandRules.h, Tests/run.sh.

**Interfaces:** Consumes Island::State/Result/Action. Produces bool SentenceValid(array<int,4>), RouteStepAllowed(int previous,int next), RouteTenths(array<int,5>,int count), CoastTenths(int mask), bool ViewAligned(float distance,float yawError,float pitchError). Extend state with sentence/fractions/coast/finale milestones, bounded selection arrays/counters/findMask/coastMask; Apply new named actions; Serialize LI2/Deserialize supports LI1.

- [x] Write tests for six V2 permutations and invalid/duplicate/incomplete sentences; route jumps, reverse, incomplete/end, exact A/B/C sums; known versus selected coast finds, all four triples; alignment boundary/NaN; LI1 migration and atomic malformedLI2 rejection.
- [x] Run `sh games/lerninsel-unreal/Tests/run.sh`; Expected: missing puzzle header/new actions, then behavioural failures against skeletal implementation.
- [x] Implement pure definitions and new state changes using those exact datasets. Expected: existing59checks plus new cases pass.
- [x] Save checkpoint and generation attempt history before native build.

### Task 2: Four-region world and reliable interaction

**Files:** Modify IslandWorld.h/.cpp, IslandArt.cpp, IslandHUD.cpp, IslandAutomation.cpp. Create IslandPuzzleArt.cpp and IslandFocusWidget.h/.cpp as focused units. Native UMG owns required focus answers/route drag; Canvas retains only world meters/prompts. Existing map/materials retained.

**Interfaces:** Consumes Task1 named actions. Produces AIslandGameMode::PuzzleInteract(int), CanInspect(int), PreviewAligned(), ConfirmCoast(), UIAction(int), refresh for new gate/signal states; world target IDs: sentence500..503 and controls510..512; route600 and focus nodes610..620; coast700..703/finds,710selection,711alignment,712confirmation; finale800; bonus820. Gate/signal mapping must use milestones explicitly, not an index assuming only two regions.

- [x] Add native automation for action prerequisites, sentence through focus/controller, pointer hit routing, new physical gate colliders, route focus bounded nodes, coast discovery/select versus alignment, save migration and safe reload. Expected: missing runtime/new world targets fail before implementation.
- [x] Build authored rooms: garden, sentence courtyard, one-liter fountain/routing terrace, coastal observation frame and four-of-eight tower signal. Clear main/side paths; remove white corridor dominance through neutral dirt/grass/stone islands, house fronts, hedges and grounded silhouettes.
- [x] Add selectable sentence slots and explicit undo/check; route start/node/back/check UI; fund sketch-list and three-slot selection; stand/view confirmation requiring runtime pose. Keep clear UI errors and optional hints.
- [x] Add actual pointer target picking (camera ray/proximity) and UI pointer-down ownership. Esc first exits focus; focus loss/pause cancels motion and pending stroke/drag. Touch prep remains explicitly unverified on device.
- [x] Fix wrong-word persistent shape marker, portable capacity caption, sensible carried bucket framing and continuous rim.
- [x] Native Build Editor; Expected: successful DevelopmentEditor compile, actual game viewport renders all four rooms.
- [x] Commit/push partial source/art checkpoint with runtime stage and actual current failures.

### Task 3: User-route evidence, independent review and delivery

**Files:** Modify automation/README/Production/HANDOFF.md/REVIEW.md; add Reports/FourPuzzles*.png and report/verification; complete art catalog, production handbook and prompts/receipts.

**Interfaces:** Exercises normal controller/focus/pointer route into Task2 and real Task1 rules. Separate automation slot; stable save migration and four-signal finale.

- [x] Run full pure rules/puzzles suite and UE GradeCrew.Lerninsel suite. Expected: all relevant checks pass, no errors. Inspect warnings and preserve trial history.
- [x] Capture real arrival, sentence, route/becken, coast alignment and carried bucket screenshots; inspect world readability, actual signal count and physical geometry. A teleported fixture proves integration, not first-play usability; document distinction.
- [x] Run one fresh full-range read-only reviewer using executing-plans/requesting-code-review. Fix important findings with reproducing regressions, then full suite.
- [x] Commit exact map/source/reports/artboards and complete handoff; synchronize using connector expected refs; read back whole runtime tree and image hashes. DraftPR175 updated/attached, central TODO/state/handoff reflect branch_only and current source/test evidence.
- [x] Final report states what is playable, exact validations and mobile/browser/art limits. Preserve worktree/starter for user play. No integration or deployment.

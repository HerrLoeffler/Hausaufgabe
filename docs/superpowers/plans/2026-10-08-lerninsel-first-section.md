# Lerninsel First Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Martin explicitly authorizes self-check followed by autonomous building in this chat.

**Goal:** Build and verify a first playable UE5.8 ego section with arrival, verb garden and corrected one-liter bucket terrace.

**Architecture:** Pure C++ rule state owns answers, selection limits and persistence validation. Unreal character/controller own movement and input; game mode bridges interactions to rule state. World construction and HUD are separate from rules, built from original procedural geometry and generated local materials.

**Tech Stack:** UE5.8, C++17 portable rules tests, UE C++ automation, editor Python map/material creation, Xcode Mac build.

**Spec:** docs/games/lerninsel/20261007/spielbuch.md and docs/games/lerninsel/20261008-recheck.md.

## Global Constraints

- GC-GAMES-ESCAPE-VISUAL-01; dedicated feature/lerninsel-ego-v1 checkout, paths games/lerninsel-unreal only for runtime.
- Eye height160cm, FOV75, WASD/mouse, E interactions, Escape focus then pause, no jumping requirement.
- Bucket1L, steps100ml, ten equal volume intervals, target300ml. No arbitrary physics weight validation.
- Intro probe exactly two verb selections from laufen/Baum/singen/blau; main path singt/sucht/öffnet in row order.
- No public deploy, signing, original-game assets or paid provider calls. iPad/browser integration remains separately unverified.
- Successful gates persist once; default save uses own slot LerninselV1; automation uses separate slots.

## Review Focus

1. Wrong-row or duplicate plate must not add progress (Task1 rules, Task3 actor test).
2. Holding/strafing across tile edges must not commit multiple answers (Task2 contact dwell + Task3 automation).
3. Touch finger released/cancelled during focus must stop motion and leave bucket fill unchanged (Task1 ownership + Task3 simulation).
4. Corrupt/out-of-range saved amounts cannot open gates (Task1 deserialize + Task3 saved roundtrip).
5. Confirmed success must survive undo/restart/re-entry and remain physically blocked until gate animation completes (Task1 immutable milestones + Task3 world collision).

---

### Task 1: Tested rules and project foundation

**Files:** games/lerninsel-unreal/Source/Lerninsel/Core/IslandRules.h; Tests/rules_test.cpp; Tests/run.sh; Lerninsel.uproject; Source targets/module; Config/*.ini.

**Interfaces:** Produces Island::State, Result, Apply(State&, Action, int), Serialize/Deserialize, PlateContact::Update(tile,dt,active), TouchOwnership. Uses integer tenths and validated IDs, no UE dependency.

- [x] Write portable tests that reject all-word selection, duplicates, wrong row, wrong bucket amount, filling without carrying, corrupt saves and contact under0.30s; prove confirmed gates remain open. Verify deserialize is atomic and format-versioned.
- [x] Run Tests/run.sh; Expected: absent/missing implementation, then behavioral failures against initial skeleton.
- [x] Implement tested state changes and serialization; run complete suite. Expected: all behavior cases pass.
- [x] Create UE project/config with own save/map/module names and ProceduralMeshComponent plugin; commit checkpoint.

### Task 2: Character, interaction and authored world

**Files:** Source/Lerninsel/IslandWorld.h/.cpp, IslandArt.cpp, IslandHUD.cpp; Tools/create_world.py; Tools/build_editor.sh.

**Interfaces:** Consumes Task1 rules. Produces AIslandGameMode with State, BuildWorld(), RefreshWorld(dt), Interact(id), Save(), Load(), Focus state; AIslandCharacter, AIslandController and AIslandHUD. World target IDs are bounded and proximity checked in Interact, regardless of caller. No UI answer from camera drag.

- [x] Write UE automation fixtures for eye height/collision, interaction distance, pause cancellation, closed gate blocking, contact, exact bucket visible levels and save roundtrip before runtime implementation.
- [x] Build to show fixtures fail to compile against absent runtime, then implement runtime/world/HUD using rule APIs.
- [x] Native movement uses ACharacter capsule; world paths/floors/walls have collision. Gates swing and disable collision only after1.4s. Bucket can be held/placed; fountain and drain operate one confirmed100ml stroke at a time. Gauge geometry exactly ten equal sections, labels1/10..10/10.
- [x] Original trees use irregular layered leaf geometry and visible branch structures, limestone terraces, iron gates, thin copper/mint cables, blue sea and tower with eight windows. First art pass must be screenshot-reviewed; keep word floors clear.
- [x] Generate map/materials via editor Python; build Development Editor. Expected: successful compile, valid /Game/Maps/Lerninsel map.
- [x] Commit/push functioning checkpoint before longer automation.

### Task 3: Play verification, review and delivery

**Files:** Source/Lerninsel/IslandAutomation.cpp; Tests/world-layout checks as needed; Production/HANDOFF.md; Reports/*.json/.png; README.md; Lerninsel starten.command.

**Interfaces:** Exercises runtime from Task2 and real portable rules from Task1. Screenshots from actual UE world, distinct from concept boards. Tests reset their own slot and leave user's save intact.

- [x] Run portable suite and GradeCrew.Lerninsel automation in editor. Expected: no test failures; screenshots and report from this exact runtime.
- [x] Inspect arrival, verb room, fountain/gauge and opened gate screenshots. Fix material, readability or framing defects supported by evidence.
- [x] Verify controller focus/escape and touch ownership; document actual platform limits. A desktop synthetic test is not an iPad test.
- [x] Request one fresh whole-branch code review through executing-plans/requesting-code-review. Fix important findings with regression test, rerun relevant suite.
- [x] Commit source, map/material and concise handoff; push dedicated branch and attach draftPR to main. Record branch_only with actual local build/tests, not ci_green. Update central registry/TODO/state without changing web release train.

## Explicit implementation boundary

Satzweg, main Bruchwasser routing, Felsfenster, four additional biomes, mature audio/leaf animation, final tree asset detail and native/published browser deployment are subsequent tasks. They are not counted as implemented by this plan. User asks to begin building after audit; this first section is the concrete authorized start.

# Bruchpizzeria Browser Pilot Implementation Plan

> For agentic workers: Use superpowers:executing-plans. Execute task by task and keep HANDOFF.md current.

**Goal:** One complete, friendly browser restaurant shift where the player cuts and serves halves and quarters.
**Architecture:** Pure geometry and shift state are independent of Phaser. Phaser draws the kitchen and moves the chef; accessible HTML controls and an SVG cutting board expose the same game actions. Static build with vendored Phaser, no remote runtime requests.
**Tech Stack:** Phaser 3.90.0, JavaScript modules, SVG, Node built-in tests and static build/server.
**Spec:** ART_DIRECTION.md and the existing GC-GAMES-PIZZA-01 briefing.

## Scope and authority

User approved the presented one-room browser test with “checke unsere abfolgeliste … lege los” on 07.10.2026. Routine decisions proceed within that scope. One developer builds this small pilot; one independent reviewer checks the whole delivery. No new paid APIs, accounts, backend writes, Production or other game changes.

Browser-first, touch plus mouse/keyboard, local public practice data. A whole pizza remains the reference. Cuts determine actual polygon areas; unequal parts cannot be certified as equal fractions. Motor tolerance is 0.035 of the whole pizza around equal-area targets. Help, hidden tab and pause stop patience. First order has no time limit; later maximum two active orders with 100 seconds patience, preserved on reload. Four served orders complete a shift; guests never insult or punish learners.

## Engine decision

Same criteria: browser delivery, small scene, touch integration, testable learning model and build burden. Phaser 9/10: web-first 2D framework and easy local JS testing; art is our responsibility and this is not full 3D. Godot 7/10: strong scene editor, but extra WASM/WebGL2 export workflow for this pilot. Choose Phaser with original vector artwork and shallow perspective. Sources checked 07.10.2026: https://docs.phaser.io/phaser/getting-started/what-is-phaser and https://docs.godotengine.org/en/stable/tutorials/export/exporting_for_web.html . Scores are engineering estimates, not measured device performance.

## Review focus

- Unequal cuts, empty plate or duplicate selections never count as correct learning.
- Correct equivalent amounts are accepted independently of number of slices.
- Help/background/refresh cannot consume patience or erase a valid work-in-progress.
- Wrong customer and double serving cannot advance the shift twice.
- Pointer cancellation, small screens, blocked storage and keyboard-only use remain recoverable.

## Task 1: Learning and shift model

Files: src/pizza.mjs, src/shift.mjs, tests/model.test.mjs.
Interfaces: wholePizza(), cutPizza(polygons,start,end), portion(polygons,indices), evaluatePortion(polygons,indices,target); newShift(), takePizza(state), applyCut(state,start,end), selectSlice(state,index), platePizza(state), serve(state,orderId), tick(state,seconds), restore(raw).

- [x] Write behavioral tests for halves, quarters, unequal/off-centre cuts, equivalents, wrong guest, finite inputs, patience pauses, shift completion and restoration.
- [x] Run Node test suite and observe missing-feature failures.
- [x] Implement geometric clipping of a 96-sided circle against actual full stroke lines; preserve area, reject invalid/short strokes and more than four portions.
- [x] Implement pure state transitions, immutable inputs and versioned validated restoration. Record wrong servings as learning feedback, not progress.
- [x] Run complete scoped test suite; commit checkpoint.

## Task 2: Complete kitchen and cutting interaction

Files: index.html, styles.css, src/main.mjs, src/kitchen.mjs, src/art.mjs, tools/build.mjs, tools/server.mjs, tests/browser.cjs.
Consumes Task 1 exports. Produces static dist and a playable ordinary start.

- [x] Write browser tests from normal start: take pizza, walk to board, drag two orthogonal cuts, select two quarters, plate, serve half order, receive next guests; pause/help, reload and narrow layout.
- [x] Run before UI exists and observe failure.
- [x] Build original vector kitchen, chef/guest sprites, movement with contextual stations, friendly reactions, animated oven, sound toggle and reduced-motion support.
- [x] Add touch/mouse SVG cutting with capture/cancellation, selectable wedges, undo/reset, keyboard cut-angle fallback and same actual geometry.
- [x] Preserve state locally after actions; visibly report unavailable storage; no fabricated server progress.
- [x] Run tests against built static artifact; inspect desktop and touch screenshots, correct concrete faults; checkpoint.

## Task 3: Review and delivery

- [x] One fresh reviewer checks geometry, lifecycle, browser behavior, scope and build reproducibility.
- [x] Fix important findings with tests and rerun affected checks.
- [x] Update TODO/registry/handoff and branch evidence; save via GitHub connector (CLI lacks credentials) and open draft PR158.
- [x] Open local build for Martin. State missing physical iPad, visual/user acceptance and remote deploy explicitly.

Budgets: target 60 fps desktop and 30 fps weakest agreed tablet; initial build <3 MiB and no external assets. Device model remains unspecified; emulated touch is not physical-device acceptance. Curriculum-specific alignment is later, since Bundesland/Schulart are not given.

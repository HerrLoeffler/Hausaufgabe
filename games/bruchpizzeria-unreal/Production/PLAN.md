# Unreal Bruchpizzeria Implementation Plan

Task GC-GAMES-PIZZA-01, 07.10.2026. User replaces rejected browser pilot with Unreal5 mobile cooking game inspired by Overcooked2. Prior browser PR158 and attempt history preserved; no iteration on that rejected game.

## Binding scope

Native Unreal5.8.3 on installed Apple M5Pro/48GB, Xcode27. Initial request mobile landscape; user07.10 follow-up removes controller/leftstick. Current desktop verification uses WASD and actual mouse cutting; mobile movement design/device gate remains open. Fixed perspective camera, physical kitchen collisions, animated chef, carried items, ingredient stations, baking, actual fractional slicing down to1/8, serving and frozen guided tutoring after mistakes. Original stylized assets. No external/open-source gameplay library, no provider API, no Production. Unreal built-in modules only; Blender optional if its executable can be verified. Blender is not yet located despite filesystem checks; do not pretend an export occurred.

Browser-only requirement superseded by the explicit native Unreal request. Local Mac/editor verification first; signed iOS/Android device delivery remains a separate platform gate, not inferred from local play.

## Reference acceptance

Sources: Team17 Overcooked2 official gallery and the user's two screenshots. Fixed oblique view, chunky rounded counters, readable narrow routes, bright contrasting chef silhouettes, strong shadows, warm/cool material contrast and restrained order HUD. The kitchen fills the frame. Interaction happens at stations inside the world. Carry/drop/bake/chop/serve must have visible feedback and weight. One attractive complete room is the first deliverable; no world expansion before native scene review. No extracted original game art.

## Units and interfaces

Source/Bruchpizzeria/FractionRules.h: standard C++ only; rational arithmetic, radial diameter strokes, unequal-parts rejection, selected fractions and contextual learning steps. Independent tests compiled with clang++.
Source/Bruchpizzeria/KitchenArt.h/.cpp: native Unreal meshes/material helpers and kitchen/chef/pizza parts. One art author; no shared editor sessions.
Source/Bruchpizzeria/PizzaKitchen.h/.cpp: native game mode, direct-control chef, fixed camera, station state, orders, timers, cut and tutoring pause. Main author.
Source/Bruchpizzeria/PizzaHUD.h/.cpp: in-game HUD, touch movement/action buttons, fraction-cut overlays and learning choices. Main author.
Tools/create_level.py: deterministic Unreal editor asset/material/map recipe, engine's bundled Python only. Content/Binaries/Intermediate/Saved/DerivedDataCache are generated local artefacts, not ordinary Git sources.

## Execution

- [x] Write and run failing fraction/arithmetic/learning tests; implement same core used by game.
- [x] Create native project and compile installed Unreal toolchain; record exact errors and build ID before retry.
- [ ] Original rounded 3D room and chef, PBR materials, warm lighting, station art; no raw blockout claimed final.
- [x] Direct movement/collision, carry/drop, sauce/cheese/topping, timed oven, cutting2/4/8 and serving.
- [x] Wrong fraction delivery freezes gameplay and order timers for visual portion help. Raw/wrong topping delivery produces ordinary guest complaint, no recipe modal.
- [ ] Native HUD and touch controls; desktop normal start and visual/play validation in actual Unreal.
- [ ] Independent review, save source/recipe/verification and draft PR; actual native device packaging only with verified platform/signing prerequisites.

Review focus: no advancing order on wrong fraction; unequal cuts never labelled equal; arithmetic division by zero handled; pause really freezes kitchen/bake/customer clocks; touch and keyboard remain usable in learning; eight slices distinguishable; no input routed behind lesson. Minimum target30fps mobile,60fps Mac, unmeasured until native run. No invented graphic score or physical-device acceptance.

User acceptance correction07.10: native start hit-test subtracts constrained scene origin; generous mouse gestures snap ordinary offsets and angles; extreme cuts use real convex-polygon clipping and preserved chord boundaries in all topping layers. Controller/leftstick removed. Runtime font and highDPI clarify text.182core/sanitizer checks; new native HudPointer/MouseCutting gates; actual hardware user check requested because CUA proxy pointer is constant in this UE/Mac setup.


Superseding user correction07.10: see LEARNING_CAMPAIGN.md. Ten playable locally saved profiles and ten distinct station arrangements;20 possible later,100 superseded. Abstract forced quiz chain removed. Visual same-whole plate repair on wrong delivery; no points for help alone, actual re-serving required. Two safe preparation tables; second oven from6. Calm topic introductions; sparse plus8/9 and reachable minus10. Multiply/divide postponed. Fresh native suite/hardware/learning-transfer acceptance separately recorded, no old tests attributed to new runtime.


Customer/billing correction07.10: kitchen accepts incomplete/baked/plated pizza states and early oven pickup; raw/unequal/whole service reaches customer evaluation. Explicit ingredient complaints, no fabricated correction; mushroom station/orders start4. Nonblocking itemized bills, no pay for any rejected dish, persistent local cash, time-based20%/10% tips, shift total. Prices/rounding/timing in LEARNING_CAMPAIGN.md. Native behavior/red evidence and independent bounded review retained in HANDOFF; normal hardware acceptance remains separate.

Menu follow-up: Esc/button from cooking/cutting/learning opens paused Continue/Restart current shift/Level selection. Continue preserves exact cutting/help state, restart resets transient kitchen but retains cash/unlocks, end screen also offers Level selection. Paused E/repair input guarded; menu buttons use same verified HUD view origin. MenuRed6 behavioral failures retained; new native Menu test plus existing full suite, actual NativeMenu screenshot and bounded review are the verification gate.


Superseding customer feedback correction: no live portion editing/automatic correction in modal. Target order plus Understood/E (preserve actual dish for real station repair) or Give anyway/F (consume dish, replace order, zero pay/progress). All rejected types use this choice. Compact right-side bill auto-hides after2active seconds, including Finished; review/menu holds visibility time. Static fraction recipe boards removed. Third level5ticket is now7/8, fixing unreachable learning content. Existing core/guest/menu tests adjusted to physical correction. No rats/guest AI/upgrades/story added; current gameplay-depth assessment5/10, not overallGradeCrew.

Explicit plates: KitchenSupplies fees100/200/300/100c bounded to bank; PizzaInventory owns physical item/service/wash/disposal transfers. Unlimited pile beside sink, additive newest topping,16stations, exact guest meal3active seconds, washing7+gates bay/final cleanup. Cleanup mask retains all bays through dish forwarding. Empty plate E pickup and NextLevel intro regression. No rats/newingredient catalog/provider/Production. Whole-change review3Important then one TDD fix pass; final11suite pending.

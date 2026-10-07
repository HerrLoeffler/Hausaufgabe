# Unreal Bruchpizzeria Implementation Plan

Task GC-GAMES-PIZZA-01, 07.10.2026. User replaces rejected browser pilot with Unreal5 mobile cooking game inspired by Overcooked2. Prior browser PR158 and attempt history preserved; no iteration on that rejected game.

## Binding scope

Native Unreal5.8.3 on installed Apple M5Pro/48GB, Xcode27. Mobile landscape with direct joystick/touch actions; desktop keys/gamepad for local verification. Fixed perspective camera, physical kitchen collisions, animated chef, carried items, ingredient stations, baking, actual fractional slicing down to1/8, serving and frozen guided tutoring after mistakes. Original stylized assets. No external/open-source gameplay library, no provider API, no Production. Unreal built-in modules only; Blender optional if its executable can be verified. Blender is not yet located despite filesystem checks; do not pretend an export occurred.

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
- [x] Mistake freezes gameplay and order timers; contextual guided correction must finish before resume.
- [ ] Native HUD and touch controls; desktop normal start and visual/play validation in actual Unreal.
- [ ] Independent review, save source/recipe/verification and draft PR; actual native device packaging only with verified platform/signing prerequisites.

Review focus: no advancing order on wrong fraction; unequal cuts never labelled equal; arithmetic division by zero handled; pause really freezes kitchen/bake/customer clocks; touch and keyboard remain usable in learning; eight slices distinguishable; no input routed behind lesson. Minimum target30fps mobile,60fps Mac, unmeasured until native run. No invented graphic score or physical-device acceptance.

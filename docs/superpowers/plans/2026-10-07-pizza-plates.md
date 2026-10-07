# Bruchpizzeria plates, supplies and disposal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. One gameplay writer and one final fresh review.

**Goal:** Unlimited supplies, actual plate items beside sink, later washing, irreversible topping addition, charged disposal and visible guest delivery.

**Architecture:** Extend FKitchenPizza with HasPizza/HasPlate/DirtyPlate, ReturnBay and ordered topping layers. Optional slots carry food or plate-only. Orders own stable Bay IDs. GuestMeals/EatTimes/NeedsWash own delivered snapshots;7+bay waits for dirty plate cleanup or paid replacement.

**Tech Stack:** Unreal5.8.3 native C++, original engine geometry helpers, no additional library/provider.

**Spec:** Current user request and Production/LEARNING_CAMPAIGN.md additions. SameGC-GAMES-PIZZA-01/feature/bruchpizzeria-unreal-v1/PR160. Maineb2d42d imported preserving foreign work.

## Global Constraints
- Unlimited supplies of current tomato/cheese/mushroom and clean plates, not an infinite new ingredient catalog.
- Ingredients add/reorder latest visibly on top, never remove or magically repair.
- Clean empty plate combines with dough/pizza; correct serving requires food on clean plate.
- Zero selected pieces: keep food at board, take only empty plate with explicit feedback.
- Delivered exact dish visible3active seconds;7+dirty plate persists and blocks that bay until wash or paid disposal; final cleanup required.
- Sink accepts only empty plates;3active seconds wash, early pickup stays dirty. All processing freezes in menu/guest reminder.
- Waste tariffs100c dough/200c topped raw/300c baked food/100c empty plate. Charge min(nonnegative cash,tariff), persist actual cost, no negative wallet.
- Food disposal preserves attached plate; plate-only disposal removes it and releases associated bay.
- Each level introduction names its change; calm7introduces washing.
- Preserve E/Fwrong-delivery choice, cash/unlocks, attempts/budget and separate PIE saves. No Production/device/learning-transfer claim.

## Review Focus
- Occupied sink/board/table and full hands preserve both items.
- Second bay/stale handover cannot consume another customer's dish or duplicate payment.
- Empty plate/selection must not lose original pizza or fabricate food.
- Last dirty dish gates completion; paused eating/washing cannot finish early.
- Zero wallet and actual-fee totals remain honest after restart.

### Task 1: Evidence and economic rules
Files: KitchenSupplies.h, Tests/supplies_test.cpp, PizzaInventoryAutomation.cpp, Tests/run.sh.
Interfaces: WasteCharge {Cost,CashAfter}; TrashFee(bool hasPizza,int ingredients,bool baked,bool hasPlate); ChargeWaste(int cash,int tariff); WashingLevel(int).
- [x] Write baseline regressions: repeat topping persists, newest sauce renders above cheese, actual crust reaches guest, empty selection retains board food.
- [x] Run InventoryRed and supplies RED; compare guarded behavioral failures.
- [x] Implement fee/charge/washing rules; all pure tests0fail; commit/evidence.

### Task 2: Physical items/actions/art
Files: PizzaKitchen.h/.cpp, new PizzaInventory.cpp, LearningCampaign.h, KitchenArt.cpp, PizzaHUD.cpp.
Interfaces: item fields HasPizza=true/HasPlate=false/DirtyPlate=false/ReturnBay=-1/LayerOrder; AddIngredient(int), Portion(). Game::UseDough(),UseBoard(),TakeBoard(),LeaveBoard(),UsePlateStack(),UseSink(),UseTrash().
Layout16stations:13plate(220,-405),14sink(404,-382),15bin(-410,-390).
- [x] Extend interface fixtures/tests for unlimited pickup, insertion order, occupied slots, empty plate/board transfer, category waste fees, dirty wash/early pickup/pause.
- [x] Implement explicit actions and insertion-ordered visual layers, separate plate rendering.
- [x] Render original pile/bin/sink labels, board pickup/exit, updated per-level introduction.
- [x] Build/run dedicated inventory test; commit and preserve failure history.

### Task 3: Guest dishes and wash progression
Interfaces: Order::Bay; CompleteDelivery(int orderIndex),UseGuest(int bay),AdvanceService(float),CheckShiftComplete(); GuestMeals/EatTimes/NeedsWash/visuals, Sink/WashTime,DisposalCosts.
- [x] Test exact transfer, delayed replacement, second bay, dirty pickup/lock, wash/paid replacement, final cleanup.
- [x] Allocate free stable bays, transfer snapshot, eat3s then dirty plate7+, wash3s clears ReturnBay debt, permit replacement/win.
- [x] Adapt legacy fixtures to real plates and completion of meal/wash between rapid test deliveries.
- [x] Build/run entire native suite and inspect plates/guest dish/wash/waste/intros renders.
- [x] Fresh bounded review; fix Important/Critical with failing regression and green suite.
- [x] Save verified source/receipt, normalFFupdate existingPR160, normal launch if unlocked.

## Execution rulings
User authorized direct implementation; generic skill approval pauses do not override this. Existing handoff/run-history is the persistent ledger, same task/worktree/budget. No new external task. Empty plate remains a possible mistaken delivery, with original board food retained.

## Verified execution ledger
InventoryRED4/APIRED13, suppliesRED32, timingRED1 and reviewerPlateEdgesRED3 observed. Final890core/11native checks pass. One corrective pass preserves cleanup mask, board plate pickup and NextLevelintro. All10capsule approach routes pass; source/publication receipt external.

Rulings: unlimited is existing ingredient/cleanplate supply; no invented negative debt; forwarded plate carries all associated bay obligations; physical sink fixture routes through y0north of counters. Early final delivery remains behind frozen result. Deferred minor: unused internal removal wording, not rendered. Human/device/learning-transfer acceptance separate.

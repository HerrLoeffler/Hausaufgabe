#pragma once
#if WITH_EDITOR
#include "PizzaKitchen.h"
// Complete physical eating/wash between prepared-fixture orders.
// A returned clean plate stays in hands for the next prepared fixture.
inline void FinishGuestCycle(APizzaGameMode* G){
 if(G->Finished)return;G->Tick(3.1);
 if(PizzaRules::WashingLevel(G->LevelNumber))for(int Bay=0;Bay<3;++Bay)if(G->GuestMeals[Bay].IsSet()&&G->GuestMeals[Bay]->DirtyPlate){
  G->UseGuest(Bay);G->UseSink();G->Tick(3.1);if(!G->Finished)G->UseSink();
 }
}
#endif

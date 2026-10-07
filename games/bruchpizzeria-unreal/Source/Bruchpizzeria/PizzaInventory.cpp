#include "PizzaKitchen.h"
#include "GameFramework/FloatingPawnMovement.h"
#include "Kismet/GameplayStatics.h"

void FKitchenPizza::AddIngredient(int Bit){
 if(!HasPizza||(Bit!=1&&Bit!=2&&Bit!=4))return;
 Ingredients|=Bit;LayerOrder.erase(std::remove(LayerOrder.begin(),LayerOrder.end(),Bit),LayerOrder.end());LayerOrder.push_back(Bit);
}
void APizzaGameMode::UseDough(){
 if(Frozen()||Cutting)return;
 if(Carry.IsSet()&&Carry->HasPizza){Feedback=TEXT("Deine Hände sind voll. Pizza erst ablegen.");return;}
 const bool Plate=Carry.IsSet()&&Carry->HasPlate,Dirty=Carry.IsSet()&&Carry->DirtyPlate;const int Bay=Carry.IsSet()?Carry->ReturnBay:-1;const uint32 Mask=Carry.IsSet()?Carry->CleanupMask():0;
 Carry=FKitchenPizza();Carry->HasPlate=Plate;Carry->DirtyPlate=Dirty;Carry->ReturnBay=Bay;Carry->ReturnMask=Mask;Feedback=TEXT("Frischer Teig. Zutaten hinzufügen; Teller gibt es neben der Spüle.");RefreshPizza();
}
void APizzaGameMode::UsePlateStack(){
 if(Frozen()||Cutting)return;
 if(!Carry.IsSet()){Carry=FKitchenPizza();Carry->HasPizza=false;Carry->HasPlate=true;Feedback=TEXT("Sauberer Teller. Der Stapel ist unbegrenzt.");}
 else if(Carry->HasPizza&&!Carry->HasPlate){Carry->HasPlate=true;Feedback=TEXT("Pizza auf einen sauberen Teller gelegt. Die Portion bleibt unverändert.");}
 else Feedback=TEXT("Du hältst schon einen Teller. Erst ablegen oder benutzen.");
 RefreshPizza();
}
void APizzaGameMode::UseBoard(){
 if(Frozen()||Cutting)return;
 if(Board.IsSet()&&!Board->HasPizza&&!Carry.IsSet()){TakeBoard();return;}
 if(!Board.IsSet()&&Carry.IsSet()){Board=Carry;Carry.Reset();}
 else if(Board.IsSet()&&Carry.IsSet()){
  if(Board->HasPizza&&!Board->HasPlate&&Carry->HasPlate&&!Carry->HasPizza){Board->HasPlate=true;Board->DirtyPlate=Carry->DirtyPlate;Board->ReturnBay=Carry->ReturnBay;Board->ReturnMask=Carry->CleanupMask();Carry.Reset();}
  else if(!Board->HasPizza&&Board->HasPlate&&Carry->HasPizza&&!Carry->HasPlate){auto Food=Carry.GetValue();Food.HasPlate=true;Food.DirtyPlate=Board->DirtyPlate;Food.ReturnBay=Board->ReturnBay;Food.ReturnMask=Board->CleanupMask();Board=Food;Carry.Reset();}
  else {Feedback=TEXT("Brett und Hände sind voll. Beide Gegenstände bleiben erhalten.");return;}
 }
 if(Board.IsSet()&&Board->HasPizza&&!Carry.IsSet())BeginCut();
 else Feedback=Board.IsSet()?TEXT("Teller bereit. Bringe eine Pizza zum Brett."):TEXT("Bringe Pizza oder Teller zum Schneidebrett.");
 RefreshPizza();
}
void APizzaGameMode::TakeBoard(){
 if(Frozen()||!Board.IsSet()||Carry.IsSet())return;Carry=Board;Board.Reset();Cutting=false;Feedback=TEXT("Gegenstand vom Brett aufgenommen. Du kannst ihn ablegen oder entsorgen.");RefreshPizza();
 if(auto* P=Cast<APizzaController>(UGameplayStatics::GetPlayerController(GetWorld(),0)))P->ClearInput();
}
void APizzaGameMode::LeaveBoard(){
 if(Frozen())return;Cutting=false;Feedback=TEXT("Pizza bleibt am Brett. Hole bei Bedarf einen Teller neben der Spüle.");
 if(auto* P=Cast<APizzaController>(UGameplayStatics::GetPlayerController(GetWorld(),0)))P->ClearInput();
}
void APizzaGameMode::UseSink(){
 if(Frozen()||Cutting)return;
 if(Sink.IsSet()){
  if(!Carry.IsSet()){Carry=Sink;Sink.Reset();WashTime=0;Feedback=Carry->DirtyPlate?TEXT("Noch schmutzig. Erneut einlegen und drei Sekunden spülen."):TEXT("Sauberer Teller wieder aufgenommen.");}
  else Feedback=TEXT("Spüle und Hände sind voll. Erst einen Gegenstand ablegen.");
 }else if(Carry.IsSet()&&Carry->HasPlate&&!Carry->HasPizza){Sink=Carry;Carry.Reset();WashTime=0;Feedback=Sink->DirtyPlate?TEXT("Teller wird gespült: drei Sekunden."):TEXT("Sauberer Teller in der Spüle abgelegt.");}
 else Feedback=TEXT("Nur leere Teller spülen. Pizzareste vorher im Mülleimer entsorgen.");
 RefreshPizza();
}
void APizzaGameMode::UseTrash(){
 if(Frozen()||Cutting)return;
 if(!Carry.IsSet()){Feedback=TEXT("Bring Pizza oder Teller zum Mülleimer.");return;}
 const auto Item=Carry.GetValue();const int Tariff=PizzaRules::TrashFee(Item.HasPizza,Item.Ingredients,Item.Baked,Item.HasPlate);const auto Cost=PizzaRules::ChargeWaste(Cash,Tariff);Cash=Cost.CashAfter;DisposalCosts+=Cost.Cost;
 if(Item.HasPizza&&Item.HasPlate){Carry=FKitchenPizza();Carry->HasPizza=false;Carry->HasPlate=true;Carry->DirtyPlate=Item.DirtyPlate||PizzaRules::WashingLevel(LevelNumber);Carry->ReturnBay=Item.ReturnBay;Carry->ReturnMask=Item.CleanupMask();}
 else {const uint32 Mask=Item.CleanupMask();for(int Bay=0;Bay<3;++Bay)if(Mask&(1u<<Bay))NeedsWash[Bay]=false;Carry.Reset();RefillOrders();}
 Feedback=FString::Printf(TEXT("Entsorgt: %d,%02d € abgezogen. Kasse: %d,%02d €."),Cost.Cost/100,Cost.Cost%100,Cash/100,Cash%100);SaveProgress();CheckShiftComplete();RefreshPizza();
}
void APizzaGameMode::UseGuest(int Bay){
 if(Frozen()||Cutting||Bay<0||Bay>=Level.Guests)return;
 if(GuestMeals[Bay].IsSet()){
  if(EatTimes[Bay]>0){Feedback=TEXT("Der Gast hat deinen Teller erhalten. Er ist noch beim Essen.");return;}
  if(Carry.IsSet()){Feedback=TEXT("Hände voll. Erst ablegen, dann den schmutzigen Teller holen.");return;}
  Carry=GuestMeals[Bay];GuestMeals[Bay].Reset();Feedback=TEXT("Schmutziger Teller aufgenommen. Zur Spüle bringen; der Gastplatz wartet.");RefreshPizza();return;
 }
 const int Index=Orders.IndexOfByPredicate([Bay](const FKitchenOrder& O){return O.Bay==Bay;});
 if(Index!=INDEX_NONE)TryServe(Index);else Feedback=TEXT("Dieser Platz wartet noch auf seinen gespülten Teller.");
}
bool APizzaGameMode::CompleteDelivery(int Index){
 if(!Orders.IsValidIndex(Index)||!Carry.IsSet())return false;const auto O=Orders[Index];
 if(O.Bay<0||O.Bay>=Level.Guests||GuestMeals[O.Bay].IsSet()||NeedsWash[O.Bay])return false;
 GuestMeals[O.Bay]=Carry;GuestMealNames[O.Bay]=O.Name;EatTimes[O.Bay]=3;Carry.Reset();Orders.RemoveAt(Index);RefreshPizza();return true;
}
void APizzaGameMode::AdvanceService(float D){
 bool Changed=false;
 for(int Bay=0;Bay<3;++Bay)if(GuestMeals[Bay].IsSet()&&EatTimes[Bay]>0){
  EatTimes[Bay]=FMath::Max(0.f,EatTimes[Bay]-D);
  if(EatTimes[Bay]==0){Changed=true;if(PizzaRules::WashingLevel(LevelNumber)&&GuestMeals[Bay]->HasPlate){auto& P=GuestMeals[Bay].GetValue();P.HasPizza=false;P.Ingredients=0;P.Baked=false;P.Plated=false;P.Selection=0;P.LayerOrder.clear();P.DirtyPlate=true;P.ReturnMask=P.CleanupMask()|(1u<<Bay);P.ReturnBay=Bay;for(int I=0;I<3;++I)if(P.ReturnMask&(1u<<I))NeedsWash[I]=true;Feedback=TEXT("Der Gast ist fertig. Leeren Teller holen und an der Spüle abwaschen.");}else {GuestMeals[Bay].Reset();RefillOrders();}}
 }
 if(Sink.IsSet()&&Sink->DirtyPlate){
  WashTime=FMath::Min(3.f,WashTime+D);if(WashTime>=3){const uint32 Mask=Sink->CleanupMask();Sink->DirtyPlate=false;Sink->ReturnBay=-1;Sink->ReturnMask=0;for(int Bay=0;Bay<3;++Bay)if(Mask&(1u<<Bay))NeedsWash[Bay]=false;RefillOrders();Feedback=TEXT("Teller sauber! E an der Spüle zum Abholen.");Changed=true;}
 }
 CheckShiftComplete();if(Changed)RefreshPizza();
}
void APizzaGameMode::CheckShiftComplete(){
 if(Intro||Finished||Served<Level.Goal)return;
 if(PizzaRules::WashingLevel(LevelNumber)){for(int Bay=0;Bay<3;++Bay)if(GuestMeals[Bay].IsSet()||NeedsWash[Bay])return;if(Sink.IsSet()&&Sink->DirtyPlate)return;}
 Finished=true;LevelWon=true;UnlockedLevel=FMath::Max(UnlockedLevel,FMath::Min(10,LevelNumber+1));SaveProgress();
}

void APizzaGameMode::RefillOrders(){for(int I=0;I<3;++I)MakeOrder();}

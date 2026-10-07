#if WITH_EDITOR
#include "Misc/AutomationTest.h"
#include "Tests/AutomationEditorCommon.h"
#include "Editor.h"
#include "PizzaKitchen.h"
#include "Engine/World.h"
#include "Components/PrimitiveComponent.h"
#include "GameFramework/FloatingPawnMovement.h"
#include "Kismet/GameplayStatics.h"
class FCheckInventory final:public IAutomationLatentCommand {
 FAutomationTestBase* Test;double Started=FPlatformTime::Seconds();
 public:explicit FCheckInventory(FAutomationTestBase* T):Test(T){}
 bool Update()override{
  UWorld* W=GEditor?GEditor->PlayWorld:nullptr;auto* G=W?Cast<APizzaGameMode>(W->GetAuthGameMode()):nullptr;
  if(!G||!G->Chef()||!G->CarryVisual){if(FPlatformTime::Seconds()-Started<25)return false;Test->AddError(TEXT("Inventory kitchen did not start"));return true;}
  auto At=[G](int S){const auto V=G->StationLocation(S);G->Chef()->SetActorLocation(V+FVector(S<3?110:0,0,77));G->Chef()->Movement->StopMovementImmediately();G->Use();};
  G->LevelNumber=1;G->Start();G->Carry=FKitchenPizza();At(1);At(1);Test->TestEqual(TEXT("Repeat topping use adds without removing ingredient"),G->Carry->Ingredients,1);
  At(2);At(1);TArray<UPrimitiveComponent*> Components;G->CarryVisual->GetComponents(Components);bool Sauce=false,Cheese=false;float SauceZ=0,CheeseZ=0;for(auto* C:Components){if(C->GetName().StartsWith(TEXT("Sauce"))){Sauce=true;SauceZ=C->GetComponentLocation().Z;}if(C->GetName().StartsWith(TEXT("Cheese"))){Cheese=true;CheeseZ=C->GetComponentLocation().Z;}}
  Test->TestTrue(TEXT("Newest sauce is visible above previously applied cheese"),Sauce&&Cheese&&SauceZ>CheeseZ);
  G->Start();G->Carry=FKitchenPizza();G->Carry->Baked=true;G->Carry->Ingredients=3;G->Carry->HasPlate=true;G->Carry->Plated=true;G->Carry->Cuts.AddDiameter(0);G->Carry->Selection=1;G->TryServe(0);
  TArray<AActor*> Pizzas;UGameplayStatics::GetAllActorsOfClass(W,APizzaVisual::StaticClass(),Pizzas);bool GuestFood=false;for(auto* A:Pizzas)if(!A->IsHidden()&&FVector::Dist2D(A->GetActorLocation(),G->StationLocation(6))<70){TArray<UPrimitiveComponent*> Pieces;A->GetComponents(Pieces);for(auto* C:Pieces)GuestFood|=C->GetName().StartsWith(TEXT("Crust"));}Test->TestTrue(TEXT("Actual delivered pizza geometry appears at customer counter"),GuestFood);
  G->Start();G->Board=FKitchenPizza();G->Board->Ingredients=3;G->Board->HasPlate=true;G->Board->Baked=true;G->Board->Cuts.AddDiameter(0);G->Cutting=true;G->FinishCut();Test->TestTrue(TEXT("No selected slices keeps original food at board instead of losing it"),G->Board.IsSet()&&G->Board->Cuts.Count()==2);

  G->Start();G->UsePlateStack();Test->TestTrue(TEXT("Unlimited pile gives a clean plate-only item"),G->Carry.IsSet()&&G->Carry->HasPlate&&!G->Carry->HasPizza&&!G->Carry->DirtyPlate);G->UseDough();Test->TestTrue(TEXT("Dough combines with held clean plate"),G->Carry.IsSet()&&G->Carry->HasPizza&&G->Carry->HasPlate);
  for(int I=0;I<8;++I){G->Carry.Reset();G->UsePlateStack();if(!G->Carry.IsSet()){Test->AddError(TEXT("Plate supply unexpectedly ran out"));break;}}
  G->Start();G->Cash=1000;G->Carry=FKitchenPizza();G->UseTrash();Test->TestTrue(TEXT("Dough disposal subtracts exactly one euro"),!G->Carry.IsSet()&&G->Cash==900&&G->DisposalCosts==100);
  G->Start();G->Cash=1000;G->Carry=FKitchenPizza();G->Carry->Ingredients=3;G->Carry->HasPlate=true;G->UseTrash();Test->TestTrue(TEXT("Raw pizza disposal costs two and retains plate"),G->Cash==800&&G->Carry.IsSet()&&G->Carry->HasPlate&&!G->Carry->HasPizza);G->UseTrash();Test->TestTrue(TEXT("Plate-only disposal costs one and removes item"),!G->Carry.IsSet()&&G->Cash==700);
  G->Start();G->Cash=50;G->Carry=FKitchenPizza();G->Carry->Baked=true;G->UseTrash();Test->TestTrue(TEXT("Disposal bank floor is zero and ledger records actual charge"),G->Cash==0&&G->DisposalCosts==50);
  G->LevelNumber=7;G->Start();G->Carry=FKitchenPizza();G->Carry->HasPizza=false;G->Carry->HasPlate=true;G->Carry->DirtyPlate=true;G->Carry->ReturnBay=0;G->NeedsWash[0]=true;G->UseSink();Test->TestTrue(TEXT("Dirty plate moves physically into sink"),G->Sink.IsSet()&&!G->Carry.IsSet());
  if(G->Sink.IsSet()){G->Paused=true;G->Tick(4);Test->TestTrue(TEXT("Paused sink remains dirty and cannot release bay"),G->Sink->DirtyPlate&&G->WashTime==0&&G->NeedsWash[0]);G->Paused=false;G->Tick(1);G->UseSink();Test->TestTrue(TEXT("Early wash pickup retains dirt and customer debt"),G->Carry.IsSet()&&G->Carry->DirtyPlate&&G->NeedsWash[0]);G->UseSink();G->Tick(3.1);Test->TestTrue(TEXT("Three-second wash makes clean plate and releases bay"),G->Sink.IsSet()&&!G->Sink->DirtyPlate&&!G->NeedsWash[0]);}
  G->Start();G->Sink=FKitchenPizza();G->Sink->HasPizza=false;G->Sink->HasPlate=true;G->Carry=FKitchenPizza();G->Carry->Ingredients=7;G->UseSink();Test->TestTrue(TEXT("Full sink and hands preserve food and dish"),G->Carry.IsSet()&&G->Carry->Ingredients==7&&G->Sink.IsSet());
  G->Start();G->Carry=FKitchenPizza();G->Carry->HasPlate=true;G->Carry->Baked=true;G->Carry->Plated=true;G->Carry->Ingredients=3;for(float A:{0.f,45.f,90.f,135.f})G->Carry->Cuts.AddDiameter(A);const auto FirstWant=G->Orders[0].Amount;G->Carry->Selection=(1u<<(FirstWant.Num*(8/FirstWant.Den)))-1;G->TryServe(0);G->Tick(3.1);G->UseGuest(0);G->UseSink();G->Tick(3.1);Test->TestTrue(TEXT("Next guest appears after actual dirty plate is washed"),G->Orders.Num()==1);if(G->Orders.Num())Test->TestEqual(TEXT("New customer service age starts at zero after previous cleanup"),G->Orders[0].Age,0.f);
  G->Start();G->Served=G->Level.Goal-1;G->Carry=FKitchenPizza();G->Carry->HasPlate=true;G->Carry->Baked=true;G->Carry->Plated=true;G->Carry->Ingredients=G->Orders[0].Ingredients;for(float A:{0.f,45.f,90.f,135.f})G->Carry->Cuts.AddDiameter(A);const auto Want=G->Orders[0].Amount;G->Carry->Selection=(1u<<(Want.Num*(8/Want.Den)))-1;G->TryServe(0);Test->TestTrue(TEXT("Last washed-level delivery waits for physical cleanup"),!G->Finished&&G->GuestMeals[0].IsSet());
  if(G->GuestMeals[0].IsSet()){G->Tick(3.1);Test->TestTrue(TEXT("Eating creates dirty plate at same customer bay"),G->GuestMeals[0].IsSet()&&!G->GuestMeals[0]->HasPizza&&G->GuestMeals[0]->DirtyPlate&&G->NeedsWash[0]);G->UseGuest(0);G->UseSink();G->Tick(3.1);Test->TestTrue(TEXT("Last washed dish completes the shift"),G->Finished&&G->LevelWon);}
  return true;
 }
};
IMPLEMENT_SIMPLE_AUTOMATION_TEST(FPizzaInventory,"GradeCrew.NativeKitchen.Inventory",EAutomationTestFlags::EditorContext|EAutomationTestFlags::EngineFilter)
bool FPizzaInventory::RunTest(const FString&){ADD_LATENT_AUTOMATION_COMMAND(FEditorLoadMap(TEXT("/Game/Maps/Pizzeria")));ADD_LATENT_AUTOMATION_COMMAND(FStartPIECommand(false));ADD_LATENT_AUTOMATION_COMMAND(FCheckInventory(this));ADD_LATENT_AUTOMATION_COMMAND(FEndPlayMapCommand());return true;}
#endif

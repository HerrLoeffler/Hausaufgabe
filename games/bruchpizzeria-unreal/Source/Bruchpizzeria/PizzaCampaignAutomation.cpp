#if WITH_EDITOR
#include "Misc/AutomationTest.h"
#include "Tests/AutomationEditorCommon.h"
#include "Editor.h"
#include "PizzaKitchen.h"
#include "PizzaTestSteps.h"
#include "Engine/World.h"
#include "Components/SceneComponent.h"
#include "Kismet/GameplayStatics.h"
class FCheckCampaignRevision final:public IAutomationLatentCommand {
 FAutomationTestBase* Test;double Started=FPlatformTime::Seconds();
 public:explicit FCheckCampaignRevision(FAutomationTestBase* T):Test(T){}
 bool Update()override{
  UWorld* W=GEditor?GEditor->PlayWorld:nullptr;auto* G=W?Cast<APizzaGameMode>(W->GetAuthGameMode()):nullptr;
  if(!G||!G->Chef()){if(FPlatformTime::Seconds()-Started<25)return false;Test->AddError(TEXT("Revision kitchen did not start"));return true;}
  G->LevelNumber=1;G->Start();G->Carry=FKitchenPizza();G->Carry->HasPlate=true;G->Carry->Ingredients=7;G->Chef()->SetActorLocation(FVector(0,-350,77));G->Drop();
  Test->TestTrue(TEXT("Dropping away from a table must never delete pizza"),G->Carry.IsSet());
  G->Chef()->SetActorLocation(FVector(-205,-300,77));Test->TestEqual(TEXT("Preparation table has a reachable station"),G->NearestStation(),9);
  FKitchenOrder O;O.Name=TEXT("Lina");O.Amount=PizzaRules::Rational(3,8);G->Carry=FKitchenPizza();G->Carry->HasPlate=true;G->Carry->Baked=true;G->Carry->Ingredients=3;G->Carry->Cuts.AddDiameter(0);G->Carry->Selection=1;G->Carry->Plated=true;G->BeginLesson(O, PizzaRules::Rational(1,2));
  G->ToggleRepairPiece(3);G->ConfirmRepair();
  Test->TestFalse(TEXT("Acknowledging customer resumes cooking without editing"),G->Learning);
  Test->TestTrue(TEXT("Customer reminder preserves actual wrong half"),G->Carry.IsSet()&&PizzaRules::Equal(G->Carry->Cuts.Selected(G->Carry->Selection),PizzaRules::Rational(1,2)));
  G->Learning=false;G->UseTable(0);Test->TestTrue(TEXT("Prepared plate stored without loss"),!G->Carry.IsSet()&&G->Tables[0].IsSet()&&G->Tables[0]->Baked&&G->Tables[0]->Plated);
  G->Carry=FKitchenPizza();G->Carry->HasPlate=true;G->Carry->Ingredients=7;G->UseTable(0);Test->TestTrue(TEXT("Occupied table and full hands preserve both pizzas"),G->Carry.IsSet()&&G->Carry->Ingredients==7&&G->Tables[0]->Selection!=0);
  G->UseTable(1);G->UseTable(0);Test->TestTrue(TEXT("Original exact plate can be picked back up"),G->Carry.IsSet()&&PizzaRules::Equal(G->Carry->Cuts.Selected(G->Carry->Selection),PizzaRules::Rational(1,2)));
  G->LevelNumber=6;G->Start();G->Carry=FKitchenPizza();G->Carry->HasPlate=true;G->Carry->Ingredients=3;G->UseOven(0);G->Tick(2);G->Carry=FKitchenPizza();G->Carry->HasPlate=true;G->Carry->Ingredients=7;G->UseOven(1);G->Tick(3.1);Test->TestTrue(TEXT("Independent oven clocks keep newer pizza baking"),G->Oven->Baked&&!G->ExtraOvens[0]->Baked);
  G->Learning=true;const float ExtraClock=G->ExtraBakeTimes[0],RoundClock=G->RoundTime,GuestClock=G->Orders[0].Patience;G->Tick(10);Test->TestEqual(TEXT("Learning freezes extra oven too"),G->ExtraBakeTimes[0],ExtraClock);Test->TestEqual(TEXT("Learning freezes active challenge clock"),G->RoundTime,RoundClock);Test->TestEqual(TEXT("Learning freezes active guest patience"),G->Orders[0].Patience,GuestClock);G->Learning=false;G->Tick(2);Test->TestTrue(TEXT("Second oven completes after resume"),G->ExtraOvens[0]->Baked);
  G->LevelNumber=1;G->UnlockedLevel=1;G->Start();G->Tick(999);Test->TestFalse(TEXT("Early calm level cannot expire"),G->Finished);Test->TestEqual(TEXT("Early level has one concrete guest"),G->Orders.Num(),1);
  for(int I=0;I<3;++I){const auto Wanted=G->Orders[0].Amount;G->Carry=FKitchenPizza();G->Carry->HasPlate=true;G->Carry->Baked=true;G->Carry->Plated=true;G->Carry->Ingredients=G->Orders[0].Ingredients;if(Wanted.Den==2)G->Carry->Cuts.AddDiameter(0);G->Carry->Selection=(1u<<Wanted.Num)-1;G->TryServe(0);FinishGuestCycle(G);}
  Test->TestTrue(TEXT("Only completed correct deliveries unlock next level"),G->Finished&&G->LevelWon&&G->UnlockedLevel==2);G->SelectLevel(80);Test->TestEqual(TEXT("Locked level cannot be selected"),G->LevelNumber,2);
  for(int N=1;N<=10;++N){G->LevelNumber=N;G->Start();auto* Arena=Cast<APizzaArena>(UGameplayStatics::GetActorOfClass(W,APizzaArena::StaticClass()));TArray<USceneComponent*> Components;Arena->GetComponents(Components);for(int I=0;I<6;++I){const auto* Root=Components.FindByPredicate([I](const USceneComponent* C){return C->GetName().StartsWith(FString::Printf(TEXT("StationRoot%d"),I));});Test->TestTrue(TEXT("Station art has explicit parent root"),Root!=nullptr);if(Root&&(*Root)->GetAttachChildren().Num()){const FVector Actual=(*Root)->GetAttachChildren()[0]->GetComponentLocation();const FVector Wanted=G->StationLocation(I);Test->TestTrue(TEXT("Visible station collision/art agrees with interaction point"),FVector::Dist2D(Actual,Wanted)<1);}}
   Test->TestTrue(TEXT("Cut visual agrees with current board position"),FVector::Dist2D(G->BoardVisual->GetActorLocation(),G->StationLocation(5))<1);
   for(int I=0;I<2;++I)Test->TestTrue(TEXT("Ablage visual agrees with current table"),FVector::Dist2D(G->TableVisuals[I]->GetActorLocation(),G->StationLocation(9+I))<1);
   if(N==10){bool SawMinus=false;for(int I=0;I<4;++I){const auto Ticket=G->Orders[0];SawMinus|=Ticket.Op=='-';G->Carry=FKitchenPizza();G->Carry->HasPlate=true;G->Carry->Ingredients=Ticket.Ingredients;G->Carry->Baked=true;G->Carry->Plated=true;for(float A:{0.f,45.f,90.f,135.f})G->Carry->Cuts.AddDiameter(A);G->Carry->Selection=(1u<<(Ticket.Amount.Num*(8/Ticket.Amount.Den)))-1;G->TryServe(0);FinishGuestCycle(G);}Test->TestTrue(TEXT("Actual tenth shift reaches subtraction before completion"),SawMinus&&G->LevelWon);}
  }
  return true;
 }
};
IMPLEMENT_SIMPLE_AUTOMATION_TEST(FPizzaCampaignRevision,"GradeCrew.NativeKitchen.CampaignAndStorage",EAutomationTestFlags::EditorContext|EAutomationTestFlags::EngineFilter)
bool FPizzaCampaignRevision::RunTest(const FString&){ADD_LATENT_AUTOMATION_COMMAND(FEditorLoadMap(TEXT("/Game/Maps/Pizzeria")));ADD_LATENT_AUTOMATION_COMMAND(FStartPIECommand(false));ADD_LATENT_AUTOMATION_COMMAND(FCheckCampaignRevision(this));ADD_LATENT_AUTOMATION_COMMAND(FEndPlayMapCommand());return true;}
#endif

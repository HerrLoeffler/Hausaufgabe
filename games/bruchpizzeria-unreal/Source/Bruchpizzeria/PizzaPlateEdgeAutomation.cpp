#if WITH_EDITOR
#include "Misc/AutomationTest.h"
#include "Tests/AutomationEditorCommon.h"
#include "Editor.h"
#include "PizzaKitchen.h"
#include "PizzaHUD.h"
#include "Engine/World.h"
#include "Kismet/GameplayStatics.h"
class FCheckPlateEdges final:public IAutomationLatentCommand {
 FAutomationTestBase* Test;double Started=FPlatformTime::Seconds();int Stage=0;
 public:explicit FCheckPlateEdges(FAutomationTestBase* T):Test(T){}
 bool Update()override{
  UWorld* W=GEditor?GEditor->PlayWorld:nullptr;auto* P=W?Cast<APizzaController>(UGameplayStatics::GetPlayerController(W,0)):nullptr;auto* G=P?P->Game():nullptr;auto* H=P?Cast<APizzaHUD>(P->GetHUD()):nullptr;
  if(!G||!H||!G->Chef()){if(FPlatformTime::Seconds()-Started<25)return false;Test->AddError(TEXT("Plate edge kitchen did not start"));return true;}
  if(Stage==0){
   G->LevelNumber=1;G->Start();G->UsePlateStack();G->UseBoard();G->UseBoard();Test->TestTrue(TEXT("Empty plate can be picked up from board without adding food"),!G->Board.IsSet()&&G->Carry.IsSet()&&G->Carry->HasPlate&&!G->Carry->HasPizza);
   for(int N=1;N<=10;++N){G->LevelNumber=N;G->Start();auto* C=G->Chef();auto Walk=[C](FVector V){FHitResult Hit;C->SetActorLocation(V,true,&Hit);return FVector::Dist2D(C->GetActorLocation(),V)<5;};Test->TestTrue(TEXT("Plate pile has an unobstructed approach in every kitchen"),Walk(FVector(220,-330,77)));Test->TestEqual(TEXT("Plate approach selects the pile rather than another table"),G->NearestStation(),13);C->SetActorLocation(FVector(0,-350,77));Test->TestTrue(TEXT("Trash bin has an unobstructed approach"),Walk(FVector(-410,-280,77)));Test->TestEqual(TEXT("Trash approach selects disposal"),G->NearestStation(),15);C->SetActorLocation(FVector(0,-350,77));const bool SinkRoute=Walk(FVector(0,0,77))&&Walk(FVector(404,0,77))&&Walk(FVector(404,-280,77));Test->TestTrue(TEXT("Sink can be reached around preparation counters"),SinkRoute);Test->TestEqual(TEXT("Sink approach selects wash station"),G->NearestStation(),14);}
   G->LevelNumber=10;G->Start();G->Carry=FKitchenPizza();G->Carry->HasPlate=true;G->Carry->Ingredients=3;G->Carry->Baked=true;G->Carry->Plated=true;for(float A:{0.f,45.f,90.f,135.f})G->Carry->Cuts.AddDiameter(A);G->Carry->Selection=1;G->TryServe(0);G->Tick(3.1);G->UseGuest(0);
   const int Other=G->Orders.IndexOfByPredicate([](const FKitchenOrder& O){return O.Bay==1;});Test->TestTrue(TEXT("Other guest still waits while first plate is carried"),Other!=INDEX_NONE&&G->Carry.IsSet());if(Other!=INDEX_NONE&&G->Carry.IsSet()){G->TryServe(Other);G->ServeAnyway();G->Tick(3.1);G->UseGuest(1);G->UseSink();G->Tick(3.1);Test->TestTrue(TEXT("Washing a forwarded dirty plate releases both affected guest bays"),!G->NeedsWash[0]&&!G->NeedsWash[1]&&G->Orders.Num()==2);}
   G->LevelNumber=6;G->Start();G->Finished=true;G->LevelWon=true;G->UnlockedLevel=7;Stage=1;Started=FPlatformTime::Seconds();return false;
  }
  const auto* Next=H->Buttons.FindByPredicate([](const FKitchenButton& B){return B.Id==TEXT("nextlevel");});if(!Next){if(FPlatformTime::Seconds()-Started<15)return false;Test->AddError(TEXT("Actual next-level button did not render"));return true;}
  P->Press(Next->Rect.GetCenter()*H->Scale+H->ViewOrigin,-2);Test->TestTrue(TEXT("Next level shows its new mechanic introduction before starting"),G->Intro&&G->LevelNumber==7&&!G->Finished);return true;
 }
};
IMPLEMENT_SIMPLE_AUTOMATION_TEST(FPizzaPlateEdges,"GradeCrew.NativeKitchen.PlateEdges",EAutomationTestFlags::EditorContext|EAutomationTestFlags::EngineFilter)
bool FPizzaPlateEdges::RunTest(const FString&){ADD_LATENT_AUTOMATION_COMMAND(FEditorLoadMap(TEXT("/Game/Maps/Pizzeria")));ADD_LATENT_AUTOMATION_COMMAND(FStartPIECommand(false));ADD_LATENT_AUTOMATION_COMMAND(FCheckPlateEdges(this));ADD_LATENT_AUTOMATION_COMMAND(FEndPlayMapCommand());return true;}
#endif

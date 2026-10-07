#if WITH_EDITOR
#include "Misc/AutomationTest.h"
#include "Tests/AutomationEditorCommon.h"
#include "Editor.h"
#include "PizzaKitchen.h"
#include "PizzaHUD.h"
#include "Engine/World.h"
#include "Camera/CameraActor.h"
#include "Camera/CameraComponent.h"
#include "Camera/PlayerCameraManager.h"
#include "Kismet/GameplayStatics.h"
#include "ProceduralMeshComponent.h"
class FCheckMouseCuts final : public IAutomationLatentCommand {
 FAutomationTestBase* Test;double Started=FPlatformTime::Seconds();bool Prepared=false;
 public:explicit FCheckMouseCuts(FAutomationTestBase* T):Test(T){}
 bool Update()override {
  UWorld* World=GEditor?GEditor->PlayWorld:nullptr;
  auto* P=World?Cast<APizzaController>(UGameplayStatics::GetPlayerController(World,0)):nullptr;
  auto* G=P?P->Game():nullptr;
  if(!G||!G->Camera){if(FPlatformTime::Seconds()-Started<20)return false;Test->AddError(TEXT("Native camera not ready for real mouse projection"));return true;}
  if(!Prepared){G->Start();G->Board=FKitchenPizza();G->Board->HasPlate=true;G->Board->Baked=true;G->Board->Ingredients=3;G->BeginCut();G->Tick(2);P->PlayerCameraManager->UpdateCamera(.01f);G->RefreshPizza();Prepared=true;return false;}
  auto* HUD=Cast<APizzaHUD>(P->GetHUD());if(!HUD||!HUD->Buttons.ContainsByPredicate([](const FKitchenButton& B){return B.Id==TEXT("plate");})){if(FPlatformTime::Seconds()-Started<20)return false;Test->AddError(TEXT("Actual cutting HUD did not become ready"));return true;}
  auto Stroke=[P,G,this](FVector2D A,FVector2D B){FVector2D First,Last;const bool Valid=P->ProjectWorldLocationToScreen(G->CutLocation()+FVector(A.X*42,A.Y*42,0),First)&&P->ProjectWorldLocationToScreen(G->CutLocation()+FVector(B.X*42,B.Y*42,0),Last);Test->TestTrue(TEXT("Mouse sweep has valid actual viewport projection"),Valid);P->Press(First,-2);P->Release(Last,-2);};
  Stroke(FVector2D(-1.4,.35),FVector2D(1.4,.35));
  Test->TestEqual(TEXT("Beyond-crust off-center mouse sweep creates actual halves"),G->Board->Cuts.Count(),2);
  TArray<UProceduralMeshComponent*> Layers;G->BoardVisual->GetComponents(Layers);Test->TestEqual(TEXT("Two native pizza pieces have six visible material layers"),Layers.Num(),6);
  Stroke(FVector2D(-.242,-.970),FVector2D(.242,.970));
  Stroke(FVector2D(-.848,-.530),FVector2D(.848,.530));
  Stroke(FVector2D(.875,-.485),FVector2D(-.875,.485));
  Test->TestTrue(TEXT("Actual imprecise screen sweeps create equal eighths"),G->Board->Cuts.Count()==8&&G->Board->Cuts.EqualParts());
  G->Board->Selection=1;G->FinishCut();Test->TestTrue(TEXT("Mouse-cut eighth can be put on real plate"),G->Carry.IsSet()&&PizzaRules::Equal(G->Carry->Cuts.Selected(G->Carry->Selection),PizzaRules::Rational(1,8)));
  G->Carry.Reset();G->Board=FKitchenPizza();G->Board->HasPlate=true;G->Board->Baked=true;G->Board->Ingredients=3;G->BeginCut();G->Tick(2);P->PlayerCameraManager->UpdateCamera(.01f);Stroke(FVector2D(-1,.8),FVector2D(1,.8));
  Test->TestTrue(TEXT("Gross screen swipe remains a real unequal physical cut"),G->Board->Cuts.Count()==2&&!G->Board->Cuts.EqualParts());
  return true;
 }
};
IMPLEMENT_SIMPLE_AUTOMATION_TEST(FPizzaMouseCuts,"GradeCrew.NativeKitchen.MouseCutting",EAutomationTestFlags::EditorContext|EAutomationTestFlags::EngineFilter)
bool FPizzaMouseCuts::RunTest(const FString&){ADD_LATENT_AUTOMATION_COMMAND(FEditorLoadMap(TEXT("/Game/Maps/Pizzeria")));ADD_LATENT_AUTOMATION_COMMAND(FStartPIECommand(false));ADD_LATENT_AUTOMATION_COMMAND(FCheckMouseCuts(this));ADD_LATENT_AUTOMATION_COMMAND(FEndPlayMapCommand());return true;}
#endif

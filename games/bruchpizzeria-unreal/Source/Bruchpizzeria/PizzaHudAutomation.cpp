#if WITH_EDITOR
#include "Misc/AutomationTest.h"
#include "Tests/AutomationEditorCommon.h"
#include "Editor.h"
#include "PizzaKitchen.h"
#include "PizzaHUD.h"
#include "Engine/World.h"
#include "Kismet/GameplayStatics.h"
class FCheckHudPointer final : public IAutomationLatentCommand {
 int Stage=0;FAutomationTestBase* Test; double Started=FPlatformTime::Seconds();
 public: explicit FCheckHudPointer(FAutomationTestBase* T):Test(T){}
 bool Update() override {
  UWorld* World=GEditor?GEditor->PlayWorld:nullptr;
  auto* Controller=World?Cast<APizzaController>(UGameplayStatics::GetPlayerController(World,0)):nullptr;
  auto* Game=Controller?Controller->Game():nullptr;
  auto* HUD=Controller?Cast<APizzaHUD>(Controller->GetHUD()):nullptr;
  const FKitchenButton* Start=HUD?HUD->Buttons.FindByPredicate([](const FKitchenButton& B){return B.Id==TEXT("start");}):nullptr;
  if(!Game||!HUD||(Stage==0&&!Start)){if(FPlatformTime::Seconds()-Started<20)return false;Test->AddError(TEXT("Actual native intro HUD never became ready"));return true;}
  if(Stage==0){Test->TestTrue(TEXT("Real camera letterbox offset exists for regression"),HUD->ViewOrigin.SizeSquared()>1);
  int Width,Height;Controller->GetViewportSize(Width,Height);
  UE_LOG(LogTemp,Display,TEXT("PIZZA_HUD_POINTER viewport=%dx%d origin=%s scale=%.3f"),Width,Height,*HUD->ViewOrigin.ToString(),HUD->Scale);
  // A visible point just inside the lower-right button corner must start play.
  // The engine translates Canvas drawing by its constrained scene-view origin.
  const FVector2D VisiblePoint=(Start->Rect.Max-FVector2D(1,1))*HUD->Scale+HUD->ViewOrigin;
  Controller->Press(VisiblePoint,-2);
  Test->TestFalse(TEXT("Click inside rendered Los kochen button starts actual game"),Game->Intro);
  Game->LevelNumber=1;Game->Start();Game->Orders[0].Amount=PizzaRules::Rational(3,8);Game->Carry=FKitchenPizza();Game->Carry->Ingredients=3;Game->Carry->Baked=true;Game->Carry->Plated=true;Game->Carry->Cuts.AddDiameter(0);Game->Carry->Selection=1;Game->TryServe(0);Stage=1;Started=FPlatformTime::Seconds();return false;}
  const auto* Confirm=HUD->Buttons.FindByPredicate([](const FKitchenButton& B){return B.Id==TEXT("reviewack");});if(!Confirm){if(FPlatformTime::Seconds()-Started<15)return false;Test->AddError(TEXT("Visual repair buttons never rendered"));return true;}
  const uint32 Before=Game->Carry->Selection;const FVector2D PizzaPoint=FVector2D(640,FMath::Max(110.f,(HUD->Height-450)/2)+226)*HUD->Scale+HUD->ViewOrigin;Controller->Press(PizzaPoint,-2);Test->TestEqual(TEXT("Rendered target diagram never edits real pizza"),Game->Carry->Selection,Before);Controller->Press(Confirm->Rect.GetCenter()*HUD->Scale+HUD->ViewOrigin,-2);Test->TestTrue(TEXT("Rendered Understood resumes with original half, still requiring physical correction"),!Game->Learning&&Game->Carry.IsSet()&&PizzaRules::Equal(Game->Carry->Portion(),PizzaRules::Rational(1,2)));
  return true;
 }
};
IMPLEMENT_SIMPLE_AUTOMATION_TEST(FPizzaHudPointer,"GradeCrew.NativeKitchen.HudPointer",EAutomationTestFlags::EditorContext|EAutomationTestFlags::EngineFilter)
bool FPizzaHudPointer::RunTest(const FString&){ADD_LATENT_AUTOMATION_COMMAND(FEditorLoadMap(TEXT("/Game/Maps/Pizzeria")));ADD_LATENT_AUTOMATION_COMMAND(FStartPIECommand(false));ADD_LATENT_AUTOMATION_COMMAND(FCheckHudPointer(this));ADD_LATENT_AUTOMATION_COMMAND(FEndPlayMapCommand());return true;}
#endif

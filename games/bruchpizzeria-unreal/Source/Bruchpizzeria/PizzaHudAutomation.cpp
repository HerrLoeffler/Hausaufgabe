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
  const auto* Confirm=HUD->Buttons.FindByPredicate([](const FKitchenButton& B){return B.Id==TEXT("repairconfirm");});if(!Confirm){if(FPlatformTime::Seconds()-Started<15)return false;Test->AddError(TEXT("Visual repair buttons never rendered"));return true;}
  const float Y=FMath::Max(104.f,(HUD->Height-480)/2);const float A=3*PI/8;const FVector2D PiecePoint=(FVector2D(860,Y+248)+FVector2D(FMath::Cos(A)*70,FMath::Sin(A)*70))*HUD->Scale+HUD->ViewOrigin;Controller->Press(PiecePoint,-2);Test->TestEqual(TEXT("Click on real rendered fourth eighth removes excess piece"),Game->Repair.Count(),3);Controller->Press(Confirm->Rect.GetCenter()*HUD->Scale+HUD->ViewOrigin,-2);Test->TestTrue(TEXT("Rendered confirm resumes with actual corrected plate"),!Game->Learning&&Game->Carry.IsSet()&&PizzaRules::Equal(Game->Carry->Cuts.Selected(Game->Carry->Selection),PizzaRules::Rational(3,8)));
  return true;
 }
};
IMPLEMENT_SIMPLE_AUTOMATION_TEST(FPizzaHudPointer,"GradeCrew.NativeKitchen.HudPointer",EAutomationTestFlags::EditorContext|EAutomationTestFlags::EngineFilter)
bool FPizzaHudPointer::RunTest(const FString&){ADD_LATENT_AUTOMATION_COMMAND(FEditorLoadMap(TEXT("/Game/Maps/Pizzeria")));ADD_LATENT_AUTOMATION_COMMAND(FStartPIECommand(false));ADD_LATENT_AUTOMATION_COMMAND(FCheckHudPointer(this));ADD_LATENT_AUTOMATION_COMMAND(FEndPlayMapCommand());return true;}
#endif

#if WITH_EDITOR
#include "Misc/AutomationTest.h"
#include "Tests/AutomationEditorCommon.h"
#include "Editor.h"
#include "PizzaKitchen.h"
#include "PizzaHUD.h"
#include "Engine/World.h"
#include "Kismet/GameplayStatics.h"
#include "UnrealClient.h"
#include "Misc/Paths.h"
class FCheckMenu final:public IAutomationLatentCommand {
 FAutomationTestBase* Test;double Started=FPlatformTime::Seconds();int Stage=0;bool Shot=false;int Cash=0;
 public:explicit FCheckMenu(FAutomationTestBase* T):Test(T){}
 bool Update()override{
  UWorld* W=GEditor?GEditor->PlayWorld:nullptr;auto* P=W?Cast<APizzaController>(UGameplayStatics::GetPlayerController(W,0)):nullptr;auto* G=P?P->Game():nullptr;auto* H=P?Cast<APizzaHUD>(P->GetHUD()):nullptr;
  if(!G||!H||!G->Chef()){if(FPlatformTime::Seconds()-Started<25)return false;Test->AddError(TEXT("Native menu did not start"));return true;}
  auto Find=[H](FName Id){return H->Buttons.FindByPredicate([Id](const FKitchenButton& B){return B.Id==Id;});};auto Click=[P,H](const FKitchenButton* B){if(B)P->Press(B->Rect.GetCenter()*H->Scale+H->ViewOrigin,-2);};
  if(Stage==0){
   G->LevelNumber=1;G->Start();G->Cutting=true;G->Board=FKitchenPizza();G->Board->HasPlate=true;G->Board->Ingredients=3;G->Board->Cuts.AddDiameter(0);G->Board->Selection=1;P->Dragging=true;P->Escape();Test->TestTrue(TEXT("Escape opens menu while cutting and preserves board"),G->Paused&&G->Cutting&&G->Board.IsSet()&&G->Board->Selection==1&&!P->Dragging);G->Paused=false;
   G->Cutting=false;G->Carry=FKitchenPizza();G->Carry->HasPlate=true;G->Carry->Ingredients=3;G->Carry->Baked=true;G->BeginLesson(G->Orders[0],PizzaRules::Rational(1));G->ShowRepairStep();P->Escape();Test->TestTrue(TEXT("Escape opens menu during fraction help"),G->Paused&&G->Learning);const uint32 Selection=G->Carry->Selection;P->Use();G->ToggleRepairPiece(0);G->ConfirmRepair();Test->TestTrue(TEXT("Paused menu blocks E, repair taps and confirm behind it"),G->Learning&&G->Carry->Selection==Selection);
   G->Start();Cash=G->Cash;G->UnlockedLevel=3;G->Score=55;G->Served=1;G->Carry=FKitchenPizza();G->Carry->HasPlate=true;G->Oven=FKitchenPizza();G->BakeTime=2;G->Orders[0].Age=12;P->Escape();const float Clock=G->RoundTime;G->Tick(3);Test->TestTrue(TEXT("Menu freezes kitchen, guest service clock and ovens"),G->Paused&&G->RoundTime==Clock&&G->Orders[0].Age==12&&G->BakeTime==2);Stage=1;Started=FPlatformTime::Seconds();return false;
  }
  if(Stage==1){
   if(!Find(TEXT("pause"))){if(FPlatformTime::Seconds()-Started<15)return false;Test->AddError(TEXT("Native pause menu not rendered"));return true;}
   if(!Shot){Test->TestTrue(TEXT("Actual menu offers restart"),Find(TEXT("restart"))!=nullptr);Test->TestTrue(TEXT("Actual menu offers level selection"),Find(TEXT("mainmenu"))!=nullptr);Test->TestEqual(TEXT("Menu only exposes its own three actions"),H->Buttons.Num(),3);FScreenshotRequest::RequestScreenshot(FPaths::ProjectDir()/TEXT("Reports/NativeMenu.png"),false,false);Shot=true;Started=FPlatformTime::Seconds();return false;}
   if(FPlatformTime::Seconds()-Started<1)return false;const auto* Restart=Find(TEXT("restart"));if(!Restart)return true;Click(Restart);Test->TestTrue(TEXT("Restart same shift clears transient food, clocks and progress"),!G->Paused&&!G->Cutting&&!G->Learning&&!G->Intro&&G->LevelNumber==1&&G->Served==0&&G->Score==0&&!G->Carry.IsSet()&&!G->Board.IsSet()&&!G->Oven.IsSet()&&G->BakeTime==0);Test->TestTrue(TEXT("Restart preserves wallet and unlocked levels"),G->Cash==Cash&&G->UnlockedLevel==3);P->Escape();Stage=2;Started=FPlatformTime::Seconds();return false;
  }
  if(Stage==2){const auto* Home=Find(TEXT("mainmenu"));if(!Home){if(FPlatformTime::Seconds()-Started<15)return false;Test->AddError(TEXT("Return-to-level action not rendered"));return true;}Click(Home);Test->TestTrue(TEXT("Level menu exits paused/cutting/learning states safely"),G->Intro&&!G->Paused&&!G->Cutting&&!G->Learning);Test->TestTrue(TEXT("Menu return preserves wallet and progress"),G->Cash==Cash&&G->UnlockedLevel==3);Stage=3;Started=FPlatformTime::Seconds();return false;}
  const auto* Start=Find(TEXT("start"));if(!Start){if(FPlatformTime::Seconds()-Started<15)return false;Test->AddError(TEXT("Level selection screen not rendered"));return true;}G->SelectLevel(3);Click(Start);Test->TestTrue(TEXT("Selected unlocked kitchen actually starts"),!G->Intro&&G->LevelNumber==3&&G->Layout.Stations[5].X==160);return true;
 }
};
IMPLEMENT_SIMPLE_AUTOMATION_TEST(FPizzaMenuFlow,"GradeCrew.NativeKitchen.Menu",EAutomationTestFlags::EditorContext|EAutomationTestFlags::EngineFilter)
bool FPizzaMenuFlow::RunTest(const FString&){ADD_LATENT_AUTOMATION_COMMAND(FEditorLoadMap(TEXT("/Game/Maps/Pizzeria")));ADD_LATENT_AUTOMATION_COMMAND(FStartPIECommand(false));ADD_LATENT_AUTOMATION_COMMAND(FCheckMenu(this));ADD_LATENT_AUTOMATION_COMMAND(FEndPlayMapCommand());return true;}
#endif

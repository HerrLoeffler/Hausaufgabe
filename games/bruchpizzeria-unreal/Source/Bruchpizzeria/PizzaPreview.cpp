#if WITH_EDITOR
#include "Misc/AutomationTest.h"
#include "Tests/AutomationEditorCommon.h"
#include "Editor.h"
#include "PizzaKitchen.h"
#include "Engine/World.h"
#include "UnrealClient.h"
#include "Misc/Paths.h"
class FStartVisualKitchen final:public IAutomationLatentCommand {
 double Start=FPlatformTime::Seconds();bool Started=false;int Phase=0;FAutomationTestBase* Test;
 public:explicit FStartVisualKitchen(FAutomationTestBase* T):Test(T){}bool Update()override{
  UWorld* W=GEditor?GEditor->PlayWorld:nullptr;auto* G=W?Cast<APizzaGameMode>(W->GetAuthGameMode()):nullptr;
  if(!G||!G->Camera){if(FPlatformTime::Seconds()-Start<30)return false;Test->AddError(TEXT("Native preview did not start"));return true;}
  if(!Started){G->Start();Started=true;Start=FPlatformTime::Seconds();}
  if(Phase==1&&!G->Board.IsSet()){G->Board=FKitchenPizza();G->Board->Baked=true;G->Board->Ingredients=7;for(float A:{0.f,45.f,90.f,135.f})G->Board->Cuts.AddDiameter(A);G->Board->Selection=15;G->BeginCut();G->RefreshPizza();}
  if(Phase==2&&!G->Learning){G->Carry=G->Board;G->Carry->Selection=1;G->Carry->Plated=true;G->Board.Reset();G->Cutting=false;G->TryServe(0);G->RefreshPizza();}
  if(Phase==3&&!G->Cutting){G->Start();G->Board=FKitchenPizza();G->Board->Baked=true;G->Board->Ingredients=3;G->BeginCut();G->CutStroke(FVector2D(-1,.8),FVector2D(1,.8));}
  if(FPlatformTime::Seconds()-Start<3)return false;
  const TCHAR* Names[]={TEXT("Reports/NativeKitchen.png"),TEXT("Reports/NativeCutting.png"),TEXT("Reports/NativeLearning.png"),TEXT("Reports/NativeUnequal.png")};
  FScreenshotRequest::RequestScreenshot(FPaths::ProjectDir()/Names[Phase],false,false);
  if(Phase==0){Phase=1;Start=FPlatformTime::Seconds();return false;}
  if(Phase==1){Phase=2;Start=FPlatformTime::Seconds();return false;}
  if(Phase==2){Phase=3;Start=FPlatformTime::Seconds();return false;}
  UE_LOG(LogTemp,Display,TEXT("PIZZA_VISUAL_PREVIEW: native kitchen, cutting and learning screenshots requested; not device or quality acceptance"));
  return true;
 }
};
IMPLEMENT_SIMPLE_AUTOMATION_TEST(FPizzaPreview,"GradeCrew.NativeKitchen.VisualPreview",EAutomationTestFlags::EditorContext|EAutomationTestFlags::EngineFilter)
bool FPizzaPreview::RunTest(const FString&){ADD_LATENT_AUTOMATION_COMMAND(FEditorLoadMap(TEXT("/Game/Maps/Pizzeria")));ADD_LATENT_AUTOMATION_COMMAND(FStartPIECommand(false));ADD_LATENT_AUTOMATION_COMMAND(FStartVisualKitchen(this));return true;}
#endif

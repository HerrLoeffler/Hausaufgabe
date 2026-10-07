#if WITH_EDITOR
#include "Misc/AutomationTest.h"
#include "Tests/AutomationEditorCommon.h"
#include "Editor.h"
#include "PizzaKitchen.h"
#include "Engine/World.h"
#include "UnrealClient.h"
#include "Misc/Paths.h"
class FStartVisualKitchen final:public IAutomationLatentCommand {
 double Start=FPlatformTime::Seconds();bool Started=false;FAutomationTestBase* Test;
 public:explicit FStartVisualKitchen(FAutomationTestBase* T):Test(T){}bool Update()override{
  UWorld* W=GEditor?GEditor->PlayWorld:nullptr;auto* G=W?Cast<APizzaGameMode>(W->GetAuthGameMode()):nullptr;
  if(!G||!G->Camera){if(FPlatformTime::Seconds()-Start<30)return false;Test->AddError(TEXT("Native preview did not start"));return true;}
  if(!Started){G->Start();Started=true;Start=FPlatformTime::Seconds();}
  if(FPlatformTime::Seconds()-Start<3)return false;
  FScreenshotRequest::RequestScreenshot(FPaths::ProjectDir()/TEXT("Reports/NativeKitchen.png"),false,false);
  UE_LOG(LogTemp,Display,TEXT("PIZZA_VISUAL_PREVIEW: normal native PIE stays open for user play"));
  return true;
 }
};
IMPLEMENT_SIMPLE_AUTOMATION_TEST(FPizzaPreview,"GradeCrew.NativeKitchen.VisualPreview",EAutomationTestFlags::EditorContext|EAutomationTestFlags::EngineFilter)
bool FPizzaPreview::RunTest(const FString&){ADD_LATENT_AUTOMATION_COMMAND(FEditorLoadMap(TEXT("/Game/Maps/Pizzeria")));ADD_LATENT_AUTOMATION_COMMAND(FStartPIECommand(false));ADD_LATENT_AUTOMATION_COMMAND(FStartVisualKitchen(this));return true;}
#endif

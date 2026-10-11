#if WITH_EDITOR
#include "Misc/AutomationTest.h"
#include "Tests/AutomationEditorCommon.h"
#include "Editor.h"
#include "IslandLevelOneGameMode.h"
#include "IslandWorld.h"
#include "Camera/CameraComponent.h"
#include "Components/CapsuleComponent.h"
#include "Components/StaticMeshComponent.h"
#include "Kismet/GameplayStatics.h"
#include "GameFramework/CharacterMovementComponent.h"
class FLevelOneCheck:public IAutomationLatentCommand{
 FAutomationTestBase* Test;double Start=FPlatformTime::Seconds();
 public:explicit FLevelOneCheck(FAutomationTestBase* T):Test(T){}
 bool Update()override{
  UWorld* W=GEditor?GEditor->PlayWorld.Get():nullptr;auto* G=W?Cast<AIslandGameMode>(W->GetAuthGameMode()):nullptr;
  if(!G||!G->Player()){if(FPlatformTime::Seconds()-Start<40)return false;Test->AddError(TEXT("Level-one PIE absent"));return true;}
  Test->TestTrue(TEXT("Map chooses isolated reference mode without a CLI flag"),G->IsLevelOneReferenceMode());
  Test->TestEqual(TEXT("Reference save slot"),G->SaveSlot,FString(TEXT("LerninselLevel1ReferenceV1")));
  auto* C=Cast<AIslandController>(G->Player()->Controller);
  Test->TestEqual(TEXT("Preferences selected before loading"),C->PreferencesSlot,FString(TEXT("LerninselLevel1PreferencesV1")));
  Test->TestEqual(TEXT("Only two early gates"),G->Gates.Num(),2);
  Test->TestNotNull(TEXT("Real collision terrain"),G->LevelOneTerrain);
  Test->TestTrue(TEXT("Fresh start is a real paused menu"),G->Paused&&G->LevelOneMenu==ELevelOneMenu::Start);
  return true;
 }
};
IMPLEMENT_SIMPLE_AUTOMATION_TEST(FIslandLevelOne,"GradeCrew.Lerninsel.LevelOne",EAutomationTestFlags::EditorContext|EAutomationTestFlags::EngineFilter)
bool FIslandLevelOne::RunTest(const FString&){ADD_LATENT_AUTOMATION_COMMAND(FEditorLoadMap(TEXT("/Game/Maps/Lerninsel_Level1Ref")));ADD_LATENT_AUTOMATION_COMMAND(FStartPIECommand(false));ADD_LATENT_AUTOMATION_COMMAND(FLevelOneCheck(this));ADD_LATENT_AUTOMATION_COMMAND(FEndPlayMapCommand());return true;}
#endif

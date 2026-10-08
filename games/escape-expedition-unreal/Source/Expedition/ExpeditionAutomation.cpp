#if WITH_EDITOR
#include "Misc/AutomationTest.h"
#include "Tests/AutomationEditorCommon.h"
#include "Editor.h"
#include "ExpeditionWorld.h"
#include "Engine/World.h"
#include "Misc/Paths.h"
#include "UnrealClient.h"
#include "ShaderCompiler.h"
#include "Kismet/GameplayStatics.h"
#include "Dom/JsonObject.h"
#include "Serialization/JsonSerializer.h"
#include "Serialization/JsonWriter.h"
using namespace ExpeditionV2;
class FMasterCheck:public IAutomationLatentCommand {
 FAutomationTestBase* Test;double Start=FPlatformTime::Seconds();int Phase=0;
 public:explicit FMasterCheck(FAutomationTestBase* T):Test(T){}
 bool Update()override {
 UWorld* W=GEditor?GEditor->PlayWorld.Get():nullptr;auto* G=W?Cast<AExpeditionGameMode>(W->GetAuthGameMode()):nullptr;
 if(!G){if(FPlatformTime::Seconds()-Start<35)return false;Test->AddError(TEXT("Master game not started"));return true;}
 if(GShaderCompilingManager&&GShaderCompilingManager->IsCompiling())return false;
 if(Phase==0){
 G->SaveSlot=TEXT("ExpeditionMasterAutomation");G->NewGame();
 Test->TestNotNull(TEXT("Original explorer spawned"),G->Explorer);
 Test->TestEqual(TEXT("Fifteen world targets"),G->Targets.Num(),15);
 G->MoveInput=FVector2D(1,1);G->SetDialog(EExpDialog::Question);auto P=G->Explorer->GetActorLocation();G->StepMovement(.2f);
 Test->TestTrue(TEXT("Dialog cannot move explorer"),G->Explorer->GetActorLocation().Equals(P));
 Test->TestTrue(TEXT("Opening dialog clears held movement"),G->MoveInput.IsZero()&&G->TouchInput.IsZero()&&G->NeedsRelease);
 G->SetDialog(EExpDialog::World);G->NeedsRelease=false;G->MoveInput=FVector2D(1,0);G->StepMovement(.1f);
 Test->TestTrue(TEXT("Screen right is world east"),G->Explorer->GetActorLocation().X>P.X);
 G->NewGame();G->Interact(0);Test->TestTrue(TEXT("Mara opens speech first"),G->Dialog==EExpDialog::Speech);
 G->Click(8);G->Click(101);Test->TestFalse(TEXT("Selection alone earns no bowl"),HasSchool(G->State,0));
 G->Click(9);Test->TestTrue(TEXT("Explicit check gives bowl"),HasSchool(G->State,0)&&G->Dialog==EExpDialog::Result);
 G->Click(9);Test->TestEqual(TEXT("Double submit earns one station"),G->SchoolSolved(),1);
 G->Save();G->State={};Test->TestTrue(TEXT("Valid save restores bowl"),G->Load()&&HasSchool(G->State,0));
 G->NewGame();G->OpenSchool(0);G->Click(100);G->Click(9);G->Click(100);G->Click(9);G->Click(101);G->Click(9);
 Test->TestTrue(TEXT("Two mistakes trigger persisted transfer"),G->State.pending[0]&&!HasSchool(G->State,0));
 G->Save();G->State={};Test->TestTrue(TEXT("Transfer survives reload"),G->Load()&&G->State.pending[0]);
 G->NewGame();G->SetDialog(EExpDialog::World);G->RebuildUI();FScreenshotRequest::RequestScreenshot(FPaths::ProjectDir()/TEXT("Reports/Mastergame/Village.png"),false,false);
 Start=FPlatformTime::Seconds();Phase=1;return false;
 }
 if(Phase==1){if(FPlatformTime::Seconds()-Start<2)return false;
 G->NewGame();const int Target[]={0,3,4,6,8,10,11};const int Option[]={1,0,2,2,2,1,2};
 auto Solve=[&](int i){G->Interact(Target[i]);if(G->Dialog==EExpDialog::Speech)G->Click(8);G->Click(100+Option[i]);G->Click(9);G->Click(10);Test->TestTrue(FString::Printf(TEXT("School %d complete"),i),HasSchool(G->State,i));};
 Solve(0);Solve(1);Solve(2);G->Interact(5);G->Click(302);G->Click(310);G->Click(3);Solve(3);
 G->Interact(7);G->Click(400);Test->TestFalse(TEXT("Jetty blocked without rope"),HasLogic(G->State,2));G->Click(3);
 G->Interact(1);G->Interact(2);G->Click(200);G->Click(3);G->Interact(7);G->Click(401);G->Click(410);Test->TestTrue(TEXT("Wrong post keeps rope"),ItemState(G->State,2)==1);
 G->Click(401);G->Click(400);G->Click(402);G->Click(410);G->Click(3);Test->TestTrue(TEXT("Jetty now physically reachable"),G->CanWalk(FVector(3700,0,70)));
 Solve(4);G->Interact(9);G->Click(502);G->Click(511);G->Click(3);Solve(5);Solve(6);
 G->Interact(12);G->Click(600);G->Click(601);G->Click(602);G->Click(611);G->Click(3);Test->TestFalse(TEXT("Door does not ignite automatically"),G->State.finale);
 G->Interact(13);G->Click(620);Test->TestTrue(TEXT("Twelve stations and manual finale complete"),G->State.finale&&G->Solved()==12);
 G->Save();G->State={};Test->TestTrue(TEXT("Finale reload invariant"),G->Load()&&G->State.finale&&Validate(G->State));
 G->Explorer->SetActorLocation(FVector(5370,160,70));G->SetDialog(EExpDialog::World);G->RefreshWorld();Start=FPlatformTime::Seconds();Phase=2;return false;
 }
 if(FPlatformTime::Seconds()-Start<2)return false;
 FScreenshotRequest::RequestScreenshot(FPaths::ProjectDir()/TEXT("Reports/Mastergame/Ruin.png"),false,false);
 UGameplayStatics::DeleteGameInSlot(G->SaveSlot,0);return true;
 }
};
IMPLEMENT_SIMPLE_AUTOMATION_TEST(FExpeditionMaster,"GradeCrew.Expedition.MasterRoute",EAutomationTestFlags::EditorContext|EAutomationTestFlags::EngineFilter)
bool FExpeditionMaster::RunTest(const FString&){ADD_LATENT_AUTOMATION_COMMAND(FEditorLoadMap(TEXT("/Game/Maps/Amazonas")));ADD_LATENT_AUTOMATION_COMMAND(FStartPIECommand(false));ADD_LATENT_AUTOMATION_COMMAND(FMasterCheck(this));ADD_LATENT_AUTOMATION_COMMAND(FEndPlayMapCommand());return true;}
#endif

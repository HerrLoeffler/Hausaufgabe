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
class FExpeditionCheck:public IAutomationLatentCommand{
 FAutomationTestBase* Test;double Began=FPlatformTime::Seconds();bool Shot=false;
 public:FExpeditionCheck(FAutomationTestBase* T):Test(T){}bool Update()override{
 UWorld* W=GEditor?GEditor->PlayWorld.Get():nullptr;auto* G=W?Cast<AExpeditionGameMode>(W->GetAuthGameMode()):nullptr;
 if(!G){if(FPlatformTime::Seconds()-Began<30)return false;Test->AddError(TEXT("Expedition did not start"));return true;}
 if(GShaderCompilingManager&&GShaderCompilingManager->IsCompiling())return false;
 if(!Shot){
 G->SaveSlot=TEXT("ExpeditionAutomation");G->NewGame(false);
 Test->TestTrue(TEXT("Player exists"),G->Explorer!=nullptr);
 G->Dialog=7;G->MoveInput=FVector2D(1,1);const FVector P=G->Explorer->GetActorLocation();G->StepMovement(.3f);
 Test->TestTrue(TEXT("Dialog blocks held movement"),G->Explorer->GetActorLocation().Equals(P));
 G->CancelInput();Test->TestTrue(TEXT("Held input cancelled"),G->MoveInput.IsZero());
 G->Dialog=0;G->OpenLearning(0);G->Answer((G->Question().Correct+1)%4);G->Dialog=0;G->OpenLearning(0);
 G->Answer(G->Question().Correct);Test->TestTrue(TEXT("Reopening notes cannot bypass transfer"),G->Transfer&&!(G->State.slots&1));
 G->Save();G->Failures[0]=0;G->TransferRequired[0]=false;Test->TestTrue(TEXT("Valid local save loads"),G->Load());G->Dialog=0;G->OpenLearning(0);Test->TestTrue(TEXT("Transfer phase survives save and resume"),G->Transfer);
 G->NewGame(false);G->MoveInput=FVector2D(1,0);G->StepMovement(.1f);Test->TestTrue(TEXT("Screen right increases world X"),G->Explorer->GetActorLocation().X>-1050);
 G->NewGame(false);
 G->Dialog=0;G->RefreshWorld();FScreenshotRequest::RequestScreenshot(FPaths::ProjectDir()/TEXT("Reports/Camp.png"),false,false);
 Shot=true;Began=FPlatformTime::Seconds();return false;
 }
 if(FPlatformTime::Seconds()-Began<2)return false;
 Test->TestTrue(TEXT("Physical bridge initially closed"),!G->State.bridge);
 return true;
 }};
IMPLEMENT_SIMPLE_AUTOMATION_TEST(FExpeditionSmoke,"GradeCrew.Expedition.Smoke",EAutomationTestFlags::EditorContext|EAutomationTestFlags::EngineFilter)
bool FExpeditionSmoke::RunTest(const FString&){ADD_LATENT_AUTOMATION_COMMAND(FEditorLoadMap(TEXT("/Game/Maps/Amazonas")));ADD_LATENT_AUTOMATION_COMMAND(FStartPIECommand(false));ADD_LATENT_AUTOMATION_COMMAND(FExpeditionCheck(this));ADD_LATENT_AUTOMATION_COMMAND(FEndPlayMapCommand());return true;}
class FFullRoute:public IAutomationLatentCommand{
 FAutomationTestBase* Test;double Began=FPlatformTime::Seconds();int Phase=0;
 public:FFullRoute(FAutomationTestBase* T):Test(T){}bool Update()override{
 UWorld* W=GEditor?GEditor->PlayWorld.Get():nullptr;auto* G=W?Cast<AExpeditionGameMode>(W->GetAuthGameMode()):nullptr;
 if(!G){if(FPlatformTime::Seconds()-Began<30)return false;Test->AddError(TEXT("Full route did not start"));return true;}
 if(GShaderCompilingManager&&GShaderCompilingManager->IsCompiling())return false;
 if(Phase==0){
 G->SaveSlot=TEXT("ExpeditionRouteAutomation");
 for(bool Word:{false,true}){
 G->NewGame(Word);G->OpenLearning(0);G->Answer(G->Question().Correct);G->Answer(G->Question().Correct);
 Test->TestTrue(TEXT("Camp questions solved; map not auto solved"),G->State.slots==3&&!G->State.mapJoined);
 G->Interact(0);G->Interact(1);G->Click(201);G->Click(202);G->Click(212);
 Test->TestTrue(TEXT("Route derived from joined map"),G->State.path==2);
 G->Explorer->SetActorLocation(FVector(-420,-180,80));G->OpenLearning(1);for(int I=0;I<3;++I)G->Answer(G->Question().Correct);
 G->Interact(2);G->Interact(3);G->Interact(23);Test->TestTrue(TEXT("Wrong post did not remove rope"),(G->State.inventory&4)!=0);
 G->Interact(22);G->Interact(24);G->Click(330);G->Click(331);Test->TestTrue(TEXT("Winding really opens bridge"),G->State.bridge);
 G->Explorer->SetActorLocation(FVector(590,-150,80));G->OpenLearning(2);for(int I=0;I<3;++I)G->Answer(G->Question().Correct);
 G->Interact(4);G->Interact(30);G->Click(402);Test->TestTrue(TEXT("Overload stays reversible"),Expedition::Power(G->State)==12&&!G->State.finale);
 G->Click(400);G->Click(420);Test->TestTrue(TEXT("Real lesson and puzzle actions finish"),G->State.finale&&G->State.slots==255);
 G->Save();G->State=Expedition::State();Test->TestTrue(TEXT("Finished route resumes"),G->Load()&&G->State.finale);
 G->Click(400);Test->TestTrue(TEXT("Post-finale action preserves save"),Expedition::Valid(G->State));
 }
 G->Dialog=0;G->RefreshWorld();Began=FPlatformTime::Seconds();Phase=1;return false;
 }
 if(FPlatformTime::Seconds()-Began<2)return false;
 FScreenshotRequest::RequestScreenshot(FPaths::ProjectDir()/TEXT("Reports/Finale.png"),false,false);
 return true;
 }};
IMPLEMENT_SIMPLE_AUTOMATION_TEST(FExpeditionRoute,"GradeCrew.Expedition.FullRoute",EAutomationTestFlags::EditorContext|EAutomationTestFlags::EngineFilter)
bool FExpeditionRoute::RunTest(const FString&){ADD_LATENT_AUTOMATION_COMMAND(FEditorLoadMap(TEXT("/Game/Maps/Amazonas")));ADD_LATENT_AUTOMATION_COMMAND(FStartPIECommand(false));ADD_LATENT_AUTOMATION_COMMAND(FFullRoute(this));ADD_LATENT_AUTOMATION_COMMAND(FEndPlayMapCommand());return true;}
#endif

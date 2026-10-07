#if WITH_EDITOR
#include "Misc/AutomationTest.h"
#include "Tests/AutomationEditorCommon.h"
#include "Editor.h"
#include "IslandWorld.h"
#include "Camera/CameraComponent.h"
#include "Components/CapsuleComponent.h"
#include "GameFramework/CharacterMovementComponent.h"
#include "Kismet/GameplayStatics.h"
#include "Misc/Paths.h"
#include "ShaderCompiler.h"
#include "UnrealClient.h"
class FIslandPlayCheck:public IAutomationLatentCommand{
 FAutomationTestBase* Test;double Started=FPlatformTime::Seconds();int Phase=0;
 public:explicit FIslandPlayCheck(FAutomationTestBase* T):Test(T){} bool Update()override{
 UWorld* W=GEditor?GEditor->PlayWorld.Get():nullptr;auto* G=W?Cast<AIslandGameMode>(W->GetAuthGameMode()):nullptr;
 if(!G){if(FPlatformTime::Seconds()-Started<40)return false;Test->AddError(TEXT("Lerninsel did not enter PIE"));return true;}
 if(GShaderCompilingManager&&GShaderCompilingManager->IsCompiling())return false;
 auto* P=Cast<AIslandCharacter>(UGameplayStatics::GetPlayerPawn(W,0));auto* C=P?Cast<AIslandController>(P->GetController()):nullptr;
 if(!P){Test->AddError(TEXT("Ego character missing"));return true;}
 if(Phase==0){
 G->SaveSlot=TEXT("LerninselAutomationOnly");G->ResetDemo();
 Test->TestEqual(TEXT("Default FOV"),P->Camera->FieldOfView,75.f);
 Test->TestEqual(TEXT("Eyes160cm above floor"),double(P->GetCapsuleComponent()->GetScaledCapsuleHalfHeight()+P->Camera->GetRelativeLocation().Z),160.0);
 Test->TestTrue(TEXT("Closed main gate has blocking collision"),G->GateBlocks(1));
 G->Interact(400);Test->TestFalse(TEXT("Remote fountain cannot fill"),G->State.carrying);
 P->SetActorLocation(FVector(2350,-220,88));G->Interact(401);Test->TestTrue(TEXT("Nearby bucket pickup"),G->State.carrying);
 P->SetActorLocation(FVector(2350,-420,88));G->Interact(400);
 Test->TestEqual(TEXT("Stroke not committed early"),G->State.tenths,0);
 G->Interact(400);G->Tick(.7f);Test->TestEqual(TEXT("Double input during stroke counts once"),G->State.tenths,1);
 G->Save();const FString Saved=FString(UTF8_TO_TCHAR(Island::Serialize(G->State).c_str()));G->State=Island::State();Test->TestTrue(TEXT("Saved snapshot loads"),G->Load());Test->TestEqual(TEXT("Exact saved rule state"),FString(UTF8_TO_TCHAR(Island::Serialize(G->State).c_str())),Saved);
 C->TouchMove=FVector2D(1,1);C->Ownership.Begin(0,.1,.7);C->CancelInput();Test->TestTrue(TEXT("Cancel clears motion and finger"),C->TouchMove.IsZero()&&C->Ownership.Role(0)==Island::TouchRole::None);
 G->Focus=100;C->Escape();Test->TestEqual(TEXT("Escape closes context first"),G->Focus,-1);Test->TestFalse(TEXT("First Escape does not pause"),G->Paused);
 C->Escape();Test->TestTrue(TEXT("Next Escape pauses"),G->Paused);G->Paused=false;
 G->ResetDemo();FScreenshotRequest::RequestScreenshot(FPaths::ProjectDir()/TEXT("Reports/Arrival.png"),true,false);Started=FPlatformTime::Seconds();Phase=1;return false;
 }
 if(FPlatformTime::Seconds()-Started<2)return false;
 if(Phase==1){
 Island::Apply(G->State,Island::Action::IntroToggle,0);Island::Apply(G->State,Island::Action::IntroToggle,2);Island::Apply(G->State,Island::Action::IntroCheck);Island::Apply(G->State,Island::Action::PathStart);
 for(int id:{0,4,8})Island::Apply(G->State,Island::Action::PathStep,id);Island::Apply(G->State,Island::Action::PathCheck);
 Test->TestTrue(TEXT("Correct rules alone still await gate animation"),G->GateBlocks(1));G->RefreshWorld(1.5f);Test->TestFalse(TEXT("Open gate releases collision only after animation"),G->GateBlocks(1));
 P->SetActorLocation(FVector(50,0,88));C->SetControlRotation(FRotator(-25,0,0));FScreenshotRequest::RequestScreenshot(FPaths::ProjectDir()/TEXT("Reports/VerbGarden.png"),true,false);Started=FPlatformTime::Seconds();Phase=2;return false;
 }
 if(Phase==2){P->SetActorLocation(FVector(2150,-20,88));C->SetControlRotation(FRotator(-12,-18,0));G->State.tenths=3;G->State.carrying=false;G->State.bucketPlace=0;G->RefreshWorld(0);FScreenshotRequest::RequestScreenshot(FPaths::ProjectDir()/TEXT("Reports/BucketTerrace.png"),true,false);Started=FPlatformTime::Seconds();Phase=3;return false;}
 Test->TestEqual(TEXT("Three tenths visible water height"),G->BucketWaterHeight(),10.8f);
 return true;
 }};
IMPLEMENT_SIMPLE_AUTOMATION_TEST(FIslandSmoke,"GradeCrew.Lerninsel.Play",EAutomationTestFlags::EditorContext|EAutomationTestFlags::EngineFilter)
bool FIslandSmoke::RunTest(const FString&){ADD_LATENT_AUTOMATION_COMMAND(FEditorLoadMap(TEXT("/Game/Maps/Lerninsel")));ADD_LATENT_AUTOMATION_COMMAND(FStartPIECommand(false));ADD_LATENT_AUTOMATION_COMMAND(FIslandPlayCheck(this));ADD_LATENT_AUTOMATION_COMMAND(FEndPlayMapCommand());return true;}
#endif

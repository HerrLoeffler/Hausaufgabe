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
#include "Engine/GameViewportClient.h"
#include "ImageUtils.h"
#include "Misc/FileHelper.h"
#include "GameFramework/InputSettings.h"
#include "GameFramework/PlayerInput.h"
#include "InputKeyEventArgs.h"
#include "EngineUtils.h"
#include "Engine/DirectionalLight.h"
#include "Components/DirectionalLightComponent.h"
#include <limits>
namespace {
bool CaptureGame(UWorld* W,const TCHAR* Name){auto* Client=W?W->GetGameViewport():nullptr;auto* V=Client?Client->Viewport:nullptr;if(!V)return false;TArray<FColor> Pixels;if(!V->ReadPixels(Pixels))return false;FIntPoint Size=V->GetSizeXY();TArray64<uint8> Bytes;FImageUtils::PNGCompressImageArray(Size.X,Size.Y,Pixels,Bytes);return FFileHelper::SaveArrayToFile(Bytes,*(FPaths::ProjectDir()/TEXT("Reports")/Name));}
}
class FIslandPlayCheck:public IAutomationLatentCommand{
 FAutomationTestBase* Test;double Started=FPlatformTime::Seconds();int Phase=0;
 public:explicit FIslandPlayCheck(FAutomationTestBase* T):Test(T){} bool Update()override{
 UWorld* W=GEditor?GEditor->PlayWorld.Get():nullptr;auto* G=W?Cast<AIslandGameMode>(W->GetAuthGameMode()):nullptr;
 if(!G){if(FPlatformTime::Seconds()-Started<40)return false;Test->AddError(TEXT("Lerninsel did not enter PIE"));return true;}
 if(GShaderCompilingManager&&GShaderCompilingManager->IsCompiling()){if(FPlatformTime::Seconds()-Started<90)return false;Test->AddError(TEXT("Shader compilation timed out"));return true;}
 auto* P=Cast<AIslandCharacter>(UGameplayStatics::GetPlayerPawn(W,0));auto* C=P?Cast<AIslandController>(P->GetController()):nullptr;
 if(!P){Test->AddError(TEXT("Ego character missing"));return true;}
 if(Phase==0){
 G->SaveSlot=TEXT("LerninselAutomationOnly");G->ResetDemo();
 for(TActorIterator<ADirectionalLight> Sun(W);Sun;++Sun)Test->TestEqual(TEXT("Authored sun is movable, no unbuilt lightmap preview"),Sun->GetComponentByClass<UDirectionalLightComponent>()->Mobility,EComponentMobility::Movable);
 TArray<FInputAxisKeyMapping> ForwardKeys,RightKeys;GetDefault<UInputSettings>()->GetAxisMappingByName(TEXT("Forward"),ForwardKeys);GetDefault<UInputSettings>()->GetAxisMappingByName(TEXT("Right"),RightKeys);
 Test->TestTrue(TEXT("W reaches forward axis"),ForwardKeys.ContainsByPredicate([](const FInputAxisKeyMapping& M){return M.Key==EKeys::W&&M.Scale==1;}));
 Test->TestTrue(TEXT("D reaches right axis"),RightKeys.ContainsByPredicate([](const FInputAxisKeyMapping& M){return M.Key==EKeys::D&&M.Scale==1;}));
 C->KeysArmed=true;P->ConsumeMovementInputVector();C->InputKey(FInputKeyEventArgs(nullptr,FInputDeviceId::CreateFromInternalId(0),EKeys::W,IE_Pressed,FPlatformTime::Cycles64()));
 TArray<UInputComponent*> Stack={P->InputComponent};C->PlayerInput->ProcessInputStack(Stack,.1f,false);Test->TestTrue(TEXT("Keyboard W routes through binding into pawn movement"),P->GetPendingMovementInputVector().X>0);
 C->InputKey(FInputKeyEventArgs(nullptr,FInputDeviceId::CreateFromInternalId(0),EKeys::W,IE_Released,FPlatformTime::Cycles64()));P->ConsumeMovementInputVector();
 Test->TestEqual(TEXT("Default FOV"),P->Camera->FieldOfView,75.f);
 Test->TestEqual(TEXT("Eyes160cm above floor"),double(P->GetCapsuleComponent()->GetScaledCapsuleHalfHeight()+P->Camera->GetRelativeLocation().Z),160.0);
 Test->TestTrue(TEXT("Closed main gate has blocking collision"),G->GateBlocks(1));
 P->SetActorLocation(FVector(1200,0,90));FHitResult GateHit;P->SetActorLocation(FVector(1450,0,90),true,&GateHit);Test->TestTrue(TEXT("Closed gate really blocks capsule sweep"),GateHit.bBlockingHit&&P->GetActorLocation().X<1350);
 G->Interact(400);Test->TestFalse(TEXT("Remote fountain cannot fill"),G->State.carrying);
 G->State.intro=G->State.verbs=G->State.sentence=true;G->State.introMask=5;G->State.pathCount=3;G->State.path={{0,4,8}};G->State.sentenceCount=4;G->State.sentenceParts={{0,1,2,3}};
 P->SetActorLocation(G->Target(401)->Pos);G->Interact(401);Test->TestTrue(TEXT("Nearby bucket pickup"),G->State.carrying);
 P->SetActorLocation(G->Target(400)->Pos);G->Interact(400);
 Test->TestEqual(TEXT("Stroke not committed early"),G->State.tenths,0);
 G->Interact(400);G->Tick(.7f);Test->TestEqual(TEXT("Double input during stroke counts once"),G->State.tenths,1);
 G->Interact(400);C->Escape();C->Escape();G->Tick(.7f);Test->TestEqual(TEXT("Pause cancels unconfirmed fill, including after resume"),G->State.tenths,1);
 G->Save();const FString Saved=FString(UTF8_TO_TCHAR(Island::Serialize(G->State).c_str()));G->State=Island::State();Test->TestTrue(TEXT("Saved snapshot loads"),G->Load());Test->TestEqual(TEXT("Exact saved rule state"),FString(UTF8_TO_TCHAR(Island::Serialize(G->State).c_str())),Saved);
 for(int Wrong:{2,4}){G->State.water=false;P->SetActorLocation(G->Target(403)->Pos+FVector(0,0,80));G->State.carrying=true;G->State.tenths=Wrong;G->Interact(403);Test->TestFalse(TEXT("Wrong amount never opens gate"),G->State.water);G->Tick(0);Test->TestEqual(TEXT("Wrong bucket on plate exposes pickup through nearest interaction"),G->Near,401);C->Interact();Test->TestTrue(TEXT("Normal E interaction recovers wrong bucket"),G->State.carrying);
 if(G->State.carrying){P->SetActorLocation(Wrong==2?G->Target(400)->Pos:G->Target(402)->Pos);G->Tick(0);C->Interact();G->Tick(.7f);Test->TestEqual(TEXT("Normal correction produces3/10"),G->State.tenths,3);P->SetActorLocation(G->Target(403)->Pos+FVector(0,0,80));G->Tick(0);C->Interact();Test->TestTrue(TEXT("Corrected bucket opens water gate"),G->State.water);}}
 C->TouchMove=FVector2D(1,1);C->Ownership.Begin(0,.1,.7);C->CancelInput();Test->TestTrue(TEXT("Cancel clears motion and finger"),C->TouchMove.IsZero()&&C->Ownership.Role(0)==Island::TouchRole::None);
 G->Focus=100;C->Escape();Test->TestEqual(TEXT("Escape closes context first"),G->Focus,-1);Test->TestFalse(TEXT("First Escape does not pause"),G->Paused);
 C->Escape();Test->TestTrue(TEXT("Next Escape pauses"),G->Paused);G->Paused=false;
 G->ResetDemo();Started=FPlatformTime::Seconds();Phase=1;return false;
 }
 if(FPlatformTime::Seconds()-Started<2)return false;
 if(Phase==1){
 Test->TestTrue(TEXT("Actual game viewport arrival captured"),CaptureGame(W,TEXT("Arrival.png")));
 for(int Id:{0,2}){P->SetActorLocation(G->Target(100+Id)->Pos+FVector(0,0,80));G->Interact(100+Id);G->SelectFocused();}
 P->SetActorLocation(FVector(-330,0,88));G->Interact(11);Test->TestTrue(TEXT("Runtime probe opens intro milestone"),G->State.intro);
 P->SetActorLocation(FVector(50,-425,88));G->Interact(20);
 P->SetActorLocation(G->Target(200)->Pos+FVector(0,0,80));G->Tick(.15f);Test->TestEqual(TEXT("Foot contact under dwell does not select"),G->State.pathCount,0);G->Tick(.16f);Test->TestEqual(TEXT("Centered foot dwell selects first verb"),G->State.pathCount,1);G->Tick(.7f);Test->TestEqual(TEXT("Remaining on one tile never selects twice"),G->State.pathCount,1);
 for(int Id:{4,8}){P->SetActorLocation(G->Target(200+Id)->Pos+FVector(0,0,80));G->Tick(.31f);}
 P->SetActorLocation(FVector(1150,0,88));G->Interact(21);Test->TestTrue(TEXT("Runtime verb route confirms milestone"),G->State.verbs);
 Test->TestTrue(TEXT("Correct rules alone still await gate animation"),G->GateBlocks(1));G->RefreshWorld(.94f);P->SetActorLocation(FVector(1200,75,90));FHitResult OpeningHit;P->SetActorLocation(FVector(1450,75,90),true,&OpeningHit);Test->TestTrue(TEXT("Part-open gate still physically blocks the clear side gap"),OpeningHit.bBlockingHit);G->RefreshWorld(1.5f);Test->TestFalse(TEXT("Open gate releases collision only after animation"),G->GateBlocks(1));
 P->SetActorLocation(FVector(1200,75,90));FHitResult ReleasedHit;P->SetActorLocation(FVector(1450,75,90),true,&ReleasedHit);Test->TestFalse(TEXT("Fully open doorway permits actual capsule passage"),ReleasedHit.bBlockingHit);
 G->Save();auto* Damaged=Cast<UIslandSave>(UGameplayStatics::LoadGameFromSlot(G->SaveSlot,0));Damaged->Position=FVector(99999,0,88);UGameplayStatics::SaveGameToSlot(Damaged,G->SaveSlot,0);G->State=Island::State();Test->TestTrue(TEXT("Valid milestones survive invalid saved transform"),G->Load());Test->TestTrue(TEXT("Recovered save keeps solved verb milestone"),G->State.verbs);Test->TestEqual(TEXT("Invalid saved transform falls back to safe arrival"),P->GetActorLocation().X,-1600.0);
 Damaged->Position=FVector(-1600,0,88);Damaged->View=FRotator(std::numeric_limits<double>::quiet_NaN(),0,0);UGameplayStatics::SaveGameToSlot(Damaged,G->SaveSlot,0);G->State=Island::State();Test->TestTrue(TEXT("Valid milestones survive invalid saved view"),G->Load());Test->TestEqual(TEXT("Invalid view becomes safe default"),C->GetControlRotation().Pitch,-4.0);G->Save();G->State=Island::State();Test->TestTrue(TEXT("Recovered snapshot can save and load again"),G->Load());Test->TestTrue(TEXT("Recovery roundtrip retains solved milestone"),G->State.verbs);
 P->SetActorLocation(FVector(50,0,88));C->SetControlRotation(FRotator(-25,0,0));Started=FPlatformTime::Seconds();Phase=2;return false;
 }
 if(Phase==2){Test->TestTrue(TEXT("Actual game viewport garden captured"),CaptureGame(W,TEXT("VerbGarden.png")));P->SetActorLocation(FVector(3550,-20,88));C->SetControlRotation(FRotator(-12,-18,0));G->State.tenths=3;G->State.carrying=false;G->State.bucketPlace=0;G->RefreshWorld(0);Started=FPlatformTime::Seconds();Phase=3;return false;}
 if(Phase==3){Test->TestTrue(TEXT("Actual game viewport terrace captured"),CaptureGame(W,TEXT("BucketTerrace.png")));Test->TestEqual(TEXT("Three tenths visible water height"),G->BucketWaterHeight(),4.8f);G->State.carrying=true;G->RefreshWorld(0);Started=FPlatformTime::Seconds();Phase=4;return false;}
 Test->TestTrue(TEXT("Carried one-liter bucket and enlarged tenths scale captured"),CaptureGame(W,TEXT("CarriedBucket.png")));
 return true;
 }};
IMPLEMENT_SIMPLE_AUTOMATION_TEST(FIslandSmoke,"GradeCrew.Lerninsel.Play",EAutomationTestFlags::EditorContext|EAutomationTestFlags::EngineFilter)
bool FIslandSmoke::RunTest(const FString&){ADD_LATENT_AUTOMATION_COMMAND(FEditorLoadMap(TEXT("/Game/Maps/Lerninsel")));ADD_LATENT_AUTOMATION_COMMAND(FStartPIECommand(false));ADD_LATENT_AUTOMATION_COMMAND(FIslandPlayCheck(this));ADD_LATENT_AUTOMATION_COMMAND(FEndPlayMapCommand());return true;}
#endif

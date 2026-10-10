#if WITH_EDITOR
#include "Misc/AutomationTest.h"
#include "Tests/AutomationEditorCommon.h"
#include "Editor.h"
#include "IslandWorld.h"
#include "GameFramework/PlayerInput.h"
#include "GameFramework/CharacterMovementComponent.h"
#include "InputKeyEventArgs.h"
#include "Kismet/GameplayStatics.h"
#include "Engine/GameViewportClient.h"
#include "Framework/Application/SlateApplication.h"
#include "Widgets/SViewport.h"
#include "ImageUtils.h"
#include "Misc/FileHelper.h"
#include "Misc/Paths.h"

// This extends the existing native PIE runner. Keyboard events enter the real
// controller/pawn bindings; world movement, collisions and plate contact tick
// normally. The controller's OS-focus tick is disabled in unattended PIE;
// its real input stack is pumped explicitly. OS focus has a separate desktop
// recipe. Reset/Save/Load and the focus-loss notification are fixtures.
class FIslandRuntimeSequence:public IAutomationLatentCommand {
 FAutomationTestBase* T;
 double Started=FPlatformTime::Seconds(),StepStarted=Started;
 int Phase=0,WalkFrames=0; FKey Held; FVector BeforePause,ResumePosition;
 FString Trace;
 void Key(AIslandController* C,FKey K,EInputEvent E) {
  C->InputKey(FInputKeyEventArgs(nullptr,FInputDeviceId::CreateFromInternalId(0),K,E,FPlatformTime::Cycles64()));
 }
 void Stop(AIslandController* C) {if(Held.IsValid())Key(C,Held,IE_Released);Held=FKey();}
 void Tap(AIslandController* C,FKey K) {
  Stop(C);Key(C,K,IE_Pressed);
  TArray<UInputComponent*> Stack={C->GetPawn()->InputComponent,C->InputComponent};
  C->PlayerInput->ProcessInputStack(Stack,1.f/60.f,false);Key(C,K,IE_Released);
  C->PlayerInput->ProcessInputStack(Stack,1.f/60.f,false);
 }
 void Record(AIslandGameMode* G,const TCHAR* Label) {
  Trace+=FString::Printf(TEXT("%s phase=%d frames=%d position=%s near=%d introMask=%d intro=%d paused=%d velocity=%s\n"),Label,Phase,WalkFrames,*G->Player()->GetActorLocation().ToString(),G->Near,G->State.introMask,G->State.intro,G->Paused,*G->Player()->GetVelocity().ToString());
 }
 bool Capture(UWorld* W,const TCHAR* Label) {
  auto* Client=W->GetGameViewport();auto Widget=Client?Client->GetGameViewportWidget():TSharedPtr<SViewport>();
  if(!Widget.IsValid())return false;TArray<FColor> Pixels;FIntVector Size;
  if(!FSlateApplication::Get().TakeScreenshot(Widget.ToSharedRef(),Pixels,Size))return false;
  TArray64<uint8> Bytes;FImageUtils::PNGCompressImageArray(Size.X,Size.Y,Pixels,Bytes);
  return FFileHelper::SaveArrayToFile(Bytes,*(FPaths::ProjectDir()/TEXT("Reports/RuntimeSequence")/Label));
 }
 void Next(AIslandController* C) {Stop(C);++Phase;StepStarted=FPlatformTime::Seconds();}
 bool Walk(AIslandGameMode* G,AIslandController* C,FVector2D Goal) {
  FVector L=G->Player()->GetActorLocation();FKey K;
  if(FMath::Abs(L.Y-Goal.Y)>15)K=L.Y<Goal.Y?EKeys::D:EKeys::A;
  else if(FMath::Abs(L.X-Goal.X)>15)K=L.X<Goal.X?EKeys::W:EKeys::S;
  else {Stop(C);Record(G,TEXT("arrived"));return true;}
  if(K!=Held){Stop(C);Held=K;Key(C,K,IE_Pressed);}++WalkFrames;
  if(FPlatformTime::Seconds()-StepStarted>12){Record(G,TEXT("walk_timeout"));T->AddError(TEXT("Input-driven walk failed to reach waypoint; inspect trace/focus/collision"));Stop(C);Phase=99;return true;}
  return false;
 }
 public:explicit FIslandRuntimeSequence(FAutomationTestBase* Test):T(Test){}
 bool Update()override {
  auto* W=GEditor?GEditor->PlayWorld.Get():nullptr;auto* G=W?Cast<AIslandGameMode>(W->GetAuthGameMode()):nullptr;
  auto* P=G?G->Player():nullptr;auto* C=P?Cast<AIslandController>(P->Controller):nullptr;
  if(!C){if(FPlatformTime::Seconds()-Started<40)return false;T->AddError(TEXT("Runtime sequence PIE unavailable"));return true;}
  if(Phase==0){
   IFileManager::Get().MakeDirectory(*(FPaths::ProjectDir()/TEXT("Reports/RuntimeSequence")),true);
   G->SaveSlot=TEXT("LerninselPocockRuntimeAutomationOnly");G->ResetDemo();C->CancelInput();C->KeysArmed=true;C->UpdateMode();C->SetActorTickEnabled(false);
   C->SetControlRotation(FRotator(-35,0,0));Record(G,TEXT("reset_start"));T->TestTrue(TEXT("Native reset start captured"),Capture(W,TEXT("00-start.png")));
   Next(C);return false;
  }
  // Pump actual bindings without pretending an unattended editor owns OS focus.
  // The pawn and CharacterMovement continue ticking/colliding in the PIE world.
  if(!C->KeysArmed&&!C->IsInputKeyDown(EKeys::W)&&!C->IsInputKeyDown(EKeys::A)&&!C->IsInputKeyDown(EKeys::S)&&!C->IsInputKeyDown(EKeys::D))C->KeysArmed=true;
  TArray<UInputComponent*> Stack={P->InputComponent,C->InputComponent};
  C->PlayerInput->ProcessInputStack(Stack,W->GetDeltaSeconds(),false);
  if(Phase==1){if(Walk(G,C,FVector2D(-940,-180))){if(Phase==99)return false;Tap(C,EKeys::E);T->TestEqual(TEXT("Input E selects first verb once"),G->State.introMask,1);Next(C);}return false;}
  if(Phase==2){if(Walk(G,C,FVector2D(-940,180))){if(Phase==99)return false;Tap(C,EKeys::E);T->TestEqual(TEXT("Input E keeps wrong pair inspectable"),G->State.introMask,3);T->TestFalse(TEXT("Wrong pair keeps gate locked"),G->State.intro);Record(G,TEXT("wrong_pair"));T->TestTrue(TEXT("Native wrong answer captured"),Capture(W,TEXT("01-wrong.png")));Next(C);}return false;}
  if(Phase==3){if(FPlatformTime::Seconds()-StepStarted<.3)return false;Tap(C,EKeys::E);T->TestEqual(TEXT("Second conscious E removes wrong word"),G->State.introMask,1);Next(C);return false;}
  if(Phase==4){if(Walk(G,C,FVector2D(-600,-180))){if(Phase==99)return false;Tap(C,EKeys::E);T->TestTrue(TEXT("Input-driven corrected answer solves intro"),G->State.intro);T->TestEqual(TEXT("Only the two verbs are selected"),G->State.introMask,5);Record(G,TEXT("correct_pair"));T->TestTrue(TEXT("Native correct answer captured"),Capture(W,TEXT("02-correct.png")));Next(C);}return false;}
  if(Phase==5){if(Walk(G,C,FVector2D(80,0))){if(Phase==99)return false;T->TestTrue(TEXT("Input-driven character physically crossed solved first gate"),P->GetActorLocation().X>0);Record(G,TEXT("gate_crossed"));T->TestTrue(TEXT("Native gate passage captured"),Capture(W,TEXT("03-passage.png")));Next(C);}return false;}
  if(Phase==6){Tap(C,EKeys::Escape);T->TestTrue(TEXT("Keyboard Escape pauses real game"),G->Paused);BeforePause=P->GetActorLocation();Next(C);Held=EKeys::W;Key(C,Held,IE_Pressed);return false;}
  if(Phase==7){if(FPlatformTime::Seconds()-StepStarted<.5)return false;T->TestTrue(TEXT("Pause prevents world displacement"),FVector::Dist2D(BeforePause,P->GetActorLocation())<5);Tap(C,EKeys::Escape);T->TestFalse(TEXT("Keyboard Escape resumes real game"),G->Paused);Next(C);return false;}
  if(Phase==8){if(Walk(G,C,FVector2D(220,0))){if(Phase==99)return false;
   // Regression oracle: removing the focus-loss cancellation must fail here.
   C->TouchMove=FVector2D(0,1);C->Ownership.Begin(0,.1,.7);P->GetCharacterMovement()->Velocity=FVector(100,0,0);
   C->HandleWindowFocus(false);T->TestTrue(TEXT("Focus loss pauses"),G->Paused);
   T->TestTrue(TEXT("Focus loss cancels held touch ownership and movement"),C->TouchMove.IsZero()&&C->Ownership.Role(0)==Island::TouchRole::None&&P->GetVelocity().IsNearlyZero());
   Record(G,TEXT("focus_lost"));T->TestTrue(TEXT("Native focus-loss pause captured"),Capture(W,TEXT("04-focus-pause.png")));C->HandleWindowFocus(true);Tap(C,EKeys::Escape);Next(C);}return false;}
  if(Phase==9){if(FPlatformTime::Seconds()-StepStarted<.5)return false;T->TestFalse(TEXT("Resume does not retain a moving touch"),!C->TouchMove.IsZero());G->Save();ResumePosition=P->GetActorLocation();G->ResetDemo();T->TestFalse(TEXT("Reset clears solved milestone in this synthetic session"),G->State.intro);T->TestTrue(TEXT("Saved session reloads"),G->Load());T->TestTrue(TEXT("Resume restores solved gate and exact position"),G->State.intro&&FVector::Dist(ResumePosition,P->GetActorLocation())<1);Record(G,TEXT("save_reset_resume"));Next(C);return false;}
  if(Phase==10){if(Walk(G,C,FVector2D(370,0))){if(Phase==99)return false;T->TestTrue(TEXT("Fresh keyboard movement works after resume"),P->GetActorLocation().X>350);T->TestTrue(TEXT("Native resumed state captured"),Capture(W,TEXT("05-resumed.png")));Record(G,TEXT("complete"));Phase=99;}return false;}
  Stop(C);C->SetActorTickEnabled(true);T->TestTrue(TEXT("Native input trace preserved"),FFileHelper::SaveStringToFile(Trace,*(FPaths::ProjectDir()/TEXT("Reports/RuntimeSequence/trace.txt"))));
  UGameplayStatics::DeleteGameInSlot(G->SaveSlot,0);return true;
 }
};
IMPLEMENT_SIMPLE_AUTOMATION_TEST(FIslandRuntime,"GradeCrew.Lerninsel.RuntimeSequence",EAutomationTestFlags::EditorContext|EAutomationTestFlags::EngineFilter)
bool FIslandRuntime::RunTest(const FString&){
 ADD_LATENT_AUTOMATION_COMMAND(FEditorLoadMap(TEXT("/Game/Maps/Lerninsel_Weltvorschau")));
 ADD_LATENT_AUTOMATION_COMMAND(FStartPIECommand(false));
 ADD_LATENT_AUTOMATION_COMMAND(FIslandRuntimeSequence(this));
 ADD_LATENT_AUTOMATION_COMMAND(FEndPlayMapCommand());return true;
}
#endif

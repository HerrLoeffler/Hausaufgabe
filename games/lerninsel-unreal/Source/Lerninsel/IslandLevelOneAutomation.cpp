#if WITH_EDITOR
#include "Misc/AutomationTest.h"
#include "Tests/AutomationEditorCommon.h"
#include "Editor.h"
#include "IslandLevelOneGameMode.h"
#include "IslandWorld.h"
#include "IslandFocusWidget.h"
#include "Camera/CameraComponent.h"
#include "Components/CapsuleComponent.h"
#include "Components/StaticMeshComponent.h"
#include "ProceduralMeshComponent.h"
#include "Materials/MaterialInstanceDynamic.h"
#include "Kismet/GameplayStatics.h"
#include "GameFramework/CharacterMovementComponent.h"
#include "GameFramework/PlayerInput.h"
#include "Engine/GameViewportClient.h"
#include "Framework/Application/SlateApplication.h"
#include "Widgets/SViewport.h"
#include "ImageUtils.h"
#include "Misc/FileHelper.h"
#include "Misc/Paths.h"
namespace {
bool LevelOneCapture(UWorld* W,const TCHAR* Name){auto* Client=W->GetGameViewport();auto Widget=Client?Client->GetGameViewportWidget():TSharedPtr<SViewport>();if(!Widget.IsValid())return false;TArray<FColor> Pixels;FIntVector Size;if(!FSlateApplication::Get().TakeScreenshot(Widget.ToSharedRef(),Pixels,Size))return false;TArray64<uint8> Data;FImageUtils::PNGCompressImageArray(Size.X,Size.Y,Pixels,Data);FString Dir=FPaths::ProjectDir()/TEXT("Reports/Level1Reference");IFileManager::Get().MakeDirectory(*Dir,true);return FFileHelper::SaveArrayToFile(Data,*(Dir/Name));}
}
// These are explicit native fixtures: teleported poses/direct game actions are NOT a normal playtest.
class FLevelOneCheck:public IAutomationLatentCommand{
 FAutomationTestBase* Test;double Start=FPlatformTime::Seconds();int Phase=0;TArray<uint8> NormalBefore,PrefsBefore;FString Snapshot;
 public:explicit FLevelOneCheck(FAutomationTestBase* T):Test(T){}
 bool Update()override{
  UWorld* W=GEditor?GEditor->PlayWorld.Get():nullptr;auto* G=W?Cast<AIslandGameMode>(W->GetAuthGameMode()):nullptr;
  if(!G||!G->Player()){if(FPlatformTime::Seconds()-Start<40)return false;Test->AddError(TEXT("Level-one PIE absent"));return true;}
  auto* P=G->Player();auto* C=Cast<AIslandController>(P->Controller);if(!C)return false;
  if(Phase==0){if(FPlatformTime::Seconds()-Start<3)return false;
   Test->TestTrue(TEXT("Map chooses isolated mode without CLI flag"),G->IsLevelOneReferenceMode());
   Test->TestTrue(TEXT("Reference save is isolated"),G->SaveSlot.StartsWith(TEXT("LerninselLevel1ReferenceV1")));
   Test->TestEqual(TEXT("Preferences selected before loading"),C->PreferencesSlot,G->SessionPreferencesSlot());
   Test->TestEqual(TEXT("Only two early gates"),G->Gates.Num(),2);Test->TestNotNull(TEXT("Real collision terrain"),G->LevelOneTerrain);
   Test->TestTrue(TEXT("Start is a real paused menu"),G->Paused&&G->LevelOneMenu==ELevelOneMenu::Start);
   Test->TestTrue(TEXT("Actual start menu fixture captured"),LevelOneCapture(W,TEXT("Fixture-Start.png")));
   UGameplayStatics::LoadDataFromSlot(NormalBefore,TEXT("LerninselV1"),0);UGameplayStatics::LoadDataFromSlot(PrefsBefore,TEXT("LerninselPreferencesV1"),0);
   G->ResetLevelOneAttempt();G->LevelOneUIAction(11000);
   for(double X:{-2800.,-2450.,-2200.,-2100.,-2000.,-1750.,-1450.,-1000.,0.,1000.}){FHitResult Hit;FCollisionQueryParams Q;Q.AddIgnoredActor(P);bool Found=W->LineTraceSingleByChannel(Hit,FVector(X,0,300),FVector(X,0,-100),ECC_Pawn,Q);Test->TestTrue(TEXT("Terrain floor is actual authored elevation"),Found&&FMath::Abs(Hit.ImpactPoint.Z-Island::LevelOneGroundZ(X,0))<.5);}
   for(int I=0;I<G->LevelOneWordFloors.Num();++I){auto* Body=G->LevelOneWordFloors[I];FVector At=Body->GetComponentLocation();FHitResult Hit;FCollisionQueryParams Q;Q.AddIgnoredActor(P);W->LineTraceSingleByChannel(Hit,At+FVector(0,0,200),At-FVector(0,0,100),ECC_Pawn,Q);Test->TestTrue(TEXT("Visible word stone has real matching pawn top"),Hit.GetComponent()==Body&&FMath::Abs(Hit.ImpactPoint.Z-10)<.5);}
   Test->TestEqual(TEXT("Character step height remains30cm"),P->GetCharacterMovement()->MaxStepHeight,30.f);
   P->SetActorLocation(FVector(-300,0,90));FHitResult Closed;P->SetActorLocation(FVector(0,0,90),true,&Closed);Test->TestTrue(TEXT("Closed intro gate blocks actual capsule"),Closed.bBlockingHit);
   P->SetActorLocation(G->Target(100)->Pos+FVector(0,0,88));G->LevelOneInteract(100);G->LevelOneInteract(100);Test->TestEqual(TEXT("Duplicate same-frame intent never untoggles"),G->State.introMask,1);
   P->SetActorLocation(G->Target(102)->Pos+FVector(0,0,88));G->LevelOneInteract(102);Test->TestTrue(TEXT("Two actual core choices auto-check intro"),G->State.intro&&G->State.introMask==5);
   auto* Tint=Cast<UMaterialInstanceDynamic>(G->IntroTiles[0]->GetMaterial(0));Test->TestTrue(TEXT("Solved whole stone remains blue"),Tint&&Tint->K2_GetVectorParameterValue(TEXT("Tint")).B>Tint->K2_GetVectorParameterValue(TEXT("Tint")).R);
   G->RefreshLevelOneWorld(.7f);P->SetActorLocation(FVector(-300,0,90));FHitResult Half;P->SetActorLocation(FVector(0,0,90),true,&Half);Test->TestTrue(TEXT("Part-open gate still blocks capsule"),Half.bBlockingHit);G->RefreshLevelOneWorld(1.5f);P->SetActorLocation(FVector(-300,0,90));FHitResult Open;P->SetActorLocation(FVector(0,0,90),true,&Open);Test->TestFalse(TEXT("Fully open intro gate permits real passage"),Open.bBlockingHit);
   P->SetActorLocation(G->Target(20)->Pos);G->LevelOneInteract(20);P->SetActorLocation(G->Target(200)->Pos+FVector(0,0,88));G->LevelOneFoot.Reset();G->Tick(.15f);Test->TestEqual(TEXT("Short standing visit does not choose"),G->State.pathCount,0);G->Tick(.16f);Test->TestEqual(TEXT("Real word floor and centre dwell choose once"),G->State.pathCount,1);G->Tick(.6f);Test->TestEqual(TEXT("Standing still never repeats"),G->State.pathCount,1);
   P->SetActorLocation(G->Target(20)->Pos);G->LevelOneInteract(20);Test->TestEqual(TEXT("Repeat start cannot delete correct row"),G->State.pathCount,1);
   P->SetActorLocation(G->Target(203)->Pos+FVector(0,0,88));G->LevelOneInteract(203);Test->TestTrue(TEXT("Wrong row1 choice is preserved for undo"),G->State.pathFailed&&G->State.pathCount==2);
   Phase=1;return false;
  }
  if(Phase==1){
   G->LevelOneInteract(203);Test->TestTrue(TEXT("New explicit click can undo last error"),!G->State.pathFailed&&G->State.pathCount==1&&G->State.path[0]==0);G->Tick(.7f);Test->TestEqual(TEXT("Undo while standing does not reselect error"),G->State.pathCount,1);
   P->SetActorLocation(FVector(550,-460,90));G->Tick(.1f);P->SetActorLocation(G->Target(204)->Pos+FVector(0,0,88));G->Tick(.31f);Test->TestEqual(TEXT("Exit then deliberate correct centre rearms"),G->State.pathCount,2);
   P->SetActorLocation(FVector(800,-460,90));G->Tick(.1f);P->SetActorLocation(G->Target(208)->Pos+FVector(0,0,88));G->Tick(.31f);Test->TestTrue(TEXT("Three real dwell choices auto-check route"),G->State.verbs&&G->State.pathCount==3);Test->TestTrue(TEXT("Final gate waits for animation"),G->GateBlocks(1));G->RefreshLevelOneWorld(1.5f);
   P->SetActorLocation(FVector(1200,75,90));FHitResult Open;P->SetActorLocation(FVector(1450,75,90),true,&Open);Test->TestFalse(TEXT("Fully open exit gate permits capsule"),Open.bBlockingHit);
   Test->TestTrue(TEXT("Reference saves own valid state"),G->SaveLevelOneAttempt());Snapshot=UTF8_TO_TCHAR(Island::Serialize(G->State).c_str());G->State=Island::State();Test->TestTrue(TEXT("Own reference resume loads"),G->LoadLevelOneAttempt());Test->TestEqual(TEXT("LI4 exact response state restored"),FString(UTF8_TO_TCHAR(Island::Serialize(G->State).c_str())),Snapshot);
   auto* Damaged=Cast<UIslandLevelOneSave>(UGameplayStatics::LoadGameFromSlot(G->SaveSlot,0));Damaged->Position=FVector(-9999,0,88);UGameplayStatics::SaveGameToSlot(Damaged,G->SaveSlot,0);Test->TestTrue(TEXT("Invalid pose still preserves valid learning flags"),G->LoadLevelOneAttempt());Test->TestTrue(TEXT("Invalid pose recovers to new actual arrival"),G->State.verbs&&P->GetActorLocation().X==-2800);
   Damaged->ScenarioId=TEXT("different-scenario");UGameplayStatics::SaveGameToSlot(Damaged,G->SaveSlot,0);Test->TestFalse(TEXT("Wrong scenario fails closed"),G->LoadLevelOneAttempt());G->SaveLevelOneAttempt();
   C->SetMouseSensitivity(1.75f);float Sens=C->MouseSensitivity;G->ResetLevelOneAttempt();Test->TestEqual(TEXT("Reset keeps own control preference"),C->MouseSensitivity,Sens);Test->TestFalse(TEXT("Reset clears only own learning attempt"),G->State.intro||G->State.verbs);
   TArray<uint8> Now,PrefsNow;UGameplayStatics::LoadDataFromSlot(Now,TEXT("LerninselV1"),0);UGameplayStatics::LoadDataFromSlot(PrefsNow,TEXT("LerninselPreferencesV1"),0);Test->TestTrue(TEXT("Normal learning save bytes remain untouched"),Now==NormalBefore);Test->TestTrue(TEXT("Normal preference bytes remain untouched"),PrefsNow==PrefsBefore);
   G->SetLevelOneMenu(ELevelOneMenu::Playing);P->SetActorLocation(FVector(-2200,80,180));C->SetControlRotation(FRotator(-4,0,0));Start=FPlatformTime::Seconds();Phase=2;return false;
  }
  if(FPlatformTime::Seconds()-Start<2)return false;
  if(Phase==2){Test->TestTrue(TEXT("Actual hill camera fixture captured"),LevelOneCapture(W,TEXT("Fixture-Hill.png")));P->SetActorLocation(FVector(-1120,0,90));C->SetControlRotation(FRotator(-8,0,0));Start=FPlatformTime::Seconds();Phase=3;return false;}
  if(Phase==3){Test->TestTrue(TEXT("Actual intro camera fixture captured"),LevelOneCapture(W,TEXT("Fixture-Intro.png")));P->SetActorLocation(FVector(65,-460,90));C->SetControlRotation(FRotator(-8,30,0));Start=FPlatformTime::Seconds();Phase=4;return false;}
  Test->TestTrue(TEXT("Actual garden camera fixture captured"),LevelOneCapture(W,TEXT("Fixture-Garden.png")));return true;
 }
};
IMPLEMENT_SIMPLE_AUTOMATION_TEST(FIslandLevelOne,"GradeCrew.Lerninsel.LevelOne",EAutomationTestFlags::EditorContext|EAutomationTestFlags::EngineFilter)
bool FIslandLevelOne::RunTest(const FString&){ADD_LATENT_AUTOMATION_COMMAND(FEditorLoadMap(TEXT("/Game/Maps/Lerninsel_Level1Ref")));ADD_LATENT_AUTOMATION_COMMAND(FStartPIECommand(false));ADD_LATENT_AUTOMATION_COMMAND(FLevelOneCheck(this));ADD_LATENT_AUTOMATION_COMMAND(FEndPlayMapCommand());return true;}
#endif

#if WITH_EDITOR
#include "Misc/AutomationTest.h"
#include "Tests/AutomationEditorCommon.h"
#include "Editor.h"
#include "IslandWorld.h"
#include "EngineUtils.h"
#include "Components/StaticMeshComponent.h"
#include "Camera/CameraComponent.h"
#include "Framework/Application/SlateApplication.h"
#include "Widgets/SViewport.h"
#include "Engine/GameViewportClient.h"
#include "ImageUtils.h"
#include "Misc/FileHelper.h"
#include "Misc/Paths.h"

namespace {
bool CapturePreview(UWorld* W, const FString& Name) {
 auto* Client=W->GetGameViewport();
 auto Widget=Client?Client->GetGameViewportWidget():TSharedPtr<SViewport>();
 if(!Widget.IsValid()) return false;
 TArray<FColor> Pixels; FIntVector Size;
 if(!FSlateApplication::Get().TakeScreenshot(Widget.ToSharedRef(),Pixels,Size)) return false;
 TArray64<uint8> Data; FImageUtils::PNGCompressImageArray(Size.X,Size.Y,Pixels,Data);
 return FFileHelper::SaveArrayToFile(Data,*(FPaths::ProjectDir()/TEXT("Reports/L1")/Name));
}
class FWorldPreviewCheck:public IAutomationLatentCommand {
 FAutomationTestBase* Test; double Started=FPlatformTime::Seconds(); int Phase=0;
 TArray<FVector> Poses={FVector(-1600,0,90),FVector(-940,-180,90),FVector(60,0,90),FVector(1540,0,90),FVector(3550,-20,90),FVector(5350,-100,90),FVector(6720,-400,90),FVector(11680,-350,90),FVector(9400,-850,1088),FVector(1540,0,90)};
 TArray<FRotator> Views={FRotator(-18,0,0),FRotator(-44,0,0),FRotator(-24,0,0),FRotator(-8,0,0),FRotator(-12,-18,0),FRotator(-12,15,0),FRotator(-8,20,0),FRotator(15,25,0),FRotator(-12,-90,0),FRotator(5,90,0)};
 FString Diagnostics;
 public: explicit FWorldPreviewCheck(FAutomationTestBase* T):Test(T){}
 bool Update()override {
  UWorld* W=GEditor?GEditor->PlayWorld.Get():nullptr;
  auto* G=W?Cast<AIslandGameMode>(W->GetAuthGameMode()):nullptr;
  auto* P=G?G->Player():nullptr;
  if(!P){if(FPlatformTime::Seconds()-Started<40)return false;Test->AddError(TEXT("Preview PIE absent"));return true;}
  if(Phase==0){
   IFileManager::Get().MakeDirectory(*(FPaths::ProjectDir()/TEXT("Reports/L1")),true);
   int Meshes=0;
   for(TActorIterator<AActor> It(W);It;++It) {
    auto* M=It->FindComponentByClass<UStaticMeshComponent>();
    if(M&&M->GetStaticMesh()&&M->GetStaticMesh()->GetName()==TEXT("SM_Lerninsel_World_Prototype_V1")){
     ++Meshes;Test->TestFalse(TEXT("Visual island actor has no collision"),It->GetActorEnableCollision());
     Test->TestEqual(TEXT("Visual island component has no collision"),(int)M->GetCollisionEnabled(),(int)ECollisionEnabled::NoCollision);
     Test->TestFalse(TEXT("Decorative island stays outside the interactive gameplay corridor"),M->Bounds.GetBox().Intersect(FBox(FVector(-2000,-1350,-225),FVector(13000,1350,1800))));
     Diagnostics+=FString::Printf(TEXT("world_mesh=%s bounds_origin=%s bounds_extent=%s collision=%d\n"),*It->GetName(),*M->Bounds.Origin.ToString(),*M->Bounds.BoxExtent.ToString(),(int)M->GetCollisionEnabled());
    }
   }
   Test->TestEqual(TEXT("Exactly one imported visual island exists"),Meshes,1);
   Test->TestEqual(TEXT("World preview uses isolated save slot"),G->SaveSlot,FString(TEXT("LerninselWorldArtPreviewV1")));
   Test->TestFalse(TEXT("World preview starts with fresh learning progress"),G->State.intro||G->State.verbs||G->State.sentence||G->State.water);
   G->Paused=false;G->Focus=-1;auto* C=Cast<AIslandController>(P->Controller);C->UpdateMode();C->CancelInput();C->SetIgnoreLookInput(true);C->SetIgnoreMoveInput(true);
   P->SetActorLocation(Poses[0]);P->Controller->SetControlRotation(Views[0]);Started=FPlatformTime::Seconds();Phase=1;return false;
  }
  if(FPlatformTime::Seconds()-Started<2)return false;
  int Index=Phase-1;
  if(Index<Poses.Num()){
   Test->TestTrue(TEXT("Actual preview game viewport captured"),CapturePreview(W,FString::Printf(TEXT("WorldPreview-%02d.png"),Index)));
   Diagnostics+=FString::Printf(TEXT("camera_%d capsule=%s eyes=%s view=%s\n"),Index,*P->GetActorLocation().ToString(),*P->Camera->GetComponentLocation().ToString(),*P->Controller->GetControlRotation().ToString());
   FHitResult Floor;FCollisionQueryParams Q;Q.AddIgnoredActor(P);
   W->LineTraceSingleByChannel(Floor,Poses[Index]+FVector(0,0,300),Poses[Index]-FVector(0,0,300),ECC_Visibility,Q);
   Diagnostics+=FString::Printf(TEXT("floor_%d hit=%d actor=%s z=%.2f\n"),Index,Floor.bBlockingHit,*GetNameSafe(Floor.GetActor()),Floor.ImpactPoint.Z);
   Test->TestTrue(TEXT("Authored gameplay route has collision floor"),Floor.bBlockingHit);
   if(Index+1<Poses.Num()) {P->SetActorLocation(Poses[Index+1]);P->Controller->SetControlRotation(Views[Index+1]);Started=FPlatformTime::Seconds();++Phase;return false;}
   P->SetActorLocation(FVector(1200,75,90));FHitResult Closed;
   P->SetActorLocation(FVector(1450,75,90),true,&Closed);
   Test->TestTrue(TEXT("Preview closed gameplay gate blocks actual capsule sweep"),Closed.bBlockingHit);
   G->State.intro=G->State.verbs=G->State.sentence=G->State.water=G->State.fractions=G->State.coast=true;G->FoxTime=10.6f;G->BasinHeight=10;G->RefreshWorld(30);
   P->SetActorLocation(FVector(1200,75,90));FHitResult Open;
   P->SetActorLocation(FVector(1450,75,90),true,&Open);
   Test->TestFalse(TEXT("Preview fully open gameplay gate permits actual capsule sweep"),Open.bBlockingHit);
   Diagnostics+=FString::Printf(TEXT("gate_closed=%d closed_actor=%s gate_open=%d open_actor=%s\n"),Closed.bBlockingHit,*GetNameSafe(Closed.GetActor()),Open.bBlockingHit,*GetNameSafe(Open.GetActor()));
   for(FVector Pair:{FVector(-1600,0,90),FVector(3200,0,90),FVector(6400,0,90),FVector(11600,0,90)}){
    P->SetActorLocation(Pair);FHitResult Hit;P->SetActorLocation(Pair+FVector(250,0,0),true,&Hit);
    Diagnostics+=FString::Printf(TEXT("route_sweep from=%s to=%s hit=%d actor=%s\n"),*Pair.ToString(),*P->GetActorLocation().ToString(),Hit.bBlockingHit,*GetNameSafe(Hit.GetActor()));
    Test->TestFalse(TEXT("Existing route segments stay free of preview collision"),Hit.bBlockingHit);
   }
   Test->TestTrue(TEXT("Preview diagnostics saved"),FFileHelper::SaveStringToFile(Diagnostics,*(FPaths::ProjectDir()/TEXT("Reports/L1/world-preview-diagnostics.txt"))));
   return true;
  }
  return true;
 }
};
}
IMPLEMENT_SIMPLE_AUTOMATION_TEST(FIslandWorldPreview,"GradeCrew.Lerninsel.WorldPreview",EAutomationTestFlags::EditorContext|EAutomationTestFlags::EngineFilter)
bool FIslandWorldPreview::RunTest(const FString&){
 ADD_LATENT_AUTOMATION_COMMAND(FEditorLoadMap(TEXT("/Game/Maps/Lerninsel_Weltvorschau")));
 ADD_LATENT_AUTOMATION_COMMAND(FStartPIECommand(false));
 ADD_LATENT_AUTOMATION_COMMAND(FWorldPreviewCheck(this));
 ADD_LATENT_AUTOMATION_COMMAND(FEndPlayMapCommand());return true;
}
#endif

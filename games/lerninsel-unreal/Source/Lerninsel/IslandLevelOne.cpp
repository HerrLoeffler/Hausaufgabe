#include "IslandLevelOneGameMode.h"
#include "IslandFocusWidget.h"
#include "Camera/CameraComponent.h"
#include "Components/CapsuleComponent.h"
#include "Components/StaticMeshComponent.h"
#include "Components/TextRenderComponent.h"
#include "Components/PrimitiveComponent.h"
#include "GameFramework/CharacterMovementComponent.h"
#include "Kismet/GameplayStatics.h"
#include "Kismet/KismetSystemLibrary.h"
#include "Materials/MaterialInstanceDynamic.h"
#include "Misc/PackageName.h"
#include "TimerManager.h"
#include "Misc/CommandLine.h"
#include "Misc/Parse.h"
#include "Misc/FileHelper.h"
#include "Misc/Paths.h"
#include "UnrealClient.h"
#include "GameFramework/PlayerInput.h"

namespace {
AIslandGameMode* LevelOneMode(const AActor* A){return A&&A->GetWorld()?Cast<AIslandGameMode>(A->GetWorld()->GetAuthGameMode()):nullptr;}
FString LevelOneScopedSlot(const TCHAR* Prefix){FString Suffix;FParse::Value(FCommandLine::Get(),TEXT("LevelOneSlotSuffix="),Suffix);if(Suffix.Len()>32)Suffix.Reset();for(TCHAR C:Suffix)if(!FChar::IsAlnum(C)&&C!='_'){Suffix.Reset();break;}return FString(Prefix)+(Suffix.IsEmpty()?TEXT(""):TEXT("_")+Suffix);}
FString LevelOneScenario(EIslandSessionProfile P){return P==EIslandSessionProfile::LevelOneReference?TEXT("lerninsel-level1-reference"):TEXT("lerninsel-level1-continuation");}
}
FString AIslandGameMode::SessionSaveSlot()const{return SessionProfile==EIslandSessionProfile::LevelOneReference?LevelOneScopedSlot(TEXT("LerninselLevel1ReferenceV1")):SessionProfile==EIslandSessionProfile::LevelOneContinuation?LevelOneScopedSlot(TEXT("LerninselLevel1HandoffV1")):TEXT("LerninselV1");}
FString AIslandGameMode::SessionPreferencesSlot()const{return SessionProfile==EIslandSessionProfile::LevelOneReference?LevelOneScopedSlot(TEXT("LerninselLevel1PreferencesV1")):SessionProfile==EIslandSessionProfile::LevelOneContinuation?LevelOneScopedSlot(TEXT("LerninselLevel1HandoffPreferencesV1")):TEXT("LerninselPreferencesV1");}
void AIslandGameMode::RegisterLevelOneTarget(UPrimitiveComponent* C,int Id){if(C)LevelOneTargetComponents.Add(C,Id);}
int AIslandController::PickLevelOneTarget(const FVector& Origin,const FVector& Direction)const{
 auto* G=LevelOneMode(this);if(!G||!G->IsLevelOneReferenceMode())return -1;
 FCollisionQueryParams Q(SCENE_QUERY_STAT(LevelOnePick),true);Q.AddIgnoredActor(GetPawn());FHitResult Hit;
 if(!GetWorld()->LineTraceSingleByChannel(Hit,Origin,Origin+Direction*1200,ECC_Visibility,Q))return -1;
 const int* Id=G->LevelOneTargetComponents.Find(Hit.GetComponent());
 return Id&&G->CanInspect(*Id)&&G->Reachable(*Id)?*Id:-1;
}
void AIslandController::ActivateLevelOneTarget(int Id){if(auto* G=LevelOneMode(this))G->LevelOneInteract(Id);}
void AIslandGameMode::BeginLevelOneSession(){
 SaveSlot=SessionSaveSlot();BuildWorld();
 auto* P=Player();if(P){P->SetActorLocation(IsLevelOneReferenceMode()?FVector(-2800,0,90):FVector(1540,0,90));if(P->Controller)P->Controller->SetControlRotation(FRotator(-4,0,0));}
 if(auto* C=P?Cast<AIslandController>(P->Controller):nullptr){C->PreferencesSlot=SessionPreferencesSlot();C->LoadPreferences();P->Camera->SetFieldOfView(C->PreferencesFOV);}
 LevelOneHasSave=LoadLevelOneAttempt();
 if(!LevelOneAttemptId.IsValid())LevelOneAttemptId=FGuid::NewGuid();
 if(IsLevelOneReferenceMode()){RefreshLevelOneWorld(0);if(FParse::Param(FCommandLine::Get(),TEXT("LevelOneFreshStart"))){ResetLevelOneAttempt();SetLevelOneMenu(ELevelOneMenu::Playing);}else SetLevelOneMenu(ELevelOneMenu::Start);}
 else {
  if(!LevelOneHasSave){Notify(TEXT("Der Abschnitt konnte nicht fortgesetzt werden."));GetWorld()->GetTimerManager().SetTimerForNextTick([this](){UGameplayStatics::OpenLevel(this,FName(TEXT("/Game/Maps/Lerninsel_Level1Ref")));});return;}
  Paused=false;RefreshWorld(0);if(auto* C=P?Cast<AIslandController>(P->Controller):nullptr){C->CancelInput();C->UpdateMode();}
 }
}
void AIslandGameMode::SetLevelOneMenu(ELevelOneMenu M){
 LevelOneMenu=M;Paused=M!=ELevelOneMenu::Playing;Focus=-1;LevelOneFoot.BlockUntilExit();
 if(auto* C=Player()?Cast<AIslandController>(Player()->Controller):nullptr){C->CancelInput();C->UpdateMode();}
}
void AIslandGameMode::LevelOneEscape(){
 if(LevelOneMenu==ELevelOneMenu::Settings||LevelOneMenu==ELevelOneMenu::RestartConfirm){SetLevelOneMenu(LevelOneReturnMenu);return;}
 if(LevelOneMenu==ELevelOneMenu::Playing){SaveLevelOneAttempt();SetLevelOneMenu(ELevelOneMenu::Pause);return;}
 if(LevelOneMenu==ELevelOneMenu::Pause){SetLevelOneMenu(ELevelOneMenu::Playing);return;}
 if(LevelOneMenu==ELevelOneMenu::Completed){SetLevelOneMenu(ELevelOneMenu::Pause);return;}
}
void AIslandGameMode::LevelOneUIAction(int Code){
 switch(Code){
 case 11000:if(LevelOneMenu==ELevelOneMenu::Start||LevelOneMenu==ELevelOneMenu::Pause){SetLevelOneMenu(ELevelOneMenu::Playing);Notify(TEXT("Folge dem hellen Weg. WASD bewegt dich. Die Maus schaut."));}break;
 case 11001:if(LevelOneMenu==ELevelOneMenu::Start||LevelOneMenu==ELevelOneMenu::Pause||LevelOneMenu==ELevelOneMenu::Completed){LevelOneReturnMenu=LevelOneMenu;SetLevelOneMenu(ELevelOneMenu::RestartConfirm);}break;
 case 11002:if(LevelOneMenu==ELevelOneMenu::Start||LevelOneMenu==ELevelOneMenu::Pause){LevelOneReturnMenu=LevelOneMenu;SetLevelOneMenu(ELevelOneMenu::Settings);}break;
 case 11003:if(LevelOneMenu==ELevelOneMenu::Settings||LevelOneMenu==ELevelOneMenu::RestartConfirm)SetLevelOneMenu(LevelOneReturnMenu);break;
 case 11004:if(LevelOneMenu==ELevelOneMenu::RestartConfirm){ResetLevelOneAttempt();SetLevelOneMenu(ELevelOneMenu::Playing);}break;
 case 11005:if(Paused){SaveLevelOneAttempt();SetLevelOneMenu(ELevelOneMenu::Start);}break;
 case 11006:if(LevelOneMenu==ELevelOneMenu::Completed)OpenLevelOneContinuation();break;
 case 11007:if(Paused){SaveLevelOneAttempt();UKismetSystemLibrary::QuitGame(this,Player()?Cast<APlayerController>(Player()->Controller):nullptr,EQuitPreference::Quit,false);}break;
 case 11008:if(LevelOneMenu==ELevelOneMenu::Settings)if(auto* C=Player()?Cast<AIslandController>(Player()->Controller):nullptr){C->SetMouseSensitivity(1);if(C->FocusWidget)C->FocusWidget->Refresh();}break;
 case 11009:if(LevelOneMenu==ELevelOneMenu::Settings&&Player()){auto* P=Player();P->Camera->SetFieldOfView(P->Camera->FieldOfView<80?85:75);if(auto* C=Cast<AIslandController>(P->Controller)){C->PreferencesFOV=P->Camera->FieldOfView;C->SavePreferences();if(C->FocusWidget)C->FocusWidget->Refresh();}}break;
 }
}
void AIslandGameMode::LevelOneInteract(int Id,bool FromFoot){
 if(!IsLevelOneReferenceMode()||Paused||Focus>=0||!CanInspect(Id)||!Reachable(Id))return;
 if(!LevelOneIntent.Admit(GFrameCounter,Id))return;
 if(!FromFoot)LevelOneFoot.BlockUntilExit();
 if(Id==10||Id==11){ShowHint(100);return;}
 if(Id==20){auto R=Island::LevelOneStartPath(State);Notify(R==Island::Result::Already?(State.pathFailed?TEXT("Nimm den letzten Schritt zurück."):FString::Printf(TEXT("Der Verbweg läuft. Weiter mit Reihe %d."),Island::PathPromptRow(State))):TEXT("Gehe auf ein Verb in Reihe 1. Stehe kurz in der Mitte."));SaveLevelOneAttempt();return;}
 if(Id==21){Notify(State.verbs?TEXT("Drei Verben gefunden. Gehe durch das offene Tor."):TEXT("Gehe in jeder Reihe auf ein Verb."));return;}
 if(Id==22){Apply(Island::Action::PathUndo);return;}
 if(Id>=200&&Id<=208){int Index=Id-200;
  if(State.pathCount>0&&State.path[State.pathCount-1]==Index&&!State.verbs){if(!FromFoot)Apply(Island::Action::PathUndo);return;}
  if(!State.pathActive&&!State.verbs)Island::LevelOneStartPath(State);
  Apply(Island::Action::PathStep,Index);return;
 }
 if(Id>=100&&Id<=103)Apply(Island::Action::IntroToggle,Id-100);
}
void AIslandGameMode::TickLevelOne(float Dt){
 Clock+=Dt;MessageTime=FMath::Max(0.f,MessageTime-Dt);auto* P=Player();if(!P)return;
 if(Paused)return;
 auto* C=Cast<AIslandController>(P->Controller);if(!C)return;
 int W,H;C->GetViewportSize(W,H);Near=C->PickWorldTarget(W*.5f,H*.5f);
 int Tile=-1;FVector L=P->GetActorLocation();FHitResult Floor;FCollisionQueryParams Q;Q.AddIgnoredActor(P);
 const bool FloorHit=GetWorld()->LineTraceSingleByChannel(Floor,L,L-FVector(0,0,145),ECC_Visibility,Q);
 for(int I=0;I<9;++I){auto* T=Target(200+I);if(T&&FMath::Abs(L.X-T->Pos.X)<42&&FMath::Abs(L.Y-T->Pos.Y)<42&&LevelOneWordFloors.IsValidIndex(I+4)&&FloorHit&&Floor.GetComponent()==LevelOneWordFloors[I+4]){Tile=I;break;}}
 bool Eligible=State.pathActive&&!State.pathFailed&&!State.verbs&&Tile>=0&&Tile/3==State.pathCount;
 int Commit=LevelOneFoot.Update(Tile,Dt,Eligible,FloorHit);
 if(Commit>=0)LevelOneInteract(200+Commit,true);
 int Stage=L.X>1490&&State.verbs?4:State.verbs?3:State.intro?2:L.X> -2000?1:0;
 if(Stage>LevelOneCheckpoint){LevelOneCheckpoint=Stage;FVector Safe;if(ResolveLevelOneSafePose(L,Safe))LevelOneLastSafe=Safe;SaveLevelOneAttempt();}
 if(State.verbs&&!GateBlocks(1)&&L.X>1490){SaveLevelOneAttempt();SetLevelOneMenu(ELevelOneMenu::Completed);}
 RefreshLevelOneWorld(Dt);
}
void AIslandGameMode::RefreshLevelOneWorld(float Dt){
 bool Open[2]={State.intro,State.verbs};
 for(int I=0;I<Gates.Num()&&I<2;++I){auto& G=Gates[I];if(Open[I])G.Angle=FMath::Min(90.f,G.Angle+Dt*90/1.4f);G.Actor->SetActorRotation(FRotator(0,G.Angle,0));TArray<UStaticMeshComponent*> Meshes;G.Actor->GetComponents(Meshes);for(auto* M:Meshes)M->SetCollisionEnabled(ECollisionEnabled::NoCollision);if(G.Barrier)G.Barrier->SetCollisionEnabled(G.Angle>=89.9f?ECollisionEnabled::NoCollision:ECollisionEnabled::QueryAndPhysics);}
 auto Tint=[](UStaticMeshComponent* Tile,bool Picked){if(Tile)if(auto* M=Cast<UMaterialInstanceDynamic>(Tile->GetMaterial(0)))M->SetVectorParameterValue(TEXT("Tint"),FLinearColor::FromSRGBColor(FColor::FromHex(Picked?TEXT("86BFE5"):TEXT("EEE2C9"))));};
 for(int I=0;I<IntroTiles.Num();++I)Tint(IntroTiles[I],(State.introMask&(1<<I))!=0);
 for(int I=0;I<PathTiles.Num();++I){bool Picked=false;for(int N=0;N<State.pathCount;++N)Picked|=State.path[N]==I;Tint(PathTiles[I],Picked);if(LevelOneStatusLabels.IsValidIndex(I)){bool Wrong=Picked&&State.pathFailed&&State.pathCount>0&&State.path[State.pathCount-1]==I;LevelOneStatusLabels[I]->SetText(FText::FromString(Wrong?TEXT("noch nicht passend"):Picked?TEXT("ausgewählt"):TEXT("")));}}
 for(int I=0;I<Cables.Num();++I)Cables[I]->SetVisibility(I<2&&Open[I]);
}
bool AIslandGameMode::ResolveLevelOneSafePose(const FVector& Requested,FVector& Safe)const{
 if(!Player()||Requested.ContainsNaN())return false;
 if(IsLevelOneReferenceMode()){
  if(!Island::LevelOnePoseInBounds(Requested.X,Requested.Y,Requested.Z))return false;
  const double Limit=!State.intro?-190:!State.verbs?1310:1770;if(Requested.X>Limit)return false;
 }else if(Requested.X< -1900||Requested.X>12800||FMath::Abs(Requested.Y)>1200||Requested.Z<40||Requested.Z>1280)return false;
 FCollisionQueryParams Q;Q.AddIgnoredActor(Player());FHitResult Hit;
 double Z=IsLevelOneReferenceMode()?Island::LevelOneGroundZ(Requested.X,Requested.Y):Requested.Z-88;
 if(!GetWorld()->LineTraceSingleByChannel(Hit,FVector(Requested.X,Requested.Y,Z+220),FVector(Requested.X,Requested.Y,Z-120),ECC_Pawn,Q))return false;
 if(Hit.ImpactNormal.Z<.85)return false;
 Safe=Hit.ImpactPoint+FVector(0,0,90.2);
 return !GetWorld()->OverlapBlockingTestByChannel(Safe,FQuat::Identity,ECC_Pawn,FCollisionShape::MakeCapsule(30,88),Q);
}
bool AIslandGameMode::SaveLevelOneAttempt(){
 if(!IsLevelOneSession()||!Player())return false;
 auto* S=Cast<UIslandLevelOneSave>(UGameplayStatics::CreateSaveGameObject(UIslandLevelOneSave::StaticClass()));
 S->ScenarioId=LevelOneScenario(SessionProfile);S->LayoutRevision=1;S->AttemptId=LevelOneAttemptId;S->Snapshot=UTF8_TO_TCHAR(Island::Serialize(State).c_str());S->Position=Player()->GetActorLocation();S->View=Player()->GetControlRotation();
 bool Ok=UGameplayStatics::SaveGameToSlot(S,SaveSlot,0);if(Ok)LevelOneHasSave=true;else Notify(TEXT("Dein Versuch konnte nicht gespeichert werden."));return Ok;
}
bool AIslandGameMode::LoadLevelOneAttempt(){
 if(!UGameplayStatics::DoesSaveGameExist(SaveSlot,0))return false;
 auto* S=Cast<UIslandLevelOneSave>(UGameplayStatics::LoadGameFromSlot(SaveSlot,0));if(!S||S->ScenarioId!=LevelOneScenario(SessionProfile)||S->LayoutRevision!=1||!S->AttemptId.IsValid())return false;
 Island::State Parsed;if(!Island::Deserialize(TCHAR_TO_UTF8(*S->Snapshot),Parsed))return false;
 if(IsLevelOneReferenceMode()&&(Parsed.sentence||Parsed.water||Parsed.fractions||Parsed.coast||Parsed.finale||Parsed.carrying))return false;
 if(SessionProfile==EIslandSessionProfile::LevelOneContinuation){auto* Source=Cast<UIslandLevelOneSave>(UGameplayStatics::LoadGameFromSlot(LevelOneScopedSlot(TEXT("LerninselLevel1ReferenceV1")),0));if(!Source||Source->AttemptId!=S->AttemptId||!Parsed.intro||!Parsed.verbs)return false;}
 State=Parsed;LevelOneAttemptId=S->AttemptId;
 if(!State.intro&&State.introMask==5)Island::Apply(State,Island::Action::IntroCheck);
 if(!State.verbs&&State.pathActive&&State.pathCount==3&&!State.pathFailed)Island::Apply(State,Island::Action::PathCheck);
 for(int I=0;I<Gates.Num();++I){bool Open=I==0?State.intro:I==1?State.verbs:I==2?State.water:I==3?State.sentence:I==4?State.fractions:State.coast;Gates[I].Angle=Open?90:0;}
 FoxTime=State.sentence?10.6f:0;BasinHeight=State.fractions?10:0;RefreshWorld(0);
 FVector Safe;if(!ResolveLevelOneSafePose(S->Position,Safe))Safe=IsLevelOneReferenceMode()?FVector(-2800,0,90.2):FVector(1540,0,90.2);
 Player()->SetActorLocation(Safe);Player()->Controller->SetControlRotation(S->View.ContainsNaN()?FRotator(-4,0,0):S->View);LevelOneLastSafe=Safe;LevelOneFoot.BlockUntilExit();Contact.Reset();return true;
}
void AIslandGameMode::ResetLevelOneAttempt(){
 State=Island::State();HintSteps.Reset();LevelOneAttemptId=FGuid::NewGuid();LevelOneCheckpoint=0;LevelOneFoot.Reset();LevelOneIntent=Island::LevelOneIntentGuard();Focus=Near=-1;MessageTime=0;Feedback.Empty();
 for(auto& G:Gates)G.Angle=0;
 if(Player()){Player()->SetActorLocation(FVector(-2800,0,90.2));Player()->Controller->SetControlRotation(FRotator(-4,0,0));}LevelOneLastSafe=FVector(-2800,0,90.2);RefreshWorld(0);SaveLevelOneAttempt();
}
void AIslandGameMode::RecoverLevelOnePose(){
 ++LevelOneRecoveryCount;UE_LOG(LogTemp,Warning,TEXT("LEVEL_ONE_RECOVERY profile=%d old=%s flags=%s"),(int)SessionProfile,*Player()->GetActorLocation().ToString(),UTF8_TO_TCHAR(Island::Serialize(State).c_str()));
 FVector Safe;if(!ResolveLevelOneSafePose(LevelOneLastSafe,Safe))Safe=IsLevelOneReferenceMode()?FVector(-2800,0,90.2):FVector(1540,0,90.2);
 Player()->SetActorLocation(Safe);Player()->GetCharacterMovement()->StopMovementImmediately();LevelOneFoot.BlockUntilExit();if(auto* C=Cast<AIslandController>(Player()->Controller))C->CancelInput();Notify(TEXT("Zurück auf dem Weg."));
}
bool AIslandGameMode::OpenLevelOneContinuation(){
 if(!IsLevelOneReferenceMode()||!State.intro||!State.verbs||GateBlocks(1))return false;
 if(!SaveLevelOneAttempt()||!FPackageName::DoesPackageExist(TEXT("/Game/Maps/Lerninsel"))){Notify(TEXT("Der Abschnitt konnte nicht fortgesetzt werden."));return false;}
 auto* Existing=Cast<UIslandLevelOneSave>(UGameplayStatics::DoesSaveGameExist(LevelOneScopedSlot(TEXT("LerninselLevel1HandoffV1")),0)?UGameplayStatics::LoadGameFromSlot(LevelOneScopedSlot(TEXT("LerninselLevel1HandoffV1")),0):nullptr);
 if(!Existing||Existing->AttemptId!=LevelOneAttemptId){auto* S=Cast<UIslandLevelOneSave>(UGameplayStatics::CreateSaveGameObject(UIslandLevelOneSave::StaticClass()));S->ScenarioId=TEXT("lerninsel-level1-continuation");S->AttemptId=LevelOneAttemptId;S->Snapshot=UTF8_TO_TCHAR(Island::Serialize(State).c_str());S->Position=FVector(1540,0,90.2);S->View=FRotator(-4,0,0);if(!UGameplayStatics::SaveGameToSlot(S,LevelOneScopedSlot(TEXT("LerninselLevel1HandoffV1")),0)){Notify(TEXT("Der Abschnitt konnte nicht fortgesetzt werden."));return false;}}
 UGameplayStatics::OpenLevel(this,FName(TEXT("/Game/Maps/Lerninsel")),true,TEXT("game=/Script/Lerninsel.IslandLevelOneContinuationGameMode"));return true;
}


bool AIslandController::InputKey(const FInputKeyEventArgs& Args){
 auto* G=LevelOneMode(this);bool Ref=G&&G->IsLevelOneReferenceMode();
 bool WorldKey=Args.Key==EKeys::W||Args.Key==EKeys::A||Args.Key==EKeys::S||Args.Key==EKeys::D||Args.Key==EKeys::E||Args.Key==EKeys::LeftMouseButton;
 if(Ref&&WorldKey){
  if(Args.Event==IE_Released)LevelOneKeyReleased(Args.Key);
  if(LevelOneAwaitFreshInput&&Args.Event==IE_Repeat)return true;
  if(Args.Event==IE_Pressed){if(LevelOneAwaitFreshInput){LevelOneHeldKeys.Reset();LevelOneAwaitFreshInput=false;KeysArmed=true;}LevelOneHeldKeys.Add(Args.Key);}
 }
 return Super::InputKey(Args);
}
void AIslandController::LevelOneKeyReleased(const FKey& K){LevelOneHeldKeys.Remove(K);if(LevelOneHeldKeys.IsEmpty())LevelOneAwaitFreshInput=false;}
void AIslandGameMode::WriteLevelOneEvidence(float Dt){
 if(!IsLevelOneSession()||!Player()||!FParse::Param(FCommandLine::Get(),TEXT("LevelOneEvidence")))return;
 LevelOneEvidenceTime+=Dt;LevelOneRecordTime+=Dt;if(LevelOneEvidenceTime<.25)return;LevelOneEvidenceTime=0;
 auto* P=Player();FVector Pos=P->GetActorLocation();FRotator View=P->GetControlRotation();
 FString Folder=FPaths::ProjectDir()/TEXT("Reports/Level1Reference");IFileManager::Get().MakeDirectory(*Folder,true);
 FString Json=FString::Printf(TEXT("{\"profile\":%d,\"menu\":%d,\"paused\":%s,\"x\":%.3f,\"y\":%.3f,\"z\":%.3f,\"yaw\":%.3f,\"pitch\":%.3f,\"intro\":%s,\"verbs\":%s,\"mask\":%d,\"pathCount\":%d,\"pathFailed\":%s,\"near\":%d,\"recoveryCount\":%d,\"gate0\":%.2f,\"gate1\":%.2f,\"snapshot\":\"%s\"}"),(int)SessionProfile,(int)LevelOneMenu,Paused?TEXT("true"):TEXT("false"),Pos.X,Pos.Y,Pos.Z,View.Yaw,View.Pitch,State.intro?TEXT("true"):TEXT("false"),State.verbs?TEXT("true"):TEXT("false"),State.introMask,State.pathCount,State.pathFailed?TEXT("true"):TEXT("false"),Near,LevelOneRecoveryCount,Gates.IsValidIndex(0)?Gates[0].Angle:0,Gates.IsValidIndex(1)?Gates[1].Angle:0,UTF8_TO_TCHAR(Island::Serialize(State).c_str()));
 FFileHelper::SaveStringToFile(Json,*(Folder/TEXT("runtime-state.json")));
 if(FParse::Param(FCommandLine::Get(),TEXT("LevelOneRecord"))&&LevelOneRecordTime>=.5&&LevelOneRecordFrame<600){LevelOneRecordTime=0;IFileManager::Get().MakeDirectory(*(Folder/TEXT("Frames")),true);FScreenshotRequest::RequestScreenshot(Folder/TEXT("Frames")/((IsLevelOneReferenceMode()?FString(TEXT("ref-")):FString(TEXT("cont-")))+FString::Printf(TEXT("%04d.png"),LevelOneRecordFrame++)),true,false);}
}

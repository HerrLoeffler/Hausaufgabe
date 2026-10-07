#include "IslandWorld.h"
#include "Camera/CameraComponent.h"
#include "Camera/PlayerCameraManager.h"
#include "Components/CapsuleComponent.h"
#include "Components/InputComponent.h"
#include "Components/StaticMeshComponent.h"
#include "Components/TextRenderComponent.h"
#include "GameFramework/CharacterMovementComponent.h"
#include "Kismet/GameplayStatics.h"
#include "Engine/World.h"
#include "Engine/GameViewportClient.h"
#include "Widgets/SViewport.h"
#include "Misc/App.h"
namespace{AIslandGameMode* Game(const AActor* A){return A&&A->GetWorld()?Cast<AIslandGameMode>(A->GetWorld()->GetAuthGameMode()):nullptr;}}
AIslandCharacter::AIslandCharacter(){
 PrimaryActorTick.bCanEverTick=true;GetCapsuleComponent()->InitCapsuleSize(30,88);
 Camera=CreateDefaultSubobject<UCameraComponent>(TEXT("EgoCamera"));Camera->SetupAttachment(GetCapsuleComponent());Camera->SetRelativeLocation(FVector(0,0,72));Camera->bUsePawnControlRotation=true;Camera->FieldOfView=75;
 GetCharacterMovement()->MaxWalkSpeed=230;GetCharacterMovement()->MaxStepHeight=30;GetCharacterMovement()->JumpZVelocity=0;GetCharacterMovement()->bOrientRotationToMovement=false;
 bUseControllerRotationYaw=true;
}
bool AIslandCharacter::CanMove()const{auto* G=Game(this);auto* C=Cast<AIslandController>(Controller);return G&&C&&!G->Paused&&G->Focus<0&&C->KeysArmed;}
void AIslandCharacter::Forward(float V){if(CanMove())AddMovementInput(FRotator(0,GetControlRotation().Yaw,0).Vector(),V);}
void AIslandCharacter::Right(float V){if(CanMove())AddMovementInput(FRotationMatrix(FRotator(0,GetControlRotation().Yaw,0)).GetUnitAxis(EAxis::Y),V);}
void AIslandCharacter::Turn(float V){if(CanMove())AddControllerYawInput(V*.7f);}
void AIslandCharacter::Look(float V){if(CanMove())AddControllerPitchInput(V*.7f);}
void AIslandCharacter::SetupPlayerInputComponent(UInputComponent* I){Super::SetupPlayerInputComponent(I);I->BindAxis(TEXT("Forward"),this,&AIslandCharacter::Forward);I->BindAxis(TEXT("Right"),this,&AIslandCharacter::Right);I->BindAxis(TEXT("Turn"),this,&AIslandCharacter::Turn);I->BindAxis(TEXT("Look"),this,&AIslandCharacter::Look);}
void AIslandCharacter::Tick(float Dt){Super::Tick(Dt);if(auto* C=Cast<AIslandController>(Controller)){auto* G=Game(this);if(G&&!G->Paused&&G->Focus<0){const FVector2D M=C->TouchMove.GetClampedToMaxSize(1);AddMovementInput(FRotator(0,GetControlRotation().Yaw,0).Vector(),M.Y);AddMovementInput(FRotationMatrix(FRotator(0,GetControlRotation().Yaw,0)).GetUnitAxis(EAxis::Y),M.X);}}
 if(GetActorLocation().Z<-150)SetActorLocation(FVector(-1600,0,88));
}
void AIslandController::BeginPlay(){Super::BeginPlay();PlayerCameraManager->ViewPitchMin=-75;PlayerCameraManager->ViewPitchMax=75;UpdateMode();}
void AIslandController::SetupInputComponent(){Super::SetupInputComponent();InputComponent->BindKey(EKeys::E,IE_Pressed,this,&AIslandController::Interact);InputComponent->BindKey(EKeys::Escape,IE_Pressed,this,&AIslandController::Escape);InputComponent->BindKey(EKeys::LeftMouseButton,IE_Pressed,this,&AIslandController::PointerDown);InputComponent->BindTouch(IE_Pressed,this,&AIslandController::TouchPressed);InputComponent->BindTouch(IE_Repeat,this,&AIslandController::TouchMoved);InputComponent->BindTouch(IE_Released,this,&AIslandController::TouchReleased);}
void AIslandController::UpdateMode(){auto* G=Game(this);bool UI=G&&(G->Focus>=0||G->Paused);bShowMouseCursor=UI;if(UI){FInputModeGameAndUI M;M.SetHideCursorDuringCapture(false);SetInputMode(M);}else SetInputMode(FInputModeGameOnly());}
void AIslandController::CancelInput(){if(auto* G=Game(this)){G->PendingStroke=0;G->Contact.Reset();}Ownership.Cancel();TouchMove=FVector2D::ZeroVector;KeysArmed=false;if(auto* P=Cast<ACharacter>(GetPawn())){P->ConsumeMovementInputVector();P->GetCharacterMovement()->StopMovementImmediately();}}
void AIslandController::PlayerTick(float Dt){Super::PlayerTick(Dt);if(!FApp::HasFocus())CancelInput();if(!KeysArmed&&!IsInputKeyDown(EKeys::W)&&!IsInputKeyDown(EKeys::A)&&!IsInputKeyDown(EKeys::S)&&!IsInputKeyDown(EKeys::D))KeysArmed=true;}
void AIslandController::Interact(){if(auto* G=Game(this)){if(G->Paused)return;if(G->Focus>=0){G->SelectFocused();return;}if(G->Near>=0)G->Interact(G->Near);}}
void AIslandController::Escape(){if(auto* G=Game(this)){if(G->Focus>=0)G->Focus=-1;else G->Paused=!G->Paused;CancelInput();UpdateMode();}}
void AIslandController::PointerDown(){auto* G=Game(this);if(!G)return;if(G->Focus>=0||G->Paused){float X,Y;if(GetMousePosition(X,Y))if(auto* H=Cast<AIslandHUD>(GetHUD()))H->ClickAt(FVector2D(X,Y));}}
void AIslandController::TouchPressed(ETouchIndex::Type Finger,FVector P){TouchUsed=true;auto* G=Game(this);if(!G)return;int Id=(int)Finger;if(Id<0||Id>=10)return;if(G->Focus>=0||G->Paused){if(auto* H=Cast<AIslandHUD>(GetHUD()))H->ClickAt(FVector2D(P.X,P.Y));return;}int W,H;GetViewportSize(W,H);if(W<=0||H<=0)return;TouchOrigin[Id]=TouchLast[Id]=FVector2D(P.X,P.Y);auto R=Ownership.Begin(Id,P.X/W,P.Y/H);if(R==Island::TouchRole::Action)Interact();}
void AIslandController::TouchMoved(ETouchIndex::Type Finger,FVector P){int Id=(int)Finger;if(Id<0||Id>=10)return;auto* G=Game(this);if(!G||G->Focus>=0||G->Paused)return;FVector2D V(P.X,P.Y),D=V-TouchLast[Id];TouchLast[Id]=V;auto R=Ownership.Role(Id);if(R==Island::TouchRole::Move)TouchMove=FVector2D(V.X-TouchOrigin[Id].X,TouchOrigin[Id].Y-V.Y)/80.f;else if(R==Island::TouchRole::Look){AddYawInput(D.X*.12f);AddPitchInput(-D.Y*.12f);}}
void AIslandController::TouchReleased(ETouchIndex::Type Finger,FVector){int Id=(int)Finger;if(Ownership.Role(Id)==Island::TouchRole::Move)TouchMove=FVector2D::ZeroVector;Ownership.End(Id);}
AIslandGameMode::AIslandGameMode(){PrimaryActorTick.bCanEverTick=true;DefaultPawnClass=AIslandCharacter::StaticClass();PlayerControllerClass=AIslandController::StaticClass();HUDClass=AIslandHUD::StaticClass();}
AIslandCharacter* AIslandGameMode::Player()const{return Cast<AIslandCharacter>(UGameplayStatics::GetPlayerPawn(this,0));}
void AIslandGameMode::BeginPlay(){Super::BeginPlay();BuildWorld();if(auto* P=Player()){P->SetActorLocation(FVector(-1600,0,88));if(P->Controller)P->Controller->SetControlRotation(FRotator(-4,0,0));}Load();RefreshWorld(0);}
void AIslandGameMode::AddTarget(int Id,FVector P,const FString& Label,const FString& Context){Targets.Add({Id,P,Label,Context});}
const FIslandTarget* AIslandGameMode::Target(int Id)const{for(const auto& T:Targets)if(T.Id==Id)return &T;return nullptr;}
bool AIslandGameMode::Reachable(int Id)const{auto* P=Player();const auto* T=Target(Id);return P&&T&&FVector::Dist2D(P->GetActorLocation(),T->Pos)<=225;}
void AIslandGameMode::Tick(float Dt){Super::Tick(Dt);Clock+=Dt;MessageTime=FMath::Max(0.f,MessageTime-Dt);auto* P=Player();if(!P)return;
 if(Paused){Contact.Reset();return;}
 if(PendingStroke){const int Id=PendingStroke>0?400:402;if(!State.carrying||!Reachable(Id)){PendingStroke=0;Notify(TEXT("Füllung unterbrochen. Bleibe am Brunnen."));}else if((StrokeTime-=Dt)<=0){int V=PendingStroke;PendingStroke=0;Apply(V>0?Island::Action::Fill:Island::Action::Drain);}}
 Near=-1;float Best=225;for(const auto& T:Targets){if(T.Id==401&&State.carrying)continue;if(T.Id>=200&&T.Id<=208&&!State.intro)continue;float D=FVector::Dist2D(P->GetActorLocation(),T.Pos);if(D<Best){Best=D;Near=T.Id;}}
 if(!State.carrying&&State.bucketPlace==1&&Bucket){float D=FVector::Dist2D(P->GetActorLocation(),Bucket->GetActorLocation());if(D<Best){Near=401;}}
 int Tile=-1;FVector L=P->GetActorLocation();if(State.pathActive&&Focus<0){for(int I=0;I<9;++I){const auto* T=Target(200+I);if(T&&FMath::Abs(L.X-T->Pos.X)<42&&FMath::Abs(L.Y-T->Pos.Y)<42){Tile=I;break;}}}
 int Commit=Contact.Update(Tile,Dt,State.pathActive&&Focus<0);if(Commit>=0)Apply(Island::Action::PathStep,Commit);RefreshWorld(Dt);
}
void AIslandGameMode::Interact(int Id){
 if(Paused||PendingStroke)return;
 bool Can=Reachable(Id);if(Id==401&&State.bucketPlace==1&&!State.carrying)Can=Player()&&Bucket&&FVector::Dist2D(Player()->GetActorLocation(),Bucket->GetActorLocation())<=225;
 if(!Can){Notify(TEXT("Gehe näher heran."));return;}
 if(Id>=100&&Id<=103){Focus=Id;}else if(Id>=200&&Id<=208){Focus=Id;}else if(Id==10){Focus=Id;}else if(Id==11)Apply(Island::Action::IntroCheck);else if(Id==20)Apply(Island::Action::PathStart);else if(Id==21)Apply(Island::Action::PathCheck);else if(Id==22)Apply(Island::Action::PathUndo);else if(Id==401)Apply(Island::Action::Pickup);else if(Id==403)Apply(Island::Action::PlacePlate);else if(Id==404)Apply(Island::Action::PlaceStand);else if(Id==400||Id==402){if(!State.carrying){Notify(TEXT("Nimm zuerst den 1-Liter-Eimer auf."));return;}if(Id==400&&State.tenths==10){Notify(TEXT("Der Eimer ist voll: 10/10."));return;}if(Id==402&&State.tenths==0){Notify(TEXT("Der Eimer ist leer."));return;}PendingStroke=Id==400?1:-1;StrokeTime=.6f;Notify(Id==400?TEXT("100 ml fließen ein …"):TEXT("100 ml ablassen …"));}
 if(Focus>=0)if(auto* C=Cast<AIslandController>(UGameplayStatics::GetPlayerController(this,0))){C->CancelInput();C->UpdateMode();}
}
void AIslandGameMode::SelectFocused(){int Id=Focus;if(!Reachable(Id)){Focus=-1;return;}if(Id>=100&&Id<=103)Apply(Island::Action::IntroToggle,Id-100);else if(Id>=200&&Id<=208)Apply(Island::Action::PathStep,Id-200);Focus=-1;if(auto* C=Cast<AIslandController>(UGameplayStatics::GetPlayerController(this,0)))C->UpdateMode();}
FString AIslandGameMode::ResultText(Island::Result R)const{switch(R){case Island::Result::Applied:return TEXT("Bestätigt.");case Island::Result::Already:return TEXT("Schon bestätigt.");case Island::Result::Full:return TEXT("Alle Plätze belegt. Nimm zuerst eine Auswahl zurück.");case Island::Result::Empty:return TEXT("Hier ist noch nichts zum Zurücknehmen.");case Island::Result::Wrong:return TEXT("Noch nicht passend. Prüfe den Satzkontext.");case Island::Result::WrongRow:return TEXT("Beginne vorne und wähle genau ein Verb pro Reihe.");case Island::Result::Blocked:return TEXT("Starte zuerst den Weg oder nimm den falschen Schritt zurück.");case Island::Result::Incomplete:return TEXT("Es fehlt noch eine Auswahl. Das Tor bleibt geschlossen.");case Island::Result::TooLow:return TEXT("Es fehlt Wasser. Hebe den Eimer auf und fülle nach.");case Island::Result::TooHigh:return TEXT("Zu viel Wasser. Hebe den Eimer auf und lasse etwas ab.");default:return TEXT("Diese Auswahl gehört nicht zur Aufgabe.");}}
void AIslandGameMode::Apply(Island::Action A,int Value){bool OldIntro=State.intro,OldVerbs=State.verbs,OldWater=State.water;auto R=Island::Apply(State,A,Value);Notify(ResultText(R));if(A==Island::Action::PathStep&&R==Island::Result::Wrong){const auto* T=Target(200+Value);if(T)Notify(TEXT("Prüfe: ")+T->Context+TEXT(" · Diesen Schritt am Randstein zurücknehmen."));}if(!OldIntro&&State.intro)Notify(TEXT("Beide Verben erkannt. Das kleine Tor öffnet sich."));if(!OldVerbs&&State.verbs)Notify(TEXT("Drei Verbenschritte. Das Gartentor öffnet sich."));if(!OldWater&&State.water)Notify(TEXT("3/10 Liter = 300 ml. Die Wasserterrasse ist frei."));Save();RefreshWorld(0);}
void AIslandGameMode::Notify(const FString& S){Feedback=S;MessageTime=5;}
void AIslandGameMode::Save(){auto* S=Cast<UIslandSave>(UGameplayStatics::CreateSaveGameObject(UIslandSave::StaticClass()));S->Snapshot=FString(UTF8_TO_TCHAR(Island::Serialize(State).c_str()));if(auto* P=Player()){S->Position=P->GetActorLocation();S->View=P->GetControlRotation();}if(!UGameplayStatics::SaveGameToSlot(S,SaveSlot,0))Notify(TEXT("Speichern fehlgeschlagen. Dein Versuch bleibt hier erhalten."));}
bool AIslandGameMode::Load(){if(!UGameplayStatics::DoesSaveGameExist(SaveSlot,0))return false;auto* S=Cast<UIslandSave>(UGameplayStatics::LoadGameFromSlot(SaveSlot,0));if(!S)return false;Island::State Parsed;if(!Island::Deserialize(TCHAR_TO_UTF8(*S->Snapshot),Parsed))return false;if(S->Position.ContainsNaN()||S->View.ContainsNaN()||S->Position.X< -1900||S->Position.X>5400||FMath::Abs(S->Position.Y)>1200||S->Position.Z<40||S->Position.Z>300)return false;State=Parsed;PendingStroke=0;Contact.Reset();if(auto* P=Player()){P->SetActorLocation(S->Position);if(P->Controller)P->Controller->SetControlRotation(S->View);}RefreshWorld(0);return true;}
void AIslandGameMode::ResetDemo(){State=Island::State();Focus=-1;Near=-1;Paused=false;PendingStroke=0;Clock=MessageTime=StrokeTime=0;Feedback.Empty();Contact.Reset();for(auto& Gate:Gates)Gate.Angle=0;if(auto* P=Player()){P->SetActorLocation(FVector(-1600,0,88));if(P->Controller)P->Controller->SetControlRotation(FRotator(-4,0,0));}RefreshWorld(0);}
bool AIslandGameMode::GateBlocks(int I)const{return Gates.IsValidIndex(I)&&Gates[I].Actor&&Gates[I].Angle<89.9f;}
float AIslandGameMode::BucketWaterHeight()const{return 16.f*State.tenths/10.f;}
void AIslandGameMode::RefreshWorld(float Dt){
 bool Open[3]={State.intro,State.verbs,State.water};for(int I=0;I<Gates.Num()&&I<3;++I){auto& G=Gates[I];if(Open[I])G.Angle=FMath::Min(90.f,G.Angle+Dt*90/1.4f);G.Actor->SetActorRotation(FRotator(0,G.Angle,0));TArray<UStaticMeshComponent*> Meshes;G.Actor->GetComponents(Meshes);for(auto* M:Meshes)M->SetCollisionEnabled(G.Angle>=89.9f?ECollisionEnabled::NoCollision:ECollisionEnabled::QueryAndPhysics);}
 for(int I=0;I<IntroMarks.Num();++I){bool Picked=(State.introMask&(1<<I))!=0;IntroMarks[I]->SetText(FText::FromString(Picked?TEXT("X"):TEXT("-")));IntroMarks[I]->SetTextRenderColor(Picked?FColor(35,105,80):FColor(50,60,46));}
 for(int I=0;I<PathMarks.Num();++I){bool Picked=false;for(int N=0;N<State.pathCount;++N)Picked|=State.path[N]==I;PathMarks[I]->SetText(FText::FromString(Picked?TEXT("X"):TEXT("-")));PathMarks[I]->SetTextRenderColor(Picked?FColor(35,105,80):FColor(50,60,46));}
 for(int I=0;I<Signals.Num();++I)Signals[I]->SetVisibility(I==0?State.verbs:I==1?State.water:false);
 for(int I=0;I<Cables.Num();++I)Cables[I]->SetVisibility(I<3&&Open[I]);
 if(Bucket){FVector Base=State.bucketPlace==1?FVector(3350,0,7):FVector(2350,-220,50);if(State.carrying&&Player()){auto* P=Player();Base=P->Camera->GetComponentLocation()+P->Camera->GetForwardVector()*35+P->Camera->GetRightVector()*15-FVector(0,0,26);Bucket->SetActorRotation(FRotator(0,P->GetControlRotation().Yaw+90,0));}else Bucket->SetActorRotation(FRotator(0,0,0));Bucket->SetActorLocation(Base);}
 if(BucketWater){float Height=BucketWaterHeight();BucketWater->SetVisibility(Height>0);BucketWater->SetRelativeScale3D(FVector(.0892,.0892,FMath::Max(.005f,Height/100)));BucketWater->SetRelativeLocation(FVector(0,0,2+Height*.5f));}
 if(BucketAmount)BucketAmount->SetText(FText::FromString(FString::Printf(TEXT("%d/10  ·  %d ml"),State.tenths,State.tenths*100)));
}

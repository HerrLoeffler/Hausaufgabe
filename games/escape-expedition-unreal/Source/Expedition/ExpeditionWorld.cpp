#include "ExpeditionWorld.h"
#include "ExpeditionScreen.h"
#include "Camera/CameraActor.h"
#include "Camera/CameraComponent.h"
#include "Kismet/GameplayStatics.h"
#include "Components/StaticMeshComponent.h"
#include "Components/InputComponent.h"
#include "GameFramework/PlayerInput.h"
#include "GameFramework/HUD.h"
#include "Engine/GameViewportClient.h"
#include "Framework/Application/SlateApplication.h"
#include "Dom/JsonObject.h"
#include "Serialization/JsonSerializer.h"
#include "Serialization/JsonWriter.h"
using namespace ExpeditionV2;
namespace {
constexpr float PlayerZ=70.f;
bool Reachable(const State& S,const FVector& P){
 if(!FMath::IsFinite(P.X)||!FMath::IsFinite(P.Y)||P.X<-680||P.X>6120||P.Y<-490||P.Y>490)return false;
 if(P.X>950&&!HasSchool(S,1))return false;
 if(P.X>2800&&!HasSchool(S,3))return false;
 if(P.X>3500&&!HasLogic(S,2))return false;
 if(P.X>4700&&!HasLogic(S,3))return false;
 if(P.X>5900&&!HasLogic(S,4))return false;
 return true;
}
FVector SafeAnchor(const State& S){if(HasLogic(S,4))return FVector(5800,170,PlayerZ);if(HasLogic(S,3))return FVector(4860,170,PlayerZ);if(HasLogic(S,2))return FVector(3780,220,PlayerZ);if(HasSchool(S,3))return FVector(3000,170,PlayerZ);if(HasSchool(S,1))return FVector(1250,170,PlayerZ);return FVector(-80,170,PlayerZ);}
}
AExpeditionGameMode::AExpeditionGameMode(){PrimaryActorTick.bCanEverTick=true;HUDClass=AHUD::StaticClass();PlayerControllerClass=AExpeditionController::StaticClass();DefaultPawnClass=nullptr;}
void AExpeditionController::BeginPlay(){
 Super::BeginPlay();auto* G=Cast<AExpeditionGameMode>(GetWorld()->GetAuthGameMode());if(!G)return;
 Screen=SNew(SExpeditionScreen).Game(G);if(auto* V=GetWorld()->GetGameViewport())V->AddViewportWidgetContent(Screen.ToSharedRef(),30);
 FInputModeGameAndUI Mode;Mode.SetWidgetToFocus(Screen);Mode.SetHideCursorDuringCapture(false);Mode.SetLockMouseToViewportBehavior(EMouseLockMode::DoNotLock);SetInputMode(Mode);
 bShowMouseCursor=true;bEnableClickEvents=true;bEnableTouchEvents=true;
 TWeakObjectPtr<AExpeditionGameMode> Weak(G);
 ActivationHandle=FSlateApplication::Get().OnApplicationActivationStateChanged().AddLambda([Weak](bool Active){if(auto* M=Weak.Get()){if(!Active)M->Directions.LoseFocus();M->CancelInput();M->WasFocused=Active;}});
}
void AExpeditionController::EndPlay(const EEndPlayReason::Type Reason){if(FSlateApplication::IsInitialized())FSlateApplication::Get().OnApplicationActivationStateChanged().Remove(ActivationHandle);if(Screen.IsValid())if(auto* V=GetWorld()->GetGameViewport())V->RemoveViewportWidgetContent(Screen.ToSharedRef());Screen.Reset();Super::EndPlay(Reason);}
void AExpeditionController::SetupInputComponent(){Super::SetupInputComponent();
 const FKey MovementKeys[]={EKeys::W,EKeys::A,EKeys::S,EKeys::D,EKeys::Up,EKeys::Left,EKeys::Down,EKeys::Right};
 for(const FKey K:MovementKeys)for(const EInputEvent Event:{IE_Pressed,IE_Repeat,IE_Released}){
  FInputKeyBinding Binding(FInputChord(K),Event);
  Binding.KeyDelegate.GetDelegateForManualSet().BindLambda([this,K,Event](){if(auto* M=Cast<AExpeditionGameMode>(GetWorld()->GetAuthGameMode()))M->MovementKey(K,Event!=IE_Released,Event==IE_Repeat);});
  InputComponent->KeyBindings.Add(MoveTemp(Binding));
 }
 InputComponent->BindKey(EKeys::E,IE_Pressed,this,&AExpeditionController::InteractPressed);
 InputComponent->BindKey(EKeys::I,IE_Pressed,this,&AExpeditionController::BagPressed);
 InputComponent->BindKey(EKeys::Escape,IE_Pressed,this,&AExpeditionController::PausePressed);
 InputComponent->BindKey(EKeys::One,IE_Pressed,this,&AExpeditionController::NumberOne);
 InputComponent->BindKey(EKeys::Two,IE_Pressed,this,&AExpeditionController::NumberTwo);
 InputComponent->BindKey(EKeys::Three,IE_Pressed,this,&AExpeditionController::NumberThree);
 InputComponent->BindKey(EKeys::Four,IE_Pressed,this,&AExpeditionController::NumberFour);
 InputComponent->BindKey(EKeys::Enter,IE_Pressed,this,&AExpeditionController::ConfirmPressed);
}
#define EXP_ACTION(Method,Code) void AExpeditionController::Method(){if(auto* G=Cast<AExpeditionGameMode>(GetWorld()->GetAuthGameMode()))G->Click(Code);}
EXP_ACTION(InteractPressed,11) EXP_ACTION(BagPressed,4) EXP_ACTION(PausePressed,6)
EXP_ACTION(NumberOne,100) EXP_ACTION(NumberTwo,101) EXP_ACTION(NumberThree,102) EXP_ACTION(NumberFour,103)
void AExpeditionController::ConfirmPressed(){if(auto* G=Cast<AExpeditionGameMode>(GetWorld()->GetAuthGameMode())){if(G->Dialog==EExpDialog::Welcome)G->Click(1);else if(G->Dialog==EExpDialog::Question)G->Click(9);else if(G->Dialog==EExpDialog::Speech)G->Click(8);else if(G->Dialog==EExpDialog::Result)G->Click(10);else if(G->Dialog==EExpDialog::World)G->Click(11);}}
#undef EXP_ACTION
void AExpeditionGameMode::BeginPlay(){Super::BeginPlay();BuildWorld();if(auto* P=UGameplayStatics::GetPlayerController(this,0)){P->SetViewTarget(Camera);P->ConsoleCommand(TEXT("viewmode lit"));}RefreshWorld();UiDirty=true;}
bool AExpeditionGameMode::MovementKey(const FKey& Key,bool Down,bool Repeat){
 const FKey Keys[]={EKeys::W,EKeys::A,EKeys::S,EKeys::D,EKeys::Up,EKeys::Left,EKeys::Down,EKeys::Right};
 for(int i=0;i<8;++i)if(Key==Keys[i]){if(Down)Directions.Down(i,Repeat);else Directions.Up(i);if(Dialog!=EExpDialog::World)Directions.Suspend();return true;}return false;
}
void AExpeditionGameMode::CancelInput(){Directions.Suspend();MoveInput=FVector2D::ZeroVector;TouchInput=FVector2D::ZeroVector;NeedsRelease=true;}
void AExpeditionGameMode::SetDialog(EExpDialog NewDialog){Dialog=NewDialog;CancelInput();UiDirty=true;}
bool AExpeditionGameMode::CanWalk(const FVector& P)const{
 if(!Reachable(State,P))return false;
 if(P.X>=3350&&P.X<=3650&&FMath::Abs(P.Y)>139)return false;
 auto Box=[&](FVector2D C,FVector2D Half){return FMath::Abs(P.X-C.X)<=Half.X&&FMath::Abs(P.Y-C.Y)<=Half.Y;};
 if(Box({700,-80},{145,145})||Box({1574,-210},{168,122})||Box({5086,-201.5},{145,148}))return false;
 if(Box({-440,-270},{85,68})||Box({400,370},{110,52})||Box({5650,390},{110,52})||Box({5530,60},{102,85})||Box({5780,-80},{132,76}))return false;
 const FVector2D Pots[]={{505,-340},{862,-285},{552,60},{843,63},{5310,350}};
 for(auto C:Pots)if(Box(C,{55,55}))return false;
 for(int i=0;i<4;++i)if(Box({150+(i%2)*110.,-350-(i/2)*95.},{70,64}))return false;
 for(int i=0;i<6;++i)if(FVector2D(P.X-(4880+i*205),P.Y-(i%2?-455:-520)).Size()<72)return false;
 for(const auto& T:Targets){
  if(T.Id==1||T.Id==3||T.Id==4||T.Id==10||T.Id==14||!TargetVisible(T.Id))continue;
  float Radius=T.Id==8?128:T.Id==9?128:T.Id==13?108:48;
  if(FVector::Dist2D(P,T.Pos)<Radius)return false;
 }
 FCollisionQueryParams Query(SCENE_QUERY_STAT(ExpeditionWalk),false,Explorer);
 return !GetWorld()->OverlapAnyTestByChannel(FVector(P.X,P.Y,70),FQuat::Identity,ECC_Visibility,FCollisionShape::MakeSphere(24),Query);
}
void AExpeditionGameMode::StepMovement(float Dt){
 if(Dialog!=EExpDialog::World||NeedsRelease||!Explorer){MoveInput=FVector2D::ZeroVector;return;}
 FVector2D V=MoveInput.GetClampedToMaxSize(1);auto P=Explorer->GetActorLocation();
 FVector D(V.X*245*Dt,-V.Y*245*Dt,0);
 FVector Next=P+FVector(D.X,0,0);if(CanWalk(Next))P=Next;
 Next=P+FVector(0,D.Y,0);if(CanWalk(Next))P=Next;
 Explorer->SetActorLocation(P);
 if(V.SizeSquared()>.005){AnimationTime+=Dt;Explorer->SetActorRotation(FRotator(0,FMath::RadiansToDegrees(FMath::Atan2(-V.Y,V.X))+90,0));}
 for(int I=0;I<Legs.Num();++I)if(Legs[I])Legs[I]->SetRelativeRotation(FRotator(V.SizeSquared()>.005?FMath::Sin(AnimationTime*12+(I%2)*PI)*19:0,0,0));
}
void AExpeditionGameMode::Tick(float Dt){
 Super::Tick(Dt);ToastTimer=FMath::Max(0.f,ToastTimer-Dt);auto* P=UGameplayStatics::GetPlayerController(this,0);if(!P||!Explorer)return;
 bool Focused=!FSlateApplication::IsInitialized()||FSlateApplication::Get().IsActive();
 if(!Focused){if(WasFocused){Directions.LoseFocus();CancelInput();}WasFocused=false;}else{if(!WasFocused)CancelInput();WasFocused=true;}
 if(Focused){
 FVector2D Keys(Directions.Horizontal(),Directions.Vertical());
 if(Dialog==EExpDialog::World){if(NeedsRelease&&(Directions.Held==0||Directions.Effective()!=0)&&TouchInput.IsZero())NeedsRelease=false;MoveInput=Keys.IsZero()?TouchInput:Keys;StepMovement(FMath::Min(Dt,.05f));}
 if(Dialog!=EExpDialog::Welcome&&Dialog!=EExpDialog::Pause&&Dialog!=EExpDialog::Teacher&&Dialog!=EExpDialog::Inventory&&!State.finale){ActiveTime+=Dt;if(Dialog==EExpDialog::Question||((Dialog==EExpDialog::Speech||Dialog==EExpDialog::Result)&&CurrentSchool>=0))SchoolTime+=Dt;else if(Dialog==EExpDialog::Shell||Dialog==EExpDialog::Route||Dialog==EExpDialog::Rope||Dialog==EExpDialog::Mosaic||Dialog==EExpDialog::Symbols)LogicTime+=Dt;else TravelTime+=Dt;}
 AutoSaveTime+=Dt;if(AutoSaveTime>8&&Dialog==EExpDialog::World){Save();AutoSaveTime=0;}
 }
 int Old=NearId;NearId=-1;float Distance=190;auto EP=Explorer->GetActorLocation();
 for(const auto& T:Targets)if(TargetVisible(T.Id)){float D=FVector::Dist2D(EP,T.Pos);if(D<Distance){Distance=D;NearId=T.Id;NearLabel=T.Label;}}
 if(NearId!=Old&&Dialog!=EExpDialog::World)UiDirty=true;
 if(Camera){FVector Want=EP+FVector(0,950,1650);Camera->SetActorLocation(FMath::VInterpTo(Camera->GetActorLocation(),Want,Dt,6));}
 if(NearMarker){NearMarker->SetVisibility(NearId>=0&&Dialog==EExpDialog::World);if(NearId>=0)for(const auto& T:Targets)if(T.Id==NearId)NearMarker->SetWorldLocation(FVector(T.Pos.X,T.Pos.Y,32));}
 if(UiDirty){RebuildUI();UiDirty=false;}
}
int AExpeditionGameMode::SchoolSolved()const{int N=0;for(int i=0;i<7;++i)N+=HasSchool(State,i)?1:0;return N;}
int AExpeditionGameMode::Solved()const{int N=SchoolSolved();for(int i=0;i<5;++i)N+=HasLogic(State,i)?1:0;return N;}
FString AExpeditionGameMode::AreaName()const{float X=Explorer?Explorer->GetActorLocation().X:0;return X<950?TEXT("Küstenort"):X<2800?TEXT("Garten & Wald"):X<4700?TEXT("Strand & Steg"):TEXT("Die Leuchtfeuerruine");}
FString AExpeditionGameMode::Mission()const{
 if(State.finale)return TEXT("Das Leuchtfeuer strahlt wieder. Danke für deine Hilfe!");
 if(!HasSchool(State,0))return TEXT("Sprich mit Mara auf dem Dorfplatz.");
 if(!HasSchool(State,1))return TEXT("Benutze die Messschale am Becken neben der Gartenpforte.");
 if(!HasSchool(State,2))return TEXT("Gehe durch die Gartenpforte und untersuche das Saatbeet.");
 if(!HasLogic(State,1))return TEXT("Hilf Jona beim Finden der richtigen Holzbrücke.");
 if(!HasSchool(State,3))return TEXT("Sprich mit Elin an der Strandpforte.");
 if(!HasLogic(State,0))return State.shell?TEXT("Setze die Muschel in die Werkstattkiste im Dorf ein."):TEXT("Hole die Spiralmuschel am Dorfstrand und öffne damit die Werkstattkiste.");
 if(!HasLogic(State,2))return TEXT("Sprich mit Tilda und sichere den Steg mit dem Seil.");
 if(!HasSchool(State,4))return TEXT("Untersuche das Wasseratelier hinter dem Steg.");
 if(!HasLogic(State,3))return TEXT("Finde das passende Fragment auf dem Mosaiktisch.");
 if(!HasSchool(State,5))return TEXT("Bereite die sechzehn Lampen in der Ruine vor.");
 if(!HasSchool(State,6))return TEXT("Vergleiche die Brüche am Linsensockel.");
 if(!HasLogic(State,4))return TEXT("Ordne Blatt, Welle und Sonne an der Ruinentür.");
 return TEXT("Gehe zur Spitze und entzünde das Leuchtfeuer.");
}
bool AExpeditionGameMode::TargetVisible(int Id)const{if(Id==1)return !State.shell;if(Id>=4&&Id<=6)return HasSchool(State,1);if(Id==7)return HasSchool(State,3);if(Id==8||Id==9)return HasLogic(State,2);if(Id>=10&&Id<=12)return HasLogic(State,3);if(Id==13)return HasLogic(State,4);return true;}
void AExpeditionGameMode::Notify(const FString& M){Toast=M;ToastTimer=4;UiDirty=true;}
void AExpeditionGameMode::NewGame(){State={};Directions={};DialogHistory.Reset();ReturnDialog=EExpDialog::World;CurrentSchool=-1;SelectedOption=-1;RoutePreview=-1;Feedback.Empty();DialogueText.Empty();ActiveTime=SchoolTime=LogicTime=TravelTime=0;AnimationTime=0;if(Explorer)Explorer->SetActorLocation(FVector(-80,170,PlayerZ));SetDialog(EExpDialog::World);RefreshWorld();Save();Notify(TEXT("Mara wartet auf dem Dorfplatz. Geh zu ihr und drücke E oder „Ansprechen“."));}
void AExpeditionGameMode::OpenSchool(int Id){
 CurrentSchool=Id;SelectedOption=-1;Feedback.Empty();
 if(HasSchool(State,Id)){Notify(TEXT("Diese Aufgabe hast du bereits gelöst."));SetDialog(EExpDialog::World);return;}
 if(!SchoolReady(State,Id)){Notify(Mission());SetDialog(EExpDialog::World);return;}
 SetDialog(EExpDialog::Question);
}
void AExpeditionGameMode::Interact(int Id){
 ReturnDialog=EExpDialog::World;Feedback.Empty();SelectedOption=-1;CurrentSchool=-1;
 const int SchoolTargets[]={0,3,4,6,8,10,11};for(int i=0;i<7;++i)if(Id==SchoolTargets[i]){
 CurrentSchool=i;auto Q=QuestionFor(i);Speaker=Q.Speaker;
 if(HasSchool(State,i)){DialogueText=Q.Explanation;CurrentSchool=-1;SetDialog(EExpDialog::Speech);return;}
 if(!SchoolReady(State,i)){Notify(Mission());return;}
 const TCHAR* Intro[]={TEXT("Unser Leuchtfeuer ist dunkel. Du kannst es mit Wissen und Köpfchen wieder entzünden. Für deinen Weg bekommst du meine Messschale — zuerst brauche ich deine Hilfe."),TEXT("Die Messschale zeigt dir die fehlende Menge. Drei der vier gleichen Bereiche sind bereits gefüllt. Mit der passenden Menge öffnet sich die Gartenpforte."),TEXT("Zwölf Samen warten im Beet. Die erste Hälfte soll wachsen. Löse die Mengenfrage und finde die Blattscheibe."),TEXT("Jona hat seine Tasche wieder. Ich öffne dir die Strandpforte, wenn du die Bruchnotiz in Prozent übersetzen kannst."),TEXT("Hier treffen zwei Wassermengen zusammen. Rechne sie zusammen, dann zeigt sich die Wellenscheibe."),TEXT("In der Ruine stehen sechzehn Lampen. Nur ein Viertel soll die Vorbereitung erhellen. Danach wartet die Linse."),TEXT("Die Linse verstärkt die größere Wassermenge. Vergleiche die beiden Brüche — die Zeichnungen dürfen dich nicht täuschen.")};
 DialogueText=Intro[i];SetDialog(EExpDialog::Speech);return;
 }
 switch(Id){
 case 1:ResultMessage(CollectShell(State),TEXT("Spiralmuschel gefunden. Die gleiche Spiralform ist an der Werkstattkiste."));break;
 case 2:Speaker=TEXT("Werkstattkiste");DialogueText=TEXT("In der Kiste liegt ein Seil. Die Vertiefung im Deckel sieht aus wie eine kleine Spiralmuschel. Welchen Gegenstand setzt du ein?");SetDialog(EExpDialog::Shell);break;
 case 5:Speaker=TEXT("Jona · Gärtner");DialogueText=TEXT("Ich habe meine Tasche bei einer Brücke liegen lassen. Sie ist aus Holz und liegt über fließendem Wasser. Schau auf Material UND Wasserbewegung.");SetDialog(EExpDialog::Route);break;
 case 7:Speaker=TEXT("Tilda · Bootsbauerin");DialogueText=TEXT("Der Steg braucht zwei tragfähige Seilpunkte. Der Steinring und der Metallring sind stabil; der Holzpfosten ist morsch. Wähle beide Punkte und spanne das Seil erst danach.");if(!HasLogic(State,0))Feedback=TEXT("Dir fehlt das Seil aus der Werkstattkiste im Dorf. Der Rückweg bleibt offen.");SetDialog(EExpDialog::Rope);break;
 case 9:Speaker=TEXT("Mosaiktisch");DialogueText=TEXT("Die Kontur UND die blaue Linie müssen an das leere Muster anschließen. Wähle ein Fragment, drehe es bei Bedarf und lege es bewusst ein.");SetDialog(EExpDialog::Mosaic);break;
 case 12:Speaker=TEXT("Die drei Scheibensockel");DialogueText=TEXT("Blatt liegt vor Welle. Sonne liegt unmittelbar nach Welle. Setze die drei Scheiben und prüfe die Reihenfolge.");SetDialog(EExpDialog::Symbols);break;
 case 13:Speaker=TEXT("Das Leuchtfeuer");DialogueText=TEXT("Alle Scheiben sitzen richtig. Die Linse ist bereit. Jetzt darfst du das Leuchtfeuer selbst entzünden.");SetDialog(EExpDialog::Finale);break;
 case 14:Speaker=TEXT("Wegweiser");DialogueText=TEXT("Der Weg führt vom Dorf durch den Garten zum Strand und hinauf zur Ruine. Behalte die Dinge in deinem Rucksack — du brauchst sie später. WASD oder Pfeile bewegen dich; E untersucht das nahe Ziel.");SetDialog(EExpDialog::Speech);break;
 default:break;
 }
}
void AExpeditionGameMode::ResultMessage(Result R,const FString& Success){
 switch(R){case Result::Applied:Feedback=Success;Notify(Success);Save();RefreshWorld();break;case Result::Already:Feedback=TEXT("Schon erledigt. Dein Fortschritt bleibt erhalten.");break;case Result::Wrong:Feedback=TEXT("Das passt noch nicht. Vergleiche den Hinweis mit deiner Auswahl; deine Gegenstände bleiben erhalten.");break;case Result::MissingItem:Feedback=TEXT("Dir fehlt noch der passende Gegenstand. Schau in den Rucksack oder hole das Seil aus der Werkstattkiste.");break;case Result::Blocked:Feedback=Mission();break;default:Feedback=TEXT("Diese Auswahl ist hier noch nicht möglich.");break;}UiDirty=true;
}
void AExpeditionGameMode::Answer(){
 if(Dialog!=EExpDialog::Question)return;auto Q=Question();if(!Q.Codes.IsValidIndex(SelectedOption)){Feedback=TEXT("Wähle zuerst eine Antwort. Erst „Prüfen“ bestätigt sie.");UiDirty=true;return;}
 auto R=School(State,CurrentSchool,TCHAR_TO_UTF8(*Q.Codes[SelectedOption]));
 if(R==Result::Wrong){Feedback=TEXT("Versuch es noch einmal. ")+Q.Hint;SelectedOption=-1;Save();UiDirty=true;return;}
 if(R==Result::Applied){DialogueText=Q.Explanation;if(State.pending[CurrentSchool])DialogueText+=TEXT(" Du hast den Weg gefunden. Zeige ihn jetzt noch einmal mit einer neuen Zahl.");else DialogueText+=TEXT(" Dein Fortschritt ist gespeichert.");Speaker=Q.Speaker;SetDialog(EExpDialog::Result);RefreshWorld();Save();return;}
 ResultMessage(R,TEXT("Aufgabe gelöst."));
}
void AExpeditionGameMode::Click(int Id){
 auto Close=[this](){
  if((Dialog==EExpDialog::Inventory||Dialog==EExpDialog::Teacher)&&DialogHistory.Num()>0){auto Back=DialogHistory.Pop();SetDialog(Back);}
  else if(Dialog!=EExpDialog::Welcome){DialogHistory.Reset();ReturnDialog=EExpDialog::World;SetDialog(EExpDialog::World);}
 };
 if(Id==1&&(Dialog==EExpDialog::Welcome||Dialog==EExpDialog::Pause)){NewGame();return;}
 if(Id==2){if(Load()){DialogHistory.Reset();SetDialog(State.finale?EExpDialog::Finale:EExpDialog::World);Notify(SaveMessage);}else{Feedback=SaveMessage;UiDirty=true;}return;}
 if(Id==3){Close();return;}
 if(Id==4&&Dialog!=EExpDialog::Welcome){if(Dialog==EExpDialog::Inventory)Close();else{DialogHistory.Add(Dialog);SetDialog(EExpDialog::Inventory);}return;}
 if(Id==5&&Dialog!=EExpDialog::Teacher){DialogHistory.Add(Dialog);SetDialog(EExpDialog::Teacher);return;}
 if(Id==6){if(Dialog==EExpDialog::World){Save();SetDialog(EExpDialog::Pause);}else Close();return;}
 if(Id==7){if(Dialog==EExpDialog::Question)Feedback=Question().Hint;else Feedback=DialogueText;UiDirty=true;return;}
 if(Id==8&&Dialog==EExpDialog::Speech){if(CurrentSchool>=0)OpenSchool(CurrentSchool);else SetDialog(EExpDialog::World);return;}
 if(Id==9){Answer();return;}
 if(Id==10&&Dialog==EExpDialog::Result){if(CurrentSchool>=0&&State.pending[CurrentSchool])OpenSchool(CurrentSchool);else{Notify(Mission());SetDialog(EExpDialog::World);}return;}
 if(Id==11&&Dialog==EExpDialog::World&&NearId>=0){Interact(NearId);return;}
 if(Id>=100&&Id<=103&&Dialog==EExpDialog::Question){if(Question().Options.IsValidIndex(Id-100)){SelectedOption=Id-100;Feedback.Empty();UiDirty=true;}return;}
 if(Id>=200&&Id<=205&&Dialog==EExpDialog::Shell){ResultMessage(UseShell(State,Id-200),TEXT("Die Muschel passt! Das Fach öffnet sich und du nimmst das Seil mit."));return;}
 if(Id>=300&&Id<=302&&Dialog==EExpDialog::Route){RoutePreview=Id-300;UiDirty=true;return;}
 if(Id==310&&Dialog==EExpDialog::Route){ResultMessage(ChooseRoute(State,RoutePreview),TEXT("Holz und fließendes Wasser: Das ist Jonas Brücke. Seine Tasche ist gefunden."));return;}
 if(Id>=400&&Id<=402&&Dialog==EExpDialog::Rope){ResultMessage(SelectAnchor(State,Id-400),TEXT("Seilpunkt geändert. Jetzt die beiden tragfähigen Punkte wählen und spannen."));return;}
 if(Id==410&&Dialog==EExpDialog::Rope){ResultMessage(Tension(State),TEXT("Das Seil sitzt fest. Der Steg ist sicher und bleibt geöffnet."));return;}
 if(Id>=500&&Id<=502&&Dialog==EExpDialog::Mosaic){ResultMessage(PickMosaic(State,Id-500),TEXT("Fragment ausgewählt. Prüfe Kontur und Linie."));return;}
 if(Id==510&&Dialog==EExpDialog::Mosaic){ResultMessage(RotateMosaic(State),TEXT("Fragment gedreht."));return;}
 if(Id==511&&Dialog==EExpDialog::Mosaic){ResultMessage(PlaceMosaic(State),TEXT("Kontur und Linie passen. Du bekommst die Sonnenscheibe und der Ruinenweg öffnet sich."));return;}
 if(Id>=600&&Id<=602&&Dialog==EExpDialog::Symbols){ResultMessage(PutSymbol(State,Id-600),TEXT("Scheibe gesetzt oder zurückgenommen."));return;}
 if(Id==610&&Dialog==EExpDialog::Symbols){ClearSymbols(State);Feedback.Empty();UiDirty=true;Save();return;}
 if(Id==611&&Dialog==EExpDialog::Symbols){ResultMessage(ConfirmSymbols(State),TEXT("Blatt, Welle, Sonne — das Tor öffnet sich. Entzünde nun das Leuchtfeuer."));return;}
 if(Id==620&&Dialog==EExpDialog::Finale){auto R=Ignite(State);ResultMessage(R,TEXT("Das Leuchtfeuer strahlt! Du hast dem Dorf geholfen."));RefreshWorld();return;}
}
void AExpeditionGameMode::Save(){
 if(!Validate(State)||!Explorer)return;
 auto J=MakeShared<FJsonObject>();J->SetStringField(TEXT("episode"),TEXT("leuchtfeuer"));J->SetStringField(TEXT("revision"),UTF8_TO_TCHAR(State.revision.c_str()));
 J->SetNumberField(TEXT("school"),State.school);J->SetNumberField(TEXT("logic"),State.logic);J->SetNumberField(TEXT("anchors"),State.anchors);J->SetNumberField(TEXT("mosaic"),State.mosaic);J->SetNumberField(TEXT("turn"),State.turn);J->SetBoolField(TEXT("shell"),State.shell);J->SetBoolField(TEXT("finale"),State.finale);
 TArray<TSharedPtr<FJsonValue>> Symbols,Failures,Transfer,Pending;for(int V:State.symbols)Symbols.Add(MakeShared<FJsonValueNumber>(V));for(int i=0;i<7;++i){Failures.Add(MakeShared<FJsonValueNumber>(State.failures[i]));Transfer.Add(MakeShared<FJsonValueBoolean>(State.transfer[i]));Pending.Add(MakeShared<FJsonValueBoolean>(State.pending[i]));}
 J->SetArrayField(TEXT("symbols"),Symbols);J->SetArrayField(TEXT("failures"),Failures);J->SetArrayField(TEXT("transfer"),Transfer);J->SetArrayField(TEXT("pending"),Pending);
 auto P=Explorer->GetActorLocation();J->SetNumberField(TEXT("x"),P.X);J->SetNumberField(TEXT("y"),P.Y);J->SetNumberField(TEXT("activeTime"),ActiveTime);J->SetNumberField(TEXT("schoolTime"),SchoolTime);J->SetNumberField(TEXT("logicTime"),LogicTime);J->SetNumberField(TEXT("travelTime"),TravelTime);
 FString Json;FJsonSerializer::Serialize(J,TJsonWriterFactory<>::Create(&Json));auto* Slot=Cast<UExpeditionSave>(UGameplayStatics::CreateSaveGameObject(UExpeditionSave::StaticClass()));Slot->Snapshot=Json;
 if(!UGameplayStatics::SaveGameToSlot(Slot,SaveSlot,0)){SaveMessage=TEXT("Der lokale Spielstand konnte nicht gespeichert werden.");UE_LOG(LogTemp,Warning,TEXT("EXPEDITION_SAVE_FAILED %s"),*SaveSlot);}
}
bool AExpeditionGameMode::Load(){
 auto* Slot=Cast<UExpeditionSave>(UGameplayStatics::LoadGameFromSlot(SaveSlot,0));if(!Slot){SaveMessage=TEXT("Noch kein Spielstand dieser neuen Expedition vorhanden.");return false;}
 TSharedPtr<FJsonObject> J;if(!FJsonSerializer::Deserialize(TJsonReaderFactory<>::Create(Slot->Snapshot),J)||!J.IsValid()){SaveMessage=TEXT("Der Spielstand ist beschädigt. Bitte starte eine neue Expedition.");return false;}
 FString Ep,Rev;if(!J->TryGetStringField(TEXT("episode"),Ep)||!J->TryGetStringField(TEXT("revision"),Rev)||Ep!=TEXT("leuchtfeuer")||Rev!=TEXT("master-1")){SaveMessage=TEXT("Dieser Spielstand gehört zu einer anderen Spielversion.");return false;}
 ExpeditionV2::State Candidate;bool Good=true;
 auto Integer=[&](const TCHAR* Name,int& Value){double N;if(!J->TryGetNumberField(Name,N)||!FMath::IsFinite(N)||N<-1||N>100000||N!=FMath::FloorToDouble(N)){Good=false;return;}Value=static_cast<int>(N);};
 Integer(TEXT("school"),Candidate.school);Integer(TEXT("logic"),Candidate.logic);Integer(TEXT("anchors"),Candidate.anchors);Integer(TEXT("mosaic"),Candidate.mosaic);Integer(TEXT("turn"),Candidate.turn);
 Good&=J->TryGetBoolField(TEXT("shell"),Candidate.shell);Good&=J->TryGetBoolField(TEXT("finale"),Candidate.finale);
 const TArray<TSharedPtr<FJsonValue>> *A=nullptr;
 auto IntArray=[&](const TCHAR* Name,int* Values,int Count){if(!J->TryGetArrayField(Name,A)||A->Num()!=Count){Good=false;return;}for(int i=0;i<Count;++i){double N;if(!(*A)[i]->TryGetNumber(N)||!FMath::IsFinite(N)||N<-1||N>100000||N!=FMath::FloorToDouble(N)){Good=false;return;}Values[i]=static_cast<int>(N);}};
 auto BoolArray=[&](const TCHAR* Name,bool* Values,int Count){if(!J->TryGetArrayField(Name,A)||A->Num()!=Count){Good=false;return;}for(int i=0;i<Count;++i)if(!(*A)[i]->TryGetBool(Values[i]))Good=false;};
 IntArray(TEXT("symbols"),Candidate.symbols,3);IntArray(TEXT("failures"),Candidate.failures,7);BoolArray(TEXT("transfer"),Candidate.transfer,7);BoolArray(TEXT("pending"),Candidate.pending,7);
 double X=0,Y=0,At=0,St=0,Lt=0,Tt=0;auto Num=[&](const TCHAR* Name,double& V){if(!J->TryGetNumberField(Name,V)||!FMath::IsFinite(V)||FMath::Abs(V)>10000000)Good=false;};Num(TEXT("x"),X);Num(TEXT("y"),Y);Num(TEXT("activeTime"),At);Num(TEXT("schoolTime"),St);Num(TEXT("logicTime"),Lt);Num(TEXT("travelTime"),Tt);
 if(!Good||!Validate(Candidate)||At<0||St<0||Lt<0||Tt<0){SaveMessage=TEXT("Der Spielstand enthält widersprüchliche Daten. Dein aktueller Fortschritt bleibt erhalten.");return false;}
 State=Candidate;RefreshWorld();ActiveTime=At;SchoolTime=St;LogicTime=Lt;TravelTime=Tt;
 FVector Pos(X,Y,PlayerZ);bool Repaired=!CanWalk(Pos);if(Repaired)Pos=SafeAnchor(State);
 if(Explorer)Explorer->SetActorLocation(Pos);CurrentSchool=-1;SelectedOption=-1;RoutePreview=-1;Feedback.Empty();RefreshWorld();CancelInput();UiDirty=true;
 SaveMessage=Repaired?TEXT("Spielstand geladen. Deine Position wurde auf einen sicheren Weg zurückgesetzt."):TEXT("Spielstand geladen. Willkommen zurück!");return true;
}

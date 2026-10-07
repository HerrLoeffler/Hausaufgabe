#include "ExpeditionWorld.h"
#include "Camera/CameraActor.h"
#include "Camera/CameraComponent.h"
#include "GameFramework/PlayerController.h"
#include "Kismet/GameplayStatics.h"
#include "Components/StaticMeshComponent.h"
#include "Dom/JsonObject.h"
#include "Serialization/JsonSerializer.h"
#include "Serialization/JsonWriter.h"
#include "Engine/GameViewportClient.h"
#include "Widgets/SViewport.h"
#include "Components/InputComponent.h"
#include "Widgets/Layout/SBorder.h"
#include "Styling/CoreStyle.h"
using namespace Expedition;
AExpeditionGameMode::AExpeditionGameMode(){PrimaryActorTick.bCanEverTick=true;HUDClass=AExpeditionHUD::StaticClass();PlayerControllerClass=AExpeditionController::StaticClass();DefaultPawnClass=nullptr;}
void AExpeditionController::BeginPlay(){Super::BeginPlay();FInputModeGameAndUI Mode;Mode.SetHideCursorDuringCapture(false);Mode.SetLockMouseToViewportBehavior(EMouseLockMode::DoNotLock);if(auto* V=GetWorld()->GetGameViewport()){
 if(V->GetGameViewportWidget().IsValid())Mode.SetWidgetToFocus(V->GetGameViewportWidget());
 TWeakObjectPtr<AExpeditionController> Weak(this);
 PointerOverlay=SNew(SBorder).BorderImage(FCoreStyle::Get().GetBrush(TEXT("NoBrush"))).OnMouseButtonDown_Lambda([Weak](const FGeometry& Geo,const FPointerEvent& Event){
 if(Event.GetEffectingButton()!=EKeys::LeftMouseButton||!Weak.IsValid())return FReply::Unhandled();
 auto* H=Cast<AExpeditionHUD>(Weak->GetHUD());if(!H)return FReply::Unhandled();
 FVector2D Size=Geo.GetLocalSize();if(Size.X<=0||Size.Y<=0)return FReply::Unhandled();
 FVector2D P=Geo.AbsoluteToLocal(Event.GetScreenSpacePosition());P.X=P.X/Size.X*H->DrawSize.X;P.Y=P.Y/Size.Y*H->DrawSize.Y;
 return H->ClickAt(P)?FReply::Handled():FReply::Unhandled();
 });V->AddViewportWidgetContent(PointerOverlay.ToSharedRef(),100);
 }SetInputMode(Mode);bShowMouseCursor=true;bEnableClickEvents=true;bEnableTouchEvents=true;}
void AExpeditionController::EndPlay(const EEndPlayReason::Type Reason){if(PointerOverlay.IsValid())if(auto* V=GetWorld()->GetGameViewport())V->RemoveViewportWidgetContent(PointerOverlay.ToSharedRef());PointerOverlay.Reset();Super::EndPlay(Reason);}
void AExpeditionController::SetupInputComponent(){Super::SetupInputComponent();InputComponent->BindKey(EKeys::LeftMouseButton,IE_Pressed,this,&AExpeditionController::PointerDown);}
void AExpeditionController::PointerDown(){float X,Y;if(GetMousePosition(X,Y))if(auto* H=Cast<AExpeditionHUD>(GetHUD())){bool Hit=H->ClickAt(FVector2D(X,Y));UE_LOG(LogTemp,Display,TEXT("EXPEDITION_POINTER %.0f %.0f hit=%d"),X,Y,Hit);}}
void AExpeditionGameMode::BeginPlay(){Super::BeginPlay();BuildWorld();auto* P=UGameplayStatics::GetPlayerController(this,0);if(P){P->bShowMouseCursor=true;P->SetViewTarget(Camera);P->SetInputMode(FInputModeGameAndUI());P->ConsoleCommand(TEXT("viewmode lit"));}Dialog=8;RefreshWorld();}
void AExpeditionGameMode::CancelInput(){MoveInput=FVector2D::ZeroVector;TouchMoving=false;}
int AExpeditionGameMode::Solved()const{int N=0;for(int I=0;I<8;++I)N+=(State.slots>>I)&1;return N;}
FString AExpeditionGameMode::Mission()const{
 if(State.finale)return TEXT("Signal angekommen · Expedition geschafft!");
 if(!State.mapJoined)return TEXT("CAMP · Feldnotizen lesen und beide Kartenhälften finden");
 if(State.path!=2)return TEXT("CAMP · Vergleiche die Karte mit den Landmarken");
 if(!State.bridge)return TEXT("UFER · Wartungsnotizen prüfen und Brücke sichern");
 if(!Has(State,255))return TEXT("STATION · Betriebsnotizen vervollständigen");
 return TEXT("STATION · Strom umleiten und Funkgerät benutzen");
}
void AExpeditionGameMode::Tick(float Dt){
 Super::Tick(Dt);Elapsed+=Dt;ToastTimer=FMath::Max(0.f,ToastTimer-Dt);
 if(Dialog==1)LearnTime+=Dt;else if(Dialog==0&&!State.finale)WorldTime+=Dt;
 auto* P=UGameplayStatics::GetPlayerController(this,0);if(!P||!Explorer)return;
 if(P->WasInputKeyJustPressed(EKeys::Escape)){Dialog=Dialog?0:7;CancelInput();}
 if(P->WasInputKeyJustPressed(EKeys::I)){Dialog=Dialog==5?0:5;CancelInput();}
 if(Dialog)if(auto* H=Cast<AExpeditionHUD>(P->GetHUD())){if(H->Buttons.Num()){
 if(P->WasInputKeyJustPressed(EKeys::Tab))FocusedButton=(FocusedButton+1)%H->Buttons.Num();
 if(P->WasInputKeyJustPressed(EKeys::Enter)){int Id=H->Buttons[FMath::Clamp(FocusedButton,0,H->Buttons.Num()-1)].Id;Click(Id);}
 }}
 if(Dialog==8&&P->WasInputKeyJustPressed(EKeys::One))NewGame(false);
 if(Dialog==8&&P->WasInputKeyJustPressed(EKeys::Two))NewGame(true);
 if(Dialog==1){const FKey Keys[]={EKeys::One,EKeys::Two,EKeys::Three,EKeys::Four};for(int I=0;I<4;++I)if(P->WasInputKeyJustPressed(Keys[I])){Answer(I);break;}}
 if(P->WasInputKeyJustPressed(EKeys::E)&&Dialog==0&&NearId>=0)Interact(NearId);
 float MX=0,MY=0;bool Mouse=P->GetMousePosition(MX,MY);
 (void)Mouse;
 float TX=0,TY=0;bool Down=false;P->GetInputTouchState(ETouchIndex::Touch1,TX,TY,Down);
 if(Down&&!TouchWasDown){int SX=0,SY=0;P->GetViewportSize(SX,SY);if(Dialog==0&&TX<SX*.28&&TY>SY*.65){TouchStart=FVector2D(TX,TY);TouchMoving=true;}else if(auto* H=Cast<AExpeditionHUD>(P->GetHUD()))H->ClickAt(FVector2D(TX,TY));}
 if(!Down)TouchMoving=false;TouchWasDown=Down;
 MoveInput=FVector2D(P->IsInputKeyDown(EKeys::D)||P->IsInputKeyDown(EKeys::Right)?1:0,P->IsInputKeyDown(EKeys::W)||P->IsInputKeyDown(EKeys::Up)?1:0);
 if(P->IsInputKeyDown(EKeys::A)||P->IsInputKeyDown(EKeys::Left))MoveInput.X-=1;
 if(P->IsInputKeyDown(EKeys::S)||P->IsInputKeyDown(EKeys::Down))MoveInput.Y-=1;
 if(TouchMoving)MoveInput=FVector2D(TX-TouchStart.X,TouchStart.Y-TY)/65.f;
 StepMovement(Dt);
 FVector Loc=Explorer->GetActorLocation();FVector CameraBase(FMath::Clamp(Loc.X,-650.f,650.f),FMath::Clamp(Loc.Y,-100.f,100.f),80);Camera->SetActorLocation(FMath::VInterpTo(Camera->GetActorLocation(),CameraBase+FVector(0,1350,1750),Dt,5));
 NearId=-1;float Dist=180;NearLabel.Empty();for(const auto& T:Targets){if(T.Id<5&&((State.inventory>>T.Id)&1))continue;float D=FVector::Dist2D(Loc,T.Pos);if(D<Dist){Dist=D;NearId=T.Id;NearLabel=T.Label;}}
 if(RadioLamp)RadioLamp->SetVisibility(State.finale||(State.fuse&&(State.consumers&4)&&Power(State)<=8));
 if(Legs.Num()>=4){float Walk=MoveInput.IsNearlyZero()||Dialog?0:FMath::Sin(Elapsed*12)*25;for(int I=0;I<4;++I)Legs[I]->SetRelativeRotation(FRotator((I%2?1:-1)*Walk,0,0));}
 if(State.finale)for(auto* M:BoatParts){FVector B=M->GetRelativeLocation();B.Y=FMath::Max(-500.f,B.Y-Dt*65);M->SetRelativeLocation(B);}
}
void AExpeditionGameMode::StepMovement(float Dt){
 if(Dialog||!Explorer){CancelInput();return;}FVector2D Input=MoveInput.GetClampedToMaxSize(1);FVector Pos=Explorer->GetActorLocation();FVector Next=Pos+FVector(Input.X,-Input.Y,0)*260*Dt;
 Next.X=FMath::Clamp(Next.X,-1460.f,1440.f);Next.Y=FMath::Clamp(Next.Y,-630.f,600.f);
 if(Next.X>-155&&Next.X<155&&(!State.bridge||FMath::Abs(Next.Y)>100))Next.X=Pos.X;
 if(Next.X>850&&Next.X<1350&&Next.Y>70&&Next.Y<430)Next.Y=Pos.Y;
 if(Next.X>-1330&&Next.X<-950&&Next.Y>290)Next.Y=Pos.Y;
 Explorer->SetActorLocation(Next);if(!Input.IsNearlyZero())Explorer->SetActorRotation(FRotator(0,FMath::RadiansToDegrees(FMath::Atan2(-Input.Y,Input.X))+90,0));
}
void AExpeditionGameMode::Notify(FString M){Toast=M;ToastTimer=5;}
void AExpeditionGameMode::Dispatch(Action A,int V){
 Result R=Act(State,A,V);switch(R){case Result::Applied:Notify(TEXT("Das hat funktioniert. Die Welt verändert sich."));Save();break;case Result::Already:Notify(TEXT("Das ist bereits erledigt."));break;case Result::MissingItem:Notify(TEXT("Dir fehlt ein Teil. Schau in den Rucksack und untersuche die Umgebung."));break;case Result::Wrong:Notify(A==Action::Anchor?TEXT("Der Holzpfosten ist rissig. Suche einen stabilen Anker."):TEXT("Noch nicht passend. Vergleiche Karte und Hinweise genau."));break;case Result::Overload:Notify(TEXT("Überlastung! 8 Einheiten verfügbar. Schalte einen anderen Verbraucher ab."));Save();break;default:Notify(TEXT("Prüfe zuerst die Feldnotizen und die notwendigen Schritte."));break;}RefreshWorld();
}
void AExpeditionGameMode::Interact(int Id){
 if(Id<5){Dispatch(Action::Collect,Id);return;}
 if(Id>=10&&Id<=12){OpenLearning(Id-10);return;}
 if(Id==20){Dialog=2;Feedback.Empty();}
 if(Id==21){Dialog=3;Feedback.Empty();}
 if(Id==22)Dispatch(Action::Anchor,1);
 if(Id==23)Dispatch(Action::Anchor,2);
 if(Id==24)Dispatch(Action::Anchor,3);
 if(Id==25)Dispatch(Action::InstallCrank);
 if(Id==26)Dispatch(Action::Winch);
 if(Id==30)Dispatch(Action::InstallFuse);
 if(Id==31){Dialog=4;Feedback.Empty();}
 if(Id==32)Dispatch(Action::Signal);
 CancelInput();
}
void AExpeditionGameMode::Click(int Id){
 if(Id==900){Dialog=0;CancelInput();return;}
 if(Id==901){Dialog=5;CancelInput();return;}if(Id==902){Dialog=6;CancelInput();return;}
 if(Id==903){Dialog=7;CancelInput();return;}if(Id==904){Dialog=0;Interact(NearId);return;}
 if(Id==905){if(Load()){Dialog=0;RefreshWorld();Notify(TEXT("Lokaler Spielstand fortgesetzt."));}else Notify(TEXT("Kein passender Spielstand vorhanden."));return;}
 if(Id==906){Dialog=8;return;}if(Id==910){NewGame(false);return;}if(Id==911){NewGame(true);return;}
 if(Id>=100&&Id<104){Answer(Id-100);return;}
 if(Id==200)Dispatch(Action::RotateMap,0);if(Id==201)Dispatch(Action::RotateMap,1);
 if(Id==202)Dispatch(Action::JoinMap);if(Id>=210&&Id<=212)Dispatch(Action::ChoosePath,Id-210);
 if(Id==330)Dispatch(Action::InstallCrank);if(Id==331)Dispatch(Action::Winch);
 if(Id>=400&&Id<403)Dispatch(Action::Consumer,Id-400);
 if(Id==420)Dispatch(Action::Signal);
 if(Id==500)Notify(TEXT("Karten: zwei Hälften am Camp. Seil + Kurbel: Ufer. Sicherung: Station."));
}
void AExpeditionGameMode::OpenLearning(int Z){
 if(Z==1&&State.path!=2){Notify(TEXT("Entschlüssle zuerst die Wegekarte im Camp."));return;}
 if(Z==2&&!State.bridge){Notify(TEXT("Die Station liegt hinter der Brücke."));return;}
 const int Starts[]={0,2,5};const int Ends[]={2,5,8};Zone=Z;Slot=-1;
 for(int I=Starts[Z];I<Ends[Z];++I)if(!(State.slots&(1<<I))){Slot=I;break;}
 if(Slot<0){Notify(Z==0?TEXT("Karte: Wasser links, Mast rechts. Der Weg folgt dem Schilf."):Z==1?TEXT("Brücke: Steinanker → beweglicher Brückenring. Kurbel einsetzen und Winde drehen."):TEXT("Strom: Generator 8. Pumpe 4, Licht 2, Funk 6. Die Brücke rastet mechanisch ein."));return;}
 Dialog=1;Attempts=Failures[Slot];TransferAttempts=0;Transfer=TransferRequired[Slot];Feedback.Empty();CancelInput();
}
FExpQuestion AExpeditionGameMode::QuestionFor(int I,bool T)const{
 if(WordTopic){
 const TCHAR* P[]={TEXT("Welche Wortart hat „Expedition“?"),TEXT("Welches Wort ist ein Verb?"),TEXT("Welche Wortart hat „stabil“?"),TEXT("Welches Wort ist ein Nomen?"),TEXT("Welche Wortart hat „untersuchen“?"),TEXT("Welches Wort beschreibt eine Eigenschaft?"),TEXT("Welche Wortart hat „Brücke“?"),TEXT("Welches Wort ist ein Verb?")};
 const TCHAR* PT[]={TEXT("Welche Wortart hat „Landkarte“?"),TEXT("Welches Wort ist ein Verb?"),TEXT("Welche Wortart hat „leise“?"),TEXT("Welches Wort ist ein Nomen?"),TEXT("Welche Wortart hat „reparieren“?"),TEXT("Welches Wort beschreibt eine Eigenschaft?"),TEXT("Welche Wortart hat „Sicherung“?"),TEXT("Welches Wort ist ein Verb?")};
 TArray<TArray<FString>> O={{TEXT("Nomen"),TEXT("Verb"),TEXT("Adjektiv"),TEXT("Artikel")},{TEXT("Wald"),T?TEXT("schwimmen"):TEXT("erkunden"),TEXT("grün"),TEXT("die")},{TEXT("Nomen"),TEXT("Verb"),TEXT("Adjektiv"),TEXT("Artikel")},{TEXT("laufen"),TEXT("blau"),TEXT("ein"),T?TEXT("Boot"):TEXT("Seil")},{TEXT("Artikel"),TEXT("Verb"),TEXT("Nomen"),TEXT("Adjektiv")},{TEXT("Brücke"),TEXT("den"),T?TEXT("ruhig"):TEXT("fest"),TEXT("bauen")},{TEXT("Nomen"),TEXT("Adjektiv"),TEXT("Verb"),TEXT("Artikel")},{T?TEXT("senden"):TEXT("leuchten"),TEXT("Licht"),TEXT("hell"),TEXT("das")}};
 const int C[]={0,1,2,3,1,2,0,0};return {T?PT[I]:P[I],O[I],C[I],TEXT("Nomen benennen Dinge. Verben beschreiben, was geschieht. Adjektive beschreiben Eigenschaften.")};
 }
 const int Percent[]={25,20,50,10,75,40,30,60};const int Base[]={80,150,70,240,40,90,120,50};int B=T?Base[I]+20:Base[I];int V=Percent[I]*B/100;
 const int Correct[]={1,2,0,3,1,0,2,3};TArray<FString> O;for(int N=0;N<4;++N)O.Add(FString::FromInt(V+(N-Correct[I])*5));
 return {FString::Printf(TEXT("Wie viel sind %d %% von %d?"),Percent[I],B),O,Correct[I],FString::Printf(TEXT("1 %% entspricht %s. Multipliziere diesen Wert mit %d. Beispiel: 25 %% von 100 sind 25."),*FString::SanitizeFloat(B/100.f),Percent[I])};
}
FExpQuestion AExpeditionGameMode::Question()const{return QuestionFor(FMath::Clamp(Slot,0,7),Transfer);}
void AExpeditionGameMode::Answer(int O){
 if(Dialog!=1||Slot<0)return;auto Q=Question();if(O!=Q.Correct){
 if(Transfer){++TransferAttempts;Feedback=Q.Hint;return;}
 ++Attempts;Failures[Slot]=Attempts;Feedback=Q.Hint;if(Attempts>=2){Transfer=true;TransferRequired[Slot]=true;Feedback=TEXT("Ein Beispiel hilft. Jetzt wende den Weg auf eine neue Aufgabe an. ")+Question().Hint;}Save();return;
 }
 if(!Transfer&&Attempts>0){Transfer=true;TransferRequired[Slot]=true;Feedback=TEXT("Richtig. Zeige den Weg jetzt an einem neuen Beispiel.");Save();return;}
 Learn(State,Slot,"demo-1",std::to_string(Slot));Save();Dialog=0;Notify(TEXT("Feldnotiz ergänzt. Nutze sie jetzt in der Welt."));OpenLearning(Zone);RefreshWorld();
}
void AExpeditionGameMode::NewGame(bool W){State=Expedition::State();WordTopic=W;LearnTime=0;WorldTime=0;for(int I=0;I<8;++I){Failures[I]=0;TransferRequired[I]=false;}Explorer->SetActorLocation(FVector(-1050,-350,80));Dialog=0;CancelInput();RefreshWorld();Save();Notify(TEXT("Finde die Feldnotizen und beide Kartenhälften. E untersucht ein Objekt."));}
void AExpeditionGameMode::Save(){
 auto* S=Cast<UExpeditionSave>(UGameplayStatics::CreateSaveGameObject(UExpeditionSave::StaticClass()));TSharedRef<FJsonObject> J=MakeShared<FJsonObject>();
 J->SetStringField(TEXT("revision"),TEXT("demo-1"));J->SetNumberField(TEXT("schema"),2);J->SetNumberField(TEXT("slots"),State.slots);J->SetNumberField(TEXT("inventory"),State.inventory);J->SetNumberField(TEXT("r0"),State.rotation[0]);J->SetNumberField(TEXT("r1"),State.rotation[1]);J->SetNumberField(TEXT("path"),State.path);J->SetNumberField(TEXT("consumers"),State.consumers);
 TArray<TSharedPtr<FJsonValue>> Fail,Phases;for(int I=0;I<8;++I){Fail.Add(MakeShared<FJsonValueNumber>(Failures[I]));Phases.Add(MakeShared<FJsonValueBoolean>(TransferRequired[I]));}J->SetArrayField(TEXT("failures"),Fail);J->SetArrayField(TEXT("transfers"),Phases);
 J->SetBoolField(TEXT("map"),State.mapJoined);J->SetBoolField(TEXT("anchor"),State.anchor);J->SetBoolField(TEXT("end"),State.ropeEnd);J->SetBoolField(TEXT("crank"),State.crank);J->SetBoolField(TEXT("bridge"),State.bridge);J->SetBoolField(TEXT("fuse"),State.fuse);J->SetBoolField(TEXT("finale"),State.finale);J->SetBoolField(TEXT("word"),WordTopic);J->SetNumberField(TEXT("learnTime"),LearnTime);J->SetNumberField(TEXT("worldTime"),WorldTime);
 FVector P=Explorer->GetActorLocation();J->SetNumberField(TEXT("x"),P.X);J->SetNumberField(TEXT("y"),P.Y);FJsonSerializer::Serialize(J,TJsonWriterFactory<>::Create(&S->Snapshot));if(!UGameplayStatics::SaveGameToSlot(S,SaveSlot,0))Notify(TEXT("Spielstand konnte nicht gespeichert werden."));
}
bool AExpeditionGameMode::Load(){
 auto* S=Cast<UExpeditionSave>(UGameplayStatics::LoadGameFromSlot(SaveSlot,0));if(!S)return false;TSharedPtr<FJsonObject> J;if(!FJsonSerializer::Deserialize(TJsonReaderFactory<>::Create(S->Snapshot),J)||!J.IsValid())return false;
 FString Rev;double Schema;if(!J->TryGetStringField(TEXT("revision"),Rev)||Rev!=TEXT("demo-1")||!J->TryGetNumberField(TEXT("schema"),Schema)||Schema!=2)return false;
 Expedition::State New;const TCHAR* Numbers[]={TEXT("slots"),TEXT("inventory"),TEXT("r0"),TEXT("r1"),TEXT("path"),TEXT("consumers")};int* Dest[]={&New.slots,&New.inventory,&New.rotation[0],&New.rotation[1],&New.path,&New.consumers};
 for(int I=0;I<6;++I){double N;if(!J->TryGetNumberField(Numbers[I],N)||!FMath::IsFinite(N)||N!=FMath::TruncToDouble(N)||N<-1||N>255)return false;*Dest[I]=(int)N;}
 const TCHAR* Names[]={TEXT("map"),TEXT("anchor"),TEXT("end"),TEXT("crank"),TEXT("bridge"),TEXT("fuse"),TEXT("finale")};bool* B[]={&New.mapJoined,&New.anchor,&New.ropeEnd,&New.crank,&New.bridge,&New.fuse,&New.finale};for(int I=0;I<7;++I)if(!J->TryGetBoolField(Names[I],*B[I]))return false;
 double X,Y,L,W;bool Topic;if(!Valid(New)||!J->TryGetNumberField(TEXT("x"),X)||!J->TryGetNumberField(TEXT("y"),Y)||!J->TryGetNumberField(TEXT("learnTime"),L)||!J->TryGetNumberField(TEXT("worldTime"),W)||!J->TryGetBoolField(TEXT("word"),Topic)||!FMath::IsFinite(X)||!FMath::IsFinite(Y)||!FMath::IsFinite(L)||!FMath::IsFinite(W)||L<0||W<0)return false;
 const TArray<TSharedPtr<FJsonValue>> *FA,*TR;if(!J->TryGetArrayField(TEXT("failures"),FA)||!J->TryGetArrayField(TEXT("transfers"),TR)||FA->Num()!=8||TR->Num()!=8||(!New.bridge&&X>-155))return false;
 int RestoredF[8];bool RestoredT[8];for(int I=0;I<8;++I){double V;if(!(*FA)[I]->TryGetNumber(V)||V<0||V>100000||V!=FMath::TruncToDouble(V)||!(*TR)[I]->TryGetBool(RestoredT[I]))return false;RestoredF[I]=V;}
 State=New;WordTopic=Topic;LearnTime=L;WorldTime=W;for(int I=0;I<8;++I){Failures[I]=RestoredF[I];TransferRequired[I]=RestoredT[I];}Explorer->SetActorLocation(FVector(FMath::Clamp(X,-1460.,1440.),FMath::Clamp(Y,-630.,600.),80));CancelInput();return true;
}

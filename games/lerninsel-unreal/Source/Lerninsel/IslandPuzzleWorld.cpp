#include "IslandWorld.h"
#include "IslandFocusWidget.h"
#include "Camera/CameraComponent.h"
#include "Components/TextRenderComponent.h"
#include "Components/StaticMeshComponent.h"
#include "Kismet/GameplayStatics.h"
namespace {const TCHAR* Parts[]={TEXT("heute"),TEXT("öffnet"),TEXT("der Fuchs"),TEXT("den Eingang")};}
bool AIslandGameMode::CanInspect(int Id)const{
 if(Id==401&&State.carrying)return false;if(Id==404&&!State.carrying)return false;
 if(Id>=200&&Id<=208)return State.intro;
 if(Id==513)return State.verbs&&!State.sentence;
 if(Id>=500&&Id<=512)return State.verbs;
 if(Id>=400&&Id<=404)return State.sentence;
 if(Id>=600&&Id<=604)return State.sentence&&State.water;
 if(Id>=700&&Id<=711)return false;
 if(Id==712)return State.fractions&&!State.coast;
 if(Id==713)return State.fractions&&!State.coast;
 if(Id==800)return State.coast;
 if(Id==820)return State.verbs;if(Id==821)return State.fractions;
 return Target(Id)!=nullptr;
}
FString AIslandGameMode::SentenceText()const{FString Text;for(int I=0;I<State.sentenceCount;++I){int Id=State.sentenceParts[I];if(Id>=0&&Id<4)Text+=(Text.IsEmpty()?TEXT(""):TEXT(" "))+FString(Parts[Id]);}if(Text.IsEmpty())return TEXT("Vier Plätze warten auf deinen Satz.");Text[0]=FChar::ToUpper(Text[0]);return Text+(State.sentenceCount==4?TEXT("."):TEXT(" …"));}
void AIslandGameMode::PuzzleInteract(int Id){if(!CanInspect(Id)){Notify(TEXT("Löse zuerst den vorherigen Raum. Der Weg und die Torleitung zeigen die Reihenfolge."));return;}
 if(Id>=500&&Id<=503){Focus=Id;}
 else if(Id==510){if(!State.sentenceActive&&!State.sentence)Apply(Island::Action::SentenceStart);Focus=510;}
 else if(Id==511)Apply(Island::Action::SentenceUndo);else if(Id==512)Apply(Island::Action::SentenceCheck);
 else if(Id==513){Focus=513;}
 else if(Id==600){Focus=600;}
 else if(Id>=601&&Id<=603){int Delta=Id==601?1:Id==602?2:-1;if(!State.carrying){Notify(TEXT("Hol denselben Messbecher zurück. Er steht noch bei der ersten Wasseraufgabe hinter dir."));return;}if(State.tenths+Delta>10){Notify(TEXT("Diese Portion passt nicht mehr hinein. Nimm den 100-ml-Hahn oder lasse 100 ml ab."));return;}if(State.tenths+Delta<0){Notify(TEXT("Der Messbecher ist leer. Es gibt nichts abzulassen."));return;}PendingStroke=Delta;StrokeTarget=Id;CupStroke=true;StrokeTime=.6f;Notify(Delta<0?TEXT("100 ml laufen aus dem Becher …"):Delta==2?TEXT("200 ml = 1/5 Liter fließen ein …"):TEXT("100 ml = 1/10 Liter fließen ein …"));}
 else if(Id==604){if(!State.carrying){Notify(TEXT("Nimm den Messbecher von der 3/10-Platte wieder auf und bringe ihn hierher."));return;}Apply(Island::Action::CupPour);}
 else if(Id==712)ConfirmCoast();else if(Id==713)Notify(TEXT("Alles eine Frage der Perspektive. Stelle dich auf die runde Markierung und suche den geschlossenen Ring."));else if(Id==800||Id==820||Id==821)Focus=Id;
 if(Focus>=0)if(auto* C=Cast<AIslandController>(UGameplayStatics::GetPlayerController(this,0))){C->CancelInput();C->UpdateMode();}
}
void AIslandGameMode::ShowHint(int Requested){int Id=Requested;if(Id==0)Id=Focus==820?820:Focus==821?821:Island::CurrentTaskId(State);const Island::TaskDefinition* Definition=nullptr;for(const auto& Task:Island::TaskDefinitions())if(Task.Id==Id){Definition=&Task;break;}if(!Definition){Notify(TEXT("Im Moment ist keine weitere Aufgabe offen."));return;}int& Step=HintSteps.FindOrAdd(Id);Step=FMath::Clamp(Step+1,1,3);Notify(FString(UTF8_TO_TCHAR(Definition->Hints[Step-1])));}
void AIslandGameMode::UIAction(int Code){auto* C=Cast<AIslandController>(UGameplayStatics::GetPlayerController(this,0));
 if(Code==9005&&Paused){ReplayFox();return;}
 if(Code==9000&&Paused){Paused=false;if(C){C->CancelInput();C->UpdateMode();}return;}
 if(Paused&&Code>=9002&&Code<=9004&&C){C->SetMouseSensitivity(Code==9004?1.f:C->MouseSensitivity+(Code==9002?-.25f:.25f));if(C->FocusWidget)C->FocusWidget->Refresh();return;}
 if(Code==9001&&Paused){if(auto* P=Player())P->Camera->SetFieldOfView(P->Camera->FieldOfView<80?85:75);return;}
 if(Code==4000){Focus=-1;if(C){C->CancelInput();C->UpdateMode();}return;}
 if(Paused||Focus<0)return;
 if(Code==4001&&Focus>=100&&Focus<=208){SelectFocused();return;}
 const bool SentenceFocus=Focus==510||(Focus>=500&&Focus<=503);
 if(SentenceFocus){if(Code>=5000&&Code<=5003){if(!State.sentenceActive&&!State.sentence)Apply(Island::Action::SentenceStart);Apply(Island::Action::SentencePick,Code-5000);if(Focus!=510){Focus=-1;if(C)C->UpdateMode();}}else if(Code==5010)Apply(Island::Action::SentenceStart);else if(Code==5011)Apply(Island::Action::SentenceUndo);else if(Code==5012)Apply(Island::Action::SentenceCheck);return;}
 if(Focus==600){if(Code==6100&&!State.carrying&&Bucket&&Player()){FVector Direction=Bucket->GetActorLocation()+FVector(0,0,40)-Player()->Camera->GetComponentLocation();if(C){C->SetControlRotation(Direction.Rotation());Focus=-1;C->CancelInput();C->UpdateMode();}Notify(TEXT("Blick zum Messbecher: Gehe zurück zur ersten Wasseraufgabe und nimm ihn mit E auf."));}return;}
 if(Focus==800&&Code==8000){Apply(Island::Action::FinaleCheck);return;}
 if(Focus==820&&Code>=8200&&Code<=8203)Apply(Island::Action::BonusAnswer,Code-8200);
 if(Focus==821&&Code>=8210&&Code<=8213)Apply(Island::Action::BonusAnswer,10+Code-8210);
}
bool AIslandGameMode::PreviewAligned()const{auto* P=Player();if(!P||!State.fractions||State.coast)return false;FRotator View=P->GetControlRotation();if(!Island::ViewAligned(FVector::Dist(P->GetActorLocation(),ObservationStand),FMath::FindDeltaAngleDegrees(View.Yaw,ObservationView.Yaw),FMath::FindDeltaAngleDegrees(View.Pitch,ObservationView.Pitch)))return false;
 // Actual endpoints derive from the same projection as the three authored arcs.
 const FVector ExpectedEye=ObservationStand+FVector(0,0,72),Eye=P->Camera->GetComponentLocation();const FVector Forward=ObservationView.Vector(),Right=FRotationMatrix(ObservationView).GetUnitAxis(EAxis::Y),Up=FRotationMatrix(ObservationView).GetUnitAxis(EAxis::Z);
 for(int I=0;I<3;++I){float Angle=FMath::DegreesToRadians(30.f+I*120);FVector Direction=Forward+(Right*FMath::Cos(Angle)+Up*FMath::Sin(Angle))*.12f;float D1=700+I*1000,D2=700+((I+1)%3)*1000;FVector A=(ExpectedEye+Direction*D1-Eye).GetSafeNormal(),B=(ExpectedEye+Direction*D2-Eye).GetSafeNormal();if(FVector::DotProduct(A,B)<FMath::Cos(FMath::DegreesToRadians(1.5f)))return false;}
 return true;
}
void AIslandGameMode::ConfirmCoast(){Apply(Island::Action::CoastConfirm,PreviewAligned()?1:0);}
void AIslandGameMode::RefreshPuzzleWorld(float Dt){for(int I=0;I<SentenceSlots.Num();++I){FString Label=I<State.sentenceCount?FString(Parts[State.sentenceParts[I]]):FString::Printf(TEXT("%d"),I+1);if(I==0&&!Label.IsEmpty())Label[0]=FChar::ToUpper(Label[0]);SentenceSlots[I]->SetText(FText::FromString(Label));}
 float TargetHeight=State.fractions?10.f:0.f;BasinHeight=FMath::FInterpConstantTo(BasinHeight,TargetHeight,Dt,5.f);if(BasinWater){BasinWater->SetVisibility(BasinHeight>0);BasinWater->SetRelativeScale3D(FVector(.1,.1,FMath::Max(.001f,BasinHeight/100)));BasinWater->SetRelativeLocation(FVector(0,0,2+BasinHeight*.5f));}}

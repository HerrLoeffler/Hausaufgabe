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
 if(Id>=500&&Id<=512)return State.verbs;
 if(Id>=400&&Id<=404)return State.sentence;
 if(Id==600)return State.sentence&&State.water;
 if(Id>=700&&Id<=710)return State.fractions;
 if(Id==711)return State.fractions&&!State.coastReady;
 if(Id==712)return State.coastReady;
 if(Id==800)return State.coast;
 if(Id==820)return State.verbs;if(Id==821)return State.fractions;
 return Target(Id)!=nullptr;
}
FString AIslandGameMode::SentenceText()const{FString Text;for(int I=0;I<State.sentenceCount;++I){int Id=State.sentenceParts[I];if(Id>=0&&Id<4)Text+=(Text.IsEmpty()?TEXT(""):TEXT(" "))+FString(Parts[Id]);}if(Text.IsEmpty())return TEXT("Vier Plätze warten auf deinen Satz.");Text[0]=FChar::ToUpper(Text[0]);return Text+(State.sentenceCount==4?TEXT("."):TEXT(" …"));}
void AIslandGameMode::PuzzleInteract(int Id){if(!CanInspect(Id)){Notify(TEXT("Löse zuerst den vorherigen Raum. Der Weg und die Torleitung zeigen die Reihenfolge."));return;}
 if(Id>=500&&Id<=503){if(!State.sentenceActive&&!State.sentence)Apply(Island::Action::SentenceStart);Focus=Id;}
 else if(Id==510){if(!State.sentenceActive&&!State.sentence)Apply(Island::Action::SentenceStart);Focus=510;}
 else if(Id==511)Apply(Island::Action::SentenceUndo);else if(Id==512)Apply(Island::Action::SentenceCheck);
 else if(Id==600){Focus=600;}
 else if(Id>=700&&Id<=703){Apply(Island::Action::Find,Id-700);Focus=Id;}
 else if(Id==710)Focus=710;
 else if(Id==711){if(auto* P=Player())if(P->Controller)P->Controller->SetControlRotation(ObservationView);Notify(TEXT("Die drei Formen liegen hinter dem Meerblick. Prüfe die Menge am Fundbuch und suche den markierten Standplatz."));}
 else if(Id==712)ConfirmCoast();else if(Id==800||Id==820||Id==821)Focus=Id;
 if(Focus>=0)if(auto* C=Cast<AIslandController>(UGameplayStatics::GetPlayerController(this,0))){C->CancelInput();C->UpdateMode();}
}
void AIslandGameMode::UIAction(int Code){auto* C=Cast<AIslandController>(UGameplayStatics::GetPlayerController(this,0));
 if(Code==9000&&Paused){Paused=false;if(C){C->CancelInput();C->UpdateMode();}return;}
 if(Code==9001&&Paused){if(auto* P=Player())P->Camera->SetFieldOfView(P->Camera->FieldOfView<80?85:75);return;}
 if(Code==4000){Focus=-1;if(C){C->CancelInput();C->UpdateMode();}return;}
 if(Paused||Focus<0)return;
 if(Code==4001&&Focus>=100&&Focus<=208){SelectFocused();return;}
 const bool SentenceFocus=Focus==510||(Focus>=500&&Focus<=503);
 if(SentenceFocus){if(Code>=5000&&Code<=5003){Apply(Island::Action::SentencePick,Code-5000);if(Focus!=510){Focus=-1;if(C)C->UpdateMode();}}else if(Code==5010)Apply(Island::Action::SentenceStart);else if(Code==5011)Apply(Island::Action::SentenceUndo);else if(Code==5012)Apply(Island::Action::SentenceCheck);return;}
 if(Focus==600){if(Code==6000)Apply(Island::Action::RouteStart);else if(Code>=6010&&Code<=6020){if(Code==6010&&!State.routeActive&&!State.fractions)Apply(Island::Action::RouteStart);else Apply(Island::Action::RouteNode,Code-6010);}else if(Code==6030)Apply(Island::Action::RouteUndo);else if(Code==6031)Apply(Island::Action::RouteCheck);return;}
 if(Focus==710){if(Code>=7000&&Code<=7003)Apply(Island::Action::CoastToggle,Code-7000);else if(Code==7010)Apply(Island::Action::CoastCheck);else if(Code==7011)Notify(TEXT("Vier Reliefs stehen am unteren Küstenweg. Danach führt die breite Treppe zur Steinbank mit dem runden Standzeichen. Von dort passen die Teile vor dem Meer zusammen."));else if(Code==7012)ConfirmCoast();return;}
 if(Focus==800&&Code==8000){Apply(Island::Action::FinaleCheck);return;}
 if(Focus==820&&Code>=8200&&Code<=8203)Apply(Island::Action::BonusAnswer,Code-8200);
 if(Focus==821&&Code>=8210&&Code<=8213)Apply(Island::Action::BonusAnswer,10+Code-8210);
}
bool AIslandGameMode::PreviewAligned()const{auto* P=Player();if(!P||!State.coastReady)return false;FRotator View=P->GetControlRotation();if(!Island::ViewAligned(FVector::Dist(P->GetActorLocation(),ObservationStand),FMath::FindDeltaAngleDegrees(View.Yaw,ObservationView.Yaw),FMath::FindDeltaAngleDegrees(View.Pitch,ObservationView.Pitch)))return false;
 // Actual endpoints derive from the same projection as the three authored arcs.
 const FVector ExpectedEye=ObservationStand+FVector(0,0,72),Eye=P->Camera->GetComponentLocation();const FVector Forward=ObservationView.Vector(),Right=FRotationMatrix(ObservationView).GetUnitAxis(EAxis::Y),Up=FRotationMatrix(ObservationView).GetUnitAxis(EAxis::Z);
 for(int I=0;I<3;++I){float Angle=FMath::DegreesToRadians(30.f+I*120);FVector Direction=Forward+(Right*FMath::Cos(Angle)+Up*FMath::Sin(Angle))*.12f;float D1=700+I*1000,D2=700+((I+1)%3)*1000;FVector A=(ExpectedEye+Direction*D1-Eye).GetSafeNormal(),B=(ExpectedEye+Direction*D2-Eye).GetSafeNormal();if(FVector::DotProduct(A,B)<FMath::Cos(FMath::DegreesToRadians(1.5f)))return false;}
 return true;
}
void AIslandGameMode::ConfirmCoast(){Apply(Island::Action::CoastConfirm,PreviewAligned()?1:0);}
void AIslandGameMode::RefreshPuzzleWorld(float Dt){for(int I=0;I<SentenceSlots.Num();++I)SentenceSlots[I]->SetText(FText::FromString(I<State.sentenceCount?FString(Parts[State.sentenceParts[I]]):FString::Printf(TEXT("%d"),I+1)));
 const int Sum=Island::RouteTenths(State.route,State.routeCount);float TargetHeight=State.fractions?10.f:Sum>=0?float(Sum):0.f;BasinHeight=FMath::FInterpConstantTo(BasinHeight,TargetHeight,Dt,5.f);if(BasinWater){BasinWater->SetVisibility(BasinHeight>0);BasinWater->SetRelativeScale3D(FVector(.1,.1,FMath::Max(.001f,BasinHeight/100)));BasinWater->SetRelativeLocation(FVector(0,0,2+BasinHeight*.5f));}}

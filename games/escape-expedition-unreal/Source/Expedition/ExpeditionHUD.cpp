#include "ExpeditionWorld.h"
#include "Engine/Canvas.h"
#include "Engine/Engine.h"
#include "CanvasItem.h"
#include "Kismet/GameplayStatics.h"
#include "GameFramework/PlayerController.h"
namespace {FLinearColor Ink(.12,.19,.19,1),Paper(.96,.94,.86,1),Muted(.45,.51,.48,1),Teal(.12,.36,.33,1),Gold(.85,.62,.29,1);}
void AExpeditionHUD::Panel(float X,float Y,float W,float H,FLinearColor Col){FCanvasTileItem T(FVector2D(X*UIScale,Y*UIScale),FVector2D(W*UIScale,H*UIScale),Col);T.BlendMode=SE_BLEND_Translucent;Canvas->DrawItem(T);}
void AExpeditionHUD::Text(FString S,float X,float Y,float Size,FLinearColor Col){FCanvasTextItem T(FVector2D(X*UIScale,Y*UIScale),FText::FromString(S),GEngine->GetMediumFont(),Col);T.Scale=FVector2D(Size/18*UIScale);T.bCentreX=false;Canvas->DrawItem(T);}
void AExpeditionHUD::Wrap(FString S,float X,float Y,float W,float Size,FLinearColor Col){TArray<FString> Words;S.ParseIntoArray(Words,TEXT(" "));FString Line;float Max=W/(Size*.55f);for(const auto& Word:Words){if(Line.Len()+Word.Len()+1>Max){Text(Line,X,Y,Size,Col);Y+=Size*1.5;Line.Empty();}Line+=Word+TEXT(" ");}if(!Line.IsEmpty())Text(Line,X,Y,Size,Col);}
void AExpeditionHUD::Button(FString S,float X,float Y,float W,float H,int Id){auto* G=Cast<AExpeditionGameMode>(GetWorld()->GetAuthGameMode());bool Focus=G&&G->Dialog&&G->FocusedButton==Buttons.Num();if(Focus)Panel(X-3,Y-3,W+6,H+6,Gold);Panel(X,Y,W,H,Teal);Text(S,X+16,Y+H*.25,19,Paper);Buttons.Add({FBox2D(FVector2D(X,Y)*UIScale,FVector2D(X+W,Y+H)*UIScale),Id});}
bool AExpeditionHUD::ClickAt(FVector2D P){for(int I=Buttons.Num()-1;I>=0;--I)if(Buttons[I].Rect.IsInside(P)){auto* G=Cast<AExpeditionGameMode>(GetWorld()->GetAuthGameMode());if(G)G->Click(Buttons[I].Id);return true;}return false;}
void AExpeditionHUD::DrawHUD(){
 Super::DrawHUD();auto* G=Cast<AExpeditionGameMode>(GetWorld()->GetAuthGameMode());if(!G||!Canvas)return;Buttons.Empty();DrawSize=FVector2D(Canvas->SizeX,Canvas->SizeY);UIScale=FMath::Min(Canvas->SizeX/1280.f,Canvas->SizeY/800.f);float W=Canvas->SizeX/UIScale,H=Canvas->SizeY/UIScale;
 Panel(24,22,W-48,88,FLinearColor(.96,.94,.86,.96));Text(TEXT("EXPEDITION AMAZONAS"),45,34,16,Muted);Text(G->Mission(),45,61,23,Ink);Text(FString::Printf(TEXT("Lernnotizen %d / 8"),G->Solved()),W-230,41,18,Teal);Text(TEXT("Lokale Beispieldaten"),W-230,69,14,Muted);
 if(!G->Dialog){
 Button(TEXT("Rucksack · I"),24,H-78,170,52,901);Button(TEXT("Fragenvorschau"),208,H-78,200,52,902);Button(TEXT("Menü · Esc"),W-184,H-78,160,52,903);
 Text(TEXT("WASD / Pfeile · E untersuchen · linke Touchfläche bewegt"),24,H-107,14,Paper);
 if(G->NearId>=0){Button(TEXT("E · ")+G->NearLabel,W*.5-185,H-145,370,54,904);}
 auto* P=UGameplayStatics::GetPlayerController(this,0);if(P&&G->Explorer)for(const auto& T:G->Targets){if(T.Id<5&&((G->State.inventory>>T.Id)&1))continue;if(FVector::Dist2D(T.Pos,G->Explorer->GetActorLocation())>640)continue;FVector2D Screen;if(P->ProjectWorldLocationToScreen(T.Pos+FVector(0,0,65),Screen)){float X=Screen.X/UIScale,Y=Screen.Y/UIScale;if(Y>120&&Y<H-160){Panel(X-8,Y-5,T.Label.Len()*7.5+18,26,FLinearColor(.96,.94,.86,.9));Text(T.Label,X,Y,14,Ink);}}}
 }
 if(G->ToastTimer>0){Panel(W*.5-360,H-215,720,48,FLinearColor(.98,.91,.73,.96));Wrap(G->Toast,W*.5-343,H-204,680,16,Ink);}
 if(!G->Dialog)return;
 Panel(0,0,W,H,FLinearColor(.04,.12,.12,.55));float X=W*.5-420,Y=H*.5-290;Panel(X,Y,840,580,Paper);Panel(X,Y,840,8,Gold);
 if(G->Dialog!=8)Button(TEXT("Schließen"),X+672,Y+17,145,48,900);
 Text(TEXT("Tab: Auswahl · Enter: bestätigen · Esc: schließen"),X+28,Y+552,14,Muted);
 const TCHAR* Titles[]={TEXT(""),TEXT("Feldnotiz entschlüsseln"),TEXT("Die beschädigte Wegekarte"),TEXT("Die Brücke sichern"),TEXT("Strom für das letzte Signal"),TEXT("Dein Rucksack"),TEXT("Lehrkraft · Fragenvorschau"),TEXT("Expedition pausiert"),TEXT("Das letzte Signal")};Text(Titles[G->Dialog],X+28,Y+28,27,Ink);
 if(G->Dialog==8){
 Text(TEXT("EXPEDITION AMAZONAS · LOKALE TESTFASSUNG"),X+28,Y+88,16,Teal);
 Wrap(TEXT("Das Hochwasser hat die Forschungsstation abgeschnitten. Finde einen sicheren Weg, repariere die Brücke und bring die Funkverbindung zurück."),X+28,Y+134,740,24,Ink);
 Wrap(TEXT("Ziel: ungefähr zehn Minuten. Acht Lernaufgaben, drei Umgebungsrätsel. Hilfen dürfen länger dauern. Diese Testfassung verwendet lokale Beispieldaten; die echte GradeCrew-Anbindung folgt separat."),X+28,Y+270,735,18,Muted);
 Button(TEXT("Start · Prozent"),X+28,Y+395,360,58,910);Button(TEXT("Start · Wortarten"),X+414,Y+395,395,58,911);
 Button(TEXT("Spielstand fortsetzen"),X+28,Y+475,360,58,905);Button(TEXT("Alle Fragen ansehen"),X+414,Y+475,395,58,902);
 }
 if(G->Dialog==1){
 Text(FString::Printf(TEXT("%s · Notiz %d / 8"),G->Transfer?TEXT("Neue Anwendung"):TEXT("Lerncheck"),G->Slot+1),X+28,Y+100,17,Teal);
 auto Q=G->Question();Wrap(Q.Prompt,X+28,Y+145,735,27,Ink);
 for(int I=0;I<Q.Options.Num();++I)Button(Q.Options[I],X+28+(I%2)*397,Y+240+(I/2)*74,375,60,100+I);
 Wrap(G->Feedback.IsEmpty()?TEXT("Löse die Aufgabe. Danach ergänzt sich deine Feldnotiz. Die eigentliche Rätselhandlung bleibt bei dir."):G->Feedback,X+28,Y+413,760,18,Muted);
 }
 if(G->Dialog==2){
 Wrap(TEXT("Drehe die Kartenhälften so, dass der Wasserlauf durchgeht. Blatt → Schilf → Funkmast. Welcher Weg in der Welt passt dazu?"),X+28,Y+96,750,20,Ink);
 for(int I=0;I<2;++I){float BX=X+100+I*340,BY=Y+235;Panel(BX,BY,240,130,FLinearColor(.88,.81,.62,1));
 if(G->State.rotation[I]%2==0)Panel(BX+104,BY+5,32,120,FLinearColor(.3,.65,.67,1));else Panel(BX+5,BY+45,230,32,FLinearColor(.3,.65,.67,1));
 const FVector2D Corners[]={FVector2D(12,12),FVector2D(156,12),FVector2D(156,97),FVector2D(12,97)};
 FVector2D Mark=Corners[G->State.rotation[I]];Text(I?TEXT("Mast"):TEXT("Blatt"),BX+Mark.X,BY+Mark.Y,16,Teal);
 Text(FString::Printf(TEXT("%s · %d°"),I?TEXT("Rechts"):TEXT("Links"),G->State.rotation[I]*90),BX,BY-35,20,Ink);
 Button(TEXT("Drehen"),BX,BY+142,240,50,200+I);}
 Button(TEXT("Karte verbinden"),X+28,Y+447,250,54,202);
 Button(TEXT("Baumweg"),X+296,Y+447,155,54,210);Button(TEXT("Felsweg"),X+469,Y+447,155,54,211);Button(TEXT("Schilfweg"),X+642,Y+447,167,54,212);
 Text(G->State.mapJoined?TEXT("Karte verbunden: Folge dem Schilf zum Mast."):TEXT("Hinweis: Blatt oben links; Mast oben rechts. Vergleiche die Landmarken."),X+28,Y+525,17,Teal);
 }
 if(G->Dialog==3){
 Wrap(TEXT("Wartungsbild: Das Seil hält zwischen dem massiven Steinanker und dem Metallring am beweglichen Brückenteil. Der rissige Holzpfosten trägt keine Last. Die Brücke besitzt eine mechanische Rast."),X+28,Y+103,755,22,Ink);
 Text(FString::Printf(TEXT("Steinanker: %s · Brückenring: %s · Kurbel: %s"),G->State.anchor?TEXT("fest"):TEXT("offen"),G->State.ropeEnd?TEXT("fest"):TEXT("offen"),G->State.crank?TEXT("eingesetzt"):TEXT("fehlt")),X+28,Y+275,18,Teal);
 // These two actions use the same physical rigging commands as world interactions.
 Button(TEXT("Kurbel einsetzen"),X+28,Y+365,370,60,330);Buttons.Last().Id=330;
 Button(TEXT("Winde drehen"),X+430,Y+365,380,60,331);
 Wrap(TEXT("Befestige die Seilenden draußen an den sichtbaren Zielpunkten. E oder der Interaktionsknopf untersucht den nächstgelegenen Punkt."),X+28,Y+463,750,18,Muted);
 }
 if(G->Dialog==4){
 Wrap(TEXT("Typenschild: Generator liefert 8 Einheiten. Pumpe braucht 4, Licht 2, Funk 6. Nicht alles kann gleichzeitig laufen. Die Brücke bleibt nach dem Einrasten sicher."),X+28,Y+102,750,22,Ink);
 const TCHAR* Consumers[]={TEXT("Pumpe · 4"),TEXT("Licht · 2"),TEXT("Funk · 6")};for(int I=0;I<3;++I)Button(FString(Consumers[I])+(G->State.consumers&(1<<I)?TEXT(" · AN"):TEXT(" · AUS")),X+28+I*262,Y+275,245,65,400+I);
 Text(FString::Printf(TEXT("Verbrauch: %d / 8 · Sicherung: %s"),Expedition::Power(G->State),G->State.fuse?TEXT("eingesetzt"):TEXT("fehlt")),X+28,Y+380,24,Expedition::Power(G->State)>8?FLinearColor(.7,.22,.14,1):Teal);
 Button(TEXT("Signal senden"),X+28,Y+455,782,65,420);
 }
 if(G->Dialog==5){
 const TCHAR* Items[]={TEXT("Linke Kartenhälfte · Fundstück im Camp"),TEXT("Rechte Kartenhälfte · zum Drehen und Verbinden"),TEXT("Seil · an tragfähigen Punkten befestigen"),TEXT("Kurbel · in die Winde einsetzen"),TEXT("Sicherung · Stromkreis der Station schließen")};
 for(int I=0;I<5;++I){Panel(X+28,Y+115+I*66,780,54,FLinearColor(.89,.88,.79,1));Text((G->State.inventory&(1<<I)?TEXT("Gefunden  ·  "):TEXT("Noch fehlt  ·  "))+FString(Items[I]),X+45,Y+130+I*66,18,Ink);}
 }
 if(G->Dialog==6){
 Text(G->WordTopic?TEXT("Beispielthema: Wortarten"):TEXT("Beispielthema: Prozentrechnung"),X+28,Y+95,18,Teal);
 for(int I=0;I<8;++I){auto Q=G->QuestionFor(I);Text(FString::Printf(TEXT("%d. %s"),I+1,*Q.Prompt),X+28,Y+145+I*42,18,Ink);}
 Text(TEXT("Dies sind die tatsächlich im lokalen Spiel verwendeten Fragen."),X+28,Y+512,16,Muted);
 }
 if(G->Dialog==7){
 Wrap(TEXT("Die Welt und aktive Spielzeit sind angehalten. Dein Spielstand wird nach Lern- und Rätselschritten lokal gespeichert."),X+28,Y+130,740,22,Ink);
 Button(TEXT("Weiter"),X+28,Y+275,780,65,900);Button(TEXT("Spielstand laden"),X+28,Y+358,780,65,905);Button(TEXT("Neues Thema / neu starten"),X+28,Y+440,780,65,906);
 }
}

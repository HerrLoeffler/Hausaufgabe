#include "PizzaHUD.h"
#include "PizzaKitchen.h"
#include "Engine/Canvas.h"
#include "Engine/Font.h"
#include "Framework/Application/SlateApplication.h"
#include "Fonts/FontMeasure.h"
#include "Rendering/SlateRenderer.h"
#include "UObject/ConstructorHelpers.h"
#include "SceneView.h"
#include "Engine/Engine.h"
#include "CanvasItem.h"
#include "RenderUtils.h"
#include "Engine/Texture2D.h"
namespace {FString FractionText(PizzaRules::Rational R){return FString(UTF8_TO_TCHAR(PizzaRules::Format(R).c_str()));}const FLinearColor Cream(.98,.94,.8),Green(.08,.25,.22),Ink(.025,.045,.035),Orange(.85,.32,.12);}
void APizzaHUD::Panel(float X,float Y,float W,float H,FLinearColor C){DrawRect(C,X*Scale,Y*Scale,W*Scale,H*Scale);}
APizzaHUD::APizzaHUD(){static ConstructorHelpers::FObjectFinder<UFont> Font(TEXT("/Engine/EngineFonts/Roboto.Roboto"));TextFont=Font.Object;}
FVector2D APizzaHUD::TextExtent(const FString& Text,float Size)const{const FSlateFontInfo Font(TextFont,FMath::RoundToInt(FMath::Max(Size,17.f)*Scale*.75f),Size>=18?FName(TEXT("Bold")):FName(TEXT("Regular")));return FSlateApplication::Get().GetRenderer()->GetFontMeasureService()->Measure(Text,Font,1.f);}
void APizzaHUD::Label(const FString& Text,float X,float Y,float Size,FLinearColor Color,bool Center){const FSlateFontInfo Font(TextFont,FMath::RoundToInt(FMath::Max(Size,17.f)*Scale*.75f),Size>=18?FName(TEXT("Bold")):FName(TEXT("Regular")));FCanvasTextItem Item(FVector2D(X*Scale,Y*Scale),FText::FromString(Text),Font,Color);Item.bCentreX=Center;Canvas->DrawItem(Item);}
void APizzaHUD::Wrapped(const FString& Text,float X,float Y,float Width,float Size,FLinearColor Color,int MaxLines){TArray<FString> Words;Text.ParseIntoArray(Words,TEXT(" "),true);FString Line;int Number=0;for(const auto& Word:Words){const FString Candidate=Line.IsEmpty()?Word:Line+TEXT(" ")+Word;if(!Line.IsEmpty()&&TextExtent(Candidate,Size).X>Width*Scale){Label(Line,X,Y+Number*(Size+5),Size,Color);if(++Number>=MaxLines)return;Line=Word;}else Line=Candidate;}if(!Line.IsEmpty()&&Number<MaxLines)Label(Line,X,Y+Number*(Size+5),Size,Color);}

void APizzaHUD::Circle(float X,float Y,float R,FLinearColor C){TArray<FCanvasUVTri> T;for(int I=0;I<32;++I){FCanvasUVTri V;V.V0_Pos=FVector2D(X*Scale,Y*Scale);V.V1_Pos=FVector2D((X+FMath::Cos(I*2*PI/32)*R)*Scale,(Y+FMath::Sin(I*2*PI/32)*R)*Scale);V.V2_Pos=FVector2D((X+FMath::Cos((I+1)*2*PI/32)*R)*Scale,(Y+FMath::Sin((I+1)*2*PI/32)*R)*Scale);V.V0_UV=V.V1_UV=V.V2_UV=FVector2D::ZeroVector;V.V0_Color=V.V1_Color=V.V2_Color=C;T.Add(V);}FCanvasTriangleItem Item(T,GWhiteTexture);Item.BlendMode=SE_BLEND_Translucent;Canvas->DrawItem(Item);}
void APizzaHUD::Portion(float X,float Y,float R,int Parts,uint32 Mask){
 Circle(X,Y,R+6,Orange);for(int I=0;I<Parts;++I){TArray<FCanvasUVTri> T;const float A=-PI/2+I*2*PI/Parts,B=-PI/2+(I+1)*2*PI/Parts;const int Steps=FMath::Max(4,48/Parts);const FLinearColor C=Mask&(1u<<I)?FLinearColor(.96,.61,.18):FLinearColor(.79,.8,.72);for(int J=0;J<Steps;++J){const float P=FMath::Lerp(A,B,float(J)/Steps),Q=FMath::Lerp(A,B,float(J+1)/Steps);FCanvasUVTri V;V.V0_Pos=FVector2D(X*Scale,Y*Scale);V.V1_Pos=FVector2D((X+FMath::Cos(P)*R)*Scale,(Y+FMath::Sin(P)*R)*Scale);V.V2_Pos=FVector2D((X+FMath::Cos(Q)*R)*Scale,(Y+FMath::Sin(Q)*R)*Scale);V.V0_UV=V.V1_UV=V.V2_UV=FVector2D::ZeroVector;V.V0_Color=V.V1_Color=V.V2_Color=C;T.Add(V);}FCanvasTriangleItem Item(T,GWhiteTexture);Item.BlendMode=SE_BLEND_Translucent;Canvas->DrawItem(Item);if(Parts>1)DrawLine(X*Scale,Y*Scale,(X+FMath::Cos(A)*R)*Scale,(Y+FMath::Sin(A)*R)*Scale,Ink,2*Scale);if(Mask&(1u<<I)){const float Middle=(A+B)/2;Label(TEXT("✓"),X+FMath::Cos(Middle)*R*.63f,Y+FMath::Sin(Middle)*R*.63f-12,22,Ink,true);}}
}
void APizzaHUD::Button(FName Id,const FString& S,float X,float Y,float W,float H,FLinearColor C){Panel(X+2,Y+4,W,H,FLinearColor(0,0,0,.16));Panel(X,Y,W,H,C);Label(S,X+W/2,Y+H/2-10,19,C==Cream?Ink:Cream,true);Buttons.Add({Id,FBox2D(FVector2D(X,Y),FVector2D(X+W,Y+H))});}
void APizzaHUD::DrawHUD(){Super::DrawHUD();if(!Canvas)return;auto* P=Cast<APizzaController>(PlayerOwner);auto* G=P?P->Game():nullptr;if(!G)return;ViewOrigin=Canvas->SceneView?FVector2D(Canvas->SceneView->UnscaledViewRect.Min):FVector2D::ZeroVector;Scale=Canvas->SizeX/1280.f;Height=Canvas->SizeY/Scale;Buttons.Empty();
 // Only compact in-game overlays: the 3D kitchen remains the main view.
 Panel(18,16,215,54,Green);Label(TEXT("LA PICCOLA"),34,22,22,Cream);Label(TEXT("BRUCHPIZZERIA"),34,49,11,FLinearColor(.7,.84,.7));
 Panel(1035,16,226,54,Green);Label(G->Level.RoundSeconds>0?FString::Printf(TEXT("%02d:%02d · %d/%d Gäste"),static_cast<int>(G->RoundTime)/60,static_cast<int>(G->RoundTime)%60,G->Served,G->Level.Goal):FString::Printf(TEXT("In Ruhe · %d/%d Gäste"),G->Served,G->Level.Goal),1050,30,20,Cream);
 for(int I=0;I<G->Orders.Num();++I){const auto& O=G->Orders[I];const float X=250+I*252;Panel(X,14,238,88,Cream);Label(O.Name,X+12,19,13,Green);Label(G->OrderLabel(O),X+12,41,22,Ink);Label(O.Ingredients==7?TEXT("Tomate · Käse · Pilze"):TEXT("Tomate · Käse"),X+12,71,12,Green);Panel(X,97,238,5,FLinearColor(.73,.69,.55));if(G->Level.Patience>0)Panel(X,97,238*O.Patience/G->Level.Patience,5,FLinearColor(.4,.64,.35));}
 if(G->Oven.IsSet()){Panel(995,105,264,43,Green);Label(G->Oven->Baked?TEXT("Ofen: fertig!"):FString::Printf(TEXT("Im Ofen: %.0f%%"),G->BakeTime/5.f*100),1008,116,18,Cream);}
 if(!G->Learning&&!G->Intro&&!G->Finished){Panel(245,Height-58,800,50,Green);Wrapped(G->Feedback,257,Height-52,775,17,Cream);}
 if(G->Intro){const float Y=Height*.29f;Panel(340,Y,600,330,Cream);Label(FString::Printf(TEXT("Ciao! Level %d / 10"),G->LevelNumber),640,Y+22,30,Green,true);Label(FString(UTF8_TO_TCHAR(PizzaRules::CampaignLayout(G->LevelNumber).Name)),640,Y+58,18,Green,true);Label(FString(UTF8_TO_TCHAR(PizzaRules::LevelObjective(G->LevelNumber))),640,Y+86,20,Ink,true);Label(FString::Printf(TEXT("Ziel: %d Gäste · %d %s · 2 Ablagen"),G->Level.Goal,G->Level.Ovens,G->Level.Ovens==1?TEXT("Ofen"):TEXT("Öfen")),640,Y+122,19,Green,true);Label(TEXT("WASD bewegen · Maus schneiden · E benutzen"),640,Y+155,17,Ink,true);Label(TEXT("E / X am Tisch: ablegen. E: wieder abholen."),640,Y+185,17,Ink,true);Button(TEXT("levelback"),TEXT("<"),370,Y+254,58,50,Green);Button(TEXT("start"),TEXT("LOS KOCHEN"),465,Y+254,350,50,Green);Button(TEXT("levelnext"),TEXT(">"),852,Y+254,58,50,Green);return;}
 if(G->Finished){const float Y=Height*.28f;Panel(355,Y,570,325,Cream);Label(G->LevelWon?TEXT("Schicht geschafft!"):TEXT("Noch eine Runde?"),640,Y+25,30,Green,true);Label(FString::Printf(TEXT("Level %d · %d/%d Gäste · %d Punkte"),G->LevelNumber,G->Served,G->Level.Goal,G->Score),640,Y+83,22,Ink,true);Wrapped(G->LevelWon?(G->LevelNumber==10?TEXT("Alle zehn Schichten geschafft! Du kannst jede Küche wiederholen."):TEXT("Deine nächste Schicht ist freigeschaltet. Üben ist jederzeit möglich.")):TEXT("Die Zeit ist um. Wiederhole die Schicht; deine freigeschalteten Level bleiben erhalten."),385,Y+130,510,19,Ink);Button(TEXT("start"),TEXT("NOCHMAL"),380,Y+246,240,52,Green);if(G->LevelWon&&G->LevelNumber<10)Button(TEXT("nextlevel"),TEXT("NÄCHSTES LEVEL"),644,Y+246,260,52,Orange);return;}
 if(G->Learning){
  Panel(0,0,1280,Height,FLinearColor(0,0,0,.38));const float X=150,Y=FMath::Max(104.f,(Height-480)/2);Panel(X,Y,980,480,Cream);Label(TEXT("KEINE EILE. DIE KÜCHE WARTET."),X+28,Y+20,18,Green);Label(G->LessonContext,X+28,Y+56,25,Ink);
  if(G->RecipeLesson){Label(TEXT("Die Portion bleibt hier. Wir schauen kurz auf den Belag."),X+28,Y+104,21,Ink);Label(TEXT("Bestellt:"),X+28,Y+164,22,Green);Label(G->RepairOrder.Ingredients==7?TEXT("Tomate · Käse · Pilze"):TEXT("Tomate · Käse"),X+28,Y+205,26,Ink);Label(TEXT("Auf deinem Teller:"),X+28,Y+272,22,Green);const int Bits=G->Carry.IsSet()?G->Carry->Ingredients:0;FString Ingredients;if(Bits&1)Ingredients+=TEXT("Tomate ");if(Bits&2)Ingredients+=TEXT("Käse ");if(Bits&4)Ingredients+=TEXT("Pilze");Label(Ingredients,X+28,Y+313,26,Ink);Button(TEXT("repairconfirm"),TEXT("BELAG KORRIGIEREN"),X+555,Y+386,395,57,Green);return;}
  const auto& R=G->Repair;Label(TEXT("BESTELLT"),420,Y+109,20,Green,true);Label(TEXT("DEIN TELLER · ANTIPPEN"),860,Y+109,20,Green,true);
  Portion(420,Y+248,100,R.Parts,(1u<<R.TargetCount())-1);Portion(860,Y+248,100,R.Parts,R.Mask);
  Label(FString::Printf(TEXT("%d von %d Stücken"),R.TargetCount(),R.Parts),420,Y+365,22,Ink,true);Label(FString::Printf(TEXT("%d von %d ausgewählt"),R.Count(),R.Parts),860,Y+365,22,Ink,true);
  if(G->RepairOrder.Op!=' '){const auto& O=G->RepairOrder;const FString Equation=FractionText(O.Left)+TEXT(" ")+FString::Chr(O.Op=='*'?TEXT('×'):O.Op=='/'?TEXT('÷'):O.Op)+TEXT(" ")+FractionText(O.Right)+TEXT(" = ")+FractionText(O.Amount);Label(Equation,420,Y+398,22,Ink,true);}else Label(TEXT("Markiert = auf dem Teller"),420,Y+398,18,Green,true);
  Wrapped(G->Feedback,X+28,Y+441,924,18,Ink,1);
  Button(TEXT("repairhelp"),TEXT("HILFE ZEIGEN"),X+403,Y+220,176,56,Green);
  Button(TEXT("repairconfirm"),TEXT("PORTION KORRIGIEREN"),X+555,Y+397,395,37,Green);
  return;
 }
 if(G->Paused){Panel(390,Height*.4f,500,170,Cream);Label(TEXT("PAUSE"),640,Height*.4f+25,29,Green,true);Button(TEXT("pause"),TEXT("WEITER"),490,Height*.4f+88,300,54,Green);return;}
 if(!G->Cutting)Button(TEXT("pause"),TEXT("II"),25,158,55,43,Green);
 if(G->Cutting){Panel(22,114,300,102,Green);Label(TEXT("AM SCHNEIDEBRETT"),38,127,15,Cream);Label(TEXT("Quer über die Pizza ziehen"),38,153,21,Cream);Label(TEXT("Tippen: Stücke auswählen"),38,185,13,Cream);
  if(G->Board.IsSet()){auto Value=G->Board->Cuts.Selected(G->Board->Selection);Label(Value.Valid?TEXT("Deine Portion: ")+FString(UTF8_TO_TCHAR(PizzaRules::Format(Value).c_str())):TEXT("Gleiche Teile auswählen"),640,Height-175,24,Cream,true);}
  Button(TEXT("plate"),TEXT("AUF DEN TELLER"),850,Height-124,330,55,Green);Button(TEXT("reset"),TEXT("NEU TEILEN"),370,Height-124,220,55,Orange);
  if(P->Dragging){FVector2D A,B;P->ProjectWorldLocationToScreen(G->CutLocation()+FVector(P->DragStart.X*42,P->DragStart.Y*42,9),A);P->ProjectWorldLocationToScreen(G->CutLocation()+FVector(P->DragEnd.X*42,P->DragEnd.Y*42,9),B);DrawLine(A.X-ViewOrigin.X,A.Y-ViewOrigin.Y,B.X-ViewOrigin.X,B.Y-ViewOrigin.Y,Cream,4*Scale);}
 }else{Button(TEXT("use"),TEXT("E · BENUTZEN"),1033,Height-135,222,70,Green);Button(TEXT("dash"),TEXT("SPRINT"),900,Height-118,117,46,Orange);Button(TEXT("drop"),TEXT("ABLEGEN"),744,Height-118,142,46,Green);const int S=G->NearestStation();if(S>=0){const TCHAR* Names[]={TEXT("TEIG"),TEXT("TOMATE"),TEXT("KÄSE"),TEXT("PILZE"),TEXT("OFEN"),TEXT("SCHNEIDEN"),TEXT("SERVIEREN"),TEXT("SERVIEREN"),TEXT("SERVIEREN"),TEXT("ABLAGE"),TEXT("ABLAGE"),TEXT("OFEN 2"),TEXT("OFEN 3")};Label(FString(TEXT("E  "))+Names[S],640,Height-102,22,Cream,true);}}
 if(!G->Cutting)Label(FString::Printf(TEXT("LEVEL %d / 10"),G->LevelNumber),30,118,20,Cream);
 for(int I=0;I<G->ExtraOvens.Num();++I)if(G->ExtraOvens[I].IsSet()){Panel(1025,158+I*46,234,42,Green);Label(G->ExtraOvens[I]->Baked?FString::Printf(TEXT("Ofen %d: fertig!"),I+2):FString::Printf(TEXT("Ofen %d: %.0f%%"),I+2,G->ExtraBakeTimes[I]/5*100),1035,168+I*46,18,Cream);}

}
bool APizzaHUD::Press(FVector2D Screen){auto* P=Cast<APizzaController>(PlayerOwner);auto* G=P?P->Game():nullptr;if(!G)return false;const FVector2D Point=(Screen-ViewOrigin)/Scale;
 for(const auto& B:Buttons)if(B.Rect.IsInside(Point)){const FString ID=B.Id.ToString();if(ID==TEXT("start"))G->Start();else if(ID==TEXT("nextlevel")){G->SelectLevel(G->LevelNumber+1);G->Start();}else if(ID==TEXT("levelback"))G->SelectLevel(G->LevelNumber-1);else if(ID==TEXT("levelnext"))G->SelectLevel(G->LevelNumber+1);else if(ID==TEXT("pause"))G->TogglePause();else if(ID==TEXT("use"))G->Use();else if(ID==TEXT("dash"))G->Dash();else if(ID==TEXT("drop"))G->Drop();else if(ID==TEXT("plate"))G->FinishCut();else if(ID==TEXT("reset"))G->ResetCuts();else if(ID==TEXT("repairhelp"))G->ShowRepairStep();else if(ID==TEXT("repairconfirm"))G->ConfirmRepair();return true;}
 if(G->Learning&&!G->RecipeLesson){const float Y=FMath::Max(104.f,(Height-480)/2);const FVector2D V=Point-FVector2D(860,Y+248);if(V.SizeSquared()<=100*100){float Angle=FMath::Atan2(V.Y,V.X)+PI/2;if(Angle<0)Angle+=2*PI;G->ToggleRepairPiece(FMath::Min(G->Repair.Parts-1,int(Angle/(2*PI)*G->Repair.Parts)));return true;}}
 return false;
}

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
namespace {FString Money(int Cents){const int64 V=Cents,A=FMath::Abs(V);return FString::Printf(TEXT("%s%lld,%02lld €"),V<0?TEXT("-"):TEXT(""),static_cast<long long>(A/100),static_cast<long long>(A%100));}FString FractionText(PizzaRules::Rational R){return FString(UTF8_TO_TCHAR(PizzaRules::Format(R).c_str()));}const FLinearColor Cream(.98,.94,.8),Green(.08,.25,.22),Ink(.025,.045,.035),Orange(.85,.32,.12);}
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
 Panel(1035,16,226,84,Green);Label(G->Level.RoundSeconds>0?FString::Printf(TEXT("%02d:%02d · %d/%d richtig"),static_cast<int>(G->RoundTime)/60,static_cast<int>(G->RoundTime)%60,G->Served,G->Level.Goal):FString::Printf(TEXT("In Ruhe · %d/%d richtig"),G->Served,G->Level.Goal),1050,25,19,Cream);Label(TEXT("Kasse: ")+Money(G->Cash),1050,59,22,Cream);
 for(int I=0;I<G->Orders.Num();++I){const auto& O=G->Orders[I];const float X=250+O.Bay*252;Panel(X,14,238,88,Cream);Label(O.Name+FString::Printf(TEXT(" · Tisch %d"),O.Bay+1),X+12,19,13,Green);Label(G->OrderLabel(O),X+12,41,22,Ink);Label(O.Ingredients==7?TEXT("Tomate · Käse · Pilze"):TEXT("Tomate · Käse"),X+12,71,12,Green);Panel(X,97,238,5,FLinearColor(.73,.69,.55));if(G->Level.Patience>0)Panel(X,97,238*O.Patience/G->Level.Patience,5,FLinearColor(.4,.64,.35));}
 if(G->Oven.IsSet()&&!G->BillVisible){Panel(995,105,264,43,Green);Label(G->Oven->Baked?TEXT("Ofen: fertig!"):FString::Printf(TEXT("Im Ofen: %.0f%%"),G->BakeTime/5.f*100),1008,116,18,Cream);}
 if(G->Paused){Buttons.Empty();Panel(0,0,1280,Height,FLinearColor(0,0,0,.4));const float Y=FMath::Max(110.f,(Height-350)/2);Panel(355,Y,570,350,Cream);Label(TEXT("PAUSE"),640,Y+21,30,Green,true);Label(FString::Printf(TEXT("Level %d / 10 · %s"),G->LevelNumber,*FString(UTF8_TO_TCHAR(G->Layout.Name))),640,Y+61,19,Ink,true);Button(TEXT("pause"),TEXT("WEITER"),405,Y+104,470,54,Green);Button(TEXT("restart"),TEXT("SCHICHT NEU STARTEN"),405,Y+174,470,54,Orange);Button(TEXT("mainmenu"),TEXT("LEVELAUSWAHL"),405,Y+244,470,54,Green);Label(TEXT("Kasse und freigeschaltete Level bleiben erhalten."),640,Y+317,17,Ink,true);return;}
 if(!G->Learning&&!G->Intro&&!G->Finished){Panel(245,Height-58,800,50,Green);Wrapped(G->Feedback,257,Height-52,775,17,Cream);}
 if(G->BillVisible&&!G->Learning&&!G->Intro){
  const float X=1035,Y=110;Panel(X,Y,226,258,Cream);Label(TEXT("BON · ")+G->BillGuest,X+12,Y+12,19,Green);Button(TEXT("billclose"),TEXT("×"),X+194,Y+7,24,24,Green);
  Label(G->BillPortion.Valid?FractionText(G->BillPortion)+TEXT(" Pizza"):TEXT("Preis offen · ungleiche Stücke"),X+12,Y+40,17,Ink);
  float Row=Y+69;auto Line=[&](const FString& Name,int Cents){Label(Name,X+12,Row,17,Ink);Label(Money(Cents),X+177,Row,17,Ink,true);Row+=22;};
  if(G->LastBill.Valid){Line(TEXT("Pizza"),G->LastBill.Pizza);if(G->BillIngredients&1)Line(TEXT("Tomate"),G->LastBill.Tomato);if(G->BillIngredients&2)Line(TEXT("Käse"),G->LastBill.Cheese);if(G->BillIngredients&4)Line(TEXT("Champignons"),G->LastBill.Mushrooms);Panel(X+12,Row+1,202,1,Green);Row+=10;Line(TEXT("Gesamtpreis"),G->LastBill.Subtotal);Line(TEXT("Trinkgeld"),G->LastBill.Tip);}
  Label(TEXT("Bezahlt: ")+Money(G->LastBill.Paid),X+12,Row+5,20,G->BillComplaint.IsEmpty()?Green:Orange);
 }
 if(G->Intro){
  const float Y=FMath::Max(90.f,(Height-480)/2);Panel(260,Y,760,480,Cream);Label(FString::Printf(TEXT("Ciao! Level %d / 10"),G->LevelNumber),640,Y+19,29,Green,true);Label(FString(UTF8_TO_TCHAR(PizzaRules::CampaignLayout(G->LevelNumber).Name)),640,Y+58,18,Green,true);Label(FString(UTF8_TO_TCHAR(PizzaRules::LevelObjective(G->LevelNumber))),640,Y+89,20,Ink,true);
  Label(FString::Printf(TEXT("Ziel: %d richtig · %d %s · 2 Ablagen"),G->Level.Goal,G->Level.Ovens,G->Level.Ovens==1?TEXT("Ofen"):TEXT("Öfen")),640,Y+123,19,Green,true);Label(TEXT("NEU IN DIESER SCHICHT"),288,Y+165,20,Green);Wrapped(FString(UTF8_TO_TCHAR(PizzaRules::LevelChange(G->LevelNumber))),288,Y+197,704,18,Ink,5);
  Label(TEXT("WASD bewegen · E benutzen · Maus schneiden"),640,Y+326,17,Ink,true);Label(TEXT("Teller holen → Teig & Belag → Ofen → Brett → Gast"),640,Y+353,17,Ink,true);
  Button(TEXT("levelback"),TEXT("<"),290,Y+408,58,50,Green);Button(TEXT("start"),TEXT("LOS KOCHEN"),402,Y+408,476,50,Green);Button(TEXT("levelnext"),TEXT(">"),932,Y+408,58,50,Green);return;
 }
 if(G->Finished){const float Y=Height*.28f;Panel(355,Y,570,434,Cream);Label(G->LevelWon?TEXT("Schicht geschafft!"):TEXT("Noch eine Runde?"),640,Y+25,30,Green,true);Label(FString::Printf(TEXT("Level %d · %d/%d richtig"),G->LevelNumber,G->Served,G->Level.Goal),640,Y+73,22,Ink,true);Label(TEXT("Pizzen + Zutaten: ")+Money(G->ShiftSales),640,Y+107,20,Ink,true);Label(TEXT("Trinkgeld: ")+Money(G->ShiftTips),640,Y+137,20,Ink,true);Label(TEXT("Schichtergebnis: ")+Money(G->ShiftSales+G->ShiftTips-G->DisposalCosts),640,Y+170,24,Green,true);Wrapped(G->LevelWon?(G->LevelNumber==10?TEXT("Alle zehn Schichten geschafft! Du kannst jede Küche wiederholen."):TEXT("Deine nächste Schicht ist freigeschaltet. Üben ist jederzeit möglich.")):TEXT("Die Zeit ist um. Wiederhole die Schicht; deine freigeschalteten Level bleiben erhalten."),385,Y+205,510,17,Ink);Label(TEXT("Müllkosten: -")+Money(G->DisposalCosts),640,Y+247,18,Ink,true);Label(FString::Printf(TEXT("%d falsche Lieferungen · 0 €"),G->WrongDelivered),640,Y+273,17,Ink,true);Button(TEXT("mainmenu"),TEXT("LEVELAUSWAHL"),405,Y+360,470,48,Green);Button(TEXT("start"),TEXT("NOCHMAL"),380,Y+295,240,52,Green);if(G->LevelWon&&G->LevelNumber<10)Button(TEXT("nextlevel"),TEXT("NÄCHSTES LEVEL"),644,Y+295,260,52,Orange);return;}
 if(!G->Learning)Button(TEXT("pause"),TEXT("MENÜ · ESC"),18,75,130,38,Green);
 if(G->Learning){
  Buttons.Empty();Panel(0,0,1280,Height,FLinearColor(0,0,0,.38));const float X=230,Y=FMath::Max(110.f,(Height-450)/2);Panel(X,Y,820,450,Cream);Button(TEXT("pause"),TEXT("MENÜ · ESC"),18,75,130,38,Green);
  Label(G->LessonContext,640,Y+22,27,Green,true);Label(FractionText(G->RepairOrder.Amount)+TEXT(" Pizza"),640,Y+63,27,Ink,true);
  if(G->RepairOrder.Op!=' '){const auto& O=G->RepairOrder;Label(FractionText(O.Left)+TEXT(" ")+FString::Chr(O.Op)+TEXT(" ")+FractionText(O.Right)+TEXT(" = ")+FractionText(O.Amount),640,Y+101,20,Ink,true);}
  const int Parts=G->RepairOrder.Amount.Den,Count=G->RepairOrder.Amount.Num;Portion(640,Y+226,100,Parts,(1u<<Count)-1);
  Label(G->RepairOrder.Ingredients==7?TEXT("Sauberer Teller · gebacken · Tomate · Käse · Champignons"):TEXT("Sauberer Teller · gebacken · Tomate · Käse"),640,Y+347,20,Ink,true);
  Button(TEXT("reviewack"),TEXT("OKAY, VERSTANDEN · E"),260,Y+390,340,45,Green);Button(TEXT("serveanyway"),TEXT("TROTZDEM ABGEBEN · 0 € · F"),625,Y+390,395,45,Orange);return;
 }
 if(G->Cutting){Panel(22,114,300,102,Green);Label(TEXT("AM SCHNEIDEBRETT"),38,127,15,Cream);Label(TEXT("Quer über die Pizza ziehen"),38,153,21,Cream);Label(TEXT("Tippen: Stücke auswählen"),38,185,13,Cream);
  if(G->Board.IsSet()){auto Value=G->Board->Cuts.Selected(G->Board->Selection);Label(Value.Valid?TEXT("Deine Portion: ")+FString(UTF8_TO_TCHAR(PizzaRules::Format(Value).c_str())):TEXT("Ungleiche Stücke: trotzdem servierbar"),640,Height-175,24,Cream,true);}
  Button(TEXT("plate"),TEXT("AUF DEN TELLER"),935,Height-124,310,55,Green);Button(TEXT("takeboard"),TEXT("MITNEHMEN"),655,Height-124,255,55,Green);Button(TEXT("reset"),TEXT("NEU TEILEN"),410,Height-124,220,55,Orange);Button(TEXT("leaveboard"),TEXT("BRETT VERLASSEN"),22,Height-124,362,55,Green);
  if(P->Dragging){FVector2D A,B;P->ProjectWorldLocationToScreen(G->CutLocation()+FVector(P->DragStart.X*42,P->DragStart.Y*42,9),A);P->ProjectWorldLocationToScreen(G->CutLocation()+FVector(P->DragEnd.X*42,P->DragEnd.Y*42,9),B);DrawLine(A.X-ViewOrigin.X,A.Y-ViewOrigin.Y,B.X-ViewOrigin.X,B.Y-ViewOrigin.Y,Cream,4*Scale);}
 }else{Button(TEXT("use"),TEXT("E · BENUTZEN"),1033,Height-135,222,70,Green);Button(TEXT("dash"),TEXT("SPRINT"),900,Height-118,117,46,Orange);Button(TEXT("drop"),TEXT("ABLEGEN"),744,Height-118,142,46,Green);const int S=G->NearestStation();if(S>=0){const TCHAR* Names[]={TEXT("TEIG"),TEXT("TOMATE"),TEXT("KÄSE"),TEXT("PILZE"),TEXT("OFEN"),TEXT("SCHNEIDEN"),TEXT("SERVIEREN"),TEXT("SERVIEREN"),TEXT("SERVIEREN"),TEXT("ABLAGE"),TEXT("ABLAGE"),TEXT("OFEN 2"),TEXT("OFEN 3"),TEXT("TELLER"),TEXT("SPUELE"),TEXT("MUELL")};Label(FString(TEXT("E  "))+Names[S],640,Height-102,22,Cream,true);}}
 if(!G->Cutting&&G->Carry.IsSet()){
  const auto& Item=G->Carry.GetValue();FString Contents;
  if(!Item.HasPizza)Contents=Item.DirtyPlate?TEXT("Schmutziger Teller → Spüle"):TEXT("Sauberer Teller");
  else {Contents=Item.Baked?TEXT("Gebacken"):TEXT("Roh");if(Item.Ingredients&1)Contents+=TEXT(" · Tomate");if(Item.Ingredients&2)Contents+=TEXT(" · Käse");if(Item.Ingredients&4)Contents+=TEXT(" · Champignons");const auto A=Item.Portion();Contents+=A.Valid?TEXT(" · ")+FractionText(A)+TEXT(" Pizza"):TEXT(" · ungleiche Stücke");if(!Item.HasPlate)Contents+=TEXT(" · Teller fehlt");if(!Item.LayerOrder.empty())Contents+=FString(TEXT(" · Oben: "))+ (Item.LayerOrder.back()==1?TEXT("Tomate"):Item.LayerOrder.back()==2?TEXT("Käse"):TEXT("Champignons"));}
  Panel(410,Height-198,505,47,Green);Wrapped(Contents,421,Height-193,485,17,Cream);
 }
 if(!G->Cutting)Label(FString::Printf(TEXT("LEVEL %d / 10"),G->LevelNumber),30,118,20,Cream);
 for(int I=0;I<G->ExtraOvens.Num();++I)if(G->ExtraOvens[I].IsSet()&&!G->BillVisible){Panel(1025,158+I*46,234,42,Green);Label(G->ExtraOvens[I]->Baked?FString::Printf(TEXT("Ofen %d: fertig!"),I+2):FString::Printf(TEXT("Ofen %d: %.0f%%"),I+2,G->ExtraBakeTimes[I]/5*100),1035,168+I*46,18,Cream);}
 if(G->Sink.IsSet()&&!G->BillVisible){Panel(1035,257,226,46,Green);Label(G->Sink->DirtyPlate?FString::Printf(TEXT("Spülen: %.0f%%"),G->WashTime/3*100):TEXT("Teller sauber · E"),1047,270,18,Cream);}
 for(int Bay=0;Bay<3;++Bay)if(G->GuestMeals[Bay].IsSet()){const float X=250+Bay*252;Panel(X,14,238,88,Cream);Label(G->GuestMealNames[Bay]+FString::Printf(TEXT(" · Tisch %d"),Bay+1),X+12,19,17,Green);Label(G->EatTimes[Bay]>0?TEXT("Teller angekommen"):TEXT("Teller zur Spüle"),X+12,47,19,Ink);Label(G->EatTimes[Bay]>0?TEXT("Gast ist noch am Tisch"):TEXT("E · mit freien Händen holen"),X+12,75,17,Green);}

}
bool APizzaHUD::Press(FVector2D Screen){auto* P=Cast<APizzaController>(PlayerOwner);auto* G=P?P->Game():nullptr;if(!G)return false;const FVector2D Point=(Screen-ViewOrigin)/Scale;
 for(const auto& B:Buttons)if(B.Rect.IsInside(Point)){const FString ID=B.Id.ToString();if(G->Paused&&ID!=TEXT("pause")&&ID!=TEXT("restart")&&ID!=TEXT("mainmenu"))return true;if(ID==TEXT("start"))G->Start();else if(ID==TEXT("restart"))G->Start();else if(ID==TEXT("mainmenu"))G->ReturnToMenu();else if(ID==TEXT("nextlevel")){G->SelectLevel(G->LevelNumber+1);G->ReturnToMenu();}else if(ID==TEXT("levelback"))G->SelectLevel(G->LevelNumber-1);else if(ID==TEXT("levelnext"))G->SelectLevel(G->LevelNumber+1);else if(ID==TEXT("pause"))G->TogglePause();else if(ID==TEXT("use"))G->Use();else if(ID==TEXT("dash"))G->Dash();else if(ID==TEXT("drop"))G->Drop();else if(ID==TEXT("plate"))G->FinishCut();else if(ID==TEXT("reset"))G->ResetCuts();else if(ID==TEXT("takeboard"))G->TakeBoard();else if(ID==TEXT("leaveboard"))G->LeaveBoard();else if(ID==TEXT("reviewack"))G->ConfirmRepair();else if(ID==TEXT("serveanyway"))G->ServeAnyway();else if(ID==TEXT("billclose"))G->BillVisible=false;else if(ID==TEXT("repairconfirm"))G->ConfirmRepair();return true;}
 if(G->Learning)return true;
 return false;
}

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
namespace {const FLinearColor Cream(.98,.94,.8),Green(.08,.25,.22),Ink(.025,.045,.035),Orange(.85,.32,.12);}
void APizzaHUD::Panel(float X,float Y,float W,float H,FLinearColor C){DrawRect(C,X*Scale,Y*Scale,W*Scale,H*Scale);}
APizzaHUD::APizzaHUD(){static ConstructorHelpers::FObjectFinder<UFont> Font(TEXT("/Engine/EngineFonts/Roboto.Roboto"));TextFont=Font.Object;}
FVector2D APizzaHUD::TextExtent(const FString& Text,float Size)const{const FSlateFontInfo Font(TextFont,FMath::RoundToInt(FMath::Max(Size,17.f)*Scale*.75f),Size>=18?FName(TEXT("Bold")):FName(TEXT("Regular")));return FSlateApplication::Get().GetRenderer()->GetFontMeasureService()->Measure(Text,Font,1.f);}
void APizzaHUD::Label(const FString& Text,float X,float Y,float Size,FLinearColor Color,bool Center){const FSlateFontInfo Font(TextFont,FMath::RoundToInt(FMath::Max(Size,17.f)*Scale*.75f),Size>=18?FName(TEXT("Bold")):FName(TEXT("Regular")));FCanvasTextItem Item(FVector2D(X*Scale,Y*Scale),FText::FromString(Text),Font,Color);Item.bCentreX=Center;Canvas->DrawItem(Item);}
void APizzaHUD::Wrapped(const FString& Text,float X,float Y,float Width,float Size,FLinearColor Color,int MaxLines){TArray<FString> Words;Text.ParseIntoArray(Words,TEXT(" "),true);FString Line;int Number=0;for(const auto& Word:Words){const FString Candidate=Line.IsEmpty()?Word:Line+TEXT(" ")+Word;if(!Line.IsEmpty()&&TextExtent(Candidate,Size).X>Width*Scale){Label(Line,X,Y+Number*(Size+5),Size,Color);if(++Number>=MaxLines)return;Line=Word;}else Line=Candidate;}if(!Line.IsEmpty()&&Number<MaxLines)Label(Line,X,Y+Number*(Size+5),Size,Color);}

void APizzaHUD::Circle(float X,float Y,float R,FLinearColor C){TArray<FCanvasUVTri> T;for(int I=0;I<32;++I){FCanvasUVTri V;V.V0_Pos=FVector2D(X*Scale,Y*Scale);V.V1_Pos=FVector2D((X+FMath::Cos(I*2*PI/32)*R)*Scale,(Y+FMath::Sin(I*2*PI/32)*R)*Scale);V.V2_Pos=FVector2D((X+FMath::Cos((I+1)*2*PI/32)*R)*Scale,(Y+FMath::Sin((I+1)*2*PI/32)*R)*Scale);V.V0_UV=V.V1_UV=V.V2_UV=FVector2D::ZeroVector;V.V0_Color=V.V1_Color=V.V2_Color=C;T.Add(V);}FCanvasTriangleItem Item(T,GWhiteTexture);Item.BlendMode=SE_BLEND_Translucent;Canvas->DrawItem(Item);}
void APizzaHUD::Button(FName Id,const FString& S,float X,float Y,float W,float H,FLinearColor C){Panel(X+2,Y+4,W,H,FLinearColor(0,0,0,.16));Panel(X,Y,W,H,C);Label(S,X+W/2,Y+H/2-10,19,C==Cream?Ink:Cream,true);Buttons.Add({Id,FBox2D(FVector2D(X,Y),FVector2D(X+W,Y+H))});}
void APizzaHUD::DrawHUD(){Super::DrawHUD();if(!Canvas)return;auto* P=Cast<APizzaController>(PlayerOwner);auto* G=P?P->Game():nullptr;if(!G)return;ViewOrigin=Canvas->SceneView?FVector2D(Canvas->SceneView->UnscaledViewRect.Min):FVector2D::ZeroVector;Scale=Canvas->SizeX/1280.f;Height=Canvas->SizeY/Scale;Buttons.Empty();
 // Only compact in-game overlays: the 3D kitchen remains the main view.
 Panel(18,16,215,54,Green);Label(TEXT("LA PICCOLA"),34,22,22,Cream);Label(TEXT("BRUCHPIZZERIA"),34,49,11,FLinearColor(.7,.84,.7));
 Panel(1035,16,226,54,Green);Label(FString::Printf(TEXT("%02d:%02d   %d Punkte"),static_cast<int>(G->RoundTime)/60,static_cast<int>(G->RoundTime)%60,G->Score),1050,30,20,Cream);
 for(int I=0;I<G->Orders.Num();++I){const auto& O=G->Orders[I];const float X=250+I*252;Panel(X,14,238,88,Cream);Label(O.Name,X+12,19,13,Green);Label(G->OrderLabel(O),X+12,41,22,Ink);Label(O.Ingredients==7?TEXT("Tomate · Käse · Pilze"):TEXT("Tomate · Käse"),X+12,71,12,Green);Panel(X,97,238,5,FLinearColor(.73,.69,.55));Panel(X,97,238*O.Patience/110.f,5,FLinearColor(.4,.64,.35));}
 if(G->Oven.IsSet()){Panel(995,105,264,43,Green);Label(G->Oven->Baked?TEXT("Ofen: fertig!"):FString::Printf(TEXT("Im Ofen: %.0f%%"),G->BakeTime/5.f*100),1008,116,18,Cream);}
 if(!G->Learning&&!G->Intro&&!G->Finished){Panel(245,Height-58,800,50,Green);Wrapped(G->Feedback,257,Height-52,775,17,Cream);}
 if(G->Intro){Panel(372,Height*.40f,536,245,Cream);Label(TEXT("Ciao, Pizzaiolo!"),640,Height*.40f+23,32,Green,true);Label(TEXT("Belegen. Backen. Teilen. Glückliche Gäste."),640,Height*.40f+72,19,Ink,true);Label(TEXT("Bewegen: WASD · Schneiden: Maus ziehen"),640,Height*.40f+108,16,Green,true);Label(TEXT("E benutzen · Leertaste Sprint · X zurücklegen"),640,Height*.40f+139,15,Green,true);Button(TEXT("start"),TEXT("LOS KOCHEN"),490,Height*.40f+181,300,49,Green);return;}
 if(G->Finished){Panel(410,Height*.38f,460,225,Cream);Label(TEXT("Schicht geschafft!"),640,Height*.38f+26,31,Green,true);Label(FString::Printf(TEXT("%d Gäste · %d Punkte"),G->Served,G->Score),640,Height*.38f+81,22,Ink,true);Button(TEXT("start"),TEXT("NOCH EINE SCHICHT"),490,Height*.38f+145,300,52,Green);return;}
 if(G->Learning){
  Panel(0,0,1280,Height,FLinearColor(0,0,0,.38));const float X=285,Y=Height*.26f;Panel(X,Y,710,380,Cream);Label(TEXT("KURZE LERNPAUSE · DIE KÜCHE WARTET"),X+28,Y+20,14,Green);Label(G->LessonContext,X+28,Y+56,18,Ink);
  if(G->LessonIndex<static_cast<int>(G->Lesson.size())){const auto& S=G->Lesson[G->LessonIndex];const FString Text=UTF8_TO_TCHAR(S.Prompt.c_str());TArray<FString> Words;Text.ParseIntoArray(Words,TEXT(" "),true);FString Line;float LineY=Y+99;for(const auto& Word:Words){const FString Candidate=Line.IsEmpty()?Word:Line+TEXT(" ")+Word;const float TW=TextExtent(Candidate,20).X;if(!Line.IsEmpty()&&TW>650*Scale){Label(Line,X+28,LineY,20,Ink);Line=Word;LineY+=28;}else Line=Candidate;}if(!Line.IsEmpty())Label(Line,X+28,LineY,20,Ink);for(int I=0;I<static_cast<int>(S.Choices.size());++I)Button(*FString::Printf(TEXT("answer%d"),I),FString::Printf(TEXT("%d · %s"),I+1,*(G->RecipeLesson?(S.Choices[I]==1?FString(TEXT("Tomate")):S.Choices[I]==2?FString(TEXT("Käse")):S.Choices[I]==4?FString(TEXT("Pilze")):FString(TEXT("Alles"))):FString::FromInt(S.Choices[I]))),X+30+I*164,Y+225,150,60,I==G->AnswerChoice?Orange:Green);Label(FString::Printf(TEXT("Schritt %d von %d"),G->LessonIndex+1,static_cast<int>(G->Lesson.size())),X+28,Y+311,14,Green);Label(G->Feedback,X+28,Y+341,13,Orange);}
  return;
 }
 if(G->Paused){Panel(390,Height*.4f,500,170,Cream);Label(TEXT("PAUSE"),640,Height*.4f+25,29,Green,true);Button(TEXT("pause"),TEXT("WEITER"),490,Height*.4f+88,300,54,Green);return;}
 Button(TEXT("pause"),TEXT("II"),1204,163,55,43,Green);
 if(G->Cutting){Panel(22,114,300,102,Green);Label(TEXT("AM SCHNEIDEBRETT"),38,127,15,Cream);Label(TEXT("Quer über die Pizza ziehen"),38,153,21,Cream);Label(TEXT("Tippen: Stücke auswählen"),38,185,13,Cream);
  if(G->Board.IsSet()){auto Value=G->Board->Cuts.Selected(G->Board->Selection);Label(Value.Valid?TEXT("Deine Portion: ")+FString(UTF8_TO_TCHAR(PizzaRules::Format(Value).c_str())):TEXT("Gleiche Teile auswählen"),640,Height-175,24,Cream,true);}
  Button(TEXT("plate"),TEXT("AUF DEN TELLER"),850,Height-124,330,55,Green);Button(TEXT("reset"),TEXT("NEU TEILEN"),370,Height-124,220,55,Orange);
  if(P->Dragging){FVector2D A,B;P->ProjectWorldLocationToScreen(G->CutLocation()+FVector(P->DragStart.X*42,P->DragStart.Y*42,9),A);P->ProjectWorldLocationToScreen(G->CutLocation()+FVector(P->DragEnd.X*42,P->DragEnd.Y*42,9),B);DrawLine(A.X-ViewOrigin.X,A.Y-ViewOrigin.Y,B.X-ViewOrigin.X,B.Y-ViewOrigin.Y,Cream,4*Scale);}
 }else{Button(TEXT("use"),TEXT("E · BENUTZEN"),1033,Height-135,222,70,Green);Button(TEXT("dash"),TEXT("SPRINT"),900,Height-118,117,46,Orange);Button(TEXT("drop"),TEXT("ABLEGEN"),744,Height-118,142,46,Green);const int S=G->NearestStation();if(S>=0){const TCHAR* Names[]={TEXT("TEIG"),TEXT("TOMATE"),TEXT("KÄSE"),TEXT("PILZE"),TEXT("OFEN"),TEXT("SCHNEIDEN"),TEXT("SERVIEREN"),TEXT("SERVIEREN"),TEXT("SERVIEREN")};Label(FString(TEXT("E  "))+Names[S],640,Height-102,22,Cream,true);}}
 if(!G->Cutting)Button(TEXT("mode"),G->Difficulty==0?TEXT("BRÜCHE"):G->Difficulty==1?TEXT("PLUS / MINUS"):TEXT("ALLE RECHENARTEN"),25,112,205,37,Green);
}
bool APizzaHUD::Press(FVector2D Screen){auto* P=Cast<APizzaController>(PlayerOwner);auto* G=P?P->Game():nullptr;if(!G)return false;const FVector2D Point=(Screen-ViewOrigin)/Scale;for(const auto& B:Buttons)if(B.Rect.IsInside(Point)){const FString ID=B.Id.ToString();if(ID==TEXT("start"))G->Start();else if(ID==TEXT("pause"))G->TogglePause();else if(ID==TEXT("use"))G->Use();else if(ID==TEXT("dash"))G->Dash();else if(ID==TEXT("drop"))G->Drop();else if(ID==TEXT("mode"))G->CycleDifficulty();else if(ID==TEXT("plate"))G->FinishCut();else if(ID==TEXT("reset"))G->ResetCuts();else if(ID.StartsWith(TEXT("answer"))&&G->Learning){const int I=FCString::Atoi(*ID.Mid(6));if(G->LessonIndex<static_cast<int>(G->Lesson.size())&&I<static_cast<int>(G->Lesson[G->LessonIndex].Choices.size()))G->Answer(G->Lesson[G->LessonIndex].Choices[I]);}return true;}return false;}

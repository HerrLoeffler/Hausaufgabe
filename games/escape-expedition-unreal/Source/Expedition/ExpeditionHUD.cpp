#include "ExpeditionScreen.h"
#include "ExpeditionWorld.h"
#include "Kismet/GameplayStatics.h"
#include "InputCoreTypes.h"
#include "Styling/CoreStyle.h"
#include "Brushes/SlateColorBrush.h"
#include "Rendering/DrawElements.h"
#include "Widgets/SLeafWidget.h"
#include "Widgets/Layout/SBorder.h"
#include "Widgets/Layout/SBox.h"
#include "Widgets/Layout/SScrollBox.h"
#include "Widgets/Layout/SWrapBox.h"
#include "Widgets/Layout/SUniformGridPanel.h"
#include "Widgets/SBoxPanel.h"
#include "Widgets/SOverlay.h"
#include "Widgets/Input/SButton.h"
#include "Widgets/Text/STextBlock.h"

namespace {
const FLinearColor Ink(.10f,.20f,.19f), Paper(.97f,.95f,.89f), Muted(.36f,.43f,.40f), Teal(.13f,.34f,.31f), Gold(.74f,.54f,.24f);
const FSlateColorBrush PaperBrush(Paper), SoftBrush(FLinearColor(.90f,.90f,.81f)), ShadeBrush(FLinearColor(.04f,.12f,.11f,.48f));
const FSlateBrush* White() { return FCoreStyle::Get().GetBrush("WhiteBrush"); }
const FButtonStyle& ButtonStyle() {
 static const FButtonStyle Style = [] {
  FButtonStyle S = FCoreStyle::Get().GetWidgetStyle<FButtonStyle>("Button");
  S.SetNormal(FSlateColorBrush(FLinearColor(.86f,.89f,.81f)));
  S.SetHovered(FSlateColorBrush(FLinearColor(.75f,.83f,.72f)));
  S.SetPressed(FSlateColorBrush(FLinearColor(.64f,.75f,.63f)));
  S.SetDisabled(FSlateColorBrush(FLinearColor(.87f,.87f,.82f)));
  return S;
 }();
 return Style;
}
const TCHAR* Names[] = {TEXT("Muschel"),TEXT("Messschale"),TEXT("Seilrolle"),TEXT("Blatt"),TEXT("Welle"),TEXT("Sonne")};
const TCHAR* Purposes[] = {TEXT("Die Spiralform passt zur Werkstattkiste."),TEXT("Gleiche Teile lassen sich damit messen."),TEXT("Verbindet zwei tragfähige Befestigungen am Steg."),TEXT("Eine alte Symbolscheibe aus Jonas Garten."),TEXT("Eine alte Symbolscheibe aus Tildas Strandkasten."),TEXT("Eine alte Symbolscheibe aus dem Mosaikfach.")};

class SExpeditionMoveButton final : public SButton {
public:
 TWeakObjectPtr<AExpeditionGameMode> Game;
 void Construct(const SButton::FArguments& Args) { SButton::Construct(Args); }
 virtual void OnMouseCaptureLost(const FCaptureLostEvent& Event) override {
  if(auto* G=Game.Get())G->TouchInput=FVector2D::ZeroVector;
  SButton::OnMouseCaptureLost(Event);
 }
};

// Original line drawings, independent of platform emoji fonts and image assets.
class SExpeditionGlyph final : public SLeafWidget {
public:
 SLATE_BEGIN_ARGS(SExpeditionGlyph):_Item(0),_Faded(false) {} SLATE_ARGUMENT(int,Item) SLATE_ARGUMENT(bool,Faded) SLATE_END_ARGS()
 void Construct(const FArguments& A) { Item=A._Item; Faded=A._Faded; }
 virtual FVector2D ComputeDesiredSize(float) const override { return FVector2D(52,52); }
 virtual int32 OnPaint(const FPaintArgs&,const FGeometry& G,const FSlateRect&,FSlateWindowElementList& Out,int32 Layer,const FWidgetStyle&,bool Enabled) const override {
  const float U=FMath::Min(G.GetLocalSize().X,G.GetLocalSize().Y)/64.f;
  const FVector2D O=(G.GetLocalSize()-FVector2D(64*U,64*U))*.5;
  const FLinearColor C=(Faded||!Enabled)?Muted.CopyWithNewOpacity(.40f):Teal;
  auto Draw=[&](std::initializer_list<FVector2D> Points,float Width=2.5f){TArray<FVector2D> P;for(auto V:Points)P.Add(O+V*U);FSlateDrawElement::MakeLines(Out,Layer,G.ToPaintGeometry(),P,ESlateDrawEffect::None,C,true,Width*U);};
  if(Item==0) {TArray<FVector2D> P;for(int I=0;I<=64;++I){float T=I*.21f,R=2+I*.32f;P.Add(O+FVector2D(32+FMath::Cos(T)*R,31+FMath::Sin(T)*R)*U);}FSlateDrawElement::MakeLines(Out,Layer,G.ToPaintGeometry(),P,ESlateDrawEffect::None,C,true,2.6f*U);Draw({{10,44},{18,53},{35,55},{52,44}});}
  else if(Item==1) {Draw({{9,22},{55,22},{51,43},{44,52},{20,52},{13,43},{9,22}});Draw({{12,35},{52,35}},1.5f);Draw({{22,23},{22,34}},1.5f);Draw({{32,23},{32,34}},1.5f);Draw({{42,23},{42,34}},1.5f);}
  else if(Item==2) {for(int I=0;I<3;++I){TArray<FVector2D>P;for(int J=0;J<=32;++J){float T=J*2*PI/32;P.Add(O+FVector2D(29+FMath::Cos(T)*(12+I*5),29+FMath::Sin(T)*(9+I*4))*U);}FSlateDrawElement::MakeLines(Out,Layer,G.ToPaintGeometry(),P,ESlateDrawEffect::None,C,true,2.0f*U);}Draw({{48,29},{55,44},{51,54},{43,56}});}
  else if(Item==3) {Draw({{14,47},{15,29},{25,14},{51,10},{50,33},{39,47},{14,47}});Draw({{10,55},{42,22}});Draw({{22,43},{20,30}},1.5f);Draw({{30,35},{42,36}},1.5f);}
  else if(Item==4) {for(int Row=0;Row<3;++Row){TArray<FVector2D>P;for(int I=0;I<=36;++I)P.Add(O+FVector2D(8+I*1.3f,21+Row*11+FMath::Sin(I*.22f)*5)*U);FSlateDrawElement::MakeLines(Out,Layer,G.ToPaintGeometry(),P,ESlateDrawEffect::None,C,true,2.5f*U);}}
  else if(Item==5) {TArray<FVector2D>P;for(int I=0;I<=32;++I){float T=I*2*PI/32;P.Add(O+FVector2D(32+FMath::Cos(T)*12,32+FMath::Sin(T)*12)*U);}FSlateDrawElement::MakeLines(Out,Layer,G.ToPaintGeometry(),P,ESlateDrawEffect::None,C,true,2.5f*U);for(int I=0;I<8;++I){float T=I*PI/4;Draw({{32+FMath::Cos(T)*18,32+FMath::Sin(T)*18},{32+FMath::Cos(T)*26,32+FMath::Sin(T)*26}});}}
  return Layer;
 }
private: int Item=0; bool Faded=false;
};

// The authored L contour and line endpoints are visible geometry, not text clues.
class SExpeditionMosaic final : public SLeafWidget {
public:
 SLATE_BEGIN_ARGS(SExpeditionMosaic):_Target(false),_Candidate(-1),_Turn(0) {} SLATE_ARGUMENT(bool,Target) SLATE_ARGUMENT(int,Candidate) SLATE_ARGUMENT(int,Turn) SLATE_END_ARGS()
 void Construct(const FArguments& A){Target=A._Target;Candidate=A._Candidate;Turn=A._Turn;}
 virtual FVector2D ComputeDesiredSize(float)const override{return FVector2D(260,210);}
 virtual int32 OnPaint(const FPaintArgs&,const FGeometry& G,const FSlateRect&,FSlateWindowElementList& Out,int32 L,const FWidgetStyle&,bool)const override{
  FSlateDrawElement::MakeBox(Out,L,G.ToPaintGeometry(),White(),ESlateDrawEffect::None,FLinearColor(.91f,.87f,.75f));
  if(!Target&&Candidate<0)return L;
  float U=FMath::Min(G.GetLocalSize().X/4.2f,G.GetLocalSize().Y/3.6f);
  FVector2D O((G.GetLocalSize().X-3*U)*.5,(G.GetLocalSize().Y-3*U)*.5);
  auto Convert=[&](FVector2D V){if(!Target)for(int I=0;I<Turn;++I){auto D=V-FVector2D(1.5,1.5);V=FVector2D(1.5-D.Y,1.5+D.X);}return O+V*U;};
  auto Draw=[&](std::initializer_list<FVector2D> Points,FLinearColor C,float Width){TArray<FVector2D>P;for(auto V:Points)P.Add(Convert(V));FSlateDrawElement::MakeLines(Out,L+1,G.ToPaintGeometry(),P,ESlateDrawEffect::None,C,true,Width);};
  if(!Target&&Candidate==1)Draw({{0,0},{3,0},{3,1},{2,1},{2,2},{3,2},{3,3},{0,3},{0,0}},Ink,3);
  else Draw({{0,0},{3,0},{3,1},{2,1},{2,3},{0,3},{0,0}},Ink,3);
  if(Target){Draw({{-.45,2},{0,2}},Teal,5);Draw({{2,2},{2.45,2}},Teal,5);Draw({{0,1.85},{0,2.15}},Gold,4);Draw({{2,1.85},{2,2.15}},Gold,4);}
  else if(Candidate==0)Draw({{0,1},{3,1}},Teal,5);
  else Draw({{0,2},{2,2}},Teal,5);
  return L+1;
 }
private:bool Target=false;int Candidate=-1,Turn=0;
};
}

void SExpeditionScreen::Construct(const FArguments& Args){Game=Args._Game;Refresh();}
TSharedRef<SWidget> SExpeditionScreen::Text(const FString& Value,int Size,bool Quiet)const{
 return SNew(STextBlock).Text(FText::FromString(Value)).Font(FCoreStyle::GetDefaultFontStyle("Regular",Size)).ColorAndOpacity(Quiet?Muted:Ink).AutoWrapText(false).WrapTextAt_Lambda([this](){return FMath::Max(160.f,FMath::Min(840.f,GetCachedGeometry().GetLocalSize().X-112.f));});
}
FReply SExpeditionScreen::Activate(int Action){if(auto* G=Game.Get())G->Click(Action);return FReply::Handled().SetUserFocus(AsShared(),EFocusCause::SetDirectly);}
TSharedRef<SWidget> SExpeditionScreen::Button(const FString& Label,int Action,bool Selected,bool Enabled){
 return SNew(SBox).MinDesiredHeight(48)[SNew(SButton).ButtonStyle(&ButtonStyle()).ContentPadding(FMargin(14,9)).IsEnabled(Enabled).ButtonColorAndOpacity(Selected?FLinearColor(.73f,.84f,.69f):FLinearColor::White).OnClicked_Lambda([this,Action](){return Activate(Action);})[Text((Selected?TEXT("●  "):TEXT(""))+Label,18)]];
}
FReply SExpeditionScreen::OnPreviewKeyDown(const FGeometry&,const FKeyEvent& Event){
 auto* G=Game.Get();if(!G)return FReply::Unhandled();const FKey K=Event.GetKey();
 if(G->MovementKey(K,true,Event.IsRepeat()))return G->Dialog==EExpDialog::World?FReply::Handled():FReply::Unhandled();
 if(Event.IsRepeat())return FReply::Handled();
 if(K==EKeys::Escape)return Activate(G->Dialog==EExpDialog::World?6:3);
 if(K==EKeys::I)return Activate(G->Dialog==EExpDialog::Inventory?3:4);
 if(K==EKeys::E&&G->Dialog==EExpDialog::World&&G->NearId>=0)return Activate(11);
 const FKey Keys[]={EKeys::One,EKeys::Two,EKeys::Three,EKeys::Four};
 for(int I=0;I<4;++I)if(K==Keys[I]){if(G->Dialog==EExpDialog::Question&&I<G->Question().Options.Num())return Activate(100+I);if(G->Dialog==EExpDialog::Welcome&&I<2)return Activate(I+1);}
 if(K==EKeys::Enter){switch(G->Dialog){case EExpDialog::Question:return G->SelectedOption>=0?Activate(9):FReply::Handled();case EExpDialog::Speech:return Activate(8);case EExpDialog::Result:return Activate(10);case EExpDialog::Route:return Activate(310);case EExpDialog::Rope:return Activate(410);case EExpDialog::Mosaic:return Activate(511);case EExpDialog::Symbols:return Activate(611);default:break;}}
 return FReply::Unhandled();
}

FReply SExpeditionScreen::OnKeyUp(const FGeometry&,const FKeyEvent& Event){if(auto* G=Game.Get())if(G->MovementKey(Event.GetKey(),false))return FReply::Handled();return FReply::Unhandled();}

TSharedRef<SWidget> SExpeditionScreen::Inventory(bool Compact){
 auto* G=Game.Get();TSharedRef<SWrapBox> Slots=SNew(SWrapBox).UseAllottedSize(true).InnerSlotPadding(FVector2D(8,8));
 for(int I=0;I<6;++I){int Status=ExpeditionV2::ItemState(G->State,I);auto Item=SNew(SVerticalBox);
  Item->AddSlot().AutoHeight().HAlign(HAlign_Center)[SNew(SExpeditionGlyph).Item(I).Faded(Status!=1)];
  Item->AddSlot().AutoHeight().HAlign(HAlign_Center)[Text(Names[I],Compact?14:17)];
  Item->AddSlot().AutoHeight().HAlign(HAlign_Center)[Text(Status==0?TEXT("noch fehlt"):Status==2?TEXT("verwendet"):TEXT("im Rucksack"),12,true)];
  Slots->AddSlot()[SNew(SBox).WidthOverride(Compact?108:128).MinDesiredHeight(Compact?94:116)[SNew(SButton).ButtonStyle(&ButtonStyle()).ContentPadding(6).OnClicked_Lambda([this,I](){InspectItem=I;if(auto* Mode=Game.Get())Mode->UiDirty=true;return FReply::Handled().SetUserFocus(AsShared());})[Item]]];
 }
 return Slots;
}

TSharedRef<SWidget> SExpeditionScreen::Content(){
 auto* G=Game.Get();auto V=SNew(SVerticalBox);
 auto Add=[&](TSharedRef<SWidget> W,int Pad=8){V->AddSlot().AutoHeight().Padding(0,Pad)[W];};
 auto Title=[&](const FString& S){Add(Text(S,26),4);if(!G->Feedback.IsEmpty())Add(SNew(SBorder).BorderImage(&SoftBrush).Padding(12)[Text(G->Feedback,18)]);};
 auto Pair=[&](TSharedRef<SWidget>A,TSharedRef<SWidget>B){return SNew(SHorizontalBox)+SHorizontalBox::Slot().FillWidth(1).Padding(0,0,6,0)[A]+SHorizontalBox::Slot().FillWidth(1).Padding(6,0,0,0)[B];};
 switch(G->Dialog){
 case EExpDialog::Welcome:
  Add(Text(TEXT("EXPEDITION · MATHE-DEMO"),14,true));Title(TEXT("Das verschwundene Leuchtfeuer"));
  Add(Text(TEXT("Das Küstenfeuer ist erloschen. Hilf Mara im Dorf, entdecke Jonas Garten und repariere mit Tilda den Steg. In der Ruine warten die drei alten Zeichen."),21));
  Add(Text(TEXT("Etwa 10 Minuten · 7 Lernaufgaben · 5 Beobachtungs- und Logikrätsel. Lokale Beispieldaten."),16,true));
  Add(Pair(Button(TEXT("Neue Expedition starten"),1),Button(TEXT("Spielstand fortsetzen"),2)));Add(Button(TEXT("Lehrkraft · Fragen ansehen"),5));break;
 case EExpDialog::Speech:
  Title(G->Speaker.IsEmpty()?TEXT("Gespräch"):G->Speaker);Add(Text(G->DialogueText,21));Add(Button(TEXT("Weiter"),8));break;
 case EExpDialog::Question:{
  auto Q=G->Question();Title(Q.Speaker.IsEmpty()?G->Speaker:Q.Speaker);
  Add(Text(FString::Printf(TEXT("Lernstation %d / 7 · %s"),G->CurrentSchool+1,G->CurrentSchool>=0&&G->CurrentSchool<7&&G->State.pending[G->CurrentSchool]?TEXT("Neue Anwendung"):TEXT("Wähle eine Antwort")),14,true));
  Add(Text(Q.Prompt,22));auto Answers=SNew(SUniformGridPanel).SlotPadding(FMargin(4));for(int I=0;I<Q.Options.Num();++I)Answers->AddSlot(I%2,I/2)[Button(FString::Printf(TEXT("%d.  %s"),I+1,*Q.Options[I]),100+I,G->SelectedOption==I)];Add(Answers,3);
  Add(Pair(Button(TEXT("Prüfen · Enter"),9,false,G->SelectedOption>=0),Button(TEXT("Hinweis"),7)));break;}
 case EExpDialog::Result:Title(TEXT("Deine Lernnotiz"));Add(Text(G->DialogueText,21));Add(Button(TEXT("Weiter"),10));break;
 case EExpDialog::Shell:{
  Title(TEXT("Die Werkstattkiste"));Add(Text(TEXT("Die Kiste trägt eine Spiralform. Welches Fundstück möchtest du an der Öffnung ausprobieren?"),20));
  auto Items=SNew(SWrapBox).UseAllottedSize(true).InnerSlotPadding(FVector2D(8,8));for(int I=0;I<6;++I)Items->AddSlot()[SNew(SBox).WidthOverride(190)[Button(Names[I],200+I,false,ExpeditionV2::ItemState(G->State,I)==1)]];Add(Items);Add(Text(TEXT("Ein falscher Versuch verbraucht keinen Gegenstand."),15,true));break;}
 case EExpDialog::Route:{
  Title(TEXT("Jonas verlorene Tasche"));Add(Text(TEXT("Die Tasche liegt dort, wo Holz über fließendem Wasser liegt. Vergleiche Material und Wasser an jedem Ort."),20));
  const TCHAR* Routes[]={TEXT("Holzbank · stiller Teich"),TEXT("Steinbogen · fließender Bach"),TEXT("Holzbrücke · fließender Bach")};for(int I=0;I<3;++I)Add(Button(Routes[I],300+I,G->RoutePreview==I),3);
  Add(Text(G->RoutePreview<0?TEXT("Wähle zuerst einen Ort für die Vorschau."):FString(TEXT("Vorschau: "))+Routes[G->RoutePreview],16,true));Add(Button(TEXT("Diesen Ort untersuchen"),310,false,G->RoutePreview>=0));break;}
 case EExpDialog::Rope:{
  Title(TEXT("Den Steg sichern"));Add(Text(TEXT("Wähle zwei Befestigungen. Der Steinring sitzt im Fels, der Holzpfosten ist rissig, der Metallring sitzt am intakten Stegträger."),20));
  const TCHAR* Anchors[]={TEXT("Steinring"),TEXT("Morscher Holzpfosten"),TEXT("Metallring")};FString Selected;
  for(int I=0;I<3;++I){bool On=(G->State.anchors&(1<<I))!=0;Add(Button(Anchors[I],400+I,On),3);if(On){if(!Selected.IsEmpty())Selected+=TEXT(" + ");Selected+=Anchors[I];}}
  Add(Text(Selected.IsEmpty()?TEXT("Seilvorschau: noch keine Befestigung."):TEXT("Seilvorschau: ")+Selected,17,true));Add(Button(TEXT("Seil spannen"),410));Add(Text(TEXT("Tippe eine gewählte Befestigung erneut an, um sie zurückzunehmen."),14,true));break;}
 case EExpDialog::Mosaic:{
  Title(TEXT("Das fehlende Mosaikstück"));Add(Text(TEXT("Kontur und Wellenlinie müssen zusammenpassen. Wähle ein Fragment, drehe die Vorschau und setze es erst dann ein."),19));
  auto Pieces=SNew(SHorizontalBox);for(int I=0;I<3;++I)Pieces->AddSlot().FillWidth(1).Padding(3)[Button(FString::Printf(TEXT("Fragment %c"),'A'+I),500+I,G->State.mosaic==I)];Add(Pieces);
  auto Left=SNew(SVerticalBox);Left->AddSlot().AutoHeight()[Text(TEXT("Lücke · die Linie trifft beide Kanten"),15,true)];Left->AddSlot().AutoHeight()[SNew(SExpeditionMosaic).Target(true)];
  auto Right=SNew(SVerticalBox);Right->AddSlot().AutoHeight()[Text(G->State.mosaic<0?TEXT("Wähle ein Fragment"):FString::Printf(TEXT("Fragment %c · %d°"),'A'+G->State.mosaic,G->State.turn*90),15,true)];Right->AddSlot().AutoHeight()[SNew(SExpeditionMosaic).Candidate(G->State.mosaic).Turn(G->State.turn)];
  Add(Pair(Left,Right));Add(Pair(Button(TEXT("90° drehen"),510,false,G->State.mosaic>=0),Button(TEXT("Fragment einsetzen"),511,false,G->State.mosaic>=0)));break;}
 case EExpDialog::Symbols:{
  Title(TEXT("Die drei alten Zeichen"));Add(Text(TEXT("Das Blatt kommt vor der Welle. Die Sonne folgt direkt auf die Welle."),21));
  auto Places=SNew(SHorizontalBox);for(int I=0;I<3;++I){int Symbol=G->State.symbols[I];auto Slot=SNew(SVerticalBox);Slot->AddSlot().AutoHeight().HAlign(HAlign_Center)[Text(FString::Printf(TEXT("Platz %d"),I+1),15,true)];if(Symbol>=0)Slot->AddSlot().AutoHeight().HAlign(HAlign_Center)[SNew(SExpeditionGlyph).Item(Symbol+3)];Slot->AddSlot().AutoHeight().HAlign(HAlign_Center)[Text(Symbol<0?TEXT("leer"):Names[Symbol+3],18)];Places->AddSlot().FillWidth(1).Padding(6)[SNew(SBorder).BorderImage(&SoftBrush).Padding(10)[Slot]];}Add(Places);
  auto Symbols=SNew(SHorizontalBox);for(int I=0;I<3;++I){bool Set=false;for(int S:G->State.symbols)Set|=S==I;Symbols->AddSlot().FillWidth(1).Padding(3)[Button(Names[I+3],600+I,Set)];}Add(Symbols);
  Add(Text(TEXT("Wähle eine Scheibe für den nächsten freien Platz. Erneutes Antippen nimmt sie zurück."),15,true));Add(Pair(Button(TEXT("Plätze leeren"),610),Button(TEXT("Reihenfolge prüfen"),611)));break;}
 case EExpDialog::Inventory:
  Title(TEXT("Rucksack & Logbuch"));Add(Inventory(false));if(InspectItem>=0){Add(Text(FString(Names[InspectItem])+TEXT(" · ")+Purposes[InspectItem],18));}
  Add(Text(TEXT("Dein nächster Schritt: ")+G->Mission(),20));
  if(ExpeditionV2::HasSchool(G->State,2))Add(Text(TEXT("Jonas Notiz: Holz über fließendem Wasser."),17,true));
  if(ExpeditionV2::HasLogic(G->State,3))Add(Text(TEXT("Ruinenmosaik: Das Blatt kommt vor der Welle. Die Sonne folgt direkt auf die Welle."),17,true));Add(Button(TEXT("Zurück zum Abenteuer"),3));break;
 case EExpDialog::Teacher:
  Title(TEXT("Lehrkraft · tatsächliche Fragen"));Add(Text(TEXT("Lokale Mathe-Demo · Diese sieben Fragen werden in dieser Expedition verwendet. Lösungen und Erklärungen sind nur in dieser Vorschau sichtbar."),17,true));
  for(int I=0;I<7;++I){auto Q=G->QuestionFor(I,false);auto Row=SNew(SVerticalBox);Row->AddSlot().AutoHeight().Padding(0,3)[Text(FString::Printf(TEXT("%d. %s"),I+1,*Q.Prompt),20)];for(int J=0;J<Q.Options.Num();++J)Row->AddSlot().AutoHeight().Padding(0,2)[Text(FString::Printf(TEXT("%c · %s"),'A'+J,*Q.Options[J]),17,true)];if(Q.Options.IsValidIndex(Q.Correct))Row->AddSlot().AutoHeight().Padding(0,7)[Text(TEXT("Lösung: ")+Q.Options[Q.Correct]+TEXT(". ")+Q.Explanation,17)];Row->AddSlot().AutoHeight()[Text(TEXT("Hinweis: ")+Q.Hint,16,true)];Add(SNew(SBorder).BorderImage(&SoftBrush).Padding(14)[Row]);}Add(Button(TEXT("Vorschau schließen"),3));break;
 case EExpDialog::Pause:
  Title(TEXT("Expedition pausiert"));Add(Text(TEXT("Die Welt wartet auf dich. Dein Fortschritt wird nach bestätigten Lern- und Rätselschritten lokal gespeichert."),20));Add(Button(TEXT("Fortsetzen"),3));Add(Button(TEXT("Spielstand laden"),2));Add(Button(TEXT("Lehrkraft · Fragen ansehen"),5));
  Add(SNew(SBox).MinDesiredHeight(48)[SNew(SButton).ButtonStyle(&ButtonStyle()).ContentPadding(12).OnClicked_Lambda([this](){ConfirmRestart=!ConfirmRestart;if(auto* Mode=Game.Get())Mode->UiDirty=true;return FReply::Handled().SetUserFocus(AsShared());})[Text(ConfirmRestart?TEXT("Neustart abbrechen"):TEXT("Neue Expedition …"))]]);
  if(ConfirmRestart){Add(Text(TEXT("Eine neue Expedition ersetzt diesen lokalen Spielstand. Möchtest du wirklich neu beginnen?"),18));Add(Button(TEXT("Spielstand ersetzen und neu starten"),1));}break;
 case EExpDialog::Finale:{
  if(!G->State.finale){Title(TEXT("Das Leuchtfeuer ist bereit"));Add(Text(G->DialogueText,22));Add(Button(TEXT("Leuchtfeuer entzünden"),620));Add(Button(TEXT("Noch einmal umsehen"),3));break;}
  Title(TEXT("Das Leuchtfeuer brennt!"));Add(Text(TEXT("Du hast gerechnet, genau hingesehen und den Weg selbst wieder geöffnet. Die Küste hat ihr Licht zurück."),22));int Seconds=FMath::Max(0,FMath::RoundToInt(G->ActiveTime));Add(Text(FString::Printf(TEXT("Aktive Spielzeit %d:%02d · %d / 7 Lernstationen · %d / 12 Stationen"),Seconds/60,Seconds%60,G->SchoolSolved(),G->Solved()),18,true));Add(Button(TEXT("Die Welt weiter erkunden"),3));Add(Button(TEXT("Lernfragen ansehen"),5));Add(Text(TEXT("Hilfen unterstützen das Lernen. Diese lokale Demo vergibt keine Schulnote."),15,true));break;}
 default:break;
 }
 if(G->Dialog!=EExpDialog::Welcome&&G->Dialog!=EExpDialog::Pause&&G->Dialog!=EExpDialog::Inventory&&G->Dialog!=EExpDialog::Teacher&&G->Dialog!=EExpDialog::Finale)Add(Button(TEXT("Zurück · Esc"),3));
 return V;
}

void SExpeditionScreen::Refresh(){
 auto* G=Game.Get();if(!G)return;
 auto Root=SNew(SOverlay).Visibility(EVisibility::SelfHitTestInvisible);
 auto Header=SNew(SHorizontalBox);Header->AddSlot().FillWidth(1)[SNew(SVerticalBox)+SVerticalBox::Slot().AutoHeight()[SNew(STextBlock).Text_Lambda([this](){return FText::FromString(Game.IsValid()?Game->AreaName():FString());}).Font(FCoreStyle::GetDefaultFontStyle("Regular",14)).ColorAndOpacity(Muted).AutoWrapText(true)]+SVerticalBox::Slot().AutoHeight().Padding(0,3)[SNew(STextBlock).Text_Lambda([this](){return FText::FromString(Game.IsValid()?Game->Mission():FString());}).Font(FCoreStyle::GetDefaultFontStyle("Regular",20)).ColorAndOpacity(Ink).AutoWrapText(false).WrapTextAt(480.f)]];
 Header->AddSlot().AutoWidth().VAlign(VAlign_Center).Padding(14,0,0,0)[Text(TEXT("Lokale Mathe-Demo"),13,true)];
 if(G->Dialog==EExpDialog::World)Root->AddSlot().HAlign(HAlign_Left).VAlign(VAlign_Top).Padding(20)[SNew(SBox).MaxDesiredWidth(740)[SNew(SBorder).BorderImage(&PaperBrush).Padding(14)[Header]]];
 if(G->Dialog==EExpDialog::World){
  auto Actions=SNew(SVerticalBox);Actions->AddSlot().AutoHeight().Padding(0,3)[Button(TEXT("Rucksack · I"),4)];Actions->AddSlot().AutoHeight().Padding(0,3)[Button(TEXT("Menü · Esc"),6)];
  Root->AddSlot().HAlign(HAlign_Right).VAlign(VAlign_Bottom).Padding(18)[Actions];
  Root->AddSlot().HAlign(HAlign_Right).VAlign(VAlign_Bottom).Padding(18,0,18,136)[SNew(SBox).MaxDesiredWidth(410).MinDesiredHeight(48).Visibility_Lambda([this](){return Game.IsValid()&&Game->NearId>=0?EVisibility::Visible:EVisibility::Collapsed;})[SNew(SButton).ButtonStyle(&ButtonStyle()).ContentPadding(FMargin(14,9)).OnClicked_Lambda([this](){return Activate(11);})[SNew(STextBlock).Text_Lambda([this](){return FText::FromString(Game.IsValid()?TEXT("E · ")+Game->NearLabel:FString());}).Font(FCoreStyle::GetDefaultFontStyle("Regular",18)).ColorAndOpacity(Ink).AutoWrapText(true)]]];
  auto Direction=[this](const FString& Label,FVector2D Input)->TSharedRef<SWidget>{
   const auto Weak=Game;
   auto Move=SNew(SExpeditionMoveButton).ButtonStyle(&ButtonStyle()).IsFocusable(false).ContentPadding(4)
    .OnPressed_Lambda([Weak,Input](){if(auto* Mode=Weak.Get())if(Mode->Dialog==EExpDialog::World)Mode->TouchInput=Input;})
    .OnReleased_Lambda([Weak](){if(auto* Mode=Weak.Get())Mode->TouchInput=FVector2D::ZeroVector;})
    [Text(Label,24)];
   Move->Game=Weak;
   return SNew(SBox).WidthOverride(48).HeightOverride(48)[Move];
  };
  auto Pad=SNew(SVerticalBox);
  Pad->AddSlot().AutoHeight().HAlign(HAlign_Center).Padding(0,0,0,4)[Direction(TEXT("↑"),FVector2D(0,1))];
  Pad->AddSlot().AutoHeight()[SNew(SHorizontalBox)+SHorizontalBox::Slot().AutoWidth()[Direction(TEXT("←"),FVector2D(-1,0))]+SHorizontalBox::Slot().AutoWidth().Padding(4,0)[Direction(TEXT("↓"),FVector2D(0,-1))]+SHorizontalBox::Slot().AutoWidth()[Direction(TEXT("→"),FVector2D(1,0))]];
  Root->AddSlot().HAlign(HAlign_Left).VAlign(VAlign_Bottom).Padding(20)[SNew(SBorder).BorderImage(&PaperBrush).Padding(8)[Pad]];
  Root->AddSlot().HAlign(HAlign_Left).VAlign(VAlign_Bottom).Padding(20,0,20,140)[SNew(SBorder).BorderImage(&PaperBrush).Padding(8)[Text(TEXT("WASD / Pfeile · E untersuchen"),14,true)]];
 }else{
  const bool Puzzle=G->Dialog==EExpDialog::Mosaic||G->Dialog==EExpDialog::Rope||G->Dialog==EExpDialog::Route||G->Dialog==EExpDialog::Symbols;
  const bool Full=G->Dialog==EExpDialog::Welcome||G->Dialog==EExpDialog::Teacher||G->Dialog==EExpDialog::Pause||G->Dialog==EExpDialog::Finale;
  if(Full)Root->AddSlot()[SNew(SBorder).BorderImage(&ShadeBrush)];
  auto Panel=SNew(SBox)
   .WidthOverride_Lambda([this](){return FOptionalSize(FMath::Clamp(GetCachedGeometry().GetLocalSize().X-48.f,240.f,920.f));})
   .MaxDesiredHeight_Lambda([this,Full,Puzzle](){return FOptionalSize(FMath::Max(100.f,FMath::Min(Full?680.f:Puzzle?650.f:510.f,GetCachedGeometry().GetLocalSize().Y-(Full?48.f:120.f))));})
   [SNew(SBorder).BorderImage(&PaperBrush).Padding(22)[SNew(SScrollBox)+SScrollBox::Slot()[Content()]]];
  Root->AddSlot().HAlign(HAlign_Center).VAlign(Full?VAlign_Center:VAlign_Bottom).Padding(24,Full?24:100,24,20)[Panel];
 }
 if(G->Dialog==EExpDialog::World&&!G->Toast.IsEmpty())Root->AddSlot().HAlign(HAlign_Center).VAlign(VAlign_Top).Padding(20,116,20,0)[SNew(SBox).MaxDesiredWidth(720).Visibility_Lambda([this](){return Game.IsValid()&&Game->ToastTimer>0?EVisibility::Visible:EVisibility::Collapsed;})[SNew(SBorder).BorderImage(&PaperBrush).Padding(12)[SNew(STextBlock).Text(FText::FromString(G->Toast)).Font(FCoreStyle::GetDefaultFontStyle("Regular",17)).ColorAndOpacity(Ink).AutoWrapText(false).WrapTextAt(660.f)]]];
 ChildSlot[Root];
}

void AExpeditionGameMode::RebuildUI(){
 if(auto* Controller=Cast<AExpeditionController>(UGameplayStatics::GetPlayerController(this,0)))if(Controller->Screen.IsValid())Controller->Screen->Refresh();
 UiDirty=false;
}

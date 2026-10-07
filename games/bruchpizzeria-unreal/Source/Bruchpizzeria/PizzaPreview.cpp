#if WITH_EDITOR
#include "Misc/AutomationTest.h"
#include "Tests/AutomationEditorCommon.h"
#include "Editor.h"
#include "PizzaKitchen.h"
#include "Engine/World.h"
#include "UnrealClient.h"
#include "Misc/Paths.h"
class FStartVisualKitchen final:public IAutomationLatentCommand {
 double Start=FPlatformTime::Seconds();bool Started=false;int Phase=0;bool PaidPrepared=false,ShiftPrepared=false,DeliveryPrepared=false,WashPrepared=false,WastePrepared=false;FAutomationTestBase* Test;
 public:explicit FStartVisualKitchen(FAutomationTestBase* T):Test(T){}bool Update()override{
  UWorld* W=GEditor?GEditor->PlayWorld:nullptr;auto* G=W?Cast<APizzaGameMode>(W->GetAuthGameMode()):nullptr;
  if(!G||!G->Camera){if(FPlatformTime::Seconds()-Start<30)return false;Test->AddError(TEXT("Native preview did not start"));return true;}
  if(!Started){G->LevelNumber=6;G->Start();Started=true;Start=FPlatformTime::Seconds();}
  if(Phase==1&&!G->Board.IsSet()){G->Board=FKitchenPizza();G->Board->HasPlate=true;G->Board->Baked=true;G->Board->Ingredients=7;for(float A:{0.f,45.f,90.f,135.f})G->Board->Cuts.AddDiameter(A);G->Board->Selection=15;G->BeginCut();G->RefreshPizza();}
  if(Phase==2&&!G->Learning){G->Carry=G->Board;G->Carry->Selection=15;G->Carry->Plated=true;G->Orders[0].Amount=PizzaRules::Rational(3,8);G->Orders[0].Ingredients=7;G->Board.Reset();G->Cutting=false;G->TryServe(0);G->RefreshPizza();}
  if(Phase==3&&!G->Cutting){G->Start();G->Board=FKitchenPizza();G->Board->HasPlate=true;G->Board->Baked=true;G->Board->Ingredients=3;G->BeginCut();G->CutStroke(FVector2D(-1,.8),FVector2D(1,.8));}
  if(Phase==4&&G->LevelNumber!=3){G->LevelNumber=3;G->Start();}
  if(Phase==5&&G->LevelNumber!=10){G->LevelNumber=10;G->Start();}
  if(Phase==6&&G->LevelNumber!=1){G->LevelNumber=1;G->Start();G->Carry=FKitchenPizza();G->Carry->HasPlate=true;G->Carry->Ingredients=1;G->TryServe(0);G->RefreshPizza();}
  if(Phase==7&&!PaidPrepared){G->Start();G->Carry=FKitchenPizza();G->Carry->HasPlate=true;G->Carry->Ingredients=3;G->Carry->Baked=true;G->Carry->Plated=true;G->Carry->Cuts.AddDiameter(0);G->Carry->Selection=1;G->TryServe(0);PaidPrepared=true;}

  if(Phase==8&&!ShiftPrepared){G->Start();for(int I=0;I<3;++I){if(!G->Orders.Num())break;G->Carry=FKitchenPizza();G->Carry->HasPlate=true;G->Carry->Ingredients=3;G->Carry->Baked=true;G->Carry->Plated=true;G->Carry->Cuts.AddDiameter(0);G->Carry->Selection=G->Orders[0].Amount.Num==G->Orders[0].Amount.Den?3:1;G->TryServe(0);if(!G->Finished)G->Tick(3.1);}ShiftPrepared=true;}
  if(Phase==9&&!DeliveryPrepared){G->LevelNumber=2;G->Start();G->Carry=FKitchenPizza();G->Carry->HasPlate=true;G->Carry->Baked=true;G->Carry->Ingredients=3;G->Carry->Plated=true;G->Carry->Cuts.AddDiameter(0);G->Carry->Selection=1;G->TryServe(0);DeliveryPrepared=true;}
  if(Phase==10&&G->LevelNumber!=7){G->LevelNumber=7;G->Start();G->Carry=FKitchenPizza();G->Carry->HasPlate=true;G->Carry->Baked=true;G->Carry->Ingredients=3;G->Carry->Plated=true;for(float A:{0.f,45.f,90.f,135.f})G->Carry->Cuts.AddDiameter(A);G->Carry->Selection=3;G->TryServe(0);G->Tick(3.1);}
  if(Phase==11&&!WashPrepared){G->UseGuest(0);G->UseSink();WashPrepared=true;}
  if(Phase==12&&!WastePrepared){G->LevelNumber=1;G->Start();G->Cash=1000;G->Carry=FKitchenPizza();G->Carry->Baked=true;G->Carry->Ingredients=3;G->Chef()->SetActorLocation(G->StationLocation(15)+FVector(0,100,77));G->UseTrash();WastePrepared=true;}
  if(Phase==13&&!G->Intro){G->LevelNumber=7;G->Start();G->ReturnToMenu();}
  if(FPlatformTime::Seconds()-Start<((Phase==7||Phase==9||Phase==11)?.3:3))return false;
  const TCHAR* Names[]={TEXT("Reports/NativeKitchen.png"),TEXT("Reports/NativeCutting.png"),TEXT("Reports/NativeLearning.png"),TEXT("Reports/NativeUnequal.png"),TEXT("Reports/NativeLevel3.png"),TEXT("Reports/NativeLevel10.png"),TEXT("Reports/NativeGuestReview.png"),TEXT("Reports/NativePaidBill.png"),TEXT("Reports/NativeShiftBill.png"),TEXT("Reports/NativeDeliveredPlate.png"),TEXT("Reports/NativeDirtyPlate.png"),TEXT("Reports/NativeWashing.png"),TEXT("Reports/NativeWaste.png"),TEXT("Reports/NativePlateIntro.png")};
  FScreenshotRequest::RequestScreenshot(FPaths::ProjectDir()/Names[Phase],false,false);
  if(Phase<13){++Phase;Start=FPlatformTime::Seconds();return false;}
  UE_LOG(LogTemp,Display,TEXT("PIZZA_VISUAL_PREVIEW: native kitchen, cutting and learning screenshots requested; not device or quality acceptance"));
  return true;
 }
};
IMPLEMENT_SIMPLE_AUTOMATION_TEST(FPizzaPreview,"GradeCrew.NativeKitchen.VisualPreview",EAutomationTestFlags::EditorContext|EAutomationTestFlags::EngineFilter)
bool FPizzaPreview::RunTest(const FString&){ADD_LATENT_AUTOMATION_COMMAND(FEditorLoadMap(TEXT("/Game/Maps/Pizzeria")));ADD_LATENT_AUTOMATION_COMMAND(FStartPIECommand(false));ADD_LATENT_AUTOMATION_COMMAND(FStartVisualKitchen(this));ADD_LATENT_AUTOMATION_COMMAND(FEndPlayMapCommand());return true;}
#endif

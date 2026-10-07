#if WITH_EDITOR
#include "Misc/AutomationTest.h"
#include "Tests/AutomationEditorCommon.h"
#include "Editor.h"
#include "PizzaKitchen.h"
#include "PizzaHUD.h"
#include "Engine/World.h"
#include "Kismet/GameplayStatics.h"
class FCheckBilling final:public IAutomationLatentCommand {
 FAutomationTestBase* Test;double Started=FPlatformTime::Seconds();int Stage=0;
 public:explicit FCheckBilling(FAutomationTestBase* T):Test(T){}
 bool Update()override{
  UWorld* W=GEditor?GEditor->PlayWorld:nullptr;auto* G=W?Cast<APizzaGameMode>(W->GetAuthGameMode()):nullptr;auto* P=W?Cast<APizzaController>(UGameplayStatics::GetPlayerController(W,0)):nullptr;auto* H=P?Cast<APizzaHUD>(P->GetHUD()):nullptr;
  if(!G||!G->Chef()||!H){if(FPlatformTime::Seconds()-Started<25)return false;Test->AddError(TEXT("Billing kitchen did not start"));return true;}
  if(Stage==0){
   G->LevelNumber=1;G->Start();const int Cash=G->Cash;
   Test->TestEqual(TEXT("First-level order cannot require mushrooms"),G->Orders[0].Ingredients,3);
   G->Orders[0].Age=20;G->Carry=FKitchenPizza();G->Carry->HasPlate=true;G->Carry->Ingredients=3;G->Carry->Cuts.AddDiameter(0);G->Carry->Plated=true;G->Carry->Selection=1;G->TryServe(0);
   Test->TestTrue(TEXT("Raw delivery creates real itemized unpaid bill and retains plate"),G->BillVisible&&G->LastBill.Subtotal==550&&G->LastBill.Paid==0&&G->LastBill.Tip==0&&G->Carry.IsSet()&&G->Learning);Test->TestEqual(TEXT("Rejected delivery adds no cash"),G->Cash,Cash);Test->TestEqual(TEXT("Rejected delivery adds no shift revenue"),G->ShiftSales,0);
   G->ConfirmRepair();G->UseOven(0);Test->TestTrue(TEXT("Previously rejected portion goes back in oven"),G->Oven.IsSet());if(G->Oven.IsSet()){G->Tick(5.1);G->UseOven(0);}G->TryServe(0);
   Test->TestTrue(TEXT("Real cooking and re-delivery pays price plus tip once"),G->Cash==Cash+660&&G->ShiftSales==550&&G->ShiftTips==110&&G->LastBill.Paid==660&&G->Served==1&&!G->Carry.IsSet());G->TryServe(0);Test->TestEqual(TEXT("Repeated handover without dish cannot duplicate cash"),G->Cash,Cash+660);
   G->Start();Test->TestTrue(TEXT("Starting new shift retains saved wallet and resets only shift totals"),G->Cash==Cash+660&&G->ShiftSales==0&&G->ShiftTips==0);
   G->Orders[0].Age=40;G->Paused=true;G->Tick(5);Test->TestEqual(TEXT("Pause does not consume service bonus time"),G->Orders[0].Age,40.f);G->Paused=false;
   G->Carry=FKitchenPizza();G->Carry->HasPlate=true;G->Carry->Ingredients=3;G->Carry->Baked=true;G->Carry->Plated=true;G->Carry->Cuts.AddDiameter(0);G->Carry->Selection=1;G->TryServe(0);Test->TestEqual(TEXT("Medium actual guest age pays ten percent tip"),G->LastBill.Tip,55);
   G->Start();G->Carry=FKitchenPizza();G->Carry->HasPlate=true;G->Carry->Ingredients=3;G->Carry->Baked=true;G->TryServe(0);Test->TestTrue(TEXT("Whole instead of half is an unpaid customer mistake, no pre-serve gate"),G->Learning&&G->BillPortion.Valid&&G->BillPortion.Num==1&&G->LastBill.Paid==0);G->Tick(10);Test->TestEqual(TEXT("Fraction help freezes bonus clock"),G->Orders[0].Age,0.f);G->ConfirmRepair();const auto BoardPos=G->StationLocation(5);G->Chef()->SetActorLocation(BoardPos+FVector(0,-110,77));G->Use();if(G->Board.IsSet()){G->Board->Cuts.AddDiameter(0);G->Board->Selection=1;}G->FinishCut();
   G->TryServe(0);Test->TestTrue(TEXT("Help alone earns nothing; real corrected delivery earns cash"),G->Served==1&&G->LastBill.Paid==660);
   G->Start();G->Board=FKitchenPizza();G->Board->HasPlate=true;G->Board->Baked=true;G->Board->Ingredients=3;G->Cutting=true;G->CutStroke(FVector2D(-1,.8),FVector2D(1,.8));G->Board->Selection=1;G->FinishCut();Test->TestTrue(TEXT("Unequal baked selected piece is transportable"),G->Carry.IsSet()&&!G->Carry->Portion().Valid);G->TryServe(0);Test->TestTrue(TEXT("Unequal delivery starts truthful new-cut repair with no invented price"),G->Learning&&G->RepairNeedsNewCuts&&!G->LastBill.Valid&&G->LastBill.Paid==0);G->ConfirmRepair();
   G->Start();G->Orders[0].Age=80;G->Carry=FKitchenPizza();G->Carry->HasPlate=true;G->Carry->Baked=true;G->Carry->Ingredients=3;G->Carry->Plated=true;G->Carry->Cuts.AddDiameter(0);G->Carry->Selection=1;G->TryServe(0);Test->TestTrue(TEXT("Slow correct delivery receives base price without tip"),G->LastBill.Paid==550&&G->LastBill.Tip==0);
   Stage=1;Started=FPlatformTime::Seconds();return false;
  }
  const auto* Close=H->Buttons.FindByPredicate([](const FKitchenButton& B){return B.Id==TEXT("billclose");});if(!Close){if(FPlatformTime::Seconds()-Started<15)return false;Test->AddError(TEXT("Actual receipt never rendered its dismiss button"));return true;}
  P->Press(Close->Rect.GetCenter()*H->Scale+H->ViewOrigin,-2);Test->TestFalse(TEXT("Rendered receipt closes using actual view coordinates"),G->BillVisible);return true;
 }
};
IMPLEMENT_SIMPLE_AUTOMATION_TEST(FPizzaBillingFlow,"GradeCrew.NativeKitchen.Billing",EAutomationTestFlags::EditorContext|EAutomationTestFlags::EngineFilter)
bool FPizzaBillingFlow::RunTest(const FString&){ADD_LATENT_AUTOMATION_COMMAND(FEditorLoadMap(TEXT("/Game/Maps/Pizzeria")));ADD_LATENT_AUTOMATION_COMMAND(FStartPIECommand(false));ADD_LATENT_AUTOMATION_COMMAND(FCheckBilling(this));ADD_LATENT_AUTOMATION_COMMAND(FEndPlayMapCommand());return true;}
#endif

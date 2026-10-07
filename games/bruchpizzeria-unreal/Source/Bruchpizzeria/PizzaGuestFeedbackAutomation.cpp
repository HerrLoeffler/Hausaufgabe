#if WITH_EDITOR
#include "Misc/AutomationTest.h"
#include "Tests/AutomationEditorCommon.h"
#include "Editor.h"
#include "PizzaKitchen.h"
#include "PizzaHUD.h"
#include "Engine/World.h"
#include "Kismet/GameplayStatics.h"
class FCheckGuestFeedback final:public IAutomationLatentCommand {
 FAutomationTestBase* Test;double Started=FPlatformTime::Seconds();int Stage=0,Cash=0;uint32 Selection=0;
 public:explicit FCheckGuestFeedback(FAutomationTestBase* T):Test(T){}
 bool Update()override{
  UWorld* W=GEditor?GEditor->PlayWorld:nullptr;auto* P=W?Cast<APizzaController>(UGameplayStatics::GetPlayerController(W,0)):nullptr;auto* G=P?P->Game():nullptr;auto* H=P?Cast<APizzaHUD>(P->GetHUD()):nullptr;
  if(!G||!H||!G->Chef()){if(FPlatformTime::Seconds()-Started<25)return false;Test->AddError(TEXT("Guest feedback kitchen did not start"));return true;}
  auto Find=[H](FName Id){return H->Buttons.FindByPredicate([Id](const FKitchenButton& B){return B.Id==Id;});};auto Click=[H,P](const FKitchenButton* B){if(B)P->Press(B->Rect.GetCenter()*H->Scale+H->ViewOrigin,-2);};
  auto Wrong=[G](){G->Carry=FKitchenPizza();G->Carry->HasPlate=true;G->Carry->Ingredients=3;G->Carry->Baked=true;G->Carry->Plated=true;for(float A:{0.f,45.f,90.f,135.f})G->Carry->Cuts.AddDiameter(A);G->Carry->Selection=1;G->TryServe(0);};
  if(Stage==0){
   G->LevelNumber=1;G->Start();auto* Arena=UGameplayStatics::GetActorOfClass(W,APizzaArena::StaticClass());bool MenuSlate=false;if(Arena)for(auto* C:Arena->GetInstanceComponents())MenuSlate|=C&&C->GetName().StartsWith(TEXT("MenuSlate"));Test->TestFalse(TEXT("No decorative recipe boards above oven stations"),MenuSlate);
   Wrong();Selection=G->Carry->Selection;G->ShowRepairStep();P->Use();Test->TestTrue(TEXT("Understood returns to kitchen with exactly the same wrong pizza"),!G->Learning&&G->Carry.IsSet()&&G->Carry->Selection==Selection&&G->Carry->Cuts.Count()==8&&G->Carry->Ingredients==3&&G->Carry->Baked);Test->TestEqual(TEXT("Understanding does not grant delivery progress"),G->Served,0);
   G->Start();G->Carry=FKitchenPizza();G->Carry->HasPlate=true;G->TryServe(0);Test->TestTrue(TEXT("Raw and topping mistakes also offer the customer choice"),G->Learning&&G->Carry.IsSet());P->Use();
   G->Start();G->Carry=FKitchenPizza();G->Carry->HasPlate=true;G->Carry->Baked=true;G->Carry->Ingredients=3;G->Carry->Plated=true;G->Carry->Cuts.AddDiameter(0);G->Carry->Selection=1;G->TryServe(0);Test->TestTrue(TEXT("Paid receipt appears without blocking cooking"),G->BillVisible&&!G->Frozen());G->Tick(.6);G->TogglePause();G->Tick(3);Test->TestTrue(TEXT("Menu pause preserves remaining receipt view time"),G->BillVisible);G->TogglePause();G->Tick(.9);Test->TestTrue(TEXT("Receipt is visible for its first two active seconds"),G->BillVisible);G->Tick(.6);Test->TestFalse(TEXT("Receipt automatically disappears after two active seconds"),G->BillVisible);
   G->Start();Cash=G->Cash;Wrong();Selection=G->Carry->Selection;Stage=1;Started=FPlatformTime::Seconds();return false;
  }
  if(Stage==1){
   if(!G->Learning){Test->AddError(TEXT("Wrong delivery review was not retained"));return true;}
   const auto* Ack=Find(TEXT("reviewack"));const auto* Anyway=Find(TEXT("serveanyway"));
   if(!Ack&&!Anyway&&FPlatformTime::Seconds()-Started<1)return false;
   Test->TestTrue(TEXT("Guest review renders Understood action"),Ack!=nullptr);Test->TestTrue(TEXT("Guest review renders Give anyway zero euros action"),Anyway!=nullptr);
   if(!Ack||!Anyway)return true;
   const FVector2D TargetPizza=FVector2D(640,FMath::Max(110.f,(H->Height-450)/2)+210)*H->Scale+H->ViewOrigin;P->Press(TargetPizza,-2);Test->TestEqual(TEXT("Target diagram cannot change carried pizza"),G->Carry->Selection,Selection);
   Click(Ack);Test->TestTrue(TEXT("Actual understood click retains pizza and resumes kitchen"),!G->Learning&&G->Carry.IsSet()&&G->Carry->Selection==Selection&&G->Cash==Cash&&G->Served==0);Wrong();Stage=2;Started=FPlatformTime::Seconds();return false;
  }
  const auto* Anyway=Find(TEXT("serveanyway"));if(!Anyway){if(FPlatformTime::Seconds()-Started<10)return false;Test->AddError(TEXT("Give anyway action did not render"));return true;}
  const FString Guest=G->Orders[0].Name;Click(Anyway);G->Tick(3.1);Test->TestTrue(TEXT("Conscious bad handover consumes pizza and replaces guest order"),!G->Learning&&!G->Carry.IsSet()&&G->Orders.Num()==1&&G->Orders[0].Name!=Guest);Test->TestTrue(TEXT("Bad handover never earns cash tip or successful progress"),G->Cash==Cash&&G->LastBill.Paid==0&&G->LastBill.Tip==0&&G->Served==0);const FString NextGuest=G->Orders[0].Name;P->Press(Anyway->Rect.GetCenter()*H->Scale+H->ViewOrigin,-2);Test->TestTrue(TEXT("Stale second handover cannot replace next ticket"),G->Orders.Num()==1&&G->Orders[0].Name==NextGuest);
  G->LevelNumber=2;G->Start();const int BeforeCash=G->Cash;const FString First=G->Orders[0].Name,Second=G->Orders[1].Name;G->Carry=FKitchenPizza();G->Carry->HasPlate=true;G->Carry->Baked=true;G->Carry->Ingredients=3;G->TryServe(1);Test->TestEqual(TEXT("Review identifies the actual second guest"),G->RepairOrder.Name,Second);P->Escape();P->GiveAnyway();Test->TestTrue(TEXT("F cannot give pizza away behind pause menu"),G->Learning&&G->Carry.IsSet()&&G->Orders[1].Name==Second);P->Escape();P->GiveAnyway();G->Tick(3.1);Test->TestTrue(TEXT("Bad delivery to second guest preserves first ticket and earns no progress"),!G->Carry.IsSet()&&G->Orders.Num()==2&&G->Orders[0].Name==First&&G->Orders[1].Name!=Second&&G->Served==0&&G->Cash==BeforeCash);
  G->LevelNumber=1;G->Start();for(int I=0;I<3;++I){const auto O=G->Orders[0];G->Carry=FKitchenPizza();G->Carry->HasPlate=true;G->Carry->Baked=true;G->Carry->Ingredients=3;G->Carry->Plated=true;G->Carry->Cuts.AddDiameter(0);G->Carry->Selection=O.Amount.Num==O.Amount.Den?3:1;G->TryServe(0);if(!G->Finished)G->Tick(3.1);}Test->TestTrue(TEXT("Final correct handover still displays receipt"),G->Finished&&G->BillVisible);G->Tick(2.1);Test->TestFalse(TEXT("Receipt expires after shift finished too"),G->BillVisible);
  return true;
 }
};
IMPLEMENT_SIMPLE_AUTOMATION_TEST(FPizzaGuestFeedback,"GradeCrew.NativeKitchen.GuestFeedback",EAutomationTestFlags::EditorContext|EAutomationTestFlags::EngineFilter)
bool FPizzaGuestFeedback::RunTest(const FString&){ADD_LATENT_AUTOMATION_COMMAND(FEditorLoadMap(TEXT("/Game/Maps/Pizzeria")));ADD_LATENT_AUTOMATION_COMMAND(FStartPIECommand(false));ADD_LATENT_AUTOMATION_COMMAND(FCheckGuestFeedback(this));ADD_LATENT_AUTOMATION_COMMAND(FEndPlayMapCommand());return true;}
#endif

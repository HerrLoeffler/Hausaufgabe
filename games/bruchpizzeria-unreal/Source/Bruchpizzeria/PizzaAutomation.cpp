#if WITH_EDITOR
#include "Misc/AutomationTest.h"
#include "Tests/AutomationEditorCommon.h"
#include "Editor.h"
#include "PizzaKitchen.h"
#include "Engine/World.h"
#include "GameFramework/FloatingPawnMovement.h"
#include "Camera/PlayerCameraManager.h"
#include "Kismet/GameplayStatics.h"
class FCheckCookingLesson final:public IAutomationLatentCommand {
 FAutomationTestBase* Test;double Start=FPlatformTime::Seconds();
 public:explicit FCheckCookingLesson(FAutomationTestBase* T):Test(T){}
 bool Update()override{
  UWorld* W=GEditor?GEditor->PlayWorld:nullptr;auto* G=W?Cast<APizzaGameMode>(W->GetAuthGameMode()):nullptr;
  if(!G||!G->Chef()||!G->Camera){if(FPlatformTime::Seconds()-Start<25)return false;Test->AddError(TEXT("Native kitchen failed to start in PIE"));return true;}
  G->LevelNumber=1;G->Start();auto* C=G->Chef();auto At=[C,G](float X,float Y){C->SetActorLocation(FVector(X,Y,77));C->Movement->StopMovementImmediately();G->Use();};
  const bool ExpectedBake[]={false,false,false,true,false,false,false,true};for(int Mask=0;Mask<8;++Mask){G->Start();At(-500,-280);G->Carry->Ingredients=Mask;At(500,100);Test->TestEqual(*FString::Printf(TEXT("Required base ingredients %d"),Mask),G->Oven.IsSet(),ExpectedBake[Mask]);}
  G->Start();At(-500,-280);Test->TestTrue(TEXT("Dough picked up"),G->Carry.IsSet());At(-500,-30);At(-500,220);Test->TestEqual(TEXT("Tomato and cheese added"),G->Carry->Ingredients,3);At(500,100);Test->TestTrue(TEXT("Pizza enters oven"),G->Oven.IsSet()&&!G->Carry.IsSet());G->Tick(5.1);Test->TestTrue(TEXT("Baking reaches ready"),G->Oven->Baked);At(500,100);At(0,90);Test->TestTrue(TEXT("Actual cutting board reached"),G->Cutting&&G->Board.IsSet());for(float A:{0.f,45.f,90.f,135.f})G->CutAngle(A);Test->TestEqual(TEXT("Eight actual pieces"),G->Board->Cuts.Count(),8);G->Board->Selection=1;G->FinishCut();At(-300,330);
  Test->TestTrue(TEXT("Wrong eighth starts visual repair"),G->Learning);Test->TestEqual(TEXT("Half ordered uses common eighths for actual comparison"),G->Repair.TargetCount(),4);Test->TestEqual(TEXT("One eighth initially on repair plate"),G->Repair.Count(),1);
  const float Clock=G->RoundTime,Patience=G->Orders[0].Patience,Bake=G->BakeTime;G->Tick(3);Test->TestEqual(TEXT("Lesson freezes match clock"),G->RoundTime,Clock);Test->TestEqual(TEXT("Lesson freezes guests"),G->Orders[0].Patience,Patience);Test->TestEqual(TEXT("Lesson freezes ovens"),G->BakeTime,Bake);Test->TestEqual(TEXT("Wrong serve earns no progress"),G->Served,0);G->ConfirmRepair();Test->TestTrue(TEXT("Uncorrected portion cannot resume"),G->Learning);
  G->ToggleRepairPiece(1);G->ToggleRepairPiece(2);G->ToggleRepairPiece(3);G->ConfirmRepair();Test->TestTrue(TEXT("Concrete correction resumes with same plate"),!G->Learning&&G->Carry.IsSet()&&G->Carry->Plated);Test->TestTrue(TEXT("Real plate now contains half"),PizzaRules::Equal(G->Carry->Cuts.Selected(G->Carry->Selection),PizzaRules::Rational(1,2)));Test->TestEqual(TEXT("Correcting diagram alone grants no served progress"),G->Served,0);At(-300,330);Test->TestEqual(TEXT("Corrected plate must be physically delivered again"),G->Served,1);Test->TestFalse(TEXT("Served plate removed"),G->Carry.IsSet());
  G->Start();G->Board=FKitchenPizza();G->Board->Baked=true;G->Board->Cuts.AddDiameter(0);G->Board->Selection=1;G->Carry=FKitchenPizza();G->Carry->Ingredients=1;At(0,90);G->FinishCut();Test->TestTrue(TEXT("Occupied board retains both pizzas"),G->Board.IsSet()&&G->Carry.IsSet()&&G->Carry->Ingredients==1);
  G->Start();G->Paused=true;C->Movement->Velocity=FVector(350,0,0);G->Tick(.02);Test->TestTrue(TEXT("Pause stops actual movement"),C->Movement->Velocity.IsNearlyZero());
  G->Start();G->Cutting=true;G->Board=FKitchenPizza();G->Start();Test->TestFalse(TEXT("Restart clears cutting"),G->Cutting);At(-500,-280);Test->TestTrue(TEXT("Restart permits normal pickup"),G->Carry.IsSet());
  G->Orders[0].Amount=PizzaRules::Rational(1);G->Orders[0].Ingredients=7;G->Carry->Baked=true;G->Carry->Plated=true;G->Carry->Ingredients=3;G->Carry->Selection=1;G->TryServe(0);Test->TestTrue(TEXT("Wrong recipe starts concrete ingredient comparison"),G->Learning&&G->RecipeLesson);G->ConfirmRepair();Test->TestTrue(TEXT("Recipe correction preserves actual plate"),!G->Learning&&G->Carry.IsSet()&&G->Carry->Ingredients==7);
  auto* P=Cast<APizzaController>(UGameplayStatics::GetPlayerController(W,0));if(P){P->PlayerCameraManager->UpdateCamera(.01f);FVector2D Origin,Right,Up;const FVector Pos=C->GetActorLocation();const bool A=P->ProjectWorldLocationToScreen(Pos,Origin),B=P->ProjectWorldLocationToScreen(Pos+P->MoveDirection(FVector2D(1,0))*100,Right),D=P->ProjectWorldLocationToScreen(Pos+P->MoveDirection(FVector2D(0,1))*100,Up);Test->TestTrue(TEXT("Actual initialized camera projection"),A&&B&&D);Test->TestTrue(TEXT("Right moves right in camera"),Right.X>Origin.X);Test->TestTrue(TEXT("Up moves up in camera"),Up.Y<Origin.Y);}
  return true;
 }
};
IMPLEMENT_SIMPLE_AUTOMATION_TEST(FPizzaNativeFlow,"GradeCrew.NativeKitchen.CookAndLearn",EAutomationTestFlags::EditorContext|EAutomationTestFlags::EngineFilter)
bool FPizzaNativeFlow::RunTest(const FString&){ADD_LATENT_AUTOMATION_COMMAND(FEditorLoadMap(TEXT("/Game/Maps/Pizzeria")));ADD_LATENT_AUTOMATION_COMMAND(FStartPIECommand(false));ADD_LATENT_AUTOMATION_COMMAND(FCheckCookingLesson(this));ADD_LATENT_AUTOMATION_COMMAND(FEndPlayMapCommand());return true;}
#endif

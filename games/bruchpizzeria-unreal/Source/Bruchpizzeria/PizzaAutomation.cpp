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
  G->Start();auto* C=G->Chef();
  auto At=[C,G](float X,float Y){C->SetActorLocation(FVector(X,Y,77));C->Movement->StopMovementImmediately();G->Use();};
  const bool ExpectedBake[]={false,false,false,true,false,false,false,true};
  for(int Mask=0;Mask<8;++Mask){G->Start();At(-500,-280);G->Carry->Ingredients=Mask;At(500,100);Test->TestEqual(*FString::Printf(TEXT("Required base ingredient mask %d"),Mask),G->Oven.IsSet(),ExpectedBake[Mask]);}
  G->Start();
  At(-500,-280);Test->TestTrue(TEXT("Dough physically picked up"),G->Carry.IsSet());
  At(-500,-30);At(-500,220);Test->TestEqual(TEXT("Tomato and cheese added"),G->Carry->Ingredients,3);
  At(500,100);Test->TestTrue(TEXT("Pizza enters actual oven"),G->Oven.IsSet()&&!G->Carry.IsSet());
  G->Tick(5.1);Test->TestTrue(TEXT("Native baking clock reaches ready"),G->Oven->Baked);
  At(500,100);At(0,90);Test->TestTrue(TEXT("Actual board mode"),G->Cutting&&G->Board.IsSet());
  for(float A:{0.f,45.f,90.f,135.f})G->CutAngle(A);
  Test->TestEqual(TEXT("Eight actual radial pieces"),G->Board->Cuts.Count(),8);
  G->Board->Selection=1;G->FinishCut();At(-300,330);
  Test->TestTrue(TEXT("Wrong eighth starts lesson"),G->Learning);
  const float Clock=G->RoundTime,Patience=G->Orders[0].Patience;G->Tick(3);
  Test->TestEqual(TEXT("Lesson freezes match clock"),G->RoundTime,Clock);Test->TestEqual(TEXT("Lesson freezes guests"),G->Orders[0].Patience,Patience);
  Test->TestEqual(TEXT("Wrong serve earns no progress"),G->Served,0);
  G->Answer(999);Test->TestEqual(TEXT("Wrong lesson answer cannot advance"),G->LessonIndex,0);
  auto* P=Cast<APizzaController>(UGameplayStatics::GetPlayerController(W,0));
  if(P){const auto& S=G->Lesson[0];int Key=0;while(Key<4&&S.Choices[Key]!=S.Correct)++Key;switch(Key){case 0:P->Cut0();break;case 1:P->Cut45();break;case 2:P->Cut90();break;case 3:P->Cut135();break;}Test->TestEqual(TEXT("Keyboard choice routes into learning"),G->LessonIndex,1);}
  for(int Guard=0;G->Learning&&Guard<12;++Guard)G->Answer(G->Lesson[G->LessonIndex].Correct);
  Test->TestTrue(TEXT("Guided learning resumes at board"),!G->Learning&&G->Cutting&&G->Board.IsSet());
  if(P){int VW,VH;P->GetViewportSize(VW,VH);P->Press(FVector2D(VW*.4f,VH*.4f),0);P->Press(FVector2D(VW*.42f,VH*.42f),1);Test->TestEqual(TEXT("Second touch cannot steal cut gesture"),P->ActiveTouch,0);P->Release(FVector2D(VW*.4f,VH*.4f),0);Test->TestFalse(TEXT("Original finger releases gesture"),P->Dragging);}
  G->Board->Selection=15;G->FinishCut();At(-300,330);
  Test->TestEqual(TEXT("Correct four eighths serve one half"),G->Served,1);
  Test->TestTrue(TEXT("Served plate removed"),!G->Carry.IsSet());
  G->Orders[0].Amount=PizzaRules::Rational(3,8);G->Orders[0].Op='+';G->Orders[0].Left=PizzaRules::Rational(1,4);G->Orders[0].Right=PizzaRules::Rational(1,8);
  G->BeginLesson(G->Orders[0],PizzaRules::Rational(1,8));Test->TestTrue(TEXT("Arithmetic lesson has contextual steps"),G->Lesson.size()>=5);
  G->Start();G->Board=FKitchenPizza();G->Board->Baked=true;G->Board->Cuts.AddDiameter(0);G->Board->Selection=1;G->Carry=FKitchenPizza();G->Carry->Ingredients=1;At(0,90);G->FinishCut();Test->TestTrue(TEXT("Occupied board retains both pizzas"),G->Board.IsSet()&&G->Carry.IsSet()&&G->Carry->Ingredients==1);
  G->Start();G->Paused=true;C->Movement->Velocity=FVector(350,0,0);G->Tick(.02);Test->TestTrue(TEXT("Frozen state stops actual movement component"),C->Movement->Velocity.IsNearlyZero());
  G->Start();G->Cutting=true;G->Board=FKitchenPizza();G->RoundTime=.1;G->Tick(.2);G->Start();Test->TestFalse(TEXT("Restart clears cutting mode"),G->Cutting);At(-500,-280);Test->TestTrue(TEXT("Restart allows normal dough pickup"),G->Carry.IsSet());
  G->Start();G->Orders[0].Amount=PizzaRules::Rational(1,1);G->Orders[0].Ingredients=7;G->Carry=FKitchenPizza();G->Carry->Baked=true;G->Carry->Plated=true;G->Carry->Ingredients=3;G->Carry->Selection=1;G->TryServe(0);Test->TestTrue(TEXT("Wrong recipe freezes into guided learning"),G->Learning);
  if(P){P->PlayerCameraManager->UpdateCamera(.01f);FVector2D Origin,Right,Up;const FVector Pos=G->Chef()->GetActorLocation();const bool OriginValid=P->ProjectWorldLocationToScreen(Pos,Origin),RightValid=P->ProjectWorldLocationToScreen(Pos+P->MoveDirection(FVector2D(1,0))*100,Right),UpValid=P->ProjectWorldLocationToScreen(Pos+P->MoveDirection(FVector2D(0,1))*100,Up);Test->TestTrue(TEXT("Camera projection requires actual initialized viewport"),OriginValid&&RightValid&&UpValid);Test->TestTrue(TEXT("Right control moves right in actual camera projection"),Right.X>Origin.X);Test->TestTrue(TEXT("Up control moves up in actual camera projection"),Up.Y<Origin.Y);}
  G->Start();G->Orders[0].Amount=PizzaRules::Rational(1,8);G->Orders[0].Op=' ';G->Carry=FKitchenPizza();G->Carry->Baked=true;G->Carry->Plated=true;G->Carry->Ingredients=3;G->Carry->Cuts.AddDiameter(0);G->Carry->Selection=1;G->TryServe(0);
  Test->TestTrue(TEXT("Half pizza against eighth order pauses for lesson"),G->Learning);
  Test->TestEqual(TEXT("Lesson retains actual two physical pieces"),G->Carry->Cuts.Count(),2);
  Test->TestTrue(TEXT("Eighth lesson describes required subdivision, not existing slices"),G->Lesson[0].Prompt.find("Für diese Bestellung")!=std::string::npos);
  UE_LOG(LogTemp,Display,TEXT("PIZZA_NATIVE_FLOW_TEST_COMPLETED"));return true;
 }
};
IMPLEMENT_SIMPLE_AUTOMATION_TEST(FPizzaNativeFlow,"GradeCrew.NativeKitchen.CookAndLearn",EAutomationTestFlags::EditorContext|EAutomationTestFlags::EngineFilter)
bool FPizzaNativeFlow::RunTest(const FString&){ADD_LATENT_AUTOMATION_COMMAND(FEditorLoadMap(TEXT("/Game/Maps/Pizzeria")));ADD_LATENT_AUTOMATION_COMMAND(FStartPIECommand(false));ADD_LATENT_AUTOMATION_COMMAND(FCheckCookingLesson(this));ADD_LATENT_AUTOMATION_COMMAND(FEndPlayMapCommand());return true;}
#endif

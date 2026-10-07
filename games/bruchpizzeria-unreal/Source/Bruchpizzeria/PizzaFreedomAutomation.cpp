#if WITH_EDITOR
#include "Misc/AutomationTest.h"
#include "Tests/AutomationEditorCommon.h"
#include "Editor.h"
#include "PizzaKitchen.h"
#include "Engine/World.h"
#include "Components/PrimitiveComponent.h"
#include "GameFramework/FloatingPawnMovement.h"
class FCheckKitchenFreedom final:public IAutomationLatentCommand {
 FAutomationTestBase* Test;double Started=FPlatformTime::Seconds();
 public:explicit FCheckKitchenFreedom(FAutomationTestBase* T):Test(T){}
 bool Update()override{
  UWorld* W=GEditor?GEditor->PlayWorld:nullptr;auto* G=W?Cast<APizzaGameMode>(W->GetAuthGameMode()):nullptr;
  if(!G||!G->Chef()){if(FPlatformTime::Seconds()-Started<25)return false;Test->AddError(TEXT("Native freedom kitchen did not start"));return true;}
  auto At=[G](int Station){auto* C=G->Chef();const FVector S=G->StationLocation(Station);C->SetActorLocation(S+FVector(Station<3?110:Station==3||Station==4?-110:0,Station==5?-110:0,77));C->Movement->StopMovementImmediately();G->Use();};
  G->LevelNumber=1;
  for(int Mask=0;Mask<8;++Mask){G->Start();G->Carry=FKitchenPizza();G->Carry->HasPlate=true;G->Carry->Ingredients=Mask;G->UseOven(0);Test->TestTrue(*FString::Printf(TEXT("Any topping mask %d enters oven"),Mask),G->Oven.IsSet()&&!G->Carry.IsSet());if(G->Oven.IsSet()){G->UseOven(0);Test->TestTrue(TEXT("Early pickup retains actual raw pizza"),G->Carry.IsSet()&&!G->Carry->Baked&&G->Carry->Ingredients==Mask);}}
  G->Start();G->Carry=FKitchenPizza();G->Carry->HasPlate=true;G->Carry->Ingredients=3;At(5);Test->TestTrue(TEXT("Raw pizza can reach real cutting board"),G->Cutting&&G->Board.IsSet());
  if(G->Board.IsSet()){G->CutStroke(FVector2D(-1,.8),FVector2D(1,.8));G->Board->Selection=1;G->FinishCut();Test->TestTrue(TEXT("Unequal raw pieces can be put on plate"),G->Carry.IsSet()&&G->Carry->Plated&&!G->Carry->Baked);}
  if(G->Carry.IsSet()){At(5);G->ResetCuts();TArray<UPrimitiveComponent*> Parts;G->BoardVisual->GetComponents(Parts);bool VisiblePizza=false;for(auto* Part:Parts)VisiblePizza|=Part->GetName().StartsWith(TEXT("Crust"))&&Part->IsVisible();Test->TestTrue(TEXT("Replating then resetting shows real pizza geometry again"),VisiblePizza);}
  G->Start();G->Carry=FKitchenPizza();G->Carry->HasPlate=true;G->Carry->Ingredients=3;G->TryServe(0);Test->TestTrue(TEXT("Raw whole delivery is evaluated by customer without lesson"),G->Carry.IsSet()&&G->Learning&&G->Served==0&&G->Feedback.Contains(TEXT("roh")));
  G->Start();G->Orders[0].Amount=PizzaRules::Rational(1);G->Carry=FKitchenPizza();G->Carry->HasPlate=true;G->Carry->Baked=true;G->Carry->Ingredients=0;G->TryServe(0);Test->TestTrue(TEXT("Missing toppings named precisely and no phantom mushrooms in level one"),G->Learning&&G->Feedback.Contains(TEXT("Tomate"))&&G->Feedback.Contains(TEXT("Käse"))&&!G->Feedback.Contains(TEXT("Champignon")));
  G->LevelNumber=4;G->Start();G->Orders[0].Amount=PizzaRules::Rational(1,2);G->Carry=FKitchenPizza();G->Carry->HasPlate=true;G->Carry->Baked=true;G->Carry->Plated=true;G->Carry->Ingredients=7;G->Carry->Cuts.AddDiameter(0);G->Carry->Selection=1;G->TryServe(0);Test->TestTrue(TEXT("Extra topping complaint preserves real plate without lesson"),G->Learning&&G->Carry.IsSet()&&G->Carry->Ingredients==7&&G->Feedback.Contains(TEXT("Champignon")));G->ConfirmRepair();At(3);Test->TestTrue(TEXT("Extra topping remains and cannot be removed"),G->Carry.IsSet()&&G->Carry->Ingredients==7);G->UseTrash();G->UseDough();At(1);At(2);G->UseOven(0);G->Tick(5.1);G->UseOven(0);At(5);G->CutAngle(0);if(G->Board.IsSet())G->Board->Selection=1;G->FinishCut();G->TryServe(0);Test->TestEqual(TEXT("New correct pizza after disposal earns progress"),G->Served,1);
  G->Start();G->Carry=FKitchenPizza();G->Carry->HasPlate=true;G->Carry->Ingredients=0;G->Paused=true;G->UseOven(0);Test->TestTrue(TEXT("Paused oven does not mutate pizza"),G->Carry.IsSet()&&!G->Oven.IsSet());
  G->Start();G->Carry=FKitchenPizza();G->Carry->HasPlate=true;G->Carry->Ingredients=1;G->Oven=FKitchenPizza();G->Oven->Ingredients=2;G->UseOven(0);Test->TestTrue(TEXT("Occupied oven preserves both dishes"),G->Carry.IsSet()&&G->Oven.IsSet()&&G->Carry->Ingredients==1&&G->Oven->Ingredients==2);
  G->Start();G->Carry=FKitchenPizza();G->Carry->HasPlate=true;G->Carry->Ingredients=0;G->UseOven(0);if(G->Oven.IsSet()){G->Tick(5.1);G->UseOven(0);Test->TestTrue(TEXT("Baking cannot invent required toppings"),G->Carry.IsSet()&&G->Carry->Baked&&G->Carry->Ingredients==0);}
  return true;
 }
};
IMPLEMENT_SIMPLE_AUTOMATION_TEST(FPizzaKitchenFreedom,"GradeCrew.NativeKitchen.KitchenFreedom",EAutomationTestFlags::EditorContext|EAutomationTestFlags::EngineFilter)
bool FPizzaKitchenFreedom::RunTest(const FString&){ADD_LATENT_AUTOMATION_COMMAND(FEditorLoadMap(TEXT("/Game/Maps/Pizzeria")));ADD_LATENT_AUTOMATION_COMMAND(FStartPIECommand(false));ADD_LATENT_AUTOMATION_COMMAND(FCheckKitchenFreedom(this));ADD_LATENT_AUTOMATION_COMMAND(FEndPlayMapCommand());return true;}
#endif

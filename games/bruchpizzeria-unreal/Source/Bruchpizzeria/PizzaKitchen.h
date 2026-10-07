#pragma once
#include "CoreMinimal.h"
#include "GameFramework/GameModeBase.h"
#include "GameFramework/Pawn.h"
#include "GameFramework/PlayerController.h"
#include "FractionRules.h"
#include "KitchenArt.h"
#include "PizzaKitchen.generated.h"
class UCapsuleComponent;class UFloatingPawnMovement;class ACameraActor;
struct FKitchenPizza {int Ingredients=0;bool Baked=false;PizzaRules::PizzaCuts Cuts;uint32 Selection=0;bool Plated=false;};
struct FKitchenOrder {FString Name;PizzaRules::Rational Amount;PizzaRules::Rational Left,Right;char Op=' ';int Ingredients=3;float Patience=110;};
UCLASS() class BRUCHPIZZERIA_API APizzaArena:public AActor {GENERATED_BODY() public:APizzaArena();virtual void OnConstruction(const FTransform&)override;};
UCLASS() class BRUCHPIZZERIA_API APizzaVisual:public AActor {GENERATED_BODY() public:APizzaVisual();void SetPizza(const FKitchenPizza&);};
UCLASS() class BRUCHPIZZERIA_API AKitchenChef:public APawn {GENERATED_BODY() public:AKitchenChef();virtual void OnConstruction(const FTransform&)override;virtual void Tick(float)override;UPROPERTY() UCapsuleComponent* Body;UPROPERTY() UFloatingPawnMovement* Movement;KitchenArt::ChefParts Rig;float AnimationClock=0;};
UCLASS() class BRUCHPIZZERIA_API APizzaGameMode:public AGameModeBase {
 GENERATED_BODY()
 public:APizzaGameMode();virtual void BeginPlay()override;virtual void Tick(float)override;
 UPROPERTY() ACameraActor* Camera;UPROPERTY() APizzaVisual* CarryVisual;UPROPERTY() APizzaVisual* BoardVisual;UPROPERTY() APizzaVisual* OvenVisual;
 UPROPERTY() TArray<AActor*> Guests;
 TArray<FKitchenOrder> Orders;TOptional<FKitchenPizza> Carry,Board,Oven;
 float BakeTime=0,RoundTime=240,FeedbackTime=0;int Score=0,Served=0,Difficulty=0,OrderSerial=0;
 bool Intro=true,Cutting=false,Learning=false,Paused=false,Finished=false,RecipeLesson=false;
 FString Feedback=TEXT("Ciao! Eine echte Küche wartet auf dich.");
 std::vector<PizzaRules::LessonStep> Lesson;int LessonIndex=0;FString LessonContext;
 FVector NormalCamera=FVector(0,-1180,1470);FRotator NormalRotation=FRotator(-51,90,0);int SelectedGuest=0,AnswerChoice=0;
 bool Frozen()const{return Intro||Learning||Paused||Finished;}
 AKitchenChef* Chef()const;int NearestStation()const;void Start();void TogglePause();void Use();void Drop();void Dash();void CycleDifficulty();
 void BeginCut();void FinishCut();void CutStroke(FVector2D,FVector2D);void CutAngle(float);void TogglePiece(FVector2D);void ResetCuts();
 void TryServe(int);void BeginLesson(const FKitchenOrder&,PizzaRules::Rational);void Answer(int);void RefreshPizza();void MakeOrder();
 FVector CutLocation()const{return FVector(0,190,94);}FString OrderLabel(const FKitchenOrder&)const;
};
UCLASS() class BRUCHPIZZERIA_API APizzaController:public APlayerController {
 GENERATED_BODY()
 public:APizzaController();virtual void SetupInputComponent()override;virtual void PlayerTick(float)override;
 FVector2D Stick=FVector2D::ZeroVector,DragStart=FVector2D::ZeroVector,DragEnd=FVector2D::ZeroVector;bool Dragging=false,Joystick=false;int ActiveTouch=-1;
 APizzaGameMode* Game()const;void Use();void Drop();void Dash();void Escape();void DifficultyMode();void Cut0();void Cut45();void Cut90();void Cut135();
 void PointerDown();void PointerUp();void ClearInput();void ChooseAnswer(int);void PreviousAnswer();void NextAnswer();void TouchDown(ETouchIndex::Type,FVector);void TouchUp(ETouchIndex::Type,FVector);
 void Press(FVector2D,int);void Release(FVector2D,int);FVector2D PizzaPoint(FVector2D)const;
};

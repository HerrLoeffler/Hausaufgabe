#pragma once
#include "CoreMinimal.h"
#include "GameFramework/GameModeBase.h"
#include "GameFramework/HUD.h"
#include "GameFramework/SaveGame.h"
#include "GameFramework/PlayerController.h"
#include "Core/ExpeditionRules.h"
#include "ExpeditionWorld.generated.h"
class ACameraActor;class UStaticMeshComponent;
UCLASS() class AExpeditionController:public APlayerController {GENERATED_BODY() public:virtual void BeginPlay()override;virtual void EndPlay(const EEndPlayReason::Type Reason)override;virtual void SetupInputComponent()override;void PointerDown();TSharedPtr<class SWidget> PointerOverlay;};
struct FExpTarget {FVector Pos;FString Label;int Id;};
struct FExpQuestion {FString Prompt;TArray<FString> Options;int Correct;FString Hint;};
UCLASS() class UExpeditionSave:public USaveGame {GENERATED_BODY() public:UPROPERTY() FString Snapshot;};
UCLASS() class AExpeditionGameMode:public AGameModeBase {
 GENERATED_BODY()
 public:
 AExpeditionGameMode();virtual void BeginPlay()override;virtual void Tick(float Delta)override;
 Expedition::State State;AActor* Explorer=nullptr;ACameraActor* Camera=nullptr;
 TArray<FExpTarget> Targets;TArray<UStaticMeshComponent*> Legs;TArray<UStaticMeshComponent*> BoatParts;
 UStaticMeshComponent* Bridge=nullptr;UStaticMeshComponent* RopeLine=nullptr;UStaticMeshComponent* RadioLamp=nullptr;
 FVector2D MoveInput=FVector2D::ZeroVector;int Dialog=8,Slot=-1,Zone=0,Attempts=0,TransferAttempts=0;bool Transfer=false,WordTopic=false;
 FString Feedback,Toast;float ToastTimer=0,Elapsed=0,LearnTime=0,WorldTime=0;int NearId=-1;FString NearLabel;
 FString SaveSlot=TEXT("ExpeditionDemo");int Failures[8]={};bool TransferRequired[8]={};
 int FocusedButton=0;
 FVector2D TouchStart;bool TouchMoving=false,TouchWasDown=false;
 void StepMovement(float Delta);void CancelInput();void BuildWorld();void RefreshWorld();void Interact(int Id);void Click(int Id);void OpenLearning(int ZoneId);void Answer(int Option);void Dispatch(Expedition::Action A,int Value=0);void Notify(FString Message);void Save();bool Load();void NewGame(bool Word);
 FExpQuestion Question()const;FExpQuestion QuestionFor(int Index,bool IsTransfer=false)const;
 FString Mission()const;int Solved()const;
};
struct FExpButton {FBox2D Rect;int Id;};
UCLASS() class AExpeditionHUD:public AHUD {
 GENERATED_BODY()
 public:virtual void DrawHUD()override;TArray<FExpButton> Buttons;float UIScale=1;FVector2D DrawSize;bool ClickAt(FVector2D Pos);
 void Panel(float X,float Y,float W,float H,FLinearColor Color);void Text(FString S,float X,float Y,float Size,FLinearColor Color);void Button(FString S,float X,float Y,float W,float H,int Id);void Wrap(FString S,float X,float Y,float W,float Size,FLinearColor Color);
};

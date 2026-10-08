#pragma once
#include "CoreMinimal.h"
#include "GameFramework/GameModeBase.h"
#include "GameFramework/SaveGame.h"
#include "GameFramework/PlayerController.h"
#include "Core/ExpeditionEpisode.h"
#include "ExpeditionWorld.generated.h"
class ACameraActor;
class UStaticMeshComponent;
class SExpeditionScreen;
enum class EExpDialog:uint8 {Welcome,World,Speech,Question,Result,Shell,Route,Rope,Mosaic,Symbols,Inventory,Teacher,Pause,Finale};
struct FExpTarget {FVector Pos;FString Label;int Id;AActor* Actor=nullptr;};
struct FExpGate {UStaticMeshComponent* Mesh=nullptr;int School=-1;int Logic=-1;};
struct FExpQuestion {FString Prompt;TArray<FString> Options;TArray<FString> Codes;int Correct=0;FString Hint,Explanation,Speaker;};
UCLASS() class UExpeditionSave:public USaveGame {GENERATED_BODY() public:UPROPERTY() FString Snapshot;};
UCLASS() class AExpeditionController:public APlayerController {
 GENERATED_BODY()
 public:virtual void BeginPlay()override;virtual void EndPlay(const EEndPlayReason::Type Reason)override;virtual void SetupInputComponent()override;
 void InteractPressed();void BagPressed();void PausePressed();void NumberOne();void NumberTwo();void NumberThree();void NumberFour();void ConfirmPressed();
 TSharedPtr<SExpeditionScreen> Screen;
};
UCLASS() class AExpeditionGameMode:public AGameModeBase {
 GENERATED_BODY()
 public:
 AExpeditionGameMode();virtual void BeginPlay()override;virtual void Tick(float Delta)override;
 ExpeditionV2::State State;
 AActor* Explorer=nullptr;ACameraActor* Camera=nullptr;
 TArray<FExpTarget> Targets;TArray<FExpGate> Gates;TArray<UStaticMeshComponent*> Legs;TArray<UStaticMeshComponent*> FinalLights;
 UStaticMeshComponent* RopeLine=nullptr;UStaticMeshComponent* NearMarker=nullptr;
 EExpDialog Dialog=EExpDialog::Welcome;EExpDialog ReturnDialog=EExpDialog::World;
 FVector2D MoveInput=FVector2D::ZeroVector;
 FVector2D TouchInput=FVector2D::ZeroVector;
 bool NeedsRelease=true,UiDirty=true,WasFocused=true;int CurrentSchool=-1,SelectedOption=-1,NearId=-1,RoutePreview=-1;
 FString NearLabel,Speaker,DialogueText,Feedback,Toast,SaveMessage;
 float ToastTimer=0,ActiveTime=0,SchoolTime=0,LogicTime=0,TravelTime=0,AnimationTime=0,AutoSaveTime=0;
 FString SaveSlot=TEXT("ExpeditionMasterV1");
 void BuildWorld();void RefreshWorld();void RebuildUI();
 void NewGame();void SetDialog(EExpDialog NewDialog);void CancelInput();void StepMovement(float Delta);
 void Interact(int Id);void Click(int Id);void OpenSchool(int Id);void Answer();void Save();bool Load();void Notify(const FString& Message);
 void ResultMessage(ExpeditionV2::Result Result,const FString& Success);
 FExpQuestion Question()const;FExpQuestion QuestionFor(int Id,bool Transfer=false)const;
 FString Mission()const;FString AreaName()const;int Solved()const;int SchoolSolved()const;
 bool CanWalk(const FVector& Position)const;bool TargetVisible(int Id)const;
};

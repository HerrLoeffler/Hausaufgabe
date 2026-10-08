#pragma once
#include "CoreMinimal.h"
#include "GameFramework/Character.h"
#include "GameFramework/GameModeBase.h"
#include "GameFramework/PlayerController.h"
#include "GameFramework/HUD.h"
#include "GameFramework/SaveGame.h"
#include "Core/IslandRules.h"
#include "IslandWorld.generated.h"
class UIslandFocusWidget;class UCameraComponent;class UStaticMeshComponent;class UTextRenderComponent;
UCLASS() class AIslandCharacter:public ACharacter {
 GENERATED_BODY()
 public:AIslandCharacter();UPROPERTY() UCameraComponent* Camera;virtual void SetupPlayerInputComponent(UInputComponent*)override;virtual void Tick(float)override;
 void Forward(float);void Right(float);void Turn(float);void Look(float);bool CanMove()const;
};
UCLASS() class AIslandController:public APlayerController {
 GENERATED_BODY()
 public:virtual void BeginPlay()override;virtual void SetupInputComponent()override;virtual void PlayerTick(float)override;
 void Interact();void Escape();void PointerDown();void CancelInput();void UpdateMode();int PickWorldTarget(float,float)const;
 UPROPERTY() UIslandFocusWidget* FocusWidget=nullptr;
 float MouseSensitivity=1.f;FString PreferencesSlot=TEXT("LerninselPreferencesV1");
 void SetMouseSensitivity(float,bool=true);bool SavePreferences();bool LoadPreferences();
 void TouchPressed(ETouchIndex::Type,FVector);void TouchMoved(ETouchIndex::Type,FVector);void TouchReleased(ETouchIndex::Type,FVector);
 Island::TouchOwnership Ownership;FVector2D TouchMove=FVector2D::ZeroVector;FVector2D TouchOrigin[10],TouchLast[10];bool TouchUsed=false,KeysArmed=true;
};
UCLASS() class UIslandSave:public USaveGame {
 GENERATED_BODY()
 public:UPROPERTY() FString Snapshot;UPROPERTY() FVector Position;UPROPERTY() FRotator View;
};
UCLASS() class UIslandPreferences:public USaveGame {
 GENERATED_BODY()
 public:UPROPERTY() float MouseSensitivity=1.f;
};
struct FIslandTarget{int Id;FVector Pos;FString Label,Context;};
struct FIslandGate{AActor* Actor=nullptr;float Angle=0;UStaticMeshComponent* Barrier=nullptr;};
UCLASS() class AIslandGameMode:public AGameModeBase {
 GENERATED_BODY()
 public:AIslandGameMode();virtual void BeginPlay()override;virtual void Tick(float)override;
 Island::State State;Island::PlateContact Contact;TArray<FIslandTarget> Targets;TArray<FIslandGate> Gates;
 TArray<UStaticMeshComponent*> IntroTiles,PathTiles,Cables,Signals;TArray<UTextRenderComponent*> IntroMarks,PathMarks;
 FVector ObservationStand=FVector(9400,-850,1088);FRotator ObservationView=FRotator(-12,-90,0);TArray<UTextRenderComponent*> SentenceSlots;UStaticMeshComponent* BasinWater=nullptr;float BasinHeight=0;
 AActor* Bucket=nullptr;UStaticMeshComponent* BucketWater=nullptr;UTextRenderComponent* BucketAmount=nullptr;
 int Focus=-1,Near=-1;bool Paused=false;float Clock=0,MessageTime=0,StrokeTime=0;int PendingStroke=0,StrokeTarget=-1;bool CupStroke=false;FString Feedback,SaveSlot=TEXT("LerninselV1");
 void BuildWorld();void BuildPuzzleWorld();void RefreshWorld(float);void RefreshPuzzleWorld(float);void PuzzleInteract(int);bool CanInspect(int)const;bool PreviewAligned()const;void ConfirmCoast();void UIAction(int);FString SentenceText()const;void Interact(int);void SelectFocused();void Apply(Island::Action,int=0);void Notify(const FString&);void Save();bool Load();void ResetDemo();
 void AddTarget(int,FVector,const FString&,const FString& =TEXT(""));const FIslandTarget* Target(int)const;bool Reachable(int)const;bool GateBlocks(int)const;float BucketWaterHeight()const;
 FString ResultText(Island::Result)const;AIslandCharacter* Player()const;
};
struct FIslandButton{FBox2D Bounds;int Action;};
UCLASS() class AIslandHUD:public AHUD {
 GENERATED_BODY()
 public:virtual void DrawHUD()override;bool ClickAt(FVector2D);TArray<FIslandButton> Buttons;float Scale=1;
 void Text(const FString&,float,float,float,FLinearColor);void Panel(float,float,float,float,FLinearColor);void Button(const FString&,float,float,float,float,int);void Wrap(const FString&,float,float,float,float);
};

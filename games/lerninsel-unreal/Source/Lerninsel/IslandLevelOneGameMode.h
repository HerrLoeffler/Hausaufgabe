#pragma once
#include "IslandWorld.h"
#include "IslandLevelOneGameMode.generated.h"
UCLASS() class UIslandLevelOneSave:public UIslandSave {
 GENERATED_BODY()
 public:UPROPERTY() FString ScenarioId;UPROPERTY() int32 LayoutRevision=1;UPROPERTY() FGuid AttemptId;
};
UCLASS() class AIslandLevelOneGameMode:public AIslandGameMode {
 GENERATED_BODY()
 public:AIslandLevelOneGameMode();
};
UCLASS() class AIslandLevelOneContinuationGameMode:public AIslandGameMode {
 GENERATED_BODY()
 public:AIslandLevelOneContinuationGameMode();
};

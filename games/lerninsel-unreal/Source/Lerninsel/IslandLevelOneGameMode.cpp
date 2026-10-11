#include "IslandLevelOneGameMode.h"
AIslandLevelOneGameMode::AIslandLevelOneGameMode(){SessionProfile=EIslandSessionProfile::LevelOneReference;SaveSlot=SessionSaveSlot();Paused=true;}
AIslandLevelOneContinuationGameMode::AIslandLevelOneContinuationGameMode(){SessionProfile=EIslandSessionProfile::LevelOneContinuation;SaveSlot=SessionSaveSlot();}

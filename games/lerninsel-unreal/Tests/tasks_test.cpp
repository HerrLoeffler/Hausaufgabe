#include "../Source/Lerninsel/Core/IslandRules.h"
#include "../Source/Lerninsel/Core/IslandTasks.h"
#include <iostream>
#include <stdexcept>
using namespace Island;
int checks=0;
#define CHECK(x) do{++checks;if(!(x))throw std::runtime_error(#x);}while(0)
int main(){try{
 CHECK(TaskDefinitionsValid());
 CHECK(TaskDefinitions().size()==9);
 for(const auto& T:TaskDefinitions()){
  CHECK(T.Id>0&&T.Title&&T.Type&&T.Instruction&&T.Goal);
  CHECK(T.Hints[0]&&T.Hints[1]&&T.Hints[2]);
  CHECK(T.HiddenClue&&T.ClueLocation&&T.CompletionFlag&&T.FollowUp);
 }
 CHECK(TaskStageFor(100,0,0)==TaskStage::Available);
 CHECK(TaskStageFor(200,0,0)==TaskStage::Locked);
 CHECK(TaskStageFor(200,TaskBit(100))==TaskStage::Available);
 CHECK(TaskStageFor(200,TaskBit(100),TaskBit(200))==TaskStage::Active);
 CHECK(TaskStageFor(200,TaskBit(100)|TaskBit(200))==TaskStage::Solved);
 CHECK(TaskStageFor(300,TaskBit(100)|TaskBit(200))==TaskStage::Available);
 CHECK(CurrentTaskId(State{})==100);
 State S;S.intro=true;CHECK(CurrentTaskId(S)==200);
 S.verbs=true;CHECK(CurrentTaskId(S)==300);
 S.sentence=true;CHECK(CurrentTaskId(S)==400);
 S.water=true;CHECK(CurrentTaskId(S)==500);
 S.fractions=true;CHECK(CurrentTaskId(S)==600);
 S.coast=true;CHECK(CurrentTaskId(S)==700);
 S.finale=true;CHECK(CurrentTaskId(S)==0);
 CHECK(TaskStageFor(820,SolvedTaskMask(S))==TaskStage::Available);
 std::cout<<"PASS "<<checks<<" task catalog checks\n";return 0;
}catch(const std::exception& e){std::cerr<<"FAIL after "<<checks<<": "<<e.what()<<"\n";return 1;}}

#pragma once
#include "IslandRules.h"
#include "IslandTasks.generated.h"
namespace Island {
inline std::uint64_t SolvedTaskMask(const State& s){
 std::uint64_t m=0;
 if(s.intro)m|=TaskBit(100);if(s.verbs)m|=TaskBit(200);if(s.sentence)m|=TaskBit(300);if(s.water)m|=TaskBit(400);if(s.fractions)m|=TaskBit(500);if(s.coast)m|=TaskBit(600);if(s.finale)m|=TaskBit(700);if(s.bonusMask&1)m|=TaskBit(820);if(s.bonusMask&2)m|=TaskBit(821);
 return m;
}
inline int CurrentTaskId(const State& s){if(!s.intro)return 100;if(!s.verbs)return 200;if(!s.sentence)return 300;if(!s.water)return 400;if(!s.fractions)return 500;if(!s.coast)return 600;if(!s.finale)return 700;return 0;}
}

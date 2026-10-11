#include "../Source/Lerninsel/Core/IslandLevelOneLayout.h"
#include <iostream>
#include <cmath>
#include <cstdlib>
int main(){int checks=0;auto check=[&](bool ok,const char* label){++checks;if(!ok){std::cerr<<"FAIL "<<label<<'\n';std::exit(1);}};
 check(Island::LevelOneGroundZ(-2650,0)==0,"hill start");
 check(Island::LevelOneGroundZ(-2200,0)==90,"hill crest");
 check(Island::LevelOneGroundZ(-2100,0)==90&&Island::LevelOneGroundZ(-2000,0)==90,"real200cm plateau");
 check(Island::LevelOneGroundZ(-1450,0)==0,"descent ends");
 for(int x=-2650;x< -1450;x+=5)check(std::abs(Island::LevelOneGroundZ(x+1,0)-Island::LevelOneGroundZ(x,0))<=std::tan(18*3.141592653589793/180),"local slope margin");
 check(Island::LevelOnePoseInBounds(-2800,0,88)&&!Island::LevelOnePoseInBounds(-9999,0,88),"new spawn geography");
 Island::LevelOneFootVisit visit;
 check(visit.Update(0,.29,true,true)==-1,"short deliberate visit");
 check(visit.Update(0,.02,true,true)==0,"deliberate dwell commits");
 check(visit.Update(0,2,true,true)==-1,"one visit one intent");
 visit.BlockUntilExit();check(visit.Update(0,2,true,true)==-1,"undo/resume requires exit");
 visit.Update(-1,.1,true,true);check(visit.Update(0,.31,true,true)==0,"outside rearms");
 visit.Update(-1,.1,true,true);check(visit.Update(4,1,false,true)==-1,"future row no foot intent");
 check(visit.Update(4,1,true,false)==-1,"visible surface must support feet");
 visit.BlockUntilExit();check(visit.Update(4,1,true,true)==-1,"click consumes current visit");
 Island::LevelOneIntentGuard guard;check(guard.Admit(42,200)&&!guard.Admit(42,200),"coalesce same-frame same-target dispatch");
 check(guard.Admit(43,200)&&guard.Admit(44,200),"distinct press cycles preserved");
 Island::State s;s.intro=true;s.introMask=5;
 check(Island::LevelOneStartPath(s)==Island::Result::Applied,"intent starts route");
 Island::Apply(s,Island::Action::PathStep,0);
 check(Island::LevelOneStartPath(s)==Island::Result::Already&&s.pathCount==1&&s.path[0]==0,"repeat start preserves valid row");
 Island::Apply(s,Island::Action::PathStep,3);
 check(Island::LevelOneStartPath(s)==Island::Result::Already&&s.pathFailed&&s.pathCount==2,"repeat start preserves error for correction");
 Island::Apply(s,Island::Action::PathUndo);
 check(s.pathCount==1&&!s.pathFailed&&s.path[0]==0,"undo only last");
 std::cout<<"PASS "<<checks<<" level-one profile/intent checks\n";
}

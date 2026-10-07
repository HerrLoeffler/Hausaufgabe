#include "../Source/Expedition/Core/ExpeditionRules.h"
#include <cstdio>
#include <cstdlib>
using namespace Expedition;
int checks=0;
void check(bool v,const char* why){++checks;if(!v){std::fprintf(stderr,"FAIL: %s\n",why);std::exit(1);}}
int main(){
 State s; check(Learn(s,0,"demo-1","r1")==Result::Applied,"valid learning receipt accepted");
 check(Learn(s,0,"demo-1","r1")==Result::Already,"receipt replay is harmless");
 check(Learn(s,1,"old","r2")==Result::Invalid,"stale revision rejected");
 for(int i=1;i<8;++i)Learn(s,i,"demo-1","r"+std::to_string(i+1));
 check(!s.mapJoined&&!s.bridge&&!s.finale,"eight answers do not solve physical puzzles");
 check(Act(s,Action::JoinMap)==Result::MissingItem,"map needs both physical halves");
 Act(s,Action::Collect,0);Act(s,Action::Collect,1);
 check(Act(s,Action::JoinMap)==Result::Wrong,"misaligned map rejected");
 Act(s,Action::RotateMap,1);check(Act(s,Action::JoinMap)==Result::Applied,"aligned map joined");
 check(Act(s,Action::ChoosePath,0)==Result::Wrong,"wrong landmark route reversible");
 check(Act(s,Action::ChoosePath,2)==Result::Applied,"landmark route selected");
 Act(s,Action::Collect,2);Act(s,Action::Collect,3);
 check(Act(s,Action::Anchor,2)==Result::Wrong,"rotten post rejected without consuming rope");
 check(s.inventory&4,"rope remains after wrong anchor");
 Act(s,Action::Anchor,1);Act(s,Action::Anchor,3);Act(s,Action::InstallCrank);
 check(Act(s,Action::Winch)==Result::Applied&&s.bridge,"correct rigging latches bridge");
 Act(s,Action::Collect,4);Act(s,Action::InstallFuse);
 check(Act(s,Action::Consumer,2)==Result::Overload,"pump light and radio overload is visible");
 check(!s.finale,"overload does not win");Act(s,Action::Consumer,0);
 check(s.bridge,"turning pump off preserves mechanically latched bridge");
 check(Act(s,Action::Signal)==Result::Applied&&s.finale,"manual signal finishes actual route");
 check(Valid(s),"completed state is saveable");auto broken=s;broken.fuse=false;
 check(Act(s,Action::Consumer,0)==Result::Already&&Valid(s),"finished expedition cannot invalidate save by changing power");
 check(!Valid(broken),"impossible saved finale rejected");
 broken=s;broken.rotation[0]=999;check(!Valid(broken),"corrupt map rotation rejected");
 broken=s;broken.path=12;check(!Valid(broken),"invalid route in save rejected");
 State early;check(Act(early,Action::Collect,4)==Result::Blocked,"station cannot be collected before bridge");
 early.anchor=true;check(!Valid(early),"installed anchor requires learned route and rope");early.anchor=false;early.crank=true;check(!Valid(early),"installed crank requires actual crank and route");early.crank=false;
 check(Act(early,Action::Winch)==Result::Blocked,"winch cannot bypass lesson route");
 std::printf("PASS %d behavior checks\n",checks);
}

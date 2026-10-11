#pragma once
#include "IslandRules.h"
#include <cstdint>
#include <limits>
namespace Island {
inline double LevelOneGroundZ(double x,double /*y*/=0){
 auto smooth=[](double t){return t*t*(3-2*t);};
 if(x<=-2650||x>=-1450)return 0;
 if(x< -2200)return 90*smooth((x+2650)/450);
 if(x<=-2000)return 90;
 return 90*(1-smooth((x+2000)/550));
}
inline bool LevelOnePoseInBounds(double x,double y,double z){return std::isfinite(x)&&std::isfinite(y)&&std::isfinite(z)&&x>=-3050&&x<=1770&&std::abs(y)<=1050&&z>=40&&z<=400;}
struct LevelOneFootVisit {
 int tile=-1;double dwell=0;bool consumed=false,needsExit=false;
 void Reset(){tile=-1;dwell=0;consumed=false;needsExit=false;}
 void BlockUntilExit(){needsExit=true;consumed=true;dwell=0;}
 int Update(int next,double dt,bool eligible,bool grounded){
  if(next<0){Reset();return -1;}
  if(needsExit)return -1;
  if(next!=tile){tile=next;dwell=0;consumed=false;}
  if(!eligible||!grounded||!std::isfinite(dt)||dt<0){dwell=0;return -1;}
  dwell+=dt;if(consumed||dwell<.30)return -1;consumed=true;return tile;
 }
};
struct LevelOneIntentGuard {
 std::uint64_t frame=std::numeric_limits<std::uint64_t>::max();int target=-1;
 bool Admit(std::uint64_t next,int id){if(frame==next&&target==id)return false;frame=next;target=id;return true;}
};
inline Result LevelOneStartPath(State& s){if(s.pathActive||s.pathCount>0||s.pathFailed||s.verbs)return Result::Already;return Apply(s,Action::PathStart);}
}

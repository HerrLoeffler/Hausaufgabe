#pragma once
#include <string>
#include <set>
namespace Expedition {
enum class Result {Applied,Already,Invalid,MissingItem,Wrong,Blocked,Overload};
enum class Action {Collect,RotateMap,JoinMap,ChoosePath,Anchor,InstallCrank,Winch,InstallFuse,Consumer,Signal};
struct State {int slots=0,inventory=0,rotation[2]={0,0},path=-1,consumers=3;bool mapJoined=false,anchor=false,ropeEnd=false,crank=false,bridge=false,fuse=false,finale=false;std::set<std::string> receipts;};
inline Result Learn(State& s,int slot,const std::string& revision,const std::string& id){
 if(slot<0||slot>7||revision!="demo-1"||id.empty())return Result::Invalid;
 if(s.receipts.count(id)||((s.slots>>slot)&1))return Result::Already;
 s.receipts.insert(id);s.slots|=1<<slot;return Result::Applied;
}
inline bool Has(const State& s,int mask){return (s.slots&mask)==mask;}
inline int Power(const State& s){return ((s.consumers&1)?4:0)+((s.consumers&2)?2:0)+((s.consumers&4)?6:0);}
inline Result Act(State& s,Action a,int v=0){
 if(s.finale)return Result::Already;
 switch(a){
 case Action::Collect:
  if(v<0||v>4)return Result::Invalid;
  if(v==4&&!s.bridge)return Result::Blocked;
  if(s.inventory&(1<<v))return Result::Already;
  s.inventory|=1<<v;return Result::Applied;
 case Action::RotateMap:
  if(v<0||v>1||s.mapJoined)return Result::Invalid;
  s.rotation[v]=(s.rotation[v]+1)%4;return Result::Applied;
 case Action::JoinMap:
  if(s.mapJoined)return Result::Already;
  if((s.inventory&3)!=3)return Result::MissingItem;
  if(!Has(s,3))return Result::Blocked;
  if(s.rotation[0]!=0||s.rotation[1]!=1)return Result::Wrong;
  s.mapJoined=true;return Result::Applied;
 case Action::ChoosePath:
  if(!s.mapJoined)return Result::Blocked;
  if(v!=2)return Result::Wrong;
  s.path=2;return Result::Applied;
 case Action::Anchor:
  if(s.path!=2||!Has(s,31))return Result::Blocked;
  if(!(s.inventory&4))return Result::MissingItem;
  if(v==1)s.anchor=true;else if(v==3)s.ropeEnd=true;else return Result::Wrong;
  return Result::Applied;
 case Action::InstallCrank:
  if(!(s.inventory&8))return Result::MissingItem;
  if(!Has(s,31)||s.path!=2)return Result::Blocked;
  s.crank=true;return Result::Applied;
 case Action::Winch:
  if(!Has(s,31)||s.path!=2)return Result::Blocked;
  if(!s.anchor||!s.ropeEnd||!s.crank)return Result::MissingItem;
  s.bridge=true;return Result::Applied;
 case Action::InstallFuse:
  if(!s.bridge)return Result::Blocked;
  if(!(s.inventory&16))return Result::MissingItem;
  s.fuse=true;return Result::Applied;
 case Action::Consumer:
  if(!s.bridge||!s.fuse||!Has(s,255))return Result::Blocked;
  if(v<0||v>2)return Result::Invalid;
  s.consumers^=1<<v;return Power(s)>8?Result::Overload:Result::Applied;
 case Action::Signal:
  if(!Has(s,255)||!s.bridge||!s.fuse||!(s.consumers&4)||Power(s)>8)return Result::Blocked;
  s.finale=true;return Result::Applied;
 }
 return Result::Invalid;
}
inline bool Valid(const State& s){
 if(s.slots<0||s.slots>255||s.inventory<0||s.inventory>31||s.consumers<0||s.consumers>7)return false;
 if(s.rotation[0]<0||s.rotation[0]>3||s.rotation[1]<0||s.rotation[1]>3||(s.path!=-1&&s.path!=2))return false;
 if(s.mapJoined&&((s.inventory&3)!=3||!Has(s,3)))return false;
 if(s.path==2&&!s.mapJoined)return false;
 if((s.anchor||s.ropeEnd)&&((s.inventory&4)==0||s.path!=2||!Has(s,31)))return false;
 if(s.crank&&((s.inventory&8)==0||s.path!=2||!Has(s,31)))return false;
 if(s.bridge&&(!Has(s,31)||s.path!=2||!s.anchor||!s.ropeEnd||!s.crank||(s.inventory&12)!=12))return false;
 if(s.fuse&&(!s.bridge||!(s.inventory&16)))return false;
 if(s.finale&&(!Has(s,255)||!s.bridge||!s.fuse||!(s.consumers&4)||Power(s)>8))return false;
 return true;
}
}

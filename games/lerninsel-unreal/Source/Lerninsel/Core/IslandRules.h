#pragma once
#include <array>
#include <string>
#include <sstream>
#include <cmath>
namespace Island {
enum class Result{Applied,Already,Full,Empty,Wrong,WrongRow,Blocked,Incomplete,TooLow,TooHigh,Invalid};
enum class Action{IntroToggle,IntroCheck,PathStart,PathStep,PathUndo,PathCheck,Pickup,Fill,Drain,PlacePlate,PlaceStand};
struct State{bool intro=false,verbs=false,water=false,carrying=false,pathActive=false,pathFailed=false;int introMask=0,pathCount=0,tenths=0,bucketPlace=0;std::array<int,3> path{{-1,-1,-1}};};
inline int CountBits(int mask){int n=0;for(int i=0;i<4;++i)n+=(mask>>i)&1;return n;}
inline Result Apply(State& s,Action a,int value=0){
 switch(a){
 case Action::IntroToggle:
  if(value<0||value>3)return Result::Invalid;
  if(s.intro)return Result::Already;
  if(s.introMask&(1<<value)){s.introMask^=1<<value;return Result::Applied;}
  if(CountBits(s.introMask)>=2)return Result::Full;
  s.introMask|=1<<value;return Result::Applied;
 case Action::IntroCheck:
  if(s.intro)return Result::Already;
  if(CountBits(s.introMask)!=2)return Result::Incomplete;
  if(s.introMask!=5)return Result::Wrong;
  s.intro=true;return Result::Applied;
 case Action::PathStart:
  if(s.verbs)return Result::Already;
  if(!s.intro)return Result::Blocked;
  s.pathActive=true;s.pathCount=0;s.pathFailed=false;s.path={{-1,-1,-1}};return Result::Applied;
 case Action::PathStep:
  if(value<0||value>8)return Result::Invalid;
  if(s.verbs)return Result::Already;
  if(!s.pathActive||s.pathFailed)return Result::Blocked;
  for(int i=0;i<s.pathCount;++i)if(s.path[i]==value)return Result::Already;
  if(value/3!=s.pathCount)return Result::WrongRow;
  s.path[s.pathCount++]=value;
  if(value%3!=value/3){s.pathFailed=true;return Result::Wrong;}
  return Result::Applied;
 case Action::PathUndo:
  if(s.verbs)return Result::Already;
  if(!s.pathActive||s.pathCount==0)return Result::Empty;
  s.path[--s.pathCount]=-1;s.pathFailed=false;return Result::Applied;
 case Action::PathCheck:
  if(s.verbs)return Result::Already;
  if(!s.pathActive||s.pathCount<3)return Result::Incomplete;
  if(s.pathFailed||s.path!=std::array<int,3>{{0,4,8}})return Result::Wrong;
  s.verbs=true;s.pathActive=false;return Result::Applied;
 case Action::Pickup:
  if(s.carrying)return Result::Already;
  s.carrying=true;return Result::Applied;
 case Action::Fill:
  if(!s.carrying)return Result::Blocked;
  if(s.tenths>=10)return Result::Full;
  ++s.tenths;return Result::Applied;
 case Action::Drain:
  if(!s.carrying)return Result::Blocked;
  if(s.tenths<=0)return Result::Empty;
  --s.tenths;return Result::Applied;
 case Action::PlacePlate:
  if(!s.carrying)return s.water?Result::Already:Result::Blocked;
  s.carrying=false;s.bucketPlace=1;
  if(s.water)return Result::Already;
  if(s.tenths<3)return Result::TooLow;
  if(s.tenths>3)return Result::TooHigh;
  s.water=true;return Result::Applied;
 case Action::PlaceStand:
  if(!s.carrying)return Result::Already;
  s.carrying=false;s.bucketPlace=0;return Result::Applied;
 }
 return Result::Invalid;
}
inline std::string Serialize(const State& s){
 std::ostringstream o;o<<"LI1 "<<s.intro<<' '<<s.verbs<<' '<<s.water<<' '<<s.carrying<<' '<<s.pathActive<<' '<<s.pathFailed<<' '<<s.introMask<<' '<<s.pathCount<<' '<<s.tenths<<' '<<s.bucketPlace;
 for(int id:s.path)o<<' '<<id;return o.str();
}
inline bool Deserialize(const std::string& text,State& out){
 std::istringstream in(text);std::string tag,tail;State s;int flags[6];
 if(!(in>>tag)||tag!="LI1")return false;
 for(int& f:flags)if(!(in>>f)||f<0||f>1)return false;
 if(!(in>>s.introMask>>s.pathCount>>s.tenths>>s.bucketPlace))return false;
 for(int& id:s.path)if(!(in>>id))return false;
 if(in>>tail)return false;
 s.intro=flags[0];s.verbs=flags[1];s.water=flags[2];s.carrying=flags[3];s.pathActive=flags[4];s.pathFailed=flags[5];
 if(s.introMask<0||s.introMask>15||CountBits(s.introMask)>2||s.pathCount<0||s.pathCount>3||s.tenths<0||s.tenths>10||s.bucketPlace<0||s.bucketPlace>1)return false;
 if(s.intro&&s.introMask!=5)return false;
 if((s.verbs||s.pathActive||s.pathCount)&&!s.intro)return false;
 for(int i=0;i<3;++i){if(i>=s.pathCount){if(s.path[i]!=-1)return false;}else if(s.path[i]<i*3||s.path[i]>=i*3+3)return false;}
 bool wrong=false;for(int i=0;i<s.pathCount;++i){if(wrong)return false;wrong=s.path[i]!=i*4;}
 if(s.pathFailed!=wrong)return false;
 if(s.verbs&&(s.pathCount!=3||wrong||s.pathActive))return false;
 if(!s.verbs&&s.pathCount&&!s.pathActive)return false;
 out=s;return true;
}
struct PlateContact{int tile=-1;float dwell=0;bool sent=false;
 void Reset(){tile=-1;dwell=0;sent=false;}
 int Update(int next,float dt,bool active){
  if(!active||next<0||!std::isfinite(dt)||dt<0){Reset();return -1;}
  if(next!=tile){tile=next;dwell=0;sent=false;}dwell+=dt;
  if(!sent&&dwell>=.30f){sent=true;return tile;}return -1;
 }
};
enum class TouchRole{None,Move,Look,Action};
struct TouchOwnership{std::array<TouchRole,10> fingers{};
 TouchRole Role(int id)const{return id>=0&&id<10?fingers[id]:TouchRole::None;}
 TouchRole Begin(int id,float x,float y){
  if(id<0||id>=10||!std::isfinite(x)||!std::isfinite(y)||x<0||x>1||y<0||y>1)return TouchRole::None;
  if(Role(id)!=TouchRole::None)return Role(id);
  TouchRole r=x<.35f?TouchRole::Move:(x>.8f&&y>.72f?TouchRole::Action:TouchRole::Look);
  for(TouchRole existing:fingers)if(existing==r&&r!=TouchRole::Action)return TouchRole::None;
  fingers[id]=r;return r;
 }
 void End(int id){if(id>=0&&id<10)fingers[id]=TouchRole::None;}
 void Cancel(){fingers.fill(TouchRole::None);}
};
}

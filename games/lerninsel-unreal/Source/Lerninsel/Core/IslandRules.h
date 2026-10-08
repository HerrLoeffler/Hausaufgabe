#pragma once
#include <array>
#include <string>
#include <sstream>
#include <cmath>
#include "IslandPuzzles.h"
namespace Island {
enum class Result{Applied,Already,Full,Empty,Wrong,WrongRow,Blocked,Incomplete,TooLow,TooHigh,WrongEdge,WrongView,Invalid};
enum class Action{IntroToggle,IntroCheck,PathStart,PathStep,PathUndo,PathCheck,Pickup,Fill,Drain,PlacePlate,PlaceStand,SentenceStart,SentencePick,SentenceUndo,SentenceCheck,RouteStart,RouteNode,RouteUndo,RouteCheck,Find,CoastToggle,CoastCheck,CoastConfirm,FinaleCheck,BonusAnswer};
struct State{bool intro=false,verbs=false,water=false,carrying=false,pathActive=false,pathFailed=false;int introMask=0,pathCount=0,tenths=0,bucketPlace=0;std::array<int,3> path{{-1,-1,-1}};bool sentence=false,fractions=false,coast=false,finale=false,coastReady=false,sentenceActive=false,routeActive=false;int sentenceCount=0,routeCount=0,foundMask=0,coastMask=0,bonusMask=0;std::array<int,4> sentenceParts{{-1,-1,-1,-1}};std::array<int,5> route{{-1,-1,-1,-1,-1}};};
inline int PathPromptRow(const State& s){int Row=s.pathFailed?s.pathCount:s.pathCount+1;return Row<1?1:Row>3?3:Row;}
inline int CountBits(int mask){int n=0;for(int i=0;i<4;++i)n+=(mask>>i)&1;return n;}
inline Result ApplyPuzzle(State&,Action,int);
inline Result Apply(State& s,Action a,int value=0){
 if(a>=Action::SentenceStart)return ApplyPuzzle(s,a,value);
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
 default:break;
 }
 return Result::Invalid;
}
inline Result ApplyPuzzle(State& s,Action a,int value){
 switch(a){
 case Action::SentenceStart:
  if(s.sentence)return Result::Already;
  if(!s.verbs)return Result::Blocked;
  s.sentenceActive=true;s.sentenceCount=0;s.sentenceParts.fill(-1);return Result::Applied;
 case Action::SentencePick:
  if(value<0||value>3)return Result::Invalid;
  if(s.sentence)return Result::Already;
  if(!s.sentenceActive)return Result::Blocked;
  for(int i=0;i<s.sentenceCount;++i)if(s.sentenceParts[i]==value)return Result::Already;
  if(s.sentenceCount==4)return Result::Full;
  s.sentenceParts[s.sentenceCount++]=value;return Result::Applied;
 case Action::SentenceUndo:
  if(s.sentence)return Result::Already;
  if(!s.sentenceActive||s.sentenceCount==0)return Result::Empty;
  s.sentenceParts[--s.sentenceCount]=-1;return Result::Applied;
 case Action::SentenceCheck:
  if(s.sentence)return Result::Already;
  if(s.sentenceCount!=4)return Result::Incomplete;
  if(!SentenceValid(s.sentenceParts))return Result::Wrong;
  s.sentence=true;s.sentenceActive=false;return Result::Applied;
 case Action::RouteStart:
  if(s.fractions)return Result::Already;
  if(!s.sentence||!s.water)return Result::Blocked;
  s.routeActive=true;s.routeCount=1;s.route.fill(-1);s.route[0]=0;return Result::Applied;
 case Action::RouteNode:
  if(value<0||value>10)return Result::Invalid;
  if(s.fractions)return Result::Already;
  if(!s.routeActive||s.routeCount<1)return Result::Blocked;
  if(s.route[s.routeCount-1]==value)return Result::Already;
  if(s.routeCount>1&&s.route[s.routeCount-2]==value){s.route[--s.routeCount]=-1;return Result::Applied;}
  if(s.routeCount>=5||!RouteStepAllowed(s.route[s.routeCount-1],value))return Result::WrongEdge;
  s.route[s.routeCount++]=value;return Result::Applied;
 case Action::RouteUndo:
  if(s.fractions)return Result::Already;
  if(!s.routeActive||s.routeCount<=1)return Result::Empty;
  s.route[--s.routeCount]=-1;return Result::Applied;
 case Action::RouteCheck:{
  if(s.fractions)return Result::Already;
  const int sum=RouteTenths(s.route,s.routeCount);if(sum<0)return Result::Incomplete;
  if(sum<10)return Result::TooLow;if(sum>10)return Result::TooHigh;
  s.fractions=true;s.routeActive=false;return Result::Applied;}
 case Action::Find:
  if(value<0||value>3)return Result::Invalid;
  if(!s.fractions)return Result::Blocked;
  if(s.foundMask&(1<<value))return Result::Already;
  s.foundMask|=1<<value;return Result::Applied;
 case Action::CoastToggle:
  if(value<0||value>3)return Result::Invalid;
  if(s.coast)return Result::Already;
  if(!(s.foundMask&(1<<value)))return Result::Blocked;
  if(s.coastMask&(1<<value))s.coastMask^=1<<value;
  else {if(CountBits(s.coastMask)>=3)return Result::Full;s.coastMask|=1<<value;}
  s.coastReady=false;return Result::Applied;
 case Action::CoastCheck:{
  if(s.coast)return Result::Already;
  if(CountBits(s.coastMask)!=3)return Result::Incomplete;
  const int sum=CoastTenths(s.coastMask);if(sum<10)return Result::TooLow;if(sum>10)return Result::TooHigh;
  s.coastReady=true;return Result::Applied;}
 case Action::CoastConfirm:
  if(s.coast)return Result::Already;
  if(!s.coastReady)return Result::Blocked;
  if(value!=1)return Result::WrongView;
  s.coast=true;return Result::Applied;
 case Action::FinaleCheck:
  if(s.finale)return Result::Already;
  if(!s.verbs||!s.sentence||!s.fractions||!s.coast)return Result::Blocked;
  s.finale=true;return Result::Applied;
 case Action::BonusAnswer:{
  const int question=value/10,option=value%10;if(value<0||question>1||option>3)return Result::Invalid;
  if(question==0?!s.verbs:!s.fractions)return Result::Blocked;
  if(option!=2)return Result::Wrong;
  const int bit=1<<question;if(s.bonusMask&bit)return Result::Already;s.bonusMask|=bit;return Result::Applied;}
 default:return Result::Invalid;
 }
}
inline std::string SerializeLegacy(const State& s){
 std::ostringstream o;o<<"LI1 "<<s.intro<<' '<<s.verbs<<' '<<s.water<<' '<<s.carrying<<' '<<s.pathActive<<' '<<s.pathFailed<<' '<<s.introMask<<' '<<s.pathCount<<' '<<s.tenths<<' '<<s.bucketPlace;
 for(int id:s.path)o<<' '<<id;return o.str();
}
inline bool DeserializeLegacy(const std::string& text,State& out){
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
inline std::string Serialize(const State& s){
 std::string base=SerializeLegacy(s);base.replace(0,3,"LI2");std::ostringstream o;o<<base<<' '<<s.sentence<<' '<<s.fractions<<' '<<s.coast<<' '<<s.finale<<' '<<s.coastReady<<' '<<s.sentenceActive<<' '<<s.routeActive<<' '<<s.sentenceCount<<' '<<s.routeCount<<' '<<s.foundMask<<' '<<s.coastMask<<' '<<s.bonusMask;
 for(int id:s.sentenceParts)o<<' '<<id;for(int id:s.route)o<<' '<<id;return o.str();
}
inline bool Deserialize(const std::string& text,State& out){
 std::istringstream in(text);std::string tag;if(!(in>>tag))return false;if(tag=="LI1")return DeserializeLegacy(text,out);if(tag!="LI2")return false;
 std::ostringstream old;old<<"LI1";for(int i=0;i<13;++i){std::string token;if(!(in>>token))return false;old<<' '<<token;}
 State s;if(!DeserializeLegacy(old.str(),s))return false;int flags[7];for(int& f:flags)if(!(in>>f)||f<0||f>1)return false;
 s.sentence=flags[0];s.fractions=flags[1];s.coast=flags[2];s.finale=flags[3];s.coastReady=flags[4];s.sentenceActive=flags[5];s.routeActive=flags[6];
 if(!(in>>s.sentenceCount>>s.routeCount>>s.foundMask>>s.coastMask>>s.bonusMask))return false;for(int& id:s.sentenceParts)if(!(in>>id))return false;for(int& id:s.route)if(!(in>>id))return false;std::string extra;if(in>>extra)return false;
 if(s.sentenceCount<0||s.sentenceCount>4||s.routeCount<0||s.routeCount>5||s.foundMask<0||s.foundMask>15||s.coastMask<0||s.coastMask>15||s.bonusMask<0||s.bonusMask>3)return false;
 int used=0;for(int i=0;i<4;++i){int id=s.sentenceParts[i];if(i>=s.sentenceCount){if(id!=-1)return false;}else{if(id<0||id>3||(used&(1<<id)))return false;used|=1<<id;}}
 if((s.sentenceActive||s.sentenceCount||s.sentence)&&!s.verbs)return false;
 if(s.sentence&&(s.sentenceCount!=4||!SentenceValid(s.sentenceParts)||s.sentenceActive))return false;
 if(s.sentenceCount&&!s.sentence&&!s.sentenceActive)return false;
 for(int i=0;i<5;++i){if(i>=s.routeCount){if(s.route[i]!=-1)return false;}else if(i==0){if(s.route[i]!=0)return false;}else if(!RouteStepAllowed(s.route[i-1],s.route[i]))return false;}
 if((s.routeCount||s.routeActive||s.fractions)&&(!s.sentence||!s.water))return false;
 if(s.routeActive&&s.routeCount<1)return false;
 if(s.routeCount&&!s.fractions&&!s.routeActive)return false;
 if(s.fractions&&(s.routeActive||RouteTenths(s.route,s.routeCount)!=10))return false;
 if(s.foundMask&&!s.fractions)return false;if(s.coastMask&~s.foundMask)return false;if(CountBits(s.coastMask)>3)return false;
 if(s.coastReady&&(CountBits(s.coastMask)!=3||CoastTenths(s.coastMask)!=10))return false;
 if(s.coast&&!s.coastReady)return false;if(s.finale&&(!s.verbs||!s.sentence||!s.fractions||!s.coast))return false;
 if((s.bonusMask&1)&&!s.verbs)return false;if((s.bonusMask&2)&&!s.fractions)return false;
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

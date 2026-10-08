#include "../Source/Lerninsel/Core/IslandPuzzles.h"
#include "../Source/Lerninsel/Core/IslandRules.h"
#include <algorithm>
#include <iostream>
#include <stdexcept>
#include <limits>
using namespace Island;
int n=0;
#define CHECK(x) do{++n;if(!(x))throw std::runtime_error(#x);}while(0)
int main(){try{
 std::array<int,4> p{{0,1,2,3}};int valid=0;do{bool ok=SentenceValid(p);CHECK(ok==(p[1]==1));valid+=ok;}while(std::next_permutation(p.begin(),p.end()));CHECK(valid==6);CHECK(!SentenceValid({{0,1,2,2}}));
 CHECK(RouteStepAllowed(0,1)&&RouteStepAllowed(0,4)&&RouteStepAllowed(0,7));CHECK(!RouteStepAllowed(1,5)&&!RouteStepAllowed(0,10));CHECK(RouteTenths({{0,1,2,3,10}},5)==10);CHECK(RouteTenths({{0,4,5,6,10}},5)==8);CHECK(RouteTenths({{0,7,8,9,10}},5)==7);CHECK(RouteTenths({{0,1,2,3,10}},4)==-1);
 CHECK(CoastTenths(7)==7&&CoastTenths(11)==8&&CoastTenths(13)==10&&CoastTenths(14)==11);CHECK(ViewAligned(75,5,7));CHECK(!ViewAligned(75.01f,0,0));CHECK(!ViewAligned(0,5.01f,0));CHECK(!ViewAligned(0,0,7.01f));CHECK(!ViewAligned(0,std::numeric_limits<float>::quiet_NaN(),0));
 State s;CHECK(Apply(s,Action::SentenceStart)==Result::Blocked);CHECK(Apply(s,Action::RouteStart)==Result::Blocked);CHECK(Apply(s,Action::Find,0)==Result::Blocked);
 for(int id:{0,2})Apply(s,Action::IntroToggle,id);Apply(s,Action::IntroCheck);Apply(s,Action::PathStart);for(int id:{0,4,8})Apply(s,Action::PathStep,id);Apply(s,Action::PathCheck);
 CHECK(Apply(s,Action::SentenceStart)==Result::Applied);CHECK(Apply(s,Action::SentencePick,0)==Result::Applied);CHECK(Apply(s,Action::SentencePick,0)==Result::Already&&s.sentenceCount==1);CHECK(Apply(s,Action::SentenceCheck)==Result::Incomplete);
 for(int id:{2,1,3})Apply(s,Action::SentencePick,id);CHECK(Apply(s,Action::SentenceCheck)==Result::Wrong&&!s.sentence);CHECK(Apply(s,Action::SentenceStart)==Result::Applied);for(int id:{3,1,0,2})Apply(s,Action::SentencePick,id);CHECK(Apply(s,Action::SentenceCheck)==Result::Applied&&s.sentence);CHECK(Apply(s,Action::SentenceUndo)==Result::Already&&s.sentence);
 CHECK(Apply(s,Action::RouteStart)==Result::Blocked);Apply(s,Action::Pickup);for(int i=0;i<3;++i)Apply(s,Action::Fill);Apply(s,Action::PlacePlate);
 CHECK(Apply(s,Action::RouteStart)==Result::Applied&&s.routeCount==1);CHECK(Apply(s,Action::RouteNode,10)==Result::WrongEdge&&s.routeCount==1);CHECK(Apply(s,Action::RouteNode,1)==Result::Applied);CHECK(Apply(s,Action::RouteNode,1)==Result::Already&&s.routeCount==2);CHECK(Apply(s,Action::RouteNode,5)==Result::WrongEdge);CHECK(Apply(s,Action::RouteNode,0)==Result::Applied&&s.routeCount==1);
 for(int id:{4,5,6,10})Apply(s,Action::RouteNode,id);CHECK(Apply(s,Action::RouteCheck)==Result::TooLow&&!s.fractions);CHECK(Apply(s,Action::RouteUndo)==Result::Applied&&s.routeCount==4);Apply(s,Action::RouteStart);for(int id:{1,2,3,10})Apply(s,Action::RouteNode,id);CHECK(Apply(s,Action::RouteCheck)==Result::Applied&&s.fractions);CHECK(Apply(s,Action::RouteStart)==Result::Already);
 CHECK(Apply(s,Action::CoastToggle,0)==Result::Blocked);for(int id:{0,1,2,3})CHECK(Apply(s,Action::Find,id)==Result::Applied);CHECK(Apply(s,Action::Find,0)==Result::Already);for(int id:{0,1,2})Apply(s,Action::CoastToggle,id);CHECK(Apply(s,Action::CoastToggle,3)==Result::Full);CHECK(Apply(s,Action::CoastCheck)==Result::TooLow&&!s.coastReady);Apply(s,Action::CoastToggle,1);Apply(s,Action::CoastToggle,3);CHECK(Apply(s,Action::CoastCheck)==Result::Applied&&s.coastReady&&!s.coast);CHECK(Apply(s,Action::CoastConfirm,0)==Result::WrongView&&!s.coast);CHECK(Apply(s,Action::CoastConfirm,1)==Result::Applied&&s.coast);CHECK(Apply(s,Action::CoastToggle,0)==Result::Already&&s.coast);CHECK(Apply(s,Action::FinaleCheck)==Result::Applied&&s.finale);CHECK(Apply(s,Action::FinaleCheck)==Result::Already);
 CHECK(Apply(s,Action::BonusAnswer,0)==Result::Wrong);CHECK(Apply(s,Action::BonusAnswer,2)==Result::Applied);CHECK(Apply(s,Action::BonusAnswer,12)==Result::Applied&&s.bonusMask==3);CHECK(Apply(s,Action::BonusAnswer,99)==Result::Invalid);
 State out;CHECK(Deserialize(Serialize(s),out)&&out.finale&&out.coast&&out.bonusMask==3);const auto old=Serialize(out);CHECK(!Deserialize(Serialize(s)+" garbage",out)&&Serialize(out)==old);
 State corrupt=s;corrupt.coastMask=15;CHECK(!Deserialize(Serialize(corrupt),out)&&Serialize(out)==old);corrupt=s;corrupt.coastMask=15;corrupt.coastReady=false;corrupt.coast=false;corrupt.finale=false;CHECK(!Deserialize(Serialize(corrupt),out)&&Serialize(out)==old);corrupt=s;corrupt.route[2]=5;CHECK(!Deserialize(Serialize(corrupt),out));corrupt=s;corrupt.sentenceParts[1]=0;CHECK(!Deserialize(Serialize(corrupt),out));corrupt=s;corrupt.foundMask=1;CHECK(!Deserialize(Serialize(corrupt),out));
 CHECK(Deserialize("LI1 1 1 1 0 0 0 5 3 3 1 0 4 8",out)&&out.verbs&&out.water&&!out.sentence&&!out.fractions&&!out.coast);CHECK(Serialize(out).find("LI2 ")==0);CHECK(Apply(out,Action::FinaleCheck)==Result::Blocked);
 std::cout<<"PASS "<<n<<" puzzle checks\n";return 0;
}catch(const std::exception& e){std::cerr<<"FAIL after "<<n<<": "<<e.what()<<"\n";return 1;}}

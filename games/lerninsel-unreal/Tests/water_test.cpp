#include "../Source/Lerninsel/Core/IslandRules.h"
#include <iostream>
#include <stdexcept>
using namespace Island;int n=0;
#define CHECK(x) do{++n;if(!(x))throw std::runtime_error(#x);}while(0)
int main(){try{
State s;CHECK(Apply(s,Action::CupAdjust,1)==Result::Blocked);CHECK(Apply(s,Action::CupPour)==Result::Blocked);
for(int id:{0,2})Apply(s,Action::IntroToggle,id);Apply(s,Action::IntroCheck);Apply(s,Action::PathStart);for(int id:{0,4,8})Apply(s,Action::PathStep,id);Apply(s,Action::PathCheck);Apply(s,Action::SentenceStart);for(int id:{0,1,2,3})Apply(s,Action::SentencePick,id);Apply(s,Action::SentenceCheck);Apply(s,Action::Pickup);for(int i=0;i<3;++i)Apply(s,Action::Fill);Apply(s,Action::PlacePlate);
CHECK(s.water&&s.tenths==3&&!s.carrying);CHECK(Apply(s,Action::CupAdjust,1)==Result::Blocked);Apply(s,Action::Pickup);
CHECK(Apply(s,Action::CupPour)==Result::TooLow&&s.tenths==3&&!s.fractions);
CHECK(Apply(s,Action::CupAdjust,2)==Result::Applied&&s.tenths==5);
CHECK(Apply(s,Action::CupAdjust,-1)==Result::Applied&&s.tenths==4);
for(int i=0;i<3;++i)Apply(s,Action::CupAdjust,2);CHECK(s.tenths==10);
CHECK(Apply(s,Action::CupAdjust,1)==Result::Full&&s.tenths==10);
Apply(s,Action::CupAdjust,-1);CHECK(Apply(s,Action::CupAdjust,2)==Result::Full&&s.tenths==9);
CHECK(Apply(s,Action::CupAdjust,0)==Result::Invalid&&s.tenths==9);
CHECK(Apply(s,Action::CupAdjust,3)==Result::Invalid&&s.tenths==9);
Apply(s,Action::CupAdjust,1);CHECK(Apply(s,Action::CupPour)==Result::Applied&&s.fractions&&s.wholePoured&&s.carrying&&s.tenths==0);
CHECK(s.routeCount==0&&!s.routeActive);CHECK(Apply(s,Action::CupPour)==Result::Already&&s.tenths==0);
CHECK(Apply(s,Action::CupAdjust,-1)==Result::Empty&&s.tenths==0);
State restored;CHECK(Deserialize(Serialize(s),restored)&&restored.wholePoured&&restored.fractions&&restored.tenths==0);
const auto valid=Serialize(restored);State bad=s;bad.wholePoured=false;CHECK(!Deserialize(Serialize(bad),restored)&&Serialize(restored)==valid);bad=s;bad.fractions=false;CHECK(!Deserialize(Serialize(bad),restored)&&Serialize(restored)==valid);bad=s;bad.routeCount=5;bad.route={{0,1,2,3,10}};CHECK(!Deserialize(Serialize(bad),restored));
CHECK(!Deserialize(Serialize(s)+" garbage",restored));
CHECK(Deserialize("LI2 1 1 1 0 0 0 5 3 3 1 0 4 8 1 1 0 0 0 0 0 4 5 0 0 0 0 1 2 3 0 1 2 3 10",restored)&&restored.fractions&&!restored.wholePoured);
CHECK(Deserialize("LI1 1 1 1 0 0 0 5 3 3 1 0 4 8",restored)&&restored.water&&!restored.fractions);
State pending=s;pending.fractions=pending.wholePoured=false;pending.tenths=9;CHECK(Deserialize(Serialize(pending),restored)&&restored.tenths==9&&!restored.fractions);
std::cout<<"PASS "<<n<<" water checks\n";return 0;
}catch(const std::exception& e){std::cerr<<"FAIL after "<<n<<": "<<e.what()<<"\n";return 1;}}

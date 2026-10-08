#include "../Source/Lerninsel/Core/IslandFoxCue.h"
#include <iostream>
#include <stdexcept>
#include <limits>
using namespace Island;int n=0;
#define CHECK(x) do{++n;if(!(x))throw std::runtime_error(#x);}while(0)
int main(){try{
CHECK(FoxCueAt(100,false).phase==FoxPhase::Stone&&!FoxCueAt(100,false).released);
CHECK(FoxCueAt(.8f,true).color>.49f&&FoxCueAt(.8f,true).color<.51f);
CHECK(FoxCueAt(1.6f,true).phase==FoxPhase::Rising);
CHECK(FoxCueAt(2.4f,true).phase==FoxPhase::Walking);
CHECK(FoxCueAt(4.4f,true).walk>.49f&&FoxCueAt(4.4f,true).walk<.51f);
CHECK(FoxCueAt(6.4f,true).phase==FoxPhase::Gripping);
CHECK(FoxCueAt(7.4f,true).phase==FoxPhase::Pulling);
CHECK(FoxCueAt(8.39f,true).pull>.98f&&!FoxCueAt(8.39f,true).released);
CHECK(FoxCueAt(8.4f,true).phase==FoxPhase::Opening&&FoxCueAt(8.4f,true).released);
CHECK(FoxCueAt(9.8f,true).phase==FoxPhase::Resting);
CHECK(FoxCueAt(-1,true).phase==FoxPhase::Stone&&!FoxCueAt(-1,true).released);
CHECK(!FoxCueAt(std::numeric_limits<float>::quiet_NaN(),true).released);
std::cout<<"PASS "<<n<<" fox cue checks\n";return 0;
}catch(const std::exception& e){std::cerr<<"FAIL after "<<n<<": "<<e.what()<<"\n";return 1;}}

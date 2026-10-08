#include "../Source/Lerninsel/Core/IslandControls.h"
#include <iostream>
#include <stdexcept>
#include <limits>
int n=0;
#define CHECK(x) do{++n;if(!(x))throw std::runtime_error(#x);}while(0)
int main(){try{
CHECK(Island::NormalizeSensitivity(2.f)==2.f);
CHECK(Island::NormalizeSensitivity(.1f)==.25f);
CHECK(Island::NormalizeSensitivity(9.f)==3.f);
CHECK(Island::NormalizeSensitivity(-5.f)==.25f);
CHECK(Island::NormalizeSensitivity(std::numeric_limits<float>::quiet_NaN())==1.f);
CHECK(Island::NormalizeSensitivity(std::numeric_limits<float>::infinity())==1.f);
CHECK(Island::NormalizeSensitivity(1.f)==1.f);
std::cout<<"PASS "<<n<<" control checks\n";return 0;
}catch(const std::exception& e){std::cerr<<"FAIL after "<<n<<": "<<e.what()<<"\n";return 1;}}

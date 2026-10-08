#pragma once
#include <cmath>
namespace Island {
enum class FoxPhase{Stone,Waking,Rising,Walking,Gripping,Pulling,Opening,Resting};
struct FoxCue{FoxPhase phase=FoxPhase::Stone;float color=0,walk=0,pull=0;bool released=false;};
inline FoxCue FoxCueAt(float t,bool solved){
 if(!solved||!std::isfinite(t)||t<0)return {};
 FoxCue cue;cue.color=t<1.6f?t/1.6f:1.f;
 if(t<1.6f)cue.phase=FoxPhase::Waking;
 else if(t<2.4f)cue.phase=FoxPhase::Rising;
 else if(t<6.4f){cue.phase=FoxPhase::Walking;cue.walk=(t-2.4f)/4.f;}
 else {cue.walk=1;if(t<7.4f)cue.phase=FoxPhase::Gripping;else if(t<8.4f){cue.phase=FoxPhase::Pulling;cue.pull=t-7.4f;}else{cue.pull=1;cue.released=true;cue.phase=t<9.8f?FoxPhase::Opening:FoxPhase::Resting;}}
 return cue;
}
}

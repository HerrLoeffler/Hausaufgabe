#pragma once
#include <array>
#include <cmath>
namespace Island {
inline bool SentenceValid(const std::array<int,4>& parts){int mask=0;for(int id:parts){if(id<0||id>3||(mask&(1<<id)))return false;mask|=1<<id;}return mask==15&&parts[1]==1;}
inline bool RouteStepAllowed(int previous,int next){if(previous<0||previous>9||next<1||next>10)return false;if(previous==0)return next==1||next==4||next==7;if(previous==3||previous==6||previous==9)return next==10;return next==previous+1;}
inline int RouteTenths(const std::array<int,5>& route,int count){if(count!=5||route[0]!=0||route[4]!=10)return -1;for(int i=1;i<5;++i)if(!RouteStepAllowed(route[i-1],route[i]))return -1;static constexpr int portions[11]={0,5,3,2,5,2,1,3,2,2,0};int sum=0;for(int i=1;i<4;++i)sum+=portions[route[i]];return sum;}
inline int CoastTenths(int mask){if(mask<0||mask>15)return -1;static constexpr int portions[4]={1,2,4,5};int sum=0;for(int i=0;i<4;++i)if(mask&(1<<i))sum+=portions[i];return sum;}
inline bool ViewAligned(float distance,float yawError,float pitchError){return std::isfinite(distance)&&std::isfinite(yawError)&&std::isfinite(pitchError)&&distance>=0&&distance<=75&&std::abs(yawError)<=5&&std::abs(pitchError)<=7;}
}

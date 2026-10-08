#pragma once
#include <string>
#include <utility>
#include <array>
#include <cctype>
#include <charconv>
namespace ExpeditionV2 {
enum class Result {Applied,Already,Invalid,MissingItem,Wrong,Blocked};
struct State {
 std::string revision="master-1";
 int school=0,logic=0,anchors=0,mosaic=-1,turn=0;
 bool shell=false,finale=false;
 int symbols[3]={-1,-1,-1},failures[7]={};
 bool transfer[7]={},pending[7]={};
};
inline bool HasSchool(const State& s,int id){return id>=0&&id<7&&(s.school&(1<<id));}
inline bool HasLogic(const State& s,int id){return id>=0&&id<5&&(s.logic&(1<<id));}
inline std::string Compact(const std::string& a){std::string r;for(unsigned char c:a)if(!std::isspace(c)&&c!='%')r+=static_cast<char>(std::tolower(c));return r;}
inline std::pair<int,int> ParseFraction(const std::string& text){
 auto s=Compact(text);auto slash=s.find('/');int n=0,d=1;
 auto read=[](const std::string& t,int& v){if(t.empty()||t.size()>8)return false;auto x=std::from_chars(t.data(),t.data()+t.size(),v);return x.ec==std::errc()&&x.ptr==t.data()+t.size()&&v>=0&&v<=100000;};
 if(slash==std::string::npos){if(!read(s,n))return {0,0};}
 else if(!read(s.substr(0,slash),n)||!read(s.substr(slash+1),d)||d==0)return {0,0};
 return {n,d};
}
inline bool Matches(const std::string& a,const std::string& expected){auto x=ParseFraction(a),y=ParseFraction(expected);if(x.second&&y.second)return static_cast<long long>(x.first)*y.second==static_cast<long long>(y.first)*x.second;return Compact(a)==Compact(expected);}
inline bool SchoolReady(const State& s,int id){switch(id){case 0:return true;case 1:return HasSchool(s,0);case 2:return HasSchool(s,1);case 3:return HasLogic(s,1);case 4:return HasLogic(s,2);case 5:return HasLogic(s,3);case 6:return HasSchool(s,5);default:return false;}}
inline Result School(State& s,int id,const std::string& answer){
 if(id<0||id>=7)return Result::Invalid;
 if(HasSchool(s,id))return Result::Already;
 if(!SchoolReady(s,id))return Result::Blocked;
 const char* base[]={"5","1/4","6","75","3/4","4","3/4"};
 const char* other[]={"3","3/4","5","25","1/2","2","ja"};
 if(!Matches(answer,s.pending[id]?other[id]:base[id])){s.failures[id]++;if(s.failures[id]>=2)s.transfer[id]=true;return Result::Wrong;}
 if(s.transfer[id]&&!s.pending[id]){s.pending[id]=true;return Result::Applied;}
 s.school|=1<<id;s.pending[id]=false;return Result::Applied;
}
inline Result CollectShell(State& s){if(s.shell)return Result::Already;s.shell=true;return Result::Applied;}
inline Result UseShell(State& s,int item){if(HasLogic(s,0))return Result::Already;if(item!=0)return Result::Wrong;if(!s.shell)return Result::MissingItem;s.logic|=1;return Result::Applied;}
inline Result ChooseRoute(State& s,int route){if(HasLogic(s,1))return Result::Already;if(!HasSchool(s,2))return Result::Blocked;if(route!=2)return Result::Wrong;s.logic|=2;return Result::Applied;}
inline Result SelectAnchor(State& s,int anchor){if(HasLogic(s,2))return Result::Already;if(!HasSchool(s,3))return Result::Blocked;if(!HasLogic(s,0))return Result::MissingItem;if(anchor<0||anchor>2)return Result::Invalid;s.anchors^=1<<anchor;return Result::Applied;}
inline Result Tension(State& s){if(HasLogic(s,2))return Result::Already;if(!HasSchool(s,3))return Result::Blocked;if(!HasLogic(s,0))return Result::MissingItem;if(s.anchors!=5)return Result::Wrong;s.logic|=4;return Result::Applied;}
inline Result PickMosaic(State& s,int piece){if(HasLogic(s,3))return Result::Already;if(!HasSchool(s,4))return Result::Blocked;if(piece<0||piece>2)return Result::Invalid;s.mosaic=piece;s.turn=0;return Result::Applied;}
inline Result RotateMosaic(State& s){if(HasLogic(s,3))return Result::Already;if(!HasSchool(s,4)||s.mosaic<0)return Result::Blocked;s.turn=(s.turn+1)%4;return Result::Applied;}
inline Result PlaceMosaic(State& s){if(HasLogic(s,3))return Result::Already;if(!HasSchool(s,4))return Result::Blocked;if(s.mosaic!=2||s.turn!=0)return Result::Wrong;s.logic|=8;return Result::Applied;}
inline Result PutSymbol(State& s,int symbol){
 if(HasLogic(s,4))return Result::Already;if(!HasSchool(s,6))return Result::Blocked;if(symbol<0||symbol>2)return Result::Invalid;
 for(int& i:s.symbols)if(i==symbol){i=-1;return Result::Applied;}
 for(int& i:s.symbols)if(i<0){i=symbol;return Result::Applied;}return Result::Invalid;
}
inline void ClearSymbols(State& s){if(!HasLogic(s,4))for(int& i:s.symbols)i=-1;}
inline Result ConfirmSymbols(State& s){if(HasLogic(s,4))return Result::Already;if(!HasSchool(s,6))return Result::Blocked;if(s.symbols[0]!=0||s.symbols[1]!=1||s.symbols[2]!=2)return Result::Wrong;s.logic|=16;return Result::Applied;}
inline Result Ignite(State& s){if(s.finale)return Result::Already;if(!HasLogic(s,4))return Result::Blocked;s.finale=true;return Result::Applied;}
// 0 absent, 1 in bag, 2 used at confirmed world target. Six permanent slots.
inline int ItemState(const State& s,int item){switch(item){case 0:return s.shell?(HasLogic(s,0)?2:1):0;case 1:return HasSchool(s,0)?(HasSchool(s,1)?2:1):0;case 2:return HasLogic(s,0)?(HasLogic(s,2)?2:1):0;case 3:return HasSchool(s,2)?(HasLogic(s,4)?2:1):0;case 4:return HasSchool(s,4)?(HasLogic(s,4)?2:1):0;case 5:return HasLogic(s,3)?(HasLogic(s,4)?2:1):0;default:return 0;}}
inline bool Validate(const State& s){
 if(s.revision!="master-1"||s.school<0||s.school>127||s.logic<0||s.logic>31||s.anchors<0||s.anchors>7||s.mosaic<-1||s.mosaic>2||s.turn<0||s.turn>3)return false;
 for(int i=0;i<7;++i){if(HasSchool(s,i)&&!SchoolReady(s,i))return false;if(s.failures[i]<0||s.failures[i]>100000)return false;if(s.pending[i]&&(!s.transfer[i]||HasSchool(s,i)||!SchoolReady(s,i)))return false;}
 if(HasLogic(s,0)&&!s.shell)return false;
 if(HasLogic(s,1)&&!HasSchool(s,2))return false;
 if(HasLogic(s,2)&&(!HasSchool(s,3)||!HasLogic(s,0)||s.anchors!=5))return false;
 if(HasLogic(s,3)&&(!HasSchool(s,4)||s.mosaic!=2||s.turn!=0))return false;
 if(HasLogic(s,4)&&(!HasSchool(s,6)||s.symbols[0]!=0||s.symbols[1]!=1||s.symbols[2]!=2))return false;
 for(int i=0;i<3;++i){if(s.symbols[i]<-1||s.symbols[i]>2)return false;for(int j=i+1;j<3;++j)if(s.symbols[i]>=0&&s.symbols[i]==s.symbols[j])return false;}
 return !s.finale||HasLogic(s,4);
}
}

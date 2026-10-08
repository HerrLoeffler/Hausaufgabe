#include "../Source/Expedition/Core/ExpeditionEpisode.h"
#include "../Source/Expedition/Core/ExpeditionInput.h"
#include <iostream>
#include <algorithm>
using namespace ExpeditionV2;
int Count=0;
void Check(bool ok,const char* name){if(!ok){std::cerr<<"FAIL "<<name<<'\n';std::exit(1);}++Count;}
State Shore(){State s;School(s,0,"5");School(s,1,"2/8");School(s,2,"6");ChooseRoute(s,2);School(s,3,"75%");return s;}
State Mosaic(){State s=Shore();CollectShell(s);UseShell(s,0);SelectAnchor(s,0);SelectAnchor(s,2);Tension(s);School(s,4,"3/4");return s;}
State Ruin(){State s=Mosaic();PickMosaic(s,2);PlaceMosaic(s);School(s,5,"4");School(s,6,"3/4");return s;}
int main(){
 State s;
 Check(Validate(s),"empty episode valid");
 Check(School(s,1,"1/4")==Result::Blocked,"garden cannot bypass Mara");
 Check(School(s,0,"4")==Result::Wrong&&!s.school,"wrong answer no completion");
 Check(School(s,0,"5")==Result::Applied&&ItemState(s,1)==1,"Mara gives bowl");
 Check(School(s,0,"5")==Result::Already,"duplicate gives no second bowl");
 Check(School(s,1,"2/8")==Result::Applied&&ItemState(s,1)==2,"equivalent fraction accepted and bowl used");
 Check(School(s,2,"6")==Result::Applied&&ItemState(s,3)==1,"six seeds gives leaf");
 Check(ChooseRoute(s,0)==Result::Wrong&&ChooseRoute(s,1)==Result::Wrong,"both route properties required");
 Check(ChooseRoute(s,2)==Result::Applied,"wood over flowing water");
 Check(School(s,3,"75 %")==Result::Applied,"percent spaces accepted");
 Check(Tension(s)==Result::MissingItem,"rope may be fetched later");
 Check(CollectShell(s)==Result::Applied&&CollectShell(s)==Result::Already,"shell unique pickup");
 Check(UseShell(s,1)==Result::Wrong&&ItemState(s,0)==1,"wrong item preserves shell");
 Check(UseShell(s,0)==Result::Applied&&ItemState(s,0)==2&&ItemState(s,2)==1,"shell opens rope box");
 Check(UseShell(s,0)==Result::Already,"shell cannot duplicate rope");
 SelectAnchor(s,0);SelectAnchor(s,1);Check(Tension(s)==Result::Wrong&&ItemState(s,2)==1,"rotten post keeps rope");
 SelectAnchor(s,1);SelectAnchor(s,2);Check(Tension(s)==Result::Applied&&ItemState(s,2)==2,"stone and metal tension separately");
 Check(School(s,4,"6/8")==Result::Applied&&ItemState(s,4)==1,"addition equivalent fraction wave");
 int accepted=0;for(int f=0;f<3;++f)for(int turn=0;turn<4;++turn){State m=s;PickMosaic(m,f);for(int i=0;i<turn;++i)RotateMosaic(m);auto r=PlaceMosaic(m);if(r==Result::Applied){++accepted;Check(f==2&&turn==0,"only matching contour and line");}else Check(r==Result::Wrong,"nonmatching mosaic rejected");}
 Check(accepted==1,"twelve mosaic configs one solution");
 PickMosaic(s,2);Check(PlaceMosaic(s)==Result::Applied&&ItemState(s,5)==1,"mosaic gives sun");
 Check(School(s,6,"3/4")==Result::Blocked,"lens waits for lamps");
 Check(School(s,5,"4")==Result::Applied&&School(s,6,"3/4")==Result::Applied,"four lamps then fraction comparison");
 int order[3]={0,1,2};accepted=0;do{State p=s;for(int i:order)PutSymbol(p,i);auto r=ConfirmSymbols(p);if(r==Result::Applied)++accepted;else Check(r==Result::Wrong,"symbol relation wrong order");}while(std::next_permutation(order,order+3));
 Check(accepted==1,"six symbol permutations one solution");
 PutSymbol(s,0);PutSymbol(s,0);Check(s.symbols[0]==-1,"selected disc can be removed");
 PutSymbol(s,0);PutSymbol(s,1);PutSymbol(s,2);Check(ConfirmSymbols(s)==Result::Applied,"leaf wave sun opens door");
 Check(!s.finale&&ItemState(s,3)==2,"opening door does not ignite automatically");
 Check(Ignite(s)==Result::Applied&&s.finale&&Validate(s),"full route manually finished valid");
 Check(School(s,0,"5")==Result::Already&&Ignite(s)==Result::Already,"finale idempotent");
 State reverse=Shore();CollectShell(reverse);UseShell(reverse,0);SelectAnchor(reverse,2);SelectAnchor(reverse,0);Check(Tension(reverse)==Result::Applied,"anchors order independent");
 State forged;forged.logic=4;Check(!Validate(forged),"forged repaired jetty invalid");
 forged={};forged.school=127;Check(!Validate(forged),"school completion without prerequisites invalid");
 forged={};forged.symbols[0]=0;forged.symbols[1]=0;Check(!Validate(forged),"duplicate preview disc invalid");
 State transfer;School(transfer,0,"4");School(transfer,0,"4");Check(transfer.transfer[0],"two mistakes require transfer");
 Check(School(transfer,0,"5")==Result::Applied&&!HasSchool(transfer,0)&&transfer.pending[0],"base correct still waits for transfer");
 Check(School(transfer,0,"3")==Result::Applied&&HasSchool(transfer,0),"transfer confirms learning");
 Check(Validate(transfer),"transfer completion valid");
 Check(ParseFraction("1/0").second==0&&ParseFraction("junk").second==0,"invalid numeric input rejected");
 Check(ParseFraction("1/4 trailing").second==0,"trailing garbage rejected");
 DirectionInput input;input.Down(0,false);Check(input.Vertical()==1,"fresh up moves");
 input.Suspend();input.Down(0,true);Check(input.Vertical()==0,"held repeat after dialog remains blocked");
 input.Up(0);input.Down(0,false);Check(input.Vertical()==1,"actual release and fresh press restore movement");
 input.LoseFocus();input.Down(0,true);Check(input.Vertical()==0,"repeat after focus return never reconstructs movement");
 input.Up(0);input.Down(4,false);Check(input.Vertical()==1,"fresh arrow up reaches central movement");
 input.Down(0,false);Check(input.Vertical()==1,"same directions cannot double speed");
 input.Up(4);input.Up(0);input.Down(7,false);Check(input.Horizontal()==1,"arrow right reaches movement");
 input.Suspend();input.Down(2,false);Check(input.Horizontal()==0&&input.Vertical()==-1,"new independent press does not resurrect blocked right");
 std::cout<<Count<<" episode checks passed\n";
}

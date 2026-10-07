#include "../Source/Bruchpizzeria/KitchenSupplies.h"
#include <iostream>
int main(){int checks=0,failed=0;auto check=[&](bool ok,const char* t){++checks;if(!ok){++failed;std::cerr<<"FAIL: "<<t<<'\n';}};using namespace PizzaRules;
 check(TrashFee(true,0,false,false)==100,"plain dough costs one euro");
 for(int bits=1;bits<8;++bits){check(TrashFee(true,bits,false,true)==200,"raw topped pizza has fixed two euro fee");check(TrashFee(true,bits,true,true)==300,"baked food has fixed three euro fee");}
 check(TrashFee(false,0,false,true)==100,"empty plate replacement costs one euro");check(TrashFee(false,0,false,false)==0,"empty hands cannot incur disposal costs");
 for(int cash:{0,50,100,500,3000})for(int tariff:{100,200,300}){const auto c=ChargeWaste(cash,tariff);check(c.Cost==std::min(cash,tariff)&&c.CashAfter==cash-c.Cost&&c.CashAfter>=0,"actual deduction matches available bank without invented debt");}
 for(int n=1;n<=10;++n)check(WashingLevel(n)==(n>=7),"dishwashing starts in calm seventh level");
 std::cout<<checks<<" supplies checks, "<<failed<<" failures\n";return failed?1:0;}

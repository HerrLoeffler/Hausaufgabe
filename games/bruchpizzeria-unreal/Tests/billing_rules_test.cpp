#include "../Source/Bruchpizzeria/BillingRules.h"
#include <iostream>
int main(){int checks=0,failed=0;auto check=[&](bool ok,const char* text){++checks;if(!ok){++failed;std::cerr<<"FAIL: "<<text<<'\n';}};using namespace PizzaRules;
 const auto half=MakeBill(Rational(1,2),3,true,20);
 check(half.Valid&&half.Pizza==400&&half.Tomato==50&&half.Cheese==100&&half.Mushrooms==0,"half margherita itemizes actual delivered portion");
 check(half.Subtotal==550&&half.Tip==110&&half.Paid==660,"fast correct service earns pizza plus twenty percent tip");
 check(MakeBill(Rational(1,2),3,true,45).Tip==55,"medium service earns ten percent tip");check(MakeBill(Rational(1,2),3,true,61).Tip==0,"slow service still earns full food price");
 for(int mask=0;mask<8;++mask)for(int n=0;n<=8;++n){const auto good=MakeBill(Rational(n,8),mask,true,0),bad=MakeBill(Rational(n,8),mask,false,0);check(good.Valid&&good.Subtotal==good.Pizza+good.Tomato+good.Cheese+good.Mushrooms,"bill sums rounded item lines exactly");check(bad.Paid==0&&bad.Tip==0&&bad.Subtotal==good.Subtotal,"all rejected dishes earn no food money or tip");check(bool(good.Tomato)==bool((mask&1)&&n)&&bool(good.Cheese)==bool((mask&2)&&n)&&bool(good.Mushrooms)==bool((mask&4)&&n),"only actually present ingredients appear as priced items");}
 check(MakeBill(Rational(1),7,true,120).Subtotal==1200,"whole mushroom pizza uses declared menu prices");check(MakeBill(Rational(0),3,false,0).Paid==0,"empty plate earns zero");check(!MakeBill(Rational(1,0),3,true,0).Valid&&!MakeBill(Rational(2),3,true,0).Valid,"unequal or impossible portion cannot receive fabricated exact price");
 std::cout<<checks<<" billing checks, "<<failed<<" failures\n";return failed?1:0;}

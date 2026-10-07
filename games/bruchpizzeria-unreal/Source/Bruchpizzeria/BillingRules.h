#pragma once
#include "FractionRules.h"
namespace PizzaRules {
// Prices are game currency, stored as cents. Each displayed item is rounded once.
struct Bill {bool Valid=false;int Pizza=0,Tomato=0,Cheese=0,Mushrooms=0,Subtotal=0,Tip=0,Paid=0;};
inline Bill MakeBill(Rational portion,int ingredients,bool accepted,double seconds){
 Bill b;if(!portion.Valid||portion.Num<0||portion.Num>portion.Den)return b;
 b.Valid=true;auto price=[&](int whole){return int((std::int64_t(whole)*portion.Num+portion.Den/2)/portion.Den);};
 b.Pizza=price(800);b.Tomato=(ingredients&1)?price(100):0;b.Cheese=(ingredients&2)?price(200):0;b.Mushrooms=(ingredients&4)?price(100):0;
 b.Subtotal=b.Pizza+b.Tomato+b.Cheese+b.Mushrooms;
 if(accepted){const int rate=std::isfinite(seconds)&&seconds>=0?(seconds<=30?20:seconds<=60?10:0):0;b.Tip=(b.Subtotal*rate+50)/100;b.Paid=b.Subtotal+b.Tip;}
 return b;
}
}

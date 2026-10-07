#pragma once
#include <algorithm>
namespace PizzaRules {
struct WasteCharge {int Cost=0,CashAfter=0;};
inline int TrashFee(bool hasPizza,int ingredients,bool baked,bool hasPlate){return hasPizza?(baked?300:ingredients?200:100):hasPlate?100:0;}
inline WasteCharge ChargeWaste(int cash,int tariff){const int bank=std::max(0,cash),cost=std::min(bank,std::max(0,tariff));return {cost,bank-cost};}
inline bool WashingLevel(int n){return n>=7;}
}

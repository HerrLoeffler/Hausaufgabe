#pragma once
#include "FractionRules.h"
#include <array>
namespace PizzaRules {
// The two diagrams always share the same whole and the same equal pieces.
struct PortionRepair {
 Rational Wanted;int Parts=1;std::uint32_t Mask=0;bool Supported=false;
 PortionRepair(Rational wanted=Rational(1,2),Rational delivered=Rational(0),Rational a=Rational(0),Rational b=Rational(0)):Wanted(wanted){
  if(!wanted.Valid||wanted.Num<1||wanted.Num>wanted.Den)return;
  if(wanted.Den>8){Supported=false;return;}
  Parts=wanted.Den;
  for(auto value:{delivered,a,b})if(value.Valid){if(value.Den>8)return;Parts=std::lcm(Parts,value.Den);}
  Supported=Parts==1||Parts==2||Parts==4||Parts==8;
  if(!Supported){Parts=1;return;}
  if(delivered.Valid&&delivered.Num>=0&&delivered.Num<=delivered.Den)Mask=(1u<<(delivered.Num*(Parts/delivered.Den)))-1;
 }
 int Count()const{return std::popcount(Mask);}
 int TargetCount()const{return Supported?Wanted.Num*(Parts/Wanted.Den):0;}
 int Difference()const{return TargetCount()-Count();}
 bool Correct()const{return Supported&&Difference()==0;}
 void Toggle(int piece){if(Supported&&piece>=0&&piece<Parts)Mask^=1u<<piece;}
 void ShowStep(){if(Supported)Mask=(1u<<TargetCount())-1;}
};
struct CampaignProfile {int Number=1,MaxDen=2,Guests=1,Ovens=1,Goal=3,RoundSeconds=0,Patience=0;};
inline CampaignProfile CampaignLevel(int number){
 CampaignProfile p;p.Number=std::clamp(number,1,10);const int n=p.Number;
 p.MaxDen=n<=2?2:n<=4?4:8;p.Ovens=n>=6?2:1;p.Goal=n>=6?4:3;
 p.Guests=(n==2||n==4||n==6||n==10)?2:1;
 if(n==6||n==10){p.RoundSeconds=300;p.Patience=150;}
 return p;
}
inline const char* LevelObjective(int number){static const char* Text[]={"Ein Ganzes in zwei gleiche Hälften teilen.","Hälften für zwei Gäste vorbereiten.","Viertel schneiden und mehrere Stücke wählen.","Viertel sicher servieren und Beläge beachten.","Achtel: ein bis sieben Stücke auf den Teller.","Achtel mit zwei Öfen vorbereiten.","Gleiche Portion: 1/2 = 2/4 = 4/8.","Viertel zusammenlegen: 1/4 + 1/4.","Viertel und Achtel zusammenlegen.","Bekannte Brüche und eine erste Minusbestellung."};return Text[std::clamp(number,1,10)-1];}
struct KitchenLayout {std::array<CutPoint,13> Stations;const char* Name;};
inline KitchenLayout CampaignLayout(int number){
 const int n=std::clamp(number,1,10);KitchenLayout l{{{{-610,-280},{-610,-30},{-610,220},{610,-280},{610,100},{0,190},{-300,430},{0,430},{300,430},{-205,-190},{205,-190},{-340,130},{340,130}}},"La Piccola"};
 static const char* Names[]={"La Piccola","Zwei Seiten","Viertelwerkstatt","Gartenterrasse","Achtelatelier","Doppio","Marktstand","Viertelrunde","Gemeinsam teilen","Die volle Pizzeria"};l.Name=Names[n-1];
 if(n==2){std::swap(l.Stations[1],l.Stations[2]);l.Stations[9]={-220,-130};l.Stations[10]={220,-230};}
 if(n==3){std::swap(l.Stations[0],l.Stations[3]);l.Stations[5]={160,180};l.Stations[9]={-240,-150};l.Stations[10]={170,-170};}
 if(n==4){std::swap(l.Stations[1],l.Stations[3]);l.Stations[5]={-160,180};l.Stations[9]={-220,-150};l.Stations[10]={230,-150};}
 if(n==5){std::swap(l.Stations[0],l.Stations[2]);l.Stations[9]={-260,-120};l.Stations[10]={260,-120};}
 if(n==6){l.Stations[9]={-180,-200};l.Stations[10]={180,-200};l.Stations[11]={-340,120};}
 if(n==7){std::swap(l.Stations[0],l.Stations[3]);std::swap(l.Stations[1],l.Stations[2]);l.Stations[5]={100,180};l.Stations[9]={-230,-110};l.Stations[10]={230,-230};}
 if(n==8){std::swap(l.Stations[1],l.Stations[3]);l.Stations[5]={80,185};l.Stations[9]={-260,-200};l.Stations[10]={180,-170};}
 if(n==9){std::swap(l.Stations[0],l.Stations[2]);std::swap(l.Stations[1],l.Stations[3]);l.Stations[5]={-80,185};l.Stations[9]={-180,-170};l.Stations[10]={260,-200};}
 if(n==10){std::swap(l.Stations[0],l.Stations[3]);std::swap(l.Stations[1],l.Stations[2]);l.Stations[9]={-260,-130};l.Stations[10]={230,-230};}
 return l;
}
struct CampaignTicket {Rational Amount=Rational(1,2),Left=Rational(),Right=Rational();char Op=' ';int Ingredients=3;};
inline CampaignTicket CampaignOrder(int number,int serial){
 const auto p=CampaignLevel(number);const int n=p.Number,i=std::max(0,serial);CampaignTicket o;
 if(p.MaxDen==2)o.Amount=Rational(i%3==2?2:1,2);
 else if(p.MaxDen==4){const int values[]={1,3,2,4};o.Amount=Rational(values[i%4],4);}
 else {const int values[]={1,3,4,5,7,2,6,8};o.Amount=Rational(values[i%8],8);}
 if(n==7){const int values[]={2,4,6,4};o.Amount=Rational(values[i%4],8);}
 if(n>=4&&i%3==2)o.Ingredients=7;
 if(n>=8&&i%4==3){
  o.Op=n<=9?'+':'-';
  if(o.Op=='+'){o.Left=Rational(1,4);o.Right=Rational(1,n<=8?4:8);}
  else if(o.Op=='-'){o.Left=Rational(3,4);o.Right=Rational(1,8);}
  else if(o.Op=='*'){o.Left=Rational(1,2);o.Right=Rational(1,4);}
  else {o.Left=Rational(3,4);o.Right=Rational(2);}
  o.Amount=Calculate(o.Op,o.Left,o.Right);
 }
 return o;
}
}

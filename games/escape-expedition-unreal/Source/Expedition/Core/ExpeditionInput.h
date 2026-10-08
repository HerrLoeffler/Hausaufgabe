#pragma once
namespace ExpeditionV2 {
// Tracks genuine press/release events independently of the engine's flush/repeat reconciliation.
struct DirectionInput {
 unsigned Held=0,Blocked=0;
 void Down(int Key,bool Repeat){if(Key<0||Key>7||Repeat)return;unsigned Bit=1u<<Key;if(!(Held&Bit))Blocked&=~Bit;Held|=Bit;}
 void Up(int Key){if(Key<0||Key>7)return;unsigned Bit=1u<<Key;Held&=~Bit;Blocked&=~Bit;}
 void Suspend(){Blocked|=Held;}
 void LoseFocus(){Held=0;Blocked=255;}
 unsigned Effective()const{return Held&~Blocked;}
 int Horizontal()const{unsigned E=Effective();return ((E&136)?1:0)-((E&34)?1:0);}
 int Vertical()const{unsigned E=Effective();return ((E&17)?1:0)-((E&68)?1:0);}
};
}

#include "IslandWorld.h"
#include "Components/SceneComponent.h"
#include "Components/StaticMeshComponent.h"
#include "Components/TextRenderComponent.h"
#include "Materials/MaterialInstanceDynamic.h"
#include "Engine/StaticMesh.h"
#include "Engine/World.h"
#include "ProceduralMeshComponent.h"
namespace {
FLinearColor Col(const TCHAR* H){return FLinearColor::FromSRGBColor(FColor::FromHex(H));}
void Root(AActor* A){if(!A->GetRootComponent()){auto* R=NewObject<USceneComponent>(A);A->SetRootComponent(R);R->RegisterComponent();}}
UMaterialInstanceDynamic* Mat(AActor* A,FLinearColor C,bool Glow=false){auto* Base=LoadObject<UMaterial>(nullptr,Glow?TEXT("/Game/Materials/M_Glow.M_Glow"):TEXT("/Game/Materials/M_Island.M_Island"));auto* M=Base?UMaterialInstanceDynamic::Create(Base,A):nullptr;if(M)M->SetVectorParameterValue(TEXT("Tint"),C);return M;}
UStaticMeshComponent* Shape(AActor* A,const TCHAR* Type,FVector Pos,FVector S,const TCHAR* H,FRotator R=FRotator::ZeroRotator,bool Collision=false,bool Relative=false,bool Glow=false){
 Root(A);auto* M=NewObject<UStaticMeshComponent>(A);M->SetStaticMesh(LoadObject<UStaticMesh>(nullptr,*(FString(TEXT("/Engine/BasicShapes/"))+Type+TEXT(".")+Type)));M->SetMobility(EComponentMobility::Movable);M->SetupAttachment(A->GetRootComponent());M->RegisterComponent();M->SetRelativeScale3D(S);if(Relative){M->SetRelativeLocation(Pos);M->SetRelativeRotation(R);}else {M->SetWorldLocation(Pos);M->SetWorldRotation(R);}M->SetCollisionEnabled(Collision?ECollisionEnabled::QueryAndPhysics:ECollisionEnabled::NoCollision);M->SetCollisionResponseToAllChannels(ECR_Block);if(auto* T=Mat(A,Col(H),Glow))M->SetMaterial(0,T);return M;
}
UTextRenderComponent* Label(AActor* A,const FString& S,FVector P,float Size,FRotator R=FRotator(0,180,0),bool Relative=false,const TCHAR* H=TEXT("060C07")){
 Root(A);auto* T=NewObject<UTextRenderComponent>(A);T->SetupAttachment(A->GetRootComponent());T->RegisterComponent();if(Relative){T->SetRelativeLocation(P);T->SetRelativeRotation(R);}else{T->SetWorldLocation(P);T->SetWorldRotation(R);}T->SetHorizontalAlignment(EHTA_Center);T->SetVerticalAlignment(EVRTA_TextCenter);T->SetWorldSize(Size);T->SetTextRenderColor(FColor::FromHex(H));T->SetText(FText::FromString(S));return T;
}
void Branch(AActor* A,FVector Start,FVector End,float Radius,const TCHAR* C){FVector D=End-Start;Shape(A,TEXT("Cylinder"),(Start+End)*.5,FVector(Radius/50,Radius/50,D.Size()/100),C,FRotationMatrix::MakeFromZ(D).Rotator());}
void Tree(UWorld* W,FVector P,int Seed,const TCHAR* C){
 auto* A=W->SpawnActor<AActor>();Root(A);FRandomStream Rand(Seed);float Height=Rand.FRandRange(470,610);Branch(A,P,P+FVector(16,-12,Height),23,TEXT("79563A"));
 TArray<FVector> Tips;for(int I=0;I<9;++I){float Angle=I*2*PI/9;FVector Joint=P+FVector(8,-6,Height*(.43+.028*I));FVector Tip=P+FVector(FMath::Cos(Angle)*Rand.FRandRange(120,215),FMath::Sin(Angle)*Rand.FRandRange(120,215),Height*.86+Rand.FRandRange(-40,80));Branch(A,Joint,Tip,8,TEXT("79563A"));Branch(A,Tip,Tip+FVector(20,0,80),3.8,TEXT("79563A"));Tips.Add(Tip+FVector(0,0,50));}Tips.Add(P+FVector(0,0,Height+90));
 auto* Leaves=NewObject<UProceduralMeshComponent>(A);Leaves->SetupAttachment(A->GetRootComponent());Leaves->RegisterComponent();Leaves->SetCollisionEnabled(ECollisionEnabled::NoCollision);
 TArray<FVector> Vertices,Normals;TArray<int32> Tri;TArray<FVector2D> UV;TArray<FLinearColor> Colors;TArray<FProcMeshTangent> Tangents;
 FLinearColor Base=Col(C);for(int I=0;I<1800;++I){FVector Center=Tips[I%Tips.Num()]+FVector(Rand.FRandRange(-100,100),Rand.FRandRange(-100,100),Rand.FRandRange(-65,90));FVector N=Rand.VRand();FVector U=FVector::CrossProduct(N,FVector(0,0,1)).GetSafeNormal();if(U.IsNearlyZero())U=FVector(1,0,0);FVector V=FVector::CrossProduct(N,U);float Width=Rand.FRandRange(10,22);int B=Vertices.Num();float Light=Rand.FRandRange(.6,1.2);for(FVector Q:{-U*Width,V*Width*.6f,U*Width,-V*Width*.6f}){Vertices.Add(Center+Q);Normals.Add(N);UV.Add(FVector2D(.5,.5));Colors.Add(FLinearColor(Base.R*Light,Base.G*Light,Base.B*Light,1));}Tri.Append({B,B+1,B+2,B,B+2,B+3});}
 Leaves->CreateMeshSection_LinearColor(0,Vertices,Tri,Normals,UV,Colors,Tangents,false);if(auto* M=Mat(A,FLinearColor::White))Leaves->SetMaterial(0,M);
 for(int I=0;I<40;++I){FVector Q=P+FVector(Rand.FRandRange(-230,230),Rand.FRandRange(-230,230),6);Shape(A,TEXT("Cube"),Q,FVector(.16,.08,.005),C,FRotator(0,Rand.FRandRange(0,360),0));}
}
void StoneWall(AActor* A,float X,float Y,float Length,bool AlongX=false,float H=185){
 FVector S=AlongX?FVector(Length/100,.28,H/100):FVector(.28,Length/100,H/100);Shape(A,TEXT("Cube"),FVector(X,Y,H*.5),S,TEXT("DCCBA6"),FRotator::ZeroRotator,true);
 Shape(A,TEXT("Cube"),FVector(X,Y,H+5),AlongX?FVector(Length/100,.44,.14):FVector(.44,Length/100,.14),TEXT("F0DEB8"));
 for(int I=0;I<Length/160;++I){FVector P=AlongX?FVector(X-Length*.5+I*160,Y,H*.48):FVector(X,Y-Length*.5+I*160,H*.48);Shape(A,TEXT("Cube"),P,AlongX?FVector(.015,.29,H/105):FVector(.29,.015,H/105),TEXT("C4AF87"));}
}
FIslandGate Gate(UWorld* W,float X){
 auto* Surround=W->SpawnActor<AActor>();StoneWall(Surround,X,-710,1140);StoneWall(Surround,X,710,1140);
 for(int S:{-1,1}){Shape(Surround,TEXT("Cube"),FVector(X,S*155,155),FVector(.7,.7,3.1),TEXT("E8D5AE"),FRotator::ZeroRotator,true);Shape(Surround,TEXT("Cube"),FVector(X,S*155,320),FVector(.88,.88,.22),TEXT("F4E3BC"));Shape(Surround,TEXT("Sphere"),FVector(X,S*155,350),FVector(.46,.46,.46),TEXT("B59964"));}
 auto* A=W->SpawnActor<AActor>();Root(A);A->SetActorLocation(FVector(X,-120,0));
 for(int I=0;I<12;++I)Shape(A,TEXT("Cube"),FVector(0,I*21+4,140),FVector(.065,.055,2.65),TEXT("8F362A"),FRotator::ZeroRotator,true,true);
 for(int H:{25,90,250})Shape(A,TEXT("Cube"),FVector(0,120,H),FVector(.10,2.5,.075),TEXT("A74E35"),FRotator::ZeroRotator,true,true);
 Shape(A,TEXT("Cube"),FVector(-4,120,130),FVector(.12,.55,.55),TEXT("B2894D"),FRotator::ZeroRotator,false,true);Label(A,TEXT("-"),FVector(-11,120,130),32,FRotator(0,180,0),true,TEXT("EFE3C0"));return {A,0};
}
void Terminal(AActor* A,FVector P,const FString& Text){Shape(A,TEXT("Cylinder"),P+FVector(0,0,42),FVector(.24,.24,.85),TEXT("B79C6F"));Shape(A,TEXT("Cube"),P+FVector(0,0,100),FVector(.15,1.22,.72),TEXT("9A4833"));Label(A,Text,P+FVector(-9,0,100),18,FRotator(0,180,0),false,TEXT("DAC89B"));}
}
void AIslandGameMode::BuildWorld(){
 auto* W=GetWorld();auto* A=W->SpawnActor<AActor>();
 // One continuous collision surface, terraces and sea form a coherent first island strip.
 Shape(A,TEXT("Cube"),FVector(1800,0,-110),FVector(76,26,2.2),TEXT("BEA778"),FRotator::ZeroRotator,true);
 Shape(A,TEXT("Cube"),FVector(1800,0,-3),FVector(76,25.8,.06),TEXT("96AD59"));
 Shape(A,TEXT("Cube"),FVector(0,0,-225),FVector(900,900,.15),TEXT("247FAD"));
 for(int S:{-1,1}){StoneWall(A,1800,S*1270,7600,true,100);for(int I=0;I<24;++I){float X=-1900+I*310;Shape(A,TEXT("Cube"),FVector(X,S*1320,-130),FVector(3.4,2.1,3.6),I%3?TEXT("CCB589"):TEXT("E1CDA2"),FRotator(0,I%3*9,0));}}
 // Quiet joints, not busy textures beneath words.
 for(int X=-1850;X<5300;X+=140)for(int Y=-480;Y<=480;Y+=160)Shape(A,TEXT("Cube"),FVector(X,Y,1),FVector(1.37,1.57,.025),((X/140+Y/160)&1)?TEXT("E0D0AA"):TEXT("EADBB9"));
 for(int X=-1800;X<5200;X+=360){Shape(A,TEXT("Cube"),FVector(X,610,5),FVector(3.3,.6,.13),TEXT("CFBA8F"));Shape(A,TEXT("Cube"),FVector(X,-610,5),FVector(3.3,.6,.13),TEXT("CFBA8F"));}
 // Arrival sheltered arch with a direct view towards warm trees and first puzzle.
 for(int S:{-1,1}){Shape(A,TEXT("Cube"),FVector(-1780,S*240,165),FVector(1.5,1.3,3.3),TEXT("DFCCA6"),FRotator::ZeroRotator,true);Shape(A,TEXT("Cube"),FVector(-1760,S*170,350),FVector(1.5,1.7,1.15),TEXT("F0DFBD"),FRotator(S*18,0,0));}
 Shape(A,TEXT("Cube"),FVector(-1780,0,405),FVector(1.5,2.6,.7),TEXT("E6D4AE"));
 Gates.Add(Gate(W,-150));Gates.Add(Gate(W,1350));Gates.Add(Gate(W,3650));
 const TCHAR* IntroWords[]={TEXT("laufen"),TEXT("Baum"),TEXT("singen"),TEXT("blau")};
 const TCHAR* IntroContexts[]={TEXT("Wir laufen zum Tor."),TEXT("Der Baum wächst."),TEXT("Die Kinder singen."),TEXT("Das Tor ist blau.")};
 for(int I=0;I<4;++I){FVector P(-780+(I/2)*235,(I%2?1:-1)*180,8);IntroTiles.Add(Shape(A,TEXT("Cube"),P,FVector(1.3,1.3,.1),TEXT("F5E8C7")));Label(A,IntroWords[I],P+FVector(0,0,6),24,FRotator(90,180,0));IntroMarks.Add(Label(A,TEXT("-"),P+FVector(34,0,7),15,FRotator(90,180,0)));AddTarget(100+I,P,IntroWords[I],IntroContexts[I]);}
 Terminal(A,FVector(-1080,-270,0),TEXT("Finde zwei Verben"));AddTarget(10,FVector(-1080,-270,95),TEXT("Verbprobe"),TEXT("Wähle genau zwei Verben. Die Satzkontexte helfen dir. E oder Antippen zeigt das Wort; bestätige dann deine Auswahl. Am runden Schlussstein prüfst du beide."));
 Terminal(A,FVector(-330,0,0),TEXT("Auswahl prüfen"));AddTarget(11,FVector(-330,0,100),TEXT("Zwei Verben prüfen"));
 Terminal(A,FVector(50,-425,0),TEXT("Verbweg starten"));AddTarget(20,FVector(50,-425,100),TEXT("Verbweg starten"));
 const TCHAR* Words[]={TEXT("singt"),TEXT("Baum"),TEXT("blau"),TEXT("klein"),TEXT("sucht"),TEXT("Tor"),TEXT("Stein"),TEXT("laut"),TEXT("öffnet")};
 const TCHAR* Contexts[]={TEXT("Der Vogel singt."),TEXT("Der Baum steht am Weg."),TEXT("Das Tor ist blau."),TEXT("Die Hütte ist klein."),TEXT("Der Fuchs sucht den Eingang."),TEXT("Das Tor ist geschlossen."),TEXT("Der Stein liegt hier."),TEXT("Der Ton ist laut."),TEXT("Die Eule öffnet das Tor.")};
 for(int I=0;I<9;++I){FVector P(300+(I/3)*250,(I%3-1)*180,8);PathTiles.Add(Shape(A,TEXT("Cube"),P,FVector(1.2,1.2,.1),TEXT("F4E6C4")));Label(A,Words[I],P+FVector(0,0,6),26,FRotator(90,180,0));PathMarks.Add(Label(A,TEXT("-"),P+FVector(38,0,7),15,FRotator(90,180,0)));AddTarget(200+I,P,Words[I],Contexts[I]);}
 Terminal(A,FVector(1150,0,0),TEXT("Weg prüfen"));AddTarget(21,FVector(1150,0,100),TEXT("Drei Verbenschritte prüfen"));Terminal(A,FVector(600,-425,0),TEXT("Schritt zurück"));AddTarget(22,FVector(600,-425,100),TEXT("Letzten Schritt zurücknehmen"));
 // The fountain is visibly upstream of the pressure plate and its connected gate.
 Shape(A,TEXT("Cylinder"),FVector(2350,-480,25),FVector(2,2,.5),TEXT("D8C298"),FRotator::ZeroRotator,true);Shape(A,TEXT("Cylinder"),FVector(2350,-480,52),FVector(1.7,1.7,.035),TEXT("52A9B9"));
 Shape(A,TEXT("Cube"),FVector(2410,-530,110),FVector(.9,.6,2.2),TEXT("E9D7B0"),FRotator::ZeroRotator,true);Branch(A,FVector(2370,-530,130),FVector(2300,-480,110),11,TEXT("9C8150"));Branch(A,FVector(2300,-480,108),FVector(2300,-480,54),2,TEXT("95CEE0"));
 Terminal(A,FVector(2180,-430,0),TEXT("+ 1/10 · 100 ml"));AddTarget(400,FVector(2350,-420,60),TEXT("Brunnen: 100 ml nachfüllen"));
 Shape(A,TEXT("Cube"),FVector(2650,-470,18),FVector(1.3,1.1,.35),TEXT("B79C72"),FRotator::ZeroRotator,true);Label(A,TEXT("− 1/10"),FVector(2649,-470,38),21,FRotator(90,180,0));AddTarget(402,FVector(2650,-470,30),TEXT("Ablass: 100 ml ablassen"));
 Shape(A,TEXT("Cylinder"),FVector(2350,-220,25),FVector(.9,.9,.5),TEXT("D7C199"),FRotator::ZeroRotator,true);AddTarget(401,FVector(2350,-220,50),TEXT("1-Liter-Eimer aufnehmen"));AddTarget(404,FVector(2350,-220,50),TEXT("Eimer auf Sockel absetzen"));
 Shape(A,TEXT("Cylinder"),FVector(3350,0,5),FVector(1.6,1.6,.1),TEXT("A1844D"));Shape(A,TEXT("Cylinder"),FVector(3350,0,10),FVector(1.34,1.34,.015),TEXT("E6D5AE"));Label(A,TEXT("3/10"),FVector(3350,0,12),40,FRotator(90,180,0));AddTarget(403,FVector(3350,0,10),TEXT("Eimer auf 3/10-Platte stellen"));
 Terminal(A,FVector(3070,-350,0),TEXT("1 L · drei Zehntel"));
 Bucket=W->SpawnActor<AActor>();Root(Bucket);
 // Inner cylinder: radius4.46cm, calibrated height16cm => approximately1L.
 Shape(Bucket,TEXT("Cylinder"),FVector(0,0,1),FVector(.104,.104,.02),TEXT("AFA987"),FRotator::ZeroRotator,false,true);
 auto* Shell=NewObject<UProceduralMeshComponent>(Bucket);Shell->SetupAttachment(Bucket->GetRootComponent());Shell->RegisterComponent();Shell->SetCollisionEnabled(ECollisionEnabled::NoCollision);
 TArray<FVector> SV,SN;TArray<int32> SI;TArray<FVector2D> SU;TArray<FLinearColor> SC;TArray<FProcMeshTangent> ST;
 for(int I=0;I<=32;++I){float Ang=I*2*PI/32;FVector N(FMath::Cos(Ang),FMath::Sin(Ang),0);for(float Z:{2.f,18.f}){SV.Add(N*4.46+FVector(0,0,Z));SN.Add(N);SU.Add(FVector2D(float(I)/32,(Z-2)/16));SC.Add(FLinearColor::White);}if(I<32){int B=I*2;SI.Append({B,B+2,B+1,B+1,B+2,B+3});}}
 Shell->CreateMeshSection_LinearColor(0,SV,SI,SN,SU,SC,ST,false);
 if(auto* Glass=LoadObject<UMaterial>(nullptr,TEXT("/Game/Materials/M_Glass.M_Glass")))Shell->SetMaterial(0,Glass);
 for(float H:{2.f,18.f})for(int I=0;I<24;++I){float Ang=I*2*PI/24;Shape(Bucket,TEXT("Cube"),FVector(FMath::Cos(Ang)*4.9,FMath::Sin(Ang)*4.9,H),FVector(.012,.006,.008),TEXT("B9B092"),FRotator(0,I*15,0),false,true);}
 for(int I=0;I<10;++I){float H=2+(I+1)*1.6f;Shape(Bucket,TEXT("Cube"),FVector(-4.6,0,H),FVector(.006,.027,.004),TEXT("374336"),FRotator::ZeroRotator,false,true);Label(Bucket,FString::Printf(TEXT("%d/10"),I+1),FVector(-4.8,2.5,H),.8,FRotator(0,180,0),true);}
 for(int Sign:{-1,1})Shape(Bucket,TEXT("Cube"),FVector(0,Sign*5,20),FVector(.012,.012,.07),TEXT("B4A889"),FRotator::ZeroRotator,false,true);
 Shape(Bucket,TEXT("Cube"),FVector(0,0,23.5),FVector(.012,.11,.012),TEXT("B4A889"),FRotator::ZeroRotator,false,true);
 Label(Bucket,TEXT("1 L"),FVector(-5,0,20.8),2,FRotator(0,180,0),true);
 BucketAmount=Label(Bucket,TEXT("0/10"),FVector(-5,0,-2),1.3,FRotator(0,180,0),true);
 BucketWater=Shape(Bucket,TEXT("Cylinder"),FVector(0,0,2),FVector(.0892,.0892,.001),TEXT("56B9D1"),FRotator::ZeroRotator,false,true);
 // Thin solved connections sit within neutral channels rather than covering paths with neon.
 float Ends[3]={-150,1350,3650};float Begins[3]={-330,1150,3350};for(int I=0;I<3;++I){Shape(A,TEXT("Cube"),FVector((Begins[I]+Ends[I])*.5,120,7),FVector((Ends[I]-Begins[I])/100,.12,.025),TEXT("8C754D"));Cables.Add(Shape(A,TEXT("Cube"),FVector((Begins[I]+Ends[I])*.5,120,9),FVector((Ends[I]-Begins[I])/100,.035,.02),TEXT("62D6B4"),FRotator::ZeroRotator,false,false,true));}
 // Tower: exactly eight dark openings, first two receive area milestones.
 Shape(A,TEXT("Cylinder"),FVector(4850,250,380),FVector(3.4,3.4,7.6),TEXT("E6D4B0"),FRotator::ZeroRotator,true);
 Shape(A,TEXT("Cylinder"),FVector(4850,250,775),FVector(3.9,3.9,.35),TEXT("F0E0BD"));Shape(A,TEXT("Cone"),FVector(4850,250,870),FVector(4.2,4.2,1.65),TEXT("AC6248"));
 for(int I=0;I<8;++I){FVector P(4676,250+(I%4-1.5f)*66,445+(I/4)*130);Shape(A,TEXT("Cube"),P,FVector(.03,.44,.65),TEXT("4C665D"));Signals.Add(Shape(A,TEXT("Cube"),P+FVector(-2,0,0),FVector(.03,.28,.44),TEXT("A6E3BB"),FRotator::ZeroRotator,false,false,true));}
 // Warm garden, lime transition, restrained pink and distant cypress groups.
 for(int I=0;I<30;++I){float X=-1550+(I/2)*440;float Y=(I%2?1:-1)*(810+(I%3)*95);const TCHAR* Color=X<1450?(I%3?TEXT("E7AA25"):TEXT("D87822")):X<3600?(I%3?TEXT("A4C42F"):TEXT("6E9F3B")):(I%3?TEXT("91AE46"):TEXT("DCA2B3"));Tree(W,FVector(X,Y,2),408+I,Color);}
 // Hand-set sandstone outcrops supply layered silhouettes behind trees.
 FRandomStream R(804);for(int I=0;I<36;++I){float X=R.FRandRange(-1700,5200),Y=(I%2?1:-1)*R.FRandRange(1040,1200);for(int N=0;N<3;++N)Shape(A,TEXT("Cube"),FVector(X,Y,40+N*70),FVector(R.FRandRange(1.2,2.5),R.FRandRange(.8,1.5),.8),N%2?TEXT("D8BF93"):TEXT("C4AA7E"),FRotator(0,I*13,0));}
}

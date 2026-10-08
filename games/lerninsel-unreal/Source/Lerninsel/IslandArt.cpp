#include "IslandWorld.h"
#include "Components/SceneComponent.h"
#include "Components/StaticMeshComponent.h"
#include "Components/TextRenderComponent.h"
#include "Materials/MaterialInstanceDynamic.h"
#include "Engine/StaticMesh.h"
#include "Engine/World.h"
#include "ProceduralMeshComponent.h"
#include "Components/InstancedStaticMeshComponent.h"
namespace {
FLinearColor Col(const TCHAR* H){return FLinearColor::FromSRGBColor(FColor::FromHex(H));}
void Root(AActor* A){if(!A->GetRootComponent()){auto* R=NewObject<USceneComponent>(A);A->SetRootComponent(R);R->RegisterComponent();}}
UMaterialInstanceDynamic* Mat(AActor* A,FLinearColor C,bool Glow=false){FString Name=FString::Printf(TEXT("Tint_%08X_%d"),C.ToFColor(false).DWColor(),Glow);if(auto* Found=FindObject<UMaterialInstanceDynamic>(A,*Name))return Found;auto* Base=LoadObject<UMaterial>(nullptr,Glow?TEXT("/Game/Materials/M_Glow.M_Glow"):TEXT("/Game/Materials/M_Island.M_Island"));auto* M=Base?UMaterialInstanceDynamic::Create(Base,A,*Name):nullptr;if(M)M->SetVectorParameterValue(TEXT("Tint"),C);return M;}
UStaticMeshComponent* Shape(AActor* A,const TCHAR* Type,FVector Pos,FVector S,const TCHAR* H,FRotator R=FRotator::ZeroRotator,bool Collision=false,bool Relative=false,bool Glow=false){
 Root(A);if(!Collision&&!Relative&&!Glow){FName Name(*(FString(TEXT("Batch_"))+Type+H));TArray<UInstancedStaticMeshComponent*> Batches;A->GetComponents(Batches);UInstancedStaticMeshComponent* Batch=nullptr;for(auto* B:Batches)if(B->GetFName()==Name){Batch=B;break;}if(!Batch){Batch=NewObject<UInstancedStaticMeshComponent>(A,Name);Batch->SetupAttachment(A->GetRootComponent());Batch->SetStaticMesh(LoadObject<UStaticMesh>(nullptr,*(FString(TEXT("/Engine/BasicShapes/"))+Type+TEXT(".")+Type)));Batch->SetCollisionEnabled(ECollisionEnabled::NoCollision);Batch->RegisterComponent();if(auto* T=Mat(A,Col(H)))Batch->SetMaterial(0,T);}Batch->AddInstance(FTransform(R,Pos,S),true);return Batch;}
 auto* M=NewObject<UStaticMeshComponent>(A);M->SetStaticMesh(LoadObject<UStaticMesh>(nullptr,*(FString(TEXT("/Engine/BasicShapes/"))+Type+TEXT(".")+Type)));M->SetMobility(EComponentMobility::Movable);M->SetupAttachment(A->GetRootComponent());M->RegisterComponent();M->SetRelativeScale3D(S);if(Relative){M->SetRelativeLocation(Pos);M->SetRelativeRotation(R);}else {M->SetWorldLocation(Pos);M->SetWorldRotation(R);}M->SetCollisionEnabled(Collision?ECollisionEnabled::QueryAndPhysics:ECollisionEnabled::NoCollision);M->SetCollisionResponseToAllChannels(ECR_Block);if(auto* T=Mat(A,Col(H),Glow))M->SetMaterial(0,T);return M;
}
UTextRenderComponent* Label(AActor* A,const FString& S,FVector P,float Size,FRotator R=FRotator(0,180,0),bool Relative=false,const TCHAR* H=TEXT("060C07")){
 Root(A);auto* T=NewObject<UTextRenderComponent>(A);T->SetupAttachment(A->GetRootComponent());T->RegisterComponent();if(Relative){T->SetRelativeLocation(P);T->SetRelativeRotation(R);}else{T->SetWorldLocation(P);T->SetWorldRotation(R);}T->SetHorizontalAlignment(EHTA_Center);T->SetVerticalAlignment(EVRTA_TextCenter);T->SetWorldSize(Size);T->SetTextRenderColor(FColor::FromHex(H));T->SetText(FText::FromString(S));return T;
}
void Branch(AActor* A,FVector Start,FVector End,float Radius,const TCHAR* C){FVector D=End-Start;Shape(A,TEXT("Cylinder"),(Start+End)*.5,FVector(Radius/50,Radius/50,D.Size()/100),C,FRotationMatrix::MakeFromZ(D).Rotator());}
void Tree(UWorld* W,FVector P,int Seed,const TCHAR* C){
 auto* A=W->SpawnActor<AActor>();Root(A);FRandomStream Rand(Seed);float Height=Rand.FRandRange(470,610);Branch(A,P,P+FVector(16,-12,Height),Seed%5==1?14:23,Seed%5==1?TEXT("DBCDA9"):TEXT("79563A"));
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
 auto* Blocker=Shape(Surround,TEXT("Cube"),FVector(X,0,140),FVector(.08,2.5,2.8),TEXT("DCCBA6"),FRotator::ZeroRotator,true);Blocker->SetVisibility(false);Blocker->SetHiddenInGame(true);
 auto* A=W->SpawnActor<AActor>();Root(A);A->SetActorLocation(FVector(X,-120,0));
 for(int I=0;I<12;++I)Shape(A,TEXT("Cube"),FVector(0,I*21+4,140),FVector(.065,.055,2.65),TEXT("8F362A"),FRotator::ZeroRotator,true,true);
 for(int H:{25,90,250})Shape(A,TEXT("Cube"),FVector(0,120,H),FVector(.10,2.5,.075),TEXT("A74E35"),FRotator::ZeroRotator,true,true);
 Shape(A,TEXT("Cube"),FVector(-4,120,130),FVector(.12,.55,.55),TEXT("B2894D"),FRotator::ZeroRotator,false,true);Label(A,TEXT("-"),FVector(-11,120,130),32,FRotator(0,180,0),true,TEXT("EFE3C0"));return {A,0,Blocker};
}
void Terminal(AActor* A,FVector P,const FString& Text){Shape(A,TEXT("Cylinder"),P+FVector(0,0,42),FVector(.24,.24,.85),TEXT("B79C6F"));Shape(A,TEXT("Cube"),P+FVector(0,0,100),FVector(.15,1.22,.72),TEXT("9A4833"));Label(A,Text,P+FVector(-9,0,100),18,FRotator(0,180,0),false,TEXT("DAC89B"));}
}
void AIslandGameMode::BuildWorld(){
 auto* W=GetWorld();auto* A=W->SpawnActor<AActor>();
 // One continuous collision surface, terraces and sea form a coherent first island strip.
 Shape(A,TEXT("Cube"),FVector(5500,0,-110),FVector(150,26,2.2),TEXT("BEA778"),FRotator::ZeroRotator,true);
 Shape(A,TEXT("Cube"),FVector(5500,0,-3),FVector(150,25.8,.06),TEXT("96AD59"));
 Shape(A,TEXT("Cube"),FVector(0,0,-225),FVector(900,900,.15),TEXT("247FAD"));
 for(int S:{-1,1}){StoneWall(A,5500,S*1270,15000,true,100);for(int I=0;I<48;++I){float X=-1900+I*310;Shape(A,TEXT("Cube"),FVector(X,S*1320,-130),FVector(3.4,2.1,3.6),I%3?TEXT("CCB589"):TEXT("E1CDA2"),FRotator(0,I%3*9,0));}}
 // Quiet joints, not busy textures beneath words.
 for(int X=-1850;X<12500;X+=140){bool Plaza=X<1050||(X>1650&&X<2950)||(X>3500&&X<4850)||(X>5200&&X<6350)||X>11800;int Width=Plaza?320:80;for(int Y=-Width;Y<=Width;Y+=160)Shape(A,TEXT("Cube"),FVector(X,Y,1),FVector(1.37,1.57,.025),X>6500&&X<11600?TEXT("CDB17E"):((X/140+Y/160)&1)?TEXT("D0B78C"):TEXT("DAC69B"));}
 for(int X=-1800;X<12600;X+=360){Shape(A,TEXT("Cube"),FVector(X,610,5),FVector(3.3,.6,.13),TEXT("CFBA8F"));Shape(A,TEXT("Cube"),FVector(X,-610,5),FVector(3.3,.6,.13),TEXT("CFBA8F"));}
 // Arrival sheltered arch with a direct view towards warm trees and first puzzle.
 for(int S:{-1,1}){Shape(A,TEXT("Cube"),FVector(-1780,S*240,165),FVector(1.5,1.3,3.3),TEXT("DFCCA6"),FRotator::ZeroRotator,true);Shape(A,TEXT("Cube"),FVector(-1760,S*170,350),FVector(1.5,1.7,1.15),TEXT("F0DFBD"),FRotator(S*18,0,0));}
 Shape(A,TEXT("Cube"),FVector(-1780,0,405),FVector(1.5,2.6,.7),TEXT("E6D4AE"));
 Gates.Add(Gate(W,-150));Gates.Add(Gate(W,1350));Gates.Add(Gate(W,5050));
 const TCHAR* IntroWords[]={TEXT("laufen"),TEXT("Baum"),TEXT("singen"),TEXT("blau")};
 const TCHAR* IntroContexts[]={TEXT("Wir laufen zum Tor."),TEXT("Der Baum wächst."),TEXT("Die Kinder singen."),TEXT("Das Tor ist blau.")};
 for(int I=0;I<4;++I){FVector P(-780+(I/2)*235,(I%2?1:-1)*180,8);IntroTiles.Add(Shape(A,TEXT("Cube"),P,FVector(1.3,1.3,.1),TEXT("F5E8C7"),FRotator::ZeroRotator,false,true));IntroTiles.Last()->SetMaterial(0,UMaterialInstanceDynamic::Create(LoadObject<UMaterial>(nullptr,TEXT("/Game/Materials/M_Island.M_Island")),A));Label(A,IntroWords[I],P+FVector(0,0,6),24,FRotator(90,180,0));IntroMarks.Add(Label(A,TEXT("-"),P+FVector(34,0,7),15,FRotator(90,180,0)));AddTarget(100+I,P,IntroWords[I],IntroContexts[I]);}
 Terminal(A,FVector(-1080,-270,0),TEXT("Finde zwei Verben"));AddTarget(10,FVector(-1080,-270,95),TEXT("Verbprobe"),TEXT("Finde zwei Verben: Wörter dafür, was jemand tut. Klicke ein Wort oder drücke E. Ein ganz blauer Stein heißt ausgewählt. Ein zweiter Klick nimmt es zurück. Bei zwei richtigen Wörtern öffnet sich das Tor von selbst."));
 Terminal(A,FVector(-330,0,0),TEXT("Hilfe: zwei Verben"));AddTarget(11,FVector(-330,0,100),TEXT("Hilfe zur Verbprobe"));
 Terminal(A,FVector(50,-425,0),TEXT("Verbweg starten"));AddTarget(20,FVector(50,-425,100),TEXT("Verbweg starten"));
 for(int Row=0;Row<3;++Row){FVector P(300+Row*250,-360,65);Label(A,FString::Printf(TEXT("REIHE %d\nVERB\nWas tut jemand?"),Row+1),P,20);}
 const TCHAR* Words[]={TEXT("singt"),TEXT("Baum"),TEXT("blau"),TEXT("klein"),TEXT("sucht"),TEXT("Tor"),TEXT("Stein"),TEXT("laut"),TEXT("öffnet")};
 const TCHAR* Contexts[]={TEXT("Der Vogel singt."),TEXT("Der Baum steht am Weg."),TEXT("Das Tor ist blau."),TEXT("Die Hütte ist klein."),TEXT("Der Fuchs sucht den Eingang."),TEXT("Das Tor ist geschlossen."),TEXT("Der Stein liegt hier."),TEXT("Der Ton ist laut."),TEXT("Die Eule öffnet das Tor.")};
 for(int I=0;I<9;++I){FVector P(300+(I/3)*250,(I%3-1)*180,8);PathTiles.Add(Shape(A,TEXT("Cube"),P,FVector(1.2,1.2,.1),TEXT("F4E6C4"),FRotator::ZeroRotator,false,true));PathTiles.Last()->SetMaterial(0,UMaterialInstanceDynamic::Create(LoadObject<UMaterial>(nullptr,TEXT("/Game/Materials/M_Island.M_Island")),A));Label(A,Words[I],P+FVector(0,0,6),26,FRotator(90,180,0));PathMarks.Add(Label(A,TEXT("-"),P+FVector(38,0,7),15,FRotator(90,180,0)));AddTarget(200+I,P,Words[I],Contexts[I]);}
 Terminal(A,FVector(1150,0,0),TEXT("Ziel: drei Verben"));AddTarget(21,FVector(1150,0,100),TEXT("Verbweg: Ziel"));Terminal(A,FVector(600,-425,0),TEXT("Schritt zurück"));AddTarget(22,FVector(600,-425,100),TEXT("Letzten Schritt zurücknehmen"));
 // The fountain is visibly upstream of the pressure plate and its connected gate.
 Shape(A,TEXT("Cylinder"),FVector(3750,-480,25),FVector(2,2,.5),TEXT("D8C298"),FRotator::ZeroRotator,true);Shape(A,TEXT("Cylinder"),FVector(3750,-480,52),FVector(1.7,1.7,.035),TEXT("52A9B9"));
 Shape(A,TEXT("Cube"),FVector(3810,-530,110),FVector(.9,.6,2.2),TEXT("E9D7B0"),FRotator::ZeroRotator,true);Branch(A,FVector(3770,-530,130),FVector(3700,-480,110),11,TEXT("9C8150"));Branch(A,FVector(3700,-480,108),FVector(3700,-480,54),2,TEXT("95CEE0"));
 Terminal(A,FVector(3580,-430,0),TEXT("+ 1/10 · 100 ml"));AddTarget(400,FVector(3750,-420,60),TEXT("Brunnen: 100 ml nachfüllen"));
 Shape(A,TEXT("Cube"),FVector(4050,-470,18),FVector(1.3,1.1,.35),TEXT("B79C72"),FRotator::ZeroRotator,true);Label(A,TEXT("− 1/10"),FVector(4049,-470,38),21,FRotator(90,180,0));AddTarget(402,FVector(4050,-470,30),TEXT("Ablass: 100 ml ablassen"));
 Shape(A,TEXT("Cylinder"),FVector(3750,-220,25),FVector(.9,.9,.5),TEXT("D7C199"),FRotator::ZeroRotator,true);AddTarget(401,FVector(3750,-220,50),TEXT("1-Liter-Messbecher aufnehmen"));AddTarget(404,FVector(3750,-220,50),TEXT("Eimer auf Sockel absetzen"));
 Shape(A,TEXT("Cylinder"),FVector(4750,0,5),FVector(1.6,1.6,.1),TEXT("A1844D"));Shape(A,TEXT("Cylinder"),FVector(4750,0,10),FVector(1.34,1.34,.015),TEXT("E6D5AE"));Label(A,TEXT("3/10"),FVector(4750,0,12),40,FRotator(90,180,0));AddTarget(403,FVector(4750,0,10),TEXT("Eimer auf 3/10-Platte stellen"));
 Terminal(A,FVector(4470,-350,0),TEXT("1 L · drei Zehntel"));
 Bucket=W->SpawnActor<AActor>();Root(Bucket);
 // Inner cylinder: radius4.46cm, calibrated height16cm => approximately1L.
 Shape(Bucket,TEXT("Cylinder"),FVector(0,0,1),FVector(.104,.104,.02),TEXT("AFA987"),FRotator::ZeroRotator,false,true);
 auto* Shell=NewObject<UProceduralMeshComponent>(Bucket);Shell->SetupAttachment(Bucket->GetRootComponent());Shell->RegisterComponent();Shell->SetCollisionEnabled(ECollisionEnabled::NoCollision);
 TArray<FVector> SV,SN;TArray<int32> SI;TArray<FVector2D> SU;TArray<FLinearColor> SC;TArray<FProcMeshTangent> ST;
 for(int I=0;I<=32;++I){float Ang=I*2*PI/32;FVector N(FMath::Cos(Ang),FMath::Sin(Ang),0);for(float Z:{2.f,18.f}){SV.Add(N*4.46+FVector(0,0,Z));SN.Add(N);SU.Add(FVector2D(float(I)/32,(Z-2)/16));SC.Add(FLinearColor::White);}if(I<32){int B=I*2;SI.Append({B,B+2,B+1,B+1,B+2,B+3});}}
 Shell->CreateMeshSection_LinearColor(0,SV,SI,SN,SU,SC,ST,false);
 if(auto* Glass=LoadObject<UMaterial>(nullptr,TEXT("/Game/Materials/M_Glass.M_Glass")))Shell->SetMaterial(0,Glass);
 auto* Rim=NewObject<UProceduralMeshComponent>(Bucket);Rim->SetupAttachment(Bucket->GetRootComponent());Rim->RegisterComponent();TArray<FVector> RV,RN;TArray<int32> RI;TArray<FVector2D> RU;TArray<FLinearColor> RC;TArray<FProcMeshTangent> RT;
 for(float Height:{2.f,18.f}){int Offset=RV.Num();for(int I=0;I<=48;++I)for(int J=0;J<=8;++J){float Ang=I*2*PI/48,Small=J*2*PI/8;FVector Normal(FMath::Cos(Ang)*FMath::Cos(Small),FMath::Sin(Ang)*FMath::Cos(Small),FMath::Sin(Small));RV.Add(FVector(FMath::Cos(Ang)*4.9,FMath::Sin(Ang)*4.9,Height)+Normal*.32f);RN.Add(Normal);RU.Add(FVector2D(float(I)/48,float(J)/8));RC.Add(FLinearColor::White);if(I<48&&J<8){int K=Offset+I*9+J;RI.Append({K,K+9,K+1,K+1,K+9,K+10});}}}Rim->CreateMeshSection_LinearColor(0,RV,RI,RN,RU,RC,RT,false);if(auto* RM=Mat(Bucket,Col(TEXT("B9B092"))))Rim->SetMaterial(0,RM);
 for(int I=0;I<10;++I){float H=2+(I+1)*1.6f;Shape(Bucket,TEXT("Cube"),FVector(-4.6,0,H),FVector(.006,.027,.004),TEXT("374336"),FRotator::ZeroRotator,false,true);Label(Bucket,FString::Printf(TEXT("%d/10"),I+1),FVector(-4.8,2.5,H),.8,FRotator(0,180,0),true);}
 for(int Sign:{-1,1})Shape(Bucket,TEXT("Cube"),FVector(0,Sign*5,20),FVector(.012,.012,.07),TEXT("B4A889"),FRotator::ZeroRotator,false,true);
 Shape(Bucket,TEXT("Cube"),FVector(0,0,23.5),FVector(.012,.11,.012),TEXT("B4A889"),FRotator::ZeroRotator,false,true);
 Label(Bucket,TEXT("1 L"),FVector(-5,0,20.8),2,FRotator(0,180,0),true);
 BucketAmount=Label(Bucket,TEXT("0/10"),FVector(-5,0,-2),1.3,FRotator(0,180,0),true);
 BucketWater=Shape(Bucket,TEXT("Cylinder"),FVector(0,0,2),FVector(.0892,.0892,.001),TEXT("56B9D1"),FRotator::ZeroRotator,false,true);
 // Thin solved connections sit within neutral channels rather than covering paths with neon.
 float Ends[3]={-150,1350,5050};float Begins[3]={-330,1150,4750};for(int I=0;I<3;++I){Shape(A,TEXT("Cube"),FVector((Begins[I]+Ends[I])*.5,120,7),FVector((Ends[I]-Begins[I])/100,.12,.025),TEXT("8C754D"));Cables.Add(Shape(A,TEXT("Cube"),FVector((Begins[I]+Ends[I])*.5,120,9),FVector((Ends[I]-Begins[I])/100,.035,.02),TEXT("62D6B4"),FRotator::ZeroRotator,false,false,true));}
 // Tower: exactly eight dark openings, first two receive area milestones.
 Shape(A,TEXT("Cylinder"),FVector(12200,250,380),FVector(3.4,3.4,7.6),TEXT("E6D4B0"),FRotator::ZeroRotator,true);
 Shape(A,TEXT("Cylinder"),FVector(12200,250,775),FVector(3.9,3.9,.35),TEXT("F0E0BD"));Shape(A,TEXT("Cone"),FVector(12200,250,870),FVector(4.2,4.2,1.65),TEXT("AC6248"));
 for(int I=0;I<8;++I){FVector P(12026,250+(I%4-1.5f)*66,445+(I/4)*130);Shape(A,TEXT("Cube"),P,FVector(.03,.44,.65),TEXT("4C665D"));Signals.Add(Shape(A,TEXT("Cube"),P+FVector(-2,0,0),FVector(.03,.28,.44),TEXT("A6E3BB"),FRotator::ZeroRotator,false,false,true));}
 // Warm garden, lime transition, restrained pink and distant cypress groups.
 for(int I=0;I<50;++I){float X=-1550+(I/2)*440;float Y=(I%2?1:-1)*(810+(I%3)*95);const TCHAR* Color=X<1450?(I%3?TEXT("E7AA25"):TEXT("D87822")):X<3200?(I%3?TEXT("B5C743"):TEXT("DCA2B3")):X<6600?(I%3?TEXT("A4C42F"):TEXT("6E9F3B")):(I%3?TEXT("91AE46"):TEXT("DCA2B3"));Tree(W,FVector(X,Y,2),408+I,Color);}
 BuildPuzzleWorld();
 // Hand-set sandstone outcrops supply layered silhouettes behind trees.
 FRandomStream R(804);for(int I=0;I<36;++I){float X=R.FRandRange(-1700,12600),Y=(I%2?1:-1)*R.FRandRange(1040,1200);for(int N=0;N<3;++N)Shape(A,TEXT("Cube"),FVector(X,Y,40+N*70),FVector(R.FRandRange(1.2,2.5),R.FRandRange(.8,1.5),.8),N%2?TEXT("D8BF93"):TEXT("C4AA7E"),FRotator(0,I*13,0));}
}
void AIslandGameMode::BuildPuzzleWorld(){auto* W=GetWorld();auto* A=W->SpawnActor<AActor>();
 Gates.Add(Gate(W,3100));Gates.Add(Gate(W,6500));Gates.Add(Gate(W,11550));
 int Endpoints[]={3100,6500,11550},Starts[]={2920,6300,11300};for(int I=0;I<3;++I){Shape(A,TEXT("Cube"),FVector((Starts[I]+Endpoints[I])*.5,120,7),FVector((Endpoints[I]-Starts[I])/100.f,.12,.025),TEXT("8C754D"));Cables.Add(Shape(A,TEXT("Cube"),FVector((Starts[I]+Endpoints[I])*.5,120,9),FVector((Endpoints[I]-Starts[I])/100.f,.035,.02),TEXT("62D6B4"),FRotator::ZeroRotator,false,false,true));}
 // Garden room corners and planted islands break the long tiled axis without hiding words.
 for(int X:{-1180,1650,2750,5350,7000,10850})for(int Sign:{-1,1}){Shape(A,TEXT("Cube"),FVector(X,Sign*750,12),FVector(3.3,3.0,.22),TEXT("CEB88F"));Shape(A,TEXT("Cube"),FVector(X,Sign*750,48),FVector(3.05,2.75,.7),TEXT("527943"));}
 // Two house fronts and individual roof rows frame the sentence courtyard.
 for(int Sign:{-1,1}){FVector House(2200,Sign*1060,200);Shape(A,TEXT("Cube"),House,FVector(6.4,3.8,4),TEXT("E1CCA4"),FRotator::ZeroRotator,true);Shape(A,TEXT("Cube"),House+FVector(0,0,-150),FVector(6.65,4,.5),TEXT("B9A27D"));for(int I=0;I<14;++I)for(int J=0;J<5;++J)Shape(A,TEXT("Cylinder"),House+FVector(-310+I*46,-180+J*72,235+FMath::Abs(2-J)*-20),FVector(.45,.45,.8),TEXT("AD6346"),FRotator(90,0,0));for(int I=0;I<3;++I){Shape(A,TEXT("Cube"),FVector(1950+I*230,Sign*861,220),FVector(1.2,.05,1.65),TEXT("526759"));Shape(A,TEXT("Cube"),FVector(1950+I*230,Sign*853,220),FVector(.05,.05,1.6),TEXT("D2B18B"));}}
 const TCHAR* Parts[]={TEXT("heute"),TEXT("öffnet"),TEXT("der Fuchs"),TEXT("den Eingang")};
 for(int I=0;I<4;++I){FVector P(1920+(I/2)*310,(I%2?1:-1)*240,8);Shape(A,TEXT("Cube"),P,FVector(2.45,1.55,.13),TEXT("F0DCB5"));Label(A,Parts[I],P+FVector(0,0,8),25,FRotator(90,180,0));AddTarget(500+I,P,Parts[I],TEXT("Dieser Teil gehört zu deinem Satz: ")+FString(Parts[I])+TEXT(". Wähle alle vier Teile. Das Wort öffnet muss auf Platz 2 liegen."));FVector Slot(2770,(I-1.5)*190,45);Shape(A,TEXT("Cube"),Slot,FVector(.9,1.7,.9),TEXT("DDCAA6"),FRotator::ZeroRotator,true);SentenceSlots.Add(Label(A,TEXT(""),Slot+FVector(-47,0,35),19));}
 Terminal(A,FVector(1730,-425,0),TEXT("Satzweg starten"));AddTarget(510,FVector(1730,-425,100),TEXT("Der Satzplatz"));Terminal(A,FVector(2340,-530,0),TEXT("Teil zurück"));AddTarget(511,FVector(2340,-530,100),TEXT("Letzten Satzteil zurücknehmen"));Terminal(A,FVector(2920,530,0),TEXT("Satz prüfen"));AddTarget(512,FVector(2920,530,100),TEXT("Aussagesatz prüfen"));
 // Authored route board and calibrated1L display, not a many-liter tank labelled1L.
 Terminal(A,FVector(5350,-650,0),TEXT("Derselbe Becher · 1 L"));AddTarget(600,FVector(5350,-650,100),TEXT("Wasseraufgabe: 1 Liter"));Shape(A,TEXT("Cube"),FVector(5700,0,45),FVector(.9,1.4,.9),TEXT("DCC39A"),FRotator::ZeroRotator,true);auto* Basin=W->SpawnActor<AActor>();Root(Basin);Basin->SetActorLocation(FVector(5700,0,90));Shape(Basin,TEXT("Cube"),FVector(0,0,1),FVector(.12,.12,.02),TEXT("A99471"),FRotator::ZeroRotator,false,true);BasinWater=Shape(Basin,TEXT("Cube"),FVector(0,0,2),FVector(.1,.1,.001),TEXT("58BBD0"),FRotator::ZeroRotator,false,true);
 for(int I=0;I<11;++I){Shape(Basin,TEXT("Cube"),FVector(-5.7,0,2+I),FVector(.012,.075,.008),TEXT("354A3D"),FRotator::ZeroRotator,false,true);}Label(Basin,TEXT("1 L"),FVector(-6,0,16),4,FRotator(0,180,0),true);
 Label(A,TEXT("ZIEL: 1 L = 1000 ml"),FVector(5651,0,58),12);
 // Two visible inlet branches now supply measured portions to the same carried cup.
 for(int I=0;I<2;++I){FVector P(5480+I*300,-380,0);Shape(A,TEXT("Cylinder"),P+FVector(0,0,25),FVector(1.25,1.25,.5),TEXT("D7BF93"),FRotator::ZeroRotator,true);Shape(A,TEXT("Cube"),P+FVector(35,-45,95),FVector(.35,.35,1.9),TEXT("B7985F"));Branch(A,P+FVector(35,-45,150),P+FVector(-20,-10,150),8,TEXT("B89B62"));Branch(A,P+FVector(-20,-10,150),P+FVector(-20,-10,115),6,TEXT("B89B62"));Terminal(A,P+FVector(-90,-70,0),I?TEXT("+200 ml = 1/5 L"):TEXT("+100 ml = 1/10 L"));AddTarget(601+I,P+FVector(0,0,100),I?TEXT("Großer Hahn: 200 ml einfüllen"):TEXT("Kleiner Hahn: 100 ml einfüllen"));Branch(A,P+FVector(0,-55,20),FVector(5670,-145,20),4,TEXT("8B7551"));}
 Terminal(A,FVector(6060,-380,0),TEXT("−100 ml = 1/10 L"));Shape(A,TEXT("Cylinder"),FVector(6060,-380,15),FVector(1.0,1.0,.3),TEXT("7198A0"));AddTarget(603,FVector(6060,-380,100),TEXT("Ablauf: 100 ml aus dem Becher lassen"));
 Terminal(A,FVector(5510,120,0),TEXT("Hier 1 L eingießen"));AddTarget(604,FVector(5700,0,115),TEXT("Zielbecken: vollen Messbecher eingießen"));
 // Four distinct fraction finds on a safe lower loop; values use the same tenth unit.
 const TCHAR* Values[]={TEXT("1/10"),TEXT("1/5"),TEXT("2/5"),TEXT("1/2")};int Filled[]={1,2,4,5};
 for(int I=0;I<4;++I){FVector P(6850+I*400,I%2?650:-650,110);Shape(A,TEXT("Cube"),P,FVector(.5,1.6,2.2),TEXT("D7BE96"),FRotator::ZeroRotator,true);Label(A,Values[I],P+FVector(-28,0,40),28);auto* Pie=NewObject<UProceduralMeshComponent>(A);Pie->SetupAttachment(A->GetRootComponent());Pie->RegisterComponent();TArray<FVector> V,N;TArray<int32> T;TArray<FVector2D> U;TArray<FLinearColor> C;TArray<FProcMeshTangent> Tangents;for(int K=0;K<60;++K){int B=V.Num();for(int J=0;J<3;++J){float Angle=(K+(J==2?1:0))*2*PI/60;V.Add(P+FVector(-27,J==0?0:FMath::Cos(Angle)*45,-30+(J==0?0:FMath::Sin(Angle)*45)));N.Add(FVector(-1,0,0));U.Add(FVector2D(.5,.5));C.Add(K<Filled[I]*6?Col(TEXT("ADBF52")):Col(TEXT("817557")));}T.Append({B,B+1,B+2});}Pie->CreateMeshSection_LinearColor(0,V,T,N,U,C,Tangents,false);if(auto* M=Mat(A,FLinearColor::White))Pie->SetMaterial(0,M);AddTarget(700+I,P,Values[I]+FString(TEXT(" · Felsrelief")),TEXT("Dieses Relief zeigt ")+FString(Values[I])+TEXT(" eines Ganzen. Entdecken ist erlaubt; für die Lösung wählst du später genau drei Funde."));}
 Terminal(A,FVector(8050,-250,0),TEXT("Drei Funde ordnen"));AddTarget(710,FVector(8050,-250,100),TEXT("Das Fundbuch"));
 // A real stepped ascent and descent, with a protected elevated viewing terrace.
 for(int I=0;I<33;++I){float Height=(I+1)*30;Shape(A,TEXT("Cube"),FVector(7600+I*50,0,Height*.5f),FVector(.5,3.1,Height/100),TEXT("D8C49D"),FRotator::ZeroRotator,true);float Down=(33-I)*30;Shape(A,TEXT("Cube"),FVector(9900+I*50,0,Down*.5f),FVector(.5,3.1,Down/100),TEXT("D8C49D"),FRotator::ZeroRotator,true);}
 Shape(A,TEXT("Cube"),FVector(9550,-450,980),FVector(6.5,12,.4),TEXT("DECBA6"),FRotator::ZeroRotator,true);for(int X=9250;X<=9850;X+=150){for(int Sign:{-1,1}){FVector P(X,Sign>0?125:-1025,1030);Shape(A,TEXT("Cube"),P,FVector(.2,.2,.65),TEXT("D9C198"),FRotator::ZeroRotator,true);Shape(A,TEXT("Cube"),P+FVector(0,0,35),FVector(1.5,.2,.17),TEXT("E9D6B0"),FRotator::ZeroRotator,true);}}
 Shape(A,TEXT("Cylinder"),FVector(ObservationStand.X,ObservationStand.Y,1003),FVector(1.5,1.5,.04),TEXT("AB9362"));Shape(A,TEXT("Cube"),FVector(9580,-860,1040),FVector(1.5,.5,.7),TEXT("D2BD94"),FRotator::ZeroRotator,true);Terminal(A,FVector(9400,-710,1000),TEXT("Blickhilfe"));AddTarget(711,FVector(9400,-710,1100),TEXT("Blickhilfe am Felsfenster"));AddTarget(712,ObservationStand,TEXT("Verbindung der drei Formen bestätigen"));
 for(int X:{9240,9860})for(int Y=-950;Y<=-200;Y+=150){Shape(A,TEXT("Cube"),FVector(X,Y,1030),FVector(.2,.2,.65),TEXT("D9C198"),FRotator::ZeroRotator,true);Shape(A,TEXT("Cube"),FVector(X,Y,1065),FVector(.2,1.5,.15),TEXT("E9D6B0"),FRotator::ZeroRotator,true);}
 const FVector Eye=ObservationStand+FVector(0,0,72),Forward=ObservationView.Vector(),Right=FRotationMatrix(ObservationView).GetUnitAxis(EAxis::Y),Up=FRotationMatrix(ObservationView).GetUnitAxis(EAxis::Z);
 for(int Part=0;Part<3;++Part){float Depth=700+Part*1000;FVector Center=Eye+Forward*Depth;FVector Support=Center+Right*(Part==0?1:-1)*Depth*.265f;float MidAngle=FMath::DegreesToRadians(-30+Part*120.f);FVector ArcMid=Eye+(Forward+(Right*FMath::Cos(MidAngle)+Up*FMath::Sin(MidAngle))*.12f)*Depth;Support.Z=ArcMid.Z+50;Shape(A,TEXT("Cube"),FVector(Support.X,Support.Y,Support.Z*.5f),FVector(1.1,1.1,Support.Z/100),TEXT("D4BC94"),FRotator::ZeroRotator,false);Branch(A,Support,ArcMid+Forward*Depth*.04f,Depth*.018f,TEXT("D4BC94"));for(int I=0;I<24;++I){float Ang1=FMath::DegreesToRadians(-90+Part*120+I*5.f),Ang2=Ang1+FMath::DegreesToRadians(5.f);FVector A1=Eye+(Forward+(Right*FMath::Cos(Ang1)+Up*FMath::Sin(Ang1))*.12f)*Depth,A2=Eye+(Forward+(Right*FMath::Cos(Ang2)+Up*FMath::Sin(Ang2))*.12f)*Depth;Branch(A,A1+Forward*Depth*.04f,A2+Forward*Depth*.04f,Depth*.02f,TEXT("D4BC94"));Branch(A,A1,A2,Depth*.009f,TEXT("A36A3F"));}Shape(A,TEXT("Cube"),Support,FVector(1.5,1.5,.35),TEXT("E2CCA2"));}
 Terminal(A,FVector(12200,0,0),TEXT("Vier Signale"));AddTarget(800,FVector(12200,0,100),TEXT("Der Turmabschnitt"));Terminal(A,FVector(1550,700,0),TEXT("Zusatz: Wortkontext"));AddTarget(820,FVector(1550,700,100),TEXT("Zusatz für Entdecker · Wortarten"));Terminal(A,FVector(6300,-550,0),TEXT("Zusatz: Zwölftel"));AddTarget(821,FVector(6300,-550,100),TEXT("Zusatz für Entdecker · Brüche"));
 BuildFox();
}

#include "ExpeditionWorld.h"
#include "Camera/CameraActor.h"
#include "Camera/CameraComponent.h"
#include "Components/StaticMeshComponent.h"
#include "Components/SceneComponent.h"
#include "Materials/Material.h"
#include "Materials/MaterialInstanceDynamic.h"
#include "Engine/StaticMesh.h"
#include "Engine/World.h"
#include "EngineUtils.h"

namespace {
FLinearColor Tint(const TCHAR* Hex) { return FLinearColor::FromSRGBColor(FColor::FromHex(Hex)); }
// All forms are original arrangements of the Engine's five basic meshes. Shared
// palette materials keep the authored landscape inexpensive and deterministic.
struct FIslandArt {
 UWorld* World;
 AActor* Landscape;
 TMap<FString,UStaticMesh*> Meshes;
 TMap<FString,UMaterialInstanceDynamic*> Palette;
 UMaterial* Base;
 explicit FIslandArt(UWorld* W):World(W) {
  Landscape=Actor(FVector::ZeroVector);
  Landscape->Tags.Add(TEXT("ExpeditionIslandArt"));
  Base=LoadObject<UMaterial>(nullptr,TEXT("/Game/Materials/M_Expedition.M_Expedition"));
 }
 AActor* Actor(FVector Position) {
  auto* A=World->SpawnActor<AActor>();
  auto* Root=NewObject<USceneComponent>(A);
  A->SetRootComponent(Root);Root->RegisterComponent();A->SetActorLocation(Position);
  return A;
 }
 UStaticMeshComponent* Shape(const TCHAR* Type,FVector P,FVector S,const TCHAR* Color,FRotator R=FRotator::ZeroRotator,AActor* Owner=nullptr) {
  if(!Owner)Owner=Landscape;
  auto* M=NewObject<UStaticMeshComponent>(Owner);
  const FString Key(Type);
  UStaticMesh** Existing=Meshes.Find(Key);
  UStaticMesh* Mesh=Existing?*Existing:LoadObject<UStaticMesh>(nullptr,*(TEXT("/Engine/BasicShapes/")+Key+TEXT(".")+Key));
  if(!Existing)Meshes.Add(Key,Mesh);
  M->SetStaticMesh(Mesh);M->SetMobility(EComponentMobility::Movable);
  M->SetCollisionEnabled(ECollisionEnabled::NoCollision);
  M->SetupAttachment(Owner->GetRootComponent());M->RegisterComponent();
  M->SetRelativeLocation(P);M->SetRelativeRotation(R);M->SetRelativeScale3D(S);
  if(Base) {
   UMaterialInstanceDynamic** Cached=Palette.Find(Color);
   UMaterialInstanceDynamic* Material=Cached?*Cached:UMaterialInstanceDynamic::Create(Base,Landscape);
   if(!Cached) { Material->SetVectorParameterValue(TEXT("Tint"),Tint(Color));Palette.Add(Color,Material); }
   M->SetMaterial(0,Material);
  }
  return M;
 }
 UStaticMeshComponent* Box(FVector P,FVector Size,const TCHAR* C,FRotator R=FRotator::ZeroRotator,AActor* Owner=nullptr) {return Shape(TEXT("Cube"),P,Size/100,C,R,Owner);}
 UStaticMeshComponent* Ball(FVector P,FVector Size,const TCHAR* C,FRotator R=FRotator::ZeroRotator,AActor* Owner=nullptr) {return Shape(TEXT("Sphere"),P,Size/100,C,R,Owner);}
 UStaticMeshComponent* Disc(FVector P,float Diameter,float Height,const TCHAR* C,AActor* Owner=nullptr) {return Shape(TEXT("Cylinder"),P,FVector(Diameter/100,Diameter/100,Height/100),C,FRotator::ZeroRotator,Owner);}
 void Beam(FVector A,FVector B,float Width,const TCHAR* C,AActor* Owner=nullptr) {
  const FVector D=B-A;
  Box((A+B)*.5f,FVector(D.Size(),Width,Width),C,D.Rotation(),Owner);
 }
 void Ring(FVector P,float Radius,float Width,float Height,const TCHAR* C,int Segments=16,AActor* Owner=nullptr) {
  for(int I=0;I<Segments;++I) {
   const float Angle=I*2*PI/Segments;
   Box(P+FVector(FMath::Cos(Angle)*Radius,FMath::Sin(Angle)*Radius,0),FVector(Width,2*Radius*FMath::Sin(PI/Segments)+2,Height),C,FRotator(0,FMath::RadiansToDegrees(Angle),0),Owner);
  }
 }
 void Flower(FVector P,int Kind=0) {
  Ball(P+FVector(0,0,5),FVector(42,32,18),TEXT("54824B"));
  // Tiny clumps read as flowers rather than dozens of loose dots.
  for(int I=0;I<2;++I) {
   FVector Q=P+FVector((I-.5f)*19,I%2*11,22+I%2*8);
   Box(Q-FVector(0,0,8),FVector(3,3,21),TEXT("668653"));
   Ball(Q,FVector(16,15,8),Kind==1?TEXT("E2B84F"):Kind==2?TEXT("BE88AF"):TEXT("F2E7C5"));
   Ball(Q+FVector(0,0,4),FVector(5,5,3),TEXT("D3A44B"));
  }
 }
 void Shrub(FVector P,float Scale=1) {
  Ball(P+FVector(0,0,24*Scale),FVector(112,90,57)*Scale,TEXT("487D48"));
  Ball(P+FVector(-25,-12,40)*Scale,FVector(77,62,47)*Scale,TEXT("719F4E"));
  Ball(P+FVector(26,5,36)*Scale,FVector(70,58,43)*Scale,TEXT("8FB259"));
 }
 void Rock(FVector P,float Scale=1,int Kind=0) {
  const TCHAR* Dark=Kind?TEXT("8D958B"):TEXT("8D8674");
  const TCHAR* Light=Kind?TEXT("AFB5A6"):TEXT("B9AA8C");
  Ball(P+FVector(0,0,30)*Scale,FVector(120,96,86)*Scale,Dark,FRotator(9,27,14));
  Ball(P+FVector(-18,-12,53)*Scale,FVector(80,76,61)*Scale,Light,FRotator(12,-22,19));
  Ball(P+FVector(43,15,16)*Scale,FVector(62,55,40)*Scale,Dark);
 }
 void Tree(FVector P,float Scale,int Family) {
  // Five families: broadleaf, tall cedar, bent shore tree, orchard, pale birch.
  const TCHAR* Bark=Family==4?TEXT("D5CAB0"):TEXT("886849");
  Ball(P+FVector(0,0,100)*Scale,FVector(45,48,215)*Scale,Bark,FRotator(0,0,Family==2?18:4));
  for(int I=0;I<3;++I) {
   const float A=(I*120+25)*PI/180;
   Beam(P+FVector(0,0,25)*Scale,P+FVector(FMath::Cos(A)*43,FMath::Sin(A)*43,7)*Scale,17*Scale,Bark);
  }
  if(Family==1) {
   for(int I=0;I<4;++I) {
    const float D=(240-I*37)*Scale;
    Shape(TEXT("Cone"),P+FVector(0,0,145+I*57)*Scale,FVector(D/100,D/100,1.20*Scale),I%2?TEXT("4F8B55"):TEXT("326A4D"));
   }
  } else {
   const float Lean=Family==2?64:0;
   Ball(P+FVector(Lean,0,218)*Scale,FVector(260,225,137)*Scale,TEXT("32694A"));
   for(int I=0;I<5;++I) {
    const float A=(I*72+Family*13)*PI/180;
    const FVector Crown(FMath::Cos(A)*81+Lean,FMath::Sin(A)*66,224+(I%3)*22);
    Ball(P+Crown*Scale,FVector(155+(I%2)*19,137,104)*Scale,I%2?TEXT("70A452"):TEXT("508B4C"),FRotator(0,I*37,7));
   }
   Ball(P+FVector(Lean-16,-6,288)*Scale,FVector(146,131,88)*Scale,TEXT("8BB45A"));
   Beam(P+FVector(0,0,120)*Scale,P+FVector(Lean+66,22,210)*Scale,24*Scale,Bark);
   if(Family==3)for(int I=0;I<4;++I)Ball(P+FVector((I-1.5f)*43,-72,232+I%2*29)*Scale,FVector(19,19,22)*Scale,TEXT("D7B64B"));
   if(Family==4)for(int I=0;I<3;++I)Box(P+FVector(0,23,62+I*38)*Scale,FVector(21,3,7)*Scale,TEXT("756E5A"));
  }
 }
 void Planter(FVector P,int Kind=0) {
  Box(P+FVector(0,0,23),FVector(88,64,44),TEXT("947351"));
  Box(P+FVector(0,0,45),FVector(77,54,7),TEXT("564A36"));
  for(int S:{-1,1})Box(P+FVector(0,S*31,30),FVector(93,6,8),TEXT("C3A77A"));
  Flower(P+FVector(-23,0,48),Kind);Flower(P+FVector(20,0,48),Kind);
 }
 void Bench(FVector P) {
  for(int I=0;I<3;++I)Box(P+FVector(0,I*15,53),FVector(150,13,10),TEXT("A77F54"));
  for(int I=0;I<2;++I)Box(P+FVector(0,35,83+I*16),FVector(154,8,13),TEXT("B48D62"));
  for(int S:{-1,1})Box(P+FVector(S*58,15,28),FVector(10,48,55),TEXT("5D6B5A"));
 }
 void Lamp(FVector P,bool Warm=false) {
  Disc(P+FVector(0,0,8),34,15,TEXT("737968"));
  Disc(P+FVector(0,0,88),9,160,TEXT("4D5E57"));
  Box(P+FVector(0,0,176),FVector(34,34,42),Warm?TEXT("E7BD65"):TEXT("E1D5AD"));
  Shape(TEXT("Cone"),P+FVector(0,0,204),FVector(.60,.60,.27),TEXT("4D5E57"));
 }
 void House(FVector P,float Width,const TCHAR* Roof) {
  Box(P+FVector(0,0,20),FVector(Width+34,290,35),TEXT("B8A98A"));
  Box(P+FVector(0,0,139),FVector(Width,245,235),TEXT("E4D6B1"));
  // Soft corner pilasters, separated sill and painted window shutters.
  for(int S:{-1,1})Box(P+FVector(S*(Width*.5f-14),0,137),FVector(27,259,238),TEXT("C7B99B"));
  for(int S:{-1,1}) {
   Box(P+FVector(S*Width*.29f,125,158),FVector(64,9,75),TEXT("705A42"));
   Box(P+FVector(S*Width*.29f,131,158),FVector(51,7,62),TEXT("729FA3"));
   Box(P+FVector(S*Width*.29f,137,158),FVector(6,7,68),TEXT("E9D8AD"));
   Box(P+FVector(S*Width*.29f,137,156),FVector(56,7,5),TEXT("E9D8AD"));
   for(int T:{-1,1})Box(P+FVector(S*Width*.29f+T*41,127,158),FVector(16,12,77),TEXT("608B91"));
  }
  Box(P+FVector(0,131,104),FVector(67,13,165),TEXT("806349"));
  Box(P+FVector(0,139,102),FVector(52,6,148),TEXT("A08356"));
  Ball(P+FVector(18,146,108),FVector(7,7,7),TEXT("D2B875"));
  Box(P+FVector(0,163,17),FVector(100,73,26),TEXT("D0C0A0"));
  for(int Side:{-1,1}) {
   const FRotator Slope(0,0,Side*30);
   Box(P+FVector(0,Side*72,283),FVector(Width+67,184,16),Roof,Slope);
   // Chunky curved channels over each slope suggest hand-made terracotta tiles.
   const int Tiles=FMath::RoundToInt(Width/52);
   for(int I=0;I<Tiles;++I) {
    const float X=(I-(Tiles-1)*.5f)*52;
    Ball(P+FVector(X,Side*70,296),FVector(47,178,20),I%3?Roof:TEXT("D78C64"),Slope);
   }
   Box(P+FVector(0,Side*150,241),FVector(Width+77,16,17),TEXT("95694C"));
  }
  Ball(P+FVector(0,0,333),FVector(Width+66,27,29),TEXT("D7966C"));
  Box(P+FVector(Width*.30f,-62,340),FVector(48,47,120),TEXT("C6B799"));
  Box(P+FVector(Width*.30f,-62,404),FVector(57,57,17),TEXT("E2D6B6"));
  Planter(P+FVector(-Width*.30f,175,0));
 }
 void Spiral(FVector P,AActor* Owner=nullptr,float Scale=1) {
  Ball(P,FVector(56,46,28)*Scale,TEXT("E6BFAD"),FRotator(0,0,0),Owner);
  for(int I=0;I<12;++I) {
   const float A=I*.73f,Radius=(3+I*1.6f)*Scale;
   Ball(P+FVector(FMath::Cos(A)*Radius,FMath::Sin(A)*Radius,12*Scale),FVector(7,7,6)*Scale,TEXT("F5DFC4"),FRotator::ZeroRotator,Owner);
  }
 }
 AActor* Person(FVector P,int Kind,TArray<UStaticMeshComponent*>* Animated=nullptr) {
  auto* A=Actor(P);
  const bool Child=Kind==0;
  const TCHAR* Skin=Kind==1?TEXT("A96E4D"):TEXT("E5B893");
  const TCHAR* Coat=Kind==0?TEXT("367F80"):Kind==1?TEXT("448E98"):Kind==2?TEXT("778459"):Kind==3?TEXT("506C85"):TEXT("E2D7B8");
  Ball(FVector(0,0,-1),FVector(45,34,59),Child?TEXT("EEE1C0"):Coat,FRotator::ZeroRotator,A);
  Ball(FVector(0,0,47),FVector(64,58,65),Skin,FRotator::ZeroRotator,A);
  // Ears, nose, eyes, brows and individual hair masses define a chibi face.
  for(int S:{-1,1}) {
   Ball(FVector(S*31,-1,44),FVector(12,14,18),Skin,FRotator::ZeroRotator,A);
   Ball(FVector(S*12,-27,48),FVector(7,5,10),TEXT("353F3C"),FRotator::ZeroRotator,A);
   Ball(FVector(S*13,-30,50),FVector(2,2,3),TEXT("FFF4DB"),FRotator::ZeroRotator,A);
   Box(FVector(S*12,-28,59),FVector(9,4,3),Kind==1?TEXT("443F36"):TEXT("7A614D"),FRotator(0,0,S*8),A);
   Ball(FVector(S*22,-24,35),FVector(11,3,5),Kind==1?TEXT("BA7F60"):TEXT("D69A81"),FRotator::ZeroRotator,A);
  }
  Ball(FVector(0,-30,40),FVector(8,10,8),Skin,FRotator::ZeroRotator,A);
  Box(FVector(0,-28,29),FVector(10,3,2),TEXT("936D59"),FRotator::ZeroRotator,A);
  const TCHAR* Hair=Kind==1?TEXT("484137"):Kind==3||Kind==4?TEXT("AEA8A5"):TEXT("7A6045");
  Ball(FVector(0,5,64),FVector(66,55,33),Hair,FRotator::ZeroRotator,A);
  for(int I=0;I<3;++I)Ball(FVector(-22+I*20,-15,67+I%2*6),FVector(28,25,21),Hair,FRotator(0,I*20,0),A);
  for(int S:{-1,1}) {
   auto* Leg=Ball(FVector(S*12,0,-28),FVector(18,22,31),Child?TEXT("BFA98B"):TEXT("5F6254"),FRotator::ZeroRotator,A);
   auto* Arm=Ball(FVector(S*28,0,0),FVector(18,21,38),Child||Kind==2?TEXT("EEE1C0"):Coat,FRotator(0,0,S*12),A);
   auto* Hand=Ball(FVector(S*28,-2,-20),FVector(17,18,20),Skin,FRotator::ZeroRotator,A);
   auto* Boot=Ball(FVector(S*12,-5,-41),FVector(23,34,18),TEXT("4B5148"),FRotator::ZeroRotator,A);
   Hand->AttachToComponent(Arm,FAttachmentTransformRules::KeepWorldTransform);
   Boot->AttachToComponent(Leg,FAttachmentTransformRules::KeepWorldTransform);
   if(Animated)Animated->Add(Leg);
   // Arms are added after both legs below to preserve the movement contract.
   if(Animated)Arm->ComponentTags.Add(TEXT("ExplorerArm"));
  }
  if(Animated) {
   TArray<UStaticMeshComponent*> Parts;A->GetComponents(Parts);
   for(auto* M:Parts)if(M->ComponentHasTag(TEXT("ExplorerArm")))Animated->Add(M);
  }
  if(Kind==0) {
   Ball(FVector(0,-8,-2),FVector(43,27,54),Coat,FRotator::ZeroRotator,A);
   Box(FVector(0,-23,1),FVector(5,4,53),TEXT("D5C198"),FRotator::ZeroRotator,A);
   for(int S:{-1,1})Box(FVector(S*13,-24,-6),FVector(13,4,13),TEXT("28666C"),FRotator::ZeroRotator,A);
   Ball(FVector(0,2,-23),FVector(42,34,22),TEXT("927351"),FRotator::ZeroRotator,A);
   Ball(FVector(0,2,78),FVector(72,63,35),TEXT("CA873C"),FRotator::ZeroRotator,A);
   Disc(FVector(0,2,68),70,14,TEXT("D79945"),A);
   for(int I=0;I<12;++I) {
    const float Angle=I*2*PI/12;
    Ball(FVector(FMath::Cos(Angle)*32,FMath::Sin(Angle)*28+2,73),FVector(4,4,19),TEXT("E0AB5B"),FRotator::ZeroRotator,A);
   }
   Ball(FVector(0,2,97),FVector(15,15,15),TEXT("DEA64F"),FRotator::ZeroRotator,A);
   Ball(FVector(0,25,2),FVector(32,20,36),TEXT("E6D6AC"),FRotator::ZeroRotator,A);
   Box(FVector(0,36,-3),FVector(24,3,14),TEXT("C9B68D"),FRotator::ZeroRotator,A);
   for(int S:{-1,1})Box(FVector(S*13,14,3),FVector(5,5,40),TEXT("D4C399"),FRotator(0,0,S*8),A);
  } else if(Kind==1) {
   Ball(FVector(0,10,13),FVector(74,31,54),TEXT("327C84"),FRotator::ZeroRotator,A);
   Ball(FVector(27,13,69),FVector(28,28,33),Hair,FRotator::ZeroRotator,A);
   for(int I=0;I<3;++I)Ball(FVector(-23+I*22,-16,76),FVector(27,28,22),Hair,FRotator::ZeroRotator,A);
   for(int I=0;I<3;++I)Ball(FVector(7,-20,12-I*15),FVector(5,4,5),TEXT("E2BB62"),FRotator::ZeroRotator,A);
  } else if(Kind==2) {
   Disc(FVector(0,1,74),97,7,TEXT("D2B575"),A);
   Ball(FVector(0,1,85),FVector(61,55,25),TEXT("DBC28A"),FRotator::ZeroRotator,A);
   Disc(FVector(0,1,79),62,8,TEXT("857457"),A);
   Box(FVector(0,-19,-1),FVector(38,8,55),TEXT("5B785A"),FRotator::ZeroRotator,A);
   Ball(FVector(-7,-28,35),FVector(17,8,8),TEXT("D7CDC0"),FRotator::ZeroRotator,A);
   Ball(FVector(7,-28,35),FVector(17,8,8),TEXT("D7CDC0"),FRotator::ZeroRotator,A);
  } else if(Kind==3) {
   for(int I=0;I<3;++I)Box(FVector(0,-19,13-I*15),FVector(43,7,6),TEXT("E7DCC1"),FRotator::ZeroRotator,A);
   Ball(FVector(-17,-6,73),FVector(40,39,27),Hair,FRotator::ZeroRotator,A);
  } else {
   // Front-facing lens rims stay readable from the fixed camera.
   for(int S:{-1,1})for(int T:{-1,1}) {
    Box(FVector(S*14,-33,48+T*10),FVector(20,3,2),TEXT("655849"),FRotator::ZeroRotator,A);
    Box(FVector(S*14+T*10,-33,48),FVector(2,3,20),TEXT("655849"),FRotator::ZeroRotator,A);
   }
   Box(FVector(0,-33,49),FVector(9,3,2),TEXT("655849"),FRotator::ZeroRotator,A);
   Ball(FVector(19,7,86),FVector(28,28,26),Hair,FRotator::ZeroRotator,A);
   Box(FVector(0,-21,-4),FVector(5,6,54),TEXT("B9AA8D"),FRotator::ZeroRotator,A);
   Ball(FVector(29,6,-12),FVector(21,18,29),TEXT("B09466"),FRotator::ZeroRotator,A);
  }
  if(!Child)A->SetActorRotation(FRotator(0,180,0));
  return A;
 }
};
}

void AExpeditionGameMode::BuildWorld() {
 FIslandArt A(GetWorld());
 // Deep water is larger than any gameplay camera footprint. Land extends well
 // beyond the playable band; there are no missing tiles or black map borders.
 A.Box(FVector(2800,0,-114),FVector(28000,24000,60),TEXT("438FAD"));
 A.Box(FVector(2700,0,-80),FVector(10000,4600,35),TEXT("65B4BE"));
 A.Box(FVector(2650,-130,-37),FVector(8900,2300,72),TEXT("BAAC83"));
 A.Box(FVector(2650,-160,2),FVector(8750,2140,12),TEXT("87A45D"));
 // Overlapping low ellipses produce a sculpted shore instead of a rectangle.
 for(int I=0;I<15;++I) {
  const float X=-1000+I*535;
  A.Ball(FVector(X,790+FMath::Sin(I*1.8f)*85,-40),FVector(810,630,115),TEXT("CBB887"));
  A.Ball(FVector(X,714+FMath::Sin(I*1.8f)*85,-5),FVector(770,520,40),I>6&&I<11?TEXT("D9C493"):TEXT("89A45F"));
  A.Ball(FVector(X,-1070+FMath::Sin(static_cast<float>(I))*70,-10),FVector(870,470,55),TEXT("799451"));
 }
 // Four spaces share one ground plane and a broad, gently winding route.
 A.Box(FVector(-20,-70,12),FVector(1590,1150,14),TEXT("D5C49A"));
 A.Disc(FVector(450,-30,22),840,12,TEXT("DFCFAC"));
 for(int I=0;I<30;++I) {
  const float X=780+I*178;
  const float Y=45+FMath::Sin(I*.48f)*100;
  A.Ball(FVector(X,Y,13),FVector(440,325,22),X>2800&&X<4700?TEXT("DCC793"):TEXT("CFBC90"));
 }
 A.Box(FVector(3680,0,11),FVector(1970,1370,14),TEXT("DBC392"));
 A.Box(FVector(5460,-40,19),FVector(1560,1210,20),TEXT("C9BD9D"));
 A.Disc(FVector(5390,-30,33),1020,9,TEXT("DCCEB0"));
 // Low relief paving with varied seam lengths, no high-contrast checkerboard.
 for(int I=0;I<38;++I) {
  const float X=-620+(I%10)*144;
  const float Y=-400+(I/10)*220;
  A.Box(FVector(X,Y,22),FVector(125,190,5),I%4?TEXT("D9CAA6"):TEXT("CEBE97"),FRotator(0,(I%3-1)*3,0));
 }
 for(int I=0;I<21;++I) {
  const float X=1020+I*218;
  A.Ball(FVector(X,25+FMath::Sin(I*.56f)*85,28),FVector(78,63,9),I%2?TEXT("DBCBA4"):TEXT("E2D3B0"),FRotator(0,I*17,0));
 }
 // Border foliage stays outside the walking corridor, with lower shrubs on the
 // south edge so neither the explorer nor small puzzle props disappear.
 FRandomStream R(81027);
 for(int I=0;I<28;++I) {
  const float X=-1200+I*280+R.FRandRange(-38,38);
  A.Tree(FVector(X,-850-R.FRandRange(0,150),16),R.FRandRange(.83f,1.19f),I%5);
 }
 for(int I=0;I<9;++I)A.Tree(FVector(-1250+I*900,1090+R.FRandRange(-80,70),10),R.FRandRange(.83f,1.05f),I%5);
 for(int I=0;I<34;++I) {
  const float X=-1040+I*230;
  A.Shrub(FVector(X,-575-R.FRandRange(0,70),22),R.FRandRange(.8f,1.35f));
  if(I%3!=0)A.Shrub(FVector(X+45,640+R.FRandRange(0,110),18),R.FRandRange(.7f,1.15f));
  if(I%2==0)A.Rock(FVector(X+90,-670,15),R.FRandRange(.7f,1.1f),I%2);
 }
 for(int I=0;I<34;++I)A.Flower(FVector(-720+I*206,(I%2?-435:465)+R.FRandRange(-28,28),23),I%3);
 for(int I=0;I<22;++I) {
  const float X=2840+I*110;
  A.Rock(FVector(X,720+FMath::Sin(static_cast<float>(I))*95,-5),R.FRandRange(.5f,1.12f));
  A.Ball(FVector(X+22,855+FMath::Sin(static_cast<float>(I))*85,-67),FVector(136,14,4),TEXT("C1DDD4"),FRotator(0,I*11,0));
 }
 // Coastal village: low warm houses frame the plaza instead of covering it.
 A.House(FVector(-445,-635,20),330,TEXT("BD7856"));
 A.House(FVector(355,-640,20),285,TEXT("C6835C"));
 A.House(FVector(-1100,-390,17),245,TEXT("AD7658"));
 A.Bench(FVector(400,370,22));A.Lamp(FVector(-165,-405,20));A.Lamp(FVector(755,355,23));
 A.Planter(FVector(505,-340,22));A.Planter(FVector(862,-285,23),1);
 // Visible supply group: twenty rounded sacks, five in each of four crates.
 for(int K=0;K<4;++K) {
  const FVector P(150+(K%2)*110,-350-(K/2)*95,25);
  A.Box(P+FVector(0,0,17),FVector(95,80,31),TEXT("A68458"));
  for(int I=0;I<5;++I)A.Ball(P+FVector((I%3-1)*25,(I/3-.5f)*25,41),FVector(22,23,28),K==0?TEXT("DEC07A"):TEXT("C9B18A"));
 }
 A.Person(FVector(100,-150,78),1);
 Targets.Add({FVector(100,-150,70),TEXT("Mit Mara sprechen"),0,nullptr});
 // Pick-up shell has its own owner, so collection hides only the shell.
 auto* Shell=A.Actor(FVector(-440,180,40));A.Spiral(FVector::ZeroVector,Shell,1.16f);
 Targets.Add({FVector(-440,180,40),TEXT("Muschel aufheben"),1,Shell});
 A.Box(FVector(-440,-270,61),FVector(116,85,73),TEXT("AD875A"));
 A.Box(FVector(-440,-270,102),FVector(125,95,13),TEXT("CCAA76"));
 A.Spiral(FVector(-440,-270,120),nullptr,.72f);
 A.Box(FVector(-440,-225,61),FVector(28,4,29),TEXT("DCCA91"));
 Targets.Add({FVector(-440,-270,70),TEXT("Werkstattkiste ansehen"),2,nullptr});
 // Four equal compartments make the quarter relationship physically exact.
 const FVector Fountain(700,-80,25);
 A.Disc(Fountain+FVector(0,0,2),307,14,TEXT("C2B795"));
 A.Box(Fountain+FVector(0,0,33),FVector(218,218,65),TEXT("9E9C84"));
 for(int S:{-1,1}) {
  A.Box(Fountain+FVector(S*110,0,71),FVector(25,245,29),TEXT("DFD1AE"));
  A.Box(Fountain+FVector(0,S*110,71),FVector(245,25,29),TEXT("DFD1AE"));
 }
 for(int I=0;I<4;++I)A.Box(Fountain+FVector((I%2?1:-1)*49,(I/2?1:-1)*49,68),FVector(91,91,6),I<3?TEXT("6ABBC4"):TEXT("B9A983"));
 A.Box(Fountain+FVector(0,0,73),FVector(8,193,8),TEXT("E2D5B4"));
 A.Box(Fountain+FVector(0,0,73),FVector(193,8,8),TEXT("E2D5B4"));
 A.Planter(FVector(552,60,24));A.Planter(FVector(843,63,24),1);
 Targets.Add({FVector(700,-80,70),TEXT("Viertelbrunnen ansehen"),3,nullptr});
 A.Box(FVector(240,180,83),FVector(14,14,125),TEXT("987950"));
 A.Box(FVector(240,180,143),FVector(116,15,45),TEXT("C7A56E"));
 A.Beam(FVector(211,169,145),FVector(263,169,145),5,TEXT("715A40"));
 Targets.Add({FVector(240,180,70),TEXT("Wegweiser lesen"),14,nullptr});
 // Garden threshold: only its cross-path panel disappears after S2.
 auto Gate=[&](float X,int School,int Logic,const TCHAR* Color) {
  for(int S:{-1,1}) {
   A.Box(FVector(X,S*165,83),FVector(48,50,145),TEXT("C5B697"));
   A.Box(FVector(X,S*165,164),FVector(62,65,19),TEXT("E4D5B2"));
  }
  auto* Panel=A.Box(FVector(X,0,94),FVector(23,280,132),Color);
  Gates.Add({Panel,School,Logic});
  return Panel;
 };
 Gate(950,1,-1,TEXT("A58556"));
 // The twelve seeds are intentionally countable, six sprouts appear on success.
 for(int Bed=0;Bed<2;++Bed) {
  const FVector P(1500+Bed*148,-210,27);
  A.Box(P+FVector(0,0,12),FVector(130,188,24),TEXT("8E7450"));
  A.Box(P+FVector(0,0,27),FVector(112,170,8),TEXT("746146"));
  for(int I=0;I<6;++I) {
   const FVector Seed=P+FVector((I%2?1:-1)*29,-56+(I/2)*56,35);
   A.Ball(Seed,FVector(16,12,10),TEXT("D1B17C"));
   if(Bed==0) {
    auto* Sprout=A.Ball(Seed+FVector(0,0,12),FVector(12,29,13),TEXT("A4BA63"),FRotator(0,30,26));
    Sprout->ComponentTags.Add(TEXT("SixSeedHighlights"));
   }
  }
 }
 Targets.Add({FVector(1550,-140,70),TEXT("Zwölf Samen ansehen"),4,nullptr});
 A.Person(FVector(2050,140,78),2);A.Bench(FVector(1700,345,23));
 Targets.Add({FVector(2050,140,70),TEXT("Mit Jona den Weg wählen"),5,nullptr});
 // Three small, visibly different route candidates. The third combines wood
 // with flowing water; the stone arch and still pond each miss one property.
 A.Ball(FVector(1840,-300,29),FVector(210,210,10),TEXT("72B4B3"));
 A.Bench(FVector(1840,-338,35));
 for(int Route=0;Route<2;++Route) {
  const float X=2110+Route*265;
  A.Box(FVector(X,-310,25),FVector(130,310,9),TEXT("67AEBB"));
  for(int I=0;I<3;++I)A.Beam(FVector(X-25,-410+I*80,31),FVector(X+10,-388+I*80,31),4,TEXT("CAE0CC"));
  if(Route==0) {
   for(int I=0;I<7;++I) {
    const float T=I*PI/6;
    A.Box(FVector(X+FMath::Cos(T)*89,-305,53+FMath::Sin(T)*65),FVector(38,106,35),TEXT("C5B899"),FRotator(0,0,FMath::RadiansToDegrees(T)-90));
   }
  } else {
   for(int I=0;I<7;++I)A.Box(FVector(X-99+I*33,-305,53),FVector(30,125,12),TEXT("B39162"));
   for(int S:{-1,1})A.Box(FVector(X,-305+S*64,76),FVector(235,7,8),TEXT("8F7853"));
  }
 }
 A.Person(FVector(2540,-100,78),4);
 A.Box(FVector(2500,-330,62),FVector(170,90,16),TEXT("B39668"));
 for(int I=0;I<4;++I)A.Box(FVector(2445+I*36,-330,81),FVector(29,65,21),I<3?TEXT("B1BB72"):TEXT("E2D4AE"));
 Targets.Add({FVector(2540,-100,70),TEXT("Mit Elin Anteile vergleichen"),6,nullptr});
 Gate(2800,3,-1,TEXT("8DA281"));
 // A shallow water channel and low wooden jetty remain present after the rope
 // puzzle. A folded safety plank blocks the route before tension, then lowers
 // into the gap. It is moved by RefreshWorld, never erased as a whole bridge.
 A.Box(FVector(3500,0,24),FVector(300,1120,9),TEXT("67AFBB"));
 for(int Side:{-1,1})for(int I=0;I<6;++I)A.Box(FVector(3500+Side*(75+I*35),0,34),FVector(32,330,16),I%2?TEXT("B28C5C"):TEXT("C19B69"));
 auto* Folded=A.Box(FVector(3500,0,79),FVector(125,330,15),TEXT("C6A777"),FRotator(65,0,0));
 Folded->ComponentTags.Add(TEXT("JettyFoldedPlank"));
 for(int X:{-1,1})for(int Y:{-1,1}) {
  const FVector P(3500+X*233,Y*177,30);
  A.Disc(P+FVector(0,0,44),26,92,TEXT("94734E"));
  A.Disc(P+FVector(0,0,88),29,9,TEXT("CFAC78"));
 }
 RopeLine=A.Box(FVector(3500,-177,109),FVector(483,7,7),TEXT("DEC79C"));
 A.Person(FVector(3240,40,78),3);
 A.Rock(FVector(3160,-160,24),.8f,1);
 A.Disc(FVector(3400,215,75),49,17,TEXT("899B92"));
 A.Ring(FVector(3180,160,43),34,8,8,TEXT("D6BB89"),12);
 Targets.Add({FVector(3240,40,70),TEXT("Mit Tilda das Seil spannen"),7,nullptr});
 // Measuring basin: fixed divisions on the front face reinforce quarter units.
 A.Disc(FVector(3930,-120,39),215,31,TEXT("AAAB91"));
 A.Disc(FVector(3930,-120,58),168,8,TEXT("73B9C1"));
 A.Ring(FVector(3930,-120,66),104,23,31,TEXT("DCCCA7"),12);
 for(int I=0;I<4;++I)A.Box(FVector(3930,-13,38+I*10),FVector(21,4,3),TEXT("6F7565"));
 Targets.Add({FVector(3930,-120,70),TEXT("Messbecken untersuchen"),8,nullptr});
 A.Disc(FVector(4380,-90,31),216,22,TEXT("BBAF90"));
 for(int I=0;I<6;++I) {
  const float Angle=I*PI/3;
  A.Box(FVector(4380+FMath::Cos(Angle)*65,-90+FMath::Sin(Angle)*65,47),FVector(70,58,10),I%2?TEXT("E4D5AC"):TEXT("859D91"),FRotator(0,I*60,0));
 }
 A.Box(FVector(4390,-76,53),FVector(45,41,8),TEXT("E5C87D"),FRotator(0,25,0));
 Targets.Add({FVector(4380,-90,70),TEXT("Mosaik zusammensetzen"),9,nullptr});
 Gate(4700,-1,3,TEXT("B5A586"));
 // Ruin courtyard: broken classical columns, a precise sixteen-lamp array,
 // fraction plinth, ordered symbol disks and a coastal beacon.
 for(int I=0;I<6;++I) {
  const FVector P(4880+I*205,I%2?-455:-520,32);
  const float H=I%3==0?176:260;
  A.Disc(P+FVector(0,0,16),89,31,TEXT("B8AE92"));
  A.Disc(P+FVector(0,0,42),68,22,TEXT("E0D0AB"));
  A.Disc(P+FVector(0,0,H*.5f+40),52,H,TEXT("C9BE9F"));
  A.Disc(P+FVector(0,0,H+47),77,19,TEXT("DED1B1"));
  if(I%2==0)A.Shrub(P+FVector(36,0,0),.65f);
 }
 for(int I=0;I<14;++I)A.Box(FVector(4810+I*97,-625,65+(I%3)*17),FVector(94,84,68+(I%3)*34),I%2?TEXT("B8B295"):TEXT("C8BC9C"),FRotator(0,I%3*3,0));
 for(int I=0;I<16;++I) {
  const FVector P(4990+(I%4)*64,-305+(I/4)*69,40);
  A.Disc(P,35,20,TEXT("A8A88F"));
  A.Box(P+FVector(0,0,27),FVector(25,25,43),TEXT("747E6A"));
  auto* Light=A.Ball(P+FVector(0,0,37),FVector(20,20,22),TEXT("EDCE7D"));
  if(I<4)Light->ComponentTags.Add(TEXT("FourRuinLampHighlights"));else Light->SetVisibility(false);
 }
 Targets.Add({FVector(5090,-150,70),TEXT("Sechzehn Ruinenlichter ansehen"),10,nullptr});
 A.Disc(FVector(5530,60,44),165,39,TEXT("B3AE91"));
 A.Box(FVector(5530,60,92),FVector(125,103,56),TEXT("D4C7A5"));
 for(int Row=0;Row<2;++Row)for(int I=0;I<(Row?3:4);++I)A.Box(FVector(5488+I*(Row?42:28),30+Row*56,123),FVector(Row?37:24,37,8),I<(Row?2:3)?TEXT("85A399"):TEXT("E6D7B2"));
 Targets.Add({FVector(5530,60,70),TEXT("Bruchteile vergleichen"),11,nullptr});
 A.Disc(FVector(5780,-80,34),237,29,TEXT("BBAF90"));
 A.Box(FVector(5780,-80,73),FVector(209,100,57),TEXT("DBCDAC"));
 for(int I=0;I<3;++I) {
  const FVector P(5718+I*62,-80,108);
  A.Disc(P,49,12,TEXT("E6D9B8"));
  if(I==0) {A.Ball(P+FVector(0,0,9),FVector(18,31,5),TEXT("879977"),FRotator(0,32,0));A.Beam(P+FVector(-7,-10,13),P+FVector(8,10,13),2,TEXT("DAD1A7"));}
  if(I==1)for(int N=0;N<3;++N)A.Beam(P+FVector(-16,-9+N*8,10),P+FVector(16,-5+N*8,10),3,TEXT("8AABA8"));
  if(I==2) {A.Disc(P+FVector(0,0,9),15,4,TEXT("C5A65A"));for(int N=0;N<6;++N){const float Ang=N*PI/3;A.Beam(P+FVector(FMath::Cos(Ang)*12,FMath::Sin(Ang)*12,10),P+FVector(FMath::Cos(Ang)*19,FMath::Sin(Ang)*19,10),3,TEXT("C5A65A"));}}
 }
 Targets.Add({FVector(5780,-80,70),TEXT("Symbolscheiben ordnen"),12,nullptr});
 Gate(5900,-1,4,TEXT("8C9481"));
 const FVector Beacon(5970,-110,26);
 A.Disc(Beacon+FVector(0,0,14),168,27,TEXT("B4AF96"));
 A.Disc(Beacon+FVector(0,0,119),109,195,TEXT("DED0AE"));
 A.Disc(Beacon+FVector(0,0,215),152,23,TEXT("88958A"));
 A.Disc(Beacon+FVector(0,0,267),103,92,TEXT("9EAFA5"));
 for(int I=0;I<8;++I) {
  const float Angle=I*PI/4;
  A.Box(Beacon+FVector(FMath::Cos(Angle)*54,FMath::Sin(Angle)*54,266),FVector(9,9,96),TEXT("6E8179"));
 }
 A.Shape(TEXT("Cone"),Beacon+FVector(0,0,340),FVector(1.71,1.71,.70),TEXT("C0825A"));
 auto* Glow=A.Ball(Beacon+FVector(0,0,269),FVector(72,72,80),TEXT("F2D78F"));FinalLights.Add(Glow);
 for(int I=0;I<5;++I) {
  const FVector P(6030+I*38,40+I*47,60);
  auto* L=A.Ball(P,FVector(13,13,19),TEXT("F2DB9D"));FinalLights.Add(L);
 }
 Targets.Add({FVector(5970,-110,70),TEXT("Leuchtfeuer entzünden"),13,nullptr});
 A.Planter(FVector(5310,350,32));A.Bench(FVector(5650,390,32));A.Lamp(FVector(4920,370,31));
 Explorer=A.Person(FVector(-80,170,70),0,&Legs);
 Camera=GetWorld()->SpawnActor<ACameraActor>();
 Camera->GetCameraComponent()->bConstrainAspectRatio=false;
 Camera->GetCameraComponent()->ProjectionMode=ECameraProjectionMode::Orthographic;
 Camera->GetCameraComponent()->OrthoWidth=1700;
 Camera->SetActorLocation(Explorer->GetActorLocation()+FVector(0,950,1650));
 Camera->SetActorRotation(FRotator(-60,-90,0));
 // A quiet ground halo; root positions it only for an actually reachable target.
 NearMarker=A.Disc(FVector(100,-150,31),112,3,TEXT("E1C886"));
 NearMarker->SetVisibility(false);
}

void AExpeditionGameMode::RefreshWorld() {
 for(auto& G:Gates) {
  const bool Open=(G.School<0||ExpeditionV2::HasSchool(State,G.School))&&(G.Logic<0||ExpeditionV2::HasLogic(State,G.Logic));
  if(G.Mesh)G.Mesh->SetVisibility(!Open);
 }
 if(RopeLine)RopeLine->SetVisibility(ExpeditionV2::HasLogic(State,2));
 for(auto* M:FinalLights)if(M)M->SetVisibility(State.finale);
 for(const auto& T:Targets)if(T.Actor)T.Actor->SetActorHiddenInGame(!TargetVisible(T.Id));
 // Tags keep stateful prop ownership local to this art file and survive loading.
 for(TActorIterator<AActor> It(GetWorld());It;++It)if(It->ActorHasTag(TEXT("ExpeditionIslandArt"))) {
  TArray<UStaticMeshComponent*> Parts;It->GetComponents(Parts);
  for(auto* M:Parts) {
   if(M->ComponentHasTag(TEXT("SixSeedHighlights")))M->SetVisibility(ExpeditionV2::HasSchool(State,2));
   if(M->ComponentHasTag(TEXT("FourRuinLampHighlights")))M->SetVisibility(ExpeditionV2::HasSchool(State,5));
   if(M->ComponentHasTag(TEXT("JettyFoldedPlank"))) {
    const bool Ready=ExpeditionV2::HasLogic(State,2);
    M->SetRelativeLocation(FVector(3500,0,Ready?34:79));
    M->SetRelativeRotation(Ready?FRotator::ZeroRotator:FRotator(65,0,0));
   }
  }
 }
}

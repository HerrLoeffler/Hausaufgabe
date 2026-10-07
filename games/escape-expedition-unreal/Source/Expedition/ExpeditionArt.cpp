#include "ExpeditionWorld.h"
#include "Camera/CameraActor.h"
#include "Camera/CameraComponent.h"
#include "Components/StaticMeshComponent.h"
#include "Components/SceneComponent.h"
#include "Materials/MaterialInstanceDynamic.h"
#include "Engine/StaticMesh.h"
namespace {
FLinearColor C(const TCHAR* Hex){return FLinearColor::FromSRGBColor(FColor::FromHex(Hex));}
UStaticMeshComponent* Shape(AActor* Owner,const TCHAR* Type,FVector Pos,FVector Scale,FLinearColor Color,FRotator Rot=FRotator::ZeroRotator,bool Relative=false){
 auto* M=NewObject<UStaticMeshComponent>(Owner);FString Path=FString(TEXT("/Engine/BasicShapes/"))+Type+TEXT(".")+Type;
 M->SetStaticMesh(LoadObject<UStaticMesh>(nullptr,*Path));M->SetCollisionEnabled(ECollisionEnabled::NoCollision);M->SetMobility(EComponentMobility::Movable);
 if(!Owner->GetRootComponent()){auto* R=NewObject<USceneComponent>(Owner);Owner->SetRootComponent(R);R->RegisterComponent();}M->SetupAttachment(Owner->GetRootComponent());M->RegisterComponent();
 if(Relative)M->SetRelativeLocation(Pos);else M->SetWorldLocation(Pos);M->SetRelativeScale3D(Scale);M->SetWorldRotation(Rot);
 auto* Base=LoadObject<UMaterial>(nullptr,TEXT("/Game/Materials/M_Expedition.M_Expedition"));if(Base){auto* Mat=UMaterialInstanceDynamic::Create(Base,M);Mat->SetVectorParameterValue(TEXT("Tint"),Color);M->SetMaterial(0,Mat);}return M;
}
}
void AExpeditionGameMode::BuildWorld(){
 auto* World=GetWorld();auto* Art=World->SpawnActor<AActor>();
 Shape(Art,TEXT("Cube"),FVector(0,0,-30),FVector(32,18,.65),C(TEXT("B68D62")));
 Shape(Art,TEXT("Cube"),FVector(0,0,4),FVector(31.8,17.8,.16),C(TEXT("92B867")));
 Shape(Art,TEXT("Cube"),FVector(0,0,14),FVector(3.2,17.8,.22),C(TEXT("45B5BB")));
 for(int Side:{-1,1})Shape(Art,TEXT("Cube"),FVector(Side*220,0,15),FVector(1.2,17.6,.15),C(TEXT("DCD098")));
 Shape(Art,TEXT("Cube"),FVector(-950,-220,17),FVector(9,2.1,.12),C(TEXT("D5BE83")));
 Shape(Art,TEXT("Cube"),FVector(-550,-100,18),FVector(2,5.5,.12),C(TEXT("D5BE83")));
 Shape(Art,TEXT("Cube"),FVector(650,-150,18),FVector(9,2.2,.12),C(TEXT("D5BE83")));
 // Rounded rocks and plant groupings are authored here, with a fixed seed.
 FRandomStream R(1473);
 for(int I=0;I<38;++I){float X=R.FRandRange(-1450,1450);if(FMath::Abs(X)<350)X=X<0?-350:350;float Y=I<24?R.FRandRange(500,770):R.FRandRange(-810,-680);float H=R.FRandRange(160,235);
 Shape(Art,TEXT("Cylinder"),FVector(X,Y,H*.46),FVector(.28,.28,H/100),C(TEXT("8A6544")));
 Shape(Art,TEXT("Sphere"),FVector(X,Y,H),FVector(1.45,1.4,1.5),C(I%3?TEXT("478A5D"):TEXT("357F60")));
 Shape(Art,TEXT("Sphere"),FVector(X-40,Y-20,H+50),FVector(1.2,1.05,1.1),C(TEXT("64A968")));
 Shape(Art,TEXT("Sphere"),FVector(X+48,Y,H+25),FVector(1.15,1.1,1.15),C(TEXT("76B776")));
 }
 for(int I=0;I<48;++I){float X=(I%2?1:-1)*R.FRandRange(175,250),Y=R.FRandRange(-780,780);if(FMath::Abs(Y)<200)continue;Shape(Art,TEXT("Sphere"),FVector(X,Y,27),FVector(.5,.4,.38),C(I%3?TEXT("8D9890"):TEXT("BCC2AA")));if(I%3==0)for(int N=0;N<3;++N)Shape(Art,TEXT("Cylinder"),FVector(X+N*9,Y,55),FVector(.045,.045,.6),C(TEXT("79A15E")),FRotator(N*12,0,0));}
 for(int I=0;I<12;++I)Shape(Art,TEXT("Sphere"),FVector(R.FRandRange(-120,120),R.FRandRange(-800,800),27),FVector(.5,1.8,.018),C(TEXT("97DAD2")));
 // Cloth tent with two sloping roof panels, pole and little flag.
 for(int S:{-1,1})Shape(Art,TEXT("Cube"),FVector(-1130+S*74,430,125),FVector(1.9,2.7,.055),C(S<0?TEXT("E0AE69"):TEXT("F3CF88")),FRotator(0,0,S*52));
 Shape(Art,TEXT("Cube"),FVector(-1130,289,70),FVector(1.35,.04,1.15),C(TEXT("79654D")));
 Shape(Art,TEXT("Cube"),FVector(-1130,285,55),FVector(.58,.035,.8),C(TEXT("324A41")));
 Shape(Art,TEXT("Cylinder"),FVector(-1130,283,130),FVector(.035,.035,2.4),C(TEXT("6D5438")));
 Shape(Art,TEXT("Cylinder"),FVector(-900,460,130),FVector(.05,.05,2.5),C(TEXT("78634F")));
 Shape(Art,TEXT("Cube"),FVector(-865,460,235),FVector(.65,.03,.35),C(TEXT("DE7755")));
 Shape(Art,TEXT("Cube"),FVector(-1050,80,58),FVector(2.2,1,.15),C(TEXT("986D4C")));
 for(int X:{-1,1})for(int Y:{-1,1})Shape(Art,TEXT("Cube"),FVector(-1050+X*85,80+Y*33,32),FVector(.10,.10,.62),C(TEXT("795A3F")));
 Shape(Art,TEXT("Cube"),FVector(-1050,80,68),FVector(1.5,.8,.02),C(TEXT("EEE0AF")));
 for(int I=0;I<3;++I){Shape(Art,TEXT("Cube"),FVector(-1350+I*90,70,50),FVector(.7,.7,.8),C(TEXT("A98759")));Shape(Art,TEXT("Cube"),FVector(-1350+I*90,29,50),FVector(.62,.03,.06),C(TEXT("72593F")));}
 Shape(Art,TEXT("Sphere"),FVector(-1230,-70,23),FVector(.5,.5,.15),C(TEXT("5D6A59")));
 Shape(Art,TEXT("Cylinder"),FVector(-1230,-70,28),FVector(.2,.2,.1),C(TEXT("DBB569")));
 // Discoverable parchment halves, notebook and equipment.
 const FVector Items[]={FVector(-1230,180,36),FVector(-760,210,36),FVector(-600,150,35),FVector(-390,220,40),FVector(780,230,60)};
 const TCHAR* Labels[]={TEXT("Kartenhälfte links"),TEXT("Kartenhälfte rechts"),TEXT("Seil aufnehmen"),TEXT("Kurbel aufnehmen"),TEXT("Sicherung aufnehmen")};
 for(int I=0;I<5;++I){Shape(Art,TEXT("Cube"),Items[I],I<2?FVector(.45,.35,.03):FVector(.36,.20,.12),C(I<2?TEXT("F2DEAC"):TEXT("DEB859")));Targets.Add({Items[I],Labels[I],I});}
 auto Note=[&](FVector P,int Id,const TCHAR* Label){Shape(Art,TEXT("Cube"),P,FVector(.48,.35,.10),C(TEXT("425E64")));Shape(Art,TEXT("Cube"),P+FVector(0,0,6),FVector(.38,.28,.02),C(TEXT("EAE0B8")));Targets.Add({P,Label,Id});};
 Note(FVector(-1040,-170,38),10,TEXT("Camp-Feldnotizen"));Note(FVector(-475,-170,35),11,TEXT("Wartungsnotizen"));Note(FVector(590,-150,38),12,TEXT("Betriebsnotizen"));
 Targets.Add({FVector(-1050,80,68),TEXT("Karte zusammensetzen"),20});
 // Bridge, mechanical stone anchor, damaged wood post and winch.
 auto* BA=World->SpawnActor<AActor>();Bridge=Shape(BA,TEXT("Cube"),FVector(0,0,34),FVector(3.25,1.7,.15),C(TEXT("A77B4E")));
 for(int I=0;I<9;++I)Shape(BA,TEXT("Cube"),FVector(-140+I*35,0,47),FVector(.29,1.75,.04),C(I%2?TEXT("CFA977"):TEXT("B88B58")));
 for(int S:{-1,1})Shape(Art,TEXT("Cylinder"),FVector(S*185,-110,50),FVector(.22,.22,.9),C(TEXT("84918B")));
 Shape(Art,TEXT("Cube"),FVector(-210,190,48),FVector(.2,.2,.85),C(TEXT("9C7653")),FRotator(0,0,14));
 Shape(Art,TEXT("Cube"),FVector(-210,187,65),FVector(.025,.22,.3),C(TEXT("3F332D")),FRotator(0,0,32));
 Shape(Art,TEXT("Cube"),FVector(-285,-5,40),FVector(.7,.5,.45),C(TEXT("496D65")));
 Shape(Art,TEXT("Cylinder"),FVector(-285,-5,73),FVector(.50,.50,.38),C(TEXT("C5A565")),FRotator(90,0,0));
 RopeLine=Shape(Art,TEXT("Cylinder"),FVector(-110,-80,70),FVector(.05,.05,2.2),C(TEXT("78603F")),FRotator(90,0,0));
 Targets.Add({FVector(-185,-110,50),TEXT("Seil: Steinanker"),22});Targets.Add({FVector(-210,190,48),TEXT("Seil: Holzpfosten"),23});Targets.Add({FVector(-80,-45,48),TEXT("Seil: Brückenring"),24});
 Targets.Add({FVector(-285,-5,45),TEXT("Winde / Kurbel"),21});
 // Research cabin, readable machine silhouettes and a warm veranda.
 Shape(Art,TEXT("Cube"),FVector(1080,280,28),FVector(5,3.5,.35),C(TEXT("987957")));
 Shape(Art,TEXT("Cube"),FVector(1080,280,160),FVector(4.6,3,2.5),C(TEXT("E3D5B8")));
 for(int X:{-1,1})Shape(Art,TEXT("Cube"),FVector(1080+X*165,125,165),FVector(.8,.04,.6),C(TEXT("68A9AC")));
 Shape(Art,TEXT("Cube"),FVector(1080,123,128),FVector(.75,.04,1.8),C(TEXT("52776B")));
 for(int S:{-1,1})Shape(Art,TEXT("Cube"),FVector(1080,280+S*105,305),FVector(5.25,2.5,.10),C(S<0?TEXT("577970"):TEXT("709A81")),FRotator(0,0,S*18));
 Shape(Art,TEXT("Cube"),FVector(810,-90,70),FVector(.8,.7,1.2),C(TEXT("567C70")));
 Shape(Art,TEXT("Cylinder"),FVector(810,-133,65),FVector(.38,.38,.20),C(TEXT("354D4A")),FRotator(90,0,0));
 Shape(Art,TEXT("Cube"),FVector(990,-90,80),FVector(.8,.24,1.2),C(TEXT("D2C098")));
 for(int I=0;I<3;++I)Shape(Art,TEXT("Sphere"),FVector(965+I*25,-110,105),FVector(.10,.06,.10),C(I==2?TEXT("CD7658"):TEXT("8ABD8F")));
 Shape(Art,TEXT("Cube"),FVector(1220,-100,64),FVector(.8,.65,.7),C(TEXT("3B555C")));
 Shape(Art,TEXT("Cylinder"),FVector(1220,-100,143),FVector(.025,.025,1.5),C(TEXT("C8C7AE")));
 RadioLamp=Shape(Art,TEXT("Sphere"),FVector(1210,-136,82),FVector(.14,.08,.14),C(TEXT("F6D977")));
 Targets.Add({FVector(810,-90,70),TEXT("Sicherung einsetzen"),30});Targets.Add({FVector(990,-90,80),TEXT("Strom schalten"),31});Targets.Add({FVector(1220,-100,64),TEXT("Funksignal senden"),32});
 // Explorer: articulated limbs, jacket, face, hat and backpack.
 Explorer=World->SpawnActor<AActor>();Explorer->SetActorLocation(FVector(-1050,-350,80));
 Shape(Explorer,TEXT("Sphere"),FVector(0,0,0),FVector(.45,.34,.48),C(TEXT("E3A160")),FRotator::ZeroRotator,true);
 Shape(Explorer,TEXT("Sphere"),FVector(0,0,40),FVector(.62,.55,.56),C(TEXT("EDC7A3")),FRotator::ZeroRotator,true);
 Shape(Explorer,TEXT("Sphere"),FVector(0,0,52),FVector(.65,.58,.34),C(TEXT("664D3C")),FRotator::ZeroRotator,true);
 Shape(Explorer,TEXT("Cylinder"),FVector(0,0,62),FVector(.72,.65,.055),C(TEXT("EEE0B9")),FRotator::ZeroRotator,true);
 Shape(Explorer,TEXT("Sphere"),FVector(0,0,71),FVector(.55,.51,.28),C(TEXT("DFCC9A")),FRotator::ZeroRotator,true);
 for(int S:{-1,1}){Shape(Explorer,TEXT("Sphere"),FVector(S*12,-25,40),FVector(.065,.045,.085),C(TEXT("393C38")),FRotator::ZeroRotator,true);Legs.Add(Shape(Explorer,TEXT("Sphere"),FVector(S*13,0,-30),FVector(.17,.22,.40),C(TEXT("436773")),FRotator::ZeroRotator,true));}
 for(int S:{-1,1})Legs.Add(Shape(Explorer,TEXT("Sphere"),FVector(S*28,0,0),FVector(.15,.18,.40),C(TEXT("D49A5C")),FRotator::ZeroRotator,true));
 Shape(Explorer,TEXT("Cube"),FVector(0,22,5),FVector(.28,.20,.34),C(TEXT("637C56")),FRotator::ZeroRotator,true);
 Explorer->SetActorLocation(FVector(-1050,-350,80));
 Camera=World->SpawnActor<ACameraActor>();Camera->GetCameraComponent()->bConstrainAspectRatio=false;Camera->GetCameraComponent()->ProjectionMode=ECameraProjectionMode::Orthographic;Camera->GetCameraComponent()->OrthoWidth=1800;Camera->SetActorLocation(FVector(-650,1350,1830));Camera->SetActorRotation(FRotator(-52,-90,0));
 // A boat arrives only after a real successful signal.
 auto* Boat=World->SpawnActor<AActor>();Boat->SetActorLocation(FVector(0,0,0));
 BoatParts.Add(Shape(Boat,TEXT("Sphere"),FVector(0,800,50),FVector(1.4,2.9,.45),C(TEXT("D9C18C")),FRotator::ZeroRotator,true));
}
void AExpeditionGameMode::RefreshWorld(){
 if(Bridge){auto* Owner=Bridge->GetOwner();Owner->SetActorRotation(State.bridge?FRotator::ZeroRotator:FRotator(-58,0,0));}
 if(RopeLine)RopeLine->SetVisibility(State.anchor&&State.ropeEnd);
 for(auto* B:BoatParts)B->SetVisibility(State.finale);
}

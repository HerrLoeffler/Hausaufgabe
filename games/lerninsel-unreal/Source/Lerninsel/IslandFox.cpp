#include "IslandWorld.h"
#include "Core/IslandFoxCue.h"
#include "ProceduralMeshComponent.h"
#include "Components/SceneComponent.h"
#include "Components/StaticMeshComponent.h"
#include "Materials/MaterialInstanceDynamic.h"
#include "Engine/StaticMesh.h"
#include "Engine/World.h"
#include "Camera/CameraComponent.h"
#include "Kismet/GameplayStatics.h"
namespace {
const FVector FoxStart(1980,-500,2),FoxGrip(3010,60,2),FoxRest(3040,400,2);
FLinearColor Color(const TCHAR* Hex){return FLinearColor::FromSRGBColor(FColor::FromHex(Hex));}
void Root(AActor* A){auto* R=NewObject<USceneComponent>(A);R->SetMobility(EComponentMobility::Movable);A->SetRootComponent(R);R->RegisterComponent();}
UProceduralMeshComponent* Surface(AIslandGameMode* G,const TArray<FVector>& Positions,const TArray<int32>& Faces,FVector At,const TCHAR* Hex){
 auto* M=NewObject<UProceduralMeshComponent>(G->Fox);M->SetMobility(EComponentMobility::Movable);M->SetupAttachment(G->Fox->GetRootComponent());M->RegisterComponent();M->SetRelativeLocation(At);M->SetCollisionEnabled(ECollisionEnabled::NoCollision);
 TArray<FVector> V,N;TArray<int32> T;TArray<FVector2D> UV;TArray<FLinearColor> C;TArray<FProcMeshTangent> Tangents;FVector Center=FVector::ZeroVector;for(FVector P:Positions)Center+=P;Center/=Positions.Num();
 for(int I=0;I<Faces.Num();I+=3){FVector A=Positions[Faces[I]],B=Positions[Faces[I+1]],D=Positions[Faces[I+2]],Normal=FVector::CrossProduct(B-A,D-A);if(Normal.SizeSquared()<.001f)continue;if(FVector::DotProduct(Normal,(A+B+D)/3-Center)<0){Swap(B,D);Normal=-Normal;}Normal.Normalize();int Index=V.Num();float Shade=.94f+(I%9)*.006f;for(FVector P:{A,B,D}){V.Add(P);N.Add(Normal);UV.Add(FVector2D(.5,.5));C.Add(FLinearColor(Shade,Shade,Shade,1));}T.Append({Index,Index+1,Index+2});}
 M->CreateMeshSection_LinearColor(0,V,T,N,UV,C,Tangents,false);auto* Base=LoadObject<UMaterial>(nullptr,TEXT("/Game/Materials/M_Island.M_Island"));auto* Mat=Base?UMaterialInstanceDynamic::Create(Base,G->Fox):nullptr;if(Mat){Mat->SetVectorParameterValue(TEXT("Tint"),Color(TEXT("AAB0AB")));M->SetMaterial(0,Mat);}G->FoxParts.Add({M,Mat,Color(Hex)});return M;
}
UProceduralMeshComponent* Ellipsoid(AIslandGameMode* G,FVector At,FVector Radius,const TCHAR* Hex,int Rows=7,int Columns=10){
 // Deliberately flat-shaded, low-poly facets: the reference fox is carved and angular,
 // not a smooth toy assembled from glossy balls. Surface duplicates vertices per face.
 Rows=FMath::Clamp(Rows,4,10);Columns=FMath::Clamp(Columns,6,14);TArray<FVector> V;TArray<int32> T;
 for(int R=0;R<=Rows;++R)for(int Col=0;Col<Columns;++Col){float A=PI*R/Rows,B=2*PI*Col/Columns+(R%2)*PI/Columns;float Profile=1.f-.12f*FMath::Abs(FMath::Cos(B*2));V.Add(FVector(Radius.X*FMath::Sin(A)*FMath::Cos(B),Radius.Y*FMath::Sin(A)*FMath::Sin(B)*Profile,Radius.Z*FMath::Cos(A)));}
 for(int R=0;R<Rows;++R)for(int Col=0;Col<Columns;++Col){int Next=(Col+1)%Columns,A=R*Columns+Col,B=R*Columns+Next,D=(R+1)*Columns+Col,E=(R+1)*Columns+Next;T.Append({A,D,B,B,D,E});}
 return Surface(G,V,T,At,Hex);
}
struct FFoxSection{float X,Y,Z,Width,Height;};
UProceduralMeshComponent* LoftX(AIslandGameMode* G,FVector At,const TArray<FFoxSection>& Sections,const TCHAR* Hex,int Sides=8){
 // Each section is (x, y, z, half-width, half-height); the pointed ends and changing
 // cross-sections make the muzzle and plume tail read as carved fox anatomy.
 TArray<FVector> V;TArray<int32> T;for(const FFoxSection& S:Sections)for(int I=0;I<Sides;++I){float A=2*PI*I/Sides;V.Add(FVector(S.X,S.Y+FMath::Cos(A)*S.Width,S.Z+FMath::Sin(A)*S.Height));}
 for(int R=0;R<Sections.Num()-1;++R)for(int I=0;I<Sides;++I){int N=(I+1)%Sides,A=R*Sides+I,B=R*Sides+N,C=(R+1)*Sides+I,D=(R+1)*Sides+N;T.Append({A,C,B,B,C,D});}
 int Base=V.Num();V.Add(FVector(Sections[0].X,Sections[0].Y,Sections[0].Z));for(int I=0;I<Sides;++I)T.Append({Base,(I+1)%Sides,I});int End=V.Num();V.Add(FVector(Sections.Last().X,Sections.Last().Y,Sections.Last().Z));int Ring=(Sections.Num()-1)*Sides;for(int I=0;I<Sides;++I)T.Append({End,Ring+I,Ring+(I+1)%Sides});return Surface(G,V,T,At,Hex);
}
UStaticMeshComponent* Simple(AActor* Owner,USceneComponent* Parent,const TCHAR* Kind,FVector P,FVector Scale,const TCHAR* Hex){
 auto* M=NewObject<UStaticMeshComponent>(Owner);M->SetMobility(EComponentMobility::Movable);M->SetupAttachment(Parent);M->RegisterComponent();M->SetStaticMesh(LoadObject<UStaticMesh>(nullptr,*(FString(TEXT("/Engine/BasicShapes/"))+Kind+TEXT(".")+Kind)));M->SetRelativeLocation(P);M->SetRelativeScale3D(Scale);M->SetCollisionEnabled(ECollisionEnabled::NoCollision);auto* Base=LoadObject<UMaterial>(nullptr,TEXT("/Game/Materials/M_Island.M_Island"));if(Base){auto* Mat=UMaterialInstanceDynamic::Create(Base,Owner);Mat->SetVectorParameterValue(TEXT("Tint"),Color(Hex));M->SetMaterial(0,Mat);}return M;
}
FVector WalkPoint(float U,FVector& Direction){
 const FVector Points[]={FoxStart,FVector(2550,-550,2),FVector(2870,-550,2),FVector(2870,60,2),FoxGrip};float Total=0;for(int I=1;I<5;++I)Total+=FVector::Dist(Points[I-1],Points[I]);float Distance=FMath::Clamp(U,0.f,1.f)*Total;
 for(int I=1;I<5;++I){float Segment=FVector::Dist(Points[I-1],Points[I]);if(Distance<=Segment||I==4){Direction=(Points[I]-Points[I-1]).GetSafeNormal();return FMath::Lerp(Points[I-1],Points[I],FMath::Clamp(Distance/Segment,0.f,1.f));}Distance-=Segment;}Direction=FVector(1,0,0);return FoxGrip;
}
}
void AIslandGameMode::BuildFox(){
 Fox=GetWorld()->SpawnActor<AActor>();Root(Fox);Fox->Tags.Add(TEXT("LerninselFox"));Fox->SetActorScale3D(FVector(.8));Fox->SetActorLocation(FoxStart);Fox->SetActorRotation(FRotator(0,155,0));
 // The same deliberately carved silhouette exists in both states: broad haunch,
 // pointed muzzle, tall triangular ears, black stockings and a large pale-tipped plume.
 FoxBody=Ellipsoid(this,FVector(-7,0,39),FVector(38,18,19),TEXT("C96930"),6,10);FoxChest=Ellipsoid(this,FVector(19,0,43),FVector(16,15,23),TEXT("F0D9B2"),7,10);FoxHead=Ellipsoid(this,FVector(31,0,63),FVector(21,18,19),TEXT("D77B38"),7,10);
 FoxMuzzle=LoftX(this,FVector(49,0,54),{{-15,0,1,9,7},{-7,0,1,9,6.2f},{2,0,0,7,5},{12,0,-2,4.5f,3.4f},{20,0,-3,1.7f,1.6f}},TEXT("F1DBB8"));FoxJaw=Ellipsoid(this,FVector(49,0,47),FVector(12,7,3),TEXT("F1DBB8"),4,8);FoxNose=Ellipsoid(this,FVector(68,0,50),FVector(3.5,3.2,2.7),TEXT("242927"),4,8);
 for(int Sign:{-1,1}){TArray<FVector> Ear={FVector(-7,-6,0),FVector(7,-6,0),FVector(-7,6,0),FVector(7,6,0),FVector(-1,0,23)};TArray<int32> E={0,1,4,1,3,4,3,2,4,2,0,4,0,2,1,1,2,3};FoxEars.Add(Surface(this,Ear,E,FVector(23,Sign*9,72),TEXT("C56C31")));FoxInnerEars.Add(Ellipsoid(this,FVector(26,Sign*12,76),FVector(3,2.4f,8),TEXT("463E35"),4,6));FoxEyes.Add(Ellipsoid(this,FVector(42,Sign*15,64),FVector(3.5f,1.8f,2.6f),TEXT("4B3429"),4,6));FoxCheeks.Add(Ellipsoid(this,FVector(39,Sign*10,52),FVector(9,6,7),TEXT("F1DBB8"),5,8));}
 for(int X:{-23,23})for(int Sign:{-1,1}){FoxLegs.Add(Ellipsoid(this,FVector(X,Sign*11,22),FVector(5,4.5,18),TEXT("34342C"),5,8));FoxFeet.Add(Ellipsoid(this,FVector(X+4,Sign*11,3),FVector(9,5,3),TEXT("34342C"),4,8));}
 FoxTail=LoftX(this,FVector(-57,0,32),{{22,0,-2,9,7},{10,5,0,15,11},{-8,14,5,21,15},{-27,24,9,21,15},{-45,28,13,16,12},{-58,29,16,7,7}},TEXT("C66D35"),10);FoxTailTip=LoftX(this,FVector(-106,29,48),{{8,0,0,9,8},{1,0,0,8,7},{-6,0,1,4.5f,4.5f},{-11,0,1,1,1}},TEXT("EFDFBF"),8);
 // Imported Blender design: keep the existing cue controller and rope/gate timing.
 // This is a static design mesh; a deforming quadruped rig remains separate work.
 if(auto* Design=LoadObject<UStaticMesh>(nullptr,TEXT("/Game/Art/FoxV2/SM_Fox_Design.SM_Fox_Design"))){
  FoxDesign=NewObject<UStaticMeshComponent>(Fox,TEXT("ImportedFoxDesign"));FoxDesign->SetupAttachment(Fox->GetRootComponent());FoxDesign->SetMobility(EComponentMobility::Movable);FoxDesign->RegisterComponent();FoxDesign->SetStaticMesh(Design);FoxDesign->SetCollisionEnabled(ECollisionEnabled::NoCollision);FoxDesign->SetRelativeRotation(FRotator(0,-90,0));
  auto* Base=LoadObject<UMaterial>(nullptr,TEXT("/Game/Materials/M_Island.M_Island"));
  for(int I=0;I<Design->GetStaticMaterials().Num();++I){FString Name=Design->GetStaticMaterials()[I].MaterialSlotName.ToString();FLinearColor Living(.36f,.075f,.009f,1);
   if(Name.Contains(TEXT("Ivory")))Living=FLinearColor(.86f,.78f,.61f,1);else if(Name.Contains(TEXT("GuardHair")))Living=FLinearColor(.53f,.14f,.02f,1);else if(Name.Contains(TEXT("Charcoal")))Living=FLinearColor(.037f,.026f,.02f,1);else if(Name.Contains(TEXT("InnerEar")))Living=FLinearColor(.13f,.065f,.042f,1);else if(Name.Contains(TEXT("Nose")))Living=FLinearColor(.014f,.013f,.012f,1);else if(Name.Contains(TEXT("Iris")))Living=FLinearColor(.35f,.145f,.027f,1);else if(Name.Contains(TEXT("Glint")))Living=FLinearColor(.95f,.93f,.85f,1);
   auto* Mat=Base?UMaterialInstanceDynamic::Create(Base,Fox):nullptr;if(Mat){Mat->SetVectorParameterValue(TEXT("Tint"),Color(TEXT("AAB0AB")));FoxDesign->SetMaterial(I,Mat);}FoxDesignMaterials.Add(Mat);FoxDesignLiving.Add(Living);
  }
  for(auto& Part:FoxParts)if(Part.Mesh)Part.Mesh->SetVisibility(false);
 }
 FoxRope=GetWorld()->SpawnActor<AActor>();Root(FoxRope);for(int I=0;I<18;++I)FoxRopeSegments.Add(Simple(FoxRope,FoxRope->GetRootComponent(),TEXT("Cylinder"),FVector::ZeroVector,FVector(.025,.025,.1),TEXT("A48B5E")));
 if(Gates.IsValidIndex(3)){auto* Gate=Gates[3].Actor;FoxLatch=Simple(Gate,Gate->GetRootComponent(),TEXT("Cube"),FVector(-10,200,46),FVector(.15,.65,.12),TEXT("916537"));Simple(Gate,Gate->GetRootComponent(),TEXT("Cube"),FVector(-13,228,46),FVector(.24,.13,.25),TEXT("846E4B"));}
 AddTarget(513,FoxStart+FVector(0,0,55),TEXT("Der versteinerte Fuchs"),TEXT("Ein Fuchs aus Stein. Baue am Satzplatz einen Satz, der etwas erzählt. Dein richtiger Satz weckt ihn. Dann hilft er dir am Tor."));RefreshFox(0);
}
bool AIslandGameMode::FoxRopeReleased()const{return Island::FoxCueAt(FoxTime,State.sentence).released;}
void AIslandGameMode::RefreshFox(float Dt){
 if(!Fox)return;auto Before=Island::FoxCueAt(FoxTime,State.sentence);if(!State.sentence)FoxTime=FoxMotionTime=0;else if(FMath::IsFinite(Dt)&&Dt>=0){FoxTime=FMath::Min(10.6f,FoxTime+Dt);FoxMotionTime+=Dt;}auto Cue=Island::FoxCueAt(FoxTime,State.sentence);
 for(auto& Part:FoxParts)if(Part.Material)Part.Material->SetVectorParameterValue(TEXT("Tint"),FMath::Lerp(Color(TEXT("AAB0AB")),Part.Living,Cue.color));
 for(int I=0;I<FoxDesignMaterials.Num();++I)if(FoxDesignMaterials[I])FoxDesignMaterials[I]->SetVectorParameterValue(TEXT("Tint"),FMath::Lerp(Color(TEXT("AAB0AB")),FoxDesignLiving[I],Cue.color));
 float Stand=FoxTime<1.6f?0:FMath::Clamp((FoxTime-1.6f)/.8f,0.f,1.f);if(Cue.phase==Island::FoxPhase::Resting)Stand=1-FMath::Clamp((FoxTime-9.8f)/.8f,0.f,1.f);
 FVector Direction(1,0,0),Position=FoxStart;float Yaw=155;
 if(FoxTime>=2.4f&&FoxTime<6.4f){Position=WalkPoint(Cue.walk,Direction);Yaw=Direction.Rotation().Yaw;}else if(FoxTime>=6.4f&&FoxTime<8.4f){Position=FoxGrip-FVector(Cue.pull*60,0,0);Yaw=0;}else if(FoxTime>=8.4f){Position=FMath::Lerp(FoxGrip-FVector(60,0,0),FoxRest,FMath::Clamp((FoxTime-8.4f)/1.4f,0.f,1.f));Yaw=FoxTime<9.8f?(FoxRest-FoxGrip+FVector(60,0,0)).Rotation().Yaw:175;}else if(FoxTime>=1.6f)Yaw=155*(1-Stand);
 Fox->SetActorLocation(Position);Fox->SetActorRotation(FMath::RInterpTo(Fox->GetActorRotation(),FRotator(0,Yaw,0),Dt,8));
 float Bob=Cue.phase==Island::FoxPhase::Walking?FMath::Sin(FoxTime*22)*1.2f:Cue.phase==Island::FoxPhase::Resting?FMath::Sin(FoxMotionTime*2)*.7f:0;FoxBody->SetRelativeLocation(FVector(FMath::Lerp(-12.f,-2.f,Stand),0,44+Bob));FoxBody->SetRelativeScale3D(FVector(FMath::Lerp(.65f,1.f,Stand),1,FMath::Lerp(1.65f,1.f,Stand)));
 FoxChest->SetRelativeLocation(FVector(19,0,FMath::Lerp(56.f,47.f,Stand)));FoxChest->SetRelativeScale3D(FVector(1,1,FMath::Lerp(1.3f,1.f,Stand)));
 float HeadZ=FMath::Lerp(83.f,58.f,Stand);FoxHead->SetRelativeLocation(FVector(31,0,HeadZ));FoxMuzzle->SetRelativeLocation(FVector(47,0,HeadZ-3));FoxNose->SetRelativeLocation(FVector(65,0,HeadZ-6));FoxJaw->SetRelativeLocation(FVector(47,0,HeadZ-11));FoxJaw->SetRelativeRotation(FRotator((Cue.phase==Island::FoxPhase::Gripping||Cue.phase==Island::FoxPhase::Pulling)?FMath::Sin(FoxTime*18)*7:0,0,0));
 for(int I=0;I<FoxEars.Num();++I){int Sign=I?1:-1;FoxEars[I]->SetRelativeLocation(FVector(24,Sign*10,HeadZ+13));FoxEars[I]->SetRelativeRotation(FRotator(0,0,Cue.color*FMath::Sin(FoxTime*8+I)*4));FoxInnerEars[I]->SetRelativeLocation(FVector(28,Sign*11,HeadZ+16));}
 for(int I=0;I<FoxEyes.Num();++I){int Sign=I?1:-1;FoxEyes[I]->SetRelativeLocation(FVector(42,Sign*15,HeadZ+3));FoxEyes[I]->SetRelativeScale3D(FVector(1,1,Cue.phase==Island::FoxPhase::Resting&&FMath::Fmod(FoxMotionTime,4.2f)<.15f?.05f:FMath::Max(.05f,Cue.color)));}
 for(int I=0;I<FoxCheeks.Num();++I)FoxCheeks[I]->SetRelativeLocation(FVector(39,(I?1:-1)*10,HeadZ-10));
 for(int I=0;I<FoxLegs.Num();++I){bool Moving=Cue.phase==Island::FoxPhase::Walking||Cue.phase==Island::FoxPhase::Pulling||Cue.phase==Island::FoxPhase::Opening;float Phase=FoxTime*22+((I==0||I==3)?0:PI),Stride=Moving?FMath::Sin(Phase)*(Cue.phase==Island::FoxPhase::Walking?13:6):0,Lift=Moving?FMath::Max(0.f,FMath::Cos(Phase))*7:0;float X=I<2?-23:23,Y=(I%2?1:-1)*11,Z=I<2?FMath::Lerp(12.f,22.f,Stand):22;FoxLegs[I]->SetRelativeLocation(FVector(X+Stride,Y,Z+Lift*.5));FoxLegs[I]->SetRelativeRotation(FRotator(Stride*.8,0,0));FoxLegs[I]->SetRelativeScale3D(FVector(1,1,I<2?FMath::Lerp(.55f,1.f,Stand):1));FoxFeet[I]->SetRelativeLocation(FVector(X+Stride+4,Y,3+Lift));}
 float Wag=Cue.color*FMath::Sin(FoxMotionTime*5)*8;FoxTail->SetRelativeLocation(FMath::Lerp(FVector(-36,18,12),FVector(-57,Wag,32),Stand));FoxTail->SetRelativeRotation(FRotator(-12,Wag,0));FoxTailTip->SetRelativeLocation(FMath::Lerp(FVector(-87,48,28),FVector(-108,29+Wag*1.7f,48),Stand));
 if(FoxLatch)FoxLatch->SetRelativeLocation(FVector(-10,200-Cue.pull*50,46));
 const FVector Mouth=Fox->GetActorTransform().TransformPosition(FoxDesign?FVector(28.7f,0,66.7f):FVector(64,0,54));FVector Anchor(3080,80-Cue.pull*50,46);TArray<FVector> Points;Points.Add(Anchor);
 for(int I=0;I<=16;++I){float A=2*PI*I/16;if(Cue.released)Points.Add(FVector(3064+FMath::Cos(A)*13,65+FMath::Sin(A)*11,4));else if(FoxTime>=6.4f)Points.Add(Mouth+FVector(0,FMath::Cos(A)*8-8,FMath::Sin(A)*10));else Points.Add(FVector(3062,60+FMath::Cos(A)*8,44+FMath::Sin(A)*10));}
 for(int I=0;I<FoxRopeSegments.Num();++I){auto* Segment=FoxRopeSegments[I];if(I+1>=Points.Num()){Segment->SetVisibility(false);continue;}Segment->SetVisibility(true);FVector A=Points[I],B=Points[I+1];if(Cue.released&&I==0){A=Points[1];B=Points[2];}FVector Delta=B-A;Segment->SetWorldLocation((A+B)*.5f);Segment->SetWorldRotation(FRotationMatrix::MakeFromZ(Delta).Rotator());Segment->SetWorldScale3D(FVector(.025,.025,FMath::Max(.01f,Delta.Size()/100)));}
 if(Cue.phase!=Before.phase){if(Cue.phase==Island::FoxPhase::Walking)Notify(TEXT("Der Fuchs ist wach! Er läuft zum Tor."));else if(Cue.phase==Island::FoxPhase::Pulling)Notify(TEXT("Der Fuchs zieht die Schlaufe vom Riegel."));else if(Cue.phase==Island::FoxPhase::Opening)Notify(TEXT("Der Riegel ist frei. Das Tor öffnet sich."));}
}

bool AIslandGameMode::ReplayFox(){if(!State.sentence||!Fox||!Player())return false;auto* C=Cast<AIslandController>(Player()->Controller);if(!C)return false;C->CancelInput();Player()->SetActorLocation(FVector(1740,-400,90));FoxTime=FoxMotionTime=0;Paused=false;Focus=-1;Gates[3].Angle=0;RefreshWorld(0);C->SetControlRotation((Fox->GetActorLocation()+FVector(0,0,55)-Player()->Camera->GetComponentLocation()).Rotation());C->UpdateMode();Notify(TEXT("Fuchsaktion erneut: Dein Lernfortschritt bleibt erhalten. Folge dem Fuchs zum Tor."));return true;}

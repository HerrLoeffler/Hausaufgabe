#include "KitchenArt.h"

#include "Components/SceneComponent.h"
#include "Components/StaticMeshComponent.h"
#include "Components/TextRenderComponent.h"
#include "Engine/StaticMesh.h"
#include "GameFramework/Actor.h"
#include "Materials/Material.h"
#include "Materials/MaterialInstanceDynamic.h"
#include "ProceduralMeshComponent.h"

namespace KitchenArt
{
namespace
{
    const FLinearColor Cream(.89f, .79f, .58f);
    const FLinearColor Ivory(.98f, .93f, .78f);
    const FLinearColor Sage(.25f, .45f, .34f);
    const FLinearColor Teal(.075f, .27f, .25f);
    const FLinearColor Wood(.48f, .25f, .105f);
    const FLinearColor Terra(.62f, .215f, .095f);
    const FLinearColor Ink(.035f, .065f, .066f);
    const FLinearColor Steel(.35f, .41f, .39f);
    const FLinearColor Tomato(.82f, .075f, .035f);
    const FLinearColor Leaf(.13f, .43f, .065f);

    template<class T> T* Component(AActor* Owner, USceneComponent* Parent, FName Name, FVector Position)
    {
        T* Result = NewObject<T>(Owner, MakeUniqueObjectName(Owner, T::StaticClass(), Name));
        Owner->AddInstanceComponent(Result);
        Result->SetupAttachment(Parent);
        Result->SetRelativeLocation(Position);
        Result->SetMobility(EComponentMobility::Movable);
        if(auto* Primitive=Cast<UPrimitiveComponent>(Result))Primitive->SetCanEverAffectNavigation(false);
        Result->RegisterComponent();
        return Result;
    }

    struct MeshData
    {
        TArray<FVector> V;
        TArray<int32> I;
        TArray<FVector> N;
        TArray<FVector2D> UV;
        void Quad(FVector A, FVector B, FVector C, FVector D, FVector Normal)
        {
            const int32 Base = V.Num();
            V.Append({A, B, C, D});
            N.Append({Normal, Normal, Normal, Normal});
            UV.Append({FVector2D(0,0), FVector2D(1,0), FVector2D(1,1), FVector2D(0,1)});
            I.Append({Base, Base+1, Base+2, Base, Base+2, Base+3});
        }
        void RoundedBox(FVector Position, FVector Size, float Bevel)
        {
            const FVector H = Size * .5;
            const float R = FMath::Clamp(Bevel, .001f, float(FMath::Min3(H.X, H.Y, H.Z)) * .95f);
            const FVector Inner = H - FVector(R);
            // Six separately parameterised rounded faces. Projection onto an inner
            // cuboid plus a sphere produces continuous curved bevels and normals.
            for (int32 Face=0; Face<6; ++Face)
            {
                const int32 Axis=Face/2;
                const double Sign = Face%2 ? -1.0 : 1.0;
                const int32 U=(Axis+1)%3, W=(Axis+2)%3;
                const double HU=H[U], HW=H[W];
                const double ValuesU[6]={-HU,-HU+R*.293,-HU+R,HU-R,HU-R*.293,HU};
                const double ValuesW[6]={-HW,-HW+R*.293,-HW+R,HW-R,HW-R*.293,HW};
                const int32 Base=V.Num();
                for (int32 Y=0; Y<6; ++Y) for (int32 X=0; X<6; ++X)
                {
                    FVector P(0); P[Axis]=H[Axis]*Sign; P[U]=ValuesU[X]; P[W]=ValuesW[Y];
                    const FVector Q(FMath::Clamp(P.X,-Inner.X,Inner.X), FMath::Clamp(P.Y,-Inner.Y,Inner.Y), FMath::Clamp(P.Z,-Inner.Z,Inner.Z));
                    const FVector Normal=(P-Q).GetSafeNormal();
                    V.Add(Position+Q+Normal*R); N.Add(Normal); UV.Add(FVector2D(double(X)/5,double(Y)/5));
                }
                for (int32 Y=0; Y<5; ++Y) for (int32 X=0; X<5; ++X)
                {
                    const int32 A=Base+Y*6+X,B=A+1,C=A+7,D=A+6;
                    if (Sign>0) I.Append({A,B,C,A,C,D}); else I.Append({A,C,B,A,D,C});
                }
            }
        }
    };

    UProceduralMeshComponent* MakeMesh(AActor* Owner,USceneComponent* Parent,FName Name,FVector Position,const MeshData& Data,FLinearColor Color,bool Collision=false,float Glow=0)
    {
        auto* Mesh=Component<UProceduralMeshComponent>(Owner,Parent,Name,Position);
        Mesh->bUseAsyncCooking=true;
        // UE's front-face winding is opposite the mathematical outward cross product.
        // Keep authored outward normals and reverse triangle indices for visible exterior faces.
        TArray<int32> Exterior=Data.I;
        for(int32 Triangle=0;Triangle+2<Exterior.Num();Triangle+=3)Swap(Exterior[Triangle+1],Exterior[Triangle+2]);
        Mesh->CreateMeshSection(0,Data.V,Exterior,Data.N,Data.UV,TArray<FColor>(),TArray<FProcMeshTangent>(),Collision);
        Mesh->SetMaterial(0,Material(Owner,Color,.65f,Glow));
        Mesh->SetCollisionEnabled(Collision ? ECollisionEnabled::QueryAndPhysics : ECollisionEnabled::NoCollision);
        Mesh->SetCollisionResponseToAllChannels(ECR_Block);
        Mesh->SetGenerateOverlapEvents(false);
        return Mesh;
    }

    UStaticMeshComponent* Basic(AActor* Owner,USceneComponent* Parent,FName Name,FVector Position,FVector Scale,FLinearColor Color,const TCHAR* Path)
    {
        auto* Mesh=Component<UStaticMeshComponent>(Owner,Parent,Name,Position);
        Mesh->SetStaticMesh(LoadObject<UStaticMesh>(nullptr,Path));
        Mesh->SetRelativeScale3D(Scale);
        Mesh->SetMaterial(0,Material(Owner,Color));
        Mesh->SetCollisionEnabled(ECollisionEnabled::NoCollision);
        Mesh->SetGenerateOverlapEvents(false);
        return Mesh;
    }

    void Label(AActor* Owner,USceneComponent* Parent,FVector Position,const FString& Text,FLinearColor Color,float Size=19)
    {
        auto* T=Component<UTextRenderComponent>(Owner,Parent,TEXT("KitchenLabel"),Position);
        // Local text normal +X is rotated toward the open front of the kitchen.
        T->SetRelativeRotation(FRotator(0,-90,0));
        T->SetText(FText::FromString(Text)); T->SetTextRenderColor(Color.ToFColor(true));
        T->SetHorizontalAlignment(EHTA_Center); T->SetVerticalAlignment(EVRTA_TextCenter); T->SetWorldSize(Size);
        T->SetCollisionEnabled(ECollisionEnabled::NoCollision);
    }

    void Cabinet(AActor* O,USceneComponent* P,FVector C,FVector Size=FVector(130,110,80),FLinearColor Paint=Sage)
    {
        Box(O,P,TEXT("CabinetBody"),C+FVector(0,0,42),FVector(Size.X-6,Size.Y-5,70),Paint,8,true);
        Box(O,P,TEXT("CabinetPlinth"),C+FVector(0,0,7),FVector(Size.X-14,Size.Y-12,14),Teal,3);
        Box(O,P,TEXT("CounterStone"),C+FVector(0,0,76),FVector(Size.X,Size.Y,8),Ivory,4,true);
        const int32 Doors=Size.X>200 ? 5 : 2;
        for (int32 D=0;D<Doors;++D)
        {
            const float X=-Size.X*.5f+(D+.5f)*Size.X/Doors;
            Box(O,P,TEXT("CabinetDoor"),C+FVector(X,-Size.Y*.5f-1,43),FVector(Size.X/Doors-8,4,49),Paint*.89f,2);
            Box(O,P,TEXT("BrassHandle"),C+FVector(X,-Size.Y*.5f-5,57),FVector(19,4,4),FLinearColor(.64f,.43f,.17f),1);
        }
    }

    void Tray(AActor* O,USceneComponent* P,FVector C,FLinearColor Color)
    {
        Box(O,P,TEXT("IngredientTray"),C,FVector(91,68,7),Steel,4);
        Box(O,P,TEXT("TrayFood"),C+FVector(0,0,4),FVector(80,56,5),Color,3);
        for (int32 I=0;I<4;++I)
        {
            const bool Side=I<2;
            Box(O,P,TEXT("TrayRim"),C+FVector(Side ? (I==0?-43:43):0,Side?0:(I==2?-31:31),4),Side?FVector(5,64,7):FVector(82,5,7),Steel,2);
        }
    }

    void Herb(AActor* O,USceneComponent* P,FVector C,float S=1)
    {
        Cylinder(O,P,TEXT("HerbPot"),C+FVector(0,0,10*S),FVector(.28*S,.28*S,.20*S),Terra);
        Cylinder(O,P,TEXT("PotRim"),C+FVector(0,0,19*S),FVector(.33*S,.33*S,.04*S),Terra*1.2f);
        for (int32 I=0;I<7;++I)
        {
            const float A=I*2.399f;
            auto* F=Sphere(O,P,TEXT("HerbLeaves"),C+FVector(FMath::Cos(A)*10*S,FMath::Sin(A)*10*S,(29+I%3*4)*S),FVector(.15*S,.09*S,.27*S),Leaf*(.8f+I*.07f));
            F->SetRelativeRotation(FRotator(25,I*137,0));
        }
    }

    void OvenArch(AActor* O,USceneComponent* P,FVector C)
    {
        MeshData M;
        constexpr int32 Steps=18;
        // Extruded semi-annulus, authored in the X/Z plane, mouth toward -Y.
        for (int32 I=0;I<Steps;++I)
        {
            const float A=PI*I/Steps,B=PI*(I+1)/Steps;
            auto Point=[&](float R,float Angle,float Y){return FVector(FMath::Cos(Angle)*R,Y,FMath::Sin(Angle)*R);};
            M.Quad(Point(39,A,-9),Point(39,B,-9),Point(27,B,-9),Point(27,A,-9),FVector(0,-1,0));
            M.Quad(Point(27,A,9),Point(27,B,9),Point(39,B,9),Point(39,A,9),FVector(0,1,0));
            M.Quad(Point(39,A,9),Point(39,B,9),Point(39,B,-9),Point(39,A,-9),FVector(FMath::Cos((A+B)*.5),0,FMath::Sin((A+B)*.5)));
            M.Quad(Point(27,A,-9),Point(27,B,-9),Point(27,B,9),Point(27,A,9),-FVector(FMath::Cos((A+B)*.5),0,FMath::Sin((A+B)*.5)));
        }
        MakeMesh(O,P,TEXT("OvenStoneArch"),C,M,Cream);
        Box(O,P,TEXT("ArchLeftFoot"),C+FVector(-33,0,-10),FVector(12,18,24),Cream,3);
        Box(O,P,TEXT("ArchRightFoot"),C+FVector(33,0,-10),FVector(12,18,24),Cream,3);
    }
}

UMaterialInstanceDynamic* Material(AActor* Owner,FLinearColor Color,float Roughness,float Glow)
{
    UMaterialInterface* Master=LoadObject<UMaterialInterface>(nullptr,TEXT("/Game/Materials/M_Kitchen.M_Kitchen"));
    if (!Master) Master=UMaterial::GetDefaultMaterial(MD_Surface);
    auto* M=UMaterialInstanceDynamic::Create(Master,Owner);
    M->SetVectorParameterValue(TEXT("Tint"),Color);
    M->SetScalarParameterValue(TEXT("Roughness"),Roughness);
    M->SetScalarParameterValue(TEXT("Glow"),Glow);
    return M;
}

UProceduralMeshComponent* Box(AActor* Owner,USceneComponent* Parent,FName Name,FVector Position,FVector Size,FLinearColor Color,float Bevel,bool Collision)
{
    MeshData Data; Data.RoundedBox(FVector::ZeroVector,Size,Bevel);
    return MakeMesh(Owner,Parent,Name,Position,Data,Color,Collision);
}

UStaticMeshComponent* Sphere(AActor* O,USceneComponent* P,FName N,FVector Position,FVector Scale,FLinearColor Color)
{
    return Basic(O,P,N,Position,Scale,Color,TEXT("/Engine/BasicShapes/Sphere.Sphere"));
}

UStaticMeshComponent* Cylinder(AActor* O,USceneComponent* P,FName N,FVector Position,FVector Scale,FLinearColor Color)
{
    return Basic(O,P,N,Position,Scale,Color,TEXT("/Engine/BasicShapes/Cylinder.Cylinder"));
}

UProceduralMeshComponent* Sector(AActor* O,USceneComponent* P,FName Name,FVector Position,float Radius,float Thickness,float Start,float End,FLinearColor Color)
{
    MeshData M;
    const int32 Steps=FMath::Max(2,FMath::CeilToInt(FMath::Abs(End-Start)*16));
    const float Half=Thickness*.5f;
    auto Point=[&](float A,float Z){return FVector(FMath::Cos(A)*Radius,FMath::Sin(A)*Radius,Z);};
    for (int32 I=0;I<Steps;++I)
    {
        const float A=FMath::Lerp(Start,End,float(I)/Steps),B=FMath::Lerp(Start,End,float(I+1)/Steps);
        const int32 Base=M.V.Num();
        M.V.Append({FVector(0,0,Half),Point(A,Half),Point(B,Half),FVector(0,0,-Half),Point(B,-Half),Point(A,-Half)});
        M.N.Append({FVector::UpVector,FVector::UpVector,FVector::UpVector,-FVector::UpVector,-FVector::UpVector,-FVector::UpVector});
        for (int32 K=0;K<6;++K) M.UV.Add(FVector2D(.5+M.V[Base+K].X/(Radius*2),.5+M.V[Base+K].Y/(Radius*2)));
        M.I.Append({Base,Base+1,Base+2,Base+3,Base+4,Base+5});
        M.Quad(Point(A,-Half),Point(B,-Half),Point(B,Half),Point(A,Half),FVector(FMath::Cos((A+B)*.5),FMath::Sin((A+B)*.5),0));
    }
    M.Quad(FVector(0,0,-Half),Point(Start,-Half),Point(Start,Half),FVector(0,0,Half),FVector(FMath::Sin(Start),-FMath::Cos(Start),0));
    M.Quad(Point(End,-Half),FVector(0,0,-Half),FVector(0,0,Half),Point(End,Half),FVector(-FMath::Sin(End),FMath::Cos(End),0));
    return MakeMesh(O,P,Name,Position,M,Color);
}

UProceduralMeshComponent* Polygon(AActor* O,USceneComponent* P,FName Name,FVector Position,const TArray<FVector2D>& Shape,float Radius,float Thickness,FLinearColor Color)
{
    MeshData M;const float Half=Thickness*.5f;const int32 Count=Shape.Num();
    if(Count<3)return nullptr;
    for(float Z:{Half,-Half})for(const auto& Point:Shape){M.V.Add(FVector(Point.X*Radius,Point.Y*Radius,Z));M.N.Add(Z>0?FVector::UpVector:-FVector::UpVector);M.UV.Add(FVector2D(.5+Point.X*.5,.5+Point.Y*.5));}
    for(int32 I=1;I+1<Count;++I){M.I.Append({0,I,I+1,Count,Count+I+1,Count+I});}
    for(int32 I=0;I<Count;++I){const auto A=Shape[I],B=Shape[(I+1)%Count];const FVector Normal=FVector(B.Y-A.Y,A.X-B.X,0).GetSafeNormal();M.Quad(FVector(A.X*Radius,A.Y*Radius,-Half),FVector(B.X*Radius,B.Y*Radius,-Half),FVector(B.X*Radius,B.Y*Radius,Half),FVector(A.X*Radius,A.Y*Radius,Half),Normal);}
    return MakeMesh(O,P,Name,Position,M,Color);
}

ChefParts Chef(AActor* O,USceneComponent* P,FName Name,FVector Position,FLinearColor Apron)
{
    ChefParts C;
    C.Root=Component<USceneComponent>(O,P,Name,Position);
    const FLinearColor Skin(.73f,.43f,.245f), White(.97f,.94f,.83f), Boot(.065f,.065f,.057f);
    C.LeftFoot=Component<USceneComponent>(O,C.Root,TEXT("ChefLeftFoot"),FVector(-13,0,32));
    C.RightFoot=Component<USceneComponent>(O,C.Root,TEXT("ChefRightFoot"),FVector(13,0,32));
    for (auto* Foot:{C.LeftFoot,C.RightFoot})
    {
        Box(O,Foot,TEXT("ChefTrouserLeg"),FVector(0,0,-11),FVector(18,20,31),Ink,6);
        Box(O,Foot,TEXT("ChefShoe"),FVector(0,-7,-26),FVector(24,34,15),Boot,6);
        Box(O,Foot,TEXT("ChefShoeSole"),FVector(0,-7,-31),FVector(24,34,4),Cream*.4f,2);
    }
    Sphere(O,C.Root,TEXT("ChefJacket"),FVector(0,0,57),FVector(.56,.39,.57),White);
    Box(O,C.Root,TEXT("ChefApronBib"),FVector(0,-20,56),FVector(35,7,41),Apron,5);
    Box(O,C.Root,TEXT("ChefApronSkirt"),FVector(0,-14,35),FVector(44,22,20),Apron,6);
    Box(O,C.Root,TEXT("ChefApronPocket"),FVector(0,-25,46),FVector(23,3,12),Apron*.82f,2);
    Box(O,C.Root,TEXT("ChefApronStrap"),FVector(0,-15,77),FVector(7,7,17),Apron,2);
    for (float X:{-9.f,9.f}) for (float Z:{61.f,70.f}) Sphere(O,C.Root,TEXT("JacketButton"),FVector(X,-19,Z),FVector(.035),Ink);
    Cylinder(O,C.Root,TEXT("ChefNeck"),FVector(0,0,81),FVector(.19,.19,.17),Skin);
    Sphere(O,C.Root,TEXT("ChefHead"),FVector(0,-1,98),FVector(.43,.39,.43),Skin);
    // All faces look toward local -Y; main actor rotation supplies heading.
    for (float X:{-8.f,8.f})
    {
        Sphere(O,C.Root,TEXT("ChefEyeWhite"),FVector(X,-18,101),FVector(.078,.035,.095),White);
        Sphere(O,C.Root,TEXT("ChefEye"),FVector(X,-20,101),FVector(.036,.025,.05),Ink);
        Sphere(O,C.Root,TEXT("ChefCheek"),FVector(X*1.6f,-15.5f,93),FVector(.085,.025,.055),FLinearColor(.82,.27,.19));
    }
    Sphere(O,C.Root,TEXT("ChefNose"),FVector(0,-22,97),FVector(.105,.095,.10),Skin*1.09f);
    Box(O,C.Root,TEXT("ChefSmile"),FVector(0,-19,88),FVector(9,2,2),FLinearColor(.23,.075,.04),1);
    Cylinder(O,C.Root,TEXT("ChefHatBand"),FVector(0,0,116),FVector(.43,.40,.14),White);
    for (int32 I=0;I<5;++I)
    {
        const float A=I*2*PI/5;
        Sphere(O,C.Root,TEXT("ChefHatPuff"),FVector(FMath::Cos(A)*12,FMath::Sin(A)*10,128),FVector(.30,.28,.28),White);
    }
    Sphere(O,C.Root,TEXT("ChefHatCrown"),FVector(0,0,133),FVector(.32,.29,.25),White);
    C.LeftArm=Component<USceneComponent>(O,C.Root,TEXT("ChefLeftArm"),FVector(-27,0,71));
    C.RightArm=Component<USceneComponent>(O,C.Root,TEXT("ChefRightArm"),FVector(27,0,71));
    for (auto* Arm:{C.LeftArm,C.RightArm})
    {
        Sphere(O,Arm,TEXT("ChefSleeve"),FVector(0,0,-10),FVector(.24,.25,.34),White);
        Cylinder(O,Arm,TEXT("ChefCuff"),FVector(0,0,-23),FVector(.22,.22,.08),Apron);
        Sphere(O,Arm,TEXT("ChefHand"),FVector(0,-4,-29),FVector(.22,.21,.22),Skin);
    }
    return C;
}

void Room(AActor* O,USceneComponent* P)
{
    Box(O,P,TEXT("CourtyardBackdrop"),FVector(0,0,-70),FVector(3600,3000,20),FLinearColor(.22f,.34f,.25f),8,false);
    // 14 x 10 tiles are batched into three mesh sections/components, not
    // one component per tile. The floor remains a single simple collision box.
    Box(O,P,TEXT("FloorFoundation"),FVector(0,20,-12),FVector(1400,960,24),FLinearColor(.25,.20,.14),4,true);
    MeshData Floors[3];
    for (int32 X=0;X<14;++X) for (int32 Y=0;Y<10;++Y)
        Floors[(X+Y*2)%3].RoundedBox(FVector(-650+X*100,-412+Y*96,1),FVector(97,93,4),1);
    const FLinearColor FloorColors[3]={FLinearColor(.80,.73,.57),FLinearColor(.87,.81,.66),FLinearColor(.76,.71,.57)};
    for (int32 I=0;I<3;++I) MakeMesh(O,P,TEXT("CreamFloorTiles"),FVector::ZeroVector,Floors[I],FloorColors[I]);
    Box(O,P,TEXT("LeftWall"),FVector(-706,20,82),FVector(20,960,164),FLinearColor(.62,.70,.55),5,true);
    Box(O,P,TEXT("RightWall"),FVector(706,20,82),FVector(20,960,164),FLinearColor(.62,.70,.55),5,true);
    Box(O,P,TEXT("FrontLowWall"),FVector(0,-470,17),FVector(1400,20,34),Sage,5,true);
    Box(O,P,TEXT("RearLowWall"),FVector(0,506,29),FVector(1400,20,58),Sage,5,true);
    for (float X:{-690.f,690.f})
    {
        Box(O,P,TEXT("WallCoping"),FVector(X,20,164),FVector(27,960,10),Ivory,3);
        Box(O,P,TEXT("WallSkirting"),FVector(X,20,13),FVector(12,960,26),Teal,3);
    }
    Box(O,P,TEXT("FrontCoping"),FVector(0,-470,35),FVector(1415,27,9),Ivory,3);
    Cabinet(O,P,FVector(-610,-280,0));
    Cabinet(O,P,FVector(-610,-30,0));
    Cabinet(O,P,FVector(-610,220,0));
    Cabinet(O,P,FVector(610,-280,0));
    Cabinet(O,P,FVector(610,100,0),FVector(130,110,80),Teal);
    Cabinet(O,P,FVector(0,190,0),FVector(180,120,80),Teal);
    Cabinet(O,P,FVector(0,430,0),FVector(1110,106,80),Sage);

    // Dough station: dusted hardwood board, dough balls and wooden rolling pin.
    Box(O,P,TEXT("DoughBoard"),FVector(-610,-280,84),FVector(105,84,8),Wood,6);
    Cylinder(O,P,TEXT("FlourDust"),FVector(-612,-280,89),FVector(.67,.53,.012),Ivory);
    Sphere(O,P,TEXT("DoughBall"),FVector(-623,-281,97),FVector(.36,.35,.19),Cream);
    Sphere(O,P,TEXT("DoughBall"),FVector(-581,-268,94),FVector(.22,.24,.13),Ivory);
    auto* Pin=Cylinder(O,P,TEXT("RollingPin"),FVector(-611,-312,96),FVector(.13,.13,.67),Wood*1.4f);
    Pin->SetRelativeRotation(FRotator(0,0,90));
    for (float X:{-652.f,-570.f}) Sphere(O,P,TEXT("PinHandle"),FVector(X,-312,96),FVector(.20,.095,.095),Wood);
    Label(O,P,FVector(-610,-338,54),TEXT("TEIG"),Ivory,18);

    Tray(O,P,FVector(-610,-30,84),Tomato);
    for (int32 I=0;I<5;++I)
    {
        const FVector C(-635+(I%3)*24,-46+(I/3)*29,98);
        Sphere(O,P,TEXT("Tomato"),C,FVector(.23,.23,.20),Tomato*(.87f+I*.035f));
        Sphere(O,P,TEXT("TomatoStem"),C+FVector(0,0,10),FVector(.13,.13,.035),Leaf);
    }
    Label(O,P,FVector(-610,-88,54),TEXT("SOSSE"),Ivory,18);
    Tray(O,P,FVector(-610,220,84),FLinearColor(.94,.65,.17));
    for (int32 I=0;I<9;++I)
    {
        auto* Cheese=Box(O,P,TEXT("CheeseShred"),FVector(-639+(I%3)*28,197+(I/3)*22,94+(I%2)*2),FVector(23,6,6),FLinearColor(1,.78,.28),2);
        Cheese->SetRelativeRotation(FRotator(0,I*37,0));
    }
    Label(O,P,FVector(-610,162,54),TEXT("KAESE"),Ivory,18);
    Tray(O,P,FVector(610,-280,84),FLinearColor(.41,.27,.15));
    for (int32 I=0;I<6;++I)
    {
        const FVector C(583+(I%3)*27,-296+(I/3)*30,99);
        Cylinder(O,P,TEXT("MushroomStem"),C-FVector(0,0,4),FVector(.10,.10,.19),Cream);
        Sphere(O,P,TEXT("MushroomCap"),C+FVector(0,0,4),FVector(.27,.27,.14),FLinearColor(.68,.43,.23));
    }
    Label(O,P,FVector(610,-338,54),TEXT("PILZE"),Ivory,18);

    // Oven dome and an actual recessed opening bounded by a stone arch.
    Sphere(O,P,TEXT("TerracottaOvenDome"),FVector(610,113,119),FVector(1.11,.89,1.0),Terra);
    Box(O,P,TEXT("OvenHearth"),FVector(610,95,87),FVector(118,103,14),FLinearColor(.29,.24,.17),4);
    Box(O,P,TEXT("OvenMouthDark"),FVector(610,65,105),FVector(58,6,51),Ink,18);
    OvenArch(O,P,FVector(610,53,106));
    Box(O,P,TEXT("OvenLanding"),FVector(610,39,86),FVector(81,39,8),Cream,4);
    Cylinder(O,P,TEXT("Chimney"),FVector(610,133,184),FVector(.26,.26,.55),Terra*.8f);
    Cylinder(O,P,TEXT("ChimneyRim"),FVector(610,133,211),FVector(.35,.35,.09),Cream);
    for (int32 I=0;I<5;++I)
    {
        auto* Flame=Sphere(O,P,TEXT("OvenFlame"),FVector(590+I*10,48,100+(I%2)*3),FVector(.10,.045,.23+I%2*.06),FLinearColor(1,.21,.01));
        Flame->SetMaterial(0,Material(O,FLinearColor(1,.17,.006),.6f,3.5f));
        auto* Core=Sphere(O,P,TEXT("FlameCore"),FVector(590+I*10,45,95),FVector(.065,.025,.12),FLinearColor(1,.65,.07));
        Core->SetMaterial(0,Material(O,FLinearColor(1,.62,.035),.5f,4));
    }
    Label(O,P,FVector(610,42,53),TEXT("OFEN"),Ivory,18);

    Box(O,P,TEXT("PizzaCuttingBoard"),FVector(0,190,85),FVector(154,99,10),Wood*1.3f,7);
    for (float X:{-64.f,64.f}) Box(O,P,TEXT("BoardHandle"),FVector(X,190,84),FVector(11,115,7),Wood,3);
    Label(O,P,FVector(0,126,52),TEXT("SCHNEIDEN"),Ivory,16);
    // Three service bays match the gameplay's exact customer slots.
    for (float X:{-300.f,0.f,300.f})
    {
        Box(O,P,TEXT("ServicePlacemat"),FVector(X,427,82),FVector(126,77,4),Terra*.78f,4);
        Cylinder(O,P,TEXT("ServicePlate"),FVector(X,427,85),FVector(.78,.78,.035),Ivory);
        Cylinder(O,P,TEXT("PlateWell"),FVector(X,427,87),FVector(.65,.65,.02),Cream);
        Box(O,P,TEXT("ServiceBayNumber"),FVector(X,374,53),FVector(43,4,26),Teal,3);
        Label(O,P,FVector(X,369,53),X<0?TEXT("1"):X>0?TEXT("3"):TEXT("2"),Ivory,20);
    }
    // Props sit away from preparation surfaces and leave all approach paths open.
    Herb(O,P,FVector(-481,432,80),1.1f);
    Herb(O,P,FVector(481,432,80),1.1f);
    Herb(O,P,FVector(-610,295,80),.72f);
    for (float X:{-483.f,-213.f,213.f,483.f})
    {
        Box(O,P,TEXT("RearShelfPost"),FVector(X,502,128),FVector(15,20,146),Wood,3,true);
        Box(O,P,TEXT("ShelfBracket"),FVector(X,491,191),FVector(15,32,14),Wood,3);
    }
    for (float X:{-647.f,647.f})
        Box(O,P,TEXT("MenuBacking"),FVector(X,496,139),FVector(107,18,171),Sage,5,true);
    Box(O,P,TEXT("RearWoodShelf"),FVector(-350,497,198),FVector(249,32,10),Wood,3);
    Box(O,P,TEXT("RearWoodShelf"),FVector(350,497,198),FVector(249,32,10),Wood,3);
    for (float X:{-428.f,-382.f,-334.f,330.f,377.f,425.f})
    {
        Cylinder(O,P,TEXT("PantryJar"),FVector(X,496,218),FVector(.23,.23,.32),X<0?Terra:Ivory);
        Cylinder(O,P,TEXT("PantryJarLid"),FVector(X,496,236),FVector(.25,.25,.045),Wood);
    }
    for (float X:{-647.f,647.f})
    {
        Box(O,P,TEXT("MenuFrame"),FVector(X,463,172),FVector(91,11,94),Wood,6);
        Box(O,P,TEXT("MenuSlate"),FVector(X,456,172),FVector(77,3,80),Ink,3);
        Label(O,P,FVector(X,452,193),TEXT("PIZZA"),Ivory,17);
        Label(O,P,FVector(X,452,171),TEXT("1/2   1/4"),Cream,12);
        Label(O,P,FVector(X,452,150),TEXT("1/8"),Cream,13);
    }
    // Pendants: a warm bulb inside a sage shade, thin brass suspension.
    for (float X:{-335.f,335.f})
    {
        Cylinder(O,P,TEXT("PendantWire"),FVector(X,340,325),FVector(.022,.022,1.15),Ink);
        Sphere(O,P,TEXT("PendantShade"),FVector(X,340,263),FVector(.73,.73,.28),Teal);
        Cylinder(O,P,TEXT("PendantBrassRim"),FVector(X,340,251),FVector(.72,.72,.045),FLinearColor(.70,.47,.17));
        auto* Bulb=Sphere(O,P,TEXT("PendantBulb"),FVector(X,340,246),FVector(.24,.24,.13),Ivory);
        Bulb->SetMaterial(0,Material(O,FLinearColor(1,.72,.28),.3f,2));
    }
    // Small wash-up counter in the vacant front-right corner, with sink/pot.
    Cabinet(O,P,FVector(404,-382,0),FVector(154,98,80),Teal);
    Box(O,P,TEXT("SinkRim"),FVector(407,-382,82),FVector(96,64,5),Steel,5);
    Box(O,P,TEXT("SinkBowl"),FVector(407,-382,85),FVector(79,49,4),Ink,8);
    Cylinder(O,P,TEXT("TapStem"),FVector(407,-350,98),FVector(.055,.055,.32),Steel);
    Box(O,P,TEXT("TapSpout"),FVector(407,-360,113),FVector(5,25,5),Steel,2);
    Cylinder(O,P,TEXT("StockPot"),FVector(353,-382,99),FVector(.34,.34,.28),Steel);
    Cylinder(O,P,TEXT("StockPotLid"),FVector(353,-382,114),FVector(.36,.36,.045),Steel*1.3f);
    Sphere(O,P,TEXT("PotLidKnob"),FVector(353,-382,119),FVector(.09,.09,.07),Ink);
}
}

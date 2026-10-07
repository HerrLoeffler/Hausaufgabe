#pragma once

#include "CoreMinimal.h"

class AActor;
class USceneComponent;
class UStaticMeshComponent;
class UProceduralMeshComponent;
class UMaterialInstanceDynamic;

// Original geometry authored for GradeCrew. Dimensions are centimetres.
namespace KitchenArt
{
    UMaterialInstanceDynamic* Material(AActor* Owner, FLinearColor Color, float Roughness = .55f, float Glow = 0.f);
    UProceduralMeshComponent* Box(AActor* Owner, USceneComponent* Parent, FName Name, FVector Position, FVector Size, FLinearColor Color, float Bevel = 5.f, bool Collision = false);
    UStaticMeshComponent* Sphere(AActor* Owner, USceneComponent* Parent, FName Name, FVector Position, FVector Scale, FLinearColor Color);
    UStaticMeshComponent* Cylinder(AActor* Owner, USceneComponent* Parent, FName Name, FVector Position, FVector Scale, FLinearColor Color);
    UProceduralMeshComponent* Sector(AActor* Owner, USceneComponent* Parent, FName Name, FVector Position, float Radius, float Thickness, float StartRadians, float EndRadians, FLinearColor Color);

    UProceduralMeshComponent* Polygon(AActor*,USceneComponent*,FName,FVector,const TArray<FVector2D>&,float,float,FLinearColor);

    struct ChefParts
    {
        USceneComponent* Root = nullptr;
        USceneComponent* LeftFoot = nullptr;
        USceneComponent* RightFoot = nullptr;
        USceneComponent* LeftArm = nullptr;
        USceneComponent* RightArm = nullptr;
    };

    ChefParts Chef(AActor* Owner, USceneComponent* Parent, FName Name, FVector Position, FLinearColor Apron);
    void Room(AActor* Owner, USceneComponent* Parent,int Level=1);
    void ExtraOven(AActor*,USceneComponent*,FVector);
}

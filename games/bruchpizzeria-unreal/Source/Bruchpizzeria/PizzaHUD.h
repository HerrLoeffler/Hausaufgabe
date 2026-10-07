#pragma once
#include "CoreMinimal.h"
#include "GameFramework/HUD.h"
#include "PizzaHUD.generated.h"
class UFont;
struct FKitchenButton {FName Id;FBox2D Rect;};
UCLASS() class BRUCHPIZZERIA_API APizzaHUD:public AHUD {
 GENERATED_BODY()
 public:APizzaHUD();virtual void DrawHUD()override;bool Press(FVector2D Screen);
 UPROPERTY() UFont* TextFont=nullptr;
 FVector2D TextExtent(const FString&,float)const;void Wrapped(const FString&,float,float,float,float,FLinearColor,int MaxLines=2);
 FVector2D ViewOrigin=FVector2D::ZeroVector;float Scale=1,Height=720;TArray<FKitchenButton> Buttons;
 void Panel(float,float,float,float,FLinearColor);void Label(const FString&,float,float,float,FLinearColor=FLinearColor::White,bool Center=false);void Button(FName,const FString&,float,float,float,float,FLinearColor);void Circle(float,float,float,FLinearColor);
};

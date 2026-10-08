#pragma once
#include "CoreMinimal.h"
#include "Blueprint/UserWidget.h"
#include "IslandFocusWidget.generated.h"
class USlider;class UTextBlock;class UButton;class UCanvasPanel;class UIslandFocusWidget;class AIslandGameMode;
struct FIslandPaintEdge{int From,To;FVector2D Start,End;};
UCLASS() class UIslandUICommand:public UObject{
 GENERATED_BODY()
 public:UPROPERTY() UIslandFocusWidget* Owner;int Command=0,ExpectedFocus=-1;bool ExpectedPause=false;UFUNCTION() void Run();
};
UCLASS() class UIslandFocusWidget:public UUserWidget{
 GENERATED_BODY()
 public:virtual TSharedRef<SWidget> RebuildWidget()override;virtual void NativeTick(const FGeometry&,float)override;
 virtual FReply NativeOnPreviewMouseButtonDown(const FGeometry&,const FPointerEvent&)override;virtual FReply NativeOnMouseMove(const FGeometry&,const FPointerEvent&)override;virtual FReply NativeOnMouseButtonUp(const FGeometry&,const FPointerEvent&)override;
 virtual void NativeOnMouseCaptureLost(const FCaptureLostEvent&)override;
 virtual FReply NativeOnTouchStarted(const FGeometry&,const FPointerEvent&)override;virtual FReply NativeOnTouchMoved(const FGeometry&,const FPointerEvent&)override;virtual FReply NativeOnTouchEnded(const FGeometry&,const FPointerEvent&)override;
 virtual int32 NativePaint(const FPaintArgs&,const FGeometry&,const FSlateRect&,FSlateWindowElementList&,int32,const FWidgetStyle&,bool)const override;
 UPROPERTY() USlider* MouseSlider=nullptr;UPROPERTY() UTextBlock* MouseSpeedLabel=nullptr;
 UFUNCTION() void MouseSensitivityChanged(float Value);UFUNCTION() void MouseSensitivityCommitted();
 UButton* ButtonFor(int)const;void CancelPointer();AIslandGameMode* Game()const;void Refresh();
 UPROPERTY() UCanvasPanel* Body;UPROPERTY() TArray<UIslandUICommand*> Commands;UPROPERTY() TMap<int,UButton*> Buttons;
 mutable TArray<FIslandPaintEdge> PaintedEdges;
 FString Signature;bool PointerOwned=false;int PointerId=-2;
 private:void Text(const FString&,float,float,float,float=22);void Button(const FString&,int,float,float,float,float=64);int NodeAt(FVector2D)const;FReply BeginRoutePointer(const FPointerEvent&);FReply MoveRoutePointer(const FPointerEvent&);FReply EndRoutePointer(const FPointerEvent&);
};

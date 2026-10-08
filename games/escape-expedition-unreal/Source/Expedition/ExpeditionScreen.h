#pragma once
#include "CoreMinimal.h"
#include "Widgets/SCompoundWidget.h"
class AExpeditionGameMode;

// Native Slate owns layout, mouse/touch hit testing and focus navigation.
class SExpeditionScreen final : public SCompoundWidget
{
public:
 SLATE_BEGIN_ARGS(SExpeditionScreen) {} SLATE_ARGUMENT(AExpeditionGameMode*, Game) SLATE_END_ARGS()
 void Construct(const FArguments& Args);
 void Refresh();
 virtual bool SupportsKeyboardFocus() const override { return true; }
 virtual FReply OnPreviewKeyDown(const FGeometry& Geometry, const FKeyEvent& Event) override;
 virtual FReply OnKeyUp(const FGeometry& Geometry, const FKeyEvent& Event) override;
private:
 TWeakObjectPtr<AExpeditionGameMode> Game;
 int InspectItem = -1;
 bool ConfirmRestart = false;
 TSharedRef<SWidget> Text(const FString& Value, int Size = 18, bool Quiet = false) const;
 TSharedRef<SWidget> Button(const FString& Label, int Action, bool Selected = false, bool Enabled = true);
 TSharedRef<SWidget> Inventory(bool Compact);
 TSharedRef<SWidget> Content();
 FReply Activate(int Action);
};

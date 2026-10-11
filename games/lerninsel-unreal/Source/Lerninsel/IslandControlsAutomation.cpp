#if WITH_EDITOR
#include "Misc/AutomationTest.h"
#include "Tests/AutomationEditorCommon.h"
#include "Editor.h"
#include "IslandWorld.h"
#include "IslandFocusWidget.h"
#include "Blueprint/WidgetTree.h"
#include "Components/Slider.h"
#include "GameFramework/CharacterMovementComponent.h"
#include "Kismet/GameplayStatics.h"
#include "Framework/Application/SlateApplication.h"
#include "Widgets/Input/SSlider.h"
#include "Layout/WidgetPath.h"
#include "Engine/GameViewportClient.h"
#include "Widgets/SViewport.h"
#include "ImageUtils.h"
#include "Misc/FileHelper.h"
#include "Misc/Paths.h"
#include <limits>
class FControlsCheck:public IAutomationLatentCommand{
 FAutomationTestBase* T;double Start=FPlatformTime::Seconds();int Phase=0;
 public:explicit FControlsCheck(FAutomationTestBase* Test):T(Test){}bool Update()override{
 auto* W=GEditor?GEditor->PlayWorld.Get():nullptr;auto* G=W?Cast<AIslandGameMode>(W->GetAuthGameMode()):nullptr;if(!G){if(FPlatformTime::Seconds()-Start<40)return false;T->AddError(TEXT("Controls PIE unavailable"));return true;}
 auto* P=G->Player();auto* C=P?Cast<AIslandController>(P->Controller):nullptr;if(!C)return false;if(Phase==0){G->SaveSlot=TEXT("LerninselControlsWorldAutomation");G->ResetDemo();C->PreferencesSlot=TEXT("LerninselControlsPreferencesAutomation");UGameplayStatics::DeleteGameInSlot(C->PreferencesSlot,0);C->MouseSensitivity=1;
 T->TestTrue(TEXT("Faster character reaches at least4m/s"),P->GetCharacterMovement()->MaxWalkSpeed>=400.f);
 G->Paused=true;C->UpdateMode();USlider* Slider=nullptr;C->FocusWidget->WidgetTree->ForEachWidget([&](UWidget* Widget){if(auto* S=Cast<USlider>(Widget))Slider=S;});T->TestNotNull(TEXT("Pause exposes native mouse sensitivity slider"),Slider);
 G->UIAction(9003);T->TestTrue(TEXT("Faster setting changes mouse sensitivity while paused"),C->MouseSensitivity>1);T->TestTrue(TEXT("Mouse preference persists in its separate slot"),UGameplayStatics::DoesSaveGameExist(C->PreferencesSlot,0));
 Start=FPlatformTime::Seconds();Phase=1;return false;}
 if(FPlatformTime::Seconds()-Start<1)return false;
 if(Phase==1){auto* Current=C->FocusWidget->MouseSlider;if(!Current){T->AddError(TEXT("Current slider unavailable after preference button"));return true;}auto S=StaticCastSharedRef<SSlider>(Current->TakeWidget());auto Geometry=S->GetCachedGeometry();FVector2D Point=Geometry.GetAbsolutePosition()+Geometry.GetAbsoluteSize()*FVector2D(.66,.5);TSet<FKey> Held;Held.Add(EKeys::LeftMouseButton);FPointerEvent Down(FSlateApplication::CursorPointerIndex,Point,Point,Held,EKeys::LeftMouseButton,0,FModifierKeysState());FWidgetPath Path;FSlateApplication::Get().GeneratePathToWidgetUnchecked(S,Path);if(!Path.IsValid()){T->AddError(TEXT("Native settings slider must be attached"));return true;}auto Reply=S->OnMouseButtonDown(Geometry,Down);FSlateApplication::Get().ProcessReply(Path,Reply,&Path,&Down);FPointerEvent Up(FSlateApplication::CursorPointerIndex,Point,Point,TSet<FKey>(),EKeys::LeftMouseButton,0,FModifierKeysState());auto Release=S->OnMouseButtonUp(Geometry,Up);FSlateApplication::Get().ProcessReply(Path,Release,&Path,&Up);T->TestTrue(TEXT("Native slider pointer changes actual mouse sensitivity"),C->MouseSensitivity>1.75f);float Saved=C->MouseSensitivity;C->MouseSensitivity=1;T->TestTrue(TEXT("Preference reload succeeds"),C->LoadPreferences());T->TestTrue(TEXT("Saved slider setting survives reload"),FMath::IsNearlyEqual(C->MouseSensitivity,Saved));
 G->Paused=false;C->UpdateMode();C->KeysArmed=true;C->SetMouseSensitivity(1,false);C->RotationInput=FRotator::ZeroRotator;P->Turn(10);P->Look(10);FRotator Base=C->RotationInput;C->SetMouseSensitivity(2,false);C->RotationInput=FRotator::ZeroRotator;P->Turn(10);P->Look(10);T->TestTrue(TEXT("Mouse setting doubles both actual look axes"),FMath::IsNearlyEqual(C->RotationInput.Yaw,Base.Yaw*2)&&FMath::IsNearlyEqual(C->RotationInput.Pitch,Base.Pitch*2)&&Base.Yaw!=0&&Base.Pitch!=0);C->SetMouseSensitivity(std::numeric_limits<float>::quiet_NaN(),false);T->TestEqual(TEXT("Invalid runtime sensitivity becomes safe default"),C->MouseSensitivity,1.f);G->Paused=true;C->UpdateMode();Start=FPlatformTime::Seconds();Phase=2;return false;}
 auto* Client=W->GetGameViewport();auto Widget=Client?Client->GetGameViewportWidget():TSharedPtr<SViewport>();if(Widget.IsValid()){TArray<FColor> Pixels;FIntVector Size;bool Ok=FSlateApplication::Get().TakeScreenshot(Widget.ToSharedRef(),Pixels,Size);TArray64<uint8> Bytes;if(Ok)FImageUtils::PNGCompressImageArray(Size.X,Size.Y,Pixels,Bytes);T->TestTrue(TEXT("Actual settings panel captured"),Ok&&FFileHelper::SaveArrayToFile(Bytes,*(FPaths::ProjectDir()/TEXT("Reports/Controls-Pause.png"))));}
 G->Paused=false;C->UpdateMode();return true;
 }};
IMPLEMENT_SIMPLE_AUTOMATION_TEST(FIslandControls,"GradeCrew.Lerninsel.Controls",EAutomationTestFlags::EditorContext|EAutomationTestFlags::EngineFilter)
bool FIslandControls::RunTest(const FString&){ADD_LATENT_AUTOMATION_COMMAND(FEditorLoadMap(TEXT("/Game/Maps/Lerninsel")));ADD_LATENT_AUTOMATION_COMMAND(FStartPIECommand(false));ADD_LATENT_AUTOMATION_COMMAND(FControlsCheck(this));ADD_LATENT_AUTOMATION_COMMAND(FEndPlayMapCommand());return true;}
#endif

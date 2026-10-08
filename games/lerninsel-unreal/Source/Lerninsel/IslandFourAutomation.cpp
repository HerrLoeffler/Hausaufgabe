#if WITH_EDITOR
#include "Misc/AutomationTest.h"
#include "Tests/AutomationEditorCommon.h"
#include "Editor.h"
#include "IslandWorld.h"
#include "IslandFocusWidget.h"
#include "Kismet/GameplayStatics.h"
#include "Components/Button.h"
#include "Framework/Application/SlateApplication.h"
#include "Widgets/Input/SButton.h"
class FFourPlayCheck:public IAutomationLatentCommand{
 FAutomationTestBase* Test;double Start=FPlatformTime::Seconds();int Phase=0;
 public:explicit FFourPlayCheck(FAutomationTestBase* T):Test(T){}bool Update()override{
 UWorld* W=GEditor?GEditor->PlayWorld.Get():nullptr;auto* G=W?Cast<AIslandGameMode>(W->GetAuthGameMode()):nullptr;if(!G){if(FPlatformTime::Seconds()-Start<40)return false;Test->AddError(TEXT("Four puzzle PIE absent"));return true;}
 auto* P=G->Player();auto* C=P?Cast<AIslandController>(P->GetController()):nullptr;if(!C)return false;
 if(Phase==0){G->SaveSlot=TEXT("LerninselFourAutomation");G->ResetDemo();Test->TestNotNull(TEXT("Sentence room target exists"),G->Target(510));Test->TestNotNull(TEXT("Route terrace exists"),G->Target(600));Test->TestNotNull(TEXT("Coast find exists"),G->Target(700));Test->TestNotNull(TEXT("Finale exists"),G->Target(800));
 Test->TestFalse(TEXT("Later room unavailable before garden success"),G->CanInspect(510));Test->TestFalse(TEXT("Coast alignment does not bypass untouched tasks"),G->PreviewAligned());
 for(int id:{0,2}){P->SetActorLocation(G->Target(100+id)->Pos+FVector(0,0,80));G->Interact(100+id);G->SelectFocused();}P->SetActorLocation(G->Target(11)->Pos);G->Interact(11);P->SetActorLocation(G->Target(20)->Pos);G->Interact(20);for(int id:{0,4,8}){P->SetActorLocation(G->Target(200+id)->Pos+FVector(0,0,80));G->Tick(.31f);}P->SetActorLocation(G->Target(21)->Pos);G->Interact(21);
 P->SetActorLocation(G->Target(510)->Pos);G->Tick(0);C->Interact();Test->TestTrue(TEXT("Normal controller opens sentence trial"),G->State.sentenceActive&&G->Focus==510);Test->TestNotNull(TEXT("Required answers use native focus widget"),C->FocusWidget);Start=FPlatformTime::Seconds();Phase=1;return false;}
 if(FPlatformTime::Seconds()-Start<1)return false;
 auto Click=[&](int id){UButton* B=C->FocusWidget->ButtonFor(id);if(!B){Test->AddError(FString::Printf(TEXT("UI button missing%d"),id));return;}auto S=StaticCastSharedRef<SButton>(B->TakeWidget());FGeometry Geometry=S->GetCachedGeometry();FVector2D Point=Geometry.GetAbsolutePosition()+Geometry.GetAbsoluteSize()*.5;TSet<FKey> Down;Down.Add(EKeys::LeftMouseButton);FPointerEvent Press(0,Point,Point,Down,EKeys::LeftMouseButton,0,FModifierKeysState());S->OnMouseButtonDown(Geometry,Press);FPointerEvent Release(0,Point,Point,TSet<FKey>(),EKeys::LeftMouseButton,0,FModifierKeysState());S->OnMouseButtonUp(Geometry,Release);};
 if(Phase==1){for(int id:{5000,5001,5002,5003})Click(id);Click(5012);Test->TestTrue(TEXT("Native pointer press/release confirms sentence"),G->State.sentence);Test->TestTrue(TEXT("Sentence gate has blocker while animating"),G->GateBlocks(3));G->UIAction(4000);
 P->SetActorLocation(G->Target(401)->Pos);G->Interact(401);P->SetActorLocation(G->Target(400)->Pos);for(int i=0;i<3;++i){G->Interact(400);G->Tick(.7f);}P->SetActorLocation(G->Target(403)->Pos+FVector(0,0,80));G->Interact(403);Test->TestTrue(TEXT("Correct bucket milestone"),G->State.water);P->SetActorLocation(G->Target(600)->Pos);G->Interact(600);G->UIAction(6000);for(int id:{611,612,613,620})G->UIAction(id+5400);G->UIAction(6031);Test->TestTrue(TEXT("Route focus completes exact whole"),G->State.fractions);G->UIAction(4000);
 for(int id=700;id<704;++id){P->SetActorLocation(G->Target(id)->Pos);G->Interact(id);}P->SetActorLocation(G->Target(710)->Pos);G->Interact(710);for(int id:{7000,7002,7003})G->UIAction(id);G->UIAction(7010);Test->TestTrue(TEXT("Found versus selected coast state"),G->State.foundMask==15&&G->State.coastMask==13&&G->State.coastReady&&!G->State.coast);G->ConfirmCoast();Test->TestFalse(TEXT("Correct sum from wrong place never completes"),G->State.coast);G->UIAction(4000);P->SetActorLocation(G->ObservationStand);C->SetControlRotation(G->ObservationView);Test->TestTrue(TEXT("Authored actual observation pose matches geometry"),G->PreviewAligned());G->ConfirmCoast();Test->TestTrue(TEXT("Pose and correct selection complete coast"),G->State.coast);
 P->SetActorLocation(G->Target(800)->Pos);G->Interact(800);G->UIAction(8000);Test->TestTrue(TEXT("Four main signals complete prototype finale"),G->State.finale);return true;}
 return true;
 }};
IMPLEMENT_SIMPLE_AUTOMATION_TEST(FIslandFour,"GradeCrew.Lerninsel.FourPuzzles",EAutomationTestFlags::EditorContext|EAutomationTestFlags::EngineFilter)
bool FIslandFour::RunTest(const FString&){ADD_LATENT_AUTOMATION_COMMAND(FEditorLoadMap(TEXT("/Game/Maps/Lerninsel")));ADD_LATENT_AUTOMATION_COMMAND(FStartPIECommand(false));ADD_LATENT_AUTOMATION_COMMAND(FFourPlayCheck(this));ADD_LATENT_AUTOMATION_COMMAND(FEndPlayMapCommand());return true;}
#endif

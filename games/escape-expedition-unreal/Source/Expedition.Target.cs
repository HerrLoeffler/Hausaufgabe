using UnrealBuildTool;
public class ExpeditionTarget:TargetRules {public ExpeditionTarget(TargetInfo Target):base(Target){Type=TargetType.Game;DefaultBuildSettings=BuildSettingsVersion.V7;IncludeOrderVersion=EngineIncludeOrderVersion.Latest;ExtraModuleNames.Add("Expedition");}}

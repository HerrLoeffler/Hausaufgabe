using UnrealBuildTool;
public class Expedition:ModuleRules {public Expedition(ReadOnlyTargetRules Target):base(Target){PCHUsage=PCHUsageMode.UseExplicitOrSharedPCHs;PublicDependencyModuleNames.AddRange(new[]{"Core","CoreUObject","Engine","InputCore","UMG","Slate","SlateCore","Json","JsonUtilities"});if(Target.Type==TargetType.Editor)PrivateDependencyModuleNames.Add("UnrealEd");}}

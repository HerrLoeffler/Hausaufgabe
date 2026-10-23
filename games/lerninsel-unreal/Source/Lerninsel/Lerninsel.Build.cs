using UnrealBuildTool;
public class Lerninsel:ModuleRules {public Lerninsel(ReadOnlyTargetRules Target):base(Target){PCHUsage=PCHUsageMode.UseExplicitOrSharedPCHs;PublicDependencyModuleNames.AddRange(new[]{"Core","CoreUObject","Engine","InputCore","Slate","SlateCore","UMG","ProceduralMeshComponent"});if(Target.Type==TargetType.Editor)PrivateDependencyModuleNames.Add("UnrealEd");}}

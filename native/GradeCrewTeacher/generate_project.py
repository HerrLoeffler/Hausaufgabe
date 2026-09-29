"""Regenerate the dependency-free GradeCrew Teacher Xcode project."""
from pathlib import Path
import hashlib, json

ROOT = Path(__file__).resolve().parent
SHARED = ROOT.parent / 'Shared'
objects = {}

def ident(name):
    return hashlib.sha256(name.encode()).hexdigest()[:24].upper()

def obj(key_name, **values):
    key = ident(key_name)
    objects[key] = values
    return key

source_paths = list(sorted((ROOT / 'Sources').glob('*.swift'))) + [
    SHARED / 'GradeCrewDesignTokens.swift',
    SHARED / 'GradeCrewAssets.swift',
]

files = []
builds = []
for source in source_paths:
    relative = source.relative_to(ROOT) if source.is_relative_to(ROOT) else Path('..') / 'Shared' / source.name
    ref = obj(
        str(relative),
        isa='PBXFileReference',
        lastKnownFileType='sourcecode.swift',
        path=str(relative),
        sourceTree='<group>',
    )
    files.append(ref)
    builds.append(obj('build-' + str(relative), isa='PBXBuildFile', fileRef=ref))

product = obj(
    'product',
    isa='PBXFileReference',
    explicitFileType='wrapper.application',
    path='GradeCrew.app',
    sourceTree='BUILT_PRODUCTS_DIR',
)
products = obj('products', isa='PBXGroup', children=[product], name='Products', sourceTree='<group>')
main = obj('main', isa='PBXGroup', children=files + [products], sourceTree='<group>')
sources = obj('sources', isa='PBXSourcesBuildPhase', buildActionMask='2147483647', files=builds, runOnlyForDeploymentPostprocessing='0')
frameworks = obj('frameworks', isa='PBXFrameworksBuildPhase', buildActionMask='2147483647', files=[], runOnlyForDeploymentPostprocessing='0')
resources = obj('resources', isa='PBXResourcesBuildPhase', buildActionMask='2147483647', files=[], runOnlyForDeploymentPostprocessing='0')

project_configs = []
target_configs = []
for name in ['Debug', 'Release']:
    debug = name == 'Debug'
    project_configs.append(obj(
        'project-' + name,
        isa='XCBuildConfiguration',
        name=name,
        buildSettings={
            'SDKROOT': 'iphoneos',
            'IPHONEOS_DEPLOYMENT_TARGET': '16.0',
            'CLANG_ENABLE_MODULES': 'YES',
            'SWIFT_VERSION': '5.0',
            'SWIFT_OPTIMIZATION_LEVEL': '-Onone' if debug else '-O',
            'SWIFT_ACTIVE_COMPILATION_CONDITIONS': 'DEBUG' if debug else '',
            'DEBUG_INFORMATION_FORMAT': 'dwarf' if debug else 'dwarf-with-dsym',
            'ENABLE_TESTABILITY': 'YES' if debug else 'NO',
        },
    ))
    target_configs.append(obj(
        'target-' + name,
        isa='XCBuildConfiguration',
        name=name,
        buildSettings={
            'PRODUCT_BUNDLE_IDENTIFIER': 'de.gradecrew.teacher',
            'PRODUCT_NAME': '$(TARGET_NAME)',
            'MARKETING_VERSION': '0.1.0',
            'CURRENT_PROJECT_VERSION': '1',
            'CODE_SIGN_STYLE': 'Automatic',
            'GENERATE_INFOPLIST_FILE': 'YES',
            'INFOPLIST_KEY_CFBundleDisplayName': 'GradeCrew',
            'INFOPLIST_KEY_UILaunchScreen_Generation': 'YES',
            'INFOPLIST_KEY_UIApplicationSceneManifest_Generation': 'YES',
            'INFOPLIST_KEY_UIApplicationSupportsIndirectInputEvents': 'YES',
            'INFOPLIST_KEY_UISupportedInterfaceOrientations_iPhone': 'UIInterfaceOrientationPortrait UIInterfaceOrientationLandscapeLeft UIInterfaceOrientationLandscapeRight',
            'INFOPLIST_KEY_UISupportedInterfaceOrientations_iPad': 'UIInterfaceOrientationPortrait UIInterfaceOrientationPortraitUpsideDown UIInterfaceOrientationLandscapeLeft UIInterfaceOrientationLandscapeRight',
            'TARGETED_DEVICE_FAMILY': '1,2',
            'SUPPORTED_PLATFORMS': 'iphoneos iphonesimulator',
            'SUPPORTS_MACCATALYST': 'NO',
            'LD_RUNPATH_SEARCH_PATHS': '$(inherited) @executable_path/Frameworks',
        },
    ))

project_list = obj('project-configs', isa='XCConfigurationList', buildConfigurations=project_configs, defaultConfigurationIsVisible='0', defaultConfigurationName='Release')
target_list = obj('target-configs', isa='XCConfigurationList', buildConfigurations=target_configs, defaultConfigurationIsVisible='0', defaultConfigurationName='Release')
target = obj(
    'target',
    isa='PBXNativeTarget',
    name='GradeCrew',
    productName='GradeCrew',
    productReference=product,
    productType='com.apple.product-type.application',
    buildConfigurationList=target_list,
    buildPhases=[sources, frameworks, resources],
    buildRules=[],
    dependencies=[],
)
project = obj(
    'project',
    isa='PBXProject',
    attributes={'LastUpgradeCheck': '1600', 'BuildIndependentTargetsInParallel': 'YES'},
    buildConfigurationList=project_list,
    compatibilityVersion='Xcode 14.0',
    developmentRegion='de',
    knownRegions=['de', 'en', 'Base'],
    mainGroup=main,
    productRefGroup=products,
    projectDirPath='',
    projectRoot='',
    targets=[target],
)

def encode(value):
    if isinstance(value, dict):
        return '{\n' + ''.join(f'{encode(k)} = {encode(v)};\n' for k, v in value.items()) + '}'
    if isinstance(value, list):
        return '(\n' + ''.join(encode(v) + ',\n' for v in value) + ')'
    return json.dumps(str(value), ensure_ascii=False)

project_dir = ROOT / 'GradeCrewTeacher.xcodeproj'
project_dir.mkdir(exist_ok=True)
(project_dir / 'project.pbxproj').write_text(
    '// !$*UTF8*$!\n' + encode({
        'archiveVersion': '1',
        'classes': {},
        'objectVersion': '56',
        'objects': objects,
        'rootObject': project,
    }) + '\n'
)

ref = f'<BuildableReference BuildableIdentifier="primary" BlueprintIdentifier="{target}" BuildableName="GradeCrew.app" BlueprintName="GradeCrew" ReferencedContainer="container:GradeCrewTeacher.xcodeproj"/>'
xml = f'''<?xml version="1.0" encoding="UTF-8"?>
<Scheme LastUpgradeVersion="1600" version="1.3">
<BuildAction parallelizeBuildables="YES" buildImplicitDependencies="YES"><BuildActionEntries><BuildActionEntry buildForTesting="YES" buildForRunning="YES" buildForProfiling="YES" buildForArchiving="YES" buildForAnalyzing="YES">{ref}</BuildActionEntry></BuildActionEntries></BuildAction>
<LaunchAction buildConfiguration="Debug" selectedDebuggerIdentifier="Xcode.DebuggerFoundation.Debugger.LLDB" selectedLauncherIdentifier="Xcode.IDEFoundation.Launcher.LLDB" launchStyle="0" useCustomWorkingDirectory="NO" ignoresPersistentStateOnLaunch="NO" debugDocumentVersioning="YES" allowLocationSimulation="YES"><BuildableProductRunnable runnableDebuggingMode="0">{ref}</BuildableProductRunnable></LaunchAction>
<ProfileAction buildConfiguration="Release" shouldUseLaunchSchemeArgsEnv="YES" savedToolIdentifier="" useCustomWorkingDirectory="NO" debugDocumentVersioning="YES"><BuildableProductRunnable runnableDebuggingMode="0">{ref}</BuildableProductRunnable></ProfileAction>
<AnalyzeAction buildConfiguration="Debug"/>
<ArchiveAction buildConfiguration="Release" revealArchiveInOrganizer="YES"/>
</Scheme>'''
scheme_dir = project_dir / 'xcshareddata' / 'xcschemes'
scheme_dir.mkdir(parents=True, exist_ok=True)
(scheme_dir / 'GradeCrew.xcscheme').write_text(xml)

assert source_paths
assert all(source.is_file() for source in source_paths)
assert any(source.name == 'GradeCrewTeacherApp.swift' for source in source_paths)
assert any(source.name == 'GradeCrewDesignTokens.swift' for source in source_paths)
print(f'GradeCrew Teacher Xcode project generated: {len(source_paths)} shared/native Swift sources.')

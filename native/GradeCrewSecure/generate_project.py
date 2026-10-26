"""Regenerate the dependency-free Xcode project. No credentials, network or packages."""
from pathlib import Path
import hashlib, json, re
from xml.sax.saxutils import escape
ROOT = Path(__file__).resolve().parent
release_version = json.loads((ROOT/'Config/ReleaseVersion.json').read_text())['marketingVersion']
if not isinstance(release_version,str) or not re.fullmatch(r'[0-9]+(?:\.[0-9]+){0,2}',release_version):
    raise ValueError('Invalid Secure marketing version')
objects = {}
def ident(name): return hashlib.sha256(name.encode()).hexdigest()[:24].upper()
def obj(key_name, **values):
    key = ident(key_name); objects[key] = values; return key
files=[]; builds=[]
for path in sorted((ROOT/'Sources').glob('*.swift')):
    ref=obj(path.name, isa='PBXFileReference', lastKnownFileType='sourcecode.swift', path='Sources/'+path.name, sourceTree='<group>')
    files.append(ref);builds.append(obj('build-'+path.name, isa='PBXBuildFile', fileRef=ref))
product=obj('product', isa='PBXFileReference', explicitFileType='wrapper.application', path='GradeCrewSecure.app', sourceTree='BUILT_PRODUCTS_DIR')
products=obj('products', isa='PBXGroup', children=[product], name='Products', sourceTree='<group>')
asset=obj('assets', isa='PBXFileReference', lastKnownFileType='folder.assetcatalog', path='Resources/Assets.xcassets', sourceTree='<group>')
asset_build=obj('build-assets', isa='PBXBuildFile', fileRef=asset)
exam=obj('exam', isa='PBXFileReference', lastKnownFileType='folder', path='Resources/Exam', sourceTree='<group>')
exam_build=obj('build-exam', isa='PBXBuildFile', fileRef=exam)
privacy=obj('privacy', isa='PBXFileReference', lastKnownFileType='text.xml', path='Resources/PrivacyInfo.xcprivacy', sourceTree='<group>')
privacy_build=obj('build-privacy', isa='PBXBuildFile', fileRef=privacy)
legal=obj('legal', isa='PBXFileReference', lastKnownFileType='folder', path='Resources/Legal', sourceTree='<group>')
legal_build=obj('build-legal', isa='PBXBuildFile', fileRef=legal)
main=obj('main', isa='PBXGroup', children=files+[asset,exam,privacy,legal,products], sourceTree='<group>')
sources=obj('sources', isa='PBXSourcesBuildPhase', buildActionMask='2147483647', files=builds, runOnlyForDeploymentPostprocessing='0')
frameworks=obj('frameworks', isa='PBXFrameworksBuildPhase', buildActionMask='2147483647', files=[], runOnlyForDeploymentPostprocessing='0')
resources=obj('resources', isa='PBXResourcesBuildPhase', buildActionMask='2147483647', files=[asset_build,exam_build,privacy_build,legal_build], runOnlyForDeploymentPostprocessing='0')
project_configs=[]; target_configs=[]
for name in ['Debug','Release','AACLab','AACLabDistribution','SecureStaging','SecureLive']:
    debug=name in ('Debug','AACLab')
    project_configs.append(obj('project-'+name, isa='XCBuildConfiguration', name=name, buildSettings={
        'SDKROOT':'iphoneos','IPHONEOS_DEPLOYMENT_TARGET':'17.0','CLANG_ENABLE_MODULES':'YES',
        'SWIFT_VERSION':'5.0','SWIFT_OPTIMIZATION_LEVEL':'-Onone' if debug else '-O',
        'SWIFT_ACTIVE_COMPILATION_CONDITIONS': {'AACLab':'DEBUG AAC_LAB','AACLabDistribution':'AAC_LAB','SecureStaging':'SECURE_STAGING GRADECREW_STAGING SECURE_PERSONAL_ACCESS','SecureLive':'SECURE_STAGING','Debug':'DEBUG'}.get(name,''),
        'DEBUG_INFORMATION_FORMAT':'dwarf' if debug else 'dwarf-with-dsym',
        'ENABLE_TESTABILITY':'YES' if debug else 'NO'}))
    settings={'PRODUCT_BUNDLE_IDENTIFIER':'de.gradecrew.secure','PRODUCT_NAME':'$(TARGET_NAME)',
        'MARKETING_VERSION':'0.1.0','CURRENT_PROJECT_VERSION':'1','CODE_SIGN_STYLE':'Automatic',
        'ASSETCATALOG_COMPILER_APPICON_NAME':'AppIcon',
        'INFOPLIST_KEY_ITSAppUsesNonExemptEncryption':'NO',
        'GENERATE_INFOPLIST_FILE':'YES','INFOPLIST_KEY_CFBundleDisplayName':'GradeCrew Secure',
        'INFOPLIST_KEY_UILaunchScreen_Generation':'YES','INFOPLIST_KEY_UIApplicationSceneManifest_Generation':'YES',
        'INFOPLIST_KEY_UIApplicationSupportsIndirectInputEvents':'YES',
        'INFOPLIST_KEY_UISupportedInterfaceOrientations_iPad':'UIInterfaceOrientationPortrait UIInterfaceOrientationPortraitUpsideDown UIInterfaceOrientationLandscapeLeft UIInterfaceOrientationLandscapeRight',
        'INFOPLIST_KEY_UISupportedInterfaceOrientations_iPhone':'UIInterfaceOrientationPortrait UIInterfaceOrientationLandscapeLeft UIInterfaceOrientationLandscapeRight',
        'TARGETED_DEVICE_FAMILY':'1,2','SUPPORTED_PLATFORMS':'iphoneos iphonesimulator',
        'SUPPORTS_MACCATALYST':'NO','SUPPORTS_MAC_DESIGNED_FOR_IPHONE_IPAD':'NO',
        'LD_RUNPATH_SEARCH_PATHS':'$(inherited) @executable_path/Frameworks'}
    if name in ('AACLab','AACLabDistribution','SecureStaging','SecureLive'):
        settings['CODE_SIGN_ENTITLEMENTS']='Config/AACLab.entitlements'
        settings['INFOPLIST_KEY_CFBundleDisplayName']='GradeCrew AAC Lab'
        settings['CURRENT_PROJECT_VERSION']='2'
        if name=='AACLabDistribution': settings['MARKETING_VERSION']='0.2.0'
        if name in ('SecureStaging','SecureLive'):
            settings['MARKETING_VERSION']=release_version
            settings['INFOPLIST_KEY_CFBundleDisplayName']='GradeCrew Secure'
            settings['INFOPLIST_FILE']='Config/LiveInfo.plist' if name=='SecureLive' else 'Config/StagingInfo.plist'
            if name=='SecureStaging':
                settings['PRODUCT_BUNDLE_IDENTIFIER']='de.gradecrew.secure.test2026'
                settings['INFOPLIST_KEY_CFBundleDisplayName']='Secure Test'
                settings['ASSETCATALOG_COMPILER_APPICON_NAME']='TestAppIcon'
    target_configs.append(obj('target-'+name,isa='XCBuildConfiguration',name=name,buildSettings=settings))
pl=obj('project-configs',isa='XCConfigurationList',buildConfigurations=project_configs,defaultConfigurationIsVisible='0',defaultConfigurationName='Release')
tl=obj('target-configs',isa='XCConfigurationList',buildConfigurations=target_configs,defaultConfigurationIsVisible='0',defaultConfigurationName='Release')
target=obj('target',isa='PBXNativeTarget',name='GradeCrewSecure',productName='GradeCrewSecure',productReference=product,productType='com.apple.product-type.application',buildConfigurationList=tl,buildPhases=[sources,frameworks,resources],buildRules=[],dependencies=[])
project=obj('project',isa='PBXProject',attributes={'LastUpgradeCheck':'1600','BuildIndependentTargetsInParallel':'YES'},buildConfigurationList=pl,compatibilityVersion='Xcode 14.0',developmentRegion='de',knownRegions=['de','en','Base'],mainGroup=main,productRefGroup=products,projectDirPath='',projectRoot='',targets=[target])
def encode(value):
    if isinstance(value,dict):return '{\n'+''.join(f'{encode(k)} = {encode(v)};\n' for k,v in value.items())+'}'
    if isinstance(value,list):return '(\n'+''.join(encode(v)+',\n' for v in value)+')'
    return json.dumps(str(value),ensure_ascii=False)
p=ROOT/'GradeCrewSecure.xcodeproj';p.mkdir(exist_ok=True)
(p/'project.pbxproj').write_text('// !$*UTF8*$!\n'+encode({'archiveVersion':'1','classes':{},'objectVersion':'56','objects':objects,'rootObject':project})+'\n')
for name,config in [('GradeCrew Secure','SecureLive'),('GradeCrew AAC Lab','AACLab'),('GradeCrew Secure Staging','SecureStaging')]:
    ref=f'<BuildableReference BuildableIdentifier="primary" BlueprintIdentifier="{target}" BuildableName="GradeCrewSecure.app" BlueprintName="GradeCrewSecure" ReferencedContainer="container:GradeCrewSecure.xcodeproj"/>'
    xml=f'''<?xml version="1.0" encoding="UTF-8"?>
<Scheme LastUpgradeVersion="1600" version="1.3">
<BuildAction parallelizeBuildables="YES" buildImplicitDependencies="YES"><BuildActionEntries><BuildActionEntry buildForTesting="YES" buildForRunning="YES" buildForProfiling="YES" buildForArchiving="YES" buildForAnalyzing="YES">{ref}</BuildActionEntry></BuildActionEntries></BuildAction>
<LaunchAction buildConfiguration="{config}" selectedDebuggerIdentifier="{'' if name=='GradeCrew AAC Lab' else 'Xcode.DebuggerFoundation.Debugger.LLDB'}" selectedLauncherIdentifier="{'Xcode.IDEFoundation.Launcher.PosixSpawn' if name=='GradeCrew AAC Lab' else 'Xcode.IDEFoundation.Launcher.LLDB'}" launchStyle="0" useCustomWorkingDirectory="NO" ignoresPersistentStateOnLaunch="NO" debugDocumentVersioning="YES" allowLocationSimulation="YES"><BuildableProductRunnable runnableDebuggingMode="0">{ref}</BuildableProductRunnable></LaunchAction>
<ProfileAction buildConfiguration="Release" shouldUseLaunchSchemeArgsEnv="YES" savedToolIdentifier="" useCustomWorkingDirectory="NO" debugDocumentVersioning="YES"><BuildableProductRunnable runnableDebuggingMode="0">{ref}</BuildableProductRunnable></ProfileAction>
<AnalyzeAction buildConfiguration="Debug"/>
<ArchiveAction buildConfiguration="{'AACLabDistribution' if name=='GradeCrew AAC Lab' else ('SecureStaging' if name=='GradeCrew Secure Staging' else 'SecureLive')}" revealArchiveInOrganizer="YES"/>
</Scheme>'''
    folder=p/'xcshareddata/xcschemes';folder.mkdir(parents=True,exist_ok=True)
    (folder/f'{name}.xcscheme').write_text(xml)
# Structural checks: all IDs resolve and every source is represented once.
assert len(files)==len(list((ROOT/'Sources').glob('*.swift')))
assert all((ROOT/objects[ref]['path']).is_file() for ref in files)
assert all(objects[c]['buildSettings'].get('CODE_SIGN_ENTITLEMENTS') is None for c in target_configs[:2])
print(f'Xcode project generated: {len(files)} sources, 6 configurations, 3 shared schemes.')

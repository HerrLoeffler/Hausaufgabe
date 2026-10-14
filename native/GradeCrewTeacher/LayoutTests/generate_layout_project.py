"""Generate an isolated, unsigned layout-test host from the real Teacher sources."""
from pathlib import Path
import runpy

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
ns = runpy.run_path(str(ROOT / 'generate_project.py'))
obj, objects, encode = ns['obj'], ns['objects'], ns['encode']
main, products = ns['main'], ns['products']
refs, builds = [], []
for name in ['LayoutHostApp.swift']:
    path = f'LayoutTests/{name}'
    ref = obj(path, isa='PBXFileReference', lastKnownFileType='sourcecode.swift', path=path, sourceTree='<group>')
    refs.append(ref)
    builds.append(obj('build-' + path, isa='PBXBuildFile', fileRef=ref))
# Compile exactly the shipping views, replacing only the networked application entry.
app_source = ns['ident']('build-Sources/GradeCrewTeacherApp.swift')
sources = obj('layout-host-sources', isa='PBXSourcesBuildPhase', buildActionMask='2147483647', files=[b for b in ns['builds'] if b != app_source] + builds, runOnlyForDeploymentPostprocessing='0')
webref = obj('layout-web', isa='PBXFileReference', lastKnownFileType='folder', path='LayoutTests/GeneratedWeb', sourceTree='<group>')
webbuild = obj('build-layout-web', isa='PBXBuildFile', fileRef=webref)
snapshotref = obj('snapshot-samples', isa='PBXFileReference', lastKnownFileType='folder', path='LayoutTests/SnapshotSamples', sourceTree='<group>')
snapshotbuild = obj('build-snapshot-samples', isa='PBXBuildFile', fileRef=snapshotref)
resources = obj('layout-resources', isa='PBXResourcesBuildPhase', buildActionMask='2147483647', files=objects[ns['resources']]['files'] + [webbuild, snapshotbuild], runOnlyForDeploymentPostprocessing='0')
host_product = obj('layout-host-product', isa='PBXFileReference', explicitFileType='wrapper.application', path='GradeCrewLayoutHost.app', sourceTree='BUILT_PRODUCTS_DIR')
host_configs = []
for name in ['Debug', 'Release']:
    settings = dict(objects[ns['target_configs'][0]]['buildSettings'])
    settings.update(PRODUCT_BUNDLE_IDENTIFIER='de.gradecrew.layoutchecks', PRODUCT_MODULE_NAME='GradeCrewLayoutHost', PRODUCT_NAME='GradeCrewLayoutHost', SWIFT_ACTIVE_COMPILATION_CONDITIONS='DEBUG GRADECREW_LAYOUT_TESTS', ENABLE_TESTABILITY='YES', CODE_SIGNING_ALLOWED='NO')
    host_configs.append(obj('layout-host-' + name, isa='XCBuildConfiguration', name=name, buildSettings=settings))
host_list = obj('layout-host-configs', isa='XCConfigurationList', buildConfigurations=host_configs, defaultConfigurationIsVisible='0', defaultConfigurationName='Debug')
host = obj('layout-host', isa='PBXNativeTarget', name='GradeCrewLayoutHost', productName='GradeCrewLayoutHost', productReference=host_product, productType='com.apple.product-type.application', buildConfigurationList=host_list, buildPhases=[sources, ns['frameworks'], resources], buildRules=[], dependencies=[])
testrefs, testbuilds = [], []
for source in sorted(HERE.glob('*Tests.swift')):
    path = f'LayoutTests/{source.name}'
    ref = obj(path, isa='PBXFileReference', lastKnownFileType='sourcecode.swift', path=path, sourceTree='<group>')
    testrefs.append(ref)
    testbuilds.append(obj('build-' + path, isa='PBXBuildFile', fileRef=ref))
test_sources = obj('layout-test-sources', isa='PBXSourcesBuildPhase', buildActionMask='2147483647', files=testbuilds, runOnlyForDeploymentPostprocessing='0')
test_configs = []
for name in ['Debug', 'Release']:
    test_configs.append(obj('layout-tests-' + name, isa='XCBuildConfiguration', name=name, buildSettings={'PRODUCT_BUNDLE_IDENTIFIER':'de.gradecrew.layoutchecks.tests', 'PRODUCT_NAME':'GradeCrewLayoutChecks', 'GENERATE_INFOPLIST_FILE':'YES', 'TEST_HOST':'$(BUILT_PRODUCTS_DIR)/GradeCrewLayoutHost.app/GradeCrewLayoutHost', 'BUNDLE_LOADER':'$(TEST_HOST)', 'LD_RUNPATH_SEARCH_PATHS':'$(inherited) @executable_path/Frameworks @loader_path/Frameworks', 'CODE_SIGNING_ALLOWED':'NO', 'SWIFT_VERSION':'5.0', 'TARGETED_DEVICE_FAMILY':'1,2'}))
test_list = obj('layout-tests-configs', isa='XCConfigurationList', buildConfigurations=test_configs, defaultConfigurationIsVisible='0', defaultConfigurationName='Debug')
proxy = obj('layout-host-proxy', isa='PBXContainerItemProxy', containerPortal=ns['project'], proxyType='1', remoteGlobalIDString=host, remoteInfo='GradeCrewLayoutHost')
dependency = obj('layout-host-dependency', isa='PBXTargetDependency', target=host, targetProxy=proxy)
test_product = obj('layout-test-product', isa='PBXFileReference', explicitFileType='wrapper.cfbundle', path='GradeCrewLayoutChecks.xctest', sourceTree='BUILT_PRODUCTS_DIR')
tests = obj('layout-tests', isa='PBXNativeTarget', name='GradeCrewLayoutChecks', productName='GradeCrewLayoutChecks', productReference=test_product, productType='com.apple.product-type.bundle.unit-test', buildConfigurationList=test_list, buildPhases=[test_sources], buildRules=[], dependencies=[dependency])
objects[main]['children'] += refs + testrefs + [webref, snapshotref]
objects[products]['children'] = [host_product, test_product]
objects[ns['project']]['targets'] = [host, tests]
project_dir = ROOT / 'GradeCrewLayoutChecks.xcodeproj'
project_dir.mkdir(exist_ok=True)
(project_dir / 'project.pbxproj').write_text('// !$*UTF8*$!\n' + encode({'archiveVersion':'1','classes':{},'objectVersion':'56','objects':objects,'rootObject':ns['project']}) + '\n')
def ref(target, name, product):
    return f'<BuildableReference BuildableIdentifier="primary" BlueprintIdentifier="{target}" BuildableName="{product}" BlueprintName="{name}" ReferencedContainer="container:GradeCrewLayoutChecks.xcodeproj"/>'
hostref, testref = ref(host,'GradeCrewLayoutHost','GradeCrewLayoutHost.app'), ref(tests,'GradeCrewLayoutChecks','GradeCrewLayoutChecks.xctest')
scheme_dir = project_dir / 'xcshareddata/xcschemes'
scheme_dir.mkdir(parents=True,exist_ok=True)
(scheme_dir / 'GradeCrewLayoutChecks.xcscheme').write_text(f'''<?xml version="1.0" encoding="UTF-8"?>
<Scheme LastUpgradeVersion="1600" version="1.3"><BuildAction parallelizeBuildables="YES" buildImplicitDependencies="YES"><BuildActionEntries><BuildActionEntry buildForTesting="YES" buildForRunning="YES" buildForProfiling="NO" buildForArchiving="NO" buildForAnalyzing="YES">{hostref}</BuildActionEntry><BuildActionEntry buildForTesting="YES" buildForRunning="NO" buildForProfiling="NO" buildForArchiving="NO" buildForAnalyzing="YES">{testref}</BuildActionEntry></BuildActionEntries></BuildAction><TestAction buildConfiguration="Debug" selectedDebuggerIdentifier="Xcode.DebuggerFoundation.Debugger.LLDB" selectedLauncherIdentifier="Xcode.IDEFoundation.Launcher.LLDB" shouldUseLaunchSchemeArgsEnv="YES"><Testables><TestableReference skipped="NO">{testref}</TestableReference></Testables></TestAction><LaunchAction buildConfiguration="Debug"><BuildableProductRunnable runnableDebuggingMode="0">{hostref}</BuildableProductRunnable></LaunchAction></Scheme>''')
print('Layout test host generated: real native views + XCTest + offline WebKit fixtures.')

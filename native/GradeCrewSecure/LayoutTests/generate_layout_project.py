"""Separate test host, compiling the actual Secure views without the shipping app entry."""
from pathlib import Path
import runpy, shutil
HERE=Path(__file__).resolve().parent;ROOT=HERE.parent
shutil.copy2(HERE/'layout-policy.json',HERE/'Fixtures/layout-policy.json')
ns=runpy.run_path(str(ROOT/'generate_project.py'));obj,objects,encode=ns['obj'],ns['objects'],ns['encode']
refs=[];builds=[];tests=[];testrefs=[]
for p in sorted(HERE.glob('*.swift')):
    ref=obj('layout-'+p.name,isa='PBXFileReference',lastKnownFileType='sourcecode.swift',path='LayoutTests/'+p.name,sourceTree='<group>');refs.append(ref)
    b=obj('layout-build-'+p.name,isa='PBXBuildFile',fileRef=ref)
    (builds if p.name in ('SecureLayoutHostApp.swift','SecureLifecycleUIHost.swift') else tests).append(b)
entry=ns['ident']('build-GradeCrewSecureApp.swift')
sources=obj('layout-sources',isa='PBXSourcesBuildPhase',buildActionMask='2147483647',files=[b for b in ns['builds'] if b!=entry]+builds,runOnlyForDeploymentPostprocessing='0')
fixtures=obj('layout-fixtures',isa='PBXFileReference',lastKnownFileType='folder',path='LayoutTests/Fixtures',sourceTree='<group>')
resources=obj('layout-resources',isa='PBXResourcesBuildPhase',buildActionMask='2147483647',files=objects[ns['resources']]['files']+[obj('layout-fixtures-build',isa='PBXBuildFile',fileRef=fixtures)],runOnlyForDeploymentPostprocessing='0')
product=obj('layout-product',isa='PBXFileReference',explicitFileType='wrapper.application',path='GradeCrewSecureLayoutHost.app',sourceTree='BUILT_PRODUCTS_DIR')
settings=dict(objects[ns['target_configs'][0]]['buildSettings']);settings.update(PRODUCT_BUNDLE_IDENTIFIER='de.gradecrew.secure.layoutchecks',PRODUCT_MODULE_NAME='GradeCrewSecureLayoutHost',PRODUCT_NAME='GradeCrewSecureLayoutHost',CODE_SIGNING_ALLOWED='NO',ENABLE_TESTABILITY='YES',SWIFT_ACTIVE_COMPILATION_CONDITIONS='DEBUG SECURE_LAYOUT_TESTS')
c=obj('layout-config',isa='XCBuildConfiguration',name='Debug',buildSettings=settings)
cl=obj('layout-configs',isa='XCConfigurationList',buildConfigurations=[c],defaultConfigurationIsVisible='0',defaultConfigurationName='Debug')
host=obj('layout-host',isa='PBXNativeTarget',name='GradeCrewSecureLayoutHost',productName='GradeCrewSecureLayoutHost',productReference=product,productType='com.apple.product-type.application',buildConfigurationList=cl,buildPhases=[sources,ns['frameworks'],resources],buildRules=[],dependencies=[])
tp=obj('layout-test-product',isa='PBXFileReference',explicitFileType='wrapper.cfbundle',path='GradeCrewSecureLayoutTests.xctest',sourceTree='BUILT_PRODUCTS_DIR')
tc=obj('layout-test-config',isa='XCBuildConfiguration',name='Debug',buildSettings={'PRODUCT_BUNDLE_IDENTIFIER':'de.gradecrew.secure.layoutchecks.tests','PRODUCT_NAME':'GradeCrewSecureLayoutTests','GENERATE_INFOPLIST_FILE':'YES','TEST_HOST':'$(BUILT_PRODUCTS_DIR)/GradeCrewSecureLayoutHost.app/GradeCrewSecureLayoutHost','BUNDLE_LOADER':'$(TEST_HOST)','LD_RUNPATH_SEARCH_PATHS':'$(inherited) @executable_path/Frameworks @loader_path/Frameworks','CODE_SIGNING_ALLOWED':'NO','SWIFT_VERSION':'5.0','TARGETED_DEVICE_FAMILY':'1,2'})
tl=obj('layout-test-configs',isa='XCConfigurationList',buildConfigurations=[tc],defaultConfigurationIsVisible='0',defaultConfigurationName='Debug')
ts=obj('layout-test-sources',isa='PBXSourcesBuildPhase',buildActionMask='2147483647',files=tests,runOnlyForDeploymentPostprocessing='0')
dep=obj('layout-test-dep',isa='PBXTargetDependency',target=host)
target=obj('layout-tests',isa='PBXNativeTarget',name='GradeCrewSecureLayoutTests',productReference=tp,productType='com.apple.product-type.bundle.unit-test',buildConfigurationList=tl,buildPhases=[ts,ns['frameworks']],buildRules=[],dependencies=[dep])
objects[ns['project']]['targets']=[host,target];objects[ns['main']]['children']+=refs+[fixtures];objects[ns['products']]['children'] +=[product,tp]
project=ROOT/'GradeCrewSecureLayoutChecks.xcodeproj';project.mkdir(exist_ok=True)
(project/'project.pbxproj').write_text('// !$*UTF8*$!\n'+encode({'archiveVersion':'1','classes':{},'objectVersion':'56','objects':objects,'rootObject':ns['project']})+'\n')
def reference(id,name):return f'<BuildableReference BuildableIdentifier="primary" BlueprintIdentifier="{id}" BuildableName="{name}" BlueprintName="{name.split(".")[0]}" ReferencedContainer="container:GradeCrewSecureLayoutChecks.xcodeproj"/>'
hr=reference(host,'GradeCrewSecureLayoutHost.app');tr=reference(target,'GradeCrewSecureLayoutTests.xctest')
d=project/'xcshareddata/xcschemes';d.mkdir(parents=True,exist_ok=True)
(d/'GradeCrew Secure Layout Checks.xcscheme').write_text(f'''<?xml version="1.0" encoding="UTF-8"?><Scheme LastUpgradeVersion="1600" version="1.3"><BuildAction parallelizeBuildables="YES" buildImplicitDependencies="YES"><BuildActionEntries><BuildActionEntry buildForTesting="YES" buildForRunning="YES" buildForProfiling="NO" buildForArchiving="NO" buildForAnalyzing="YES">{hr}</BuildActionEntry><BuildActionEntry buildForTesting="YES" buildForRunning="NO" buildForProfiling="NO" buildForArchiving="NO" buildForAnalyzing="YES">{tr}</BuildActionEntry></BuildActionEntries></BuildAction><TestAction buildConfiguration="Debug" selectedDebuggerIdentifier="Xcode.DebuggerFoundation.Debugger.LLDB" selectedLauncherIdentifier="Xcode.IDEFoundation.Launcher.LLDB" shouldUseLaunchSchemeArgsEnv="YES"><Testables><TestableReference skipped="NO">{tr}</TestableReference></Testables></TestAction><LaunchAction buildConfiguration="Debug"><BuildableProductRunnable runnableDebuggingMode="0">{hr}</BuildableProductRunnable></LaunchAction></Scheme>''')

# Real taps through the shipping SwiftUI root; fixtures stay in this test host.
uiref=obj('return-ui-source',isa='PBXFileReference',lastKnownFileType='sourcecode.swift',path='LayoutTests/UITests/SecureReturnUITests.swift',sourceTree='<group>')
uib=obj('return-ui-build',isa='PBXBuildFile',fileRef=uiref)
uip=obj('return-ui-product',isa='PBXFileReference',explicitFileType='wrapper.cfbundle',path='GradeCrewSecureReturnUITests.xctest',sourceTree='BUILT_PRODUCTS_DIR')
uic=obj('return-ui-config',isa='XCBuildConfiguration',name='Debug',buildSettings={'PRODUCT_BUNDLE_IDENTIFIER':'de.gradecrew.secure.returnuitests','PRODUCT_NAME':'GradeCrewSecureReturnUITests','GENERATE_INFOPLIST_FILE':'YES','TEST_TARGET_NAME':'GradeCrewSecureLayoutHost','CODE_SIGNING_ALLOWED':'NO','SWIFT_VERSION':'5.0','TARGETED_DEVICE_FAMILY':'1,2','IPHONEOS_DEPLOYMENT_TARGET':'17.0'})
uil=obj('return-ui-configs',isa='XCConfigurationList',buildConfigurations=[uic],defaultConfigurationIsVisible='0',defaultConfigurationName='Debug')
uis=obj('return-ui-sources',isa='PBXSourcesBuildPhase',buildActionMask='2147483647',files=[uib],runOnlyForDeploymentPostprocessing='0')
uit=obj('return-ui-target',isa='PBXNativeTarget',name='GradeCrewSecureReturnUITests',productReference=uip,productType='com.apple.product-type.bundle.ui-testing',buildConfigurationList=uil,buildPhases=[uis,ns['frameworks']],buildRules=[],dependencies=[dep])
objects[ns['project']]['targets'].append(uit)
objects[ns['main']]['children'].append(uiref);objects[ns['products']]['children'].append(uip)
(project/'project.pbxproj').write_text('// !$*UTF8*$!\n'+encode({'archiveVersion':'1','classes':{},'objectVersion':'56','objects':objects,'rootObject':ns['project']})+'\n')
scheme=d/'GradeCrew Secure Layout Checks.xcscheme'
uitref=reference(uit,'GradeCrewSecureReturnUITests.xctest')
scheme.write_text(scheme.read_text().replace('</BuildActionEntries>',f'<BuildActionEntry buildForTesting="YES" buildForRunning="NO" buildForProfiling="NO" buildForArchiving="NO" buildForAnalyzing="NO">{uitref}</BuildActionEntry></BuildActionEntries>').replace('</Testables>',f'<TestableReference skipped="NO">{uitref}</TestableReference></Testables>'))

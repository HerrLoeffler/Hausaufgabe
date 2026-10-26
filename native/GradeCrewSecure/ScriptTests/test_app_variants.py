import runpy,unittest,plistlib
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
class VariantTests(unittest.TestCase):
 def test_generated_apps_are_separate_and_use_same_sources(self):
  ns=runpy.run_path(str(ROOT/'generate_project.py'))
  settings={ns['objects'][k]['name']:ns['objects'][k]['buildSettings'] for k in ns['target_configs']}
  live,test=settings['SecureLive'],settings['SecureStaging']
  self.assertEqual(live['PRODUCT_BUNDLE_IDENTIFIER'],'de.gradecrew.secure')
  self.assertEqual(test['PRODUCT_BUNDLE_IDENTIFIER'],'de.gradecrew.secure.test2026')
  self.assertEqual(test['INFOPLIST_KEY_CFBundleDisplayName'],'Secure Test')
  self.assertEqual(live['INFOPLIST_KEY_CFBundleDisplayName'],'GradeCrew Secure')
  self.assertNotEqual(live['ASSETCATALOG_COMPILER_APPICON_NAME'],test['ASSETCATALOG_COMPILER_APPICON_NAME'])
  project_configs={ns['objects'][k]['name']:ns['objects'][k]['buildSettings'] for k in ns['project_configs']}
  self.assertIn('SECURE_PERSONAL_ACCESS',project_configs['SecureStaging']['SWIFT_ACTIVE_COMPILATION_CONDITIONS'])
  self.assertNotIn('SECURE_PERSONAL_ACCESS',project_configs['SecureLive']['SWIFT_ACTIVE_COMPILATION_CONDITIONS'],'Live classroom endpoint is not deployed; do not expose a broken login')
  for config in (live,test):
   self.assertEqual(config['TARGETED_DEVICE_FAMILY'],'1,2')
   self.assertEqual(config['CODE_SIGN_ENTITLEMENTS'],'Config/AACLab.entitlements')
 def test_hosts_and_deep_links_remain_bound_to_each_app(self):
  live=plistlib.loads((ROOT/'Config/LiveInfo.plist').read_bytes())
  test=plistlib.loads((ROOT/'Config/StagingInfo.plist').read_bytes())
  self.assertEqual(live['GradeCrewProjectID'],'hausaufgabe-staging')
  self.assertEqual(live['GradeCrewPublicHost'],'gradecrew.de')
  self.assertEqual(test['GradeCrewProjectID'],'gradecrew-staging-2026')
  self.assertEqual(test['GradeCrewPublicHost'],'gradecrew-staging-2026.web.app')
  self.assertEqual(live['CFBundleURLTypes'][0]['CFBundleURLSchemes'],['gradecrew-secure'])
  self.assertEqual(test['CFBundleURLTypes'][0]['CFBundleURLSchemes'],['gradecrew-secure-test2026'])
if __name__=='__main__':unittest.main()

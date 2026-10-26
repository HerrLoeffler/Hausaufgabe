import importlib.util, unittest
from pathlib import Path
spec=importlib.util.spec_from_file_location('release_target',Path(__file__).parents[1]/'release_target.py')
class ReleaseTargetTests(unittest.TestCase):
 def test_staging_dispatch_is_bound_to_2026_and_keeps_live_push_default(self):
  self.assertTrue(spec.origin and Path(spec.origin).exists(),'release target policy exists')
  module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
  stage=module.select('workflow_dispatch','staging2026')
  self.assertEqual(stage,{'SECURE_SCHEME':'GradeCrew Secure Staging','SECURE_CONFIGURATION':'SecureStaging','SECURE_VERIFY_MODE':'staging-exam','SECURE_PROJECT':'gradecrew-staging-2026'})
  self.assertEqual(module.select('push','','refs/heads/feature/native-live-staging-20261018')['SECURE_CONFIGURATION'],'SecureLive')
  self.assertEqual(module.select('workflow_dispatch','live')['SECURE_PROJECT'],'hausaufgabe-staging')
  with self.assertRaises(ValueError):module.select('workflow_dispatch','production-anywhere')
  with self.assertRaises(ValueError):module.select('unknown','live')

 def test_only_own_test_branch_push_selects_2026_and_unknown_push_fails_closed(self):
  module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
  self.assertEqual(module.select('push','','refs/heads/feature/classroom-secure-access-20261022')['SECURE_PROJECT'],'gradecrew-staging-2026')
  for ref in ('refs/heads/main','refs/heads/feature/classroom-secure-access-20261022-typo',''):
   with self.assertRaises(ValueError):module.select('push','staging2026',ref)

 def test_isolated_variant_branch_can_only_build_new_test_app(self):
  module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
  values=module.select('push','','refs/heads/feature/secure-live-test-20261026')
  self.assertEqual(values['SECURE_PROJECT'],'gradecrew-staging-2026')
  self.assertEqual(values['SECURE_CONFIGURATION'],'SecureStaging')

import datetime
import importlib.util
import pathlib
import unittest

PATH = pathlib.Path(__file__).resolve().parents[1] / 'verify_distribution.py'
spec = importlib.util.spec_from_file_location('distribution', PATH)
distribution = importlib.util.module_from_spec(spec)
spec.loader.exec_module(distribution)

class DistributionTests(unittest.TestCase):
    def fixture(self):
        app = {'application-identifier': 'TESTTEAM01.de.gradecrew.secure',
               'com.apple.developer.team-identifier': 'TESTTEAM01',
               'com.apple.developer.automatic-assessment-configuration': True,
               'get-task-allow': False}
        profile = {'Entitlements': dict(app), 'ExpirationDate': datetime.datetime(2099, 1, 1)}
        info = {'CFBundleIdentifier': 'de.gradecrew.secure', 'CFBundleDisplayName': 'GradeCrew AAC Lab'}
        return app, profile, info
    def test_valid_distribution(self):
        distribution.validate(*self.fixture(), 'TESTTEAM01')
    def test_staging_exam_requires_its_own_release_mode(self):
        app, profile, info = self.fixture()
        info['CFBundleDisplayName'] = 'GradeCrew Secure'
        with self.assertRaises(ValueError): distribution.validate(app, profile, info, 'TESTTEAM01', 'staging-exam')
        info['GradeCrewSecureMode'] = 'staging-exam'
        distribution.validate(app, profile, info, 'TESTTEAM01', 'staging-exam')

    def test_live_exam_refuses_test_configuration(self):
        app, profile, info = self.fixture()
        info['CFBundleDisplayName'] = 'GradeCrew Secure'
        info['GradeCrewSecureMode'] = 'staging-exam'
        with self.assertRaises(ValueError): distribution.validate(app, profile, info, 'TESTTEAM01', 'live-exam')
        info['GradeCrewSecureMode'] = 'live-exam'
        distribution.validate(app, profile, info, 'TESTTEAM01', 'live-exam')

    def test_missing_aac_rejected(self):
        app, profile, info = self.fixture()
        profile['Entitlements'].pop('com.apple.developer.automatic-assessment-configuration')
        with self.assertRaises(ValueError): distribution.validate(app, profile, info, 'TESTTEAM01')
    def test_debuggable_signature_rejected(self):
        app, profile, info = self.fixture()
        app['get-task-allow'] = True
        with self.assertRaises(ValueError): distribution.validate(app, profile, info, 'TESTTEAM01')
    def test_teacher_bundle_rejected(self):
        app, profile, info = self.fixture()
        info['CFBundleIdentifier'] = 'de.gradecrew'
        with self.assertRaises(ValueError): distribution.validate(app, profile, info, 'TESTTEAM01')
    def test_unrelated_profile_rejected(self):
        app, profile, info = self.fixture()
        profile['Entitlements']['application-identifier'] = 'TESTTEAM01.de.other'
        with self.assertRaises(ValueError): distribution.validate(app, profile, info, 'TESTTEAM01')

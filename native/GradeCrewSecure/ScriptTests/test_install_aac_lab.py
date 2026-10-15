"""Exercise installer decisions, replacing only external Apple CLI processes."""
import datetime
import os
import pathlib
import plistlib
import subprocess
import tempfile
import unittest

INSTALLER = pathlib.Path(__file__).resolve().parents[1] / 'install-aac-lab.sh'

class InstallerTests(unittest.TestCase):
    def run_installer(self, mutate=None):
        with tempfile.TemporaryDirectory() as folder:
            root = pathlib.Path(folder)
            binary = root / 'bin'
            binary.mkdir()
            app = root / 'gradecrew-aac-signed/Build/Products/AACLab-iphoneos/GradeCrewSecure.app'
            app.mkdir(parents=True)
            (app / 'embedded.mobileprovision').touch()
            entitlement = {
                'com.apple.developer.automatic-assessment-configuration': True,
                'com.apple.developer.team-identifier': 'TESTTEAM01',
                'application-identifier': 'TESTTEAM01.de.gradecrew.secure'
            }
            profile = {'Entitlements': dict(entitlement), 'ExpirationDate': datetime.datetime(2099, 1, 1)}
            if mutate:
                mutate(entitlement, profile)
            for name, value in [('app.plist', entitlement), ('profile.plist', profile)]:
                (root / name).write_bytes(plistlib.dumps(value))
            commands = {
                'xcodebuild': '#!/bin/sh\nexit 0\n',
                'swift': '#!/bin/sh\nexit 0\n',
                'security': '#!/bin/sh\ncat "$LAB_FIXTURES/profile.plist"\n',
                'codesign': '#!/bin/sh\nif [ "$1" = "-d" ]; then cat "$LAB_FIXTURES/app.plist"; fi\n',
                'xcrun': '#!/bin/sh\necho "$*" >> "$LAB_FIXTURES/device-actions"\n'
            }
            for name, body in commands.items():
                path = binary / name
                path.write_text(body)
                path.chmod(0o755)
            env = dict(os.environ, PATH=str(binary) + ':' + os.environ['PATH'], TMPDIR=str(root) + '/', LAB_FIXTURES=str(root))
            result = subprocess.run(['bash', str(INSTALLER), 'TESTTEAM01', 'test-device'], env=env, text=True, capture_output=True)
            actions = root / 'device-actions'
            return result, actions.read_text() if actions.exists() else ''

    def test_valid_profile_installs_and_opens_lab(self):
        result, actions = self.run_installer()
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn('device install app', actions)
        self.assertIn('device process launch --device test-device de.gradecrew.secure', actions)

    def test_missing_profile_aac_prevents_install(self):
        result, actions = self.run_installer(lambda a, p: p['Entitlements'].pop('com.apple.developer.automatic-assessment-configuration'))
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(actions, '')

    def test_missing_app_aac_prevents_install(self):
        result, actions = self.run_installer(lambda a, p: a.update({'com.apple.developer.automatic-assessment-configuration': False}))
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(actions, '')

    def test_wrong_bundle_prevents_install(self):
        result, actions = self.run_installer(lambda a, p: a.update({'application-identifier': 'TESTTEAM01.de.gradecrew'}))
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(actions, '')

    def test_wrong_team_prevents_install(self):
        result, actions = self.run_installer(lambda a, p: p['Entitlements'].update({'com.apple.developer.team-identifier': 'OTHERTEAM1'}))
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(actions, '')

    def test_expired_profile_prevents_install(self):
        result, actions = self.run_installer(lambda a, p: p.update({'ExpirationDate': datetime.datetime(2001, 1, 1)}))
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(actions, '')

if __name__ == '__main__':
    unittest.main()

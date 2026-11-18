"""Verify the actual generated brand images, not generator source text."""
import hashlib
from pathlib import Path
import subprocess
import sys
import unittest

ROOT = Path(__file__).resolve().parents[1]

@unittest.skipUnless(sys.platform == 'darwin', 'Brand rendering requires macOS AppKit')
class BrandAssetTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        subprocess.run(['swift', str(ROOT / 'prepare_assets.swift')], check=True,
                       stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)

    def test_live_entry_logo_matches_the_selected_app_icon(self):
        assets = ROOT / 'Resources/Assets.xcassets'
        selected = (ROOT / 'Brand/SecureAppIcon.png').read_bytes()
        store = (assets / 'AppIcon.appiconset/AppIcon.png').read_bytes()
        entry = (assets / 'GradeCrewLogo.imageset/logo.png').read_bytes()
        self.assertEqual(hashlib.sha256(store).digest(), hashlib.sha256(selected).digest())
        self.assertEqual(hashlib.sha256(entry).digest(), hashlib.sha256(selected).digest(),
                         'The entry screen must use the selected through-C lock identity too')

    def test_separate_test_identity_is_preserved(self):
        assets = ROOT / 'Resources/Assets.xcassets'
        test_icon = (assets / 'TestAppIcon.appiconset/AppIcon.png').read_bytes()
        test_entry = (assets / 'GradeCrewTestLogo.imageset/logo.png').read_bytes()
        selected = (ROOT / 'Brand/SecureAppIcon.png').read_bytes()
        self.assertEqual(test_entry, test_icon)
        self.assertNotEqual(test_entry, selected)

if __name__ == '__main__':
    unittest.main()

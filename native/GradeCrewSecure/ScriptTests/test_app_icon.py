"""Packaging regression: Secure must not silently revert to the Teacher icon."""
import pathlib
import struct
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[1]

class AppIconTests(unittest.TestCase):
    def test_selected_icon_is_opaque_store_size(self):
        data = (ROOT / 'Brand/SecureAppIcon.png').read_bytes()
        self.assertEqual(data[:8], b'\x89PNG\r\n\x1a\n')
        self.assertEqual(struct.unpack('>II', data[16:24]), (1024, 1024))
        self.assertEqual(data[25], 2, 'Store asset must be opaque RGB PNG')

    def test_prepared_secure_icon_is_selected_artwork_and_brand_logo_stays_separate(self):
        assets = ROOT / 'Resources/Assets.xcassets'
        selected = (ROOT / 'Brand/SecureAppIcon.png').read_bytes()
        prepared = (assets / 'AppIcon.appiconset/AppIcon.png').read_bytes()
        in_app_logo = (assets / 'GradeCrewLogo.imageset/logo.png').read_bytes()
        self.assertEqual(prepared, selected, 'Asset preparation replaced selected Secure artwork')
        self.assertNotEqual(prepared, in_app_logo, 'Secure Store icon reused the shared Teacher logo')

if __name__ == '__main__':
    unittest.main()

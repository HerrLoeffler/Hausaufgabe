import pathlib,unittest
ROOT=pathlib.Path(__file__).resolve().parents[3]
class ReleaseGates(unittest.TestCase):
    def test_testflight_depends_on_real_full_native_and_two_web_devices(self):
        source=(ROOT/'.github/workflows/gradecrew-secure-testflight.yml').read_text()
        self.assertIn('needs: [layout-native, layout-web]',source)
        self.assertIn('device: [mini, large]',source)
        self.assertIn('--suite full --layer native',source)
        self.assertIn('--suite full --layer web',source)
        self.assertIn('if: always()',source)

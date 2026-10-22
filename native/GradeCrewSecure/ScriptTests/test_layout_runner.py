import importlib.util, json, pathlib, tempfile, unittest
ROOT=pathlib.Path(__file__).resolve().parents[1]
path=ROOT/'LayoutTests/run_layout_checks.py'
module=None
if path.exists():
    spec=importlib.util.spec_from_file_location('secure_layout_runner',path)
    module=importlib.util.module_from_spec(spec); spec.loader.exec_module(module)
class LayoutReports(unittest.TestCase):
    def setUp(self): self.assertIsNotNone(module,'Secure report validation is not implemented')
    def test_missing_and_empty_reports_fail(self):
        with tempfile.TemporaryDirectory() as folder:
            result=module.validate_reports(pathlib.Path(folder),['native-entry'])
            self.assertFalse(result['passed'])
            self.assertTrue(result['issues'])
    def test_missing_picture_and_recorded_issue_fail(self):
        with tempfile.TemporaryDirectory() as folder:
            p=pathlib.Path(folder);(p/'native-entry.json').write_text(json.dumps({'caseID':'native-entry','issues':['clipped input']}))
            self.assertFalse(module.validate_reports(p,['native-entry'])['passed'])
    def test_exact_complete_report_passes_and_wrong_case_fails(self):
        with tempfile.TemporaryDirectory() as folder:
            p=pathlib.Path(folder)
            (p/'native-entry.json').write_text(json.dumps({'caseID':'native-entry','viewport':{'width':744,'height':1133},'issues':[]}))
            (p/'native-entry.png').write_bytes(b'\x89PNG\r\n\x1a\n'+b'fixture')
            self.assertTrue(module.validate_reports(p,['native-entry'])['passed'])
            self.assertFalse(module.validate_reports(p,['native-other'])['passed'])
    def test_full_case_lists_are_complete_and_unique(self):
        policy=json.loads((ROOT/'LayoutTests/layout-policy.json').read_text())
        native=module.case_list(policy,'full','native'); web=module.case_list(policy,'full','web')
        self.assertEqual(len(native),900);self.assertEqual(len(set(native)),900)
        self.assertEqual(len(web),360);self.assertEqual(len(set(web)),360)
    def test_same_simulator_cannot_run_two_layout_suites_at_once(self):
        self.assertTrue(hasattr(module,'lock_device'),'Simulator execution must be serialized')
        with tempfile.TemporaryDirectory() as folder:
            first=module.lock_device('test-device',pathlib.Path(folder))
            with self.assertRaises(RuntimeError): module.lock_device('test-device',pathlib.Path(folder))
            first.close()
            module.lock_device('test-device',pathlib.Path(folder)).close()
    def test_phone_suite_covers_portrait_landscape_and_keyboard_without_replacing_ipads(self):
        policy=json.loads((ROOT/'LayoutTests/layout-policy.json').read_text())
        phone=module.case_list(policy,'phone','native')
        self.assertTrue(any('phone-small-portrait' in case for case in phone))
        self.assertTrue(any('phone-landscape' in case for case in phone))
        self.assertTrue(any('phone-keyboard' in case for case in phone))
        self.assertTrue(any('accessibility3-completed' in case for case in phone))
        self.assertEqual(len(phone),540)
        self.assertEqual(len(module.case_list(policy,'phone','web')),216)
        self.assertEqual(len(module.case_list(policy,'full','native')),900)

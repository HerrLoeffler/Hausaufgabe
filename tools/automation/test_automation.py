import hashlib
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest


def module(name):
    spec = importlib.util.spec_from_file_location(name, Path(__file__).with_name(name + '.py'))
    value = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(value)
    return value


preview, task = module('preview'), module('task')


class AutomationTests(unittest.TestCase):
    def test_manifest_rejects_wrong_project_commit_tampering_and_extras(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            public = root / 'public'
            public.mkdir()
            files = {'index.html': b'<html>preview</html>', 'firebase-config.js': b'projectId: "hausaufgabe-staging"'}
            for name, content in files.items():
                (public / name).write_bytes(content)
            release = {'project': 'hausaufgabe-staging', 'commit': 'a' * 40, 'files': {name: hashlib.sha256(content).hexdigest() for name, content in files.items()}}
            manifest = public / 'release.json'
            manifest.write_text(json.dumps(release))
            self.assertEqual(preview.manifest(root, 'a' * 40), release)
            with self.assertRaises(ValueError):
                preview.manifest(root, 'b' * 40)
            release['project'] = 'hausaufgabe-40294'
            manifest.write_text(json.dumps(release))
            with self.assertRaises(ValueError):
                preview.manifest(root, 'a' * 40)
            release['project'] = 'hausaufgabe-staging'
            manifest.write_text(json.dumps(release))
            (public / 'index.html').write_text('changed')
            with self.assertRaises(ValueError):
                preview.manifest(root, 'a' * 40)
            (public / 'index.html').write_bytes(files['index.html'])
            (public / 'unexpected.txt').write_text('unlisted')
            with self.assertRaises(ValueError):
                preview.manifest(root, 'a' * 40)

    def test_only_expected_preview_origin(self):
        allowed = 'https://hausaufgabe-staging--gradecrew-app-integration-abc123.web.app'
        self.assertEqual(preview.preview_url({'result': {'site': {'url': allowed}}}), allowed)
        for url in ['https://hausaufgabe-40294.web.app', 'https://hausaufgabe-staging.web.app', allowed + '.evil.example', 'http://' + allowed[8:]]:
            with self.assertRaises(ValueError):
                preview.preview_url({'url': url})

    def test_tasks_require_valid_id_pinned_commit_and_allowed_branch(self):
        valid = {'id': 'tutorial-1', 'base_branch': 'feature/gradecrew-app-integration', 'base_sha': 'a' * 40, 'goal': 'Fix', 'acceptance': 'Test', 'constraints': 'Scope'}
        self.assertEqual(task.validate(valid, 'tutorial-1'), valid)
        for field, value in [('base_branch', 'main'), ('base_sha', 'HEAD'), ('goal', ''), ('id', 'x\nbase_sha=evil')]:
            with self.assertRaises(ValueError):
                task.validate({**valid, field: value}, 'tutorial-1')
        with self.assertRaises(ValueError):
            task.validate(valid, '../tutorial-1')


if __name__ == '__main__':
    unittest.main()

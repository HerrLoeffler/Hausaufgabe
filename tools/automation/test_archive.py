import io
import json
from pathlib import Path
import tempfile
import unittest
import zipfile
import hashlib
from archive import extract, package
import archive


class SnapshotTests(unittest.TestCase):
    def test_snapshot_accepts_trusted_main_staging_push_and_rejects_other_origins(self):
        run = {'name': 'Automatic staging preview', 'status': 'completed', 'conclusion': 'success',
               'path': '.github/workflows/staging-preview.yml', 'event': 'push', 'head_branch': 'main',
               'repository': {'full_name': archive.REPO}, 'head_repository': {'full_name': archive.REPO}}
        archive.trusted_preview(run)
        archive.trusted_preview(run | {'event': 'workflow_run'})
        for change in [{'event': 'pull_request'}, {'head_branch': 'other'}, {'name': 'Fake preview'},
                       {'head_repository': {'full_name': 'other/repo'}}, {'status': 'in_progress'}]:
            with self.subTest(change=change), self.assertRaises(ValueError):
                archive.trusted_preview(run | change)
    def test_zip_rejects_path_escape(self):
        data = io.BytesIO()
        with zipfile.ZipFile(data, 'w') as z:
            z.writestr('../escape', 'bad')
        with tempfile.TemporaryDirectory() as directory:
            with self.assertRaises(ValueError):
                extract(data.getvalue(), Path(directory))

    def test_package_restores_exact_files_and_never_claims_live_approval(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            public = root / 'build/public'
            public.mkdir(parents=True)
            files = {'index.html': b'preview', 'firebase-config.js': b'projectId: "hausaufgabe-staging"'}
            for name, content in files.items():
                (public / name).write_bytes(content)
            sha = 'a' * 40
            (public / 'release.json').write_text(json.dumps({'project':'hausaufgabe-staging', 'commit':sha, 'files': {n:hashlib.sha256(c).hexdigest() for n,c in files.items()}}))
            receipt = {'project':'hausaufgabe-staging','channel':'gradecrew-app-integration','commit':sha,'ci_run':'123','verified_files':2,'url':'https://hausaufgabe-staging--gradecrew-app-integration-abc.web.app'}
            package(root/'build', receipt, '123', root/'out')
            extract((root/'out/hosting-snapshot.zip').read_bytes(), root/'restored')
            for name, content in files.items():
                self.assertEqual((root/'restored/public'/name).read_bytes(), content)
            record = json.loads((root/'restored/snapshot.json').read_text())
            self.assertFalse(record['production_approved'])
            self.assertFalse(record['database_backup'])
            with self.assertRaises(ValueError):
                package(root/'build', {**receipt,'ci_run':'456'}, '123', root/'out2')
            (public/'index.html').write_text('modified')
            with self.assertRaises(ValueError):
                package(root/'build', receipt, '123', root/'out3')


if __name__ == '__main__':
    unittest.main()

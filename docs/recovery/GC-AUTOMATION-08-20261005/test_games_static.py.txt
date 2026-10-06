"""Real physical package boundary tests, without Firebase or provider credentials."""
import hashlib
from pathlib import Path
import tempfile
import unittest
from tools.automation.test_profiles import GAME_FILES

class PackageTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory(); self.addCleanup(self.tmp.cleanup)
        self.public = Path(self.tmp.name)/'public'; self.public.mkdir()
        for name,text in {'index.html':'<!doctype html><script src="app.js"></script><link href="styles.css" rel="stylesheet">',
                          'styles.css':'body{color:green}', 'app.js':'console.log("safe");'}.items():
            (self.public/name).write_text(text)
        try:
            from tools.automation import games_static
        except ImportError:
            self.fail('Immutable Games package validator is missing')
        self.g = games_static

    def test_exact_three_file_package_binds_source_and_physical_bytes(self):
        manifest = self.g.validate_games_package(self.public,'a'*40,[GAME_FILES[2]])
        self.assertEqual(manifest['sourceSha'],'a'*40)
        self.assertEqual(manifest['schemaVersion'],1)
        self.assertEqual(list(manifest['files']),['app.js','index.html','styles.css'])
        self.assertEqual(manifest['files']['app.js'],hashlib.sha256(b'console.log("safe");').hexdigest())
        old = manifest['packageDigest']; (self.public/'app.js').write_text('console.log("changed");')
        self.assertNotEqual(self.g.validate_games_package(self.public,'a'*40,[GAME_FILES[2]])['packageDigest'],old)

    def test_missing_extra_symlink_alias_and_unrelated_changes_rejected(self):
        for kind in ['missing','extra','symlink','alias']:
            with self.subTest(kind=kind):
                app = self.public/'app.js'; original = app.read_bytes()
                extra = self.public/('firebase.json' if kind=='extra' else 'аpp.js')
                try:
                    if kind in ('missing','symlink'): app.unlink()
                    if kind=='symlink': app.symlink_to(self.public/'styles.css')
                    if kind in ('extra','alias'): extra.write_text('{}')
                    with self.assertRaises(ValueError): self.g.validate_games_package(self.public,'a'*40,[GAME_FILES[2]])
                finally:
                    if app.is_symlink(): app.unlink()
                    app.write_bytes(original)
                    if extra.exists(): extra.unlink()
        for changed in [['functions/main.js'],['lab/escape-expedition/../app.js'],['lab/escape-expedition//app.js']]:
            with self.subTest(changed=changed), self.assertRaises(ValueError): self.g.validate_games_package(self.public,'a'*40,changed)

    def test_remote_references_in_each_language_are_rejected(self):
        for name,text in [('index.html','<script src="//evil.example/code.js"></script>'),
            ('app.js','fetch("https://evil.example/");'),('styles.css','@import "https://evil.example/x.css";'),
            ('styles.css','body{background:url(//evil.example/image)}')]:
            file = self.public/name; before=file.read_text()
            with self.subTest(name=name,text=text):
                try:
                    file.write_text(text)
                    with self.assertRaises(ValueError): self.g.validate_games_package(self.public,'a'*40,[GAME_FILES[0]])
                finally: file.write_text(before)

    def test_failed_or_skipped_tests_cannot_create_success_report(self):
        package=self.g.validate_games_package(self.public,'a'*40,[GAME_FILES[2]])
        for result in ['failure','skipped','cancelled','unknown']:
            with self.subTest(result=result),self.assertRaises(ValueError):
                self.g.games_test_report('a'*40,'b'*40,'c'*64,package,result)
        report=self.g.games_test_report('a'*40,'b'*40,'c'*64,package,'success')
        self.assertEqual(report['packageDigest'],package['packageDigest'])
        with self.assertRaises(ValueError): self.g.games_test_report('d'*40,'b'*40,'c'*64,package,'success')

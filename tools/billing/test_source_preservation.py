import importlib.util
from pathlib import Path
import unittest
from unittest.mock import patch
import tempfile
import json

spec = importlib.util.spec_from_file_location('preserve', Path(__file__).with_name('build_preserved_package.py'))
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class PreservationTests(unittest.TestCase):
    def test_keeps_independent_runtime_features(self):
        base = 'import core\nfunction worker() {\n  const quiz = makeQuiz();\n  save(quiz);\n}\n'
        source = base.replace('import core\n', 'import core\nimport visualTask\n').replace('  save(quiz);', '  recipe(quiz);\n  save(quiz);')
        target = base.replace('  const quiz = makeQuiz();', '  const quiz = makeQuiz({billing: true});').replace('  save(quiz);', '  finishPaidQuiz(quiz);')
        result = module.apply_delta(source, base, target)
        self.assertIn('import visualTask', result)
        self.assertIn('recipe(quiz)', result)
        self.assertIn('makeQuiz({billing: true})', result)
        self.assertIn('finishPaidQuiz(quiz)', result)

    def test_inserts_at_unique_context_instead_of_stale_line_number(self):
        base = 'start\nunique anchor\nend\n'
        target = 'start\nunique anchor\nbilling();\nend\n'
        source = 'new runtime header\n' + base
        self.assertEqual(module.apply_delta(source, base, target), 'new runtime header\n' + target)

    def test_changed_or_ambiguous_removed_code_fails_closed(self):
        for source in ['different\n', 'old\nold\n']:
            with self.assertRaises(ValueError):
                module.apply_delta(source, 'old\n', 'new\n')

    def test_changed_first_method_cannot_redirect_its_patch_to_a_matching_second_method(self):
        base = 'function first() {\n  old();\n}\nfunction second() {\n  old();\n}\n'
        target = base.replace('  old();', '  guard();', 1)
        source = base.replace('  old();', '  newerFeature();', 1)
        with self.assertRaises(ValueError):
            module.apply_delta(source, base, target)

    def test_build_pins_one_commit_and_the_specific_cloud_entrypoint(self):
        commit = 'de877de811629cfc35d33a73e19b771bc6b7d010'
        with tempfile.TemporaryDirectory(prefix='gc-billing-preserve-') as directory:
            root = Path(directory); source = root / 'source'; source.mkdir()
            files = {}
            for name in ['index.js', 'main.js', 'lib/access.js', 'lib/job-slots.js', 'package.json', 'package-lock.json']:
                content = module.git_file(module.BASE, 'functions/' + name)
                target = source / name; target.parent.mkdir(parents=True, exist_ok=True); target.write_bytes(content)
                files[name] = module.sha(content)
            receipt = {'source': {'bucket': module.BUCKET, 'object': 'generateTest/function-source.zip', 'generation': '123'}, 'files': files, 'excludedFileCount': 0, 'archiveSha256': 'fixture'}
            (source / 'SOURCE_RECEIPT.json').write_text(json.dumps(receipt))
            with self.assertRaises(ValueError):
                module.build(source, root / 'wrong', project='gradecrew-staging-2026', generation='123', kind='functions', release_ref=commit, entry_point='startAiTestJob')
            with patch.object(module, 'resolve_commit', return_value=commit) as resolved, patch.object(module, 'git_file', wraps=module.git_file) as reads:
                report = module.build(source, root / 'valid', project='gradecrew-staging-2026', generation='123', kind='functions', release_ref='HEAD', entry_point='generateTest')
                resolved.assert_called_once_with('HEAD')
                self.assertEqual(report['releaseCommit'], commit)
                self.assertTrue(all(call.args[0] in {module.BASE, commit} for call in reads.call_args_list))

    def test_unchanged_source_roundtrips_exactly(self):
        for base, target in [('a\nb\nc\n', 'a\nx\nc\n'), ('a\nb\n', 'x\na\nb\n'), ('a\nb\n', 'a\nb\nx\n')]:
            self.assertEqual(module.apply_delta(base, base, target), target)

    def test_path_and_cloud_target_guards(self):
        for path in ['../secrets.json', '/tmp/private', '.env', 'lib/../../other.js']:
            with self.assertRaises(ValueError):
                module.relative_source_path(path)
        self.assertEqual(module.relative_source_path('lib/worker.js'), Path('lib/worker.js'))
        with self.assertRaises(ValueError):
            module.build(Path('/tmp'), Path('/tmp/not-created-by-this-test'), project='hausaufgabe-staging', generation='1', kind='functions', release_ref='HEAD', entry_point='generateTest')


if __name__ == '__main__':
    unittest.main()

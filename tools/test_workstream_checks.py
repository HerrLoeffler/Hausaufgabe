"""Real CLI contracts: false readiness, skipped briefs and source reads must fail."""
import copy
import hashlib
import json
import pathlib
import subprocess
import sys
import tempfile
import unittest

CLI = pathlib.Path(__file__).with_name('workstream_checks.py')


def brief():
    return {
        'schema_version': 1, 'task_id': 'TASK-1', 'parent_task_id': 'FAMILY-1',
        'goal': 'Validate a current small authorized package', 'owner': 'specialist-1',
        'priorities': ['Preserve existing ownership and history'],
        'source': {'branch': 'main', 'commit': 'a' * 40},
        'scope': {'allowed_paths': ['tools/example.py'], 'excluded_actions': ['deploy']},
        'acceptance': ['CLI shows the hand-checked frontier'],
        'decisions': [
            {'id': 'known', 'status': 'answered', 'blocked_by': [], 'claimed_owner': 'specialist-1', 'answer': 'Source read'},
            {'id': 'ready', 'status': 'open', 'blocked_by': ['known'], 'claimed_owner': 'specialist-1', 'answer': None},
            {'id': 'unclaimed', 'status': 'open', 'blocked_by': ['known'], 'claimed_owner': None, 'answer': None},
            {'id': 'blocked', 'status': 'open', 'blocked_by': ['ready'], 'claimed_owner': 'specialist-2', 'answer': None}
        ],
        'recovery': {'next_step': 'Review this package', 'operations': [],
                     'budget': {'mode': 'no_paid_calls', 'reservation_ids': [], 'attempt_history_ref': 'workstreams/history.md'}},
        'review_axes': {axis: {'status': 'pending', 'reviewer': None, 'evidence': []}
                        for axis in ('requirements', 'standards')}
    }


class CLIContractTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = pathlib.Path(self.temp.name)
        (self.root / 'workstreams').mkdir()
        self.handoff = self.root / 'workstreams' / 'task.md'
        self.registry = self.root / 'workstreams' / 'registry.json'

    def run_cli(self, data=None, document=None, entry=None, require=True):
        data = copy.deepcopy(data if data is not None else brief())
        text = document if document is not None else '# Human handoff\n\n```gradecrew-brief\n' + json.dumps(data) + '\n```\n'
        if not self.handoff.is_symlink():
            self.handoff.write_text(text, encoding='utf-8')
        entry = entry if entry is not None else {'id': 'task', 'handoff': 'workstreams/task.md', 'checkProfile': 'workflow-brief-v1'}
        self.registry.write_text(json.dumps({'workstreams': [entry]}), encoding='utf-8')
        before = {p: hashlib.sha256(p.read_bytes()).hexdigest() for p in (self.registry, self.handoff)}
        command = [sys.executable, str(CLI), '--registry', str(self.registry)]
        if require:
            command += ['--require-task', 'TASK-1']
        result = subprocess.run(command, text=True, capture_output=True)
        after = {p: hashlib.sha256(p.read_bytes()).hexdigest() for p in before}
        self.assertEqual(after, before, 'CLI must not mutate its source or registry')
        return result

    def test_only_open_unblocked_owned_decisions_are_ready(self):
        result = self.run_cli()
        self.assertEqual(result.returncode, 0, result.stderr)
        report = json.loads(result.stdout)['briefs'][0]
        self.assertEqual(report['ready'], ['ready'])
        self.assertEqual(report['needs_owner'], ['unclaimed'])
        self.assertEqual(report['blocked'], ['blocked'])
        self.assertTrue(report['resume_safe'])

    def test_running_or_unknown_results_never_offer_resumption(self):
        for state in ('running', 'unknown'):
            with self.subTest(state=state):
                data = brief()
                data['recovery']['operations'] = [{'id': 'run-1', 'status': state, 'evidence': 'workstreams/history.md'}]
                result = self.run_cli(data)
                self.assertEqual(result.returncode, 0, result.stderr)
                report = json.loads(result.stdout)['briefs'][0]
                self.assertEqual(report['ready'], [])
                self.assertFalse(report['resume_safe'])
                self.assertEqual(report['reconcile'], ['run-1'])

    def test_unknown_dependencies_duplicate_ids_and_cycles_fail(self):
        cases = []
        unknown = brief(); unknown['decisions'][1]['blocked_by'] = ['nonexistent']; cases.append(unknown)
        duplicate = brief(); duplicate['decisions'].append(copy.deepcopy(duplicate['decisions'][1])); cases.append(duplicate)
        cycle = brief(); cycle['decisions'][1]['blocked_by'] = ['blocked']; cases.append(cycle)
        for data in cases:
            with self.subTest(data=data['decisions'][-1]['id']):
                result = self.run_cli(data)
                self.assertEqual(result.returncode, 1, result.stderr)
                self.assertNotIn('"ready"', result.stdout)

    def test_missing_deleted_or_ambiguous_brief_fails_opted_in_task(self):
        good = '```gradecrew-brief\n' + json.dumps(brief()) + '\n```\n'
        for text in ('# Legacy only', '```gradecrew-brief\n{}\n```', good + good, '```gradecrew-brief\n{broken}\n```'):
            with self.subTest(text=text[:20]):
                result = self.run_cli(document=text)
                self.assertEqual(result.returncode, 1, result.stderr)

    def test_invalid_source_owner_acceptance_and_self_review_fail(self):
        cases = []
        bad = brief(); bad['source']['commit'] = 'old-unverified'; cases.append(bad)
        bad = brief(); bad['owner'] = ' '; cases.append(bad)
        bad = brief(); bad['acceptance'] = []; cases.append(bad)
        bad = brief(); bad['priorities'] = []; cases.append(bad)
        bad = brief(); bad['decisions'][1]['claimed_owner'] = ' '; cases.append(bad)
        bad = brief(); bad['review_axes']['requirements'] = {'status': 'pass', 'reviewer': 'specialist-1', 'evidence': ['some-log']}; cases.append(bad)
        for data in cases:
            with self.subTest(keys=list(data)):
                self.assertEqual(self.run_cli(data).returncode, 1)

    def test_legacy_handoffs_compatible_but_required_profile_cannot_disappear(self):
        legacy = {'id': 'legacy', 'handoff': 'workstreams/task.md'}
        result = self.run_cli(document='# Existing human handoff', entry=legacy, require=False)
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(json.loads(result.stdout)['briefs'], [])
        result = self.run_cli(document='# Existing human handoff', entry=legacy)
        self.assertEqual(result.returncode, 1)

    def test_external_handoff_or_symlink_is_rejected(self):
        outside = self.root / 'outside.md'
        outside.write_text('private external source', encoding='utf-8')
        for pointer in ('../outside.md', 'outside.md', str(outside)):
            result = self.run_cli(entry={'id': 'task', 'handoff': pointer, 'checkProfile': 'workflow-brief-v1'})
            self.assertEqual(result.returncode, 1)
            self.assertNotIn('private external source', result.stdout + result.stderr)
        self.handoff.unlink()
        self.handoff.symlink_to(outside)
        result = self.run_cli()
        self.assertEqual(result.returncode, 1)
        self.assertNotIn('private external source', result.stdout + result.stderr)

    def test_no_paid_mode_cannot_silently_reset_existing_reservations(self):
        data = brief()
        data['recovery']['budget']['reservation_ids'] = ['already-reserved']
        result = self.run_cli(data)
        self.assertEqual(result.returncode, 1)

    def test_routine_brief_without_questions_offers_no_artificial_work(self):
        data = brief()
        data['decisions'] = []
        result = self.run_cli(data)
        self.assertEqual(result.returncode, 0, result.stderr)
        report = json.loads(result.stdout)['briefs'][0]
        self.assertEqual(report['ready'], [])
        self.assertEqual(report['needs_owner'], [])
        self.assertEqual(report['blocked'], [])


if __name__ == '__main__':
    unittest.main()

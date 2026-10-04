import copy
import base64
import json
import os
from pathlib import Path
import tempfile
import unittest
from types import SimpleNamespace
from unittest.mock import patch

from tools.automation import recovery as r, pipeline as p

A, B, C = 'a' * 40, 'b' * 40, 'c' * 40
D = 'd' * 40
TASK = {'id': 'pilot-ui', 'base_sha': A, 'base_branch': p.WEB, 'risk': 'web-ui',
        'goal': 'Fix button', 'acceptance': '44px and visible focus', 'constraints': 'Only CSS',
        'allowed_files': ['coach.css'], 'context_files': [], 'validation_profile': 'web-combined-v1',
        'cost_profile': 'small-web-v1', 'max_cost_usd': 2.55}
PUB = {'head': B, 'base': A, 'tree': C, 'branch': 'automation/worker/pilot-ui/run-1', 'pr': 78}
REQUEST = {'id': 'permission-fix', 'taskId': TASK['id'], 'previousRequestId': 'run-1', 'runId': 9,
           'taskHash': p.digest(TASK), 'head': B, 'kind': r.KIND, 'permissionFixConfirmed': True,
           'reason': 'Martin corrected both blocked models and requested continuation'}
OLD = {'state': 'stopped', 'requestId': 'run-1', 'runId': 9, 'taskHash': p.digest(TASK),
       'publication': PUB, 'feedback': [], 'controlSha': C, 'reason': 'Original permission failure'}
RUN = {'id': 9, 'path': '.github/workflows/guardian-execution.yml', 'event': 'workflow_dispatch',
       'head_branch': 'main', 'head_sha': C, 'run_attempt': 1, 'status': 'completed', 'conclusion': 'failure',
       'head_repository': {'full_name': r.REPO}}
JOBS = [{'id': i, 'name': name, 'status': 'completed', 'conclusion': result} for i, (name, result) in enumerate([
    ('prepare', 'success'), ('build', 'success'), ('publish', 'success'), ('validate / test', 'success'),
    ('reviews (security)', 'success'), ('finalize', 'success'), ('integrate', 'skipped'),
    ('reviews (correctness)', 'failure'), ('reviews (qa)', 'failure')])]
LOGS = {7: f"RuntimeError: correctness ({p.MODELS['correctness']['model']}): HTTP 403, provider/model permission denied; reservation retained, no automatic retry",
        8: f"RuntimeError: qa ({p.MODELS['qa']['model']}): HTTP 403, provider/model permission denied; reservation retained, no automatic retry"}


class RecoveryQualificationTests(unittest.TestCase):
    def test_job_log_uses_supported_job_log_cli_and_rejects_transport_failure(self):
        with patch.object(r.subprocess, 'run', return_value=SimpleNamespace(returncode=0, stdout=LOGS[7])) as run:
            self.assertEqual(r.job_log(7), LOGS[7])
            self.assertEqual(run.call_args.args[0], ['gh', 'run', 'view', '--repo', r.REPO, '--job', '7', '--log'])
        with patch.object(r.subprocess, 'run', return_value=SimpleNamespace(returncode=1, stdout='')):
            with self.assertRaisesRegex(ValueError, 'CLI exit 1'):
                r.job_log(7)

    def qualify(self, **changes):
        values = dict(request=copy.deepcopy(REQUEST), history=[copy.deepcopy(OLD)], task=copy.deepcopy(TASK),
                      run=copy.deepcopy(RUN), jobs=copy.deepcopy(JOBS), logs=copy.deepcopy(LOGS))
        values.update(changes)
        return r.qualify(**values)

    def test_only_exact_completed_permission_failure_is_eligible(self):
        self.assertEqual(self.qualify(), OLD)
        for update in [{'run_attempt': 2}, {'head_branch': 'feature/fake'}, {'status': 'in_progress'},
                       {'head_sha': A}, {'conclusion': 'cancelled'}, {'head_repository': {'full_name': 'other/repo'}}]:
            with self.subTest(update=update), self.assertRaises(ValueError):
                self.qualify(run=RUN | update)

    def test_no_unknown_failure_review_rejection_or_changed_task(self):
        for update in [{'permissionFixConfirmed': False}, {'taskHash': 'wrong'}, {'head': A}, {'kind': 'timeout'}, {'runId': 10}]:
            with self.subTest(update=update), self.assertRaises(ValueError):
                self.qualify(request=REQUEST | update)
        for code in ('401', '404', '429', '500'):
            with self.subTest(code=code), self.assertRaises(ValueError):
                self.qualify(logs={i: s.replace('403', code) for i, s in LOGS.items()})
        with self.assertRaises(ValueError):
            self.qualify(logs=LOGS | {7: LOGS[7] + '\nRuntimeError: another error'})
        with self.assertRaises(ValueError):
            self.qualify(history=[OLD | {'feedback': [{'severity': 'blocking', 'message': 'Rejected code'}]}])
        with self.assertRaises(ValueError):
            self.qualify(history=[OLD] * 3)

    def test_no_failed_validation_or_partial_jobs(self):
        for index in (0, 1, 2, 3, 4, 5, 6):
            jobs = copy.deepcopy(JOBS)
            jobs[index]['conclusion'] = 'failure'
            with self.subTest(index=index), self.assertRaises(ValueError):
                self.qualify(jobs=jobs)
        with self.assertRaises(ValueError):
            self.qualify(jobs=JOBS + [JOBS[0]])


class RecoveryApplicationTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(); self.addCleanup(self.temp.cleanup)
        root = Path(self.temp.name)
        (root / 'automation').mkdir(); (root / 'agent-queue').mkdir()
        row = {'id': TASK['id'], 'taskId': TASK['id'], 'enabled': True, 'execution': 'pipeline-v2',
               'baseBranch': p.WEB, 'approvedSha': A, 'maxAutomaticStage': 'staging_deployed'}
        (root / 'automation/guardian-policy.json').write_text(json.dumps({'schemaVersion': 1, 'enabled': True,
             'maxAttemptsPerStage': 3, 'automaticProduction': False, 'workstreams': [row]}))
        (root / 'agent-queue/pilot-ui.json').write_text(json.dumps(TASK))
        self.ledger = {'attempts': {'pilot-ui:pipeline-v2': [copy.deepcopy(OLD)]},
                       'budgetReservations': [{'taskId': 'pilot-ui', 'day': '2026-10-03', 'reservedUsd': .85}]}
        self.events = []; self.source = A
        self.source_blob = C
        self.ancestry = 'ahead'
        self.remote_revoked = False
        patches = [patch.object(r, 'ROOT', root), patch.object(r, 'read_ledger', return_value=(self.ledger, 'blob')),
                   patch.object(r, 'api', side_effect=self.api), patch.object(r, 'write_ledger', side_effect=self.write),
                   patch.object(r, 'job_log', side_effect=lambda i: LOGS[i]),
                   patch.dict(os.environ, {'GITHUB_REPOSITORY': r.REPO, 'GITHUB_REF': 'refs/heads/main',
                        'GITHUB_RUN_ATTEMPT': '1', 'GUARDIAN_ENABLED': 'true', 'WORKER_ENABLED': 'true'})]
        for patcher in patches:
            patcher.start(); self.addCleanup(patcher.stop)

    def write(self, ledger, blob):
        self.events.append(('persist', copy.deepcopy(ledger)))
        return 'updated-blob'

    def api(self, path, method='GET', body=None):
        if method == 'POST':
            self.events.append(('dispatch', path)); return {}
        if path == 'actions/runs/9': return RUN
        if path == 'actions/runs/9/jobs?per_page=100': return {'jobs': JOBS}
        if path == 'pulls/78': return {'state': 'open', 'base': {'ref': p.WEB},
             'head': {'sha': B, 'repo': {'full_name': r.REPO}}}
        if path == 'git/commits/' + B: return {'tree': {'sha': C}, 'parents': [{'sha': A}]}
        if path == 'git/ref/heads/' + p.WEB: return {'object': {'sha': self.source}}
        if path == 'git/ref/heads/' + PUB['branch']: return {'object': {'sha': B}}
        if path == 'compare/' + A + '...' + D:
            return {'status': self.ancestry, 'merge_base_commit': {'sha': A}}
        if path == 'contents/coach.css?ref=' + A: return {'sha': C, 'type': 'file'}
        if path == 'contents/coach.css?ref=' + D: return {'sha': self.source_blob, 'type': 'file'}
        if path == 'git/ref/heads/main': return {'object': {'sha': C}}
        if path.startswith('contents/') and path.endswith('?ref=' + C):
            value = json.loads((r.ROOT / path[len('contents/'):].split('?')[0]).read_text())
            if self.remote_revoked and 'guardian-policy' in path: value['enabled'] = False
            return {'content': base64.b64encode(json.dumps(value).encode()).decode()}
        raise AssertionError(path)

    def source_update(self):
        task = TASK | {'base_sha': D}
        root = r.ROOT
        policy_path = root / 'automation/guardian-policy.json'
        policy = json.loads(policy_path.read_text())
        policy['workstreams'][0]['approvedSha'] = D
        policy_path.write_text(json.dumps(policy))
        (root / 'agent-queue/pilot-ui.json').write_text(json.dumps(task))
        self.source = D
        request = REQUEST | {'sourceUpdate': {'previousTask': copy.deepcopy(TASK),
            'approvedSha': D, 'taskHash': p.digest(task), 'selectedBlobs': {'coach.css': C}}}
        (root / 'automation/recovery-requests').mkdir(exist_ok=True)
        (root / 'automation/recovery-requests/permission-fix.json').write_text(json.dumps(request))
        return request

    def test_explicit_unchanged_source_update_retains_original_attempt_and_reservation(self):
        request = self.source_update()
        r.apply(request)
        attempt = self.ledger['attempts']['pilot-ui:pipeline-v2'][0]
        for key, value in OLD.items():
            if key not in {'state', 'reason'}:
                self.assertEqual(attempt[key], value)
        self.assertEqual(attempt['state'], 'repairable')
        self.assertEqual(self.ledger['budgetReservations'],
                         [{'taskId': 'pilot-ui', 'day': '2026-10-03', 'reservedUsd': .85}])
        self.assertEqual(self.events[1][0], 'dispatch')
        count = len(self.events)
        r.apply(request)
        self.assertEqual(len(self.events), count)

    def test_source_update_rejects_changed_context_non_descendant_or_expanded_task(self):
        request = self.source_update()
        for blob, ancestry in [(B, 'ahead'), (C, 'diverged')]:
            self.source_blob, self.ancestry = blob, ancestry
            with self.subTest(blob=blob, ancestry=ancestry), self.assertRaises(ValueError):
                r.apply(request)
            self.assertEqual(self.events, [])
        self.source_blob, self.ancestry = C, 'ahead'
        task_path = r.ROOT / 'agent-queue/pilot-ui.json'
        task = json.loads(task_path.read_text())
        for change in [{'goal': 'different goal'}, {'max_cost_usd': 16.50},
                       {'cost_profile': 'standard-v1'}, {'context_files': ['new.js']}]:
            task_path.write_text(json.dumps(task | change))
            with self.subTest(change=change), self.assertRaises(ValueError): r.apply(request)
            self.assertEqual(self.events, [])

    def test_source_update_cannot_reset_attempt_limit_or_spent_reservations(self):
        request = self.source_update()
        self.ledger['budgetReservations'] *= 3
        with self.assertRaises(ValueError): r.apply(request)
        self.assertEqual(self.events, [])
        self.ledger['budgetReservations'] = self.ledger['budgetReservations'][:1]
        self.ledger['attempts']['pilot-ui:pipeline-v2'] *= 3
        with self.assertRaises(ValueError): r.apply(request)
        self.assertEqual(self.events, [])

    def test_revoked_remote_approval_or_target_race_never_dispatches(self):
        request = self.source_update()
        self.remote_revoked = True
        with self.assertRaises(ValueError): r.apply(request)
        self.assertEqual(self.events, [])
        self.remote_revoked = False
        original = self.api
        reads = 0
        def raced(path, method='GET', body=None):
            nonlocal reads
            if path == 'git/ref/heads/' + p.WEB:
                reads += 1
                if reads > 1: return {'object': {'sha': B}}
            return original(path, method, body)
        with patch.object(r, 'api', side_effect=raced), self.assertRaises(ValueError): r.apply(request)
        self.assertEqual(self.events, [])

    def test_history_and_budget_retained_before_dispatch_and_request_single_use(self):
        r.apply(REQUEST)
        first = self.events[0][1]
        self.assertEqual(len(first['attempts']['pilot-ui:pipeline-v2']), 1)
        self.assertEqual(first['budgetReservations'], self.ledger['budgetReservations'])
        marker = first['attempts']['pilot-ui:pipeline-v2'][0]['manualRecovery']
        self.assertEqual(marker['originalState'], 'stopped')
        self.assertEqual(marker['originalReason'], OLD['reason'])
        self.assertEqual(self.events[1][0], 'dispatch')
        count = len(self.events)
        r.apply(REQUEST)
        self.assertEqual(len(self.events), count)

    def test_changed_source_or_exhausted_budget_never_mutates_or_dispatches(self):
        self.source = B
        with self.assertRaises(ValueError): r.apply(REQUEST)
        self.assertEqual(self.events, [])
        self.source = A
        self.ledger['budgetReservations'] *= 3
        with self.assertRaises(ValueError): r.apply(REQUEST)
        self.assertEqual(self.events, [])

    def test_unknown_dispatch_is_recorded_and_never_repeated(self):
        original = self.api
        def fail(path, method='GET', body=None):
            if method == 'POST': raise RuntimeError('unknown')
            return original(path, method, body)
        with patch.object(r, 'api', side_effect=fail):
            with self.assertRaises(RuntimeError): r.apply(REQUEST)
        marker = self.ledger['attempts']['pilot-ui:pipeline-v2'][0]['manualRecovery']
        self.assertEqual(marker['dispatchState'], 'unknown')
        count = len(self.events); r.apply(REQUEST)
        self.assertEqual(len(self.events), count)

    def test_recovery_workflow_rerun_cannot_unlock_an_attempt(self):
        with patch.dict(os.environ, {'GITHUB_RUN_ATTEMPT': '2'}), self.assertRaises(ValueError):
            r.apply(REQUEST)
        self.assertEqual(self.events, [])


if __name__ == '__main__': unittest.main()

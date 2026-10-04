import copy
import json
import os
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

from tools.automation import recovery as r, pipeline as p

A, B, C = 'a' * 40, 'b' * 40, 'c' * 40
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
        raise AssertionError(path)

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

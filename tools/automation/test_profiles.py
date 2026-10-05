"""Profile boundary tests: wrong target/path/grant must never acquire authority."""
import copy
import json
from pathlib import Path
import unittest
from tools.automation import pipeline as p, admit, guardian
from tools.automation.test_pipeline import TASK, A

ROOT = Path(__file__).resolve().parents[2]
GAME_TARGET = 'prototype/escape-expedition-visual-masterpiece-v1'
GAME_FILES = ['lab/escape-expedition/index.html', 'lab/escape-expedition/styles.css', 'lab/escape-expedition/app.js']

def game_task():
    from tools.automation.profiles import resolve_profile, profile_digest
    task = TASK | {'execution_profile':'games-static-preview-v1', 'profile_version':1,
        'base_branch':GAME_TARGET, 'risk':'games-static', 'allowed_files':GAME_FILES,
        'context_files':[], 'validation_profile':'games-static-v1', 'cost_profile':'module-web-v1', 'max_cost_usd':2.55}
    task['profile_digest'] = profile_digest(resolve_profile(task), ROOT)
    return task

class ProfileTests(unittest.TestCase):
    def test_game_scope_cannot_borrow_the_web_cost_profile_as_authority(self):
        task = TASK | {'base_branch':GAME_TARGET, 'risk':'games-static', 'allowed_files':GAME_FILES,
            'cost_profile':'module-web-v1', 'max_cost_usd':2.55}
        with self.assertRaises(ValueError): p.task_contract(task)

    def test_legacy_task_bytes_and_hash_remain_identical(self):
        encoded = json.dumps(TASK, sort_keys=True); before = p.digest(TASK)
        p.task_contract(TASK)
        self.assertEqual(json.dumps(TASK,sort_keys=True),encoded)
        self.assertEqual(p.digest(TASK),before)

    def test_explicit_game_profile_accepts_only_separate_existing_target(self):
        # Previously the common contract rejected every non-Web task.
        try:
            from tools.automation import profiles
        except ImportError:
            self.fail("Trusted Games profile resolver is missing")
        try:
            task = game_task()
        except ImportError:
            self.fail("Trusted Games profile resolver is missing")
        self.assertEqual(p.task_contract(task),task)
        self.assertEqual(profiles.resolve_profile(task).deployment_components,('hosting',))
        for change in [{'base_branch':p.WEB}, {'base_branch':'main'}, {'profile_version':2},
                       {'profile_version':True}, {'profile_digest':'0'*64}, {'execution_profile':'backend-v1'},
                       {'cost_profile':'small-web-v1'}, {'validation_profile':'web-combined-v1'}]:
            with self.subTest(change=change), self.assertRaises(ValueError): p.task_contract(task | change)

    def test_game_paths_cannot_expand_to_control_or_cloud(self):
        try:
            task = game_task()
        except ImportError:
            self.fail("Trusted Games profile resolver is missing")
        for path in ['functions/main.js','tools/x.js','firestore.rules','package-lock.json',
                     'lab/escape-expedition/new.js','lab/escape-expedition/../app.js',
                     'lab/escape-expedition//app.js','lab/escape-expedition/аpp.js']:
            with self.subTest(path=path), self.assertRaises(ValueError): p.task_contract(task | {'allowed_files':[path]})
        p.candidate_contract({'summary':'copy','files':[{'path':GAME_FILES[0],'content':'<!doctype html>'}]},task,'run-1')

    def test_disabled_profile_blocks_admission_before_reservation(self):
        try:
            from tools.automation.profiles import admitted_profile
        except ImportError:
            self.fail("Independent profile admission is missing")
        policy = json.loads((ROOT/'automation/guardian-policy.json').read_text())
        try:
            task = game_task()
        except ImportError:
            self.fail("Trusted Games profile resolver is missing")
        with self.assertRaisesRegex(ValueError,'disabled'): admitted_profile(task,policy)
        policy['enabledExecutionProfiles'] = ['web-ui-v1','games-static-preview-v1']
        self.assertEqual(admitted_profile(task,policy).id,'games-static-preview-v1')
        ledger = {'attempts':{}}
        grant = admit.admission(policy,task,ledger,A)
        self.assertEqual(grant['workstreams'][-1]['baseBranch'],GAME_TARGET)
        self.assertEqual(grant['workstreams'][-1]['executionProfile'],'games-static-preview-v1')
        with self.assertRaises(ValueError): admit.admission(policy,task,ledger,'b'*40)
        with self.assertRaises(ValueError): guardian.validate_policy(policy | {'enabledExecutionProfiles':['backend-v1']})

class LifecycleTests(unittest.TestCase):
    def test_profile_control_and_task_bindings_fail_before_authority(self):
        from tools.automation import profiles
        from tools.automation.test_pipeline import ATTEMPT
        task = game_task()
        attempt = copy.deepcopy(ATTEMPT) | {'taskHash':p.digest(task),'controlHash':p.control_hash(ROOT),
            'executionProfile':task['execution_profile'],'profileDigest':task['profile_digest'],
            'validationProfile':task['validation_profile']}
        try:
            checked = profiles.selected_profile(attempt,task,ROOT)
        except AttributeError:
            self.fail('Saved attempts do not yet bind the execution profile')
        self.assertEqual(checked.id,'games-static-preview-v1')
        for change in [{'controlHash':'0'*64},{'taskHash':'0'*64},{'executionProfile':'web-ui-v1'},
                       {'profileDigest':'0'*64},{'validationProfile':'web-combined-v1'}, {'approvedSha':'c'*40}]:
            with self.subTest(change=change), self.assertRaises(ValueError): profiles.selected_profile(attempt | change,task,ROOT)
        self.assertEqual(attempt['requestId'],'run-1')
        self.assertEqual(profiles.validation_workflow(checked),'guardian-games-validation.yml')

    def test_games_prepare_reads_only_its_approved_separate_target(self):
        from unittest.mock import patch
        from tools.automation import execution as e
        from tools.automation.test_pipeline import ATTEMPT
        task = game_task(); attempt = copy.deepcopy(ATTEMPT) | {'state':'reserved','runId':None}
        ledger = {'attempts':{'key':[attempt]}}
        paths = []
        def api(path,*args):
            paths.append(path)
            if path.startswith('git/ref/heads/'):
                return {'object':{'sha':A}}
            if path.startswith('git/trees/'):
                return {'tree':[{'path':f,'mode':'100644','type':'blob','sha':'b'*40,'size':20} for f in GAME_FILES]}
            if path.startswith('git/blobs/'):
                import base64
                return {'content':base64.b64encode(b'/* safe */').decode()}
            self.fail('Unexpected operation '+path)
        with patch.object(e,'approved',return_value=(ledger,'blob','key',attempt,task)), patch.object(e,'api',side_effect=api), \
             patch.object(e,'write_ledger'),patch.object(e,'save'),patch.object(e,'load',return_value={}),patch.object(e,'output'), \
             patch.dict('os.environ',{'GITHUB_RUN_ID':'9','CONTROL_SHA':'c'*40}):
            e.prepare('run-1')
        self.assertIn('git/ref/heads/'+GAME_TARGET,paths)
        self.assertNotIn('git/ref/heads/'+p.WEB,paths)

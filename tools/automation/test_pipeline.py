import base64
import copy
import datetime as dt
import json
import os
from pathlib import Path
import subprocess
import tempfile
import unittest
from unittest.mock import patch

from tools.automation import pipeline as p, execution as e, continuation as c, model_calls as m, deployment_evidence as d
from tools.automation import guardian as g
from tools.automation import admit as admission
from tools.automation import delivery
FRESH_DOCUMENTS = e.fresh_documents

A, B, C = 'a'*40, 'b'*40, 'c'*40
TASK = {'id': 'pilot-ui', 'base_sha': A, 'base_branch': p.WEB, 'risk': 'web-ui',
        'goal': 'Make coach copy clearer', 'acceptance': 'Manual next stays available', 'constraints': 'Preserve all other flows',
        'allowed_files': ['coach.js'], 'context_files': ['coach.css'], 'validation_profile': 'web-combined-v1', 'max_cost_usd': 16.5}
ROW = {'id': 'pilot', 'enabled': True, 'baseBranch': p.WEB, 'approvedSha': A, 'taskId': TASK['id'],
       'maxAutomaticStage': 'staging_deployed', 'execution': 'pipeline-v2'}
PUB = {'head': B, 'base': A, 'tree': C, 'candidateHash': 'd'*64, 'branch': 'automation/worker/pilot-ui/run-1', 'pr': 55, 'requestId': 'run-1', 'changedFiles':['coach.js']}
TESTS = {'profile': 'web-combined-v1', 'head': B, 'base': A, 'result': 'success', 'packagedFiles':['coach.js']}
ATTEMPT = {'requestId': 'run-1', 'execution': 'pipeline-v2', 'taskId': TASK['id'], 'taskHash': p.digest(TASK),
           'approvedSha': A, 'controlSha': C, 'controlHash': 'h'*64, 'state': 'running', 'runId': 9, 'publication': PUB}


def review(role, verdict='approve'):
    result = {'verdict': verdict, 'head': B, 'base': A, 'candidateHash': PUB['candidateHash'], 'findings': []}
    if verdict != 'approve':
        result['findings'] = [{'severity': 'blocking', 'path': 'coach.js', 'message': 'Next button not reachable'}]
    return {'provider': p.MODELS[role]['provider'], 'model': p.MODELS[role]['model'], 'review': result,
            'usage': {'provider': p.MODELS[role]['provider'], 'model': p.MODELS[role]['model'], 'estimatedUsd': 0.01}}


class ContractTests(unittest.TestCase):
    def test_each_of_three_reviews_is_required_and_can_veto(self):
        reviews = {role: review(role) for role in p.REVIEW_ROLES}
        for role in p.REVIEW_ROLES:
            with self.subTest(missing=role), self.assertRaises(ValueError):
                p.integration_gate(TASK, PUB, TESTS, {r:v for r,v in reviews.items() if r != role}, A, B)
            with self.subTest(rejected=role), self.assertRaises(ValueError):
                p.integration_gate(TASK, PUB, TESTS, reviews | {role:review(role,'changes_requested')}, A, B)

    def test_four_model_call_ceilings_fit_existing_reservation(self):
        ceiling = sum(((p.MAX_CONTEXT if role == 'build' else p.MAX_REVIEW_CONTEXT) * spec['input']
                       + spec['max_output'] * spec['output']) / 1e6 for role,spec in p.MODELS.items())
        self.assertLessEqual(ceiling, p.ATTEMPT_RESERVATION_USD)

    def test_small_profile_reserves_three_bounded_attempts_without_budget_reset(self):
        task = TASK | {'cost_profile': 'small-web-v1', 'max_cost_usd': 2.55}
        self.assertEqual(p.task_contract(task), task)
        history = []
        for _ in range(3):
            history.append(p.reserve_budget(history, task['id'], '2026-10-04', task=task))
        self.assertAlmostEqual(sum(r['reservedUsd'] for r in history), 2.55)
        with self.assertRaisesRegex(ValueError, 'exhausted'):
            p.reserve_budget(history, task['id'], '2026-10-05', task=task)
        with self.assertRaisesRegex(ValueError, 'identity'):
            p.reserve_budget([], 'different-task', '2026-10-04', task=task)
        for changes in [{'cost_profile': 'cheap'}, {'max_cost_usd': 16.5}, {'max_cost_usd': True}]:
            with self.subTest(changes=changes), self.assertRaises(ValueError):
                p.task_contract(task | changes)

    def test_small_profile_covers_all_four_calls_and_mixed_daily_reservations(self):
        task = TASK | {'cost_profile': 'small-web-v1', 'max_cost_usd': 2.55}
        specs = [p.model_limits(role, task) for role in p.MODELS]
        ceiling = sum((s['max_input'] * s['input'] + s['max_output'] * s['output']) / 1e6 for s in specs)
        # Covers a further 10% processing premium without relying on caching.
        self.assertLessEqual(ceiling * 1.1, p.cost_limits(task)['attempt_usd'])
        history = [{'taskId': 'other', 'day': '2026-10-04', 'reservedUsd': 32.2}]
        with self.assertRaisesRegex(ValueError, 'Daily'):
            p.reserve_budget(history, task['id'], '2026-10-04', task=task)

    def test_module_profile_fits_larger_source_but_authorizes_only_one_attempt(self):
        task = TASK | {'cost_profile': 'module-web-v1', 'max_cost_usd': 2.55}
        p.task_contract(task)
        specs = [p.model_limits(role, task) for role in p.MODELS]
        ceiling = sum((s['max_input'] * s['input'] + s['max_output'] * s['output']) / 1e6 for s in specs)
        self.assertLessEqual(ceiling * 1.1, p.cost_limits(task)['attempt_usd'])
        history = [p.reserve_budget([], task['id'], '2026-10-04', task=task)]
        self.assertEqual(history[0]['reservedUsd'], 2.4)
        with self.assertRaisesRegex(ValueError, 'exhausted'):
            p.reserve_budget(history, task['id'], '2026-10-05', task=task)

    def test_old_or_incomplete_package_proof_cannot_authorize_integration(self):
        reviews={role:review(role) for role in p.REVIEW_ROLES}
        for proof in [[],['other.js']]:
            with self.assertRaises(ValueError):p.integration_gate(TASK,PUB,TESTS|{'packagedFiles':proof},reviews,A,B)
        old={k:v for k,v in TESTS.items() if k!='packagedFiles'}
        with self.assertRaises(ValueError):p.integration_gate(TASK,PUB,old,reviews,A,B)

    def test_documentation_changes_preserve_control_version_but_code_changes_do_not(self):
        root=Path(__file__).resolve().parents[2]
        original=p.control_hash(root)
        with tempfile.TemporaryDirectory() as directory:
            mirror=Path(directory)
            for subpath in ['tools/automation', '.github/workflows']:
                (mirror/subpath).mkdir(parents=True,exist_ok=True)
            names=['pipeline.py','guardian.py','execution.py','continuation.py','model_calls.py','recovery.py','deployment_evidence.py','delivery.py','validation_report.py','validate-web.sh','profiles.py']
            for name in names:(mirror/'tools/automation'/name).write_text((root/'tools/automation'/name).read_text())
            for name in ['guardian-execution.yml','guardian-web-validation.yml','guardian-integrated-ci.yml','guardian-recovery.yml']:
                (mirror/'.github/workflows'/name).write_text((root/'.github/workflows'/name).read_text())
            import shutil
            for name in ['games_static.py','validate-games-static.sh','games-static-smoke.cjs']:
                shutil.copyfile(root/'tools/automation'/name,mirror/'tools/automation'/name)
            shutil.copytree(root/'tools/automation/fixtures',mirror/'tools/automation/fixtures')
            for name in ['guardian-games-validation.yml','guardian-games-staging.yml']:
                if (root/'.github/workflows'/name).exists(): shutil.copyfile(root/'.github/workflows'/name,mirror/'.github/workflows'/name)
            (mirror/'TODO.md').write_text('New parallel chat notes')
            self.assertEqual(p.control_hash(mirror),original)
            (mirror/'tools/automation/execution.py').write_text('Different controller')
            self.assertNotEqual(p.control_hash(mirror),original)

    def test_admission_is_explicit_not_general_repo_write_access(self):
        self.assertEqual(p.task_contract(copy.deepcopy(TASK)), TASK)
        for change in ({'base_branch':'main'}, {'risk':'security'}, {'base_sha':'HEAD'}, {'max_cost_usd':99},
                       {'validation_profile':'skip'}, {'allowed_files':[]}, {'allowed_files':['coach.js','coach.js']}):
            with self.subTest(change=change), self.assertRaises(ValueError):
                p.task_contract(TASK | change)

    def test_privileged_paths_traversals_credentials_and_tests_rejected(self):
        for name in ['../app.js','a/../app.js','a//app.js','/app.js','.github/test.js','tools/foo.js','functions/main.js',
                     'assessment-functions/main.js','firebase-config.js','firestore.rules','package.json','native/a.js',
                     'deploy-x.js','secure-student.js','admin-access.js','foo.test.mjs','a\\app.js']:
            with self.subTest(path=name), self.assertRaises(ValueError):
                p.path_allowed(name)

    def test_model_cannot_expand_scope_delete_or_inject_tree_modes(self):
        valid = {'summary':'clearer coach', 'files':[{'path':'coach.js','content':'export const next = true;'}]}
        self.assertEqual(p.candidate_contract(valid,TASK,'run-1')['taskHash'],p.digest(TASK))
        for files in [[], [{'path':'other.js','content':'x'}], [{'path':'coach.js','content':None}],
                      [{'path':'coach.js','content':'x','mode':'120000'}],
                      [{'path':'coach.js','content':'x'},{'path':'coach.js','content':'y'}],
                      [{'path':'coach.js','content':'sk-proj-'+'X'*32}], [{'path':'coach.js','content':'x\x00y'}]]:
            with self.subTest(files=files), self.assertRaises(ValueError):
                p.candidate_contract(valid | {'files':files},TASK,'run-1')

    def test_missing_reviewer_disagreement_and_stale_review_block_integration(self):
        reviews = {role: review(role) for role in p.REVIEW_ROLES}
        self.assertEqual(p.integration_gate(TASK,PUB,TESTS,reviews,A,B),B)
        for base, head, tests, evidence in [
            (C,B,TESTS,reviews),(A,C,TESTS,reviews),(A,B,TESTS|{'head':C},reviews),
            (A,B,TESTS,{'correctness':review('correctness')}),
            (A,B,TESTS,reviews|{'security':review('security','changes_requested')}),
            (A,B,TESTS,reviews|{'security':review('security')|{'model':'cheap-model'}})]:
            with self.subTest(base=base,head=head,evidence=evidence), self.assertRaises(ValueError):
                p.integration_gate(TASK,PUB,tests,evidence,base,head)
        wrong = review('security'); wrong['review']['candidateHash']='e'*64
        with self.assertRaises(ValueError):
            p.integration_gate(TASK,PUB,TESTS,reviews|{'security':wrong},A,B)

    def test_approval_cannot_hide_blocking_findings(self):
        result = review('security','changes_requested')['review']; result['verdict']='approve'
        with self.assertRaises(ValueError):
            p.validate_review(result,'security',PUB|{'allowed_files':TASK['allowed_files']})

    def test_reservations_count_unknown_cost_and_do_not_reset_per_sha(self):
        history = [p.reserve_budget([], TASK['id'], '2026-10-03') for _ in range(3)]
        with self.assertRaises(ValueError):
            p.reserve_budget(history,TASK['id'],'2026-10-04')
        daily=[p.reserve_budget([], 'other-'+str(i),'2026-10-03') for i in range(6)]
        with self.assertRaises(ValueError):
            p.reserve_budget(daily,TASK['id'],'2026-10-03')


class ModelTests(unittest.TestCase):
    def response(self, role, result):
        spec=p.MODELS[role]
        if spec['provider']=='openai':
            return {'model':spec['model'],'status':'completed','usage':{'input_tokens':120,'output_tokens':80},
                    'output':[{'type':'message','content':[{'type':'output_text','text':json.dumps(result)}]}]}
        return {'model':spec['model'],'stop_reason':'end_turn','usage':{'input_tokens':120,'output_tokens':80},
                'content':[{'type':'text','text':json.dumps(result)}]}

    def test_exact_models_store_false_no_tools_or_automatic_retry(self):
        for role in p.MODELS:
            calls=[]
            result,usage=m.call(role,'Review',{'x':'source'},p.REVIEW_SCHEMA,
                               lambda endpoint,body: calls.append((endpoint,body)) or self.response(role,{'ok':True}))
            self.assertEqual(len(calls),1)
            self.assertNotIn('tools',calls[0][1])
            self.assertEqual(calls[0][1]['model'],p.MODELS[role]['model'])
            if role!='security':
                self.assertIs(calls[0][1]['store'],False)
                self.assertIs(calls[0][1]['background'],True)
            self.assertEqual(result,{'ok':True}); self.assertGreater(usage['estimatedUsd'],0)

    def test_openai_background_call_polls_same_response_instead_of_creating_duplicate(self):
        class FakeResponse:
            def __init__(self, payload):
                self.payload = payload
            def __enter__(self):
                return self
            def __exit__(self, *args):
                return False
            def read(self, _limit):
                return json.dumps(self.payload).encode()

        queued = {'id': 'resp_guardian_test', 'model': p.MODELS['build']['model'], 'status': 'queued'}
        completed = self.response('build', {'ok': True}) | {'id': 'resp_guardian_test'}
        with patch.dict(os.environ, {'CODEX_WORKER_API_KEY': 'test-only'}), \
             patch.object(m.time, 'sleep', return_value=None), \
             patch.object(m.urllib.request, 'urlopen',
                          side_effect=[FakeResponse(queued), FakeResponse(completed)]) as send:
            result, usage = m.call('build', 'Implement', {}, p.CANDIDATE_SCHEMA)
        self.assertEqual(result, {'ok': True})
        self.assertGreater(usage['estimatedUsd'], 0)
        self.assertEqual(send.call_count, 2)
        create_request = send.call_args_list[0].args[0]
        retrieve_request = send.call_args_list[1].args[0]
        self.assertEqual(create_request.get_method(), 'POST')
        self.assertEqual(retrieve_request.get_method(), 'GET')
        self.assertTrue(retrieve_request.full_url.endswith('/resp_guardian_test'))

    def test_refusal_partial_output_model_drift_and_missing_usage_fail_closed(self):
        original=self.response('correctness',{'ok':True})
        for changes in [{'model':'other-model'},{'status':'incomplete'},{'usage':{}},
                        {'output':[{'type':'message','content':[{'type':'refusal','refusal':'no'}]}]},
                        {'usage':{'input_tokens':True,'output_tokens':1}}]:
            calls=[]
            with self.subTest(changes=changes), self.assertRaises((ValueError,KeyError)):
                m.call('correctness','Review',{},p.REVIEW_SCHEMA,lambda endpoint,body:calls.append(body) or (original|changes))
            self.assertEqual(len(calls),1)

    def test_openai_terminal_status_reports_safe_reason_and_response_id(self):
        payload = self.response('build', {'unused': True}) | {
            'id': 'resp_safe_diagnostic',
            'status': 'incomplete',
            'incomplete_details': {'reason': 'max_output_tokens'},
        }
        with self.assertRaisesRegex(ValueError, r'OpenAI response incomplete: max_output_tokens; response resp_safe_diagnostic'):
            m.call('build', 'Implement', {}, p.CANDIDATE_SCHEMA, lambda *_: payload)
        payload['incomplete_details']['private'] = 'must-not-be-echoed'
        try:
            m.call('build', 'Implement', {}, p.CANDIDATE_SCHEMA, lambda *_: payload)
        except ValueError as exc:
            self.assertNotIn('must-not-be-echoed', str(exc))

    def test_input_budget_blocks_before_provider_call(self):
        calls=[]
        with self.assertRaises(ValueError):
            m.call('build','Implement',{'source':'x'*p.MAX_CONTEXT},p.CANDIDATE_SCHEMA,lambda *args:calls.append(args))
        self.assertFalse(calls)

    def test_small_profile_applies_provider_limits_and_never_upgrades_or_truncates(self):
        task = TASK | {'cost_profile': 'small-web-v1', 'max_cost_usd': 2.55}
        for role in p.MODELS:
            calls = []
            m.call(role, 'Review', {}, p.REVIEW_SCHEMA,
                   lambda endpoint, body: calls.append(body) or self.response(role, {'ok': True}), task=task)
            spec = p.model_limits(role, task)
            self.assertEqual(calls[0]['model'], p.MODELS[role]['model'])
            self.assertEqual(calls[0].get('max_output_tokens', calls[0].get('max_tokens')), spec['max_output'])
            calls.clear()
            with self.assertRaisesRegex(ValueError, 'context'):
                m.call(role, 'Review', {'source': 'x' * spec['max_input']}, p.REVIEW_SCHEMA,
                       lambda *args: calls.append(args), task=task)
            self.assertFalse(calls)
            response = self.response(role, {'ok': True})
            response['usage']['output_tokens'] = spec['max_output'] + 1
            with self.assertRaisesRegex(ValueError, 'accounting'):
                m.call(role, 'Review', {}, p.REVIEW_SCHEMA, lambda *args: response, task=task)

    def test_unknown_paid_network_result_is_not_retried(self):
        with patch.dict(os.environ,{'CODEX_WORKER_API_KEY':'test-only'}), patch.object(m.urllib.request,'urlopen',side_effect=TimeoutError) as send:
            with self.assertRaisesRegex(RuntimeError,'unknown'):
                m.call('build','Implement',{},p.CANDIDATE_SCHEMA)
            self.assertEqual(send.call_count,1)

    def test_provider_rejection_reports_status_without_echoing_secret_body(self):
        import io
        error=m.urllib.error.HTTPError('https://api.openai.com/v1/responses',403,'denied',{},io.BytesIO(b'secret-provider-payload'))
        with patch.dict(os.environ,{'CODEX_WORKER_API_KEY':'test-only'}),patch.object(m.urllib.request,'urlopen',side_effect=error) as send:
            with self.assertRaisesRegex(RuntimeError,'HTTP 403, provider/model permission denied') as raised:
                m.call('build','Implement',{},p.CANDIDATE_SCHEMA)
            self.assertNotIn('secret-provider-payload',str(raised.exception));self.assertEqual(send.call_count,1)


class SetupTests(unittest.TestCase):
    def test_optional_pilot_is_dispatched_once_after_hidden_secret_setup(self):
        script = Path(__file__).resolve().parent / 'setup-guardian.sh'
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            log = root / 'calls'
            fake = root / 'gh'
            fake.write_text('#!/bin/bash\nprintf "%s\\n" "$*" >> "$TEST_GH_LOG"\n'
                            'if [[ "$*" == *".full_name"* ]]; then echo HerrLoeffler/Hausaufgabe; fi\n')
            fake.chmod(0o755)
            env = os.environ | {'PATH': str(root) + ':' + os.environ['PATH'], 'TEST_GH_LOG': str(log)}
            result = subprocess.run(['bash', str(script), 'pilot-ui'], env=env, text=True, capture_output=True, check=True)
            calls = log.read_text().splitlines()
            dispatches = [r for r in calls if r.startswith('workflow run')]
            self.assertEqual(len(dispatches), 1)
            self.assertIn('--ref main --field task_id=pilot-ui', dispatches[0])
            self.assertEqual(sum(r.startswith('secret set') for r in calls), 3)
            self.assertLess(next(i for i,r in enumerate(calls) if '/agent-queue/' in r), next(i for i,r in enumerate(calls) if r.startswith('secret set')))
            self.assertIn('Production stays locked', result.stdout)
            log.unlink()
            subprocess.run(['bash', str(script)], env=env, capture_output=True, check=True)
            self.assertFalse(any(r.startswith('workflow run') for r in log.read_text().splitlines()))
            log.unlink()
            invalid = subprocess.run(['bash', str(script), 'bad;task'], env=env, capture_output=True)
            self.assertEqual(invalid.returncode, 2)
            self.assertFalse(log.exists())


class ContinuationTests(unittest.TestCase):
    def test_busy_unknown_and_stopped_attempts_never_restart(self):
        for state in c.BUSY|{'stopped'}:
            action,_=c.select(ROW,TASK,[ATTEMPT|{'state':state}],A,True)
            self.assertIn(action,{'wait','stopped'})

    def test_only_actionable_repairs_up_to_three_and_source_must_be_current(self):
        repair=ATTEMPT|{'state':'repairable'}
        self.assertEqual(c.select(ROW,TASK,[repair],A,True)[0],'dispatch')
        self.assertEqual(c.select(ROW,TASK,[repair]*3,A,True)[0],'stopped')
        self.assertEqual(c.select(ROW,TASK,[repair],B,True)[0],'blocked')
        self.assertEqual(c.select(ROW,TASK,[],A,False)[0],'disabled')

    def test_wrong_repo_branch_request_or_control_sha_cannot_own_run(self):
        valid={'id':9,'display_title':'Guardian task run-1','path':c.WORKFLOW,'event':'workflow_dispatch',
               'head_branch':'main','head_sha':C,'head_repository':{'full_name':g.REPO},'status':'in_progress','run_attempt':1}
        for changes in [{'head_sha':B},{'head_branch':'evil'},{'path':'other.yml'},
                        {'head_repository':{'full_name':'attacker/repo'}},{'display_title':'Guardian task run-other'}]:
            attempt=copy.deepcopy(ATTEMPT)
            self.assertEqual(c.reconcile(attempt,[valid|changes]),ATTEMPT)
        self.assertEqual(c.reconcile(copy.deepcopy(ATTEMPT),[valid|{'status':'completed'}])['state'],'stopped')
        self.assertEqual(c.reconcile(copy.deepcopy(ATTEMPT),[valid,valid|{'id':10}])['state'],'stopped')

    def test_finished_workflow_without_finalization_stops_instead_of_repair(self):
        run={'id':9,'display_title':'Guardian task run-1','path':c.WORKFLOW,'event':'workflow_dispatch',
             'head_branch':'main','head_sha':C,'head_repository':{'full_name':g.REPO},'status':'completed','conclusion':'failure'}
        self.assertEqual(c.reconcile(copy.deepcopy(ATTEMPT),[run])['state'],'stopped')


class ExecutionTests(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory(); self.addCleanup(self.temp.cleanup)
        self.root=Path(self.temp.name); (self.root/'automation').mkdir(); (self.root/'agent-queue').mkdir()
        (self.root/'automation/guardian-policy.json').write_text(json.dumps({'schemaVersion':1,'enabled':True,'maxAttemptsPerStage':3,'automaticProduction':False,'workstreams':[ROW]}))
        (self.root/'agent-queue/pilot-ui.json').write_text(json.dumps(TASK))
        self.data=self.root/'evidence'; self.data.mkdir()
        self.ledger={'schemaVersion':1,'attempts':{'pilot:pipeline-v2':[copy.deepcopy(ATTEMPT)]}}
        self.events=[]
        document_reader=patch.object(e,'fresh_documents',side_effect=lambda task_id:[json.loads((self.root/'automation/guardian-policy.json').read_text()),json.loads((self.root/'agent-queue/pilot-ui.json').read_text())]);document_reader.start();self.addCleanup(document_reader.stop)
        hashing=patch.object(e,'control_hash',return_value='h'*64);hashing.start();self.addCleanup(hashing.stop)
        for name,value in [('ROOT',self.root),('DATA',self.data)]:
            patcher=patch.object(e,name,value);patcher.start();self.addCleanup(patcher.stop)
        # Offline execution fixtures model an original attempt. A retry of this
        # test workflow must not turn every fixture into a paid-workflow rerun;
        # the dedicated rerun test below explicitly overrides this to attempt 2.
        env=patch.dict(os.environ,{'GITHUB_REPOSITORY':g.REPO,'GUARDIAN_ENABLED':'true','CONTROL_SHA':C,'GITHUB_RUN_ID':'9','GITHUB_RUN_ATTEMPT':'1','GITHUB_OUTPUT':str(self.root/'outputs')});env.start();self.addCleanup(env.stop)
        reader=patch.object(e,'read_ledger',side_effect=lambda:(copy.deepcopy(self.ledger),'blob'));reader.start();self.addCleanup(reader.stop)
        def write(value,blob):
            self.events.append('persist');self.ledger=copy.deepcopy(value);return 'blob-next'
        writer=patch.object(e,'write_ledger',side_effect=write);writer.start();self.addCleanup(writer.stop)
        e.save('contract',{'requestId':'run-1','task':TASK,'source':{'coach.js':'old','coach.css':'small'},'taskHash':p.digest(TASK)})
        e.save('publication',PUB);e.save('tests',TESTS)
        for role in p.REVIEW_ROLES:e.save(role,review(role))

    def api(self,path,method='GET',body=None):
        self.events.append((path,method,body))
        if path=='pulls/55' and method=='GET':
            return {'state':'open','head':{'sha':B,'repo':{'full_name':g.REPO}},'base':{'ref':p.WEB}}
        if path.startswith('git/ref/heads/'):
            return {'object':{'sha': A if path.endswith(p.WEB) else B}}
        if path=='git/commits/'+B:return {'parents':[{'sha':A}],'tree':{'sha':C}}
        return {}

    def test_integration_sequence_uses_normal_fast_forward_then_ledger_then_dispatch(self):
        with patch.object(e,'api',side_effect=self.api):e.integrate()
        push=next(i for i,item in enumerate(self.events) if isinstance(item,tuple) and item[0]=='git/refs/heads/'+p.WEB)
        dispatch=next(i for i,item in enumerate(self.events) if isinstance(item,tuple) and 'dispatches' in item[0])
        self.assertLess(push,self.events.index('persist'));self.assertLess(self.events.index('persist'),dispatch)
        self.assertIs(self.events[push][2]['force'],False)
        self.assertEqual(self.ledger['attempts']['pilot:pipeline-v2'][0]['state'],'integrated')

    def test_changed_head_or_base_prevents_any_write_or_ci_dispatch(self):
        for changed in ['git/ref/heads/'+p.WEB,'git/ref/heads/'+PUB['branch']]:
            self.events=[]
            def api(path,method='GET',body=None):
                if path==changed:return {'object':{'sha':C}}
                return self.api(path,method,body)
            with patch.object(e,'api',side_effect=api),self.assertRaises(ValueError):e.integrate()
            self.assertFalse(any(isinstance(i,tuple) and i[1]!='GET' for i in self.events))

    def test_rejected_review_blocks_all_integration_writes(self):
        e.save('security',review('security','changes_requested'))
        with patch.object(e,'api',side_effect=self.api),self.assertRaises(ValueError):e.integrate()
        self.assertFalse(any(isinstance(i,tuple) and i[1]!='GET' for i in self.events))

    def test_partial_push_failure_never_dispatches_deployment(self):
        def api(path,method='GET',body=None):
            if method=='PATCH':raise RuntimeError('Unknown ref update')
            return self.api(path,method,body)
        with patch.object(e,'api',side_effect=api),self.assertRaises(RuntimeError):e.integrate()
        self.assertNotIn('persist',self.events)
        self.assertFalse(any(isinstance(i,tuple) and 'dispatches' in i[0] for i in self.events))

    def test_workflow_rerun_cannot_repeat_build_ownership(self):
        with self.assertRaisesRegex(ValueError,'already owned'):e.prepare('run-1')

    def test_permission_recovery_can_repeat_candidate_but_rejected_code_cannot(self):
        result = {'summary':'same valid fix','files':[{'path':'coach.js','content':'new'}]}
        for allowed in (False, True):
            contract = e.load('contract') | {'previousCandidate': {'coach.js':'new'},
                'allowSameCandidateAfterPermissionRecovery': allowed}
            e.save('contract', contract)
            with patch.object(e,'api',side_effect=self.api), patch.object(e,'call',return_value=(result, {'estimatedUsd':.01})):
                if allowed:
                    e.build()
                    self.assertEqual(e.load('candidate')['candidate'], result)
                else:
                    with self.assertRaisesRegex(ValueError,'repeats rejected'): e.build()

    def test_prepare_uses_old_candidate_only_with_exact_source_recovery_binding(self):
        prior_task = TASK | {'base_sha': 'd' * 40}
        prior = copy.deepcopy(ATTEMPT) | {'requestId': 'old-run', 'state': 'repairable',
            'approvedSha': prior_task['base_sha'], 'taskHash': p.digest(prior_task),
            'publication': PUB | {'base': prior_task['base_sha']},
            'manualRecovery': {'kind': 'confirmed-review-permission-403',
                'previousRequestId': 'old-run', 'taskHash': p.digest(prior_task),
                'sourceUpdate': {'previousTask': prior_task, 'approvedSha': A,
                    'taskHash': p.digest(TASK), 'selectedBlobs': {'coach.js': C, 'coach.css': C}}}}
        current = copy.deepcopy(ATTEMPT) | {'state': 'reserved'}
        current.pop('runId', None)
        def api(path, method='GET', body=None):
            if path == 'git/commits/' + B:
                return {'tree': {'sha': C}, 'parents': [{'sha': prior_task['base_sha']}]}
            if path.startswith('git/trees/'):
                return {'tree': [{'path': name, 'sha': C, 'mode': '100644', 'type': 'blob', 'size': 3}
                    for name in ['coach.js', 'coach.css']]}
            if path == 'git/blobs/' + C:
                return {'content': base64.b64encode(b'old').decode()}
            return self.api(path, method, body)
        self.ledger['attempts']['pilot:pipeline-v2'] = [copy.deepcopy(prior), current]
        with patch.object(e, 'api', side_effect=api): e.prepare('run-1')
        self.assertTrue(e.load('contract')['allowSameCandidateAfterPermissionRecovery'])
        self.assertEqual(e.load('contract')['task']['base_sha'], A)
        self.assertEqual(self.ledger['attempts']['pilot:pipeline-v2'][0], prior)
        for field, wrong in [('taskHash', 'wrong'), ('approvedSha', B)]:
            broken = copy.deepcopy(prior)
            broken['manualRecovery']['sourceUpdate'][field] = wrong
            self.ledger['attempts']['pilot:pipeline-v2'] = [broken, copy.deepcopy(current)]
            with patch.object(e, 'api', side_effect=api), self.assertRaises(ValueError):
                e.prepare('run-1')

    def test_rerun_failed_jobs_cannot_repeat_any_paid_call(self):
        e.save('candidate',p.candidate_contract({'summary':'test','files':[{'path':'coach.js','content':'new'}]},TASK,'run-1'))
        with patch.dict(os.environ,{'GITHUB_RUN_ATTEMPT':'2'}),patch.object(e,'call') as provider:
            with self.assertRaisesRegex(ValueError,'no workflow rerun'):e.build()
            with self.assertRaisesRegex(ValueError,'no workflow rerun'):e.review('correctness')
            self.assertFalse(provider.called)

    def test_fresh_remote_authority_overrides_cached_approval(self):
        disabled={'schemaVersion':1,'enabled':False,'maxAttemptsPerStage':3,'automaticProduction':False,'workstreams':[ROW]}
        with patch.object(e,'fresh_documents',return_value=[disabled,TASK]),self.assertRaisesRegex(ValueError,'not activated'):
            e.approved('run-1')

    def test_task_and_policy_are_read_from_one_remote_main_snapshot(self):
        seen=[]
        def api(path,method='GET',body=None):
            seen.append(path)
            if path=='git/ref/heads/main':return {'object':{'sha':C}}
            return {'content':base64.b64encode(b'{}').decode()}
        with patch.object(e,'api',side_effect=api):FRESH_DOCUMENTS('pilot-ui')
        self.assertEqual(seen,['git/ref/heads/main','contents/automation/guardian-policy.json?ref='+C,'contents/agent-queue/pilot-ui.json?ref='+C])

    def test_permission_revocation_or_changed_contract_blocks_privileged_step(self):
        (self.root/'agent-queue/pilot-ui.json').write_text(json.dumps(TASK|{'goal':'something different'}))
        with self.assertRaises(ValueError):e.approved('run-1')

    def test_review_rejection_becomes_repairable_but_provider_error_stops(self):
        e.save('security',review('security','changes_requested'))
        with patch.dict(os.environ,{'VALIDATION_RESULT':'success','REVIEW_RESULT':'success'}):e.finalize('run-1')
        self.assertEqual(self.ledger['attempts']['pilot:pipeline-v2'][0]['state'],'repairable')
        self.ledger['attempts']['pilot:pipeline-v2'][0]['state']='running'
        with patch.dict(os.environ,{'VALIDATION_RESULT':'success','REVIEW_RESULT':'failure'}):e.finalize('run-1')
        self.assertEqual(self.ledger['attempts']['pilot:pipeline-v2'][0]['state'],'stopped')

    def test_qa_veto_blocks_writes_and_becomes_actionable_feedback(self):
        e.save('qa',review('qa','changes_requested'))
        with patch.object(e,'api',side_effect=self.api),self.assertRaises(ValueError):e.integrate()
        self.assertFalse(any(isinstance(i,tuple) and i[1]!='GET' for i in self.events))
        with patch.dict(os.environ,{'VALIDATION_RESULT':'success','REVIEW_RESULT':'success'}):e.finalize('run-1')
        latest=self.ledger['attempts']['pilot:pipeline-v2'][0]
        self.assertEqual(latest['state'],'repairable')
        self.assertEqual(latest['feedback'][0]['message'],'Next button not reachable')

    def test_qa_sees_original_candidate_and_tests_but_no_other_reviewer_answers(self):
        e.save('candidate',p.candidate_contract({'summary':'test','files':[{'path':'coach.js','content':'new'}]},TASK,'run-1'))
        def model(role,instructions,context,schema,*,task=None):
            self.assertEqual(role,'qa')
            self.assertIn('observable user flows',instructions)
            self.assertEqual(set(context),{'task','originalSource','proposedFiles','binding','tests'})
            self.assertEqual(context['tests'],TESTS)
            self.assertNotIn('reviews',context)
            return review('qa')['review'],review('qa')['usage']
        with patch.object(e,'api',side_effect=self.api),patch.object(e,'call',side_effect=model):e.review('qa')
        self.assertEqual(e.load('qa')['model'],'gpt-6-sol')

    def test_dependency_failure_does_not_claim_actionable_test_failure(self):
        e.save('tests',TESTS|{'result':'blocked'})
        with patch.dict(os.environ,{'VALIDATION_RESULT':'failure','REVIEW_RESULT':'skipped'}):e.finalize('run-1')
        self.assertEqual(self.ledger['attempts']['pilot:pipeline-v2'][0]['state'],'stopped')

    def test_actual_test_failure_carries_bounded_feedback_for_repair(self):
        e.save('tests',TESTS|{'result':'failure'});e.save('test-feedback',{'tail':'assertion failed'})
        with patch.dict(os.environ,{'VALIDATION_RESULT':'failure','REVIEW_RESULT':'skipped'}):e.finalize('run-1')
        latest=self.ledger['attempts']['pilot:pipeline-v2'][0]
        self.assertEqual(latest['state'],'repairable');self.assertEqual(latest['feedback'][0]['details'],'assertion failed')

    def test_syntax_failure_diagnostic_survives_a_long_green_validation_log(self):
        e.save('tests',TESTS|{'result':'failure'})
        e.save('test-feedback',{'packaging':'Changed JavaScript syntax invalid: coach.js','tail':'green tests '*1000})
        with patch.dict(os.environ,{'VALIDATION_RESULT':'failure','REVIEW_RESULT':'skipped'}):e.finalize('run-1')
        latest=self.ledger['attempts']['pilot:pipeline-v2'][0]
        self.assertEqual(latest['state'],'repairable')
        self.assertTrue(latest['feedback'][0]['details'].startswith('Changed JavaScript syntax invalid: coach.js'))
        self.assertLessEqual(len(latest['feedback'][0]['details']),6001)

    def test_ledger_is_reserved_before_source_or_paid_call(self):
        self.ledger['attempts']['pilot:pipeline-v2'][0].update(state='dispatched',runId=None)
        def api(path,method='GET',body=None):
            if path=='git/trees/'+A+'?recursive=1':
                self.assertEqual(self.events[0],'persist')
                return {'tree':[{'path':'coach.js','mode':'100644','type':'blob','size':3,'sha':B},
                                {'path':'coach.css','mode':'100644','type':'blob','size':3,'sha':B}]}
            if path=='git/blobs/'+B:return {'content':base64.b64encode(b'old').decode()}
            return {'object':{'sha':A}}
        with patch.object(e,'api',side_effect=api):e.prepare('run-1')
        self.assertEqual(e.load('contract')['taskHash'],p.digest(TASK))

    def test_full_offline_execution_publishes_tests_reviews_integrates_and_accounts(self):
        self.ledger['attempts']['pilot:pipeline-v2'][0].update(state='dispatched',runId=None,publication=None)
        current=A
        def api(path,method='GET',body=None):
            nonlocal current
            self.events.append((path,method,body))
            if path=='git/ref/heads/'+p.WEB:return {'object':{'sha':current}}
            if path=='git/refs/heads/'+p.WEB and method=='PATCH':current=body['sha'];return {'object':{'sha':current}}
            if path.startswith('git/ref/heads/automation/worker/'):return {'object':{'sha':B}}
            if path.startswith('git/matching-refs/'):return []
            if path=='git/trees/'+A+'?recursive=1':return {'tree':[{'path':name,'mode':'100644','type':'blob','size':3,'sha':C} for name in ('coach.js','coach.css')]}
            if path=='git/blobs/'+C:return {'content':base64.b64encode(b'old').decode()}
            if path=='git/commits/'+A:return {'tree':{'sha':A}}
            if path=='git/commits/'+B:return {'parents':[{'sha':A}],'tree':{'sha':C}}
            if path=='git/trees' and method=='POST':return {'sha':C}
            if path=='git/commits' and method=='POST':return {'sha':B}
            if path=='pulls' and method=='POST':return {'number':55}
            if path=='pulls/55' and method=='GET':return {'state':'open','head':{'sha':B,'repo':{'full_name':g.REPO}},'base':{'ref':p.WEB}}
            return {}
        roles=[]
        def model(role,instructions,context,schema,*,task=None):
            roles.append(role)
            self.assertEqual(task, context.get('task'))
            usage={'provider':p.MODELS[role]['provider'],'model':p.MODELS[role]['model'],'estimatedUsd':0.02}
            if role=='build':return {'summary':'clearer','files':[{'path':'coach.js','content':'export const next = true;'}]},usage
            binding=context['binding']
            return {'verdict':'approve',**binding,'findings':[]},usage
        with patch.object(e,'api',side_effect=api),patch.object(e,'call',side_effect=model):
            e.prepare('run-1');e.build();e.publish()
            publication=e.load('publication')
            e.save('tests',{'profile':'web-combined-v1','head':B,'base':A,'result':'success','packagedFiles':['coach.js']})
            e.review('correctness');e.review('security');e.review('qa');e.integrate();e.finalize('run-1')
        self.assertEqual(roles,['build',*p.REVIEW_ROLES])
        self.assertEqual(current,B)
        latest=self.ledger['attempts']['pilot:pipeline-v2'][0]
        self.assertEqual(latest['state'],'integrated');self.assertEqual(latest['estimatedUsd'],0.08)
        self.assertEqual(publication['candidateHash'],e.load('candidate')['candidateHash'])

    def test_full_offline_execution_carries_small_profile_to_all_four_calls(self):
        small = TASK | {'cost_profile': 'small-web-v1', 'max_cost_usd': 2.55}
        (self.root / 'agent-queue/pilot-ui.json').write_text(json.dumps(small))
        self.ledger['attempts']['pilot:pipeline-v2'][0]['taskHash'] = p.digest(small)
        with patch.dict(TASK, small, clear=True):
            self.test_full_offline_execution_publishes_tests_reviews_integrates_and_accounts()


class DeploymentTests(unittest.TestCase):
    def ci_run(self):
        return {'id':44,'name':'Guardian integrated checks','path':'.github/workflows/guardian-integrated-ci.yml',
                'event':'workflow_dispatch','status':'completed','conclusion':'success','run_attempt':1,
                'head_sha':C,'head_branch':'main','head_repository':{'full_name':g.REPO},'display_title':'Guardian integrated run-1'}

    def test_successful_ci_is_bound_to_exact_integration_and_control_workflow(self):
        run=self.ci_run();attempt=ATTEMPT|{'state':'integrated','integratedSha':B}
        report={'requestId':'run-1','commit':B,'branch':p.WEB,'runId':44,'result':'success','profile':'web-combined-v1'}
        self.assertEqual(d.verify_ci(run,report,attempt),B)
        for changes in [{'event':'pull_request'},{'head_sha':A},{'conclusion':'failure'},{'run_attempt':2},
                        {'head_repository':{'full_name':'attacker/repo'}},{'display_title':'Guardian integrated other'}]:
            with self.subTest(changes=changes),self.assertRaises(ValueError):d.verify_ci(run|changes,report,attempt)
        with self.assertRaises(ValueError):d.verify_ci(run,report|{'commit':A},attempt)

    def test_real_dynamic_ci_name_retains_exact_path_and_request_binding(self):
        run = self.ci_run() | {'name': 'Guardian integrated run-1'}
        attempt = ATTEMPT | {'state': 'integrated', 'integratedSha': B}
        report = {'requestId': 'run-1', 'commit': B, 'branch': p.WEB, 'runId': 44,
                  'result': 'success', 'profile': 'web-combined-v1'}
        self.assertEqual(d.verify_ci(run, report, attempt), B)
        for update in [{'name': 'Guardian integrated other'}, {'path': '.github/workflows/fake.yml'},
                       {'head_sha': A}, {'run_attempt': 2}]:
            with self.subTest(update=update), self.assertRaises(ValueError):
                d.verify_ci(run | update, report, attempt)

    def test_committed_staging_request_cannot_substitute_ci_candidate_or_owner(self):
        request = {'id': 'pilot-stage', 'requestId': 'run-1', 'upstreamRunId': 44, 'commit': B}
        report = {'requestId': 'run-1', 'commit': B, 'branch': p.WEB, 'runId': 44,
                  'result': 'success', 'profile': 'web-combined-v1'}
        attempt = ATTEMPT | {'state': 'integrated', 'integratedSha': B, 'ciRunId': 44}
        d.verify_request(request, report, attempt)
        for update in [{'commit': A}, {'requestId': 'other'}, {'upstreamRunId': 45},
                       {'upstreamRunId': True}, {'unexpected': 'ignored'}]:
            with self.subTest(update=update), self.assertRaises(ValueError):
                d.verify_request(request | update, report, attempt)

    def test_main_push_reuses_verified_ci_without_mutating_attempts_or_budget(self):
        report = {'requestId': 'run-1', 'commit': B, 'branch': p.WEB, 'runId': 44,
                  'result': 'success', 'profile': 'web-combined-v1'}
        attempt = ATTEMPT | {'state': 'integrated', 'integratedSha': B, 'ciRunId': 44}
        ledger = {'attempts': {'pilot:pipeline-v2': [attempt]},
                  'budgetReservations': [{'taskId': 'pilot-ui', 'reservedUsd': .85}]}
        original = copy.deepcopy(ledger)
        policy = {'schemaVersion': 1, 'enabled': True, 'maxAttemptsPerStage': 3,
                  'automaticProduction': False, 'workstreams': [ROW]}
        def api(path, method='GET', body=None):
            self.assertEqual(method, 'GET')
            if path == 'actions/runs/44':
                return self.ci_run() | {'name': 'Guardian integrated run-1'}
            if path == 'git/ref/heads/' + p.WEB: return {'object': {'sha': B}}
            raise AssertionError(path)
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp); folder = root / 'automation/deployment-requests'; folder.mkdir(parents=True)
            request = {'id': 'pilot-stage', 'requestId': 'run-1', 'upstreamRunId': 44, 'commit': B}
            (folder / 'pilot-stage.json').write_text(json.dumps(request))
            previous_cwd = Path.cwd()
            try:
                os.chdir(root)
                with patch.object(d, 'ROOT', root), patch.object(d, 'api', side_effect=api), \
                     patch.object(d, 'artifact_document', return_value=report), \
                     patch.object(g, 'read_ledger', return_value=(ledger, 'blob')), \
                     patch.object(e, 'fresh_documents', return_value=[policy, TASK]), \
                     patch.dict(os.environ, {'GITHUB_REPOSITORY': g.REPO, 'GITHUB_REF': 'refs/heads/main',
                         'GITHUB_EVENT_NAME': 'push', 'GITHUB_RUN_ID': '66', 'UPSTREAM_RUN_ID': '',
                         'GITHUB_OUTPUT': str(root / 'outputs'), 'GUARDIAN_ENABLED': 'true'}):
                    d.main()
                    self.assertEqual(json.loads((root / 'deployment-source.json').read_text()),
                        {'commit': B, 'upstreamCiRun': 44, 'workflowRun': 66, 'project': 'hausaufgabe-staging'})
                    self.assertEqual(ledger, original)
                    with patch.dict(os.environ, {'UPSTREAM_RUN_ID': '44', 'EXPECTED_SHA': A}), self.assertRaises(ValueError):
                        d.main()
                    with patch.dict(os.environ, {'UPSTREAM_RUN_ID': '45', 'EXPECTED_SHA': B}), self.assertRaises(ValueError):
                        d.main()
                    (folder / 'pilot-stage.json').write_text(json.dumps(request | {'upstreamRunId': 45, 'commit': A}))
                    with patch.dict(os.environ, {'UPSTREAM_RUN_ID': '44', 'EXPECTED_SHA': B}), self.assertRaises(ValueError):
                        d.main()
                    (folder / 'pilot-stage.json').write_text(json.dumps(request))
                    with patch.dict(os.environ, {'GITHUB_REF': 'refs/heads/other'}), self.assertRaises(ValueError):
                        d.committed_request()
                    (folder / 'second.json').write_text(json.dumps(request))
                    with self.assertRaises(ValueError): d.committed_request()
            finally:
                os.chdir(previous_cwd)

    def test_native_git_fast_forward_cannot_overwrite_parallel_commit(self):
        with tempfile.TemporaryDirectory() as temp:
            root=Path(temp);remote=root/'remote.git';source=root/'source'
            def git(*args,cwd=None):
                return subprocess.run(['git',*args],cwd=cwd,text=True,capture_output=True,check=True).stdout.strip()
            git('init','--bare',str(remote));git('init',str(source))
            git('config','user.name','Test',cwd=source);git('config','user.email','test@example.invalid',cwd=source)
            (source/'coach.js').write_text('base');git('add','.',cwd=source);git('commit','-m','base',cwd=source)
            base=git('rev-parse','HEAD',cwd=source);git('remote','add','origin',str(remote),cwd=source)
            git('push','origin','HEAD:refs/heads/integration',cwd=source)
            (source/'coach.js').write_text('candidate');git('commit','-am','candidate',cwd=source)
            candidate=git('rev-parse','HEAD',cwd=source)
            git('checkout','--detach',base,cwd=source);(source/'other.js').write_text('parallel');git('add','.',cwd=source);git('commit','-m','parallel',cwd=source)
            parallel=git('rev-parse','HEAD',cwd=source);git('push','origin','HEAD:refs/heads/integration',cwd=source)
            refused=subprocess.run(['git','push','origin',candidate+':refs/heads/integration'],cwd=source,capture_output=True)
            self.assertNotEqual(refused.returncode,0)
            self.assertEqual(git('--git-dir='+str(remote),'rev-parse','integration'),parallel)

    def test_deploy_retry_is_durably_reserved_before_dispatch_and_bounded(self):
        attempt=copy.deepcopy(ATTEMPT);events=[]
        run={'id':44,'run_attempt':1}
        with patch.object(d,'api',side_effect=lambda *args:events.append('dispatch')):
            with self.assertRaises(ValueError):d.retry_failed_deploy(attempt,'hosting',run,lambda:events.append('persist'))
            self.assertEqual(events,['persist','dispatch','persist'])
            with self.assertRaisesRegex(ValueError,'already reserved'):d.retry_failed_deploy(attempt,'hosting',run,lambda:events.append('persist'))
            with self.assertRaises(ValueError):d.retry_failed_deploy(attempt,'hosting',run|{'run_attempt':2},lambda:events.append('persist'))
            with self.assertRaisesRegex(ValueError,'exhausted'):d.retry_failed_deploy(attempt,'hosting',run|{'run_attempt':3},lambda:events.append('persist'))
        self.assertEqual(events.count('dispatch'),2)

    def test_unknown_deploy_retry_never_dispatches_twice(self):
        attempt=copy.deepcopy(ATTEMPT);run={'id':44,'run_attempt':1}
        with patch.object(d,'api',side_effect=RuntimeError('unknown')) as send:
            with self.assertRaises(ValueError):d.retry_failed_deploy(attempt,'hosting',run,lambda:None)
            self.assertEqual(attempt['deploymentRetries']['hosting'][0]['state'],'unknown')
            with self.assertRaises(ValueError):d.retry_failed_deploy(attempt,'hosting',run,lambda:None)
            self.assertEqual(send.call_count,1)


class AdmissionTests(unittest.TestCase):
    def test_admission_is_one_exact_task_and_preserves_other_grants(self):
        other=ROW|{'id':'other','taskId':'other-task','enabled':False,'execution':'legacy-worker'}
        policy={'schemaVersion':1,'enabled':False,'maxAttemptsPerStage':2,'automaticProduction':False,'workstreams':[other]}
        updated=admission.admission(policy,TASK,{'schemaVersion':1,'attempts':{}},A)
        self.assertFalse(policy['enabled']);self.assertTrue(updated['enabled'])
        self.assertEqual(updated['workstreams'][0],other)
        self.assertEqual(updated['workstreams'][1]['approvedSha'],A)
        self.assertEqual(updated['maxAttemptsPerStage'],2)

    def test_admission_cannot_reset_attempt_history_or_silently_follow_new_tip(self):
        policy={'schemaVersion':1,'enabled':False,'maxAttemptsPerStage':3,'automaticProduction':False,'workstreams':[]}
        with self.assertRaises(ValueError):admission.admission(policy,TASK,{'attempts':{}},B)
        with self.assertRaises(ValueError):admission.admission(policy,TASK,{'attempts':{'old':[ATTEMPT]}},A)

    def test_setup_missing_is_detected_before_any_write_or_call(self):
        with patch.dict(os.environ,{'GITHUB_REPOSITORY':g.REPO,'GITHUB_REF':'refs/heads/main','WORKER_KEY_PRESENT':'false'}),patch.object(admission,'api') as api:
            with self.assertRaisesRegex(ValueError,'credentials'):admission.main()
            self.assertFalse(api.called)


class DeliveryTests(unittest.TestCase):
    def setUp(self):
        import hashlib
        self.temp=tempfile.TemporaryDirectory();self.addCleanup(self.temp.cleanup)
        self.public=Path(self.temp.name)/'public';self.public.mkdir()
        (self.public/'coach.js').write_text('export const next = true;')
        self.release={'project':'hausaufgabe-staging','commit':B,'files':{'coach.js':hashlib.sha256((self.public/'coach.js').read_bytes()).hexdigest()}}

    def test_changed_file_is_physically_present_and_hash_bound_to_package(self):
        self.assertEqual(delivery.verify_packaging(self.release,B,['coach.js'],self.public),['coach.js'])

    def test_git_file_omitted_by_hosting_builder_cannot_count_as_delivered(self):
        (self.public/'ignored.js').write_text('source exists somewhere')
        with self.assertRaisesRegex(ValueError,'not published'):delivery.verify_packaging(self.release,B,['ignored.js'],self.public)

    def test_manifest_entry_without_actual_file_or_with_bad_bytes_blocks(self):
        with self.assertRaises(ValueError):delivery.verify_packaging(self.release|{'files':{'missing.js':'a'*64}},B,['missing.js'],self.public)
        with self.assertRaises(ValueError):delivery.verify_packaging(self.release|{'files':{'coach.js':'a'*64}},B,['coach.js'],self.public)

    def test_other_commit_or_project_or_empty_proof_cannot_be_reused(self):
        for update in [{'commit':A},{'project':'hausaufgabe-40294'}]:
            with self.assertRaises(ValueError):delivery.verify_packaging(self.release|update,B,['coach.js'],self.public)
        with self.assertRaises(ValueError):delivery.verify_packaging(self.release,B,[],self.public)

    def test_symlink_or_traversal_never_qualifies_as_packaged_file(self):
        outside=Path(self.temp.name)/'outside.js';outside.write_text('outside')
        (self.public/'link.js').symlink_to(outside)
        with self.assertRaises(ValueError):delivery.verify_packaging(self.release|{'files':{'link.js':'a'*64}},B,['link.js'],self.public)
        with self.assertRaises(ValueError):delivery.verify_packaging(self.release,B,['../outside.js'],self.public)


class ValidationReportTests(unittest.TestCase):
    def run_report(self, *, packaged=True, package_result='success', code='export const next = true;', rehearsal=False):
        import hashlib
        with tempfile.TemporaryDirectory() as directory:
            root=Path(directory);source=root/'source';source.mkdir();(root/'evidence').mkdir()
            def git(*args):
                return subprocess.check_output(['git',*args],cwd=source,stderr=subprocess.DEVNULL,text=True).strip()
            git('init');git('config','user.name','Test');git('config','user.email','test@example.invalid')
            (source/'coach.js').write_text('export const next = false;');git('add','.');git('commit','-m','base')
            base=git('rev-parse','HEAD')
            (source/'coach.js').write_text(code);git('commit','-am','candidate');head=git('rev-parse','HEAD')
            public=root/'public';public.mkdir();(public/'coach.js').write_text(code)
            files={'coach.js':hashlib.sha256(code.encode()).hexdigest()} if packaged else {}
            (public/'release.json').write_text(json.dumps({'project':'hausaufgabe-staging','commit':head,'files':files}))
            env=os.environ|{'EXPECTED_HEAD':head,'TEST_RESULT':'success','PACKAGE_RESULT':package_result,
                            'PACKAGED_PUBLIC':str(public),'REHEARSAL':str(rehearsal).lower()}
            proc=subprocess.run(['python3',str(Path(__file__).with_name('validation_report.py'))],cwd=root,env=env,capture_output=True,text=True)
            return proc.returncode,json.loads((root/'evidence/tests.json').read_text()),json.loads((root/'evidence/test-feedback.json').read_text()),base,head

    def test_real_git_candidate_and_physical_package_create_exact_bound_report(self):
        status,report,feedback,base,head=self.run_report()
        self.assertEqual(status,0)
        self.assertEqual(report,{'profile':'web-combined-v1','head':head,'base':base,'result':'success','packagedFiles':['coach.js']})
        self.assertEqual(feedback['packaging'],'')

    def test_actual_report_blocks_phantom_file_despite_successful_tests(self):
        status,report,feedback,_,_=self.run_report(packaged=False)
        self.assertNotEqual(status,0);self.assertEqual(report['result'],'blocked')
        self.assertIn('not published',feedback['packaging'])

    def test_missing_packaging_step_is_not_silently_accepted(self):
        status,report,feedback,_,_=self.run_report(package_result='skipped')
        self.assertNotEqual(status,0);self.assertEqual(report['packagedFiles'],[])
        self.assertIn('did not complete',feedback['packaging'])

    def test_invalid_changed_javascript_cannot_use_other_green_tests(self):
        status,report,feedback,_,_=self.run_report(code='export const next = ;')
        self.assertNotEqual(status,0);self.assertEqual(report['result'],'failure')
        self.assertIn('syntax invalid',feedback['packaging'])

    def test_rehearsal_never_creates_task_promotion_proof(self):
        status,report,_,_,_=self.run_report(rehearsal=True)
        self.assertEqual(status,0);self.assertEqual(report['profile'],'web-rehearsal-v1')
        self.assertEqual(report['packagedFiles'],[])


if __name__=='__main__':unittest.main()

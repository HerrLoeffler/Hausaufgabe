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
FRESH_DOCUMENTS = e.fresh_documents

A, B, C = 'a'*40, 'b'*40, 'c'*40
TASK = {'id': 'pilot-ui', 'base_sha': A, 'base_branch': p.WEB, 'risk': 'web-ui',
        'goal': 'Make coach copy clearer', 'acceptance': 'Manual next stays available', 'constraints': 'Preserve all other flows',
        'allowed_files': ['coach.js'], 'context_files': ['coach.css'], 'validation_profile': 'web-combined-v1', 'max_cost_usd': 16.5}
ROW = {'id': 'pilot', 'enabled': True, 'baseBranch': p.WEB, 'approvedSha': A, 'taskId': TASK['id'],
       'maxAutomaticStage': 'staging_deployed', 'execution': 'pipeline-v2'}
PUB = {'head': B, 'base': A, 'tree': C, 'candidateHash': 'd'*64, 'branch': 'automation/worker/pilot-ui/run-1', 'pr': 55, 'requestId': 'run-1'}
TESTS = {'profile': 'web-combined-v1', 'head': B, 'base': A, 'result': 'success'}
ATTEMPT = {'requestId': 'run-1', 'execution': 'pipeline-v2', 'taskId': TASK['id'], 'taskHash': p.digest(TASK),
           'approvedSha': A, 'controlSha': C, 'controlHash': 'h'*64, 'state': 'running', 'runId': 9, 'publication': PUB}


def review(role, verdict='approve'):
    result = {'verdict': verdict, 'head': B, 'base': A, 'candidateHash': PUB['candidateHash'], 'findings': []}
    if verdict != 'approve':
        result['findings'] = [{'severity': 'blocking', 'path': 'coach.js', 'message': 'Next button not reachable'}]
    return {'provider': p.MODELS[role]['provider'], 'model': p.MODELS[role]['model'], 'review': result,
            'usage': {'provider': p.MODELS[role]['provider'], 'model': p.MODELS[role]['model'], 'estimatedUsd': 0.01}}


class ContractTests(unittest.TestCase):
    def test_documentation_changes_preserve_control_version_but_code_changes_do_not(self):
        root=Path(__file__).resolve().parents[2]
        original=p.control_hash(root)
        with tempfile.TemporaryDirectory() as directory:
            mirror=Path(directory)
            for subpath in ['tools/automation', '.github/workflows']:
                (mirror/subpath).mkdir(parents=True,exist_ok=True)
            names=['pipeline.py','guardian.py','execution.py','continuation.py','model_calls.py','deployment_evidence.py','validation_report.py','validate-web.sh']
            for name in names:(mirror/'tools/automation'/name).write_text((root/'tools/automation'/name).read_text())
            for name in ['guardian-execution.yml','guardian-web-validation.yml','guardian-integrated-ci.yml']:
                (mirror/'.github/workflows'/name).write_text((root/'.github/workflows'/name).read_text())
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
        reviews = {role: review(role) for role in ('correctness','security')}
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
            if role!='security': self.assertIs(calls[0][1]['store'],False)
            self.assertEqual(result,{'ok':True}); self.assertGreater(usage['estimatedUsd'],0)

    def test_refusal_partial_output_model_drift_and_missing_usage_fail_closed(self):
        original=self.response('correctness',{'ok':True})
        for changes in [{'model':'other-model'},{'status':'incomplete'},{'usage':{}},
                        {'output':[{'type':'message','content':[{'type':'refusal','refusal':'no'}]}]},
                        {'usage':{'input_tokens':True,'output_tokens':1}}]:
            calls=[]
            with self.subTest(changes=changes), self.assertRaises((ValueError,KeyError)):
                m.call('correctness','Review',{},p.REVIEW_SCHEMA,lambda endpoint,body:calls.append(body) or (original|changes))
            self.assertEqual(len(calls),1)

    def test_input_budget_blocks_before_provider_call(self):
        calls=[]
        with self.assertRaises(ValueError):
            m.call('build','Implement',{'source':'x'*p.MAX_CONTEXT},p.CANDIDATE_SCHEMA,lambda *args:calls.append(args))
        self.assertFalse(calls)

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
        env=patch.dict(os.environ,{'GITHUB_REPOSITORY':g.REPO,'GUARDIAN_ENABLED':'true','CONTROL_SHA':C,'GITHUB_RUN_ID':'9','GITHUB_OUTPUT':str(self.root/'outputs')});env.start();self.addCleanup(env.stop)
        reader=patch.object(e,'read_ledger',side_effect=lambda:(copy.deepcopy(self.ledger),'blob'));reader.start();self.addCleanup(reader.stop)
        def write(value,blob):
            self.events.append('persist');self.ledger=copy.deepcopy(value);return 'blob-next'
        writer=patch.object(e,'write_ledger',side_effect=write);writer.start();self.addCleanup(writer.stop)
        e.save('contract',{'requestId':'run-1','task':TASK,'source':{'coach.js':'old','coach.css':'small'},'taskHash':p.digest(TASK)})
        e.save('publication',PUB);e.save('tests',TESTS)
        for role in ('correctness','security'):e.save(role,review(role))

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

    def test_dependency_failure_does_not_claim_actionable_test_failure(self):
        e.save('tests',TESTS|{'result':'blocked'})
        with patch.dict(os.environ,{'VALIDATION_RESULT':'failure','REVIEW_RESULT':'skipped'}):e.finalize('run-1')
        self.assertEqual(self.ledger['attempts']['pilot:pipeline-v2'][0]['state'],'stopped')

    def test_actual_test_failure_carries_bounded_feedback_for_repair(self):
        e.save('tests',TESTS|{'result':'failure'});e.save('test-feedback',{'tail':'assertion failed'})
        with patch.dict(os.environ,{'VALIDATION_RESULT':'failure','REVIEW_RESULT':'skipped'}):e.finalize('run-1')
        latest=self.ledger['attempts']['pilot:pipeline-v2'][0]
        self.assertEqual(latest['state'],'repairable');self.assertEqual(latest['feedback'][0]['details'],'assertion failed')

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
        def model(role,instructions,context,schema):
            roles.append(role)
            usage={'provider':p.MODELS[role]['provider'],'model':p.MODELS[role]['model'],'estimatedUsd':0.02}
            if role=='build':return {'summary':'clearer','files':[{'path':'coach.js','content':'export const next = true;'}]},usage
            binding=context['binding']
            return {'verdict':'approve',**binding,'findings':[]},usage
        with patch.object(e,'api',side_effect=api),patch.object(e,'call',side_effect=model):
            e.prepare('run-1');e.build();e.publish()
            publication=e.load('publication')
            e.save('tests',{'profile':'web-combined-v1','head':B,'base':A,'result':'success'})
            e.review('correctness');e.review('security');e.integrate();e.finalize('run-1')
        self.assertEqual(roles,['build','correctness','security'])
        self.assertEqual(current,B)
        latest=self.ledger['attempts']['pilot:pipeline-v2'][0]
        self.assertEqual(latest['state'],'integrated');self.assertEqual(latest['estimatedUsd'],0.06)
        self.assertEqual(publication['candidateHash'],e.load('candidate')['candidateHash'])


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


if __name__=='__main__':unittest.main()

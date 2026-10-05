"""Offline composition probes. All provider/cloud/run data are synthetic."""
import copy
import unittest
from unittest.mock import patch
from tools.automation import pipeline as p, continuation as c, deployment_evidence as d
from tools.automation import test_profile_deployment as deploy_fixtures
from tools.automation import test_profiles as profile_fixtures
from tools.automation.test_pipeline import A,B,C,ROW
from tools.automation.guardian import REPO

class RehearsalTests(unittest.TestCase):
    def test_game_integrated_ci_passes_its_own_component_handoff(self):
        attempt,ci,manifest,receipt=deploy_fixtures.DeploymentTests().fixtures()
        run={'id':90,'name':'Guardian integrated checks','path':'.github/workflows/guardian-integrated-ci.yml',
            'event':'workflow_dispatch','display_title':'Guardian integrated run-1','head_branch':'main','head_sha':C,
            'head_repository':{'full_name':REPO},'status':'completed','conclusion':'success','run_attempt':1}
        try:head=d.verify_ci(run,ci,attempt)
        except ValueError as exc:self.fail('Separate Games CI handoff composition missing: '+str(exc))
        self.assertEqual(head,B)
        for change in [{'run_attempt':2},{'head_sha':A},{'conclusion':'skipped'}]:
            with self.subTest(change=change),self.assertRaises(ValueError):d.verify_ci(run|change,ci,attempt)

    def test_history_unknown_dispatch_target_change_and_budget_survive_restart(self):
        task=profile_fixtures.game_task()
        row=ROW|{'baseBranch':task['base_branch']}
        history=[]
        reservation=p.reserve_budget([],task['id'],'2026-10-05',task)
        self.assertEqual(reservation['reservedUsd'],2.40)
        for state in ['reserved','dispatched','dispatch_unknown','running','stopped','integrated','staging_deployed']:
            with self.subTest(state=state):
                attempt={'taskId':task['id'],'requestId':'run-1','state':state,'reservedUsd':2.40,'providerResult':'unknown'}
                saved=copy.deepcopy([attempt]);before=copy.deepcopy(saved)
                action=c.select(row,task,saved,A,True)[0]
                self.assertIn(action,{'wait','stopped','receipts'})
                self.assertEqual(saved,before)
                self.assertEqual(c.select(row,task,saved,C,True)[0],'blocked')
        with self.assertRaisesRegex(ValueError,'exhausted'):p.reserve_budget([reservation],task['id'],'2026-10-06',task)

    def test_review_veto_package_mismatch_and_missing_receipt_cannot_advance(self):
        task,pub,tests,reviews=profile_fixtures.GamesIntegrationTests().fixtures()
        review=copy.deepcopy(reviews);review['security']['review']['verdict']='changes_requested'
        review['security']['review']['findings']=[{'severity':'blocking','path':task['allowed_files'][2],'message':'Network access'}]
        for t,r in [(tests,review),(tests|{'packageDigest':'f'*64},reviews)]:
            with self.assertRaises(ValueError):p.integration_gate(task,pub,t,r,A,B)
        attempt,_,_,_=deploy_fixtures.DeploymentTests().fixtures()
        before=copy.deepcopy(attempt)
        with patch.object(d,'api',side_effect=AssertionError('No external dispatch permitted')):
            self.assertEqual(d.reconcile_profile_deployment(attempt),'blocked')
        self.assertEqual(attempt['state'],'integrated')
        self.assertEqual(attempt['requestId'],before['requestId'])
        self.assertNotIn('user_tested',attempt.values())

class OfflineChainTests(unittest.TestCase):
    def test_real_controller_and_publisher_adapters_complete_only_synthetic_hosting(self):
        import base64,io,json,os,tempfile,zipfile,hashlib
        from pathlib import Path
        from contextlib import ExitStack
        from tools.automation import execution as e,games_publication as gp,games_static as gs
        from tools.automation.profiles import ROOT,profile_record
        from tools.automation.guardian import validate_policy
        task=profile_fixtures.game_task()
        policy=validate_policy({'schemaVersion':1,'enabled':True,'maxAttemptsPerStage':3,'automaticProduction':False,
            'enabledExecutionProfiles':['web-ui-v1','games-static-preview-v1'],'workstreams':[{
            'id':'pilot','enabled':True,'taskId':task['id'],'baseBranch':task['base_branch'],'approvedSha':A,
            'maxAutomaticStage':'staging_deployed','execution':'pipeline-v2',**profile_record(task)}]})
        reservation=p.reserve_budget([],task['id'],'2026-10-05',task)
        initial={'requestId':'run-1','execution':'pipeline-v2','taskId':task['id'],'taskHash':p.digest(task),'approvedSha':A,
            'controlSha':C,'controlHash':p.control_hash(ROOT),'state':'reserved',**profile_record(task)}
        ledger={'schemaVersion':1,'attempts':{'pilot:pipeline-v2':[initial]},'budgetReservations':[reservation]}
        sources={task['allowed_files'][0]:'<!doctype html><script src="app.js"></script>',task['allowed_files'][1]:'body{color:green}',
                 task['allowed_files'][2]:'console.log("old");'}
        blobs={str(i+1)*40:name for i,name in enumerate(sources)}
        target=[A];worker=[None];events=[];provider_calls=[];ci_holder={};receipt_holder={};zip_holder={}
        def read_ledger():return copy.deepcopy(ledger),'blob'
        def persist(value,blob):ledger.clear();ledger.update(copy.deepcopy(value));events.append('persist');return 'next'
        def api(path,method='GET',body=None):
            events.append((path,method,body))
            if path=='git/ref/heads/'+task['base_branch']:return {'object':{'sha':target[0]}}
            if path.startswith('git/ref/heads/automation/worker/'):return {'object':{'sha':B}}
            if path=='git/trees/'+A+'?recursive=1':return {'tree':[{'path':name,'sha':key,'mode':'100644','type':'blob','size':len(sources[name])} for key,name in blobs.items()]}
            if path.startswith('git/blobs/'):return {'content':base64.b64encode(sources[blobs[path.split('/')[-1]]].encode()).decode()}
            if path.startswith('git/matching-refs/heads/'):return [] if worker[0] is None else [worker[0]]
            if path=='git/commits/'+A:return {'tree':{'sha':C}}
            if path=='git/commits/'+B:return {'tree':{'sha':C},'parents':[{'sha':A}]}
            if path=='git/trees' and method=='POST':return {'sha':C}
            if path=='git/commits' and method=='POST':return {'sha':B}
            if path=='git/refs' and method=='POST':worker[0]=B;return {}
            if path=='pulls' and method=='POST':return {'number':55}
            if path=='pulls/55' and method=='GET':return {'state':'open','head':{'sha':B,'repo':{'full_name':REPO}},'base':{'ref':task['base_branch']}}
            if path=='git/refs/heads/'+task['base_branch'] and method=='PATCH':
                self.assertFalse(body['force']);target[0]=body['sha'];return {}
            if path in ['issues/55/comments','pulls/55','actions/workflows/guardian-integrated-ci.yml/dispatches']:return {}
            if path=='actions/runs/90':return {'id':90,'name':'Guardian integrated checks','path':'.github/workflows/guardian-integrated-ci.yml',
                'event':'workflow_dispatch','display_title':'Guardian integrated run-1','head_branch':'main','head_sha':C,
                'head_repository':{'full_name':REPO},'status':'completed','conclusion':'success','run_attempt':1}
            if path=='actions/runs/91':return {'id':91,'path':'.github/workflows/guardian-games-staging.yml','head_branch':'main',
                'head_repository':{'full_name':REPO},'status':'completed','conclusion':'success','run_attempt':1}
            if path.startswith('contents/.github/workflows/escape-expedition-preview.yml?ref='):
                return {'content':base64.b64encode(b'concurrency:\n  group: gradecrew-games-channel-gradecrew-escape-visual\n  cancel-in-progress: false\n').decode()}
            if path=='actions/runs/90/artifacts?per_page=100':return {'artifacts':[{'id':101,'name':'guardian-games-package',
                'size_in_bytes':len(zip_holder['data']),'expired':False,'digest':'sha256:'+hashlib.sha256(zip_holder['data']).hexdigest()}]}
            self.fail('Unmodelled external operation '+method+' '+path)
        def provider(role,instructions,context,schema,*,task=None):
            provider_calls.append(role)
            usage={'provider':p.MODELS[role]['provider'],'model':p.MODELS[role]['model'],'estimatedUsd':.01}
            if role=='build':return {'summary':'Synthetic copy change','files':[{'path':task['allowed_files'][2],'content':'console.log("new");'}]},usage
            self.assertNotIn('reviews',context)
            return {'verdict':'approve',**context['binding'],'findings':[]},usage
        def artifact(run,name,filename):return copy.deepcopy(ci_holder if run==90 else receipt_holder)
        def binary_command(args,**kwargs):
            if args[:2]==['gh','api']:return zip_holder['data']
            if args==['gcloud','auth','application-default','print-access-token']:return 'fake-token'
            self.fail('Unexpected command '+str(args))
        class Response(io.BytesIO):
            def __init__(self,data,url):super().__init__(data);self.url=url
            def __enter__(self):return self
            def __exit__(self,*args):self.close()
        with tempfile.TemporaryDirectory() as temp,ExitStack() as stack:
            folder=Path(temp);data=folder/'evidence';data.mkdir();old_cwd=Path.cwd()
            stack.callback(os.chdir,old_cwd);os.chdir(folder)
            for obj,name,value in [(e,'ROOT',ROOT),(e,'DATA',data),(gp,'FOLDER',folder/'games-package')]:stack.enter_context(patch.object(obj,name,value))
            for obj in [e,gp,d]:stack.enter_context(patch.object(obj,'api',side_effect=api))
            stack.enter_context(patch.object(e,'read_ledger',side_effect=read_ledger))
            for obj in [e,gp]:stack.enter_context(patch.object(obj,'write_ledger',side_effect=persist))
            stack.enter_context(patch.object(e,'fresh_documents',return_value=[policy,task]))
            stack.enter_context(patch.object(e,'call',side_effect=provider))
            stack.enter_context(patch.dict(os.environ,{'GITHUB_REPOSITORY':REPO,'GITHUB_REF':'refs/heads/main',
                'GUARDIAN_ENABLED':'true','CONTROL_SHA':C,'GITHUB_RUN_ID':'9','GITHUB_RUN_ATTEMPT':'1',
                'GITHUB_OUTPUT':str(folder/'outputs'),'GAMES_IDENTITY_VERIFIED':'true','GAMES_CHANNEL_OWNERSHIP_VERIFIED':'true'}))
            e.prepare('run-1');self.assertEqual(ledger['attempts']['pilot:pipeline-v2'][0]['state'],'running')
            e.build();e.publish();pub=e.load('publication')
            public=folder/'public';public.mkdir()
            for name,text in sources.items():(public/Path(name).name).write_text('console.log("new");' if name.endswith('app.js') else text)
            manifest=gs.validate_games_package(public,B,[task['allowed_files'][2]])
            e.save('tests',gs.games_test_report(B,A,task['profile_digest'],manifest,'success'))
            for role in p.REVIEW_ROLES:e.review(role)
            e.integrate();e.finalize('run-1')
            self.assertEqual(target[0],B);self.assertEqual(provider_calls,['build','correctness','security','qa'])
            os.environ['GITHUB_RUN_ID']='90';e.ci_prepare('run-1');e.ci_receipt('run-1')
            ci_holder.update(json.loads(Path('integrated-ci.json').read_text()))
            zipped=io.BytesIO()
            with zipfile.ZipFile(zipped,'w') as z:
                for f in public.iterdir():z.writestr('public/'+f.name,f.read_bytes())
                z.writestr('package-manifest.json',json.dumps(manifest))
            zip_holder['data']=zipped.getvalue()
            for obj in [gp,d]:stack.enter_context(patch.object(obj,'artifact_document',side_effect=artifact))
            stack.enter_context(patch.object(gp.subprocess,'check_output',side_effect=binary_command))
            os.environ['GITHUB_RUN_ID']='91';gp.prepare(90)
            preview='https://hausaufgabe-staging--gradecrew-escape-visual-fixture.web.app'
            def cloud(request,timeout):
                url=request.full_url
                if url.startswith('https://firebasehosting.googleapis.com/'):
                    return Response(json.dumps({'url':preview,'release':{'version':{'name':'sites/hausaufgabe-staging/versions/v123'}}}).encode(),url)
                name=url.split('?')[0].rsplit('/',1)[-1]
                self.assertTrue(url.startswith(preview+'/'));return Response((public/name).read_bytes(),url)
            stack.enter_context(patch.object(gp.urllib.request,'urlopen',side_effect=cloud))
            gp.verify();receipt_holder.update(json.loads(Path('receipt.json').read_text()))
            attempt=ledger['attempts']['pilot:pipeline-v2'][0]
            self.assertEqual(d.reconcile_profile_deployment(attempt),'verified')
            self.assertEqual(attempt['state'],'staging_deployed');self.assertEqual(attempt['taskId'],task['id'])
            self.assertEqual(ledger['budgetReservations'],[reservation]);self.assertFalse(policy['automaticProduction'])
            self.assertEqual(receipt_holder['device_test'],'not_performed');self.assertNotIn('user_tested',attempt.values())
            with self.assertRaises(ValueError):gp.prepare(90)
            self.assertEqual(provider_calls,['build','correctness','security','qa'])

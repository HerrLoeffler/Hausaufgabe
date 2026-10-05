"""Profile receipts never borrow Web deployments or manufacture human approval."""
import copy
import unittest
from tools.automation import pipeline as p
from tools.automation.test_profiles import game_task,GAME_TARGET,GamesIntegrationTests
from tools.automation.test_pipeline import ATTEMPT,B,C

class DeploymentTests(unittest.TestCase):
    def fixtures(self):
        task,pub,tests,_=GamesIntegrationTests().fixtures()
        manifest={'schemaVersion':1,'sourceSha':B,'files':{n:'0'*64 for n in ('app.js','index.html','styles.css')}}
        manifest['packageDigest']=p.digest(manifest)
        tests['packageDigest']=manifest['packageDigest']
        attempt=copy.deepcopy(ATTEMPT)|{'taskHash':p.digest(task),'state':'integrated','integratedSha':B,'ciRunId':90,
            'ciControlSha':C,'controlHash':p.control_hash(__import__('pathlib').Path(__file__).resolve().parents[2]),
            'publication':pub,'executionProfile':task['execution_profile'],'profileDigest':task['profile_digest'],
            'validationProfile':'games-static-v1','baseBranch':GAME_TARGET,
            'deploymentRequest':{'runId':91,'runAttempt':1,'state':'running'}}
        from tools.automation.execution import integrated_report
        ci=integrated_report(task,pub,tests,'run-1',90)
        receipt={'schemaVersion':1,'requestId':'run-1','taskId':task['id'],'executionProfile':task['execution_profile'],
            'profileDigest':task['profile_digest'],'controlHash':attempt['controlHash'],'controlSha':C,
            'candidateSha':B,'integratedSha':B,'ciRunId':90,'ciRunAttempt':1,'deployRunId':91,'deployRunAttempt':1,
            'packageDigest':manifest['packageDigest'],'project':'hausaufgabe-staging','site':'hausaufgabe-staging',
            'channel':'gradecrew-escape-visual','version':'sites/hausaufgabe-staging/versions/v123',
            'result':'success','published':True,'verifiedHashes':manifest['files'],
            'device_test':'not_performed','productionChanged':False,'expiresDays':30}
        return attempt,ci,manifest,receipt

    def verifier(self):
        from tools.automation import games_static
        if not hasattr(games_static,'verify_games_receipt'):self.fail('Games-only receipt verifier missing')
        return games_static.verify_games_receipt

    def test_exact_hosting_receipt_only_completes_technical_stage(self):
        attempt,ci,manifest,receipt=self.fixtures()
        checked=self.verifier()(receipt,attempt,ci,manifest,B)
        self.assertEqual(checked['channel'],'gradecrew-escape-visual')
        self.assertEqual(checked['device_test'],'not_performed')
        self.assertFalse(checked['productionChanged'])

    def test_wrong_receipt_or_new_target_blocks(self):
        attempt,ci,manifest,receipt=self.fixtures();verify=self.verifier()
        for change in [{'project':'hausaufgabe-40294'},{'channel':'gradecrew-app-integration'},{'candidateSha':C},
            {'profileDigest':'e'*64},{'controlHash':'e'*64},{'deployRunAttempt':2},{'ciRunId':89},
            {'result':'skipped'},{'published':False},{'version':''},{'verifiedHashes':{}},
            {'productionChanged':True},{'device_test':'passed'},{'expiresDays':31}]:
            with self.subTest(change=change),self.assertRaises(ValueError):verify(receipt|change,attempt,ci,manifest,B)
        with self.assertRaises(ValueError):verify(receipt,attempt,ci,manifest,C)
        with self.assertRaises(ValueError):verify(receipt,attempt,ci,manifest|{'files':{}},B)

    def test_missing_or_ambiguous_publisher_never_dispatches_or_retries(self):
        from tools.automation import deployment_evidence as d
        if not hasattr(d,'reconcile_profile_deployment'):self.fail('Profile-specific reconcile adapter missing')
        attempt,ci,manifest,receipt=self.fixtures()
        from unittest.mock import patch
        with patch.object(d,'api',side_effect=AssertionError('Must not call cloud/provider/GitHub mutation')):
            self.assertEqual(d.reconcile_profile_deployment(attempt),'blocked')
        self.assertEqual(attempt['state'],'integrated')
        self.assertIn('deploymentRequest',attempt)

class PublisherBoundaryTests(unittest.TestCase):
    def test_missing_identity_or_concurrent_manual_publisher_blocks_before_login(self):
        from tools.automation import games_static as g
        if not hasattr(g,'publication_setup_gate'):self.fail('Pre-auth channel/identity boundary missing')
        flags={'GAMES_IDENTITY_VERIFIED':'true','GAMES_CHANNEL_OWNERSHIP_VERIFIED':'true'}
        legacy='concurrency:\n  group: gradecrew-games-channel-gradecrew-escape-visual\n  cancel-in-progress: false\n'
        g.publication_setup_gate(flags,legacy)
        for env,workflow in [({},legacy),(flags,'concurrency:\n  group: old-${{ github.ref }}\n  cancel-in-progress: true\n'),
            (flags|{'GAMES_IDENTITY_VERIFIED':'false'},legacy)]:
            with self.assertRaises(ValueError):g.publication_setup_gate(env,workflow)

    def test_artifact_alias_symlink_extra_and_wrong_digest_fail(self):
        from tools.automation import games_static as g
        if not hasattr(g,'extract_games_artifact'):self.fail('Immutable artifact download boundary missing')
        import io,zipfile,tempfile,hashlib,json
        from pathlib import Path
        for bad in ['alias','symlink','extra','digest']:
            stream=io.BytesIO()
            with zipfile.ZipFile(stream,'w') as z:
                for name in ('app.js','index.html','styles.css'):
                    info=zipfile.ZipInfo(('public/../app.js' if bad=='alias' and name=='app.js' else 'public/'+name))
                    if bad=='symlink' and name=='app.js':info.create_system=3;info.external_attr=0o120777<<16
                    z.writestr(info,'safe')
                z.writestr('package-manifest.json','{}')
                if bad=='extra':z.writestr('firebase.json','{}')
            payload=stream.getvalue();checksum='sha256:'+hashlib.sha256(payload).hexdigest()
            if bad=='digest':checksum='sha256:'+'0'*64
            with tempfile.TemporaryDirectory() as tmp,self.assertRaises(ValueError):g.extract_games_artifact(payload,checksum,Path(tmp))

class ResumeReceiptTests(unittest.TestCase):
    def test_existing_matching_receipt_reuses_run_without_new_publication(self):
        from tools.automation import deployment_evidence as d
        from tools.automation.guardian import REPO
        from unittest.mock import patch
        attempt,ci,manifest,receipt=DeploymentTests().fixtures()
        attempt['gamesEvidence']={'ci':ci,'manifest':manifest}
        calls=[]
        def read_api(path,method='GET',body=None):
            self.assertEqual(method,'GET');calls.append(path)
            if path=='git/ref/heads/'+GAME_TARGET:return {'object':{'sha':B}}
            if path=='actions/runs/91':return {'id':91,'path':'.github/workflows/guardian-games-staging.yml','head_branch':'main',
                'head_repository':{'full_name':REPO},'status':'completed','conclusion':'success','run_attempt':1}
            self.fail('Unexpected operation: '+path)
        with patch.object(d,'api',side_effect=read_api),patch.object(d,'artifact_document',return_value=receipt):
            self.assertEqual(d.reconcile_profile_deployment(attempt),'verified')
            self.assertEqual(d.reconcile_profile_deployment(attempt),'verified')
        self.assertEqual(attempt['state'],'staging_deployed')
        self.assertEqual(set(attempt['deploymentReceipts']),{'hosting'})
        self.assertNotIn('user_tested',attempt.values())
        self.assertEqual(calls.count('actions/runs/91'),2)

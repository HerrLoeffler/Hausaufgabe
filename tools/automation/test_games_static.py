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

class RunnerIsolationTests(unittest.TestCase):
    def test_node_child_does_not_inherit_provider_cloud_or_github_credentials(self):
        from tools.automation import games_static as g
        if not hasattr(g,'node_environment'):self.fail('Credential-free child environment missing')
        env=g.node_environment({'PATH':'/trusted/node/bin','NODE_PATH':'/trusted/browser',
            'CODEX_WORKER_API_KEY':'fake-key','GH_TOKEN':'fake-token','GOOGLE_APPLICATION_CREDENTIALS':'/fake/key.json',
            'ACTIONS_ID_TOKEN_REQUEST_TOKEN':'fake-id-token','HOME':'/personal/home'})
        self.assertEqual(env,{'PATH':'/trusted/node/bin','NODE_PATH':'/trusted/browser'})

    def test_actions_runner_refuses_candidate_execution_without_isolated_user(self):
        from tools.automation import games_static as g
        if not hasattr(g,'node_command'):self.fail('Isolated Games runner command missing')
        with self.assertRaises(ValueError):g.node_command(['--test','/trusted/test.cjs'],{'GITHUB_ACTIONS':'true','PATH':'/trusted/bin'})
        command=g.node_command(['--test','/trusted/test.cjs'],{'GITHUB_ACTIONS':'true','GC_GAMES_SANDBOX_USER':'gradecrew-validator','PATH':'/trusted/bin'})
        self.assertEqual(command[:5],['sudo','-u','gradecrew-validator','env','-i'])
        self.assertEqual(command[-3:],['node','--test','/trusted/test.cjs'])

class FailureEvidenceTests(unittest.TestCase):
    def source_repo(self,app):
        import subprocess
        folder=Path(self.tmp.name)/'source';folder.mkdir()
        files=folder/'lab/escape-expedition';files.mkdir(parents=True)
        for name,text in {'index.html':'<!doctype html><script src="app.js"></script>',
            'styles.css':'body{color:green}','app.js':'console.log("old");'}.items():(files/name).write_text(text)
        def git(*args):return subprocess.check_output(['git','-C',str(folder),*args],text=True,stderr=subprocess.DEVNULL).strip()
        git('init');git('config','user.name','Offline fixture');git('config','user.email','fixture@example.invalid')
        git('add','.');git('commit','-m','base');base=git('rev-parse','HEAD')
        (files/'app.js').write_text(app);git('add','.');git('commit','-m','synthetic candidate')
        return folder,git('rev-parse','HEAD'),base

    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory();self.addCleanup(self.tmp.cleanup)

    def test_syntax_failure_writes_bound_actionable_evidence(self):
        import json,subprocess
        from tools.automation import games_static as g
        source,head,base=self.source_repo('const broken = ;')
        output=Path(self.tmp.name)/'evidence'
        with self.assertRaises((ValueError,subprocess.CalledProcessError)):
            g.validate_source(source,head,output,base)
        self.assertTrue((output/'tests.json').exists(),'Completed syntax failure must not become unknown')
        report=json.loads((output/'tests.json').read_text());feedback=json.loads((output/'test-feedback.json').read_text())
        self.assertEqual(report['head'],head);self.assertEqual(report['base'],base)
        self.assertEqual(report['result'],'failure');self.assertIn('SyntaxError',feedback['tail'])
        self.assertNotEqual(report['result'],'success')

    def test_browser_failure_overwrites_success_without_claiming_package_validation(self):
        import json,subprocess
        from tools.automation import games_static as g
        output=Path(self.tmp.name)/'evidence';output.mkdir()
        (output/'tests.json').write_text(json.dumps({'head':'a'*40,'base':'b'*40,'result':'success'}))
        if not hasattr(g,'record_validation_failure'):self.fail('Browser/deterministic failure evidence adapter missing')
        failure=subprocess.CalledProcessError(1,['node','smoke'],output='AssertionError: learner dialog never opened')
        g.record_validation_failure(output,'a'*40,'b'*40,failure)
        report=json.loads((output/'tests.json').read_text())
        self.assertEqual(report['result'],'failure');self.assertEqual(report['head'],'a'*40)
        feedback=json.loads((output/'test-feedback.json').read_text())
        self.assertIn('learner dialog',feedback['tail']);self.assertLessEqual(len(feedback['tail']),6000)
        g.record_validation_failure(output,'a'*40,'b'*40,FileNotFoundError('browser unavailable'))
        self.assertEqual(json.loads((output/'tests.json').read_text())['result'],'blocked')


class RealUidValidationTests(unittest.TestCase):
    def test_successful_package_is_reported_and_cleaned_with_the_actual_ci_user(self):
        import os,subprocess,json,shutil
        from tools.automation import games_static as g
        if os.environ.get('GC_GAMES_SANDBOX_USER')!='gradecrew-validator':self.skipTest('Real separate-UID regression requires the Linux CI fixture')
        original=Path(os.environ['GC_GAMES_REAL_UID_TEST_SOURCE'])/'lab/escape-expedition'
        with tempfile.TemporaryDirectory() as temp:
            source=Path(temp)/'source';files=source/'lab/escape-expedition';files.mkdir(parents=True)
            for name in ('index.html','styles.css','app.js'):shutil.copyfile(original/name,files/name)
            app=(files/'app.js').read_text()+'\n// Synthetic cleanup candidate only.\n'
            def git(*args):return subprocess.check_output(['git','-C',str(source),*args],text=True,stderr=subprocess.DEVNULL).strip()
            git('init');git('config','user.name','Synthetic UID fixture');git('config','user.email','fixture@example.invalid')
            git('add','.');git('commit','-m','original fixture');base=git('rev-parse','HEAD')
            (files/'app.js').write_text(app);git('add','.');git('commit','-m','synthetic compatible timings');head=git('rev-parse','HEAD')
            output=Path(temp)/'evidence'
            from unittest.mock import patch
            control=synthetic_validation_root(Path(temp)/'control')
            with patch.object(g,'ROOT',control):
                report=g.validate_source(source,head,output,base)
            self.assertEqual(report['result'],'success')
            self.assertEqual(json.loads((output/'tests.json').read_text())['head'],head)
            manifest=json.loads((output/'package-manifest.json').read_text())
            self.assertEqual(manifest['sourceSha'],head)
            self.assertEqual(set(manifest['files']),{'app.js','index.html','styles.css'})

class OwnershipBoundaryTests(unittest.TestCase):
    def test_builder_ownership_is_reclaimed_before_successful_temp_cleanup(self):
        """Model unavailable sudo ownership boundary; run real Node/tests/files.

        A separate Linux CI test below verifies this against the actual UID.
        """
        import os,subprocess,json
        from unittest.mock import patch
        from tools.automation import games_static as g
        real_tempfile=tempfile.TemporaryDirectory;real_run=subprocess.run
        real_source=Path(os.environ['GC_GAMES_REAL_UID_TEST_SOURCE'])/'lab/escape-expedition' if os.environ.get('GC_GAMES_REAL_UID_TEST_SOURCE') else Path(__file__).resolve().parents[3]/'games-snapshot-checkout/lab/escape-expedition'
        if not real_source.is_dir():self.skipTest('Pinned local Games source fixture is unavailable; Linux real-UID test covers this boundary')
        borrowed=set()
        class OwnerContext:
            def __init__(self,*args,**kwargs):self.inner=real_tempfile(*args,**kwargs)
            def __enter__(self):return self.inner.__enter__()
            def __exit__(self,*args):
                try:
                    if borrowed:raise PermissionError('Runner cannot delete validator-owned package/public')
                finally:self.inner.__exit__(*args)
        def boundary_run(command,**kwargs):
            if command[:3]==['sudo','chown','gradecrew-validator']:
                borrowed.add(command[-1]);return subprocess.CompletedProcess(command,0)
            if command[:4]==['sudo','chown','-R','-h']:
                self.assertEqual(command[4],str(os.getuid())+':'+str(os.getgid()))
                borrowed.discard(command[-1]);return subprocess.CompletedProcess(command,0)
            if command[:5]==['sudo','-u','gradecrew-validator','env','-i']:
                at=command.index('node');env={item.split('=',1)[0]:item.split('=',1)[1] for item in command[5:at]}
                return real_run(command[at:],**(kwargs|{'env':env}))
            return real_run(command,**kwargs)
        with real_tempfile() as temp:
            fixture=FailureEvidenceTests();fixture.tmp=type('Tmp',(),{'name':temp})()
            app=(real_source/'app.js').read_text()+'\n// Synthetic cleanup candidate only.\n'
            source,head,base=fixture.source_repo(app)
            for name in ('index.html','styles.css'):
                (source/'lab/escape-expedition'/name).write_bytes((real_source/name).read_bytes())
            # Include these copied source files in a local synthetic commit.
            subprocess.run(['git','-C',str(source),'add','.'],check=True,capture_output=True)
            subprocess.run(['git','-C',str(source),'commit','--amend','--no-edit'],check=True,capture_output=True)
            head=subprocess.check_output(['git','-C',str(source),'rev-parse','HEAD'],text=True).strip()
            control=synthetic_validation_root(Path(temp)/'control')
            with patch.object(g,'ROOT',control),patch.object(g.tempfile,'TemporaryDirectory',OwnerContext),patch.object(g.subprocess,'run',side_effect=boundary_run), \
                 patch.dict(os.environ,{'GC_GAMES_SANDBOX_USER':'gradecrew-validator'}):
                try:report=g.validate_source(source,head,Path(temp)/'evidence',base)
                except PermissionError as exc:self.fail(str(exc))
            self.assertEqual(report['result'],'success');self.assertEqual(borrowed,set())


def synthetic_validation_root(target):
    """Ownership regression only; never qualifies the original Games suite."""
    import shutil
    from tools.automation import games_static as g
    target.parent.chmod(0o755)
    tools=target/'tools/automation';tools.mkdir(parents=True)
    for name in ('profiles.py','pipeline.py'):shutil.copyfile(g.ROOT/'tools/automation'/name,tools/name)
    fixtures=tools/'fixtures/games-static-v1'
    shutil.copytree(g.ROOT/'tools/automation/fixtures/games-static-v1',fixtures)
    (fixtures/'PROVENANCE.md').write_text('Synthetic ownership fixture only; does not qualify the actual Games source.\n')
    (fixtures/'tools/games/escape-expedition.test.cjs').write_text(
        "const test=require('node:test'); const fs=require('node:fs');\n"
        "test('isolated user can read all three source files',()=> {\n"
        "for(const name of ['index.html','styles.css','app.js']) fs.accessSync('lab/escape-expedition/'+name,fs.constants.R_OK);\n"
        "});\n")
    return target

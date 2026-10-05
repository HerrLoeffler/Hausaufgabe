"""Credential-free Games validation and evidence, separate from the Web site."""
from __future__ import annotations
import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import tempfile
from .pipeline import digest, sha
from .profiles import GAMES, ROOT, profile_digest

NAMES = ('app.js','index.html','styles.css')
SNAPSHOT = '6434ddefb83cffca7bde5a7347ed6d2f56d5cb45'


def validate_games_package(public,source_sha,changed_files):
    sha(source_sha); public=Path(public)
    if public.is_symlink() or not public.is_dir(): raise ValueError('Invalid public directory')
    if not isinstance(changed_files,list) or not changed_files or len(set(changed_files))!=len(changed_files) or any(x not in GAMES.writable_paths for x in changed_files):
        raise ValueError('Package changes outside Games profile')
    if sorted(p.name for p in public.iterdir()) != list(NAMES): raise ValueError('Package must contain exactly three files')
    files={}
    for name in NAMES:
        file=public/name
        if file.is_symlink() or not file.is_file() or not 0<file.stat().st_size<=160000: raise ValueError('Invalid package file')
        data=file.read_bytes()
        try: text=data.decode('utf-8')
        except UnicodeError as exc: raise ValueError('UTF-8 package required') from exc
        if '\x00' in text: raise ValueError('Binary package data')
        # Static first profile has no external assets/API. Runtime smoke and
        # trusted CSP add separate protection; this is not a JS security proof.
        if re.search(r'https?\s*:|["\'(=]\s*//|@import\b|url\s*\(',text,re.I):
            raise ValueError('External/runtime resource outside static profile')
        files[name]=hashlib.sha256(data).hexdigest()
    manifest={'schemaVersion':1,'sourceSha':source_sha,'files':files}
    return manifest | {'packageDigest':digest(manifest)}


def games_test_report(head,base,profile_hash,package,test_result):
    sha(head); sha(base)
    if not isinstance(profile_hash,str) or not re.fullmatch('[a-f0-9]{64}',profile_hash): raise ValueError('Exact profile digest required')
    if test_result!='success' or package.get('sourceSha')!=head: raise ValueError('Passing exact package validation required')
    content={k:package[k] for k in ('schemaVersion','sourceSha','files')}
    if package.get('packageDigest')!=digest(content): raise ValueError('Package manifest digest differs')
    return {'profile':GAMES.validation_profile,'executionProfile':GAMES.id,'profileDigest':profile_hash,
            'head':head,'base':base,'result':'success','packagedFiles':list(NAMES),'packageDigest':package['packageDigest']}


def node_environment(environ):
    return {k:environ[k] for k in ('PATH','NODE_PATH','PLAYWRIGHT_BROWSERS_PATH') if k in environ}


def node_command(args,environ):
    user=environ.get('GC_GAMES_SANDBOX_USER')
    if environ.get('GITHUB_ACTIONS')=='true' and user!='gradecrew-validator':
        raise ValueError('Games CI requires isolated unprivileged validator user')
    if user:
        if user!='gradecrew-validator':raise ValueError('Unknown validator identity')
        return ['sudo','-u',user,'env','-i']+[k+'='+v for k,v in node_environment(environ).items()]+['node',*args]
    return ['node',*args]


def run_node(args,cwd=None):
    subprocess.run(node_command(args,os.environ),cwd=cwd,env=node_environment(os.environ),check=True)


def validate_source(source,head,output,base=None):
    source=Path(source).resolve(); output=Path(output).resolve(); output.mkdir(parents=True,exist_ok=True)
    actual=subprocess.check_output(['git','-C',str(source),'rev-parse','HEAD'],text=True).strip()
    if actual!=sha(head): raise ValueError('Games checkout differs')
    parents=subprocess.check_output(['git','-C',str(source),'show','-s','--format=%P',head],text=True).split()
    if len(parents)!=1: raise ValueError('Games validation needs direct candidate')
    base=sha(base or parents[0])
    changes=subprocess.check_output(['git','-C',str(source),'diff','--name-only',base,head],text=True).splitlines()
    # Validation-only snapshot rehearsal may explicitly verify all three files.
    if base==head: changes=list(GAMES.writable_paths)
    if any(name not in GAMES.writable_paths for name in changes): raise ValueError('Source changes outside Games profile')
    fixtures=ROOT/'tools/automation/fixtures/games-static-v1'
    with tempfile.TemporaryDirectory(prefix='gc-games-static-') as temp:
        scratch=Path(temp)/'source'; shutil.copytree(fixtures,scratch,symlinks=False)
        for name in GAMES.writable_paths:
            file=source/name
            if file.is_symlink() or not file.is_file(): raise ValueError('Candidate source is missing or symlink')
            target=scratch/name; target.parent.mkdir(parents=True,exist_ok=True); shutil.copyfile(file,target)
        Path(temp).chmod(0o755)
        for path in scratch.rglob('*'):
            path.chmod(0o555 if path.is_dir() else 0o444)
        scratch.chmod(0o555)
        build=Path(temp)/'build';build.mkdir()
        if os.environ.get('GC_GAMES_SANDBOX_USER'):
            subprocess.run(['sudo','chown','gradecrew-validator',str(build)],check=True)
        run_node(['--check',str(scratch/'lab/escape-expedition/app.js')])
        run_node(['--test',str(scratch/'tools/games/escape-expedition.test.cjs')],cwd=scratch)
        package=build/'package'
        run_node([str(fixtures/'tools/build-lab-escape-expedition.mjs'),str(package)],cwd=scratch)
        manifest=validate_games_package(package/'public',head,changes)
        for name in NAMES:
            if (package/'public'/name).read_bytes()!=(source/'lab/escape-expedition'/name).read_bytes(): raise ValueError('Builder changed candidate bytes')
        shutil.copytree(package/'public',output/'public',dirs_exist_ok=True)
        for path in scratch.rglob('*'):
            if path.is_dir():path.chmod(0o755)
        scratch.chmod(0o755)
    report=games_test_report(head,base,profile_digest(GAMES,ROOT),manifest,'success')
    (output/'package-manifest.json').write_text(json.dumps(manifest,sort_keys=True)+'\n')
    (output/'tests.json').write_text(json.dumps(report,sort_keys=True)+'\n')
    return report


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--source',required=True);parser.add_argument('--head',required=True)
    parser.add_argument('--output',default='evidence');parser.add_argument('--base')
    args=parser.parse_args();validate_source(args.source,args.head,args.output,args.base)

if __name__=='__main__':main()


def verify_games_receipt(receipt,attempt,ci,manifest,current_target):
    """A successful workflow alone is insufficient; require exact publication."""
    from .profiles import GAMES
    content={k:manifest.get(k) for k in ('schemaVersion','sourceSha','files')}
    files=content['files']
    if content['schemaVersion']!=1 or not isinstance(files,dict) or set(files)!=set(NAMES) or any(not isinstance(x,str) or not re.fullmatch('[a-f0-9]{64}',x) for x in files.values()):
        raise ValueError('Incomplete package manifest')
    if manifest.get('packageDigest')!=digest(content): raise ValueError('Manifest changed')
    head=sha(attempt['integratedSha'])
    if current_target!=head or attempt['publication']['head']!=head or content['sourceSha']!=head:
        raise ValueError('Target/package superseded')
    required_ci={'requestId':attempt['requestId'],'commit':head,'branch':GAMES.allowed_targets[0],
        'runId':attempt['ciRunId'],'runAttempt':1,'result':'success','profile':GAMES.validation_profile,
        'executionProfile':GAMES.id,'profileDigest':attempt['profileDigest'],'packageDigest':manifest['packageDigest']}
    if ci!=required_ci: raise ValueError('Exact Games CI ownership required')
    request=attempt.get('deploymentRequest',{})
    if request.get('state') not in {'running','completed'} or type(request.get('runId')) is not int or request.get('runAttempt')!=1:
        raise ValueError('Missing publication ownership')
    expected={'schemaVersion':1,'requestId':attempt['requestId'],'taskId':attempt['taskId'],'executionProfile':GAMES.id,
        'profileDigest':attempt['profileDigest'],'controlHash':attempt['controlHash'],'controlSha':attempt['controlSha'],
        'candidateSha':head,'integratedSha':head,'ciRunId':attempt['ciRunId'],'ciRunAttempt':1,
        'deployRunId':request['runId'],'deployRunAttempt':1,'packageDigest':manifest['packageDigest'],
        'project':'hausaufgabe-staging','site':'hausaufgabe-staging','channel':'gradecrew-escape-visual',
        'result':'success','published':True,'verifiedHashes':files,'device_test':'not_performed','productionChanged':False,'expiresDays':30}
    if any(type(receipt.get(k)) is not type(v) or receipt.get(k)!=v for k,v in expected.items()):
        raise ValueError('Publication receipt binding differs')
    if not isinstance(receipt.get('version'),str) or not re.fullmatch(r'sites/hausaufgabe-staging/versions/[A-Za-z0-9_-]+',receipt['version']):
        raise ValueError('Published Hosting version missing')
    return receipt


def publication_setup_gate(flags,legacy_workflow):
    if any(flags.get(name)!='true' for name in ('GAMES_IDENTITY_VERIFIED','GAMES_CHANNEL_OWNERSHIP_VERIFIED')):
        raise ValueError('Games Hosting identity/channel setup unverified; no cloud login')
    groups=re.findall(r'^\s*group:\s*([^\n]+)',legacy_workflow,re.M)
    cancels=re.findall(r'^\s*cancel-in-progress:\s*([^\n]+)',legacy_workflow,re.M)
    if groups!=['gradecrew-games-channel-gradecrew-escape-visual'] or cancels!=['false']:
        raise ValueError('Existing manual Games publisher has not joined shared channel ownership')


def extract_games_artifact(payload,artifact_digest,folder):
    import io,stat,zipfile
    if not 0<len(payload)<=1024*1024 or artifact_digest!='sha256:'+hashlib.sha256(payload).hexdigest():
        raise ValueError('Immutable Games artifact digest differs')
    expected={'public/'+x for x in NAMES}|{'package-manifest.json'}
    folder=Path(folder);folder.mkdir(parents=True,exist_ok=True)
    if folder.is_symlink():raise ValueError('Unsafe output folder')
    folder=folder.resolve()
    with zipfile.ZipFile(io.BytesIO(payload)) as z:
        infos=z.infolist()
        if len(infos)!=4 or {x.filename for x in infos}!=expected:raise ValueError('Artifact file scope differs')
        for info in infos:
            mode=info.external_attr>>16
            if info.file_size>160000 or info.flag_bits&1 or stat.S_ISLNK(mode) or stat.S_IFMT(mode) not in (0,stat.S_IFREG):
                raise ValueError('Unsafe artifact entry')
        for info in infos:
            target=folder/info.filename
            if target.is_symlink() or any(p.is_symlink() for p in target.parents if p!=folder.parent):raise ValueError('Unsafe output alias')
            target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(z.read(info))
    return json.loads((folder/'package-manifest.json').read_text())

"""Trusted main-only Hosting publication. Never checkout/build Games after login."""
import argparse
import base64
import datetime as dt
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
import urllib.request
from .guardian import api,REPO,write_ledger
from .execution import approved,output,integrated_report
from .pipeline import sha
from .profiles import GAMES
from .games_static import (publication_setup_gate,extract_games_artifact,validate_games_package,verify_games_receipt)
from .deployment_evidence import artifact_document,verify_ci

FOLDER=Path('games-package')
COMMON_CHANNEL='gradecrew-games-channel-gradecrew-escape-visual'


def bound_source(run_id):
    run=api('actions/runs/'+str(int(run_id)))
    if (run.get('path')!='.github/workflows/guardian-integrated-ci.yml' or run.get('head_branch')!='main'
        or run.get('status')!='completed' or run.get('conclusion')!='success' or run.get('run_attempt',1)!=1
        or run.get('head_repository',{}).get('full_name')!=REPO):raise ValueError('No trusted first-attempt integrated CI')
    ci=artifact_document(run_id,'guardian-integrated-evidence','integrated-ci.json')
    if ci.get('executionProfile')!=GAMES.id:return None
    ledger,blob,key,attempt,task=approved(ci['requestId'])
    verify_ci(run,ci,attempt)
    if attempt.get('ciRunId')!=int(run_id) or attempt.get('ciControlSha')!=run.get('head_sha') or attempt.get('integratedSha')!=ci.get('commit'):
        raise ValueError('Integrated Games CI ownership differs')
    if api('git/ref/heads/'+task['base_branch'])['object']['sha']!=ci['commit']:raise ValueError('Target superseded')
    legacy=api('contents/.github/workflows/escape-expedition-preview.yml?ref='+sha(ci['commit']))
    publication_setup_gate(os.environ,base64.b64decode(legacy['content']).decode())
    return ledger,blob,key,attempt,task,ci


def prepare(run_id):
    if os.getenv('GITHUB_REPOSITORY')!=REPO or os.getenv('GITHUB_REF')!='refs/heads/main':raise ValueError('Main publisher only')
    if os.environ.get('GITHUB_RUN_ATTEMPT','1')!='1':raise ValueError('No publisher workflow reruns')
    state=bound_source(run_id)
    if state is None:output(games='false');return
    ledger,blob,key,attempt,task,ci=state
    if attempt.get('deploymentRequest'):raise ValueError('Publication already reserved/unknown; inspect existing run, never repeat')
    artifacts=api(f'actions/runs/{int(run_id)}/artifacts?per_page=100')['artifacts']
    matches=[a for a in artifacts if a['name']=='guardian-games-package' and not a.get('expired')]
    if len(matches)!=1 or not 0<matches[0]['size_in_bytes']<=1024*1024:raise ValueError('Package artifact missing/ambiguous/oversized')
    meta=matches[0]
    data=subprocess.check_output(['gh','api',f"repos/{REPO}/actions/artifacts/{meta['id']}/zip"],timeout=30,stderr=subprocess.DEVNULL)
    manifest=extract_games_artifact(data,meta.get('digest'),FOLDER)
    physical=validate_games_package(FOLDER/'public',ci['commit'],task['allowed_files'])
    if manifest!=physical or manifest['packageDigest']!=ci['packageDigest'] or ci['profileDigest']!=task['profile_digest']:
        raise ValueError('Integrated package differs')
    test_report={'profile':'games-static-v1','executionProfile':GAMES.id,'profileDigest':task['profile_digest'],'head':ci['commit'],
        'base':task['base_sha'],'result':'success','packagedFiles':['app.js','index.html','styles.css'],'packageDigest':manifest['packageDigest']}
    if integrated_report(task,attempt['publication'],test_report,attempt['requestId'],int(run_id))!=ci:raise ValueError('CI report differs')
    (FOLDER/'firebase.json').write_text(json.dumps({'hosting':{'site':'hausaufgabe-staging','public':'public','ignore':['**/.*'],
        'headers':[{'source':'**','headers':[{'key':'Cache-Control','value':'no-cache'},
            {'key':'Content-Security-Policy','value':"default-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-src 'none'"}]}]}})+'\n')
    attempt['deploymentRequest']={'runId':int(os.environ['GITHUB_RUN_ID']),'runAttempt':1,'state':'running','reservedAt':dt.datetime.now(dt.timezone.utc).isoformat()}
    attempt['gamesEvidence']={'ci':ci,'manifest':manifest}
    write_ledger(ledger,blob)
    Path('games-publication-binding.json').write_text(json.dumps({'requestId':attempt['requestId'],'upstreamRunId':int(run_id)})+'\n')
    output(games='true')


def recheck():
    binding=json.loads(Path('games-publication-binding.json').read_text())
    state=bound_source(binding['upstreamRunId'])
    if state is None:raise ValueError('Games profile changed')
    ledger,blob,key,attempt,task,ci=state
    request=attempt.get('deploymentRequest',{})
    if request.get('runId')!=int(os.environ['GITHUB_RUN_ID']) or request.get('runAttempt')!=1 or request.get('state')!='running':
        raise ValueError('Publication ownership changed')
    manifest=json.loads((FOLDER/'package-manifest.json').read_text())
    if validate_games_package(FOLDER/'public',ci['commit'],task['allowed_files'])!=manifest or manifest!=attempt['gamesEvidence']['manifest']:
        raise ValueError('Package changed before publication')
    return state


def verify():
    ledger,blob,key,attempt,task,ci=recheck()
    # Only trusted Python/gcloud runs with credentials. No candidate JS/HTML runs.
    token=subprocess.check_output(['gcloud','auth','application-default','print-access-token'],text=True,stderr=subprocess.DEVNULL).strip()
    endpoint='https://firebasehosting.googleapis.com/v1beta1/sites/hausaufgabe-staging/channels/gradecrew-escape-visual'
    def channel():
        req=urllib.request.Request(endpoint,headers={'Authorization':'Bearer '+token})
        with urllib.request.urlopen(req,timeout=30) as response:return json.load(response)
    published=channel();url=published.get('url','').rstrip('/')
    version=published.get('release',{}).get('version',{}).get('name')
    if not re.fullmatch(r'https://hausaufgabe-staging--gradecrew-escape-visual-[a-z0-9]+\.web\.app',url):raise ValueError('Wrong Games channel URL')
    manifest=attempt['gamesEvidence']['manifest']
    for name,expected in manifest['files'].items():
        req=urllib.request.Request(url+'/'+name+'?verify='+ci['commit'],headers={'Cache-Control':'no-cache'})
        with urllib.request.urlopen(req,timeout=30) as response:
            if response.url.split('?')[0]!=url+'/'+name or hashlib.sha256(response.read(160001)).hexdigest()!=expected:
                raise ValueError('Published Games bytes differ')
    if channel().get('release',{}).get('version',{}).get('name')!=version:raise ValueError('Concurrent channel publication detected')
    receipt={'schemaVersion':1,'requestId':attempt['requestId'],'taskId':attempt['taskId'],'executionProfile':GAMES.id,
        'profileDigest':attempt['profileDigest'],'controlHash':attempt['controlHash'],'controlSha':attempt['controlSha'],
        'candidateSha':ci['commit'],'integratedSha':ci['commit'],'ciRunId':attempt['ciRunId'],'ciRunAttempt':1,
        'deployRunId':int(os.environ['GITHUB_RUN_ID']),'deployRunAttempt':1,'packageDigest':manifest['packageDigest'],
        'project':'hausaufgabe-staging','site':'hausaufgabe-staging','channel':'gradecrew-escape-visual','version':version,
        'result':'success','published':True,'verifiedHashes':manifest['files'],'device_test':'not_performed','productionChanged':False,
        'expiresDays':30,'url':url}
    verify_games_receipt(receipt,attempt,ci,manifest,ci['commit'])
    Path('receipt.json').write_text(json.dumps(receipt)+'\n')
    attempt['deploymentRequest']['state']='completed'
    # Only reconciliation with the completed workflow/artifact may change stage.
    write_ledger(ledger,blob)


def main():
    parser=argparse.ArgumentParser();parser.add_argument('command',choices=['prepare','recheck','verify']);args=parser.parse_args()
    if args.command=='prepare':prepare(int(os.environ['UPSTREAM_RUN_ID']))
    elif args.command=='recheck':recheck()
    else:verify()

if __name__=='__main__':main()

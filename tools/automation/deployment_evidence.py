"""Bind explicit integrated CI and existing deploy receipts to a ledger attempt."""
from __future__ import annotations

import hashlib
import io
import json
import os
from pathlib import Path
import subprocess
import zipfile

from .guardian import api, REPO
from .pipeline import WEB, sha, identifier

ROOT = Path(__file__).resolve().parents[2]


def committed_request():
    if os.getenv('GITHUB_REPOSITORY') != REPO or os.getenv('GITHUB_REF') != 'refs/heads/main':
        raise ValueError('Staging handoff requires trusted main')
    paths = list((ROOT / 'automation/deployment-requests').glob('*.json'))
    if len(paths) != 1:
        raise ValueError('Exactly one committed staging handoff required')
    request = json.loads(paths[0].read_text())
    if paths[0].stem != identifier(request['id']):
        raise ValueError('Staging request filename differs')
    return request


def verify_request(request, report, attempt):
    if set(request) != {'id', 'requestId', 'upstreamRunId', 'commit'}:
        raise ValueError('Explicit staging request binding required')
    identifier(request['id']); identifier(request['requestId']); sha(request['commit'])
    if (type(request['upstreamRunId']) is not int or request['upstreamRunId'] <= 0
            or request['upstreamRunId'] != report['runId']
            or request['upstreamRunId'] != attempt.get('ciRunId')
            or request['requestId'] != report['requestId']
            or request['requestId'] != attempt['requestId']
            or request['commit'] != report['commit']
            or request['commit'] != attempt['integratedSha']):
        raise ValueError('Staging request differs from verified CI ownership')


def artifact_document(run_id, name, filename):
    artifacts = api(f'actions/runs/{int(run_id)}/artifacts?per_page=100')['artifacts']
    matches = [a for a in artifacts if a['name'] == name and not a.get('expired')]
    if len(matches) != 1:
        raise ValueError('Missing or ambiguous trusted evidence artifact')
    metadata = matches[0]
    if not 0 < metadata['size_in_bytes'] <= 1024 * 1024:
        raise ValueError('Oversized artifact')
    payload = subprocess.check_output(['gh', 'api', f"repos/{REPO}/actions/artifacts/{metadata['id']}/zip"], timeout=30, stderr=subprocess.DEVNULL)
    if len(payload) > 1024 * 1024 or metadata.get('digest') != 'sha256:' + hashlib.sha256(payload).hexdigest():
        raise ValueError('Artifact digest differs')
    with zipfile.ZipFile(io.BytesIO(payload)) as archive:
        infos = archive.infolist()
        if len(infos) != 1 or infos[0].filename != filename or infos[0].file_size > 65536:
            raise ValueError('Unexpected artifact contents')
        return json.loads(archive.read(filename))


def verify_ci(run, report, attempt):
    if run.get('name') not in {'Guardian integrated checks', 'Guardian integrated ' + attempt['requestId']} or run.get('path') != '.github/workflows/guardian-integrated-ci.yml' or run.get('event') != 'workflow_dispatch':
        raise ValueError('Wrong CI workflow')
    if run.get('conclusion') != 'success' or run.get('status') != 'completed' or run.get('run_attempt', 1) != 1:
        raise ValueError('Integrated CI not successful on first attempt')
    if run.get('head_branch') != 'main' or run.get('head_sha') != attempt.get('ciControlSha', attempt['controlSha']) or run.get('head_repository', {}).get('full_name') != REPO:
        raise ValueError('Untrusted CI provenance')
    expected = {'requestId': attempt['requestId'], 'commit': attempt['integratedSha'], 'branch': WEB,
                'runId': run['id'], 'result': 'success', 'profile': 'web-combined-v1'}
    if attempt.get('executionProfile') == 'games-static-preview-v1':
        from .profiles import GAMES
        import re
        package_digest=report.get('packageDigest')
        if not isinstance(package_digest,str) or not re.fullmatch('[a-f0-9]{64}',package_digest):
            raise ValueError('Games package digest missing')
        expected.update(branch=GAMES.allowed_targets[0],profile=GAMES.validation_profile,runAttempt=1,
                        executionProfile=GAMES.id,profileDigest=attempt['profileDigest'],packageDigest=package_digest)
    if report != expected or run.get('display_title') != 'Guardian integrated ' + attempt['requestId']:
        raise ValueError('Integrated validation binding differs')
    if attempt['state'] not in {'integrated', 'staging_deployed'} or attempt['publication']['head'] != report['commit']:
        raise ValueError('No corresponding verified integration')
    return report['commit']


def ci_source(run_id, request=None):
    run = api('actions/runs/' + str(int(run_id)))
    if run.get('conclusion') != 'success' or run.get('status') != 'completed' or run.get('head_repository', {}).get('full_name') != REPO:
        raise ValueError('No trusted upstream CI')
    if run.get('name') == 'AI Staging Checks':
        if request is not None:
            raise ValueError('Committed recovery requires Guardian CI receipt')
        if run.get('event') != 'push' or run.get('head_branch') != WEB or run.get('path') != '.github/workflows/ai-staging-check.yml':
            raise ValueError('Unsupported ordinary CI origin')
        head = sha(run['head_sha'])
    else:
        from .execution import approved
        report = artifact_document(run_id, 'guardian-integrated-evidence', 'integrated-ci.json')
        identifier(report.get('requestId'))
        # Deploy workflow code may advance independently. Permission and original
        # CI control SHA remain validated from main task/ledger, not event text.
        from .guardian import read_ledger, validate_policy
        from .pipeline import task_contract, digest
        ledger, _ = read_ledger()
        attempts = [a for rows in ledger['attempts'].values() for a in rows if a.get('requestId') == report['requestId']]
        if len(attempts) != 1:
            raise ValueError('Missing integration reservation')
        attempt = attempts[0]
        root = Path(__file__).resolve().parents[2]
        from .execution import fresh_documents
        raw_policy, raw_task = fresh_documents(attempt['taskId'])
        policy = validate_policy(raw_policy)
        rows = [r for r in policy['workstreams'] if r.get('execution') == 'pipeline-v2' and r.get('taskId') == attempt['taskId'] and r['enabled']]
        if not policy['enabled'] or os.getenv('GUARDIAN_ENABLED') != 'true' or len(rows) != 1:
            raise ValueError('Integration permission revoked')
        task = task_contract(raw_task)
        from .profiles import resolve_profile,WEB as WEB_PROFILE
        if resolve_profile(task)!=WEB_PROFILE:
            raise ValueError('Games requires its separate Hosting-only handoff; Web deploy forbidden')
        if digest(task) != attempt['taskHash'] or task['base_sha'] != rows[0]['approvedSha']:
            raise ValueError('Integrated task approval changed')
        head = verify_ci(run, report, attempt)
        if request is not None:
            verify_request(request, report, attempt)
    if api('git/ref/heads/' + WEB)['object']['sha'] != head:
        raise ValueError('Refusing stale deploy source')
    return head


def retry_failed_deploy(attempt, kind, run, persist):
    history = attempt.setdefault('deploymentRetries', {}).setdefault(kind, [])
    # Original run plus two reruns. Reservation survives uncertain responses.
    observed = run.get('run_attempt', 1)
    if history and history[-1]['runAttempt'] >= observed:
        raise ValueError(kind + ' rerun already reserved/unknown; await actual next run attempt')
    if len(history) >= 2 or observed >= 3:
        raise ValueError(kind + ' three deployment attempts exhausted; inspect blocker')
    history.append({'runId': run['id'], 'runAttempt': observed, 'state': 'reserved'})
    persist()
    try:
        api(f"actions/runs/{run['id']}/rerun-failed-jobs", 'POST')
        history[-1]['state'] = 'dispatched'
    except RuntimeError:
        history[-1]['state'] = 'unknown'
    persist()
    raise ValueError(kind + ' bounded failed-job rerun reserved; awaiting real receipt')


def reconcile_deployment(attempt, persist=None):
    from ..release_control import receipt_document, validate_receipt
    ci_runs = api('actions/workflows/guardian-integrated-ci.yml/runs?event=workflow_dispatch&per_page=100')['workflow_runs']
    matches = [r for r in ci_runs if r.get('display_title') == 'Guardian integrated ' + attempt['requestId']]
    if not matches:
        attempt['deployReason'] = 'Integrated CI dispatch missing/unknown; no paid retry, inspect execution run'
        return
    newest = matches[0]
    if newest.get('status') != 'completed' or newest.get('conclusion') != 'success':
        attempt['deployReason'] = 'Latest integrated CI pending or failed; no old success fallback'
        return
    try:
        head = verify_ci(newest, artifact_document(newest['id'], 'guardian-integrated-evidence', 'integrated-ci.json'), attempt)
        if api('git/ref/heads/' + WEB)['object']['sha'] != head:
            raise ValueError('Candidate superseded; never claim current staging green')
        all_runs = api('actions/runs?per_page=100')['workflow_runs']
        receipts = {}
        for kind, workflow, path, artifact, filename in [
            ('hosting', 'Automatic staging preview', '.github/workflows/staging-preview.yml', 'verified-preview-receipt', 'receipt.json'),
            ('functions', 'Automatic staging AI functions', '.github/workflows/staging-functions.yml', 'staging-functions-receipt-' + head, 'staging-functions-receipt.json')]:
            rows = [r for r in all_runs if r['name'] == workflow and r.get('head_branch') == 'main'
                    and r.get('path') == path and r.get('event') in {'workflow_run', 'push'}
                    and r.get('head_repository', {}).get('full_name') == REPO]
            # Every newer failed/pending run blocks. Do not cherry-pick an older
            # matching artifact when current deployment is incomplete.
            if not rows or rows[0].get('status') != 'completed' or rows[0].get('conclusion') not in {'success', 'failure'}:
                raise ValueError(kind + ' latest deployment is missing/pending/failed')
            run = rows[0]
            source = artifact_document(run['id'], 'verified-deploy-source', 'deployment-source.json')
            if source != {'commit': head, 'upstreamCiRun': newest['id'], 'workflowRun': run['id'], 'project': 'hausaufgabe-staging'}:
                raise ValueError(kind + ' deployment source belongs to another CI/candidate')
            if run.get('status') == 'completed' and run.get('conclusion') == 'failure' and persist is not None:
                retry_failed_deploy(attempt, kind, run, persist)
            receipt = artifact_document(run['id'], artifact, filename)
            if validate_receipt(kind, receipt, run) != head:
                raise ValueError(kind + ' receipt belongs to different source')
            if kind == 'functions' and receipt.get('upstreamCiRun') != newest['id']:
                raise ValueError('Functions receipt belongs to different CI')
            receipts[kind] = {'runId': run['id'], 'commit': head, 'url': receipt.get('url')}
        attempt.update(state='staging_deployed', deploymentReceipts=receipts,
                       deployReason='Hosting and AI Functions receipts verified; Martin device acceptance open. Rules unchanged by this task.')
    except (ValueError, RuntimeError, KeyError) as exc:
        attempt['deployReason'] = str(exc)


def reconcile_profile_deployment(attempt,persist=None):
    if attempt.get('executionProfile','web-ui-v1') == 'web-ui-v1':
        reconcile_deployment(attempt,persist=persist)
        return 'verified' if attempt.get('state')=='staging_deployed' else 'blocked'
    if attempt.get('executionProfile') != 'games-static-preview-v1':
        raise ValueError('Unknown deployment profile')
    evidence=attempt.get('gamesEvidence')
    if not evidence:
        attempt['deployReason']='Games publication missing/unknown; verify existing run and setup/channel ownership before any dispatch'
        return 'blocked'
    try:
        from .games_static import verify_games_receipt
        from .profiles import GAMES
        target=api('git/ref/heads/'+GAMES.allowed_targets[0])['object']['sha']
        run=api('actions/runs/'+str(attempt['deploymentRequest']['runId']))
        if (run.get('path')!='.github/workflows/guardian-games-staging.yml' or run.get('head_branch')!='main'
                or run.get('status')!='completed' or run.get('conclusion')!='success' or run.get('run_attempt',1)!=1
                or run.get('head_repository',{}).get('full_name')!=REPO):
            raise ValueError('Trusted Games publication not completed')
        receipt=artifact_document(run['id'],'guardian-games-receipt','receipt.json')
        verify_games_receipt(receipt,attempt,evidence['ci'],evidence['manifest'],target)
        attempt.update(state='staging_deployed',deploymentReceipts={'hosting':{'runId':run['id'],'commit':target,'version':receipt['version']}},
                       deployReason='Separate Games Hosting verified; no Web/Functions/Rules deployment, human acceptance open')
        if persist: persist()
        return 'verified'
    except (KeyError,ValueError,RuntimeError) as exc:
        attempt['deployReason']=str(exc)
        return 'blocked'


def main():
    from .execution import output
    request = committed_request() if os.getenv('GITHUB_EVENT_NAME') == 'push' else None
    supplied = os.getenv('UPSTREAM_RUN_ID', '')
    run_id = int(supplied) if supplied else request['upstreamRunId']
    if request is not None and request['upstreamRunId'] != run_id:
        raise ValueError('Staging request changed after source qualification')
    head = ci_source(run_id, request)
    if os.getenv('EXPECTED_SHA') and os.environ['EXPECTED_SHA'] != head:
        raise ValueError('Staging source differs from original build')
    output(sha=head, upstream_ci=run_id)
    Path('deployment-source.json').write_text(json.dumps({'commit': head, 'upstreamCiRun': run_id,
        'workflowRun': int(os.environ['GITHUB_RUN_ID']), 'project': 'hausaufgabe-staging'}) + '\n')


if __name__ == '__main__':
    main()

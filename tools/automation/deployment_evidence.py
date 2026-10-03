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
    if run.get('name') != 'Guardian integrated checks' or run.get('path') != '.github/workflows/guardian-integrated-ci.yml' or run.get('event') != 'workflow_dispatch':
        raise ValueError('Wrong CI workflow')
    if run.get('conclusion') != 'success' or run.get('status') != 'completed' or run.get('run_attempt', 1) != 1:
        raise ValueError('Integrated CI not successful on first attempt')
    if run.get('head_branch') != 'main' or run.get('head_sha') != attempt['controlSha'] or run.get('head_repository', {}).get('full_name') != REPO:
        raise ValueError('Untrusted CI provenance')
    expected = {'requestId': attempt['requestId'], 'commit': attempt['integratedSha'], 'branch': WEB,
                'runId': run['id'], 'result': 'success', 'profile': 'web-combined-v1'}
    if report != expected or run.get('display_title') != 'Guardian integrated ' + attempt['requestId']:
        raise ValueError('Integrated validation binding differs')
    if attempt['state'] not in {'integrated', 'staging_deployed'} or attempt['publication']['head'] != report['commit']:
        raise ValueError('No corresponding verified integration')
    return report['commit']


def ci_source(run_id):
    run = api('actions/runs/' + str(int(run_id)))
    if run.get('conclusion') != 'success' or run.get('status') != 'completed' or run.get('head_repository', {}).get('full_name') != REPO:
        raise ValueError('No trusted upstream CI')
    if run.get('name') == 'AI Staging Checks':
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
        policy = validate_policy(json.loads((root / 'automation/guardian-policy.json').read_text()))
        rows = [r for r in policy['workstreams'] if r.get('execution') == 'pipeline-v2' and r.get('taskId') == attempt['taskId'] and r['enabled']]
        if not policy['enabled'] or os.getenv('GUARDIAN_ENABLED') != 'true' or len(rows) != 1:
            raise ValueError('Integration permission revoked')
        task = task_contract(json.loads((root / 'agent-queue' / (attempt['taskId'] + '.json')).read_text()))
        if digest(task) != attempt['taskHash'] or task['base_sha'] != rows[0]['approvedSha']:
            raise ValueError('Integrated task approval changed')
        head = verify_ci(run, report, attempt)
    if api('git/ref/heads/' + WEB)['object']['sha'] != head:
        raise ValueError('Refusing stale deploy source')
    return head


def reconcile_deployment(attempt):
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
        all_runs = api('actions/runs?event=workflow_run&per_page=100')['workflow_runs']
        receipts = {}
        for kind, workflow, artifact, filename in [
            ('hosting', 'Automatic staging preview', 'verified-preview-receipt', 'receipt.json'),
            ('functions', 'Automatic staging AI functions', 'staging-functions-receipt-' + head, 'staging-functions-receipt.json')]:
            rows = [r for r in all_runs if r['name'] == workflow and r.get('head_branch') == 'main'
                    and r.get('head_repository', {}).get('full_name') == REPO]
            # Every newer failed/pending run blocks. Do not cherry-pick an older
            # matching artifact when current deployment is incomplete.
            if not rows or rows[0].get('status') != 'completed' or rows[0].get('conclusion') != 'success':
                raise ValueError(kind + ' latest deployment is missing/pending/failed')
            run = rows[0]
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


if __name__ == '__main__':
    from .execution import output
    output(sha=ci_source(os.environ['UPSTREAM_RUN_ID']))

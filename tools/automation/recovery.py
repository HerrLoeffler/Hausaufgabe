"""Explicit main-owned recovery after two confirmed review permission denials.

This is a new bounded execution attempt, never a rerun of paid jobs. History,
reservations, all validation/review gates and the exact source remain intact.
No timeout, quota error, unknown response or rejected code can use this route.
"""
from __future__ import annotations

import copy
import base64
import datetime as dt
import json
import os
from pathlib import Path
import subprocess

from .guardian import api, read_ledger, write_ledger, validate_policy, REPO
from .pipeline import identifier, task_contract, digest, reserve_budget, WEB, MODELS

ROOT = Path(__file__).resolve().parents[2]
KIND = 'confirmed-review-permission-403'


def previous_task(request, task):
    """A source renewal may change only the base, never task scope or budget."""
    update = request.get('sourceUpdate')
    if update is None:
        return task
    if set(update) != {'previousTask', 'approvedSha', 'taskHash', 'selectedBlobs'}:
        raise ValueError('Explicit source update binding required')
    previous = task_contract(update['previousTask'])
    if (previous['base_sha'] == task['base_sha']
            or previous | {'base_sha': task['base_sha']} != task
            or update['approvedSha'] != task['base_sha']
            or update['taskHash'] != digest(task)
            or request['taskHash'] != digest(previous)
            or set(update['selectedBlobs']) != set(task['allowed_files'] + task.get('context_files', []))):
        raise ValueError('Source renewal changes approved task or budget')
    return previous


def permission_recovery(previous, task):
    """Return historical candidate base only for a bound permission recovery."""
    request = previous.get('manualRecovery', {})
    if (request.get('kind') != KIND or request.get('previousRequestId') != previous['requestId']
            or request.get('taskHash') != previous.get('taskHash')):
        return None
    old_task = previous_task(request, task)
    if digest(old_task) != previous.get('taskHash'):
        raise ValueError('Historical permission recovery task changed')
    if request.get('sourceUpdate') and previous.get('approvedSha') != old_task['base_sha']:
        raise ValueError('Historical source approval differs')
    return old_task['base_sha']


def current_approval(request, policy, task):
    """Queued runs must still have the same grant, task and source request."""
    main = api('git/ref/heads/main')['object']['sha']
    for path, expected in [('automation/guardian-policy.json', policy),
                           ('agent-queue/' + task['id'] + '.json', task),
                           ('automation/recovery-requests/' + request['id'] + '.json', request)]:
        actual = json.loads(base64.b64decode(api('contents/' + path + '?ref=' + main)['content']))
        if actual != expected:
            raise ValueError('Current source recovery approval changed')


def job_log(job_id):
    result = subprocess.run(['gh', 'run', 'view', '--repo', REPO, '--job', str(job_id), '--log'],
                            capture_output=True, text=True, timeout=30)
    if result.returncode or len(result.stdout) > 2 * 1024 * 1024:
        raise ValueError(f'Cannot qualify permission failure from trusted job log (CLI exit {result.returncode})')
    return result.stdout


def qualify(request, history, task, run, jobs, logs):
    expected = {'id', 'taskId', 'previousRequestId', 'runId', 'taskHash', 'head',
                'kind', 'permissionFixConfirmed', 'reason'}
    if set(request) not in (expected, expected | {'sourceUpdate'}) or request['kind'] != KIND or request['permissionFixConfirmed'] is not True:
        raise ValueError('Explicit confirmed permission recovery required')
    identifier(request['id']); identifier(request['previousRequestId'])
    task_contract(task)
    if request['taskId'] != task['id'] or request['taskHash'] != digest(task) or not request['reason']:
        raise ValueError('Recovery task binding differs')
    if not history or len(history) >= 3:
        raise ValueError('Missing history or exhausted attempts')
    old = history[-1]
    if (old.get('state') != 'stopped' or old.get('requestId') != request['previousRequestId']
            or old.get('runId') != request['runId'] or old.get('taskHash') != request['taskHash']
            or old.get('feedback') or old.get('publication', {}).get('head') != request['head']):
        raise ValueError('Not the exact stopped permission-only attempt')
    if (run.get('id') != request['runId'] or run.get('path') != '.github/workflows/guardian-execution.yml'
            or run.get('event') != 'workflow_dispatch' or run.get('head_branch') != 'main'
            or run.get('head_sha') != old.get('controlSha') or run.get('run_attempt') != 1
            or run.get('head_repository', {}).get('full_name') != REPO
            or run.get('status') != 'completed' or run.get('conclusion') != 'failure'):
        raise ValueError('Original workflow provenance or outcome differs')
    if len({j['name'] for j in jobs}) != len(jobs):
        raise ValueError('Ambiguous job identity')
    by_name = {j['name']: j for j in jobs}
    for name in ('prepare', 'build', 'publish', 'validate / test', 'reviews (security)', 'finalize'):
        if by_name.get(name, {}).get('conclusion') != 'success':
            raise ValueError('Build, validation, security or finalization not successful')
    if by_name.get('integrate', {}).get('conclusion') != 'skipped':
        raise ValueError('Integration was attempted; separate diagnosis required')
    failures = {j['name'] for j in jobs if j.get('conclusion') == 'failure'}
    if failures != {'reviews (correctness)', 'reviews (qa)'} or any(j.get('status') != 'completed' for j in jobs):
        raise ValueError('Failure is not limited to both OpenAI reviews')
    for role in ('correctness', 'qa'):
        job = by_name['reviews (' + role + ')']
        expected_error = f"RuntimeError: {role} ({MODELS[role]['model']}): HTTP 403, provider/model permission denied; reservation retained, no automatic retry"
        trace = logs[job['id']]
        if trace.count(expected_error) != 1 or trace.count('RuntimeError:') != 1:
            raise ValueError('Provider outcome is not one confirmed permission denial')
    return old


def apply(request):
    if os.getenv('GITHUB_REPOSITORY') != REPO or os.getenv('GITHUB_REF') != 'refs/heads/main':
        raise ValueError('Recovery runs only from trusted main')
    if os.getenv('GITHUB_RUN_ATTEMPT', '1') != '1':
        raise ValueError('Recovery workflow rerun forbidden')
    if not all(os.getenv(x) == 'true' for x in ('GUARDIAN_ENABLED', 'WORKER_ENABLED')):
        raise ValueError('Explicit activation required')
    policy = validate_policy(json.loads((ROOT / 'automation/guardian-policy.json').read_text()))
    rows = [r for r in policy['workstreams'] if r.get('taskId') == request['taskId'] and r.get('execution') == 'pipeline-v2' and r['enabled']]
    if not policy['enabled'] or len(rows) != 1:
        raise ValueError('Task permission revoked or ambiguous')
    task = task_contract(json.loads((ROOT / 'agent-queue' / (identifier(request['taskId']) + '.json')).read_text()))
    if rows[0]['approvedSha'] != task['base_sha'] or rows[0]['baseBranch'] != task['base_branch']:
        raise ValueError('Policy and source approval differ')
    ledger, blob = read_ledger()
    history = ledger['attempts'].get(rows[0]['id'] + ':pipeline-v2', [])
    # A committed request is single-use even across later task runs.
    if any(a.get('manualRecovery', {}).get('id') == request['id'] for a in history):
        print('Recovery already consumed; no duplicate dispatch')
        return
    run = api('actions/runs/' + str(request['runId']))
    jobs = api('actions/runs/' + str(request['runId']) + '/jobs?per_page=100')['jobs']
    traces = {j['id']: job_log(j['id']) for j in jobs if j['name'] in {'reviews (correctness)', 'reviews (qa)'}}
    original_task = previous_task(request, task)
    if request.get('sourceUpdate'):
        current_approval(request, policy, task)
    old = qualify({k: v for k, v in request.items() if k != 'sourceUpdate'}, history, original_task, run, jobs, traces)
    if len(history) >= policy['maxAttemptsPerStage']:
        raise ValueError('Configured attempt limit exhausted')
    # Merely check remaining budget here. The ordinary controller still makes
    # and persists the actual reservation before any paid execution dispatch.
    reserve_budget(ledger.get('budgetReservations', []), task['id'], dt.date.today().isoformat(), task=task)
    pub = old['publication']
    pr = api('pulls/' + str(pub['pr']))
    commit = api('git/commits/' + pub['head'])
    if (api('git/ref/heads/' + WEB)['object']['sha'] != task['base_sha']
            or pr.get('state') != 'open' or pr['base']['ref'] != WEB or pr['head']['sha'] != pub['head']
            or pr['head']['repo']['full_name'] != REPO
            or api('git/ref/heads/' + pub['branch'])['object']['sha'] != pub['head']
            or commit['tree']['sha'] != pub['tree'] or [p['sha'] for p in commit['parents']] != [original_task['base_sha']]
            or pub['base'] != original_task['base_sha']):
        raise ValueError('Source, secured candidate or PR moved')
    if request.get('sourceUpdate'):
        comparison = api('compare/' + original_task['base_sha'] + '...' + task['base_sha'])
        if comparison.get('status') != 'ahead' or comparison.get('merge_base_commit', {}).get('sha') != original_task['base_sha']:
            raise ValueError('Renewed source must descend from original approval')
        for path, expected_blob in request['sourceUpdate']['selectedBlobs'].items():
            for base in (original_task['base_sha'], task['base_sha']):
                item = api('contents/' + path + '?ref=' + base)
                if item.get('type') != 'file' or item.get('sha') != expected_blob:
                    raise ValueError('Approved source context changed; separate review required')
        if api('git/ref/heads/' + WEB)['object']['sha'] != task['base_sha']:
            raise ValueError('Renewed source moved before recovery')
        current_approval(request, policy, task)
    old['manualRecovery'] = copy.deepcopy(request) | {'originalState': old['state'], 'originalReason': old.get('reason'),
        'confirmedAt': dt.datetime.now(dt.timezone.utc).isoformat(), 'dispatchState': 'reserved'}
    old.update(state='repairable', reason='Explicit diagnosis: reviewer model permissions corrected by Martin')
    blob = write_ledger(ledger, blob)
    try:
        api('actions/workflows/stage-guardian.yml/dispatches', 'POST', {'ref': 'main'})
    except RuntimeError:
        old['manualRecovery']['dispatchState'] = 'unknown'
        write_ledger(ledger, blob)
        raise
    old['manualRecovery']['dispatchState'] = 'dispatched'
    write_ledger(ledger, blob)
    print('One new bounded attempt requested; original history and budget retained')


def main():
    paths = list((ROOT / 'automation/recovery-requests').glob('*.json'))
    if len(paths) != 1:
        raise ValueError('Exactly one explicit recovery request supported')
    request = json.loads(paths[0].read_text())
    if paths[0].stem != identifier(request['id']):
        raise ValueError('Request path differs from ID')
    apply(request)


if __name__ == '__main__':
    main()

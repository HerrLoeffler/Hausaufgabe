"""Reconcile real workflow ownership and start at most one bounded attempt."""
from __future__ import annotations

import argparse
import datetime as dt
import json
import os
from pathlib import Path

from .guardian import api, read_ledger, write_ledger, validate_policy, REPO
from .pipeline import task_contract, digest, reserve_budget, WEB

ROOT = Path(__file__).resolve().parents[2]
WORKFLOW = '.github/workflows/guardian-execution.yml'
BUSY = {'reserved', 'dispatched', 'dispatch_unknown', 'running'}


def reconcile(attempt, runs):
    matches = [r for r in runs if r.get('display_title') == 'Guardian task ' + attempt['requestId']
               and r.get('path') == WORKFLOW and r.get('event') == 'workflow_dispatch'
               and r.get('head_branch') == 'main' and r.get('head_sha') == attempt['controlSha']
               and r.get('head_repository', {}).get('full_name') == REPO]
    if len(matches) > 1:
        attempt.update(state='stopped', reason='Duplicate execution runs; inspect before any further call')
    elif matches:
        run = matches[0]
        if attempt.get('runId') not in {None, run['id']}:
            attempt.update(state='stopped', reason='Workflow ownership differs')
        elif run.get('run_attempt', 1) != 1:
            attempt.update(state='stopped', reason='Workflow rerun forbidden; paid call ownership ambiguous')
        elif run.get('status') == 'completed' and attempt['state'] in BUSY:
            attempt.update(state='stopped', runId=run['id'], reason='Run ended without trusted finalization; inspect, do not blindly retry')
        elif attempt['state'] in BUSY:
            attempt['runId'] = run['id'] if attempt['state'] == 'running' else attempt.get('runId')
    return attempt


def select(row, task, history, current_sha, enabled):
    if not enabled or not row['enabled']:
        return 'disabled', 'Activation missing'
    if current_sha != row['approvedSha']:
        # Integrated tasks are handled before this check by the controller.
        return 'blocked', 'Target changed; renewed source approval required'
    if history:
        latest = history[-1]
        if latest['state'] in BUSY:
            return 'wait', 'Durable reservation already owns this task'
        if latest['state'] == 'stopped':
            return 'stopped', latest.get('reason', 'Manual diagnosis required')
        if latest['state'] in {'integrated', 'staging_deployed'}:
            return 'receipts', 'Await component receipts and Martin acceptance'
        if latest['state'] != 'repairable':
            return 'blocked', 'Unknown completion state'
    if len(history) >= 3:
        return 'stopped', 'Three attempts exhausted; explicit new decision required'
    return 'dispatch', 'Approved initial build or bounded repair'


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--execute', action='store_true')
    args = parser.parse_args()
    if os.getenv('GITHUB_REPOSITORY') != REPO:
        raise ValueError('Wrong repository')
    policy = validate_policy(json.loads((ROOT / 'automation/guardian-policy.json').read_text()))
    enabled = policy['enabled'] and os.getenv('GUARDIAN_ENABLED') == 'true'
    ready = all(os.getenv(name) == 'true' for name in ['WORKER_ENABLED', 'WORKER_KEY_PRESENT', 'OPENAI_REVIEW_KEY_PRESENT', 'ANTHROPIC_REVIEW_KEY_PRESENT'])
    ledger, blob = read_ledger()
    ledger.setdefault('budgetReservations', [])
    runs = api('actions/workflows/guardian-execution.yml/runs?event=workflow_dispatch&per_page=100')['workflow_runs'] if any(r.get('execution') == 'pipeline-v2' for r in policy['workstreams']) else []
    report = {'execution': 'pipeline-v2', 'enabled': enabled, 'credentialsReady': ready, 'productionAutomatic': False, 'tasks': []}
    dispatched = False
    for row in policy['workstreams']:
        if row.get('execution') != 'pipeline-v2':
            continue
        task = task_contract(json.loads((ROOT / 'agent-queue' / (row['taskId'] + '.json')).read_text()))
        if task['base_sha'] != row['approvedSha'] or task['base_branch'] != row['baseBranch']:
            raise ValueError('Policy and task differ')
        key = row['id'] + ':pipeline-v2'
        history = ledger['attempts'].setdefault(key, [])
        if history:
            before = json.dumps(history[-1], sort_keys=True)
            reconcile(history[-1], runs)
            if args.execute and before != json.dumps(history[-1], sort_keys=True):
                blob = write_ledger(ledger, blob)
        current = api('git/ref/heads/' + WEB)['object']['sha']
        if history and history[-1]['state'] in {'integrated', 'staging_deployed'}:
            from .deployment_evidence import reconcile_deployment
            if args.execute:
                reconcile_deployment(history[-1])
                blob = write_ledger(ledger, blob)
            action, reason = 'await_acceptance' if history[-1]['state'] == 'staging_deployed' else 'await_receipts', history[-1].get('deployReason', 'Technical deployment receipts pending')
        else:
            action, reason = select(row, task, history, current, enabled)
        if action == 'dispatch' and not ready:
            action, reason = 'setup_needed', 'Dedicated worker and both independent review credentials/activation missing'
        if action == 'dispatch' and args.execute and not dispatched:
            day = dt.datetime.now(dt.timezone.utc).date().isoformat()
            try:
                budget = reserve_budget(ledger['budgetReservations'], task['id'], day)
            except ValueError as exc:
                action, reason = 'stopped', str(exc)
            else:
                if api('git/ref/heads/' + WEB)['object']['sha'] != row['approvedSha']:
                    action, reason = 'blocked', 'Parallel source changed before reservation'
                else:
                    request_id = 'run-' + os.environ['GITHUB_RUN_ID'] + '-' + os.environ.get('GITHUB_RUN_ATTEMPT', '1')
                    # Persist budget and ownership BEFORE workflow dispatch. Unknown
                    # dispatch or provider failure never refunds this reservation.
                    history.append({'requestId': request_id, 'execution': 'pipeline-v2', 'taskId': task['id'], 'taskHash': digest(task),
                        'approvedSha': task['base_sha'], 'state': 'reserved', 'controlSha': os.environ['CONTROL_SHA'],
                        'reservedAt': dt.datetime.now(dt.timezone.utc).isoformat()})
                    ledger['budgetReservations'].append({**budget, 'requestId': request_id})
                    blob = write_ledger(ledger, blob)
                    try:
                        api('actions/workflows/guardian-execution.yml/dispatches', 'POST', {'ref': 'main', 'inputs': {'request_id': request_id}})
                        history[-1]['state'] = 'dispatched'
                        action = 'dispatched'
                    except RuntimeError:
                        history[-1].update(state='dispatch_unknown', reason='Dispatch result unknown; reconcile run identity before retry')
                        action = 'wait'
                    blob = write_ledger(ledger, blob)
                    dispatched = True
        report['tasks'].append({'id': row['id'], 'taskId': task['id'], 'action': action, 'reason': reason, 'attempts': len(history),
                                'latest': history[-1] if history else None})
    folder = Path('artifacts/guardian')
    folder.mkdir(parents=True, exist_ok=True)
    (folder / 'execution.json').write_text(json.dumps(report, indent=2) + '\n')
    lines = ['# GradeCrew Ausführung', '', 'Auftrag → Änderungsvorschlag → Tests → zwei unabhängige Reviews → Integration → verifizierte Staging-Receipts → Martin.', '',
             f'Aktiviert: {enabled}; Credentials vollständig: {ready}. Production bleibt gesperrt.', '',
             '| Aufgabe | Schritt | Versuche | Grund |', '|---|---|---|---|']
    lines += [f"| {r['taskId']} | {r['action']} | {r['attempts']}/3 | {r['reason']} |" for r in report['tasks']]
    if not report['tasks']:
        lines += ['', 'Kein freigegebener Pilot konfiguriert. Kein API-Aufruf oder Deploy gestartet.']
    (folder / 'execution.md').write_text('\n'.join(lines) + '\n')
    print('\n'.join(lines))


if __name__ == '__main__':
    main()

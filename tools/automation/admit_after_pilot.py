"""Single committed homepage request, admitted after the verified pilot.

Repinning is restricted to the pilot's exact integrated SHA and unchanged
approved homepage blobs. No general rebasing, provider calls or budget reset.
"""
import base64
import datetime as dt
import json
import os
from pathlib import Path

from . import admit
from .guardian import api, read_ledger, validate_policy, REPO
from .pipeline import digest, identifier, task_contract, WEB

ROOT = Path(__file__).resolve().parents[2]


def derive_task(request, task, prerequisite, current_sha, selected_blobs):
    expected = {'id', 'taskId', 'taskHash', 'prerequisiteTaskId', 'originalSource', 'selectedBlobs'}
    if set(request) != expected:
        raise ValueError('Explicit source-bound admission request required')
    identifier(request['id']); identifier(request['prerequisiteTaskId'])
    task_contract(task)
    if request['taskId'] != task['id'] or request['taskHash'] != digest(task) or request['originalSource'] != task['base_sha']:
        raise ValueError('Reviewed task changed')
    selected = set(task['allowed_files'] + task.get('context_files', []))
    if set(request['selectedBlobs']) != selected or selected_blobs != request['selectedBlobs']:
        raise ValueError('Approved homepage source changed; review required')
    if prerequisite.get('state') != 'staging_deployed' or prerequisite.get('taskId') != request['prerequisiteTaskId']:
        raise ValueError('Real pilot staging receipts required')
    if prerequisite.get('integratedSha') != current_sha:
        raise ValueError('Target is not the exact verified pilot integration')
    return task_contract(task | {'base_sha': current_sha})


def main():
    if dt.date.today() > dt.date(2026, 11, 2):
        raise ValueError('Model/pricing qualification expired')
    if os.getenv('GITHUB_REPOSITORY') != REPO or os.getenv('GITHUB_REF') != 'refs/heads/main' or os.getenv('GITHUB_RUN_ATTEMPT', '1') != '1':
        raise ValueError('First-attempt trusted main admission only')
    if not all(os.getenv(x) == 'true' for x in ['WORKER_KEY_PRESENT', 'OPENAI_REVIEW_KEY_PRESENT', 'ANTHROPIC_REVIEW_KEY_PRESENT', 'WORKER_ENABLED', 'GUARDIAN_ENABLED']):
        raise ValueError('Dedicated credentials and explicit activation required')
    paths = list((ROOT / 'automation/admission-requests').glob('*.json'))
    if len(paths) != 1:
        raise ValueError('Exactly one committed homepage admission request supported')
    request = json.loads(paths[0].read_text())
    if paths[0].stem != identifier(request['id']):
        raise ValueError('Request filename differs')
    task_id = identifier(request['taskId'])
    task_path = 'agent-queue/' + task_id + '.json'
    policy_path = 'automation/guardian-policy.json'
    main_sha = api('git/ref/heads/main')['object']['sha']
    def document(path):
        return json.loads(base64.b64decode(api('contents/' + path + '?ref=' + main_sha)['content']))
    policy = validate_policy(document(policy_path))
    if any(row['taskId'] == task_id for row in policy['workstreams']):
        print('Homepage already admitted; controller owns progress, no duplicate dispatch')
        return
    ledger, _ = read_ledger()
    history = ledger['attempts'].get(request['prerequisiteTaskId'] + ':pipeline-v2', [])
    if not history or history[-1].get('state') != 'staging_deployed':
        print('Homepage waiting for verified real pilot staging receipts; no paid call')
        return
    current = api('git/ref/heads/' + WEB)['object']['sha']
    task = document(task_path)
    blobs = {path: api('contents/' + path + '?ref=' + current)['sha'] for path in task['allowed_files'] + task.get('context_files', [])}
    updated = derive_task(request, task, history[-1], current, blobs)
    approved = admit.admission(policy, updated, ledger, current)
    approved['note'] = 'Dedicated keys and flags verified. Pilot reached verified staging; explicitly bounded homepage admitted. Production and device acceptance remain manual.'
    if api('git/ref/heads/' + WEB)['object']['sha'] != current:
        raise ValueError('Target changed during admission')
    base_tree = api('git/commits/' + main_sha)['tree']['sha']
    entries = [{'path': path, 'mode': '100644', 'type': 'blob', 'content': json.dumps(value, indent=2, ensure_ascii=False) + '\n'}
               for path, value in [(task_path, updated), (policy_path, approved)]]
    tree = api('git/trees', 'POST', {'base_tree': base_tree, 'tree': entries})['sha']
    commit = api('git/commits', 'POST', {'message': 'guardian: admit unchanged homepage after verified pilot', 'tree': tree, 'parents': [main_sha]})['sha']
    api('git/refs/heads/main', 'PATCH', {'sha': commit, 'force': False})
    # GITHUB_TOKEN commits do not trigger push workflows. Dispatch explicitly;
    # if the result is unknown, the durable policy and scheduled controller own
    # recovery, never a duplicate paid workflow or reset of task history.
    api('actions/workflows/stage-guardian.yml/dispatches', 'POST', {'ref': 'main'})
    print('Homepage admitted with unchanged source blobs and existing $2.55 cap')


if __name__ == '__main__':
    main()

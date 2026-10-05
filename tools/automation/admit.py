"""Explicit admission of one reviewed main task; never infer scope from AI text."""
import base64
import datetime as dt
import json
import os
from pathlib import Path

from .guardian import api, read_ledger, validate_policy, REPO
from .pipeline import identifier, task_contract, WEB

ROOT = Path(__file__).resolve().parents[2]


def admission(policy, task, ledger, current_sha):
    validate_policy(policy); task_contract(task)
    from .profiles import admitted_profile, WEB as WEB_PROFILE
    profile = admitted_profile(task,policy)
    if current_sha != task['base_sha']:
        raise ValueError('Task base no longer current; inspect and update task, never silently rebase')
    if any(a.get('taskId') == task['id'] for rows in ledger['attempts'].values() for a in rows):
        raise ValueError('Task ID already has attempt history; admission cannot reset its budget')
    result = json.loads(json.dumps(policy))
    matches = [r for r in result['workstreams'] if r['taskId'] == task['id']]
    if matches:
        raise ValueError('Task already admitted; use controller status instead of duplicate admission')
    result['enabled'] = True
    result['workstreams'].append({'id': task['id'], 'taskId': task['id'], 'enabled': True, 'execution': 'pipeline-v2',
        'baseBranch': task['base_branch'], 'approvedSha': task['base_sha'], 'maxAutomaticStage': 'staging_deployed'})
    if profile != WEB_PROFILE:
        result['workstreams'][-1].update(executionProfile=profile.id,profileDigest=task['profile_digest'],validationProfile=profile.validation_profile)
    return validate_policy(result)


def main():
    if os.getenv('GITHUB_REPOSITORY') != REPO or os.getenv('GITHUB_REF') != 'refs/heads/main':
        raise ValueError('Admission only from trusted main workflow')
    if dt.date.today() > dt.date(2026, 11, 2):
        raise ValueError('Model/pricing qualification expired')
    if not all(os.getenv(name) == 'true' for name in ['WORKER_KEY_PRESENT', 'OPENAI_REVIEW_KEY_PRESENT', 'ANTHROPIC_REVIEW_KEY_PRESENT', 'WORKER_ENABLED', 'GUARDIAN_ENABLED']):
        raise ValueError('Dedicated credentials and activation flags missing; no admission performed')
    task_id = identifier(os.environ['TASK_ID'])
    task = task_contract(json.loads((ROOT/'agent-queue'/(task_id+'.json')).read_text()))
    path = 'automation/guardian-policy.json'
    document = api('contents/'+path+'?ref=main')
    policy = json.loads(base64.b64decode(document['content']))
    ledger, _ = read_ledger()
    current = api('git/ref/heads/'+task['base_branch'])['object']['sha']
    updated = admission(policy, task, ledger, current)
    if api('git/ref/heads/'+task['base_branch'])['object']['sha'] != task['base_sha']:
        raise ValueError('Target changed during admission')
    api('contents/'+path, 'PUT', {'branch':'main','sha':document['sha'],
        'message':'guardian: explicitly admit bounded task '+task_id,
        'content':base64.b64encode((json.dumps(updated,indent=2)+'\n').encode()).decode()})
    api('actions/workflows/stage-guardian.yml/dispatches','POST',{'ref':'main'})
    print('Approved bounded task '+task_id+'; controller dispatched. Production and device acceptance remain locked.')


if __name__=='__main__':main()

"""Credential-free contracts for the bounded GradeCrew execution pipeline.

Model output is data. Nothing in this module executes supplied commands.
The first admission class is small web changes; infrastructure and exam cutovers
must use their separate gates, never broaden an admission silently.
"""
from __future__ import annotations

import hashlib
import json
from pathlib import PurePosixPath
import re

WEB = 'feature/gradecrew-app-integration'
MODELS = {
    'build': {'provider': 'openai', 'model': 'gpt-6.1-sol', 'input': 4, 'output': 15, 'max_output': 24000},
    'correctness': {'provider': 'openai', 'model': 'gpt-6-astra', 'input': 20, 'output': 75, 'max_output': 6000},
    'security': {'provider': 'anthropic', 'model': 'claude-sonnet-5-5', 'input': 2, 'output': 10, 'max_output': 6000},
}
MAX_CONTEXT = 80000
MAX_REVIEW_CONTEXT = 160000
MAX_CANDIDATE = 160000
ATTEMPT_RESERVATION_USD = 5.5  # conservative full input/output ceiling, no cache discounts
MAX_TASK_USD = 16.5
MAX_DAILY_USD = 33
DENIED_PARTS = {'.github', '.git', 'automation', 'agent-queue', 'functions', 'assessment-functions',
                'native', 'tools', 'release-control', 'workstreams', 'node_modules', 'vendor'}
DENIED_FILES = {'firebase.json', 'firebase-config.js', 'firestore.rules', 'storage.rules',
                'AGENTS.md', 'START_HERE.md', 'TODO.md', 'GRADECREW_STATE.json', 'package.json',
                'package-lock.json', 'firebase-config-staging.js'}
SECRET = re.compile(r'-----BEGIN [A-Z ]*PRIVATE KEY-----|\bsk-(?:proj-)?[A-Za-z0-9_-]{16,}|\bgh[pousr]_[A-Za-z0-9]{20,}')


def digest(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, ensure_ascii=False, separators=(',', ':')).encode()).hexdigest()


def sha(value):
    if not isinstance(value, str) or not re.fullmatch(r'[0-9a-f]{40}', value):
        raise ValueError('Exact commit required')
    return value


def identifier(value):
    if not isinstance(value, str) or not re.fullmatch(r'[a-z0-9][a-z0-9-]{0,79}', value):
        raise ValueError('Invalid identifier')
    return value


def path_allowed(name):
    if not isinstance(name, str) or not re.fullmatch(r'[A-Za-z0-9_-][A-Za-z0-9_./-]{0,179}', name):
        raise ValueError('Unsafe file path')
    path = PurePosixPath(name)
    if str(path) != name or '..' in path.parts or any(p.startswith('.') or p in DENIED_PARTS for p in path.parts):
        raise ValueError('Unsafe or privileged path')
    if path.name in DENIED_FILES or path.suffix not in {'.js', '.mjs', '.css', '.html'}:
        raise ValueError('Only admitted web source files may change')
    if '.test.' in name or '.spec.' in name:
        raise ValueError('Existing tests cannot be weakened by the coding model')
    if any(p.startswith(('deploy-', 'secure-', 'admin-', 'ai-', 'student-')) for p in path.parts):
        raise ValueError('Sensitive source needs separate admission')
    return name


def task_contract(task):
    identifier(task.get('id')); sha(task.get('base_sha'))
    if task.get('base_branch') != WEB or task.get('risk') != 'web-ui':
        raise ValueError('Only explicit web-ui admission supported')
    for name in ('goal', 'acceptance', 'constraints'):
        if not isinstance(task.get(name), str) or not 1 <= len(task[name].encode()) <= 16000:
            raise ValueError('Incomplete task contract')
    files = task.get('allowed_files')
    context = task.get('context_files', [])
    if not isinstance(files, list) or not 1 <= len(files) <= 8 or len(set(files)) != len(files):
        raise ValueError('List 1-8 exact writable paths')
    if not isinstance(context, list) or len(context) > 12 or len(set(context)) != len(context):
        raise ValueError('Invalid context paths')
    for name in files + context:
        path_allowed(name)
    if task.get('validation_profile') != 'web-combined-v1' or task.get('max_cost_usd') != MAX_TASK_USD:
        raise ValueError('Explicit validation and reserved task budget required')
    return task


def candidate_contract(candidate, task, request_id):
    task_contract(task); identifier(request_id)
    if not isinstance(candidate, dict) or set(candidate) != {'files', 'summary'}:
        raise ValueError('Unexpected candidate schema')
    files = candidate['files']
    if not isinstance(candidate['summary'], str) or len(candidate['summary'].encode()) > 4000:
        raise ValueError('Invalid summary')
    if not isinstance(files, list) or not files or len(files) > len(task['allowed_files']):
        raise ValueError('Empty or oversized change')
    seen = set()
    for item in files:
        if not isinstance(item, dict) or set(item) != {'path', 'content'}:
            raise ValueError('Files must be plain text replacements')
        name = path_allowed(item['path'])
        if name not in task['allowed_files'] or name in seen:
            raise ValueError('Out-of-scope or duplicate file')
        seen.add(name)
        if not isinstance(item['content'], str) or '\x00' in item['content'] or SECRET.search(item['content']):
            raise ValueError('Invalid source or credential pattern')
    if len(json.dumps(candidate, ensure_ascii=False).encode()) > MAX_CANDIDATE:
        raise ValueError('Oversized candidate')
    return {'requestId': request_id, 'taskHash': digest(task), 'base': task['base_sha'],
            'candidateHash': digest(candidate), 'candidate': candidate}


def validate_review(review, role, binding):
    expected = {'verdict', 'head', 'base', 'candidateHash', 'findings'}
    if not isinstance(review, dict) or set(review) != expected:
        raise ValueError('Unexpected review schema')
    if role not in {'correctness', 'security'}:
        raise ValueError('Unknown independent review role')
    for key in ('head', 'base', 'candidateHash'):
        if review[key] != binding[key]:
            raise ValueError('Review belongs to different code')
    findings = review['findings']
    if not isinstance(findings, list) or len(findings) > 20 or review['verdict'] not in {'approve', 'changes_requested'}:
        raise ValueError('Invalid review result')
    for item in findings:
        if not isinstance(item, dict) or set(item) != {'severity', 'path', 'message'}:
            raise ValueError('Invalid finding')
        if item['severity'] not in {'blocking', 'note'} or not isinstance(item['message'], str) or not 1 <= len(item['message']) <= 2000:
            raise ValueError('Invalid finding details')
        if item['path'] not in binding['allowed_files']:
            raise ValueError('Finding references unrelated code')
    blocking = any(f['severity'] == 'blocking' for f in findings)
    if review['verdict'] == 'approve' and blocking:
        raise ValueError('Approval contains blocker')
    if review['verdict'] == 'changes_requested' and not blocking:
        raise ValueError('Rejection must have actionable blocker')
    return review


def integration_gate(task, publication, tests, reviews, current_base, current_head):
    task_contract(task)
    if current_base != task['base_sha'] or current_head != publication['head']:
        raise ValueError('Branch moved; never overwrite parallel work')
    binding = {**publication, 'allowed_files': task['allowed_files']}
    if tests != {'profile': 'web-combined-v1', 'head': publication['head'], 'base': task['base_sha'], 'result': 'success'}:
        raise ValueError('Exact candidate validation required')
    if set(reviews) != {'correctness', 'security'}:
        raise ValueError('Both independent reviewers required')
    for role, evidence in reviews.items():
        if evidence.get('provider') != MODELS[role]['provider'] or evidence.get('model') != MODELS[role]['model']:
            raise ValueError('Reviewer identity differs')
        if validate_review(evidence['review'], role, binding)['verdict'] != 'approve':
            raise ValueError('Independent reviewer requested changes')
    return publication['head']


def reserve_budget(history, task_id, day):
    if sum(r['reservedUsd'] for r in history if r['taskId'] == task_id) + ATTEMPT_RESERVATION_USD > MAX_TASK_USD + 1e-9:
        raise ValueError('Task cost budget exhausted')
    if sum(r['reservedUsd'] for r in history if r['day'] == day) + ATTEMPT_RESERVATION_USD > MAX_DAILY_USD + 1e-9:
        raise ValueError('Daily cost budget exhausted')
    return {'taskId': task_id, 'day': day, 'reservedUsd': ATTEMPT_RESERVATION_USD}


def object_schema(properties):
    return {'type': 'object', 'additionalProperties': False, 'properties': properties, 'required': list(properties)}


CANDIDATE_SCHEMA = object_schema({'summary': {'type': 'string'}, 'files': {'type': 'array', 'items': object_schema({'path': {'type': 'string'}, 'content': {'type': 'string'}})}})
REVIEW_SCHEMA = object_schema({'verdict': {'type': 'string', 'enum': ['approve', 'changes_requested']},
    'head': {'type': 'string'}, 'base': {'type': 'string'}, 'candidateHash': {'type': 'string'},
    'findings': {'type': 'array', 'items': object_schema({'severity': {'type': 'string', 'enum': ['blocking', 'note']}, 'path': {'type': 'string'}, 'message': {'type': 'string'}})}})

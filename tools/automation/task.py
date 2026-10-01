"""Select one queued task; never interpret its text as shell commands."""
import json
import os
from pathlib import Path
import re
import subprocess
import sys

ALLOWED_BRANCHES = {'feature/gradecrew-app-integration', 'feature/secure-assessment-v1', 'feature/shared-gradecrew-design-system', 'lab/games-structure'}


def validate(task, task_id):
    if not re.fullmatch(r'[a-z0-9][a-z0-9-]{0,79}', task_id):
        raise ValueError('Invalid task ID')
    if task.get('id') != task_id or task.get('base_branch') not in ALLOWED_BRANCHES:
        raise ValueError('Invalid task or unsupported base branch')
    if not re.fullmatch(r'[a-f0-9]{40}', task.get('base_sha', '')):
        raise ValueError('Task requires an exact previously verified base commit')
    for field in ['goal', 'acceptance', 'constraints']:
        if not isinstance(task.get(field), str) or not task[field].strip() or len(task[field]) > 16000:
            raise ValueError('Missing or invalid ' + field)
    return task


def main():
    root = Path(sys.argv[1])
    task_id = os.environ.get('REQUESTED_TASK', '')
    if not task_id:
        before, after = os.environ['BEFORE_SHA'], os.environ['AFTER_SHA']
        if not all(re.fullmatch(r'[a-f0-9]{40}', value) for value in [before, after]):
            raise ValueError('Invalid push range')
        names = subprocess.check_output(['git', '-C', str(root), 'diff', '--name-only', '--diff-filter=A', before, after, '--', 'agent-queue/*.json'], text=True).splitlines()
        if len(names) != 1:
            raise ValueError('Push exactly one new task; use manual dispatch to retry an existing task')
        task_id = Path(names[0]).stem
    if not re.fullmatch(r'[a-z0-9][a-z0-9-]{0,79}', task_id):
        raise ValueError('Invalid task ID')
    task = validate(json.loads((root / 'agent-queue' / (task_id + '.json')).read_text()), task_id)
    # Confirm the pinned revision belongs to the declared branch; do not silently follow its tip.
    subprocess.run(['git', '-C', str(root), 'merge-base', '--is-ancestor', task['base_sha'], 'origin/' + task['base_branch']], check=True)
    rules = '\n\n'.join((root / name).read_text() for name in ['AGENTS.md', 'START_HERE.md', 'GRADECREW_STATE.json', 'workstreams/README.md'])
    prompt = ('Work only on this task in the source checkout. Central project rules follow. '
              'Also read source branch AGENTS.md and applicable handoffs. Do not deploy, push, access credentials, or modify CI/IAM/agent-control configuration. '
              'Leave changes uncommitted for patch capture. Run available focused tests; if dependencies/network are unavailable, report that limitation. '
              'End with changed files, actual tests, unfinished work and next step. A patch is not integrated or deployed.\n\n' + rules + '\n\nTASK:\n' + json.dumps(task, ensure_ascii=False, indent=2))
    (root / 'worker-prompt.md').write_text(prompt)
    with open(os.environ['GITHUB_OUTPUT'], 'a') as output:
        output.write('task_id=' + task_id + '\nbase_sha=' + task['base_sha'] + '\n')


if __name__ == '__main__':
    main()

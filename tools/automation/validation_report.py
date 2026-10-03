"""Create bounded feedback on an unprivileged runner, never authorize integration."""
import json
import os
from pathlib import Path
import re
import subprocess

head = subprocess.check_output(['git', '-C', 'source', 'rev-parse', 'HEAD'], text=True).strip()
if head != os.environ['EXPECTED_HEAD'] or not re.fullmatch('[a-f0-9]{40}', head):
    raise ValueError('Validation checkout differs')
parents = subprocess.check_output(['git', '-C', 'source', 'show', '-s', '--format=%P', 'HEAD'], text=True).split()
rehearsal = os.getenv('REHEARSAL') == 'true'
if len(parents) != 1 and not rehearsal:
    raise ValueError('Only a direct verified candidate may use this profile')
result = os.environ['TEST_RESULT']
report = {'profile': 'web-rehearsal-v1' if rehearsal else 'web-combined-v1', 'head': head, 'base': parents[0] if parents else None,
          'result': 'success' if result == 'success' else 'failure' if result == 'failure' else 'blocked'}
Path('evidence/tests.json').write_text(json.dumps(report) + '\n')
log = Path('validation.log')
tail = log.read_text(errors='replace')[-6000:] if log.exists() else ''
# Output is only bounded diagnostic text; never a command. No credentials are
# passed to the validation runner. Keep detailed logs as their own artifact.
Path('evidence/test-feedback.json').write_text(json.dumps({'result': report['result'], 'tail': tail}) + '\n')

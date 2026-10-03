"""Create bounded feedback on an unprivileged runner, never authorize integration."""
import json
import os
from pathlib import Path
import re
import subprocess
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from tools.automation.delivery import verify_packaging

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
report['packagedFiles'] = []
packaging_error = ''
if report['result'] == 'success':
    try:
        if os.getenv('PACKAGE_RESULT') != 'success':
            raise ValueError('Original candidate packaging did not complete')
        public = Path(os.environ['PACKAGED_PUBLIC'])
        release = json.loads((public/'release.json').read_text())
        if not rehearsal:
            changes = subprocess.check_output(['git','-C','source','diff','--name-only',parents[0],head],text=True).splitlines()
            report['packagedFiles'] = verify_packaging(release, head, changes, public)
            for name in changes:
                if name.endswith(('.js','.mjs')):
                    # Explicit module parsing avoids Node's ambiguous .js type detection
                    # silently accepting an invalid ESM file. This only parses source.
                    syntax = subprocess.run(['node','--check','--input-type=module'],input=(Path('source')/name).read_bytes(),capture_output=True)
                    if syntax.returncode:
                        raise ValueError('Changed JavaScript syntax invalid: '+name)
    except (ValueError, OSError) as exc:
        report['result'] = 'blocked'
        packaging_error = str(exc)
Path('evidence/tests.json').write_text(json.dumps(report) + '\n')
log = Path('validation.log')
tail = log.read_text(errors='replace')[-6000:] if log.exists() else ''
# Output is only bounded diagnostic text; never a command. No credentials are
# passed to the validation runner. Keep detailed logs as their own artifact.
Path('evidence/test-feedback.json').write_text(json.dumps({'result': report['result'], 'tail': tail, 'packaging': packaging_error}) + '\n')
if report['result'] != 'success':
    raise SystemExit('Validation did not pass: '+(packaging_error or report['result']))

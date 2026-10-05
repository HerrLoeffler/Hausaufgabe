#!/usr/bin/env bash
set -euo pipefail
# Fixed trusted entry; never execute npm scripts from the candidate checkout.
node -e 'if (process.versions.node.split(".")[0] !== "22") process.exit(1)'
python3 -m tools.automation.games_static --source source --head "$EXPECTED_HEAD" --output evidence
python3 - <<'PYRUN'
import json
from pathlib import Path
from tools.automation.games_static import validate_browser
report=json.loads(Path('evidence/tests.json').read_text())
validate_browser('evidence/public',report['head'],report['base'],'evidence')
PYRUN

#!/usr/bin/env bash
set -euo pipefail
# Fixed trusted entry; never execute npm scripts from the candidate checkout.
node -e 'if (process.versions.node.split(".")[0] !== "22") process.exit(1)'
python3 -m tools.automation.games_static --source source --head "$EXPECTED_HEAD" --output evidence
node tools/automation/games-static-smoke.cjs evidence/public

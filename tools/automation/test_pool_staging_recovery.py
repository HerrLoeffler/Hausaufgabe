"""The pool recovery deploy must preserve unrelated learning Functions."""
from pathlib import Path
import unittest
import json
import os
import subprocess
from tempfile import TemporaryDirectory
import textwrap

ROOT = Path(__file__).resolve().parents[2]
WORKFLOW = ROOT / '.github/workflows/staging-functions.yml'
SCOPE = 'functions:ai:generateTest,functions:ai:startAiTestJob,functions:ai:processAiTestJob'

def workflow_script(name):
    step = WORKFLOW.read_text().split('      - name: ' + name + '\n', 1)[1].split('\n      - ', 1)[0]
    return textwrap.dedent(step.split('        run: |\n', 1)[1])

class PoolStagingRecoveryTests(unittest.TestCase):
    def test_actual_deploy_script_emits_only_the_approved_scope(self):
        for recovery, scope in [('true', SCOPE), ('false', 'functions:ai')]:
            with self.subTest(recovery=recovery), TemporaryDirectory() as folder:
                root = Path(folder)
                cli = root / 'firebase-cli/node_modules/.bin/firebase'
                cli.parent.mkdir(parents=True)
                cli.write_text('#!/usr/bin/env python3\nimport json,sys,os\nfrom pathlib import Path\nPath(os.environ["ARGS_FILE"]).write_text(json.dumps(sys.argv[1:]))\n')
                cli.chmod(0o755)
                env = {**os.environ, 'RUNNER_TEMP': folder, 'POOL_RECOVERY': recovery,
                       'PROJECT_ID': 'hausaufgabe-staging', 'ARGS_FILE': str(root / 'args.json')}
                result = subprocess.run(['bash', '-e', '-c', workflow_script('Deploy the approved AI scope to staging')], env=env, capture_output=True, text=True)
                self.assertEqual(result.returncode, 0, result.stderr)
                self.assertEqual(json.loads((root / 'args.json').read_text()),
                    ['deploy', '--project', 'hausaufgabe-staging', '--only', scope, '--non-interactive'])

    def test_actual_receipt_script_records_the_scoped_recovery(self):
        with TemporaryDirectory() as folder:
            env = {**os.environ, 'POOL_RECOVERY': 'true', 'PROJECT_ID': 'hausaufgabe-staging',
                   'EXPECTED_SHA': 'a' * 40, 'INTEGRATION_BRANCH': 'feature/gradecrew-app-integration',
                   'RUN_ID': '123', 'UPSTREAM_RUN_ID': '456'}
            result = subprocess.run(['bash', '-e', '-c', workflow_script('Write deployment receipt')], env=env, cwd=folder, capture_output=True, text=True)
            self.assertEqual(result.returncode, 0, result.stderr)
            receipt = json.loads((Path(folder) / 'staging-functions-receipt.json').read_text())
            self.assertEqual(receipt['scope'], SCOPE)
            self.assertEqual(receipt['verifiedFunctions'], ['generateTest', 'startAiTestJob', 'processAiTestJob'])
            self.assertEqual(receipt['commit'], 'a' * 40)
            self.assertEqual(receipt['upstreamCiRun'], 456)
            self.assertFalse(receipt['productionChanged'])

    def test_manual_recovery_requires_exact_ci_and_commit_on_main(self):
        text = WORKFLOW.read_text()
        self.assertIn('  workflow_dispatch:\n', text)
        self.assertIn('      upstream_ci_run:\n', text)
        self.assertIn('      commit:\n', text)
        source = text.split('  source:\n', 1)[1].split('  deploy-ai-functions:\n', 1)[0]
        self.assertIn("github.event_name == 'workflow_dispatch' && github.ref == 'refs/heads/main'", source)
        self.assertIn('UPSTREAM_RUN_ID: ${{ inputs.upstream_ci_run || github.event.workflow_run.id }}', source)
        self.assertIn('EXPECTED_SHA: ${{ inputs.commit }}', source)
        self.assertIn('python3 -m tools.automation.deployment_evidence', source)

    def test_recovery_only_updates_three_pool_functions_without_force(self):
        text = WORKFLOW.read_text()
        ai = text.split('  deploy-ai-functions:\n', 1)[1].split('  deploy-assessment-functions:\n', 1)[0]
        self.assertIn('POOL_RECOVERY: ${{ needs.source.outputs.pool_recovery }}', ai)
        self.assertIn('if [ "$POOL_RECOVERY" = "true" ]; then', ai)
        self.assertIn('--only '+SCOPE, ai)
        self.assertIn('--only functions:ai \\\n', ai)  # ordinary automatic path remains unchanged
        self.assertNotIn('--force', ai)
        self.assertNotIn('functions:delete', ai)

    def test_assessment_is_skipped_and_receipt_records_actual_scope(self):
        text = WORKFLOW.read_text()
        assessment = text.split('  deploy-assessment-functions:\n', 1)[1]
        self.assertIn("needs.source.outputs.pool_recovery != 'true'", assessment)
        ai = text.split('  deploy-ai-functions:\n', 1)[1].split('  deploy-assessment-functions:\n', 1)[0]
        self.assertIn("process.env.POOL_RECOVERY === 'true'", ai)
        self.assertIn("['generateTest', 'startAiTestJob', 'processAiTestJob']", ai)
        self.assertIn(SCOPE, ai)
        self.assertIn("productionChanged: false", ai)

if __name__ == '__main__':
    unittest.main()

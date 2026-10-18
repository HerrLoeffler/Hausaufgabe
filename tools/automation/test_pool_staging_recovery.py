"""The pool recovery deploy must preserve unrelated learning Functions."""
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[2]
WORKFLOW = ROOT / '.github/workflows/staging-functions.yml'
SCOPE = 'functions:ai:generateTest,functions:ai:startAiTestJob,functions:ai:processAiTestJob'

class PoolStagingRecoveryTests(unittest.TestCase):
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

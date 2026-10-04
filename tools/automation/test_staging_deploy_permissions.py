#!/usr/bin/env python3
import pathlib
import re
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[2]

class StagingDeployWorkflowPermissionTests(unittest.TestCase):
    def assert_workflow_permissions(self, path: str, deploy_job: str) -> None:
        text = (ROOT / path).read_text(encoding="utf-8")
        header = text.split("jobs:", 1)[0]
        self.assertIn("permissions:\n  contents: read\n  actions: read", header)
        pattern = (
            rf"(?ms)^  {re.escape(deploy_job)}:.*?"
            r"^    permissions:\n"
            r"      contents: read\n"
            r"      actions: read\n"
            r"      id-token: write"
        )
        self.assertRegex(text, pattern)
        self.assertNotIn("actions: write", text)

    def test_staging_preview_can_verify_upstream_actions_run(self) -> None:
        self.assert_workflow_permissions(
            ".github/workflows/staging-preview.yml",
            "deploy",
        )

    def test_staging_functions_can_verify_upstream_actions_run(self) -> None:
        self.assert_workflow_permissions(
            ".github/workflows/staging-functions.yml",
            "deploy-ai-functions",
        )

if __name__ == "__main__":
    unittest.main()

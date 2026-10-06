"""Fail-closed checks for promoting one already verified preview."""
import os
import json
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest
from unittest.mock import patch

from tools.automation import canonical_staging as promotion

SHA = "a" * 40
RUN_ID = 123
SOURCE = {"commit": SHA, "upstreamCiRun": 456, "workflowRun": RUN_ID,
          "project": "hausaufgabe-staging"}
RECEIPT = {"project": "hausaufgabe-staging", "channel": "gradecrew-app-integration",
           "commit": SHA, "url": "https://hausaufgabe-staging--gradecrew-app-integration-abc123.web.app",
           "verified_files": 2, "ci_run": str(RUN_ID), "device_test": "not_performed"}
RUN = {"name": "Automatic staging preview", "path": ".github/workflows/staging-preview.yml",
       "event": "workflow_run", "head_branch": "main",
       "head_repository": {"full_name": "HerrLoeffler/Hausaufgabe"},
       "status": "completed", "conclusion": "success"}
ENV = {"GITHUB_REPOSITORY": "HerrLoeffler/Hausaufgabe", "GITHUB_REF": "refs/heads/main",
       "GITHUB_EVENT_NAME": "workflow_dispatch", "PREVIEW_RUN_ID": str(RUN_ID),
       "EXPECTED_SHA": SHA}


class CanonicalStagingTests(unittest.TestCase):
    def test_accepts_only_matching_current_verified_preview(self):
        def github(path):
            if path == f"actions/runs/{RUN_ID}":
                return RUN
            return {"workflow_runs": [{"id": RUN_ID, "event": "workflow_run"}]}

        def artifact(_run, name, _file):
            return SOURCE if name == "verified-deploy-source" else RECEIPT

        with patch.dict(os.environ, ENV), patch.object(promotion, "api", side_effect=github), \
                patch.object(promotion, "artifact_document", side_effect=artifact), \
                patch.object(promotion, "ci_source", return_value=SHA):
            self.assertEqual(promotion.qualify(), (SOURCE, RECEIPT))

    def test_blocks_known_failed_acceptance_and_non_main_dispatch(self):
        with patch.dict(os.environ, {**ENV, "EXPECTED_SHA": promotion.REJECTED_SHA}):
            with self.assertRaisesRegex(ValueError, "failed user-acceptance"):
                promotion.inputs()
        with patch.dict(os.environ, {**ENV, "GITHUB_REF": "refs/heads/feature/other"}):
            with self.assertRaisesRegex(ValueError, "on main"):
                promotion.inputs()

    def test_newer_preview_attempt_blocks_older_success(self):
        def github(path):
            if path == f"actions/runs/{RUN_ID}":
                return RUN
            return {"workflow_runs": [{"id": 124, "event": "workflow_run"},
                                      {"id": RUN_ID, "event": "workflow_run"}]}

        with patch.dict(os.environ, ENV), patch.object(promotion, "api", side_effect=github):
            with self.assertRaisesRegex(ValueError, "newer automatic preview"):
                promotion.qualify()

    def test_receipt_must_match_exact_sha_and_preview_scope(self):
        bad_receipt = {**RECEIPT, "channel": "live"}
        with patch.dict(os.environ, ENV), \
                patch.object(promotion, "api", side_effect=[
                    RUN, {"workflow_runs": [{"id": RUN_ID, "event": "workflow_run"}]}]), \
                patch.object(promotion, "artifact_document", side_effect=[SOURCE, bad_receipt]), \
                patch.object(promotion, "ci_source", return_value=SHA):
            with self.assertRaisesRegex(ValueError, "receipt differs"):
                promotion.qualify()

    def test_live_version_must_equal_pinned_preview_version(self):
        state = {"sourceRun": RUN_ID, "commit": SHA, "upstreamCiRun": 456,
                 "previewVersion": "sites/hausaufgabe-staging/versions/v1",
                 "previousLiveVersion": "sites/hausaufgabe-staging/versions/v0"}
        with TemporaryDirectory() as folder:
            state_file = Path(folder) / "state.json"
            state_file.write_text(json.dumps(state))
            with patch.dict(os.environ, {**ENV, "GITHUB_RUN_ID": "789"}), \
                    patch.object(promotion, "qualify", return_value=(SOURCE, RECEIPT)), \
                    patch.object(promotion, "STATE", state_file), \
                    patch.object(promotion, "channel_version", return_value="sites/hausaufgabe-staging/versions/other"):
                with self.assertRaisesRegex(ValueError, "pinned preview version"):
                    promotion.verify()


if __name__ == "__main__":
    unittest.main()

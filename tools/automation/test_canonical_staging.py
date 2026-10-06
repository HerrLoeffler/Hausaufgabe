"""Fail-closed checks for promoting one already verified preview."""
import os
import json
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest
from unittest.mock import patch

from tools.automation import canonical_staging as promotion
from tools.automation import preview

SHA = "a" * 40
RUN_ID = 123
SOURCE = {"commit": SHA, "upstreamCiRun": 456, "workflowRun": RUN_ID,
          "project": "hausaufgabe-staging"}
RECEIPT = {"project": "hausaufgabe-staging", "channel": "gradecrew-app-integration",
           "commit": SHA, "url": "https://hausaufgabe-staging--gradecrew-app-integration-abc123.web.app",
           "version": "sites/hausaufgabe-staging/versions/v1",
           "verified_files": 2, "ci_run": str(RUN_ID), "device_test": "not_performed"}
RUN = {"name": "Automatic staging preview", "path": ".github/workflows/staging-preview.yml",
       "event": "workflow_run", "head_branch": "main",
       "head_repository": {"full_name": "HerrLoeffler/Hausaufgabe"},
       "status": "completed", "conclusion": "success"}
ENV = {"GITHUB_REPOSITORY": "HerrLoeffler/Hausaufgabe", "GITHUB_REF": "refs/heads/main",
       "GITHUB_EVENT_NAME": "workflow_dispatch", "PREVIEW_RUN_ID": str(RUN_ID),
       "EXPECTED_SHA": SHA, "MANUAL_RUN_ID": str(RUN_ID), "MANUAL_COMMIT": SHA}


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
            with self.assertRaisesRegex(ValueError, "trusted main"):
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

    def test_push_request_is_immutable_and_exact(self):
        with TemporaryDirectory() as folder:
            request = Path(folder) / "canonical-request.json"
            request.write_text(json.dumps({"id": "candidate-1", "previewRunId": RUN_ID,
                                           "commit": SHA}))
            with patch.dict(os.environ, {**ENV, "GITHUB_EVENT_NAME": "push",
                                          "REQUEST_FILE": "automation/canonical-staging-requests/candidate-1.json"}), \
                    patch.object(promotion, "Path", return_value=request):
                self.assertEqual(promotion.inputs(), (RUN_ID, SHA))

    def test_push_router_separates_canonical_request_from_preview_deploy(self):
        with TemporaryDirectory() as folder:
            output = Path(folder) / "output"
            row = {"filename": "automation/canonical-staging-requests/candidate-1.json",
                   "status": "added"}
            with patch.dict(os.environ, {**ENV, "GITHUB_EVENT_NAME": "push",
                                          "BEFORE_SHA": "b" * 40, "AFTER_SHA": "c" * 40,
                                          "GITHUB_OUTPUT": str(output)}), \
                    patch.object(promotion, "api", return_value={"files": [row], "total_commits": 1}):
                promotion.route()
            self.assertIn("mode=canonical", output.read_text())
            output.unlink()
            ordinary = {"filename": "automation/deployment-requests/guardian-pilot.json",
                        "status": "modified"}
            with patch.dict(os.environ, {**ENV, "GITHUB_EVENT_NAME": "push",
                                          "BEFORE_SHA": "b" * 40, "AFTER_SHA": "c" * 40,
                                          "GITHUB_OUTPUT": str(output)}), \
                    patch.object(promotion, "api", return_value={"files": [ordinary], "total_commits": 1}):
                promotion.route()
            self.assertIn("mode=preview", output.read_text())
            row["status"] = "modified"
            with patch.dict(os.environ, {**ENV, "GITHUB_EVENT_NAME": "push",
                                          "BEFORE_SHA": "b" * 40, "AFTER_SHA": "c" * 40,
                                          "GITHUB_OUTPUT": str(output)}), \
                    patch.object(promotion, "api", return_value={"files": [row], "total_commits": 1}):
                with self.assertRaisesRegex(ValueError, "append-only"):
                    promotion.route()

    def test_canonical_push_run_is_excluded_but_newer_preview_still_blocks(self):
        canonical = {"id": 124, "event": "push", "head_sha": "c" * 40}
        preview_run = {"id": RUN_ID, "event": "workflow_run"}

        def github(path):
            if path == f"actions/runs/{RUN_ID}":
                return RUN
            if path.startswith("commits/"):
                return {"files": [{"filename": "automation/canonical-staging-requests/candidate-1.json",
                                   "status": "added"}]}
            return {"workflow_runs": [canonical, preview_run]}

        def artifact(_run, name, _file):
            return SOURCE if name == "verified-deploy-source" else RECEIPT

        with patch.dict(os.environ, ENV), patch.object(promotion, "api", side_effect=github), \
                patch.object(promotion, "artifact_document", side_effect=artifact), \
                patch.object(promotion, "ci_source", return_value=SHA):
            self.assertEqual(promotion.qualify(), (SOURCE, RECEIPT))
            canonical["event"] = "workflow_run"
            with self.assertRaisesRegex(ValueError, "newer automatic preview"):
                promotion.qualify()

    def test_preview_receipt_version_is_unambiguous(self):
        result = {"result": {"hausaufgabe-staging": {
            "url": RECEIPT["url"], "version": "v1"}}}
        self.assertEqual(preview.deployed_version(result), RECEIPT["version"])
        with self.assertRaisesRegex(ValueError, "unambiguous"):
            preview.deployed_version({"a": {"version": "v1"}, "b": {"version": "v2"}})

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

    def test_changed_live_version_blocks_clone_before_output(self):
        with TemporaryDirectory() as folder:
            state_file = Path(folder) / "state.json"
            output = Path(folder) / "output"
            versions = ["sites/hausaufgabe-staging/versions/v0",
                        RECEIPT["version"], RECEIPT["version"],
                        "sites/hausaufgabe-staging/versions/v2"]
            with patch.dict(os.environ, {**ENV, "GITHUB_OUTPUT": str(output)}), \
                    patch.object(promotion, "qualify", return_value=(SOURCE, RECEIPT)), \
                    patch.object(promotion, "bundle", return_value={"files": {"index.html": "a"}}), \
                    patch.object(promotion, "published_files"), \
                    patch.object(promotion, "channel_version", side_effect=versions), \
                    patch.object(promotion, "STATE", state_file):
                with self.assertRaisesRegex(ValueError, "live channel changed"):
                    promotion.prepare()
            self.assertFalse(output.exists())


if __name__ == "__main__":
    unittest.main()

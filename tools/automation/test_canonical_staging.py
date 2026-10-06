"""Fail-closed checks for promoting one already verified preview."""
import os
import json
import hashlib
from io import BytesIO
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

    def test_preview_verifies_all_bytes_with_empty_cli_version(self):
        with TemporaryDirectory() as folder:
            root = Path(folder)
            public = root / "public"
            public.mkdir()
            files = {"index.html": b"<h1>Test</h1>",
                     "firebase-config.js": b'projectId: "hausaufgabe-staging"'}
            for name, data in files.items():
                (public / name).write_bytes(data)
            release = {"project": "hausaufgabe-staging", "commit": SHA,
                       "files": {name: hashlib.sha256(data).hexdigest()
                                 for name, data in files.items()}}
            (public / "release.json").write_text(json.dumps(release))
            deploy = root / "deploy.json"
            deploy.write_text(json.dumps({"status": "success", "result": {
                "hausaufgabe-staging": {"url": RECEIPT["url"], "version": ""}}}))
            summary = root / "summary"

            def served(request, timeout):
                name = request.full_url.split("?", 1)[0].rsplit("/", 1)[1]
                response = BytesIO((public / name).read_bytes())
                response.url = request.full_url
                return response

            with patch.dict(os.environ, {"EXPECTED_SHA": SHA, "DEPLOY_RESULT": str(deploy),
                                          "GITHUB_RUN_ID": str(RUN_ID),
                                          "GITHUB_STEP_SUMMARY": str(summary)}), \
                    patch.object(preview.sys, "argv", ["preview.py", "verify", str(root)]), \
                    patch.object(preview.urllib.request, "urlopen", side_effect=served):
                preview.main()
            receipt = json.loads((root / "receipt.json").read_text())
            self.assertEqual(receipt["verified_files"], 2)
            self.assertNotIn("version", receipt)
            (root / "receipt.json").unlink()

            def corrupt(request, timeout):
                response = served(request, timeout)
                if request.full_url.split("?", 1)[0].endswith("/index.html"):
                    response = BytesIO(b"tampered")
                    response.url = request.full_url
                return response

            with patch.dict(os.environ, {"EXPECTED_SHA": SHA, "DEPLOY_RESULT": str(deploy),
                                          "GITHUB_RUN_ID": str(RUN_ID),
                                          "GITHUB_STEP_SUMMARY": str(summary)}), \
                    patch.object(preview.sys, "argv", ["preview.py", "verify", str(root)]), \
                    patch.object(preview.urllib.request, "urlopen", side_effect=corrupt):
                with self.assertRaisesRegex(ValueError, "Published bytes differ"):
                    preview.main()
            self.assertFalse((root / "receipt.json").exists())

    def test_live_verification_requires_stable_version_and_exact_bytes(self):
        state = {"sourceRun": RUN_ID, "commit": SHA, "upstreamCiRun": 456,
                 "previousLiveVersion": "sites/hausaufgabe-staging/versions/v0"}
        with TemporaryDirectory() as folder:
            state_file = Path(folder) / "state.json"
            state_file.write_text(json.dumps(state))
            with patch.dict(os.environ, {**ENV, "GITHUB_RUN_ID": "789"}), \
                    patch.object(promotion, "qualify", return_value=(SOURCE, RECEIPT)), \
                    patch.object(promotion, "STATE", state_file), \
                    patch.object(promotion, "bundle", return_value={"files": {"index.html": "a"}}), \
                    patch.object(promotion, "published_files"), \
                    patch.object(promotion, "channel_version", side_effect=[
                        "sites/hausaufgabe-staging/versions/v1",
                        "sites/hausaufgabe-staging/versions/v2"]):
                with self.assertRaisesRegex(ValueError, "live channel changed"):
                    promotion.verify()

    def test_changed_live_version_blocks_deploy_preparation(self):
        with TemporaryDirectory() as folder:
            state_file = Path(folder) / "state.json"
            versions = ["sites/hausaufgabe-staging/versions/v0",
                        "sites/hausaufgabe-staging/versions/v2"]
            with patch.dict(os.environ, ENV), \
                    patch.object(promotion, "qualify", return_value=(SOURCE, RECEIPT)), \
                    patch.object(promotion, "bundle", return_value={"files": {"index.html": "a"}}), \
                    patch.object(promotion, "published_files"), \
                    patch.object(promotion, "channel_version", side_effect=versions), \
                    patch.object(promotion, "STATE", state_file):
                with self.assertRaisesRegex(ValueError, "live channel changed"):
                    promotion.prepare()

    def test_project_qualified_hosting_version_is_normalized(self):
        payload = {"release": {"version": {"name":
            "projects/950775032930/sites/hausaufgabe-staging/versions/v1"}}}
        def served(request, timeout):
            self.assertEqual(request.full_url,
                             "https://firebasehosting.googleapis.com/v1beta1/sites/hausaufgabe-staging/channels/live")
            return BytesIO(json.dumps(payload).encode())
        with patch.dict(os.environ, {"GCP_ACCESS_TOKEN": "test"}), \
                patch.object(promotion.urllib.request, "urlopen", side_effect=served):
            self.assertEqual(promotion.channel_version("live", True),
                             "sites/hausaufgabe-staging/versions/v1")
        payload["release"]["version"]["name"] = (
            "projects/other-project/sites/hausaufgabe-staging/versions/v1")
        with patch.dict(os.environ, {"GCP_ACCESS_TOKEN": "test"}), \
                patch.object(promotion.urllib.request, "urlopen",
                             return_value=BytesIO(json.dumps(payload).encode())):
            with self.assertRaisesRegex(ValueError, "Unexpected Hosting version"):
                promotion.channel_version("live", True)


if __name__ == "__main__":
    unittest.main()

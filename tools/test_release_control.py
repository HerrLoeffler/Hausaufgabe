"""Regression tests for release claims, without network access or deployments."""
import contextlib
import hashlib
import io
import json
import pathlib
import tempfile
import unittest
import zipfile
from unittest.mock import patch

from tools import release_control as rc

A = "a" * 40
B = "b" * 40


def run(kind="hosting", **changes):
    name, path, event, branch, _, _ = rc.DEPLOYMENTS[kind]
    return dict({"id": 123, "name": name, "path": ".github/workflows/" + path,
                 "event": event or "push", "head_branch": branch, "head_sha": A,
                 "repository": {"full_name": rc.REPO}, "head_repository": {"full_name": rc.REPO},
                 "status": "completed", "conclusion": "success", "run_number": 10, "run_attempt": 1}, **changes)


def receipt(kind="hosting"):
    base = {"project": "hausaufgabe-staging", "commit": A}
    if kind == "hosting":
        return dict(base, channel="gradecrew-app-integration", ci_run="123", verified_files=103,
                    url="https://hausaufgabe-staging--gradecrew-app-integration-201hlnau.web.app")
    if kind == "functions":
        return dict(base, productionChanged=False, integrationBranch=rc.WEB_BRANCH, scope="functions:ai",
                    workflowRun=123, upstreamCiRun=100, firestoreRulesChanged=False,
                    verifiedFunctions=["crewAssistant", "reviseWholeTest", "recordCrewTelemetry", "getCrewTelemetrySummary", "cleanupCrewTelemetry"])
    return dict(base, productionChanged=False, integrationBranch="integration/ai-gateway-staging",
                service="gradecrew-ai-gateway-staging", promotedRevision="gateway-42",
                candidateSmoke={"health": True, "claude": {"ok": True}, "openai": {"ok": True}})


class ReleaseControlTests(unittest.TestCase):
    def test_acceptance_requires_full_commit_for_pass_failure_and_skip(self):
        for status in ("passed", "failed", "skipped"):
            for sha in (None, "abc1234", "", "g" * 40, 123, 10 ** 39):
                with self.subTest(status=status, sha=sha):
                    self.assertEqual(rc.acceptance_view({"status": status, "testedSha": sha}, A)[0], "invalid")

    def test_acceptance_unknown_current_or_changed_commit_requires_retest(self):
        for status in ("passed", "failed", "skipped"):
            for current in (None, B):
                self.assertEqual(rc.acceptance_view({"status": status, "testedSha": A, "note": "Button fehlt"}, current), ("retest", "Button fehlt"))
        self.assertEqual(rc.acceptance_view({"status": "passed", "testedSha": A}, A)[0], "passed")

    def test_invalid_acceptance_payloads(self):
        for value in ([], [1], "passed", {"status": "everything_green"}):
            self.assertEqual(rc.acceptance_view(value, A)[0], "invalid")

    def test_unknown_dependency_cannot_be_ignored(self):
        stage, sources = rc.feature_stage(["known", "missing"], {"known": {"stage": "staging_deployed"}}, {})
        self.assertIsNone(stage)
        self.assertEqual(len(sources), 2)

    def test_branch_tips_and_state_are_not_deployments(self):
        with patch.object(rc, "ref_sha", return_value=A):
            for kind in ("games", "ios", "gateway"):
                self.assertIsNone(rc.target_sha(kind, A, None, {"games-escape": {"observed_head": A}}, {}))

    def test_newer_ci_rerun_cannot_reuse_old_green(self):
        latest = dict(run(), name="AI Staging Checks", event="push", head_branch=rc.WEB_BRANCH, status="in_progress", conclusion=None)
        old = dict(latest, status="completed", conclusion="success")
        self.assertIsNone(rc.find_ci_run([latest, old], "AI Staging Checks", rc.WEB_BRANCH, A)["conclusion"])

    def test_latest_failed_or_pending_deploy_blocks_old_success(self):
        for status, conclusion in (("completed", "failure"), ("in_progress", None), ("completed", "cancelled")):
            with patch.object(rc, "gh_request") as api:
                warnings = []
                self.assertIsNone(rc.latest_deployment([run(), run(id=124, run_number=11, status=status, conclusion=conclusion)], "hosting", warnings))
                api.assert_not_called()
                self.assertTrue(warnings)

    def test_receipt_must_come_from_correct_workflow_repo_event_and_branch(self):
        for change in ({"path": "rogue.yml"}, {"event": "pull_request"}, {"head_branch": "other"},
                       {"repository": {"full_name": "other/repo"}}, {"head_repository": {"full_name": "fork/repo"}}):
            with patch.object(rc, "gh_request") as api:
                self.assertIsNone(rc.latest_deployment([run(**change)], "hosting", []))
                api.assert_not_called()

    def test_actual_receipts_for_each_component(self):
        for kind in rc.DEPLOYMENTS:
            prefix = rc.DEPLOYMENTS[kind][4]
            artifact = {"id": 456, "name": prefix if kind == "hosting" else prefix + A}
            with patch.object(rc, "gh_request", return_value={"artifacts": [artifact]}), patch.object(rc, "receipt_document", return_value=receipt(kind)):
                proof = rc.latest_deployment([run(kind)], kind, [])
                self.assertEqual(proof["commit"], A)
                self.assertEqual(proof["evidence"], "validated_receipt")

    def test_artifact_name_alone_cannot_prove_deployment(self):
        artifact = {"id": 456, "name": "staging-functions-receipt-" + A}
        with patch.object(rc, "gh_request", return_value={"artifacts": [artifact]}), patch.object(rc, "receipt_document", return_value=receipt("functions") | {"commit": B}):
            self.assertIsNone(rc.latest_deployment([run("functions")], "functions", []))

    def test_wrong_project_run_scope_or_smoke_is_rejected(self):
        cases = [("hosting", {"project": "hausaufgabe-40294"}), ("hosting", {"ci_run": "other"}),
                 ("hosting", {"verified_files": 0}), ("hosting", {"url": "https://evil.example"}),
                 ("functions", {"scope": "functions"}), ("functions", {"verifiedFunctions": []}),
                 ("functions", {"workflowRun": 999}), ("functions", {"firestoreRulesChanged": True}),
                 ("gateway", {"productionChanged": True}), ("gateway", {"candidateSmoke": {"health": True}})]
        for kind, changes in cases:
            with self.subTest(kind=kind, changes=changes), self.assertRaises(ValueError):
                rc.validate_receipt(kind, receipt(kind) | changes, run(kind))

    def test_missing_expired_or_ambiguous_receipt_is_unverified(self):
        valid = {"id": 456, "name": "verified-preview-receipt"}
        for artifacts in ([], [valid | {"expired": True}], [valid, valid]):
            with patch.object(rc, "gh_request", return_value={"artifacts": artifacts}):
                self.assertIsNone(rc.latest_deployment([run()], "hosting", []))

    def test_download_digest_and_zip_contract(self):
        def zipped(name, text):
            stream = io.BytesIO()
            with zipfile.ZipFile(stream, "w") as z:
                z.writestr(name, text)
            return stream.getvalue()
        for name, content, valid in (("receipt.json", json.dumps(receipt()), True), ("../receipt.json", "{}", False), ("receipt.json", "[]", False), ("receipt.json", "x" * 65537, False)):
            data = zipped(name, content)
            artifact = {"id": 456, "size_in_bytes": len(data), "digest": "sha256:" + hashlib.sha256(data).hexdigest()}
            with patch.object(rc.subprocess, "check_output", return_value=data):
                if valid:
                    self.assertEqual(rc.receipt_document(artifact, "receipt.json")["commit"], A)
                else:
                    with self.assertRaises(ValueError):
                        rc.receipt_document(artifact, "receipt.json")
                with self.assertRaises(ValueError):
                    rc.receipt_document(artifact | {"digest": "sha256:wrong"}, "receipt.json")

    def test_board_offline_never_reuses_snapshot_or_documented_state_as_deploy(self):
        docs = [{"schemaVersion": 1, "areas": [{"id": "a", "features": [{"id": "AUTH", "sourceWorkstreams": ["web"], "tests": [{"id": "T"}]}]}]},
                {"schemaVersion": 1, "results": {"T": {"status": "passed", "testedSha": A}}},
                {"release_train": {"observed_integration_head": A}, "automation": {"preview_evidence": {"commit": A}, "functions_automation_evidence": {"deployed_commit": A}}, "workstreams": [{"id": "web", "stage": "staging_deployed"}]},
                {"workstreams": []}]
        with tempfile.TemporaryDirectory() as tmp, patch.object(rc, "load_json", side_effect=docs), patch.object(rc, "ref_sha", return_value=A), patch.object(rc, "github_runs", return_value=[]), patch.object(rc, "verified_preview_snapshot", return_value={"commit": A}), patch("sys.argv", ["release_control.py", "--json-out", tmp + "/board.json"]), contextlib.redirect_stdout(io.StringIO()):
            self.assertEqual(rc.main(), 0)
            board = json.loads(pathlib.Path(tmp, "board.json").read_text())
        self.assertFalse(board["candidate"]["webTechnicallySynchronized"])
        self.assertFalse(board["candidate"]["stagingComplete"])
        self.assertIsNone(board["candidate"]["hosting"])
        self.assertEqual(board["summary"]["passed"], 0)
        self.assertEqual(board["features"][0]["tests"][0]["status"], "retest")


if __name__ == "__main__":
    unittest.main()

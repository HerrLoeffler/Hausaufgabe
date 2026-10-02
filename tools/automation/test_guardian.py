import contextlib
import copy
import io
import json
import os
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

from tools.automation import guardian as g

A, B = "a" * 40, "b" * 40
ROW = {"id": "pilot", "enabled": True, "baseBranch": "feature/gradecrew-app-integration",
       "approvedSha": A, "taskId": "pilot-task", "maxAutomaticStage": "staging_deployed"}
POLICY = {"schemaVersion": 1, "enabled": True, "maxAttemptsPerStage": 3,
          "automaticProduction": False, "workstreams": [ROW]}
EMPTY = {"schemaVersion": 1, "attempts": {}}


class GuardianTests(unittest.TestCase):
    def test_policy_cannot_authorize_production_or_unbounded_calls(self):
        for update in ({"automaticProduction": True}, {"maxAttemptsPerStage": 0},
                       {"maxAttemptsPerStage": 4}, {"maxAttemptsPerStage": True}, {"enabled": "true"}):
            with self.assertRaises(ValueError):
                g.validate_policy(POLICY | update)

    def test_task_permissions_need_supported_branch_pinned_sha_unique_id(self):
        for change in ({"baseBranch": "main"}, {"approvedSha": "HEAD"}, {"taskId": "../evil"},
                       {"enabled": "true"}, {"maxAutomaticStage": "production"}):
            with self.assertRaises(ValueError):
                g.validate_policy(POLICY | {"workstreams": [ROW | change]})
        with self.assertRaises(ValueError):
            g.validate_policy(POLICY | {"workstreams": [ROW, ROW]})

    def test_disabled_or_changed_source_never_calls_ai(self):
        self.assertEqual(g.choose(ROW, "branch_only", EMPTY, False, A)[0], "disabled")
        self.assertEqual(g.choose(ROW | {"enabled": False}, "branch_only", EMPTY, True, A)[0], "disabled")
        self.assertEqual(g.choose(ROW, "branch_only", EMPTY, True, B)[0], "blocked")

    def test_human_gates_are_never_fabricated(self):
        for stage, action in (("staging_deployed", "await_user_acceptance"),
                              ("user_tested", "await_production_approval"), ("production", "complete")):
            self.assertEqual(g.choose(ROW, stage, EMPTY, True, A)[0], action)
        self.assertEqual(g.choose(ROW, "unknown", EMPTY, True, A)[0], "blocked")

    def test_ci_success_alone_does_not_merge_and_integration_is_not_a_deploy(self):
        self.assertEqual(g.choose(ROW, "ci_green", EMPTY, True, A)[0], "await_independent_reviews")
        self.assertEqual(g.choose(ROW, "integrated", EMPTY, True, A)[0], "await_deployment_receipts")

    def test_budget_stops_after_three_and_changed_sha_cannot_reset_it(self):
        history = {"schemaVersion": 1, "attempts": {"pilot:branch_only": [
            {"requestId": f"run-{i}", "state": "failed", "approvedSha": A} for i in range(3)]}}
        self.assertEqual(g.choose(ROW | {"approvedSha": B}, "branch_only", history, True, B)[0], "stopped")
        with self.assertRaises(ValueError):
            g.reserve(history, ROW, "branch_only", "run-4", 3)

    def test_unknown_dispatch_or_running_attempt_blocks_duplicate(self):
        for state in ("reserved", "dispatch_unknown", "dispatched"):
            ledger = {"schemaVersion": 1, "attempts": {"pilot:branch_only": [{"state": state}]}}
            self.assertEqual(g.choose(ROW, "branch_only", ledger, True, A)[0], "wait")
            with self.assertRaises(ValueError):
                g.reserve(ledger, ROW, "branch_only", "run-new", 3)

    def test_reservation_is_replay_safe_and_does_not_mutate_old_ledger(self):
        ledger = copy.deepcopy(EMPTY)
        result = g.reserve(ledger, ROW, "branch_only", "run-1", 3)
        self.assertEqual(ledger, EMPTY)
        with self.assertRaises(ValueError):
            g.reserve(result, ROW, "ci_green", "run-1", 3)

    def test_ledger_read_failure_is_not_empty_history(self):
        with patch.object(g, "api", side_effect=RuntimeError("unavailable")), self.assertRaises(RuntimeError):
            g.read_ledger()

    def test_ledger_write_uses_compare_and_swap_and_dedicated_branch(self):
        with patch.object(g, "api", return_value={"content": {"sha": "new"}}) as api:
            self.assertEqual(g.write_ledger(EMPTY, "old-blob-sha"), "new")
        args = api.call_args.args
        self.assertEqual(args[0], "contents/" + g.LEDGER_PATH)
        self.assertEqual(args[2]["sha"], "old-blob-sha")
        self.assertEqual(args[2]["branch"], g.LEDGER_BRANCH)

    def run_main(self, ready=True, execute=False, api_effect=None, write_effect=None):
        tmp = tempfile.TemporaryDirectory()
        self.addCleanup(tmp.cleanup)
        root = Path(tmp.name)
        (root / "automation").mkdir()
        (root / "agent-queue").mkdir()
        (root / "automation/guardian-policy.json").write_text(json.dumps(POLICY))
        (root / "GRADECREW_STATE.json").write_text(json.dumps({"workstreams": [{"id": "pilot", "stage": "branch_only"}, {"id": "unconfigured", "stage": "branch_only"}]}))
        (root / "agent-queue/pilot-task.json").write_text(json.dumps({"id": "pilot-task", "base_branch": ROW["baseBranch"], "base_sha": A, "goal": "Fix", "acceptance": "Tests", "constraints": "Scope"}))
        env = {"GITHUB_REPOSITORY": g.REPO, "GUARDIAN_ENABLED": "true", "WORKER_ENABLED": "true",
               "WORKER_KEY_PRESENT": "true" if ready else "false", "GITHUB_RUN_ID": "123", "GITHUB_RUN_ATTEMPT": "1"}
        args = ["guardian", "--json-out", str(root / "report.json")] + (["--execute"] if execute else [])
        with patch.object(g, "ROOT", root), patch.dict(os.environ, env), patch("sys.argv", args), patch.object(g, "read_ledger", return_value=(copy.deepcopy(EMPTY), "blob")), patch.object(g, "api", side_effect=api_effect or (lambda *a: {"object": {"sha": A}})) as api, patch.object(g, "write_ledger", side_effect=write_effect, return_value="next-blob") as write, contextlib.redirect_stdout(io.StringIO()):
            code = g.main()
        return code, json.loads((root / "report.json").read_text()), api, write

    def test_dry_run_never_reserves_or_dispatches(self):
        code, report, api, write = self.run_main()
        self.assertEqual(code, 0)
        self.assertEqual(report["actions"][0]["action"], "dispatch_worker")
        write.assert_not_called()
        self.assertTrue(all(c.args[1:] == () for c in api.call_args_list))
        self.assertEqual(report["unconfiguredWorkstreams"], ["unconfigured"])

    def test_missing_credential_stops_before_paid_call(self):
        _, report, api, write = self.run_main(ready=False, execute=True)
        self.assertEqual(report["actions"][0]["action"], "blocked")
        write.assert_not_called()
        self.assertEqual(api.call_count, 1)

    def test_durable_reservation_precedes_dispatch(self):
        order = []
        def api_effect(path, *args):
            if path.endswith("dispatches"):
                order.append("dispatch")
                return {}
            return {"object": {"sha": A}}
        def write_effect(value, sha):
            order.append(value["attempts"]["pilot:branch_only"][-1]["state"])
            return "new-blob"
        _, report, _, _ = self.run_main(execute=True, api_effect=api_effect, write_effect=write_effect)
        self.assertEqual(order, ["reserved", "dispatch", "dispatched"])
        self.assertEqual(report["actions"][0]["action"], "dispatched")

    def test_ambiguous_dispatch_is_persisted_and_not_retried(self):
        states = []
        def api_effect(path, *args):
            if path.endswith("dispatches"):
                raise RuntimeError("timeout")
            return {"object": {"sha": A}}
        def write_effect(value, sha):
            states.append(value["attempts"]["pilot:branch_only"][-1]["state"])
            return "new-blob"
        _, report, _, _ = self.run_main(execute=True, api_effect=api_effect, write_effect=write_effect)
        self.assertEqual(states, ["reserved", "dispatch_unknown"])
        self.assertEqual(report["actions"][0]["action"], "blocked")

    def test_source_changed_between_plan_and_dispatch_does_not_consume_budget(self):
        replies = iter([{"object": {"sha": A}}, {"object": {"sha": B}}])
        _, report, _, write = self.run_main(execute=True, api_effect=lambda *a: next(replies))
        self.assertEqual(report["actions"][0]["action"], "blocked")
        write.assert_not_called()


if __name__ == "__main__":
    unittest.main()

"""Promote one verified integration preview version to the canonical staging URL."""
from __future__ import annotations

import hashlib
import json
import os
from pathlib import Path
import re
import sys
import urllib.parse
import urllib.request

from .deployment_evidence import artifact_document, ci_source
from .guardian import REPO, api
from .preview import manifest

SITE = "hausaufgabe-staging"
CHANNEL = "gradecrew-app-integration"
CANONICAL_URL = "https://hausaufgabe-staging.web.app"
REJECTED_SHA = "f97841b82291d879cd9f4a9bccce0ee2c2cf3641"
REQUEST = re.compile(r"automation/canonical-staging-requests/([a-z0-9][a-z0-9-]{0,79})\.json")
ROOT = Path("promotion")
STATE = ROOT / "promotion-state.json"


def route():
    if os.getenv("GITHUB_REPOSITORY") != REPO or os.getenv("GITHUB_REF") != "refs/heads/main":
        raise ValueError("Only trusted main may route staging requests")
    if os.environ["GITHUB_EVENT_NAME"] == "workflow_run":
        mode, request_file = "preview", ""
    elif os.environ["GITHUB_EVENT_NAME"] == "push":
        before, after = os.environ["BEFORE_SHA"], os.environ["AFTER_SHA"]
        if not all(re.fullmatch(r"[0-9a-f]{40}", value) for value in (before, after)):
            raise ValueError("Push comparison requires exact commit SHAs")
        comparison = api(f"compare/{before}...{after}")
        files = comparison["files"]
        if len(files) >= 300:
            raise ValueError("Oversized push diff cannot be routed safely")
        requests = [row for row in files if row["filename"].startswith(
            ("automation/deployment-requests/", "automation/canonical-staging-requests/"))]
        if len(requests) != 1:
            raise ValueError("Exactly one changed staging request required")
        row = requests[0]
        request_file = row["filename"]
        if REQUEST.fullmatch(request_file):
            if row.get("status") != "added" or comparison.get("total_commits") != 1:
                raise ValueError("Canonical staging requests require one append-only commit")
            mode = "canonical"
        elif re.fullmatch(r"automation/deployment-requests/[a-z0-9][a-z0-9-]{0,79}\.json", request_file):
            mode = "preview"
        else:
            raise ValueError("Unexpected staging request path")
    else:
        raise ValueError("Unsupported staging request event")
    with open(os.environ["GITHUB_OUTPUT"], "a") as output:
        output.write("mode=" + mode + "\nrequest_file=" + request_file + "\n")


def inputs():
    if os.getenv("GITHUB_REPOSITORY") != REPO or os.getenv("GITHUB_REF") != "refs/heads/main":
        raise ValueError("Canonical staging promotion requires trusted main")
    if os.getenv("GITHUB_EVENT_NAME") == "workflow_dispatch":
        raw_run = os.getenv("PREVIEW_RUN_ID") or os.environ["MANUAL_RUN_ID"]
        expected = os.getenv("EXPECTED_SHA") or os.environ["MANUAL_COMMIT"]
    elif os.getenv("GITHUB_EVENT_NAME") == "push":
        path = os.environ["REQUEST_FILE"]
        match = REQUEST.fullmatch(path)
        if not match:
            raise ValueError("Unexpected committed canonical request")
        request = json.loads(Path(path).read_text())
        if (set(request) != {"id", "previewRunId", "commit"}
                or request["id"] != match.group(1)
                or type(request["previewRunId"]) is not int):
            raise ValueError("Canonical request schema or filename differs")
        raw_run, expected = str(request["previewRunId"]), request["commit"]
    else:
        raise ValueError("Canonical staging requires explicit push request or manual dispatch")
    if not re.fullmatch(r"[1-9][0-9]*", raw_run) or not re.fullmatch(r"[0-9a-f]{40}", expected):
        raise ValueError("Explicit preview run ID and exact commit required")
    if expected == REJECTED_SHA:
        raise ValueError("The failed user-acceptance candidate is not eligible")
    return int(raw_run), expected


def resolve():
    run_id, expected = inputs()
    with open(os.environ["GITHUB_ENV"], "a") as output:
        output.write(f"PREVIEW_RUN_ID={run_id}\nEXPECTED_SHA={expected}\n")
    with open(os.environ["GITHUB_OUTPUT"], "a") as output:
        output.write(f"preview_run_id={run_id}\ncommit={expected}\n")


def qualify():
    run_id, expected = inputs()
    run = api(f"actions/runs/{run_id}")
    if (run.get("name") != "Automatic staging preview"
            or run.get("path") != ".github/workflows/staging-preview.yml"
            or run.get("event") not in {"push", "workflow_run"}
            or run.get("head_branch") != "main"
            or run.get("head_repository", {}).get("full_name") != REPO
            or run.get("status") != "completed" or run.get("conclusion") != "success"):
        raise ValueError("Source is not a successful trusted preview workflow")
    rows = api("actions/workflows/staging-preview.yml/runs?per_page=100")["workflow_runs"]
    automatic = [row for row in rows if row.get("event") in {"push", "workflow_run"}
                 and not canonical_request_run(row)]
    if not automatic or automatic[0]["id"] != run_id:
        raise ValueError("A newer automatic preview attempt exists; inspect it first")
    source = artifact_document(run_id, "verified-deploy-source", "deployment-source.json")
    if source != {"commit": expected, "upstreamCiRun": source.get("upstreamCiRun"),
                  "workflowRun": run_id, "project": SITE}:
        raise ValueError("Preview source artifact differs")
    if type(source["upstreamCiRun"]) is not int or ci_source(source["upstreamCiRun"]) != expected:
        raise ValueError("Original CI authority or current integration branch differs")
    receipt = artifact_document(run_id, "verified-preview-receipt", "receipt.json")
    if (receipt.get("project") != SITE or receipt.get("channel") != CHANNEL
            or receipt.get("commit") != expected or receipt.get("ci_run") != str(run_id)
            or receipt.get("device_test") != "not_performed"
            or type(receipt.get("verified_files")) is not int or receipt["verified_files"] < 1
            or not isinstance(receipt.get("version"), str)
            or not re.fullmatch(r"sites/hausaufgabe-staging/versions/[A-Za-z0-9_-]+", receipt["version"])
            or not re.fullmatch(
                r"https://hausaufgabe-staging--gradecrew-app-integration-[a-z0-9]+\.web\.app/?",
                str(receipt.get("url", "")))):
        raise ValueError("Preview verification receipt differs")
    return source, receipt


def canonical_request_run(row):
    if row.get("event") != "push":
        return False
    head = row.get("head_sha")
    if not isinstance(head, str) or not re.fullmatch(r"[0-9a-f]{40}", head):
        return False
    files = api("commits/" + head)["files"]
    requests = [item for item in files if item["filename"].startswith(
        ("automation/deployment-requests/", "automation/canonical-staging-requests/"))]
    return len(requests) == 1 and bool(REQUEST.fullmatch(requests[0]["filename"])) and requests[0].get("status") == "added"


def published_files(url, release):
    for name, digest in release["files"].items():
        target = url.rstrip("/") + "/" + urllib.parse.quote(name, safe="/")
        request = urllib.request.Request(target + "?verify=" + release["commit"],
                                         headers={"Cache-Control": "no-cache"})
        with urllib.request.urlopen(request, timeout=30) as response:
            if urllib.parse.urlparse(response.url).hostname != urllib.parse.urlparse(url).hostname:
                raise ValueError("Unexpected Hosting redirect")
            if hashlib.sha256(response.read()).hexdigest() != digest:
                raise ValueError("Published file hash differs: " + name)
    request = urllib.request.Request(url.rstrip("/") + "/release.json?verify=" + release["commit"],
                                     headers={"Cache-Control": "no-cache"})
    with urllib.request.urlopen(request, timeout=30) as response:
        if urllib.parse.urlparse(response.url).hostname != urllib.parse.urlparse(url).hostname:
            raise ValueError("Unexpected Hosting manifest redirect")
        if json.loads(response.read()) != release:
            raise ValueError("Published release manifest differs")


def channel_version(channel, required):
    token = os.environ["GCP_ACCESS_TOKEN"]
    endpoint = ("https://firebasehosting.googleapis.com/v1beta1/sites/"
                + SITE + "/channels/" + channel)
    request = urllib.request.Request(endpoint, headers={"Authorization": "Bearer " + token})
    with urllib.request.urlopen(request, timeout=30) as response:
        current = json.load(response).get("release")
    if not current:
        if required:
            raise ValueError("Source channel has no current release")
        return None
    version = current.get("version", {}).get("name")
    if not isinstance(version, str) or not re.fullmatch(
            r"sites/hausaufgabe-staging/versions/[A-Za-z0-9_-]+", version):
        raise ValueError("Unexpected Hosting version")
    return version


def bundle(expected, receipt):
    release = manifest(ROOT, expected)
    if len(release["files"]) != receipt["verified_files"]:
        raise ValueError("Build differs from verified preview receipt")
    return release


def prepare():
    source, receipt = qualify()
    release = bundle(source["commit"], receipt)
    before = channel_version("live", False)
    version = channel_version(CHANNEL, True)
    if version != receipt["version"]:
        raise ValueError("Current preview version differs from verified deployment receipt")
    published_files(receipt["url"], release)
    STATE.write_text(json.dumps({"sourceRun": int(os.environ["PREVIEW_RUN_ID"]),
                                 "commit": source["commit"], "upstreamCiRun": source["upstreamCiRun"],
                                 "previewVersion": version, "previousLiveVersion": before}) + "\n")
    # Recheck GitHub authority immediately before the destructive Hosting operation.
    qualify()
    if channel_version(CHANNEL, True) != version:
        raise ValueError("Preview channel changed during verification")
    if channel_version("live", False) != before:
        raise ValueError("Staging live channel changed before promotion")
    with open(os.environ["GITHUB_OUTPUT"], "a") as output:
        output.write("version=" + version.rsplit("/", 1)[1] + "\n")


def verify():
    source, receipt = qualify()
    state = json.loads(STATE.read_text())
    if state["sourceRun"] != int(os.environ["PREVIEW_RUN_ID"]) or state["commit"] != source["commit"]:
        raise ValueError("Promotion state differs")
    if channel_version("live", True) != state["previewVersion"]:
        raise ValueError("Canonical live channel does not serve the pinned preview version")
    release = bundle(source["commit"], receipt)
    published_files(CANONICAL_URL, release)
    result = {"project": SITE, "channel": "live", "url": CANONICAL_URL + "/",
              "commit": source["commit"], "sourcePreviewRun": state["sourceRun"],
              "upstreamCiRun": state["upstreamCiRun"], "version": state["previewVersion"],
              "previousLiveVersion": state["previousLiveVersion"],
              "verifiedFiles": len(release["files"]), "workflowRun": int(os.environ["GITHUB_RUN_ID"]),
              "functionsChanged": False, "rulesChanged": False, "productionChanged": False,
              "deviceTest": "not_performed"}
    (ROOT / "canonical-receipt.json").write_text(json.dumps(result, indent=2) + "\n")
    with open(os.environ["GITHUB_STEP_SUMMARY"], "a") as output:
        output.write("Canonical staging verified: " + CANONICAL_URL + "/\n\n"
                     + "Commit: `" + source["commit"] + "`\n\n"
                     + "Previous live version for a deliberate rollback: `"
                     + str(state["previousLiveVersion"]) + "`\n")


if __name__ == "__main__":
    {"route": route, "resolve": resolve, "qualify": qualify,
     "prepare": prepare, "verify": verify}[sys.argv[1]]()

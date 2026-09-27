#!/usr/bin/env python3
"""Read-only Staging source check; abort instead of rolling back unknown code."""
import datetime
import hashlib
import importlib.util
import json
from pathlib import Path
import subprocess
import tempfile
import zipfile

ROOT = Path(__file__).resolve().parent.parent
BASE = "8dbfaaaaf022499610fd0a854fcb2836ebef9528"
TARGETS = ("getAiStatus", "generateTest", "startAiTestJob", "processAiTestJob", "regenerateQuestion", "generateQuestionMedia", "analyzeMaterial")
PROJECT = "hausaufgabe-staging"
# The uploaded 27 September backup showed that two functions still run the older
# source. It contained the two-job lock and detailed image diagnostics, both of
# which are integrated in this branch. Accept that exact source archive only.
LEGACY_SOURCE_FINGERPRINT = "9f3252dbd01c8bafe4a462fff4de343f9def248e1a125af55c7f14924717898f"
spec = importlib.util.spec_from_file_location("source_export", ROOT / "tools/collect-ai-source.py")
exporter = importlib.util.module_from_spec(spec)
spec.loader.exec_module(exporter)


def runtime(files):
    return {name: data for name, data in files.items() if name in {"index.js", "package.json", "package-lock.json"} or name.startswith("lib/")}


def source_fingerprint(files):
    digest = hashlib.sha256()
    for name, data in sorted(files.items()):
        digest.update(name.encode() + b"\0" + len(data).to_bytes(8, "big") + data)
    return digest.hexdigest()


def runtime_at_commit(commit):
    names = subprocess.check_output(
        ["git", "ls-tree", "-r", "--name-only", commit, "functions"],
        cwd=ROOT,
        text=True,
    ).splitlines()
    return runtime({
        name.removeprefix("functions/"): subprocess.check_output(["git", "show", f"{commit}:{name}"], cwd=ROOT)
        for name in names
        if name.startswith("functions/")
    })


def known_branch_fingerprints():
    """Accept exact runtime snapshots that already existed on this branch.

    Staging functions are often deployed selectively. That means different
    functions can legitimately run source packages from different earlier
    commits on the same development branch. Those states are known and safe to
    replace with HEAD; an actually unknown server-only change still aborts.
    """
    commits = [BASE]
    history = subprocess.check_output(
        ["git", "log", "--format=%H", f"{BASE}..HEAD", "--", "functions"],
        cwd=ROOT,
        text=True,
    ).splitlines()
    commits.extend(history)
    result = {}
    for commit in commits:
        try:
            result[source_fingerprint(runtime_at_commit(commit))] = commit
        except subprocess.CalledProcessError:
            continue
    return result


def unexpected_files(deployed, baseline, proposed):
    return sorted(name for name in set(deployed) | set(baseline)
                  if deployed.get(name) != baseline.get(name) and deployed.get(name) != proposed.get(name))


def main():
    baseline = runtime_at_commit(BASE)
    proposed = runtime({path.relative_to(ROOT / "functions").as_posix(): path.read_bytes()
                        for path in (ROOT / "functions").rglob("*")
                        if path.is_file() and not path.is_symlink() and "node_modules" not in path.parts})
    known = known_branch_fingerprints()
    stamp = datetime.datetime.now(datetime.timezone.utc).strftime("%Y%m%d-%H%M%S-%f")
    backup = Path.home() / f"testify-vor-ai29-{stamp}.zip"
    problems, archives = [], {}
    with zipfile.ZipFile(backup, "x", compression=zipfile.ZIP_DEFLATED) as output, tempfile.TemporaryDirectory(prefix="testify-check-") as temp:
        for function in TARGETS:
            print(f"Prüfe laufenden Code: {function}", flush=True)
            metadata = json.loads(subprocess.check_output([
                "gcloud", "functions", "describe", function, "--gen2", "--project", PROJECT,
                "--region", "europe-west1", "--format=json(name,updateTime,buildConfig.source,buildConfig.sourceProvenance)"
            ], text=True))
            build = metadata.get("buildConfig", {})
            source = build.get("sourceProvenance", {}).get("resolvedStorageSource") or build.get("source", {}).get("storageSource") or {}
            if not source.get("bucket") or not source.get("object"):
                raise RuntimeError(f"Kein Quellarchiv für {function}; es wird nichts deployed.")
            uri = f"gs://{source['bucket']}/{source['object']}"
            if str(source.get("generation", "0")) != "0":
                uri += f"#{source['generation']}"
            if uri not in archives:
                archive = Path(temp) / hashlib.sha256(uri.encode()).hexdigest()
                subprocess.run(["gcloud", "storage", "cp", uri, str(archive), "--project", PROJECT], check=True)
                archives[uri] = runtime(exporter.selected_archive_files(archive))
            deployed = archives[uri]
            output.writestr(f"{function}/source-info.json", json.dumps(metadata, indent=2))
            for name, data in deployed.items():
                output.writestr(f"{function}/{name}", data)
            differences = unexpected_files(deployed, baseline, proposed)
            fingerprint = source_fingerprint(deployed)
            if fingerprint == LEGACY_SOURCE_FINGERPRINT:
                print(f"{function}: bekannten älteren Stand erkannt; Bilddiagnose und Auftragssteuerung wurden übernommen.", flush=True)
                differences = []
            elif fingerprint in known:
                short = known[fingerprint][:8]
                print(f"{function}: bekannten Branch-Stand {short} erkannt; Update ist sicher.", flush=True)
                differences = []
            if differences:
                problems.append(f"{function}: {', '.join(differences)}")
    print(f"Quellcode gesichert: {backup}", flush=True)
    if problems:
        print("Abweichender Servercode erkannt. Keine Änderungen deployed.\n" + "\n".join(problems))
        print("Diese ZIP enthält den fehlenden Serverstand (keine .env-Dateien). Für die Zusammenführung im Chat bereitstellen.")
        print(f"Cloud-Shell-Download: cloudshell download {backup}")
        raise SystemExit(2)
    print("Laufender Servercode entspricht einem bekannten geprüften Branch-Stand. Staging-Update kann fortfahren.")


if __name__ == "__main__":
    main()

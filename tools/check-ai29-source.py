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
TARGETS = ("getAiStatus", "generateTest", "processAiTestJob", "regenerateQuestion", "generateQuestionMedia", "analyzeMaterial")
PROJECT = "hausaufgabe-staging"
spec = importlib.util.spec_from_file_location("source_export", ROOT / "tools/collect-ai-source.py")
exporter = importlib.util.module_from_spec(spec)
spec.loader.exec_module(exporter)


def runtime(files):
    return {name: data for name, data in files.items() if name in {"index.js", "package.json", "package-lock.json"} or name.startswith("lib/")}


def unexpected_files(deployed, baseline, proposed):
    return sorted(name for name in set(deployed) | set(baseline)
                  if deployed.get(name) != baseline.get(name) and deployed.get(name) != proposed.get(name))


def main():
    names = subprocess.check_output(["git", "ls-tree", "-r", "--name-only", BASE, "functions"], cwd=ROOT, text=True).splitlines()
    baseline = runtime({name.removeprefix("functions/"): subprocess.check_output(["git", "show", f"{BASE}:{name}"], cwd=ROOT) for name in names if name.startswith("functions/")})
    proposed = {name: (ROOT / "functions" / name).read_bytes() for name in baseline if (ROOT / "functions" / name).is_file()}
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
            if differences:
                problems.append(f"{function}: {', '.join(differences)}")
    print(f"Quellcode gesichert: {backup}", flush=True)
    if problems:
        print("Abweichender Servercode erkannt. Keine Änderungen deployed.\n" + "\n".join(problems))
        print("Diese ZIP enthält den fehlenden Serverstand (keine .env-Dateien). Für die Zusammenführung im Chat bereitstellen.")
        print(f"Cloud-Shell-Download: cloudshell download {backup}")
        raise SystemExit(2)
    print("Laufender Servercode entspricht dem geprüften Stand. Staging-Update kann fortfahren.")


if __name__ == "__main__":
    main()

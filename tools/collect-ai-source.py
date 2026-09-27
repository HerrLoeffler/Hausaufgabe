#!/usr/bin/env python3
"""Read-only export of deployed staging Functions plus selected local source files."""
import datetime
import hashlib
import json
from pathlib import Path, PurePosixPath
import subprocess
import sys
import tarfile
import tempfile
import uuid
import zipfile

PROJECT = "hausaufgabe-staging"
REGION = "europe-west1"
FUNCTION = "processAiTestJob"
MAX_FILE = 3 * 1024 * 1024
MAX_TOTAL = 20 * 1024 * 1024


def source_path(name):
    path = PurePosixPath(name)
    if path.is_absolute() or ".." in path.parts or "\\" in name:
        return None
    parts = list(path.parts)
    if parts and parts[0] == "functions":
        parts.pop(0)
    if not parts or any(part.startswith(".") for part in parts):
        return None
    relative = PurePosixPath(*parts)
    allowed_root = {"index.js", "package.json", "package-lock.json", "eslint.config.cjs"}
    if str(relative) in allowed_root:
        return relative
    if parts[0] in {"lib", "test"} and relative.suffix in {".js", ".cjs", ".mjs"} and "node_modules" not in parts:
        return relative
    return None


def selected_archive_files(archive):
    files = {}
    total = 0
    def add(name, size, read):
        nonlocal total
        relative = source_path(name)
        if relative is None:
            return
        if size > MAX_FILE or total + size > MAX_TOTAL:
            raise ValueError("Quellarchiv ist unerwartet groß.")
        data = read()
        if len(data) != size:
            raise ValueError("Unvollständiger Archivinhalt.")
        if str(relative) in files:
            raise ValueError("Doppelter Dateipfad im Archiv.")
        files[str(relative)] = data
        total += size
    if zipfile.is_zipfile(archive):
        with zipfile.ZipFile(archive) as source:
            for entry in source.infolist():
                if not entry.is_dir():
                    add(entry.filename, entry.file_size, lambda e=entry: source.read(e))
    else:
        with tarfile.open(archive, "r:*") as source:
            for entry in source:
                if entry.isfile():
                    add(entry.name, entry.size, lambda e=entry: source.extractfile(e).read())
    if "index.js" not in files or "lib/constants.js" not in files:
        raise ValueError("Erwarteter Functions-Quellcode fehlt im Deployment-Archiv.")
    return files


def main():
    print("Lese den laufenden Staging-Server …", flush=True)
    described = subprocess.check_output([
        "gcloud", "functions", "describe", FUNCTION, "--gen2",
        "--project", PROJECT, "--region", REGION,
        "--format=json(name,updateTime,buildConfig.source,buildConfig.sourceProvenance)"
    ], text=True)
    metadata = json.loads(described)
    build = metadata.get("buildConfig", {})
    source = build.get("sourceProvenance", {}).get("resolvedStorageSource") or build.get("source", {}).get("storageSource") or {}
    bucket, obj = source.get("bucket"), source.get("object")
    if not bucket or not obj:
        raise ValueError("Google meldet keinen herunterladbaren Quellstand. Bitte diese Meldung weitergeben.")
    uri = f"gs://{bucket}/{obj}"
    if source.get("generation") and str(source["generation"]) != "0":
        uri += "#" + str(source["generation"])
    with tempfile.TemporaryDirectory(prefix="testify-source-") as temp:
        archive = Path(temp) / "deployed-source.archive"
        subprocess.run(["gcloud", "storage", "cp", uri, str(archive), "--project", PROJECT], check=True)
        deployed = selected_archive_files(archive)
    timestamp = datetime.datetime.now(datetime.timezone.utc).strftime("%Y%m%d-%H%M%S")
    destination = Path.home() / f"testify-serverstand-{timestamp}-{uuid.uuid4().hex[:4]}.zip"
    local_dir = Path.cwd() / "functions"
    local = {}
    if local_dir.is_dir():
        candidates = [local_dir / name for name in ["index.js", "package.json", "package-lock.json", "eslint.config.cjs"]]
        for folder in [local_dir / "lib", local_dir / "test"]:
            if folder.is_dir() and not folder.is_symlink():
                candidates.extend(folder.rglob("*"))
        for candidate in candidates:
            if candidate.is_symlink() or not candidate.is_file():
                continue
            relative = source_path(candidate.relative_to(local_dir).as_posix())
            if relative and candidate.stat().st_size <= MAX_FILE:
                local[str(relative)] = candidate.read_bytes()
    metadata["sourceHashes"] = {name: hashlib.sha256(data).hexdigest() for name, data in deployed.items()}
    with zipfile.ZipFile(destination, "x", compression=zipfile.ZIP_DEFLATED) as output:
        output.writestr("source-info.json", json.dumps(metadata, indent=2))
        for prefix, files in [("deployed", deployed), ("cloudshell", local)]:
            for name, data in files.items():
                output.writestr(f"{prefix}/{name}", data)
    print(f"Fertig: {destination}\nDiese ZIP-Datei hier im Chat hochladen. Es wurde nichts deployed.")
    print("Enthalten: ausgewählte Quellcodedateien. .env-Dateien und node_modules sind ausgeschlossen.")


if __name__ == "__main__":
    try:
        main()
    except (subprocess.CalledProcessError, ValueError, OSError, zipfile.BadZipFile, tarfile.TarError) as error:
        print(f"Export nicht abgeschlossen: {error}", file=sys.stderr)
        sys.exit(1)

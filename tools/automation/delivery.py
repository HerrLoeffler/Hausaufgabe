"""Verify that changed source paths are physically in the hosting package."""
import hashlib
from pathlib import Path
import re

from .pipeline import path_allowed


def verify_packaging(release, head, changed_files, public):
    if release.get('project') != 'hausaufgabe-staging' or release.get('commit') != head:
        raise ValueError('Packaging belongs to another project or commit')
    files = release.get('files')
    if not isinstance(files, dict) or not isinstance(changed_files, list) or not changed_files or len(set(changed_files)) != len(changed_files):
        raise ValueError('Missing changed-file delivery proof')
    for name in changed_files:
        path_allowed(name)
        value = files.get(name)
        if not isinstance(value, str) or not re.fullmatch(r'[a-f0-9]{64}', value):
            raise ValueError('Changed file is not published by the build: ' + name)
        target = Path(public) / name
        if target.is_symlink() or not target.resolve().is_relative_to(Path(public).resolve()) or not target.is_file():
            raise ValueError('Changed package file missing or unsafe: ' + name)
        if hashlib.sha256(target.read_bytes()).hexdigest() != value:
            raise ValueError('Changed package file hash differs: ' + name)
    return sorted(changed_files)

"""Validate a static staging bundle and independently verify its deployed bytes."""
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import re
import sys
import urllib.parse
import urllib.request


def manifest(root, expected):
    public = root / 'public'
    release = json.loads((public / 'release.json').read_text())
    if release.get('project') != 'hausaufgabe-staging' or release.get('commit') != expected:
        raise ValueError('Wrong project or commit in release manifest')
    files = release.get('files')
    if not isinstance(files, dict) or not files or 'index.html' not in files or 'firebase-config.js' not in files:
        raise ValueError('Incomplete manifest')
    for name, digest in files.items():
        path = PurePosixPath(name)
        if path.is_absolute() or '..' in path.parts or '\\' in name or not re.fullmatch(r'[0-9a-f]{64}', digest):
            raise ValueError('Invalid manifest entry')
        target = public / name
        if target.is_symlink() or not target.resolve().is_relative_to(public.resolve()):
            raise ValueError('Unsafe file')
        if hashlib.sha256(target.read_bytes()).hexdigest() != digest:
            raise ValueError('Hash mismatch: ' + name)
    actual = {str(p.relative_to(public)) for p in public.rglob('*') if p.is_file()}
    if actual != set(files) | {'release.json'}:
        raise ValueError('Unlisted files in build')
    if 'projectId: "hausaufgabe-staging"' not in (public / 'firebase-config.js').read_text():
        raise ValueError('Wrong Firebase client config')
    return release


def preview_url(result):
    urls = []
    def walk(value):
        if isinstance(value, dict):
            for key, item in value.items():
                if key == 'url' and isinstance(item, str):
                    urls.append(item)
                else:
                    walk(item)
        elif isinstance(value, list):
            for item in value:
                walk(item)
    walk(result)
    valid = [u.rstrip('/') for u in urls if re.fullmatch(r'https://hausaufgabe-staging--gradecrew-app-integration-[a-z0-9]+\.web\.app/?', u)]
    if len(set(valid)) != 1:
        raise ValueError('No unambiguous allowed preview URL')
    return valid[0]


def deployed_version(result):
    versions = []
    def walk(value):
        if isinstance(value, dict):
            for key, item in value.items():
                if key == 'version' and isinstance(item, str):
                    versions.append(item)
                else:
                    walk(item)
        elif isinstance(value, list):
            for item in value:
                walk(item)
    walk(result)
    ids = {v.removeprefix('sites/hausaufgabe-staging/versions/') for v in versions}
    if len(ids) != 1 or not re.fullmatch(r'[A-Za-z0-9_-]+', next(iter(ids))):
        raise ValueError('No unambiguous deployed Hosting version')
    return 'sites/hausaufgabe-staging/versions/' + next(iter(ids))


def main():
    mode, folder = sys.argv[1:]
    root = Path(folder)
    expected = os.environ['EXPECTED_SHA']
    if not re.fullmatch(r'[a-f0-9]{40}', expected):
        raise ValueError('Invalid expected commit')
    release = manifest(root, expected)
    if mode == 'prepare':
        (root / 'firebase.json').write_text(json.dumps({'hosting': {
            'site': 'hausaufgabe-staging', 'public': 'public', 'ignore': ['**/.*'],
            'headers': [{'source': '**', 'headers': [{'key': 'Cache-Control', 'value': 'no-cache'}]}]
        }}))
        return
    if mode != 'verify':
        raise ValueError('Unknown mode')
    deploy_result = json.loads(Path(os.environ['DEPLOY_RESULT']).read_text())
    url = preview_url(deploy_result)
    version = deployed_version(deploy_result)
    def get(name):
        request = urllib.request.Request(url + '/' + urllib.parse.quote(name, safe='/') + '?verify=' + expected, headers={'Cache-Control': 'no-cache'})
        with urllib.request.urlopen(request, timeout=30) as response:
            if urllib.parse.urlparse(response.url).hostname != urllib.parse.urlparse(url).hostname:
                raise ValueError('Unexpected redirect')
            return response.read()
    if json.loads(get('release.json')) != release:
        raise ValueError('Published manifest differs')
    for name, digest in release['files'].items():
        if hashlib.sha256(get(name)).hexdigest() != digest:
            raise ValueError('Published bytes differ: ' + name)
    receipt = {'project': 'hausaufgabe-staging', 'channel': 'gradecrew-app-integration', 'commit': expected, 'url': url, 'version': version, 'verified_files': len(release['files']), 'ci_run': os.environ.get('GITHUB_RUN_ID'), 'device_test': 'not_performed'}
    (root / 'receipt.json').write_text(json.dumps(receipt, indent=2) + '\n')
    with open(os.environ['GITHUB_STEP_SUMMARY'], 'a') as output:
        output.write('Preview verified: ' + url + '\n\nCommit: `' + expected + '`\n\nAll manifest file hashes match. Device testing remains open.\n')


if __name__ == '__main__':
    main()

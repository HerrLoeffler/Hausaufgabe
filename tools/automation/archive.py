"""Archive a successful preview's exact bytes. Never deploy or infer production approval."""
import hashlib
import io
import json
import os
from pathlib import Path, PurePosixPath
import re
import subprocess
import sys
import tempfile
import zipfile
from preview import manifest, preview_url

REPO = 'HerrLoeffler/Hausaufgabe'


def api(path):
    return subprocess.check_output(['gh', 'api', 'repos/' + REPO + '/' + path])


def trusted_preview(run):
    if (run.get('status') != 'completed' or run.get('conclusion') != 'success'
            or run.get('name') != 'Automatic staging preview'
            or run.get('path') != '.github/workflows/staging-preview.yml'
            or run.get('repository', {}).get('full_name') != REPO
            or run.get('head_repository', {}).get('full_name') != REPO
            or run.get('head_branch') != 'main'
            or run.get('event') not in {'workflow_run', 'push'}):
        raise ValueError('Not a successful trusted preview workflow')


def extract(data, destination):
    with zipfile.ZipFile(io.BytesIO(data)) as archive:
        seen = set()
        if sum(i.file_size for i in archive.infolist()) > 100 * 1024 * 1024:
            raise ValueError('Archive too large')
        for item in archive.infolist():
            name = PurePosixPath(item.filename)
            if name.is_absolute() or '..' in name.parts or '\\' in item.filename or item.filename in seen:
                raise ValueError('Unsafe or duplicate archive path')
            if (item.external_attr >> 16) & 0o170000 == 0o120000:
                raise ValueError('Symlinks are not accepted')
            seen.add(item.filename)
            target = destination / item.filename
            if item.is_dir():
                target.mkdir(parents=True, exist_ok=True)
            else:
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_bytes(archive.read(item))


def package(build, receipt, run_id, output):
    sha = receipt.get('commit', '')
    if not re.fullmatch('[0-9a-f]{40}', sha):
        raise ValueError('Invalid commit')
    if receipt.get('project') != 'hausaufgabe-staging' or receipt.get('channel') != 'gradecrew-app-integration' or str(receipt.get('ci_run')) != str(run_id):
        raise ValueError('Receipt belongs to another deployment')
    preview_url({'url': receipt.get('url')})
    release = manifest(build, sha)
    if receipt.get('verified_files') != len(release['files']):
        raise ValueError('Receipt file count differs')
    output.mkdir(parents=True, exist_ok=True)
    record = {'schema_version': 1, 'kind': 'verified-staging-hosting-snapshot', 'commit': sha,
              'preview_run_id': str(run_id), 'version': release.get('version'), 'receipt': receipt,
              'production_approved': False, 'device_approved': False,
              'backend_snapshot': False, 'database_backup': False,
              'note': 'Hosting bytes only. Staging configuration is retained. Not directly deployable to production.'}
    (output / 'snapshot.json').write_text(json.dumps(record, indent=2) + '\n')
    bundle = output / 'hosting-snapshot.zip'
    with zipfile.ZipFile(bundle, 'w', compression=zipfile.ZIP_DEFLATED) as archive:
        for path in sorted((build / 'public').rglob('*')):
            if path.is_file():
                archive.write(path, 'public/' + str(path.relative_to(build / 'public')))
        archive.write(output / 'snapshot.json', 'snapshot.json')
    digest = hashlib.sha256(bundle.read_bytes()).hexdigest()
    (output / 'SHA256SUMS').write_text(digest + '  hosting-snapshot.zip\n')
    (output / 'release-notes.md').write_text('Verified staging Hosting snapshot\n\nCommit: `' + sha + '`\n\nPreview evidence: https://github.com/' + REPO + '/actions/runs/' + str(run_id) + '\n\nNo production approval. Device acceptance, backend restore and database backup remain separate. This bundle retains staging configuration.\n')
    return sha


def main():
    run_id = sys.argv[1]
    if not re.fullmatch('[1-9][0-9]{0,19}', run_id):
        raise ValueError('Invalid run ID')
    run = json.loads(api('actions/runs/' + run_id))
    trusted_preview(run)
    artifacts = json.loads(api('actions/runs/' + run_id + '/artifacts?per_page=100'))['artifacts']
    with tempfile.TemporaryDirectory() as temporary:
        root = Path(temporary)
        for name, dest in [('staging-preview-build', root / 'public'), ('verified-preview-receipt', root / 'proof')]:
            matches = [a for a in artifacts if a['name'] == name and not a['expired']]
            if len(matches) != 1:
                raise ValueError('Missing or ambiguous artifact: ' + name)
            artifact = matches[0]
            data = api('actions/artifacts/' + str(artifact['id']) + '/zip')
            if artifact.get('digest') != 'sha256:' + hashlib.sha256(data).hexdigest():
                raise ValueError('Artifact download digest differs')
            extract(data, dest)
        receipt = json.loads((root / 'proof/receipt.json').read_text())
        sha = package(root, receipt, run_id, Path('snapshot-output'))
    with open(os.environ['GITHUB_OUTPUT'], 'a') as output:
        output.write('commit=' + sha + '\ntag=preview-snapshot-' + sha + '\n')


if __name__ == '__main__':
    main()

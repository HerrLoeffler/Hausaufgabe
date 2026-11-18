"""Offline, fail-closed billing overlay for recorded Stage source packages.

Never downloads, deploys, reads credentials, or invokes package scripts. It
preserves every recorded source byte outside the explicitly resolved edits.
Cloud generations must be checked again by the deployer immediately before use.
"""
import argparse
import difflib
import hashlib
import json
import re
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[2]
BASE = '805cba98fc357d2926048311b7672b4fe70f1335'
BUCKET = 'gcf-v2-sources-840345136563-europe-west1'


def relative_source_path(value):
    path = Path(value)
    if path.is_absolute() or not path.parts or any(p in {'..', 'node_modules'} or p.startswith('.') for p in path.parts):
        raise ValueError('Unsafe source path')
    return path


def positions(lines, needle):
    return [i for i in range(len(lines) - len(needle) + 1) if lines[i:i + len(needle)] == needle]


def apply_delta(source, baseline, target):
    original, base, wanted = [s.splitlines(keepends=True) for s in (source, baseline, target)]
    changes = []
    operations = []
    for op in difflib.SequenceMatcher(None, base, wanted, autojunk=False).get_opcodes():
        tag, start, end, new_start, new_end = op
        if tag == 'replace' and end - start == new_end - new_start:
            operations.extend((tag, start + i, start + i + 1, new_start + i, new_start + i + 1) for i in range(end - start))
        else:
            operations.append(op)
    for tag, start, end, new_start, new_end in operations:
        if tag == 'equal':
            continue
        old = base[start:end]
        resolved = None
        # Context identifies a unique location; replacement always changes only
        # the old lines themselves. Line offsets and fuzzy matching are banned.
        for width in range(8, -1, -1):
            candidates = set()
            for before in range(min(width, start) + 1):
                after = min(width - before, len(base) - end)
                if not old and before == 0 and after == 0:
                    continue
                needle = base[start - before:end + after]
                # A surviving duplicate in a different method must never
                # become the target after the intended method has changed.
                if positions(base, needle) != [start - before]:
                    continue
                if not old and ((start > 0 and before == 0) or (end < len(base) and after == 0)):
                    continue
                hits = positions(original, needle)
                if len(hits) == 1:
                    candidates.add(hits[0] + before)
            if len(candidates) > 1:
                raise ValueError('Conflicting source contexts')
            if candidates:
                resolved = candidates.pop()
                break
        if resolved is None or original[resolved:resolved + len(old)] != old:
            raise ValueError('Changed or ambiguous source hunk')
        changes.append((resolved, resolved + len(old), wanted[new_start:new_end]))
    previous = len(original) + 1
    for begin, end, replacement in sorted(changes, reverse=True):
        if end > previous:
            raise ValueError('Overlapping source edits')
        original[begin:end] = replacement
        previous = begin
    return ''.join(original)


def git_file(ref, relative):
    return subprocess.check_output(['git', 'show', f'{ref}:{relative}'], cwd=ROOT)


def sha(data):
    return hashlib.sha256(data).hexdigest()


def resolve_commit(ref):
    commit = subprocess.check_output(['git', 'rev-parse', '--verify', '--end-of-options', ref + '^{commit}'], cwd=ROOT, text=True).strip()
    if not re.fullmatch('[a-f0-9]{40}', commit):
        raise ValueError('Immutable commit required')
    return commit


def build(source_dir, destination, *, project, generation, kind, release_ref, entry_point):
    if project != 'gradecrew-staging-2026' or kind not in {'functions', 'assessment-functions'}:
        raise ValueError('Isolated Stage package required')
    if not source_dir.is_absolute() or not destination.is_absolute() or destination.exists():
        raise ValueError('Absolute source and new destination required')
    if not re.fullmatch('[A-Za-z][A-Za-z0-9]{1,100}', entry_point):
        raise ValueError('Explicit target entrypoint required')
    release_ref = resolve_commit(release_ref)
    receipt = json.loads((source_dir / 'SOURCE_RECEIPT.json').read_text())
    source = receipt['source']
    if source.get('bucket') != BUCKET or str(source.get('generation')) != str(generation) or source.get('object') != entry_point + '/function-source.zip':
        raise ValueError('Cloud source generation mismatch')
    if receipt.get('excludedFileCount') != 0:
        raise ValueError('Incomplete source archive requires explicit review')
    data = {}
    for name, digest in receipt['files'].items():
        path = relative_source_path(name)
        original = source_dir / path
        if original.is_symlink():
            raise ValueError('Symlink source forbidden')
        content = original.read_bytes()
        if sha(content) != digest:
            raise ValueError('Source hash mismatch: ' + name)
        data[name] = content
    patches = ['index.js', 'main.js', 'lib/access.js', 'lib/job-slots.js'] if kind == 'functions' else ['lib/secure-lifecycle.js']
    changed = []
    for name in patches:
        baseline = git_file(BASE, f'{kind}/{name}')
        target = git_file(release_ref, f'{kind}/{name}')
        if name not in data:
            raise ValueError('Missing source module: ' + name)
        result = apply_delta(data[name].decode(), baseline.decode(), target.decode()).encode()
        if result != data[name]:
            changed.append({'file': name, 'before': sha(data[name]), 'after': sha(result), 'operation': 'billing_hunks'})
            data[name] = result
    # Historical VM fixtures remain byte-for-byte in the deployment artifact.
    # The verification harness supplies their new runtime dependency in a
    # separate disposable test mirror; never loosen source context for tests.
    # The currently recorded packages match the dependency baseline exactly.
    # A future package with other dependency changes must be reviewed instead
    # of silently overwriting its dependency tree.
    for name in ['package.json', 'package-lock.json']:
        if data.get(name) != git_file(BASE, f'{kind}/{name}'):
            raise ValueError('Dependency source diverged: ' + name)
        target = git_file(release_ref, f'{kind}/{name}')
        if target != data[name]:
            changed.append({'file': name, 'before': sha(data[name]), 'after': sha(target), 'operation': 'verified_dependency_delta'})
            data[name] = target
    prefix = 'functions/lib/billing/' if kind == 'functions' else 'assessment-functions/lib/billing-access.js'
    names = subprocess.check_output(['git', 'ls-tree', '-r', '--name-only', release_ref, '--', prefix], cwd=ROOT, text=True).splitlines()
    for relative in names:
        name = relative[len(kind) + 1:]
        if name in data:
            raise ValueError('Billing module already exists: ' + name)
        target = git_file(release_ref, relative)
        data[name] = target
        changed.append({'file': name, 'before': None, 'after': sha(target), 'operation': 'new_billing_module'})
    # All verification is complete before creating the output directory.
    destination.mkdir(mode=0o700, parents=True)
    for name, content in data.items():
        out = destination / relative_source_path(name)
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_bytes(content)
        out.chmod(0o600)
    report = {'project': project, 'source': source, 'sourceArchiveSha256': receipt['archiveSha256'], 'releaseCommit': release_ref, 'builderSha256': sha(Path(__file__).read_bytes()),
              'fileCount': len(data), 'changedFiles': changed, 'unchangedSourceCount': len(receipt['files']) - sum(1 for x in changed if x['before'] is not None), 'deployed': False}
    (destination / 'billing-source-receipt.json').write_text(json.dumps(report, indent=2) + '\n')
    return report


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source-dir', type=Path, required=True)
    parser.add_argument('--destination', type=Path, required=True)
    parser.add_argument('--project', required=True)
    parser.add_argument('--generation', required=True)
    parser.add_argument('--kind', choices=['functions', 'assessment-functions'], required=True)
    parser.add_argument('--release-ref', required=True)
    parser.add_argument('--entry-point', required=True)
    args = parser.parse_args()
    report = build(args.source_dir, args.destination, project=args.project, generation=args.generation, kind=args.kind, release_ref=args.release_ref, entry_point=args.entry_point)
    print(json.dumps({'project': report['project'], 'fileCount': report['fileCount'], 'changedCount': len(report['changedFiles']), 'unchangedSourceCount': report['unchangedSourceCount'], 'deployed': False}))

"""Closed trusted execution profiles. Cost profiles never grant product scope."""
from dataclasses import asdict, dataclass
import hashlib
import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[2]

@dataclass(frozen=True)
class Profile:
    id: str
    version: int
    risk: str
    allowed_targets: tuple[str, ...]
    writable_paths: tuple[str, ...]
    validation_profile: str
    deployment_components: tuple[str, ...]

WEB = Profile('web-ui-v1',1,'web-ui',('feature/gradecrew-app-integration',),(), 'web-combined-v1',('hosting','ai'))
GAMES = Profile('games-static-preview-v1',1,'games-static',('prototype/escape-expedition-visual-masterpiece-v1',),
    ('lab/escape-expedition/index.html','lab/escape-expedition/styles.css','lab/escape-expedition/app.js'), 'games-static-v1',('hosting',))
CATALOG = {p.id:p for p in (WEB,GAMES)}


def resolve_profile(task):
    name = task.get('execution_profile', WEB.id)
    if not isinstance(name,str) or name not in CATALOG:
        raise ValueError('Unknown execution profile')
    profile = CATALOG[name]
    version = task.get('profile_version',1)
    if type(version) is not int or version != profile.version:
        raise ValueError('Unknown execution profile version')
    return profile


def profile_digest(profile,root):
    root = Path(root)
    names = ['tools/automation/profiles.py', 'tools/automation/pipeline.py']
    # Bind every reviewed validator/fixture/workflow that exists at this controller
    # revision. Adding any of them changes both profile and control authority.
    if profile == GAMES:
        names += [str(p.relative_to(root)) for p in sorted((root/'tools/automation/fixtures/games-static-v1').rglob('*')) if p.is_file()]
        names += [name for name in ('tools/automation/games_static.py','tools/automation/games_publication.py','tools/automation/validate-games-static.sh','tools/automation/games-static-smoke.cjs',
                  '.github/workflows/guardian-games-validation.yml','.github/workflows/guardian-games-staging.yml') if (root/name).exists()]
    files = {}
    for name in names:
        path = root/name
        if path.is_symlink(): raise ValueError('Trusted profile file is a symlink')
        files[name] = hashlib.sha256(path.read_bytes()).hexdigest()
    payload = {'profile':asdict(profile),'files':files}
    return hashlib.sha256(json.dumps(payload,sort_keys=True,separators=(',',':')).encode()).hexdigest()


def validate_profile_task(task,root=ROOT):
    profile = resolve_profile(task)
    if task.get('base_branch') not in profile.allowed_targets or task.get('risk') != profile.risk:
        raise ValueError('Target or risk outside execution profile')
    if task.get('validation_profile') != profile.validation_profile:
        raise ValueError('Validation profile differs')
    if profile == GAMES:
        if task.get('cost_profile') != 'module-web-v1': raise ValueError('Games cost contract not qualified')
        if task.get('profile_digest') != profile_digest(profile,root): raise ValueError('Trusted profile digest differs')
    return profile


def admitted_profile(task,policy,root=ROOT):
    profile = validate_profile_task(task,root)
    if profile.id not in policy.get('enabledExecutionProfiles',[WEB.id]):
        raise ValueError('Execution profile disabled; separate activation required')
    return profile


def validation_workflow(profile):
    return 'guardian-games-validation.yml' if profile == GAMES else 'guardian-web-validation.yml'


def selected_profile(attempt,task,root=ROOT):
    """No mutation: old records remain inspectable, never silently upgraded."""
    from .pipeline import digest, control_hash
    profile = validate_profile_task(task,root)
    if attempt.get('controlHash') != control_hash(root):
        raise ValueError('Controller code changed; old run needs reconciliation')
    if attempt.get('taskHash') != digest(task) or attempt.get('approvedSha') != task['base_sha']:
        raise ValueError('Attempt task binding differs')
    if profile == GAMES:
        expected = {'executionProfile':profile.id,'profileDigest':task['profile_digest'],'validationProfile':profile.validation_profile,'baseBranch':task['base_branch']}
        if any(attempt.get(k)!=v for k,v in expected.items()): raise ValueError('Attempt profile binding differs')
    return profile


def profile_record(task):
    profile = resolve_profile(task)
    return {} if profile == WEB else {'executionProfile':profile.id,'profileDigest':task['profile_digest'],'validationProfile':profile.validation_profile,'baseBranch':task['base_branch']}

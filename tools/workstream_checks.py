#!/usr/bin/env python3
"""Read-only opt-in handoff validation. No dispatch, writes or approval inference."""
import argparse
import json
import pathlib
import re
import sys

PROFILE = 'workflow-brief-v1'
IDENTIFIER = re.compile(r'[A-Za-z0-9][A-Za-z0-9_.:-]{0,79}\Z')


def require(condition, message):
    if not condition:
        raise ValueError(message)


def text(value):
    return isinstance(value, str) and bool(value.strip())


def identifier(value):
    return isinstance(value, str) and IDENTIFIER.fullmatch(value) is not None


def strings(value, nonempty=False):
    return isinstance(value, list) and (bool(value) or not nonempty) and all(text(v) for v in value)


def unique_object(pairs):
    result = {}
    for key, value in pairs:
        require(key not in result, 'duplicate JSON key')
        result[key] = value
    return result


def load_json(content):
    return json.loads(content, object_pairs_hook=unique_object)


def validate_brief(data):
    require(isinstance(data, dict), 'brief must be an object')
    require(type(data.get('schema_version')) is int and data['schema_version'] == 1, 'unsupported brief schema')
    for name in ('task_id', 'parent_task_id', 'owner'):
        require(identifier(data.get(name)), 'missing or invalid ' + name)
    require(text(data.get('goal')), 'missing goal')
    require(strings(data.get('priorities'), True), 'missing priorities')
    source = data.get('source')
    require(isinstance(source, dict) and text(source.get('branch')), 'missing source branch')
    require(isinstance(source.get('commit'), str) and re.fullmatch(r'[a-f0-9]{40}', source['commit']) is not None, 'source requires full commit SHA')
    scope = data.get('scope')
    require(isinstance(scope, dict) and strings(scope.get('allowed_paths'), True) and strings(scope.get('excluded_actions'), True), 'missing scope boundaries')
    require(strings(data.get('acceptance'), True), 'missing observable acceptance')

    decisions = data.get('decisions')
    require(isinstance(decisions, list) and len(decisions) <= 128, 'decision list must contain 0..128 entries')
    by_id = {}
    for item in decisions:
        require(isinstance(item, dict) and identifier(item.get('id')), 'invalid decision identity')
        require(item['id'] not in by_id, 'duplicate decision identity')
        require(item.get('status') in ('open', 'answered'), 'invalid decision status')
        deps = item.get('blocked_by')
        require(isinstance(deps, list) and all(identifier(v) for v in deps) and len(set(deps)) == len(deps), 'invalid decision dependencies')
        claim = item.get('claimed_owner')
        require(claim is None or identifier(claim), 'invalid claimed owner')
        if item['status'] == 'answered':
            require(text(item.get('answer')), 'answered decision lacks source answer')
        else:
            require(item.get('answer') is None, 'open decision cannot contain a final answer')
        by_id[item['id']] = item
    for item in decisions:
        require(all(dep in by_id for dep in item['blocked_by']), 'unknown decision dependency')
    visiting, visited = set(), set()

    def visit(key):
        require(key not in visiting, 'cyclic decision dependencies')
        if key in visited:
            return
        visiting.add(key)
        for dependency in by_id[key]['blocked_by']:
            visit(dependency)
        visiting.remove(key)
        visited.add(key)

    for key in by_id:
        visit(key)

    recovery = data.get('recovery')
    require(isinstance(recovery, dict) and text(recovery.get('next_step')), 'missing recovery next step')
    operations = recovery.get('operations')
    require(isinstance(operations, list), 'missing operations history (explicit empty list allowed)')
    operation_ids, reconcile = set(), []
    for operation in operations:
        require(isinstance(operation, dict) and identifier(operation.get('id')), 'invalid operation identity')
        require(operation['id'] not in operation_ids, 'duplicate operation identity')
        operation_ids.add(operation['id'])
        require(operation.get('status') in ('planned', 'running', 'succeeded', 'failed', 'unknown'), 'invalid operation status')
        require(text(operation.get('evidence')), 'operation lacks evidence/history pointer')
        if operation['status'] in ('running', 'unknown'):
            reconcile.append(operation['id'])
    budget = recovery.get('budget')
    require(isinstance(budget, dict) and budget.get('mode') in ('no_paid_calls', 'existing_authorization_only'), 'missing budget mode')
    require(strings(budget.get('reservation_ids')) and text(budget.get('attempt_history_ref')), 'missing reservation/attempt history')
    require(budget['mode'] != 'no_paid_calls' or not budget['reservation_ids'], 'existing reservations must retain existing-authorization mode')

    axes = data.get('review_axes')
    require(isinstance(axes, dict), 'missing review axes')
    for name in ('requirements', 'standards'):
        axis = axes.get(name)
        require(isinstance(axis, dict) and axis.get('status') in ('pending', 'pass', 'changes_requested'), 'invalid review axis ' + name)
        require(strings(axis.get('evidence')), 'missing review evidence list')
        require(axis.get('reviewer') is None or identifier(axis['reviewer']), 'invalid reviewer identity')
        if axis['status'] != 'pending':
            require(identifier(axis.get('reviewer')) and axis['reviewer'] != data['owner'] and bool(axis['evidence']), 'completed review requires independent reviewer/evidence')

    ready, needs_owner, blocked = [], [], []
    for item in decisions:
        if item['status'] == 'answered':
            continue
        if any(by_id[dependency]['status'] != 'answered' for dependency in item['blocked_by']):
            blocked.append(item['id'])
        elif item.get('claimed_owner') is None:
            needs_owner.append(item['id'])
        elif not reconcile:
            ready.append(item['id'])
    return {'task_id': data['task_id'], 'ready': ready, 'needs_owner': needs_owner,
            'blocked': blocked, 'resume_safe': not reconcile, 'reconcile': reconcile,
            'interpretation': 'declared metadata only; no authorization, atomic lock, dispatch or verified external result'}


def check_registry(registry_path, required_tasks=()):
    registry_path = pathlib.Path(registry_path).resolve()
    require(registry_path.parent.name == 'workstreams', 'registry must live under workstreams')
    root = registry_path.parent.parent
    registry = load_json(registry_path.read_text(encoding='utf-8'))
    require(isinstance(registry, dict) and isinstance(registry.get('workstreams'), list), 'invalid registry workstreams')
    reports, seen = [], set()
    for entry in registry['workstreams']:
        require(isinstance(entry, dict), 'invalid registry entry')
        profile = entry.get('checkProfile')
        if profile is None:
            continue  # Existing human-only handoffs remain compatible.
        require(profile == PROFILE, 'unsupported checkProfile')
        pointer = entry.get('handoff')
        require(text(pointer), 'profile requires a handoff pointer')
        relative = pathlib.Path(pointer)
        require(not relative.is_absolute() and '..' not in relative.parts and relative.parts[0] == 'workstreams' and relative.suffix == '.md', 'handoff must be repository workstreams Markdown')
        path = (root / relative).resolve()
        require(path.is_relative_to(root / 'workstreams'), 'handoff escapes workstreams')
        require(path.is_file(), 'profile handoff missing')
        require(path.stat().st_size <= 1024 * 1024, 'handoff exceeds bounded document size')
        document = path.read_text(encoding='utf-8')
        starts = re.findall(r'(?m)^```gradecrew-brief[ \t]*$', document)
        blocks = re.findall(r'(?ms)^```gradecrew-brief[ \t]*\n(.*?)^```[ \t]*$', document)
        require(len(starts) == len(blocks) == 1, 'profile requires exactly one complete gradecrew-brief block')
        require(len(blocks[0]) <= 65536, 'brief exceeds bounded JSON size')
        data = load_json(blocks[0])
        report = validate_brief(data)
        require(report['task_id'] not in seen, 'duplicate registered task identity')
        seen.add(report['task_id'])
        reports.append(report)
    require(set(required_tasks).issubset(seen), 'required task/profile missing')
    return {'profile': PROFILE, 'briefs': reports}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--registry', type=pathlib.Path, default=pathlib.Path(__file__).resolve().parents[1] / 'workstreams/registry.json')
    parser.add_argument('--require-task', action='append', default=[])
    args = parser.parse_args()
    try:
        report = check_registry(args.registry, args.require_task)
    except (ValueError, OSError, KeyError, TypeError) as error:
        # Never dump malformed source text or full exception file contents.
        message = str(error) if isinstance(error, ValueError) and not isinstance(error, json.JSONDecodeError) else 'unreadable or malformed contract input'
        print(json.dumps({'error': message}), file=sys.stderr)
        return 1
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0


if __name__ == '__main__':
    sys.exit(main())

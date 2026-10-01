#!/usr/bin/env python3
"""Read-only Git checkpoint. No commit, push, deployment or source-content export."""
import argparse
import datetime
import json
import pathlib
import re
import subprocess


def git(*args):
    return subprocess.check_output(['git', *args], text=True).strip()


def checkpoint(task, goal, done, next_step):
    if not re.fullmatch(r'[a-z0-9][a-z0-9-]{0,79}', task):
        raise ValueError('Task-ID: nur Kleinbuchstaben, Ziffern und Bindestriche.')
    root = git('rev-parse', '--show-toplevel')
    # File names and status only; never copy diffs, credentials or answer data.
    changed = subprocess.check_output(['git', '-C', root, 'status', '--porcelain=v1', '-z'], text=True).split('\0')
    return {
        'schema_version': 1,
        'task': task,
        'recorded_at': datetime.datetime.now(datetime.timezone.utc).isoformat(),
        'branch': git('branch', '--show-current') or '(detached)',
        'head_commit': git('rev-parse', 'HEAD'),
        'working_tree_entries': [entry for entry in changed if entry],
        'goal': goal,
        'completed_reported': done,
        'next_step': next_step,
        'verification': 'not_inferred',
        'deployment': 'not_inferred',
        'code_backup': False,
        'warning': 'Dieser Bericht sichert keinen uncommitteten Code. Commit und Push separat prüfen.'
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--task', required=True)
    parser.add_argument('--goal', required=True)
    parser.add_argument('--done', action='append', default=[])
    parser.add_argument('--next', required=True, dest='next_step')
    parser.add_argument('--output', type=pathlib.Path)
    args = parser.parse_args()
    record = checkpoint(args.task, args.goal, args.done, args.next_step)
    content = json.dumps(record, ensure_ascii=False, indent=2) + '\n'
    if args.output:
        # Unique checkpoints cannot silently overwrite another chat's report.
        with args.output.open('x', encoding='utf-8') as handle:
            handle.write(content)
    else:
        print(content, end='')


if __name__ == '__main__':
    main()

"""Read-only negative rehearsal for a documented immutable fixture blocker.

Positive candidate admission still runs the full unchanged Games validator.
This workflow cannot publish an integration/deployment receipt.
"""
import argparse
import json
from pathlib import Path
import re
import subprocess
from .games_static import SNAPSHOT,validate_source


def expected_blocker(exc):
    text=exc.output or ''
    if (exc.returncode!=1 or '--test' not in exc.cmd
        or 'not ok 16 - M1.4 learning success and transfer schedules cannot be queued repeatedly' not in text
        or any(not re.search(r'^# '+key+' '+str(value)+r'$',text,re.M) for key,value in [('tests',36),('pass',35),('fail',1)])):
        raise ValueError('Unexpected qualification failure; inspect instead of accepting another blocker')
    return {'sourceSha':SNAPSHOT,'qualification':'blocked','testResult':'failure','passed':35,'failed':1,'automaticActivation':False}


def main():
    parser=argparse.ArgumentParser();parser.add_argument('--source',default='source');parser.add_argument('--output',default='evidence')
    args=parser.parse_args()
    try:validate_source(args.source,SNAPSHOT,args.output,SNAPSHOT)
    except subprocess.CalledProcessError as exc:
        evidence=expected_blocker(exc)
        Path(args.output,'qualification-blocker.json').write_text(json.dumps(evidence)+'\n')
        print(json.dumps(evidence));return
    raise ValueError('Known stale fixture unexpectedly passed; qualification evidence requires explicit review')

if __name__=='__main__':main()

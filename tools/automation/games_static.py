"""Credential-free Games validation and evidence, separate from the Web site."""
from __future__ import annotations
import argparse
import hashlib
import json
from pathlib import Path
import re
import shutil
import subprocess
import tempfile
from .pipeline import digest, sha
from .profiles import GAMES, ROOT, profile_digest

NAMES = ('app.js','index.html','styles.css')
SNAPSHOT = '6434ddefb83cffca7bde5a7347ed6d2f56d5cb45'


def validate_games_package(public,source_sha,changed_files):
    sha(source_sha); public=Path(public)
    if public.is_symlink() or not public.is_dir(): raise ValueError('Invalid public directory')
    if not isinstance(changed_files,list) or not changed_files or len(set(changed_files))!=len(changed_files) or any(x not in GAMES.writable_paths for x in changed_files):
        raise ValueError('Package changes outside Games profile')
    if sorted(p.name for p in public.iterdir()) != list(NAMES): raise ValueError('Package must contain exactly three files')
    files={}
    for name in NAMES:
        file=public/name
        if file.is_symlink() or not file.is_file() or not 0<file.stat().st_size<=160000: raise ValueError('Invalid package file')
        data=file.read_bytes()
        try: text=data.decode('utf-8')
        except UnicodeError as exc: raise ValueError('UTF-8 package required') from exc
        if '\x00' in text: raise ValueError('Binary package data')
        # Static first profile has no external assets/API. Runtime smoke and
        # trusted CSP add separate protection; this is not a JS security proof.
        if re.search(r'https?\s*:|["\'(=]\s*//|@import\b|url\s*\(',text,re.I):
            raise ValueError('External/runtime resource outside static profile')
        files[name]=hashlib.sha256(data).hexdigest()
    manifest={'schemaVersion':1,'sourceSha':source_sha,'files':files}
    return manifest | {'packageDigest':digest(manifest)}


def games_test_report(head,base,profile_hash,package,test_result):
    sha(head); sha(base)
    if not isinstance(profile_hash,str) or not re.fullmatch('[a-f0-9]{64}',profile_hash): raise ValueError('Exact profile digest required')
    if test_result!='success' or package.get('sourceSha')!=head: raise ValueError('Passing exact package validation required')
    content={k:package[k] for k in ('schemaVersion','sourceSha','files')}
    if package.get('packageDigest')!=digest(content): raise ValueError('Package manifest digest differs')
    return {'profile':GAMES.validation_profile,'executionProfile':GAMES.id,'profileDigest':profile_hash,
            'head':head,'base':base,'result':'success','packagedFiles':list(NAMES),'packageDigest':package['packageDigest']}


def validate_source(source,head,output,base=None):
    source=Path(source).resolve(); output=Path(output).resolve(); output.mkdir(parents=True,exist_ok=True)
    actual=subprocess.check_output(['git','-C',str(source),'rev-parse','HEAD'],text=True).strip()
    if actual!=sha(head): raise ValueError('Games checkout differs')
    parents=subprocess.check_output(['git','-C',str(source),'show','-s','--format=%P',head],text=True).split()
    if len(parents)!=1: raise ValueError('Games validation needs direct candidate')
    base=sha(base or parents[0])
    changes=subprocess.check_output(['git','-C',str(source),'diff','--name-only',base,head],text=True).splitlines()
    # Validation-only snapshot rehearsal may explicitly verify all three files.
    if base==head: changes=list(GAMES.writable_paths)
    if any(name not in GAMES.writable_paths for name in changes): raise ValueError('Source changes outside Games profile')
    fixtures=ROOT/'tools/automation/fixtures/games-static-v1'
    with tempfile.TemporaryDirectory(prefix='gc-games-static-') as temp:
        scratch=Path(temp)/'source'; shutil.copytree(fixtures,scratch,symlinks=False)
        for name in GAMES.writable_paths:
            file=source/name
            if file.is_symlink() or not file.is_file(): raise ValueError('Candidate source is missing or symlink')
            target=scratch/name; target.parent.mkdir(parents=True,exist_ok=True); shutil.copyfile(file,target)
        subprocess.run(['node','--check',str(scratch/'lab/escape-expedition/app.js')],check=True)
        subprocess.run(['node','--test',str(scratch/'tools/games/escape-expedition.test.cjs')],cwd=scratch,check=True)
        package=Path(temp)/'package'
        subprocess.run(['node',str(fixtures/'tools/build-lab-escape-expedition.mjs'),str(package)],cwd=scratch,check=True)
        manifest=validate_games_package(package/'public',head,changes)
        for name in NAMES:
            if (package/'public'/name).read_bytes()!=(source/'lab/escape-expedition'/name).read_bytes(): raise ValueError('Builder changed candidate bytes')
        shutil.copytree(package/'public',output/'public',dirs_exist_ok=True)
    report=games_test_report(head,base,profile_digest(GAMES,ROOT),manifest,'success')
    (output/'package-manifest.json').write_text(json.dumps(manifest,sort_keys=True)+'\n')
    (output/'tests.json').write_text(json.dumps(report,sort_keys=True)+'\n')
    return report


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--source',required=True);parser.add_argument('--head',required=True)
    parser.add_argument('--output',default='evidence');parser.add_argument('--base')
    args=parser.parse_args();validate_source(args.source,args.head,args.output,args.base)

if __name__=='__main__':main()

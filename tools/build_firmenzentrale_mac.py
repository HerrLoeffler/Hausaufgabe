"""Build a private, relocatable arm64 Mac app. No install, deploy or signing identity."""
import argparse, hashlib, json, os, plistlib, shutil, subprocess, tempfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
FOLDERS=['docs/prototypes/firmenzentrale','assets/gradecrew','shared/gradecrew-design','tools/central_runtime']
FILES=['tools/serve_firmenzentrale.py','tools/central_desktop.py']
EXCLUDED={'__pycache__','site-packages','test','tests','idlelib','tkinter','ensurepip','turtledemo'}

def copy_tree(source,target):
 shutil.copytree(source,target,ignore=lambda _,names:[n for n in names if n in EXCLUDED or n.endswith(('.pyc','.pyo')) or n.startswith('_tkinter.')],symlinks=False)

def build(output,python_prefix,data_dir,codex):
 if output.exists():raise ValueError('Output already exists; choose a new output or move the previous app first.')
 if output.suffix!='.app':raise ValueError('Output must end in .app')
 # Stage next to output, publish only a complete signed bundle.
 output.parent.mkdir(parents=True,exist_ok=True)
 with tempfile.TemporaryDirectory(prefix='.gradecrew-build-',dir=output.parent) as tmp:
  staging=Path(tmp)/output.name;contents=staging/'Contents';res=contents/'Resources';bin_dir=contents/'MacOS'
  res.mkdir(parents=True);bin_dir.mkdir()
  workspace=res/'Workspace'
  for folder in FOLDERS:copy_tree(ROOT/folder,workspace/folder)
  for file in FILES:
   (workspace/file).parent.mkdir(parents=True,exist_ok=True);shutil.copy2(ROOT/file,workspace/file)
  python=res/'Python';(python/'bin').mkdir(parents=True)
  shutil.copy2(python_prefix/'bin/python3.12',python/'bin/python3.12',follow_symlinks=True)
  copy_tree(python_prefix/'lib/python3.12',python/'lib/python3.12')
  # This CPython executable is statically linked except Apple system libraries.
  linked=subprocess.check_output(['otool','-L',str(python/'bin/python3.12')],text=True)
  if any(line.strip().startswith(('@','/Users/','/opt/','/usr/local/')) for line in linked.splitlines()[1:]):raise ValueError('Python requires non-system libraries; runtime is not portable')
  license_file=python/'lib/python3.12/LICENSE.txt'
  if not license_file.is_file():raise ValueError('Python license missing')
  config={'dataDirectory':str(data_dir.resolve()),'codex':str(codex),'port':8796}
  (res/'application.json').write_text(json.dumps(config,indent=2)+'\n');os.chmod(res/'application.json',0o600)
  plist={'CFBundleName':'GradeCrew Zentrale','CFBundleDisplayName':'GradeCrew Zentrale','CFBundleIdentifier':'de.gradecrew.central','CFBundleExecutable':'GradeCrewCentral','CFBundlePackageType':'APPL','CFBundleShortVersionString':'0.2.0','CFBundleVersion':'2','CFBundleIconFile':'AppIcon','LSMinimumSystemVersion':'13.0','NSHighResolutionCapable':True,'NSPrincipalClass':'NSApplication','NSAppTransportSecurity':{'NSAllowsLocalNetworking':True}}
  (contents/'Info.plist').write_bytes(plistlib.dumps(plist))
  cache=Path(tmp)/'module-cache';cache.mkdir()
  common=['xcrun','swiftc','-module-cache-path',str(cache),'-target','arm64-apple-macosx13.0']
  subprocess.run(common+['-O',str(ROOT/'tools/macos/NavigationPolicy.swift'),str(ROOT/'tools/macos/GradeCrewCentral.swift'),'-o',str(bin_dir/'GradeCrewCentral')],check=True)
  iconset=Path(tmp)/'AppIcon.iconset';iconset.mkdir()
  subprocess.run(common+[str(ROOT/'tools/macos/MakeIcon.swift'),'-o',str(Path(tmp)/'make-icon')],check=True)
  subprocess.run([str(Path(tmp)/'make-icon'),str(ROOT/'assets/gradecrew/brand-icon-v1.svg'),str(iconset)],check=True)
  subprocess.run(['iconutil','-c','icns',str(iconset),'-o',str(res/'AppIcon.icns')],check=True)
  manifest={str(p.relative_to(workspace)):hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(workspace.rglob('*')) if p.is_file()}
  (res/'build-manifest.json').write_text(json.dumps({'files':manifest,'platform':'macOS arm64','distribution':'local ad-hoc build'},indent=2)+'\n')
  # Check relocation before signing; suppress writes within the sealed app.
  env={k:v for k,v in os.environ.items() if not k.startswith('PYTHON')};env.update(PYTHONHOME=str(python),PYTHONDONTWRITEBYTECODE='1',PYTHONNOUSERSITE='1')
  subprocess.run([str(python/'bin/python3.12'),'-s','-c','import sqlite3,ssl,http.server,fcntl,json,hashlib; print("Bundled runtime OK")'],env=env,cwd=tmp,check=True)
  subprocess.run(['codesign','--force','--deep','--sign','-',str(staging)],check=True)
  subprocess.run(['codesign','--verify','--deep','--strict',str(staging)],check=True)
  staging.rename(output)
 print(json.dumps({'app':str(output),'files':len(manifest)},ensure_ascii=False))

if __name__=='__main__':
 parser=argparse.ArgumentParser(description=__doc__)
 for name in ['output','python-prefix','data-dir','codex']:parser.add_argument('--'+name,type=Path,required=True)
 args=parser.parse_args();build(args.output,args.python_prefix,args.data_dir,args.codex)

"""Run offline geometry/snapshot checks on both simulator families. Never signs or uploads."""
import argparse
import html
import json
from pathlib import Path
import shutil
import subprocess
import sys

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
REPO = ROOT.parents[1]
BUNDLE = 'de.gradecrew.layoutchecks'

def command(args, **kwargs):
    return subprocess.run([str(a) for a in args], check=True, **kwargs)

def choose_devices(inventory, family):
    candidates = []
    for runtime, devices in inventory['devices'].items():
        if '.iOS-' not in runtime:
            continue
        for d in devices:
            if d.get('isAvailable') and ('iPad' in d.get('deviceTypeIdentifier', '') if family == 'tablet' else 'iPhone' in d.get('deviceTypeIdentifier', '')):
                candidates.append((runtime, d))
    candidates.sort(key=lambda pair: (tuple(int(x) for x in pair[0].split('iOS-')[-1].split('-')), pair[1]['state'] == 'Booted'), reverse=True)
    if not candidates:
        raise RuntimeError(f'No available {family} simulator; install an iOS runtime in Xcode.')
    return candidates[0]

def summarize(reports, policy):
    native = list(reports.glob('native-*.json'))
    web = list(reports.glob('web-*.json'))
    issues = []
    for kind, files in [('native', native), ('web', web)]:
        if len(files) != policy['expectedReportsPerFamily'][kind]:
            issues.append(f'{kind}: expected {policy["expectedReportsPerFamily"][kind]} reports, got {len(files)}')
        for f in files:
            d = json.loads(f.read_text())
            if not f.with_suffix('.png').is_file():
                issues.append(f'{f.stem}: screenshot missing')
            for issue in d.get('issues', ['missing issues field']):
                issues.append({'case': f.stem, 'issue': issue})
    return {'nativeCases':len(native), 'webCases':len(web), 'issues':issues}

def gallery(output):
    pictures = sorted(output.glob('*/reports/*.png'))
    entries = '\n'.join(f'<figure data-name="{html.escape(p.stem)}"><a href="{html.escape(str(p.relative_to(output)))}"><img loading="lazy" src="{html.escape(str(p.relative_to(output)))}"></a><figcaption>{html.escape(p.parent.parent.name + ": " + p.stem)}</figcaption></figure>' for p in pictures)
    (output / 'gallery.html').write_text('<!doctype html><meta charset="utf-8"><title>GradeCrew Layout Checks</title><style>body{font:16px system-ui;margin:24px;background:#f6f7f9;color:#202b3c}input{font:inherit;padding:12px;width:min(90%,600px)}main{display:flex;flex-wrap:wrap;gap:16px}figure{margin:0;width:280px;background:white;padding:12px;border:1px solid #dfe5ec;border-radius:12px}img{width:100%;height:420px;object-fit:contain;object-position:top}figcaption{font-size:12px;overflow-wrap:anywhere}</style><h1>GradeCrew Layout Checks</h1><p>Offline test data. Logical viewports in actual SwiftUI and WebKit; hardware and older OS checks remain separate.</p><input aria-label="Filter screenshots" placeholder="Filter: phone-small, ipad, remy, editor …" oninput="document.querySelectorAll(\'figure\').forEach(f=>f.hidden=!f.dataset.name.toLowerCase().includes(this.value.toLowerCase()))"><main>' + entries + '</main>')

def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--output', required=True, type=Path)
    p.add_argument('--family', choices=['both','phone','tablet'], default='both')
    p.add_argument('--device-id', help='Existing simulator UDID; requires phone or tablet family')
    args = p.parse_args()
    output = args.output.resolve()
    if output.exists() and any(output.iterdir()):
        p.error('--output must be new or empty, so old results cannot make a run pass')
    output.mkdir(parents=True, exist_ok=True)
    policy = json.loads((HERE / 'layout-policy.json').read_text())
    command([sys.executable, HERE / 'Web/prepare_web_fixtures.py', '--output', HERE / 'GeneratedWeb'])
    shutil.copy2(HERE / 'layout-policy.json', HERE / 'GeneratedWeb/layout-policy.json')
    command([sys.executable, HERE / 'generate_layout_project.py'])
    inventory = json.loads(command(['xcrun','simctl','list','devices','available','-j'], capture_output=True, text=True).stdout)
    families = ['phone','tablet'] if args.family == 'both' else [args.family]
    if args.device_id and len(families) != 1:
        p.error('--device-id requires a single --family')
    summary = {'status':'running', 'families':[], 'policy':policy, 'productionChanged':False, 'testFlightUploaded':False}
    failed = False
    for family in families:
        runtime, device = choose_devices(inventory, family)
        if args.device_id:
            matches = [(r,d) for r, ds in inventory['devices'].items() for d in ds if d['udid'] == args.device_id and d.get('isAvailable')]
            if not matches:
                raise RuntimeError('Requested simulator not available')
            runtime, device = matches[0]
            wanted = 'iPad' if family == 'tablet' else 'iPhone'
            if wanted not in device.get('deviceTypeIdentifier',''):
                raise RuntimeError('Requested device does not match selected family')
        folder = output / family
        folder.mkdir()
        print(f'Checking {family}: {device["name"]} ({runtime}), {len(policy["viewports"])} logical viewports', flush=True)
        # This separate test bundle owns no real GradeCrew accounts or user content.
        if device['state'] != 'Booted':
            command(['xcrun','simctl','boot',device['udid']])
        command(['xcrun','simctl','bootstatus',device['udid'],'-b'], stdout=subprocess.DEVNULL)
        cmd = ['xcodebuild','-project',ROOT/'GradeCrewLayoutChecks.xcodeproj','-scheme','GradeCrewLayoutChecks','-configuration','Debug','-destination',f'platform=iOS Simulator,id={device["udid"]}','-derivedDataPath',output/'derived','-resultBundlePath',folder/'results.xcresult','-parallel-testing-enabled','NO','-collect-test-diagnostics','never','-skip-testing:GradeCrewLayoutChecks/WebLayoutTests/testWebSmallPhone','CODE_SIGNING_ALLOWED=NO','ONLY_ACTIVE_ARCH=YES','test']
        with (folder / 'xcodebuild.log').open('w') as log:
            try:
                result = subprocess.run([str(a) for a in cmd], stdout=log, stderr=subprocess.STDOUT, timeout=1200)
                code = result.returncode
            except subprocess.TimeoutExpired:
                code = 124
        reports = folder / 'reports'
        try:
            container = command(['xcrun','simctl','get_app_container',device['udid'],BUNDLE,'data'], capture_output=True,text=True).stdout.strip()
            shutil.copytree(Path(container)/'Documents/LayoutReports',reports)
        except (subprocess.CalledProcessError, FileNotFoundError) as e:
            reports.mkdir(exist_ok=True)
            print(f'Cannot collect layout reports: {e}',file=sys.stderr)
        entry = summarize(reports, policy)
        entry.update(family=family, device=device['name'], deviceId=device['udid'], runtime=runtime, xcodeExitCode=code)
        failed |= code != 0 or bool(entry['issues'])
        summary['families'].append(entry)
        print(f'{family}: {entry["nativeCases"]} native / {entry["webCases"]} web cases, {len(entry["issues"])} issues, Xcode exit {code}',flush=True)
    summary['status'] = 'failed' if failed else 'passed'
    (output/'summary.json').write_text(json.dumps(summary,indent=2))
    gallery(output)
    print(f'{summary["status"]}: {output}/summary.json',flush=True)
    return 1 if failed else 0

if __name__ == '__main__':
    sys.exit(main())

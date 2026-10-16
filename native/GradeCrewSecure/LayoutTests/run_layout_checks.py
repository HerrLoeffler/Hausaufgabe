"""Actual SwiftUI/WebKit layout checks in a separate, non-distributed iPad test host."""
import argparse, html, itertools, json, pathlib, shutil, subprocess, sys, fcntl, tempfile
HERE=pathlib.Path(__file__).resolve().parent
ROOT=HERE.parent
BUNDLE='de.gradecrew.secure.layoutchecks'
def lock_device(device_id,root=pathlib.Path(tempfile.gettempdir())):
    file=(root/('gradecrew-secure-layout-'+device_id+'.lock')).open('a')
    try:fcntl.flock(file,fcntl.LOCK_EX|fcntl.LOCK_NB)
    except BlockingIOError:
        file.close();raise RuntimeError('Another Secure layout suite is already using this simulator')
    return file

def case_list(policy,suite,layer):
    views=policy['viewports'] if suite=='full' else [policy['viewports'][1],policy['viewports'][8]]
    sizes=policy['textSizes'] if suite=='full' else [policy['textSizes'][0],policy['textSizes'][2]]
    if layer=='native':
        scenes=policy['nativeScenarios'] if suite=='full' else ['entry-empty','entry-ready','active','storage-error','completed']
        return ['native-'+ '-'.join([v['name'],appearance,size,scene]) for v,appearance,size,scene in itertools.product(views,policy['appearances'],sizes,scenes)]
    scenes=policy['webScenarios'] if suite=='full' else ['all-types','thirty']
    return ['web-'+ '-'.join([v['name'],size,scene,overview]) for v,size,scene,overview in itertools.product(views,sizes,scenes,['closed','open'])]
def validate_reports(folder,expected):
    issues=[]
    actual={p.stem for p in folder.glob('*.json') if p.stem not in ('summary','policy')}
    wanted=set(expected)
    if actual!=wanted: issues.append({'missing':sorted(wanted-actual),'unexpected':sorted(actual-wanted)})
    for case in expected:
        try:
            data=json.loads((folder/(case+'.json')).read_text())
            if data.get('caseID')!=case: issues.append(case+': wrong report identity')
            if not isinstance(data.get('issues'),list): issues.append(case+': missing issues')
            else: issues += [case+': '+str(x) for x in data['issues']]
            view=data.get('viewport',{})
            if not view.get('width') or not view.get('height'):issues.append(case+': no measured viewport')
            if not (folder/(case+'.png')).read_bytes().startswith(b'\x89PNG\r\n\x1a\n'):issues.append(case+': invalid picture')
        except (OSError,ValueError,TypeError) as error:issues.append(case+': '+str(error))
    return {'passed':not issues,'expected':len(expected),'reported':len(actual),'issues':issues}
def run(args,**kw):return subprocess.run([str(a) for a in args],check=True,**kw)
def gallery(folder):
    cards=''.join('<figure><a href="'+html.escape(p.name)+'"><img loading="lazy" src="'+html.escape(p.name)+'"></a><figcaption>'+html.escape(p.stem)+'</figcaption></figure>' for p in sorted(folder.glob('*.png')))
    (folder/'gallery.html').write_text('<!doctype html><meta charset="utf-8"><title>Secure Layoutberichte</title><style>body{font:16px system-ui;background:#eff3f9;color:#15283f}main{display:flex;flex-wrap:wrap;gap:16px}figure{width:260px;margin:0;padding:10px;background:white}img{width:100%;height:340px;object-fit:contain}figcaption{font-size:12px;overflow-wrap:anywhere}</style><h1>GradeCrew Secure Layoutberichte</h1><main>'+cards+'</main>')
def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--output',required=True,type=pathlib.Path);p.add_argument('--suite',choices=['smoke','full'],default='smoke');p.add_argument('--layer',choices=['native','web','all'],default='all');p.add_argument('--device-id')
    args=p.parse_args();out=args.output.resolve()
    if out.exists() and any(out.iterdir()):p.error('Output directory must be new or empty')
    out.mkdir(parents=True,exist_ok=True)
    policy=json.loads((HERE/'layout-policy.json').read_text())
    inventory=json.loads(run(['xcrun','simctl','list','devices','available','-j'],capture_output=True,text=True).stdout)
    devices=[d for ds in inventory['devices'].values() for d in ds if d.get('isAvailable') and 'iPad' in d.get('deviceTypeIdentifier','')]
    if args.device_id:devices=[d for d in devices if d['udid']==args.device_id]
    if not devices:raise RuntimeError('No available iPad simulator; missing coverage is not a pass')
    device=next((d for d in devices if d['state']=='Booted'),devices[0])
    simulator_lock=lock_device(device['udid'])
    if device['state']!='Booted':run(['xcrun','simctl','boot',device['udid']])
    run(['xcrun','simctl','bootstatus',device['udid'],'-b'],stdout=subprocess.DEVNULL)
    run([sys.executable,HERE/'generate_layout_project.py'])
    layers=['native','web'] if args.layer=='all' else [args.layer]
    results=[]
    for layer in layers:
        config={'suite':args.suite,'layer':layer,'policy':policy}
        (HERE/'Fixtures/run.json').write_text(json.dumps(config))
        log=out/(layer+'-xcodebuild.log')
        with log.open('w') as stream:
            result=subprocess.run(['xcodebuild','-project',str(ROOT/'GradeCrewSecureLayoutChecks.xcodeproj'),'-scheme','GradeCrew Secure Layout Checks','-destination','platform=iOS Simulator,id='+device['udid'],'-derivedDataPath',str(out/'derived'),'-resultBundlePath',str(out/(layer+'.xcresult')),'-only-testing:GradeCrewSecureLayoutTests/'+('SecureNativeLayoutTests' if layer=='native' else 'SecureWebLayoutTests'),*(['-only-testing:GradeCrewSecureLayoutTests/SecureLifecycleIntegrationTests'] if layer=='native' else []),'-parallel-testing-enabled','NO','-collect-test-diagnostics','never','CODE_SIGNING_ALLOWED=NO','ONLY_ACTIVE_ARCH=YES','test'],stdout=stream,stderr=subprocess.STDOUT,timeout=2700)
        target=out/layer;target.mkdir()
        source=None
        try:
            container=run(['xcrun','simctl','get_app_container',device['udid'],BUNDLE,'data'],capture_output=True,text=True).stdout.strip()
            source=pathlib.Path(container)/'Documents/SecureLayoutReports'
            for f in source.glob(layer+'-*'):shutil.copy2(f,target/f.name)
        except subprocess.CalledProcessError:pass
        summary=validate_reports(target,case_list(policy,args.suite,layer))
        if layer=='web':
            interactions=out/'interactions';interactions.mkdir()
            if source is not None:
                for f in source.glob('interaction-*'):shutil.copy2(f,interactions/f.name)
            interaction_summary=validate_reports(interactions,['interaction-'+name for name in policy['interactions']])
            gallery(interactions);(interactions/'summary.json').write_text(json.dumps(interaction_summary,indent=2))
            summary['interactionReports']=interaction_summary
            if not interaction_summary['passed']:summary['passed']=False;summary['issues'].append('Incomplete or failed WebKit interactions')
        if result.returncode:summary['passed']=False;summary['issues'].append('xcodebuild failed: '+str(result.returncode))
        gallery(target);(target/'summary.json').write_text(json.dumps(summary,indent=2));results.append(summary)
    final={'passed':all(r['passed'] for r in results),'layers':results,'device':device['name'],'suite':args.suite}
    (out/'summary.json').write_text(json.dumps(final,indent=2));print(json.dumps(final,indent=2));return 0 if final['passed'] else 1
if __name__=='__main__':sys.exit(main())

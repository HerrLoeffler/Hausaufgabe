#!/usr/bin/env python3
"""Build a deterministic, service-free copy of the integration UI for WKWebView.

No network, credentials, Firebase SDK, or deployed entrypoint is executed. Rendering
functions and retained HTML/CSS are extracted verbatim from SHA256-verified pins.
"""
from pathlib import Path
import argparse
import hashlib
import json
import re
import shutil

HERE = Path(__file__).resolve().parent
SOURCE = HERE / 'Source'
NATIVE = HERE.parents[1] / 'Resources'
REPOSITORY = HERE.parents[3]

def sha(data):
    return hashlib.sha256(data).hexdigest()

def function(source, name, indent=''):
    match = re.search(r'^' + re.escape(indent) + r'(?:async )?function ' + re.escape(name) + r'\([^\n]*\{[\s\S]*?^' + re.escape(indent) + r'\}', source, re.M)
    if not match:
        raise ValueError('Renderer not found: ' + name)
    return match.group(0)

def section(html, name):
    start = re.search(r'<section\b[^>]*\bid="' + re.escape(name) + r'"[^>]*>', html).start()
    depth = 0
    for match in re.finditer(r'</?section\b[^>]*>', html[start:]):
        depth += -1 if match.group(0).startswith('</') else 1
        if depth == 0:
            return html[start:start+match.end()]
    raise ValueError('Unclosed section ' + name)

def module_iife(source, exports, prefix=''):
    source = re.sub(r'^import\s[\s\S]*?;\s*', '', source, flags=re.M)
    source = re.sub(r'^export\s*\{[\s\S]*?\};?', '', source, flags=re.M)
    source = re.sub(r'\bexport (?=(?:const|let|function|class)\b)', '', source)
    return '(function(){\n' + prefix + source + '\nreturn {' + ','.join(exports) + '};\n})()'

def build(output):
    provenance = json.loads((SOURCE/'provenance.json').read_text())
    sources = {}
    for name, expected in provenance['files'].items():
        source = REPOSITORY/expected['repositoryPath'] if expected.get('repositoryPath') else SOURCE/name
        if not source.is_file() or sha(source.read_bytes()) != expected['sha256']:
            raise ValueError('Pinned source hash mismatch or missing file: '+name+' ('+str(source)+')')
        sources[name] = source
    output.mkdir(parents=True, exist_ok=True)
    # Copy source CSS/assets with relative paths intact. App/entrypoints are not copied.
    for name,p in sources.items():
        if p.suffix in ('.css', '.svg', '.png', '.jpg', '.webp'):
            target=output/name;target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(p,target)
    app=sources['app.js'].read_text()
    # This pin was originally exercised by test_native_question_editor_js.cjs.
    editor_names=['bindQuestionTextEditor','renderQuestions','renderQuestionImageEditor','renderQuestionAudioEditor','renderAnswerEditor','renderGapfillEditor','renderGapColorEditor','fillGapComposer','makeGapChip','serializeGapComposer','parseGaps','makeMiniButton','getQuestionImageSrc','getQuestionAudioSrc','getQuestionSolutionAudioSrc','questionAnswerAudioEntries','questionHasAudioAnswerEntries','questionAnswerAudioReady','questionStudentAudioReady','clearQuestionAudio','audioOperations','cancelQuestionAudioOperation','answerAudioRepairState','createAnswerAudioRepairControl']
    common_names=['escapeHtml','normalize','toMillis','round1','clamp','isAdmin','activeQuizzes','filteredQuizzes','quizStatusMeta','renderQuizList','scaleRangeText','renderGradeScaleSettings','defaultSolutionAudioScript']
    renderers='\n\n'.join(function(app,n) for n in editor_names+common_names)
    assets=sources['generated/gradecrew-assets.js'].read_text().replace('export const','const')
    (output/'renderers.js').write_text(assets+'\n'+renderers+'\n')
    tour=sources['gradecrew-tour-v7.js'].read_text()
    tour_functions='\n'.join(function(tour,n,'  ') for n in ['dashboard','updateDashboardTourTitle'])
    (output/'tutorial-entry.js').write_text('''// Exact deployed tutorial dashboard mount, with tutorial navigation isolated.
(function(){ const $=s=>document.querySelector(s); let active=false,owner='';
const suppressLegacyGuides=()=>{},removeOffer=()=>{},stop=()=>{},start=()=>{},doneKey=()=> 'fixture-tour',handledLocally=()=>true;
const offerHandledLocally=()=>true,offered=new Set();
'''+tour_functions+'''\nwindow.gcMountTutorial=options=>dashboard(options); })();\n''')
    runtime_exports=['installBrowserI18n','registerCatalog','registerSourcePatterns','translateTree','setActiveUiLocale']
    core_exports=['DEFAULT_LOCALE','canonicalizeLocale','resolveUiLocale','formatLocaleNumber','formatLocaleDate']
    bundle='const gcI18nCore='+module_iife(sources['shared/i18n/i18n-core.mjs'].read_text(),core_exports)+';\n'
    bundle+='const gcI18nRuntime='+module_iife(sources['shared/i18n/browser-runtime.mjs'].read_text(),runtime_exports,'const {'+','.join(core_exports)+'}=gcI18nCore;\n')+';\n'
    for var,file,names in [('gcI18nDE','messages-de-DE.mjs',['deDEMessages']),('gcI18nEN','messages-en-GB.mjs',['enGBMessages','enGBSourcePatterns']),('gcI18nCrew','extensions-en-GB-crew.mjs',['enGBCrewMessages','enGBCrewSourcePatterns'])]:
        bundle+='const '+var+'='+module_iife(sources['shared/i18n/'+file].read_text(),names)+';\n'
    bundle+='const {registerCatalog,registerSourcePatterns}=gcI18nRuntime;\nregisterCatalog("de-DE",gcI18nDE.deDEMessages);registerCatalog("en-GB",gcI18nEN.enGBMessages);registerCatalog("en-GB",gcI18nCrew.enGBCrewMessages);registerSourcePatterns("en-GB",gcI18nEN.enGBSourcePatterns);registerSourcePatterns("en-GB",gcI18nCrew.enGBCrewSourcePatterns);\n'
    (output/'i18n.js').write_text(bundle)
    upgrade=sources['gradecrew-workspace-upgrade.mjs'].read_text()
    upgrade=re.sub(r'^import[^\n]*\n','',upgrade,flags=re.M).replace('export function','function')
    (output/'workspace-upgrade.js').write_text(upgrade)
    (output/'mobile-viewport.js').write_text(re.sub(r'^export[^\n]*\n?','',sources['mobile-viewport-polish.js'].read_text(),flags=re.M))
    startup=sources['startup.js'].read_text()
    (output/'brand-assets.js').write_text(function(startup,'installGradeCrewBrandAssets')+'\ninstallGradeCrewBrandAssets();\n')
    coco_source=sources['crew-assistant-ui.js'].read_text()
    crew_core=sources['crew-assistant-core.mjs'].read_text()
    crew_members=re.search(r'^const CREW_MEMBERS = Object.freeze\(\{[\s\S]*?^\}\);',crew_core,re.M).group(0)
    coco_functions='\n\n'.join(function(coco_source,n) for n in ['installStyles','teacherUiAvailable','updateLauncherVisibility','createUi'])
    (output/'coco-launcher.js').write_text('// Exact deployed Coco presentation; every service/interaction callback is inert.\n(function(){\n'+crew_members+'\nconst COCO=CREW_MEMBERS.coco;const $=id=>document.getElementById(id);let open=false;const setOpen=()=>{},stopDictation=()=>{},addMessage=()=>{},sendCurrentMessage=()=>{},toggleDictation=()=>{};\n'+coco_functions+'\nwindow.gcMountCoco=()=>{installStyles();createUi();};\n})();\n')
    for name in ['gradecrew-native-workspace.js','gradecrew-native-question-editor.js']:
        source=(NATIVE/name).read_text().replace('__GRADECREW_CONFIG__','({origin:location.origin})')
        (output/name).write_text(source)
    for name in ['fixture.js','geometry-audit.js']:
        shutil.copyfile(HERE/name,output/name)
    html=sources['workspace.html'].read_text()
    head=re.search(r'<head>([\s\S]*?)</head>',html).group(1)
    head=re.sub(r'<script\b[\s\S]*?</script>','',head)
    # Match the deployed startup's exact stylesheet order after its static links.
    extra=['generated/gradecrew-design-tokens.css','gradecrew-dashboard-foundation.css','gradecrew-logo.css','gradecrew-auth-startscreen.css','gradecrew-auth-startscreen-polish.css','gradecrew-hero-scene.css','gradecrew-workspace-upgrade.css']
    head+='\n'+''.join('<link rel="stylesheet" href="'+x+'">\n' for x in extra)
    # CSP fails closed if a service operation or remote resource is accidentally introduced.
    head+='<meta http-equiv="Content-Security-Policy" content="default-src \'self\' data:; script-src \'self\' \'unsafe-inline\'; style-src \'self\' \'unsafe-inline\'; img-src \'self\' data:; media-src \'self\' data:; connect-src \'none\'; font-src \'self\' data:">'
    head+='<script>window.gcLayoutErrors=[];window.addEventListener("error",function(e){window.gcLayoutErrors.push(String(e.message||"Resource load error: "+(e.target.src||e.target.href||e.target.tagName)));},true);window.addEventListener("unhandledrejection",function(e){window.gcLayoutErrors.push(String(e.reason));});</script>'
    header=re.search(r'<header class="topbar">[\s\S]*?</header>',html).group(0)
    template=re.search(r'<template id="questionTemplate">[\s\S]*?</template>',html).group(0)
    footers='\n'.join(re.findall(r'<footer\b[\s\S]*?</footer>',html))
    scripts=['i18n.js','renderers.js','brand-assets.js','tutorial-entry.js','mobile-viewport.js','workspace-upgrade.js','gradecrew-native-workspace.js','gradecrew-native-question-editor.js','coco-launcher.js','geometry-audit.js','fixture.js']
    final='<!doctype html><html lang="de"><head>'+head+'</head><body>'+header+'<main id="mainContent" class="shell" tabindex="-1">'+''.join(section(html,x) for x in ['dashboardView','settingsView','editorView'])+'</main>'+template+footers+''.join('<script src="'+x+'"></script>' for x in scripts)+'</body></html>'
    (output/'index.html').write_text(final)
    provenance['rendererFunctions']={n:sha(function(app,n).encode()) for n in editor_names+common_names}
    provenance['cocoPresentationFunctions']={n:sha(function(coco_source,n).encode()) for n in ['installStyles','teacherUiAvailable','updateLauncherVisibility','createUi']}
    provenance['nativePresentation']={n:sha((NATIVE/n).read_bytes()) for n in ['gradecrew-native-workspace.js','gradecrew-native-question-editor.js']}
    provenance['limitations']=['Logical CSS viewport simulations inside real WKWebView; not device hardware/OS coverage.','Service persistence, authentication, generation and tutorial progression are isolated. Actual UI HTML/CSS/renderers and locale translator run unchanged.','Fixture controls preserve local renderer handlers, but service actions are inert.']
    provenance['generatedFiles']={str(p.relative_to(output)):sha(p.read_bytes()) for p in sorted(output.rglob('*')) if p.is_file() and p.name!='provenance.json'}
    (output/'provenance.json').write_text(json.dumps(provenance,indent=2)+'\n')
    print(str(output))

if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--output',type=Path,required=True)
    build(parser.parse_args().output.resolve())

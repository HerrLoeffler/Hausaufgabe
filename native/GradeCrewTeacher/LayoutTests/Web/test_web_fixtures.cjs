const {test,after}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),cp=require('node:child_process');
const {JSDOM}=require(require.resolve('jsdom',{paths:[path.join(__dirname,'../../../../tools/ui'),'/private/tmp/game-et-jsdom/node_modules']}));
const output=fs.mkdtempSync(path.join(os.tmpdir(),'gc-layout21-fixture-test-'));
cp.execFileSync('python3',[path.join(__dirname,'prepare_web_fixtures.py'),'--output',output]);
after(()=>fs.rmSync(output,{recursive:true,force:true}));
const html=fs.readFileSync(path.join(output,'index.html'),'utf8');
async function browser(t,query,{native=true}={}){
 const dom=new JSDOM(html,{url:'https://fixture.invalid/index.html?'+query,runScripts:'outside-only',pretendToBeVisual:true});t.after(()=>dom.window.close());const w=dom.window;
 if(native)w.webkit={messageHandlers:{gradecrewNative:{postMessage(){}}}};
 // Geometry and image decoding are exclusively exercised by WKWebView tests.
 w.gcSettle=async()=>{};
 const sources=[];
 for(const tag of [...w.document.querySelectorAll('script[src]')]){
  let source=fs.readFileSync(path.join(output,tag.getAttribute('src')),'utf8');
  if(tag.getAttribute('src')==='fixture.js')source=source.replace(/async function gcSettle\(\)\{[\s\S]*?\n\}/,'async function gcSettle(){}');
  sources.push(source);
 }
 w.eval(sources.join('\n;\n'));
 w.document.dispatchEvent(new w.Event('DOMContentLoaded'));
 for(let i=0;i<15&&!w.gcLayoutReady;i++)await new Promise(r=>setTimeout(r,5));
 assert.equal(w.gcLayoutReady,true);assert.deepEqual(Array.from(w.gcLayoutErrors),[]);
 return w;
}
test('generated fixture uses pinned real HTML, native scripts and manifest sources',()=>{
 const provenance=JSON.parse(fs.readFileSync(path.join(output,'provenance.json')));
 assert.equal(provenance.release,'2.3.1-gc39');assert.equal(provenance.commit,'8f8697901f8c1aea89897be855ca2872c82d0f2b');
 assert.ok(provenance.rendererFunctions.renderQuestions);assert.ok(provenance.cocoPresentationFunctions.createUi);
 assert.equal(provenance.files['assets/gradecrew/penguin-icon.svg'].repositoryPath,'assets/gradecrew/brand-icon-v1.svg');assert.match(html,/connect-src 'none'/);
 assert.ok(!html.includes('src="startup.js'));assert.ok(!html.includes('firebase'));assert.ok(!html.includes('cdnjs'));
 const pinned=fs.readFileSync(path.join(__dirname,'Source/app.js'),'utf8');
 const functions=fs.readFileSync(path.join(output,'renderers.js'),'utf8');
 assert.ok(functions.includes('function renderQuestions()'));assert.ok(pinned.includes('function renderQuestions()'));
 for(const match of html.matchAll(/(?:src|href)="([^"#?]+)(?:\?[^"#]*)?"/g)){
  if(match[1].startsWith('http'))throw Error('External reference '+match[1]);
  if(match[1].startsWith('assets/')||match[1].endsWith('.css')||match[1].endsWith('.js'))assert.ok(fs.existsSync(path.join(output,match[1])),match[1]);
 }
});

test('offline generator fails closed when a reused tracked source drifts',()=>{
 const fake=fs.mkdtempSync(path.join(os.tmpdir(),'gc-layout21-drift-'));
 try{
  fs.writeFileSync(path.join(fake,'crew-clay.css'),'changed source bytes');
  const python=`import importlib.util, pathlib, sys
sys.dont_write_bytecode = True
spec=importlib.util.spec_from_file_location('fixture_builder',sys.argv[1])
module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
module.REPOSITORY=pathlib.Path(sys.argv[2])
try: module.build(pathlib.Path(sys.argv[2])/'output')
except ValueError as error:
 assert 'crew-clay.css' in str(error), str(error)
else: raise AssertionError('Source drift was accepted')
`;
  cp.execFileSync('python3',['-c',python,path.join(__dirname,'prepare_web_fixtures.py'),fake]);
  assert.equal(fs.existsSync(path.join(fake,'output')),false);
 }finally{fs.rmSync(fake,{recursive:true,force:true});}
});
for(const lang of ['de','en'])for(const role of ['teacher','admin']){
 test(`workspace preserves role controls, native layout and actual locale ${lang}/${role}`,async t=>{
  const w=await browser(t,`screen=workspace&lang=${lang}&role=${role}`),d=w.document;
  assert.equal(d.getElementById('dashboardView').classList.contains('hidden'),false);
  assert.equal(d.getElementById('adminTopBtn').classList.contains('hidden'),role!=='admin');
  assert.equal(d.querySelectorAll('.gcWorkspaceCrewEntry').length,1);
  assert.equal(d.querySelectorAll('#quizList .quizCard').length,2);
  const coco=d.getElementById('gcCrewLauncher');assert.ok(coco);assert.equal(coco.hidden,false);
  coco.click();assert.equal(d.getElementById('gcCrewPanel').hidden,true,'Coco fixture interactions must stay inert');
  assert.equal(new URL(coco.querySelector('img').src).origin,w.location.origin);
  assert.equal(d.querySelector('#gcNativeSettingsTutorialBtn').textContent,lang==='en'?'Start tutorial':'Tutorial starten');
  assert.equal(d.querySelector('#settingsTopBtn').textContent,lang==='en'?'Settings':'Einstellungen');
  assert.equal(d.querySelector('#gradecrewLanguageControl select').value,lang==='en'?'en-GB':'de-DE');
  for(const e of [d.getElementById('brandBtn'),d.getElementById('quizFilter'),d.getElementById('quizSort')])assert.equal(w.getComputedStyle(e).minHeight,'44px');
  for(const e of [d.getElementById('quizFilter'),d.getElementById('quizSort')])assert.equal(w.getComputedStyle(e).height,'44px');
  // jsdom does not consistently cascade !important against the real i18n style
  // inserted later. Check the actual native declaration; WebKit verifies geometry.
  const languageRule=[...d.getElementById('gcNativeWorkspaceStyle').sheet.cssRules].find(r=>r.selectorText==='.topbar[data-gc-native-header] #gradecrewLanguageControl select');
  assert.equal(languageRule.style.getPropertyValue('height'),'44px');assert.equal(languageRule.style.getPropertyPriority('height'),'important');
 });
 test(`settings renders actual grading fields and tutorial replay ${lang}/${role}`,async t=>{
  const w=await browser(t,`screen=settings&lang=${lang}&role=${role}`),d=w.document;
  assert.equal(d.getElementById('settingsView').classList.contains('hidden'),false);
  assert.equal(d.querySelectorAll('.thresholdInput').length,6);
  assert.equal(d.querySelector('#gcNativeSettingsTutorialBtn').disabled,false);
 });
}
for(const lang of ['de','en'])for(const type of ['single','multi','text','dropdown','truefalse','gapfill','matching','ordering','grouping','markwords','number'])for(const variant of ['default','longtext','media','readonly']){
 test(`editor exact renderer ${lang}/${type}/${variant}`,async t=>{
  const w=await browser(t,`screen=editor&lang=${lang}&type=${type}&variant=${variant}`),d=w.document,card=d.querySelector('.questionCard');
  assert.equal(card.dataset.gcNativeQuestion,'');
  assert.equal(card.querySelector('.qType').value,type);
  assert.equal(card.querySelector('.qType').disabled,variant==='readonly');
  assert.ok(card.querySelector('.answerEditor'));
  assert.ok(card.querySelector('.answerEditor').compareDocumentPosition(card.querySelector('.gcNativeQuestionMedia'))&w.Node.DOCUMENT_POSITION_FOLLOWING);
  assert.equal(card.querySelectorAll('.gcNativeMediaDisclosure').length,2);
  for(const e of card.querySelectorAll('button,select,summary'))assert.equal(w.getComputedStyle(e).minHeight,'44px',e.outerHTML);
  for(const e of card.querySelectorAll('select'))assert.equal(w.getComputedStyle(e).height,'44px');
  for(const row of card.querySelectorAll('.optionRow')){
   assert.equal(w.getComputedStyle(row).gridTemplateColumns,'44px minmax(0,1fr) 44px');
   const original=row.querySelector('input[type=checkbox],input[type=radio]');
   assert.equal(original.labels.length,1);assert.equal(original.labels[0].className,'gcNativeChoiceTarget');
   assert.equal(w.getComputedStyle(original.labels[0]).width,'44px');assert.equal(w.getComputedStyle(original.labels[0]).height,'44px');
  }
  if(variant==='media'){assert.equal(card.querySelectorAll('.gcNativeMediaDisclosure[open]').length,2);assert.equal(card.querySelectorAll('audio[src]').length,2);}
  if(variant==='longtext'&&type!=='gapfill')assert.ok(card.querySelector('.qText').value.length>500);
 });
}

for(const type of ['single','multi','dropdown'])test(`native choice label activates the original ${type} model handler`,async t=>{
 const w=await browser(t,`screen=editor&type=${type}`),d=w.document;
 const original=d.querySelectorAll('.optionRow input[type=checkbox],.optionRow input[type=radio]')[1];
 const originalName=original.name;assert.equal(w.gcFixture.state.questions[0].options[1].correct,false);
 original.labels[0].click();
 assert.equal(w.gcFixture.state.questions[0].options[1].correct,true);assert.equal(original.name,originalName);
 assert.equal(w.gcFixture.dirty(),1);
});

for(const lang of ['de','en'])for(const role of ['teacher','admin'])test(`original Coco stays floating across native views ${lang}/${role}`,async t=>{
 const w=await browser(t,`screen=workspace&lang=${lang}&role=${role}`),d=w.document;
 const original=d.getElementById('gcCrewLauncher');let clicks=0;original.addEventListener('click',()=>clicks++);
 const headings=new Map([...d.querySelectorAll('main > .view h1')].map(h=>[h.closest('.view').id,h]));
 for(const id of ['dashboardView','settingsView','editorView','dashboardView']){
  for(const view of d.querySelectorAll('main > .view'))view.classList.toggle('hidden',view.id!==id);
  await new Promise(resolve=>setTimeout(resolve,15));
  assert.equal(d.getElementById('gcCrewLauncher'),original);assert.equal(d.querySelectorAll('#gcCrewLauncher').length,1);
  assert.equal(original.parentElement,d.body);assert.equal(d.getElementById(id).querySelector('h1'),headings.get(id));
  assert.equal(d.querySelector('.gcNativeCocoHeadingRow'),null);
  assert.equal(original.querySelector('span').textContent,'Coco');original.click();
 }
 assert.equal(clicks,4);
 const nativeRule=[...d.getElementById('gcNativeWorkspaceStyle').sheet.cssRules].find(r=>r.selectorText==='#gcCrewLauncher[data-gc-native-coco]');
 assert.equal(nativeRule.style.getPropertyValue('position'),'fixed');assert.equal(nativeRule.style.getPropertyPriority('position'),'important');
 assert.equal(nativeRule.style.getPropertyValue('width'),'64px');assert.equal(nativeRule.style.getPropertyValue('height'),'64px');
 assert.ok(nativeRule.style.getPropertyValue('bottom'));assert.ok(nativeRule.style.getPropertyValue('right'));assert.equal(nativeRule.style.getPropertyValue('top'),'auto');
});
test('ordinary browsers preserve original floating Coco and receive no native dock',async t=>{
 const w=await browser(t,'screen=workspace',{native:false}),d=w.document,original=d.getElementById('gcCrewLauncher');
 assert.equal(original.parentElement,d.body);assert.equal(original.hasAttribute('data-gc-native-coco'),false);
 assert.equal(d.getElementById('gcNativeWorkspaceStyle'),null);assert.equal(d.querySelector('.gcNativeCocoHeadingRow'),null);
});

const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs/promises');const path=require('node:path');const vm=require('node:vm');const {JSDOM}=require('jsdom');
const root=path.resolve(__dirname,'../..');
const pause=()=>new Promise(r=>setTimeout(r,40));
async function fixture(t){
 const errors=[];const dom=new JSDOM(await fs.readFile(path.join(root,'index.html'),'utf8'),{url:'http://127.0.0.1:8768',runScripts:'outside-only',pretendToBeVisual:true});const w=dom.window;
 t.after(()=>dom.window.close());w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};w.CSS={escape:s=>String(s)};w.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});
 w.HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};w.HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');};w.console={...console,info(){},warn(){},error:(...args)=>errors.push(args.map(String).join(' '))};
 w.fetch=async (url,options)=>{if(String(url).includes('release.json'))return {ok:true,json:async()=>({commit:'local-test'})};if(url==='/__review/api'){const data=JSON.parse(options.body);return {ok:true,json:async()=>data.action==='access'?{admin:true,catalog:{checks:[]}}:{notes:[],checks:[]}};}throw new Error('Unexpected network: '+url);};
 const cache=new Map(),context=dom.getInternalVMContext();
 async function moduleFor(name){name=name.split('?')[0];if(name.includes('gstatic.com'))name='/tools/review-preview/firebase-fixture.mjs';if(cache.has(name))return cache.get(name);const pending=loadModule(name);cache.set(name,pending);return pending;}
 async function loadModule(name){
  let code;if(name.includes('gstatic.com')){name='/tools/review-preview/firebase-fixture.mjs';if(cache.has(name))return cache.get(name);}
  if(name==='/firebase-config.js')code='export const firebaseConfig={projectId:"local-review"};export const appEnvironment="local-review";';else code=await fs.readFile(path.join(root,name),'utf8');
  if(name==='/app.js')code+='\nwindow.__editorTest={state,renderQuestions,markDirty};';
  const m=new vm.SourceTextModule(code,{context,identifier:name,initializeImportMeta:meta=>{meta.url='http://127.0.0.1:8768'+name;},importModuleDynamically:async(spec,parent)=>{const child=await linked(spec,parent);if(child.status==='unlinked')await child.link(linked);if(child.status==='linked')await child.evaluate();return child;}});cache.set(name,m);return m;
 }
 async function linked(spec,parent){const name=spec.startsWith('http')?spec:path.posix.resolve(path.posix.dirname(parent.identifier),spec);return moduleFor(name);}
 const app=await moduleFor('/app.js');await app.link(linked);await app.evaluate();await pause();return {w,errors};
}
test('real app resumes editor, student, submit and finish scenes with isolated data',async t=>{
 const {w,errors}=await fixture(t);
 for(const [scene,view] of [['editor','editorView'],['student','studentView'],['submit','studentView'],['results','resultsView'],['finish','resultsView']]){
  w.document.dispatchEvent(new w.CustomEvent('gradecrew:review-scene',{detail:{scene}}));await pause();await pause();
  assert.equal(w.document.getElementById(view).classList.contains('hidden'),false,scene+' opens expected view');
  if(scene==='editor')assert.ok(w.document.querySelector('#questionList .qText'));
  if(scene==='submit')assert.match(w.document.querySelector('.studentSubmitConfirm').textContent,/10 Aufgaben/);
  if(scene==='finish')assert.match(w.document.querySelector('.gcRealCoach').textContent,/gehörst jetzt zur Crew/);
 }
 assert.deepEqual(errors,[]);
});

test('background completion marks its task while another task keeps focus and unsaved input',async t=>{const {w,errors}=await fixture(t);w.document.dispatchEvent(new w.CustomEvent('gradecrew:review-scene',{detail:{scene:'editor'}}));await pause();const api=w.__editorTest;const first=api.state.questions[0],second=api.state.questions[1];assert.ok(second);const field=w.document.querySelectorAll('#questionList .qText')[1];field.value='MY UNSAVED SECOND TASK';field.dispatchEvent(new w.Event('input',{bubbles:true}));field.focus();api.markDirty(first,'Emmi');api.renderQuestions({onlyQuestionId:first.id});assert.equal(w.document.activeElement,field);assert.equal(field.value,'MY UNSAVED SECOND TASK');assert.equal(api.state.questions[1].text,'MY UNSAVED SECOND TASK');assert.ok(w.document.querySelector('#questionOutline .hasChanges'));assert.match(w.document.querySelector('.questionChangedBadge').textContent,/Geändert · prüfen/);w.document.querySelector('.questionChangedBadge button').click();assert.equal(w.document.querySelector('#questionOutline .hasChanges'),null);assert.deepEqual(errors,[]);});

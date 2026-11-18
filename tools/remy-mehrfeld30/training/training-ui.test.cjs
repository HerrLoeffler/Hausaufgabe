'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),{createRequire}=require('node:module');
const {JSDOM}=createRequire(path.join(__dirname,'../../ui/package.json'))('jsdom');
const {core}=require('../../../functions/lib/visual-task');
const {buildCandidate}=require('./builder.cjs');
const {present}=require('../review.cjs');
const read=name=>fs.readFileSync(path.join(__dirname,'..',name),'utf8');
test('the actual free-wish UI dispatches creation and blind check, then opens a versioned task with a direct jump list',async t=>{
  const dom=new JSDOM(read('index.html'),{url:'https://example.test/remy-labor/'});t.after(()=>dom.window.close());
  const {window}=dom,{document}=window;
  window.GC2=core;new Function('window','document',read('../../visual/renderers.js'))(window,document);
  const q=buildCandidate({kind:'direct',relationship:'direct',constantRate:true,a:'4',b:'6',c:'10',
    text:'Vier gleich teure Hefte kosten sechs Euro. Was kosten zehn?',labels:['Hefte','Preis (€)']},{id:'wish'});
  const projected=present('training:wish-test','training',q);
  let init,stage=0;const sent=[];
  const view=(file,name,note)=>new Function('document','sharedNote','cancelAnimationFrame',
    read(file).replace(/^import .*;$/gm,'const note=sharedNote;').replaceAll('export ','')+'\nreturn '+name)(document,note,()=>{});
  const env={document,globalThis:window,localStorage:window.localStorage,crypto:require('node:crypto').webcrypto,FormData:window.FormData,
    initializeApp:()=>({}),getAuth:()=>({}),getFirestore:()=>({}),getFunctions:()=>({}),
    httpsCallable:()=>async data=>{
      sent.push(data);
      if(data.action==='trainingCreate')return {data:{runId:'wish-test'}};
      if(data.action==='trainingStatus')return {data:{quizId:projected.quizId,cases:[{id:'wish',status:['pending','generated','ready'][stage]}]}};
      if(data.action==='trainingStep'){stage++;return {data:{}};}
      if(data.action==='trainingDetails')return {data:{decision:'direct',reason:'Gleicher Stückpreis',independentCheck:'Unabhängig gelöst',solution:[{label:'Zielwert',value:'15'}]}};
      return {data:{tasks:data.quizId===projected.quizId?[projected]:[],expected:1}};
    },
    onAuthStateChanged:(_a,callback)=>{init=callback({uid:'synthetic'});},firebaseConfig:{projectId:'gradecrew-staging-2026'},
    mountRecipe:view('recipe-view.mjs','mountRecipe'),mountRhythm:view('rhythm-view.mjs','mountRhythm',view('recipe-view.mjs','note')),
    mountPitch:view('pitch-view.mjs','mountPitch')};
  new Function(...Object.keys(env),read('pilot.mjs').replace(/^import .*;$/gm,''))(...Object.values(env));
  await init;
  const $=id=>document.getElementById(id);
  $('trainingWish').elements.wish.value='Vier Hefte kosten sechs Euro. Wie viel kosten zehn?';
  $('trainingWish').dispatchEvent(new window.Event('submit',{bubbles:true,cancelable:true}));
  for(let i=0;i<15&&!$('trainingStatus').textContent.includes('gespeichert');i++)await new Promise(r=>setImmediate(r));
  assert.equal(sent.filter(x=>x.action==='trainingCreate').length,1);
  assert.equal(sent.filter(x=>x.action==='trainingStep').length,2);
  assert.equal($('position').textContent,'Aufgabe 1 von 1');
  assert.equal($('jump').options.length,1);
  assert.equal($('trainingExplain').hidden,false);
  assert.equal($('trainingReport').hidden,true);
  await $('trainingDetails').onclick();
  assert.match($('trainingReport').textContent,/Zielwert – 15/);
  assert.equal($('trainingGenerate').disabled,false);
  assert.ok(!window.localStorage.getItem('remy-mehrfeld30:synthetic:training-job'));
});
test('the free-wish UI resumes a bounded repair after an uncertain transport result without dispatching another repair',async t=>{
  const dom=new JSDOM(read('index.html'),{url:'https://example.test/remy-labor/'});t.after(()=>dom.window.close());
  const {window}=dom,{document}=window;
  let init,stage='pending',attempt=1,repairs=0;
  const q=present('training:repair-test','training',buildCandidate({kind:'other',text:'Ein Preis enthält einen Grundpreis.',title:'Preisweg'},{id:'wish'}));
  const env={document,globalThis:window,localStorage:window.localStorage,crypto:require('node:crypto').webcrypto,FormData:window.FormData,
    initializeApp:()=>({}),getAuth:()=>({}),getFirestore:()=>({}),getFunctions:()=>({}),
    mountRecipe:()=>{},mountRhythm:()=>{},mountPitch:()=>{},
    httpsCallable:()=>async data=>{
      if(data.action==='trainingCreate')return {data:{runId:'repair-test'}};
      if(data.action==='trainingStatus')return {data:{quizId:q.quizId,cases:[{id:'wish',status:stage,attempt,errors:['Auftrag präzisieren.']}]}};
      if(data.action==='trainingStep'){stage=stage==='pending'?'generated':attempt===1?'rejected':'ready';return {data:{}};}
      if(data.action==='trainingRepair'){
        repairs++;assert.match(data.requestId,/^[a-f0-9-]{36}$/);attempt=2;stage='pending';
        throw Error('Transport interrupted after server acceptance');
      }
      return {data:{tasks:data.quizId===q.quizId?[q]:[],expected:1}};
    },
    onAuthStateChanged:(_a,callback)=>{init=callback({uid:'synthetic'});},firebaseConfig:{projectId:'gradecrew-staging-2026'}};
  new Function(...Object.keys(env),read('pilot.mjs').replace(/^import .*;$/gm,''))(...Object.values(env));
  await init;
  const $=id=>document.getElementById(id);
  $('trainingWish').elements.wish.value='Aufgabe mit Grundpreis und variablem Anteil.';
  $('trainingWish').dispatchEvent(new window.Event('submit',{bubbles:true,cancelable:true}));
  for(let i=0;i<20&&$('trainingResume').hidden;i++)await new Promise(r=>setImmediate(r));
  assert.equal(repairs,1);assert.equal($('trainingResume').hidden,false);
  await $('trainingResume').onclick();
  assert.equal(repairs,1);
  assert.match($('trainingStatus').textContent,/Entwurf und unabhängige Prüfung sind gespeichert/);
});

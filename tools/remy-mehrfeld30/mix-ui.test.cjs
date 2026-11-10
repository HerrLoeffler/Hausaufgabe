'use strict';
const {readFileSync}=require('node:fs');
const {join}=require('node:path');
const {createRequire}=require('node:module');
const assert=require('node:assert/strict');
const test=require('node:test');
const {JSDOM}=createRequire(join(__dirname,'../ui/package.json'))('jsdom');
const {mixedDeck,mixedCode}=require('./mix.cjs');
const {present}=require('./review.cjs');
const {core}=require('../../functions/lib/visual-task');
const read=file=>readFileSync(join(__dirname,file),'utf8');

test('the Kreativlabor jumps directly to every mixed task with its real interaction',async t=>{
  const dom=new JSDOM(read('index.html'),{url:'https://example.test/remy-labor/'});
  t.after(()=>dom.window.close());
  const {window}=dom,{document}=window;
  window.GC2=core;
  for(const file of ['sequence-illustrations.js','renderers.js']){
    new Function('window','document',read('../../visual/'+file))(window,document);
  }
  const view=(file,name,note)=>new Function('document','sharedNote','cancelAnimationFrame',read(file).replace(/^import .*;$/gm,'const note=sharedNote;').replaceAll('export ','')+'\nreturn '+name)(document,note,()=>{});
  let init;
  const env={document,globalThis:window,localStorage:window.localStorage,
    initializeApp:()=>({}),getAuth:()=>({}),getFirestore:()=>({}),getFunctions:()=>({}),
    httpsCallable:()=>async data=>({data:{tasks:data.quizId===mixedCode?mixedDeck.map(({q})=>present(mixedCode,'mix',q)):[],expected:30}}),
    onAuthStateChanged:(_auth,callback)=>{init=callback({uid:'synthetic'});},
    mountRecipe:view('recipe-view.mjs','mountRecipe'),mountRhythm:view('rhythm-view.mjs','mountRhythm',view('recipe-view.mjs','note')),
    mountPitch:view('pitch-view.mjs','mountPitch'),firebaseConfig:{projectId:'gradecrew-staging-2026'}};
  new Function(...Object.keys(env),read('pilot.mjs').replace(/^import .*;$/gm,''))(...Object.values(env));
  await init;
  const $=id=>document.getElementById(id);
  await $('mixed').onclick();
  assert.equal($('jump').options.length,30);
  assert.equal($('jumpLabel').hidden,false);
  for(const [index,{q,recipe}] of mixedDeck.entries()){
    $('jump').value=String(index);
    $('jump').dispatchEvent(new window.Event('change',{bubbles:true}));
    assert.equal($('position').textContent,'Aufgabe '+(index+1)+' von 30');
    assert.equal($('prompt').textContent,q.text,q.id);
    assert.ok($('answer').querySelector('button,input,select,[tabindex]'),q.id);
    if(recipe==='sequence')assert.ok($('answer').querySelector('svg'),q.id);
    if(q.id==='mix-pflanzenteil')assert.ok($('answer').querySelector('image'),q.id);
  }
  await $('seed').onclick();
  assert.equal($('jumpLabel').hidden,true);
  await $('mixed').onclick();
  assert.equal($('position').textContent,'Aufgabe 30 von 30');
});

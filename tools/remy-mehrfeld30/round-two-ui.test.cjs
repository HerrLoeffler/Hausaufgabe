'use strict';
const {readFileSync}=require('node:fs');
const {join}=require('node:path');
const {createRequire}=require('node:module');
const assert=require('node:assert/strict');
const test=require('node:test');
const uiRequire=createRequire(join(__dirname,'../ui/package.json'));
const rulesRequire=createRequire(join(__dirname,'../rules/package.json'));
const {JSDOM}=uiRequire('jsdom');
const {initializeApp,deleteApp}=rulesRequire('firebase/app');
const {getFunctions,httpsCallable}=rulesRequire('firebase/functions');
const {roundTwo,roundTwoCode}=require('./round-two.cjs');
const {present,score}=require('./review.cjs');
const {core}=require('../../functions/lib/visual-task');
const read=file=>readFileSync(join(__dirname,file),'utf8');

test('all twelve round-two tasks reach the callable from the actual UI with full answers',async t=>{
  const dom=new JSDOM(read('index.html'),{url:'https://example.test/remy-labor/'});
  t.after(()=>dom.window.close());
  const {window}=dom,{document}=window;
  window.GC2=core;
  new Function('window','document',read('../../visual/renderers.js'))(window,document);
  const app=initializeApp({projectId:'gradecrew-staging-2026'},'round-two-ui');
  t.after(()=>deleteApp(app));
  const originalFetch=global.fetch;
  t.after(()=>{global.fetch=originalFetch;});
  let sent=0, offline=false;
  global.fetch=async(_url,req)=>{
    const {data}=JSON.parse(req.body);
    if(data.action==='list')return Response.json({result:{tasks:roundTwo.map(q=>present(roundTwoCode,'runde2',q)),expected:12}});
    assert.equal(data.action,'score');
    sent++;
    if(offline)throw Error('offline');
    const q=roundTwo.find(x=>x.id===data.id);
    return Response.json({result:{points:score(q,data.answer),maxPoints:q.points}});
  };
  let init;
  const env={document,globalThis:window,localStorage:window.localStorage,
    initializeApp:()=>app,getAuth:()=>({}),getFirestore:()=>({}),getFunctions,httpsCallable,
    onAuthStateChanged:(_auth,callback)=>{init=callback({uid:'synthetic'});},
    firebaseConfig:{projectId:'gradecrew-staging-2026'}};
  new Function(...Object.keys(env),read('pilot.mjs').replace(/^import .*;$/gm,''))(...Object.values(env));
  await init;
  const $=id=>document.getElementById(id);
  for(const q of roundTwo){
    if(q.type==='diagram'){
      const controls=[...$('answer').querySelectorAll('input,select')];
      const ids=q.paths.flatMap(p=>p.steps.filter(s=>s.field).map(s=>s.field));
      assert.equal(controls.length,ids.length);
      controls.forEach((control,i)=>{
        const f=q.fields.find(f=>f.id===ids[i]);
        control.value=f.accepted[0];
        control.dispatchEvent(new window.Event(control.tagName==='SELECT'?'change':'input',{bubbles:true}));
      });
    }else{
      for(const [source,target] of JSON.parse(q.visualTask).solution.edges){
        for(const id of [source,target])$('answer').querySelector('[data-node="'+id+'"]').dispatchEvent(new window.MouseEvent('click',{bubbles:true}));
      }
    }
    await $('scoreButton').onclick();
    assert.equal(sent,roundTwo.indexOf(q)+1,q.id+' must reach Firebase after inputs change');
    assert.match($('score').textContent,new RegExp('^'+String(q.points).replace('.', '[.,]')+' von '),q.id);
    $('next').click();
  }
  offline=true;
  await $('scoreButton').onclick();
  assert.match($('score').textContent,/erneut/i);
  assert.equal($('scoreButton').disabled,false);
});

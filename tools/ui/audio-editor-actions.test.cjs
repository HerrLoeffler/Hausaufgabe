const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const {JSDOM} = require('jsdom');
const source = fs.readFileSync(require('node:path').join(__dirname, '../../app.js'), 'utf8');
function harness() {
  const dom = new JSDOM('<div id="panel"></div>');
  const q = {id:'q1',type:'single',audioAnswerMode:'audio-only',options:[{text:'PRIVATE_ANSWER'},{text:'PRIVATE_OTHER',audioDataUrl:'data:audio/mpeg;base64,QUJD'}]};
  const reports = [], calls = [];
  const c = {document:dom.window.document, state:{user:{uid:'teacher'},currentQuiz:{id:'quiz'},questions:[q]}, APP_VERSION:'test-version', appEnvironment:'local', crypto:require('node:crypto').webcrypto, serverTimestamp:()=>0, db:{}, doc:(...args)=>args, setDoc:async(...args)=>reports.push(args), toast(){}, markDirty(){}, renderQuestionAudioEditor(){}, audioOperations:()=>new WeakMap(), questionAnswerAudioEntries:q=>q.options.map((asset,i)=>({key:`o${i}`,sourceText:asset.text,asset})), verifyGeneratedAudio:async()=>{}, generateAiAnswerAudioForQuestion:async(...args)=>calls.push(args), GRADECREW_ASSETS:{mascots:{emmi:{primary:'assets/gradecrew/fox-improve.svg'}}}};
  vm.createContext(c);
  const start = source.indexOf('function answerAudioClipStatus(');
  assert.ok(start >= 0, 'clip repair flow exists');
  vm.runInContext(source.slice(start, source.indexOf('\nfunction renderQuestionAudioEditor(', start)), c);
  return {c,q,reports,calls,close:()=>dom.window.close(),container:dom.window.document.getElementById('panel')};
}
test('missing clip generates only that entry and sends a content-free technical report', async()=>{
  const h=harness();try {
    await h.c.repairAnswerAudioTrack(h.q,h.container,'o0','missing');
    assert.equal(h.calls.length,1); assert.equal(h.calls[0][2],'o0'); assert.equal(h.reports.length,1);
    const report=h.reports[0][1]; assert.equal(report.category,'app_error'); assert.equal(report.technicalDetails.reason,'missing');
    assert.doesNotMatch(JSON.stringify(report),/PRIVATE_|data:audio|correct/);
  }finally{h.close();}
});
test('subjective regeneration never submits a missing incident',async()=>{
  const h=harness();try {await h.c.repairAnswerAudioTrack(h.q,h.container,'o1','regenerate');assert.equal(h.calls.length,1);assert.equal(h.reports.length,0);}finally{h.close();}
});
test('double clicks during pending missing report start only one generation',async()=>{
  const h=harness();let release;h.c.setDoc=()=>new Promise(resolve=>release=resolve);
  try {const first=h.c.repairAnswerAudioTrack(h.q,h.container,'o0','missing');await h.c.repairAnswerAudioTrack(h.q,h.container,'o0','missing');release();await first;assert.equal(h.calls.length,1);}finally{h.close();}
});
test('ready playable clip and text-stale clip are not mislabeled as missing server errors',async()=>{
  const h=harness();try{await h.c.repairAnswerAudioTrack(h.q,h.container,'o1','missing');h.q.options[1].audioNeedsRegeneration=true;await h.c.repairAnswerAudioTrack(h.q,h.container,'o1','missing');assert.equal(h.reports.length,0);}finally{h.close();}
});
test('Emmi disclosure exposes two native keyboard-operable choices and escape restores focus',()=>{
 const h=harness();try{const el=h.c.createAnswerAudioRepairControl(h.q,h.container,'o0',0);h.container.append(el);const toggle=el.querySelector('button');toggle.click();assert.equal(toggle.getAttribute('aria-expanded'),'true');assert.equal(el.querySelectorAll('.answerAudioRepairChoices button').length,2);assert.equal(el.querySelector('img').getAttribute('src'),'/assets/gradecrew/fox-improve.svg');el.dispatchEvent(new h.c.document.defaultView.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));assert.equal(toggle.getAttribute('aria-expanded'),'false');assert.equal(h.c.document.activeElement,toggle);}finally{h.close();}
});
test('empty requested audio cannot pass client readiness or secure student projection',()=>{
  const h=harness();try{h.q.options[0].audioDataUrl='data:audio/mpeg;base64,';assert.equal(h.c.answerAudioClipStatus({asset:h.q.options[0]}),'invalid');
  const start=source.indexOf('function questionAnswerAudioReady(');vm.runInContext(source.slice(start,source.indexOf('\nfunction clearQuestionAudio(',start)),h.c);h.c.questionHasAudioAnswerEntries=()=>true;assert.equal(h.c.questionAnswerAudioReady(h.q),false);
  const {buildPublicQuestion}=require('../../assessment-functions/lib/assessment-core');assert.throws(()=>buildPublicQuestion(h.q,'secret'),/incomplete/);
  const {answerAudioReady}=require('../../functions/lib/audio-answers');assert.equal(answerAudioReady(h.q),false);
  }finally{h.close();}
});
test('report network failure keeps regeneration available and retries the same incident without another TTS call',async()=>{
  const h=harness();let fail=true;const ids=[];h.c.setDoc=async(ref)=>{ids.push(ref[2]);if(fail)throw new Error('offline');};
  try{await h.c.repairAnswerAudioTrack(h.q,h.container,'o0','missing');await new Promise(resolve=>setImmediate(resolve));assert.equal(h.calls.length,1);const el=h.c.createAnswerAudioRepairControl(h.q,h.container,'o0',0);h.container.append(el);const retry=el.querySelector('.answerAudioReportRetry');assert.ok(retry);fail=false;retry.click();await new Promise(resolve=>setImmediate(resolve));assert.equal(h.calls.length,1);assert.equal(ids[0],ids[1]);assert.match(retry.textContent,/gemeldet/);}finally{h.close();}
});
test('account change during decoder check cannot send feedback or replace a clip',async()=>{
  const h=harness();h.c.verifyGeneratedAudio=async()=>{h.c.state.user={uid:'other'};throw new Error('decode');};h.c.window={AudioContext:class{}};
  try{await h.c.repairAnswerAudioTrack(h.q,h.container,'o1','missing');assert.equal(h.calls.length,0);assert.equal(h.reports.length,0);}finally{h.close();}
});

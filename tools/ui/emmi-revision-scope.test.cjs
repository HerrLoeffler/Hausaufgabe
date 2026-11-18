const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const app = fs.readFileSync(path.join(__dirname,'../../app.js'),'utf8');
function fn(name) { let start=app.indexOf(`function ${name}(`);assert.ok(start>=0,name);if(app.slice(start-6,start)==='async ')start-=6;return app.slice(start,app.indexOf('\n}',start)+2); }
const helpers=['inferQuestionRevisionScope','questionRevisionUnavailable','resolveQuestionRevisionScope','questionRevisionKey','mergeScopedQuestionRevision'];
function setup(t, extra={}) {
  const dom=new JSDOM('<section id="editorView"><div id="questionList"></div></section>',{url:'https://example.test',runScripts:'outside-only'}),w=dom.window;
  t.after(()=>dom.window.close());
  w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};w.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new w.Event('close'));};
  const q={id:'q1',position:1,type:'single',text:'Was ist die Hauptstadt von Frankreich?',points:2,options:[{text:'Paris',correct:true},{text:'Berlin',correct:false}],rubric:{private:'behalten'},imageDataUrl:'image-original',imageAlt:'Karte',audioScript:'Hörtext',audioDataUrl:'audio-original',markGroups:[{color:'blue',words:['Paris']}],acceptedOrders:[[1,0]]};
  const state={user:{uid:'teacher'},currentQuiz:{id:'quiz1'},questions:[q]}, calls=[],reports=[],toasts=[];
  Object.assign(w,{state,$:id=>w.document.getElementById(id),tourUid:()=>state.user.uid,questionReviewKey:q=>JSON.stringify([q.text,q.options]),questionActionDialogs:'dialog.questionActionDialog[open]',pendingQuestionActions:new Set(),
    console:{error(){}},CSS:{escape:x=>x},toast:message=>toasts.push(message),deepClone:v=>JSON.parse(JSON.stringify(v)),makeMiniButton:(label,cb)=>{const b=w.document.createElement('button');b.type='button';b.textContent=label;b.onclick=cb;return b;},
    ensureReportableErrorHost:()=>w.document.body,renderQuestions:()=>{},markDirty:()=>{},guestTourRepo:null,QUESTION_TYPES:[['single']],
    editorQuestionIndex:(_s,t)=>state.currentQuiz.id===t.quizId&&state.user.uid===t.uid&&!state.currentQuiz.published?state.questions.findIndex(q=>q.id===t.questionId&&w.questionReviewKey(q)===t.reviewKey):-1,
    questionForAi:q=>JSON.parse(JSON.stringify(q)),questionContext:()=>({}),getQuestionAudioSrc:q=>q.audioDataUrl||'',
    aiApi:{status:async()=>({supportedRevisionScopes:["question","answers"]}),regenerateQuestion:async payload=>{calls.push(payload);return {question:{...payload.question,options:[{text:'Lyon',correct:false},{text:'Paris',correct:true}]},meta:{revision:{scope:payload.revisionScope,source:payload.revisionSource}}};}},
    normalizeImportedQuestion:q=>({...q}),aiFriendlyError:e=>e.message,showReportableError:e=>reports.push(e),REPORTABLE_ERROR_CODES:{aiEdit:'edit'},resolveQualityIssues:()=>{},
    applyGeneratedMedia:()=>assert.fail('scoped media generation'),applyGeneratedAudio:()=>assert.fail('scoped audio generation'),...extra});
  w.eval([...helpers,'closeQuestionActionDialogs','createQuestionActionDialog','questionActionTextField','openQuestionRevisionDialog','regenerateQuestionWithAi'].map(fn).join('\n'));
  const trigger=w.document.createElement('button');w.document.body.append(trigger);
  return {w,state,q,calls,reports,toasts,open:()=>{w.openQuestionRevisionDialog(trigger,state.questions[0],0);return w.document.querySelector('dialog');}};
}
const tick=()=>new Promise(resolve=>setTimeout(resolve,0));
const submit=(w,d)=>d.querySelector('form').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
const input=(w,d,text)=>{const field=d.querySelector('textarea');field.value=text;field.dispatchEvent(new w.Event('input',{bubbles:true}));};

test('dialog offers exact scopes and infers preserve-question wish; selected conflicts stay visible without a call',async t=>{
  const h=setup(t),{w}=h,d=h.open(),select=d.querySelector('select');
  assert.deepEqual([...select.options].map(o=>o.textContent),['Ganze Aufgabe','Nur Frage','Nur Antworten']);
  input(w,d,'Frage lassen, neue Antworten');assert.equal(select.value,'answers');assert.match(d.querySelector('.questionRevisionHint').textContent,/Fragetext bleibt/);
  select.value='question';select.dispatchEvent(new w.Event('change'));submit(w,d);await tick();
  assert.equal(h.calls.length,0);assert.equal(d.open,true);assert.match(d.querySelector('.questionActionStatus').textContent,/widersprechen/);
  select.value='answers';select.dispatchEvent(new w.Event('change'));submit(w,d);await tick();
  assert.equal(h.calls.length,1);assert.equal(h.calls[0].revisionScope,'answers');assert.equal(h.state.questions[0].text,h.q.text);assert.equal(h.state.questions[0].options[1].correct,true);assert.equal(d.isConnected,false);
  for(const key of ['points','type','rubric','imageDataUrl','imageAlt','audioDataUrl','audioScript','acceptedOrders','markGroups'])assert.deepEqual(h.state.questions[0][key],h.q[key],key);
});
test('unavailable formats explain limits and never silently edit whole task',async t=>{
  const h=setup(t);h.q.type='text';const d=h.open();assert.equal(d.querySelector('option[value="answers"]').disabled,true);assert.match(d.querySelector('.questionRevisionAvailability').textContent,/Freitext/);
  input(h.w,d,'Frage lassen, neue Antworten');submit(h.w,d);await tick();assert.equal(h.calls.length,0);assert.match(d.querySelector('.questionActionStatus').textContent,/Freitext/);
});
test('question-only preserves options, keys, media and rubric; old backend receipt or protected changes keep source',async t=>{
  const h=setup(t);h.w.aiApi.regenerateQuestion=async payload=>({question:{...payload.question,text:'Welche Stadt ist Frankreichs Hauptstadt?'},meta:{revision:{scope:'question',source:payload.revisionSource}}});
  const result=await h.w.regenerateQuestionWithAi(h.q,0,{instruction:'Kürzer',revisionScope:'question',revisionScopeExplicit:true});
  assert.ok(result);for(const key of ['options','points','rubric','imageDataUrl','audioScript','acceptedOrders'])assert.deepEqual(result[key],h.q[key],key);
  for(const mode of ['old','changed','wrongid']) {
    const before=h.state.questions[0];h.w.aiApi.regenerateQuestion=async payload=>({question:{...payload.question,text:'Neue Frage',...(mode==='changed'?{points:99}:{})},meta:mode==='old'?{}:{revision:{scope:'question',source:{...payload.revisionSource,...(mode==='wrongid'?{questionId:'other'}:{})}}}});
    await h.w.regenerateQuestionWithAi(before,0,{instruction:'Kürzer',revisionScope:'question',revisionScopeExplicit:true});assert.equal(h.state.questions[0],before);
  }
  assert.equal(h.reports.length,3);
});
test('full source version protects points, audio, marking, rubric and answer-order changes plus account/quiz/id switches during await',async t=>{
  for(const mutate of [h=>h.q.points=9,h=>h.q.audioScript='Neu',h=>h.q.markGroups[0].color='green',h=>h.q.rubric.private='Neu',h=>h.q.acceptedOrders=[[0,1]],h=>h.state.user.uid='other',h=>h.state.currentQuiz.id='other',h=>h.q.id='other']) {
    const h=setup(t);let finish;h.w.aiApi.regenerateQuestion=payload=>new Promise(resolve=>{finish=()=>resolve({question:{...payload.question,text:'Neue Frage'},meta:{revision:{scope:'question',source:payload.revisionSource}}});});
    const pending=h.w.regenerateQuestionWithAi(h.q,0,{instruction:'Kürzer',revisionScope:'question',revisionScopeExplicit:true});await tick();mutate(h);finish();await pending;assert.equal(h.state.questions[0],h.q);assert.notEqual(h.q.text,'Neue Frage');
  }
});
test('close during request keeps one operation, later result applies by id and errors survive dialog closing',async t=>{
  const h=setup(t);let finish;h.w.aiApi.regenerateQuestion=payload=>new Promise(resolve=>{finish=()=>resolve({question:{...payload.question,options:[{text:'Lyon',correct:false},{text:'Paris',correct:true}]},meta:{revision:{scope:'answers',source:payload.revisionSource}}});});
  const d=h.open();input(h.w,d,'Frage lassen, neue Antworten');submit(h.w,d);submit(h.w,d);await tick();assert.equal(h.w.pendingQuestionActions.size,1);
  d.close();h.state.questions.unshift({id:'other',text:'Andere Aufgabe'});finish();await tick();assert.equal(h.state.questions[1].options[1].correct,true);assert.equal(h.w.pendingQuestionActions.size,0);
});
test('manual changes before submit invalidate dialog, including fields outside the old review key',async t=>{
  const h=setup(t),d=h.open();input(h.w,d,'Kürzer');h.q.points=7;submit(h.w,d);await tick();assert.equal(h.calls.length,0);assert.match(d.querySelector('.questionActionStatus').textContent,/inzwischen geändert/);
});

test('capability probe stops scoped generation on old backend before any paid request',async t=>{
  const h=setup(t);let probes=0;h.w.aiApi.status=async()=>{probes++;return {enabled:true};};
  const d=h.open();input(h.w,d,'Frage lassen, neue Antworten');submit(h.w,d);await tick();
  assert.equal(probes,1);assert.equal(h.calls.length,0);assert.equal(h.state.questions[0],h.q);assert.match(h.reports[0].message,/noch nicht freigeschaltet/);
});
